// src/components/ReelStudioGuideModal.jsx
// Guide Pédagogique & Onboarding Professionnel du Studio Mode Découverte (Reels)
// Support bimodal : Luxury Gold & Blanc (mode clair par défaut) et Luxury Gold & Noir (mode sombre)
import React, { useState } from 'react';
import { useDarkMode } from '../context/DarkModeContext';

/* ─── SVG ICONS PROS POUR LE GUIDE REEL ─────────────────────────────────── */
const GuideIcons = {
  Smartphone: ({ isDark }) => (
    <svg viewBox="0 0 120 100" width="100" height="84" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="42" y="10" width="36" height="68" rx="8" fill={isDark ? "#0F0D09" : "#FFFFFF"} stroke="#D4AF37" strokeWidth="2" />
      <rect x="54" y="14" width="12" height="2.5" rx="1.25" fill="#D4AF37" opacity="0.6" />
      <rect x="45" y="20" width="30" height="52" rx="4" fill={isDark ? "rgba(212,175,55,0.12)" : "rgba(212,175,55,0.16)"} />
      <polygon points="56,42 66,48 56,54" fill="#A8891C" />
      {/* Badges 9:16 */}
      <rect x="84" y="24" width="30" height="16" rx="8" fill={isDark ? "#1A1813" : "#FDFBF7"} stroke="#D4AF37" strokeWidth="1" />
      <text x="99" y="35.5" fill="#A8891C" fontSize="8.5" fontWeight="800" fontFamily="Poppins, sans-serif" textAnchor="middle">9:16</text>
      {/* Badge durée */}
      <rect x="6" y="52" width="32" height="16" rx="8" fill={isDark ? "#1A1813" : "#FDFBF7"} stroke="#22C55E" strokeWidth="1" />
      <text x="22" y="63.5" fill="#16A34A" fontSize="8" fontWeight="800" fontFamily="Poppins, sans-serif" textAnchor="middle">15-60s</text>
    </svg>
  ),
  Captions: ({ isDark }) => (
    <svg viewBox="0 0 120 100" width="100" height="84" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="15" width="70" height="58" rx="10" fill={isDark ? "#0F0D09" : "#FFFFFF"} stroke="#D4AF37" strokeWidth="2" />
      {/* Lignes de texte & bulle */}
      <rect x="35" y="26" width="34" height="4" rx="2" fill="#D4AF37" />
      <rect x="35" y="34" width="48" height="3" rx="1.5" fill={isDark ? "rgba(255,255,255,0.6)" : "#8C857C"} />
      <rect x="35" y="41" width="40" height="3" rx="1.5" fill={isDark ? "rgba(255,255,255,0.4)" : "#B5AFA6"} />
      {/* Bulle d'accroche dorée */}
      <rect x="33" y="52" width="54" height="14" rx="7" fill={isDark ? "rgba(212,175,55,0.2)" : "rgba(212,175,55,0.15)"} stroke="#D4AF37" strokeWidth="1" />
      <text x="60" y="62" fill="#A8891C" fontSize="7.5" fontWeight="700" fontFamily="Poppins, sans-serif" textAnchor="middle">Loyer • Bastos • Meublé</text>
    </svg>
  ),
  StudioTools: ({ isDark }) => (
    <svg viewBox="0 0 120 100" width="100" height="84" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="46" r="32" fill={isDark ? "#0F0D09" : "#FFFFFF"} stroke="#D4AF37" strokeWidth="2" />
      {/* Baguette magique / filtres / ciseaux */}
      <path d="M48 58 L72 34" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" />
      <polygon points="72,34 68,34 72,38" fill="#D4AF37" />
      {/* Étincelles dorées */}
      <circle cx="78" cy="28" r="2.5" fill="#D4AF37" />
      <circle cx="82" cy="42" r="1.5" fill="#F6D365" />
      <circle cx="40" cy="38" r="2" fill="#D4AF37" />
      {/* Badge Luxe Doré */}
      <rect x="34" y="66" width="52" height="16" rx="8" fill={isDark ? "#1A1813" : "#FDFBF7"} stroke="#D4AF37" strokeWidth="1" />
      <text x="60" y="77" fill="#A8891C" fontSize="8" fontWeight="800" fontFamily="Poppins, sans-serif" textAnchor="middle">✨ Filtres Pro</text>
    </svg>
  ),
  DiscoveryRocket: ({ isDark }) => (
    <svg viewBox="0 0 120 100" width="100" height="84" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="46" r="34" fill="url(#discHalo)" opacity="0.2" />
      {/* Fusée / Flux direct */}
      <path d="M60 22 C68 28, 72 40, 70 54 L60 50 L50 54 C48 40, 52 28, 60 22 Z" fill={isDark ? "#0F0D09" : "#FFFFFF"} stroke="#D4AF37" strokeWidth="2" />
      <circle cx="60" cy="36" r="4" fill="#A8891C" />
      {/* Flammes */}
      <path d="M56 54 L60 66 L64 54 Z" fill="#22C55E" />
      {/* Badge feed Découverte */}
      <rect x="26" y="68" width="68" height="16" rx="8" fill={isDark ? "#0F0D09" : "#FFFFFF"} stroke="#22C55E" strokeWidth="1" />
      <text x="60" y="79" fill="#16A34A" fontSize="8" fontWeight="800" fontFamily="Poppins, sans-serif" textAnchor="middle">Feed Découverte 🚀</text>
      <defs>
        <radialGradient id="discHalo" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(60 46) rotate(90) scale(34)">
          <stop stopColor="#22C55E" />
          <stop offset="1" stopColor="#D4AF37" stopOpacity="0" />
        </radialGradient>
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

const GUIDE_STEPS = [
  {
    id: 'format',
    icon: GuideIcons.Smartphone,
    badge: '1. Format & Prise de vue',
    title: 'Format Vertical 9:16 & Balayage Fluide',
    desc: 'Filmez votre bien à la verticale avec votre smartphone pour un rendu plein écran immersif.',
    tips: [
      'Privilégiez une durée de 15 à 60 secondes (max 2 minutes).',
      'Filmez en journée avec un maximum de lumière naturelle.',
      'Faites des mouvements lents d’une pièce à l’autre pour une visite agréable.',
    ]
  },
  {
    id: 'caption',
    icon: GuideIcons.Captions,
    badge: '2. Texte d’accroche & Infos',
    title: 'Ajoutez une Légende Percutante',
    desc: 'Le texte descriptif s’affiche directement en bas de votre vidéo dans le flux Découverte.',
    tips: [
      'Mentionnez les atouts majeurs (ex: Climatisation, Groupe électrogène, Balcon).',
      'Indiquez le quartier précis et si les charges sont incluses.',
      'Restez court et impactant pour déclencher le coup de cœur immédiat.',
    ]
  },
  {
    id: 'tools',
    icon: GuideIcons.StudioTools,
    badge: '3. Outils du Studio Pro',
    title: 'Sublimez vos Vidéos en 1 Clic',
    desc: 'Le Studio Piolo intègre des outils professionnels adaptés au marché immobilier.',
    tips: [
      'Appliquez le filtre « Luxe Doré » ou « Clarté Max » pour illuminer les pièces.',
      'Recadrez au format 9:16 ou 1:1 selon votre vidéo originale.',
      'Désactivez le son (Mute) si vous aviez des bruits de fond ou bruits de rue.',
    ]
  },
  {
    id: 'discovery',
    icon: GuideIcons.DiscoveryRocket,
    badge: '4. Diffusion & Contacts',
    title: 'Indexation Immédiate en Mode Découverte',
    desc: 'Dès la publication de votre vidéo, elle est propulsée dans le canal Découverte de milliers d’utilisateurs.',
    tips: [
      'Les locataires naviguent en scroll vertical (style Reel / TikTok).',
      'Un bouton d’action direct permet de réserver une visite ou vous contacter.',
      'Vous pouvez modifier ou remplacer la vidéo à tout moment depuis votre Dashboard.',
    ]
  }
];

export default function ReelStudioGuideModal({ isOpen, onClose }) {
  const { dark: isDark } = useDarkMode();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const currentStep = GUIDE_STEPS[activeStepIndex];
  const isLast = activeStepIndex === GUIDE_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleClose();
    } else {
      setActiveStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setActiveStepIndex(prev => Math.max(0, prev - 1));
  };

  const handleClose = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('piolo_reel_guide_seen', 'true');
      } catch (_) {}
    }
    onClose?.();
  };

  const StepIcon = currentStep.icon;

  return (
    <div className={`piolo-guide-backdrop ${isDark ? 'mode-dark' : 'mode-light'}`}>
      <style>{`
        .piolo-guide-backdrop {
          position: fixed;
          inset: 0;
          z-index: 10005;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          box-sizing: border-box;
          animation: pioloGuideFade 0.22s ease;
        }

        .piolo-guide-backdrop.mode-dark {
          background: rgba(10, 8, 6, 0.92);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .piolo-guide-backdrop.mode-light {
          background: rgba(15, 13, 9, 0.48);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .piolo-guide-card {
          width: 100%;
          max-width: 500px;
          border-radius: 26px;
          border: 1.5px solid rgba(212, 175, 55, 0.32);
          padding: 30px 26px 24px;
          box-sizing: border-box;
          position: relative;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
          animation: pioloGuidePop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mode-dark .piolo-guide-card {
          background: #0F0D09;
          color: #FFFFFF;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.05);
        }

        .mode-light .piolo-guide-card {
          background: #FFFFFF;
          color: #0F0D09;
          box-shadow: 0 25px 70px rgba(212, 175, 55, 0.18), 0 10px 30px rgba(0,0,0,0.06);
        }

        @keyframes pioloGuideFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pioloGuidePop {
          from { transform: scale(0.95) translateY(12px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }

        .piolo-guide-pills-nav {
          display: flex;
          gap: 6px;
          margin-bottom: 20px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .piolo-guide-pills-nav::-webkit-scrollbar {
          display: none;
        }

        .piolo-guide-pill {
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .mode-dark .piolo-guide-pill {
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.6);
        }
        .mode-dark .piolo-guide-pill.active {
          background: rgba(212, 175, 55, 0.18);
          border-color: #D4AF37;
          color: #F6D365;
        }

        .mode-light .piolo-guide-pill {
          border: 1px solid #E8E3DA;
          background: #FDFBF7;
          color: #64605A;
        }
        .mode-light .piolo-guide-pill.active {
          background: rgba(212, 175, 55, 0.14);
          border-color: #D4AF37;
          color: #8C6F12;
        }

        .piolo-guide-tips-box {
          border-radius: 16px;
          padding: 14px 16px;
          margin: 18px 0;
          text-align: left;
        }

        .mode-dark .piolo-guide-tips-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(212, 175, 55, 0.15);
        }

        .mode-light .piolo-guide-tips-box {
          background: #FDFBF7;
          border: 1px solid rgba(212, 175, 55, 0.22);
        }

        .piolo-guide-tip-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          line-height: 1.45;
          margin-bottom: 8px;
        }

        .mode-dark .piolo-guide-tip-row {
          color: rgba(255, 255, 255, 0.82);
        }
        .mode-light .piolo-guide-tip-row {
          color: #38342E;
        }

        .piolo-guide-tip-row:last-child {
          margin-bottom: 0;
        }

        .piolo-guide-tip-bullet {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #D4AF37;
          flex-shrink: 0;
          margin-top: 6px;
        }

        .piolo-guide-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 20px;
        }

        .piolo-guide-btn-prev {
          padding: 12px 18px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .mode-dark .piolo-guide-btn-prev {
          border: 1.5px solid rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.05);
          color: #FFFFFF;
        }
        .mode-dark .piolo-guide-btn-prev:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .mode-light .piolo-guide-btn-prev {
          border: 1.5px solid #E8E3DA;
          background: #F8F9FA;
          color: #0F0D09;
        }
        .mode-light .piolo-guide-btn-prev:hover {
          background: #EFEBE3;
        }

        .piolo-guide-btn-next {
          flex: 1;
          padding: 12px 20px;
          border-radius: 12px;
          border: 0;
          background: linear-gradient(135deg, #D4AF37, #F6D365);
          color: #0F0D09;
          font-family: 'Poppins', sans-serif;
          font-size: 13.5px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(212, 175, 55, 0.35);
          transition: transform 0.15s ease;
        }

        .piolo-guide-btn-next:active {
          transform: scale(0.98);
        }
      `}</style>

      <div className="piolo-guide-card">
        {/* Bouton Fermer */}
        <button
          type="button"
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 13, 9, 0.05)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(15, 13, 9, 0.08)',
            borderRadius: '50%',
            width: 32,
            height: 32,
            color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#64605A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <GuideIcons.Close />
        </button>

        {/* Navigation par pilules / étapes */}
        <div className="piolo-guide-pills-nav">
          {GUIDE_STEPS.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              className={`piolo-guide-pill ${idx === activeStepIndex ? 'active' : ''}`}
              onClick={() => setActiveStepIndex(idx)}
            >
              {idx + 1}. {s.id === 'format' ? 'Format' : s.id === 'caption' ? 'Texte' : s.id === 'tools' ? 'Studio' : 'Découverte'}
            </button>
          ))}
        </div>

        {/* Corps de l'étape active */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ margin: '6px 0 10px' }}>
            <StepIcon isDark={isDark} />
          </div>

          <div style={{ display: 'inline-block', background: isDark ? 'rgba(212,175,55,0.12)' : 'rgba(212,175,55,0.14)', border: '1px solid rgba(212,175,55,0.3)', padding: '3px 10px', borderRadius: 999, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: isDark ? '#F6D365' : '#8C6F12', textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: 'Poppins, sans-serif' }}>
              {currentStep.badge}
            </span>
          </div>

          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 800, margin: '0 0 6px', color: isDark ? '#FFFFFF' : '#0F0D09' }}>
            {currentStep.title}
          </h3>

          <p style={{ fontSize: 13, color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#64605A', margin: '0 0 12px', lineHeight: 1.45 }}>
            {currentStep.desc}
          </p>

          {/* Liste des conseils pro */}
          <div className="piolo-guide-tips-box">
            {currentStep.tips.map((tip, idx) => (
              <div key={idx} className="piolo-guide-tip-row">
                <div className="piolo-guide-tip-bullet" />
                <div>{tip}</div>
              </div>
            ))}
          </div>

          {/* Option Ne plus afficher */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '14px 0 4px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: isDark ? 'rgba(255,255,255,0.6)' : '#64605A', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={e => setDontShowAgain(e.target.checked)}
                style={{ accentColor: '#D4AF37', width: 15, height: 15 }}
              />
              Ne plus afficher ce guide automatiquement
            </label>
          </div>

          {/* Boutons d'action */}
          <div className="piolo-guide-actions">
            {activeStepIndex > 0 && (
              <button
                type="button"
                className="piolo-guide-btn-prev"
                onClick={handlePrev}
              >
                Précédent
              </button>
            )}
            <button
              type="button"
              className="piolo-guide-btn-next"
              onClick={handleNext}
            >
              <span>{isLast ? 'J\'ai compris, place au Studio ! 🚀' : 'Suivant ›'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
