// src/lib/pano/clientPreview.js
// Moteur d'assemblage rapide côté client (projection inverse exacte 2:1)
// Permet une prévisualisation instantanée sur le smartphone sans attendre le serveur.

import { worldToCamera } from './orientation';

/**
 * Assemble un panorama équirectangulaire 2:1 à partir d'une liste de frames capturées.
 * @param {Array<{ canvas: HTMLCanvasElement, R: number[], focal: number, yaw: number, pitch: number }>} frames
 * @param {number} outWidth Largeur du panorama (ex: 2048 pour aperçu rapide, hauteur = outWidth / 2)
 * @returns {Promise<Blob>} Image JPEG équirectangulaire
 */
export async function stitchClientPreview(frames, outWidth = 2048) {
  if (!frames || frames.length === 0) {
    throw new Error('Aucune photo disponible pour l’assemblage.');
  }

  const W = Math.round(outWidth / 32) * 32;
  const H = W / 2;

  // Création du canvas de sortie
  const outCanvas = document.createElement('canvas');
  outCanvas.width = W;
  outCanvas.height = H;
  const outCtx = outCanvas.getContext('2d');

  // Remplissage avec fond neutre élégant
  outCtx.fillStyle = '#181511';
  outCtx.fillRect(0, 0, W, H);

  // Buffers accumulateurs pour le mélange pondéré
  // accumR, accumG, accumB, accumW
  const numPixels = W * H;
  const accR = new Float32Array(numPixels);
  const accG = new Float32Array(numPixels);
  const accB = new Float32Array(numPixels);
  const accW = new Float32Array(numPixels);

  // Pré-extraire les données ImageData de chaque frame source
  const srcDataList = frames.map((f) => {
    const sw = f.canvas.width;
    const sh = f.canvas.height;
    const sctx = f.canvas.getContext('2d');
    const imgData = sctx.getImageData(0, 0, sw, sh);
    const R = f.R; // [9]
    // Axe de visée avant (colonne 2 de R)
    const fx = R[2], fy = R[5], fz = R[8];
    const lonCenter = Math.atan2(fx, fz); // radians [-π, π]
    const latCenter = Math.asin(Math.max(-1, Math.min(1, -fy))); // [-π/2, π/2]
    const phiCenter = Math.PI / 2 - latCenter; // [0, π]

    const focal = f.focal || (sh / 2) / Math.tan((65 * Math.PI) / 360);
    const radius = Math.atan(Math.hypot(sw / 2, sh / 2) / focal) + 0.05;

    return {
      data: new Uint32Array(imgData.data.buffer),
      sw,
      sh,
      R,
      focal,
      lonCenter,
      phiCenter,
      radius,
      latCenter,
    };
  });

  // Projection frame par frame avec bounding box sphérique
  for (const src of srcDataList) {
    const { data, sw, sh, R, focal, lonCenter, phiCenter, radius, latCenter } = src;
    const cx0 = sw / 2;
    const cy0 = sh / 2;

    const phiMin = Math.max(0, phiCenter - radius);
    const phiMax = Math.min(Math.PI, phiCenter + radius);
    const y0 = Math.max(0, Math.floor((phiMin / Math.PI) * H));
    const y1 = Math.min(H, Math.ceil((phiMax / Math.PI) * H));

    const isNearPole = Math.abs(latCenter) + radius >= Math.PI / 2 - 0.02;
    const halfLon = isNearPole ? Math.PI : Math.asin(Math.min(1, Math.sin(radius) / Math.cos(latCenter)));

    for (let y = y0; y < y1; y++) {
      const phi = ((y + 0.5) / H) * Math.PI;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);
      const dy = -cosPhi;
      const rowOffset = y * W;

      for (let x = 0; x < W; x++) {
        const lon = ((x + 0.5) / W) * 2 * Math.PI - Math.PI;

        if (!isNearPole) {
          let diffLon = Math.abs(lon - lonCenter);
          if (diffLon > Math.PI) diffLon = 2 * Math.PI - diffLon;
          if (diffLon > halfLon) continue;
        }

        const dx = sinPhi * Math.sin(lon);
        const dz = sinPhi * Math.cos(lon);

        // c = R^T * d
        const cx = R[0] * dx + R[3] * dy + R[6] * dz;
        const cy = R[1] * dx + R[4] * dy + R[7] * dz;
        const cz = R[2] * dx + R[5] * dy + R[8] * dz;

        if (cz <= 0.01) continue;

        const u = (focal * cx) / cz + cx0;
        const v = (focal * cy) / cz + cy0;

        const iu = Math.floor(u);
        const iv = Math.floor(v);

        if (iu >= 0 && iu < sw && iv >= 0 && iv < sh) {
          // Poids cosinus vers le centre de l'image (feathering)
          const edgeX = Math.min(u, sw - 1 - u) / cx0;
          const edgeY = Math.min(v, sh - 1 - v) / cy0;
          const wSample = Math.max(0.001, Math.min(1, edgeX) * Math.min(1, edgeY));

          const pix = data[iv * sw + iu];
          const r = pix & 0xff;
          const g = (pix >> 8) & 0xff;
          const b = (pix >> 16) & 0xff;

          const idx = rowOffset + x;
          accR[idx] += r * wSample;
          accG[idx] += g * wSample;
          accB[idx] += b * wSample;
          accW[idx] += wSample;
        }
      }
    }
  }

  // Écriture dans ImageData avec normalisation et remplissage doux des pôles
  const finalImgData = outCtx.createImageData(W, H);
  const outBuf = new Uint32Array(finalImgData.data.buffer);

  for (let i = 0; i < numPixels; i++) {
    const w = accW[i];
    if (w > 0.0001) {
      const r = Math.min(255, Math.round(accR[i] / w));
      const g = Math.min(255, Math.round(accG[i] / w));
      const b = Math.min(255, Math.round(accB[i] / w));
      outBuf[i] = (255 << 24) | (b << 16) | (g << 8) | r;
    } else {
      // Pôles non couverts : couleur d'ambiance douce (plafond clair, sol neutre)
      const y = Math.floor(i / W);
      const isTop = y < H / 2;
      const poleColor = isTop ? 0xffeae6df : 0xff1f1b16;
      outBuf[i] = poleColor;
    }
  }

  outCtx.putImageData(finalImgData, 0, 0);

  return new Promise((resolve) => {
    outCanvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
  });
}
