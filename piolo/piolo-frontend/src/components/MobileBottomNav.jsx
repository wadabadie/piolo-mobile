import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { prefetchRoute } from "../utils/prefetch";
import "./AppSidebar.css";

const Ico = ({ d, size = 20 }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className="bottom-nav-icon"><path d={d}/></svg>
);

const PATHS = {
  home_loc: "/dashboard/locataire",
  home_bai: "/dashboard/bailleur",
  home_pro: "/dashboard/pro",
  portfolio: "/dashboard/pro?tab=portfolio",
  create_pro: "/dashboard/pro?action=new_project",
  devis:    "/dashboard/pro?tab=devis",
  profil_pro: "/dashboard/pro?tab=profil",
  search:   "/properties",
  my_props: "/properties?owner=mine",
  create:   "/properties/create",
  disc:     "/decouverte",
  fav:      "/favoris",
  visits:   "/visites",
  locations:"/locations",
  alerts:   "/alertes",
  msg:      "/messages",
  map:      "/map",
  archi:    "/architectes",
  profil:   "/profil",
  sec:      "/securite",
  cal:      "/calendrier",
  sup:      "/support",
};

export default function MobileBottomNav({ unreadMessages = 0, upcomingVisits = 0, savedCount = 0 }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);

  const isBailleur = user?.role === "BAILLEUR" || user?.is_bailleur;
  const isPro = user?.role === "ARCHITECTE" || user?.role === "PRO" || user?.role === "PROFESSIONNEL" || user?.is_architecte || user?.is_pro;

  const isActive = (path) => {
    if (path === PATHS.home_bai || path === PATHS.home_loc || path === PATHS.home_pro) {
      return location.pathname === path && !location.search;
    }
    if (path.includes('?tab=')) {
      const [base, query] = path.split('?');
      return location.pathname === base && location.search.includes(query);
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setShowMore(false);
    setHidden(false);
  }, [location.pathname]);

  useEffect(() => {
    let lastScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    let ticking = false;

    const handleScroll = (e) => {
      let currentScrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      if (e && e.target && e.target !== document && e.target !== window && typeof e.target.scrollTop === 'number') {
        if (e.target.scrollTop > 0 || currentScrollY === 0) {
          currentScrollY = e.target.scrollTop;
        }
      }

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (currentScrollY < 20) {
            setHidden(false);
            lastScrollY = currentScrollY;
            ticking = false;
            return;
          }

          const diff = currentScrollY - lastScrollY;
          if (Math.abs(diff) > 6) {
            if (diff > 0 && currentScrollY > 35) {
              setHidden(true); // Scroll vers le bas -> disparaît
            } else if (diff < 0) {
              setHidden(false); // Scroll vers le haut -> réapparaît
            }
            lastScrollY = currentScrollY;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    document.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      document.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, []);

  useEffect(() => {
    if (showMore) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [showMore]);

  // Initialiser bn-visible au montage et nettoyer au démontage
  const isDiscovery = location.pathname === '/decouverte' || location.pathname.startsWith('/decouverte');

  useEffect(() => {
    if (!isDiscovery) {
      document.body.classList.add('bn-visible');
    } else {
      document.body.classList.remove('bn-visible');
    }
    return () => { document.body.classList.remove('bn-visible'); };
  }, [isDiscovery]);

  if (!user || isDiscovery) return null;

  return (
    <>
      <nav className={`mobile-bottom-nav${(hidden && !showMore) ? " bn-hidden" : ""}`} aria-label="Navigation principale mobile">
        <ul className="bottom-nav-list">
          {isPro ? (
            /* ── PROFESSIONNEL BOTTOM BAR ── */
            <>
              {/* 1. Accueil Pro */}
              <li className="bottom-nav-item">
                <Link to={PATHS.home_pro} className={`bottom-nav-link${isActive(PATHS.home_pro) ? " active" : ""}`}>
                  <Ico d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  <span>{t('nav.home', 'Accueil Pro')}</span>
                </Link>
              </li>

              {/* 2. Mon Portfolio */}
              <li className="bottom-nav-item">
                <Link to={PATHS.portfolio} className={`bottom-nav-link${isActive(PATHS.portfolio) ? " active" : ""}`}>
                  <div style={{ position: "relative", display: "inline-flex" }}>
                    <Ico d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
                  </div>
                  <span>{t('nav.portfolio', 'Portfolio')}</span>
                </Link>
              </li>

              {/* 3. Nouveau Projet / Chantier (Centre Pop-out Doré) */}
              <li className="bottom-nav-item center-item">
                <Link to={PATHS.create_pro} className={`bottom-nav-link${isActive(PATHS.create_pro) ? " active" : ""}`}>
                  <div className="center-icon-wrapper">
                    <Ico d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" size={20}/>
                  </div>
                  <span>{t('nav.site', 'Chantier')}</span>
                </Link>
              </li>

              {/* 4. Demandes de Devis */}
              <li className="bottom-nav-item">
                <Link to={PATHS.devis} className={`bottom-nav-link${isActive(PATHS.devis) ? " active" : ""}`}>
                  <div style={{ position: "relative", display: "inline-flex" }}>
                    <Ico d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                    {unreadMessages > 0 && <span className="bottom-nav-badge">{unreadMessages}</span>}
                  </div>
                  <span>{t('nav.quotes', 'Devis')}</span>
                </Link>
              </li>

              {/* 5. Plus Pro */}
              <li className="bottom-nav-item">
                <button className={`bottom-nav-link${showMore ? " active" : ""}`} onClick={() => setShowMore(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Ico d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  <span>{t('common.more', 'Plus')}</span>
                </button>
              </li>
            </>
          ) : isBailleur ? (
            /* ── BAILLEUR BOTTOM BAR ── */
            <>
              {/* 1. Accueil Bailleur */}
              <li className="bottom-nav-item">
                <Link to={PATHS.home_bai} className={`bottom-nav-link${isActive(PATHS.home_bai) ? " active" : ""}`}>
                  <Ico d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                  <span>{t('nav.home', 'Accueil')}</span>
                </Link>
              </li>

              {/* 2. Demandes de location & visites */}
              <li className="bottom-nav-item">
                <Link to={PATHS.locations} className={`bottom-nav-link${isActive(PATHS.locations) ? " active" : ""}`}>
                  <div style={{ position: "relative", display: "inline-flex" }}>
                    <Ico d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                  </div>
                  <span>{t('nav.my_locations', 'Locations')}</span>
                </Link>
              </li>

              {/* 3. Publier un bien (Centre Pop-out Doré) */}
              <li className="bottom-nav-item center-item">
                <Link to={PATHS.create} className={`bottom-nav-link${isActive(PATHS.create) ? " active" : ""}`}>
                  <div className="center-icon-wrapper">
                    <Ico d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" size={20}/>
                  </div>
                  <span>{t('nav.publish_short', 'Publier')}</span>
                </Link>
              </li>

              {/* 4. Messages */}
              <li className="bottom-nav-item">
                <Link to={PATHS.msg} className={`bottom-nav-link${isActive(PATHS.msg) ? " active" : ""}`}>
                  <div style={{ position: "relative", display: "inline-flex" }}>
                    <Ico d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    {unreadMessages > 0 && <span className="bottom-nav-badge">{unreadMessages}</span>}
                  </div>
                  <span>{t('nav.messages', 'Messages')}</span>
                </Link>
              </li>

              {/* 5. Plus */}
              <li className="bottom-nav-item">
                <button className={`bottom-nav-link${showMore ? " active" : ""}`} onClick={() => setShowMore(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Ico d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  <span>{t('common.more', 'Plus')}</span>
                </button>
              </li>
            </>
          ) : (
            /* ── LOCATAIRE BOTTOM BAR ── */
            <>
              {/* 1. Accueil Locataire */}
              <li className="bottom-nav-item">
                <Link
                  to={PATHS.home_loc}
                  onMouseEnter={() => prefetchRoute(PATHS.home_loc)}
                  onTouchStart={() => prefetchRoute(PATHS.home_loc)}
                  className={`bottom-nav-link${isActive(PATHS.home_loc) ? " active" : ""}`}
                >
                  <Ico d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  <span>{t('nav.home', 'Accueil')}</span>
                </Link>
              </li>

              {/* 2. Recherche */}
              <li className="bottom-nav-item">
                <Link
                  to={PATHS.search}
                  onMouseEnter={() => prefetchRoute(PATHS.search)}
                  onTouchStart={() => prefetchRoute(PATHS.search)}
                  className={`bottom-nav-link${isActive(PATHS.search) ? " active" : ""}`}
                >
                  <Ico d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  <span>{t('nav.search', 'Recherche')}</span>
                </Link>
              </li>

              {/* 3. Découverte (Centre Pop-out Play) */}
              <li className="bottom-nav-item center-item">
                <Link
                  to={PATHS.disc}
                  onMouseEnter={() => prefetchRoute(PATHS.disc)}
                  onTouchStart={() => prefetchRoute(PATHS.disc)}
                  className={`bottom-nav-link${isActive(PATHS.disc) ? " active" : ""}`}
                >
                  <div className="center-icon-wrapper">
                    <Ico d="M8 5v14l11-7z" size={20}/>
                  </div>
                  <span>{t('nav.reels', 'Reels')}</span>
                </Link>
              </li>

              {/* 4. Messages */}
              <li className="bottom-nav-item">
                <Link
                  to={PATHS.msg}
                  onMouseEnter={() => prefetchRoute(PATHS.msg)}
                  onTouchStart={() => prefetchRoute(PATHS.msg)}
                  className={`bottom-nav-link${isActive(PATHS.msg) ? " active" : ""}`}
                >
                  <div style={{ position: "relative", display: "inline-flex" }}>
                    <Ico d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    {unreadMessages > 0 && <span className="bottom-nav-badge">{unreadMessages}</span>}
                  </div>
                  <span>{t('nav.messages', 'Messages')}</span>
                </Link>
              </li>

              {/* 5. Plus */}
              <li className="bottom-nav-item">
                <button className={`bottom-nav-link${showMore ? " active" : ""}`} onClick={() => setShowMore(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Ico d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  <span>{t('common.more', 'Plus')}</span>
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* Slide-up "Plus" sheet (Menu complet sur mobile) */}
      {showMore && (
        <>
          <div className="bn-more-overlay" onClick={() => setShowMore(false)} />
          <div className="bn-more-sheet">
            <div className="bn-more-title">{isBailleur ? t('nav.bailleur_nav', 'Navigation Bailleur') : (isPro ? t('nav.pro_nav', 'Navigation Professionnel') : t('nav.tenant_nav', 'Navigation Locataire'))}</div>

            <div className="bn-more-grid">
              {isPro ? (
                /* ── OPTIONS EXCLUSIVES PROFESSIONNEL ── */
                <>
                  <Link to={PATHS.disc} className={`bn-more-item${isActive(PATHS.disc) ? " active" : ""}`} onClick={() => setShowMore(false)} style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.14), rgba(246,211,101,0.24))', border: '1px solid rgba(212,175,55,0.4)', gridColumn: 'span 2' }}>
                    <span className="bn-more-icon" style={{ color: '#D4AF37' }}><Ico d="M8 5v14l11-7z" size={26}/></span>
                    <strong>{t('nav.discovery_mode', 'Mode Découverte (Reels)')}</strong>
                  </Link>
                  <Link to={PATHS.portfolio} className={`bn-more-item${isActive(PATHS.portfolio) ? " active" : ""}`} onClick={() => setShowMore(false)}>
                    <span className="bn-more-icon"><Ico d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" size={26}/></span>
                    {t('nav.portfolio_site', 'Portfolio & Chantiers')}
                  </Link>
                  <Link to={PATHS.devis} className={`bn-more-item${isActive(PATHS.devis) ? " active" : ""}`} onClick={() => setShowMore(false)}>
                    <span className="bn-more-icon"><Ico d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" size={26}/></span>
                    {t('nav.quotes_requests', 'Demandes de Devis')}
                  </Link>
                  <Link to={PATHS.profil_pro} className={`bn-more-item${isActive(PATHS.profil_pro) ? " active" : ""}`} onClick={() => setShowMore(false)}>
                    <span className="bn-more-icon"><Ico d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" size={26}/></span>
                    {t('nav.pro_config', 'Configuration Métier')}
                  </Link>
                  <Link to={PATHS.archi} className={`bn-more-item${isActive(PATHS.archi) ? " active" : ""}`} onClick={() => setShowMore(false)}>
                    <span className="bn-more-icon"><Ico d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" size={26}/></span>
                    {t('nav.professionals', 'Annuaire des Pros')}
                  </Link>
                  <Link to={PATHS.profil} className={`bn-more-item${isActive(PATHS.profil) ? " active" : ""}`} onClick={() => setShowMore(false)}>
                    <span className="bn-more-icon"><Ico d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" size={26}/></span>
                    {t('dashboard.my_profile', 'Mon Profil')}
                  </Link>
                  <Link to={PATHS.sec} className={`bn-more-item${isActive(PATHS.sec) ? " active" : ""}`} onClick={() => setShowMore(false)}>
                    <span className="bn-more-icon"><Ico d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" size={26}/></span>
                    {t('nav.security', 'Sécurité')}
                  </Link>
                  <Link to={PATHS.sup} className={`bn-more-item${isActive(PATHS.sup) ? " active" : ""}`} onClick={() => setShowMore(false)}>
                    <span className="bn-more-icon"><Ico d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" size={26}/></span>
                    {t('nav.support', 'Aide & Support')}
                  </Link>
                </>
              ) : isBailleur ? (
                /* ── OPTIONS EXCLUSIVES BAILLEUR ── */
                <>
                  <Link to={PATHS.disc} className={`bn-more-item${isActive(PATHS.disc) ? " active" : ""}`} onClick={() => setShowMore(false)} style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.14), rgba(246,211,101,0.24))', border: '1px solid rgba(212,175,55,0.4)', gridColumn: 'span 2' }}>
                    <span className="bn-more-icon" style={{ color: '#D4AF37' }}><Ico d="M8 5v14l11-7z" size={26}/></span>
                    <strong>{t('nav.discovery_mode', 'Mode Découverte (Reels)')}</strong>
                  </Link>
                  <Link to={PATHS.visits} className={`bn-more-item${isActive(PATHS.visits) ? " active" : ""}`} onClick={() => setShowMore(false)}>
                    <span className="bn-more-icon"><Ico d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z" size={26}/></span>
                    {t('nav.my_visits', 'Demandes de visite')}
                  </Link>
                  <Link to={PATHS.locations} className={`bn-more-item${isActive(PATHS.locations) ? " active" : ""}`} onClick={() => setShowMore(false)}>
                    <span className="bn-more-icon"><Ico d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" size={26}/></span>
                    {t('nav.my_locations', 'Demandes de location')}
                  </Link>
                  <Link to={PATHS.my_props} className={`bn-more-item${isActive(PATHS.my_props) ? " active" : ""}`} onClick={() => setShowMore(false)}>
                    <span className="bn-more-icon"><Ico d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" size={26}/></span>
                    {t('nav.my_properties', 'Toutes mes annonces')}
                  </Link>
                  <Link to={`${PATHS.home_bai}#archived`} className="bn-more-item" onClick={() => setShowMore(false)}>
                    <span className="bn-more-icon"><Ico d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z" size={26}/></span>
                    {t('dashboard.archived_properties', 'Annonces archivées')}
                  </Link>
                  <Link to={PATHS.cal} className={`bn-more-item${isActive(PATHS.cal) ? " active" : ""}`} onClick={() => setShowMore(false)}>
                    <span className="bn-more-icon"><Ico d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" size={26}/></span>
                    {t('nav.calendar', 'Calendrier')}
                  </Link>
                  <Link to={PATHS.archi} className={`bn-more-item${isActive(PATHS.archi) ? " active" : ""}`} onClick={() => setShowMore(false)}>
                    <span className="bn-more-icon"><Ico d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" size={26}/></span>
                    {t('nav.professionals', 'Pros & Artisans')}
                  </Link>
                  <Link to={PATHS.profil} className={`bn-more-item${isActive(PATHS.profil) ? " active" : ""}`} onClick={() => setShowMore(false)}>
                    <span className="bn-more-icon"><Ico d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" size={26}/></span>
                    {t('dashboard.my_profile', 'Mon Profil')}
                  </Link>
                  <Link to={PATHS.sec} className={`bn-more-item${isActive(PATHS.sec) ? " active" : ""}`} onClick={() => setShowMore(false)}>
                    <span className="bn-more-icon"><Ico d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" size={26}/></span>
                    {t('nav.security', 'Sécurité')}
                  </Link>
                  <Link to={PATHS.sup} className={`bn-more-item${isActive(PATHS.sup) ? " active" : ""}`} onClick={() => setShowMore(false)}>
                    <span className="bn-more-icon"><Ico d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" size={26}/></span>
                    {t('nav.support', 'Aide & Support')}
                  </Link>
                </>
              ) : (
                /* ── OPTIONS EXCLUSIVES LOCATAIRE ── */
                <>
                  <Link to={PATHS.disc} className={`bn-more-item${isActive(PATHS.disc) ? " active" : ""}`} onClick={() => setShowMore(false)} style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.14), rgba(246,211,101,0.24))', border: '1px solid rgba(212,175,55,0.4)', gridColumn: 'span 2' }}>
                    <span className="bn-more-icon" style={{ color: '#D4AF37' }}><Ico d="M8 5v14l11-7z" size={26}/></span>
                    <strong>{t('nav.discovery_mode', 'Mode Découverte (Reels)')}</strong>
                  </Link>
                  <Link to={PATHS.search} className={`bn-more-item${isActive(PATHS.search) ? " active" : ""}`} onClick={() => setShowMore(false)}>
                    <span className="bn-more-icon"><Ico d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" size={26}/></span>
                    {t('nav.search', 'Rechercher')}
                  </Link>
                  <Link to={PATHS.fav} className={`bn-more-item${isActive(PATHS.fav) ? " active" : ""}`} onClick={() => setShowMore(false)}>
                    <span className="bn-more-icon"><Ico d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" size={26}/></span>
                    {t('nav.my_favorites', 'Biens Favoris')}{savedCount > 0 && ` (${savedCount})`}
                  </Link>
                  <Link to={PATHS.visits} className={`bn-more-item${isActive(PATHS.visits) ? " active" : ""}`} onClick={() => setShowMore(false)}>
                    <span className="bn-more-icon"><Ico d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z" size={26}/></span>
                    {t('nav.my_visits', 'Visites programmées')}{upcomingVisits > 0 && ` (${upcomingVisits})`}
                  </Link>
                  <Link to={PATHS.locations} className={`bn-more-item${isActive(PATHS.locations) ? " active" : ""}`} onClick={() => setShowMore(false)}>
                    <span className="bn-more-icon"><Ico d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" size={26}/></span>
                    {t('nav.my_locations', 'Dossiers de location')}
                  </Link>
                  <Link to={PATHS.archi} className={`bn-more-item${isActive(PATHS.archi) ? " active" : ""}`} onClick={() => setShowMore(false)}>
                    <span className="bn-more-icon"><Ico d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" size={26}/></span>
                    {t('nav.professionals', 'Pros & Artisans')}
                  </Link>
                  <Link to={PATHS.alerts} className={`bn-more-item${isActive(PATHS.alerts) ? " active" : ""}`} onClick={() => setShowMore(false)}>
                    <span className="bn-more-icon"><Ico d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" size={26}/></span>
                    {t('nav.search_alerts', 'Alertes de recherche')}
                  </Link>
                  <Link to={PATHS.map} className={`bn-more-item${isActive(PATHS.map) ? " active" : ""}`} onClick={() => setShowMore(false)}>
                    <span className="bn-more-icon"><Ico d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" size={26}/></span>
                    {t('nav.map', 'Carte Interactive')}
                  </Link>
                  <Link to={PATHS.profil} className={`bn-more-item${isActive(PATHS.profil) ? " active" : ""}`} onClick={() => setShowMore(false)}>
                    <span className="bn-more-icon"><Ico d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" size={26}/></span>
                    {t('dashboard.my_profile', 'Mon Profil')}
                  </Link>
                  <Link to={PATHS.sec} className={`bn-more-item${isActive(PATHS.sec) ? " active" : ""}`} onClick={() => setShowMore(false)}>
                    <span className="bn-more-icon"><Ico d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" size={26}/></span>
                    {t('nav.security', 'Sécurité')}
                  </Link>
                  <Link to={PATHS.sup} className={`bn-more-item${isActive(PATHS.sup) ? " active" : ""}`} onClick={() => setShowMore(false)}>
                    <span className="bn-more-icon"><Ico d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" size={26}/></span>
                    {t('nav.support', 'Aide & Support')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
