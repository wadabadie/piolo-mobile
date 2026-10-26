import React, { useEffect, useState } from 'react';

export default function PioloLoader({ show, text }) {
  const [visible, setVisible] = useState(show !== false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (show === false) {
      setFading(true);
      const t = setTimeout(() => setVisible(false), 600);
      return () => clearTimeout(t);
    } else {
      setFading(false);
      setVisible(true);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div className={`piolo-loader-overlay${fading ? ' fading' : ''}`}>
      {/* Particles background */}
      <div className="piolo-loader-particles">
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`piolo-particle piolo-particle-${i + 1}`} />
        ))}
      </div>

      <div className="piolo-loader-box">
        {/* Outer glow ring */}
        <div className="piolo-loader-ring-outer">
          <div className="piolo-loader-ring-inner">
            {/* Logo */}
            <img
              src="/static/img/logo-piolo-clean.png"
              alt="Piolo"
              className="piolo-loader-logo"
              onError={e => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback text logo */}
            <div className="piolo-loader-logo-fallback" style={{ display: 'none' }}>
              <span>P</span>
            </div>
          </div>
        </div>

        {/* Brand name */}
        <div className="piolo-loader-brand">
          <span className="piolo-loader-brand-p">P</span>IOLO
        </div>

        {/* Animated dots */}
        <div className="piolo-loader-dots">
          <div className="piolo-dot" />
          <div className="piolo-dot" />
          <div className="piolo-dot" />
        </div>

        {/* Text */}
        <div className="piolo-loader-text">
          {text || 'Chargement en cours…'}
        </div>
      </div>

      <style>{`
        .piolo-loader-overlay {
          position: fixed;
          inset: 0;
          background: #0A0806;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 1;
          transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .piolo-loader-overlay.fading {
          opacity: 0;
          pointer-events: none;
        }

        /* Particles */
        .piolo-loader-particles {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .piolo-particle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212,175,55,0.6), transparent);
          animation: particleFloat linear infinite;
        }
        .piolo-particle-1 { width:4px; height:4px; left:10%; animation-duration:6s; animation-delay:0s; }
        .piolo-particle-2 { width:3px; height:3px; left:25%; animation-duration:8s; animation-delay:1s; }
        .piolo-particle-3 { width:5px; height:5px; left:40%; animation-duration:7s; animation-delay:2s; }
        .piolo-particle-4 { width:3px; height:3px; left:55%; animation-duration:9s; animation-delay:0.5s; }
        .piolo-particle-5 { width:4px; height:4px; left:70%; animation-duration:6.5s; animation-delay:1.5s; }
        .piolo-particle-6 { width:6px; height:6px; left:80%; animation-duration:8.5s; animation-delay:3s; }
        .piolo-particle-7 { width:3px; height:3px; left:90%; animation-duration:7.5s; animation-delay:0.8s; }
        .piolo-particle-8 { width:4px; height:4px; left:15%; animation-duration:5.5s; animation-delay:2.5s; }
        @keyframes particleFloat {
          0%   { transform: translateY(110vh) scale(0); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(-10vh) scale(1); opacity: 0; }
        }

        /* Center box */
        .piolo-loader-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          position: relative;
          z-index: 1;
        }

        /* Outer ring */
        .piolo-loader-ring-outer {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, #D4AF37, #F6D365, #D4AF37 30%, transparent 30%, transparent 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: ringRotate 1.4s linear infinite;
          box-shadow: 0 0 30px rgba(212,175,55,0.25), 0 0 60px rgba(212,175,55,0.1);
        }
        .piolo-loader-ring-inner {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: #0F0D09;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(212,175,55,0.15);
        }
        @keyframes ringRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* Logo inside ring */
        .piolo-loader-logo {
          width: 58px;
          height: auto;
          animation: logoPulse 2s ease-in-out infinite;
        }
        .piolo-loader-logo-fallback {
          width: 58px;
          height: 58px;
          align-items: center;
          justify-content: center;
          font-family: 'Poppins', sans-serif;
          font-size: 32px;
          font-weight: 900;
          color: #D4AF37;
          animation: logoPulse 2s ease-in-out infinite;
        }
        @keyframes logoPulse {
          0%, 100% { transform: scale(0.95); opacity: 0.85; }
          50%       { transform: scale(1.05); opacity: 1; }
        }

        /* Brand name */
        .piolo-loader-brand {
          font-family: 'Poppins', sans-serif;
          font-size: 22px;
          font-weight: 900;
          color: #fff;
          letter-spacing: 6px;
          text-transform: uppercase;
        }
        .piolo-loader-brand-p {
          color: #D4AF37;
        }

        /* Animated dots */
        .piolo-loader-dots {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .piolo-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #D4AF37;
          animation: dotBounce 1.2s ease-in-out infinite;
          opacity: 0.4;
        }
        .piolo-dot:nth-child(1) { animation-delay: 0s; }
        .piolo-dot:nth-child(2) { animation-delay: 0.2s; }
        .piolo-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40%            { transform: scale(1.2); opacity: 1; }
        }

        /* Text */
        .piolo-loader-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.4);
          letter-spacing: 1px;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}
