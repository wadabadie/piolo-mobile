import { useTranslation } from 'react-i18next';
// src/pages/properties/TourViewer.jsx — Visite Virtuelle 360° Interactive (Clone idéal & Amélioré)
import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { propertiesApi } from '../../services/api';
const TOUR_STYLES = `
  .tour-page-scope {
    --or: #D4AF37; --or-l: #F6D365; --or-d: #B8962A;
    --noir: #0F0D09; --blanc: #FFFFFF;
    margin: 0; padding: 0;
    position: fixed; inset: 0;
    top: 0; left: 0; right: 0; bottom: 0;
    width: 100%; width: 100vw;
    height: 100%;
    height: 100vh;
    height: 100dvh;
    height: -webkit-fill-available;
    background-color: #000000;
    color: #fff;
    overflow: hidden;
    z-index: 99999;
    font-family: 'DM Sans', sans-serif;
  }
  .pnlm-container {
    width: 100% !important;
    height: 100% !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    inset: 0 !important;
    background-color: #000000 !important;
  }
  .pnlm-render-container {
    width: 100% !important;
    height: 100% !important;
    position: absolute !important;
    inset: 0 !important;
    background-color: #000000 !important;
  }
  .pnlm-render-container canvas,
  .pnlm-render-container > canvas {
    width: 100% !important;
    height: 100% !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    inset: 0 !important;
    object-fit: cover !important;
  }
  .pnlm-title-box,
  .pnlm-author-box,
  .pnlm-load-box,
  .pnlm-about-msg,
  .pnlm-panorama-info {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    height: 0 !important;
    width: 0 !important;
    overflow: hidden !important;
    pointer-events: none !important;
  }
  .tour-header {
    position: absolute;
    top: calc(env(safe-area-inset-top, 20px) + 12px);
    left: 20px;
    right: 20px;
    z-index: 25;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    pointer-events: none;
    gap: 15px;
  }
  .tour-info-box {
    background: rgba(15, 13, 9, 0.75);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(212, 175, 55, 0.3);
    padding: 14px 20px;
    border-radius: 16px;
    color: #fff;
    pointer-events: auto;
    max-width: 70%;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    animation: fadeInDown 0.4s ease;
  }
  .tour-title {
    font-family: 'Poppins', sans-serif;
    font-size: 18px;
    font-weight: 800;
    margin: 0 0 4px 0;
    color: var(--blanc);
    letter-spacing: -0.3px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .tour-subtitle {
    font-size: 13px;
    color: #D3D0C9;
    margin: 0;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .tour-badge {
    background: linear-gradient(135deg, var(--or), var(--or-l));
    color: var(--noir);
    font-size: 11px;
    font-weight: 800;
    padding: 3px 8px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .tour-actions-right {
    display: flex;
    align-items: center;
    gap: 12px;
    pointer-events: auto;
  }
  .tour-hint-chip {
    background: rgba(15, 13, 9, 0.7);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.15);
    padding: 8px 14px;
    border-radius: 20px;
    font-size: 12px;
    color: #E2E0DB;
    font-weight: 600;
    display: none;
    align-items: center;
    gap: 6px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  }
  @media (min-width: 768px) {
    .tour-hint-chip { display: flex; }
  }
  .tour-mobile-hint { display: none; }
  .btn-close-tour {
    background: rgba(15, 13, 9, 0.8);
    backdrop-filter: blur(10px);
    color: #fff;
    border: 1.5px solid rgba(212, 175, 55, 0.4);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.25s ease;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    flex-shrink: 0;
  }
  .btn-close-tour:hover {
    background: var(--or);
    color: var(--noir);
    transform: rotate(90deg) scale(1.08);
    border-color: var(--or);
    box-shadow: 0 6px 25px rgba(212,175,55,0.5);
  }
  .room-selector {
    position: absolute;
    bottom: calc(env(safe-area-inset-bottom, 20px) + 20px);
    left: 50%;
    transform: translateX(-50%);
    z-index: 25;
    background: rgba(15, 13, 9, 0.75);
    backdrop-filter: blur(14px);
    border: 1px solid rgba(212, 175, 55, 0.3);
    padding: 10px 14px;
    border-radius: 22px;
    display: flex;
    gap: 12px;
    pointer-events: auto;
    max-width: 92vw;
    overflow-x: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
    box-shadow: 0 12px 40px rgba(0,0,0,0.6);
    animation: fadeInUp 0.4s ease;
  }
  .room-selector::-webkit-scrollbar { display: none; }
  .room-thumb {
    width: 74px;
    height: 74px;
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    border: 2.5px solid rgba(255,255,255,0.2);
    transition: all 0.25s ease;
    position: relative;
    flex-shrink: 0;
    background: #23201A;
  }
  .room-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  .room-thumb:hover img { transform: scale(1.1); }
  .room-thumb:hover {
    border-color: rgba(212, 175, 55, 0.6);
    transform: translateY(-3px);
  }
  .room-thumb.active {
    border-color: var(--or, #D4AF37);
    box-shadow: 0 4px 16px rgba(212,175,55,0.45);
    transform: translateY(-6px);
  }
  .room-thumb-label {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(0deg, rgba(15,13,9,0.95) 0%, rgba(15,13,9,0.5) 100%);
    color: #fff;
    font-size: 11px;
    text-align: center;
    padding: 4px 2px 3px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: 'Poppins', sans-serif;
  }
  .room-thumb.active .room-thumb-label {
    color: var(--or-l);
  }
  @media (max-width: 767px) {
    .tour-header { top: max(10px, env(safe-area-inset-top)); left: 12px; right: 12px; align-items: flex-start; gap: 8px; }
    .tour-info-box { padding: 10px 12px; border-radius: 13px; max-width: calc(100vw - 70px); }
    .tour-title { font-size: 14px; gap: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tour-title > span:last-child { overflow: hidden; text-overflow: ellipsis; }
    .tour-badge { font-size: 9px; padding: 3px 6px; }
    .tour-subtitle { display: none; }
    .btn-close-tour { width: 42px; height: 42px; }
    .room-selector { bottom: max(14px, env(safe-area-inset-bottom)); left: 12px; right: 12px; transform: none; max-width: none; padding: 8px; gap: 8px; border-radius: 18px; scroll-snap-type: x mandatory; }
    .room-thumb { width: 68px; height: 68px; border-radius: 12px; scroll-snap-align: center; }
    .room-thumb.active { transform: translateY(-3px); }
    .room-thumb-label { font-size: 9px; padding: 4px 2px 2px; }
    .tour-mobile-hint { display: flex; position: absolute; z-index: 24; left: 50%; bottom: max(104px, calc(env(safe-area-inset-bottom) + 90px)); transform: translateX(-50%); max-width: calc(100vw - 32px); align-items: center; gap: 6px; padding: 8px 12px; border: 1px solid rgba(255,255,255,.18); border-radius: 999px; background: rgba(15,13,9,.65); backdrop-filter: blur(8px); color: #fff; font-size: 11px; font-weight: 700; white-space: nowrap; pointer-events: none; animation: fadeInUp .45s ease; }
    .pnlm-controls { bottom: 116px !important; right: 12px !important; transform: scale(.88); transform-origin: bottom right; }
  }
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-15px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translate(-50%, 15px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }
  .tour-loading-overlay {
    position: absolute;
    inset: 0;
    background: #0F0D09;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #D3D0C9;
    z-index: 20;
    gap: 14px;
  }
`;

