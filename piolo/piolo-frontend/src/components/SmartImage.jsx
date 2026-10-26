// src/components/SmartImage.jsx
import { useState, memo } from 'react';

/**
 * Composant Image haute performance optimisé pour 60fps :
 * - Décodage asynchrone (decoding="async")
 * - Lazy-loading natif (loading="lazy")
 * - Effet Blur-up fluide et transition douce
 * - Gestion gracieuse des erreurs de chargement
 */
function SmartImage({
  src,
  alt = 'Image Piolo',
  className = '',
  style = {},
  placeholder = null,
  fallback = '/static/img/logo-piolo-clean.png',
  priority = false,
  aspectRatio = null,
  ...props
}) {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const imgSrc = hasError || !src ? fallback : src;

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#15130F',
        width: '100%',
        height: '100%',
        ...(aspectRatio ? { aspectRatio } : {}),
        ...style,
      }}
      className={className}
    >
      {/* Fond shimmer / placeholder flou pendant le chargement */}
      {!loaded && !hasError && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #181510 25%, #242019 50%, #181510 75%)',
            backgroundSize: '200% 100%',
            animation: 'smartImgShimmer 1.5s infinite',
            zIndex: 1,
          }}
        />
      )}

      <img
        src={imgSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setLoaded(true);
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: loaded ? 1 : 0.01,
          filter: loaded ? 'none' : 'blur(8px)',
          transform: loaded ? 'scale(1) translate3d(0,0,0)' : 'scale(1.04) translate3d(0,0,0)',
          transition: 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), filter 0.35s ease',
          willChange: 'opacity, transform',
          backfaceVisibility: 'hidden',
        }}
        {...props}
      />
      <style>{`
        @keyframes smartImgShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export default memo(SmartImage);
