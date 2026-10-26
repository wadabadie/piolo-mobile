// src/context/SiteConfigContext.jsx — Dynamic Platform Config & Theme Engine
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const defaultConfig = {
  site_name: 'Piolo Immobilier',
  site_slogan: 'Trouvez votre logement idéal au Cameroun en toute sécurité',
  logo_url: '/img/logo-piolo-clean.png',
  logo_dark_url: '/img/logo-piolo-clean.png',
  favicon_url: '/favicon.ico',
  font_heading: 'Poppins',
  font_body: 'Inter',
  font_size_base: 14,
  primary_gold: '#D4AF37',
  gold_light: '#F6D365',
  gold_dark: '#E8C84A',
  dark_bg: '#070503',
  card_bg_dark: '#181510',
  light_bg: '#F7F4EC',
  card_bg_light: '#FFFFFF',
  border_radius: 14,
  hero_title: 'Trouvez la propriété de vos rêves au Cameroun',
  hero_subtitle: 'Des milliers d\'appartements, villas et terrains vérifiés par Piolo à Yaoundé, Douala et partout au Cameroun.',
  footer_copyright: '© 2026 Piolo Immobilier. Tous droits réservés.',
  contact_email: 'contact@piolo.cm',
  contact_phone: '+237 658 32 42 85',
  contact_phone_secondary: '+237 689 54 23 33',
  whatsapp_number: '+237658324285',
  whatsapp_number_secondary: '+237689542333',
  welcome_points_tenant: 50,
  welcome_points_landlord: 30,
  max_kyc_rejections: 3,
  maintenance_mode: false,
  maintenance_message: 'Le site est actuellement en maintenance pour mise à jour. Revenez dans quelques minutes !',
  feature_flags: {},
  real_estate_rules: {},
  financial_rules: {},
  notifications_config: {},
  active_sections: {},
  languages_config: {},
};

const SiteConfigContext = createContext({
  config: defaultConfig,
  reloadConfig: () => {},
});

export function SiteConfigProvider({ children }) {
  const [config, setConfig] = useState(defaultConfig);

  const applyThemeToDOM = (cfg) => {
    if (!cfg) return;
    const root = document.documentElement;
    root.style.setProperty('--or', cfg.primary_gold || '#D4AF37');
    root.style.setProperty('--or-l', cfg.gold_light || '#F6D365');
    root.style.setProperty('--or-d', cfg.gold_dark || '#E8C84A');
    root.style.setProperty('--noir-b', cfg.dark_bg || '#070503');

    // Variables de surface : injectées dans :root (et NON en inline) afin que
    // les règles `html.dark { --blanc: ... }` puissent les remplacer en mode sombre.
    ['--paper', '--gris-f', '--blanc', '--card-bg-light', '--gris-b'].forEach((v) => root.style.removeProperty(v));
    let themeStyle = document.getElementById('site-config-theme');
    if (!themeStyle) {
      themeStyle = document.createElement('style');
      themeStyle.id = 'site-config-theme';
      document.head.appendChild(themeStyle);
    }
    const lightBg = cfg.light_bg || '#F7F4EC';
    const cardBg = cfg.card_bg_light || '#FFFFFF';
    themeStyle.textContent = `:root{--paper:${lightBg};--gris-f:${lightBg};--blanc:${cardBg};--card-bg-light:${cardBg};--gris-b:#E8E3DA;}`;

    // Title / Favicon
    if (cfg.site_name) {
      document.title = `${cfg.site_name} — ${cfg.site_slogan || 'Plateforme Immobilière'}`;
    }

    // Dynamic Google Fonts
    if (cfg.font_heading) {
      const fontName = cfg.font_heading.replace(/ /g, '+');
      let link = document.getElementById('google-font-heading-dynamic');
      if (!link) {
        link = document.createElement('link');
        link.id = 'google-font-heading-dynamic';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@600;700;800&display=swap`;
      root.style.setProperty('--font-heading', `'${cfg.font_heading}', sans-serif`);
    }
  };

  const fetchSiteConfig = async () => {
    try {
      const { data } = await api.get('/auth/site-config/');
      if (data) {
        const merged = { ...defaultConfig, ...data };
        setConfig(merged);
        applyThemeToDOM(merged);
      }
    } catch {
      try {
        const res = await fetch('/api/v1/auth/site-config/');
        if (res.ok) {
          const json = await res.json();
          const merged = { ...defaultConfig, ...json };
          setConfig(merged);
          applyThemeToDOM(merged);
        }
      } catch {
        applyThemeToDOM(defaultConfig);
      }
    }
  };

  useEffect(() => {
    fetchSiteConfig();
  }, []);

  return (
    <SiteConfigContext.Provider value={{ config, reloadConfig: fetchSiteConfig }}>
      {children}
      {/* Overlay Maintenance Mode */}
      {config.maintenance_mode && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999999,
          background: 'linear-gradient(135deg, #070503 0%, #181510 100%)',
          color: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 30, textAlign: 'center', fontFamily: 'Poppins, sans-serif'
        }}>
          <img src={config.logo_dark_url || config.logo_url || '/img/logo-piolo-clean.png'} alt="Logo" style={{ height: 56, marginBottom: 24, objectFit: 'contain' }} />
          <span style={{
            background: 'rgba(212,175,55,0.14)',
            border: '1px solid rgba(212,175,55,0.4)',
            color: '#F6D365',
            padding: '6px 18px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 16
          }}>
            Maintenance Technique en Cours
          </span>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 12px', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            {config.site_name} fait l'objet d'une mise à jour programmée
          </h1>
          <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.72)', maxWidth: 540, lineHeight: 1.65, margin: '0 0 24px' }}>
            {config.maintenance_message}
          </p>
          <div style={{ fontSize: 12.5, color: 'rgba(212,175,55,0.85)', fontWeight: 600 }}>
            Assistance : {config.contact_email} · {config.contact_phone}
          </div>
        </div>
      )}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}
