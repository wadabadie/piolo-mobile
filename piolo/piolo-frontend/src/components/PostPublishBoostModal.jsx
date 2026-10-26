// src/components/PostPublishBoostModal.jsx
// Modale séquentielle post-publication : Incitation Visite 360° puis Vidéo Mode Découverte
// Support bimodal : Luxury Gold & Blanc (par défaut / mode clair) et Luxury Gold & Noir (mode sombre)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';

/* ─── SVG ICONS PROFESSIONNELS ─────────────────────────────────────────── */
const Icons = {
  Sparkles: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4z" />
      <path d="M19 17l1.2 2.8L23 21l-2.8 1.2L19 25l-1.2-2.8L15 21l2.8-1.2z" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  ArrowRight: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Tour360Illustration: ({ isDark }) => (
    <svg viewBox="0 0 160 140" width="140" height="120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 10px 25px rgba(212,175,55,0.22))' }}>
      {/* Halo de fond */}
      <circle cx="80" cy="70" r="55" fill="url(#goldHalo)" opacity={isDark ? "0.2" : "0.14"} />
      {/* Anneaux orbitaux 360 */}
      <ellipse cx="80" cy="70" rx="68" ry="28" stroke="url(#goldGrad)" strokeWidth="2" strokeDasharray="4 4" transform="rotate(-15 80 70)" />
      <ellipse cx="80" cy="70" rx="64" ry="24" stroke="url(#goldGradLight)" strokeWidth="2.5" />
      {/* Sphère centrale */}
      <circle cx="80" cy="70" r="32" fill={isDark ? "#0F0D09" : "#FFFFFF"} stroke="#D4AF37" strokeWidth="2" />
      {/* Lignes de méridiens / vue 360 */}
      <ellipse cx="80" cy="70" rx="14" ry="32" stroke={isDark ? "rgba(212,175,55,0.4)" : "rgba(212,175,55,0.5)"} strokeWidth="1.5" />
      <line x1="48" y1="70" x2="112" y2="70" stroke={isDark ? "rgba(212,175,55,0.4)" : "rgba(212,175,55,0.5)"} strokeWidth="1.5" />
      {/* Boussole / flèche 360 */}
      <path d="M80 50 L84 66 L80 64 L76 66 Z" fill="#D4AF37" />
      <path d="M80 90 L84 74 L80 76 L76 74 Z" fill={isDark ? "rgba(212,175,55,0.6)" : "rgba(212,175,55,0.4)"} />
      <circle cx="80" cy="70" r="3" fill="#B8962A" />
      {/* Badge 360° */}
      <rect x="62" y="98" width="36" height="18" rx="9" fill={isDark ? "#0F0D09" : "#FFFFFF"} stroke="#D4AF37" strokeWidth="1.5" />
      <text x="80" y="111" fill="#A8891C" fontSize="10" fontWeight="800" fontFamily="Poppins, sans-serif" textAnchor="middle">360°</text>
      {/* Étoiles décoratives */}
      <circle cx="28" cy="40" r="2.5" fill="#D4AF37" />
      <circle cx="134" cy="45" r="3" fill="#F6D365" />
      <circle cx="130" cy="98" r="2" fill="#D4AF37" opacity="0.7" />
      {/* Gradients */}
      <defs>
        <radialGradient id="goldHalo" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(80 70) rotate(90) scale(55)">
          <stop stopColor="#D4AF37" />
          <stop offset="1" stopColor="#D4AF37" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D4AF37" />
          <stop offset="1" stopColor="#F6D365" />
        </linearGradient>
        <linearGradient id="goldGradLight" x1="20" y1="70" x2="140" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F6D365" />
          <stop offset="0.5" stopColor="#D4AF37" />
          <stop offset="1" stopColor="#B8962A" />
        </linearGradient>
      </defs>
    </svg>
  ),
  ReelVideoIllustration: ({ isDark }) => (
    <svg viewBox="0 0 160 140" width="140" height="120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 10px 25px rgba(212,175,55,0.22))' }}>
      {/* Halo de fond */}
      <circle cx="80" cy="70" r="55" fill="url(#reelHalo)" opacity={isDark ? "0.18" : "0.14"} />
      {/* Cadre Téléphone Smartphone vertical */}
      <rect x="52" y="14" width="56" height="102" rx="14" fill={isDark ? "#0F0D09" : "#FFFFFF"} stroke="#D4AF37" strokeWidth="2.5" />
      {/* Encoche caméra */}
      <rect x="72" y="20" width="16" height="3.5" rx="1.75" fill="rgba(212,175,55,0.5)" />
      {/* Écran intérieur */}
      <rect x="56" y="28" width="48" height="80" rx="8" fill={isDark ? "url(#screenGradDark)" : "url(#screenGradLight)"} />
      {/* Bouton Play au centre de l'écran */}
      <circle cx="80" cy="64" r="14" fill={isDark ? "rgba(15,13,9,0.8)" : "rgba(255,255,255,0.9)"} stroke="#D4AF37" strokeWidth="1.5" />
      <polygon points="76,57 88,64 76,71" fill="#A8891C" />
      {/* Barres audio / texte de description en bas d'écran */}
      <rect x="61" y="88" width="28" height="3" rx="1.5" fill={isDark ? "#FFFFFF" : "#0F0D09"} opacity="0.85" />
      <rect x="61" y="94" width="18" height="2.5" rx="1.25" fill="#D4AF37" />
      {/* Badge Découverte flottant */}
      <rect x="86" y="78" width="14" height="14" rx="7" fill="#22C55E" />
      <polyline points="90 85 92.5 87.5 97 82" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Ondes / particules d'engagement */}
      <path d="M120 40 C125 46, 125 54, 120 60" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
      <path d="M126 34 C134 42, 134 58, 126 66" stroke="rgba(212,175,55,0.5)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M40 75 C35 81, 35 89, 40 95" stroke="#F6D365" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <radialGradient id="reelHalo" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(80 70) rotate(90) scale(55)">
          <stop stopColor="#F6D365" />
          <stop offset="1" stopColor="#D4AF37" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="screenGradDark" x1="56" y1="28" x2="104" y2="108" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E1B15" />
          <stop offset="0.5" stopColor="#2D2412" />
          <stop offset="1" stopColor="#15120C" />
        </linearGradient>
        <linearGradient id="screenGradLight" x1="56" y1="28" x2="104" y2="108" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDFBF7" />
          <stop offset="0.5" stopColor="#FFF9EB" />
          <stop offset="1" stopColor="#F5EFE0" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

export default function PostPublishBoostModal({
  propertyId,
  propertyTitle = 'Votre bien',
  isOpen = false,
  onClose,
  initialStep = 'tour_360', // 'tour_360' | 'reel_discovery'
}) {
  const navigate = useNavigate();
  const { dark: isDark } = useDarkMode();
  const [currentStep, setCurrentStep] = useState(initialStep);

  if (!isOpen) return null;

  const handleStart360Tour = () => {
    onClose?.();
    navigate(`/properties/${propertyId}/tour-editor?afterPublish=1`);
  };

  const handleSkipToReel = () => {
    setCurrentStep('reel_discovery');
  };

  const handleStartReelUpload = () => {
    onClose?.();
    navigate(`/dashboard/bailleur?openReel=${encodeURIComponent(propertyId)}&firstGuide=1`);
  };

  const handleFinishAll = () => {
    onClose?.();
    navigate(`/properties/${propertyId}`);
  };

  return (
    <div className={`piolo-publish-modal-backdrop ${isDark ? 'mode-dark' : 'mode-light'}`}>
      <style>{`
        .piolo-publish-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          box-sizing: border-box;
          animation: pioloFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .piolo-publish-modal-backdrop.mode-dark {
          background: rgba(10, 8, 6, 0.88);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .piolo-publish-modal-backdrop.mode-light {
          background: rgba(15, 13, 9, 0.48);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .piolo-publish-modal-card {
          width: 100%;
          max-width: 520px;
          border-radius: 28px;
          border: 1.5px solid rgba(212, 175, 55, 0.32);
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.05);
          padding: 32px 28px;
          box-sizing: border-box;
          position: relative;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
          animation: pioloScaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mode-dark .piolo-publish-modal-card {
          background: #0F0D09;
          color: #FFFFFF;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.65);
        }

        .mode-light .piolo-publish-modal-card {
          background: #FFFFFF;
          color: #0F0D09;
          box-shadow: 0 25px 70px rgba(212, 175, 55, 0.18), 0 10px 30px rgba(0,0,0,0.06);
        }

        @keyframes pioloFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pioloScaleUp {
          from { transform: scale(0.94) translateY(10px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }

        .piolo-steps-progress {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 22px;
        }

        .piolo-step-dot {
          width: 28px;
          height: 6px;
          border-radius: 999px;
          transition: all 0.3s ease;
        }

        .mode-dark .piolo-step-dot {
          background: rgba(255, 255, 255, 0.15);
        }
        .mode-light .piolo-step-dot {
          background: #E8E3DA;
        }

        .piolo-step-dot.active {
          width: 44px;
          background: linear-gradient(90deg, #D4AF37, #F6D365);
          box-shadow: 0 0 12px rgba(212, 175, 55, 0.5);
        }

        .piolo-step-dot.completed {
          background: #22C55E;
        }

        .piolo-benefit-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin: 22px 0 26px;
          border-radius: 18px;
          padding: 16px 18px;
          text-align: left;
        }

        .mode-dark .piolo-benefit-list {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(212, 175, 55, 0.15);
        }

        .mode-light .piolo-benefit-list {
          background: #FDFBF7;
          border: 1px solid rgba(212, 175, 55, 0.22);
        }

        .piolo-benefit-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 13.5px;
          line-height: 1.45;
        }

        .mode-dark .piolo-benefit-item {
          color: rgba(255, 255, 255, 0.88);
        }
        .mode-light .piolo-benefit-item {
          color: #38342E;
        }

        .mode-dark .piolo-benefit-item strong {
          color: #F6D365;
        }
        .mode-light .piolo-benefit-item strong {
          color: #8C6F12;
        }

        .piolo-benefit-icon-wrap {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .piolo-btn-cta {
          width: 100%;
          padding: 14px 20px;
          border-radius: 14px;
          border: 0;
          background: linear-gradient(135deg, #D4AF37, #F6D365);
          color: #0F0D09;
          font-family: 'Poppins', sans-serif;
          font-size: 14.5px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.35);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .piolo-btn-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 26px rgba(212, 175, 55, 0.45);
        }

        .piolo-btn-cta:active {
          transform: translateY(0) scale(0.99);
        }

        .piolo-btn-skip {
          background: transparent;
          border: 0;
          font-size: 13px;
          font-weight: 600;
          padding: 10px;
          margin-top: 10px;
          cursor: pointer;
          width: 100%;
          transition: color 0.18s ease;
        }

        .mode-dark .piolo-btn-skip {
          color: rgba(255, 255, 255, 0.55);
        }
        .mode-dark .piolo-btn-skip:hover {
          color: #FFFFFF;
        }

        .mode-light .piolo-btn-skip {
          color: #8C857C;
        }
        .mode-light .piolo-btn-skip:hover {
          color: #0F0D09;
        }

        @media (max-width: 480px) {
          .piolo-publish-modal-card {
            padding: 24px 18px;
            border-radius: 22px;
          }
        }
      `}</style>

      <div className="piolo-publish-modal-card">
        {/* Bouton Fermeture */}
        <button
          type="button"
          onClick={handleFinishAll}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 13, 9, 0.05)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(15, 13, 9, 0.08)',
            borderRadius: '50%',
            width: 34,
            height: 34,
            color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#64605A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
        >
          <Icons.Close />
        </button>

        {/* Indicateur d'étapes (Étape 1: 360° / Étape 2: Découverte) */}
        <div className="piolo-steps-progress">
          <div className={`piolo-step-dot ${currentStep === 'tour_360' ? 'active' : 'completed'}`} />
          <div className={`piolo-step-dot ${currentStep === 'reel_discovery' ? 'active' : ''}`} />
        </div>

        {currentStep === 'tour_360' ? (
          /* ══════════════════════════════════════════════════════════════
             ÉTAPE 1 : VISITE VIRTUELLE 360°
             ══════════════════════════════════════════════════════════════ */
          <div style={{ textAlign: 'center' }}>
            <Icons.Tour360Illustration isDark={isDark} />

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: isDark ? 'rgba(212,175,55,0.12)' : 'rgba(212,175,55,0.14)', border: '1px solid rgba(212,175,55,0.35)', padding: '4px 12px', borderRadius: 999, margin: '8px 0 10px' }}>
              <Icons.Sparkles />
              <span style={{ fontSize: 11, fontWeight: 800, color: isDark ? '#F6D365' : '#8C6F12', textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'Poppins, sans-serif' }}>
                Étape 1 / 2 • Recommandé
              </span>
            </div>

            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 21, fontWeight: 800, margin: '0 0 8px', color: isDark ? '#FFFFFF' : '#0F0D09', letterSpacing: -0.3 }}>
              Ajoutez une Visite 360° Immersive
            </h2>

            <p style={{ fontSize: 13.5, color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#64605A', margin: '0 0 18px', lineHeight: 1.5 }}>
              Votre annonce pour <strong>« {propertyTitle} »</strong> est enregistrée. Proposez maintenant une expérience de téléportation 360° pour séduire instantanément les locataires.
            </p>

            <div className="piolo-benefit-list">
              <div className="piolo-benefit-item">
                <div className="piolo-benefit-icon-wrap"><Icons.Check /></div>
                <div><strong>Immersion totale 24/7</strong> : Les locataires explorent chaque pièce comme s'ils y étaient.</div>
              </div>
              <div className="piolo-benefit-item">
                <div className="piolo-benefit-icon-wrap"><Icons.Check /></div>
                <div><strong>+80% de contacts qualifiés</strong> : Fini les visites physiques inutiles, seules les personnes conquises vous écrivent.</div>
              </div>
              <div className="piolo-benefit-item">
                <div className="piolo-benefit-icon-wrap"><Icons.Check /></div>
                <div><strong>Badge 360° exclusif</strong> : Votre annonce ressort en avant avec un badge interactif doré.</div>
              </div>
            </div>

            <button
              type="button"
              className="piolo-btn-cta"
              onClick={handleStart360Tour}
            >
              <span>Créer la visite 360° maintenant</span>
              <Icons.ArrowRight />
            </button>

            <button
              type="button"
              className="piolo-btn-skip"
              onClick={handleSkipToReel}
            >
              Passer à l'étape suivante (Vidéo Découverte) ›
            </button>
          </div>
        ) : (
          /* ══════════════════════════════════════════════════════════════
             ÉTAPE 2 : VIDÉO MODE DÉCOUVERTE (REELS)
             ══════════════════════════════════════════════════════════════ */
          <div style={{ textAlign: 'center' }}>
            <Icons.ReelVideoIllustration isDark={isDark} />

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', padding: '4px 12px', borderRadius: 999, margin: '8px 0 10px' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'Poppins, sans-serif' }}>
                Étape 2 / 2 • Visibilité Max
              </span>
            </div>

            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 21, fontWeight: 800, margin: '0 0 8px', color: isDark ? '#FFFFFF' : '#0F0D09', letterSpacing: -0.3 }}>
              Publiez une Vidéo en Mode Découverte
            </h2>

            <p style={{ fontSize: 13.5, color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#64605A', margin: '0 0 18px', lineHeight: 1.5 }}>
              Propulsez votre logement au format vidéo vertical (Reel) pour capter l'attention de milliers de chercheurs de logements sur Piolo.
            </p>

            <div className="piolo-benefit-list">
              <div className="piolo-benefit-item">
                <div className="piolo-benefit-icon-wrap"><Icons.Check /></div>
                <div><strong>Format vertical immersif</strong> : Montrez la luminosité, les volumes et l'ambiance réelle en 30s.</div>
              </div>
              <div className="piolo-benefit-item">
                <div className="piolo-benefit-icon-wrap"><Icons.Check /></div>
                <div><strong>Flux Découverte plein écran</strong> : Votre bien défile directement sur le feed tendance des locataires.</div>
              </div>
              <div className="piolo-benefit-item">
                <div className="piolo-benefit-icon-wrap"><Icons.Check /></div>
                <div><strong>Studio Pro intégré</strong> : Recadrez, appliquez des filtres dorés et ajoutez vos textes en 2 clics.</div>
              </div>
            </div>

            <button
              type="button"
              className="piolo-btn-cta"
              onClick={handleStartReelUpload}
            >
              <span>Ajouter une vidéo Découverte</span>
              <Icons.ArrowRight />
            </button>

            <button
              type="button"
              className="piolo-btn-skip"
              onClick={handleFinishAll}
            >
              Terminer et voir mon annonce
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
