// src/lib/pano/orientation.js
// Fusion des capteurs d'orientation -> matrice de rotation caméra -> monde.
//
// Conventions (identiques au serveur apps/properties/pano/stitcher.py) :
//   Repère terrestre W3C : x = Est, y = Nord, z = Haut.
//   Repère appareil W3C  : x = droite de l'écran, y = haut de l'écran, z = vers l'utilisateur.
//   Repère caméra OpenCV : x = droite de l'image, y = bas de l'image, z = devant (caméra arrière).
//   Repère monde panorama: z = direction horizontale de la 1re prise, y = bas, x = droite.

const DEG = Math.PI / 180;

// ── Quaternions [w, x, y, z] ────────────────────────────────────────────────
export function quatMul(a, b) {
  return [
    a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
    a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
    a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
    a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0],
  ];
}

/** Quaternion appareil -> Terre à partir des angles W3C (ordre intrinsèque Z-X'-Y''). */
export function quatFromEuler(alpha, beta, gamma) {
  const a = (alpha || 0) * DEG / 2;
  const b = (beta || 0) * DEG / 2;
  const g = (gamma || 0) * DEG / 2;
  const qz = [Math.cos(a), 0, 0, Math.sin(a)];
  const qx = [Math.cos(b), Math.sin(b), 0, 0];
  const qy = [Math.cos(g), 0, Math.sin(g), 0];
  return quatMul(quatMul(qz, qx), qy);
}

export function quatNormalize(q) {
  const n = Math.hypot(q[0], q[1], q[2], q[3]) || 1;
  return [q[0] / n, q[1] / n, q[2] / n, q[3] / n];
}

export function quatSlerp(a, b, t) {
  let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  let bb = b;
  if (d < 0) { d = -d; bb = [-b[0], -b[1], -b[2], -b[3]]; }
  if (d > 0.9995) {
    return quatNormalize([
      a[0] + t * (bb[0] - a[0]), a[1] + t * (bb[1] - a[1]),
      a[2] + t * (bb[2] - a[2]), a[3] + t * (bb[3] - a[3]),
    ]);
  }
  const th = Math.acos(d);
  const s = Math.sin(th);
  const wa = Math.sin((1 - t) * th) / s;
  const wb = Math.sin(t * th) / s;
  return [wa * a[0] + wb * bb[0], wa * a[1] + wb * bb[1], wa * a[2] + wb * bb[2], wa * a[3] + wb * bb[3]];
}

/** Angle (degrés) entre deux quaternions unitaires. */
export function quatAngleDeg(a, b) {
  const d = Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]);
  return 2 * Math.acos(Math.min(1, d)) / DEG;
}

export function quatRotate(q, v) {
  const [w, x, y, z] = q;
  const ix = w * v[0] + y * v[2] - z * v[1];
  const iy = w * v[1] + z * v[0] - x * v[2];
  const iz = w * v[2] + x * v[1] - y * v[0];
  const iw = -x * v[0] - y * v[1] - z * v[2];
  return [
    ix * w + iw * -x + iy * -z - iz * -y,
    iy * w + iw * -y + iz * -x - ix * -z,
    iz * w + iw * -z + ix * -y - iy * -x,
  ];
}

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Axes de la caméra arrière exprimés dans le repère terrestre. */
export function cameraAxesEarth(q, screenAngleDeg = 0) {
  const t = (screenAngleDeg || 0) * DEG;
  const right = quatRotate(q, [Math.cos(t), -Math.sin(t), 0]);
  const up = quatRotate(q, [Math.sin(t), Math.cos(t), 0]);
  const fwd = quatRotate(q, [0, 0, -1]);
  return { right, up, fwd };
}

/** Azimut (radians, horaire depuis le Nord) de la projection horizontale de l'axe de visée. */
export function headingOf(q, screenAngleDeg = 0) {
  const { fwd, up } = cameraAxesEarth(q, screenAngleDeg);
  // Proche de la verticale, on se sert de l'axe « haut » de l'écran.
  const v = Math.hypot(fwd[0], fwd[1]) > 0.2 ? fwd : (fwd[2] < 0 ? up : [-up[0], -up[1], -up[2]]);
  return Math.atan2(v[0], v[1]);
}

