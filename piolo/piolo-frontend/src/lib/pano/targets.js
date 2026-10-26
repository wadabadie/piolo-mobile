// src/lib/pano/targets.js
// Grille de 38 cibles sphériques 3D (style Google Photo Sphere / Street View)
// Recouvrement optimal de 30-40% pour un champ de vision smartphone standard (~65° en portrait)

import { dirFromLonLat, worldToCamera } from './orientation';

export const TARGET_GRID = [
  // 1. Anneau Horizon (pitch 0°) — 12 angles espacés de 30°
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `h_${i * 30}`,
    yaw: i * 30,
    pitch: 0,
    ring: 'horizon',
    label: `Horizon ${i * 30}°`,
  })),

  // 2. Anneau Supérieur (pitch +42°) — 10 angles espacés de 36°, décalés de 18°
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `u_${i * 36 + 18}`,
    yaw: i * 36 + 18,
    pitch: 42,
    ring: 'upper',
    label: `Haut ${i * 36 + 18}°`,
  })),

  // 3. Anneau Inférieur (pitch -42°) — 10 angles espacés de 36°
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `d_${i * 36}`,
    yaw: i * 36,
    pitch: -42,
    ring: 'lower',
    label: `Bas ${i * 36}°`,
  })),

  // 4. Zénith (Plafond, pitch +80°) — 3 angles espacés de 120°
  ...Array.from({ length: 3 }, (_, i) => ({
    id: `zenith_${i * 120}`,
    yaw: i * 120,
    pitch: 80,
    ring: 'zenith',
    label: `Plafond ${i * 120}°`,
  })),

  // 5. Nadir (Sol, pitch -80°) — 3 angles espacés de 120°, décalés de 60°
  ...Array.from({ length: 3 }, (_, i) => ({
    id: `nadir_${i * 120 + 60}`,
    yaw: i * 120 + 60,
    pitch: -80,
    ring: 'nadir',
    label: `Sol ${i * 120 + 60}°`,
  })),
].map(t => ({
  ...t,
  dir: dirFromLonLat(t.yaw, t.pitch), // vecteur unitaire [x, y, z] monde
}));

export const TOTAL_TARGETS = TARGET_GRID.length; // 38 cibles

/**
 * Projette les cibles 3D sur l'écran du smartphone en fonction de la matrice R (caméra -> monde).
 * Retourne la position à l'écran (x, y en pixels) et si la cible est visible devant l'objectif.
 */
export function projectTargetToScreen(target, R, screenWidth, screenHeight, focalPixels) {
  // Coordonnées dans le repère caméra : c = R^T * dir
  const [cx, cy, cz] = worldToCamera(R, target.dir);

  // La cible est derrière la caméra si cz <= 0.1
  if (cz <= 0.1) {
    return { visible: false, screenX: 0, screenY: 0, cz, angleDeg: 180 };
  }

  // Projection sténopé (pinhole) : x = f * cx / cz + cx0
  const cx0 = screenWidth / 2;
  const cy0 = screenHeight / 2;
  const screenX = (focalPixels * cx) / cz + cx0;
  const screenY = (focalPixels * cy) / cz + cy0;

  // Angle décalage avec le centre optique (degrés)
  const angleDeg = (Math.atan2(Math.hypot(cx, cy), cz) * 180) / Math.PI;

  const inScreen =
    screenX >= -40 && screenX <= screenWidth + 40 &&
    screenY >= -40 && screenY <= screenHeight + 40;

  return {
    visible: inScreen,
    screenX,
    screenY,
    cz,
    angleDeg,
  };
}

/**
 * Trouve la cible non encore capturée la plus proche de l'orientation actuelle.
 */
export function findBestTarget(R, capturedMap) {
  // Direction actuelle de visée (axe Z caméra dans le monde)
  // cz_cam = [0, 0, 1] -> R * [0, 0, 1] = colonne 2 de R
  const fwd = [R[2], R[5], R[8]];

  let bestTarget = null;
  let minAngle = Infinity;

  for (const t of TARGET_GRID) {
    if (capturedMap[t.id]) continue; // Déjà photographié

    // Produit scalaire entre axe de visée et direction cible
    const dot = fwd[0] * t.dir[0] + fwd[1] * t.dir[1] + fwd[2] * t.dir[2];
    const clampedDot = Math.max(-1, Math.min(1, dot));
    const angle = (Math.acos(clampedDot) * 180) / Math.PI;

    if (angle < minAngle) {
      minAngle = angle;
      bestTarget = t;
    }
  }

  return { target: bestTarget, angleDeg: minAngle };
}
