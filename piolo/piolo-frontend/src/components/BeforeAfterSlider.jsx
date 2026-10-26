import React, { useState, useRef, useCallback } from 'react';
import { getMediaUrl } from '../utils/media';

/**
 * Composant Avant / Après interactif de luxe
 * Permet de faire glisser un curseur pour comparer l'état avant et après les travaux / fabrication
 */
export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Avant travaux",
  afterLabel = "Après réalisation",
  aspectRatio = "16/10",
  className = ""
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: aspectRatio,
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'ew-resize',
        userSelect: 'none',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        border: '1.5px solid rgba(212,175,55,0.3)'
      }}
      className={className}
    >
      {/* Image APRÈS (Plein fond) */}
      <img
        src={getMediaUrl(afterImage, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80')}
        alt="Après réalisation"
        onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'; }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'rgba(15,13,9,0.8)',
          color: '#F6D365',
          fontSize: 11,
          fontWeight: 800,
          padding: '4px 10px',
          borderRadius: 8,
          border: '1px solid rgba(212,175,55,0.4)',
          letterSpacing: '0.5px'
        }}
      >
        {afterLabel}
      </div>

      {/* Image AVANT (Découpée par clip-path) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
        }}
      >
        <img
          src={getMediaUrl(beforeImage, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80')}
          alt="Avant travaux"
          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'; }}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            background: 'rgba(0,0,0,0.75)',
            color: '#FFFFFF',
            fontSize: 11,
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.2)',
            letterSpacing: '0.5px'
          }}
        >
          {beforeLabel}
        </div>
      </div>

      {/* Ligne de séparation verticale et curseur */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${sliderPosition}%`,
          width: 3,
          background: 'linear-gradient(to bottom, #F6D365, #D4AF37)',
          boxShadow: '0 0 10px rgba(0,0,0,0.5)',
          transform: 'translateX(-50%)',
          pointerEvents: 'none'
        }}
      >
        {/* Poignée centrale dorée avec icônes de flèches */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={() => setIsDragging(true)}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: '#0F0D09',
            border: '2.5px solid #D4AF37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F6D365',
            boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
            pointerEvents: 'auto',
            cursor: 'ew-resize'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
