import { useTranslation } from 'react-i18next';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import PropertyCard from '../../components/PropertyCard';
import PropertySearchSheet from '../../components/PropertySearchSheet';
import { useAuth } from '../../context/AuthContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { propertiesApi, professionalsApi } from '../../services/api';
import { getMediaUrl } from '../../utils/media';
import { SkeletonCard, SkeletonProCard, SkeletonProProjectCard } from '../../components/SkeletonCard';
import { subscriptionService } from '../../services/subscriptionService';
import ProProfileDetailModal from '../../components/ProProfileDetailModal';
import ProProjectDetailModal from '../../components/ProProjectDetailModal';
import ProQuoteRequestModal from '../../components/ProQuoteRequestModal';
import ProBudgetCalculator from '../../components/ProBudgetCalculator';
import ProEscrowModal from '../../components/ProEscrowModal';

export default function HomePage() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const { config } = useSiteConfig();
  const navigate = useNavigate();
  const location = useLocation();
  const authLink = isAuthenticated ? "/dashboard" : "/login";

  // Navigation sécurisée avec redirection automatique vers la page de connexion
  const handleProtectedNavigate = (targetPath, customMessage) => {
    if (!isAuthenticated || !user) {
      navigate('/login', {
        state: {
          from: targetPath,
          message: customMessage || 'Connectez-vous à votre compte Piolo pour continuer.'
        }
      });
    } else {
      navigate(targetPath);
    }
  };

  // Interactive 360° Room Selector
  const [activeRoom, setActiveRoom] = useState('salon');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Interactive IA Estimation Simulator State
  const [iaSurface, setIaSurface] = useState(85);
  const [iaRooms, setIaRooms] = useState(3);
  const [iaQuarter, setIaQuarter] = useState('bastos');

  // Properties State
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [favStates, setFavStates] = useState({});

  // Pros & BTP State (comme dans le Dashboard Locataire)
  // Uniquement les profils et réalisations réels issus de la base de données
  const [prosList, setProsList] = useState([]);
  const [proProjectsList, setProProjectsList] = useState([]);
  const [loadingPros, setLoadingPros] = useState(true);
  const [selectedProModal, setSelectedProModal] = useState(null);
  const [selectedProjectModal, setSelectedProjectModal] = useState(null);
  const [quoteModalPro, setQuoteModalPro] = useState(null);
  const [quoteModalProject, setQuoteModalProject] = useState(null);
  const [budgetCalculatorOpen, setBudgetCalculatorOpen] = useState(false);
  const [escrowModalData, setEscrowModalData] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null); // { src, title, caption }

  // Fermer le lightbox avec Echap
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && lightboxImg) setLightboxImg(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImg]);

  const proProjectsRailRef = useRef(null);
  const proListRailRef = useRef(null);

  // Actions Pro fluides
  const handleRequestQuote = (target, project = null) => {
    setQuoteModalProject(project);
    setQuoteModalPro(target);
  };

  const handleOrderEscrow = (target) => {
    const rawBudget = parseInt(String(target?.budget || target?.acompte || '').replace(/[^0-9]/g, ''), 10);
    const depositAmount = rawBudget && rawBudget > 0 ? (rawBudget <= 100000 ? rawBudget : Math.round(rawBudget * 0.5)) : 50000;
    setEscrowModalData({
      service: target?.title || target?.service || 'Prestation Habitat sur-mesure',
      acompte: depositAmount,
      totalBudget: rawBudget || depositAmount,
      pro: target?.author?.name || target?.pro || 'Artisan Certifié'
    });
  };

  // Mobile Bottom Sheet Search States
  const [searchSheetOpen, setSearchSheetOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    city: '',
    neighborhood: '',
    transaction_type: '',
    property_type: '',
    max_price: '',
    bedrooms: '',
    has_virtual_tour: false,
    is_verified: false
  });
  const [quickSearchText, setQuickSearchText] = useState('');

  // Animated Search Placeholder (Machine à écrire lettre par lettre)
  const searchPlaceholders = [
    "Rechercher une villa à Bastos…",
    "Studio meublé moderne à Akwa…",
    "Appartement 3 chambres à Bonapriso…",
    "Duplex avec visite 360° à Odza…",
    "Résidence meublée à Bonamoussadi…",
    "Villa de maître avec piscine à Bonanjo…"
  ];
  const [typedPlaceholder, setTypedPlaceholder] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = searchPlaceholders[phraseIndex];
    let timer;

    if (!isDeleting) {
      // Écriture lettre par lettre
      if (typedPlaceholder.length < currentPhrase.length) {
        timer = setTimeout(() => {
          setTypedPlaceholder(currentPhrase.slice(0, typedPlaceholder.length + 1));
        }, 55);
      } else {
        // Pause une fois la phrase complètement écrite
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      // Effacement lettre par lettre
      if (typedPlaceholder.length > 0) {
        timer = setTimeout(() => {
          setTypedPlaceholder(currentPhrase.slice(0, typedPlaceholder.length - 1));
        }, 28);
      } else {
        // Phrase suivante
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % searchPlaceholders.length);
      }
    }

    return () => clearTimeout(timer);
  }, [typedPlaceholder, isDeleting, phraseIndex, searchPlaceholders]);

  // Classification comme dans le Dashboard Locataire
  // 1. Courts séjours & Meublés (Strictement Court terme)
  const shortTermProperties = properties.filter(p => 
    p.transaction_type === 'COURTE_DUREE' || p.is_short_term || p.short_term
  );

  // 2. Logements à louer (Long terme)
  const rentalProperties = properties.filter(p => p.transaction_type === 'LOCATION' || !p.transaction_type);

  // 3. Biens à vendre (Investissement & Achat)
  const saleProperties = properties.filter(p => p.transaction_type === 'VENTE');

  // Refs pour les 3 carrousels horizontaux
  const shortTermCarouselRef = useRef(null);
  const rentalCarouselRef = useRef(null);
  const saleCarouselRef = useRef(null);

  // Auto-scroll horizontal fluide toutes les 4.5 secondes (comme dans le Dashboard Locataire)
  useEffect(() => {
    const scrollCarousel = (ref) => {
      if (!ref.current) return;
      const el = ref.current;
      if (el.matches(':hover') || el.matches(':active')) return;
      
      const item = el.querySelector('.horizontal-carousel-item, .pro-btp-project-card, .pro-btp-pro-card');
      const step = item ? item.offsetWidth + 18 : 300;
      const maxScroll = el.scrollWidth - el.clientWidth;
      
      if (maxScroll <= 0) return;

      if (el.scrollLeft + step >= maxScroll - 15) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' });
      }
    };

    const interval = setInterval(() => {
      scrollCarousel(shortTermCarouselRef);
      scrollCarousel(rentalCarouselRef);
      scrollCarousel(saleCarouselRef);
      scrollCarousel(proProjectsRailRef);
      scrollCarousel(proListRailRef);
    }, 4500);

    return () => clearInterval(interval);
  }, [properties, prosList, proProjectsList]);

  const scrollManual = (ref, direction) => {
    if (!ref.current) return;
    const el = ref.current;
    const item = el.querySelector('.horizontal-carousel-item');
    const step = item ? item.offsetWidth + 18 : 320;
    el.scrollBy({ left: direction === 'left' ? -step : step, behavior: 'smooth' });
  };

  // ── Filtrage dynamique directement sur la page d'accueil ──
  const isFilterActive = Boolean(
    quickSearchText.trim() ||
    (activeCategory !== 'all' && ['apartment', 'villa', 'studio'].includes(activeCategory)) ||
    searchFilters.city ||
    searchFilters.neighborhood ||
    searchFilters.transaction_type ||
    searchFilters.property_type ||
    searchFilters.max_price ||
    searchFilters.bedrooms ||
    searchFilters.has_virtual_tour ||
    searchFilters.is_verified
  );

  const filteredProperties = properties.filter(p => {
    // 1. Recherche textuelle rapide (Titre, quartier, ville, description, type)
    if (quickSearchText.trim()) {
      const q = quickSearchText.toLowerCase().trim();
      const matchText = (
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.neighborhood && p.neighborhood.toLowerCase().includes(q)) ||
        (p.city && p.city.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.property_type && p.property_type.toLowerCase().includes(q))
      );
      if (!matchText) return false;
    }

    // 2. Filtre par Catégorie rapide
    if (activeCategory === 'apartment') {
      if (p.property_type !== 'APPARTEMENT') return false;
    } else if (activeCategory === 'villa') {
      if (!['VILLA', 'MAISON', 'DUPLEX', 'PENTHOUSE'].includes(p.property_type)) return false;
    } else if (activeCategory === 'studio') {
      if (!['STUDIO', 'CHAMBRE'].includes(p.property_type)) return false;
    }

    // 3. Filtre modal (PropertySearchSheet)
    if (searchFilters.city && p.city && !p.city.toLowerCase().includes(searchFilters.city.toLowerCase())) {
      return false;
    }
    if (searchFilters.neighborhood && p.neighborhood && !p.neighborhood.toLowerCase().includes(searchFilters.neighborhood.toLowerCase())) {
      return false;
    }
    if (searchFilters.transaction_type && p.transaction_type && p.transaction_type !== searchFilters.transaction_type) {
      return false;
    }
    if (searchFilters.property_type && p.property_type && p.property_type !== searchFilters.property_type) {
      return false;
    }
    if (searchFilters.max_price && Number(p.price) > Number(searchFilters.max_price)) {
      return false;
    }
    if (searchFilters.bedrooms && Number(p.bedrooms) < Number(searchFilters.bedrooms)) {
      return false;
    }
    if (searchFilters.has_virtual_tour && !(p.has_virtual_tour || p.tour_360_url || p.virtual_tour)) {
      return false;
    }
    if (searchFilters.is_verified && !p.is_verified) {
      return false;
    }

    return true;
  });

  const handleMobileSearchApply = () => {
    setSearchSheetOpen(false);
    const el = document.getElementById('annonces');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleMobileSearchReset = () => {
    setSearchFilters({
      city: '',
      neighborhood: '',
      transaction_type: '',
      property_type: '',
      max_price: '',
      bedrooms: '',
      has_virtual_tour: false,
      is_verified: false
    });
    setQuickSearchText('');
    setActiveCategory('all');
  };

  const handleCategorySelect = (catKey) => {
    setActiveCategory(catKey);
    if (catKey === 'all') {
      const el = document.getElementById('annonces');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (catKey === 'discovery') {
      navigate('/discovery');
    } else if (catKey === 'map') {
      const el = document.getElementById('carte');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        navigate('/map');
      }
    } else if (catKey === 'ia') {
      const el = document.getElementById('estimateur-ia');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Filtrer sur place (Appartements, Villas, Studios) et défiler vers la section
      const el = document.getElementById('annonces');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const roomImages = {
    salon: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
    chambre: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80',
    cuisine: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80',
    sdb: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80',
  };

  const roomNames = {
    salon: 'Salon Moderne & Balcon',
    chambre: 'Suite Parentale Lumineuse',
    cuisine: 'Cuisine Équipée Américaine',
    sdb: 'Salle de Bain Contemporaine',
  };

  // Rent Estimator helper
  const calculateEstimatedRent = () => {
    let baseRate = 1200; // FCFA per m2
    if (iaQuarter === 'bastos' || iaQuarter === 'bonapriso') baseRate = 1600;
    if (iaQuarter === 'akwa' || iaQuarter === 'odza') baseRate = 1350;
    if (iaQuarter === 'bonamoussadi' || iaQuarter === 'ngousso') baseRate = 1100;
    
    const center = iaSurface * baseRate + iaRooms * 15000;
    const minVal = Math.round((center * 0.85) / 5000) * 5000;
    const maxVal = Math.round((center * 1.15) / 5000) * 5000;
    return { min: minVal.toLocaleString('fr-FR'), max: maxVal.toLocaleString('fr-FR') };
  };

  useEffect(() => {
    const fetchHomeProps = async () => {
      const sortWithBoosts = (arr) => {
        return subscriptionService.sortPropertiesByBoost(arr);
      };

      try {
        const res = await propertiesApi.list({});
        let list = res.data?.results || res.data;
        if (Array.isArray(list) && list.length > 0) {
          setProperties(sortWithBoosts(list));
          setLoadingProperties(false);
          return;
        }
      } catch (e) {
        console.warn('Authenticated properties fetch failed, attempting public fallback...', e);
      }

      try {
        const res = await fetch('/api/v1/properties/');
        if (res.ok) {
          const data = await res.json();
          let list = data.results || data;
          if (Array.isArray(list)) setProperties(sortWithBoosts(list));
        }
      } catch (err) {
        console.error('Error loading properties for home page:', err);
      } finally {
        setLoadingProperties(false);
      }
    };

    fetchHomeProps();
  }, []);

  // Chargement des professionnels et projets BTP réels (avec fallback de secours)
  useEffect(() => {
    professionalsApi.list().then(res => {
      if (Array.isArray(res.data) && res.data.length > 0) {
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
            pointsRequired: 'Gratuit',
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
      } else {
        setProsList([]);
      }
    }).catch(err => {
      console.warn("Impossible de charger les artisans:", err);
      setProsList([]);
    }).finally(() => {
      setLoadingPros(false);
    });

    professionalsApi.projects().then(res => {
      setProProjectsList(Array.isArray(res.data) ? res.data : []);
    }).catch(err => {
      console.warn("Impossible de charger les chantiers:", err);
      setProProjectsList([]);
    });
  }, []);

  return (
    <div className="home-page-root">
      <Navbar />

      <style>{`
        /* ── Core Design System ── */
        :root {
          --flow-gold: #D4AF37;
          --flow-gold-light: #F6D365;
          --flow-gold-dark: #B8962A;
          --flow-dark: #0F0D09;
          --flow-card: #181510;
          --flow-border: rgba(212, 175, 55, 0.22);
        }

        .home-page-root {
          background-color: #F8F9FA;
          color: #1A1A1A;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* Fluid, resilient entry animation */
        .reveal { 
          opacity: 1;
          transform: translateY(0);
          transition: transform 0.4s ease;
        }

        /* ── 1. HERO SECTION (Vue de la ville de Douala d'en haut au coucher du soleil) ── */
        .gflow-hero {
          position: relative;
          background: linear-gradient(110deg, rgba(10, 6, 0, 0.82) 0%, rgba(10, 6, 0, 0.50) 50%, rgba(10, 6, 0, 0.88) 100%),
                      url('https://media.istockphoto.com/id/1328860707/photo/beautiful-view-of-douala-at-sunset.jpg?s=1024x1024&w=is&k=20&c=i_hUkEzzgOOVDwJXWXf0u_16DeftLJEW4wodgXtx4V0=') center/cover no-repeat;
          color: #fff;
          padding: calc(62px + env(safe-area-inset-top, 0px) + 28px) 1.25rem 3.5rem;
          text-align: center;
          overflow: hidden;
          border-bottom: 1px solid rgba(212, 175, 55, 0.25);
        }

        .gflow-hero::before {
          content: '';
          position: absolute;
          top: -25%;
          left: 50%;
          transform: translateX(-50%);
          width: 650px;
          height: 650px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.18) 0%, transparent 68%);
          pointer-events: none;
          z-index: 0;
          animation: ambientPulse 6s ease-in-out infinite alternate;
        }

        @keyframes ambientPulse {
          0% { transform: translateX(-50%) scale(0.9); opacity: 0.5; }
          100% { transform: translateX(-50%) scale(1.15); opacity: 0.9; }
        }

        .gflow-hero-content {
          position: relative;
          z-index: 1;
          max-width: 920px;
          margin: 0 auto;
        }

        .gflow-badge-top {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 16px;
          border-radius: 999px;
          background: rgba(212, 175, 55, 0.18);
          border: 1px solid rgba(212, 175, 55, 0.45);
          color: #F6D365;
          font-family: 'Poppins', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.3px;
          margin-bottom: 1.15rem;
          backdrop-filter: blur(8px);
        }

        .gflow-badge-top i {
          font-size: 11px;
          color: var(--flow-gold);
        }

        .gflow-hero-title {
          font-family: 'Poppins', sans-serif;
          font-size: clamp(2rem, 6vw, 3.5rem);
          font-weight: 900;
          line-height: 1.16;
          margin-bottom: 0.95rem;
          letter-spacing: -0.5px;
        }

        .gflow-hero-title span {
          background: linear-gradient(135deg, #FFF1C5 0%, #D4AF37 50%, #F6D365 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .gflow-hero-subtitle {
          font-size: clamp(13.5px, 2.5vw, 16px);
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.6;
          max-width: 620px;
          margin: 0 auto 1.85rem;
          text-shadow: 0 2px 10px rgba(0,0,0,0.6);
        }

        /* ── Search Capsule ── */
        .gflow-search-capsule {
          background: rgba(255, 255, 255, 0.98);
          border-radius: 999px;
          padding: 6px 8px 6px 18px;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(212, 175, 55, 0.4);
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: 640px;
          margin: 0 auto 1.5rem;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }

        .gflow-search-capsule:hover, .gflow-search-capsule:focus-within {
          box-shadow: 0 16px 45px rgba(212, 175, 55, 0.35), 0 0 0 2px var(--flow-gold);
          transform: translateY(-2px);
        }

        .gflow-search-icon {
          color: var(--flow-gold-dark);
          font-size: 17px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gflow-search-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-family: 'DM Sans', sans-serif;
          font-size: 14.5px;
          font-weight: 500;
          color: #1A1A1A;
          min-width: 0;
        }

        .gflow-search-input::placeholder {
          color: #7E786F;
          transition: opacity 0.3s ease;
        }

        .gflow-capsule-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .gflow-filter-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(212, 175, 55, 0.12);
          border: 1px solid rgba(212, 175, 55, 0.3);
          color: #92700C;
          font-family: 'Poppins', sans-serif;
          font-size: 12.5px;
          font-weight: 700;
          padding: 8px 14px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gflow-filter-btn:hover {
          background: rgba(212, 175, 55, 0.22);
          color: #6C5205;
        }

        .gflow-submit-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--flow-gold), var(--flow-gold-light));
          border: none;
          color: #0F0D09;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
          flex-shrink: 0;
        }

        .gflow-submit-circle:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 18px rgba(212, 175, 55, 0.6);
        }

        /* ── Category Chips Strip ── */
        .gflow-categories-strip {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          padding: 0.25rem 0.25rem 0.75rem;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          justify-content: flex-start;
        }

        .gflow-categories-strip::-webkit-scrollbar {
          display: none;
        }

        .gflow-cat-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.9);
          font-family: 'Poppins', sans-serif;
          font-size: 12.5px;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
          backdrop-filter: blur(4px);
        }

        .gflow-cat-chip:hover {
          background: rgba(212, 175, 55, 0.25);
          border-color: rgba(212, 175, 55, 0.5);
          color: #FFF;
        }

        .gflow-cat-chip.active {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.95), rgba(246, 211, 101, 0.95));
          border-color: var(--flow-gold);
          color: #0F0D09;
          font-weight: 700;
          box-shadow: 0 4px 14px rgba(212, 175, 55, 0.35);
        }

        .gflow-cat-chip.special-reels {
          background: linear-gradient(135deg, rgba(255, 59, 48, 0.2), rgba(212, 175, 55, 0.3));
          border-color: rgba(255, 107, 107, 0.6);
          color: #FFE27A;
        }

        /* ── Discovery Reels Banner ── */
        .gflow-reels-banner {
          margin: 1.5rem auto 0;
          max-width: 820px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(28, 24, 16, 0.92) 0%, rgba(15, 13, 9, 0.96) 100%);
          border: 1px solid rgba(212, 175, 55, 0.4);
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }

        .gflow-reels-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .gflow-reels-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: linear-gradient(135deg, #D4AF37, #E65100);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #fff;
          box-shadow: 0 6px 16px rgba(212, 175, 55, 0.35);
          flex-shrink: 0;
        }

        .gflow-reels-text h4 {
          font-family: 'Poppins', sans-serif;
          font-size: 15px;
          font-weight: 800;
          color: #FFF;
          margin-bottom: 2px;
        }

        .gflow-reels-text p {
          font-size: 12.5px;
          color: rgba(255, 255, 255, 0.75);
          margin: 0;
        }

        .gflow-reels-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--flow-gold), var(--flow-gold-light));
          color: #0F0D09;
          font-family: 'Poppins', sans-serif;
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(212, 175, 55, 0.4);
          transition: transform 0.2s ease;
        }

        .gflow-reels-btn:hover {
          transform: scale(1.04);
        }

        /* ── 2. PROPERTIES SECTION & HORIZONTAL CAROUSELS ── */
        .gflow-props-section {
          padding: 3rem 1.25rem 4rem;
          max-width: 1360px;
          margin: 0 auto;
        }

        .home-carousel-wrapper {
          position: relative;
          margin-bottom: 2.75rem;
        }

        .horizontal-sec-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 14px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .horizontal-sec-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 4px 12px;
          border-radius: 8px;
          margin-bottom: 6px;
        }

        .horizontal-sec-title {
          font-size: clamp(1.3rem, 3.5vw, 1.8rem);
          font-weight: 800;
          font-family: 'Poppins', sans-serif;
          color: #0F0D09;
          margin: 0;
          line-height: 1.2;
        }

        .horizontal-sec-sub {
          font-size: 13px;
          color: #666;
          margin: 4px 0 0;
          font-weight: 500;
        }

        .horizontal-sec-link {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--flow-gold-dark);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          padding: 7px 14px;
          border-radius: 10px;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.25);
          transition: all 0.2s ease;
        }

        .horizontal-sec-link:hover {
          background: rgba(212, 175, 55, 0.2);
          transform: translateX(2px);
        }

        .horizontal-properties-carousel {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          gap: 18px;
          padding: 6px 4px 18px;
          margin: 0 -4px;
          scrollbar-width: none;
        }

        .horizontal-properties-carousel::-webkit-scrollbar {
          display: none;
        }

        .horizontal-carousel-item {
          flex: 0 0 315px;
          min-width: 290px;
          max-width: 330px;
          scroll-snap-align: start;
        }

        @media (max-width: 600px) {
          .horizontal-carousel-item {
            flex: 0 0 84vw;
            min-width: 270px;
            max-width: 320px;
          }
        }

        .home-carousel-nav-btn {
          position: absolute;
          top: 55%;
          transform: translateY(-50%);
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(15, 13, 9, 0.85);
          backdrop-filter: blur(8px);
          border: 1.5px solid rgba(212, 175, 55, 0.4);
          color: #F6D365;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          box-shadow: 0 6px 20px rgba(0,0,0,0.25);
          opacity: 0;
          transition: all 0.25s ease;
        }

        .home-carousel-wrapper:hover .home-carousel-nav-btn {
          opacity: 1;
        }

        .home-carousel-nav-btn:hover {
          background: #0F0D09;
          border-color: #D4AF37;
          transform: translateY(-50%) scale(1.08);
          color: #FFF;
        }

        .home-carousel-nav-btn.prev {
          left: -14px;
        }

        .home-carousel-nav-btn.next {
          right: -14px;
        }

        @media (max-width: 768px) {
          .home-carousel-nav-btn {
            display: none;
          }
        }

        /* ── 3. VISITE VIRTUELLE 360° SECTION ── */
        .showcase-3d-section {
          background: linear-gradient(135deg, #18140E 0%, #0F0D09 100%);
          color: #fff;
          padding: 4rem 1.25rem;
          border-top: 1px solid rgba(212,175,55,0.2);
          border-bottom: 1px solid rgba(212,175,55,0.2);
        }

        .showcase-3d-wrap {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          gap: 36px;
          align-items: center;
        }

        .showcase-3d-frame {
          background: #0A0A0E;
          border-radius: 20px;
          overflow: hidden;
          border: 1.5px solid rgba(212, 175, 55, 0.4);
          box-shadow: 0 20px 50px rgba(0,0,0,0.6);
        }

        .showcase-3d-image-box {
          position: relative;
          height: 320px;
          overflow: hidden;
        }

        .showcase-3d-image-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .showcase-3d-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          background: rgba(15,13,9,0.8);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(212,175,55,0.4);
          color: #F6D365;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .showcase-3d-nav {
          display: flex;
          background: #14110B;
          padding: 10px;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .showcase-3d-nav-btn {
          flex: 1;
          padding: 9px 12px;
          border-radius: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.8);
          font-family: 'Poppins', sans-serif;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          text-align: center;
          transition: all 0.2s ease;
        }

        .showcase-3d-nav-btn.active {
          background: linear-gradient(135deg, var(--flow-gold), var(--flow-gold-light));
          color: #0F0D09;
          font-weight: 800;
          border-color: var(--flow-gold);
        }

        /* ── 4. CARTE & QUARTIERS SECTION ── */
        .showcase-map-section {
          padding: 4rem 1.25rem;
          max-width: 1280px;
          margin: 0 auto;
        }

        .showcase-map-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 36px;
          align-items: center;
        }

        .showcase-map-preview {
          position: relative;
          height: 350px;
          border-radius: 20px;
          overflow: hidden;
          background: #11161D;
          border: 1.5px solid rgba(212, 175, 55, 0.35);
          box-shadow: 0 16px 40px rgba(0,0,0,0.2);
          cursor: pointer;
        }

        .showcase-map-bg-grid {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(17, 22, 29, 0.75) 0%, rgba(17, 22, 29, 0.45) 100%),
                      url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1000&q=80') center/cover no-repeat;
        }

        .showcase-map-bg-grid::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(212, 175, 55, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 175, 55, 0.08) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }

        .showcase-map-lock-overlay {
          position: absolute;
          inset: 0;
          z-index: 15;
          background: rgba(15, 13, 9, 0.68);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          text-align: center;
          color: #fff;
          border-radius: 20px;
          transition: background 0.3s ease;
        }

        .showcase-map-lock-overlay:hover {
          background: rgba(15, 13, 9, 0.62);
        }

        .showcase-map-lock-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(212, 175, 55, 0.2);
          color: #F6D365;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin-bottom: 12px;
          border: 1.5px solid rgba(212, 175, 55, 0.45);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
        }

        .showcase-map-login-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 22px;
          border-radius: 12px;
          background: linear-gradient(135deg, #D4AF37, #F6D365);
          border: none;
          color: #0F0D09;
          font-family: 'Poppins', sans-serif;
          font-size: 13.5px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 4px 18px rgba(212, 175, 55, 0.4);
          transition: all 0.25s ease;
        }

        .showcase-map-login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 22px rgba(212, 175, 55, 0.5);
        }

        .showcase-pin {
          position: absolute;
          transform: translate(-50%, -100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: transform 0.2s ease;
          z-index: 5;
        }

        .showcase-pin:hover {
          transform: translate(-50%, -115%) scale(1.1);
        }

        .showcase-pin i {
          font-size: 26px;
          color: var(--flow-gold);
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6));
        }

        .showcase-pin span {
          background: #0F0D09;
          color: #F6D365;
          border: 1px solid rgba(212,175,55,0.4);
          font-family: 'Poppins', sans-serif;
          font-size: 10.5px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 6px;
          white-space: nowrap;
          margin-top: 2px;
        }

        /* ── 5. ESTIMATEUR IA SECTION ── */
        .showcase-ia-section {
          background: #12100C;
          color: #fff;
          padding: 4rem 1.25rem;
          border-top: 1px solid rgba(212, 175, 55, 0.2);
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        }

        .showcase-ia-wrap {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 36px;
          align-items: center;
        }

        .showcase-ia-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 20px;
          padding: 1.75rem;
          backdrop-filter: blur(10px);
        }

        .ia-slider-group {
          margin-bottom: 16px;
        }

        .ia-slider-label {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: rgba(255,255,255,0.75);
          margin-bottom: 8px;
          font-weight: 600;
        }

        .ia-slider-label strong {
          color: #F6D365;
        }

        .ia-range {
          width: 100%;
          accent-color: var(--flow-gold);
          cursor: pointer;
        }

        .ia-result-box {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.18), rgba(246, 211, 101, 0.08));
          border: 1px solid rgba(212, 175, 55, 0.4);
          border-radius: 14px;
          padding: 16px;
          text-align: center;
          margin-top: 18px;
        }

        .ia-result-box small {
          font-size: 11px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.65);
          letter-spacing: 0.5px;
        }

        .ia-result-price {
          font-family: 'Poppins', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #F6D365;
          margin: 4px 0;
        }

        /* ── 6. SÉCURITÉ & CNI PILLARS ── */
        .showcase-security-section {
          padding: 4rem 1.25rem;
          max-width: 1280px;
          margin: 0 auto;
        }

        .sec-pillars-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-top: 2rem;
        }

        .sec-pillar-card {
          background: #fff;
          border: 1px solid #E8E4DC;
          border-radius: 18px;
          padding: 1.5rem;
          text-align: center;
          box-shadow: 0 6px 20px rgba(0,0,0,0.03);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .sec-pillar-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.08);
        }

        .sec-pillar-icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: rgba(212, 175, 55, 0.15);
          color: var(--flow-gold-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin: 0 auto 14px;
        }

        .sec-pillar-card h4 {
          font-family: 'Poppins', sans-serif;
          font-size: 15px;
          font-weight: 800;
          color: #0F0D09;
          margin-bottom: 6px;
        }

        .sec-pillar-card p {
          font-size: 12.5px;
          color: #666;
          line-height: 1.5;
          margin: 0;
        }
        /* ── 7. BTP & ARCHITECTURE PRO SHOWCASE (Fond Blanc & Lumineux) ── */
        .showcase-btp-section {
          background: #FFFFFF;
          color: #0F0D09;
          padding: 4.5rem 1.25rem;
          border-top: 1px solid #E8E3DA;
          border-bottom: 1px solid #E8E3DA;
          position: relative;
          overflow: hidden;
        }

        .showcase-btp-section::before {
          content: '';
          position: absolute;
          top: -120px;
          right: -100px;
          width: 450px;
          height: 450px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 68%);
          pointer-events: none;
        }

        .btp-main-wrap {
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .btp-header-block {
          text-align: center;
          max-width: 780px;
          margin: 0 auto 2.5rem;
        }

        .btp-badge-top {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 16px;
          border-radius: 999px;
          background: rgba(212, 175, 55, 0.12);
          border: 1px solid rgba(212, 175, 55, 0.35);
          color: #92700C;
          font-family: 'Poppins', sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 1rem;
        }

        .pro-btp-vitrine-box {
          margin-bottom: 2.2rem;
          background: #FAF9F6;
          padding: 20px 22px;
          border-radius: 20px;
          border: 1px solid #E8E3DA;
          box-shadow: 0 6px 20px rgba(0,0,0,0.04);
        }

        .pro-btp-projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }

        .pro-btp-project-card {
          background: #FFFFFF;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #E8E3DA;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          color: #0F0D09;
          box-shadow: 0 4px 14px rgba(0,0,0,0.03);
        }

        .pro-btp-project-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.1);
          border-color: #D4AF37;
        }

        .pro-btp-pros-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 22px;
          margin-bottom: 30px;
        }

        .pro-btp-pro-card {
          background: #FFFFFF;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #E8E3DA;
          box-shadow: 0 6px 20px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          color: #0F0D09;
        }

        .pro-btp-pro-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 34px rgba(212,175,55,0.16);
          border-color: #D4AF37;
        }

        .pro-mobile-swipe-hint {
          display: none;
        }

        @media (max-width: 768px) {
          .pro-mobile-swipe-hint {
            display: inline-flex !important;
            align-items: center;
            gap: 4px;
            font-size: 11px;
            color: #92700C;
            font-weight: 700;
          }
          .pro-btp-projects-grid {
            display: flex !important;
            overflow-x: auto !important;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            gap: 14px !important;
            padding-bottom: 6px;
            scrollbar-width: none;
          }
          .pro-btp-projects-grid::-webkit-scrollbar {
            display: none;
          }
          .pro-btp-project-card {
            min-width: 250px !important;
            max-width: 270px !important;
            flex: 0 0 auto !important;
            scroll-snap-align: start;
          }
          .pro-btp-pros-grid {
            display: flex !important;
            overflow-x: auto !important;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            gap: 16px !important;
            padding-bottom: 10px;
            scrollbar-width: none;
          }
          .pro-btp-pros-grid::-webkit-scrollbar {
            display: none;
          }
          .pro-btp-pro-card {
            min-width: 290px !important;
            max-width: 320px !important;
            flex: 0 0 auto !important;
            scroll-snap-align: start;
          }
        }

        /* Responsive Breakpoints pour tous les téléphones */
        @media (max-width: 850px) {
          .showcase-3d-wrap, .showcase-map-grid, .showcase-ia-wrap {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .sec-pillars-grid {
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }
          .gflow-reels-banner {
            flex-direction: column;
            text-align: center;
          }
          .gflow-reels-left {
            flex-direction: column;
          }
          .gflow-reels-btn {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 600px) {
          .sec-pillars-grid {
            grid-template-columns: 1fr;
          }
          .gflow-props-section {
            padding: 2rem 14px 3rem;
          }
          .horizontal-carousel-item {
            flex: 0 0 85vw;
            min-width: 250px;
            max-width: 315px;
          }
          .showcase-map-preview {
            height: 260px;
          }
          .showcase-ia-card {
            padding: 1.25rem 1rem;
          }
        }

        @media (max-width: 420px) {
          .gflow-hero {
            padding: calc(56px + env(safe-area-inset-top, 0px) + 14px) 12px 2.25rem;
          }
          .gflow-hero-title {
            font-size: clamp(1.6rem, 7vw, 2.2rem);
          }
          .gflow-hero-subtitle {
            font-size: 13px;
            margin-bottom: 1.25rem;
          }
          .gflow-badge-top {
            font-size: 11px;
            padding: 5px 12px;
          }
          .gflow-search-capsule {
            padding: 5px 8px 5px 12px;
            gap: 6px;
          }
          .gflow-search-input {
            font-size: 13px;
          }
          .gflow-filter-btn {
            padding: 6px 10px;
            font-size: 11.5px;
            gap: 4px;
          }
          .gflow-submit-circle {
            width: 35px;
            height: 35px;
            font-size: 12px;
          }
          .gflow-cat-chip {
            padding: 7px 12px;
            font-size: 11.5px;
            gap: 5px;
          }
          .horizontal-sec-title {
            font-size: 1.3rem;
          }
          .horizontal-carousel-item {
            flex: 0 0 88vw;
            min-width: 240px;
            max-width: 290px;
          }
        }

        @media (max-width: 360px) {
          .gflow-hero {
            padding: calc(52px + env(safe-area-inset-top, 0px) + 10px) 8px 1.75rem;
          }
          .gflow-hero-title {
            font-size: 1.5rem;
          }
          .gflow-search-capsule {
            padding: 4px 6px 4px 10px;
          }
          .gflow-search-input {
            font-size: 12px;
          }
          .gflow-filter-btn {
            padding: 5px 8px;
            font-size: 10.5px;
          }
          .gflow-submit-circle {
            width: 32px;
            height: 32px;
          }
          .horizontal-sec-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
          .horizontal-sec-link {
            font-size: 11.5px;
            padding: 5px 10px;
          }
          .horizontal-carousel-item {
            flex: 0 0 90vw;
            min-width: 230px;
            max-width: 270px;
          }
        }

        /* ── Dynamic Filtered Section Styles ── */
        .gflow-filtered-section {
          max-width: 1280px;
          margin: 0 auto;
          padding: 1.5rem 1.25rem 3rem;
        }

        .gflow-filtered-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 1.5rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        }

        .gflow-filtered-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 999px;
          background: rgba(212, 175, 55, 0.15);
          color: #B8962A;
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .gflow-filtered-title {
          font-family: 'Poppins', sans-serif;
          font-size: clamp(1.4rem, 3.5vw, 2rem);
          font-weight: 800;
          color: #0F0D09;
          margin: 0 0 4px;
        }

        .gflow-filtered-sub {
          font-size: 13.5px;
          color: #666;
          margin: 0;
        }

        .gflow-filtered-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .gflow-filter-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fff;
          color: #0F0D09;
          border: 1px solid rgba(212, 175, 55, 0.35);
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gflow-filter-tag:hover {
          background: #FAF7F0;
          border-color: #D4AF37;
        }

        .gflow-filter-tag-remove {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: rgba(0,0,0,0.08);
          font-size: 10px;
          margin-left: 2px;
        }

        .gflow-reset-all-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          border-radius: 12px;
          background: #0F0D09;
          color: #F6D365;
          font-size: 13px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .gflow-reset-all-btn:hover {
          background: #242018;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }

        .gflow-filtered-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(285px, 1fr));
          gap: 22px;
          margin-bottom: 2rem;
        }

        .gflow-empty-results {
          text-align: center;
          padding: 3.5rem 1.5rem;
          background: #fff;
          border-radius: 24px;
          border: 1px dashed rgba(212, 175, 55, 0.4);
          margin: 1.5rem 0;
          box-shadow: 0 8px 30px rgba(0,0,0,0.03);
        }

        .gflow-empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(212, 175, 55, 0.12);
          color: #B8962A;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          margin: 0 auto 1rem;
        }
      `}</style>

      {/* ── 1. HERO SECTION ── */}
      <section className="gflow-hero">
        <div className="gflow-hero-content">
          <div className="gflow-badge-top">
            <i className="fas fa-certificate"></i>
            Plateforme Immobilière Certifiée · Cameroun
          </div>

          <h1 className="gflow-hero-title">
            Trouvez le Logement<br/>
            <span>qui vous ressemble</span>
          </h1>

          <p className="gflow-hero-subtitle">
            Annonces 100% vérifiées par CNI, visites virtuelles 360° et vidéos immersives à Yaoundé et Douala.
          </p>

          {/* Search Capsule */}
          <div className="gflow-search-capsule" onClick={() => setSearchSheetOpen(true)}>
            <div className="gflow-search-icon">
              <i className="fas fa-search"></i>
            </div>
            <input
              type="text"
              className="gflow-search-input"
              value={quickSearchText}
              onChange={(e) => setQuickSearchText(e.target.value)}
              placeholder={typedPlaceholder || "Rechercher une villa, un appartement…"}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => { if (e.key === 'Enter') handleMobileSearchApply(); }}
            />
            <div className="gflow-capsule-actions" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="gflow-filter-btn"
                onClick={() => setSearchSheetOpen(true)}
              >
                <i className="fas fa-sliders-h"></i>
                <span>{t('home.filters')}</span>
              </button>
              <button
                type="button"
                className="gflow-submit-circle"
                onClick={handleMobileSearchApply}
                aria-label="Rechercher"
              >
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>

          {/* Category Chips Strip */}
          <div className="gflow-categories-strip">
            <button
              type="button"
              className={`gflow-cat-chip ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategorySelect('all')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
              </svg>
              <span>Tous les biens</span>
            </button>
            <button
              type="button"
              className="gflow-cat-chip special-reels"
              onClick={() => handleCategorySelect('discovery')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FF4D4D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9.5"></circle>
                <polygon points="10 8 16 12 10 16 10 8" fill="#FF4D4D"></polygon>
              </svg>
              <span>Mode Reels</span>
            </button>
            <button
              type="button"
              className={`gflow-cat-chip ${activeCategory === 'apartment' ? 'active' : ''}`}
              onClick={() => handleCategorySelect('apartment')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2"></rect>
                <line x1="9" y1="6" x2="9.01" y2="6"></line>
                <line x1="15" y1="6" x2="15.01" y2="6"></line>
                <line x1="9" y1="10" x2="9.01" y2="10"></line>
                <line x1="15" y1="10" x2="15.01" y2="10"></line>
                <line x1="9" y1="14" x2="9.01" y2="14"></line>
                <line x1="15" y1="14" x2="15.01" y2="14"></line>
                <path d="M10 22v-4h4v4"></path>
              </svg>
              <span>Appartements</span>
            </button>
            <button
              type="button"
              className={`gflow-cat-chip ${activeCategory === 'villa' ? 'active' : ''}`}
              onClick={() => handleCategorySelect('villa')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 10.5L12 3l9 7.5"></path>
                <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"></path>
                <path d="M10 21v-6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v6"></path>
              </svg>
              <span>Villas</span>
            </button>
            <button
              type="button"
              className={`gflow-cat-chip ${activeCategory === 'studio' ? 'active' : ''}`}
              onClick={() => handleCategorySelect('studio')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"></path>
                <rect x="2" y="11" width="20" height="8" rx="2"></rect>
                <path d="M4 19v2"></path>
                <path d="M20 19v2"></path>
              </svg>
              <span>Studios</span>
            </button>
            <button
              type="button"
              className="gflow-cat-chip"
              onClick={() => handleCategorySelect('map')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                <line x1="8" y1="2" x2="8" y2="18"></line>
                <line x1="16" y1="6" x2="16" y2="22"></line>
              </svg>
              <span>{t('home.interactive_map_live')}</span>
            </button>
            <button
              type="button"
              className="gflow-cat-chip"
              onClick={() => handleCategorySelect('ia')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v3"></path>
                <path d="M12 19v3"></path>
                <rect x="4" y="5" width="16" height="14" rx="4"></rect>
                <circle cx="9" cy="11" r="1.2" fill="currentColor"></circle>
                <circle cx="15" cy="11" r="1.2" fill="currentColor"></circle>
                <path d="M9 15h6"></path>
              </svg>
              <span>{t('home.budget_calculator.badge')}</span>
            </button>
          </div>

          {/* {t('home.reels_discovery')} Feature Card */}
          <div className="gflow-reels-banner reveal">
            <div className="gflow-reels-left">
              <div className="gflow-reels-icon-box">
                <i className="fas fa-play"></i>
              </div>
              <div className="gflow-reels-text">
                <h4>{t('home.reels_discovery_title')}</h4>
                <p>{t('home.reels_discovery_subtitle')}</p>
              </div>
            </div>
            <Link to="/discovery" className="gflow-reels-btn">
              <i className="fas fa-play"></i> Lancer le flux
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. PROPERTIES SECTIONS (FILTRAGE SUR PLACE OU 3 CARROUSELS) ── */}
      <section className="gflow-props-section" id="annonces">

        {isFilterActive ? (
          /* ── VUE FILTRÉE DYNAMIQUE SUR PLACE ── */
          <div className="gflow-filtered-section reveal">
            <div className="gflow-filtered-header">
              <div>
                <span className="gflow-filtered-badge">
                  <i className="fas fa-filter"></i> Filtres appliqués
                </span>
                <h2 className="gflow-filtered-title">Résultats de votre recherche</h2>
                <p className="gflow-filtered-sub">
                  <strong>{filteredProperties.length}</strong> bien{filteredProperties.length > 1 ? 's' : ''} trouvé{filteredProperties.length > 1 ? 's' : ''} sur cette page
                </p>

                {/* Badges des filtres actifs avec suppression au clic */}
                <div className="gflow-filtered-tags">
                  {quickSearchText && (
                    <span className="gflow-filter-tag" onClick={() => setQuickSearchText('')}>
                      <i className="fas fa-search"></i> "{quickSearchText}"
                      <span className="gflow-filter-tag-remove">✕</span>
                    </span>
                  )}
                  {activeCategory === 'apartment' && (
                    <span className="gflow-filter-tag" onClick={() => setActiveCategory('all')}>
                      <i className="fas fa-building"></i> Appartements
                      <span className="gflow-filter-tag-remove">✕</span>
                    </span>
                  )}
                  {activeCategory === 'villa' && (
                    <span className="gflow-filter-tag" onClick={() => setActiveCategory('all')}>
                      <i className="fas fa-home"></i> Villas & Duplex
                      <span className="gflow-filter-tag-remove">✕</span>
                    </span>
                  )}
                  {activeCategory === 'studio' && (
                    <span className="gflow-filter-tag" onClick={() => setActiveCategory('all')}>
                      <i className="fas fa-bed"></i> Studios & Chambres
                      <span className="gflow-filter-tag-remove">✕</span>
                    </span>
                  )}
                  {searchFilters.city && (
                    <span className="gflow-filter-tag" onClick={() => setSearchFilters(s => ({ ...s, city: '' }))}>
                      <i className="fas fa-map-marker-alt"></i> {searchFilters.city}
                      <span className="gflow-filter-tag-remove">✕</span>
                    </span>
                  )}
                  {searchFilters.neighborhood && (
                    <span className="gflow-filter-tag" onClick={() => setSearchFilters(s => ({ ...s, neighborhood: '' }))}>
                      <i className="fas fa-compass"></i> {searchFilters.neighborhood}
                      <span className="gflow-filter-tag-remove">✕</span>
                    </span>
                  )}
                  {searchFilters.transaction_type && (
                    <span className="gflow-filter-tag" onClick={() => setSearchFilters(s => ({ ...s, transaction_type: '' }))}>
                      <i className="fas fa-tag"></i> {searchFilters.transaction_type}
                      <span className="gflow-filter-tag-remove">✕</span>
                    </span>
                  )}
                  {searchFilters.max_price && (
                    <span className="gflow-filter-tag" onClick={() => setSearchFilters(s => ({ ...s, max_price: '' }))}>
                      <i className="fas fa-coins"></i> Max {Number(searchFilters.max_price).toLocaleString('fr-FR')} FCFA
                      <span className="gflow-filter-tag-remove">✕</span>
                    </span>
                  )}
                  {searchFilters.bedrooms && (
                    <span className="gflow-filter-tag" onClick={() => setSearchFilters(s => ({ ...s, bedrooms: '' }))}>
                      <i className="fas fa-door-open"></i> {searchFilters.bedrooms}+ Ch.
                      <span className="gflow-filter-tag-remove">✕</span>
                    </span>
                  )}
                  {searchFilters.has_virtual_tour && (
                    <span className="gflow-filter-tag" onClick={() => setSearchFilters(s => ({ ...s, has_virtual_tour: false }))}>
                      <i className="fas fa-vr-cardboard"></i> Visite 360°
                      <span className="gflow-filter-tag-remove">✕</span>
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="gflow-reset-all-btn"
                onClick={handleMobileSearchReset}
              >
                <i className="fas fa-undo"></i> Réinitialiser les filtres
              </button>
            </div>

            {loadingProperties ? (
              <div className="gflow-filtered-grid">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredProperties.length > 0 ? (
              <div className="gflow-filtered-grid">
                {filteredProperties.map((prop) => (
                  <PropertyCard
                    key={`filtered-${prop.id}`}
                    property={prop}
                    onFavChange={(id, fav) => setFavStates(s => ({ ...s, [id]: fav }))}
                  />
                ))}
              </div>
            ) : (
              <div className="gflow-empty-results">
                <div className="gflow-empty-icon">
                  <i className="fas fa-search-minus"></i>
                </div>
                <h3 style={{ fontFamily: 'Poppins', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px', color: '#0F0D09' }}>
                  Aucun bien ne correspond à vos critères
                </h3>
                <p style={{ color: '#777', fontSize: 13.5, margin: '0 0 1.25rem' }}>
                  Essayez d'élargir votre recherche, de changer de quartier ou de réinitialiser vos filtres.
                </p>
                <button
                  type="button"
                  className="gflow-reset-all-btn"
                  onClick={handleMobileSearchReset}
                >
                  <i className="fas fa-th-large"></i> Afficher tous les biens
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ── VUE INITIALE PAR CARROUSELS THÉMATIQUES ── */
          <>
            {/* 1. COURTS SÉJOURS & MEUBLÉS */}
            {shortTermProperties.length > 0 && (
              <div className="home-carousel-wrapper reveal">
                <div className="horizontal-sec-header">
                  <div>
                    <span className="horizontal-sec-badge" style={{ background: 'rgba(5,150,105,0.14)', color: '#059669' }}>
                      <i className="fas fa-suitcase-rolling"></i> Vacances & Affaires · Court terme
                    </span>
                    <h2 className="horizontal-sec-title">{t('home.short_stay')}</h2>
                    <p className="horizontal-sec-sub">{t('home.short_stay_desc')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleProtectedNavigate('/properties?transaction=COURTE_DUREE')}
                    className="horizontal-sec-link"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Voir tous ({shortTermProperties.length}) →
                  </button>
                </div>

                <button
                  type="button"
                  className="home-carousel-nav-btn prev"
                  onClick={() => scrollManual(shortTermCarouselRef, 'left')}
                  aria-label="Précédent"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button
                  type="button"
                  className="home-carousel-nav-btn next"
                  onClick={() => scrollManual(shortTermCarouselRef, 'right')}
                  aria-label="Suivant"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>

                <div ref={shortTermCarouselRef} className="horizontal-properties-carousel">
                  {loadingProperties ? (
                    [1, 2, 3, 4].map(i => (
                      <div key={i} className="horizontal-carousel-item">
                        <SkeletonCard />
                      </div>
                    ))
                  ) : shortTermProperties.map((prop) => (
                    <div key={`short-${prop.id}`} className="horizontal-carousel-item">
                      <PropertyCard
                        property={prop}
                        onFavChange={(id, fav) => setFavStates(s => ({ ...s, [id]: fav }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. LOGEMENTS À LOUER (LONG TERME) */}
            <div className="home-carousel-wrapper reveal">
              <div className="horizontal-sec-header">
                <div>
                  <span className="horizontal-sec-badge" style={{ background: 'rgba(212,175,55,0.14)', color: '#A8891C' }}>
                    <i className="fas fa-key"></i> Long terme · Location
                  </span>
                  <h2 className="horizontal-sec-title">{t('home.rent')}</h2>
                  <p className="horizontal-sec-sub">{t('home.rent_desc')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleProtectedNavigate('/properties?transaction=LOCATION')}
                  className="horizontal-sec-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Voir tous ({rentalProperties.length}) →
                </button>
              </div>

              <button
                type="button"
                className="home-carousel-nav-btn prev"
                onClick={() => scrollManual(rentalCarouselRef, 'left')}
                aria-label="Précédent"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button
                type="button"
                className="home-carousel-nav-btn next"
                onClick={() => scrollManual(rentalCarouselRef, 'right')}
                aria-label="Suivant"
              >
                <i className="fas fa-chevron-right"></i>
              </button>

              <div ref={rentalCarouselRef} className="horizontal-properties-carousel">
                {loadingProperties ? (
                  [1, 2, 3, 4].map(i => (
                    <div key={i} className="horizontal-carousel-item">
                      <SkeletonCard />
                    </div>
                  ))
                ) : rentalProperties.map((prop) => (
                  <div key={`rent-${prop.id}`} className="horizontal-carousel-item">
                    <PropertyCard
                      property={prop}
                      onFavChange={(id, fav) => setFavStates(s => ({ ...s, [id]: fav }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 3. BIENS À VENDRE (INVESTISSEMENT & ACHAT) */}
            <div className="home-carousel-wrapper reveal">
              <div className="horizontal-sec-header">
                <div>
                  <span className="horizontal-sec-badge" style={{ background: 'rgba(16,185,129,0.14)', color: '#059669' }}>
                    <i className="fas fa-tag"></i> Investissement & Achat · Titré
                  </span>
                  <h2 className="horizontal-sec-title">{t('home.buy')}</h2>
                  <p className="horizontal-sec-sub">{t('home.buy_desc')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleProtectedNavigate('/properties?transaction=VENTE')}
                  className="horizontal-sec-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Voir tous ({saleProperties.length}) →
                </button>
              </div>

              <button
                type="button"
                className="home-carousel-nav-btn prev"
                onClick={() => scrollManual(saleCarouselRef, 'left')}
                aria-label="Précédent"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button
                type="button"
                className="home-carousel-nav-btn next"
                onClick={() => scrollManual(saleCarouselRef, 'right')}
                aria-label="Suivant"
              >
                <i className="fas fa-chevron-right"></i>
              </button>

              <div ref={saleCarouselRef} className="horizontal-properties-carousel">
                {loadingProperties ? (
                  [1, 2, 3, 4].map(i => (
                    <div key={i} className="horizontal-carousel-item">
                      <SkeletonCard />
                    </div>
                  ))
                ) : saleProperties.map((prop) => (
                  <div key={`sale-${prop.id}`} className="horizontal-carousel-item">
                    <PropertyCard
                      property={prop}
                      onFavChange={(id, fav) => setFavStates(s => ({ ...s, [id]: fav }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={() => handleProtectedNavigate('/properties')}
                className="gflow-filter-btn"
                style={{ padding: '12px 28px', fontSize: 14, background: '#0F0D09', color: '#F6D365', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.12)', cursor: 'pointer' }}
              >
                <i className="fas fa-th-large"></i> Parcourir l'ensemble du catalogue ({properties.length || 24}+)
              </button>
            </div>
          </>
        )}
      </section>

      {/* ── SECTION ARCHITECTURE & BTP PRO (Directement après les annonces) ── */}
      <section className="showcase-btp-section reveal" id="btp-section">
        <div className="btp-main-wrap">
          
          {/* Header */}
          <div className="btp-header-block">
            <div className="btp-badge-top">
              <i className="fas fa-hard-hat"></i> Professionnels Certifiés · Architecture &amp; BTP
            </div>
            <h3 style={{ fontFamily: 'Poppins', fontSize: 'clamp(1.7rem, 4vw, 2.4rem)', fontWeight: 800, margin: '0 0 12px', color: '#0F0D09', letterSpacing: '-0.3px' }}>
              Architectes, BTP &amp; <span style={{ color: '#92700C' }}>Mobilier sur-mesure</span>
            </h3>
            <p style={{ color: '#555555', fontSize: 14.5, lineHeight: 1.65, margin: '0 0 1.5rem' }}>
              Explorez les réalisations d'artisans d'élite au Cameroun. Consultez leurs profils librement et demandez un devis garanti avec paiement séquestre.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setBudgetCalculatorOpen(true)}
                style={{
                  background: '#0F0D09',
                  color: '#F6D365',
                  border: '1.5px solid #0F0D09',
                  padding: '9px 18px',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.12)'
                }}
              >
                <i className="fas fa-calculator" style={{ color: '#D4AF37' }}></i>
                <span>{t('home.budget_calculator.title')}</span>
              </button>
              <Link
                to="/architectes"
                style={{
                  color: '#92700C',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                Voir l'annuaire complet →
              </Link>
            </div>
          </div>

          {/* VITRINE DES DERNIERS CHANTIERS PUBLIÉS EN TEMPS RÉEL (AVEC SKELETON LOADER) */}
          {(loadingPros || proProjectsList.length > 0) && (
          <div className="pro-btp-vitrine-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#0F0D09', display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fas fa-hammer" style={{ color: '#D4AF37' }}></i>
                <span>{t('home.showcase_projects')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="pro-mobile-swipe-hint">Glisser ➔</span>
                <Link to="/architectes" style={{ fontSize: 12, color: '#92700C', fontWeight: 700, textDecoration: 'none' }}>
                  Voir tout ({proProjectsList.length}) →
                </Link>
              </div>
            </div>

            {loadingPros ? (
              <div className="pro-btp-projects-grid">
                {[1, 2, 3, 4].map(i => (
                  <SkeletonProProjectCard key={i} />
                ))}
              </div>
            ) : proProjectsList && proProjectsList.length > 0 ? (
              <div ref={proProjectsRailRef} className="pro-btp-projects-grid">
                {proProjectsList.slice(0, 6).map((p, pIdx) => {
                  const imgSrc = getMediaUrl(p.main_image_display || p.main_image_url || p.image, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80');
                  return (
                  <div
                    key={pIdx}
                    className="pro-btp-project-card"
                    onClick={() => setSelectedProjectModal(p)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Zone image — le clic ouvre le modal détail du projet */}
                    <div style={{ position: 'relative', height: 140, background: '#111', overflow: 'hidden' }}>
                      <img
                        src={imgSrc}
                        alt={p.title}
                        onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'; }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      />
                      {/* Badge Avant/Après uniquement si image avant réelle disponible */}
                      {!!(p.before_image_display || p.before_image_url || p.beforeImage) && (
                        <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(15,13,9,0.9)', backdropFilter: 'blur(4px)', color: '#F6D365', padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800, border: '1px solid rgba(212,175,55,0.4)', zIndex: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <i className="fas fa-exchange-alt" style={{ fontSize: 8 }}></i> Avant / Après
                        </div>
                      )}
                      <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', color: '#FFF', padding: '3px 8px', borderRadius: 6, fontSize: 10.5, fontWeight: 700, zIndex: 2 }}>
                        {p.city || p.place || 'Cameroun'}
                      </div>
                    </div>
                    <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 10.5, color: '#AA820A', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                          {p.category}
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 13, color: '#0F0D09', lineHeight: 1.35, marginTop: 4 }}>
                          {p.title}
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTop: '1px solid #E8E3DA', fontSize: 11, color: '#666' }}>
                        <span>Par <strong>{p.author?.name || 'Artisan Piolo'}</strong></span>
                        <span style={{ color: '#D4AF37', fontWeight: 700 }}>Détails →</span>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : null}
          </div>
          )}

          {/* CARTES DES ARTISANS & PROFESSIONNELS CERTIFIÉS (AVEC SKELETON LOADER) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#0F0D09', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fas fa-medal" style={{ color: '#D4AF37' }}></i>
              <span>{t('home.recommended_pros')}</span>
            </div>
            <span className="pro-mobile-swipe-hint">Glisser ➔</span>
          </div>

          {loadingPros ? (
            <div className="pro-btp-pros-grid">
              {[1, 2, 3].map(i => (
                <SkeletonProCard key={i} />
              ))}
            </div>
          ) : prosList.length === 0 ? (
            <div style={{ padding: '28px 20px', borderRadius: 16, border: '1px dashed rgba(212,175,55,0.4)', textAlign: 'center', color: '#64605A', fontSize: 13.5, marginBottom: 24 }}>
              Aucun professionnel certifié n'est encore inscrit. Les premiers artisans apparaîtront ici dès leur validation.
            </div>
          ) : (
            <div ref={proListRailRef} className="pro-btp-pros-grid">
              {prosList.map((pro) => (
                <div
                  key={pro.id}
                  className="pro-btp-pro-card"
                >
                  {/* En-tête photo & badge certifié */}
                  <div style={{ position: 'relative', height: 135, background: '#1A160F' }}>
                    <img
                      src={getMediaUrl(pro.cover, 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80')}
                      alt={pro.name}
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80'; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)' }} />
                    <div style={{ position: 'absolute', top: 10, right: 10, background: '#D4AF37', color: '#0F0D09', padding: '4px 9px', borderRadius: 10, fontSize: 10.5, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 5, zIndex: 2 }}>
                      <i className="fas fa-check-circle"></i>
                      <span>Certifié Piolo</span>
                    </div>
                    <div style={{ position: 'absolute', bottom: -22, left: 16, width: 54, height: 54, borderRadius: '50%', background: pro.avatarBg || 'linear-gradient(135deg, #D4AF37, #AA820A)', color: '#FFF', fontWeight: 800, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #FFF', boxShadow: '0 4px 12px rgba(0,0,0,0.18)', overflow: 'hidden', zIndex: 5 }}>
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

                  {/* Corps de la carte */}
                  <div style={{ padding: '28px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: pro.availColor, fontWeight: 700, marginBottom: 4 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: pro.availColor }} />
                      <span>{pro.availText}</span>
                    </div>

                    <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 16, color: '#0F0D09' }}>
                      {pro.name}
                    </div>

                    <div style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <i className="fas fa-map-marker-alt" style={{ color: '#D4AF37' }}></i>
                      <span>{pro.city}</span>
                    </div>

                    <div style={{ fontSize: 12.5, color: '#555', marginTop: 5, fontWeight: 600 }}>
                      {pro.specialty}
                    </div>

                    {/* Étoiles & avis */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 7, fontSize: 12 }}>
                      <span style={{ color: '#D4AF37', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <i className="fas fa-star" style={{ color: '#D4AF37' }}></i>
                        {pro.rating}
                      </span>
                      <span style={{ color: '#888', fontSize: 11 }}>({pro.reviewsCount} avis)</span>
                    </div>

                    {/* Mini Stats (Projets, Expérience, Devis) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', background: '#FAF9F6', padding: '8px 10px', borderRadius: 10, margin: '10px 0', border: '1px solid #F0ECE4', textAlign: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 12.5, color: '#0F0D09' }}>{pro.projectsCount}</div>
                        <div style={{ fontSize: 9, color: '#888', textTransform: 'uppercase' }}>Projets</div>
                      </div>
                      <div style={{ width: 1, background: '#E8E3DA' }} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 12.5, color: '#0F0D09' }}>{pro.experience}</div>
                        <div style={{ fontSize: 9, color: '#888', textTransform: 'uppercase' }}>Expérience</div>
                      </div>
                      <div style={{ width: 1, background: '#E8E3DA' }} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 12.5, color: '#D4AF37' }}>{pro.pointsRequired}</div>
                        <div style={{ fontSize: 9, color: '#888', textTransform: 'uppercase' }}>Devis</div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
                      {(pro.tags || []).slice(0, 3).map((tag, tIdx) => (
                        <span key={tIdx} style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 8, background: 'rgba(212,175,55,0.12)', color: '#926F08' }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Boutons actions : Devis (garde auth) & Profil (accessible à tous !) */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                      <button
                        type="button"
                        onClick={() => handleRequestQuote(pro)}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)',
                          color: '#0F0D09',
                          border: 'none',
                          padding: '10px 8px',
                          borderRadius: 10,
                          fontWeight: 800,
                          fontSize: 12,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 5,
                          boxShadow: '0 2px 8px rgba(212,175,55,0.3)'
                        }}
                      >
                        <i className="fas fa-file-invoice-dollar"></i>
                        <span>Devis</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedProModal(pro)}
                        style={{
                          flex: 1,
                          background: '#F8F6F0',
                          color: '#0F0D09',
                          border: '1px solid #E8E3DA',
                          padding: '10px 8px',
                          borderRadius: 10,
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 5
                        }}
                      >
                        <i className="fas fa-user-circle"></i>
                        <span>Profil</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: 13, color: '#666666' }}>
            Vous êtes architecte, artisan ou entrepreneur BTP ?{' '}
            <button
              type="button"
              onClick={() => handleProtectedNavigate('/dashboard/pro', 'Connectez-vous pour accéder à votre espace professionnel.')}
              style={{ background: 'none', border: 'none', color: '#92700C', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
            >
              Rejoindre le réseau Piolo Pro →
            </button>
          </div>

        </div>
      </section>

      {/* ── 3. VISITE VIRTUELLE 360° INTERACTIVE ── */}
      <section className="showcase-3d-section reveal" id="visite-3d">
        <div className="showcase-3d-wrap">
          <div>
            <span style={{ color: '#F6D365', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              <i className="fas fa-vr-cardboard"></i> Immersion Totale 360°
            </span>
            <h3 style={{ fontFamily: 'Poppins', fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 800, margin: '8px 0 12px', color: '#FFF' }}>
              Explorez chaque pièce à 360° sans vous déplacer
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 1.65, marginBottom: 20 }}>
              Inspectez les finitions, la luminosité naturelle, les volumes et l'état général du logement avant de planifier une visite sur place.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleProtectedNavigate('/properties?has_virtual_tour=true')}
                className="gflow-filter-btn"
                style={{ background: 'linear-gradient(135deg, #D4AF37, #F6D365)', color: '#0F0D09', border: 'none', padding: '10px 22px', cursor: 'pointer' }}
              >
                <i className="fas fa-play"></i> Découvrir les biens 360°
              </button>
            </div>
          </div>

          <div className="showcase-3d-frame">
            <div className="showcase-3d-image-box">
              <img src={roomImages[activeRoom]} alt={roomNames[activeRoom]} />
              <div className="showcase-3d-badge">
                <i className="fas fa-compass fa-spin" style={{ animationDuration: '10s' }}></i> {roomNames[activeRoom]}
              </div>
            </div>
            <div className="showcase-3d-nav">
              {Object.keys(roomNames).map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`showcase-3d-nav-btn ${activeRoom === k ? 'active' : ''}`}
                  onClick={() => setActiveRoom(k)}
                >
                  {roomNames[k].split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. CARTE INTERACTIVE & QUARTIERS POPULAIRES ── */}
      <section className="showcase-map-section reveal" id="carte">
        <div className="showcase-map-grid">
          <div
            className="showcase-map-preview"
            onClick={() => handleProtectedNavigate('/map')}
          >
            <div
              className="showcase-map-bg-grid"
              style={{
                filter: (!isAuthenticated || !user) ? 'blur(6px)' : 'none',
                transform: (!isAuthenticated || !user) ? 'scale(1.05)' : 'none',
                transition: 'all 0.3s ease'
              }}
            ></div>

            <div
              style={{
                filter: (!isAuthenticated || !user) ? 'blur(4px)' : 'none',
                pointerEvents: (!isAuthenticated || !user) ? 'none' : 'auto'
              }}
            >
              <div className="showcase-pin" style={{ top: '35%', left: '38%' }}>
                <i className="fas fa-map-marker-alt"></i>
                <span>Bastos · 250k</span>
              </div>
              <div className="showcase-pin" style={{ top: '55%', left: '68%' }}>
                <i className="fas fa-map-marker-alt"></i>
                <span>Bonapriso · 180k</span>
              </div>
              <div className="showcase-pin" style={{ top: '65%', left: '30%' }}>
                <i className="fas fa-map-marker-alt"></i>
                <span>Akwa · 90k</span>
              </div>
            </div>

            {/* Lock Overlay for Unauthenticated Users */}
            {(!isAuthenticated || !user) ? (
              <div className="showcase-map-lock-overlay">
                <div className="showcase-map-lock-icon">
                  <i className="fas fa-lock"></i>
                </div>
                <h4 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 800, margin: '0 0 6px', color: '#fff' }}>
                  {t('home.interactive_map')} protégée
                </h4>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '0 0 15px', maxWidth: 320, lineHeight: 1.5 }}>
                  Connectez-vous pour débloquer la carte interactive, filtrer par quartier et calculer vos itinéraires.
                </p>
                <button
                  type="button"
                  className="showcase-map-login-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/login', { state: { from: '/map' } });
                  }}
                >
                  <i className="fas fa-sign-in-alt"></i> Se connecter pour voir la carte
                </button>
              </div>
            ) : (
              <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.8)', color: '#F6D365', padding: '6px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 700, zIndex: 10 }}>
                <i className="fas fa-hand-pointer"></i> Toucher pour ouvrir la carte plein écran
              </div>
            )}
          </div>

          <div>
            <span style={{ color: '#B8962A', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              <i className="fas fa-map-marked-alt"></i> Géolocalisation Intelligente
            </span>
            <h3 style={{ fontFamily: 'Poppins', fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 800, margin: '8px 0 12px', color: '#0F0D09' }}>
              Trouvez votre quartier idéal en quelques secondes
            </h3>
            <p style={{ color: '#666', fontSize: 14, lineHeight: 1.65, marginBottom: 20 }}>
              Visualisez les écoles, commerces, axes routiers et commodités autour de votre futur logement à Yaoundé et Douala.
            </p>
            <button
              type="button"
              onClick={() => handleProtectedNavigate('/map')}
              className="gflow-filter-btn"
              style={{ background: '#0F0D09', color: '#F6D365', border: 'none', padding: '10px 22px', cursor: 'pointer' }}
            >
              <i className="fas fa-map-marked-alt"></i> Explorer la carte plein écran
            </button>
          </div>
        </div>
      </section>

      {/* ── 5. ESTIMATEUR DE LOYER IA ── */}
      <section className="showcase-ia-section reveal" id="estimateur-ia">
        <div className="showcase-ia-wrap">
          <div>
            <span style={{ color: '#F6D365', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              <i className="fas fa-robot"></i> Intelligence Artificielle Piolo
            </span>
            <h3 style={{ fontFamily: 'Poppins', fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 800, margin: '8px 0 12px', color: '#FFF' }}>
              Simulez la juste valeur de marché en temps réel
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 1.65, marginBottom: 20 }}>
              Algorithme entraîné sur les transactions réelles au Cameroun pour vous garantir un loyer équitable sans mauvaises surprises.
            </p>
            <Link
              to={authLink}
              className="gflow-filter-btn"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #F6D365)', color: '#0F0D09', border: 'none', padding: '10px 22px' }}
            >
              <i className="fas fa-calculator"></i> Estimation complète de mon bien
            </Link>
          </div>

          <div className="showcase-ia-card">
            <div className="ia-slider-group">
              <div className="ia-slider-label">
                <span>{t('home.budget_calculator.neighborhood')}</span>
                <strong>{iaQuarter.toUpperCase()}</strong>
              </div>
              <select
                value={iaQuarter}
                onChange={(e) => setIaQuarter(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontSize: 13 }}
              >
                <option value="bastos" style={{ color: '#000' }}>Bastos (Yaoundé)</option>
                <option value="bonapriso" style={{ color: '#000' }}>Bonapriso (Douala)</option>
                <option value="akwa" style={{ color: '#000' }}>Akwa (Douala)</option>
                <option value="odza" style={{ color: '#000' }}>Odza (Yaoundé)</option>
                <option value="bonamoussadi" style={{ color: '#000' }}>Bonamoussadi (Douala)</option>
                <option value="ngousso" style={{ color: '#000' }}>Ngousso (Yaoundé)</option>
              </select>
            </div>

            <div className="ia-slider-group">
              <div className="ia-slider-label">
                <span>{t('home.budget_calculator.surface')}</span>
                <strong>{iaSurface} m²</strong>
              </div>
              <input
                type="range"
                min="25"
                max="300"
                step="5"
                value={iaSurface}
                onChange={(e) => setIaSurface(Number(e.target.value))}
                className="ia-range"
              />
            </div>

            <div className="ia-slider-group">
              <div className="ia-slider-label">
                <span>{t('home.budget_calculator.rooms')}</span>
                <strong>{iaRooms} ch.</strong>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={iaRooms}
                onChange={(e) => setIaRooms(Number(e.target.value))}
                className="ia-range"
              />
            </div>

            <div className="ia-result-box">
              <small>{t('home.budget_calculator.estimated_rent')}</small>
              <div className="ia-result-price">
                {calculateEstimatedRent().min} – {calculateEstimatedRent().max} FCFA
              </div>
              <div style={{ color: '#10B981', fontSize: 12, fontWeight: 700 }}>
                <i className="fas fa-check-circle"></i> Données temps réel du marché
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. SÉCURITÉ & CNI EN 4 ÉTAPES ── */}
      <section className="showcase-security-section reveal" id="securite">
        <div style={{ textAlign: 'center', maxWidth: 650, margin: '0 auto 2rem' }}>
          <span style={{ color: '#B8962A', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            <i className="fas fa-shield-alt"></i> Sécurité & Garantie
          </span>
          <h3 style={{ fontFamily: 'Poppins', fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 800, margin: '8px 0 10px', color: '#0F0D09' }}>
            Une expérience 100% sécurisée
          </h3>
          <p style={{ color: '#666', fontSize: 14, margin: 0 }}>
            Nous vérifions chaque acteur de la plateforme pour éliminer les arnaques et sécuriser vos dépôts.
          </p>
        </div>

        <div className="sec-pillars-grid">
          <div className="sec-pillar-card">
            <div className="sec-pillar-icon"><i className="fas fa-id-card"></i></div>
            <h4>{t('home.trusted_pillars.cni_verified')}</h4>
            <p>{t('home.trusted_pillars.cni_verified_desc')}</p>
          </div>
          <div className="sec-pillar-card">
            <div className="sec-pillar-icon"><i className="fas fa-user-check"></i></div>
            <h4>{t('home.trusted_pillars.audit_visit')}</h4>
            <p>{t('home.trusted_pillars.audit_visit_desc')}</p>
          </div>
          <div className="sec-pillar-card">
            <div className="sec-pillar-icon"><i className="fas fa-file-contract"></i></div>
            <h4>{t('home.trusted_pillars.legal_contract')}</h4>
            <p>{t('home.trusted_pillars.legal_contract_desc')}</p>
          </div>
          <div className="sec-pillar-card">
            <div className="sec-pillar-icon"><i className="fas fa-lock"></i></div>
            <h4>{t('home.trusted_pillars.secure_deposit')}</h4>
            <p>{t('home.trusted_pillars.secure_deposit_desc')}</p>
          </div>
        </div>
      </section>

      {/* ── 8. POINTS & MOBILE MONEY ── */}
      <section style={{ maxWidth: 1280, margin: '3rem auto', padding: '0 1.25rem' }}>
        <div style={{
          background: '#fff',
          borderRadius: 24,
          padding: '1.75rem',
          border: '1px solid #E8E4DC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
          boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #D4AF37, #F6D365)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0F0D09',
              fontSize: 22,
              flexShrink: 0
            }}>
              <i className="fas fa-coins"></i>
            </div>
            <div>
              <h4 style={{ fontFamily: 'Poppins', fontSize: 16, fontWeight: 800, margin: '0 0 4px', color: '#0F0D09' }}>
                Rechargez vos points via Orange Money & MTN MoMo
              </h4>
              <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
                Débloquez les contacts directs, lancez les visites 3D et obtenez les analyses de marché.
              </p>
            </div>
          </div>
          <Link
            to={authLink}
            className="gflow-filter-btn"
            style={{ background: '#0F0D09', color: '#F6D365', border: 'none', padding: '10px 22px' }}
          >
            <i className="fas fa-wallet"></i> Voir mes points ({user?.points || 0} pts)
          </Link>
        </div>
      </section>

      {/* ── 9. FOOTER COMPLET ── */}
      <footer style={{ background: '#0F0D09', color: '#fff', padding: '3.5rem 1.25rem 2rem', borderTop: '1px solid rgba(212,175,55,0.2)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32, marginBottom: 24 }}>
          <div>
            <span style={{ fontFamily: 'Poppins', fontSize: 24, fontWeight: 900, color: '#F6D365', display: 'block', marginBottom: 10 }}>
              Piolo
            </span>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
              Plateforme Immobilière Numérique d'Excellence au Cameroun. Louez, achetez et visitez en toute sécurité.
            </p>
          </div>
          <div>
            <h5 style={{ fontFamily: 'Poppins', fontSize: 14, fontWeight: 700, color: '#FFF', marginBottom: 12 }}>Navigation</h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <li><Link to="/properties" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}><i className="fas fa-chevron-right" style={{ fontSize: 10, marginRight: 6, color: '#D4AF37' }}></i> {t('home.all_properties')}</Link></li>
              <li><Link to="/discovery" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}><i className="fas fa-chevron-right" style={{ fontSize: 10, marginRight: 6, color: '#D4AF37' }}></i> {t('home.reels_discovery')}</Link></li>
              <li><Link to="/map" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}><i className="fas fa-chevron-right" style={{ fontSize: 10, marginRight: 6, color: '#D4AF37' }}></i> {t('home.interactive_map')}</Link></li>
              <li><Link to={authLink} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}><i className="fas fa-chevron-right" style={{ fontSize: 10, marginRight: 6, color: '#D4AF37' }}></i> {t('home.publish_listing')}</Link></li>
            </ul>
          </div>
          <div>
            <h5 style={{ fontFamily: 'Poppins', fontSize: 14, fontWeight: 700, color: '#FFF', marginBottom: 12 }}>{t('home.contact_support')}</h5>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 6px' }}><i className="fas fa-map-marker-alt" style={{ marginRight: 8, color: '#D4AF37' }}></i> Yaoundé & Douala, Cameroun</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0 }}><i className="fas fa-comments" style={{ marginRight: 8, color: '#D4AF37' }}></i> {t('home.support_desc')}</p>
          </div>
        </div>
        <div style={{ maxWidth: 1280, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
          © {new Date().getFullYear()} Piolo. Tous droits réservés.
        </div>
      </footer>

      {/* ── 10. MOBILE SEARCH SHEET ── */}
      <PropertySearchSheet
        isOpen={searchSheetOpen}
        onClose={() => setSearchSheetOpen(false)}
        filters={searchFilters}
        onChange={(f) => setSearchFilters(s => ({ ...s, ...f }))}
        onApply={handleMobileSearchApply}
        onReset={handleMobileSearchReset}
      />

      {/* ── 11. MODALS PRO & BTP ── */}
      {selectedProModal && (
        <ProProfileDetailModal
          pro={selectedProModal}
          currentUser={user}
          onClose={() => setSelectedProModal(null)}
          onSelectProject={(proj) => setSelectedProjectModal(proj)}
          onRequestQuote={(pro) => handleRequestQuote(pro)}
        />
      )}

      {selectedProjectModal && (
        <ProProjectDetailModal
          project={selectedProjectModal}
          currentUser={user}
          onClose={() => setSelectedProjectModal(null)}
          onRequestQuote={(proj) => {
            setSelectedProjectModal(null);
            handleRequestQuote(proj.author || selectedProModal || proj, proj);
          }}
          onOrderEscrow={(proj) => {
            setSelectedProjectModal(null);
            handleOrderEscrow(proj);
          }}
        />
      )}

      {quoteModalPro && (
        <ProQuoteRequestModal
          proData={quoteModalPro}
          projectData={quoteModalProject}
          onClose={() => {
            setQuoteModalPro(null);
            setQuoteModalProject(null);
          }}
          onSubmitSuccess={(quote) => {
            alert("Votre demande de devis a été transmise avec succès à l'artisan.");
            setQuoteModalPro(null);
            setQuoteModalProject(null);
          }}
        />
      )}

      {budgetCalculatorOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,13,9,0.85)', backdropFilter: 'blur(8px)', zIndex: 50000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 760, maxHeight: '92vh', overflowY: 'auto' }}>
            <ProBudgetCalculator
              onClose={() => setBudgetCalculatorOpen(false)}
              onRequestQuote={() => {
                setBudgetCalculatorOpen(false);
                handleRequestQuote({ name: 'Projet Travaux & Rénovation' });
              }}
            />
          </div>
        </div>
      )}

      {escrowModalData && (
        <ProEscrowModal
          projectData={escrowModalData}
          onClose={() => setEscrowModalData(null)}
          onSuccess={() => {
            alert("Commande sécurisée initiée avec succès !");
            setEscrowModalData(null);
          }}
        />
      )}

      {/* ── LIGHTBOX PLEIN ÉCRAN (Photos BTP) ── */}
      {lightboxImg && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Vue agrandie de la photo"
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(5,4,3,0.97)',
            backdropFilter: 'blur(12px)',
            zIndex: 60000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setLightboxImg(null)}
        >
          {/* Bouton fermer */}
          <button
            onClick={() => setLightboxImg(null)}
            style={{
              position: 'absolute', top: 18, right: 18,
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
              color: '#FFF', width: 44, height: 44, borderRadius: '50%',
              cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center',
              justifyContent: 'center', backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 18px rgba(0,0,0,0.4)', zIndex: 2,
              transition: 'background 0.2s'
            }}
            aria-label="Fermer"
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <i className="fas fa-times"></i>
          </button>

          {/* Image */}
          <img
            src={lightboxImg.src}
            alt={lightboxImg.title}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '92vw',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: 14,
              boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
              border: '1.5px solid rgba(212,175,55,0.18)',
              animation: 'lightboxFadeIn 0.28s cubic-bezier(0.34,1.56,0.64,1)'
            }}
          />

          {/* Légende */}
          {(lightboxImg.title || lightboxImg.caption) && (
            <div
              onClick={e => e.stopPropagation()}
              style={{
                marginTop: 20, textAlign: 'center', color: 'rgba(255,255,255,0.9)',
                maxWidth: 560
              }}
            >
              {lightboxImg.title && (
                <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 16, marginBottom: 6 }}>
                  {lightboxImg.title}
                </div>
              )}
              {lightboxImg.caption && (
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.2px' }}>
                  {lightboxImg.caption}
                </div>
              )}
            </div>
          )}

          {/* Touche ESC hint */}
          <div style={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
            Appuyer sur <kbd style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '1px 6px', borderRadius: 4 }}>Échap</kbd> ou cliquer en dehors pour fermer
          </div>

          <style>{`
            @keyframes lightboxFadeIn {
              from { opacity: 0; transform: scale(0.88); }
              to   { opacity: 1; transform: scale(1); }
            }
            .pro-btp-project-card:hover .btp-zoom-icon { opacity: 1 !important; }
          `}</style>
        </div>
      )}
    </div>
  );
}