export default function TourViewer() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const panoContainerRef = useRef(null);

  const [property, setProperty] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [activeSceneId, setActiveSceneId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewerReady, setViewerReady] = useState(false);
  const viewerInstanceRef = useRef(null);

  // Verrouiller le fond de la page en noir pur sur tout le viewport
  useEffect(() => {
    const origHtmlBg = document.documentElement.style.backgroundColor;
    const origBodyBg = document.body.style.backgroundColor;
    const origHtmlOverflow = document.documentElement.style.overflow;
    const origBodyOverflow = document.body.style.overflow;

    document.documentElement.style.backgroundColor = '#000000';
    document.body.style.backgroundColor = '#000000';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const handleResize = () => {
      if (viewerInstanceRef.current && typeof viewerInstanceRef.current.resize === 'function') {
        viewerInstanceRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    const t1 = setTimeout(handleResize, 150);
    const t2 = setTimeout(handleResize, 600);
    const t3 = setTimeout(handleResize, 1500);

    return () => {
      document.documentElement.style.backgroundColor = origHtmlBg;
      document.body.style.backgroundColor = origBodyBg;
      document.documentElement.style.overflow = origHtmlOverflow;
      document.body.style.overflow = origBodyOverflow;
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const buildUrl = (u) => {
    if (!u) return '';
    let clean = u.replace(/^https?:\/\/(127\.0\.0\.1|localhost):8080/i, '');
    if (clean.startsWith('http') || clean.startsWith('data:')) return clean;
    return clean.startsWith('/') ? clean : `/${clean}`;
  };

  // 1. Charger les infos du bien et préparer les scènes
  useEffect(() => {
    setLoading(true);
    propertiesApi.detail(id)
      .then(({ data }) => {
        setProperty(data);

        let tourScenes = [];
        if (data.virtual_tours && data.virtual_tours.length > 0 && data.virtual_tours[0].scenes?.length > 0) {
          tourScenes = data.virtual_tours[0].scenes.map(s => ({
            id: String(s.id),
            name: s.name || 'Pièce',
            image: buildUrl(s.image),
            hotspots: (s.hotspots || []).map(h => ({
              id: h.id,
              pitch: h.pitch || 0,
              yaw: h.yaw || 0,
              type: h.hotspot_type || 'scene',
              text: h.label || 'Vers pièce suivante',
              sceneId: h.target_scene_id ? String(h.target_scene_id) : undefined,
            }))
          }));
        }

        // Fallback Premium: Si pas encore de scènes ou images démo, on fournit des panoramas 360 haute définition
        if (tourScenes.length === 0) {
          tourScenes = [
            {
              id: 'demo-salon',
              name: 'Salon Principal',
              image: 'https://pannellum.org/images/alma.jpg',
              hotspots: [
                { pitch: -5, yaw: 45, type: 'scene', text: 'Aller à la Chambre Master', sceneId: 'demo-chambre' }
              ]
            },
            {
              id: 'demo-chambre',
              name: 'Chambre Master',
              image: 'https://pannellum.org/images/bma-0.jpg',
              hotspots: [
                { pitch: 0, yaw: -120, type: 'scene', text: 'Retour au Salon Principal', sceneId: 'demo-salon' }
              ]
            }
          ];
        }

        setScenes(tourScenes);
        setActiveSceneId(tourScenes[0].id);
      })
      .catch((err) => {
        console.error("Erreur chargement bien pour visite 360:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // 2. Initialiser Pannellum une fois les scènes prêtes
  useEffect(() => {
    if (loading || scenes.length === 0) return;

    const initViewer = () => {
      if (!window.pannellum || !panoContainerRef.current) return;
      try {
        if (viewerInstanceRef.current) {
          viewerInstanceRef.current.destroy();
        }

        const scenesData = {};
        scenes.forEach(s => {
          scenesData[s.id] = {
            type: 'equirectangular',
            panorama: s.image,
            autoLoad: true,
            hotSpots: s.hotspots || []
          };
        });

        const viewer = window.pannellum.viewer(panoContainerRef.current, {
          default: {
            firstScene: activeSceneId || scenes[0].id,
            sceneFadeDuration: 1000,
            autoLoad: true,
            compass: true,
            showZoomCtrl: true,
            showFullscreenCtrl: false
          },
          scenes: scenesData
        });

        viewer.on('scenechange', (newSceneId) => {
          setActiveSceneId(newSceneId);
        });

        viewer.on('load', () => {
          setViewerReady(true);
        });

        viewerInstanceRef.current = viewer;
        setViewerReady(true);
      } catch (e) {
        console.error("Erreur initialisation Pannellum:", e);
      }
    };

    // Injecter Pannellum CSS + JS si non présents
    if (!document.getElementById('pannellum-css')) {
      const link = document.createElement('link');
      link.id = 'pannellum-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
      document.head.appendChild(link);
    }

    if (window.pannellum) {
      initViewer();
    } else {
      let script = document.getElementById('pannellum-js');
      if (!script) {
        script = document.createElement('script');
        script.id = 'pannellum-js';
        script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
        script.async = true;
        script.onload = () => { initViewer(); };
        document.body.appendChild(script);
      } else {
        const interval = setInterval(() => {
          if (window.pannellum) {
            clearInterval(interval);
            initViewer();
          }
        }, 100);
        setTimeout(() => clearInterval(interval), 6000);
      }
    }

    return () => {
      if (viewerInstanceRef.current && typeof viewerInstanceRef.current.destroy === 'function') {
        try { viewerInstanceRef.current.destroy(); } catch (e) {}
      }
    };
  }, [loading, scenes]);

  const handleSelectScene = (sceneId) => {
    setActiveSceneId(sceneId);
    if (viewerInstanceRef.current && typeof viewerInstanceRef.current.loadScene === 'function') {
      viewerInstanceRef.current.loadScene(sceneId);
    }
  };

  const titleText = property ? (property.title || `${property.property_type} - ${property.neighborhood || property.city}`) : 'Visite 360° Interactive';
  const subtitleText = property ? [property.city, property.neighborhood, property.property_type].filter(Boolean).join(' • ') : 'Navigation immersive';

  return (
    <div className="tour-page-scope">
      <style>{TOUR_STYLES}</style>

      {/* ── Conteneur DOM pur pour Pannellum (sans enfants React) ──────── */}
      <div ref={panoContainerRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 10 }} />

      {/* ── Overlay de chargement (Frère, sécurisé contre conflit DOM) ─── */}
      {(!viewerReady || loading) && (
        <div className="tour-loading-overlay">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="var(--or, #D4AF37)" stroke="#0F0D09" strokeWidth="1" style={{ animation: 'pulse 1.5s infinite' }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
          <div style={{ fontSize: '16px', fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: '#FFFFFF' }}>
            Chargement de la visite 360° immersive…
          </div>
          <div style={{ fontSize: '13px', color: '#888' }}>
            Préparation des panoramas haute définition
          </div>
        </div>
      )}

      {/* ── En-tête de contrôle ────────────────────────────────────────── */}
      <div className="tour-header">
        <div className="tour-info-box">
          <h1 className="tour-title">
            <span className="tour-badge">360°</span>
            <span>{titleText}</span>
          </h1>
          <p className="tour-subtitle">{subtitleText}</p>
        </div>

        <div className="tour-actions-right">
          <div className="tour-hint-chip">
            <span>{t('tour.viewer_hint')}</span>
          </div>
          <Link
            to={`/properties/${id}`}
            className="btn-close-tour"
            title="{t('tour.exit_tour')}"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </Link>
        </div>
      </div>

      <div className="tour-mobile-hint" aria-hidden="true">
        <span>☝</span> Glissez pour explorer · Pincez pour zoomer
      </div>

      {/* ── Sélecteur de pièces au bas de l'écran ──────────────────────── */}
      {scenes.length > 0 && (
        <div className="room-selector">
          {scenes.map((sc) => (
            <button
              type="button"
              key={sc.id}
              className={`room-thumb ${activeSceneId === sc.id ? 'active' : ''}`}
              onClick={() => handleSelectScene(sc.id)}
              aria-label={`Afficher ${sc.name}`}
            >
              <img src={sc.image} alt={sc.name} />
              <div className="room-thumb-label">{sc.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
