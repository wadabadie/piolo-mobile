import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

/**
 * FloatingFab — Menu radial en mode Bulle
 */
export default function FloatingFab({ onClose, items }) {
  const [isOpen, setIsOpen] = useState(false);
  const fabRef = useRef(null);
  const containerRef = useRef(null);

  // Drag & drop state
  const drag = useRef({
    isDragging: false,
    hasMoved: false,
    startX: 0,
    startY: 0,
    xOffset: parseInt(localStorage.getItem('fabXOffset') || '0'),
    yOffset: parseInt(localStorage.getItem('fabYOffset') || '0'),
    initialX: 0,
    initialY: 0,
  });

  // Appliquer position sauvegardée
  useEffect(() => {
    const { xOffset, yOffset } = drag.current;
    if (containerRef.current && (xOffset || yOffset)) {
      containerRef.current.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
    }
  }, []);

  // Calcul des positions radiales
  const getItemStyle = (index) => {
    if (!isOpen) {
      return {
        transform: 'translate(0, 0) scale(0)',
        opacity: 0,
        pointerEvents: 'none',
        transition: `all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${index * 25}ms`,
      };
    }
    const angle = items[index]?.angle ?? (index * 45);
    const radius = 90;
    const rad = (angle - 90) * (Math.PI / 180);
    const x = Math.round(radius * Math.cos(rad));
    const y = Math.round(radius * Math.sin(rad));
    return {
      transform: `translate(${x}px, ${y}px) scale(1)`,
      opacity: 1,
      pointerEvents: 'auto',
      transition: `all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${index * 35}ms`,
    };
  };

  // Drag handlers
  const onDragStart = (e) => {
    const d = drag.current;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    d.startX = clientX;
    d.startY = clientY;
    d.hasMoved = false;
    d.initialX = clientX - d.xOffset;
    d.initialY = clientY - d.yOffset;
    d.isDragging = true;
  };

  const onDragMove = (e) => {
    const d = drag.current;
    if (!d.isDragging) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dist = Math.hypot(clientX - d.startX, clientY - d.startY);
    if (dist > 5) {
      d.hasMoved = true;
    }

    d.xOffset = clientX - d.initialX;
    d.yOffset = clientY - d.initialY;

    if (containerRef.current) {
      containerRef.current.style.transform = `translate3d(${d.xOffset}px, ${d.yOffset}px, 0)`;
    }

    if (isOpen && dist > 10) {
      setIsOpen(false);
    }
  };

  const onDragEnd = () => {
    const d = drag.current;
    d.isDragging = false;
    localStorage.setItem('fabXOffset', d.xOffset);
    localStorage.setItem('fabYOffset', d.yOffset);
  };

  useEffect(() => {
    const fab = fabRef.current;
    if (!fab) return;

    const handleMouseDown = (e) => onDragStart(e);
    const handleTouchStart = (e) => onDragStart(e);
    const handleMouseMove = (e) => onDragMove(e);
    const handleTouchMove = (e) => onDragMove(e);
    const handleMouseUp = () => onDragEnd();
    const handleTouchEnd = () => onDragEnd();

    fab.addEventListener('mousedown', handleMouseDown);
    fab.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      fab.removeEventListener('mousedown', handleMouseDown);
      fab.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen]);

  const handleFabClick = (e) => {
    e.stopPropagation();
    if (drag.current.hasMoved) return;
    setIsOpen(o => !o);
  };

  return (
    <div
      ref={containerRef}
      id="piolo-fab-container"
      style={{
        position: 'fixed',
        bottom: 35,
        left: 35,
        zIndex: 9999,
      }}
    >
      {/* Bulles secondaires */}
      {items.map((item, i) => {
        const isCloseBtn = item.isClear || item.href === '__close__';
        const style = {
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 48,
          height: 48,
          marginTop: -24,
          marginLeft: -24,
          background: isCloseBtn ? 'rgba(30,12,12,0.94)' : 'rgba(20,17,13,0.94)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: `1.5px solid ${isCloseBtn ? 'rgba(224,90,90,0.45)' : 'rgba(212,175,55,0.4)'}`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isCloseBtn ? '#E05A5A' : '#F6D365',
          boxShadow: isCloseBtn
            ? '0 6px 20px rgba(224,90,90,0.3)'
            : '0 6px 20px rgba(0,0,0,0.6), 0 0 12px rgba(212,175,55,0.2)',
          cursor: 'pointer',
          textDecoration: 'none',
          transition: 'all 0.2s ease',
          ...getItemStyle(i),
        };

        if (isCloseBtn) {
          return (
            <button
              key={i}
              style={style}
              title={item.label}
              onClick={() => { setIsOpen(false); onClose?.(); }}
            >
              {item.icon}
            </button>
          );
        }

        return (
          <Link
            key={i}
            to={item.href}
            style={style}
            title={item.label}
            onClick={() => setIsOpen(false)}
          >
            {item.icon}
          </Link>
        );
      })}

      {/* Bulle principale */}
      <div
        ref={fabRef}
        onClick={handleFabClick}
        style={{
          width: 60,
          height: 60,
          background: 'linear-gradient(135deg, #1F1B14 0%, #0E0C09 100%)',
          border: '2px solid #D4AF37',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(212,175,55,0.35)',
          cursor: 'grab',
          position: 'relative',
          zIndex: 10,
          userSelect: 'none',
          transition: 'all 0.2s ease',
        }}
      >
        <img
          src="/img/logo-piolo-clean.png"
          alt="Piolo"
          style={{ width: 32, height: 'auto', pointerEvents: 'none' }}
        />
      </div>
    </div>
  );
}
