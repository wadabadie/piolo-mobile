import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useDarkMode } from '../../context/DarkModeContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api, { propertiesApi, bookingsApi } from '../../services/api';
import './dashboard.css';
import Sidebar from '../../components/Sidebar';
import StudioReelEditor from '../../components/StudioReelEditor';
import PioloLoader from '../../components/PioloLoader';
import NotificationCenter from '../../components/NotificationCenter';
import MobileBottomNav from '../../components/MobileBottomNav';
import UserAvatarMenu from '../../components/UserAvatarMenu';
import LandlordSubscriptionModal from '../../components/LandlordSubscriptionModal';
import LandlordConciergeModal from '../../components/LandlordConciergeModal';
import RentEstimatorModal from '../../components/RentEstimatorModal';
import BailleurKYCModal from '../../components/BailleurKYCModal';
import { subscriptionService } from '../../services/subscriptionService';
import { cacheManager } from '../../services/cacheManager';
import { getMediaUrl } from '../../utils/media';

/* ─── Skeleton inline ───────────────────────────────────────────── */
const Sk = ({ w = '100%', h = 18, r = 8, style = {} }) => (
  <div style={{
    width: w, height: h, borderRadius: r,
    background: 'linear-gradient(90deg,#e8e3da 25%,#f5f0e8 50%,#e8e3da 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    display: 'inline-block',
    ...style
  }} />
);

/* ─── Property image URL helper ─────────────────────────────────── */
const getPropImg = (prop) => {
  if (prop.main_image) return prop.main_image;
  if (prop.images?.length) {
    const img = prop.images[0];
    return img.image_url || img.image || null;
  }
  return null;
};

const formatMediaUrl = (value) => {
  if (!value || typeof value !== 'string') return null;
  return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')
    ? value
    : (value.startsWith('/') ? value : `/${value}`);
};

const getAvatarImg = (user) => {
  const value = user?.avatar_url || user?.avatar;
  return formatMediaUrl(value);
};

/* ─── Status label ──────────────────────────────────────────────── */
const STATUS_MAP = {
  PUBLISHED: { cls: 'st-published', lbl: 'Publiée' },
  PENDING:   { cls: 'st-pending',   lbl: 'En attente' },
  DRAFT:     { cls: 'st-draft',     lbl: 'Brouillon' },
  ARCHIVED:  { cls: 'st-archived',  lbl: 'Archivée' },
  RENTED:    { cls: 'st-published', lbl: 'Louée' },
};

const VISIT_STATUS_MAP = {
  PENDING:   { label: 'En attente', cls: 'pending' },
  CONFIRMED: { label: 'Confirmée', cls: 'confirmed' },
  REFUSED:   { label: 'Refusée', cls: 'refused' },
  CANCELLED: { label: 'Annulée', cls: 'cancelled' },
};

const LOCATION_STATUS_MAP = {
  PENDING:   { label: 'En attente', cls: 'pending' },
  REVIEWING: { label: 'En examen', cls: 'reviewing' },
  ACCEPTED:  { label: 'Acceptée', cls: 'accepted' },
  REFUSED:   { label: 'Refusée', cls: 'refused' },
  CANCELLED: { label: 'Annulée', cls: 'cancelled' },
};

const BOOKING_STATUS_MAP = {
  PENDING:   { label: 'En attente', cls: 'pending', color: '#D97706', bg: '#FEF3C7' },
  CONFIRMED: { label: 'Confirmée', cls: 'confirmed', color: '#059669', bg: '#D1FAE5' },
  COMPLETED: { label: 'Séjour terminé', cls: 'completed', color: '#4B5563', bg: '#F3F4F6' },
  REFUSED:   { label: 'Refusée', cls: 'refused', color: '#DC2626', bg: '#FEE2E2' },
  CANCELLED: { label: 'Annulée', cls: 'cancelled', color: '#6B7280', bg: '#F3F4F6' },
};

const dateKey = (value) => {
  if (!value) return '';
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return '';
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
};

/* ─── BANNIÈRE CERTIFICATION KYC PRO (MOBILE & DESKTOP) ─────────── */
function BailleurKYCBanner({ isVerified, dossierStatus, rejectionReason, onOpenModal, isDark, isMobile = false }) {
  if (isVerified) return null;

  if (dossierStatus === 'PENDING') {
    return (
      <div style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(212,175,55,0.14) 0%, rgba(26,20,10,0.6) 100%)'
          : 'linear-gradient(135deg, #FFFDF8 0%, #FAF6EE 100%)',
        border: '1.5px solid rgba(212,175,55,0.45)',
        borderRadius: isMobile ? 14 : 18,
        padding: isMobile ? '12px 14px' : '16px 20px',
        marginBottom: isMobile ? 14 : 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 15px rgba(212,175,55,0.12)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
          <div style={{
            width: isMobile ? 36 : 42,
            height: isMobile ? 36 : 42,
            borderRadius: '50%',
            background: isDark ? 'rgba(212,175,55,0.2)' : 'rgba(212,175,55,0.15)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontWeight: 800,
              fontSize: isMobile ? 13 : 14.5,
              color: isDark ? '#F6D365' : '#785D08',
              fontFamily: 'Poppins, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <span>Vérification en cours d'examen</span>
              <span style={{ fontSize: 9.5, padding: '2px 7px', borderRadius: 999, background: 'rgba(212,175,55,0.2)', color: isDark ? '#F6D365' : '#785D08', fontWeight: 800, textTransform: 'uppercase' }}>24h-48h</span>
            </div>
            <div style={{
              fontSize: isMobile ? 11.5 : 12.5,
              color: isDark ? 'rgba(255,255,255,0.78)' : '#4A453E',
              marginTop: 2,
              lineHeight: 1.35
            }}>
              Vos pièces d'identité sont en cours de validation par nos équipes.
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenModal}
          style={{
            background: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
            border: '1.5px solid rgba(212,175,55,0.5)',
            borderRadius: 10,
            padding: isMobile ? '8px 12px' : '9px 16px',
            color: isDark ? '#F6D365' : '#785D08',
            fontWeight: 800,
            fontSize: isMobile ? 11.5 : 12.5,
            cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif',
            whiteSpace: 'nowrap'
          }}
        >
          Voir mon dossier
        </button>
      </div>
    );
  }

  if (dossierStatus === 'REJECTED') {
    return (
      <div style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(20,10,10,0.6) 100%)'
          : 'linear-gradient(135deg, #FFF9F9 0%, #FEF2F2 100%)',
        border: '1.5px solid rgba(239, 68, 68, 0.4)',
        borderRadius: isMobile ? 14 : 18,
        padding: isMobile ? '12px 14px' : '16px 20px',
        marginBottom: isMobile ? 14 : 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
        boxShadow: '0 4px 15px rgba(239,68,68,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
          <div style={{
            width: isMobile ? 36 : 42,
            height: isMobile ? 36 : 42,
            borderRadius: '50%',
            background: 'rgba(239,68,68,0.15)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontWeight: 800,
              fontSize: isMobile ? 13 : 14.5,
              color: '#EF4444',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Dossier de certification à corriger
            </div>
            <div style={{
              fontSize: isMobile ? 11.5 : 12.5,
              color: isDark ? '#FCA5A5' : '#7F1D1D',
              marginTop: 2,
              lineHeight: 1.35
            }}>
              {rejectionReason || 'Une pièce d’identité est illisible. Merci de la renouveler.'}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenModal}
          style={{
            background: '#EF4444',
            border: 'none',
            borderRadius: 10,
            padding: isMobile ? '8px 12px' : '9px 16px',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: isMobile ? 11.5 : 12.5,
            cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif',
            whiteSpace: 'nowrap'
          }}
        >
          Corriger mon dossier →
        </button>
      </div>
    );
  }

  // État initial : Pas encore certifié
  return (
    <div style={{
      background: isDark
        ? 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(26,20,10,0.7) 100%)'
        : 'linear-gradient(135deg, #FFFDF8 0%, #F9F5EC 100%)',
      border: '1.5px solid rgba(212,175,55,0.42)',
      borderRadius: isMobile ? 14 : 18,
      padding: isMobile ? '12px 14px' : '16px 20px',
      marginBottom: isMobile ? 14 : 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
      boxShadow: isDark ? '0 6px 24px rgba(0,0,0,0.4)' : '0 4px 20px rgba(212,175,55,0.14)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
        <div style={{
          width: isMobile ? 38 : 44,
          height: isMobile ? 38 : 44,
          borderRadius: '50%',
          background: isDark ? 'rgba(212,175,55,0.22)' : 'rgba(212,175,55,0.16)',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontWeight: 800,
            fontSize: isMobile ? 13.5 : 15,
            color: isDark ? '#F6D365' : '#14120E',
            fontFamily: 'Poppins, sans-serif',
            letterSpacing: '-0.2px'
          }}>
            Certifiez votre profil Bailleur <span style={{ fontSize: 10.5, fontWeight: 700, color: isDark ? '#D4AF37' : '#785D08', background: isDark ? 'rgba(212,175,55,0.18)' : 'rgba(212,175,55,0.15)', padding: '2px 7px', borderRadius: 6, marginLeft: 6 }}>Vérification Pro</span>
          </div>
          <div style={{
            fontSize: isMobile ? 11.5 : 12.5,
            color: isDark ? 'rgba(255,255,255,0.8)' : '#4A453E',
            marginTop: 3,
            lineHeight: 1.35
          }}>
            Obtenez le badge officiel <strong>Bailleur Vérifié</strong> et multipliez par 3 les contacts de locataires qualifiés.
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpenModal}
        style={{
          background: 'linear-gradient(135deg, #D4AF37, #F6D365)',
          border: 'none',
          borderRadius: 12,
          padding: isMobile ? '9px 14px' : '10px 18px',
          color: '#0F0D09',
          fontWeight: 800,
          fontSize: isMobile ? 12 : 13,
          cursor: 'pointer',
          boxShadow: '0 3px 12px rgba(212,175,55,0.35)',
          fontFamily: 'Poppins, sans-serif',
          whiteSpace: 'nowrap',
          width: isMobile ? '100%' : 'auto',
          textAlign: 'center'
        }}
      >
        Faire certifier mon compte →
      </button>
    </div>
  );
}

