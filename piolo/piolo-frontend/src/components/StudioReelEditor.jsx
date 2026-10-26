import i18n from '../i18n';
import { useTranslation } from 'react-i18next';
// src/components/StudioReelEditor.jsx
// Studio Reel Pro : Interface Studio Vidéo Pro avec Barre Flottante Intégrée & Image Grand Format
import { useState, useEffect, useRef, useCallback } from 'react';
import { getMediaUrl } from '../utils/media';
import ReelStudioGuideModal from './ReelStudioGuideModal';

/* ─── Ratios disponibles ──────────────────────────────────────────────── */
const RATIOS = {
  '9:16': { label: '9:16 Vertical (Story / Reel)', short: '9:16', w: 540, h: 960,  aspect: '9/16' },
  '1:1':  { label: '1:1 Carré (Instagram Feed)',   short: '1:1',  w: 720, h: 720,  aspect: '1/1' },
  '16:9': { label: '16:9 Paysage (Format Large)',  short: '16:9', w: 960, h: 540,  aspect: '16/9' },
  '4:3':  { label: '4:3 Standard (Classique)',     short: '4:3',  w: 720, h: 540,  aspect: '4/3' },
};

/* ─── Presets d'étalonnage colorimétrique Pro ─────────────────────────── */
const FILTER_PRESETS = [
  { id: 'natural',  name: 'Naturel',       b: 100, c: 100, s: 100, desc: 'Rendu fidèle' },
  { id: 'luxe',     name: 'Luxe Doré',     b: 106, c: 114, s: 124, desc: 'Chaleur & éclat' },
  { id: 'bright',   name: 'Clarté Max',    b: 118, c: 105, s: 108, desc: 'Lumière diffuse' },
  { id: 'cinema',   name: 'Cinéma Contraste', b: 100, c: 128, s: 95, desc: 'Relief & profondeur' },
  { id: 'bw',       name: 'Monochrome Pro', b: 105, c: 130, s: 0,   desc: 'Élégance N&B' },
];

