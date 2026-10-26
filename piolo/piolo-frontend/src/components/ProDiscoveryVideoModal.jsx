import { useTranslation } from 'react-i18next';
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertiesApi } from '../services/api';

/**
 * Mode Découverte Vidéo Immersif Piolo (Reels)
 * Permet aux locataires, bailleurs et clients de parcourir les vidéos de logements ET de chantiers professionnels
 * 100% épuré, sans émojis, avec typographie et icônes SVG haute fidélité.
 */
export default function ProDiscoveryVideoModal({
  projects = [],
  initialIndex = 0,
  onClose,
  onRequestQuote,
  onSelectProject
}) {
  const { t } = useTranslation();
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'pros' | 'properties'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);

  // Charger les vidéos de chantiers passées en props + les vidéos de logements depuis l'API
  useEffect(() => {
    // 1. Extraire vidéos pros
    const proList = [];
    projects.forEach((proj) => {
      (proj.videos || []).forEach((vid, vIdx) => {
        const url = typeof vid === 'string' ? vid : vid.url;
        const rawTitle = typeof vid === 'object' ? (vid.title || proj.title) : proj.title;
        const cleanTitle = (rawTitle && !rawTitle.toLowerCase().includes('enregistrement') && !rawTitle.toLowerCase().includes('screen') && !rawTitle.toLowerCase().includes('vid_') && !rawTitle.toLowerCase().includes('video_') && !rawTitle.toLowerCase().includes('.mp4'))
          ? rawTitle
          : (proj.title || 'Projet de Rénovation');
        const desc = typeof vid === 'object' ? (vid.description || proj.description) : proj.description;
        if (url) {
          proList.push({
            id: `pro-${proj.id || proj.title}-${vIdx}`,
            itemType: 'pro',
            url,
            title: cleanTitle,
            trade: proj.category || 'Menuiserie & Habitat',
            city: proj.city || 'Yaoundé',
            description: desc,
            authorName: proj.author?.name || proj.professional?.business_name || 'Artisan Certifié Piolo',
            authorPhone: proj.author?.phone || proj.author?.whatsapp || proj.professional?.whatsapp || '+237699001122',
            project: proj
          });
        }
      });
    });

    // 2. Charger les logements avec vidéos
    propertiesApi.discovery()
      .then(({ data }) => {
        const propData = data.results ?? data ?? [];
        const propList = propData.map((p) => ({
          id: `prop-${p.id}`,
          itemType: 'property',
          url: p.video_reel,
          title: p.title,
          trade: p.property_type || 'Logement',
          city: `${p.city || 'Yaoundé'}${p.neighborhood ? `, ${p.neighborhood}` : ''}`,
          price: p.price ? new Intl.NumberFormat('fr-FR').format(p.price) : null,
          isLocation: p.transaction_type === 'LOCATION',
          description: p.reel_description || p.description,
          authorName: `${p.owner?.first_name || ''} ${p.owner?.last_name || 'Hôte Piolo'}`.trim(),
          authorPhone: p.owner?.phone || '+237699001122',
          property: p
        })).filter(p => Boolean(p.url));

        // 3. Fusionner et alterner
        const combined = [];
        const maxLen = Math.max(proList.length, propList.length);
        for (let i = 0; i < maxLen; i++) {
          if (i < proList.length) combined.push(proList[i]);
          if (i < propList.length) combined.push(propList[i]);
        }

        const finalList = combined.length > 0 ? combined : proList;
        setAllItems(finalList);
        setFilteredItems(finalList);
        if (initialIndex >= 0 && initialIndex < finalList.length) {
          setCurrentIndex(initialIndex);
        }
      })
      .catch(() => {
        setAllItems(proList);
        setFilteredItems(proList);
      });
  }, [projects, initialIndex]);

  const currentItem = filteredItems[currentIndex];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [currentIndex, filterType]);

  const handleFilter = (type) => {
    setFilterType(type);
    setCurrentIndex(0);
    if (type === 'all') {
      setFilteredItems(allItems);
    } else if (type === 'pros') {
      setFilteredItems(allItems.filter(i => i.itemType === 'pro'));
    } else if (type === 'properties') {
      setFilteredItems(allItems.filter(i => i.itemType === 'property'));
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredItems.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(filteredItems.length - 1);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  if (!currentItem) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 70000, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <h3 style={{ fontFamily: 'Poppins, sans-serif' }}>{t('pro_modals.discovery_video.empty')}</h3>
          <button onClick={onClose} style={{ marginTop: 14, background: '#D4AF37', color: '#0F0D09', border: 'none', padding: '8px 18px', borderRadius: 10, fontWeight: 800, cursor: 'pointer' }}>
            Fermer
          </button>
        </div>
      </div>
    );
  }

  const isPro = currentItem.itemType === 'pro';

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000000', zIndex: 70000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* BOUTON FERMER */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          background: 'rgba(0,0,0,0.6)',
          color: '#FFF',
          border: '1px solid rgba(255,255,255,0.2)',
          width: 42,
          height: 42,
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 700,
          zIndex: 50,
          backdropFilter: 'blur(8px)'
        }}
      >
        ✕
      </button>

      {/* FILTRES AU SOMMET SANS EMOJIS */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 40, display: 'flex', gap: 6, background: 'rgba(0,0,0,0.65)', padding: 3, borderRadius: 20, border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
        <button
          onClick={() => handleFilter('all')}
          style={{
            background: filterType === 'all' ? '#D4AF37' : 'transparent',
            color: filterType === 'all' ? '#0F0D09' : '#FFF',
            border: 'none',
            padding: '5px 12px',
            borderRadius: 16,
            fontSize: 11.5,
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          Tout
        </button>
        <button
          onClick={() => handleFilter('pros')}
          style={{
            background: filterType === 'pros' ? '#D4AF37' : 'transparent',
            color: filterType === 'pros' ? '#0F0D09' : '#FFF',
            border: 'none',
            padding: '5px 12px',
            borderRadius: 16,
            fontSize: 11.5,
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          Artisans
        </button>
        <button
          onClick={() => handleFilter('properties')}
          style={{
            background: filterType === 'properties' ? '#D4AF37' : 'transparent',
            color: filterType === 'properties' ? '#0F0D09' : '#FFF',
            border: 'none',
            padding: '5px 12px',
            borderRadius: 16,
            fontSize: 11.5,
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          Logements
        </button>
      </div>

      {/* CONTENEUR VIDÉO CENTRAL */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 480, height: '100vh', maxHeight: 860, background: '#0F0D09', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
        
        <video
          ref={videoRef}
          src={currentItem.url}
          autoPlay
          loop
          playsInline
          muted={isMuted}
          onClick={togglePlay}
          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
        />

        {/* OVERLAY SOMBRE GRADIENT */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 20%, transparent 60%, rgba(0,0,0,0.88) 100%)' }} />

        {/* INDICATEUR PLAY/PAUSE */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            style={{ position: 'absolute', width: 68, height: 68, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F6D365', fontSize: 28, cursor: 'pointer', border: '2px solid #D4AF37' }}
          >
            ▶
          </div>
        )}

        {/* CONTRÔLE DU SON SANS EMOJI AVEC SVG */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          style={{
            position: 'absolute',
            top: 68,
            left: 20,
            background: 'rgba(0,0,0,0.6)',
            color: isMuted ? '#AAA' : '#F6D365',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '6px 14px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            zIndex: 20,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            backdropFilter: 'blur(6px)'
          }}
        >
          {isMuted ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          )}
          <span>{isMuted ? 'Activer le son' : 'Son activé'}</span>
        </button>

        {/* BADGE COMPTEUR */}
        <div style={{ position: 'absolute', top: 68, right: 20, background: 'rgba(0,0,0,0.5)', color: '#FFF', padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 700, border: '1px solid rgba(255,255,255,0.15)' }}>
          {currentIndex + 1} / {filteredItems.length}
        </div>

        {/* NAVIGATION HAUT/BAS */}
        <div style={{ position: 'absolute', right: 14, top: '45%', display: 'flex', flexDirection: 'column', gap: 10, zIndex: 30 }}>
          <button
            onClick={handlePrev}
            style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#FFF', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}
          >
            ↑
          </button>
          <button
            onClick={handleNext}
            style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#FFF', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}
          >
            ↓
          </button>
        </div>

        {/* INFOS PROJET ET ACTIONS EN BAS */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', color: '#FFF', zIndex: 20 }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: isPro ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.15)', color: isPro ? '#F6D365' : '#FFF', padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800, border: isPro ? '1px solid rgba(212,175,55,0.4)' : '1px solid rgba(255,255,255,0.2)', marginBottom: 8 }}>
            <span>{currentItem.trade}</span>
            <span>•</span>
            <span>{currentItem.city}</span>
          </div>

          <h3 style={{ margin: '0 0 6px', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 17, color: '#FFF', textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
            {currentItem.title}
          </h3>

          {!isPro && currentItem.price && (
            <div style={{ color: '#D4AF37', fontFamily: 'Poppins, sans-serif', fontSize: 20, fontWeight: 800, marginBottom: 8, textShadow: '0 2px 4px rgba(0,0,0,0.7)' }}>
              {currentItem.price} FCFA{currentItem.isLocation && '/mois'}
            </div>
          )}

          <p style={{ margin: '0 0 14px', fontSize: 12.5, color: '#DDD', lineHeight: 1.4, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
            {currentItem.description ? (currentItem.description.length > 90 ? `${currentItem.description.substring(0, 90)}...` : currentItem.description) : currentItem.title}
          </p>

          {/* LIGNE ARTISAN / BAILLEUR + BOUTONS D'ACTION */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: 'rgba(15,13,9,0.85)', backdropFilter: 'blur(10px)', padding: '10px 14px', borderRadius: 14, border: '1px solid rgba(212,175,55,0.3)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: isPro ? 'linear-gradient(135deg, #D4AF37, #AA820A)' : '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: isPro ? '#0F0D09' : '#FFF', fontSize: 13 }}>
                {(currentItem.authorName || 'Pro').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: '#FFF' }}>{currentItem.authorName}</div>
                <div style={{ fontSize: 10.5, color: '#2ECC71', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#2ECC71"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  <span>{isPro ? 'Artisan Certifié' : 'Hôte Vérifié'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              {isPro ? (
                <>
                  <a
                    href={`https://wa.me/${currentItem.authorPhone.replace(/[^0-9]/g, '')}?text=Bonjour%20${encodeURIComponent(currentItem.authorName)},%20j'ai%20vu%20votre%20vidéo%20de%20chantier%20"${encodeURIComponent(currentItem.title)}"%20sur%20Piolo.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ background: '#25D366', color: '#FFF', padding: '7px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <span>WhatsApp</span>
                  </a>

                  <button
                    onClick={() => {
                      onClose();
                      if (onSelectProject) onSelectProject(currentItem.project);
                    }}
                    style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)', color: '#0F0D09', border: 'none', padding: '7px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 800, cursor: 'pointer' }}
                  >
                    Voir Projet
                  </button>
                </>
              ) : (
                <Link
                  to={`/properties/${currentItem.property?.slug || currentItem.property?.id}`}
                  onClick={onClose}
                  style={{ background: '#D4AF37', color: '#0F0D09', padding: '7px 14px', borderRadius: 8, fontSize: 11.5, fontWeight: 800, textDecoration: 'none' }}
                >
                  Voir Logement
                </Link>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