/**
 * Matrice 3x3 (ligne-majeure, 9 nombres) caméra (OpenCV) -> monde panorama.
 * yaw0 : azimut de référence (radians) de la longitude 0.
 */
export function cameraToWorldMatrix(q, yaw0, screenAngleDeg = 0) {
  const { right, up, fwd } = cameraAxesEarth(q, screenAngleDeg);
  const cx = right;
  const cy = [-up[0], -up[1], -up[2]];
  const cz = fwd;
  const wz = [Math.sin(yaw0), Math.cos(yaw0), 0];
  const wy = [0, 0, -1];
  const wx = [Math.cos(yaw0), -Math.sin(yaw0), 0];
  const W = [wx, wy, wz];
  const C = [cx, cy, cz];
  const R = new Array(9);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) R[i * 3 + j] = dot(W[i], C[j]);
  return R;
}

/** Direction monde (vecteur unitaire) d'une longitude/latitude en degrés. */
export function dirFromLonLat(lonDeg, latDeg) {
  const lon = lonDeg * DEG;
  const lat = latDeg * DEG;
  return [Math.cos(lat) * Math.sin(lon), -Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
}

/** Coordonnées caméra d'une direction monde : c = Rᵀ d. */
export function worldToCamera(R, d) {
  return [
    R[0] * d[0] + R[3] * d[1] + R[6] * d[2],
    R[1] * d[0] + R[4] * d[1] + R[7] * d[2],
    R[2] * d[0] + R[5] * d[1] + R[8] * d[2],
  ];
}

/** Longitude / latitude (degrés) de l'axe de visée. */
export function viewLonLat(R) {
  const fx = R[2], fy = R[5], fz = R[8];
  return { lon: Math.atan2(fx, fz) / DEG, lat: Math.asin(Math.max(-1, Math.min(1, -fy))) / DEG };
}

export function getScreenAngle() {
  if (typeof window === 'undefined') return 0;
  const a = window.screen?.orientation?.angle;
  if (typeof a === 'number') return a;
  if (typeof window.orientation === 'number') return (window.orientation + 360) % 360;
  return 0;
}

/**
 * Suivi temps réel de l'orientation via deviceorientation
 * (déjà fusionné gyroscope + accéléromètre sur iOS Safari et Chrome Android).
 */
export class OrientationTracker {
  constructor() {
    this.q = null;           // quaternion lissé
    this.raw = null;         // dernier quaternion brut
    this.angularSpeed = 999; // °/s
    this.lastTs = 0;
    this.events = 0;
    this._onOrient = this._onOrient.bind(this);
    this._onMotion = this._onMotion.bind(this);
    this._motionSpeed = null;
  }

  /** Doit être appelé depuis un geste utilisateur (exigence iOS). */
  static async requestPermission() {
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const r = await DeviceOrientationEvent.requestPermission();
        if (r !== 'granted') return false;
      }
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        try { await DeviceMotionEvent.requestPermission(); } catch (_) { /* facultatif */ }
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  start() {
    window.addEventListener('deviceorientation', this._onOrient, true);
    window.addEventListener('devicemotion', this._onMotion, true);
  }

  stop() {
    window.removeEventListener('deviceorientation', this._onOrient, true);
    window.removeEventListener('devicemotion', this._onMotion, true);
  }

  _onOrient(e) {
    if (e.alpha == null || e.beta == null || e.gamma == null) return;
    this._push(quatFromEuler(e.alpha, e.beta, e.gamma));
  }

  _onMotion(e) {
    const r = e.rotationRate;
    if (r && r.alpha != null) {
      this._motionSpeed = Math.hypot(r.alpha || 0, r.beta || 0, r.gamma || 0);
    }
  }

  _push(q) {
    const now = performance.now();
    q = quatNormalize(q);
    if (this.raw) {
      const dt = Math.max(1, now - this.lastTs) / 1000;
      const inst = quatAngleDeg(this.raw, q) / dt;
      const est = this.angularSpeed > 900 ? inst : this.angularSpeed * 0.7 + inst * 0.3;
      // Le gyroscope (devicemotion) est la mesure la plus directe quand il existe
      this.angularSpeed = this._motionSpeed != null ? this._motionSpeed : est;
    }
    this.raw = q;
    this.lastTs = now;
    this.q = this.q ? quatSlerp(this.q, q, 0.45) : q;
    this.events++;
  }
}
