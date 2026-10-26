// src/utils/media.js — Nettoyage et normalisation des URLs de médias et vidéos

export function getMediaUrl(path, fallback = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80') {
  if (!path || typeof path !== 'string' || !path.trim()) return fallback;
  
  let clean = path.trim();
  
  // Supprimer http://127.0.0.1:8080 ou http://localhost:8080 ou http://0.0.0.0:8080 renvoyé par Django
  clean = clean.replace(/^https?:\/\/(127\.0\.0\.1|localhost|0\.0\.0\.0)(:\d+)?/i, '');
  
  // URLs directes valides (Unsplash, Cloudinary, S3, http, data:, blob:)
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:') || clean.startsWith('blob:')) {
    return clean;
  }
  
  // Si c'est un chemin relatif (/media/... ou /static/...)
  return clean.startsWith('/') ? clean : `/${clean}`;
}

export default getMediaUrl;
