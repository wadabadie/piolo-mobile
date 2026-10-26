import { useTranslation } from 'react-i18next';
// src/pages/properties/TourEditor.jsx
// Éditeur de Visite Virtuelle 360° — 100% Mobile Immersif & Desktop Luxury Gold / Noir
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { propertiesApi } from '../../services/api';
import PostPublishBoostModal from '../../components/PostPublishBoostModal';
import Piolo360CameraModal from '../../components/Piolo360CameraModal';

/* ── helpers ──────────────────────────────────────────────────────────────── */
const getMediaUrl = (url) => {
  if (!url) return '';
  let clean = url.replace(/^https?:\/\/(127\.0\.0\.1|localhost):8080/i, '');
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('blob:') || clean.startsWith('data:')) return clean;
  return clean.startsWith('/') ? clean : `/${clean}`;
};

/** Construit le config objet scenes{} pour Pannellum */
const buildScenesConfig = (scenes) => {
  const cfg = {};
  scenes.forEach((sc) => {
    cfg[String(sc.id)] = {
      title: sc.name || 'Pièce',
      type: 'equirectangular',
      panorama: getMediaUrl(sc.image_url || sc.image),
      autoLoad: true,
      hotSpots: (sc.hotspots || []).map((hs) => ({
        pitch: Number(hs.pitch) || 0,
        yaw: Number(hs.yaw) || 0,
        type: 'scene',
        text: hs.label || 'Aller à cette pièce',
        sceneId: String(hs.target_scene_id || hs.target_scene),
      })),
    };
  });
  return cfg;
};

