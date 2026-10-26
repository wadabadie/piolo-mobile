import { useTranslation } from 'react-i18next';
// src/pages/properties/DiscoveryPage.jsx
// Mode Découverte Vidéo Immersif Piolo (Reels HD 4K + Cœurs Dorés + Mode Écran Pur + Barre Avancer/Reculer + Avant/Après)
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { propertiesApi, professionalsApi } from '../../services/api';
import { cacheManager } from '../../services/cacheManager';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { getMediaUrl } from '../../utils/media';

const LOGO_URL = '/static/img/logo-piolo-clean.png';

// ── SVGs Pro Haute Précision ────────────────────────────────────────────
const HeartSVG = () => (
  <svg viewBox="0 0 24 24" style={{width:26,height:26,fill:'rgba(255,255,255,0.95)',filter:'drop-shadow(0px 2px 4px rgba(0,0,0,0.6))',transition:'all 0.3s cubic-bezier(0.4,0,0.2,1)'}}>
    <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
  </svg>
);
const ShareSVG = () => (
  <svg viewBox="0 0 24 24" style={{width:24,height:24,fill:'none',stroke:'rgba(255,255,255,0.95)',strokeWidth:2,filter:'drop-shadow(0px 2px 4px rgba(0,0,0,0.6))'}}>
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
  </svg>
);
const MusicSVG = () => (
  <svg viewBox="0 0 24 24" style={{width:14,height:14,fill:'currentColor'}}>
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
  </svg>
);
const LocationSVG = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);
const VolumeOnSVG = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
  </svg>
);
const VolumeOffSVG = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
  </svg>
);
const WhatsAppSVG = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
  </svg>
);
const EyeSVG = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
  </svg>
);
const EyeSlashSVG = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
  </svg>
);

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function cleanDisplayTitle(title, fallback) {
  if (!title) return fallback || 'Réalisation sur-mesure';
  const lower = String(title).toLowerCase();
  if (
    lower.includes('enregistrement') ||
    lower.includes('screen') ||
    lower.includes('vid_') ||
    lower.includes('video_') ||
    lower.includes('mov_') ||
    lower.includes('mp4') ||
    lower.includes('.webm')
  ) {
    return fallback || 'Projet Artisan & Rénovation';
  }
  return title;
}

