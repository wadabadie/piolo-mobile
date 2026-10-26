// src/components/Navbar.jsx
import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { getMediaUrl } from '../utils/media';
import NotificationCenter from './NotificationCenter';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const { config } = useSiteConfig();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const logoSrc = config.logo_url || '/static/img/logo-piolo-clean.png';
  const closeMenu = () => setMobileMenuOpen(false);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const isPro = user?.role === 'ARCHITECTE' || user?.role === 'PRO' || user?.role === 'PROFESSIONNEL' || user?.is_architecte || user?.is_pro;
  const isBailleur = user?.role === 'BAILLEUR' || user?.is_bailleur;
  const dashboardRoute = isBailleur 
    ? '/dashboard/bailleur' 
    : (isPro 
        ? '/dashboard/pro' 
        : (user?.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/locataire'));

  return (
    <header className="navbar-header" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 12000
    }}>
      <style>{`
        @media (max-width: 850px) {
          .nav-desktop-links { display: none !important; }
          .nav-desktop-actions { display: none !important; }
          .nav-mobile-bar-actions { display: flex !important; }
        }
        @media (min-width: 851px) {
          .nav-mobile-bar-actions { display: none !important; }
          .nav-mobile-drawer { display: none !important; }
        }
        .nav-logo-link {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          min-width: 0;
          flex-shrink: 1;
        }
        .nav-logo-img {
          height: 36px;
          width: auto;
          object-fit: contain;
          flex-shrink: 0;
        }
        .nav-logo-text {
          font-family: 'Poppins', sans-serif;
          font-weight: 800;
          color: #D4AF37;
          font-size: 18px;
          letter-spacing: -0.3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        @media (max-width: 540px) {
          .navbar-top-container {
            padding: 0 10px !important;
          }
          .nav-logo-img {
            height: 30px !important;
          }
          .nav-logo-text {
            font-size: 15px !important;
            max-width: 120px !important;
          }
          .nav-mobile-bar-actions {
            gap: 5px !important;
          }
          .nav-mobile-points-badge {
            padding: 3px 6px !important;
            font-size: 10.5px !important;
          }
          .nav-mobile-burger-btn {
            width: 36px !important;
            height: 36px !important;
            font-size: 15px !important;
          }
        }
        @media (max-width: 380px) {
          .navbar-top-container {
            padding: 0 6px !important;
          }
          .nav-logo-text {
            font-size: 13.5px !important;
            max-width: 85px !important;
          }
          .nav-mobile-bar-actions {
            gap: 3px !important;
          }
        }
      `}</style>

      {/* ── Top Bar ── */}
      <div className="navbar-top-bar" style={{
        background: 'rgba(15, 13, 9, 0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
        minHeight: 'calc(62px + env(safe-area-inset-top, 0px))',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        zIndex: 12010
      }}>
        <div className="navbar-top-container" style={{
          maxWidth: 1360,
          width: '100%',
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8
        }}>
          {/* ── Logo ── */}
          <Link to="/" onClick={closeMenu} className="nav-logo-link">
            <img src={logoSrc} alt={config.site_name || 'Piolo'} className="nav-logo-img" onError={(e) => { e.currentTarget.src = '/static/img/logo-piolo-clean.png'; }} />
            <span className="nav-logo-text">
              {config.site_name || 'PIOLO'}
            </span>
          </Link>

          {/* ── Navigation Links (Desktop) ── */}
          <ul className="nav-desktop-links" style={{ display: 'flex', gap: 24, alignItems: 'center', listStyle: 'none', margin: 0, padding: 0 }}>
            <li><Link to="/" style={{ color: location.pathname === '/' ? '#F6D365' : '#E5E7EB', fontWeight: 600, fontSize: 14 }}>{t('nav.home', 'Accueil')}</Link></li>
            <li>
              <Link to="/discovery" className="mode-decouverte-nav-highlight" style={{
                background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(230,197,106,0.35))',
                border: '1px solid #D4AF37',
                borderRadius: 50,
                padding: '5px 14px',
                color: '#FFE27A',
                fontWeight: 800,
                fontSize: 13,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}>
                <i className="fas fa-play-circle" style={{ color: '#FFD700' }}></i> {t('nav.discovery', 'Mode Découverte')}
              </Link>
            </li>
            <li><a href="/#annonces" style={{ color: '#E5E7EB', fontWeight: 500, fontSize: 14 }}>{t('nav.properties', 'Biens')}</a></li>
            <li><a href="/#visite-3d" style={{ color: '#E5E7EB', fontWeight: 500, fontSize: 14 }}>{t('property.virtual_tour_badge', 'Visite 360°')}</a></li>
            <li><a href="/#carte" style={{ color: '#E5E7EB', fontWeight: 500, fontSize: 14 }}>{t('nav.map', 'Carte 3D')}</a></li>
            <li><a href="/#securite" style={{ color: '#E5E7EB', fontWeight: 500, fontSize: 14 }}>{t('common.verified', 'Sécurité CNI')}</a></li>
          </ul>

          {/* ── Actions Desktop ── */}
          <div className="nav-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Sélecteur de Langue Bilingue FR / EN */}
            <LanguageSwitcher compact />

            {isAuthenticated ? (
              <>
                {/* Badge Points */}
                <div style={{
                  background: 'rgba(212,175,55,0.12)',
                  border: '1px solid rgba(212,175,55,0.35)',
                  borderRadius: 20,
                  padding: '5px 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#FFE27A',
                  fontSize: 13,
                  fontWeight: 700
                }}>
                  <i className="fas fa-star" style={{ color: '#FFD700', fontSize: 11 }}></i>
                  <span>{user?.points ?? 50} {t('nav.points', 'pts')}</span>
                </div>

                {/* Notification Center */}
                <NotificationCenter />

                {/* Avatar avec Dropdown */}
                <div ref={profileMenuRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2A261D, #0F0D09)',
                      border: '2px solid #D4AF37',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#D4AF37',
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      padding: 0
                    }}
                  >
                    {getMediaUrl(user?.avatar_url || user?.avatar) ? (
                      <img 
                        src={getMediaUrl(user.avatar_url || user.avatar)} 
                        alt="Avatar" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (user?.first_name?.[0]?.toUpperCase() || 'P')}
                  </button>

                  {profileDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 10px)',
                      right: 0,
                      width: 220,
                      background: '#1A1813',
                      border: '1px solid rgba(212,175,55,0.3)',
                      borderRadius: 14,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      padding: '8px 0',
                      display: 'flex',
                      flexDirection: 'column',
                      zIndex: 13000
                    }}>
                      <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{user?.first_name} {user?.last_name}</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{user?.email}</div>
                      </div>
                      <Link to={dashboardRoute} onClick={() => setProfileDropdownOpen(false)} style={{ padding: '10px 16px', color: '#E5E7EB', textDecoration: 'none', fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <i className="fas fa-th-large" style={{ color: '#D4AF37', width: 18 }}></i> {t('nav.dashboard', 'Tableau de bord')}
                      </Link>
                      <Link to="/profil" onClick={() => setProfileDropdownOpen(false)} style={{ padding: '10px 16px', color: '#E5E7EB', textDecoration: 'none', fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <i className="fas fa-user" style={{ color: '#D4AF37', width: 18 }}></i> {t('dashboard.my_profile', 'Mon profil')}
                      </Link>
                      <button
                        type="button"
                        onClick={() => { logout(); setProfileDropdownOpen(false); }}
                        style={{ padding: '10px 16px', background: 'none', border: 'none', color: '#EF4444', textAlign: 'left', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <i className="fas fa-sign-out-alt" style={{ width: 18 }}></i> {t('nav.logout', 'Se déconnecter')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" style={{ color: '#E5E7EB', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                  {t('nav.login', 'Connexion')}
                </Link>
                <Link to="/register" style={{
                  background: 'linear-gradient(135deg, #D4AF37, #F6D365)',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: 13,
                  padding: '8px 18px',
                  borderRadius: 20,
                  textDecoration: 'none'
                }}>
                  {t('nav.register', "S'inscrire")}
                </Link>
              </>
            )}
          </div>

          {/* ── Actions Mobile Topbar (Épurée : Langue + Points + Cloche + Burger) ── */}
          <div className="nav-mobile-bar-actions" style={{ display: 'none', alignItems: 'center', gap: 6 }}>
            <LanguageSwitcher compact />
            {isAuthenticated && (
              <>
                {/* Badge Points */}
                <div className="nav-mobile-points-badge" style={{
                  background: 'rgba(212,175,55,0.12)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  borderRadius: 14,
                  padding: '4px 7px',
                  color: '#FFE27A',
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  flexShrink: 0
                }}>
                  <i className="fas fa-star" style={{ color: '#FFD700', fontSize: 10 }}></i>
                  <span>{user?.points ?? 50}</span>
                </div>

                {/* Cloche notification */}
                <NotificationCenter />
              </>
            )}

            {/* Hamburger button */}
            <button
              type="button"
              className="nav-mobile-burger-btn"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(prev => !prev);
              }}
              aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              style={{
                background: 'rgba(212, 175, 55, 0.12)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                borderRadius: 10,
                color: '#F6D365',
                fontSize: 16,
                width: 38,
                height: 38,
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 12020,
                flexShrink: 0
              }}
            >
              <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer Backdrop ── */}
      {mobileMenuOpen && (
        <div
          onClick={closeMenu}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 12004
          }}
        />
      )}

      {/* ── Mobile Drawer (Direct fixed sibling) ── */}
      <div className="nav-mobile-drawer" style={{
        position: 'fixed',
        top: 'calc(62px + env(safe-area-inset-top, 0px))',
        left: 0,
        right: 0,
        bottom: 0,
        height: 'calc(100vh - 62px - env(safe-area-inset-top, 0px))',
        height: 'calc(100dvh - 62px - env(safe-area-inset-top, 0px))',
        background: 'rgba(15, 13, 9, 0.98)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 12005,
        padding: '20px 20px calc(36px + env(safe-area-inset-bottom, 20px))',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        overflowY: 'auto',
        transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(-120%)',
        opacity: mobileMenuOpen ? 1 : 0,
        pointerEvents: mobileMenuOpen ? 'all' : 'none',
        transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease'
      }}>
        {/* User Card if connected */}
        {isAuthenticated && (
          <Link to="/profil" onClick={closeMenu} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 16px',
            borderRadius: 14,
            background: 'rgba(212,175,55,0.1)',
            border: '1px solid rgba(212,175,55,0.25)',
            marginBottom: 6,
            textDecoration: 'none',
            color: 'inherit'
          }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2A261D, #0F0D09)',
              border: '2px solid #D4AF37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D4AF37',
              fontWeight: 800,
              fontSize: 16,
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {getMediaUrl(user?.avatar_url || user?.avatar) ? (
                <img 
                  src={getMediaUrl(user.avatar_url || user.avatar)} 
                  alt="Avatar" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (user?.first_name?.[0]?.toUpperCase() || 'P')}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.first_name} {user?.last_name}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
            </div>
            <i className="fas fa-chevron-right" style={{ color: '#D4AF37', fontSize: 12, opacity: 0.8 }}></i>
          </Link>
        )}

        {/* Links */}
        <Link to="/" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
          <i className="fas fa-home" style={{ color: '#D4AF37', width: 20 }}></i> {t('nav.home', 'Accueil')}
        </Link>
        <Link to="/discovery" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(246,211,101,0.3))', color: '#FFE27A', textDecoration: 'none', fontWeight: 700, fontSize: 15, border: '1px solid rgba(212,175,55,0.35)' }}>
          <i className="fas fa-play-circle" style={{ color: '#FFD700', width: 20 }}></i> {t('nav.discovery', 'Mode Découverte Reels')}
        </Link>

        {isAuthenticated && (
          <>
            <Link to={dashboardRoute} onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
              <i className="fas fa-th-large" style={{ color: '#D4AF37', width: 20 }}></i> {t('nav.dashboard', 'Tableau de bord')}
            </Link>
            <Link to="/profil" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
              <i className="fas fa-user" style={{ color: '#D4AF37', width: 20 }}></i> {t('dashboard.my_profile', 'Mon Profil')}
            </Link>
          </>
        )}

        <Link to="/properties" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
          <i className="fas fa-building" style={{ color: '#D4AF37', width: 20 }}></i> {t('nav.properties', 'Biens Disponibles')}
        </Link>
        <Link to="/map" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
          <i className="fas fa-map-marked-alt" style={{ color: '#D4AF37', width: 20 }}></i> {t('nav.map', 'Carte Interactive')}
        </Link>

        {/* Auth Buttons in Drawer */}
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => { logout(); closeMenu(); }}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 14,
                border: '1px solid rgba(239,68,68,0.3)',
                background: 'rgba(239,68,68,0.12)',
                color: '#EF4444',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <i className="fas fa-sign-out-alt"></i> {t('nav.logout', 'Se déconnecter')}
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/login" onClick={closeMenu} style={{ width: '100%', padding: '14px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: '#fff', textAlign: 'center', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
                {t('nav.login', 'Connexion')}
              </Link>
              <Link to="/register" onClick={closeMenu} style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #D4AF37, #F6D365)', color: '#000', textAlign: 'center', textDecoration: 'none', fontWeight: 800, fontSize: 15 }}>
                {t('nav.register', 'Créer un compte')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
