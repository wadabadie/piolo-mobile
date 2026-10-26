import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BeforeAfterSlider from './BeforeAfterSlider';
import ProProjectDetailModal from './ProProjectDetailModal';
import ProQuoteRequestModal from './ProQuoteRequestModal';
import ProEscrowModal from './ProEscrowModal';
import ProLocationPickerMap, { CAMEROON_LOCATIONS } from './ProLocationPickerMap';
import { professionalsApi } from '../services/api';
import { getMediaUrl } from '../utils/media';
import PointConfirmationModal from './PointConfirmationModal';
import TenantSubscriptionModal from './TenantSubscriptionModal';

/**
 * Modal Profil Détaillé Haut de Gamme pour un Artisan / Professionnel
 * Affiche l'ensemble de ses chantiers/projets, sa fiche complète, ses avis et un formulaire pour laisser un commentaire et une note en étoiles.
 */
export default function ProProfileDetailModal({ pro, currentUser, onClose, onSelectProject, onRequestQuote }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'reviews' | 'about'
  const [selectedSubProject, setSelectedSubProject] = useState(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteProjectData, setQuoteProjectData] = useState(null);
  const [escrowModalData, setEscrowModalData] = useState(null);
  const [pointConfirmModal, setPointConfirmModal] = useState({
    isOpen: false,
    actionKey: 'CONTACT_PRO',
    targetTitle: '',
    targetSubtitle: '',
    onConfirmAction: null
  });
  const [tenantSubModalOpen, setTenantSubModalOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add('pro-modal-open', 'modal-open');
    return () => {
      const remaining = document.querySelectorAll('.pro-modal-backdrop');
      if (remaining.length <= 1) {
        document.body.classList.remove('pro-modal-open', 'modal-open');
      }
    };
  }, []);

  // Système d'avis réel BDD
  const [reviews, setReviews] = useState(pro?.reviews || []);
  const [proProjects, setProProjects] = useState(pro?.projects || []);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Formulaire d'avis - Champs verrouillés sur le compte connecté
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const clientName = currentUser?.first_name 
    ? `${currentUser.first_name} ${currentUser.last_name || ''}`.trim() 
    : (currentUser?.email ? currentUser.email.split('@')[0] : 'Client Piolo');
  const clientRole = currentUser?.role === 'BAILLEUR' 
    ? 'Bailleur Propriétaire' 
    : (currentUser?.role === 'ARCHITECTE' || currentUser?.role === 'PROFESSIONNEL' ? 'Professionnel Certifié' : 'Locataire Vérifié');
  const [clientComment, setClientComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Redirection d'authentification sécurisée
  const requireAuthForAction = (actionDescription) => {
    if (!currentUser) {
      navigate('/login', {
        state: {
          from: window.location.pathname,
          message: actionDescription || 'Connectez-vous à votre compte Piolo pour continuer.'
        }
      });
      return false;
    }
    return true;
  };

  // Vérifier si l'utilisateur connecté est le propriétaire du profil pro
  const isOwnProfile = Boolean(
    currentUser && pro && (
      currentUser.id === pro.user?.id ||
      currentUser.id === pro.user_id ||
      currentUser.id === pro.raw?.user ||
      currentUser.id === pro.raw?.user?.id ||
      currentUser.email === pro.user_email ||
      currentUser.email === pro.raw?.user_email ||
      currentUser.email === pro.raw?.user?.email
    )
  );

  // Charger les avis et projets réels depuis l'API BDD + Enregistrer la visite
  useEffect(() => {
    if (pro?.id) {
      // 1. Incrémenter et enregistrer la vue auprès du backend Django
      professionalsApi.detail(pro.id).catch(err => console.error("Erreur enregistrement vue pro:", err));

      // 2. Charger les avis
      setLoadingReviews(true);
      professionalsApi.reviews(pro.id)
        .then(res => {
          if (Array.isArray(res.data)) {
            setReviews(res.data);
          }
        })
        .catch(err => console.error("Erreur chargement avis:", err))
        .finally(() => setLoadingReviews(false));

      if (!pro.projects || pro.projects.length === 0) {
        setLoadingProjects(true);
        professionalsApi.projects({ pro_id: pro.id })
          .then(res => {
            if (Array.isArray(res.data)) {
              setProProjects(res.data);
            }
          })
          .catch(err => console.error("Erreur chargement projets pro:", err))
          .finally(() => setLoadingProjects(false));
      }
    }
  }, [pro?.id]);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!requireAuthForAction('Connectez-vous pour laisser un avis sur cet artisan.')) return;
    if (isOwnProfile) {
      alert("Vous ne pouvez pas laisser d'avis sur votre propre profil professionnel.");
      return;
    }
    if (!clientComment.trim()) {
      alert('Veuillez renseigner votre commentaire.');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await professionalsApi.createReview(pro.id, {
        author_name: clientName,
        author_role: clientRole,
        rating: newRating,
        comment: clientComment
      });

      if (res.data?.review) {
        setReviews(prev => [res.data.review, ...prev]);
      }
      setClientComment('');
      setReviewSubmitted(true);
      setTimeout(() => setReviewSubmitted(false), 4000);
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur lors de la publication de l'avis.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const executeWhatsapp = () => {
    const rawPhone = (pro.whatsapp || pro.phone || '+237699001122').replace(/[^0-9]/g, '');
    const phone = rawPhone.startsWith('237') ? rawPhone : `237${rawPhone}`;
    const text = encodeURIComponent(`Bonjour ${pro.name || 'Maître Artisan'}, je vous contacte depuis votre profil sur Piolo.`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsappClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!requireAuthForAction('Connectez-vous pour contacter directement cet artisan par WhatsApp.')) return;
    setPointConfirmModal({
      isOpen: true,
      actionKey: 'CONTACT_PRO',
      targetTitle: pro.name || 'Artisan Certifié',
      targetSubtitle: `${pro.profession_display || pro.specialty || 'Professionnel'} • ${pro.city || 'Yaoundé'}`,
      onConfirmAction: executeWhatsapp
    });
  };

  const handleQuoteClick = (targetProject = null) => {
    if (targetProject) setQuoteProjectData(targetProject);
    if (onRequestQuote) {
      onRequestQuote(pro, targetProject);
    } else {
      setQuoteModalOpen(true);
    }
  };

  if (!pro) return null;

  return (
    <div className="pro-modal-backdrop">
      <div className="pro-modal-card" style={{ maxWidth: 860 }}>
        
        {/* HEADER COVER & AVATAR */}
        <div style={{ position: 'relative', height: 180, background: '#1A160F' }}>
          <img
            src={getMediaUrl(pro.cover, 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80')}
            alt={pro.name}
            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80'; }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(15,13,9,0.85) 100%)' }} />
          
          {/* Bouton Fermer */}
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(0,0,0,0.8)',
              color: '#FFF',
              border: '1px solid rgba(255,255,255,0.3)',
              width: 38,
              height: 38,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 800,
              zIndex: 30,
              boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
              transition: 'transform 0.2s ease, background 0.2s ease'
            }}
          >
            ✕
          </button>

          {/* Badge Certifié */}
          <div style={{ position: 'absolute', top: 16, left: 20, background: '#D4AF37', color: '#0F0D09', padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
            <span>{t('pro.certified_artisan')}</span>
          </div>

          {/* Avatar flottant & Nom */}
          <div style={{ position: 'absolute', bottom: -28, left: 24, display: 'flex', alignItems: 'flex-end', gap: 16, zIndex: 10 }}>
            <div style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              background: pro.avatarBg || 'linear-gradient(135deg, #D4AF37, #AA820A)',
              color: '#FFF',
              fontWeight: 900,
              fontSize: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '4px solid #FFFFFF',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {pro.avatarUrl || pro.raw?.avatar_url ? (
                <img
                  src={getMediaUrl(pro.avatarUrl || pro.raw?.avatar_url)}
                  alt={pro.name}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span>{pro.initials || pro.name?.[0] || 'P'}</span>
              )}
            </div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: 22, fontWeight: 800, color: '#FFF', textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
                  {pro.name}
                </h2>
              </div>
              <div style={{ color: '#F6D365', fontWeight: 700, fontSize: 13, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                {pro.specialty || pro.title} • {pro.city}
              </div>
            </div>
          </div>
        </div>

        {/* BARRE D'ACTIONS RAPIDES & ONGLETS */}
        <div style={{ padding: '40px 24px 0', borderBottom: '1px solid #E8E3DA', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          {/* Onglets */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { id: 'projects', label: `Chantiers & Projets (${proProjects.length})` },
              { id: 'reviews', label: `Avis & Notes (${reviews.length})` },
              { id: 'about', label: `À Propos & Tarifs` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px 10px 0 0',
                  border: 'none',
                  background: activeTab === tab.id ? '#0F0D09' : 'transparent',
                  color: activeTab === tab.id ? '#F6D365' : '#666',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  borderBottom: activeTab === tab.id ? '2px solid #D4AF37' : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Boutons de contact */}
          <div style={{ display: 'flex', gap: 8, paddingBottom: 10 }}>
            <button
              type="button"
              onClick={handleWhatsappClick}
              style={{
                background: '#25D366',
                color: '#FFF',
                border: 'none',
                padding: '8px 14px',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 12.5,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 012.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.79.6.26 1.07.41 1.44.53.61.19 1.16.16 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29z"/></svg>
              <span>{t('pro.whatsapp_direct')}</span>
            </button>

            <button
              onClick={handleQuoteClick}
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)',
                color: '#0F0D09',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 12.5,
                cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(212,175,55,0.3)'
              }}
            >
              Demander un devis
            </button>
          </div>
        </div>

        {/* CONTENU SELON L'ONGLET */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#F8F6F0' }}>
          
          {/* ONGLET 1 : CHANTIERS & RÉALISATIONS */}
          {activeTab === 'projects' && (
            <div>
              {proProjects.length === 0 ? (
                <div style={{ background: '#FFF', borderRadius: 16, padding: 36, textAlign: 'center', border: '1px dashed #D4AF37' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#555' }}>
                    Aucune réalisation publiée pour le moment par cet artisan.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
                  {proProjects.map((p, pIdx) => (
                    <div
                      key={pIdx}
                      onClick={() => setSelectedSubProject({ ...p, author: pro })}
                      style={{
                        background: '#FFFFFF',
                        borderRadius: 14,
                        overflow: 'hidden',
                        border: '1px solid #E8E3DA',
                        boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                    >
                      <div style={{ position: 'relative', height: 140, background: '#111' }}>
                        <img
                          src={getMediaUrl(p.main_image_display || p.main_image_url || p.image, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80')}
                          alt={p.title}
                          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'; }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {(p.before_image_display || p.before_image_url || p.beforeImage) && (
                          <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(15,13,9,0.85)', color: '#F6D365', padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800, border: '1px solid rgba(212,175,55,0.4)' }}>
                            Avant / Après
                          </div>
                        )}
                        <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.7)', color: '#FFF', padding: '2px 8px', borderRadius: 6, fontSize: 10.5, fontWeight: 700 }}>
                          {p.place || p.city || pro.city}
                        </div>
                      </div>

                      <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 10, color: '#AA820A', fontWeight: 800, textTransform: 'uppercase', marginBottom: 3 }}>
                            {p.category || pro.specialty}
                          </div>
                          <div style={{ fontWeight: 800, fontSize: 13, color: '#0F0D09', lineHeight: 1.3 }}>
                            {p.title}
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 8, borderTop: '1px solid #F0ECE4', fontSize: 11, color: '#D4AF37', fontWeight: 700 }}>
                          <span>{t('pro.view_project')}</span>
                          <span>→</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ONGLET 2 : AVIS CLIENTS & FORMULAIRE */}
          {activeTab === 'reviews' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              
              {/* Liste des avis existants */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FFFFFF', padding: '16px 20px', borderRadius: 16, border: '1px solid #E8E3DA', marginBottom: 16 }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#D4AF37', fontFamily: 'Poppins, sans-serif' }}>
                    {pro.rating || '5.0'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: 2, color: '#D4AF37' }}>
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < Math.floor(pro.rating || 5) ? '#D4AF37' : '#E8E3DA'}>
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                      Basé sur {reviews.length} avis clients certifiés
                    </div>
                  </div>
                </div>

                {loadingReviews ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ background: '#FFFFFF', padding: '16px 18px', borderRadius: 14, border: '1px solid #E8E3DA' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                          <div style={{ width: '45%', height: 14, borderRadius: 6, background: 'linear-gradient(90deg,#e8e3da 25%,#f5f0e8 50%,#e8e3da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                          <div style={{ width: 80, height: 14, borderRadius: 6, background: 'linear-gradient(90deg,#e8e3da 25%,#f5f0e8 50%,#e8e3da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                        </div>
                        <div style={{ width: '90%', height: 12, borderRadius: 6, background: 'linear-gradient(90deg,#e8e3da 25%,#f5f0e8 50%,#e8e3da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginBottom: 6 }} />
                        <div style={{ width: '60%', height: 12, borderRadius: 6, background: 'linear-gradient(90deg,#e8e3da 25%,#f5f0e8 50%,#e8e3da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {reviews.length === 0 ? (
                      <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: 14, textAlign: 'center', color: '#888', border: '1px solid #E8E3DA' }}>
                        Aucun avis publié pour le moment. Soyez le premier à donner votre avis !
                      </div>
                    ) : (
                      reviews.map((rev) => (
                        <div key={rev.id} style={{ background: '#FFFFFF', padding: '16px 18px', borderRadius: 14, border: '1px solid #E8E3DA', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <div>
                              <span style={{ fontWeight: 800, fontSize: 13.5, color: '#0F0D09' }}>{rev.author_name || rev.author}</span>
                              <span style={{ fontSize: 11, color: '#27AE60', marginLeft: 8, fontWeight: 700 }}>• {rev.author_role || rev.role}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 2 }}>
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < rev.rating ? '#D4AF37' : '#DDD'}>
                                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p style={{ fontSize: 12.5, color: '#444', lineHeight: 1.5, margin: 0 }}>
                            {rev.comment}
                          </p>
                          <div style={{ fontSize: 10.5, color: '#999', marginTop: 6, textAlign: 'right' }}>
                            {rev.created_at_formatted || (rev.created_at ? new Date(rev.created_at).toLocaleDateString('fr-FR') : rev.date)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Formulaire pour laisser un avis OU Invitation Connexion OU Message Propriétaire */}
              {!currentUser ? (
                <div style={{ background: '#FFFFFF', padding: '30px 24px', borderRadius: 16, border: '1.5px solid #E8E3DA', boxShadow: '0 6px 20px rgba(0,0,0,0.04)', textAlign: 'center', height: 'fit-content' }}>
                  <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(212,175,55,0.15)', color: '#AA820A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 24 }}>
                    🔒
                  </div>
                  <h4 style={{ margin: '0 0 8px', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 17, color: '#0F0D09' }}>
                    Avis Clients Vérifiés
                  </h4>
                  <p style={{ fontSize: 13, color: '#666', lineHeight: 1.55, margin: '0 0 18px' }}>
                    Pour préserver la crédibilité de la plateforme et certifier chaque note, vous devez être connecté à un compte Piolo pour évaluer un artisan.
                  </p>
                  <button
                    onClick={() => navigate('/login', { state: { from: window.location.pathname, message: 'Connectez-vous pour laisser une évaluation.' } })}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)',
                      color: '#0F0D09',
                      border: 'none',
                      padding: '12px 18px',
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: 13.5,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(212,175,55,0.35)'
                    }}
                  >
                    Se connecter pour évaluer
                  </button>
                </div>
              ) : isOwnProfile ? (
                <div style={{ background: '#FFFFFF', padding: '32px 24px', borderRadius: 16, border: '1.5px solid #E8E3DA', boxShadow: '0 6px 20px rgba(0,0,0,0.03)', textAlign: 'center', height: 'fit-content' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 26, background: 'rgba(212,175,55,0.15)', color: '#AA820A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 24 }}>
                    🛡️
                  </div>
                  <h4 style={{ margin: '0 0 8px', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 17, color: '#0F0D09' }}>
                    Votre Espace Professionnel
                  </h4>
                  <p style={{ fontSize: 13, color: '#666', lineHeight: 1.55, margin: '0 0 16px' }}>
                    Vous êtes actuellement connecté avec ce compte. Vous ne pouvez pas laisser d'avis ou de note sur votre propre profil d'artisan.
                  </p>
                  <div style={{ background: '#FAF9F6', padding: '10px 14px', borderRadius: 10, border: '1px solid #E8E3DA', fontSize: 12, color: '#888', fontWeight: 600 }}>
                    Les avis sont exclusivement réservés aux clients (bailleurs et locataires).
                  </div>
                </div>
              ) : (
                <div style={{ background: '#FFFFFF', padding: '22px 20px', borderRadius: 16, border: '1.5px solid #D4AF37', boxShadow: '0 6px 20px rgba(212,175,55,0.12)', height: 'fit-content' }}>
                  <h4 style={{ margin: '0 0 6px', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 16, color: '#0F0D09', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#D4AF37"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    <span>{t('pro_modals.profile_detail.review_prompt')}</span>
                  </h4>
                  <p style={{ fontSize: 12, color: '#777', margin: '0 0 16px' }}>
                    Votre avis aide les locataires et bailleurs à choisir les meilleurs artisans.
                  </p>

                  {reviewSubmitted ? (
                    <div style={{ background: '#EAFAF1', border: '1px solid #2ECC71', color: '#27AE60', padding: '16px', borderRadius: 12, textAlign: 'center', fontWeight: 700, fontSize: 13 }}>
                      ✓ Merci ! Votre avis a été enregistré et publié avec succès.
                    </div>
                  ) : (
                    <form onSubmit={handleAddReview} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {/* Sélecteur d'étoiles interactif */}
                      <div>
                        <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#555', marginBottom: 6 }}>
                          Votre Note Globale
                        </label>
                        <div style={{ display: 'flex', gap: 6, cursor: 'pointer' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              width="28"
                              height="28"
                              viewBox="0 0 24 24"
                              fill={(hoverRating || newRating) >= star ? '#D4AF37' : '#E0DCD3'}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setNewRating(star)}
                              style={{ transition: 'transform 0.15s, fill 0.15s' }}
                            >
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                            </svg>
                          ))}
                          <span style={{ fontSize: 13, fontWeight: 800, color: '#D4AF37', marginLeft: 8, alignSelf: 'center' }}>
                            {newRating}/5
                          </span>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#555', marginBottom: 4 }}>
                          Votre Nom Complet (Compte connecté)
                        </label>
                        <input
                          type="text"
                          value={clientName}
                          readOnly
                          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E8E3DA', fontSize: 13, outline: 'none', background: '#F8F6F0', color: '#444', fontWeight: 700, cursor: 'not-allowed' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#555', marginBottom: 4 }}>
                          Vous êtes :
                        </label>
                        <input
                          type="text"
                          value={clientRole}
                          readOnly
                          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E8E3DA', fontSize: 13, outline: 'none', background: '#F8F6F0', color: '#444', fontWeight: 700, cursor: 'not-allowed' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#555', marginBottom: 4 }}>
                          Votre Commentaire / Expérience
                        </label>
                        <textarea
                          rows={3}
                          placeholder={t("pro_modals.profile_detail.review_placeholder")}
                          value={clientComment}
                          onChange={(e) => setClientComment(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E8E3DA', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        style={{
                          background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)',
                          color: '#0F0D09',
                          border: 'none',
                          padding: '12px',
                          borderRadius: 10,
                          fontWeight: 800,
                          fontSize: 13,
                          cursor: submittingReview ? 'not-allowed' : 'pointer',
                          marginTop: 4,
                          boxShadow: '0 4px 12px rgba(212,175,55,0.3)',
                          opacity: submittingReview ? 0.7 : 1
                        }}
                      >
                        {submittingReview ? 'Publication...' : 'Publier mon évaluation'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ONGLET 3 : À PROPOS & LOCALISATION */}
          {activeTab === 'about' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              
              {/* CARTE LOCALISATION & ATELIER INTERACTIF */}
              <div style={{ background: 'linear-gradient(135deg, #0F0D09 0%, #1A160F 100%)', padding: '24px', borderRadius: 18, color: '#FFF', border: '1.5px solid #D4AF37', boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(212,175,55,0.18)', color: '#F6D365', fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 12, border: '1px solid rgba(212,175,55,0.35)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.4px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                      <span>{t('pro_modals.profile_detail.location_action')}</span>
                    </div>
                    <h3 style={{ margin: '0 0 4px', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 18, color: '#FFF' }}>
                      Atelier &amp; Zone d'Intervention : {pro.city || 'Yaoundé'}
                    </h3>
                    <div style={{ fontSize: 12.5, color: '#AAA' }}>
                      {pro.neighborhoods ? `Quartiers desservis : ${pro.neighborhoods}` : `Disponible pour chantiers dans toute la zone de ${pro.city || 'Yaoundé'} et ses environs.`}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUser) {
                        requireAuthForAction('Connectez-vous à votre compte Piolo pour calculer l’itinéraire vers cet atelier.');
                        return;
                      }
                      const lat = pro.latitude || pro.raw?.latitude || (CAMEROON_LOCATIONS[pro.city]?.coords[0] || 3.8480);
                      const lng = pro.longitude || pro.raw?.longitude || (CAMEROON_LOCATIONS[pro.city]?.coords[1] || 11.5021);
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)',
                      color: '#0F0D09',
                      padding: '10px 18px',
                      borderRadius: 12,
                      fontWeight: 800,
                      fontSize: 12.5,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      boxShadow: '0 4px 14px rgba(212,175,55,0.3)'
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    <span>{t('pro.google_maps')}</span>
                  </button>
                </div>

                {/* Spans Pro Épurés */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, background: 'rgba(255,255,255,0.05)', padding: '14px 18px', borderRadius: 14, border: '1px solid rgba(212,175,55,0.2)', marginBottom: 16 }}>
                  <div>
                    <span style={{ display: 'block', fontSize: 10.5, color: '#AAA', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.4px' }}>{t('pro.main_city')}</span>
                    <span style={{ display: 'inline-block', fontSize: 13.5, fontWeight: 800, color: '#F6D365', marginTop: 4 }}>
                      {pro.city || 'Yaoundé'}
                    </span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: 10.5, color: '#AAA', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.4px' }}>{t('pro.travel_sectors')}</span>
                    <span style={{ display: 'inline-block', fontSize: 13, fontWeight: 700, color: '#FFF', marginTop: 4 }}>
                      {pro.neighborhoods || 'Toute la métropole'}
                    </span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: 10.5, color: '#AAA', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.4px' }}>{t('pro.workshop_availability')}</span>
                    <span style={{ display: 'inline-block', fontSize: 12.5, fontWeight: 800, color: '#2ECC71', marginTop: 4, background: 'rgba(46,204,113,0.15)', padding: '2px 8px', borderRadius: 8, border: '1px solid rgba(46,204,113,0.3)' }}>
                      Ouvert aux visites sur RDV
                    </span>
                  </div>
                </div>

                {/* CARTE SATELLITE HD & RUES LEAFLET (FLOUTÉE AVEC CADENAS SI NON CONNECTÉ) */}
                <ProLocationPickerMap
                  latitude={pro.latitude || pro.raw?.latitude || (CAMEROON_LOCATIONS[pro.city]?.coords[0] || 3.8480)}
                  longitude={pro.longitude || pro.raw?.longitude || (CAMEROON_LOCATIONS[pro.city]?.coords[1] || 11.5021)}
                  city={pro.city || 'Yaoundé'}
                  title={pro.name || "Atelier Professionnel"}
                  readOnly={true}
                  height={260}
                  currentUser={currentUser}
                  onRequireAuth={() => requireAuthForAction('Connectez-vous à votre compte Piolo pour déverrouiller la localisation précise et la vue satellite.')}
                />
              </div>

              {/* PRÉSENTATION DE L'ENTREPRISE */}
              <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: 18, border: '1px solid #E8E3DA' }}>
                <h3 style={{ margin: '0 0 10px', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 18, color: '#0F0D09' }}>
                  Présentation de l'Entreprise &amp; Savoir-faire
                </h3>
                <p style={{ fontSize: 13.5, color: '#444', lineHeight: 1.7, margin: '0 0 20px' }}>
                  {pro.bio || "Professionnel qualifié proposant des travaux d'agencement, menuiserie, architecture et rénovation avec des matériaux de qualité et un suivi rigoureux des chantiers au Cameroun."}
                </p>

                {/* Fiche détaillée */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, background: '#FAF9F6', padding: '16px', borderRadius: 14, border: '1px solid #E8E3DA', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>{t('pro.service_area')}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F0D09', marginTop: 2 }}>{pro.city}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>{t('pro.years_experience')}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: '#AA820A', marginTop: 2 }}>{pro.experience || '5+ ans'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>{t('pro.indicative_price')}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: '#27AE60', marginTop: 2 }}>{t('pro.free_quote')}</div>
                  </div>
                </div>

                <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: '#0F0D09' }}>
                  Spécialités &amp; Domaines d'Expertise
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(pro.tags || pro.specialities || ["Menuiserie sur-mesure", "Plans 3D", "Finitions"]).map((t, idx) => (
                    <span key={idx} style={{ background: 'rgba(212,175,55,0.12)', color: '#926F08', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* SOUS-MODAL DÉTAILS DE CHANTIER SI OUVERT DEPUIS LE PROFIL */}
      {selectedSubProject && (
        <ProProjectDetailModal
          project={selectedSubProject}
          currentUser={currentUser}
          onClose={() => setSelectedSubProject(null)}
          onRequestQuote={(proj) => {
            setSelectedSubProject(null);
            setQuoteProjectData(proj || selectedSubProject);
            if (onRequestQuote) {
              onRequestQuote(pro, proj || selectedSubProject);
            } else {
              setQuoteModalOpen(true);
            }
          }}
          onOrderEscrow={(proj) => {
            setSelectedSubProject(null);
            const p = proj || selectedSubProject;
            const rawBudget = parseInt(String(p.budget || '').replace(/[^0-9]/g, ''), 10);
            const depositAmount = rawBudget && rawBudget > 0 ? (rawBudget <= 100000 ? rawBudget : Math.round(rawBudget * 0.5)) : 50000;
            setEscrowModalData({
              service: p.title,
              acompte: depositAmount,
              totalBudget: rawBudget || depositAmount,
              pro: pro.name || p.author?.name || 'Artisan Certifié'
            });
          }}
        />
      )}

      {/* MODAL DE DEVIS DEPUIS LE PROFIL */}
      {quoteModalOpen && (
        <ProQuoteRequestModal
          proData={pro}
          projectData={quoteProjectData}
          onClose={() => {
            setQuoteModalOpen(false);
            setQuoteProjectData(null);
          }}
        />
      )}

      {/* MODAL ESCROW ACOMPTE SÉCURISÉ DEPUIS LE PROFIL */}
      {escrowModalData && (
        <ProEscrowModal
          projectData={escrowModalData}
          onClose={() => setEscrowModalData(null)}
          onSuccess={() => {
            alert('✓ Acompte sécurisé validé avec succès par Piolo Protec !');
            setEscrowModalData(null);
          }}
        />
      )}

      {/* MODAL DE CONFIRMATION DE POINTS */}
      <PointConfirmationModal
        isOpen={pointConfirmModal.isOpen}
        actionKey={pointConfirmModal.actionKey}
        targetTitle={pointConfirmModal.targetTitle}
        targetSubtitle={pointConfirmModal.targetSubtitle}
        onConfirm={() => {
          const fn = pointConfirmModal.onConfirmAction;
          setPointConfirmModal(prev => ({ ...prev, isOpen: false }));
          if (fn) fn();
        }}
        onCancel={() => setPointConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onOpenRecharge={() => {
          setPointConfirmModal(prev => ({ ...prev, isOpen: false }));
          setTenantSubModalOpen(true);
        }}
      />

      {/* MODAL D'ABONNEMENT */}
      {tenantSubModalOpen && (
        <TenantSubscriptionModal
          isOpen={tenantSubModalOpen}
          onClose={() => setTenantSubModalOpen(false)}
        />
      )}
    </div>
  );
}
