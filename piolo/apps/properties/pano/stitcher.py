"""
Assembleur de photosphères équirectangulaires (360° x 180°).

Pipeline (inspiré de Google Photo Sphere / OpenCV stitching_detailed) :
  1. Rotations initiales fournies par les capteurs du téléphone (une matrice
     caméra -> monde par photo, convention OpenCV : x droite, y bas, z avant).
  2. Détection de points clés (SIFT, repli ORB) et appariement limité aux
     photos voisines (d'après les capteurs).
  3. Bundle adjustment (BundleAdjusterRay) pour corriger rotations et focale.
  4. Ré-alignement global sur les capteurs (horizon de niveau) + rejet des
     caméras aberrantes (retour à la rotation capteur).
  5. Projection inverse exacte vers la sphère (cv2.remap), avec bouclage
     horizontal par marge (padding) pour une couture 0°/360° invisible.
  6. Compensation de gain (Brown & Lowe), coutures de Voronoï pondérées et
     fusion multi-bandes (pyramides de Laplace).
  7. Comblement des pôles manquants et export JPEG + métadonnées XMP GPano.

Convention monde (identique au frontend) :
  - axe z : direction horizontale de la première prise (longitude 0)
  - axe y : vers le bas (gravité)
  - pixel équirectangulaire (u, v) :
        lon = (u + 0.5) / W * 2π - π
        phi = (v + 0.5) / H * π            (0 = zénith)
        dir = (sin(phi) sin(lon), -cos(phi), sin(phi) cos(lon))
"""
from __future__ import annotations

import logging
import math
from dataclasses import dataclass, field
from typing import Callable, List, Optional, Sequence

import cv2
import numpy as np

logger = logging.getLogger(__name__)

ProgressCb = Optional[Callable[[int, str], None]]


@dataclass
class Frame:
    image: np.ndarray            # BGR uint8, pleine résolution
    R: np.ndarray                # 3x3 caméra -> monde (capteurs)
    focal: float                 # focale estimée en pixels (pleine résolution)


@dataclass
class _Piece:
    idx: int                     # index de la photo source
    r0: int                      # coin haut-gauche dans le canevas
    c0: int
    img: np.ndarray              # BGR uint8 projeté
    mask: np.ndarray             # bool, pixels valides
    weight: np.ndarray           # float32, poids de centre (pour les coutures)
    seam: Optional[np.ndarray] = field(default=None)


# ─────────────────────────────────────────────────────────────────────────────
# Outils géométriques
# ─────────────────────────────────────────────────────────────────────────────

def _orthonormalize(R: np.ndarray) -> np.ndarray:
    U, _, Vt = np.linalg.svd(np.asarray(R, dtype=np.float64))
    Rn = U @ Vt
    if np.linalg.det(Rn) < 0:
        U[:, -1] *= -1
        Rn = U @ Vt
    return Rn


def _rot_angle_deg(Ra: np.ndarray, Rb: np.ndarray) -> float:
    c = (np.trace(Ra.T @ Rb) - 1.0) / 2.0
    return math.degrees(math.acos(max(-1.0, min(1.0, c))))


def _best_global_rotation(sensor: Sequence[np.ndarray], estimated: Sequence[np.ndarray],
                          weights: Optional[Sequence[float]] = None) -> np.ndarray:
    """G minimisant Σ w ||G·R_est - R_sensor||² (problème de Procuste)."""
    M = np.zeros((3, 3))
    for i, (Rs, Re) in enumerate(zip(sensor, estimated)):
        w = 1.0 if weights is None else weights[i]
        M += w * (Rs @ Re.T)
    return _orthonormalize(M)


def _forward(R: np.ndarray) -> np.ndarray:
    return R[:, 2]


# ─────────────────────────────────────────────────────────────────────────────
# Étape 1-4 : raffinement des caméras
# ─────────────────────────────────────────────────────────────────────────────