function renderFormattedCaption(text) {
  if (!text) return null;
  // Découpe par tokens : badges entre crochets [Tag], hashtags #tag, et texte standard
  const parts = text.split(/(\[[^\]]+\]|#[\w\u00C0-\u017F]+)/g);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith('[') && part.endsWith(']')) {
      return (
        <span
          key={i}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'rgba(212, 175, 55, 0.22)',
            border: '1px solid rgba(212, 175, 55, 0.55)',
            color: '#F6D365',
            padding: '1px 6px',
            borderRadius: 5,
            fontSize: '10.5px',
            fontWeight: 800,
            letterSpacing: '0.3px',
            margin: '0 3px 2px 0',
            verticalAlign: 'middle',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
          }}
        >
          {part}
        </span>
      );
    }
    if (part.startsWith('#')) {
      return (
        <span key={i} style={{ color: '#F6D365', fontWeight: 800, marginRight: 3 }}>
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function ReelItem({ item, isActive, shouldMount = true, index = 0, total = 1 }) {
  const { t } = useTranslation();
  const isPro = item.reelType === 'pro_project';
  const videoRef = useRef(null);
  const discRef = useRef(null);
  const tickerRef = useRef(null);
  const muteRef = useRef(null);

  const proProjectId = item.project_id || item.project?.id || item.id;
  const [liked, setLiked] = useState(() => {
    if (isPro) {
      if (item.is_liked !== undefined && item.is_liked !== null) return Boolean(item.is_liked);
      try {
        return localStorage.getItem(`piolo_liked_pro_${proProjectId}`) === '1';
      } catch (err) {
        void err;
        return false;
      }
    }
    return Boolean(item.is_favorite ?? item._liked);
  });
  const [count, setCount] = useState(() => Number(item.likes_count ?? item.favorites_count ?? item.likes ?? 0));
  const [likePending, setLikePending] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    try { return sessionStorage.getItem('piolo-discovery-muted') !== 'false'; } catch (err) { void err; return true; }
  });

  // Mode Écran Épuré (voir la vidéo à 100% sans écritures)
  const [isCleanView, setIsCleanView] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);

  // Barre de contrôle de lecture temporelle (Avancer / Reculer) & Buffer pour vidéos longues
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [seekFeedback, setSeekFeedback] = useState(null); // '+10s' ou '-10s'
  const [playFeedback, setPlayFeedback] = useState(null); // 'play' ou 'pause'

  // Pluie de cœurs interactifs jaunes dorés
  const [floatingHearts, setFloatingHearts] = useState([]);

  // Curseur Avant / Après en incrustation
  const beforeImage = item.project?.before_image_url || item.project?.beforeImage || item.project?.before_image_display || item.beforeImage || null;
  const [showBeforeSlider, setShowBeforeSlider] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);

  // Hotspots interactifs
  const rawMaterials = item.project?.materials || item.materials || [];
  const hotspots = Array.isArray(rawMaterials) ? rawMaterials : (typeof rawMaterials === 'string' ? rawMaterials.split(',') : []);
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  const [showBailleurModal, setShowBailleurModal] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Restriction pour BAILLEUR ET PRO (ARCHITECTE) sur les fiches de logements
  const isRestrictedRole = user?.role === 'BAILLEUR' || user?.is_bailleur || user?.role === 'ARCHITECTE' || user?.role === 'PRO' || user?.role === 'PROFESSIONNEL' || user?.is_architecte || user?.is_pro || Boolean(user?.professional_profile);

  const handleViewDetail = (e) => {
    if (!isPro && isRestrictedRole) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setShowBailleurModal(true);
    }
  };

  useEffect(() => {
    if (isActive && !isPro && item.id) {
      api.post(`/properties/${item.id}/view/`).catch(() => {});
      api.post(`/properties/${item.id}/discovery_view/`).catch(() => {});
    }
  }, [isActive, isPro, item.id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
    if (isActive && shouldMount) {
      const play = video.play();
      if (play) {
        play.then(() => {
          discRef.current?.classList.add('playing');
          tickerRef.current?.classList.add('playing');
        }).catch(() => {
          if (!video.muted) {
            video.muted = true;
            setIsMuted(true);
            video.play().then(() => {
              discRef.current?.classList.add('playing');
              tickerRef.current?.classList.add('playing');
            }).catch(() => {
              discRef.current?.classList.remove('playing');
              tickerRef.current?.classList.remove('playing');
            });
          }
        });
      }
    } else {
      video.pause();
      discRef.current?.classList.remove('playing');
      tickerRef.current?.classList.remove('playing');
      setShowBeforeSlider(false);
      setSelectedHotspot(null);
      setIsCleanView(false);
      setCaptionExpanded(false);
    }
  }, [isActive, isMuted, shouldMount]);

  // Suivi du temps et du buffer de la vidéo
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && !isScrubbing) {
      setCurrentTime(video.currentTime);
      handleProgress();
    }
  };

  const handleProgress = () => {
    const video = videoRef.current;
    if (video && video.buffered && video.buffered.length > 0 && video.duration) {
      try {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBufferedPercent((bufferedEnd / video.duration) * 100);
      } catch (err) { void err; }
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration || 0);
      handleProgress();
    }
  };

  const handleSeekChange = (e) => {
    const targetTime = Number(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  // Avancer / Reculer rapide (+10s / -10s optimisé pour vidéos de 2-3 min)
  const handleQuickSeek = (delta) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = Math.max(0, Math.min(video.duration || 100, video.currentTime + delta));
    video.currentTime = newTime;
    setCurrentTime(newTime);
    setSeekFeedback(delta > 0 ? '+10s' : '-10s');
    setTimeout(() => setSeekFeedback(null), 650);
  };

  // Clics intelligents & Double-tap interactif (Gauche: -10s, Droite: +10s, Centre: Like)
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);
  const clickCoordsRef = useRef({ x: 0, y: 0, pctX: 0.5 });

  const handleScreenClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) return;

    if (isCleanView) {
      setIsCleanView(false);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pctX = x / rect.width;

    clickCoordsRef.current = { x, y, pctX };
    clickCountRef.current += 1;

    if (clickCountRef.current >= 2) {
      clearTimeout(clickTimerRef.current);
      clickCountRef.current = 0;

      // Double-tap à gauche (< 35% de l'écran) -> {t('discovery.rewind_10s')}
      if (pctX < 0.35) {
        handleQuickSeek(-10);
        return;
      }
      // Double-tap à droite (> 65% de l'écran) -> {t('discovery.forward_10s')}
      if (pctX > 0.65) {
        handleQuickSeek(10);
        return;
      }

      // Double-tap au centre -> Like + Pluie de cœurs dorés
      const newHeartId = Date.now() + Math.random();
      const rot = (Math.random() - 0.5) * 45;
      setFloatingHearts((prev) => [
        ...prev,
        { id: newHeartId, x, y, rot }
      ]);
      setTimeout(() => {
        setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeartId));
      }, 900);

      if (!liked) {
        doToggleLike(true);
      }
      return;
    }

    clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      if (clickCountRef.current === 1) {
        const video = videoRef.current;
        if (video) {
          if (video.muted) {
            setIsMuted(false);
            video.muted = false;
            try { sessionStorage.setItem('piolo-discovery-muted', 'false'); } catch (err) { void err; }
            showMute(false);
          } else {
            if (video.paused) {
              video.play();
              discRef.current?.classList.add('playing');
              tickerRef.current?.classList.add('playing');
              setPlayFeedback('play');
            } else {
              video.pause();
              discRef.current?.classList.remove('playing');
              tickerRef.current?.classList.remove('playing');
              setPlayFeedback('pause');
            }
            setTimeout(() => setPlayFeedback(null), 600);
          }
        }
      }
      clickCountRef.current = 0;
    }, 280);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    try { sessionStorage.setItem('piolo-discovery-muted', String(nextMuted)); } catch (err) { void err; }
    showMute(nextMuted);
  };

  const showMute = (muted) => {
    const el = muteRef.current;
    if (!el) return;
    el.style.display = 'block';
    el.innerHTML = muted
      ? '<svg viewBox="0 0 24 24" fill="currentColor" style="width:30px;height:30px"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="currentColor" style="width:30px;height:30px"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
    setTimeout(() => { if (el) el.style.display = 'none'; }, 800);
  };

  const doToggleLike = (force = false) => {
    if (isPro) {
      if (!proProjectId) return;
      if (force && liked) return;
      if (likePending) return;

      const newLikedState = force ? true : !liked;
      setLiked(newLikedState);
      setCount((prev) => (newLikedState ? prev + 1 : Math.max(0, prev - 1)));
      try {
        localStorage.setItem(`piolo_liked_pro_${proProjectId}`, newLikedState ? '1' : '0');
      } catch (err) { void err; }

      setLikePending(true);
      professionalsApi.toggleProjectLike(proProjectId)
        .then(({ data }) => {
          if (data && data.likes_count !== undefined) {
            setCount(Number(data.likes_count));
          }
          if (data && data.is_liked !== undefined) {
            setLiked(Boolean(data.is_liked));
            try {
              localStorage.setItem(`piolo_liked_pro_${proProjectId}`, data.is_liked ? '1' : '0');
            } catch {}
          }
        })
        .catch((err) => {
          console.error("Erreur like pro project:", err);
        })
        .finally(() => setLikePending(false));
      return;
    }
    if (!isAuthenticated) {
      navigate('/login?next=' + window.location.pathname);
      return;
    }
    if ((force && liked) || likePending) return;
    setLikePending(true);
    api.post(`/properties/${item.id}/favorite/`, {})
      .then(({ data }) => {
        if (data.ok) {
          setLiked(Boolean(data.is_favorite));
          if (Number.isFinite(Number(data.count))) setCount(Number(data.count));
          api.post(`/properties/${item.id}/discovery_like/`).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLikePending(false));
  };

  const shareItem = () => {
    const url = isPro 
      ? window.location.origin + `/architectes`
      : window.location.origin + `/properties/${item.slug}/`;
    if (navigator.share) {
      navigator.share({ title: item.title, text: 'Découvrez cette vidéo sur Piolo !', url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => alert('Lien copié dans le presse-papier !'));
    }
  };

  const videoSrc = item.video_reel ? getMediaUrl(item.video_reel, null) : null;
  const posterSrc = getMediaUrl(item.cover_image || item.main_image || item.image, '');
  
  const displayTitle = isPro 
    ? cleanDisplayTitle(item.project?.title || item.title, 'Projet Artisan & Rénovation')
    : item.title;

  const authorName = isPro 
    ? (item.author?.name || item.project?.professional?.business_name || `${t('discovery.certified_artisan')} Piolo`)
    : `${item.owner?.first_name || ''} ${item.owner?.last_name || 'Hôte Piolo'}`.trim();
  
  const authorPhone = isPro
    ? (item.author?.phone || item.author?.whatsapp || item.project?.professional?.whatsapp || '+237699001122')
    : (item.owner?.phone || '+237699001122');

  const rawCaption = item.reel_description || item.caption || (isPro ? (item.project?.description || item.description) : (item.description || ''));
  const captionText = typeof rawCaption === 'string' ? rawCaption.trim() : '';

  const initials = isPro
    ? (authorName || 'PR').substring(0, 2).toUpperCase()
    : `${(item.owner?.first_name || '?')[0]}${(item.owner?.last_name || '')[0] || ''}`.toUpperCase();

  const priceFormatted = item.price ? new Intl.NumberFormat('fr-FR').format(item.price) : null;
  const detailUrl = isPro ? `/architectes` : `/properties/${item.slug || item.id}`;

  return (
    <div className="reel-item" data-id={item.id} data-type={item.reelType}>
      <div className="reel-content" onClick={handleScreenClick}>
        
        {/* Pluie de cœurs dorés/jaunes style TikTok */}
        {floatingHearts.map((h) => (
          <div
            key={h.id}
            className="floating-tap-heart"
            style={{
              left: h.x,
              top: h.y,
              transform: `translate(-50%, -50%) rotate(${h.rot}deg)`
            }}
          >
            <svg viewBox="0 0 24 24" width="48" height="48" fill="#F6D365" style={{ filter: 'drop-shadow(0 4px 10px rgba(212,175,55,0.85))' }}>
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
            </svg>
          </div>
        ))}

        {/* Feedback Visuel Avancer / Reculer */}
        {seekFeedback && (
          <div className="seek-feedback-badge">
            <span>{seekFeedback}</span>
          </div>
        )}

        {/* Feedback Play / Pause */}
        {playFeedback && (
          <div className="seek-feedback-badge" style={{ fontSize: 26 }}>
            {playFeedback === 'play' ? '▶' : '❚❚'}
          </div>
        )}

        {/* Mute indicator */}
        <div ref={muteRef} className="mute-indicator" />

        {/* Vidéo HD avec Virtual Windowing (Seulement monté pour les éléments visibles/proches) */}
        {shouldMount && videoSrc ? (
          <video
            ref={videoRef}
            className="reel-video"
            src={videoSrc}
            loop
            playsInline
            webkit-playsinline="true"
            x5-playsinline="true"
            preload="auto"
            muted={isMuted}
            poster={posterSrc || undefined}
            onTimeUpdate={handleTimeUpdate}
            onProgress={handleProgress}
            onLoadedMetadata={handleLoadedMetadata}
            onLoadedData={() => setVideoReady(true)}
            onCanPlay={() => setVideoReady(true)}
            onPlaying={() => setVideoReady(true)}
            onError={() => setVideoReady(true)}
          />
        ) : (
          <div className="reel-video-placeholder" style={{ width: '100%', height: '100%', position: 'relative', background: '#0F0D09' }}>
            {posterSrc && (
              <img
                src={posterSrc}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.85)' }}
              />
            )}
          </div>
        )}
        {!videoReady && shouldMount && videoSrc && <div className="reel-loading"><span /></div>}

        {/* CURSEUR AVANT / APRÈS EN INCRUSTATION SUR LA VIDÉO */}
        {beforeImage && showBeforeSlider && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 35,
              overflow: 'hidden',
              pointerEvents: 'auto'
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${beforeImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
              }}
            />

            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${sliderPosition}%`,
                width: 3,
                background: '#D4AF37',
                boxShadow: '0 0 10px rgba(0,0,0,0.8)',
                zIndex: 40
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: '#D4AF37',
                  color: '#0F0D09',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 12,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.6)',
                  cursor: 'ew-resize'
                }}
              >
                ⇄
              </div>
            </div>

            <div style={{ position: 'absolute', top: 56, left: 16, background: 'rgba(0,0,0,0.75)', color: '#FFF', padding: '3px 8px', borderRadius: 6, fontSize: 10.5, fontWeight: 800 }}>
              Avant travaux
            </div>
            <div style={{ position: 'absolute', top: 56, right: 16, background: 'rgba(46,204,113,0.9)', color: '#FFF', padding: '3px 8px', borderRadius: 6, fontSize: 10.5, fontWeight: 800 }}>
              Vidéo Après
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: 'ew-resize',
                width: '100%',
                height: '100%',
                zIndex: 50
              }}
            />
          </div>
        )}

        {/* BOUTON DISCRET MODE ÉCRAN ÉPURÉ (CLEAN VIEW) + AVANT/APRÈS EN HAUT À DROITE */}
        <div style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 24px) + 64px)', right: 14, zIndex: 45, display: 'flex', gap: 6, alignItems: 'center' }}>
          
          {/* BOUTON MODE ÉCRAN ÉPURÉ */}
          <button
            type="button"
            title={isCleanView ? "Afficher les informations" : "Mode écran épuré (masquer les écritures)"}
            onClick={(e) => {
              e.stopPropagation();
              setIsCleanView(!isCleanView);
            }}
            style={{
              background: isCleanView ? 'linear-gradient(135deg, #D4AF37, #AA820A)' : 'rgba(0,0,0,0.55)',
              color: isCleanView ? '#0F0D09' : '#FFF',
              border: '1px solid rgba(255,255,255,0.25)',
              width: 32,
              height: 32,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              transition: 'all 0.2s'
            }}
          >
            {isCleanView ? <EyeSlashSVG /> : <EyeSVG />}
          </button>

          {/* BOUTON AVANT/APRÈS */}
          {beforeImage && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowBeforeSlider(!showBeforeSlider);
              }}
              style={{
                background: showBeforeSlider ? 'linear-gradient(135deg, #D4AF37, #AA820A)' : 'rgba(0,0,0,0.55)',
                color: showBeforeSlider ? '#0F0D09' : '#FFF',
                border: '1px solid rgba(255,255,255,0.25)',
                padding: '5px 10px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                backdropFilter: 'blur(8px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                transition: 'all 0.2s'
              }}
            >
              <span>{showBeforeSlider ? 'Fermer Avant/Après' : '✨ Avant / Après'}</span>
            </button>
          )}
        </div>

        {/* HOTSPOTS MATÉRIAUX & ÉQUIPEMENTS (PROJETS ARTISANS) */}
        {isPro && hotspots.length > 0 && !isCleanView && (
          <div style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 24px) + 110px)', left: 14, zIndex: 40, display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: '75%' }}>
            {hotspots.map((mat, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedHotspot(selectedHotspot === mat ? null : mat);
                }}
                style={{
                  background: selectedHotspot === mat ? '#D4AF37' : 'rgba(0,0,0,0.6)',
                  color: selectedHotspot === mat ? '#0F0D09' : '#FFF',
                  border: '1px solid rgba(212,175,55,0.6)',
                  borderRadius: 12,
                  padding: '3px 8px',
                  fontSize: 10.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  backdropFilter: 'blur(6px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  animation: 'pulseHotspot 2.5s infinite'
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: selectedHotspot === mat ? '#0F0D09' : '#D4AF37' }} />
                <span>{typeof mat === 'string' ? mat.trim() : mat}</span>
              </button>
            ))}
          </div>
        )}

        {/* MODAL POP-UP DU HOTSPOT SÉLECTIONNÉ */}
        {selectedHotspot && !isCleanView && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(env(safe-area-inset-top, 24px) + 155px)',
              left: 14,
              right: 14,
              zIndex: 45,
              background: 'rgba(15,13,9,0.92)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid #D4AF37',
              borderRadius: 14,
              padding: '12px 14px',
              color: '#FFF',
              boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ fontSize: 11, color: '#D4AF37', fontWeight: 800, textTransform: 'uppercase' }}>
                Composant certifié utilisé
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedHotspot(null);
                }}
                style={{ background: 'transparent', border: 'none', color: '#FFF', fontSize: 12, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#FFF', marginBottom: 8 }}>
              {selectedHotspot}
            </div>
            <a
              href={`https://wa.me/${authorPhone.replace(/[^0-9]/g, '')}?text=Bonjour%20${encodeURIComponent(authorName)},%20je%20souhaite%20un%20devis%20concernant%20le%20matériau%20"${encodeURIComponent(selectedHotspot)}"%20vu%20sur%20votre%20vidéo%20Piolo.`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'linear-gradient(135deg, #D4AF37, #AA820A)',
                color: '#0F0D09',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 800,
                textDecoration: 'none'
              }}
            >
              <span>{t('discovery.quote_for_material')}</span>
            </a>
          </div>
        )}

        {/* Overlay d'information et d'actions */}
        <div className={`reel-overlay ${isCleanView ? 'clean-view-active' : ''}`} style={{ opacity: isCleanView ? 0 : 1, transition: 'opacity 0.25s ease', pointerEvents: isCleanView ? 'none' : 'auto' }}>
          <div className="reel-info">
            <div className="author-row">
              <div className="author-details">
                <span className="author-name">{authorName}</span>
                <span className="author-sub">{isPro ? (item.trade || 'Artisan Qualifié Piolo') : 'Hôte vérifié'}</span>
              </div>
            </div>

            <div className="r-title">{displayTitle}</div>
            
            {priceFormatted && (
              <div className="r-price">{priceFormatted} FCFA <span style={{fontSize:12, fontWeight:500, color:'#ccc'}}>{item.transaction_type === 'VENTE' ? '' : '/ mois'}</span></div>
            )}

            {(item.city || item.neighborhood) && (
              <div className="r-loc">
                <LocationSVG />
                <span>{[item.neighborhood, item.city].filter(Boolean).join(', ')}</span>
              </div>
            )}

            {/* Légende & Description Pro avec Badges Certifiés et Hashtags */}
            {captionText && (
              <div
                className="r-caption-container"
                style={{
                  margin: '6px 0 8px',
                  maxWidth: '85%',
                  fontSize: '11.5px',
                  lineHeight: '1.45',
                  color: 'rgba(255, 255, 255, 0.95)',
                  textShadow: '0 1px 4px rgba(0,0,0,0.85)',
                  cursor: captionText.length > 70 ? 'pointer' : 'default'
                }}
                onClick={(e) => {
                  if (captionText.length > 70) {
                    e.stopPropagation();
                    setCaptionExpanded(prev => !prev);
                  }
                }}
              >
                <div
                  style={{
                    display: captionExpanded ? 'block' : '-webkit-box',
                    WebkitLineClamp: captionExpanded ? 'unset' : 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {renderFormattedCaption(captionText)}
                </div>
                {captionText.length > 70 && (
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: 2,
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#F6D365',
                      opacity: 0.95
                    }}
                  >
                    {captionExpanded ? 'Moins' : '... plus'}
                  </span>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
              <Link to={detailUrl} className="btn-view" onClick={handleViewDetail}>
                {isPro ? 'Voir les artisans' : 'Voir le logement'}
              </Link>
            </div>

            {/* Son en bas style TikTok */}
            <div className="sound-ticker" style={{ marginTop: 10 }}>
              <MusicSVG />
              <div className="ticker-wrap">
                <span ref={tickerRef} className="ticker-text">
                  Son original — {authorName} • Réalisation certifiée Piolo Immersion
                </span>
              </div>
            </div>
          </div>

          <div className="reel-actions">
            {/* Cercle Initiales de l'auteur / hôte (comme avant) */}
            <div className="r-av" title={authorName}>
              {initials}
            </div>

            {/* Bouton Like / Favori */}
            <button className={`r-action-btn ${liked ? 'liked' : ''}`} onClick={() => doToggleLike(false)} aria-label="J'aime">
              <div className="heart-icon-wrap" style={{ transform: liked ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                {liked ? (
                  <svg viewBox="0 0 24 24" style={{width:26,height:26,fill:'#F6D365',filter:'drop-shadow(0px 2px 8px rgba(212,175,55,0.8))'}}>
                    <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
                  </svg>
                ) : (
                  <HeartSVG />
                )}
              </div>
              <span>{count}</span>
            </button>

            {/* Bouton Partager */}
            <button className="r-action-btn" onClick={shareItem} aria-label="Partager">
              <ShareSVG />
              <span>{t('discovery.share')}</span>
            </button>

            {/* Volume toggle */}
            <button className="r-action-btn" onClick={toggleMute} aria-label={isMuted ? 'Activer le son' : 'Couper le son'}>
              <div className="volume-icon" style={{ background: 'rgba(255,255,255,0.15)', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F6D365' }}>
                {isMuted ? <VolumeOffSVG /> : <VolumeOnSVG />}
              </div>
              <span style={{ marginTop: 2 }}>{isMuted ? 'Son off' : 'Son on'}</span>
            </button>

            {/* Music disc */}
            <div ref={discRef} className="music-disc" style={{ marginTop: 12 }}>
              <MusicSVG />
            </div>
          </div>
        </div>

        {/* BARRE DE CONTRÔLE DE LECTURE DISCRÈTE POUR VIDÉOS DE 2 À 3 MINUTES */}
        <div
          className="discrete-timeline-container"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="timeline-hover-time">
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5 }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <div className="quick-seek-buttons">
              <span onClick={() => handleQuickSeek(-10)} title="{t('discovery.rewind_10s')}">⟲ 10s</span>
              <span onClick={() => handleQuickSeek(10)} title="{t('discovery.forward_10s')}">10s ⟳</span>
            </div>
          </div>

          <div className="timeline-track">
            {/* Barre de préchargement / mémoire buffer */}
            <div
              className="timeline-buffer"
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: `${Math.min(100, Math.max(0, bufferedPercent))}%`,
                background: 'rgba(255,255,255,0.25)',
                borderRadius: 4,
                transition: 'width 0.3s ease'
              }}
            />
            {/* Barre de lecture active */}
            <div
              className="timeline-fill"
              style={{
                position: 'relative',
                zIndex: 2,
                width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`
              }}
            />
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onMouseDown={() => setIsScrubbing(true)}
              onMouseUp={() => setIsScrubbing(false)}
              onTouchStart={() => setIsScrubbing(true)}
              onTouchEnd={() => setIsScrubbing(false)}
              onChange={handleSeekChange}
              className="timeline-range-input"
            />
          </div>
        </div>

      </div>

      {/* Modale d'avertissement Bailleur & Professionnel */}
      {showBailleurModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10005,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: '#141210', border: '1.5px solid rgba(212,175,55,0.4)',
            borderRadius: 24, padding: '28px 24px', maxWidth: 420, width: '100%',
            textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: 'rgba(212,175,55,0.15)',
              color: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', border: '1px solid rgba(212,175,55,0.3)'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            </div>
            <h3 style={{ fontFamily: "'Poppins', sans-serif", color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
              Compte Locataire Requis
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13.5, lineHeight: 1.5, marginBottom: 24, fontFamily: "'DM Sans', sans-serif" }}>
              En tant que professionnel ou bailleur, pour consulter les détails et les coordonnées d'un logement, vous devez créer ou utiliser un compte Locataire.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={() => navigate('/login?tab=register&role=LOCATAIRE')}
                style={{
                  padding: '12px 20px', borderRadius: 12, border: 0,
                  background: 'linear-gradient(135deg, #D4AF37, #F6D365)', color: '#0F0D09',
                  fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 13.5, cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(212,175,55,0.4)'
                }}
              >
                Créer un compte Locataire
              </button>
              <button
                type="button"
                onClick={() => setShowBailleurModal(false)}
                style={{
                  padding: '12px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)',
                  background: 'transparent', color: '#fff',
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13.5, cursor: 'pointer'
                }}
              >
                Continuer la navigation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DiscoveryPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const singlePropParam = searchParams.get('prop');
  const cachedDiscovery = !singlePropParam ? cacheManager.get('discovery_reels_data') : null;

  const [allReels, setAllReels] = useState(() => cachedDiscovery || []);
  const [reels, setReels] = useState(() => cachedDiscovery || []);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'properties' | 'pros'
  const [loading, setLoading] = useState(() => !cachedDiscovery);
  const [active, setActive] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('reel-modal-open');
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#000000';
    document.documentElement.style.backgroundColor = '#000000';

    return () => {
      document.body.classList.remove('reel-modal-open');
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.backgroundColor = prevHtmlBg;
    };
  }, []);

  useEffect(() => {
    const existing = !singlePropParam ? cacheManager.get('discovery_reels_data') : null;
    if (!existing) setLoading(true);

    Promise.all([
      propertiesApi.discovery().catch(() => ({ data: [] })),
      professionalsApi.projects().catch(() => ({ data: [] }))
    ]).then(([propRes, proRes]) => {
      const propData = propRes.data?.results ?? propRes.data ?? [];
      const propItems = propData.map((p) => ({
        ...p,
        reelType: 'property'
      }));

      const proData = proRes.data?.results ?? proRes.data ?? [];
      const proItems = [];
      proData.forEach((proj) => {
        (proj.videos || []).forEach((vid, vIdx) => {
          const url = typeof vid === 'string' ? vid : vid.url;
          const rawTitle = typeof vid === 'object' ? (vid.title || proj.title) : proj.title;
          const cleanTitle = cleanDisplayTitle(rawTitle, proj.title || 'Projet de Rénovation');
          if (url) {
            proItems.push({
              id: proj.id ? `pro-${proj.id}-${vIdx}` : `pro-${proj.title}-${vIdx}`,
              project_id: proj.id,
              reelType: 'pro_project',
              video_reel: url,
              title: cleanTitle,
              trade: proj.category || 'Menuiserie & Habitat',
              city: proj.city || 'Yaoundé',
              author: proj.author || proj.professional || { name: t('discovery.certified_artisan'), phone: '+237699001122' },
              project: proj,
              likes_count: Number(proj.likes_count ?? proj.likes ?? 0),
              is_liked: Boolean(proj.is_liked),
              description: proj.description || 'Chantier réalisé avec soin par un artisan certifié Piolo.'
            });
          }
        });
      });

      const mixed = [];
      const maxLen = Math.max(propItems.length, proItems.length);
      for (let i = 0; i < maxLen; i++) {
        if (i < propItems.length) mixed.push(propItems[i]);
        if (i < proItems.length) mixed.push(proItems[i]);
      }

      if (!singlePropParam) {
        cacheManager.set('discovery_reels_data', mixed, 180000);
      }

      if (singlePropParam) {
        const normalize = (s) => String(s || '').toLowerCase().replace(/[\s_-]+/g, '-').trim();
        const needle = normalize(singlePropParam);
        const matched = mixed.filter((r) =>
          normalize(r.slug) === needle ||
          String(r.id) === String(singlePropParam)
        );
        if (matched.length > 0) {
          setAllReels(matched);
          setReels(matched);
          return;
        }
      }

      setAllReels(mixed);
      setReels(mixed);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, [singlePropParam]);

  const handleFilterChange = (type) => {
    setFilterType(type);
    setActive(0);
    if (type === 'all') {
      setReels(allReels);
    } else if (type === 'properties') {
      setReels(allReels.filter((r) => r.reelType === 'property'));
    } else if (type === 'pros') {
      setReels(allReels.filter((r) => r.reelType === 'pro_project'));
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !reels.length) return;
    const items = container.querySelectorAll('.reel-item');
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Array.from(items).indexOf(entry.target);
            setActive(idx);
          }
        });
      },
      { root: container, rootMargin: '0px', threshold: 0.6 }
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [reels]);

  // Navigation clavier fluide (Flèches Haut/Bas, Espace, PageUp/PageDown)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowDown', 'PageDown', 'j', ' '].includes(e.key)) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        const container = containerRef.current;
        if (container) {
          const nextIdx = Math.min(active + 1, reels.length - 1);
          const items = container.querySelectorAll('.reel-item');
          if (items[nextIdx]) {
            items[nextIdx].scrollIntoView({ behavior: 'smooth' });
          }
        }
      } else if (['ArrowUp', 'PageUp', 'k'].includes(e.key)) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        const container = containerRef.current;
        if (container) {
          const prevIdx = Math.max(active - 1, 0);
          const items = container.querySelectorAll('.reel-item');
          if (items[prevIdx]) {
            items[prevIdx].scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, reels.length]);

  if (loading) return (
    <div style={{ height:'100vh', background:'#000', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:44, height:44, borderRadius:'50%', border:'4px solid rgba(212,175,55,0.2)', borderTopColor:'#D4AF37', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="discovery-page-scope">
      <style>{`
        .discovery-page-scope { position: fixed; inset: 0; top: 0; left: 0; right: 0; bottom: 0; width: 100%; width: 100vw; height: 100%; background: #000; overflow: hidden; z-index: 999999; display: flex; justify-content: center; align-items: center; margin: 0; padding: 0; touch-action: pan-y; }
        .decouverte-container { height: 100%; width: 100%; max-width: 480px; margin: 0 auto; overflow-y: scroll; scroll-snap-type: y mandatory; -webkit-overflow-scrolling: touch; position: relative; -ms-overflow-style: none; scrollbar-width: none; background: #000; touch-action: pan-y; overscroll-behavior-y: contain; }
        .decouverte-container::-webkit-scrollbar { display: none; }
        .reel-item { height: 100%; min-height: 100%; width: 100%; scroll-snap-align: start; scroll-snap-stop: always; position: relative; background: #000; display: flex; justify-content: center; align-items: center; overflow: hidden; touch-action: pan-y; flex-shrink: 0; }
        .reel-content { width: 100%; height: 100%; position: relative; touch-action: pan-y; }
        
        /* Vidéo HD 4K Crisp Optimization - Plein écran intégral */
        .reel-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          cursor: pointer;
          image-rendering: -webkit-optimize-contrast;
          image-rendering: high-quality;
          transform: translateZ(0);
          will-change: transform;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        
        .reel-loading { position:absolute; inset:0; z-index:8; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.22); pointer-events:none; }
        .reel-loading span { width:34px; height:34px; border:3px solid rgba(255,255,255,.3); border-top-color:#D4AF37; border-radius:50%; animation:spin .8s linear infinite; }
        
        /* Overlay textuel transparent sans masque noir opaque */
        .reel-overlay { position:absolute; bottom:0; left:0; right:0; padding:80px 16px max(calc(env(safe-area-inset-bottom, 0px) + 32px), 36px) 16px; background:linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 45%, transparent 100%); pointer-events:none; display:flex; justify-content:space-between; align-items:flex-end; }
        .reel-info { flex:1; pointer-events:auto; padding-right:14px; }
        .reel-actions { display:flex; flex-direction:column; align-items:center; gap:14px; pointer-events:auto; }
        
        .r-title { color:#fff; font-family:'Poppins',sans-serif; font-size:17px; font-weight:700; margin-bottom:4px; text-shadow:1px 1px 4px rgba(0,0,0,0.9); }
        .r-price { color:#D4AF37; font-family:'Poppins',sans-serif; font-size:21px; font-weight:800; margin-bottom:6px; text-shadow:1px 1px 4px rgba(0,0,0,0.9); }
        .r-loc { color:#ddd; font-family:'DM Sans',sans-serif; font-size:13px; margin-bottom:10px; display:flex; align-items:center; gap:5px; text-shadow:1px 1px 3px rgba(0,0,0,0.9); }
        .btn-view { display:inline-block; background:linear-gradient(135deg, #D4AF37 0%, #F6D365 100%); color:#0F0D09; padding:9px 22px; border-radius:24px; font-family:'Poppins',sans-serif; font-weight:800; font-size:13px; text-decoration:none; box-shadow:0 4px 15px rgba(212,175,55,0.45); transition:all 0.2s ease; }
        .btn-view:hover { transform:scale(1.03); filter:brightness(1.08); }
        
        /* Actions bar latérale & Cercle Initials */
        .r-av {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid #D4AF37;
          background: #1A1713;
          color: #D4AF37;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: 13.5px;
          margin-bottom: 2px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.6);
          text-shadow: none;
          transition: transform 0.2s;
        }
        .r-action-btn { background:none; border:none; color:#fff; display:flex; flex-direction:column; align-items:center; gap:4px; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:11.5px; font-weight:600; text-shadow:0 1px 4px rgba(0,0,0,0.8); }
        .r-action-btn:active { transform: scale(0.92); }
        .r-action-btn.liked { color:#F6D365; font-weight:700; }
        .r-action-btn.liked svg { fill:#F6D365 !important; }
        
        /* Auteur / Détails */
        .author-row { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
        .author-details { display:flex; flex-direction:column; }
        .author-name { color:#fff; font-family:'Poppins',sans-serif; font-weight:700; font-size:13.5px; text-shadow:1px 1px 3px rgba(0,0,0,0.9); }
        .author-sub { color:#F6D365; font-size:11px; font-weight:600; text-shadow:1px 1px 3px rgba(0,0,0,0.9); }

        /* Floating double-tap heart */
        @keyframes floatHeart {
          0% { transform: translate(-50%, -50%) scale(0.4) rotate(0deg); opacity: 0; }
          40% { transform: translate(-50%, -50%) scale(1.3) rotate(-10deg); opacity: 1; }
          80% { transform: translate(-50%, -100px) scale(1.1) rotate(15deg); opacity: 0.9; }
          100% { transform: translate(-50%, -160px) scale(0.8) rotate(20deg); opacity: 0; }
        }
        .floating-tap-heart {
          position: absolute;
          pointer-events: none;
          z-index: 60;
          animation: floatHeart 0.9s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        /* Seek feedback badge */
        @keyframes popBadge {
          0% { transform: translate(-50%, -50%) scale(0.7); opacity: 0; }
          40% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0.95; }
        }
        .seek-feedback-badge {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 55;
          background: rgba(15,13,9,0.78);
          backdrop-filter: blur(10px);
          border: 1.5px solid rgba(212,175,55,0.6);
          color: #F6D365;
          padding: 8px 18px;
          border-radius: 20px;
          font-family: 'Poppins', sans-serif;
          font-size: 16px;
          font-weight: 800;
          box-shadow: 0 8px 24px rgba(0,0,0,0.6);
          animation: popBadge 0.3s ease;
          pointer-events: none;
        }

        /* Music disc spin */
        @keyframes discSpin { to { transform: rotate(360deg); } }
        .music-disc {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #15130F;
          border: 2.5px solid #28241D;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #D4AF37;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        }
        .music-disc.playing {
          animation: discSpin 4s linear infinite;
        }

        /* Sound ticker */
        .sound-ticker {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255,255,255,0.75);
          font-size: 11px;
          max-width: 240px;
          overflow: hidden;
        }
        .ticker-wrap {
          white-space: nowrap;
          overflow: hidden;
        }
        .ticker-text {
          display: inline-block;
          padding-left: 100%;
        }
        .ticker-text.playing {
          animation: tickerScroll 12s linear infinite;
        }
        @keyframes tickerScroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); }
        }

        /* Mute indicator popup */
        .mute-indicator {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(0,0,0,0.75);
          color: #fff;
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 50;
          backdrop-filter: blur(6px);
          pointer-events: none;
        }

        /* BARRE DE CONTRÔLE DE LECTURE DISCRÈTE */
        .discrete-timeline-container {
          position: absolute;
          bottom: max(calc(env(safe-area-inset-bottom, 0px) + 6px), 8px);
          left: 14px;
          right: 14px;
          z-index: 30;
          display: flex;
          flex-direction: column;
          gap: 4px;
          pointer-events: auto;
        }
        .timeline-hover-time {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: rgba(255,255,255,0.8);
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          text-shadow: 0 1px 3px rgba(0,0,0,0.8);
        }
        .quick-seek-buttons {
          display: flex;
          gap: 8px;
        }
        .quick-seek-buttons span {
          background: rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.2);
          padding: 2px 7px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 10px;
          font-weight: 700;
          color: #F6D365;
          backdrop-filter: blur(4px);
          transition: all 0.15s;
        }
        .quick-seek-buttons span:active {
          transform: scale(0.9);
          background: #D4AF37;
          color: #0F0D09;
        }
        .timeline-track {
          position: relative;
          height: 4px;
          background: rgba(255,255,255,0.25);
          border-radius: 4px;
          overflow: hidden;
          transition: height 0.2s;
        }
        .discrete-timeline-container:hover .timeline-track {
          height: 6px;
        }
        .timeline-fill {
          height: 100%;
          background: linear-gradient(90deg, #D4AF37, #F6D365);
          border-radius: 4px;
        }
        .timeline-range-input {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
          z-index: 10;
        }

        @keyframes pulseHotspot {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        @media (max-width: 768px) {
          .decouverte-container {
            max-width: 100vw !important;
            width: 100vw !important;
            height: 100% !important;
            height: 100dvh !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* HEADER ÉPURÉ & MODERNE (LOGO PIOLO + FILTRES MINIMALISTES) */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 24px) + 14px)',
          left: 0,
          right: 0,
          zIndex: 50,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 16px',
          maxWidth: 480,
          margin: '0 auto',
          pointerEvents: 'none'
        }}
      >
        {/* LOGO PIOLO OFFICIEL RESTAURÉ */}
        <Link to="/" style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center' }}>
          <img
            src={LOGO_URL}
            alt="Logo Piolo"
            style={{
              height: 32,
              filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.7))',
              objectFit: 'contain'
            }}
          />
        </Link>

        {/* FILTRES MINIMALISTES DORÉS (TOUT / LOGEMENTS / ARTISANS) */}
        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(15,13,9,0.75)',
            border: '1px solid rgba(212,175,55,0.4)',
            borderRadius: 24,
            padding: '3px 4px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
          }}
        >
          <button
            onClick={() => handleFilterChange('all')}
            style={{
              background: filterType === 'all' ? 'linear-gradient(135deg, #D4AF37, #AA820A)' : 'transparent',
              color: filterType === 'all' ? '#0F0D09' : 'rgba(255,255,255,0.85)',
              border: 'none',
              padding: '5px 12px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Tout
          </button>
          <button
            onClick={() => handleFilterChange('properties')}
            style={{
              background: filterType === 'properties' ? 'linear-gradient(135deg, #D4AF37, #AA820A)' : 'transparent',
              color: filterType === 'properties' ? '#0F0D09' : 'rgba(255,255,255,0.85)',
              border: 'none',
              padding: '5px 12px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Logements
          </button>
          <button
            onClick={() => handleFilterChange('pros')}
            style={{
              background: filterType === 'pros' ? 'linear-gradient(135deg, #D4AF37, #AA820A)' : 'transparent',
              color: filterType === 'pros' ? '#0F0D09' : 'rgba(255,255,255,0.85)',
              border: 'none',
              padding: '5px 12px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Artisans
          </button>
        </div>
      </div>

      <div className="decouverte-container" ref={containerRef}>
        {reels.map((item, idx) => (
          <ReelItem
            key={item.id || idx}
            item={item}
            isActive={idx === active}
            shouldMount={Math.abs(idx - active) <= 1}
            index={idx}
            total={reels.length}
          />
        ))}
      </div>
    </div>
  );
}
