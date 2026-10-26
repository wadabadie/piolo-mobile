import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * LanguageSwitcher — Sélecteur de langue bilingue FR 🇫🇷 / EN 🇬🇧
 * Design moderne, haut contraste, ultra-lisible en dark & light modes.
 */
export default function LanguageSwitcher({ compact = false, className = '' }) {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language || 'fr').toLowerCase().startsWith('en') ? 'en' : 'fr';

  const setLanguage = (lng) => {
    i18n.changeLanguage(lng);
    try {
      localStorage.setItem('piolo_lang', lng);
    } catch {}
  };

  const toggleLanguage = () => {
    setLanguage(currentLang === 'fr' ? 'en' : 'fr');
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className={`language-switcher-compact ${className}`}
        title={currentLang === 'fr' ? 'Switch to English' : 'Passer en Français'}
        aria-label="Changer de langue"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '20px',
          border: '1.5px solid rgba(212, 175, 55, 0.65)',
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.22), rgba(0, 0, 0, 0.4))',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          color: '#FFE27A',
          fontSize: '12.5px',
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.4), rgba(212, 175, 55, 0.15))';
          e.currentTarget.style.borderColor = '#FFD700';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.35)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.22), rgba(0, 0, 0, 0.4))';
          e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.65)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15)';
        }}
      >
        <span style={{ fontSize: '14px', lineHeight: 1 }}>{currentLang === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
        <span style={{ letterSpacing: '0.05em', color: '#FFF', fontWeight: 800 }}>
          {currentLang === 'fr' ? 'FR' : 'EN'}
        </span>
      </button>
    );
  }

  return (
    <div
      className={`language-switcher ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px',
        borderRadius: '22px',
        background: 'rgba(20, 20, 20, 0.65)',
        border: '1.5px solid rgba(212, 175, 55, 0.45)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
      }}
    >
      <button
        type="button"
        onClick={() => setLanguage('fr')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '5px 12px',
          borderRadius: '18px',
          border: 'none',
          background: currentLang === 'fr' ? 'linear-gradient(135deg, #D4AF37, #F6D365)' : 'transparent',
          color: currentLang === 'fr' ? '#0B0906' : '#D1D5DB',
          fontSize: '12.5px',
          fontWeight: currentLang === 'fr' ? 800 : 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: currentLang === 'fr' ? '0 2px 10px rgba(212, 175, 55, 0.4)' : 'none',
        }}
      >
        <span style={{ fontSize: '13px' }}>🇫🇷</span>
        <span>FR</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '5px 12px',
          borderRadius: '18px',
          border: 'none',
          background: currentLang === 'en' ? 'linear-gradient(135deg, #D4AF37, #F6D365)' : 'transparent',
          color: currentLang === 'en' ? '#0B0906' : '#D1D5DB',
          fontSize: '12.5px',
          fontWeight: currentLang === 'en' ? 800 : 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: currentLang === 'en' ? '0 2px 10px rgba(212, 175, 55, 0.4)' : 'none',
        }}
      >
        <span style={{ fontSize: '13px' }}>🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
}