export default function TourEditor() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isAfterPublish = searchParams.get('afterPublish') === '1';

  const [property, setProperty] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [activeSceneId, setActiveSceneId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('view'); // 'view' | 'edit'
  const [showReelModal, setShowReelModal] = useState(false);

  // Modals & Drawers
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [deleteSceneModal, setDeleteSceneModal] = useState(null);
  const [showHotspotModal, setShowHotspotModal] = useState(false);
  const [hotspotPos, setHotspotPos] = useState({ pitch: 0, yaw: 0 });
  const [targetSceneId, setTargetSceneId] = useState('');
  const [hotspotLabel, setHotspotLabel] = useState('');

  // Formulaire ajout pièce
  const [roomName, setRoomName] = useState('');
  const [roomFile, setRoomFile] = useState(null);
  const [roomPreview, setRoomPreview] = useState(null);
  const [addingRoom, setAddingRoom] = useState(false);
  const [deletingScene, setDeletingScene] = useState(false);
  const [savingHotspot, setSavingHotspot] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: 'ok' });

  const panoRef = useRef(null);
  const viewerRef = useRef(null);
  const modeRef = useRef(mode);
  const toastTimer = useRef(null);

  useEffect(() => { modeRef.current = mode; }, [mode]);

  const showToast = useCallback((msg, type = 'ok') => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast({ msg: '', type: 'ok' }), 4000);
  }, []);

  /* ── Charger la propriété et ses scènes 360° ──────────────────────────── */
  const loadData = useCallback(async (keepActiveId = null) => {
    try {
      setLoading(true);
      const res = await propertiesApi.detail(id);
      const prop = res.data;
      setProperty(prop);

      const tours = prop.virtual_tours || [];
      const tourScenes = tours.length > 0 ? (tours[0].scenes || []) : [];
      setScenes(tourScenes);

      const firstId = keepActiveId
        ? String(keepActiveId)
        : tourScenes.length > 0 ? String(tourScenes[0].id) : null;
      setActiveSceneId(firstId);
    } catch (err) {
      console.error('Erreur chargement tour:', err);
      showToast(err.response?.data?.detail || 'Impossible de charger la visite 360°.', 'err');
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Injecter Pannellum CSS + JS ──────────────────────────────────────── */
  useEffect(() => {
    if (!document.getElementById('pannellum-css')) {
      const link = document.createElement('link');
      link.id = 'pannellum-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('pannellum-js')) {
      const script = document.createElement('script');
      script.id = 'pannellum-js';
      script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
      document.body.appendChild(script);
    }
  }, []);

  /* ── Initialiser Pannellum ────────────────────────────────────────────── */
  useEffect(() => {
    if (scenes.length === 0 || !panoRef.current || !activeSceneId) return;

    const init = () => {
      if (!window.pannellum) {
        setTimeout(init, 200);
        return;
      }

      if (viewerRef.current) {
        try { viewerRef.current.destroy(); } catch (_) {}
        viewerRef.current = null;
      }

      const scenesConfig = buildScenesConfig(scenes);
      const firstSceneId = scenesConfig[activeSceneId] ? activeSceneId : Object.keys(scenesConfig)[0];

      viewerRef.current = window.pannellum.viewer(panoRef.current, {
        default: {
          firstScene: firstSceneId,
          sceneFadeDuration: 1000,
          autoLoad: true,
          showControls: true,
          touchPanSpeedCoeffFactor: 1.2,
        },
        scenes: scenesConfig,
      });

      const handlePanoClick = (e) => {
        if (modeRef.current === 'edit' && viewerRef.current) {
          const coords = viewerRef.current.mouseEventToCoords(e);
          if (coords) {
            setHotspotPos({ pitch: Math.round(coords[0] * 100) / 100, yaw: Math.round(coords[1] * 100) / 100 });
            setShowHotspotModal(true);
          }
        }
      };

      panoRef.current.addEventListener('mousedown', handlePanoClick);
      panoRef.current.addEventListener('touchend', (e) => {
        if (modeRef.current === 'edit' && e.changedTouches?.length) {
          const touch = e.changedTouches[0];
          handlePanoClick(touch);
        }
      });
    };

    init();

    return () => {
      if (viewerRef.current) {
        try { viewerRef.current.destroy(); } catch (_) {}
        viewerRef.current = null;
      }
    };
  }, [scenes, activeSceneId]);

  const handleSelectScene = useCallback((sceneId) => {
    const sId = String(sceneId);
    setActiveSceneId(sId);
    if (viewerRef.current) {
      try { viewerRef.current.loadScene(sId); } catch (_) {}
    }
  }, []);

  const handleSetMode = useCallback((m) => {
    setMode(m);
    if (panoRef.current) {
      panoRef.current.style.cursor = m === 'edit' ? 'crosshair' : 'grab';
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Sélectionnez une image JPG, PNG ou WebP.', 'err');
      e.target.value = '';
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      showToast('L\'image ne doit pas dépasser 25 Mo.', 'err');
      e.target.value = '';
      return;
    }
    setRoomFile(file);
    if (roomPreview) URL.revokeObjectURL(roomPreview);
    setRoomPreview(URL.createObjectURL(file));
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim() || !roomFile) return;
    setAddingRoom(true);
    try {
      const fd = new FormData();
      fd.append('room_name', roomName.trim());
      fd.append('image', roomFile);
      const res = await propertiesApi.createTourScene(id, fd);
      const newScene = res.data;
      showToast(`La pièce "${roomName}" a été ajoutée avec succès !`);
      setRoomName('');
      setRoomFile(null);
      if (roomPreview) { URL.revokeObjectURL(roomPreview); setRoomPreview(null); }
      setShowAddRoomModal(false);
      await loadData(newScene?.id || activeSceneId);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Impossible d\'ajouter cette pièce.', 'err');
    } finally {
      setAddingRoom(false);
    }
  };

  const handleSaveCaptured360 = async (file, name) => {
    if (!file || !name.trim()) return;
    setAddingRoom(true);
    try {
      const fd = new FormData();
      fd.append('room_name', name.trim());
      fd.append('image', file);
      const res = await propertiesApi.createTourScene(id, fd);
      const newScene = res.data;
      showToast(`La pièce 360° "${name}" a été capturée et enregistrée avec succès !`);
      setShowAddRoomModal(false);
      setShowCameraModal(false);
      await loadData(newScene?.id || activeSceneId);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Impossible d\'enregistrer la photo 360°.', 'err');
    } finally {
      setAddingRoom(false);
    }
  };

  const confirmDeleteScene = async () => {
    if (!deleteSceneModal) return;
    setDeletingScene(true);
    try {
      await propertiesApi.deleteTourScene(id, deleteSceneModal.id);
      showToast(`La pièce "${deleteSceneModal.name}" a été supprimée.`);
      const remaining = scenes.filter(s => String(s.id) !== String(deleteSceneModal.id));
      setDeleteSceneModal(null);
      setScenes(remaining);
      setActiveSceneId(remaining.length > 0 ? String(remaining[0].id) : null);
      await loadData(remaining.length > 0 ? remaining[0].id : null);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Impossible de supprimer cette pièce.', 'err');
    } finally {
      setDeletingScene(false);
    }
  };

  const handleSaveHotspot = async (e) => {
    e.preventDefault();
    if (!targetSceneId || !activeSceneId) return;
    setSavingHotspot(true);
    try {
      await propertiesApi.createTourHotspot(id, {
        scene_id: activeSceneId,
        target_scene_id: targetSceneId,
        pitch: hotspotPos.pitch,
        yaw: hotspotPos.yaw,
        label: hotspotLabel || 'Aller à cette pièce',
      });
      setShowHotspotModal(false);
      setHotspotLabel('');
      setTargetSceneId('');
      showToast('Lien de porte créé avec succès !');
      await loadData(activeSceneId);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Impossible d\'enregistrer ce lien.', 'err');
    } finally {
      setSavingHotspot(false);
    }
  };

  const activeScene = scenes.find(s => String(s.id) === activeSceneId) || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', height: '100dvh', width: '100vw', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif", background: '#0F0D09' }}>

      {/* ── TOPBAR GLASSMORPHIC LUXURY AVEC PROTECTION ENCOCHE IPHONE (SAFE-AREA) ── */}
      <header className="te-topbar" style={{
        minHeight: 56,
        paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)',
        paddingBottom: 10,
        paddingLeft: 'max(env(safe-area-inset-left, 0px), 12px)',
        paddingRight: 'max(env(safe-area-inset-right, 0px), 12px)',
        background: 'rgba(15,13,9,0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(212,175,55,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0, zIndex: 40, boxSizing: 'border-box', gap: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
          <Link to="/dashboard/bailleur" aria-label="Retour" style={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.08)', color: '#fff', textDecoration: 'none', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          </Link>

          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13.5, fontWeight: 800, margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
              <span style={{ color: '#D4AF37' }}>✦</span> <span>Éditeur 360°</span>
            </h1>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: 160 }}>
              {loading ? 'Chargement…' : (property?.title || 'Logement')}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button
            type="button"
            className="te-add-room-btn-top"
            onClick={() => setShowAddRoomModal(true)}
            style={{
              padding: '7px 12px', borderRadius: 999,
              background: 'rgba(212,175,55,0.18)', border: '1px solid rgba(212,175,55,0.45)',
              color: '#F6D365', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', flexShrink: 0
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            <span>+ Pièce</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (isAfterPublish) {
                setShowReelModal(true);
              } else {
                navigate('/dashboard/bailleur');
              }
            }}
            style={{
              padding: '7px 15px', borderRadius: 999,
              background: 'linear-gradient(135deg, #D4AF37, #F6D365)',
              color: '#0F0D09', fontSize: 12, fontWeight: 800,
              border: 0, cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
              boxShadow: '0 4px 14px rgba(212,175,55,0.35)', whiteSpace: 'nowrap', flexShrink: 0
            }}
          >
            Terminer ✓
          </button>
        </div>
      </header>

      {/* ── TOAST NOTIFICATION ── */}
      {toast.msg && (
        <div style={{
          position: 'fixed', top: 68, left: '50%', transform: 'translateX(-50%)',
          zIndex: 99999, background: toast.type === 'err' ? '#B83232' : '#0F0D09',
          color: '#fff', padding: '10px 18px', borderRadius: 12, fontWeight: 700,
          fontSize: 12.5, borderLeft: `4px solid ${toast.type === 'err' ? '#ff6b6b' : '#D4AF37'}`,
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: 10, width: 'max-content', maxWidth: '90vw'
        }}>
          <span>{toast.msg}</span>
          <button onClick={() => setToast({ msg: '', type: 'ok' })} style={{ border: 0, background: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>
        </div>
      )}

      {/* ── MAIN WORKSPACE CONTAINER ── */}
      <div className="te-main-layout" style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>

        {/* ── PANNEAU GAUCHE DESKTOP (Masqué sur mobile au profit du carrousel immersif) ── */}
        <aside className="te-desktop-sidebar" style={{
          width: 360, background: '#FFFFFF', borderRight: '1px solid #E8E3DA',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0, zIndex: 20
        }}>
          <div style={{ padding: '18px 20px', background: '#FAF9F6', borderBottom: '1px solid #E8E3DA' }}>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 800, margin: 0, color: '#0F0D09', display: 'flex', alignItems: 'center', gap: 7 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--or-d)"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
              <span>Pièces 360° ({scenes.length})</span>
            </h2>
          </div>

          <div style={{ flex: 1, padding: '14px 16px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#9B9690', fontSize: 13 }}>{t('tour.editor.loading_rooms')}</div>
            ) : scenes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#9B9690' }}>
                <p style={{ fontWeight: 700, color: '#0F0D09', margin: '0 0 6px', fontSize: 14 }}>{t('tour.editor.no_rooms')}</p>
                <p style={{ fontSize: 12, margin: 0 }}>{t('tour.editor.no_rooms_desc')}</p>
              </div>
            ) : (
              scenes.map((sc, idx) => {
                const isActive = String(sc.id) === activeSceneId;
                const thumb = sc.image_url || getMediaUrl(sc.image);
                const hsCount = sc.hotspots?.length || 0;

                return (
                  <div
                    key={sc.id}
                    onClick={() => handleSelectScene(sc.id)}
                    style={{
                      background: isActive ? 'rgba(212,175,55,0.08)' : '#fff',
                      border: isActive ? '2px solid #D4AF37' : '1px solid #E8E3DA',
                      borderRadius: 14, padding: 10, marginBottom: 10,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                      boxShadow: isActive ? '0 4px 14px rgba(212,175,55,0.18)' : '0 1px 4px rgba(0,0,0,0.02)',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    <img src={thumb} alt="" style={{ width: 50, height: 50, borderRadius: 10, objectFit: 'cover', flexShrink: 0, background: '#E8E3DA' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: '0 0 3px', fontSize: 13.5, fontWeight: 700, color: '#0F0D09', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {sc.name || `Pièce ${idx + 1}`}
                      </p>
                      <span style={{ fontSize: 11, color: '#9B9690', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        <span>{hsCount} porte{hsCount > 1 ? 's' : ''} reliée{hsCount > 1 ? 's' : ''}</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      title="{t('tour.editor.delete_room')}"
                      onClick={(e) => { e.stopPropagation(); setDeleteSceneModal(sc); }}
                      style={{ border: 0, background: 'rgba(184,50,50,0.09)', color: '#B83232', borderRadius: 8, width: 30, height: 30, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Bouton d'ajout sidebar desktop */}
          <div style={{ padding: 16, borderTop: '1px solid #E8E3DA', background: '#FAF9F6' }}>
            <button
              type="button"
              onClick={() => setShowAddRoomModal(true)}
              style={{
                width: '100%', padding: '12px', border: 0, borderRadius: 12,
                background: 'linear-gradient(135deg, #D4AF37, #F6D365)', color: '#0F0D09',
                fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: '0 4px 14px rgba(212,175,55,0.3)'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              <span>{t('tour.editor.modal_title')}</span>
            </button>
          </div>
        </aside>

        {/* ── ZONE CENTRALE IMMERSIVE PANORAMA 360° ── */}
        <main className="te-viewer-zone" style={{ flex: 1, position: 'relative', background: '#0F0D09', overflow: 'hidden', height: '100%' }}>

          {/* BARRE FLOTTANTE DE MODE (Visualisation vs Hotspot) */}
          <div style={{
            position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
            zIndex: 30, display: 'flex', gap: 6, background: 'rgba(15,13,9,0.85)',
            padding: 4, borderRadius: 999, border: '1px solid rgba(212,175,55,0.35)',
            backdropFilter: 'blur(10px)', boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
          }}>
            <button
              type="button"
              onClick={() => handleSetMode('view')}
              style={{
                padding: '7px 14px', borderRadius: 999, border: 0,
                background: mode === 'view' ? 'linear-gradient(135deg, #D4AF37, #F6D365)' : 'transparent',
                color: mode === 'view' ? '#0F0D09' : '#fff', fontWeight: 700, fontSize: 12,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all .2s'
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
              <span>{t('tour.editor.visualize')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetMode('edit')}
              style={{
                padding: '7px 14px', borderRadius: 999, border: 0,
                background: mode === 'edit' ? 'linear-gradient(135deg, #D4AF37, #F6D365)' : 'transparent',
                color: mode === 'edit' ? '#0F0D09' : '#fff', fontWeight: 700, fontSize: 12,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all .2s'
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              <span>{t('tour.editor.place_hotspot')}</span>
            </button>
          </div>

          {/* BANDEAU INDICATEUR EN MODE ÉDITION */}
          {mode === 'edit' && (
            <div style={{
              position: 'absolute', top: 64, left: '50%', transform: 'translateX(-50%)',
              zIndex: 25, background: 'rgba(15,13,9,0.9)', color: '#F6D365',
              padding: '8px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              border: '1px solid rgba(212,175,55,0.4)', backdropFilter: 'blur(8px)',
              pointerEvents: 'none', textAlign: 'center', width: 'max-content', maxWidth: '88vw'
            }}>
              Touchez n&apos;importe où sur l&apos;image 360° pour placer une porte vers une autre pièce.
            </div>
          )}

          {/* CONTENEUR PANNELLUM */}
          <div
            ref={panoRef}
            style={{ width: '100%', height: '100%', cursor: mode === 'edit' ? 'crosshair' : 'grab' }}
          />

          {/* ÉTAT VIDE (AUCUNE PIÈCE) */}
          {!loading && scenes.length === 0 && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center',
              padding: 24, gap: 14, background: '#0F0D09'
            }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(212,175,55,0.15)', display: 'grid', placeItems: 'center', color: '#D4AF37' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 6px', color: '#fff' }}>{t('tour.editor.no_room_360')}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', maxWidth: 320, margin: '0 auto 16px' }}>
                  Importez une photo panoramique équirectangulaire (2:1) pour commencer votre visite virtuelle.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddRoomModal(true)}
                  style={{
                    padding: '10px 20px', borderRadius: 999, border: 0,
                    background: 'linear-gradient(135deg, #D4AF37, #F6D365)', color: '#0F0D09',
                    fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 14px rgba(212,175,55,0.4)'
                  }}
                >
                  + Ajouter ma première pièce 360°
                </button>
              </div>
            </div>
          )}

          {/* ── CARROUSEL FLOTTANT DES PIÈCES (SUR MOBILE ET DESKTOP OVERLAY) ── */}
          {scenes.length > 0 && (
            <div className="te-floating-room-strip" style={{
              position: 'absolute', bottom: 14, left: 12, right: 12,
              zIndex: 30, display: 'flex', gap: 10, overflowX: 'auto',
              padding: '6px 4px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
              alignItems: 'center'
            }}>
              {scenes.map((sc, idx) => {
                const isActive = String(sc.id) === activeSceneId;
                const thumb = sc.image_url || getMediaUrl(sc.image);

                return (
                  <div
                    key={sc.id}
                    onClick={() => handleSelectScene(sc.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '5px 12px 5px 6px', borderRadius: 999,
                      background: isActive ? '#0F0D09' : 'rgba(15,13,9,0.85)',
                      border: isActive ? '2px solid #D4AF37' : '1px solid rgba(255,255,255,0.25)',
                      backdropFilter: 'blur(10px)', color: isActive ? '#F6D365' : '#FFFFFF',
                      cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                      transition: 'all .18s ease'
                    }}
                  >
                    <img src={thumb} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {sc.name || `Pièce ${idx + 1}`}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setDeleteSceneModal(sc); }}
                      style={{ border: 0, background: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 2, display: 'grid', placeItems: 'center' }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => setShowAddRoomModal(true)}
                style={{
                  padding: '8px 16px', borderRadius: 999, border: '1px dashed #D4AF37',
                  background: 'rgba(212,175,55,0.2)', color: '#F6D365', fontSize: 12,
                  fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: 5
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                <span>{t('tour.editor.new_room')}</span>
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ── MODALE CENTRÉE AJOUT DE PIÈCE 360° (100% MOBILE RESPONSIVE) ── */}
      {showAddRoomModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15,13,9,0.82)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          boxSizing: 'border-box',
          zIndex: 999999,
          overflowY: 'auto'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 22,
            width: '100%',
            maxWidth: 440,
            boxSizing: 'border-box',
            padding: '22px 20px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
            border: '1.5px solid rgba(212,175,55,0.35)',
            margin: 'auto',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 800, margin: 0, color: '#0F0D09', display: 'flex', alignItems: 'center', gap: 7 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#D4AF37"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                <span>{t('tour.editor.modal_title')}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddRoomModal(false)}
                style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #E8E3DA', background: '#F7F5F1', cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#0F0D09', flexShrink: 0 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRoom}>
              {/* OPTION 1 : CAMÉRA 360° IMMERSIVE PIOLO (HERO) */}
              <div
                onClick={() => {
                  setShowAddRoomModal(false);
                  setShowCameraModal(true);
                }}
                style={{
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.14) 0%, rgba(246,211,101,0.08) 100%)',
                  border: '1.5px solid #D4AF37', borderRadius: 16, padding: '16px 14px',
                  marginBottom: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
                  boxShadow: '0 4px 18px rgba(212,175,55,0.2)', transition: 'transform 0.15s ease'
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'linear-gradient(135deg, #D4AF37, #F6D365)',
                  display: 'grid', placeItems: 'center', color: '#0F0D09', flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(212,175,55,0.35)'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="3.2"/>
                    <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: '#0F0D09' }}>Capturer avec la Caméra 360°</span>
                    <span style={{ fontSize: 9.5, fontWeight: 900, background: '#0F0D09', color: '#F6D365', padding: '2px 6px', borderRadius: 6 }}>DIRECT</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 11.5, color: '#64605A', lineHeight: 1.4 }}>
                    Tournez sur vous-même : Piolo assemble toute la pièce (360° sol &amp; plafond).
                  </p>
                </div>
                <span style={{ color: '#D4AF37', fontSize: 18, fontWeight: 800 }}>→</span>
              </div>

              {/* SÉPARATEUR */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0', color: '#9B9690', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                <div style={{ flex: 1, height: 1, background: '#E8E3DA' }} />
                <span>Ou importer un fichier existant</span>
                <div style={{ flex: 1, height: 1, background: '#E8E3DA' }} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#64605A', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.4px' }}>
                  Nom de la pièce *
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  placeholder={t("tour.editor.room_name_placeholder")}
                  required
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '11px 14px',
                    border: '1.5px solid #E8E3DA', borderRadius: 12, fontSize: 13.5,
                    outline: 'none', background: '#F7F5F1', color: '#0F0D09', fontFamily: "'DM Sans', sans-serif"
                  }}
                />
              </div>

              <div style={{
                position: 'relative', border: `2px dashed ${roomPreview ? '#1E7A47' : '#D4AF37'}`,
                borderRadius: 14, padding: 16, textAlign: 'center',
                background: roomPreview ? 'rgba(30,122,71,0.04)' : '#FAF9F6',
                marginBottom: 18, cursor: 'pointer', overflow: 'hidden',
                boxSizing: 'border-box'
              }}>
                {roomPreview ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                    <img src={roomPreview} alt="" style={{ width: 50, height: 50, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: '#0F0D09', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {roomFile?.name}
                      </p>
                      <span style={{ fontSize: 11.5, color: '#1E7A47', fontWeight: 700 }}>{t('tour.editor.photo_ready')}</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="#D4AF37" style={{ marginBottom: 4 }}><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    <p style={{ margin: '0 0 4px', fontSize: 13.5, fontWeight: 700, color: '#0F0D09' }}>{t('tour.editor.choose_photo')}</p>
                    <span style={{ fontSize: 11, color: '#9B9690' }}>{t('tour.editor.format_hint')}</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAddRoomModal(false)}
                  style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid #E8E3DA', background: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={addingRoom || !roomName.trim() || !roomFile}
                  style={{
                    flex: 2, padding: '11px', borderRadius: 12, border: 0,
                    background: 'linear-gradient(135deg, #D4AF37, #F6D365)', color: '#0F0D09',
                    fontWeight: 800, fontSize: 13, cursor: addingRoom || !roomName.trim() || !roomFile ? 'not-allowed' : 'pointer',
                    opacity: addingRoom || !roomName.trim() || !roomFile ? 0.55 : 1,
                    boxShadow: '0 4px 14px rgba(212,175,55,0.3)'
                  }}
                >
                  {addingRoom ? 'Enregistrement…' : 'Enregistrer la pièce'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CAMÉRA 360° GYROSCOPIQUE ET SPHÉRIQUE INTÉGRÉE ── */}
      <Piolo360CameraModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        propertyId={id}
        onSave360Image={handleSaveCaptured360}
        onSceneCreated={(newScene) => {
          showToast(`La pièce 360° "${newScene?.name || '360°'}" a été assemblée et ajoutée !`);
          setShowAddRoomModal(false);
          setShowCameraModal(false);
          loadData(newScene?.id || activeSceneId);
        }}
      />

      {/* ── MODALE CONFIRMATION SUPPRESSION ── */}
      {deleteSceneModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          width: '100vw', height: '100vh',
          background: 'rgba(15,13,9,0.82)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16, boxSizing: 'border-box', zIndex: 999999
        }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 400, boxSizing: 'border-box', padding: 22, textAlign: 'center', border: '1.5px solid #E8E3DA', margin: 'auto' }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(184,50,50,0.1)', color: '#B83232', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 6px', color: '#0F0D09' }}>
              {t('tour.editor.delete_room')} 360° ?
            </h3>
            <p style={{ fontSize: 12.5, color: '#64605A', margin: '0 0 18px', lineHeight: 1.5 }}>
              Voulez-vous vraiment supprimer <strong>«{deleteSceneModal.name}»</strong> et toutes ses liaisons ?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setDeleteSceneModal(null)}
                style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid #E8E3DA', background: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDeleteScene}
                disabled={deletingScene}
                style={{ flex: 1, padding: '11px', borderRadius: 12, border: 0, background: '#B83232', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
              >
                {deletingScene ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALE AJOUT HOTSPOT / PORTE DE NAVIGATION ── */}
      {showHotspotModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          width: '100vw', height: '100vh',
          background: 'rgba(15,13,9,0.82)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16, boxSizing: 'border-box', zIndex: 999999
        }}>
          <div style={{ background: '#fff', borderRadius: 22, width: '100%', maxWidth: 420, boxSizing: 'border-box', padding: 22, border: '1.5px solid rgba(212,175,55,0.35)', margin: 'auto' }}>
            <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 800, margin: '0 0 4px', color: '#0F0D09', display: 'flex', alignItems: 'center', gap: 7 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#D4AF37"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              <span>{t('tour.editor.link_to_room')}</span>
            </h3>
            <p style={{ fontSize: 12, color: '#9B9690', margin: '0 0 14px' }}>
              Position sélectionnée : Pitch <strong>{hotspotPos.pitch}°</strong>, Yaw <strong>{hotspotPos.yaw}°</strong>
            </p>

            <form onSubmit={handleSaveHotspot}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#64605A', textTransform: 'uppercase', marginBottom: 6 }}>
                  Cette porte mène vers : *
                </label>
                <select
                  value={targetSceneId}
                  onChange={e => setTargetSceneId(e.target.value)}
                  required
                  style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E8E3DA', fontSize: 13, background: '#F7F5F1', color: '#0F0D09', outline: 'none' }}
                >
                  <option value="">{t('tour.editor.select_destination')}</option>
                  {scenes.filter(s => String(s.id) !== activeSceneId).map(s => (
                    <option key={s.id} value={s.id}>{s.name || `Pièce ${s.id}`}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#64605A', textTransform: 'uppercase', marginBottom: 6 }}>
                  Texte indicatif (Optionnel)
                </label>
                <input
                  type="text"
                  value={hotspotLabel}
                  onChange={e => setHotspotLabel(e.target.value)}
                  placeholder="Ex: Aller au balcon, Vers la cuisine…"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E8E3DA', fontSize: 13, background: '#F7F5F1', color: '#0F0D09', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => { setShowHotspotModal(false); setTargetSceneId(''); setHotspotLabel(''); }}
                  style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid #E8E3DA', background: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!targetSceneId || savingHotspot}
                  style={{
                    flex: 2, padding: '11px', borderRadius: 12, border: 0,
                    background: 'linear-gradient(135deg, #D4AF37, #F6D365)', color: '#0F0D09',
                    fontWeight: 800, fontSize: 13, cursor: !targetSceneId || savingHotspot ? 'not-allowed' : 'pointer',
                    opacity: !targetSceneId || savingHotspot ? 0.55 : 1,
                    boxShadow: '0 4px 14px rgba(212,175,55,0.3)'
                  }}
                >
                  {savingHotspot ? 'Enregistrement…' : 'Créer la porte 360°'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Style CSS responsive */}
      <style>{`
        .pnlm-title-box { display: none !important; }
        .pnlm-controls-container {
          top: calc(75px + env(safe-area-inset-top, 0px)) !important;
          left: 14px !important;
          z-index: 15 !important;
        }
        .pnlm-hotspot {
          width: 32px !important;
          height: 32px !important;
          border-radius: 50% !important;
          background: rgba(212,175,55,0.88) !important;
          border: 2px solid #FFFFFF !important;
          box-shadow: 0 0 16px rgba(212,175,55,0.7) !important;
          display: grid !important;
          place-items: center !important;
          cursor: pointer !important;
          transition: transform 0.2s ease !important;
        }
        .pnlm-hotspot:hover {
          transform: scale(1.18) !important;
        }

        @media (max-width: 850px) {
          .te-desktop-sidebar {
            display: none !important;
          }
          .te-viewer-zone {
            width: 100vw !important;
            height: calc(100vh - 56px) !important;
            height: calc(100dvh - 56px) !important;
          }
          .te-topbar {
            padding-top: max(env(safe-area-inset-top, 0px), 12px) !important;
          }
          .te-floating-room-strip {
            bottom: max(env(safe-area-inset-bottom, 0px), 12px) !important;
          }
        }
      `}</style>

      {/* MODALE BOOST REEL APRES 360 */}
      <PostPublishBoostModal
        propertyId={id}
        propertyTitle={property?.title || 'Votre bien'}
        isOpen={showReelModal}
        onClose={() => setShowReelModal(false)}
        initialStep="reel_discovery"
      />
    </div>
  );
}