def refine_cameras(frames: List[Frame], work_megapix: float = 0.6,
                   progress: ProgressCb = None):
    """Retourne (rotations, focales) raffinées en pleine résolution."""
    n = len(frames)
    sensor_R = [_orthonormalize(f.R) for f in frames]
    sensor_f = [float(f.focal) for f in frames]

    h0, w0 = frames[0].image.shape[:2]
    scale = min(1.0, math.sqrt(work_megapix * 1e6 / float(w0 * h0)))

    try:
        finder = cv2.SIFT_create(nfeatures=2000)
        match_conf = 0.65
    except Exception:  # pragma: no cover - SIFT absent
        finder = cv2.ORB_create(nfeatures=2500)
        match_conf = 0.3

    features = []
    for i, fr in enumerate(frames):
        small = cv2.resize(fr.image, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
        feat = cv2.detail.computeImageFeatures2(finder, small)
        feat.img_idx = i
        features.append(feat)
        if progress:
            progress(5 + int(20 * (i + 1) / n), 'Analyse des photos')

    # Appariement uniquement entre voisines (d'après les capteurs)
    mask = np.zeros((n, n), np.uint8)
    for i in range(n):
        for j in range(i + 1, n):
            cosang = float(np.dot(_forward(sensor_R[i]), _forward(sensor_R[j])))
            if cosang > math.cos(math.radians(75)):
                mask[i, j] = mask[j, i] = 1

    matcher = cv2.detail_BestOf2NearestMatcher(False, match_conf)
    try:
        pairwise = matcher.apply2(features, mask)
    except Exception:
        pairwise = matcher.apply2(features, cv2.UMat(mask))
    matcher.collectGarbage()
    if progress:
        progress(35, 'Mise en correspondance')

    # Nombre de liaisons fiables par photo
    links = np.zeros(n, int)
    for m in pairwise:
        if m.src_img_idx >= 0 and m.dst_img_idx >= 0 and m.src_img_idx != m.dst_img_idx \
                and m.confidence > 0.6:
            links[m.src_img_idx] += 1

    cameras = []
    for i, fr in enumerate(frames):
        h, w = fr.image.shape[:2]
        cam = cv2.detail.CameraParams()
        cam.focal = sensor_f[i] * scale
        cam.aspect = 1.0
        cam.ppx = w * scale / 2.0
        cam.ppy = h * scale / 2.0
        cam.R = sensor_R[i].astype(np.float32)
        cam.t = np.zeros((3, 1), np.float64)
        cameras.append(cam)

    refined_R = list(sensor_R)
    refined_f = list(sensor_f)

    if int((links > 0).sum()) >= 3:
        try:
            adjuster = cv2.detail_BundleAdjusterRay()
            adjuster.setConfThresh(0.6)
            refine_mask = np.zeros((3, 3), np.uint8)
            refine_mask[0, 0] = 1  # focale
            adjuster.setRefinementMask(refine_mask)
            ok, cameras_ba = adjuster.apply(features, pairwise, cameras)
            if ok:
                est_R = [_orthonormalize(np.asarray(c.R, np.float64)) for c in cameras_ba]
                est_f = [float(c.focal) / scale for c in cameras_ba]

                connected = [links[i] > 0 for i in range(n)]
                weights = [1.0 if c else 0.0 for c in connected]
                G = _best_global_rotation(sensor_R, est_R, weights)
                # 2e passe robuste : on ignore les caméras très éloignées
                dev = [_rot_angle_deg(G @ est_R[i], sensor_R[i]) for i in range(n)]
                weights = [1.0 if (connected[i] and dev[i] < 8.0) else 0.0 for i in range(n)]
                if sum(weights) >= 3:
                    G = _best_global_rotation(sensor_R, est_R, weights)

                good_f = [est_f[i] for i in range(n) if connected[i]]
                med_f = float(np.median(good_f)) if good_f else float(np.median(sensor_f))
                # Garde-fou : focale plausible (±25 % de l'estimation capteur)
                ref_f = float(np.median(sensor_f))
                if not (0.75 * ref_f <= med_f <= 1.25 * ref_f):
                    med_f = ref_f

                for i in range(n):
                    Ri = G @ est_R[i]
                    if connected[i] and _rot_angle_deg(Ri, sensor_R[i]) < 12.0:
                        refined_R[i] = Ri
                        fi = est_f[i]
                        refined_f[i] = fi if 0.85 * med_f <= fi <= 1.15 * med_f else med_f
                    else:
                        refined_R[i] = sensor_R[i]
                        refined_f[i] = med_f
                logger.info('Bundle adjustment OK : %d/%d photos reliées, focale %.1f px',
                            int(sum(connected)), n, med_f)
        except Exception as exc:  # pragma: no cover - dépend des images
            logger.warning('Bundle adjustment échoué, rotations capteurs conservées : %s', exc)

    if progress:
        progress(45, 'Ajustement des caméras')
    return refined_R, refined_f


# ─────────────────────────────────────────────────────────────────────────────
# Étape 5 : projection sphérique
# ─────────────────────────────────────────────────────────────────────────────

def _project_frame(idx: int, img: np.ndarray, R: np.ndarray, focal: float,
                   W: int, H: int, pad: int) -> List[_Piece]:
    h, w = img.shape[:2]
    Wc = W + 2 * pad
    fwd = _forward(R)
    lat = math.asin(max(-1.0, min(1.0, -fwd[1])))
    lon_c = math.atan2(fwd[0], fwd[2])
    radius = math.atan(math.hypot(w / 2.0, h / 2.0) / focal) + math.radians(2)

    phi_c = math.pi / 2 - lat
    phi0 = max(0.0, phi_c - radius)
    phi1 = min(math.pi, phi_c + radius)
    r0 = max(0, int(math.floor(phi0 / math.pi * H)))
    r1 = min(H, int(math.ceil(phi1 / math.pi * H)))
    if r1 <= r0:
        return []

    cols = np.arange(Wc)
    lons = (cols - pad + 0.5) / W * 2 * math.pi - math.pi
    if abs(lat) + radius >= math.pi / 2 - 1e-3:
        sel = np.ones(Wc, bool)
    else:
        half = math.asin(min(1.0, math.sin(radius) / math.cos(lat)))
        diff = (lons - lon_c + math.pi) % (2 * math.pi) - math.pi
        sel = np.abs(diff) <= half

    # Segments contigus de colonnes
    pieces: List[_Piece] = []
    edges = np.flatnonzero(np.diff(np.concatenate(([0], sel.astype(np.int8), [0]))))
    for s, e in zip(edges[::2], edges[1::2]):
        cc = np.arange(s, e)
        rr = np.arange(r0, r1)
        lam = ((cc - pad + 0.5) / W * 2 * math.pi - math.pi).astype(np.float32)
        phi = ((rr + 0.5) / H * math.pi).astype(np.float32)
        sp, cp = np.sin(phi)[:, None], np.cos(phi)[:, None]
        sl, cl = np.sin(lam)[None, :], np.cos(lam)[None, :]
        dx = sp * sl
        dy = np.broadcast_to(-cp, dx.shape)
        dz = sp * cl
        Rf = R.astype(np.float32)
        camx = dx * Rf[0, 0] + dy * Rf[1, 0] + dz * Rf[2, 0]
        camy = dx * Rf[0, 1] + dy * Rf[1, 1] + dz * Rf[2, 1]
        camz = dx * Rf[0, 2] + dy * Rf[1, 2] + dz * Rf[2, 2]
        front = camz > 1e-3
        safe_z = np.where(front, camz, 1.0)
        mx = (focal * camx / safe_z + w / 2.0 - 0.5).astype(np.float32)
        my = (focal * camy / safe_z + h / 2.0 - 0.5).astype(np.float32)
        valid = front & (mx >= 0) & (mx <= w - 1) & (my >= 0) & (my <= h - 1)
        if not valid.any():
            continue
        mx[~valid] = -10
        my[~valid] = -10

        ys, xs = np.nonzero(valid)
        y0, y1 = ys.min(), ys.max() + 1
        x0, x1 = xs.min(), xs.max() + 1
        mx_c, my_c, valid_c = mx[y0:y1, x0:x1], my[y0:y1, x0:x1], valid[y0:y1, x0:x1]
        warped = cv2.remap(img, mx_c, my_c, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)

        # Poids : décroissance vers les bords de la photo (pour les coutures)
        ex = np.minimum(mx_c, (w - 1) - mx_c) / (w / 2.0)
        ey = np.minimum(my_c, (h - 1) - my_c) / (h / 2.0)
        weight = np.clip(ex, 0, 1) * np.clip(ey, 0, 1)
        weight = np.where(valid_c, weight + 1e-4, 0).astype(np.float32)

        pieces.append(_Piece(idx=idx, r0=r0 + int(y0), c0=int(s + x0), img=warped,
                             mask=valid_c, weight=weight))
    return pieces


# ─────────────────────────────────────────────────────────────────────────────
# Étape 6 : gain, coutures, fusion multi-bandes
# ─────────────────────────────────────────────────────────────────────────────

def _compensate_gains(pieces: List[_Piece], n: int) -> np.ndarray:
    alpha, beta = 0.01, 100.0
    N = np.zeros((n, n))
    I = np.zeros((n, n))
    grays = [cv2.cvtColor(p.img, cv2.COLOR_BGR2GRAY).astype(np.float32) for p in pieces]
    for a, pa in enumerate(pieces):
        N[pa.idx, pa.idx] += float(pa.mask.sum())
        ha, wa = pa.mask.shape
        for b in range(a + 1, len(pieces)):
            pb = pieces[b]
            if pb.idx == pa.idx:
                continue
            hb, wb = pb.mask.shape
            y0, y1 = max(pa.r0, pb.r0), min(pa.r0 + ha, pb.r0 + hb)
            x0, x1 = max(pa.c0, pb.c0), min(pa.c0 + wa, pb.c0 + wb)
            if y1 <= y0 or x1 <= x0:
                continue
            sa = (slice(y0 - pa.r0, y1 - pa.r0), slice(x0 - pa.c0, x1 - pa.c0))
            sb = (slice(y0 - pb.r0, y1 - pb.r0), slice(x0 - pb.c0, x1 - pb.c0))
            both = pa.mask[sa] & pb.mask[sb]
            cnt = float(both.sum())
            if cnt < 50:
                continue
            ia = float(grays[a][sa][both].mean())
            ib = float(grays[b][sb][both].mean())
            i, j = pa.idx, pb.idx
            # Moyennes pondérées si plusieurs morceaux d'une même paire
            I[i, j] = (I[i, j] * N[i, j] + ia * cnt) / (N[i, j] + cnt)
            I[j, i] = (I[j, i] * N[j, i] + ib * cnt) / (N[j, i] + cnt)
            N[i, j] += cnt
            N[j, i] += cnt

    A = np.zeros((n, n))
    bvec = np.zeros(n)
    for i in range(n):
        for j in range(n):
            bvec[i] += beta * N[i, j]
            A[i, i] += beta * N[i, j]
            if j == i:
                continue
            A[i, i] += 2 * alpha * I[i, j] * I[i, j] * N[i, j]
            A[i, j] -= 2 * alpha * I[i, j] * I[j, i] * N[i, j]
    try:
        gains = np.linalg.solve(A + np.eye(n) * 1e-6, bvec)
    except np.linalg.LinAlgError:
        gains = np.ones(n)
    return np.clip(gains, 0.6, 1.6)


def _fill_invalid(img: np.ndarray, mask: np.ndarray) -> np.ndarray:
    """Prolonge les couleurs valides dans les zones vides (convolution normalisée)."""
    out = img.astype(np.float32)
    m = mask.astype(np.float32)
    if m.all():
        return out
    filled = out * m[..., None]
    known = m.copy()
    for sigma in (8, 24, 64, 160):
        num = cv2.GaussianBlur(out * m[..., None], (0, 0), sigma)
        den = cv2.GaussianBlur(m, (0, 0), sigma)
        hole = (known < 0.5) & (den > 1e-3)
        if hole.any():
            filled[hole] = num[hole] / den[hole][:, None]
            known[hole] = 1.0
        if known.min() >= 0.5:
            break
    rest = known < 0.5
    if rest.any():
        mean = out[mask].mean(axis=0) if mask.any() else np.array([128, 128, 128], np.float32)
        filled[rest] = mean
    return filled


def _multiband_blend(pieces: List[_Piece], H: int, Wc: int, levels: int = 5) -> tuple:
    blender = cv2.detail_MultiBandBlender()
    blender.setNumBands(levels)
    blender.prepare((0, 0, Wc, H))

    coverage = np.zeros((H, Wc), bool)
    for p in pieces:
        if p.seam is None or not p.seam.any():
            continue
        ph, pw = p.mask.shape
        img_s16 = p.img.astype(np.int16)
        mask_u8 = (p.seam.astype(np.uint8)) * 255
        blender.feed(img_s16, mask_u8, (int(p.c0), int(p.r0)))
        coverage[p.r0:p.r0 + ph, p.c0:p.c0 + pw] |= p.seam

    dst, _ = blender.blend(None, None)
    result = np.clip(dst, 0, 255).astype(np.float32)
    return result, coverage


def _fill_poles(pano: np.ndarray, coverage: np.ndarray) -> np.ndarray:
    if coverage.all():
        return pano
    hole = (~coverage).astype(np.uint8) * 255
    if not hole.any():
        return pano
    # Inpaint sur image sous-échantillonnée si grand trou, sinon direct
    h, w = pano.shape[:2]
    scale = 0.25 if max(h, w) > 2000 else 1.0
    if scale < 1.0:
        small_pano = cv2.resize(pano, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
        small_hole = cv2.resize(hole, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_NEAREST)
        inpainted_small = cv2.inpaint(small_pano, small_hole, 3, cv2.INPAINT_TELEA)
        inpainted = cv2.resize(inpainted_small, (w, h), interpolation=cv2.INTER_LINEAR)
        hole_mask = (hole > 0)[..., None]
        return np.where(hole_mask, inpainted, pano)
    return cv2.inpaint(pano, hole, 3, cv2.INPAINT_TELEA)


# ─────────────────────────────────────────────────────────────────────────────
# Export
# ─────────────────────────────────────────────────────────────────────────────

def _inject_gpano_xmp(jpeg: bytes, width: int, height: int) -> bytes:
    xmp = (
        '<?xpacket begin="\ufeff" id="W5M0MpCehiHzreSzNTczkc9d"?>'
        '<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">'
        '<rdf:Description rdf:about="" xmlns:GPano="http://ns.google.com/photos/1.0/panorama/">'
        '<GPano:ProjectionType>equirectangular</GPano:ProjectionType>'
        '<GPano:UsePanoramaViewer>True</GPano:UsePanoramaViewer>'
        '<GPano:CroppedAreaImageWidthPixels>{w}</GPano:CroppedAreaImageWidthPixels>'
        '<GPano:CroppedAreaImageHeightPixels>{h}</GPano:CroppedAreaImageHeightPixels>'
        '<GPano:FullPanoWidthPixels>{w}</GPano:FullPanoWidthPixels>'
        '<GPano:FullPanoHeightPixels>{h}</GPano:FullPanoHeightPixels>'
        '<GPano:CroppedAreaLeftPixels>0</GPano:CroppedAreaLeftPixels>'
        '<GPano:CroppedAreaTopPixels>0</GPano:CroppedAreaTopPixels>'
        '<GPano:CaptureSoftware>Piolo 360</GPano:CaptureSoftware>'
        '</rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="w"?>'
    ).format(w=width, h=height).encode('utf-8')
    payload = b'http://ns.adobe.com/xap/1.0/\x00' + xmp
    segment = b'\xff\xe1' + (len(payload) + 2).to_bytes(2, 'big') + payload
    if jpeg[:2] != b'\xff\xd8':
        return jpeg
    return jpeg[:2] + segment + jpeg[2:]


# ─────────────────────────────────────────────────────────────────────────────
# Point d'entrée
# ─────────────────────────────────────────────────────────────────────────────

def stitch_equirectangular(frames: List[Frame], out_width: int = 4096,
                           refine: bool = True, progress: ProgressCb = None,
                           jpeg_quality: int = 90) -> bytes:
    if len(frames) < 4:
        raise ValueError('Au moins 4 photos sont nécessaires.')
    cv2.setNumThreads(2)

    W = int(out_width) // 32 * 32
    H = W // 2
    pad = 128
    Wc = W + 2 * pad
    levels = 5
    n = len(frames)

    if refine:
        Rs, fs = refine_cameras(frames, progress=progress)
    else:
        Rs = [_orthonormalize(f.R) for f in frames]
        fs = [float(f.focal) for f in frames]

    pieces: List[_Piece] = []
    for i, fr in enumerate(frames):
        pieces.extend(_project_frame(i, fr.image, Rs[i], fs[i], W, H, pad))
        if progress:
            progress(45 + int(20 * (i + 1) / n), 'Projection sphérique')

    gains = _compensate_gains(pieces, n)
    for p in pieces:
        g = gains[p.idx]
        if abs(g - 1.0) > 1e-3:
            p.img = np.clip(p.img.astype(np.float32) * g, 0, 255).astype(np.uint8)
    if progress:
        progress(70, 'Égalisation de l\'exposition')

    # Coutures : chaque pixel appartient à la photo la plus « centrale »
    best_w = np.zeros((H, Wc), np.float32)
    best_id = np.full((H, Wc), -1, np.int32)
    for k, p in enumerate(pieces):
        ph, pw = p.mask.shape
        sl = (slice(p.r0, p.r0 + ph), slice(p.c0, p.c0 + pw))
        better = p.weight > best_w[sl]
        best_w[sl] = np.where(better, p.weight, best_w[sl])
        best_id[sl] = np.where(better, k, best_id[sl])
    for k, p in enumerate(pieces):
        ph, pw = p.mask.shape
        p.seam = (best_id[p.r0:p.r0 + ph, p.c0:p.c0 + pw] == k) & p.mask
    del best_w, best_id
    if progress:
        progress(78, 'Calcul des coutures')

    pano, coverage = _multiband_blend(pieces, H, Wc, levels)
    if progress:
        progress(92, 'Fusion multi-bandes')

    pano = pano[:, pad:pad + W]
    coverage = coverage[:, pad:pad + W]
    pano = _fill_poles(pano, coverage)
    pano = np.clip(pano, 0, 255).astype(np.uint8)

    ok, buf = cv2.imencode('.jpg', pano, [cv2.IMWRITE_JPEG_QUALITY, jpeg_quality,
                                          cv2.IMWRITE_JPEG_PROGRESSIVE, 1])
    if not ok:
        raise RuntimeError('Encodage JPEG impossible.')
    if progress:
        progress(98, 'Finalisation')
    return _inject_gpano_xmp(buf.tobytes(), W, H)
