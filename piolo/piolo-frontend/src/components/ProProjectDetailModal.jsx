import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BeforeAfterSlider from './BeforeAfterSlider';
import { getMediaUrl } from '../utils/media';
import { useAuth } from '../context/AuthContext';
import ProQuoteRequestModal from './ProQuoteRequestModal';
import ProEscrowModal from './ProEscrowModal';

/**
 * Modal Détails Projet / Chantier Haut de Gamme
 * Intègre le Slider interactif Avant/Après, la galerie multi-photos, et la commande sécurisée
 */
export default function ProProjectDetailModal({ project, currentUser, onClose, onOrderEscrow, onRequestQuote, onOpenDiscovery }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const activeUser = currentUser || authUser;

  const projectVideos = project?.videos || [];
  const initialVideo = projectVideos[0] ? (typeof projectVideos[0] === 'string' ? projectVideos[0] : projectVideos[0].url) : null;

  const rawMainImage = project?.main_image_display || project?.main_image_url || project?.image;
  const rawBeforeImage = project?.before_image_display || project?.before_image_url || project?.beforeImage;

  const [activePhoto, setActivePhoto] = useState(rawMainImage);
  const [activeVideo, setActiveVideo] = useState(initialVideo);
  const [viewMode, setViewMode] = useState(rawBeforeImage ? 'slider' : (projectVideos.length > 0 ? 'video' : 'photo'));

  // ── LIGHTBOX STATE ──
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // ── INTERNAL SUB-MODALS (Fallback si non gérés par le parent) ──
  const [internalQuoteOpen, setInternalQuoteOpen] = useState(false);
  const [internalEscrowOpen, setInternalEscrowOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add('pro-modal-open', 'modal-open');
    return () => {
      const remaining = document.querySelectorAll('.pro-modal-backdrop');
      if (remaining.length <= 1) {
        document.body.classList.remove('pro-modal-open', 'modal-open');
      }
    };
  }, []);

  if (!project) return null;

  const galleryList = project.gallery || [
    { id: 1, url: rawMainImage },
    ...(rawBeforeImage ? [{ id: 2, url: rawBeforeImage }] : [])
  ];

  const galleryUrls = galleryList.map(item =>
    getMediaUrl(
      typeof item === 'string' ? item : item.url,
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'
    )
  );

  const openLightbox = (idx) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const goNext = (e) => {
    e && e.stopPropagation();
    setLightboxIndex(i => (i + 1) % galleryUrls.length);
  };

  const goPrev = (e) => {
    e && e.stopPropagation();
    setLightboxIndex(i => (i - 1 + galleryUrls.length) % galleryUrls.length);
  };

  const authorName = project.author?.name || 'Artisan Certifié Piolo';
  const rawPhone = String(project.author?.phone || project.author?.whatsapp || '+237699001122').replace(/[^0-9]/g, '');
  const cleanAuthorPhone = rawPhone.startsWith('237') ? rawPhone : (rawPhone.length === 9 ? `237${rawPhone}` : (rawPhone || '237699001122'));

  return (
    <div className="pro-modal-backdrop">
      <div className="pro-modal-card" style={{ maxWidth: 760 }}>

        {/* TOPBAR / CLOSE */}
        <div style={{ position: 'relative', background: '#0F0D09' }}>

          {/* BOUTON FERMER */}
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(0,0,0,0.85)', color: '#FFF',
              border: '1px solid rgba(255,255,255,0.3)',
              width: 38, height: 38, borderRadius: '50%',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 800, zIndex: 50,
              boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
              transition: 'transform 0.2s ease, background 0.2s ease'
            }}
          >
            ✕
          </button>

          {/* SÉLECTEUR DE VUE */}
          <div style={{ position: 'absolute', top: 14, left: 16, zIndex: 25, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setViewMode('photo')}
              style={{
                background: viewMode === 'photo' ? '#D4AF37' : 'rgba(0,0,0,0.7)',
                color: viewMode === 'photo' ? '#0F0D09' : '#FFF',
                border: '1px solid rgba(212,175,55,0.4)',
                padding: '6px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 800,
                cursor: 'pointer', backdropFilter: 'blur(6px)',
                display: 'inline-flex', alignItems: 'center', gap: 6
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
              <span>{t('pro_modals.project_detail.final_photo')}</span>
            </button>

            {(project.beforeImage || project.before_image_display || project.before_image_url) && (
              <button
                type="button"
                onClick={() => setViewMode('slider')}
                style={{
                  background: viewMode === 'slider' ? '#D4AF37' : 'rgba(0,0,0,0.7)',
                  color: viewMode === 'slider' ? '#0F0D09' : '#FFF',
                  border: '1px solid rgba(212,175,55,0.4)',
                  padding: '6px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 800,
                  cursor: 'pointer', backdropFilter: 'blur(6px)',
                  display: 'inline-flex', alignItems: 'center', gap: 6
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                </svg>
                <span>{t('pro_modals.project_detail.before_after')}</span>
              </button>
            )}

            {projectVideos.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setViewMode('video');
                  if (!activeVideo && initialVideo) setActiveVideo(initialVideo);
                }}
                style={{
                  background: viewMode === 'video' ? 'linear-gradient(135deg, #D4AF37, #AA820A)' : 'rgba(0,0,0,0.7)',
                  color: viewMode === 'video' ? '#0F0D09' : '#F6D365',
                  border: '1px solid rgba(212,175,55,0.6)',
                  padding: '6px 14px', borderRadius: 8, fontSize: 11.5, fontWeight: 900,
                  cursor: 'pointer', backdropFilter: 'blur(6px)',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  boxShadow: viewMode === 'video' ? '0 2px 8px rgba(212,175,55,0.4)' : 'none'
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                </svg>
                <span>Vidéo ({projectVideos.length})</span>
              </button>
            )}
          </div>

          {/* VISUALISATION */}
          {viewMode === 'video' && activeVideo ? (
            <div style={{ position: 'relative', height: 320, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video
                key={activeVideo}
                src={getMediaUrl(activeVideo)}
                controls autoPlay playsInline
                style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
              />
            </div>
          ) : viewMode === 'slider' && (project.before_image_display || project.before_image_url || project.beforeImage) ? (
            <div style={{ padding: '54px 16px 16px' }}>
              <BeforeAfterSlider
                beforeImage={project.before_image_display || project.before_image_url || project.beforeImage}
                afterImage={project.main_image_display || project.main_image_url || project.image}
                beforeLabel="Avant travaux"
                afterLabel="Après réalisation"
              />
            </div>
          ) : (
            /* ── GRANDE IMAGE PRINCIPALE — CLIQUABLE POUR LIGHTBOX ── */
            <div
              style={{ position: 'relative', height: 300, background: '#0F0D09', cursor: 'zoom-in', overflow: 'hidden' }}
              onClick={() => openLightbox(0)}
              title="{t('pro_modals.project_detail.click_to_zoom')}"
            >
              <img
                src={getMediaUrl(activePhoto, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80')}
                alt={project.title}
                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
              {/* Icône zoom */}
              <div style={{
                position: 'absolute', bottom: 14, right: 14,
                background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
                borderRadius: '50%', width: 40, height: 40,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid rgba(255,255,255,0.3)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.4)'
              }}>
                <i className="fas fa-search-plus" style={{ color: '#FFF', fontSize: 14 }}></i>
              </div>
              <div style={{ position: 'absolute', bottom: 14, left: 14, background: 'rgba(15,13,9,0.85)', color: '#F6D365', padding: '4px 12px', borderRadius: 12, fontSize: 11.5, fontWeight: 700, border: '1px solid rgba(212,175,55,0.4)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#D4AF37"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                <span>{project.place || project.city || 'Cameroun'}</span>
              </div>
            </div>
          )}
        </div>

        {/* CONTENU AVEC SCROLL */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>

          {/* GALERIE MINIATURES */}
          {galleryList.length > 1 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: '#888', textTransform: 'uppercase', marginBottom: 8 }}>
                Photos &amp; angles du chantier ({galleryList.length} photos)
              </div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {galleryList.map((item, idx) => {
                  const url = typeof item === 'string' ? item : item.url;
                  const resolvedUrl = getMediaUrl(url, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80');
                  const isSelected = activePhoto === url && viewMode === 'photo';
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setActivePhoto(url);
                        setViewMode('photo');
                        openLightbox(idx);
                      }}
                      style={{
                        width: 68, height: 52, borderRadius: 8, overflow: 'hidden',
                        cursor: 'zoom-in', flexShrink: 0, position: 'relative',
                        border: isSelected ? '2.5px solid #D4AF37' : '1px solid #E8E3DA',
                        opacity: isSelected ? 1 : 0.72,
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? '0 0 0 2px rgba(212,175,55,0.3)' : 'none'
                      }}
                      title="{t('pro_modals.project_detail.click_to_zoom')}"
                    >
                      <img
                        src={resolvedUrl}
                        alt={`Vue ${idx + 1}`}
                        onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'; }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {/* Overlay loupe au hover */}
                      <div style={{
                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.38)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0, transition: 'opacity 0.2s'
                      }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '0'; }}
                      >
                        <i className="fas fa-search-plus" style={{ color: '#FFF', fontSize: 12 }}></i>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TITRE ET BADGES */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(212,175,55,0.15)', color: '#926F08', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 12, marginBottom: 6 }}>
                <span>{project.category || 'Mobilier & Agencement sur-mesure'}</span>
              </div>
              <h2 style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 20, color: '#0F0D09' }}>
                {project.title}
              </h2>
            </div>
            {project.budget && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10.5, color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>{t('pro.indicative_cost')}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#D4AF37', marginTop: 2 }}>{project.budget}</div>
              </div>
            )}
          </div>

          {/* FICHE TECHNIQUE */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, margin: '14px 0', background: '#FAF9F6', padding: '14px', borderRadius: 14, border: '1px solid #E8E3DA' }}>
            <div>
              <div style={{ fontSize: 10.5, color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>{t('pro_modals.project_detail.artisan_author')}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0F0D09', marginTop: 2 }}>{authorName}</div>
            </div>
            <div>
              <div style={{ fontSize: 10.5, color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>{t('pro.location')}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#AA820A', marginTop: 2 }}>{project.place || project.city}</div>
            </div>
            <div>
              <div style={{ fontSize: 10.5, color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>{t('pro.work_duration')}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0F0D09', marginTop: 2 }}>{project.duration || '10 jours'}</div>
            </div>
            <div>
              <div style={{ fontSize: 10.5, color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>{t('pro.piolo_control')}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#27AE60', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                <span>{t('pro.certified_project')}</span>
              </div>
            </div>
          </div>

          {/* MATÉRIAUX */}
          {project.materials && project.materials.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: '#555', textTransform: 'uppercase', marginBottom: 6 }}>
                Matériaux &amp; Finitions utilisés
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {project.materials.map((m, mi) => (
                  <span key={mi} style={{ background: '#F0ECE1', color: '#0F0D09', padding: '4px 10px', borderRadius: 8, fontSize: 11.5, fontWeight: 700, border: '1px solid #E0D9C9' }}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* VIDÉOS */}
          {project.videos && project.videos.length > 0 && (
            <div style={{ marginBottom: 18, background: '#0F0D09', borderRadius: 16, padding: '16px', color: '#FFF', border: '1.5px solid #D4AF37' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 800, color: '#F6D365', textTransform: 'uppercase', letterSpacing: '.4px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                  <span>Vidéos &amp; Visite Guidée ({project.videos.length})</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: project.videos.length > 1 ? 'repeat(auto-fit, minmax(260px, 1fr))' : '1fr', gap: 14 }}>
                {project.videos.map((vid, vIdx) => {
                  const vidUrl = typeof vid === 'string' ? vid : vid.url;
                  const vidTitle = typeof vid === 'object' ? (vid.title || `Vidéo Chantier ${vIdx + 1}`) : `Vidéo Chantier ${vIdx + 1}`;
                  return (
                    <div key={vIdx} style={{ borderRadius: 12, overflow: 'hidden', background: '#1A160F', border: '1px solid rgba(212,175,55,0.3)' }}>
                      <video src={vidUrl} controls playsInline preload="metadata" style={{ width: '100%', maxHeight: 240, objectFit: 'contain', background: '#000', display: 'block' }} />
                      <div style={{ padding: '8px 12px', fontSize: 12, fontWeight: 700, color: '#F6D365', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                        <span>{vidTitle}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DESCRIPTION */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: '#555', textTransform: 'uppercase', marginBottom: 6 }}>
              Descriptif du Chantier
            </div>
            <p style={{ fontSize: 13.5, color: '#444', lineHeight: 1.6, margin: 0 }}>
              {project.description || "Conception et réalisation sur-mesure respectant les normes d'excellence de l'artisanat camerounais. Ajustements précis et finitions soignées."}
            </p>
          </div>

          {/* ACTIONS STICKY FOOTER */}
          <div className="pro-modal-sticky-footer" style={{ flexWrap: 'wrap' }}>
            <a
              href={`https://wa.me/${cleanAuthorPhone}?text=${encodeURIComponent(`Bonjour ${authorName}, je vous contacte depuis Piolo concernant votre projet "${project.title}".`)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#25D366', color: '#FFF',
                padding: '12px 14px', borderRadius: 12, fontWeight: 700, fontSize: 13,
                textDecoration: 'none', textAlign: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer',
                flex: '1 1 110px'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 012.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.79.6.26 1.07.41 1.44.53.61.19 1.16.16 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29z"/></svg>
              <span>{t('pro_modals.project_detail.chat_whatsapp')}</span>
            </a>

            <button
              type="button"
              onClick={() => {
                if (onRequestQuote) {
                  onRequestQuote(project);
                } else {
                  setInternalQuoteOpen(true);
                }
              }}
              className="pro-btn-secondary"
              style={{ flex: '1 1 130px' }}
            >
              Demander un Devis
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOrderEscrow) {
                  onOrderEscrow(project);
                } else {
                  setInternalEscrowOpen(true);
                }
              }}
              className="pro-btn-gold"
              style={{ flex: '1 1 180px' }}
            >
              Commander (Acompte Sécurisé)
            </button>
          </div>

        </div>
      </div>

      {/* ── INTERNAL QUOTE MODAL (Fallback) ── */}
      {internalQuoteOpen && (
        <ProQuoteRequestModal
          proData={project.author || { id: project.professional, name: authorName, phone: cleanAuthorPhone }}
          projectData={project}
          onClose={() => setInternalQuoteOpen(false)}
          onSubmitSuccess={() => setInternalQuoteOpen(false)}
        />
      )}

      {/* ── INTERNAL ESCROW MODAL (Fallback) ── */}
      {internalEscrowOpen && (
        <ProEscrowModal
          projectData={{
            service: project.title,
            acompte: (() => {
              const b = parseInt(String(project.budget || '').replace(/[^0-9]/g, ''), 10);
              return b && b > 0 ? (b <= 100000 ? b : Math.round(b * 0.5)) : 50000;
            })(),
            pro: authorName
          }}
          onClose={() => setInternalEscrowOpen(false)}
          onSuccess={() => {
            alert('✓ Acompte sécurisé validé avec succès par Piolo Protec !');
            setInternalEscrowOpen(false);
          }}
        />
      )}

      {/* ── LIGHTBOX PLEIN ÉCRAN ── */}
      {lightboxOpen && galleryUrls.length > 0 && (
        <LightboxOverlay
          images={galleryUrls}
          index={lightboxIndex}
          title={project.title}
          onClose={closeLightbox}
          onNext={galleryUrls.length > 1 ? goNext : null}
          onPrev={galleryUrls.length > 1 ? goPrev : null}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   Composant Lightbox interne avec navigation
   ══════════════════════════════════════════ */
function LightboxOverlay({ images, index, title, onClose, onNext, onPrev }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onNext, onPrev]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vue agrandie de la photo"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(5,4,3,0.97)',
        backdropFilter: 'blur(14px)',
        zIndex: 60000,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 20
      }}
    >
      {/* Bouton fermer */}
      <button
        onClick={onClose}
        aria-label="Fermer"
        style={{
          position: 'absolute', top: 18, right: 18,
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
          color: '#FFF', width: 44, height: 44, borderRadius: '50%',
          cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center',
          justifyContent: 'center', backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 18px rgba(0,0,0,0.4)', zIndex: 2
        }}
      >
        <i className="fas fa-times"></i>
      </button>

      {/* Compteur */}
      {images.length > 1 && (
        <div onClick={e => e.stopPropagation()} style={{
          position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(6px)',
          color: 'rgba(255,255,255,0.85)', padding: '4px 14px', borderRadius: 20,
          fontSize: 12, fontWeight: 700, border: '1px solid rgba(255,255,255,0.15)', zIndex: 2
        }}>
          {index + 1} / {images.length}
        </div>
      )}

      {/* Flèche gauche */}
      {onPrev && (
        <button
          onClick={onPrev}
          aria-label="Photo précédente"
          style={{
            position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
            color: '#FFF', width: 48, height: 48, borderRadius: '50%',
            cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center',
            justifyContent: 'center', backdropFilter: 'blur(8px)', zIndex: 2
          }}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
      )}

      {/* Image */}
      <img
        key={images[index]}
        src={images[index]}
        alt={title}
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '90vw', maxHeight: '80vh',
          objectFit: 'contain', borderRadius: 14,
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
          border: '1.5px solid rgba(212,175,55,0.15)',
          animation: 'lbFadeIn 0.25s cubic-bezier(0.34,1.56,0.64,1)'
        }}
      />

      {/* Flèche droite */}
      {onNext && (
        <button
          onClick={onNext}
          aria-label="Photo suivante"
          style={{
            position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
            color: '#FFF', width: 48, height: 48, borderRadius: '50%',
            cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center',
            justifyContent: 'center', backdropFilter: 'blur(8px)', zIndex: 2
          }}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      )}

      {/* Titre + instructions */}
      {title && (
        <div onClick={e => e.stopPropagation()} style={{ marginTop: 18, textAlign: 'center' }}>
          <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 15, color: 'rgba(255,255,255,0.92)' }}>
            {title}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', marginTop: 5 }}>
            {images.length > 1 ? 'Utiliser ← → pour naviguer · ' : ''}Échap ou cliquer en dehors pour fermer
          </div>
        </div>
      )}

      <style>{`
        @keyframes lbFadeIn {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
