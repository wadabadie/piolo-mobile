import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api, { propertiesApi, professionalsApi } from '../../services/api';
import PropertyCard from '../../components/PropertyCard';
import PropertySearchSheet from '../../components/PropertySearchSheet';
import MobileBottomNav from '../../components/MobileBottomNav';
import PioloLoader from '../../components/PioloLoader';
import Sidebar from '../../components/Sidebar';
import NotificationCenter from '../../components/NotificationCenter';
import UserAvatarMenu from '../../components/UserAvatarMenu';
import BeforeAfterSlider from '../../components/BeforeAfterSlider';
import ProBudgetCalculator from '../../components/ProBudgetCalculator';
import ProEscrowModal from '../../components/ProEscrowModal';
import ProQuoteRequestModal from '../../components/ProQuoteRequestModal';
import ProProjectDetailModal from '../../components/ProProjectDetailModal';
import ProProfileDetailModal from '../../components/ProProfileDetailModal';
import TenantSubscriptionModal from '../../components/TenantSubscriptionModal';
import { subscriptionService } from '../../services/subscriptionService';
import { cacheManager } from '../../services/cacheManager';
import { getMediaUrl } from '../../utils/media';
import '../bailleur/dashboard.css';

/* ─── Skeleton inline ─── */
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

export default function LocataireDashboard() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // État de chargement et données avec cache instantané (0ms)
  const cachedInitialData = cacheManager.get('locataire_dashboard_data');
  const [loading, setLoading] = useState(() => !cachedInitialData);
  // Afficher le PioloLoader (logo plein écran) uniquement lors de la 1ère connexion / session fraîche
  const [showInitialLoader, setShowInitialLoader] = useState(() => {
    const justLoggedIn = sessionStorage.getItem('piolo_just_logged_in') === 'true';
    const seen = sessionStorage.getItem('piolo_dashboard_locataire_seen') === 'true';
    return (justLoggedIn || !seen) && !cachedInitialData;
  });
  const [data, setData] = useState(() => cachedInitialData);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [propertySearch, setPropertySearch] = useState({ city:'', neighborhood:'', type:'', min_price:'', max_price:'', transaction:'', bedrooms:'', has_virtual_tour: false, is_verified: false });
  const [favoritePending, setFavoritePending] = useState({});
  const [searchSheetOpen, setSearchSheetOpen] = useState(false);
  const [mobileActivityTab, setMobileActivityTab] = useState('dossiers');
  const [selectedProModal, setSelectedProModal] = useState(null);
  const [quoteModal, setQuoteModal] = useState(null);
  const [quoteProjectModal, setQuoteProjectModal] = useState(null);
  const [selectedProjectModal, setSelectedProjectModal] = useState(null);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [escrowModalData, setEscrowModalData] = useState(null);

  // Données réelles des professionnels et chantiers depuis la BDD (avec cache)
  const [prosList, setProsList] = useState(() => cacheManager.get('pros_list') || []);
  const [proProjectsList, setProProjectsList] = useState(() => cacheManager.get('pro_projects_list') || []);

  useEffect(() => {
    professionalsApi.list().then(res => {
      if (Array.isArray(res.data)) {
        const mapped = res.data.map(p => {
          const latestProjectImg = p.projects && p.projects.length > 0 
            ? (p.projects[0].main_image_display || p.projects[0].image || p.projects[0].main_image_url) 
            : null;
          const avatar = p.avatar_url || p.user_avatar || p.user?.avatar || p.avatar || null;

          return {
            id: p.id,
            name: p.business_name || 'Artisan Piolo',
            title: p.primary_trade || 'Artisan du Bâtiment & Habitat',
            specialty: p.primary_trade || 'Artisan du Bâtiment & Habitat',
            city: p.city || 'Yaoundé',
            rating: p.rating || 5.0,
            reviewsCount: p.reviews_count || 0,
            projectsCount: p.projects_count || (p.projects ? p.projects.length : 0),
            experience: p.experience_years || '5 ans',
            pointsRequired: '2 pts',
            phone: p.phone || p.whatsapp,
            whatsapp: p.whatsapp || p.phone,
            avatarUrl: avatar ? getMediaUrl(avatar) : null,
            cover: getMediaUrl(p.cover_image_url || latestProjectImg, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'),
            initials: (p.business_name || 'P').substring(0, 2).toUpperCase(),
            avatarBg: 'linear-gradient(135deg, #D4AF37, #AA820A)',
            availColor: p.is_available !== false ? '#2ECC71' : '#E74C3C',
            availText: p.is_available !== false ? 'Disponible maintenant' : 'Indisponible',
            tags: p.secondary_trades && p.secondary_trades.length > 0 ? p.secondary_trades : ['Rénovation', 'Design int.'],
            bio: p.bio,
            projects: p.projects || [],
            raw: p
          };
        });
        setProsList(mapped);
        cacheManager.set('pros_list', mapped, 300000);
      }
    }).catch(err => console.error("Erreur chargement pros locataire:", err));

    professionalsApi.projects().then(res => {
      if (Array.isArray(res.data)) {
        setProProjectsList(res.data);
        cacheManager.set('pro_projects_list', res.data, 300000);
      }
    }).catch(err => console.error("Erreur chargement projets locataire:", err));
  }, []);

  // Redirection automatique si le compte est un Professionnel / Architecte
  useEffect(() => {
    if (user && (user.role === 'ARCHITECTE' || user.role === 'PROFESSIONNEL')) {
      navigate('/dashboard/pro', { replace: true });
    }
  }, [user, navigate]);
  
  // Refs pour le défilement automatique (auto-scroll) des carrousels mobiles
  const featuredCarouselRef = useRef(null);
  const rentalCarouselRef = useRef(null);
  const saleCarouselRef = useRef(null);
  const shortTermCarouselRef = useRef(null);
  const proProjectsRailRef = useRef(null);
  const proListRailRef = useRef(null);

  // Auto-scroll horizontal fluide toutes les 4 secondes
  useEffect(() => {
    const scrollCarousel = (ref) => {
      if (!ref.current) return;
      const el = ref.current;
      // Ne défile pas si l'utilisateur survole ou interagit
      if (el.matches(':hover') || el.matches(':active')) return;
      
      const item = el.querySelector('.horizontal-carousel-item, .pro-btp-project-card, .pro-btp-pro-card');
      const step = item ? item.offsetWidth + 14 : 260;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 5) return;
      
      if (el.scrollLeft + step >= maxScroll - 15) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' });
      }
    };

    const interval = setInterval(() => {
      scrollCarousel(featuredCarouselRef);
      scrollCarousel(rentalCarouselRef);
      scrollCarousel(saleCarouselRef);
      scrollCarousel(shortTermCarouselRef);
      scrollCarousel(proProjectsRailRef);
      scrollCarousel(proListRailRef);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // État pour le mode Bulle (Floating Sidebar) - mémorisé dans localStorage
  const [isFloating, setIsFloating] = useState(() => localStorage.getItem('sidebarMode') === 'floating');
  const toggleFloatingMode = () => setIsFloating(prev => {
    const next = !prev;
    localStorage.setItem('sidebarMode', next ? 'floating' : 'classic');
    return next;
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/auth/locataire-dashboard/?full=1');
        setData(response.data);
        cacheManager.set('locataire_dashboard_data', response.data, 180000);
      } catch (error) {
        console.error('Erreur de chargement du dashboard locataire:', error);
      } finally {
        setLoading(false);
        setShowInitialLoader(false);
        sessionStorage.setItem('piolo_dashboard_locataire_seen', 'true');
        sessionStorage.removeItem('piolo_just_logged_in');
      }
    };
    fetchDashboard();

    const handleBoost = () => {
      fetchDashboard();
    };
    window.addEventListener('piolo_boost_applied', handleBoost);
    return () => {
      window.removeEventListener('piolo_boost_applied', handleBoost);
    };
  }, []);

  // Les propriétés arrivent déjà triées par -is_boosted depuis le backend
  // On affine juste par type de boost (flash > multiboost > vedette)
  const allProperties = React.useMemo(() => {
    return subscriptionService.sortPropertiesByBoost(data?.recent_properties || []);
  }, [data?.recent_properties]);

  // Logements Vedettes (Strictement Boostés / En Vedette)
  const featuredProperties = React.useMemo(() => {
    return allProperties.filter(p => {
      const boost = subscriptionService.isPropertyBoosted(p);
      return Boolean(boost || p.is_boosted);
    });
  }, [allProperties]);

  // Logements à louer (Long terme)
  const rentalProperties = React.useMemo(() => {
    return allProperties.filter(p => p.transaction_type === 'LOCATION' || !p.transaction_type);
  }, [allProperties]);

  // Biens à vendre (Investissement & Achat)
  const saleProperties = React.useMemo(() => {
    return allProperties.filter(p => p.transaction_type === 'VENTE');
  }, [allProperties]);

  // Courts séjours & Meublés (Strictement Court terme)
  const shortTermProperties = React.useMemo(() => {
    return allProperties.filter(p => 
      p.transaction_type === 'COURTE_DUREE' || p.is_short_term || p.short_term
    );
  }, [allProperties]);

  const filteredProperties = React.useMemo(() => {
    const list = allProperties.filter(prop => {
      if (filter === 'all') return true;
      if (filter === 'louer') return prop.transaction_type === 'LOCATION';
      if (filter === 'vendre') return prop.transaction_type === 'VENTE';
      if (filter === 'appartement') return (prop.property_type || '').toUpperCase() === 'APPARTEMENT';
      if (filter === 'villa') return (prop.property_type || '').toUpperCase() === 'VILLA';
      if (filter === 'studio') return (prop.property_type || '').toUpperCase() === 'STUDIO';
      return true;
    });
    return subscriptionService.sortPropertiesByBoost(list);
  }, [allProperties, filter]);

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage) || 1;
  const paginatedProperties = filteredProperties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');
  
  const [tenantPoints, setTenantPoints] = useState(() => subscriptionService.getTenantPoints(user?.id));
  const [tenantPlan, setTenantPlan] = useState(() => subscriptionService.getTenantPlan(user?.id));
  const [tenantSubscriptionOpen, setTenantSubscriptionOpen] = useState(false);
  const points = tenantPoints;
  const ptsPct = Math.min((points / 500) * 100, 100);
  
  const userKey = user?.id || user?.email || 'default';
  const [welcomeBannerVisible, setWelcomeBannerVisible] = useState(() => {
    if (!user) return false;
    const isNewReg = sessionStorage.getItem('piolo_is_new_registration') === 'true';
    const seen = localStorage.getItem(`piolo_welcome_seen_${userKey}`);
    return isNewReg && !seen;
  });

  useEffect(() => {
    if (!user) return;
    const key = user.id || user.email || 'default';
    const isNewReg = sessionStorage.getItem('piolo_is_new_registration') === 'true';
    const seen = localStorage.getItem(`piolo_welcome_seen_${key}`);
    setWelcomeBannerVisible(isNewReg && !seen);

    // Synchronisation backend temps réel de l'abonnement et des points
    subscriptionService.fetchTenantSubscriptionStatus().then((res) => {
      if (res && res.ok) {
        if (res.points !== undefined) {
          setTenantPoints(res.points);
          subscriptionService.setTenantPoints(user.id, res.points);
        }
        if (res.active_subscription) {
          const planData = {
            id: res.active_subscription.plan_type,
            name: res.active_subscription.plan_name,
            billingCycle: res.active_subscription.billing_cycle,
            expires_at: res.active_subscription.expires_at,
            days_remaining: res.active_subscription.days_remaining,
          };
          setTenantPlan(planData);
          subscriptionService.setTenantPlan(user.id, planData);
        } else {
          setTenantPlan(null);
          subscriptionService.setTenantPlan(user.id, null);
        }
      }
    }).catch(() => {});

    // Écoute temps réel des débits/recharges de points
    const handlePointsUpdated = (e) => {
      if (e.detail && e.detail.points !== undefined) {
        setTenantPoints(e.detail.points);
      } else if (user) {
        setTenantPoints(subscriptionService.getTenantPoints(user.id));
      }
    };
    window.addEventListener('piolo_points_updated', handlePointsUpdated);
    return () => window.removeEventListener('piolo_points_updated', handlePointsUpdated);
  }, [user]);

  const closeWelcome = () => {
    const key = user?.id || user?.email || 'default';
    localStorage.setItem(`piolo_welcome_seen_${key}`, 'true');
    sessionStorage.removeItem('piolo_is_new_registration');
    setWelcomeBannerVisible(false);
  };

  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertForm, setAlertForm] = useState({ title:'', city:'', neighborhood:'', transaction_type:'LOCATION', property_type:'', min_price:'', max_price:'' });
  const [alertSaving, setAlertSaving] = useState(false);
  const [alertError, setAlertError] = useState('');
  const createAlert = async () => {
    if (!alertForm.title.trim()) return setAlertError("Le nom de l'alerte est requis.");
    setAlertSaving(true); setAlertError('');
    try {
      const { data: alert } = await propertiesApi.createAlert(alertForm);
      setData((current) => ({ ...current, search_alerts: [alert, ...(current?.search_alerts || [])] }));
      setAlertForm({ title:'', city:'', neighborhood:'', transaction_type:'LOCATION', property_type:'', min_price:'', max_price:'' });
      setAlertModalOpen(false);
    } catch (error) { setAlertError(error.response?.data?.detail || "Impossible de créer l'alerte."); }
    finally { setAlertSaving(false); }
  };
  const submitPropertySearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (propertySearch.city) params.set('city', propertySearch.city);
    if (propertySearch.neighborhood.trim()) params.set('neighborhood', propertySearch.neighborhood.trim());
    if (propertySearch.type) params.set('type', propertySearch.type);
    if (propertySearch.min_price) params.set('min_price', propertySearch.min_price);
    if (propertySearch.max_price) params.set('max_price', propertySearch.max_price);
    if (propertySearch.transaction) params.set('transaction', propertySearch.transaction);
    navigate(`/properties${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const togglePropertyFavorite = async (event, property) => {
    event.preventDefault();
    event.stopPropagation();
    if (!property?.id || favoritePending[property.id]) return;
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/dashboard/locataire' } } });
      return;
    }

    setFavoritePending((current) => ({ ...current, [property.id]: true }));
    try {
      const response = await propertiesApi.toggleFavorite(property.id);
      const nextFavorite = typeof response.data?.is_favorite === 'boolean'
        ? response.data.is_favorite
        : !property.is_favorite;
      setData((current) => {
        if (!current) return current;
        const nextProperties = (current.recent_properties || []).map((item) => (
          item.id === property.id ? { ...item, is_favorite: nextFavorite } : item
        ));
        return {
          ...current,
          recent_properties: nextProperties,
          saved_count: Number.isFinite(Number(response.data?.count))
            ? Number(response.data.count)
            : Math.max(0, Number(current.saved_count || 0) + (nextFavorite ? 1 : -1)),
        };
      });
    } catch (error) {
      console.error('Erreur de mise à jour du favori:', error);
    } finally {
      setFavoritePending((current) => {
        const next = { ...current };
        delete next[property.id];
        return next;
      });
    }
  };

  // Éléments du menu FAB (angles comme dans floating_sidebar.js, sens horaire depuis droite)
  const fabItems = [
    { href: '/dashboard/locataire', label: t('sidebar.dashboard', 'Tableau de bord'), angle: 0,   icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg> },
    { href: '/properties',          label: t('common.search', 'Rechercher'),     angle: 45,  icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg> },
    { href: '/map',                  label: t('sidebar.interactive_map', 'Carte Interactive'), angle: 90, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> },
    { href: '/dashboard/locataire/favoris', label: t('dashboard.favorites', 'Favoris'), angle: 135, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/></svg> },
    { href: '/dashboard/locataire/visites', label: t('dashboard.visits', 'Visites'), angle: 180, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg> },
    { href: '/messages',             label: t('sidebar.messages', 'Messages'),       angle: 225, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg> },
    { href: '/decouverte',           label: t('sidebar.discovery_mode', 'Mode Découverte'), angle: 270, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M8 5v14l11-7z"/></svg> },
    { href: '__close__',             label: t('sidebar.classic_sidebar', 'Sidebar classique'), angle: 315, isClear: true, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg> },
  ];

  return (
    <div className={`layout${isFloating ? ' floating-mode' : ''}`}>
      <PioloLoader show={showInitialLoader} />
      <Sidebar data={data} />

      {/* ═══════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════ */}
      <div className="main">
        <header className="topbar">
          <div className="topbar-title">{t('dashboard.topbar_title_part1', 'Tableau de')} <span>{t('dashboard.topbar_title_part2', 'Bord')}</span></div>
          <div className="tb-search">
            <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            <input type="text" placeholder={t('property_list.search_placeholder')} />
          </div>
          <div className="tb-actions">
            <div
              className="tb-pts-badge"
              onClick={() => setTenantSubscriptionOpen(true)}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              title={t('dashboard.recharge_points_tooltip', 'Cliquer pour recharger vos points ou gérer votre Pass Recherche VIP')}
            >
              <svg width="15" height="15" fill={tenantPlan ? '#2ECC71' : 'var(--or)'} viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              <span className="tb-pts-val" style={{ fontWeight: 800 }}>
                {tenantPlan ? `${tenantPlan.name}` : `${tenantPoints} Pts`}
              </span>
              <span className="tb-pts-action-pill" style={{ fontSize: 10, background: '#0F0D09', color: '#F6D365', padding: '2px 6px', borderRadius: 6, fontWeight: 700, marginLeft: 2 }}>
                {tenantPlan ? 'VIP' : t('dashboard.recharge_points')}
              </span>
            </div>
            <NotificationCenter />
            <UserAvatarMenu size={38} />
          </div>
        </header>

        <main className="content">
          {/* Welcome Banner */}
          {!loading && welcomeBannerVisible && (
            <div className="welcome-banner" id="welcome-banner">
              <div className="wb-ico"><svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg></div>
              <div className="wb-txt">
                <h4>{t('dashboard.welcome')} {user?.first_name} !</h4>
                <p>{t('dashboard.account_active_points_msg', 'Votre compte est actif. {{points}} points de bienvenue ont été crédités.', { points })}</p>
              </div>
              <div className="wb-pts">
                <div className="wb-pts-val">{points}</div>
                <div className="wb-pts-lbl">{t('dashboard.pts_gifted', 'pts offerts')}</div>
              </div>
              <button className="wb-close" onClick={closeWelcome} title={t('common.close', 'Fermer')}>✕</button>
            </div>
          )}

          {/* HERO */}
          <div className="hero-banner">
            <div className="hero-content">
              <p className="hero-greet">{t('dashboard.hero_greet_tenant')}</p>
              <h1 className="hero-name">{user?.first_name} <span>{user?.last_name}</span></h1>
              <p className="hero-sub">{t('dashboard.hero_sub_tenant')}</p>
            </div>
            <div className="hero-chips">
              <span className="hero-chip">{user?.role === 'BAILLEUR' ? t('common.landlord', 'Bailleur') : (user?.role === 'ARCHITECTE' || user?.role === 'PROFESSIONNEL' ? t('common.pro', 'Professionnel') : t('common.tenant', 'Locataire'))}</span>
              <span className="hero-chip">{user?.city||'Cameroun'}</span>
            </div>
          </div>

          {/* MOBILE QUICK ACTIONS */}
          <div className="locataire-mobile-quick-actions" style={{ display: 'none', marginBottom: 20 }}>
            <div className="loc-qa-grid">
              <Link to="/properties" className="loc-qa-card qa-search">
                <div className="loc-qa-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <span className="loc-qa-label">{t('common.search', 'Recherche')}</span>
              </Link>

              <Link to="/dashboard/locataire/favoris" className="loc-qa-card qa-fav">
                <div className="loc-qa-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <span className="loc-qa-label">{t('dashboard.favorites', 'Favoris')}</span>
              </Link>

              <Link to="/dashboard/locataire/visites" className="loc-qa-card qa-vis">
                <div className="loc-qa-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                    <polyline points="9 16 11 18 15 14"></polyline>
                  </svg>
                </div>
                <span className="loc-qa-label">{t('dashboard.visits', 'Visites')}</span>
              </Link>

              <button type="button" onClick={() => setSearchSheetOpen(true)} className="loc-qa-card qa-filter">
                <div className="loc-qa-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="21" x2="4" y2="14"></line>
                    <line x1="4" y1="10" x2="4" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="3"></line>
                    <line x1="20" y1="21" x2="20" y2="16"></line>
                    <line x1="20" y1="12" x2="20" y2="3"></line>
                    <line x1="1" y1="14" x2="7" y2="14"></line>
                    <line x1="9" y1="8" x2="15" y2="8"></line>
                    <line x1="17" y1="16" x2="23" y2="16"></line>
                  </svg>
                </div>
                <span className="loc-qa-label">{t('common.filters', 'Filtres')}</span>
              </button>
            </div>
          </div>

          {/* INNOVATIVE EXECUTIVE KPI CARDS */}
          <div className="executive-kpi-grid">
            {/* Card 1: Favoris */}
            <Link to="/dashboard/locataire/favoris" className="exec-kpi-card kpi-favoris">
              <div className="exec-kpi-bg-glow"></div>
              <div className="exec-kpi-header">
                <div className="exec-kpi-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#E11D48" stroke="#E11D48" strokeWidth="0.5">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <span className="exec-kpi-pill pill-rose">
                  <span className="pulse-dot"></span> {t('header.favorites')}
                </span>
              </div>
              <div className="exec-kpi-body">
                <div className="exec-kpi-number">{loading ? <Sk w={45} h={32} /> : (data?.saved_count ?? 0)}</div>
                <div className="exec-kpi-meta">
                  <span className="exec-kpi-label">{t('dashboard.kpi_saved_properties')}</span>
                  <span className="exec-kpi-sub">{t('dashboard.kpi_saved_sub')}</span>
                </div>
              </div>
            </Link>

            {/* Card 2: Points & VIP */}
            <div onClick={() => setTenantSubscriptionOpen(true)} className="exec-kpi-card kpi-points" style={{ cursor: 'pointer' }}>
              <div className="exec-kpi-bg-glow"></div>
              <div className="exec-kpi-header">
                <div className="exec-kpi-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <span className="exec-kpi-pill pill-gold">
                  {tenantPlan ? `${tenantPlan.name}` : '★ VIP'}
                </span>
              </div>
              <div className="exec-kpi-body">
                <div className="exec-kpi-number">{loading ? <Sk w={45} h={32} /> : points} <span className="exec-kpi-unit">Pts</span></div>
                <div className="exec-kpi-meta">
                  <span className="exec-kpi-label">{t('dashboard.kpi_tenant_vip')}</span>
                  <span className="exec-kpi-sub">{t('dashboard.kpi_tenant_vip_sub')}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Messages */}
            <Link to="/messages" className="exec-kpi-card kpi-messages">
              <div className="exec-kpi-bg-glow"></div>
              <div className="exec-kpi-header">
                <div className="exec-kpi-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <span className="exec-kpi-pill pill-blue">
                  {data?.unread_messages > 0 ? t('dashboard.unread_messages_count', '● {{count}} non lu(s)', { count: data.unread_messages }) : t('dashboard.direct', 'Direct')}
                </span>
              </div>
              <div className="exec-kpi-body">
                <div className="exec-kpi-number">{loading ? <Sk w={45} h={32} /> : (data?.unread_messages ?? 0)}</div>
                <div className="exec-kpi-meta">
                  <span className="exec-kpi-label">{t('sidebar.messages', 'Messages')}</span>
                  <span className="exec-kpi-sub">{t('dashboard.landlords_pros', 'Bailleurs & Pros')}</span>
                </div>
              </div>
            </Link>

            {/* Card 4: Visites */}
            <Link to="/dashboard/locataire/visites" className="exec-kpi-card kpi-visites">
              <div className="exec-kpi-bg-glow"></div>
              <div className="exec-kpi-header">
                <div className="exec-kpi-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                    <polyline points="9 16 11 18 15 14"></polyline>
                  </svg>
                </div>
                <span className="exec-kpi-pill pill-emerald">
                  {t('dashboard.active')}
                </span>
              </div>
              <div className="exec-kpi-body">
                <div className="exec-kpi-number">{loading ? <Sk w={45} h={32} /> : (data?.upcoming_visits?.length ?? 0)}</div>
                <div className="exec-kpi-meta">
                  <span className="exec-kpi-label">{t('dashboard.kpi_scheduled_visits')}</span>
                  <span className="exec-kpi-sub">{t('dashboard.kpi_scheduled_visits_sub')}</span>
                </div>
              </div>
            </Link>
          </div>

          {/* MAIN GRID */}
          <div className="main-grid">
            {/* Colonne Gauche */}
            <div style={{display:'flex',flexDirection:'column',gap:22}}>
              
              {/* ALERTES */}
              <div className="card">
                <div className="card-header">
                  <span className="ch-title">{t('dashboard.search_alerts', 'Alertes de Recherche')}</span>
                  <button onClick={()=>setAlertModalOpen(true)} style={{marginLeft:'auto',padding:'6px 14px',borderRadius:9,background:'linear-gradient(135deg,var(--or),var(--or-l))',border:'none',fontFamily:'Poppins,sans-serif',fontSize:12,fontWeight:700,color:'var(--noir)',cursor:'pointer'}}>
                    {t('dashboard.create_alert_btn', '+ Créer une alerte')}
                  </button>
                </div>
                <div className="alert-list" style={{padding:'12px 14px'}}>
                  {loading && <Sk w="100%" h={40} />}
                  {!loading && (!data?.search_alerts || data.search_alerts.length === 0) && (
                    <div className="al-empty" style={{textAlign:'center',padding:'20px'}}>
                      <svg width="34" height="34" fill="var(--gris-b)" viewBox="0 0 24 24" style={{margin:'0 auto 10px',display:'block'}}><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
                      <div style={{color:'var(--gris)'}}>{t('dashboard.no_alerts', 'Aucune alerte configurée.')}</div>
                      <button onClick={()=>setAlertModalOpen(true)} style={{background:'none',border:'none',color:'var(--or-d)',fontWeight:600,cursor:'pointer',marginTop:6}}>{t('dashboard.create_first_alert', 'Créer ma première alerte →')}</button>
                    </div>
                  )}
                  {!loading && data?.search_alerts?.length > 0 && (
                    <div style={{display:'flex',flexDirection:'column',gap:10}}>
                      {data.search_alerts.slice(0, 3).map(alert => (
                        <div key={alert.id} className="loc-alert-card" style={{display:'flex',alignItems:'center',gap:13,padding:'14px 15px',borderRadius:15}}>
                          <div style={{width:38,height:38,borderRadius:12,display:'grid',placeItems:'center',background:'rgba(212,175,55,.18)',color:'var(--or-d)',flexShrink:0}}><svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5S10 3.17 10 4v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg></div>
                          <div style={{minWidth:0,flex:1}}>
                            <div style={{fontWeight:800,fontSize:14,color:'var(--noir)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{alert.title}</div>
                            <div style={{fontSize:12,color:'var(--gris-m)',marginTop:3,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{alert.city || t('dashboard.all_cities', 'Toutes les villes')}{alert.neighborhood ? `, ${alert.neighborhood}` : ''}</div>
                          </div>
                          <div style={{textAlign:'right',flexShrink:0}}><div style={{fontSize:16,fontWeight:800,color:'var(--or-d)',lineHeight:1}}>{alert.matches_count ?? 0}</div><div style={{fontSize:10,color:'var(--gris-m)',marginTop:3}}>{t('dashboard.properties_found', '{{count}} bien(s) trouvé(s)', { count: alert.matches_count ?? 0 })}</div></div>
                          <Link to={`/dashboard/locataire/alertes?alert=${alert.id}`} style={{fontSize:11.5,fontWeight:700,color:'var(--or-d)',textDecoration:'none',padding:'9px 12px',borderRadius:9,background:'rgba(212,175,55,.12)',whiteSpace:'nowrap'}}>{t('dashboard.view_results', 'Voir résultats')}</Link>
                        </div>
                      ))}
                      {data.search_alerts.length > 3 && (
                        <Link to="/dashboard/locataire/alertes" style={{textAlign:'center',display:'block',fontSize:13,color:'var(--or-d)',fontWeight:600,marginTop:6,textDecoration:'none'}}>{t('dashboard.view_all_alerts', 'Voir toutes les alertes →')}</Link>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="card" style={{overflow:'hidden'}}>
                <div className="card-header" style={{padding:'16px 20px',borderBottom:'1px solid var(--gris-b)',display:'flex',alignItems:'center',gap:10}}>
                  <span className="ch-title" style={{fontSize:15,fontWeight:800,fontFamily:'Poppins,sans-serif'}}>{t('dashboard.my_visits', 'Mes Visites')}</span>
                  <span style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,background:'rgba(212,175,55,.12)',color:'var(--or-d)',fontFamily:'Poppins,sans-serif',border:'1px solid rgba(212,175,55,.25)'}}>{t('dashboard.requests_count', '{{count}} demande(s)', { count: data?.my_visits?.length || 0 })}</span>
                  <Link className="ch-link" to="/dashboard/locataire/visites" style={{marginLeft:'auto',fontSize:13,fontWeight:700,color:'var(--or-d)',textDecoration:'none',display:'flex',alignItems:'center',gap:4}}>{t('dashboard.view_all_visits', 'Voir toutes →')}</Link>
                </div>
                <div style={{padding:'12px 16px',display:'flex',flexDirection:'column',gap:10}}>
                  {loading && [1].map(n=>(
                    <div key={n} style={{display:'flex',gap:14,padding:14,border:'1px solid var(--gris-b)',borderRadius:14}}>
                      <Sk w={82} h={68} r={12} />
                      <div style={{flex:1}}><Sk w="60%" h={14} style={{marginBottom:8}}/><Sk w="40%" h={12}/></div>
                    </div>
                  ))}
                  {!loading && (data?.my_visits || []).length === 0 && (
                    <div style={{textAlign:'center',padding:'24px 0'}}>
                      <svg width="38" height="38" fill="var(--gris-b)" viewBox="0 0 24 24" style={{display:'block',margin:'0 auto 12px'}}><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>
                      <div style={{color:'var(--gris)',fontSize:13,marginBottom:10}}>{t('dashboard.no_visits_scheduled', 'Aucune visite programmée.')}</div>
                      <Link to="/properties" style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 18px',background:'linear-gradient(135deg,var(--or),var(--or-l))',borderRadius:10,color:'var(--noir)',fontFamily:'Poppins,sans-serif',fontSize:12,fontWeight:700,textDecoration:'none',boxShadow:'0 3px 10px rgba(212,175,55,.3)'}}>{t('dashboard.explore_properties', 'Explorer les biens →')}</Link>
                    </div>
                  )}
                  {/* Le tableau de bord reste compact : les trois visites les plus récentes
                      sont visibles ici, le lien « Voir toutes » ouvre la liste complète. */}
                  {!loading && (data?.my_visits || []).slice(0, 3).map((visit) => (
                    <div key={visit.id} className="loc-visit-card" style={{display:'flex',gap:14,padding:'14px 16px',borderRadius:16,transition:'box-shadow .2s',
                      ...(visit.status==='CONFIRMED' ? {borderColor:'rgba(30,122,71,.4)'} : {})
                    }}>
                      {/* Vignette */}
                      {visit.property?.main_image ? (
                        <div style={{width:84,height:70,borderRadius:12,backgroundImage:`url('${visit.property.main_image}')`,backgroundSize:'cover',backgroundPosition:'center',flexShrink:0,boxShadow:'0 2px 8px rgba(0,0,0,.12)'}} />
                      ) : (
                        <div style={{width:84,height:70,borderRadius:12,background:'var(--gris-f)',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <svg width="26" height="26" fill="var(--gris-m)" viewBox="0 0 24 24"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>
                        </div>
                      )}
                      {/* Infos */}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:5,flexWrap:'wrap'}}>
                          {visit.status==='CONFIRMED' && <span style={{fontSize:10,fontWeight:800,padding:'3px 9px',borderRadius:20,background:'rgba(30,122,71,.12)',color:'#1E7A47',fontFamily:'Poppins,sans-serif',border:'1px solid rgba(30,122,71,.2)'}}>&#10003; {t('dashboard.status_confirmed', 'Confirmée')}</span>}
                          {visit.status==='PENDING'   && <span style={{fontSize:10,fontWeight:800,padding:'3px 9px',borderRadius:20,background:'rgba(212,175,55,.12)',color:'var(--or-d)',fontFamily:'Poppins,sans-serif',border:'1px solid rgba(212,175,55,.25)'}}>&#8987; {t('dashboard.status_pending', 'En attente')}</span>}
                          {visit.status==='REFUSED'   && <span style={{fontSize:10,fontWeight:800,padding:'3px 9px',borderRadius:20,background:'rgba(184,50,50,.1)',color:'var(--rouge)',fontFamily:'Poppins,sans-serif',border:'1px solid rgba(184,50,50,.2)'}}>&#10005; {t('dashboard.status_refused', 'Refusée')}</span>}
                          {visit.status==='CANCELLED' && <span style={{fontSize:10,fontWeight:800,padding:'3px 9px',borderRadius:20,background:'var(--gris-f)',color:'var(--gris-m)',fontFamily:'Poppins,sans-serif',border:'1px solid var(--gris-b)'}}>{t('dashboard.status_cancelled', 'Annulée')}</span>}
                          {(visit.status==='CONFIRMED' ? visit.confirmed_date : visit.requested_date) && (
                            <span style={{fontSize:11,color:'var(--gris-m)',fontWeight:500}}>
                              {visit.status==='CONFIRMED' ? (visit.confirmed_date || visit.requested_date) : t('dashboard.requested_for_date', 'Demandée pour le {{date}}', { date: visit.requested_date })}
                              {(visit.status==='CONFIRMED' && visit.confirmed_time) ? t('dashboard.at_time', ' à {{time}}', { time: visit.confirmed_time.slice(0,5) }) : ''}
                            </span>
                          )}
                        </div>
                        <div style={{fontFamily:'Poppins,sans-serif',fontSize:13.5,fontWeight:800,color:'var(--noir)',marginBottom:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{visit.property?.title}</div>
                        <div style={{fontSize:12,color:'var(--gris-m)',fontWeight:500}}>{visit.property?.city}{visit.property?.neighborhood ? `, ${visit.property.neighborhood}` : ''}</div>
                        {visit.bailleur_note && visit.status!=='PENDING' && (
                          <div style={{marginTop:6,fontSize:11.5,color:'var(--gris)',fontStyle:'italic',background:'var(--gris-f)',borderRadius:8,padding:'5px 10px',borderLeft:'3px solid var(--gris-b)'}}>{t('dashboard.landlord_note', 'Note du bailleur : {{note}}', { note: visit.bailleur_note })}</div>
                        )}
                        <div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}>
                          {visit.property?.slug && (
                            <Link to={`/properties/${visit.property.slug}`} style={{display:'inline-flex',alignItems:'center',gap:5,padding:'6px 14px',borderRadius:9,background:'rgba(212,175,55,.10)',border:'1px solid rgba(212,175,55,.28)',fontFamily:'Poppins,sans-serif',fontSize:12,fontWeight:700,color:'var(--or-d)',textDecoration:'none'}}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                              Voir le bien
                            </Link>
                          )}
                          <Link to={`/dashboard/locataire/visites/${visit.id}`} style={{display:'inline-flex',alignItems:'center',gap:5,padding:'6px 14px',borderRadius:9,background:'var(--gris-f)',border:'1px solid var(--gris-b)',fontFamily:'Poppins,sans-serif',fontSize:12,fontWeight:700,color:'var(--noir)',textDecoration:'none',transition:'all .2s'}}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--or-d)"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                            Voir demande
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DOSSIERS LOCATION */}
              <div className="card" style={{overflow:'hidden'}}>
                <div className="card-header" style={{padding:'16px 20px',borderBottom:'1px solid var(--gris-b)',display:'flex',alignItems:'center',gap:10}}>
                  <span className="ch-title" style={{fontSize:15,fontWeight:800,fontFamily:'Poppins,sans-serif'}}>{t('dashboard.my_rental_applications', 'Mes dossiers de location')}</span>
                  <span style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,background:'var(--gris-f)',color:'var(--gris)',fontFamily:'Poppins,sans-serif',border:'1px solid var(--gris-b)',marginLeft:'auto'}}>{t('dashboard.dossiers_count', '{{count}} dossier(s)', { count: data?.my_locations?.length || 0 })}</span>
                  <Link className="ch-link" to="/dashboard/locataire/locations" style={{fontSize:13,fontWeight:700,color:'var(--or-d)',textDecoration:'none'}}>{t('dashboard.view_all_applications', 'Voir tout →')}</Link>
                </div>
                <div style={{padding:'12px 16px',display:'flex',flexDirection:'column',gap:10}}>
                  {loading && [1].map(n=>(
                    <div key={n} style={{display:'flex',gap:14,padding:14,border:'1px solid var(--gris-b)',borderRadius:14}}>
                      <Sk w={72} h={58} r={10} /><div style={{flex:1}}><Sk w="60%" h={14} style={{marginBottom:8}}/><Sk w="40%" h={12}/></div>
                    </div>
                  ))}
                  {!loading && (data?.my_locations || []).length === 0 && (
                    <div style={{textAlign:'center',padding:'24px 0'}}>
                      <svg width="40" height="40" fill="var(--gris-b)" viewBox="0 0 24 24" style={{display:'block',margin:'0 auto 12px'}}><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                      <p style={{fontSize:13,color:'var(--gris-m)',marginBottom:12}}>{t('dashboard.no_applications', 'Aucun dossier de location en cours.')}</p>
                      <Link to="/properties" style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 18px',background:'linear-gradient(135deg,var(--or),var(--or-l))',borderRadius:10,color:'var(--noir)',fontFamily:'Poppins,sans-serif',fontSize:12,fontWeight:700,textDecoration:'none',boxShadow:'0 3px 10px rgba(212,175,55,.3)'}}>{t('dashboard.explore_properties', 'Explorer les biens →')}</Link>
                    </div>
                  )}
                  {/* Même règle pour les dossiers : aperçu de trois éléments, liste complète
                      disponible via « Voir tout ». */}
                  {!loading && (data?.my_locations || []).slice(0, 3).map(loc => (
                    <div key={loc.id} className="loc-application-card" style={{display:'flex',alignItems:'flex-start',gap:14,padding:'14px 16px',borderRadius:16,
                      ...(loc.status==='ACCEPTED' ? {borderColor:'rgba(30,122,71,.45)'} : {}),
                      ...(loc.status==='REFUSED'  ? {borderColor:'rgba(184,50,50,.35)'} : {})
                    }}>
                      {/* Vignette */}
                      {loc.property?.main_image ? (
                        <img src={getMediaUrl(loc.property.main_image)} alt={loc.property?.title} style={{width:74,height:58,objectFit:'cover',borderRadius:11,flexShrink:0,boxShadow:'0 2px 8px rgba(0,0,0,.12)'}} />
                      ) : (
                        <div style={{width:74,height:58,borderRadius:11,background:'linear-gradient(135deg,var(--gris-b),#e2ddd4)',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <svg width="24" height="24" fill="var(--gris-m)" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                        </div>
                      )}
                      {/* Infos */}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:'Poppins,sans-serif',fontSize:13.5,fontWeight:800,color:'var(--noir)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{loc.property?.title}</div>
                        <div style={{fontSize:12,color:'var(--gris-m)',marginTop:2,fontWeight:500}}>
                          {loc.property?.price ? `${parseInt(loc.property.price).toLocaleString('fr-FR')} FCFA/mois` : ''}
                          {loc.move_in_date ? <> &middot; Entrée : {loc.move_in_date}</> : ''}
                        </div>
                        {/* Badge statut */}
                        <div style={{marginTop:8}}>
                          {loc.status==='PENDING'   && <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:10.5,fontWeight:700,padding:'4px 12px',borderRadius:20,background:'rgba(212,175,55,.12)',color:'#A8891C',fontFamily:'Poppins,sans-serif',border:'1px solid rgba(212,175,55,.25)'}}>&#8987; {t('dashboard.status_pending', 'En attente')} de réponse</span>}
                          {loc.status==='REVIEWING' && <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:10.5,fontWeight:700,padding:'4px 12px',borderRadius:20,background:'rgba(30,58,110,.1)',color:'#1E3A6E',fontFamily:'Poppins,sans-serif',border:'1px solid rgba(30,58,110,.15)'}}>&#128269; {t('dashboard.reviewing_application', "Dossier en cours d'examen")}</span>}
                          {loc.status==='ACCEPTED'  && <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:10.5,fontWeight:700,padding:'4px 12px',borderRadius:20,background:'rgba(30,122,71,.12)',color:'#1E7A47',fontFamily:'Poppins,sans-serif',border:'1px solid rgba(30,122,71,.2)'}}>&#10003; {t('dashboard.application_accepted', 'Dossier accepté ! Contactez le bailleur.')}</span>}
                          {loc.status==='REFUSED'   && <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:10.5,fontWeight:700,padding:'4px 12px',borderRadius:20,background:'rgba(184,50,50,.1)',color:'#B83232',fontFamily:'Poppins,sans-serif',border:'1px solid rgba(184,50,50,.2)'}}>&#10005; {t('dashboard.application_refused', 'Dossier refusé')}{loc.bailleur_note ? ` — ${loc.bailleur_note.slice(0,40)}` : ''}</span>}
                          {loc.status==='CANCELLED' && <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:10.5,fontWeight:700,padding:'4px 12px',borderRadius:20,background:'var(--gris-f)',color:'var(--gris-m)',fontFamily:'Poppins,sans-serif',border:'1px solid var(--gris-b)'}}>{t('dashboard.status_cancelled', 'Annulé')}</span>}
                        </div>
                        {/* Barre de complétude */}
                        {loc.dossier_completion !== undefined && (
                          <div style={{marginTop:10}}>
                            <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--gris-m)',marginBottom:5}}>
                              <span style={{fontWeight:600}}>{t('dashboard.dossier_completion', 'Complétude du dossier')}</span>
                              <span style={{fontWeight:800,color:'var(--or-d)'}}>{loc.dossier_completion}%</span>
                            </div>
                            <div style={{height:6,background:'var(--gris-b)',borderRadius:6,overflow:'hidden'}}>
                              <div style={{height:'100%',width:`${loc.dossier_completion}%`,background:'linear-gradient(90deg,var(--or),var(--or-l))',borderRadius:6,transition:'width .5s cubic-bezier(.4,0,.2,1)'}} />
                            </div>
                          </div>
                        )}
                        {/* Boutons */}
                        <div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}>
                          {loc.property?.slug && (
                            <Link to={`/properties/${loc.property.slug}`} style={{display:'inline-flex',alignItems:'center',gap:5,padding:'6px 14px',borderRadius:9,background:'rgba(212,175,55,.10)',border:'1px solid rgba(212,175,55,.28)',fontFamily:'Poppins,sans-serif',fontSize:12,fontWeight:700,color:'var(--or-d)',textDecoration:'none'}}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                              Voir le bien
                            </Link>
                          )}
                          <Link to={`/dashboard/locataire/locations/${loc.id}`} style={{display:'inline-flex',alignItems:'center',gap:5,padding:'6px 14px',borderRadius:9,background:'var(--gris-f)',border:'1px solid var(--gris-b)',fontFamily:'Poppins,sans-serif',fontSize:12,fontWeight:700,color:'var(--noir)',textDecoration:'none',transition:'all .2s'}}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--or-d)"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                            Voir demande
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>{/* END left column */}

            {/* Colonne Droite */}


            <div style={{display:'flex',flexDirection:'column',gap:22}}>
              {/* Points Widget */}
              <div className="points-widget">
                <div className="pw-glow"></div>
                <div style={{position:'relative',zIndex:2}}>
                  <div className="pw-label">{t('dashboard.loyalty_points', 'Points Fidélité Piolo')}</div>
                  <div className="pw-val">{points} <span>pts</span></div>
                  <div className="pw-sub">{t('dashboard.bronze_level', 'Niveau Bronze · Prochain : Argent (500 pts)')}</div>
                  <div className="pw-prog"><div className="pw-prog-fill" style={{width:`${ptsPct}%`}}></div></div>
                  <div className="pw-prog-info">
                    <span>0 pts</span><span className="hl">{points} / 500</span><span>500 pts</span>
                  </div>
                  <div className="pw-row">
                    <button className="pw-btn pw-btn-g">{t('dashboard.recharge_btn', 'Recharger')}</button>
                    <button className="pw-btn pw-btn-o">{t('dashboard.history_btn', 'Historique')}</button>
                  </div>
                </div>
              </div>

              {/* Profil Card */}
              <div className="card">
                <div className="profil-card">
                  <div className="pc-top">
                    <div className="pc-av">
                      {getMediaUrl(user?.avatar_url || user?.avatar) ? (
                        <img 
                          src={getMediaUrl(user.avatar_url || user.avatar)} 
                          alt="Avatar" 
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                          onError={e => { e.currentTarget.style.display = 'none'; }} 
                        />
                      ) : (
                        <>{user?.first_name?.[0]?.toUpperCase()||'L'}{user?.last_name?.[0]?.toUpperCase()||''}</>
                      )}
                    </div>
                    <div>
                      <div className="pc-name">{user?.first_name} {user?.last_name}</div>
                      <span className="pc-role-badge">{t('dashboard.verified_tenant', 'Locataire Vérifié')}</span>
                    </div>
                    <Link className="pc-edit" to="/dashboard/locataire/profil" title={t('dashboard.edit_profile_title', 'Modifier mon profil')}><svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></Link>
                  </div>
                  <div className="comp-label">{t('dashboard.profile_completed_pct', 'Profil complété à {{pct}}%', { pct: data?.profile_completion || 75 })}</div>
                  <div className="comp-bar"><div className="comp-fill" style={{width:`${data?.profile_completion||75}%`}}></div></div>
                </div>
                <div className="quick-menu">
                  <Link className="qm-item" to="/dashboard/locataire/favoris">
                    <div className="qm-ico i1"><svg viewBox="0 0 24 24"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/></svg></div>
                    <div className="qm-txt"><h5>Favoris</h5><p>{data?.saved_count||0} biens</p></div>
                  </Link>
                  <Link className="qm-item" to="/messages">
                    <div className="qm-ico i2"><svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg></div>
                    <div className="qm-txt"><h5>Messages</h5><p>{data?.unread_messages||0} non lus</p></div>
                    {(data?.unread_messages||0)>0 && <div className="qm-notif">{data.unread_messages}</div>}
                  </Link>
                  <Link className="qm-item" to="/dashboard/locataire/visites">
                    <div className="qm-ico i3"><svg viewBox="0 0 24 24"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg></div>
                    <div className="qm-txt"><h5>Visites</h5><p>{data?.upcoming_visits?.length||0} prévues</p></div>
                  </Link>
                  <Link className="qm-item" to="/dashboard/locataire/alertes">
                    <div className="qm-ico i4"><svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg></div>
                    <div className="qm-txt"><h5>Alertes</h5><p>{data?.search_alerts?.length||0} actives</p></div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          {/* ══════════════════════════════════════════
              AFFICHAGE STRICTEMENT MOBILE : 3 CARROUSELS HORIZONTAUX
          ══════════════════════════════════════════ */}
          <div className="locataire-mobile-sections">
            {/* Native Luxury App Header for Mobile */}
            <div className="locataire-app-header-mobile">
              <Link to="/profil" className="lah-user-info" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flex: 1, minWidth: 0 }} title={t('dashboard.my_profile', 'Mon Profil')}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: '2.5px solid #D4AF37',
                  boxShadow: '0 0 12px rgba(212,175,55,0.4)',
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
                    <span style={{ color: '#D4AF37', fontWeight: 800, fontSize: 16 }}>
                      {(user?.first_name?.[0] || 'P').toUpperCase()}
                    </span>
                  )}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="lah-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Bonjour, {user?.first_name || 'Locataire'}</div>
                  <div className="lah-role">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                    <span>{t('dashboard.verified_tenant', 'Locataire Vérifié')}</span>
                  </div>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setTenantSubscriptionOpen(true)}
                className="lah-points-badge"
                title={t('dashboard.my_loyalty_points', 'Découvrir nos offres et recharger des points')}
              >
                <i className="fas fa-crown"></i>
                <span>{points} pts</span>
              </button>
            </div>

            {/* ══════════════════════════════════════════
                1. HUB COMPACT D'ACTIVITÉ : DOSSIERS | VISITES | ALERTES
            ══════════════════════════════════════════ */}
            <div className="mobile-activity-hub">
              <div className="mobile-activity-header">
                <span className="mobile-activity-title">
                  <i className="fas fa-chart-line" style={{ color: '#D4AF37' }}></i> {t('dashboard.my_activity_tracking', "Mon Suivi d'Activité")}
                </span>
                {mobileActivityTab === 'alertes' && (
                  <button
                    onClick={() => setAlertModalOpen(true)}
                    style={{
                      background: 'none', border: 'none', color: '#92700C',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif'
                    }}
                  >
                    {t('dashboard.new_alert_btn', '+ Nouvelle alerte')}
                  </button>
                )}
              </div>

              {/* Segmented Control Tabs */}
              <div className="mobile-activity-tabs">
                <button
                  type="button"
                  className={`mobile-activity-tab ${mobileActivityTab === 'dossiers' ? 'active' : ''}`}
                  onClick={() => setMobileActivityTab('dossiers')}
                >
                  <i className="fas fa-folder-open"></i>
                  <span>{t('dashboard.tab_applications', 'Dossiers')}</span>
                  <span className="tab-badge">{data?.my_locations?.length || 0}</span>
                </button>
                <button
                  type="button"
                  className={`mobile-activity-tab ${mobileActivityTab === 'visites' ? 'active' : ''}`}
                  onClick={() => setMobileActivityTab('visites')}
                >
                  <i className="fas fa-calendar-check"></i>
                  <span>Visites</span>
                  <span className="tab-badge">{data?.my_visits?.length || 0}</span>
                </button>
                <button
                  type="button"
                  className={`mobile-activity-tab ${mobileActivityTab === 'alertes' ? 'active' : ''}`}
                  onClick={() => setMobileActivityTab('alertes')}
                >
                  <i className="fas fa-bell"></i>
                  <span>{t('dashboard.tab_alerts', 'Alertes')}</span>
                  <span className="tab-badge">{data?.search_alerts?.length || 0}</span>
                </button>
              </div>

              {/* Contenu Tab 1 : Dossiers */}
              {mobileActivityTab === 'dossiers' && (
                <div>
                  {loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[1, 2].map((n) => (
                        <div key={`sk-dos-${n}`} className="mobile-strip-item" style={{ background: 'var(--blanc, #fff)', opacity: 0.85 }}>
                          <Sk w={44} h={44} r={10} style={{ flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Sk w="70%" h={14} r={4} style={{ marginBottom: 6 }} />
                            <Sk w="45%" h={11} r={4} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!loading && (!data?.my_locations || data.my_locations.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '14px 0', fontSize: 13, color: 'var(--gris-m)' }}>
                      Aucun dossier de location en cours.
                      <Link to="/properties" style={{ display: 'block', color: 'var(--or-d)', fontWeight: 700, marginTop: 4 }}>
                        {t('dashboard.find_property', 'Trouver un bien →')}
                      </Link>
                    </div>
                  )}
                  {!loading && (data?.my_locations || []).slice(0, 2).map((loc) => (
                    <Link key={loc.id} to={`/dashboard/locataire/locations/${loc.id}`} className="mobile-strip-item">
                      {loc.property?.main_image ? (
                        <img src={getMediaUrl(loc.property.main_image)} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--gris-f, #EAE5D9)', display: 'grid', placeItems: 'center', flexShrink: 0, color: 'var(--or-d, #92700C)' }}>
                          <i className="fas fa-home" style={{ fontSize: 16 }}></i>
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--noir, #1A1A1A)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {loc.property?.title || t('dashboard.rental_application', 'Dossier de location')}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--gris-m)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          {loc.status === 'ACCEPTED' && <span style={{ color: '#059669', fontWeight: 700 }}>{t('dashboard.status_accepted', 'Accepté')}</span>}
                          {loc.status === 'PENDING' && <span style={{ color: '#D97706', fontWeight: 700 }}>{t('dashboard.status_pending', 'En attente')}</span>}
                          {loc.status === 'REFUSED' && <span style={{ color: '#DC2626', fontWeight: 700 }}>{t('dashboard.status_refused', 'Refusé')}</span>}
                          {loc.status === 'REVIEWING' && <span style={{ color: '#2563EB', fontWeight: 700 }}>{t('dashboard.status_reviewing', 'En examen')}</span>}
                          <span>{t('dashboard.pct_completed', '· {{pct}}% complété', { pct: loc.dossier_completion ?? 100 })}</span>
                        </div>
                      </div>
                      <i className="fas fa-chevron-right" style={{ color: '#B5942D', fontSize: 12, marginLeft: 'auto' }}></i>
                    </Link>
                  ))}
                  {(data?.my_locations || []).length > 2 && (
                    <Link to="/dashboard/locataire/locations" style={{ display: 'block', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--or-d)', marginTop: 8 }}>
                      Voir tous les dossiers ({data.my_locations.length}) →
                    </Link>
                  )}
                </div>
              )}

              {/* Contenu Tab 2 : Visites */}
              {mobileActivityTab === 'visites' && (
                <div>
                  {loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[1, 2].map((n) => (
                        <div key={`sk-vis-${n}`} className="mobile-strip-item" style={{ background: 'var(--blanc, #fff)', opacity: 0.85 }}>
                          <Sk w={44} h={44} r={10} style={{ flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Sk w="70%" h={14} r={4} style={{ marginBottom: 6 }} />
                            <Sk w="45%" h={11} r={4} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!loading && (!data?.my_visits || data.my_visits.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '14px 0', fontSize: 13, color: 'var(--gris-m)' }}>
                      Aucune visite programmée.
                      <Link to="/properties" style={{ display: 'block', color: 'var(--or-d)', fontWeight: 700, marginTop: 4 }}>
                        {t('dashboard.schedule_visit', 'Planifier une visite →')}
                      </Link>
                    </div>
                  )}
                  {!loading && (data?.my_visits || []).slice(0, 2).map((visit) => (
                    <div key={visit.id} style={{ marginBottom: 8 }}>
                      <Link to={`/dashboard/locataire/visites/${visit.id}`} className="mobile-strip-item" style={{ marginBottom: visit.status === 'CONFIRMED' ? 4 : 0 }}>
                        {visit.property?.main_image ? (
                          <img src={getMediaUrl(visit.property.main_image)} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--gris-f, #EAE5D9)', display: 'grid', placeItems: 'center', flexShrink: 0, color: 'var(--or-d, #92700C)' }}>
                            <i className="fas fa-calendar" style={{ fontSize: 16 }}></i>
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--noir, #1A1A1A)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {visit.property?.title || t('dashboard.property_visit', 'Visite bien immobilier')}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--gris-m)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            {visit.status === 'CONFIRMED' && <span style={{ color: '#059669', fontWeight: 700 }}>✓ {t('dashboard.status_confirmed', 'Confirmée')}</span>}
                            {visit.status === 'PENDING' && <span style={{ color: '#D97706', fontWeight: 700 }}>⏳ {t('dashboard.status_pending', 'En attente')}</span>}
                            {visit.status === 'REFUSED' && <span style={{ color: '#DC2626', fontWeight: 700 }}>✕ {t('dashboard.status_refused', 'Refusée')}</span>}
                            <span>· {visit.confirmed_date || visit.requested_date || 'Bientôt'}</span>
                          </div>
                        </div>
                        <i className="fas fa-chevron-right" style={{ color: '#B5942D', fontSize: 12, marginLeft: 'auto' }}></i>
                      </Link>

                      {/* Bouton direct Messagerie interne Piolo si la visite est confirmée */}
                      {visit.status === 'CONFIRMED' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 4, marginTop: 2 }}>
                          <Link
                            to="/messages"
                            className="mobile-msg-action-btn"
                          >
                            <i className="fas fa-comment-dots" style={{ fontSize: 13 }}></i> {t('dashboard.write_to_landlord', 'Écrire au bailleur')}
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                  {(data?.my_visits || []).length > 2 && (
                    <Link to="/dashboard/locataire/visites" style={{ display: 'block', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--or-d)', marginTop: 8 }}>
                      Voir toutes les visites ({data.my_visits.length}) →
                    </Link>
                  )}
                </div>
              )}

              {/* Contenu Tab 3 : Alertes */}
              {mobileActivityTab === 'alertes' && (
                <div>
                  {loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[1, 2].map((n) => (
                        <div key={`sk-alt-${n}`} className="mobile-strip-item" style={{ background: 'var(--blanc, #fff)', opacity: 0.85 }}>
                          <Sk w={44} h={44} r={10} style={{ flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Sk w="70%" h={14} r={4} style={{ marginBottom: 6 }} />
                            <Sk w="45%" h={11} r={4} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!loading && (!data?.search_alerts || data.search_alerts.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '14px 0', fontSize: 13, color: 'var(--gris-m)' }}>
                      Aucune alerte configurée.
                      <button onClick={() => setAlertModalOpen(true)} style={{ display: 'block', margin: '4px auto 0', background: 'none', border: 'none', color: 'var(--or-d)', fontWeight: 700, cursor: 'pointer' }}>
                        {t('dashboard.create_an_alert', 'Créer une alerte →')}
                      </button>
                    </div>
                  )}
                  {!loading && (data?.search_alerts || []).slice(0, 2).map((alert) => (
                    <Link key={alert.id} to={`/dashboard/locataire/alertes?alert=${alert.id}`} className="mobile-strip-item">
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(212,175,55,0.18)', display: 'grid', placeItems: 'center', flexShrink: 0, color: 'var(--or-d, #92700C)' }}>
                        <i className="fas fa-bell" style={{ fontSize: 16 }}></i>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--noir, #1A1A1A)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {alert.title}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--gris-m)', marginTop: 2 }}>
                          {alert.city || t('dashboard.all_cities', 'Toutes les villes')}{alert.neighborhood ? `, ${alert.neighborhood}` : ''}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#92700C', background: 'rgba(212,175,55,0.18)', padding: '3px 8px', borderRadius: 8 }}>
                        {alert.matches_count ?? 0} biens
                      </span>
                    </Link>
                  ))}
                  {(data?.search_alerts || []).length > 2 && (
                    <Link to="/dashboard/locataire/alertes" style={{ display: 'block', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--or-d)', marginTop: 8 }}>
                      {t('dashboard.manage_all_alerts', 'Gérer toutes mes alertes →')}
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* ══════════════════════════════════════════
                2. BARRE DE FILTRE & RECHERCHE RAPIDE (JUSTE APRÈS SUIVI D'ACTIVITÉ)
            ══════════════════════════════════════════ */}
            <div className="mobile-search-trigger-bar" style={{ display: 'block', marginBottom: 24 }}>
              <div className="mobile-search-trigger-box">
                <i className="fas fa-search" style={{ color: '#D4AF37', fontSize: 16 }}></i>
                <input
                  type="text"
                  value={propertySearch.neighborhood}
                  onChange={(e) => setPropertySearch(f => ({ ...f, neighborhood: e.target.value }))}
                  placeholder={t('dashboard.search_location_placeholder', 'Ville, quartier (ex: Bastos, Akwa)…')}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: 15,
                    color: 'inherit',
                    background: 'transparent'
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitPropertySearch(e); }}
                />
                <button
                  type="button"
                  onClick={() => setSearchSheetOpen(true)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 12,
                    background: 'rgba(212,175,55,0.12)',
                    border: '1px solid rgba(212,175,55,0.3)',
                    color: '#92700C',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5
                  }}
                >
                  <i className="fas fa-sliders-h"></i> Filtres
                </button>
                <button
                  type="button"
                  onClick={submitPropertySearch}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #D4AF37, #F6D365)',
                    border: 'none',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    cursor: 'pointer'
                  }}
                >
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>

            {/* SKELETON LOADERS MOBILES (Pendant le chargement) */}
            {loading ? (
              <>
                <div style={{ marginBottom: 26 }}>
                  <div className="horizontal-sec-header">
                    <div>
                      <Sk w={130} h={18} r={6} style={{ marginBottom: 6 }} />
                      <Sk w={190} h={22} r={6} style={{ marginBottom: 4 }} />
                      <Sk w={220} h={13} r={6} />
                    </div>
                  </div>
                  <div className="horizontal-properties-carousel">
                    {[1, 2, 3].map((n) => (
                      <div key={`sk-car-1-${n}`} className="horizontal-carousel-item">
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
                </div>

                <div style={{ marginBottom: 26 }}>
                  <div className="horizontal-sec-header">
                    <div>
                      <Sk w={120} h={18} r={6} style={{ marginBottom: 6 }} />
                      <Sk w={180} h={22} r={6} style={{ marginBottom: 4 }} />
                      <Sk w={240} h={13} r={6} />
                    </div>
                  </div>
                  <div className="horizontal-properties-carousel">
                    {[1, 2, 3].map((n) => (
                      <div key={`sk-car-2-${n}`} className="horizontal-carousel-item">
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
                </div>
              </>
            ) : (
              <>
                {/* 0. Logements Vedettes (Horizontal - Strictement Boostés / À la Une, affiché UNIQUEMENT si au moins 1) */}
                {featuredProperties.length > 0 && (
                  <div style={{ marginBottom: 26 }}>
                    <div className="horizontal-sec-header">
                      <div>
                        <span className="horizontal-sec-badge" style={{
                          background: 'linear-gradient(135deg, rgba(15, 13, 9, 0.95), rgba(42, 36, 24, 0.95))',
                          color: '#F6D365',
                          border: '1.5px solid #D4AF37',
                          boxShadow: '0 2px 10px rgba(212, 175, 55, 0.25)',
                          padding: '4px 9px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5
                        }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="#FFD700"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          {t('dashboard.featured_badge', 'À la Une · Vedettes')}
                        </span>
                        <h2 className="horizontal-sec-title">{t('dashboard.featured_properties', 'Logements Vedettes')}</h2>
                        <p className="horizontal-sec-sub">{t('dashboard.featured_properties_sub', "Sélection d'exception et biens mis en avant")}</p>
                      </div>
                      <Link to="/properties" className="horizontal-sec-link" style={{ color: '#B8860B', fontWeight: 800 }}>
                        Voir tous ({featuredProperties.length}) →
                      </Link>
                    </div>

                    <div ref={featuredCarouselRef} className="horizontal-properties-carousel">
                      {featuredProperties.map((prop) => (
                        <div key={`mob-feat-${prop.id}`} className="horizontal-carousel-item">
                          <PropertyCard
                            property={prop}
                            onFavChange={(id, fav) => togglePropertyFavorite(null, { id, is_favorite: !fav })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 1. Logements à Louer (Horizontal) */}
                {rentalProperties.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <div className="horizontal-sec-header">
                      <div>
                        <span className="horizontal-sec-badge" style={{ background: 'rgba(212,175,55,0.14)', color: '#A8891C' }}>
                          <i className="fas fa-key"></i> {t('dashboard.long_term', 'Long terme')}
                        </span>
                        <h2 className="horizontal-sec-title">{t('dashboard.properties_for_rent', 'Logements à Louer')}</h2>
                        <p className="horizontal-sec-sub">{t('dashboard.properties_for_rent_sub', "Studios, appartements et villas d'exception")}</p>
                      </div>
                      <Link to="/properties?transaction=LOCATION" className="horizontal-sec-link">
                        Voir tous ({rentalProperties.length}) →
                      </Link>
                    </div>

                    <div ref={rentalCarouselRef} className="horizontal-properties-carousel">
                      {rentalProperties.map((prop) => (
                        <div key={`mob-rent-${prop.id}`} className="horizontal-carousel-item">
                          <PropertyCard
                            property={prop}
                            onFavChange={(id, fav) => togglePropertyFavorite(null, { id, is_favorite: !fav })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Biens à Vendre (Horizontal) */}
                {saleProperties.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <div className="horizontal-sec-header">
                      <div>
                        <span className="horizontal-sec-badge" style={{ background: 'rgba(16,185,129,0.14)', color: '#059669' }}>
                          <i className="fas fa-tag"></i> {t('dashboard.investment_buy', 'Investissement & Achat')}
                        </span>
                        <h2 className="horizontal-sec-title">{t('dashboard.properties_for_sale', 'Biens à Vendre')}</h2>
                        <p className="horizontal-sec-sub">{t('dashboard.properties_for_sale_sub', "Duplex, villas de maître et propriétés titrées")}</p>
                      </div>
                      <Link to="/properties?transaction=VENTE" className="horizontal-sec-link">
                        Voir tous ({saleProperties.length}) →
                      </Link>
                    </div>

                    <div ref={saleCarouselRef} className="horizontal-properties-carousel">
                      {saleProperties.map((prop) => (
                        <div key={`mob-sale-${prop.id}`} className="horizontal-carousel-item">
                          <PropertyCard
                            property={prop}
                            onFavChange={(id, fav) => togglePropertyFavorite(null, { id, is_favorite: !fav })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Courts Séjours & Meublés (Horizontal - Strictement Court Terme) */}
                {shortTermProperties.length > 0 && (
                  <div style={{ marginBottom: 28 }}>
                    <div className="horizontal-sec-header">
                      <div>
                        <span className="horizontal-sec-badge" style={{ background: 'rgba(5,150,105,0.14)', color: '#059669' }}>
                          <i className="fas fa-suitcase-rolling"></i> {t('dashboard.vacation_business', 'Vacances & Affaires')}
                        </span>
                        <h2 className="horizontal-sec-title">{t('dashboard.short_term_furnished', 'Courts Séjours & Meublés')}</h2>
                        <p className="horizontal-sec-sub">{t('dashboard.short_term_furnished_sub', "Résidences prêtes à vivre tout confort")}</p>
                      </div>
                      <Link to="/properties?transaction=COURTE_DUREE" className="horizontal-sec-link">
                        Voir tous ({shortTermProperties.length}) →
                      </Link>
                    </div>

                    <div ref={shortTermCarouselRef} className="horizontal-properties-carousel">
                      {shortTermProperties.map((prop) => (
                        <div key={`mob-short-${prop.id}`} className="horizontal-carousel-item">
                          <PropertyCard
                            property={prop}
                            onFavChange={(id, fav) => togglePropertyFavorite(null, { id, is_favorite: !fav })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ══════════════════════════════════════════
              AFFICHAGE STRICTEMENT DESKTOP (WEB) : RECHERCHE + GRILLE COMPLÈTE
          ══════════════════════════════════════════ */}
          <div className="locataire-desktop-sections">
            <div className="sec-hd" style={{ marginTop: 20, marginBottom: 14 }}>
              <div>
                <div className="sec-label">{t('dashboard.recommendations', 'Recommandations')}</div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Poppins, sans-serif', color: 'var(--noir)', margin: 0 }}>
                  {loading ? (
                    <Sk w={220} h={28} />
                  ) : (
                    <>{filteredProperties.length} annonces <span style={{ color: 'var(--or)' }}>trouvées</span></>
                  )}
                </h2>
              </div>
              <Link className="see-all" to="/properties">Voir tous →</Link>
            </div>

            <div className="search-form-desktop" style={{
              borderRadius: 20,
              padding: '24px 28px',
              marginBottom: 24,
            }}>
              <form onSubmit={submitPropertySearch} style={{ display: 'grid', gap: 16 }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 16
                }}>
                  {/* Ville */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gris-m)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7, fontFamily: 'Poppins, sans-serif' }}>
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="#A8891C"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                      Ville
                    </label>
                    <select name="city" value={propertySearch.city} onChange={(e)=>setPropertySearch({...propertySearch,city:e.target.value})} style={{ width: '100%', border: '1.5px solid var(--gris-b)', borderRadius: 12, padding: '11px 14px', fontSize: 14, outline: 'none', background: 'var(--gris-f)', color: 'var(--noir)', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, transition: 'all 0.2s' }}>
                      <option value="">Toutes les villes</option>
                      <option value="Yaoundé">Yaoundé</option>
                      <option value="Douala">Douala</option>
                      <option value="Bafoussam">Bafoussam</option>
                      <option value="Garoua">Garoua</option>
                      <option value="Maroua">Maroua</option>
                      <option value="Kribi">Kribi</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

                  {/* Quartier */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gris-m)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7, fontFamily: 'Poppins, sans-serif' }}>
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="#A8891C"><path d="M15 11V5l-3-3-3 3v6H3v10h18V11h-6zm-4-7.17l1.17-1.17 1.17 1.17V11h-2.34V3.83zM5 13h4v2H5v-2zm0 4h4v2H5v-2zm14 2h-4v-2h4v2zm0-4h-4v-2h4v2z"/></svg>
                      Quartier
                    </label>
                    <input type="text" name="neighborhood" value={propertySearch.neighborhood} onChange={(e)=>setPropertySearch({...propertySearch,neighborhood:e.target.value})} placeholder={t('dashboard.neighborhood_placeholder', 'Ex: Bastos, Bonapriso…')} style={{ width: '100%', border: '1.5px solid var(--gris-b)', borderRadius: 12, padding: '11px 14px', fontSize: 14, outline: 'none', background: 'var(--gris-f)', color: 'var(--noir)', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, transition: 'all 0.2s' }} />
                  </div>

                  {/* Type de bien */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gris-m)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7, fontFamily: 'Poppins, sans-serif' }}>
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="#A8891C"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                      Type de bien
                    </label>
                    <select name="type" value={propertySearch.type} onChange={(e)=>setPropertySearch({...propertySearch,type:e.target.value})} style={{ width: '100%', border: '1.5px solid var(--gris-b)', borderRadius: 12, padding: '11px 14px', fontSize: 14, outline: 'none', background: 'var(--gris-f)', color: 'var(--noir)', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, transition: 'all 0.2s' }}>
                      <option value="">Tous les types</option>
                      <option value="APPARTEMENT">Appartement</option>
                      <option value="VILLA">Villa</option>
                      <option value="STUDIO">Studio</option>
                      <option value="BUREAU">Bureau</option>
                      <option value="BOUTIQUE">Boutique</option>
                      <option value="IMMEUBLE">Immeuble</option>
                      <option value="TERRAIN">Terrain</option>
                    </select>
                  </div>

                  {/* Loyer Min */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gris-m)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7, fontFamily: 'Poppins, sans-serif' }}>
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="#A8891C"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
                      Loyer min (FCFA)
                    </label>
                    <input type="number" min="0" name="min_price" value={propertySearch.min_price} onChange={(e)=>setPropertySearch({...propertySearch,min_price:e.target.value})} placeholder="Ex: 50 000" style={{ width: '100%', border: '1.5px solid var(--gris-b)', borderRadius: 12, padding: '11px 14px', fontSize: 14, outline: 'none', background: 'var(--gris-f)', color: 'var(--noir)', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, transition: 'all 0.2s' }} />
                  </div>

                  {/* Loyer Max */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gris-m)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7, fontFamily: 'Poppins, sans-serif' }}>
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="#A8891C"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
                      Loyer max (FCFA)
                    </label>
                    <input type="number" min="0" name="max_price" value={propertySearch.max_price} onChange={(e)=>setPropertySearch({...propertySearch,max_price:e.target.value})} placeholder="Ex: 250 000" style={{ width: '100%', border: '1.5px solid var(--gris-b)', borderRadius: 12, padding: '11px 14px', fontSize: 14, outline: 'none', background: 'var(--gris-f)', color: 'var(--noir)', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, transition: 'all 0.2s' }} />
                  </div>

                  {/* Transaction */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gris-m)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7, fontFamily: 'Poppins, sans-serif' }}>
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="#A8891C"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>
                      Transaction
                    </label>
                    <select name="transaction" value={propertySearch.transaction} onChange={(e)=>setPropertySearch({...propertySearch,transaction:e.target.value})} style={{ width: '100%', border: '1.5px solid var(--gris-b)', borderRadius: 12, padding: '11px 14px', fontSize: 14, outline: 'none', background: 'var(--gris-f)', color: 'var(--noir)', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, transition: 'all 0.2s' }}>
                      <option value="">Toutes les transactions</option>
                      <option value="LOCATION">Location</option>
                      <option value="VENTE">Vente</option>
                    </select>
                  </div>
                </div>

                {/* Bouton de recherche principal */}
                <button type="submit" style={{
                  marginTop: 6,
                  padding: '13px 24px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #D4AF37 0%, #F6D365 100%)',
                  border: 'none',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#0F0D09',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(212,175,55,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 9,
                  transition: 'transform 0.15s ease, boxShadow 0.15s ease'
                }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  {t('dashboard.search_matching_properties', 'Rechercher les biens correspondants')}
                </button>
              </form>
            </div>

            {/* FILTRES CHIPS */}
            <div className="filter-chips">
              <span className={`fchip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>{t('dashboard.filter_all', 'Tous')}</span>
              <span className={`fchip ${filter === 'louer' ? 'active' : ''}`} onClick={() => setFilter('louer')}>{t('dashboard.filter_for_rent', 'À louer')}</span>
              <span className={`fchip ${filter === 'vendre' ? 'active' : ''}`} onClick={() => setFilter('vendre')}>{t('dashboard.filter_for_sale', 'À vendre')}</span>
              <span className={`fchip ${filter === 'appartement' ? 'active' : ''}`} onClick={() => setFilter('appartement')}>{t('dashboard.filter_apartments', 'Appartements')}</span>
              <span className={`fchip ${filter === 'villa' ? 'active' : ''}`} onClick={() => setFilter('villa')}>{t('dashboard.filter_villas', 'Villas')}</span>
              <span className={`fchip ${filter === 'studio' ? 'active' : ''}`} onClick={() => setFilter('studio')}>{t('dashboard.filter_studios', 'Studios')}</span>
            </div>

            {/* ANNONCES / PROPRIÉTÉS GRID */}
            {loading ? (
              <div className="props-grid">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={`sk-grid-${n}`} style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--gris-b)', overflow: 'hidden' }}>
                    <Sk w="100%" h={210} r={0} />
                    <div style={{ padding: 18 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <Sk w="35%" h={14} r={6} />
                        <Sk w="25%" h={14} r={6} />
                      </div>
                      <Sk w="80%" h={18} r={6} style={{ marginBottom: 8 }} />
                      <Sk w="55%" h={14} r={6} style={{ marginBottom: 14 }} />
                      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                        <Sk w="30%" h={22} r={8} />
                        <Sk w="30%" h={22} r={8} />
                        <Sk w="30%" h={22} r={8} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--gris-f)' }}>
                        <Sk w="45%" h={22} r={6} />
                        <Sk w="30%" h={32} r={10} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProperties.length > 0 ? (
              <>
                <div className="props-grid">
                  {paginatedProperties.map((prop) => (
                    <PropertyCard
                      key={prop.id}
                      property={prop}
                      onFavChange={(id, fav) => togglePropertyFavorite(null, { id, is_favorite: !fav })}
                    />
                  ))}
                </div>

                {/* COMPTEUR & PAGINATION */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', marginTop: '24px', marginBottom: '36px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gris)', fontFamily: 'Poppins, sans-serif' }}>
                    Affichage de <strong style={{ color: 'var(--noir)' }}>{paginatedProperties.length}</strong> sur <strong style={{ color: 'var(--noir)' }}>{filteredProperties.length}</strong> annonces disponibles
                  </div>

                  {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        style={{
                          width: '36px', height: '36px', borderRadius: '50%', background: 'var(--blanc)',
                          border: '1px solid var(--gris-b)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--noir)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1,
                          fontWeight: '700'
                        }}
                      >
                        &laquo;
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: currentPage === page ? 'var(--or)' : 'var(--blanc)',
                            color: currentPage === page ? '#fff' : 'var(--noir)',
                            border: currentPage === page ? 'none' : '1px solid var(--gris-b)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'Poppins, sans-serif', fontWeight: '700', cursor: 'pointer',
                            boxShadow: currentPage === page ? '0 4px 10px rgba(212,175,55,0.35)' : 'none'
                          }}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        style={{
                          width: '36px', height: '36px', borderRadius: '50%', background: 'var(--blanc)',
                          border: '1px solid var(--gris-b)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--noir)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1,
                          fontWeight: '700'
                        }}
                      >
                        &raquo;
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{textAlign:'center',padding:48,background:'var(--blanc)',borderRadius:'var(--radius-lg)',border:'1px solid var(--gris-b)',marginBottom:32}}>
                <svg width="52" height="52" fill="var(--gris-b)" viewBox="0 0 24 24" style={{margin:'0 auto 14px',display:'block'}}><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                <p style={{fontFamily:'Poppins,sans-serif',fontWeight:700,fontSize:16,color:'var(--gris)',marginBottom:10}}>Aucun bien disponible pour le moment</p>
                <Link to="/properties" style={{color:'var(--or-d)',fontWeight:600,fontFamily:'Poppins,sans-serif',fontSize:15}}>Explorer toutes les annonces →</Link>
              </div>
            )}
          </div>

          {/* BONUS FIDÉLITÉ */}
          <div className="sec-hd">
            <div>
              <div className="sec-label">{t('dashboard.loyalty_program', 'Programme Fidélité')}</div>
              <div className="sec-title">{t('dashboard.earn_part1', 'Gagnez des')} <span>{t('dashboard.earn_part2', 'Points')}</span></div>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:40}}>
            {[
              {val:'+20 pts',lbl:t('dashboard.per_referral', 'Par parrainage'),svg:<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>},
              {val:'+5 pts',lbl:t('dashboard.after_rental', 'Après une location'),svg:<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>},
              {val:'+10 pts',lbl:t('dashboard.completed_profile', 'Profil complété'),svg:<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>},
            ].map((b,i)=>(
              <div key={i} className="kpi-card c-or" style={{cursor:'default'}}>
                <div className="kpi-top"><div className="kpi-ico bg-or"><svg viewBox="0 0 24 24">{b.svg}</svg></div></div>
                <div className="kpi-val" style={{fontSize:22}}>{b.val}</div>
                <div className="kpi-lbl">{b.lbl}</div>
              </div>
            ))}
          </div>

          {/* ═══════════════════════════════════════
              SECTION PROFESSIONNELS CERTIFIÉS (AU FOND DE LA PAGE)
          ═══════════════════════════════════════ */}
          <div className="pro-btp-section-container" id="architects">
            <style>{`
              .pro-btp-section-container {
                margin-top: 34px;
                margin-bottom: 40px;
              }
              .pro-btp-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                flex-wrap: wrap;
                gap: 12px;
              }
              .pro-btp-header-actions {
                display: flex;
                align-items: center;
                gap: 10px;
                flex-wrap: wrap;
              }
              .pro-btp-vitrine-box {
                margin-bottom: 26px;
                background: var(--blanc);
                padding: 18px 20px;
                border-radius: 18px;
                border: 1px solid var(--gris-b);
                box-shadow: 0 4px 14px rgba(0,0,0,0.03);
              }
              .pro-btp-projects-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                gap: 12px;
              }
              .pro-btp-project-card {
                background: var(--gris-f);
                border-radius: 14px;
                overflow: hidden;
                border: 1px solid var(--gris-b);
                cursor: pointer;
                display: flex;
                flex-direction: column;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
              }
              .pro-btp-project-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(0,0,0,0.06);
              }
              .pro-btp-pros-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
              }
              .pro-btp-pro-card {
                background: var(--blanc);
                border-radius: 18px;
                overflow: hidden;
                border: 1px solid var(--gris-b);
                box-shadow: 0 4px 14px rgba(0,0,0,0.03);
                display: flex;
                flex-direction: column;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
              }
              .pro-btp-pro-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 22px rgba(212,175,55,0.12);
              }
              html.dark .pro-btp-vitrine-box {
                background: var(--blanc) !important;
                border-color: var(--gris-b) !important;
              }
              html.dark .pro-btp-project-card {
                background: var(--gris-f) !important;
                border-color: var(--gris-b) !important;
              }
              html.dark .pro-btp-pro-card {
                background: var(--blanc) !important;
                border-color: var(--gris-b) !important;
              }
              .pro-mobile-swipe-hint {
                display: none;
              }

              /* ── Adaptation Mobile Premium (<= 768px) ── */
              @media (max-width: 768px) {
                .pro-btp-section-container {
                  margin-top: 24px;
                  margin-bottom: 28px;
                }
                .pro-btp-header {
                  flex-direction: column !important;
                  align-items: flex-start !important;
                  gap: 10px !important;
                }
                .pro-btp-header-actions {
                  width: 100%;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  gap: 8px;
                }
                .pro-btp-btn-calc {
                  flex: 1;
                  justify-content: center;
                  padding: 8px 12px !important;
                  font-size: 11.5px !important;
                }
                .pro-btp-see-all {
                  font-size: 12px !important;
                  white-space: nowrap;
                }
                .pro-btp-vitrine-box {
                  padding: 14px 14px !important;
                  border-radius: 16px !important;
                  margin-bottom: 20px !important;
                }
                .pro-mobile-swipe-hint {
                  display: inline-flex !important;
                  align-items: center;
                  gap: 4px;
                  font-size: 10.5px;
                  color: #D4AF37;
                  font-weight: 700;
                }
                /* Défilement horizontal fluide sur mobile pour les projets */
                .pro-btp-projects-grid {
                  display: flex !important;
                  overflow-x: auto !important;
                  scroll-snap-type: x mandatory;
                  -webkit-overflow-scrolling: touch;
                  gap: 12px !important;
                  padding-bottom: 6px;
                  margin: 0 -2px;
                  scrollbar-width: none;
                }
                .pro-btp-projects-grid::-webkit-scrollbar {
                  display: none;
                }
                .pro-btp-project-card {
                  min-width: 220px !important;
                  max-width: 240px !important;
                  flex: 0 0 auto !important;
                  scroll-snap-align: start;
                  border-radius: 14px !important;
                }
                /* Défilement horizontal fluide sur mobile pour les artisans */
                .pro-btp-pros-grid {
                  display: flex !important;
                  overflow-x: auto !important;
                  scroll-snap-type: x mandatory;
                  -webkit-overflow-scrolling: touch;
                  gap: 14px !important;
                  padding-bottom: 10px;
                  margin: 0 -2px;
                  scrollbar-width: none;
                }
                .pro-btp-pros-grid::-webkit-scrollbar {
                  display: none;
                }
                .pro-btp-pro-card {
                  min-width: 280px !important;
                  max-width: 305px !important;
                  flex: 0 0 auto !important;
                  scroll-snap-align: start;
                  border-radius: 18px !important;
                }
              }
            `}</style>

            <div className="sec-hd pro-btp-header">
              <div>
                <div className="sec-label">{t('dashboard.certified_pros', 'Professionnels Certifiés')}</div>
                <div className="sec-title">{t('dashboard.pros_title_part1', 'Architectes, BTP & ')}<span>{t('dashboard.pros_title_part2', 'Mobilier sur-mesure')}</span></div>
              </div>
              <div className="pro-btp-header-actions">
                <button
                  className="pro-btp-btn-calc"
                  onClick={() => setCalculatorOpen(true)}
                  style={{
                    background: 'linear-gradient(135deg, #0F0D09 0%, #1E1A12 100%)',
                    color: '#F6D365',
                    border: '1px solid rgba(212,175,55,0.4)',
                    padding: '7px 14px',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 3px 10px rgba(0,0,0,0.1)'
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                  <span>{t('dashboard.budget_calc_btn', 'Calculateur Budget Express')}</span>
                </button>
                <Link className="see-all pro-btp-see-all" to="/architectes">{t('dashboard.see_directory', 'Voir l’annuaire →')}</Link>
              </div>
            </div>

            {/* VITRINE DES DERNIERS CHANTIERS PUBLIÉS EN TEMPS RÉEL */}
            {(() => {
              const allProjects = proProjectsList;
              if (!allProjects || allProjects.length === 0) return null;

              return (
                <div className="pro-btp-vitrine-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--noir)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="#D4AF37"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
                      <span>{t('dashboard.latest_showcase_projects', 'Derniers Chantiers en Vitrine')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="pro-mobile-swipe-hint">{t('dashboard.swipe_hint', 'Glisser ➔')}</span>
                      <Link to="/architectes" style={{ fontSize: 11.5, color: '#AA820A', fontWeight: 700, textDecoration: 'none' }}>
                        Voir tout ({allProjects.length}) →
                      </Link>
                    </div>
                  </div>

                  <div ref={proProjectsRailRef} className="pro-btp-projects-grid">
                    {allProjects.slice(0, 6).map((p, pIdx) => (
                      <div
                        key={pIdx}
                        className="pro-btp-project-card"
                        onClick={() => setSelectedProjectModal(p)}
                      >
                        <div style={{ position: 'relative', height: 125 }}>
                          <img
                            src={getMediaUrl(p.main_image_display || p.main_image_url || p.image, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80')}
                            alt={p.title}
                            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'; }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          {(p.before_image_display || p.before_image_url || p.beforeImage) && (
                            <div style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(15,13,9,0.88)', backdropFilter: 'blur(4px)', color: '#F6D365', padding: '2px 7px', borderRadius: 6, fontSize: 9.5, fontWeight: 800, border: '1px solid rgba(212,175,55,0.4)' }}>
                              {t('dashboard.before_after', 'Avant / Après')}
                            </div>
                          )}
                          <div style={{ position: 'absolute', bottom: 6, left: 6, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)', color: '#FFF', padding: '2px 7px', borderRadius: 5, fontSize: 10, fontWeight: 700 }}>
                            {p.city || 'Cameroun'}
                          </div>
                        </div>
                        <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontSize: 10, color: '#AA820A', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{p.category}</div>
                            <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--noir)', lineHeight: 1.3, marginTop: 2 }}>{p.title}</div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 6, borderTop: '1px solid var(--gris-b)', fontSize: 10.5, color: 'var(--gris)' }}>
                            <span>Par <strong>{p.author?.name || 'Artisan Piolo'}</strong></span>
                            <span style={{ color: '#D4AF37', fontWeight: 700 }}>{t('dashboard.details_arrow', 'Détails →')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* CARTES DES ARTISANS & PROFESSIONNELS CERTIFIÉS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--noir)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#D4AF37"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                <span>{t('dashboard.recommended_artisans', 'Artisans Recommandés')}</span>
              </div>
              <span className="pro-mobile-swipe-hint">{t('dashboard.swipe_hint', 'Glisser ➔')}</span>
            </div>

            <div ref={proListRailRef} className="pro-btp-pros-grid">
              {prosList.map((pro) => (
                <div
                  key={pro.id}
                  className="pro-btp-pro-card"
                >
                  {/* En-tête photo & badge certifié */}
                  <div style={{ position: 'relative', height: 125, background: '#1A160F' }}>
                    <img
                      src={getMediaUrl(pro.cover, 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80')}
                      alt={pro.name}
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80'; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)' }} />
                    <div style={{ position: 'absolute', top: 10, right: 10, background: '#D4AF37', color: '#0F0D09', padding: '3px 8px', borderRadius: 10, fontSize: 10.5, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4, zIndex: 2 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                      <span>{t('dashboard.piolo_certified', 'Certifié Piolo')}</span>
                    </div>
                    <div style={{ position: 'absolute', bottom: -22, left: 16, width: 52, height: 52, borderRadius: '50%', background: pro.avatarBg || 'linear-gradient(135deg, #D4AF37, #AA820A)', color: '#FFF', fontWeight: 800, fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--blanc)', boxShadow: '0 4px 12px rgba(0,0,0,0.18)', overflow: 'hidden', zIndex: 5 }}>
                      {pro.avatarUrl ? (
                        <img
                          src={getMediaUrl(pro.avatarUrl)}
                          alt={pro.name}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span>{pro.initials || pro.name?.[0] || 'P'}</span>
                      )}
                    </div>
                  </div>

                  {/* Corps */}
                  <div style={{ padding: '28px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: pro.availColor, fontWeight: 700, marginBottom: 3 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: pro.availColor }} />
                      <span>{pro.availText}</span>
                    </div>

                    <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 16, color: 'var(--noir)' }}>
                      {pro.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gris)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#D4AF37"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                      <span>{pro.city}</span>
                    </div>

                    <div style={{ fontSize: 12.5, color: 'var(--gris)', marginTop: 5, fontWeight: 600 }}>
                      {pro.specialty}
                    </div>

                    {/* Étoiles */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 7, fontSize: 12 }}>
                      <span style={{ color: '#D4AF37', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#D4AF37"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                        {pro.rating}
                      </span>
                      <span style={{ color: 'var(--gris)', fontSize: 11 }}>({pro.reviewsCount} avis)</span>
                    </div>

                    {/* Mini Stats */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--gris-f)', padding: '7px 10px', borderRadius: 10, margin: '10px 0', border: '1px solid var(--gris-b)', textAlign: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 12.5, color: 'var(--noir)' }}>{pro.projectsCount}</div>
                        <div style={{ fontSize: 9, color: 'var(--gris)', textTransform: 'uppercase' }}>{t('dashboard.projects_stat', 'Projets')}</div>
                      </div>
                      <div style={{ width: 1, background: 'var(--gris-b)' }} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 12.5, color: 'var(--noir)' }}>{pro.experience}</div>
                        <div style={{ fontSize: 9, color: 'var(--gris)', textTransform: 'uppercase' }}>{t('dashboard.experience_stat', 'Expérience')}</div>
                      </div>
                      <div style={{ width: 1, background: 'var(--gris-b)' }} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 12.5, color: '#D4AF37' }}>{pro.pointsRequired}</div>
                        <div style={{ fontSize: 9, color: 'var(--gris)', textTransform: 'uppercase' }}>{t('dashboard.quote_stat', 'Devis')}</div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                      {pro.tags.slice(0, 3).map((tag, tIdx) => (
                        <span key={tIdx} style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: 'rgba(212,175,55,0.1)', color: '#926F08' }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Boutons actions */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                      <button
                        onClick={() => setQuoteModal(pro)}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)',
                          color: '#0F0D09',
                          border: 'none',
                          padding: '10px 8px',
                          borderRadius: 10,
                          fontWeight: 800,
                          fontSize: 11.5,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          boxShadow: '0 2px 8px rgba(212,175,55,0.3)'
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                        <span>Devis</span>
                      </button>

                      <button
                        onClick={() => setSelectedProModal(pro)}
                        style={{
                          flex: 1,
                          background: 'var(--gris-f)',
                          color: 'var(--noir)',
                          border: '1px solid var(--gris-b)',
                          padding: '10px 8px',
                          borderRadius: 10,
                          fontWeight: 700,
                          fontSize: 11.5,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
                        <span>Profil</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>

      {/* Modal Alerte */}
      {alertModalOpen && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'var(--blanc)',border:'1px solid var(--gris-b)',borderRadius:20,width:'100%',maxWidth:480,padding:28,boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <h3 style={{fontFamily:'Poppins,sans-serif',fontSize:17,fontWeight:800,color:'var(--noir)'}}>{t('dashboard.new_alert_modal_title', 'Nouvelle alerte')}</h3>
              <button onClick={()=>setAlertModalOpen(false)} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'var(--gris)'}}>✕</button>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,fontWeight:600,color:'var(--gris)',display:'block',marginBottom:5}}>{t('dashboard.alert_name_label', "Nom de l'alerte *")}</label>
              <input value={alertForm.title} onChange={(e)=>setAlertForm({...alertForm,title:e.target.value})} type="text" placeholder={t('dashboard.alert_name_placeholder', 'Ex: Appartement Bastos')} style={{width:'100%',background:'var(--gris-f)',color:'var(--noir)',border:'1.5px solid var(--gris-b)',borderRadius:10,padding:'10px 13px',fontSize:14,outline:'none',fontFamily:'DM Sans,sans-serif'}} />
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
              <div><label style={{fontSize:12,fontWeight:600,color:'var(--gris)',display:'block',marginBottom:5}}>Ville</label><select value={alertForm.city} onChange={(e)=>setAlertForm({...alertForm,city:e.target.value})} style={{width:'100%',background:'var(--gris-f)',color:'var(--noir)',border:'1.5px solid var(--gris-b)',borderRadius:10,padding:'10px 13px',fontSize:14,outline:'none'}}><option value="">Toutes les villes</option><option>Yaoundé</option><option>Douala</option><option>Bafoussam</option><option>Garoua</option><option>Maroua</option><option>Kribi</option><option>Limbe</option></select></div>
              <div><label style={{fontSize:12,fontWeight:600,color:'var(--gris)',display:'block',marginBottom:5}}>Quartier</label><input value={alertForm.neighborhood} onChange={(e)=>setAlertForm({...alertForm,neighborhood:e.target.value})} placeholder="Ex: Bastos" style={{width:'100%',background:'var(--gris-f)',color:'var(--noir)',border:'1.5px solid var(--gris-b)',borderRadius:10,padding:'10px 13px',fontSize:14,outline:'none'}} /></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
              <div><label style={{fontSize:12,fontWeight:600,color:'var(--gris)',display:'block',marginBottom:5}}>Transaction</label><select value={alertForm.transaction_type} onChange={(e)=>setAlertForm({...alertForm,transaction_type:e.target.value})} style={{width:'100%',background:'var(--gris-f)',color:'var(--noir)',border:'1.5px solid var(--gris-b)',borderRadius:10,padding:'10px 13px',fontSize:14,outline:'none'}}><option value="LOCATION">Location</option><option value="VENTE">Vente</option></select></div>
              <div><label style={{fontSize:12,fontWeight:600,color:'var(--gris)',display:'block',marginBottom:5}}>Type de bien</label><select value={alertForm.property_type} onChange={(e)=>setAlertForm({...alertForm,property_type:e.target.value})} style={{width:'100%',background:'var(--gris-f)',color:'var(--noir)',border:'1.5px solid var(--gris-b)',borderRadius:10,padding:'10px 13px',fontSize:14,outline:'none'}}><option value="">Tous</option><option value="APPARTEMENT">Appartement</option><option value="VILLA">Villa</option><option value="STUDIO">Studio</option><option value="BUREAU">Bureau</option><option value="BOUTIQUE">Boutique</option></select></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
              <div><label style={{fontSize:12,fontWeight:600,color:'var(--gris)',display:'block',marginBottom:5}}>Loyer min</label><input type="number" min="0" value={alertForm.min_price} onChange={(e)=>setAlertForm({...alertForm,min_price:e.target.value})} placeholder="Ex: 50000" style={{width:'100%',background:'var(--gris-f)',color:'var(--noir)',border:'1.5px solid var(--gris-b)',borderRadius:10,padding:'10px 13px',fontSize:14,outline:'none'}} /></div>
              <div><label style={{fontSize:12,fontWeight:600,color:'var(--gris)',display:'block',marginBottom:5}}>Loyer max</label><input type="number" min="0" value={alertForm.max_price} onChange={(e)=>setAlertForm({...alertForm,max_price:e.target.value})} placeholder="Ex: 150000" style={{width:'100%',background:'var(--gris-f)',color:'var(--noir)',border:'1.5px solid var(--gris-b)',borderRadius:10,padding:'10px 13px',fontSize:14,outline:'none'}} /></div>
            </div>
            {alertError && <div style={{color:'#B83232',fontSize:12}}>{alertError}</div>}
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setAlertModalOpen(false)} style={{flex:1,padding:12,borderRadius:11,background:'var(--gris-f)',border:'1px solid var(--gris-b)',fontFamily:'Poppins,sans-serif',fontSize:13,fontWeight:600,color:'var(--noir)',cursor:'pointer'}}>{t('common.cancel', 'Annuler')}</button>
              <button onClick={createAlert} disabled={alertSaving} style={{flex:2,padding:12,borderRadius:11,background:'linear-gradient(135deg,#D4AF37,#F6D365)',border:'none',fontFamily:'Poppins,sans-serif',fontSize:13,fontWeight:700,color:'#0F0D09',cursor:'pointer'}}>{alertSaving ? t('dashboard.creating_alert', 'Création…') : t('dashboard.create_alert_confirm', "Créer l'alerte")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sheet Modal pour Mobile */}
      <PropertySearchSheet
        isOpen={searchSheetOpen}
        onClose={() => setSearchSheetOpen(false)}
        filters={{
          city: propertySearch.city,
          neighborhood: propertySearch.neighborhood,
          transaction_type: propertySearch.transaction,
          property_type: propertySearch.type,
          max_price: propertySearch.max_price,
          bedrooms: propertySearch.bedrooms,
          has_virtual_tour: propertySearch.has_virtual_tour,
          is_verified: propertySearch.is_verified
        }}
        onChange={(f) => {
          setPropertySearch(prev => ({
            ...prev,
            city: f.city !== undefined ? f.city : prev.city,
            neighborhood: f.neighborhood !== undefined ? f.neighborhood : prev.neighborhood,
            transaction: f.transaction_type !== undefined ? f.transaction_type : prev.transaction,
            type: f.property_type !== undefined ? f.property_type : prev.type,
            max_price: f.max_price !== undefined ? f.max_price : prev.max_price,
            bedrooms: f.bedrooms !== undefined ? f.bedrooms : prev.bedrooms,
            has_virtual_tour: f.has_virtual_tour !== undefined ? f.has_virtual_tour : prev.has_virtual_tour,
            is_verified: f.is_verified !== undefined ? f.is_verified : prev.is_verified
          }));
        }}
        onApply={() => {
          const params = new URLSearchParams();
          if (propertySearch.city) params.set('city', propertySearch.city);
          if (propertySearch.neighborhood?.trim()) params.set('neighborhood', propertySearch.neighborhood.trim());
          if (propertySearch.type) params.set('type', propertySearch.type);
          if (propertySearch.min_price) params.set('min_price', propertySearch.min_price);
          if (propertySearch.max_price) params.set('max_price', propertySearch.max_price);
          if (propertySearch.transaction) params.set('transaction', propertySearch.transaction);
          if (propertySearch.bedrooms) params.set('bedrooms', propertySearch.bedrooms);
          if (propertySearch.has_virtual_tour) params.set('has_virtual_tour', 'true');
          if (propertySearch.is_verified) params.set('is_verified', 'true');
          navigate(`/properties${params.toString() ? `?${params.toString()}` : ''}`);
        }}
        onReset={() => {
          setPropertySearch({ city: '', neighborhood: '', type: '', min_price: '', max_price: '', transaction: '', bedrooms: '', has_virtual_tour: false, is_verified: false });
        }}
      />

      {/* ═══════════════════════════════════════
          MODAL PROFIL DÉTAILLÉ DU PROFESSIONNEL (AVEC AVIS, ÉTOILES ET PROJETS)
      ═══════════════════════════════════════ */}
      {selectedProModal && (
        <ProProfileDetailModal
          pro={selectedProModal}
          currentUser={user}
          onClose={() => setSelectedProModal(null)}
          onSelectProject={(proj) => {
            setSelectedProModal(null);
            setSelectedProjectModal(proj);
          }}
          onRequestQuote={(proObj) => {
            setSelectedProModal(null);
            setQuoteModal(proObj);
          }}
        />
      )}

      {/* ═══════════════════════════════════════
          MODAL DE DEMANDE DE DEVIS STRUCTURÉ PRO
      ═══════════════════════════════════════ */}
      {quoteModal && (
        <ProQuoteRequestModal
          proData={quoteModal}
          projectData={quoteProjectModal}
          onClose={() => {
            setQuoteModal(null);
            setQuoteProjectModal(null);
          }}
          onSubmitSuccess={(q) => {
            console.log('Devis locataire transmis :', q);
          }}
        />
      )}

      {/* ═══════════════════════════════════════
          MODAL DÉTAILS D'UN CHANTIER / RÉALISATION HAUT DE GAMME
      ═══════════════════════════════════════ */}
      {selectedProjectModal && (
        <ProProjectDetailModal
          project={selectedProjectModal}
          currentUser={user}
          onClose={() => setSelectedProjectModal(null)}
          onOrderEscrow={(p) => {
            setSelectedProjectModal(null);
            const rawBudget = parseInt(String(p.budget || '').replace(/[^0-9]/g, ''), 10);
            const depositAmount = rawBudget && rawBudget > 0 ? (rawBudget <= 100000 ? rawBudget : Math.round(rawBudget * 0.5)) : 50000;
            setEscrowModalData({
              service: p.title,
              acompte: depositAmount,
              totalBudget: rawBudget || depositAmount,
              pro: p.author?.name || 'Artisan Certifié'
            });
          }}
          onRequestQuote={(p) => {
            setSelectedProjectModal(null);
            setQuoteProjectModal(p);
            const proTarget = p.author || {
              id: p.professional,
              name: p.author_name || 'Artisan Piolo',
              phone: p.phone || '+237699001122'
            };
            setQuoteModal(proTarget);
          }}
        />
      )}

      {/* ═══════════════════════════════════════
          MODAL CALCULATEUR DE BUDGET EXPRESS
      ═══════════════════════════════════════ */}
      {calculatorOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,13,9,0.75)', backdropFilter: 'blur(5px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ maxWidth: 640, width: '100%', maxHeight: '92vh', overflowY: 'auto' }}>
            <ProBudgetCalculator
              onClose={() => setCalculatorOpen(false)}
              onOpenDevis={(d) => {
                setCalculatorOpen(false);
                alert(`✓ Votre simulation pour "${d.service}" (${d.minPrice.toLocaleString('fr-FR')} - ${d.maxPrice.toLocaleString('fr-FR')} FCFA) a été enregistrée ! Un artisan vous contactera.`);
              }}
              onOpenEscrow={(d) => {
                setCalculatorOpen(false);
                setEscrowModalData(d);
              }}
            />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          MODAL ACOMPTE SÉCURISÉ PIOLO ESCROW
      ═══════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════
          MODAL DEMANDE DE DEVIS STRUCTURÉ PRO
      ═══════════════════════════════════════ */}
      {quoteModal && (
        <ProQuoteRequestModal
          proData={quoteModal}
          onClose={() => setQuoteModal(null)}
          onSubmitSuccess={() => {
            setQuoteModal(null);
          }}
        />
      )}

      {/* MODAL PASS VIP ET RECHARGE DE POINTS LOCATAIRE */}
      {tenantSubscriptionOpen && (
        <TenantSubscriptionModal
          currentPoints={tenantPoints}
          onClose={() => setTenantSubscriptionOpen(false)}
          onRechargeSuccess={(addedPts) => {
            const newPts = subscriptionService.addTenantPoints(user?.id, addedPts);
            setTenantPoints(newPts);
          }}
          onSubscribeSuccess={(planObj) => {
            setTenantPlan(planObj);
            subscriptionService.setTenantPlan(user?.id, planObj);
          }}
        />
      )}

      {/* Navigation Basse Tactile Mobile */}
      <MobileBottomNav />
    </div>
  );
}
