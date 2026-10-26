import json

# 1. Update locales
with open('src/i18n/locales/fr.json', 'r', encoding='utf-8') as f:
    fr = json.load(f)
with open('src/i18n/locales/en.json', 'r', encoding='utf-8') as f:
    en = json.load(f)

fr['sidebar']['language'] = "Langue"
en['sidebar']['language'] = "Language"

with open('src/i18n/locales/fr.json', 'w', encoding='utf-8') as f:
    json.dump(fr, f, ensure_ascii=False, indent=2)
with open('src/i18n/locales/en.json', 'w', encoding='utf-8') as f:
    json.dump(en, f, ensure_ascii=False, indent=2)

# 2. Update LanguageSwitcher.jsx
language_switcher_code = """import React from 'react';
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
"""

with open('src/components/LanguageSwitcher.jsx', 'w', encoding='utf-8') as f:
    f.write(language_switcher_code)

# 3. Update Sidebar.jsx
with open('src/components/Sidebar.jsx', 'r', encoding='utf-8') as f:
    sidebar_content = f.read()

old_sidebar_lang = """          {/* ── LANGUE ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
              <span>Langue / Language</span>
            </div>
            <LanguageSwitcher compact />
          </div>"""

new_sidebar_lang = """          {/* ── LANGUE ── */}
          <div className="sb-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 10, margin: '6px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#F3F4F6' }}>
              <svg className="sb-ico" viewBox="0 0 24 24" fill="#D4AF37"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
              <span style={{ color: '#F9FAFB', fontWeight: 600, fontSize: 13 }}>{t('sidebar.language', 'Langue')}</span>
            </div>
            <LanguageSwitcher compact />
          </div>"""

if old_sidebar_lang in sidebar_content:
    sidebar_content = sidebar_content.replace(old_sidebar_lang, new_sidebar_lang)
else:
    # regex fallback
    import re
    sidebar_content = re.sub(
        r'\{\/\* ── LANGUE ── \*\/\}[\s\S]*?<LanguageSwitcher compact \/>\s*<\/div>',
        new_sidebar_lang,
        sidebar_content
    )

with open('src/components/Sidebar.jsx', 'w', encoding='utf-8') as f:
    f.write(sidebar_content)

print("Updated LanguageSwitcher.jsx and Sidebar.jsx successfully!")