export default function BailleurDashboard() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { dark: isDark } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();

  const cachedInitialData = cacheManager.get('bailleur_dashboard_data');
  const [data, setData] = useState(() => cachedInitialData);
  const [loading, setLoading] = useState(() => !cachedInitialData);
  // Afficher le PioloLoader (logo plein écran) uniquement lors de la 1ère connexion / session fraîche
  const [showInitialLoader, setShowInitialLoader] = useState(() => {
    const justLoggedIn = sessionStorage.getItem('piolo_just_logged_in') === 'true';
    const seen = sessionStorage.getItem('piolo_dashboard_bailleur_seen') === 'true';
    return (justLoggedIn || !seen) && !cachedInitialData;
  });
  const [postPublishConciergeOpen, setPostPublishConciergeOpen] = useState(false);
  const [selectedReelProp, setSelectedReelProp] = useState(null);
  const [uploadingReel, setUploadingReel] = useState(false);
  const [viewReelProp, setViewReelProp] = useState(null);
  const [deleteReelConfirmProp, setDeleteReelConfirmProp] = useState(null);
  const [deletingReel, setDeletingReel] = useState(false);
  const [archiveModalProp, setArchiveModalProp] = useState(null);
  const [archiving, setArchiving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [mobileActivityTab, setMobileActivityTab] = useState('visites');
  const [mobilePropFilter, setMobilePropFilter] = useState('all'); // 'all' | 'published' | 'with_360' | 'with_reel' | 'archived'
  const [bookings, setBookings] = useState(() => cacheManager.get('bailleur_bookings_data') || []);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockPropId, setBlockPropId] = useState('');
  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const [blockReason, setBlockReason] = useState('Indisponible (Hôte)');
  const [blockingSubmitting, setBlockingSubmitting] = useState(false);
  const [rentEstimatorOpen, setRentEstimatorOpen] = useState(false);
  const [landlordSubscriptionOpen, setLandlordSubscriptionOpen] = useState(false);
  const [landlordConciergeOpen, setLandlordConciergeOpen] = useState(false);
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [boostTargetProperty, setBoostTargetProperty] = useState(null);
  const [landlordPoints, setLandlordPoints] = useState(() => subscriptionService.getLandlordPoints(user?.id));
  const [landlordPlan, setLandlordPlan] = useState(() => subscriptionService.getLandlordPlan(user?.id));
  const [conciergeRequests, setConciergeRequests] = useState([]);
  const bailleurPropsCarouselRef = useRef(null);

  const isAnyModalOpen = kycModalOpen || landlordSubscriptionOpen || landlordConciergeOpen || rentEstimatorOpen || postPublishConciergeOpen || blockModalOpen || !!archiveModalProp || !!viewReelProp || !!deleteReelConfirmProp || !!selectedReelProp;

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isAnyModalOpen]);

  const fetchDashboard = useCallback(async () => {
    try {
      // Le tableau de bord garde un aperçu complet pour que les compteurs restent exacts.
      const [res, bRes] = await Promise.all([
        api.get('/auth/bailleur-dashboard/?full=1'),
        bookingsApi.list().catch(() => ({ data: { results: [] } }))
      ]);
      setData(res.data);
      if (res.data?.kpis?.points !== undefined) {
        setLandlordPoints(res.data.kpis.points);
        subscriptionService.setLandlordPoints(user?.id, res.data.kpis.points);
      }
      const bList = bRes.data?.results || [];
      setBookings(bList);
      cacheManager.set('bailleur_dashboard_data', res.data, 180000);
      cacheManager.set('bailleur_bookings_data', bList, 180000);
    } catch (e) {
      console.error('Dashboard API error:', e);
    } finally {
      setLoading(false);
      setShowInitialLoader(false);
      sessionStorage.setItem('piolo_dashboard_bailleur_seen', 'true');
      sessionStorage.removeItem('piolo_just_logged_in');
    }
  }, []);

  // Synchronisation en temps réel des points, abonnement et conciergerie
  useEffect(() => {
    // Charger les mandats réels persistés sur le backend Django
    subscriptionService.fetchConciergeMandates().then((data) => {
      if (Array.isArray(data)) setConciergeRequests(data);
    });

    const handlePointsUpdate = (e) => {
      if (e.detail?.points !== undefined) setLandlordPoints(e.detail.points);
    };
    const handlePlanUpdate = (e) => {
      if (e.detail?.plan) setLandlordPlan(e.detail.plan);
    };
    const handleConciergeUpdate = () => {
      subscriptionService.fetchConciergeMandates().then((data) => {
        if (Array.isArray(data)) setConciergeRequests(data);
      });
      setConciergeRequests(subscriptionService.getConciergeRequests(user?.id));
    };
    const handleBoostUpdate = () => {
      setLandlordPoints(subscriptionService.getLandlordPoints(user?.id));
      fetchDashboard();
    };

    window.addEventListener('piolo_landlord_points_updated', handlePointsUpdate);
    window.addEventListener('piolo_landlord_plan_updated', handlePlanUpdate);
    window.addEventListener('piolo_concierge_created', handleConciergeUpdate);
    window.addEventListener('piolo_boost_applied', handleBoostUpdate);

    return () => {
      window.removeEventListener('piolo_landlord_points_updated', handlePointsUpdate);
      window.removeEventListener('piolo_landlord_plan_updated', handlePlanUpdate);
      window.removeEventListener('piolo_concierge_created', handleConciergeUpdate);
      window.removeEventListener('piolo_boost_applied', handleBoostUpdate);
    };
  }, [user?.id, fetchDashboard]);

  // Redirection automatique si le compte est un Professionnel / Architecte
  useEffect(() => {
    if (user && (user.role === 'ARCHITECTE' || user.role === 'PROFESSIONNEL')) {
      navigate('/dashboard/pro', { replace: true });
    }
  }, [user, navigate]);

  // Déclenchement doux de la conciergerie après publication d'un bien
  useEffect(() => {
    if (location.state?.justPublished) {
      const propTitle = location.state.propertyTitle || 'votre bien';
      setToastMsg(`🎉 Annonce « ${propTitle} » envoyée en validation ! Vous serez notifié dès qu'elle est publiée.`);
      // Effacer le state pour ne pas re-déclencher au rechargement
      navigate(location.pathname, { replace: true, state: {} });
      // Proposer la gestion déléguée après 4s (quand le bailleur est calmé)
      const timer = setTimeout(() => {
        setPostPublishConciergeOpen(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [location.state?.justPublished]);

  // Ouverture automatique du Studio Reel depuis un lien ou flux de publication
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const openReelId = params.get('openReel');
    if (openReelId) {
      if (data?.recent_properties?.length) {
        const match = data.recent_properties.find(p => String(p.id) === String(openReelId) || p.slug === openReelId);
        if (match) {
          setSelectedReelProp(match);
        } else {
          propertiesApi.detail(openReelId).then(res => {
            if (res?.data) setSelectedReelProp(res.data);
          }).catch(() => {});
        }
      } else {
        propertiesApi.detail(openReelId).then(res => {
          if (res?.data) setSelectedReelProp(res.data);
        }).catch(() => {});
      }
      navigate('/dashboard/bailleur', { replace: true });
    }
  }, [location.search, data?.recent_properties, navigate]);

  const handleUnarchiveProperty = async (prop) => {
    if (!prop?.id) return;
    try {
      if (propertiesApi.unarchive) {
        await propertiesApi.unarchive(prop.id);
      } else {
        await propertiesApi.update(prop.id, { status: 'PUBLISHED', is_published: true });
      }
      setToastMsg(`L'annonce "${prop.title}" a été réactivée avec succès.`);
      fetchDashboard();
    } catch (err) {
      try {
        await propertiesApi.update(prop.id, { status: 'DRAFT' });
        setToastMsg(`L'annonce "${prop.title}" est maintenant en brouillon.`);
        fetchDashboard();
      } catch (_) {
        alert("Erreur lors de la réactivation de l'annonce.");
      }
    }
  };

  const handleShareProperty = async (prop) => {
    if (!prop) return;
    const shareUrl = `${window.location.origin}/properties/${prop.slug || prop.id}`;
    const shareText = `Bonjour, découvrez ce bien disponible sur Piolo : "${prop.title}" à ${prop.city}${prop.neighborhood ? `, ${prop.neighborhood}` : ''} - ${parseInt(prop.price || 0).toLocaleString('fr-FR')} FCFA/mois.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: prop.title,
          text: shareText,
          url: shareUrl,
        });
        setToastMsg("Lien partagé avec succès !");
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.log('Share canceled or failed');
        }
      }
    }

    // Fallback WhatsApp direct
    const waUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(waUrl, '_blank');
    setToastMsg("Ouverture de WhatsApp pour le partage…");
  };

  // Auto-scroll horizontal fluide pour le carrousel de biens mobile
  useEffect(() => {
    const scrollCarousel = (ref) => {
      if (!ref.current) return;
      const el = ref.current;
      if (el.matches(':hover') || el.matches(':active')) return;
      
      const item = el.querySelector('.horizontal-carousel-item');
      const step = item ? item.offsetWidth + 16 : 310;
      const maxScroll = el.scrollWidth - el.clientWidth;
      
      if (el.scrollLeft + step >= maxScroll - 15) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' });
      }
    };

    const interval = setInterval(() => {
      scrollCarousel(bailleurPropsCarouselRef);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const isModalOpen = Boolean(selectedReelProp || viewReelProp || deleteReelConfirmProp || archiveModalProp);
    if (isModalOpen) {
      document.body.classList.add('reel-modal-open');
    } else {
      document.body.classList.remove('reel-modal-open');
    }
    return () => {
      document.body.classList.remove('reel-modal-open');
    };
  }, [selectedReelProp, viewReelProp, deleteReelConfirmProp, archiveModalProp]);

  const shortTermProps = useMemo(() => {
    const list = data?.recent_properties || data?.properties || [];
    return list.filter(p => p.transaction_type === 'COURTE_DUREE');
  }, [data]);

  const handleBookingAction = async (bookingId, actionName) => {
    try {
      await bookingsApi.action(bookingId, actionName);
      setToastMsg("Réservation mise à jour avec succès.");
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors de la mise à jour.");
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir débloquer ces dates ?")) return;
    try {
      await bookingsApi.delete(bookingId);
      setToastMsg("Dates débloquées avec succès.");
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors du déblocage.");
    }
  };

  const handleCreateBlockDates = async (e) => {
    e.preventDefault();
    if (!blockPropId || !blockStart || !blockEnd) {
      alert("Veuillez sélectionner le bien ainsi que les dates de début et de fin.");
      return;
    }
    setBlockingSubmitting(true);
    try {
      await bookingsApi.blockDates(blockPropId, {
        check_in_date: blockStart,
        check_out_date: blockEnd,
        block_reason: blockReason || 'Indisponible (Hôte)',
      });
      setToastMsg("Dates bloquées avec succès !");
      setBlockModalOpen(false);
      setBlockStart('');
      setBlockEnd('');
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors du blocage des dates.");
    } finally {
      setBlockingSubmitting(false);
    }
  };

  const confirmArchiveProperty = async () => {
    if (!archiveModalProp) return;
    setArchiving(true);
    const archivedProperty = { ...archiveModalProp, status: 'ARCHIVED', is_published: false };
    const wasActive = archiveModalProp.is_published !== false && archiveModalProp.status !== 'ARCHIVED';
    const applyArchiveLocally = () => {
      setData((current) => {
        if (!current) return current;
        const currentRecent = current.recent_properties || [];
        const currentArchived = current.archived_properties || [];
        const alreadyArchived = currentArchived.some((property) => String(property.id) === String(archiveModalProp.id));
        return {
          ...current,
          recent_properties: currentRecent.filter((property) => String(property.id) !== String(archiveModalProp.id)),
          archived_properties: [archivedProperty, ...currentArchived.filter((property) => String(property.id) !== String(archiveModalProp.id))],
          kpis: {
            ...(current.kpis || {}),
            active_properties: Math.max(0, Number(current.kpis?.active_properties || 0) - (wasActive ? 1 : 0)),
            archived_count: Number(current.kpis?.archived_count || 0) + (alreadyArchived ? 0 : 1),
          },
        };
      });
    };
    try {
      await propertiesApi.archive(archiveModalProp.id);
      applyArchiveLocally();
      setToastMsg(`L'annonce "${archiveModalProp.title}" a été archivée avec succès.`);
      setArchiveModalProp(null);
      fetchDashboard();
    } catch (err) {
      console.error('Erreur archivage:', err);
      try {
        await propertiesApi.update(archiveModalProp.id, { status: 'ARCHIVED', is_published: false });
        applyArchiveLocally();
        setToastMsg(`L'annonce "${archiveModalProp.title}" a été archivée avec succès.`);
        setArchiveModalProp(null);
        fetchDashboard();
      } catch (e) {
        alert("Erreur lors de l'archivage de l'annonce.");
      }
    } finally {
      setArchiving(false);
    }
  };

  const handleDeleteReel = async (propId) => {
    setDeletingReel(true);
    try {
      const fd = new FormData();
      fd.append('video_reel', '');
      await propertiesApi.update(propId, fd);
      setToastMsg("La vidéo Reel a été supprimée avec succès.");
      setViewReelProp(null);
      setDeleteReelConfirmProp(null);
      setSelectedReelProp(null);
      fetchDashboard();
    } catch (err) {
      void err;
      setToastMsg("Erreur lors de la suppression de la vidéo.");
    } finally {
      setDeletingReel(false);
    }
  };

  /* handleReelPublish est appelé par StudioReelEditor avec (file, caption) */
  const [reelUploadProgress, setReelUploadProgress] = useState(0);
  const handleReelPublish = async (file, caption) => {
    if (!selectedReelProp) return;
    setUploadingReel(true);
    setReelUploadProgress(0);
    try {
      const formData = new FormData();
      if (file) formData.append('video_reel', file);
      if (caption !== undefined && caption !== null) {
        formData.append('reel_description', caption);
        formData.append('caption', caption);
      }
      const onProgress = (progressEvent) => {
        if (progressEvent.total) {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setReelUploadProgress(pct);
        }
      };
      await propertiesApi.uploadVideoReel(selectedReelProp.id, formData, onProgress);
      setToastMsg('Vidéo Découverte (Reel) enregistrée avec succès !');
      const targetSlug = selectedReelProp.slug || selectedReelProp.id;
      setSelectedReelProp(null);
      setReelUploadProgress(0);
      fetchDashboard();
      navigate(`/decouverte?prop=${encodeURIComponent(targetSlug)}`);
    } catch (err) {
      console.error('Erreur upload reel:', err);
      const serverMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.response?.data?.video_reel ||
        (typeof err.response?.data === 'string' ? err.response.data : '') ||
        err.message;
      const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
      alert(
        isTimeout
          ? `L'envoi a pris trop de temps. Réessayez avec une connexion plus rapide ou une vidéo plus légère.`
          : `Erreur lors de l'enregistrement de la vidéo : ${serverMsg || 'Vérifiez la taille et le format de la vidéo.'}`
      );
    } finally {
      setUploadingReel(false);
      setReelUploadProgress(0);
    }
  };

  useEffect(() => {
    if (user?.role === 'BAILLEUR' || user?.is_bailleur) {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const kpis = data?.kpis ?? {};
  const recent = useMemo(() => subscriptionService.sortPropertiesByBoost(data?.recent_properties ?? []), [data?.recent_properties, landlordPoints]);
  const archived = data?.archived_properties ?? [];
  const visits   = useMemo(() => data?.visit_requests ?? [], [data?.visit_requests]);
  const locs     = data?.location_requests ?? [];
  
  const points   = (user?.points !== undefined && user?.points !== null && user.points > 0) ? user.points : landlordPoints;
  const ptsPct   = Math.min((points / 500) * 100, 100);
  const profileCompletion = Number.isFinite(Number(kpis.profile_completion))
    ? Number(kpis.profile_completion)
    : Math.round(([user?.first_name, user?.last_name, user?.email, user?.phone, user?.city, user?.avatar_url || user?.avatar].filter(Boolean).length / 6) * 100);
  const avatarImg = getAvatarImg(user);

  const [calendarCursor, setCalendarCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const calendar = useMemo(() => {
    const year = calendarCursor.getFullYear();
    const month = calendarCursor.getMonth();
    const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const events = {};

    const addEvent = (value, type) => {
      const key = dateKey(value);
      if (!key) return;
      if (!events[key]) events[key] = { requested: 0, confirmed: 0, refused: 0, cancelled: 0 };
      events[key][type] += 1;
    };

    visits.forEach((visit) => {
      const status = String(visit.status || '').toUpperCase();
      if (status === 'CONFIRMED') {
        addEvent(visit.requested_date, 'requested');
        addEvent(visit.confirmed_date || visit.requested_date, 'confirmed');
      } else if (status === 'REFUSED') {
        addEvent(visit.requested_date, 'refused');
      } else if (status === 'CANCELLED') {
        addEvent(visit.requested_date, 'cancelled');
      } else {
        addEvent(visit.requested_date, 'requested');
      }
    });

    const today = dateKey(new Date());
    const cells = [];
    for (let i = 0; i < firstDayOffset; i += 1) cells.push({ key: `empty-${i}`, empty: true });
    for (let day = 1; day <= daysInMonth; day += 1) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({ key, day, today: key === today, event: events[key] });
    }

    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthCount = visits.filter((visit) => {
      const requested = dateKey(visit.requested_date);
      const confirmed = dateKey(visit.confirmed_date);
      return requested.startsWith(monthPrefix) || confirmed.startsWith(monthPrefix);
    }).length;

    return {
      cells,
      monthCount,
      label: new Date(year, month, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
    };
  }, [calendarCursor, visits]);

  const [selectedCalDate, setSelectedCalDate] = useState(() => dateKey(new Date()));

  const selectedDateVisits = useMemo(() => {
    if (!selectedCalDate) return [];
    return visits.filter((visit) => {
      const reqDate = dateKey(visit.requested_date);
      const confDate = dateKey(visit.confirmed_date);
      return reqDate === selectedCalDate || confDate === selectedCalDate;
    });
  }, [selectedCalDate, visits]);

  const selectedDateFormatted = useMemo(() => {
    if (!selectedCalDate) return '';
    try {
      const [y, m, d] = selectedCalDate.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch (_) {
      return selectedCalDate;
    }
  }, [selectedCalDate]);

  const isActive = (path) => location.pathname === path;

  /* ──────────────────────────────────────────────────────────────
     RENDER
  ────────────────────────────────────────────────────────────── */
  return (
    <div className="layout">
      <PioloLoader show={showInitialLoader} />

      {/* ═══════════════════════════════════════
          SIDEBAR
      ═══════════════════════════════════════ */}
      <Sidebar data={data} />

      {/* ═══════════════════════════════════════
          MAIN
      ═══════════════════════════════════════ */}
      <div className="main">

        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-title">{t('dashboard.topbar_landlord_part1', 'Espace')} <span>{t('dashboard.topbar_landlord_part2', 'Bailleur')}</span></div>
          <div className="tb-search">
            <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            <input type="text" placeholder={t('dashboard.search_landlord_placeholder', 'Rechercher une annonce, un locataire…')} />
          </div>
            <div className="tb-actions">
              {/* Badge Points Bailleur */}
              <div
                className="tb-pts-badge"
                onClick={() => setLandlordSubscriptionOpen(true)}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(212,175,55,0.12)',
                  border: '1.5px solid rgba(212,175,55,0.35)',
                  borderRadius: 20,
                  padding: '6px 12px'
                }}
                title={t('dashboard.recharge_landlord_points_tooltip', 'Cliquer pour recharger vos points ou voir vos boosts')}
              >
                <svg width="14" height="14" fill="#FFD700" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <span className="tb-pts-val" style={{ fontWeight: 800, color: '#B8860B', fontSize: 13 }}>
                  {landlordPoints !== undefined ? landlordPoints : 45} Pts
                </span>
              </div>

              {/* Badge Formule Active */}
              <div
                className="tb-plan-badge"
                onClick={() => setLandlordSubscriptionOpen(true)}
                style={{
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  background: '#FFF8E7',
                  border: '1px solid #F5E5BE',
                  borderRadius: 20,
                  padding: '5px 10px',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#9A6700'
                }}
                title={t('dashboard.manage_subscription_tooltip', "Gérer votre formule d'abonnement bailleur")}
              >
                <span>★</span>
                <span>{landlordPlan?.name || 'Bailleur Essentiel'}</span>
                <span style={{ fontSize: 10, background: '#9A6700', color: '#FFF', padding: '1px 5px', borderRadius: 6, fontWeight: 800, marginLeft: 2 }}>
                  Actif
                </span>
              </div>

              <NotificationCenter />
              <button
                type="button"
                className="tb-publish-btn"
                onClick={() => setRentEstimatorOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.18), rgba(212,175,55,0.08))',
                  borderColor: '#D4AF37',
                  color: '#D4AF37',
                  cursor: 'pointer'
                }}
                title={t('dashboard.ai_estimator_tooltip', "Estimer le loyer optimal avec l'IA Piolo")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
                  <path d="M12 12L2.5 7.5"/>
                  <path d="M12 12V22"/>
                  <circle cx="12" cy="12" r="3" fill="currentColor"/>
                </svg>
                Estimateur IA
              </button>
              <Link to="/properties/create" className="tb-publish-btn">
                <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                {t('sidebar.publish_listing')}
              </Link>
              <UserAvatarMenu size={38} />
            </div>
          </header>

        <main className="content">

          {/* ══════════════════════════════════════════
              AFFICHAGE STRICTEMENT MOBILE (STYLE APP PRO)
          ══════════════════════════════════════════ */}
          <div className="bailleur-mobile-sections">

            {/* En-tête Mobile App Bailleur — compact & mobile-first */}
            <div className="bailleur-app-header-mobile">
              {/* Gauche : avatar + nom + badge vérifié */}
              <Link to="/profil" style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1, textDecoration: 'none', color: 'inherit', cursor: 'pointer' }} title={t('dashboard.my_profile', 'Mon Profil')}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  border: '2px solid #D4AF37',
                  boxShadow: '0 0 10px rgba(212,175,55,0.35)',
                  overflow: 'hidden',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #2A261D, #0F0D09)'
                }}>
                  {user?.avatar_url || user?.avatar ? (
                    <img 
                      src={getMediaUrl(user.avatar_url || user.avatar)} 
                      alt="Avatar" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                    />
                  ) : (
                    <span style={{ color: '#D4AF37', fontWeight: 800, fontSize: 15 }}>
                      {(user?.first_name?.[0] || 'B').toUpperCase()}
                    </span>
                  )}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#FFF', fontFamily: 'Poppins, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t('dashboard.welcome')} {user?.first_name || 'Bailleur'}
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700, color: (user?.verification_level >= 2 || kpis?.is_verified) ? '#10B981' : '#D4AF37', marginTop: 2 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                    <span>{(user?.verification_level >= 2 || kpis?.is_verified) ? t('dashboard.verified_landlord') : (data?.dossier?.status === 'PENDING' ? 'Vérification en cours' : 'Non certifié')}</span>
                  </div>
                </div>
              </Link>
              {/* Droite : badge plan cliquable */}
              <button
                type="button"
                onClick={() => setLandlordSubscriptionOpen(true)}
                style={{ background: 'rgba(212,175,55,0.18)', border: '1.5px solid rgba(212,175,55,0.45)', borderRadius: 10, padding: '6px 10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flexShrink: 0 }}
                title="Gérer mon abonnement Bailleur"
              >
                <span style={{ fontSize: 9, fontWeight: 700, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  {landlordPlan ? landlordPlan.name?.replace('Bailleur ', '') : 'Essentiel'}
                </span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#F6D365', fontFamily: 'Poppins, sans-serif' }}>
                  {landlordPlan ? `★ ${t('dashboard.active')}` : `${landlordPoints} pts`}
                </span>
              </button>
            </div>

            {/* Bannière Certification KYC Mobile */}
            <BailleurKYCBanner
              isVerified={user?.verification_level >= 2 || kpis?.is_verified}
              dossierStatus={data?.dossier?.status || kpis?.dossier_status}
              rejectionReason={data?.dossier?.rejection_reason}
              onOpenModal={() => setKycModalOpen(true)}
              isDark={isDark}
              isMobile={true}
            />

            {/* Quick Actions Tactiles */}
            <div className="bailleur-mobile-quick-actions">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                <Link to="/properties/create" style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '10px 4px', background: 'linear-gradient(135deg, rgba(212,175,55,0.22), rgba(246,211,101,0.35))', borderRadius: 14,
                  border: '1.5px solid #D4AF37', textDecoration: 'none', color: '#111827',
                  boxShadow: '0 4px 14px rgba(212,175,55,0.22)'
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: '#0F0D09', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F6D365', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, fontFamily: 'Poppins, sans-serif', color: '#7A5B0B' }}>{t('dashboard.publish_listing')}</span>
                </Link>

                <div
                  onClick={() => setRentEstimatorOpen(true)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '10px 4px', background: '#172030', borderRadius: 14,
                    border: '1.5px solid rgba(212,175,55,0.5)', cursor: 'pointer', color: '#F5F0E8',
                    boxShadow: '0 3px 12px rgba(212,175,55,0.15)'
                  }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
                      <path d="M12 12L2.5 7.5"/>
                      <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'Poppins, sans-serif', color: '#D4AF37' }}>{t('dashboard.ai_estimator')}</span>
                </div>

                <Link to="/properties?owner=mine" style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '10px 4px', background: '#fff', borderRadius: 14,
                  border: '1px solid rgba(212,175,55,0.25)', textDecoration: 'none', color: '#111827',
                  boxShadow: '0 3px 12px rgba(0,0,0,0.04)'
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B8860B' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>{t('dashboard.my_properties')}</span>
                </Link>

                <Link to="/dashboard/bailleur/visites" style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '10px 4px', background: '#fff', borderRadius: 14,
                  border: '1px solid rgba(212,175,55,0.25)', textDecoration: 'none', color: '#111827',
                  boxShadow: '0 3px 12px rgba(0,0,0,0.04)', position: 'relative'
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>{t('dashboard.tab_visits')}</span>
                  {(kpis.pending_visits || 0) > 0 && (
                    <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: 'var(--rouge)' }} />
                  )}
                </Link>

                <Link to="/dashboard/bailleur/locations" style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '10px 4px', background: '#fff', borderRadius: 14,
                  border: '1px solid rgba(212,175,55,0.25)', textDecoration: 'none', color: '#111827',
                  boxShadow: '0 3px 12px rgba(0,0,0,0.04)', position: 'relative'
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(30,58,110,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bleu)' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>{t('dashboard.tab_locations')}</span>
                  {(kpis.pending_locations || 0) > 0 && (
                    <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: 'var(--rouge)' }} />
                  )}
                </Link>
              </div>
            </div>

            {/* Suivi mandats conciergerie (visible seulement si mandat actif) */}
            {conciergeRequests.length > 0 && (
              <div style={{
                margin: '0 0 14px',
                background: 'linear-gradient(135deg, #0F0D09 0%, #2A2418 100%)',
                borderRadius: 14,
                padding: '12px 14px',
                border: '1px solid rgba(212,175,55,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                flexWrap: 'wrap'
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#F6D365', letterSpacing: '0.5px', marginBottom: 2 }}>Piolo Signature · Mandat actif</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {conciergeRequests[0].propertyTitle || 'Mandat Signature'}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#9B9690', marginTop: 2 }}>
                    Agent : {conciergeRequests[0].assignedAgent || 'Équipe Piolo Pro'} · Réf: {conciergeRequests[0].id}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLandlordConciergeOpen(true)}
                  style={{ padding: '7px 12px', borderRadius: 8, background: 'linear-gradient(135deg, #D4AF37, #AA820A)', color: '#0F0D09', fontWeight: 800, fontSize: 11, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  Voir le mandat
                </button>
              </div>
            )}

            {/* ══════════════════════════════════════════
                HUB COMPACT D'ACTIVITÉ BAILLEUR
            ══════════════════════════════════════════ */}
            <div className="mobile-activity-hub">
              <div className="mobile-activity-header">
                <span className="mobile-activity-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#D4AF37"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
                  {t('dashboard.operations_management')}
                </span>
                <Link
                  to={mobileActivityTab === 'visites' ? '/dashboard/bailleur/visites' : mobileActivityTab === 'locations' ? '/dashboard/bailleur/locations' : '/properties?owner=mine'}
                  className="mobile-activity-link"
                >
                  {t('dashboard.view_all')}
                </Link>
              </div>

              {/* Onglets Hub */}
              <div className="mobile-activity-tabs">
                <button
                  type="button"
                  className={`mobile-activity-tab ${mobileActivityTab === 'visites' ? 'active' : ''}`}
                  onClick={() => setMobileActivityTab('visites')}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>
                  <span>{t('dashboard.tab_visits')}</span>
                  <span className="tab-badge">{visits.length}</span>
                </button>
                <button
                  type="button"
                  className={`mobile-activity-tab ${mobileActivityTab === 'locations' ? 'active' : ''}`}
                  onClick={() => setMobileActivityTab('locations')}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
                  <span>{t('dashboard.tab_locations')}</span>
                  <span className="tab-badge">{locs.length}</span>
                </button>
                <button
                  type="button"
                  className={`mobile-activity-tab ${mobileActivityTab === 'sejours' ? 'active' : ''}`}
                  onClick={() => setMobileActivityTab('sejours')}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/></svg>
                  <span>{t('dashboard.tab_bookings')}</span>
                  <span className="tab-badge" style={{ background: '#059669', color: '#fff' }}>{bookings.length}</span>
                </button>
                <button
                  type="button"
                  className={`mobile-activity-tab ${mobileActivityTab === 'biens' ? 'active' : ''}`}
                  onClick={() => setMobileActivityTab('biens')}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                  <span>{t('dashboard.tab_properties')}</span>
                  <span className="tab-badge">{recent.length + (archived.length > 0 ? archived.length : 0)}</span>
                </button>
              </div>

              {/* Onglet 1 : Visites */}
              {mobileActivityTab === 'visites' && (
                <div>
                  {loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[1, 2].map((n) => (
                        <div key={`sk-b-vis-${n}`} className="mobile-strip-item" style={{ background: '#fff', opacity: 0.85 }}>
                          <Sk w={44} h={44} r={10} style={{ flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Sk w="70%" h={14} r={4} style={{ marginBottom: 6 }} />
                            <Sk w="45%" h={11} r={4} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!loading && visits.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 13, color: 'var(--gris-m)' }}>
                      Aucune demande de visite pour le moment.
                    </div>
                  )}
                  {!loading && visits.slice(0, 3).map((req, i) => {
                    const normalizedStatus = String(req.status || '').toUpperCase();
                    const statusInfo = VISIT_STATUS_MAP[normalizedStatus] || { label: req.status || 'Inconnue', cls: 'cancelled' };
                    return (
                      <div key={req.id || i} style={{ marginBottom: 12 }}>
                        <div className="mobile-strip-item" style={{ marginBottom: 6, background: '#fff' }}>
                          <div style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: 'linear-gradient(135deg, var(--or), var(--or-l))',
                            display: 'grid', placeItems: 'center', flexShrink: 0,
                            fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 14, color: '#0F0D09'
                          }}>
                            {req.tenant?.first_name?.[0]?.toUpperCase() || 'T'}{req.tenant?.last_name?.[0]?.toUpperCase() || ''}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                              <span style={{ fontSize: 13, fontWeight: 800, color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {req.tenant?.first_name} {req.tenant?.last_name}
                              </span>
                              <span className={`mobile-badge-pill ${statusInfo.cls}`}>
                                {statusInfo.label}
                              </span>
                            </div>
                            <div style={{ fontSize: 11.5, color: 'var(--gris-m)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {req.property?.title} · {req.property?.city}
                            </div>
                            <div style={{ fontSize: 11, color: '#64605A', marginTop: 3 }}>
                              Date : {normalizedStatus === 'CONFIRMED' ? (req.confirmed_date || req.requested_date) : req.requested_date}
                              {normalizedStatus === 'CONFIRMED' && req.confirmed_time ? ` à ${req.confirmed_time.slice(0, 5)}` : ''}
                            </div>
                          </div>
                        </div>

                        {/* Raccourcis d'actions sous la carte avec espacement soigné */}
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center', paddingRight: 4, flexWrap: 'wrap' }}>
                          {req.status === 'PENDING' ? (
                            <>
                              <Link to={`/dashboard/bailleur/visites/${req.id}`} className="mobile-action-btn-sm gold">
                                Confirmer
                              </Link>
                              <Link to={`/dashboard/bailleur/visites/${req.id}`} className="mobile-action-btn-sm neutral">
                                Refuser
                              </Link>
                            </>
                          ) : (
                            <>
                              {normalizedStatus === 'CONFIRMED' && (
                                <Link
                                  to={`/messages?user=${req.tenant?.id || ''}`}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 5,
                                    padding: '6px 12px', borderRadius: 9,
                                    background: 'linear-gradient(135deg, #0F0D09 0%, #2A2418 100%)',
                                    color: '#F6D365', border: '1px solid rgba(212,175,55,0.4)',
                                    fontSize: 11.5, fontWeight: 700, fontFamily: 'Poppins, sans-serif',
                                    textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                  }}
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                                  <span>{t('dashboard.write_to_tenant', 'Écrire au locataire')}</span>
                                </Link>
                              )}
                              <Link to={`/dashboard/bailleur/visites/${req.id}`} className="mobile-action-btn-sm outline-gold">
                                <span>Voir détails</span>
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {visits.length > 3 && (
                    <Link to="/dashboard/bailleur/visites" style={{ display: 'block', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--or-d)', marginTop: 8 }}>
                      Voir toutes les visites ({visits.length}) →
                    </Link>
                  )}
                </div>
              )}

              {/* Onglet 2 : Candidatures de Location */}
              {mobileActivityTab === 'locations' && (
                <div>
                  {loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[1, 2].map((n) => (
                        <div key={`sk-b-loc-${n}`} className="mobile-strip-item" style={{ background: '#fff', opacity: 0.85 }}>
                          <Sk w={44} h={44} r={10} style={{ flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Sk w="70%" h={14} r={4} style={{ marginBottom: 6 }} />
                            <Sk w="45%" h={11} r={4} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!loading && locs.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 13, color: 'var(--gris-m)' }}>
                      Aucune candidature de location pour le moment.
                    </div>
                  )}
                  {!loading && locs.slice(0, 3).map((req, i) => {
                    const normalizedStatus = String(req.status || '').toUpperCase();
                    const statusInfo = LOCATION_STATUS_MAP[normalizedStatus] || { label: req.status || 'Inconnue', cls: 'cancelled' };
                    return (
                      <div key={req.id || i} style={{ marginBottom: 12 }}>
                        <div className="mobile-strip-item" style={{ marginBottom: 6, background: '#fff' }}>
                          <div style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: 'linear-gradient(135deg, var(--vert), #27AE60)',
                            display: 'grid', placeItems: 'center', flexShrink: 0,
                            fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 14, color: '#fff'
                          }}>
                            {req.tenant?.first_name?.[0]?.toUpperCase() || 'T'}{req.tenant?.last_name?.[0]?.toUpperCase() || ''}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                              <span style={{ fontSize: 13, fontWeight: 800, color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {req.tenant?.first_name} {req.tenant?.last_name}
                              </span>
                              <span className={`mobile-badge-pill ${statusInfo.cls}`}>
                                {statusInfo.label}
                              </span>
                            </div>
                            <div style={{ fontSize: 11.5, color: 'var(--gris-m)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {req.property?.title} · {parseInt(req.property?.price || 0).toLocaleString('fr-FR')} FCFA/mois
                            </div>
                            <div style={{ fontSize: 11, color: '#64605A', marginTop: 3 }}>
                              Entrée : {req.move_in_date || 'Dès que possible'} · {req.tenant_count || 1} occupant(s)
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', paddingRight: 4 }}>
                          <Link to={`/dashboard/bailleur/locations/${req.id}`} className="mobile-action-btn-sm gold">
                            Examiner dossier
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                  {locs.length > 3 && (
                    <Link to="/dashboard/bailleur/locations" style={{ display: 'block', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--or-d)', marginTop: 8 }}>
                       Voir tous les dossiers de location ({locs.length}) →
                    </Link>
                  )}
                </div>
              )}

              {/* Onglet 3 : Réservations Courts Séjours Mobile */}
              {mobileActivityTab === 'sejours' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--gris-m)' }}>
                      {bookings.length} réservation(s) & blocage(s)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (shortTermProps.length > 0 && !blockPropId) setBlockPropId(shortTermProps[0].id);
                        setBlockModalOpen(true);
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #059669, #10B981)',
                        color: '#fff', border: 'none', borderRadius: 9,
                        padding: '7px 12px', fontSize: 11.5, fontWeight: 800, cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: 6
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      <span>+ Bloquer</span>
                    </button>
                  </div>
                  {loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[1, 2].map((n) => (
                        <div key={`sk-b-sej-${n}`} className="mobile-strip-item" style={{ background: '#fff', opacity: 0.85 }}>
                          <Sk w={44} h={44} r={10} style={{ flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Sk w="70%" h={14} r={4} style={{ marginBottom: 6 }} />
                            <Sk w="45%" h={11} r={4} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!loading && bookings.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '24px 16px', fontSize: 13, color: 'var(--gris-m)', background: '#FAF9F6', borderRadius: 14, border: '1px dashed #E8E3DA' }}>
                      Aucune réservation de court séjour pour le moment.
                    </div>
                  )}
                  {!loading && bookings.map((b) => {
                    const isBlocked = b.is_blocked_by_host;
                    const statusInfo = BOOKING_STATUS_MAP[b.status] || { label: b.status, color: '#4B5563', bg: '#F3F4F6' };
                    const guestName = b.guest?.full_name || b.guest_name || 'Voyageur';
                    const guestPhone = b.guest?.phone || b.guest_phone || '';
                    return (
                      <div key={`mob-bk-${b.id}`} style={{ marginBottom: 12 }}>
                        <div className="mobile-strip-item" style={{ marginBottom: 6, background: '#fff', borderLeft: isBlocked ? '4px solid #8B5CF6' : '4px solid #10B981' }}>
                          <div style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: isBlocked ? 'linear-gradient(135deg, #7C3AED, #A78BFA)' : 'linear-gradient(135deg, #059669, #10B981)',
                            display: 'grid', placeItems: 'center', flexShrink: 0,
                            fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 14, color: '#fff'
                          }}>
                            {isBlocked ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                              </svg>
                            ) : (
                              guestName[0]?.toUpperCase() || 'V'
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                              <span style={{ fontSize: 13, fontWeight: 800, color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {isBlocked ? `Blocage : ${b.block_reason || 'Indisponible'}` : guestName}
                              </span>
                              <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 8, background: statusInfo.bg, color: statusInfo.color }}>
                                {isBlocked ? 'Bloqué' : statusInfo.label}
                              </span>
                            </div>
                            <div style={{ fontSize: 11.5, color: 'var(--gris-m)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {b.property?.title} · {new Intl.NumberFormat('fr-FR').format(b.total_price || 0)} FCFA ({b.nights_count} nuits)
                            </div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: isBlocked ? '#6D28D9' : '#059669', fontWeight: 700, marginTop: 4 }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                              </svg>
                              <span>{b.check_in_date} ➔ {b.check_out_date}</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', paddingRight: 4, flexWrap: 'wrap' }}>
                          {isBlocked ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteBooking(b.id)}
                              className="mobile-action-btn-sm neutral"
                              style={{ color: '#DC2626', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                              <span>{t('dashboard.unblock_dates', 'Débloquer ces dates')}</span>
                            </button>
                          ) : b.status === 'PENDING' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleBookingAction(b.id, 'accept')}
                                className="mobile-action-btn-sm gold"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                              >
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                <span>Accepter</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleBookingAction(b.id, 'refuse')}
                                className="mobile-action-btn-sm neutral"
                                style={{ color: '#DC2626', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                              >
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                                <span>Refuser</span>
                              </button>
                            </>
                          ) : null}
                          {guestPhone && (
                            <a
                              href={`https://wa.me/${guestPhone.replace(/\D/g, '').startsWith('237') ? guestPhone.replace(/\D/g, '') : `237${guestPhone.replace(/\D/g, '')}`}?text=${encodeURIComponent(`Bonjour ${guestName}, à propos de votre réservation pour "${b.property?.title}"...`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mobile-action-btn-sm neutral"
                              style={{ color: '#25D366', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/>
                              </svg>
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Onglet 3 : Mes Annonces (Actives, Brouillons, et Archivées) */}
              {mobileActivityTab === 'biens' && (
                <div>
                  {/* Sous-filtre pour Annonces */}
                  <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 12, scrollbarWidth: 'none' }}>
                    <button
                      type="button"
                      onClick={() => setMobilePropFilter('all')}
                      className={`mobile-filter-chip ${mobilePropFilter === 'all' ? 'active' : ''}`}
                    >
                      Toutes ({recent.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobilePropFilter('published')}
                      className={`mobile-filter-chip ${mobilePropFilter === 'published' ? 'active' : ''}`}
                    >
                      Actives ({recent.filter(p => p.status === 'PUBLISHED').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobilePropFilter('with_360')}
                      className={`mobile-filter-chip ${mobilePropFilter === 'with_360' ? 'active' : ''}`}
                    >
                      360° ({recent.filter(p => p.virtual_tours?.length > 0).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobilePropFilter('archived')}
                      className={`mobile-filter-chip ${mobilePropFilter === 'archived' ? 'active' : ''}`}
                    >
                      Archivées ({archived.length})
                    </button>
                  </div>

                  {loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[1, 2].map((n) => (
                        <div key={`sk-b-bn-${n}`} className="mobile-strip-item" style={{ background: '#fff', opacity: 0.85 }}>
                          <Sk w={48} h={48} r={10} style={{ flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Sk w="70%" h={14} r={4} style={{ marginBottom: 6 }} />
                            <Sk w="45%" h={11} r={4} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Affichage des annonces archivées si sélectionné */}
                  {!loading && mobilePropFilter === 'archived' && (
                    <div>
                      {archived.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 13, color: 'var(--gris-m)' }}>
                          Aucune annonce archivée.
                        </div>
                      ) : (
                        archived.map(prop => {
                          const img = getPropImg(prop);
                          return (
                            <div key={`arch-${prop.id}`} style={{ marginBottom: 12 }}>
                              <div className="mobile-strip-item" style={{ marginBottom: 6, background: '#fff', opacity: 0.85 }}>
                                {img ? (
                                  <img src={getMediaUrl(img)} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                                ) : (
                                  <div style={{ width: 48, height: 48, borderRadius: 10, background: '#EAE5D9', display: 'grid', placeItems: 'center', flexShrink: 0, color: '#92700C' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                                  </div>
                                )}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                    <span style={{ fontSize: 13, fontWeight: 800, color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {prop.title}
                                    </span>
                                    <span className="mobile-badge-pill draft">
                                      Archivée
                                    </span>
                                  </div>
                                  <div style={{ fontSize: 11.5, color: 'var(--gris-m)' }}>
                                    {prop.city} · {parseInt(prop.price || 0).toLocaleString('fr-FR')} FCFA/mois
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', paddingRight: 4 }}>
                                <button
                                  type="button"
                                  onClick={() => handleUnarchiveProperty(prop)}
                                  className="mobile-action-btn-sm gold"
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
                                  <span>Réactiver</span>
                                </button>
                                <Link to={`/properties/${prop.slug || prop.id}`} className="mobile-action-btn-sm neutral">
                                  <span>Voir</span>
                                </Link>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* Affichage des annonces actives / récentes filtrées */}
                  {!loading && mobilePropFilter !== 'archived' && (
                    <div>
                      {recent.filter(prop => {
                        if (mobilePropFilter === 'published') return prop.status === 'PUBLISHED';
                        if (mobilePropFilter === 'with_360') return prop.virtual_tours?.length > 0;
                        return true;
                      }).length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 13, color: 'var(--gris-m)' }}>
                          Aucune annonce trouvée pour ce filtre.
                          <Link to="/properties/create" style={{ display: 'block', color: 'var(--or-d)', fontWeight: 700, marginTop: 6 }}>
                            + Publier une annonce
                          </Link>
                        </div>
                      ) : (
                        recent
                          .filter(prop => {
                            if (mobilePropFilter === 'published') return prop.status === 'PUBLISHED';
                            if (mobilePropFilter === 'with_360') return prop.virtual_tours?.length > 0;
                            return true;
                          })
                          .slice(0, 4)
                          .map((prop) => {
                            const img = getPropImg(prop);
                            const st = STATUS_MAP[prop.status] || { cls: 'st-draft', lbl: prop.status || 'Brouillon' };
                            const hasVT = prop.virtual_tours?.length > 0;

                            return (
                              <div key={prop.id} style={{ marginBottom: 12 }}>
                                <Link
                                  to={`/properties/${prop.slug || prop.id}`}
                                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                                >
                                  <div className="mobile-strip-item" style={{ marginBottom: 6, background: '#fff' }}>
                                    {img ? (
                                      <img src={getMediaUrl(img)} alt="" style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                                    ) : (
                                      <div style={{ width: 52, height: 52, borderRadius: 12, background: '#EAE5D9', display: 'grid', placeItems: 'center', flexShrink: 0, color: '#92700C' }}>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                                      </div>
                                    )}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                        <span style={{ fontSize: 13, fontWeight: 800, color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                          {prop.title}
                                        </span>
                                        <span className={`mobile-badge-pill ${prop.status === 'PUBLISHED' ? 'published' : 'draft'}`}>
                                          {st.lbl}
                                        </span>
                                        {subscriptionService.isPropertyBoosted(prop) && (
                                          <span style={{ fontSize: 9.5, fontWeight: 800, padding: '2px 6px', borderRadius: 6, background: 'linear-gradient(135deg, #0F0D09 0%, #2A2418 100%)', color: '#F6D365', border: '1px solid #D4AF37', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                            <svg width="8" height="8" viewBox="0 0 24 24" fill="#FFD700"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                                            Boosté
                                          </span>
                                        )}
                                      </div>
                                      <div style={{ fontSize: 11.5, color: 'var(--gris-m)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {prop.city}{prop.neighborhood ? `, ${prop.neighborhood}` : ''}
                                      </div>
                                      <div style={{ fontSize: 12, fontWeight: 800, color: '#A8891C', marginTop: 2 }}>
                                        {parseInt(prop.price || 0).toLocaleString('fr-FR')} FCFA/mois
                                      </div>
                                    </div>
                                  </div>
                                </Link>

                                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', paddingRight: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setBoostTargetProperty(prop);
                                      setLandlordSubscriptionOpen(true);
                                    }}
                                    className="mobile-action-btn-sm"
                                    style={{
                                      background: 'linear-gradient(135deg, #0F0D09 0%, #2A2418 100%)',
                                      color: '#F6D365',
                                      border: '1px solid rgba(212,175,55,0.4)',
                                      fontWeight: 800,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4
                                    }}
                                    title={t('dashboard.boost_visibility_tooltip', 'Booster la visibilité de cette annonce')}
                                  >
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="#F6D365"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
                                    <span>Booster</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleShareProperty(prop)}
                                    className="mobile-action-btn-sm neutral"
                                    style={{ color: '#25D366' }}
                                    title={t('dashboard.share_on_whatsapp_tooltip', 'Partager sur WhatsApp')}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/></svg>
                                    <span>Partager</span>
                                  </button>

                                  <Link
                                    to={`/properties/${prop.slug || prop.id}/tour-editor`}
                                    className="mobile-action-btn-sm outline-gold"
                                    title={t('dashboard.tour_editor_tooltip', 'Éditeur Visite 360°')}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12A10 10 0 0 0 15 21.54A10 10 0 0 1 15 2.46A10 10 0 0 0 2 12Z"/><path d="M15 2.46A10 10 0 0 0 22 12a10 10 0 0 0-7-9.54"/><path d="M2 12h20"/></svg>
                                    <span>{hasVT ? '360° Actif' : '+ 360°'}</span>
                                  </Link>

                                  <button
                                    type="button"
                                    onClick={() => setSelectedReelProp(prop)}
                                    className="mobile-action-btn-sm neutral"
                                    style={{ position: 'relative' }}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                                    <span>Reel</span>
                                    {prop.video_reel && (
                                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', marginLeft: 2 }} />
                                    )}
                                  </button>

                                  <Link to={`/properties/update/${prop.slug || prop.id}`} className="mobile-action-btn-sm neutral">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                    <span>Éditer</span>
                                  </Link>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  )}

                  {recent.length > 4 && (
                    <Link to="/properties?owner=mine" style={{ display: 'block', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--or-d)', marginTop: 8 }}>
                      Gérer tout le catalogue ({recent.length}) →
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* ══════════════════════════════════════════
                CARROUSEL HORIZONTAL TACTILE DES LOGEMENTS
            ══════════════════════════════════════════ */}
            {(loading || recent.length > 0) && (
              <div style={{ marginBottom: 24 }}>
                <div className="horizontal-sec-header">
                  <div>
                    <span className="horizontal-sec-badge" style={{ background: 'rgba(212,175,55,0.14)', color: '#A8891C' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle', marginRight: 4 }}><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                      Catalogue Bailleur {loading ? '' : `(${recent.length})`}
                    </span>
                    <h2 className="horizontal-sec-title">{t('dashboard.my_properties', 'Mes Logements')}</h2>
                    <p className="horizontal-sec-sub">{t('dashboard.my_properties_sub', "Touchez un bien pour l'ouvrir ou gérer son multimédia")}</p>
                  </div>
                  {!loading && (
                    <Link to="/properties?owner=mine" className="horizontal-sec-link">
                      Voir tout ({recent.length}) →
                    </Link>
                  )}
                </div>

                {loading ? (
                  <div className="horizontal-properties-carousel">
                    {[1, 2, 3].map((n) => (
                      <div key={`sk-b-car-${n}`} className="horizontal-carousel-item">
                        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--gris-b)', overflow: 'hidden' }}>
                          <Sk w="100%" h={165} r={0} />
                          <div style={{ padding: '14px 14px 16px' }}>
                            <Sk w="65%" h={15} r={6} style={{ marginBottom: 8 }} />
                            <Sk w="85%" h={12} r={6} style={{ marginBottom: 8 }} />
                            <Sk w="45%" h={17} r={6} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Filtres rapides au-dessus du carrousel */}
                    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '0 2px 10px', scrollbarWidth: 'none' }}>
                      <button
                        type="button"
                        onClick={() => setMobilePropFilter('all')}
                        className={`mobile-filter-chip ${mobilePropFilter === 'all' ? 'active' : ''}`}
                      >
                        Tous ({recent.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setMobilePropFilter('published')}
                        className={`mobile-filter-chip ${mobilePropFilter === 'published' ? 'active' : ''}`}
                      >
                        Publiés ({recent.filter(p => p.status === 'PUBLISHED').length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setMobilePropFilter('with_360')}
                        className={`mobile-filter-chip ${mobilePropFilter === 'with_360' ? 'active' : ''}`}
                      >
                        Visites 360° ({recent.filter(p => p.virtual_tours?.length > 0).length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setMobilePropFilter('with_reel')}
                        className={`mobile-filter-chip ${mobilePropFilter === 'with_reel' ? 'active' : ''}`}
                      >
                        Reels ({recent.filter(p => !!p.video_reel).length})
                      </button>
                    </div>

                    <div ref={bailleurPropsCarouselRef} className="horizontal-properties-carousel">
                      {recent
                        .filter(prop => {
                          if (mobilePropFilter === 'published') return prop.status === 'PUBLISHED';
                          if (mobilePropFilter === 'with_360') return prop.virtual_tours?.length > 0;
                          if (mobilePropFilter === 'with_reel') return !!prop.video_reel;
                          return true;
                        })
                        .map((prop) => {
                          const img = getPropImg(prop);
                          const st = STATUS_MAP[prop.status] || { cls: 'st-draft', lbl: prop.status || 'Brouillon' };
                          const hasVT = prop.virtual_tours?.length > 0;
                          const hasVid = !!prop.video_reel;
                          const isPub = prop.status === 'PUBLISHED';

                          return (
                            <div key={`mob-prop-${prop.id}`} className="horizontal-carousel-item">
                              <div style={{
                                background: '#fff', borderRadius: 20, border: '1px solid var(--gris-b)',
                                overflow: 'hidden', boxShadow: '0 6px 20px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column'
                              }}>
                                {/* Image avec badges et actions rapides flottantes */}
                                <div style={{
                                  position: 'relative', height: 165,
                                  backgroundImage: img ? `url('${getMediaUrl(img)}')` : 'linear-gradient(135deg,var(--gris-f),var(--gris-b))',
                                  backgroundSize: 'cover', backgroundPosition: 'center'
                                }}>
                                  {/* Badges Gauche */}
                                  <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 5, zIndex: 2, flexWrap: 'wrap' }}>
                                    <span className={`mobile-badge-pill ${isPub ? 'published' : 'draft'}`} style={{ backdropFilter: 'blur(6px)' }}>
                                      {st.lbl}
                                    </span>
                                    {subscriptionService.isPropertyBoosted(prop) && (
                                      <span style={{ fontSize: 9.5, fontWeight: 800, padding: '2px 7px', borderRadius: 8, background: 'linear-gradient(135deg, #0F0D09 0%, #2A2418 100%)', color: '#F6D365', border: '1px solid #D4AF37', backdropFilter: 'blur(6px)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                        <svg width="8" height="8" viewBox="0 0 24 24" fill="#FFD700"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                                        Boosté
                                      </span>
                                    )}
                                    {hasVT && (
                                      <Link
                                        to={`/properties/${prop.slug || prop.id}/tour-editor`}
                                        className="mobile-badge-pill reviewing"
                                        style={{ backdropFilter: 'blur(6px)', textDecoration: 'none' }}
                                        title="Éditer la Visite 360°"
                                      >
                                        360° Actif
                                      </Link>
                                    )}
                                  </div>

                                  {/* Badges & Actions Flottantes Droite */}
                                  <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6, alignItems: 'center', zIndex: 2 }}>
                                    {hasVid && (
                                      <div style={{ background: 'rgba(15,13,9,0.85)', backdropFilter: 'blur(6px)', borderRadius: 14, padding: '3px 8px', color: '#F6D365', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
                                        Reel
                                      </div>
                                    )}
                                    <button
                                      type="button"
                                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShareProperty(prop); }}
                                      style={{
                                        width: 30, height: 30, borderRadius: '50%', border: 0,
                                        background: 'rgba(37, 211, 102, 0.9)', color: '#fff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)'
                                      }}
                                      title={t('dashboard.share_on_whatsapp_tooltip', 'Partager sur WhatsApp')}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/></svg>
                                    </button>
                                  </div>
                                </div>

                                {/* Lien cliquable sur Image & Infos pour ouvrir directement le logement */}
                                <Link
                                  to={`/properties/${prop.slug || prop.id}`}
                                  style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', padding: '12px 14px 8px' }}
                                >
                                  <h4 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14.5, fontWeight: 800, color: 'var(--noir)', margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {prop.title}
                                  </h4>
                                  <div style={{ fontSize: 12, color: 'var(--gris-m)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                                    {prop.city}{prop.neighborhood ? `, ${prop.neighborhood}` : ''}
                                  </div>
                                  <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--noir)', marginBottom: 8 }}>
                                    {parseInt(prop.price || 0).toLocaleString('fr-FR')} FCFA
                                    <span style={{ fontSize: 11, color: 'var(--gris-m)', fontWeight: 500 }}> /mois</span>
                                  </div>

                                  {/* Mini-statistiques d'audience en direct */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: '#64605A', padding: '5px 8px', background: 'var(--gris-f)', borderRadius: 8, border: '1px solid var(--gris-b)' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"/></svg>
                                      {prop.views_count || 0} vues
                                    </span>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                      {prop.favorites_count || 0} likes
                                    </span>
                                  </div>
                                </Link>

                                {/* Raccourcis d'actions sous la carte */}
                                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', padding: '8px 12px 12px', borderTop: '1px solid var(--gris-f)', flexWrap: 'wrap' }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setBoostTargetProperty(prop);
                                      setLandlordSubscriptionOpen(true);
                                    }}
                                    className="mobile-action-btn-sm"
                                    style={{
                                      background: 'linear-gradient(135deg, #0F0D09 0%, #2A2418 100%)',
                                      color: '#F6D365',
                                      border: '1px solid rgba(212,175,55,0.4)',
                                      fontWeight: 800,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4
                                    }}
                                  >
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="#F6D365"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
                                    <span>Booster</span>
                                  </button>
                                  <Link
                                    to={`/properties/${prop.slug || prop.id}/tour-editor`}
                                    className="mobile-action-btn-sm outline-gold"
                                    title={t('dashboard.tour_editor_tooltip', 'Éditeur Visite 360°')}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12A10 10 0 0 0 15 21.54A10 10 0 0 1 15 2.46A10 10 0 0 0 2 12Z"/><path d="M15 2.46A10 10 0 0 0 22 12a10 10 0 0 0-7-9.54"/><path d="M2 12h20"/></svg>
                                    <span>{hasVT ? '360°' : '+ 360°'}</span>
                                  </Link>
                                  <Link to={`/properties/update/${prop.slug || prop.id}`} className="mobile-action-btn-sm neutral">
                                    <span>Éditer</span>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </>
                )}
              </div>
            )}


            {/* ══════════════════════════════════════════
                SECTION ANNONCES ARCHIVÉES MOBILE (SI EXISTANTES)
            ══════════════════════════════════════════ */}
            {archived.length > 0 && (
              <div className="card" style={{ marginBottom: 24, overflow: 'hidden' }}>
                <div className="card-header" style={{ padding: '14px 16px', borderBottom: '1px solid var(--gris-b)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--gris-m)"><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/></svg>
                    <span className="ch-title" style={{ fontSize: 14 }}>{t('dashboard.archived_listings', 'Annonces Archivées')}</span>
                  </div>
                  <span className="ch-badge">{archived.length} archivée(s)</span>
                </div>
                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {archived.slice(0, 3).map((prop) => {
                    const img = getPropImg(prop);
                    return (
                      <div key={`mob-arch-${prop.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--gris-f)', borderRadius: 14, border: '1px solid var(--gris-b)' }}>
                        {img ? (
                          <img src={getMediaUrl(img)} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--gris-b)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                            <svg width="18" height="18" fill="var(--gris-m)" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--noir)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {prop.title}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--gris-m)' }}>
                            {prop.city} · {parseInt(prop.price || 0).toLocaleString('fr-FR')} FCFA
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUnarchiveProperty(prop)}
                          className="mobile-action-btn-sm gold"
                          style={{ padding: '6px 10px', fontSize: 11 }}
                          title="Restaurer l'annonce"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
                          <span>Réactiver</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════
                MINI-AGENDA VISITES MOBILE
            ══════════════════════════════════════════ */}
            <div className="card" style={{ marginBottom: 24, overflow: 'hidden' }}>
              <div className="card-header" style={{ padding: '14px 16px', borderBottom: '1px solid var(--gris-b)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#D4AF37"><path d="M19 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>
                  <span className="ch-title" style={{ fontSize: 14 }}>{t('dashboard.visits_calendar', 'Agenda des Visites')}</span>
                </div>
                <span className="ch-badge">{calendar.monthCount} visite(s) ce mois</span>
              </div>

              <div className="cal-wrap" style={{ padding: 14 }}>
                {/* Entête du mois avec navigation */}
                <div className="cal-header" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="cal-month" style={{ textTransform: 'capitalize', fontSize: 14.5, fontWeight: 800, color: 'var(--noir)' }}>
                    {calendar.label}
                  </div>
                  <div className="cal-nav" style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      className="cal-nav-btn"
                      aria-label="Mois précédent"
                      onClick={() => setCalendarCursor((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                    >
                      <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                    </button>
                    <button
                      type="button"
                      className="cal-nav-btn"
                      aria-label="Mois suivant"
                      onClick={() => setCalendarCursor((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                    >
                      <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                    </button>
                  </div>
                </div>

                {/* Grille du calendrier */}
                <div className="cal-grid">
                  {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(d => (
                    <div key={d} className="cal-day-label" style={{ fontSize: 10, fontWeight: 700 }}>
                      {d}
                    </div>
                  ))}
                  {calendar.cells.map((cell) => {
                    if (cell.empty) return <div key={cell.key} className="cal-day other-month" aria-hidden="true" />;
                    const event = cell.event || {};
                    const hasConfirmed = event.confirmed > 0;
                    const hasRequested = event.requested > 0;
                    const isSelected = selectedCalDate === cell.key;

                    return (
                      <div
                        key={cell.key}
                        onClick={() => setSelectedCalDate(cell.key)}
                        className={`cal-day${cell.today ? ' today' : ''}${hasConfirmed ? ' visit-confirmed' : hasRequested ? ' has-visit' : ''}${isSelected ? ' selected' : ''}`}
                        style={{
                          fontSize: 11.5,
                          height: 36,
                          minWidth: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          position: 'relative'
                        }}
                      >
                        {cell.day}
                      </div>
                    );
                  })}
                </div>

                {/* Légende Colorimétrique */}
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: '8px 12px',
                  padding: '10px 4px 6px', borderTop: '1px solid var(--gris-b)',
                  marginTop: 12, fontSize: 11
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                    <span style={{ color: 'var(--noir)', fontWeight: 600 }}>Confirmée</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#D4AF37' }} />
                    <span style={{ color: 'var(--noir)', fontWeight: 600 }}>En attente</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0F0D09' }} />
                    <span style={{ color: 'var(--noir)', fontWeight: 600 }}>Aujourd'hui</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid #D4AF37', background: 'transparent' }} />
                    <span style={{ color: 'var(--noir)', fontWeight: 600 }}>Sélectionné</span>
                  </div>
                </div>

                {/* Panneau interactif de détails pour la date cliquée */}
                {selectedCalDate && (
                  <div style={{
                    marginTop: 12,
                    padding: '12px 14px',
                    background: 'linear-gradient(135deg, rgba(212,175,55,0.06), rgba(246,211,101,0.08))',
                    borderRadius: 14,
                    border: '1px solid rgba(212,175,55,0.25)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="#D4AF37"><path d="M19 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>
                        <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--noir)', textTransform: 'capitalize' }}>
                          {selectedDateFormatted}
                        </span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: selectedDateVisits.length > 0 ? '#10B981' : 'var(--gris-m)' }}>
                        {selectedDateVisits.length} visite{selectedDateVisits.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    {selectedDateVisits.length === 0 ? (
                      <div style={{ fontSize: 12, color: 'var(--gris-m)', textAlign: 'center', padding: '10px 0' }}>
                        Aucune visite programmée pour cette date.
                        <button
                          type="button"
                          onClick={() => setSelectedCalDate(dateKey(new Date()))}
                          style={{
                            display: 'block', margin: '6px auto 0',
                            background: 'none', border: 'none',
                            color: 'var(--or-d)', fontWeight: 700, fontSize: 11.5, cursor: 'pointer'
                          }}
                        >
                          Revenir à aujourd'hui
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {selectedDateVisits.map((v) => {
                          const normalizedStatus = String(v.status || '').toUpperCase();
                          const statusInfo = VISIT_STATUS_MAP[normalizedStatus] || { label: v.status || 'Inconnue', cls: 'cancelled' };
                          const isConf = normalizedStatus === 'CONFIRMED';
                          const visitTime = v.confirmed_time || v.requested_time;

                          return (
                            <div
                              key={`cal-vis-${v.id}`}
                              style={{
                                background: '#fff',
                                borderRadius: 12,
                                padding: '10px 12px',
                                border: '1px solid var(--gris-b)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <div style={{
                                    width: 28, height: 28, borderRadius: 8,
                                    background: isConf ? 'linear-gradient(135deg, var(--vert), #27AE60)' : 'linear-gradient(135deg, var(--or), var(--or-l))',
                                    display: 'grid', placeItems: 'center', color: isConf ? '#fff' : '#0F0D09',
                                    fontSize: 11, fontWeight: 800
                                  }}>
                                    {v.tenant?.first_name?.[0]?.toUpperCase() || 'T'}
                                  </div>
                                  <div>
                                    <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--noir)' }}>
                                      {v.tenant?.first_name} {v.tenant?.last_name}
                                    </span>
                                    {visitTime && (
                                      <span style={{ fontSize: 11, color: 'var(--gris-m)', marginLeft: 6 }}>
                                        🕒 {visitTime.slice(0, 5)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className={`mobile-badge-pill ${statusInfo.cls}`}>
                                  {statusInfo.label}
                                </span>
                              </div>

                              <div style={{ fontSize: 11.5, color: 'var(--gris-m)', marginBottom: 8 }}>
                                📍 {v.property?.title} · {v.property?.city}
                              </div>

                              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                                {isConf && (
                                  <Link
                                    to={`/messages?user=${v.tenant?.id || ''}`}
                                    style={{
                                      display: 'inline-flex', alignItems: 'center', gap: 4,
                                      padding: '5px 10px', borderRadius: 8,
                                      background: '#0F0D09', color: '#F6D365',
                                      fontSize: 11, fontWeight: 700, textDecoration: 'none'
                                    }}
                                  >
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                                    <span>Écrire</span>
                                  </Link>
                                )}
                                <Link
                                  to={`/dashboard/bailleur/visites/${v.id}`}
                                  className="mobile-action-btn-sm outline-gold"
                                  style={{ padding: '5px 10px', fontSize: 11 }}
                                >
                                  <span>Voir fiche</span>
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ══════════════════════════════════════════
              AFFICHAGE STRICTEMENT DESKTOP (WEB)
          ══════════════════════════════════════════ */}
          <div className="bailleur-desktop-sections">

            {/* ── Hero Banner ── */}
            <div className="hero-banner">
              <div className="hero-content">
                <p className="hero-greet">Bonjour, bienvenue sur votre espace</p>
                <h1 className="hero-name">{user?.first_name||'Bailleur'} <span>{user?.last_name||''}</span></h1>
                <p className="hero-sub">Gérez vos biens, suivez vos demandes et développez votre patrimoine</p>
              </div>
              <div className="hero-chips">
                <span className="hero-chip or">✓ Bailleur Vérifié</span>
                <span className="hero-chip">{user?.city||'Cameroun'}</span>
                <span className="hero-chip">{kpis.total_properties||0} bien{(kpis.total_properties||0)>1?'s':''}</span>
              </div>
            </div>

            {/* ── Bannière Conciergerie & Formule Sérénité Desktop ── */}
            <div style={{
              margin: '0 0 24px',
              background: 'linear-gradient(135deg, #0F0D09 0%, #1E1A12 50%, #2A2418 100%)',
              borderRadius: 20,
              padding: '22px 26px',
              border: '1px solid #D4AF37',
              boxShadow: '0 10px 30px rgba(15,13,9,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
              
              <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, background: 'rgba(212,175,55,0.2)', color: '#F6D365', padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(212,175,55,0.4)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#F6D365"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    Piolo Signature VIP · Conciergerie & Gestion Déléguée
                  </span>
                  {landlordPlan && (
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20, background: '#10B981', color: '#fff' }}>
                      ✓ Formule {landlordPlan.name}
                    </span>
                  )}
                </div>
                <h2 style={{ color: '#FAF9F6', fontSize: 18, fontWeight: 800, margin: '0 0 6px', fontFamily: 'Poppins, sans-serif' }}>
                  Déléguez 100% de la gestion de votre bien à notre équipe locale
                </h2>
                <p style={{ color: '#C8C4BC', fontSize: 13, margin: 0, lineHeight: 1.5, maxWidth: 720 }}>
                  Nous venons sur place numériser votre logement en 360°, prenons en charge 100% des visites physiques, filtrons les locataires solvables avec caution certifiée et vous reversons le loyer.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, position: 'relative', zIndex: 2 }}>
                <button
                  type="button"
                  onClick={() => setLandlordConciergeOpen(true)}
                  style={{
                    padding: '12px 22px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)',
                    color: '#0F0D09',
                    fontWeight: 800,
                    fontSize: 13,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 15px rgba(212,175,55,0.35)',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
                  <span>Demander une prise en charge Clé en Main</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLandlordSubscriptionOpen(true)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.08)',
                    color: '#F5F0E8',
                    fontWeight: 700,
                    fontSize: 12.5,
                    border: '1px solid rgba(212,175,55,0.35)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#F6D365"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
                  <span>Voir les Packs de Boosts & Abonnements Sérénité</span>
                </button>
              </div>
            </div>

            {/* ── BANNIÈRE CERTIFICATION KYC BAILLEUR DESKTOP ── */}
            <BailleurKYCBanner
              isVerified={user?.verification_level >= 2 || kpis?.is_verified}
              dossierStatus={data?.dossier?.status || kpis?.dossier_status}
              rejectionReason={data?.dossier?.rejection_reason}
              onOpenModal={() => setKycModalOpen(true)}
              isDark={isDark}
              isMobile={false}
            />

            {/* ── KPI Cards ── */}
            <div className="kpi-grid">
              {[
                { cls:'c-or', ico:'bg-or', trendCls:'new', trendLbl:'Biens', val: kpis.total_properties, lbl:'Biens gérés', svg:<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/> },
                { cls:'c-gn', ico:'bg-gn', trendCls: (kpis.pending_visits||0)>0?'rd':'up', trendLbl:(kpis.pending_visits||0)>0?'À confirmer':'OK', val:kpis.pending_visits, lbl:'Visites en attente', svg:<path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/> },
                { cls:'c-bl', ico:'bg-bl', trendCls:(kpis.pending_locations||0)>0?'rd':'up', trendLbl:(kpis.pending_locations||0)>0?'À traiter':'OK', val:kpis.pending_locations, lbl:'Demandes location', svg:<path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/> },
                { cls:'c-rd', ico:'bg-rd', trendCls:'new', trendLbl:`${kpis.unread_messages||0} non lus`, val:kpis.unread_messages, lbl:'Messages reçus', svg:<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/> },
              ].map((k,i)=>(
                <div key={i} className={`kpi-card ${k.cls}`}>
                  <div className="kpi-top">
                    <div className={`kpi-ico ${k.ico}`}><svg viewBox="0 0 24 24">{k.svg}</svg></div>
                    <span className={`kpi-trend ${k.trendCls}`}>{k.trendLbl}</span>
                  </div>
                  <div className="kpi-val">{loading ? <Sk w={40} h={30}/> : (k.val??0)}</div>
                  <div className="kpi-lbl">{k.lbl}</div>
                </div>
              ))}
            </div>

            {/* ── Main Grid ── */}
            <div className="main-grid">

              {/* Colonne principale */}
              <div style={{display:'flex',flexDirection:'column',gap:24}}>

                {/* ANNONCES RÉCENTES */}
                <div className="card" id="annonces">
                  <div className="card-header">
                    <span className="ch-title">Mes annonces récentes</span>
                    <span className="ch-badge">{kpis.active_properties||0} actives / {kpis.total_properties||0} total</span>
                    <Link className="ch-link" to="/properties?owner=mine">Voir tout →</Link>
                  </div>
                  <div className="annonces-list">
                    {loading && [1,2].map(n=>(
                      <div key={n} className="annonce-item" style={{opacity:.7}}>
                        <Sk w={80} h={60} r={9} />
                        <div className="an-info" style={{flex:1}}>
                          <Sk w="70%" h={16} style={{marginBottom:8}}/>
                          <Sk w="50%" h={12} style={{marginBottom:6}}/>
                          <Sk w="40%" h={12}/>
                        </div>
                      </div>
                    ))}

                    {!loading && recent.length === 0 && (
                      <div className="empty-state">
                        <svg width="48" height="48" fill="var(--gris-b)" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                        <p>Vous n'avez pas encore publié d'annonce.</p>
                        <Link to="/properties/create">
                          <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                          Publier ma première annonce
                        </Link>
                      </div>
                    )}

                    {!loading && recent.map(prop => {
                      const img = getPropImg(prop);
                      const st = STATUS_MAP[prop.status] || {cls:'st-draft',lbl: prop.status||'Brouillon'};
                      const hasVT = prop.virtual_tours?.length > 0;
                      const hasVid = !!prop.video_reel;
                      const isBoosted = subscriptionService.isPropertyBoosted(prop);
                      return (
                        <div className="annonce-item" key={prop.id}>
                          <div className="an-img" style={img?{backgroundImage:`url('${img}')`}:{background:'linear-gradient(135deg,var(--gris-f),var(--gris-b))'}} />
                          <div className="an-info">
                            <div className="an-name">{prop.title}</div>
                            <div className="an-loc">
                              <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                              {prop.city}{prop.neighborhood?`, ${prop.neighborhood}`:''}
                            </div>
                            <div className="an-meta">
                              <span className="an-price">
                                {parseInt(prop.price||0).toLocaleString('fr-FR')} FCFA
                                <span style={{fontSize:10,color:'var(--gris-m)',fontWeight:500}}> /mois</span>
                              </span>
                              <span className={`an-status ${st.cls}`}>{st.lbl}</span>
                              {isBoosted && (
                                <span className="an-status" style={{
                                  background: 'linear-gradient(135deg, #0F0D09 0%, #2A2418 100%)',
                                  color: '#F6D365',
                                  border: '1.5px solid #D4AF37',
                                  marginLeft: 4,
                                  fontWeight: 800,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  boxShadow: '0 2px 8px rgba(212,175,55,0.25)'
                                }}>
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#FFD700"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                                  {isBoosted.boostType === 'flash_48h' ? 'Flash 48h (3x Vues)' : isBoosted.boostType === 'multiboost_30j' ? 'Multi-Boost (3x Vues)' : 'Vedette 7j (3x Vues)'}
                                </span>
                              )}
                              {hasVT && (
                                <span className="an-status" style={{background:'rgba(212,175,55,.1)',color:'var(--or-d)',border:'1px solid rgba(212,175,55,.3)',marginLeft:4}}>
                                  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:3,verticalAlign:'middle'}}><path d="M2 12A10 10 0 0 0 15 21.54A10 10 0 0 1 15 2.46A10 10 0 0 0 2 12Z"/><path d="M15 2.46A10 10 0 0 0 22 12a10 10 0 0 0-7-9.54"/><path d="M2 12h20"/></svg>
                                  Visite 360°
                                </span>
                              )}
                            </div>
                            <div className="an-stats" style={{marginTop:10}}>
                              <span className="an-stat stat-views">
                                <svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"/></svg>
                                {prop.views_count||0} vues
                              </span>
                              <span className="an-stat stat-likes">
                                <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                {prop.favorites_count||0} likes
                              </span>
                              <span className="an-stat stat-visits">
                                <svg viewBox="0 0 24 24"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>
                                0 visite{0!==1?'s':''}
                              </span>
                            </div>
                          </div>
                          <div className="an-actions">
                            <button
                              type="button"
                              onClick={() => {
                                setBoostTargetProperty(prop);
                                setLandlordSubscriptionOpen(true);
                              }}
                              className="btn-ico"
                              title={isBoosted ? `Boost actif (${isBoosted.boostType === 'flash_48h' ? 'Flash' : 'Vedette'}) — Prolonger` : "Booster cette annonce"}
                              style={{
                                color: isBoosted ? '#0F0D09' : '#F6D365',
                                background: isBoosted ? 'linear-gradient(135deg, #F6D365 0%, #D4AF37 100%)' : 'linear-gradient(135deg, #0F0D09 0%, #2A2418 100%)',
                                border: isBoosted ? '1.5px solid #FFE082' : '1px solid #D4AF37',
                                cursor: 'pointer',
                                position: 'relative',
                                boxShadow: isBoosted ? '0 0 12px rgba(212,175,55,0.45)' : 'none'
                              }}
                            >
                              <svg viewBox="0 0 24 24" fill={isBoosted ? '#0F0D09' : '#F6D365'}><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
                              {isBoosted && (
                                <span style={{ position: 'absolute', top: -3, right: -3, width: 8, height: 8, borderRadius: '50%', background: '#22C55E', border: '1.5px solid #fff' }} />
                              )}
                            </button>
                            {hasVid && (
                              <button
                                type="button"
                                className="btn-ico"
                                title="Voir le Reel publié"
                                onClick={() => setViewReelProp(prop)}
                                style={{ color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.08)', cursor: 'pointer', position: 'relative' }}
                              >
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: '#22C55E', border: '1.5px solid #fff' }} />
                              </button>
                            )}
                            <Link to={`/properties/${prop.slug||prop.id}`} className="btn-ico" title="Voir l'annonce">
                              <svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                            </Link>
                            <Link to={`/properties/update/${prop.slug||prop.id}`} className="btn-ico" title="Modifier l'annonce">
                              <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                            </Link>
                            <button
                              type="button"
                              className="btn-ico danger archive-action"
                              title="Archiver cette annonce"
                              aria-label={`Archiver l'annonce ${prop.title || ''}`}
                              onClick={() => setArchiveModalProp(prop)}
                              style={{cursor:'pointer'}}
                            >
                              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/></svg>
                            </button>
                            <Link to={`/properties/${prop.slug||prop.id}/tour-editor`} className="btn-ico tour-360-btn" title={t('dashboard.tour_editor_tooltip', 'Éditeur Visite 360°')} style={{color:'var(--or)'}}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12A10 10 0 0 0 15 21.54A10 10 0 0 1 15 2.46A10 10 0 0 0 2 12Z"/><path d="M15 2.46A10 10 0 0 0 22 12a10 10 0 0 0-7-9.54"/><path d="M2 12h20"/></svg>
                            </Link>
                            <button
                              type="button"
                              className="btn-ico video-reel-btn"
                              title="Ajouter / Gérer la Vidéo Découverte"
                              onClick={() => setSelectedReelProp(prop)}
                              style={{color:'#D4AF37',cursor:'pointer',border:'1px solid var(--gris-b)',background:'var(--gris-f)'}}
                            >
                              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ══════════════════════════════════════════════════════════════
                    GESTION DÉLÉGUÉE & MANDATS CLÉ EN MAIN PIOLO SIGNATURE
                ══════════════════════════════════════════════════════════════ */}
                <div className="card concierge-card" id="conciergerie" style={{ marginBottom: 28, overflow: 'hidden' }}>
                  <div className="card-header concierge-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '18px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="concierge-icon-box" style={{ width: 38, height: 38, borderRadius: 10, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span className="ch-title concierge-title" style={{ fontSize: 16.5, fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>Gestion Déléguée & Clé en Main</span>
                          <span className="concierge-badge" style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 9px', borderRadius: 8, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                            Piolo Signature
                          </span>
                        </div>
                        <div className="concierge-subtitle" style={{ fontSize: 12, marginTop: 2, fontWeight: 500 }}>
                          Suivi opérationnel en temps réel de votre mandat de gestion et relocation intégrale
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLandlordConciergeOpen(true)}
                      className="btn-gold-concierge"
                      style={{
                        padding: '9px 18px',
                        borderRadius: 10,
                        fontSize: 12.5,
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 7,
                        fontFamily: 'Poppins, sans-serif'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      <span>Nouveau Mandat</span>
                    </button>
                  </div>

                  <div style={{ padding: '22px' }}>
                    {conciergeRequests.length === 0 ? (
                      <div className="concierge-empty-box" style={{
                        padding: '28px 24px',
                        borderRadius: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 18
                      }}>
                        <div style={{ maxWidth: 560 }}>
                          <h4 className="concierge-empty-title" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 15.5, fontWeight: 800, margin: '0 0 6px' }}>
                            Aucun mandat de gestion déléguée actif
                          </h4>
                          <p className="concierge-empty-desc" style={{ fontSize: 13, margin: 0, lineHeight: 1.55 }}>
                            Confiez vos logements à notre équipe logistique : nous réalisons le shooting 360°, conduisons 100% des visites physiques, sélectionnons les locataires solvables et vous versons les loyers chaque mois sans aucun déplacement.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLandlordConciergeOpen(true)}
                          className="btn-dark-gold-cta"
                          style={{
                            padding: '11px 20px',
                            borderRadius: 12,
                            fontSize: 13,
                            fontWeight: 800,
                            cursor: 'pointer',
                            fontFamily: 'Poppins, sans-serif',
                          }}
                        >
                          Activer un Mandat Clé en Main
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {conciergeRequests.map((req, idx) => {
                          return (
                            <div
                              key={req.id || idx}
                              className="concierge-request-card"
                              style={{
                                borderRadius: 16,
                                overflow: 'hidden'
                              }}
                            >
                              {/* Header du dossier */}
                              <div className="concierge-req-header" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                                    <span className="concierge-req-title" style={{ fontSize: 15.5, fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>
                                      {req.propertyTitle || 'Logement Haut Standing'}
                                    </span>
                                    <span className="concierge-ref-badge" style={{ fontSize: 11, fontWeight: 800, padding: '2.5px 8px', borderRadius: 6, fontFamily: 'monospace' }}>
                                      RÉF : {req.id}
                                    </span>
                                    <span className="concierge-loc-badge" style={{ fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#D4AF37' }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                                      <span>{req.city || 'Yaoundé'}{req.neighborhood ? `, ${req.neighborhood}` : ''}</span>
                                    </span>
                                  </div>
                                  <div className="concierge-formula-text" style={{ fontSize: 12, marginTop: 4 }}>
                                    Formule : <strong className="concierge-formula-hl">{req.packageName || 'Gestion Déléguée Intégrale'}</strong> · Contact propriétaire : {req.contactName || 'Bailleur'} ({req.contactPhone})
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <a
                                    href={`https://wa.me/237658324285?text=${encodeURIComponent(`Bonjour Piolo Conciergerie, je souhaite faire le point sur mon dossier ${req.id} (${req.propertyTitle}).`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 6,
                                      padding: '8px 16px',
                                      borderRadius: 10,
                                      background: '#25D366',
                                      color: '#FFF',
                                      fontSize: 12.5,
                                      fontWeight: 800,
                                      textDecoration: 'none',
                                      boxShadow: '0 2px 8px rgba(37,211,102,0.25)',
                                      fontFamily: 'Poppins, sans-serif'
                                    }}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/></svg>
                                    <span>Gestionnaire Dédié</span>
                                  </a>
                                </div>
                              </div>

                              {/* 4-Step Pipeline */}
                              <div style={{ padding: '22px 20px 24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                                  {/* Étape 1 */}
                                  <div className="concierge-step-card step-active" style={{
                                    padding: '16px 16px',
                                    borderRadius: 14,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 6
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <span className="concierge-step-badge" style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Étape 1 · Planifiée</span>
                                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 0 3px rgba(34,197,94,0.2)' }} />
                                    </div>
                                    <div className="concierge-step-title" style={{ fontSize: 13.5, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                                      <span>Shooting & Scan 360°</span>
                                    </div>
                                    <div className="concierge-step-desc" style={{ fontSize: 11.5, lineHeight: 1.45, marginTop: 2 }}>
                                      Passage technicien : <strong>{req.preferredDate || 'À planifier'}</strong> ({req.timeSlot === 'morning' ? '09h-12h' : '14h-17h'})
                                    </div>
                                  </div>

                                  {/* Étape 2 */}
                                  <div className="concierge-step-card" style={{
                                    padding: '16px 16px',
                                    borderRadius: 14,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 6
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <span className="concierge-step-badge" style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Étape 2 · En cours</span>
                                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
                                    </div>
                                    <div className="concierge-step-title" style={{ fontSize: 13.5, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                                      <span>Audit Solvabilité</span>
                                    </div>
                                    <div className="concierge-step-desc" style={{ fontSize: 11.5, lineHeight: 1.45, marginTop: 2 }}>
                                      Vérification CNI, 3 bulletins de salaire, scoring bancaire et garant.
                                    </div>
                                  </div>

                                  {/* Étape 3 */}
                                  <div className="concierge-step-card" style={{
                                    padding: '16px 16px',
                                    borderRadius: 14,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 6
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <span className="concierge-step-badge" style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Étape 3 · À venir</span>
                                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#D9D2C7' }} />
                                    </div>
                                    <div className="concierge-step-title" style={{ fontSize: 13.5, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                      <span>Bail OHADA & Clés</span>
                                    </div>
                                    <div className="concierge-step-desc" style={{ fontSize: 11.5, lineHeight: 1.45, marginTop: 2 }}>
                                      Signature juridique certifiée et remise des clés sur procès-verbal.
                                    </div>
                                  </div>

                                  {/* Étape 4 */}
                                  <div className="concierge-step-card" style={{
                                    padding: '16px 16px',
                                    borderRadius: 14,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 6
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <span className="concierge-step-badge" style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Étape 4 · À venir</span>
                                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#D9D2C7' }} />
                                    </div>
                                    <div className="concierge-step-title" style={{ fontSize: 13.5, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h0M2 9.5h20"/></svg>
                                      <span>Encaissement & Virements</span>
                                    </div>
                                    <div className="concierge-step-desc" style={{ fontSize: 11.5, lineHeight: 1.45, marginTop: 2 }}>
                                      Loyer reversé chaque mois par virement ou Mobile Money avec quittance.
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>


                {/* DEMANDES DE VISITE */}
                <div className="card" id="visites">
                  <div className="card-header">
                    <span className="ch-title">Demandes de visite</span>
                    <span className="ch-badge" style={(kpis.pending_visits || 0) > 0 ? {background:'rgba(184,50,50,.1)',color:'var(--rouge)'} : undefined}>
                      {visits.length} demande{visits.length === 1 ? '' : 's'}{(kpis.pending_visits || 0) > 0 ? ` · ${kpis.pending_visits} en attente` : ''}
                    </span>
                    <Link className="ch-link" to="/dashboard/bailleur/visites">Voir tout →</Link>
                  </div>
                  <div className="demande-list">
                    {loading && [1,2].map(n=>(
                      <div key={n} className="demande-item">
                        <Sk w={40} h={40} r={50}/>
                        <div style={{flex:1}}>
                          <Sk w="60%" h={14} style={{marginBottom:8}}/>
                          <Sk w="80%" h={12} style={{marginBottom:8}}/>
                          <Sk w="50%" h={12}/>
                        </div>
                      </div>
                    ))}
                    {!loading && visits.length === 0 && (
                      <div className="empty-state">
                        <svg width="38" height="38" fill="var(--gris-b)" viewBox="0 0 24 24"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>
                        <p>Aucune demande de visite en attente.</p>
                      </div>
                    )}
                    {!loading && visits.slice(0, 3).map((req,i) => (
                      <div key={i} className="demande-item" style={req.status!=='PENDING'?{opacity:.75}:{}}>
                        <div className="dem-av">{req.tenant?.first_name?.[0]?.toUpperCase()||'T'}{req.tenant?.last_name?.[0]?.toUpperCase()||''}</div>
                        <div className="dem-body">
                          <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                            <div className="dem-name">{req.tenant?.first_name} {req.tenant?.last_name}</div>
                            {(() => {
                              const normalizedStatus = String(req.status || '').toUpperCase();
                              const status = VISIT_STATUS_MAP[normalizedStatus] || { label: req.status || 'Inconnue', cls: 'cancelled' };
                              return <span className={`dem-request-status ${status.cls}`}>{status.label}</span>;
                            })()}
                          </div>
                          <div className="dem-prop">{req.property?.title} — {req.property?.city}</div>
                          <div className="dem-details">
                            <span className="dem-detail">
                              <svg viewBox="0 0 24 24"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>
                              {String(req.status || '').toUpperCase() === 'CONFIRMED' ? (req.confirmed_date || req.requested_date || '—') : (req.requested_date || '—')}
                            </span>
                            <span className="dem-detail">
                              <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                              {String(req.status || '').toUpperCase() === 'CONFIRMED' && req.confirmed_time ? `À ${req.confirmed_time.slice(0, 5)}` : req.property?.city}
                            </span>
                          </div>
                          {req.status === 'PENDING' ? (
                            <div className="dem-actions">
                              <Link to={`/dashboard/bailleur/visites/${req.id}`} className="dem-btn accept" style={{textDecoration:'none',textAlign:'center'}}>✓ Confirmer</Link>
                              <Link to={`/dashboard/bailleur/visites/${req.id}`} className="dem-btn reject" style={{textDecoration:'none',textAlign:'center'}}>✕ Refuser</Link>
                              <Link to={`/dashboard/bailleur/visites/${req.id}`} className="dem-btn detail" style={{textDecoration:'none',textAlign:'center'}}>Détails</Link>
                            </div>
                          ) : (
                            <div className="dem-actions"><Link to={`/dashboard/bailleur/visites/${req.id}`} className="dem-btn detail" style={{textDecoration:'none',textAlign:'center'}}>Voir détails</Link></div>
                          )}
                        </div>
                        <span className="dem-badge visite">Visite</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DEMANDES DE LOCATION */}
                <div className="card" id="locations">
                  <div className="card-header">
                    <span className="ch-title">Demandes de location</span>
                    {(kpis.pending_locations||0) > 0
                      ? <span className="ch-badge" style={{background:'rgba(30,122,71,.1)',color:'var(--vert)'}}>{kpis.pending_locations} à traiter</span>
                      : <span className="ch-badge">Aucune en cours</span>
                    }
                    <Link className="ch-link" to="/dashboard/bailleur/locations">Voir tout →</Link>
                  </div>
                  <div className="demande-list">
                    {loading && [1].map(n=>(
                      <div key={n} className="demande-item">
                        <Sk w={40} h={40} r={50}/>
                        <div style={{flex:1}}>
                          <Sk w="60%" h={14} style={{marginBottom:8}}/>
                          <Sk w="80%" h={12}/>
                        </div>
                      </div>
                    ))}
                    {!loading && locs.length === 0 && (
                      <div className="empty-state">
                        <svg width="38" height="38" fill="var(--gris-b)" viewBox="0 0 24 24"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
                        <p>Aucune demande de location en cours.</p>
                      </div>
                    )}
                    {!loading && locs.slice(0, 3).map((req,i) => (
                      <div key={i} className="demande-item">
                        <div className="dem-av" style={{background:'linear-gradient(135deg,var(--vert),#27AE60)'}}>
                          {req.tenant?.first_name?.[0]?.toUpperCase()||'T'}{req.tenant?.last_name?.[0]?.toUpperCase()||''}
                        </div>
                        <div className="dem-body">
                          <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                            <div className="dem-name">{req.tenant?.first_name} {req.tenant?.last_name}</div>
                            {(() => {
                              const normalizedStatus = String(req.status || '').toUpperCase();
                              const status = LOCATION_STATUS_MAP[normalizedStatus] || { label: req.status || 'Inconnue', cls: 'cancelled' };
                              return <span className={`dem-request-status ${status.cls}`}>{status.label}</span>;
                            })()}
                          </div>
                          <div className="dem-prop">{req.property?.title} · {parseInt(req.property?.price||0).toLocaleString('fr-FR')} FCFA/mois</div>
                          <div className="dem-details">
                            <span className="dem-detail">Entrée : {req.move_in_date||'—'}</span>
                            <span className="dem-detail">{req.tenant_count||1} locataire(s)</span>
                          </div>
                          <div className="dem-actions">
                            <Link to={`/dashboard/bailleur/locations/${req.id}`} className="dem-btn accept" style={{textDecoration:'none',textAlign:'center'}}>✓ Accepter</Link>
                            <Link to={`/dashboard/bailleur/locations/${req.id}`} className="dem-btn reject" style={{textDecoration:'none',textAlign:'center'}}>✕ Refuser</Link>
                            <Link to={`/dashboard/bailleur/locations/${req.id}`} className="dem-btn detail" style={{textDecoration:'none',textAlign:'center'}}>Voir dossier</Link>
                          </div>
                        </div>
                        <span className="dem-badge location">Location</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RÉSERVATIONS DE COURTS SÉJOURS & MEUBLÉS */}
                <div className="card" id="sejours" style={{ overflow: 'hidden' }}>
                  <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className="ch-title" style={{ fontSize: 15, fontWeight: 800 }}>Réservations Courts Séjours</span>
                      <span className="ch-badge" style={{ background: 'rgba(5, 150, 105, 0.12)', color: '#059669', fontWeight: 800 }}>
                        {bookings.filter(b => b.status === 'PENDING').length} à confirmer
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (shortTermProps.length > 0 && !blockPropId) {
                          setBlockPropId(shortTermProps[0].id);
                        }
                        setBlockModalOpen(true);
                      }}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, #059669, #10B981)',
                        color: '#fff',
                        border: 'none',
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: '0 2px 8px rgba(5,150,105,0.25)'
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      <span>+ Bloquer des dates</span>
                    </button>
                  </div>
                  <div className="demande-list">
                    {loading && [1].map(n => (
                      <div key={n} className="demande-item">
                        <Sk w={40} h={40} r={50} />
                        <div style={{ flex: 1 }}>
                          <Sk w="60%" h={14} style={{ marginBottom: 8 }} />
                          <Sk w="80%" h={12} />
                        </div>
                      </div>
                    ))}
                    {!loading && bookings.length === 0 && (
                      <div className="empty-state">
                        <svg width="38" height="38" fill="var(--gris-b)" viewBox="0 0 24 24"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/></svg>
                        <p>Aucune réservation de court séjour reçue pour le moment.</p>
                      </div>
                    )}
                    {!loading && bookings.slice(0, 5).map((b) => {
                      const isBlocked = b.is_blocked_by_host;
                      const statusInfo = BOOKING_STATUS_MAP[b.status] || { label: b.status, color: '#4B5563', bg: '#F3F4F6' };
                      const guestName = b.guest?.full_name || b.guest_name || 'Voyageur';
                      const guestPhone = b.guest?.phone || b.guest_phone || '';
                      return (
                        <div key={`bk-${b.id}`} className="demande-item" style={{
                          borderLeft: isBlocked ? '4px solid #8B5CF6' : '4px solid #10B981',
                          display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', position: 'relative'
                        }}>
                          <div
                            className="dem-av"
                            style={{
                              background: isBlocked
                                ? 'linear-gradient(135deg, #7C3AED, #A78BFA)'
                                : 'linear-gradient(135deg, #059669, #10B981)',
                              color: '#fff',
                              display: 'grid',
                              placeItems: 'center',
                              flexShrink: 0
                            }}
                          >
                            {isBlocked ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                              </svg>
                            ) : (
                              guestName[0]?.toUpperCase() || 'V'
                            )}
                          </div>
                          <div className="dem-body" style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <div className="dem-name">
                                {isBlocked ? `Blocage : ${b.block_reason || 'Indisponible'}` : guestName}
                              </div>
                              <span
                                style={{
                                  fontSize: 10.5,
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: 12,
                                  background: statusInfo.bg,
                                  color: statusInfo.color
                                }}
                              >
                                {isBlocked ? 'Bloqué hôte' : statusInfo.label}
                              </span>
                            </div>
                            <div className="dem-prop" style={{ marginTop: 2 }}>
                              {b.property?.title} · {new Intl.NumberFormat('fr-FR').format(b.total_price || 0)} FCFA ({b.nights_count} nuit{b.nights_count > 1 ? 's' : ''})
                            </div>
                            <div className="dem-details" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                              <span className="dem-detail" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, background: '#F4F2EE', padding: '3px 8px', borderRadius: 6, color: '#374151', fontWeight: 600 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                  <line x1="16" y1="2" x2="16" y2="6"></line>
                                  <line x1="8" y1="2" x2="8" y2="6"></line>
                                  <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                <span>Du {b.check_in_date} au {b.check_out_date}</span>
                              </span>
                              {!isBlocked && (
                                <span className="dem-detail" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, background: '#F4F2EE', padding: '3px 8px', borderRadius: 6, color: '#374151', fontWeight: 600 }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                  </svg>
                                  <span>{b.guests_count} personne{b.guests_count > 1 ? 's' : ''}</span>
                                </span>
                              )}
                            </div>
                            {b.guest_note && (
                              <div style={{ fontSize: 11.5, color: '#4B5563', fontStyle: 'italic', marginTop: 6, background: '#F9FAFB', padding: '5px 10px', borderRadius: 6, borderLeft: '2px solid #D1D5DB' }}>
                                « {b.guest_note} »
                              </div>
                            )}
                            <div className="dem-actions" style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                              {isBlocked ? (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBooking(b.id)}
                                  className="dem-btn reject"
                                  style={{ border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', fontSize: 12 }}
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  </svg>
                                  <span>{t('dashboard.unblock_dates', 'Débloquer ces dates')}</span>
                                </button>
                              ) : b.status === 'PENDING' ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleBookingAction(b.id, 'accept')}
                                    className="dem-btn accept"
                                    style={{ border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', fontSize: 12 }}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                    <span>Accepter</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleBookingAction(b.id, 'refuse')}
                                    className="dem-btn reject"
                                    style={{ border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', fontSize: 12 }}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                                    <span>Refuser</span>
                                  </button>
                                  {guestPhone && (
                                    <a
                                      href={`https://wa.me/${guestPhone.replace(/\D/g, '').startsWith('237') ? guestPhone.replace(/\D/g, '') : `237${guestPhone.replace(/\D/g, '')}`}?text=${encodeURIComponent(`Bonjour ${guestName}, concernant votre réservation pour "${b.property?.title}" du ${b.check_in_date} au ${b.check_out_date}...`)}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="dem-btn detail"
                                      style={{ textDecoration: 'none', textAlign: 'center', background: '#25D366', color: '#fff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', fontSize: 12 }}
                                    >
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/>
                                      </svg>
                                      <span>WhatsApp</span>
                                    </a>
                                  )}
                                </>
                              ) : (
                                <>
                                  {guestPhone && (
                                    <a
                                      href={`https://wa.me/${guestPhone.replace(/\D/g, '').startsWith('237') ? guestPhone.replace(/\D/g, '') : `237${guestPhone.replace(/\D/g, '')}`}?text=${encodeURIComponent(`Bonjour ${guestName}, à propos de votre séjour pour "${b.property?.title}"...`)}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="dem-btn detail"
                                      style={{ textDecoration: 'none', textAlign: 'center', background: '#25D366', color: '#fff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', fontSize: 12 }}
                                    >
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/>
                                      </svg>
                                      <span>Échanger sur WhatsApp</span>
                                    </a>
                                  )}
                                  {b.status === 'CONFIRMED' && (
                                    <button
                                      type="button"
                                      onClick={() => handleBookingAction(b.id, 'complete')}
                                      className="dem-btn detail"
                                      style={{ border: 'none', cursor: 'pointer', padding: '7px 12px', fontSize: 12 }}
                                    >
                                      Clore le séjour
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          <span className="dem-badge" style={{ background: isBlocked ? '#EDE9FE' : '#D1FAE5', color: isBlocked ? '#6D28D9' : '#047857', alignSelf: 'flex-start' }}>
                            {isBlocked ? 'Blocage' : 'Court Séjour'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Colonne droite */}
              <div style={{display:'flex',flexDirection:'column',gap:22}}>

                {/* Subscription & Points Widget */}
                <div className="points-widget" style={{ position: 'relative', overflow: 'hidden' }}>
                  <div className="pw-glow" />
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div className="pw-label">Gestion & Visibilité</div>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 10, background: '#0F0D09', color: '#F6D365', border: '1px solid #D4AF37' }}>
                        {landlordPlan ? landlordPlan.name : 'Formule Essentielle'}
                      </span>
                    </div>
                    <div className="pw-val">{points} <span>pts</span></div>
                    <div className="pw-badge">
                      <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                      Bailleur Vérifié Piolo
                    </div>
                    <div className="pw-sub">
                      {landlordPlan ? 'Avantages Sérénité actifs' : 'Rechargez pour booster vos annonces (3x visibilité)'}
                    </div>
                    <div className="pw-prog"><div className="pw-prog-fill" style={{ width: `${ptsPct}%` }} /></div>
                    <div className="pw-prog-info">
                      <span>0 pts</span>
                      <span className="hl">{points} / 500</span>
                      <span>500 pts</span>
                    </div>

                    {/* Active concierge tracker in sidebar if any */}
                    {conciergeRequests.length > 0 && (
                      <div style={{ marginTop: 12, padding: '8px 10px', background: 'rgba(255,255,255,0.08)', borderRadius: 10, border: '1px solid rgba(212,175,55,0.3)', fontSize: 11 }}>
                        <div style={{ fontWeight: 800, color: '#F6D365', marginBottom: 2 }}>
                          Mandat Signature en cours
                        </div>
                        <div style={{ color: '#E8E3DA' }}>
                          {conciergeRequests[0].propertyTitle} · <span style={{ color: '#F6D365', fontWeight: 700 }}>{conciergeRequests[0].statusLabel}</span>
                        </div>
                      </div>
                    )}

                    <div className="pw-row" style={{ marginTop: 14 }}>
                      <button
                        type="button"
                        onClick={() => setLandlordSubscriptionOpen(true)}
                        className="pw-btn pw-btn-o"
                        style={{ cursor: 'pointer', flex: 1, fontWeight: 800 }}
                      >
                        + Recharger / Abos
                      </button>
                      <button
                        type="button"
                        onClick={() => setLandlordConciergeOpen(true)}
                        className="pw-btn pw-btn-g"
                        style={{ cursor: 'pointer', flex: 1 }}
                      >
                        Conciergerie
                      </button>
                    </div>
                  </div>
                </div>

                {/* Calendrier */}
                <div className="card" id="calendrier">
                  <div className="card-header">
                    <span className="ch-title">Calendrier des visites</span>
                    <span className="ch-badge">{calendar.monthCount} visite{calendar.monthCount === 1 ? '' : 's'} ce mois</span>
                  </div>
                  <div className="cal-wrap">
                    <div className="cal-header">
                      <div className="cal-month" style={{textTransform:'capitalize'}}>{calendar.label}</div>
                      <div className="cal-nav">
                        <button type="button" className="cal-nav-btn" aria-label="Mois précédent" onClick={() => setCalendarCursor((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}><svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg></button>
                        <button type="button" className="cal-nav-btn" aria-label="Mois suivant" onClick={() => setCalendarCursor((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}><svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg></button>
                      </div>
                    </div>
                    <div className="cal-grid">
                      {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(d=><div key={d} className="cal-day-label">{d}</div>)}
                      {calendar.cells.map((cell) => {
                        if (cell.empty) return <div key={cell.key} className="cal-day other-month" aria-hidden="true" />;
                        const event = cell.event || {};
                        const hasConfirmed = event.confirmed > 0;
                        const hasRequested = event.requested > 0;
                        const isSelected = selectedCalDate === cell.key;
                        return (
                          <div
                            key={cell.key}
                            onClick={() => setSelectedCalDate(cell.key)}
                            className={`cal-day${cell.today ? ' today' : ''}${hasConfirmed ? ' visit-confirmed' : hasRequested ? ' has-visit' : ''}${isSelected ? ' selected' : ''}`}
                            style={{ cursor: 'pointer', position: 'relative' }}
                          >
                            {cell.day}
                          </div>
                        );
                      })}
                    </div>

                    <div className="cal-legend">
                      <div className="cal-leg-item"><div className="cal-leg-dot" style={{background:'#10B981'}}/>Visite confirmée</div>
                      <div className="cal-leg-item"><div className="cal-leg-dot" style={{background:'#D4AF37'}}/>En attente</div>
                      <div className="cal-leg-item"><div className="cal-leg-dot" style={{background:'#0F0D09'}}/>Aujourd'hui</div>
                      <div className="cal-leg-item"><div className="cal-leg-dot" style={{border:'2px solid #D4AF37', background:'transparent'}}/>Sélectionné</div>
                    </div>

                    {/* Panneau de détails Desktop */}
                    {selectedCalDate && (
                      <div style={{
                        marginTop: 14,
                        padding: '12px 14px',
                        background: 'linear-gradient(135deg, rgba(212,175,55,0.06), rgba(246,211,101,0.08))',
                        borderRadius: 14,
                        border: '1px solid rgba(212,175,55,0.25)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#D4AF37"><path d="M19 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>
                            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--noir)', textTransform: 'capitalize' }}>
                              {selectedDateFormatted}
                            </span>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: selectedDateVisits.length > 0 ? '#10B981' : 'var(--gris-m)' }}>
                            {selectedDateVisits.length} visite{selectedDateVisits.length > 1 ? 's' : ''}
                          </span>
                        </div>

                        {selectedDateVisits.length === 0 ? (
                          <div style={{ fontSize: 12, color: 'var(--gris-m)', textAlign: 'center', padding: '10px 0' }}>
                            Aucune visite programmée pour cette date.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {selectedDateVisits.map((v) => {
                              const normalizedStatus = String(v.status || '').toUpperCase();
                              const statusInfo = VISIT_STATUS_MAP[normalizedStatus] || { label: v.status || 'Inconnue', cls: 'cancelled' };
                              const isConf = normalizedStatus === 'CONFIRMED';
                              const visitTime = v.confirmed_time || v.requested_time;

                              return (
                                <div
                                  key={`dt-cal-vis-${v.id}`}
                                  className="cal-visit-card"
                                  style={{
                                    borderRadius: 12,
                                    padding: '10px 12px',
                                    border: '1px solid var(--gris-b)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                  }}
                                >

                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <div style={{
                                        width: 28, height: 28, borderRadius: 8,
                                        background: isConf ? 'linear-gradient(135deg, var(--vert), #27AE60)' : 'linear-gradient(135deg, var(--or), var(--or-l))',
                                        display: 'grid', placeItems: 'center', color: isConf ? '#fff' : '#0F0D09',
                                        fontSize: 11, fontWeight: 800
                                      }}>
                                        {v.tenant?.first_name?.[0]?.toUpperCase() || 'T'}
                                      </div>
                                      <div>
                                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--noir)' }}>
                                          {v.tenant?.first_name} {v.tenant?.last_name}
                                        </span>
                                        {visitTime && (
                                          <span style={{ fontSize: 11, color: 'var(--gris-m)', marginLeft: 6 }}>
                                            🕒 {visitTime.slice(0, 5)}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <span className={`mobile-badge-pill ${statusInfo.cls}`}>
                                      {statusInfo.label}
                                    </span>
                                  </div>

                                  <div style={{ fontSize: 12, color: 'var(--gris-m)', marginBottom: 8 }}>
                                    📍 {v.property?.title} · {v.property?.city}
                                  </div>

                                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                                    {isConf && (
                                      <Link
                                        to={`/messages?user=${v.tenant?.id || ''}`}
                                        style={{
                                          display: 'inline-flex', alignItems: 'center', gap: 4,
                                          padding: '5px 10px', borderRadius: 8,
                                          background: '#0F0D09', color: '#F6D365',
                                          fontSize: 11, fontWeight: 700, textDecoration: 'none'
                                        }}
                                      >
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                                        <span>Écrire</span>
                                      </Link>
                                    )}
                                    <Link
                                      to={`/dashboard/bailleur/visites/${v.id}`}
                                      className="mobile-action-btn-sm outline-gold"
                                      style={{ padding: '5px 10px', fontSize: 11 }}
                                    >
                                      <span>Voir fiche</span>
                                    </Link>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Profil Card */}
                <div className="card">
                  <div className="profil-card">
                    <div className="pc-top">
                      <div className="pc-av">{avatarImg ? <img src={avatarImg} alt="Photo de profil" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : <>{user?.first_name?.[0]?.toUpperCase()||'B'}{user?.last_name?.[0]?.toUpperCase()||''}</>}</div>
                      <div>
                        <div className="pc-name">{user?.first_name} {user?.last_name}</div>
                        {(() => {
                          const isVerified = user?.verification_level >= 2 || kpis?.is_verified;
                          const dossier = data?.dossier || null;
                          const status = dossier?.status || kpis?.dossier_status;
                          if (isVerified) {
                            return <span className="pc-role-badge" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}>🛡️ Bailleur Vérifié</span>;
                          }
                          if (status === 'PENDING') {
                            return <span className="pc-role-badge" onClick={() => setKycModalOpen(true)} style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.35)', cursor: 'pointer' }}>⏳ Vérif. en cours</span>;
                          }
                          return <span className="pc-role-badge" onClick={() => setKycModalOpen(true)} style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)', cursor: 'pointer' }}>⚠️ Non Vérifié • Certifier</span>;
                        })()}
                      </div>
                      <Link className="pc-edit" to="/dashboard/bailleur/profil" title="Modifier le profil">
                        <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                      </Link>
                    </div>
                    <div className="comp-label">Complété à <span>{profileCompletion}%</span></div>
                    <div className="comp-bar"><div className="comp-fill" style={{width:`${profileCompletion}%`}} /></div>

                    {/* Widget Solde de Points */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.04))',
                      borderRadius: 12,
                      border: '1px solid rgba(212,175,55,0.3)',
                      marginTop: 14
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>⭐</span>
                        <div>
                          <div style={{ fontSize: 10.5, color: 'var(--gris-m)', textTransform: 'uppercase', fontWeight: 700 }}>Solde Points</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#B8860B' }}>{landlordPoints !== undefined ? landlordPoints : 45} pts</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLandlordSubscriptionOpen(true)}
                        style={{
                          background: 'linear-gradient(135deg, #D4AF37, #AA7C11)',
                          border: 'none',
                          borderRadius: 8,
                          padding: '5px 10px',
                          color: '#0F0D09',
                          fontWeight: 800,
                          fontSize: 11,
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(212,175,55,0.25)'
                        }}
                      >
                        + Recharger
                      </button>
                    </div>
                  </div>
                  {/* Quick menu 2x2 */}
                  <div className="quick-menu">
                    {[
                      {cls:'i1',lbl:'Annonces',sub:`${kpis.total_properties||0} biens`,svg:<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>},
                      {cls:'i2',lbl:'Visites',sub:`${kpis.pending_visits||0} attente`,svg:<path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/>},
                      {cls:'i3',lbl:'Messages',sub:`${kpis.unread_messages||0} non lus`,svg:<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>},
                      {cls:'i4',lbl:'Locations',sub:`${kpis.pending_locations||0} demandes`,svg:<path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>},
                    ].map((q,i)=>(
                      <a key={i} className="qm-item" href="#">
                        <div className={`qm-ico ${q.cls}`}><svg viewBox="0 0 24 24">{q.svg}</svg></div>
                        <div className="qm-txt"><h5>{q.lbl}</h5><p>{q.sub}</p></div>
                        {q.cls==='i2' && (kpis.pending_visits||0)>0 && <div className="qm-notif">{kpis.pending_visits}</div>}
                      </a>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* ══ ANNONCES ARCHIVÉES ══ */}
            <div className="sec-hd" id="archived" style={{marginTop:10}}>
              <div>
                <div className="sec-label">Historique</div>
                <div className="sec-title">Annonces <span>Archivées</span></div>
              </div>
              <a className="see-all" href="#">Gérer les archives →</a>
            </div>

            {loading ? (
              <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:32}}>
                {[1,2].map(n=>(
                  <div key={n} className="annonce-item" style={{background:'var(--blanc)',opacity:.7}}>
                    <Sk w={80} h={60} r={9}/><div style={{flex:1}}><Sk w="60%" h={14} style={{marginBottom:8}}/><Sk w="40%" h={12}/></div>
                  </div>
                ))}
              </div>
            ) : archived.length > 0 ? (
              <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:32}}>
                {archived.map(prop=>{
                  const img=getPropImg(prop);
                  return(
                    <div key={prop.id} className="annonce-item" style={{background:'var(--blanc)',opacity:.75}}>
                      <div className="an-img" style={img?{backgroundImage:`url('${img}')`}:{background:'var(--gris-b)'}}/>
                      <div className="an-info">
                        <div className="an-name">{prop.title}</div>
                        <div className="an-loc"><svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>{prop.city}</div>
                        <div className="an-meta">
                          <span className="an-status st-archived">Archivée</span>
                        </div>
                      </div>
                      <div className="an-actions">
                        <button className="btn-ico" title="Réactiver" style={{border:'1px solid var(--gris-b)',background:'var(--gris-f)',cursor:'pointer'}}>
                          <svg viewBox="0 0 24 24" fill="var(--gris)"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{textAlign:'center',padding:36,background:'var(--blanc)',borderRadius:'var(--radius-lg)',border:'1px solid var(--gris-b)',marginBottom:32}}>
                <svg width="40" height="40" fill="var(--gris-b)" viewBox="0 0 24 24" style={{display:'block',margin:'0 auto 10px'}}><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27z"/></svg>
                <p style={{fontSize:13,color:'var(--gris-m)'}}>Aucune annonce archivée.</p>
              </div>
            )}

            {/* ══ PROGRAMME FIDÉLITÉ ══ */}
            <div className="sec-hd">
              <div>
                <div className="sec-label">Programme Fidélité</div>
                <div className="sec-title">Gagnez des <span>Points</span></div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:40}}>
              {[
                {cls:'c-or',ico:'bg-or',val:'+5 pts',lbl:'Par annonce publiée',svg:<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>},
                {cls:'c-gn',ico:'bg-gn',val:'+10 pts',lbl:'Visite confirmée',svg:<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>},
                {cls:'c-bl',ico:'bg-bl',val:'+20 pts',lbl:'Par parrainage',svg:<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>},
              ].map((c,i)=>(
                <div key={i} className={`kpi-card ${c.cls}`} style={{cursor:'default'}}>
                  <div className="kpi-top"><div className={`kpi-ico ${c.ico}`}><svg viewBox="0 0 24 24">{c.svg}</svg></div></div>
                  <div className="kpi-val" style={{fontSize:22}}>{c.val}</div>
                  <div className="kpi-lbl">{c.lbl}</div>
                </div>
              ))}
            </div>

          </div>

        </main>
      </div>

      {/* ══ STUDIO REEL PRO ══ */}
      {selectedReelProp && (
        <StudioReelEditor
          prop={selectedReelProp}
          onClose={() => {
            setSelectedReelProp(null);
            setReelFile(null);
            setReelPreviewUrl(null);
            setReelCaption('');
          }}
          onPublish={handleReelPublish}
          onDelete={() => setDeleteReelConfirmProp(selectedReelProp)}
          uploadingReel={uploadingReel}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODALE VOIR LE REEL — Prévisualisation plein écran + Supprimer
          ══════════════════════════════════════════════════════════════ */}
      {viewReelProp && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(10,8,6,0.94)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10001, padding: '16px'
        }}>
          {/* Panneau principal */}
          <div style={{
            display: 'flex', flexDirection: 'column', maxWidth: 420, width: '100%',
            maxHeight: '96vh', gap: 0, position: 'relative'
          }}>
            {/* Header flottant */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, padding: '0 4px' }}>
              <div>
                <div style={{ color: '#D4AF37', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'Poppins, sans-serif', marginBottom: 3 }}>Reel Découverte</div>
                <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>{viewReelProp.title}</div>
              </div>
              <button
                type="button"
                onClick={() => setViewReelProp(null)}
                style={{ border: 0, background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '50%', width: 36, height: 36, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
              >×</button>
            </div>

            {/* Cadre téléphone — style Instagram Reels / TikTok */}
            <div style={{
              background: '#0F0D09', borderRadius: 28, overflow: 'hidden',
              border: '2.5px solid rgba(212,175,55,0.4)',
              boxShadow: '0 0 0 6px rgba(212,175,55,0.08), 0 30px 60px rgba(0,0,0,0.6)',
              position: 'relative', aspectRatio: '9/16', maxHeight: '65vh'
            }}>
              <video
                src={getMediaUrl(viewReelProp.video_reel)}
                controls
                autoPlay
                loop
                playsInline
                webkit-playsinline="true"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {/* Overlay badge Piolo */}
              <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(15,13,9,0.7)', backdropFilter: 'blur(6px)', borderRadius: 20, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <span style={{ color: '#fff', fontSize: 10, fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>EN LIGNE</span>
              </div>
            </div>

            {/* Description / caption */}
            {viewReelProp.caption && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, margin: 0, lineHeight: 1.5, fontFamily: 'DM Sans, sans-serif' }}>
                  {viewReelProp.caption}
                </p>
              </div>
            )}

            {/* Boutons d'action */}
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              {/* Voir dans Mode Découverte */}
              <button
                type="button"
                onClick={() => { setViewReelProp(null); navigate(`/decouverte?prop=${encodeURIComponent(viewReelProp.slug || viewReelProp.id)}`); }}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 14, border: 0,
                  background: 'linear-gradient(135deg, #D4AF37, #F6D365)',
                  color: '#0F0D09', fontFamily: 'Poppins, sans-serif', fontWeight: 700,
                  fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  boxShadow: '0 4px 16px rgba(212,175,55,0.4)'
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                Voir en Mode Découverte
              </button>

              {/* Modifier le reel (ouvre studio) */}
              <button
                type="button"
                title="Modifier / Remplacer le Reel"
                onClick={() => { setViewReelProp(null); setSelectedReelProp(viewReelProp); }}
                style={{ padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              </button>

              {/* Supprimer le reel */}
              <button
                type="button"
                title="Supprimer le Reel"
                onClick={() => setDeleteReelConfirmProp(viewReelProp)}
                style={{ padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(184,50,50,0.3)', background: 'rgba(184,50,50,0.12)', color: '#FF6B6B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODALE CONFIRMATION SUPPRESSION REEL
          ══════════════════════════════════════════════════════════════ */}
      {deleteReelConfirmProp && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15,13,9,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10002, padding: 20
        }}>
          <div style={{
            background: '#fff', borderRadius: 22, width: '100%', maxWidth: 400,
            padding: '28px 24px', boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
            textAlign: 'center', border: '1.5px solid #E8E3DA'
          }}>
            <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(184,50,50,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#B83232">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </div>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 17, fontWeight: 800, color: '#0F0D09', margin: '0 0 10px' }}>
              Supprimer ce Reel ?
            </h3>
            <p style={{ fontSize: 13, color: '#64605A', margin: '0 0 22px', lineHeight: 1.5 }}>
              La vidéo Reel de <strong>«{deleteReelConfirmProp.title}»</strong> sera définitivement supprimée du mode Découverte. Cette action est irréversible.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setDeleteReelConfirmProp(null)}
                style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #E8E3DA', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'Poppins, sans-serif' }}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleDeleteReel(deleteReelConfirmProp.id)}
                disabled={deletingReel}
                style={{ flex: 1, padding: '12px', borderRadius: 12, border: 0, background: '#B83232', color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: 'Poppins, sans-serif', cursor: deletingReel ? 'wait' : 'pointer', opacity: deletingReel ? 0.7 : 1, boxShadow: '0 4px 14px rgba(184,50,50,0.3)' }}
              >
                {deletingReel ? 'Suppression…' : '🗑️ Oui, supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALE NATIVE CONFIRMATION ARCHIVAGE ANNONCE ── */}
      {archiveModalProp && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15,13,9,0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 20
         }} role="presentation" onMouseDown={(event) => {
           if (event.target === event.currentTarget && !archiving) setArchiveModalProp(null);
         }}>
          <div style={{
            background: '#fff', borderRadius: 22, width: '100%', maxWidth: 420,
            padding: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '1.5px solid var(--gris-b)',
            textAlign: 'center'
           }} role="dialog" aria-modal="true" aria-labelledby="archive-dialog-title">
            <div style={{
              width: 54, height: 54, borderRadius: '50%', background: 'rgba(184,50,50,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="var(--rouge)">
                <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>
              </svg>
            </div>

            <h3 id="archive-dialog-title" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 800, color: 'var(--noir)', margin: '0 0 10px' }}>
              Archiver cette annonce ?
            </h3>

            <p style={{ fontSize: 13, color: 'var(--gris)', margin: '0 0 22px', lineHeight: 1.5 }}>
              Êtes-vous sûr de vouloir archiver <strong>"{archiveModalProp.title}"</strong> ? L'annonce ne sera plus visible par les locataires mais restera accessible dans vos archives.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setArchiveModalProp(null)}
                style={{
                  flex: 1, padding: '11px 18px', borderRadius: 12, border: '1px solid var(--gris-b)',
                  background: '#fff', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13
                }}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmArchiveProperty}
                disabled={archiving}
                style={{
                  flex: 1, padding: '11px 18px', borderRadius: 12, border: 0,
                  background: 'var(--rouge)', color: '#fff',
                  fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 13,
                  cursor: archiving ? 'wait' : 'pointer', opacity: archiving ? 0.7 : 1,
                  boxShadow: '0 4px 15px rgba(184,50,50,0.3)'
                }}
              >
                {archiving ? 'Archivage…' : 'Oui, archiver'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALE BLOQUER DES DATES POUR COURTE DURÉE ── */}
      {blockModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(15,13,9,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, width: '100%', maxWidth: 440,
            padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid var(--gris-b)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(124, 58, 237, 0.12)', color: '#7C3AED',
                  display: 'grid', placeItems: 'center'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F0D09' }}>
                  Bloquer des dates
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBlockModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#9B9690' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px', lineHeight: 1.5 }}>
              Rendez votre meublé indisponible sur la plateforme pour travaux, séjour personnel ou réservation hors site.
            </p>

            <form onSubmit={handleCreateBlockDates}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#374151', marginBottom: 6 }}>
                  Sélectionnez le logement meublé
                </label>
                <select
                  value={blockPropId}
                  onChange={(e) => setBlockPropId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none' }}
                >
                  <option value="">-- Choisir un bien meublé --</option>
                  {shortTermProps.map(p => (
                    <option key={p.id} value={p.id}>{p.title} ({p.city})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#374151', marginBottom: 4 }}>
                    Date de début
                  </label>
                  <input
                    type="date"
                    min={dateKey(new Date())}
                    value={blockStart}
                    onChange={(e) => setBlockStart(e.target.value)}
                    required
                    style={{ width: '100%', padding: '9px 10px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#374151', marginBottom: 4 }}>
                    Date de fin
                  </label>
                  <input
                    type="date"
                    min={blockStart || dateKey(new Date())}
                    value={blockEnd}
                    onChange={(e) => setBlockEnd(e.target.value)}
                    required
                    style={{ width: '100%', padding: '9px 10px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#374151', marginBottom: 6 }}>
                  Motif du blocage
                </label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none' }}
                >
                  <option value="Indisponible (Hôte)">Indisponible (Usage personnel / Famille)</option>
                  <option value="Travaux ou Maintenance">Travaux / Rénovation</option>
                  <option value="Réservé hors plateforme">Réservé en direct / Airbnb / Booking</option>
                  <option value="Autre motif">Autre motif</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setBlockModalOpen(false)}
                  style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #D1D5DB', background: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={blockingSubmitting}
                  style={{
                    padding: '10px 18px', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', color: '#fff',
                    fontSize: 13, fontWeight: 800, cursor: 'pointer',
                    opacity: blockingSubmitting ? 0.7 : 1
                  }}
                >
                  {blockingSubmitting ? 'Enregistrement…' : 'Confirmer le blocage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TOAST NOTIFICATION ── */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28,
          background: 'var(--noir)', color: '#fff',
          padding: '14px 20px', borderRadius: 13,
          boxShadow: '0 8px 30px rgba(0,0,0,.22)',
          display: 'flex', alignItems: 'center', gap: 12,
          fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 600,
          zIndex: 9999, borderLeft: '4px solid var(--or)'
        }}>
          <span>✓ {toastMsg}</span>
          <button
            type="button"
            onClick={() => setToastMsg('')}
            style={{ marginLeft: 10, background: 'none', border: 0, color: 'var(--or-l)', cursor: 'pointer', fontSize: 16 }}
          >
            ×
          </button>
        </div>
      )}

      {/* ── MODAL ABONNEMENTS ET BOOSTS BAILLEUR ── */}
      {landlordSubscriptionOpen && (
        <LandlordSubscriptionModal
          user={user}
          currentPoints={landlordPoints}
          targetProperty={boostTargetProperty}
          onClose={() => {
            setLandlordSubscriptionOpen(false);
            setBoostTargetProperty(null);
          }}
          onRechargeSuccess={(addedPts, newBal) => {
            const newPts = newBal !== undefined ? newBal : subscriptionService.addLandlordPoints(user?.id, addedPts);
            setLandlordPoints(newPts);
            setToastMsg(`+${addedPts} points ajoutés à votre solde !`);
            fetchDashboard();
          }}
          onSubscribeSuccess={(planObj) => {
            setLandlordPlan(planObj);
            subscriptionService.setLandlordPlan(user?.id, planObj);
            setToastMsg(`Félicitations ! Votre formule ${planObj.name} est active.`);
          }}
          onOpenConcierge={() => {
            setLandlordSubscriptionOpen(false);
            setLandlordConciergeOpen(true);
          }}
        />
      )}

      {/* ── MODAL CONCIERGERIE & GESTION DÉLÉGUÉE VIP ── */}
      {landlordConciergeOpen && (
        <LandlordConciergeModal
          properties={recent}
          user={user}
          onClose={() => setLandlordConciergeOpen(false)}
          onRequestCreated={(newReq) => {
            setConciergeRequests(subscriptionService.getConciergeRequests(user?.id));
            setToastMsg("Mandat de Conciergerie Piolo Signature enregistré !");
          }}
        />
      )}

      {/* ── MODAL ESTIMATEUR DE LOYER IA ── */}
      {rentEstimatorOpen && (
        <RentEstimatorModal
          isOpen={rentEstimatorOpen}
          onClose={() => setRentEstimatorOpen(false)}
        />
      )}

      {/* ── MODAL DOUCE APRÈS PUBLICATION (OPTION GESTION DÉLÉGUÉE RASSURANTE) ── */}
      {postPublishConciergeOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            background: 'rgba(26, 22, 18, 0.72)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.2s ease',
            boxSizing: 'border-box'
          }}
          onClick={() => setPostPublishConciergeOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #EBE4D8',
              borderRadius: 24,
              maxWidth: 520,
              width: '100%',
              padding: '26px 24px',
              color: '#1C1917',
              boxShadow: '0 24px 60px rgba(45, 38, 30, 0.22)',
              position: 'relative',
              boxSizing: 'border-box',
              fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Bouton fermer */}
            <button
              type="button"
              onClick={() => setPostPublishConciergeOpen(false)}
              aria-label="Fermer"
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                backgroundColor: '#F4EFE6',
                border: 'none',
                borderRadius: '50%',
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#5C5449',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 'bold',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#E8E1D5'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#F4EFE6'; }}
            >
              ✕
            </button>

            {/* En-tête / Badge */}
            <div style={{ marginBottom: 14 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: '#FFF8E7',
                  color: '#9A6700',
                  border: '1px solid #F5E5BE',
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 8
                }}
              >
                <span>👑</span>
                <span>ESPACE BAILLEUR & PROPRIÉTAIRE</span>
              </span>

              <h3
                style={{
                  margin: 0,
                  fontSize: 19,
                  fontWeight: 800,
                  color: '#1C1917',
                  letterSpacing: '-0.02em',
                  fontFamily: "'Poppins', sans-serif"
                }}
              >
                Votre bien est enregistré avec succès !
              </h3>
            </div>

            {/* Description rassurante */}
            <p
              style={{
                fontSize: 13.5,
                lineHeight: 1.55,
                color: '#5C5449',
                margin: '0 0 16px'
              }}
            >
              Votre logement est actif dans votre formule <strong>Bailleur Essentiel</strong> (100% gratuit).
              Vous recevrez directement les demandes et candidatures des locataires vérifiés.
            </p>

            <div
              style={{
                background: 'linear-gradient(180deg, #FFFCF2 0%, #FAF8F5 100%)',
                border: '1.5px solid #F5E5BE',
                borderRadius: 16,
                padding: '14px 16px',
                marginBottom: 20
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ color: '#D4AF37', fontSize: 18, marginTop: 1 }}>🛡️</span>
                <div style={{ fontSize: 13, color: '#3B352E', lineHeight: 1.5 }}>
                  <strong style={{ color: '#9A6700' }}>Envie de déléguer les visites physiques ?</strong>
                  <br />
                  Un agent certifié Piolo peut se déplacer sur site, gérer 100% des visites et vérifier la solvabilité des candidats à votre place.
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setPostPublishConciergeOpen(false);
                  setLandlordConciergeOpen(true);
                }}
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)',
                  color: '#0B0906',
                  border: 'none',
                  borderRadius: 14,
                  padding: '13px 18px',
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 16px rgba(212, 175, 55, 0.35)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span>Découvrir la Gestion Déléguée & Visites Piolo</span>
                <span style={{ fontSize: 16 }}>→</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPostPublishConciergeOpen(false);
                  setToastMsg('Parfait ! Vous gérez votre bien en autonomie depuis votre tableau de bord.');
                }}
                style={{
                  background: '#F6F2EB',
                  color: '#5C5449',
                  border: '1px solid #E5DED2',
                  borderRadius: 14,
                  padding: '11px 18px',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ECE4D8'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#F6F2EB'; }}
              >
                Gérer moi-même (Inclus dans mon pack)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALE CERTIFICATION KYC BAILLEUR ── */}
      <BailleurKYCModal
        isOpen={kycModalOpen}
        onClose={() => setKycModalOpen(false)}
        user={user}
        initialDossier={data?.dossier}
        onDossierUpdated={() => fetchDashboard()}
      />

      {/* ── BARRE DE NAVIGATION INFÉRIEURE MOBILE UNIFIÉE (Masquée dès qu'une modale est ouverte) ── */}
      {!isAnyModalOpen && (
        <MobileBottomNav unreadMessages={kpis.unread_messages || 0} upcomingVisits={kpis.pending_visits || 0} />
      )}
    </div>
  );
}