/* ─── Nettoyage automatique des anciens emojis ────────────────────────── */
const stripEmojis = (str = '') => {
  if (!str) return '';
  return str
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/* ─── Inline Pro SVG Icons ─────────────────────────────────────────────── */
const Icons = {
  Reel: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.5" />
      <line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  ),
  Sun: () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  Moon: () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  VolumeUp: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  ),
  VolumeMute: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Tag: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  Crop: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" />
      <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" />
    </svg>
  ),
  Scissors: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  ),
  Speed: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
      <path d="M16 2l3 3-3 3" />
    </svg>
  ),
  Sliders: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  ),
  Flip: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 2 21 6 17 10" /><path d="M3 6h18" />
      <polyline points="7 22 3 18 7 14" /><path d="M21 18H3" />
    </svg>
  ),
  TextEdit: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Upload: () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Play: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  Pause: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1.5" />
      <rect x="14" y="4" width="4" height="16" rx="1.5" />
    </svg>
  ),
  SkipBack: () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <polygon points="19 20 9 12 19 4 19 20" />
      <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Sparkles: () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
    </svg>
  ),
  Refresh: () => (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  VideoCamera: () => (
    <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  Send: () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Wand: () => (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 4l5 5L7 22l-5-5L15 4z" /><line x1="18" y1="2" x2="18" y2="5" /><line x1="22" y1="6" x2="19" y2="6" />
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Diamond: () => (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l4 6-10 13L2 9z" />
    </svg>
  ),
  Bolt: () => (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Home: () => (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Droplet: () => (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Zap: () => (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Car: () => (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="22" height="13" rx="2" />
      <path d="M16 8h.01M8 8h.01M5 16v3M19 16v3" />
    </svg>
  ),
  MapPin: () => (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Tree: () => (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7M8 17l4-4 4 4" />
    </svg>
  )
};

/* ─── Badges / Accroches Pro Immobilières ───────────────────────────────── */
const PRO_BADGES = [
  { id: 'coup_de_coeur',   label: 'Coup de Cœur',         tag: 'Coup de Cœur',         text: '[Coup de Cœur]',         icon: Icons.Star },
  { id: 'standing_luxe',   label: 'Haut Standing',        tag: 'Haut Standing',        text: '[Haut Standing]',        icon: Icons.Diamond },
  { id: 'dispo_immediat',  label: 'Dispo Immédiate',      tag: 'Dispo Immédiate',      text: '[Dispo Immédiate]',      icon: Icons.Bolt },
  { id: 'meuble_moderne',  label: 'Entièrement Meublé',   tag: 'Meublé & Équipé',      text: '[Meublé & Équipé]',      icon: Icons.Home },
  { id: 'forage_camwater', label: 'Forage + Camwater',    tag: 'Eau H24 Forage',       text: '[Eau H24 Forage]',       icon: Icons.Droplet },
  { id: 'securise_247',    label: 'Sécurisé 24/7',        tag: 'Sécurité 24/7',        text: '[Sécurité 24/7]',        icon: Icons.Shield },
  { id: 'compteur_indep',  label: 'Compteur Indépendant', tag: 'Compteur Dédié',       text: '[Compteur Dédié]',       icon: Icons.Zap },
  { id: 'parking_garde',   label: 'Parking Sécurisé',     tag: 'Parking Inclus',       text: '[Parking Inclus]',       icon: Icons.Car },
  { id: 'proche_goudron',  label: 'Accès Facile',         tag: 'Axe Principal',        text: '[Axe Principal]',        icon: Icons.MapPin },
  { id: 'quartier_calme',  label: 'Quartier Résidentiel', tag: 'Quartier Calme',       text: '[Quartier Calme]',       icon: Icons.Tree },
];

/* ─── Formateurs de durée sans NaN / Infinity ─────────────────────────── */
const fmt = (t = 0) => {
  if (!t || !isFinite(t) || isNaN(t) || t < 0) return '00:00.00';
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  const ms = Math.floor((t % 1) * 100);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
};

const fmtShort = (t = 0) => {
  if (!t || !isFinite(t) || isNaN(t) || t < 0) return '00:00';
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const SCSS = `
.studio-root-container {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 16px;
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  box-sizing: border-box;
}

/* Range Sliders */
.rs {
  -webkit-appearance: none;
  appearance: none;
  height: 5px;
  border-radius: 4px;
  outline: none;
  cursor: pointer;
  width: 100%;
  transition: background 0.15s ease;
}
.rs::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #D4AF37;
  cursor: ew-resize;
  box-shadow: 0 0 10px rgba(212,175,55,0.8);
  border: 2px solid #FFFFFF;
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.rs::-webkit-slider-thumb:hover, .rs::-webkit-slider-thumb:active {
  transform: scale(1.25);
  box-shadow: 0 0 14px rgba(212,175,55,1);
}
.rs::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #D4AF37;
  cursor: ew-resize;
  border: 2px solid #FFFFFF;
}

/* Tab Navigation Buttons */
.st-tab-btn {
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  touch-action: manipulation;
  white-space: nowrap;
}
.st-tab-btn:hover {
  filter: brightness(1.12);
  transform: translateY(-1px);
}
.st-tab-btn:active {
  transform: scale(0.96);
}

/* Interactive Badge Pills */
.pro-pill {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
}
.pro-pill:hover {
  border-color: #D4AF37 !important;
  transform: translateY(-1px);
}
.pro-pill:active {
  transform: scale(0.96);
}

@keyframes spinLoader { to { transform: rotate(360deg); } }
@keyframes pulsePlay { 0%, 100% { transform: scale(1); opacity: 0.9; } 50% { transform: scale(1.06); opacity: 1; filter: drop-shadow(0 0 14px rgba(212,175,55,0.7)); } }
@keyframes slideUpDrawer { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

/* ── Layout Mobile Grand Format avec Scrubber Flottant Intégré (max-width: 860px) ── */
@media (max-width: 860px) {
  .studio-root-container {
    padding: 0 !important;
  }
  .studio-card-wrapper {
    width: 100vw !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    border-radius: 0 !important;
    border: none !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
  }
  .studio-header-bar {
    padding: max(6px, env(safe-area-inset-top)) 10px 6px !important;
    flex-shrink: 0 !important;
  }
  .studio-tab-strip {
    width: 100% !important;
    height: auto !important;
    flex-direction: row !important;
    overflow-x: auto !important;
    padding: 4px 8px !important;
    gap: 5px !important;
    border-right: none !important;
    border-bottom: 1px solid var(--st-border) !important;
    flex-shrink: 0 !important;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .studio-tab-strip::-webkit-scrollbar {
    display: none;
  }
  .studio-tab-strip .st-tab-btn {
    min-width: auto !important;
    height: 30px !important;
    padding: 0 10px !important;
    font-size: 10.5px !important;
    border-radius: 999px !important;
    flex-direction: row !important;
    gap: 4px !important;
  }
  .studio-main-grid {
    flex-direction: column !important;
    flex: 1 1 auto !important;
    min-height: 0 !important;
    overflow: hidden !important;
  }
  /* L'image / vidéo prend le maximum absolu d'espace hero */
  .studio-canvas-area {
    flex: 1 1 auto !important;
    min-height: 280px !important;
    height: 62vh !important;
    max-height: 64vh !important;
    width: 100% !important;
    background: #000000 !important;
  }
  .studio-drawer-area {
    width: 100% !important;
    max-height: 185px !important;
    flex: 1 1 auto !important;
    border-left: none !important;
    border-top: 1px solid var(--st-border) !important;
    overflow-y: auto !important;
    padding: 8px 10px !important;
    -webkit-overflow-scrolling: touch;
  }
  .studio-bottom-bar {
    padding: 6px 10px max(8px, env(safe-area-inset-bottom)) !important;
    flex-shrink: 0 !important;
  }
}
`;

export default function StudioReelEditor({ prop, onClose, onPublish, onDelete, uploadingReel }) {
  const { t } = useTranslation();
  const [showGuideModal, setShowGuideModal] = useState(() => {
    try {
      return localStorage.getItem('piolo_reel_guide_seen') !== 'true';
    } catch (_) {
      return true;
    }
  });
  const [isDark, setIsDark] = useState(() => {
    try { 
      const saved = localStorage.getItem('piolo_studio_dark');
      return saved !== null ? saved === '1' : false;
    } catch { return false; }
  });

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      try { localStorage.setItem('piolo_studio_dark', next ? '1' : '0'); } catch (err) { void err; }
      return next;
    });
  };

  useEffect(() => {
    document.body.classList.add('reel-modal-open');
    return () => {
      document.body.classList.remove('reel-modal-open');
    };
  }, []);

  /* ── Refs ─────────────────────────────────────────────────────────── */
  const videoRef     = useRef(null);
  const fileInputRef = useRef(null);
  const procCanvas   = useRef(null);
  const animRef      = useRef(null);
  const chunksRef    = useRef([]);
  const audioCtxRef  = useRef(null);
  const audioSrcRef  = useRef(null);

  /* ── URL initiale (optimisée multi-plateforme & mobile) ──────────────── */
  const initUrl = prop?.video_reel ? getMediaUrl(prop.video_reel) : null;

  /* ── État ─────────────────────────────────────────────────────────── */
  const [previewUrl,   setPreviewUrl]   = useState(initUrl);
  const [pendingFile,  setPendingFile]  = useState(null);
  const [editsApplied, setEditsApplied] = useState(false);

  const [playing,      setPlaying]      = useState(false);
  const [muted,        setMuted]        = useState(false);
  const [duration,     setDuration]     = useState(0);
  const [currentTime,  setCurrentTime]  = useState(0);

  const [trimStart,    setTrimStart]    = useState(0);
  const [trimEnd,      setTrimEnd]      = useState(100);

  const [ratio,        setRatio]        = useState('9:16');
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 0.75x, 1x, 1.25x, 1.5x, 2x

  const [brightness,   setBrightness]   = useState(100);
  const [contrast,     setContrast]     = useState(100);
  const [saturation,   setSaturation]   = useState(100);
  const [isMirror,     setIsMirror]     = useState(false);

  // Outil actif ('badges' | 'crop' | 'trim' | 'speed' | 'filters' | 'mirror' | 'caption')
  const [activeTool,   setActiveTool]   = useState('badges');
  const [processing,   setProcessing]   = useState(false);
  const [progress,     setProgress]     = useState(0);
  
  // Description nettoyée automatiquement des émojis
  const [caption,      setCaption]      = useState(() => {
    const raw = prop?.reel_description || prop?.caption || '';
    return stripEmojis(raw);
  });

  const [toast,        setToast]        = useState({ msg: '', ok: true });
  const [errMsg,       setErrMsg]       = useState('');

  const hasEdits = !editsApplied && (
    trimStart !== 0 || trimEnd !== 100 ||
    brightness !== 100 || contrast !== 100 || saturation !== 100 ||
    isMirror || ratio !== '9:16' || playbackSpeed !== 1
  );

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: '', ok: true }), 3500);
  };

  /* ── Insertion / Toggle de Badge Pro ──────────────────────────────── */
  const handleInsertBadge = (badge) => {
    setCaption(prev => {
      const cleanPrev = stripEmojis(prev);
      if (cleanPrev.includes(badge.text)) {
        return cleanPrev.replace(badge.text, '').replace(/\n\n+/g, '\n').replace(/\s\s+/g, ' ').trim();
      }
      return cleanPrev ? `${cleanPrev} ${badge.text}` : badge.text;
    });
    showToast(`Accroche synchronisée : ${badge.label}`);
  };

  /* ── Application d'un filtre prédéfini ────────────────────────────── */
  const applyPreset = (p) => {
    setBrightness(p.b);
    setContrast(p.c);
    setSaturation(p.s);
    setEditsApplied(false);
    showToast(`Filtre appliqué : ${p.name}`);
  };

  /* ── Générateur intelligent de descriptions immobilières ──────────── */
  const applySmartTemplate = (type) => {
    const title = prop?.title || 'Bien immobilier de standing';
    let text = '';
    if (type === 'prestige') {
      text = `Découvrez ce joyau d'exception : ${title}. Espaces lumineux, finitions soignées et cadre privilégié. [${t('reels.badges.favorite', 'Coup de Cœur')}] [${t('reels.badges.high_standing', 'Haut Standing')}] #Immobilier #Luxe`;
    } else if (type === 'confort') {
      text = `Logement moderne et sécurisé : ${title}. Confort optimal, eau continue et autonomie énergétique garantie. [Sécurité 24/7] [Eau H24 Forage] #Location`;
    } else {
      text = `Disponible immédiatement : ${title}. Idéalement situé avec accès rapide aux commodités et parking sécurisé. [${t('reels.badges.immediate', 'Dispo Immédiate')}] [Parking Inclus] #Piolo`;
    }
    setCaption(text);
    showToast("Modèle d'accroche appliqué");
  };

  /* ── Import fichier vidéo ─────────────────────────────────────────── */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    const blobUrl = URL.createObjectURL(file);
    setPreviewUrl(blobUrl);
    setEditsApplied(false);
    setTrimStart(0); setTrimEnd(100);
    setBrightness(100); setContrast(100); setSaturation(100);
    setIsMirror(false); setPlaybackSpeed(1); setErrMsg('');
    showToast('Vidéo chargée avec succès');
  };

  /* ── Lecture / Pause & Contrôle de Vitesse ────────────────────────── */
  const handlePlayPause = (e) => {
    if (e) {
      e.stopPropagation();
    }
    if (!previewUrl) {
      fileInputRef.current?.click();
      return;
    }
    const v = videoRef.current;
    if (!v) return;
    if (playing) {
      v.pause();
    } else {
      v.playbackRate = playbackSpeed;
      const playPromise = v.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('[StudioReel] Play error:', err);
          // Fallback pour navigateurs mobiles restreignant la lecture avec son
          if (!v.muted) {
            v.muted = true;
            setMuted(true);
            v.play().catch(e2 => console.warn('[StudioReel] Muted play fallback error:', e2));
          }
        });
      }
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const handleSeek = (e) => {
    if (e) e.stopPropagation();
    const v = videoRef.current;
    if (!v || !duration || !isFinite(duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pos * duration;
  };

  /* ── Bornes de trim respectées pendant la lecture ─────────────────── */
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !duration || !isFinite(duration)) return;
    const check = () => {
      const st = (trimStart / 100) * duration;
      const et = (trimEnd   / 100) * duration;
      if (v.currentTime < st) v.currentTime = st;
      if (v.currentTime > et) { v.pause(); v.currentTime = st; }
    };
    v.addEventListener('timeupdate', check);
    return () => v.removeEventListener('timeupdate', check);
  }, [trimStart, trimEnd, duration]);

  useEffect(() => { if (videoRef.current) videoRef.current.muted = muted; }, [muted]);

  /* ── Traitement Canvas + MediaRecorder ───────────────────────────── */
  const processVideo = useCallback(() => new Promise((resolve, reject) => {
    (async () => {
      const canvas = procCanvas.current;
      const video  = videoRef.current;
      if (!canvas || !video) { reject(new Error('Composants vidéo non initialisés')); return; }

      const currentSrc = video.src || video.currentSrc || '';
      if (currentSrc && !currentSrc.startsWith('blob:')) {
        setProgress(3);
        try {
          const res = await fetch(currentSrc, { mode: 'cors', credentials: 'omit' });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const blob = await res.blob();
          const localUrl = URL.createObjectURL(blob);
          video.src = localUrl;
          video.load();
          await new Promise((ok) => {
            const t = setTimeout(ok, 10000);
            const onReady = () => { clearTimeout(t); video.removeEventListener('canplay', onReady); video.removeEventListener('loadeddata', onReady); ok(); };
            video.addEventListener('canplay', onReady, { once: true });
            video.addEventListener('loadeddata', onReady, { once: true });
          });
        } catch (fetchErr) {
          console.warn('[StudioReel] fetch blob:', fetchErr.message);
        }
      }

      setProgress(6);
      const r = RATIOS[ratio] || RATIOS['9:16'];
      canvas.width  = r.w;
      canvas.height = r.h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Moteur Canvas non disponible')); return; }

      const dur0 = isFinite(video.duration) && video.duration > 0 ? video.duration : (duration > 0 ? duration : 15);
      const tStart = (trimStart / 100) * dur0;
      const tEnd   = (trimEnd   / 100) * dur0;
      const dur    = Math.max(0.1, tEnd - tStart);

      // Recadrage centré selon le ratio cible
      const vw  = video.videoWidth  || 1280;
      const vh  = video.videoHeight || 720;
      const tAR = r.w / r.h;
      const sAR = vw / vh;
      let srcX = 0, srcY = 0, srcW = vw, srcH = vh;
      if      (sAR > tAR) { srcW = Math.round(vh * tAR); srcX = Math.round((vw - srcW) / 2); }
      else if (sAR < tAR) { srcH = Math.round(vw / tAR); srcY = Math.round((vh - srcH) / 2); }

      // Stream & Audio configuration
      const cs = canvas.captureStream(30);
      let stream = cs;
      try {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
          audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
          audioSrcRef.current = null;
        }
        if (!audioSrcRef.current) {
          audioSrcRef.current = audioCtxRef.current.createMediaElementSource(video);
        }
        const aDest = audioCtxRef.current.createMediaStreamDestination();
        audioSrcRef.current.connect(aDest);
        audioSrcRef.current.connect(audioCtxRef.current.destination);
        if (audioCtxRef.current.state === 'suspended') await audioCtxRef.current.resume();
        stream = new MediaStream([...cs.getVideoTracks(), ...aDest.stream.getAudioTracks()]);
      } catch (aErr) {
        console.warn('[StudioReel] Flux audio:', aErr.message);
        stream = cs;
      }

      const TYPES = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8,opus', 'video/webm;codecs=vp8', 'video/webm'];
      const mime  = TYPES.find(t => { try { return MediaRecorder.isTypeSupported(t); } catch { return false; } }) || 'video/webm';
      chunksRef.current = [];
      let recorder;
      try { recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4_500_000 }); }
      catch  { recorder = new MediaRecorder(stream); }

      recorder.ondataavailable = e => { if (e.data?.size > 0) chunksRef.current.push(e.data); };
      recorder.onerror = e => reject(new Error(`Encodage : ${e.error?.message || 'Erreur'}`));
      recorder.onstop = () => {
        cancelAnimationFrame(animRef.current);
        const totalBytes = chunksRef.current.reduce((s, c) => s + c.size, 0);
        if (totalBytes < 2000) {
          reject(new Error("Le flux généré est incomplet."));
          setProcessing(false);
          return;
        }
        const blob = new Blob(chunksRef.current, { type: mime });
        const file = new File([blob], `reel-${Date.now()}.webm`, { type: mime });
        const url  = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setPendingFile(file);
        setEditsApplied(true);
        setProcessing(false);
        setProgress(100);
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.src = url;
          videoRef.current.load();
          videoRef.current.currentTime = 0;
        }
        resolve(file);
      };

      const doRecord = () => {
        try { recorder.start(250); } catch (e) { reject(e); return; }
        video.muted = true;
        video.playbackRate = playbackSpeed;

        const tryPlay = () => video.play().then(() => {
          const draw = () => {
            const ct = video.currentTime;
            if (ct >= tEnd - 0.05 || video.ended || video.paused) {
              video.pause();
              if (recorder.state === 'recording') recorder.stop();
              return;
            }
            setProgress(Math.max(6, Math.min(98, ((ct - tStart) / dur) * 100)));
            ctx.save();
            ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
            if (isMirror) { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);
            ctx.restore();
            animRef.current = requestAnimationFrame(draw);
          };
          animRef.current = requestAnimationFrame(draw);
        }).catch(err => {
          if (err.name === 'NotSupportedError' || err.name === 'NotAllowedError') {
            video.addEventListener('canplay', tryPlay, { once: true });
          } else {
            if (recorder.state === 'recording') recorder.stop();
            reject(err);
          }
        });

        tryPlay();
      };

      if (Math.abs(video.currentTime - tStart) < 0.12) {
        doRecord();
      } else {
        video.currentTime = tStart;
        const onSk = () => { video.removeEventListener('seeked', onSk); doRecord(); };
        video.addEventListener('seeked', onSk);
      }
    })().catch(reject);
  }), [ratio, trimStart, trimEnd, brightness, contrast, saturation, isMirror, duration, playbackSpeed]);

  /* ── Appliquer modifications ───────────────────────────────────────── */
  const handleApply = async () => {
    const v = videoRef.current;
    if (!previewUrl && !(v?.src)) { showToast("Veuillez charger une vidéo.", false); return; }
    setProcessing(true); setProgress(1); setErrMsg('');
    try {
      await processVideo();
      showToast("Modifications appliquées avec succès");
    } catch (err) {
      console.error('[StudioReel] error:', err);
      setErrMsg(err.message);
      setProcessing(false);
      setProgress(0);
    }
  };

  /* ── Publier ──────────────────────────────────────────────────────── */
  const handlePublish = async (e) => {
    if (e) e.preventDefault();
    if (!previewUrl && !pendingFile) { showToast('Veuillez importer une vidéo avant de publier.', false); return; }
    const cleanCaption = stripEmojis(caption);
    if (hasEdits) {
      setProcessing(true); setProgress(0);
      try {
        const file = await processVideo();
        onPublish(file, cleanCaption);
      } catch (err) {
        setErrMsg(`Erreur de rendu : ${err.message}`);
        setProcessing(false);
      }
    } else {
      onPublish(pendingFile, cleanCaption);
    }
  };

  const resetFilters = () => { setBrightness(100); setContrast(100); setSaturation(100); setIsMirror(false); setEditsApplied(false); };
  const resetTrim    = () => { setTrimStart(0); setTrimEnd(100); setEditsApplied(false); };

  const vf = {
    filter:    `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
    transform: isMirror ? 'scaleX(-1)' : 'none',
  };

  /* ── Palettes de couleurs Ultra-Pro ────────────────────────────────── */
  const T = isDark ? {
    bgOverlay: 'rgba(5, 5, 6, 0.96)',
    cardBg: '#0E0D0C',
    cardBorder: 'rgba(212,175,55, 0.3)',
    headerBg: '#141311',
    panelBg: '#12110F',
    toolbarBg: '#141311',
    videoBg: '#050505',
    timelineBg: '#141311',
    footerBg: '#141311',
    border: 'rgba(255,255,255, 0.08)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255, 0.75)',
    textMuted: 'rgba(255,255,255, 0.42)',
    btnDefaultBg: 'rgba(255,255,255, 0.06)',
    inputBg: 'rgba(0,0,0, 0.5)',
    inputBorder: 'rgba(255,255,255, 0.12)',
    boxShadow: '0 32px 80px rgba(0,0,0, 0.95)',
    badgeBg: 'rgba(212,175,55, 0.14)',
    badgeBorder: 'rgba(212,175,55, 0.35)',
  } : {
    bgOverlay: 'rgba(15, 13, 9, 0.55)',
    cardBg: '#FFFFFF',
    cardBorder: 'rgba(212,175,55, 0.32)',
    headerBg: '#FFFFFF',
    panelBg: '#FDFBF7',
    toolbarBg: '#FFFFFF',
    videoBg: '#0B0907',
    timelineBg: '#F7F5F0',
    footerBg: '#FFFFFF',
    border: 'rgba(212,175,55, 0.18)',
    textPrimary: '#0F0D09',
    textSecondary: '#5A544B',
    textMuted: '#9B9690',
    btnDefaultBg: '#F7F5F0',
    inputBg: '#FFFFFF',
    inputBorder: '#E8E3DA',
    boxShadow: '0 25px 70px rgba(212,175,55, 0.18), 0 10px 30px rgba(0,0,0,0.08)',
    badgeBg: 'rgba(212,175,55, 0.12)',
    badgeBorder: 'rgba(212,175,55, 0.35)',
  };

  /* ── Barre d'outils mobile ─────────────────────────────────────────── */
  const TOOLS = [
    { id: 'badges',  lbl: 'Accroches Pro', short: 'Badges',   Icon: Icons.Tag },
    { id: 'crop',    lbl: 'Format & Ratio', short: 'Format',  Icon: Icons.Crop },
    { id: 'trim',    lbl: 'Découpage',     short: 'Couper',   Icon: Icons.Scissors },
    { id: 'speed',   lbl: 'Vitesse',       short: `${playbackSpeed}x`, Icon: Icons.Speed },
    { id: 'filters', lbl: 'Filtres',       short: 'Filtres',  Icon: Icons.Sliders },
    { id: 'mirror',  lbl: t('reels.mirror'),        short: t('reels.mirror'),   Icon: Icons.Flip },
    { id: 'caption', lbl: 'Légende & Bio', short: 'Légende',  Icon: Icons.TextEdit },
  ];

  const activeBadgesCount = PRO_BADGES.filter(b => caption.includes(b.text)).length;

  return (
    <div className="studio-root-container" style={{ background: T.bgOverlay, backdropFilter: 'blur(24px)' }}>
      <style>{SCSS}</style>
      <canvas ref={procCanvas} style={{ display: 'none' }} />

      <div className="studio-card-wrapper" style={{ width: '100%', maxWidth: 1060, borderRadius: 20, background: T.cardBg, border: `1.5px solid ${T.cardBorder}`, boxShadow: T.boxShadow, display: 'flex', flexDirection: 'column', maxHeight: '96vh', overflow: 'hidden' }}>

        {/* ══ 1. HEADER (Instagram / CapCut Studio Style) ══ */}
        <div className="studio-header-bar" style={{ padding: '10px 16px', background: T.headerBg, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexShrink: 0 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <div style={{ background: 'linear-gradient(135deg,#D4AF37,#F6D365)', borderRadius: 8, padding: '5px 10px', fontSize: 10.5, fontWeight: 900, letterSpacing: 0.8, color: '#0B0908', textTransform: 'uppercase', fontFamily: "'Poppins',sans-serif", display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 2px 8px rgba(212,175,55,0.3)', flexShrink: 0 }}>
              <Icons.Reel />
              <span>{t('reels.studio_title')}</span>
            </div>
            <span style={{ color: T.textMuted, fontSize: 12 }}>/</span>
            <span style={{ color: T.textPrimary, fontSize: 12.5, fontWeight: 700, fontFamily: "'Poppins',sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
              {prop?.title || 'Édition Reel'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              title="Guide & Conseils Pro"
              style={{
                border: '1px solid rgba(212,175,55,0.4)',
                background: 'rgba(212,175,55,0.12)',
                color: '#F6D365',
                borderRadius: 8,
                padding: '0 10px',
                height: 34,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11.5,
                fontWeight: 700,
                fontFamily: "'Poppins', sans-serif",
                transition: 'all .2s'
              }}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Guide Pro</span>
            </button>

            <button
              type="button"
              onClick={() => setMuted(m => !m)}
              title={muted ? "Activer le son" : "Couper le son"}
              style={{ border: `1px solid ${T.border}`, background: T.btnDefaultBg, color: muted ? '#D4AF37' : T.textSecondary, borderRadius: 8, width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}
            >
              {muted ? <Icons.VolumeMute /> : <Icons.VolumeUp />}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? "Mode clair" : "Mode sombre"}
              style={{ border: `1px solid ${T.border}`, background: T.btnDefaultBg, color: T.textPrimary, borderRadius: 8, width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}
            >
              {isDark ? <Icons.Sun /> : <Icons.Moon />}
            </button>

            <button
              type="button"
              onClick={onClose}
              title="Fermer"
              style={{ border: `1px solid ${T.border}`, background: T.btnDefaultBg, color: T.textSecondary, borderRadius: 8, width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}
            >
              <Icons.Close />
            </button>
          </div>
        </div>

        {/* ══ 2. NAVIGATION PAR ONGLETS D'OUTILS ══ */}
        <div className="studio-tab-strip" style={{ background: T.toolbarBg, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', padding: '6px 12px', gap: 6, flexShrink: 0 }}>
          {TOOLS.map(t => {
            const IconComp = t.Icon;
            const isActive = activeTool === t.id;
            return (
              <button
                key={t.id}
                type="button"
                className="st-tab-btn"
                onClick={() => setActiveTool(t.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 20,
                  border: isActive ? '1px solid #D4AF37' : `1px solid ${T.border}`,
                  background: isActive ? 'linear-gradient(135deg,#D4AF37,#F6D365)' : T.btnDefaultBg,
                  color: isActive ? '#0B0908' : T.textPrimary,
                  fontWeight: isActive ? 800 : 600,
                  fontSize: 11.5,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: isActive ? '0 2px 10px rgba(212,175,55,0.35)' : 'none'
                }}
              >
                <IconComp />
                <span>{t.short}</span>
                {t.id === 'badges' && activeBadgesCount > 0 && (
                  <span style={{ background: isActive ? '#0B0908' : '#D4AF37', color: isActive ? '#D4AF37' : '#0B0908', borderRadius: '50%', width: 15, height: 15, fontSize: 9, fontWeight: 900, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    {activeBadgesCount}
                  </span>
                )}
              </button>
            );
          })}

          <div style={{ position: 'relative', marginLeft: 'auto', flexShrink: 0 }}>
            <button
              type="button"
              className="st-tab-btn"
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '7px 14px',
                borderRadius: 20,
                border: '1.5px dashed #D4AF37',
                background: T.badgeBg,
                color: '#D4AF37',
                fontWeight: 700,
                fontSize: 11.5,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Icons.Upload />
              <span>{t('reels.change_clip')}</span>
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="video/*" 
              onChange={handleFileChange} 
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 5 }} 
            />
          </div>
        </div>

        {/* ══ 3. CORPS PRINCIPAL : VIDÉO GRAND FORMAT AVEC BARRE FLOTTANTE INTÉGRÉE ══ */}
        <div className="studio-main-grid" style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

          {/* A. Zone Vidéo Hero Grand Format */}
          <div className="studio-canvas-area" style={{ flex: 1, background: T.videoBg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', minWidth: 0, cursor: 'pointer' }} onClick={handlePlayPause}>

            {activeTool === 'crop' && (
              <div style={{ position: 'absolute', inset: '6%', zIndex: 6, pointerEvents: 'none', border: '2px solid #D4AF37',
                backgroundImage: 'linear-gradient(rgba(212,175,55,.25) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,.25) 1px,transparent 1px)',
                backgroundSize: '33.33% 33.33%', boxShadow: '0 0 0 9999px rgba(0,0,0,.6)' }} />
            )}

            {previewUrl ? (
              <video
                ref={videoRef}
                src={previewUrl}
                loop
                muted={muted}
                playsInline
                webkit-playsinline="true"
                x5-playsinline="true"
                preload="auto"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block', ...vf }}
                onTimeUpdate={e => {
                  const ct = e.target.currentTime;
                  if (isFinite(ct)) setCurrentTime(ct);
                }}
                onLoadedMetadata={e => {
                  const d = e.target.duration;
                  if (isFinite(d) && d > 0) setDuration(d);
                }}
                onDurationChange={e => {
                  const d = e.target.duration;
                  if (isFinite(d) && d > 0) setDuration(d);
                }}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              />
            ) : (
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                style={{ 
                  textAlign: 'center', 
                  color: T.textMuted, 
                  padding: '28px 22px', 
                  cursor: 'pointer',
                  borderRadius: 20,
                  background: 'rgba(212,175,55,0.05)',
                  border: '1.5px dashed rgba(212,175,55,0.45)',
                  transition: 'all 0.2s ease',
                  maxWidth: 320,
                  margin: '0 auto',
                  userSelect: 'none'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#D4AF37';
                  e.currentTarget.style.background = 'rgba(212,175,55,0.1)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(212,175,55,0.45)';
                  e.currentTarget.style.background = 'rgba(212,175,55,0.05)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <div style={{ color: '#D4AF37', marginBottom: 12, display: 'flex', justifyContent: 'center', opacity: 0.9 }}>
                  <Icons.VideoCamera />
                </div>
                <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 15, fontWeight: 700, color: '#D4AF37', margin: '0 0 6px' }}>{t('reels.no_clip')}</p>
                <p style={{ fontSize: 12, margin: '0 0 14px', color: T.textSecondary, lineHeight: 1.45 }}>{t('reels.no_clip_hint', 'Cliquez ici ou sur "Changer clip" pour charger une vidéo')}</p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 20, background: 'linear-gradient(135deg, #D4AF37, #F6D365)', color: '#0B0908', fontWeight: 800, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 0.5, boxShadow: '0 2px 8px rgba(212,175,55,0.3)' }}>
                  <Icons.Upload />
                  <span>Importer un clip</span>
                </span>
              </div>
            )}

            {/* Bouton Play central pulsant lorsque la vidéo est en pause */}
            {previewUrl && !playing && !processing && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.18)', pointerEvents: 'none' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(12,10,8,0.85)', backdropFilter: 'blur(10px)', border: '2px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', animation: 'pulsePlay 2s infinite ease-in-out' }}>
                  <Icons.Play />
                </div>
              </div>
            )}

            {/* Floating Tags : Ratio + Vitesse + {t('reels.mirror')} */}
            <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, zIndex: 10, pointerEvents: 'none' }}>
              <div style={{ background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(10px)', borderRadius: 20, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5, border: '1px solid rgba(255,255,255,.15)' }}>
                <span style={{ color: '#D4AF37', display: 'flex' }}><Icons.Crop /></span>
                <span style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 800, fontFamily: "'Poppins',sans-serif" }}>{RATIOS[ratio]?.short || ratio}</span>
              </div>
              {playbackSpeed !== 1 && (
                <div style={{ background: 'rgba(212,175,55,.25)', border: '1px solid rgba(212,175,55,.7)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '4px 9px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#D4AF37', fontSize: 10, fontWeight: 900 }}>{playbackSpeed}x</span>
                </div>
              )}
              {isMirror && (
                <div style={{ background: 'rgba(212,175,55,.2)', border: '1px solid rgba(212,175,55,.6)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '4px 9px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#D4AF37', display: 'flex' }}><Icons.Flip /></span>
                  <span style={{ color: '#D4AF37', fontSize: 10, fontWeight: 800 }}>{t('reels.mirror')}</span>
                </div>
              )}
            </div>

            {/* ══ BARRE DE LECTURE FLOTTANTE DIRECTEMENT INTÉGRÉE EN BAS DE LA VIDÉO ══ */}
            {previewUrl && (
              <div
                className="studio-video-control-bar"
                onClick={e => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  right: 12,
                  zIndex: 20,
                  background: 'rgba(10, 9, 8, 0.78)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderRadius: 24,
                  padding: '6px 14px',
                  border: '1px solid rgba(212, 175, 55, 0.32)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.65)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                {/* Bouton Restart (|<) */}
                <button
                  type="button"
                  title={t('reels.restart', 'Revenir au début')}
                  onClick={() => { if (videoRef.current && duration) videoRef.current.currentTime = (trimStart / 100) * duration; }}
                  style={{
                    border: 0,
                    background: 'none',
                    color: 'rgba(255,255,255,0.75)',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.15s, transform 0.15s'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#D4AF37')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
                >
                  <Icons.SkipBack />
                </button>

                {/* Bouton Play/Pause Circulaire Doré */}
                <button
                  type="button"
                  onClick={handlePlayPause}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'linear-gradient(135deg, #E5B23B, #D4AF37)',
                    color: '#0B0908',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 16px rgba(229, 178, 59, 0.55), 0 2px 6px rgba(0,0,0,0.4)',
                    flexShrink: 0,
                    transition: 'transform 0.15s, box-shadow 0.15s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.08)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(229, 178, 59, 0.8), 0 3px 8px rgba(0,0,0,0.5)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 0 16px rgba(229, 178, 59, 0.55), 0 2px 6px rgba(0,0,0,0.4)';
                  }}
                >
                  {playing ? <Icons.Pause /> : <Icons.Play />}
                </button>

                {/* Horodatage actuel (ex: 00:00.91) */}
                <span style={{ color: '#FFFFFF', fontSize: 12, fontFamily: "'JetBrains Mono', Consolas, Monaco, monospace", fontWeight: 800, letterSpacing: 0.5, flexShrink: 0 }}>
                  {fmt(currentTime)}
                </span>

                {/* Track Bar Interactive & Barre de Découpage */}
                <div
                  style={{
                    flex: 1,
                    position: 'relative',
                    height: 8,
                    background: 'rgba(215, 202, 170, 0.35)',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                  onClick={handleSeek}
                >
                  {/* Zone de Trim actif */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: `${trimStart}%`,
                      width: `${trimEnd - trimStart}%`,
                      background: 'rgba(212, 175, 55, 0.4)',
                      borderLeft: '2px solid #D4AF37',
                      borderRight: '2px solid #D4AF37',
                      borderRadius: 2
                    }}
                  />
                  
                  {/* Progression de lecture */}
                  <div
                    style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #D4AF37, #F6D365)',
                      borderRadius: 4,
                      width: `${(duration && isFinite(duration)) ? (currentTime / duration) * 100 : 0}%`
                    }}
                  />

                  {/* Curseur Scrubber Doré */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: '#E5B23B',
                      boxShadow: '0 0 10px rgba(229, 178, 59, 0.9)',
                      border: '2.5px solid #FFFFFF',
                      left: `${(duration && isFinite(duration)) ? (currentTime / duration) * 100 : 0}%`,
                      pointerEvents: 'none'
                    }}
                  />
                </div>

                {/* Durée totale (ex: 00:31) */}
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11.5, fontFamily: "'JetBrains Mono', Consolas, Monaco, monospace", fontWeight: 700, letterSpacing: 0.3, flexShrink: 0 }}>
                  {fmtShort(duration)}
                </span>
              </div>
            )}

            {/* Overlay Rendu */}
            {processing && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,5,4,.95)', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, zIndex: 30, padding: 20 }}>
                <div style={{ width: 54, height: 54, borderRadius: '50%', border: '4px solid rgba(212,175,55,.2)', borderTopColor: '#D4AF37', animation: 'spinLoader .8s linear infinite' }} />
                <div style={{ textAlign: 'center', width: '100%', maxWidth: 280 }}>
                  <p style={{ color: '#D4AF37', fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 14, margin: '0 0 10px' }}>
                    {progress < 5 ? 'Chargement…' : progress < 15 ? 'Calibrage…' : progress < 97 ? 'Encodage haute fidélité…' : 'Finalisation…'}
                  </p>
                  <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,.1)', borderRadius: 3, overflow: 'hidden', margin: '0 auto' }}>
                    <div style={{ height: '100%', background: 'linear-gradient(90deg,#D4AF37,#F6D365)', borderRadius: 3, width: `${progress}%`, transition: 'width .2s ease-out' }} />
                  </div>
                  <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 11, margin: '8px 0 0', fontWeight: 600 }}>
                    {Math.round(progress)}% • Rendu {ratio} @ {playbackSpeed}x
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* B. Tiroir Contextuel des Contrôles */}
          <div className="studio-drawer-area" style={{ width: 300, background: T.panelBg, borderLeft: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', padding: '14px 14px', gap: 12, overflowY: 'auto', flexShrink: 0, animation: 'slideUpDrawer 0.25s ease' }}>

            {/* 1. ONGLETS BADGES PRO */}
            {activeTool === 'badges' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#D4AF37', display: 'flex' }}><Icons.Tag /></span>
                    <h4 style={{ color: '#D4AF37', fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .6, margin: 0, fontFamily: "'Poppins',sans-serif" }}>
                      Accroches Immobilières
                    </h4>
                  </div>
                  <span style={{ fontSize: 9.5, color: '#D4AF37', background: T.badgeBg, border: `1px solid ${T.badgeBorder}`, padding: '2px 7px', borderRadius: 6, fontWeight: 800 }}>
                    {activeBadgesCount} / {PRO_BADGES.length}
                  </span>
                </div>
                <p style={{ color: T.textSecondary, fontSize: 11, margin: '0 0 10px', lineHeight: 1.4 }}>
                  Touchez les pastilles pour certifier les atouts de votre bien en 1 clic :
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {PRO_BADGES.map(badge => {
                    const isAdded = caption.includes(badge.text);
                    const BadgeIcon = badge.icon;
                    return (
                      <button
                        key={badge.id}
                        type="button"
                        onClick={() => handleInsertBadge(badge)}
                        className="pro-pill"
                        style={{
                          padding: '7px 11px',
                          borderRadius: 20,
                          fontSize: 11.5,
                          fontWeight: isAdded ? 800 : 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          border: isAdded ? '1.5px solid #D4AF37' : `1px solid ${T.border}`,
                          background: isAdded ? T.badgeBg : T.cardBg,
                          color: isAdded ? '#D4AF37' : T.textPrimary,
                          boxShadow: isAdded ? '0 2px 10px rgba(212,175,55,0.2)' : 'none'
                        }}
                      >
                        <BadgeIcon />
                        <span>{badge.label}</span>
                        <span style={{ fontSize: 11, fontWeight: 900, color: isAdded ? '#D4AF37' : T.textMuted }}>
                          {isAdded ? '✓' : '+'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. ONGLET FORMAT & RATIOS */}
            {activeTool === 'crop' && (
              <div>
                <h4 style={{ color: '#D4AF37', fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .6, margin: '0 0 10px', fontFamily: "'Poppins',sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icons.Crop />
                  <span>{t('reels.aspect_ratio')}</span>
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {Object.entries(RATIOS).map(([k, v]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => { setRatio(k); setEditsApplied(false); }}
                      style={{
                        padding: '10px 10px',
                        borderRadius: 10,
                        cursor: 'pointer',
                        textAlign: 'left',
                        border: ratio === k ? '1.5px solid #D4AF37' : `1px solid ${T.border}`,
                        background: ratio === k ? T.badgeBg : T.cardBg,
                        color: ratio === k ? '#D4AF37' : T.textPrimary,
                        transition: 'all .2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 13 }}>{k}</span>
                        {ratio === k && <Icons.Check />}
                      </div>
                      <div style={{ fontSize: 9.5, opacity: 0.75, lineHeight: 1.2 }}>{v.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. ONGLET DECOUPAGE (TRIM) */}
            {activeTool === 'trim' && (
              <div>
                <h4 style={{ color: '#D4AF37', fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .6, margin: '0 0 12px', fontFamily: "'Poppins',sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icons.Scissors />
                  <span>{t('reels.trim')}</span>
                </h4>
                
                <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                  {[
                    { label: '5s', pct: 15 },
                    { label: '10s', pct: 33 },
                    { label: '15s', pct: 50 },
                    { label: 'Max (30s)', pct: 100 },
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => { setTrimStart(0); setTrimEnd(p.pct); setEditsApplied(false); }}
                      style={{ flex: 1, padding: '5px 0', borderRadius: 6, border: `1px solid ${T.border}`, background: T.btnDefaultBg, color: T.textPrimary, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {[
                  { lbl: 'Début séquence', val: trimStart, min: 0, max: trimEnd - 1, set: (v) => { setTrimStart(v); setEditsApplied(false); if (videoRef.current && duration) videoRef.current.currentTime = (v / 100) * duration; } },
                  { lbl: 'Fin séquence', val: trimEnd, min: trimStart + 1, max: 100, set: (v) => { setTrimEnd(v); setEditsApplied(false); } },
                ].map(f => (
                  <div key={f.lbl} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: T.textSecondary, fontSize: 11, fontWeight: 600 }}>{f.lbl}</span>
                      <span style={{ color: '#D4AF37', fontSize: 11.5, fontWeight: 800, fontFamily: 'monospace' }}>
                        {duration > 0 ? `${((f.val / 100) * duration).toFixed(1)}s` : `${f.val}%`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={f.min}
                      max={f.max}
                      value={f.val}
                      className="rs"
                      style={{ background: `linear-gradient(90deg, #D4AF37 ${((f.val - f.min) / (f.max - f.min)) * 100}%, rgba(0,0,0,.15) ${((f.val - f.min) / (f.max - f.min)) * 100}%)` }}
                      onChange={e => f.set(Number(e.target.value))}
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={resetTrim}
                  style={{ width: '100%', padding: '7px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.btnDefaultBg, color: T.textSecondary, cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 4 }}
                >
                  <Icons.Refresh />
                  <span>{t('reels.reset_bounds')}</span>
                </button>
              </div>
            )}

            {/* 4. ONGLET VITESSE DE LECTURE */}
            {activeTool === 'speed' && (
              <div>
                <h4 style={{ color: '#D4AF37', fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .6, margin: '0 0 10px', fontFamily: "'Poppins',sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icons.Speed />
                  <span>{t('reels.speed')}</span>
                </h4>
                <p style={{ color: T.textSecondary, fontSize: 11, margin: '0 0 12px', lineHeight: 1.4 }}>
                  Accélérez la vidéo pour une visite dynamique ou ralentissez pour apprécier les finitions :
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 12 }}>
                  {[0.75, 1, 1.25, 1.5, 2].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { setPlaybackSpeed(s); setEditsApplied(false); }}
                      style={{
                        padding: '10px 0',
                        borderRadius: 8,
                        border: playbackSpeed === s ? '1.5px solid #D4AF37' : `1px solid ${T.border}`,
                        background: playbackSpeed === s ? T.badgeBg : T.cardBg,
                        color: playbackSpeed === s ? '#D4AF37' : T.textPrimary,
                        fontFamily: "'Poppins',sans-serif",
                        fontWeight: 800,
                        fontSize: 12,
                        cursor: 'pointer',
                        transition: 'all .2s'
                      }}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
                <div style={{ padding: '8px 10px', background: T.badgeBg, borderRadius: 8, border: `1px solid ${T.badgeBorder}` }}>
                  <div style={{ color: '#D4AF37', fontSize: 10, fontWeight: 700 }}>{t('reels.pro_tip')}</div>
                  <div style={{ color: T.textSecondary, fontSize: 10.5, lineHeight: 1.35, marginTop: 2 }}>
                    Une vitesse de <strong>1.25x</strong> ou <strong>1.5x</strong> offre un rythme idéal pour captiver les locataires sur mobile.
                  </div>
                </div>
              </div>
            )}

            {/* 5. ONGLET FILTRES & ÉTALONNAGE COLORIMÉTRIQUE */}
            {activeTool === 'filters' && (
              <div>
                <h4 style={{ color: '#D4AF37', fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .6, margin: '0 0 10px', fontFamily: "'Poppins',sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icons.Sliders />
                  <span>{t('reels.filters')}</span>
                </h4>

                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 12, scrollbarWidth: 'none' }}>
                  {FILTER_PRESETS.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 16,
                        border: `1px solid ${T.border}`,
                        background: T.cardBg,
                        color: T.textPrimary,
                        fontSize: 10.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                {[
                  { lbl: 'Luminosité', val: brightness, set: v => { setBrightness(v); setEditsApplied(false); }, min: 50,  max: 200 },
                  { lbl: 'Contraste',   val: contrast,   set: v => { setContrast(v);   setEditsApplied(false); }, min: 50,  max: 200 },
                  { lbl: 'Saturation', val: saturation, set: v => { setSaturation(v); setEditsApplied(false); }, min: 0,   max: 300 },
                ].map(f => (
                  <div key={f.lbl} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: T.textSecondary, fontSize: 11, fontWeight: 600 }}>{f.lbl}</span>
                      <span style={{ color: f.val === 100 ? T.textMuted : '#D4AF37', fontSize: 11, fontWeight: 800 }}>{f.val}%</span>
                    </div>
                    <input
                      type="range"
                      min={f.min}
                      max={f.max}
                      value={f.val}
                      className="rs"
                      style={{ background: `linear-gradient(90deg,#D4AF37 ${((f.val - f.min) / (f.max - f.min)) * 100}%,rgba(0,0,0,.15) ${((f.val - f.min) / (f.max - f.min)) * 100}%)` }}
                      onChange={e => f.set(Number(e.target.value))}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={resetFilters}
                  style={{ width: '100%', padding: '7px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.btnDefaultBg, color: T.textSecondary, cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                >
                  <Icons.Refresh />
                  <span>{t('reels.reset_filters')}</span>
                </button>
              </div>
            )}

            {/* 6. ONGLET MIROIR */}
            {activeTool === 'mirror' && (
              <div>
                <h4 style={{ color: '#D4AF37', fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .6, margin: '0 0 10px', fontFamily: "'Poppins',sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icons.Flip />
                  <span>Orientation {t('reels.mirror')}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => { setIsMirror(m => !m); setEditsApplied(false); }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontSize: 12,
                    fontWeight: 800,
                    border: isMirror ? '1.5px solid #D4AF37' : `1px solid ${T.border}`,
                    background: isMirror ? T.badgeBg : T.cardBg,
                    color: isMirror ? '#D4AF37' : T.textPrimary,
                    transition: 'all .2s'
                  }}
                >
                  <Icons.Flip />
                  <span>{isMirror ? `Active (Inversed)` : 'Activer l’inversion horizontale'}</span>
                </button>
              </div>
            )}

            {/* 7. ONGLET LÉGENDE & MODÈLES IA PRO */}
            {activeTool === 'caption' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h4 style={{ color: '#D4AF37', fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .6, margin: 0, fontFamily: "'Poppins',sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icons.TextEdit />
                    <span>{t('reels.desc_templates')}</span>
                  </h4>
                </div>

                {/* Modèles d'accroches en 1 Clic */}
                <div style={{ display: 'flex', gap: 5, marginBottom: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
                  <button
                    type="button"
                    onClick={() => applySmartTemplate('prestige')}
                    style={{ padding: '4px 8px', borderRadius: 12, border: `1px solid ${T.badgeBorder}`, background: T.badgeBg, color: '#D4AF37', fontSize: 10, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Icons.Wand />
                    <span>Modèle Prestige</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applySmartTemplate('confort')}
                    style={{ padding: '4px 8px', borderRadius: 12, border: `1px solid ${T.badgeBorder}`, background: T.badgeBg, color: '#D4AF37', fontSize: 10, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    Modèle Confort
                  </button>
                  <button
                    type="button"
                    onClick={() => applySmartTemplate('dispo')}
                    style={{ padding: '4px 8px', borderRadius: 12, border: `1px solid ${T.badgeBorder}`, background: T.badgeBg, color: '#D4AF37', fontSize: 10, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    Modèle Express
                  </button>
                </div>

                <textarea
                  rows="3"
                  value={caption}
                  onChange={e => setCaption(stripEmojis(e.target.value))}
                  placeholder={`Ex: Superbe appartement moderne avec vue dégagée — [Disponible Immédiatement] [${t('reels.badges.high_standing', 'Haut Standing')}]`}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: T.inputBg,
                    border: `1px solid ${T.inputBorder}`,
                    borderRadius: 10,
                    padding: '8px 10px',
                    color: T.textPrimary,
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: 12,
                    outline: 'none',
                    resize: 'none',
                    caretColor: '#D4AF37',
                    marginBottom: 8,
                    transition: 'border-color .2s'
                  }}
                  onFocus={e => (e.target.style.borderColor = '#D4AF37')}
                  onBlur={e  => (e.target.style.borderColor = T.inputBorder)}
                />
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['#Location', '#Immobilier', '#Piolo', '#Standing', '#Cameroun'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setCaption(prev => prev.includes(tag) ? prev : `${prev} ${tag}`.trim())}
                      style={{ padding: '3px 8px', borderRadius: 12, border: `1px solid ${T.border}`, background: T.btnDefaultBg, color: T.textSecondary, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══ 4. FOOTER AVEC NOTIFICATIONS & ACTIONS ══ */}
        <div className="studio-bottom-bar" style={{ background: T.footerBg, borderTop: `1px solid ${T.border}`, padding: '10px 14px', flexShrink: 0 }}>
          
          {toast.msg && (
            <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 6,
              background: toast.ok ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)',
              border:     `1px solid ${toast.ok ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.3)'}`,
              color:      toast.ok ? '#10B981' : '#EF4444', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icons.Check />
              <span>{toast.msg}</span>
            </div>
          )}
          {errMsg && (
            <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 6, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#EF4444', fontSize: 11 }}>
              {errMsg}
            </div>
          )}

          <div className="studio-footer-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            
            <div className="studio-footer-actions-left" style={{ display: 'flex', gap: 6 }}>
              {prop?.video_reel && (
                <button
                  type="button"
                  onClick={onDelete}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,.3)', background: 'rgba(239,68,68,.08)', color: '#EF4444', cursor: 'pointer', fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <Icons.Trash />
                  <span>Supprimer</span>
                </button>
              )}
              {hasEdits && (
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={processing || !previewUrl}
                  style={{ padding: '8px 14px', borderRadius: 8, border: '1.5px solid #D4AF37', background: T.badgeBg, color: '#D4AF37', cursor: processing ? 'wait' : 'pointer', fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  {processing
                    ? <><div style={{ width: 10, height: 10, border: '2px solid rgba(212,175,55,.3)', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spinLoader .8s linear infinite' }} />Calcul…</>
                    : <><Icons.Sparkles /><span>Appliquer</span></>
                  }
                </button>
              )}
            </div>

            <div className="studio-footer-actions-right" style={{ display: 'flex', gap: 6, flex: 1, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                style={{ padding: '9px 14px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.btnDefaultBg, color: T.textSecondary, cursor: 'pointer', fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 11.5 }}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={uploadingReel || processing || (!previewUrl && !pendingFile)}
                style={{
                  padding: '9px 20px',
                  borderRadius: 8,
                  border: 0,
                  background: (uploadingReel || processing || (!previewUrl && !pendingFile)) ? 'rgba(212,175,55,.3)' : 'linear-gradient(135deg,#D4AF37,#F6D365)',
                  color: '#0B0908',
                  fontFamily: "'Poppins',sans-serif",
                  fontWeight: 900,
                  fontSize: 12,
                  cursor: (uploadingReel || processing) ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 3px 12px rgba(212,175,55,.35)'
                }}
              >
                {(uploadingReel || processing)
                  ? <><div style={{ width: 11, height: 11, border: '2px solid rgba(0,0,0,.25)', borderTopColor: '#0B0908', borderRadius: '50%', animation: 'spinLoader .8s linear infinite' }} />Envoi…</>
                  : <><Icons.Send /><span>{hasEdits ? 'Traiter & Publier' : 'Publier le Reel'}</span></>
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      <ReelStudioGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </div>
  );
}
