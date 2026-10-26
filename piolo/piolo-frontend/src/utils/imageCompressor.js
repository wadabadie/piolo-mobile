/**
 * src/utils/imageCompressor.js
 * Optimisation, redimensionnement et compression haute performance des documents KYC & photos.
 * 
 * - Réduit les photos smartphone 12MP-48MP (8-15 Mo) à ~200-350 Ko (1600px max, JPEG 0.82).
 * - Préserve la netteté absolue des textes et filigranes pour la vérification CNI/Passeport.
 * - Corrige l'orientation EXIF automatiquement.
 * - Convertit l'espace colorimétrique en sRGB standard (évite les artefacts et strips arc-en-ciel).
 * - Préserve les fichiers PDF sans altération.
 */

export function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return '0 Ko';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export async function compressKycImage(file, {
  maxDimension = 1600,
  quality = 0.82,
  fillBackground = '#FFFFFF'
} = {}) {
  if (!file) return file;

  // Si c'est un PDF, on ne touche à rien
  const isPdf = file.type === 'application/pdf' || (file.name && file.name.toLowerCase().endsWith('.pdf'));
  if (isPdf) {
    return file;
  }

  // Si ce n'est pas une image reconnue, on retourne tel quel
  const isImage = (file.type && file.type.startsWith('image/')) || /\.(jpe?g|png|webp|bmp|heic|heif)$/i.test(file.name || '');
  if (!isImage) {
    return file;
  }

  try {
    let sourceWidth = 0;
    let sourceHeight = 0;
    let drawSource = null;

    // Tentative moderne avec createImageBitmap (gère nativement l'orientation EXIF)
    if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
      try {
        drawSource = await createImageBitmap(file, { imageOrientation: 'from-image' });
        sourceWidth = drawSource.width;
        sourceHeight = drawSource.height;
      } catch (bitmapErr) {
        drawSource = null;
      }
    }

    if (!drawSource) {
      // Fallback Image classique avec HTMLImageElement
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        const objectUrl = URL.createObjectURL(file);
        image.onload = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(image);
        };
        image.onerror = (e) => {
          URL.revokeObjectURL(objectUrl);
          reject(e);
        };
        image.src = objectUrl;
      });
      drawSource = img;
      sourceWidth = img.naturalWidth || img.width;
      sourceHeight = img.naturalHeight || img.height;
    }

    if (!sourceWidth || !sourceHeight) {
      return file;
    }

    // Calcul des dimensions cibles proportionnelles (max 1600px)
    let targetWidth = sourceWidth;
    let targetHeight = sourceHeight;

    if (sourceWidth > maxDimension || sourceHeight > maxDimension) {
      if (sourceWidth > sourceHeight) {
        targetHeight = Math.round((sourceHeight * maxDimension) / sourceWidth);
        targetWidth = maxDimension;
      } else {
        targetWidth = Math.round((sourceWidth * maxDimension) / sourceHeight);
        targetHeight = maxDimension;
      }
    }

    // Création du canvas avec fond opaque blanc (évite le noir sur PNG transparents)
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { alpha: false });

    if (fillBackground) {
      ctx.fillStyle = fillBackground;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(drawSource, 0, 0, targetWidth, targetHeight);

    // Fermeture du bitmap si présent pour libérer la mémoire GPU/RAM
    if (drawSource && typeof drawSource.close === 'function') {
      try { drawSource.close(); } catch (_) {}
    }

    // Conversion en Blob JPEG haute fidélité
    const blob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', quality);
    });

    if (!blob) {
      return file;
    }

    // Si par hasard le fichier compressé est plus lourd que l'original (très rare, ex: miniature déjà très compressée)
    if (blob.size >= file.size && file.type === 'image/jpeg') {
      return file;
    }

    // Nettoyer le nom de fichier pour éviter les erreurs d'encodage multipart (ex: accents ou espaces)
    const rawName = file.name || 'document';
    const cleanBaseName = rawName
      .replace(/\.[^/.]+$/, '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // supprimer les accents
      .replace(/[^a-zA-Z0-9_\-]/g, '_')
      .slice(0, 30);
    const compressedFileName = `${cleanBaseName || 'doc'}.jpg`;

    return new File([blob], compressedFileName, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch (err) {
    console.warn('Compression client non bloquante, envoi du fichier initial:', err);
    return file;
  }
}

export default compressKycImage;
