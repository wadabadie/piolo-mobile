// src/components/Sidebar.jsx — Sidebar universelle Piolo (Bailleur & Locataire)
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';
import { subscriptionService } from '../services/subscriptionService';
import FloatingFab from './FloatingFab';
import MobileBottomNav from './MobileBottomNav';
import LanguageSwitcher from './LanguageSwitcher';
import './AppSidebar.css';

export default function Sidebar({ data = {}, sidebarLabel }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { dark, toggleDark } = useDarkMode();
  const location = useLocation();
  const navigate = useNavigate();

  const [isFloating, setIsFloating] = useState(() => localStorage.getItem('sidebarMode') === 'floating');
  const [dataSaver, setDataSaver] = useState(() => localStorage.getItem('dataSaverMode') === 'true');

  const toggleFloatingMode = () => {
    setIsFloating(prev => {
      const next = !prev;
      localStorage.setItem('sidebarMode', next ? 'floating' : 'classic');
      return next;
    });
  };

  const toggleDataSaver = () => {
    setDataSaver(prev => {
      const next = !prev;
      localStorage.setItem('dataSaverMode', String(next));
      if (next) {
        document.body.classList.add('eco-mode');
        alert(t('sidebar.eco_mode_enabled'));
      } else {
        document.body.classList.remove('eco-mode');
        alert(t('sidebar.eco_mode_disabled'));
      }
      return next;
    });
  };

  const isBailleur = user?.role === 'BAILLEUR' || user?.is_bailleur;
  const isPro = user?.role === 'ARCHITECTE' || user?.role === 'PRO' || user?.role === 'PROFESSIONNEL' || user?.is_architecte || user?.is_pro;
  const dashboardPath = isBailleur ? '/dashboard/bailleur' : (isPro ? '/dashboard/pro' : '/dashboard/locataire');
  const defaultRoleLabel = isBailleur ? t('sidebar.space_landlord') : (isPro ? t('sidebar.space_pro') : t('sidebar.space_tenant'));

  const isActive = (path) => {
    if (path === '/dashboard/locataire' || path === '/dashboard/bailleur') {
      return location.pathname === path;
    }
    if (path === '/dashboard/pro') {
      return location.pathname === '/dashboard/pro' && (!location.search || location.search === '?tab=stats');
    }
    if (path.includes('?tab=')) {
      const [base, query] = path.split('?');
      return location.pathname === base && location.search.includes(query);
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const [landlordLivePts, setLandlordLivePts] = useState(() => isBailleur ? subscriptionService.getLandlordPoints(user?.id) : 0);

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail?.points !== undefined) setLandlordLivePts(e.detail.points);
    };
    window.addEventListener('piolo_landlord_points_updated', handleUpdate);
    window.addEventListener('piolo_points_updated', handleUpdate);
    return () => {
      window.removeEventListener('piolo_landlord_points_updated', handleUpdate);
      window.removeEventListener('piolo_points_updated', handleUpdate);
    };
  }, []);

  const points = isBailleur
    ? ((user?.points && user.points > 0) ? user.points : (landlordLivePts || 45))
    : ((user?.points !== undefined && user?.points !== null) ? user.points : (data?.points ?? 20));
  const savedCount = data?.saved_count ?? 0;
  const unreadMessages = data?.unread_messages ?? data?.kpis?.unread_messages ?? 0;
  const upcomingVisits = data?.upcoming_visits?.length ?? data?.my_visits?.length ?? data?.kpis?.pending_visits ?? 0;
  const searchAlerts = data?.search_alerts?.length ?? 0;
  const pendingLocations = data?.kpis?.pending_locations ?? data?.location_requests?.length ?? 0;
  const totalProperties = data?.kpis?.total_properties ?? data?.recent_properties?.length ?? 0;
  const archivedCount = data?.kpis?.archived_count ?? data?.archived_properties?.length ?? 0;

  const fabItems = isBailleur ? [
    { href: '/dashboard/bailleur', label: t('sidebar.dashboard'), angle: 0, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg> },
    { href: '/properties', label: t('sidebar.section_my_listings'), angle: 45, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg> },
    { href: '/properties/create', label: t('sidebar.publish_listing'), angle: 90, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg> },
    { href: '/visites', label: t('sidebar.visit_requests'), angle: 135, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg> },
    { href: '/messages', label: t('sidebar.messages'), angle: 180, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg> },
    { href: '/decouverte', label: t('sidebar.discovery_mode'), angle: 270, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M8 5v14l11-7z"/></svg> },
    { href: '__close__', label: t('sidebar.classic_sidebar'), angle: 315, isClear: true, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg> },
  ] : [
    { href: '/dashboard/locataire', label: t('sidebar.dashboard'), angle: 0, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg> },
    { href: '/properties', label: t('sidebar.search_property'), angle: 45, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg> },
    { href: '/map', label: t('sidebar.interactive_map'), angle: 90, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> },
    { href: '/favoris', label: t('sidebar.my_favorites'), angle: 135, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/></svg> },
    { href: '/visites', label: t('sidebar.scheduled_visits'), angle: 180, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg> },
    { href: '/messages', label: t('sidebar.messages'), angle: 225, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg> },
    { href: '/decouverte', label: t('sidebar.discovery_mode'), angle: 270, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M8 5v14l11-7z"/></svg> },
    { href: '__close__', label: t('sidebar.classic_sidebar'), angle: 315, isClear: true, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg> },
  ];

  const avatarPath = user?.avatar_url || user?.avatar;
  const userAvatarUrl = avatarPath ? (
    avatarPath.startsWith('http') || avatarPath.startsWith('data:') ? avatarPath : (avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`)
  ) : null;

  return (
    <>
      {user && (
        <MobileBottomNav unreadMessages={unreadMessages} upcomingVisits={upcomingVisits} savedCount={savedCount} />
      )}

      {isFloating && (
        <FloatingFab items={fabItems} onClose={toggleFloatingMode} />
      )}

      <aside className={`sidebar${isFloating ? ' floating-mode-hidden' : ''}`} id="sidebar" style={isFloating ? { display: 'none' } : undefined}>
        {/* Logo */}
        <div className="sb-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '25px 15px 15px' }}>
          <Link to="/">
            <img src="/img/logo-piolo-clean.png" alt="Logo Piolo" style={{ width: 100, height: 'auto', objectFit: 'contain' }} />
          </Link>
          <div className="sb-logo-tag" style={{ marginTop: 10 }}>{sidebarLabel || defaultRoleLabel}</div>
          <button onClick={toggleFloatingMode} style={{ marginTop: 15, background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', color: 'var(--or-l, #D4AF37)', fontFamily: "'Poppins', sans-serif", fontSize: 11, padding: '6px 12px', borderRadius: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
            {t('sidebar.bubble_mode')}
          </button>
        </div>

        {/* User Card */}
        <Link to="/profil" className="sb-user" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'all 0.2s ease' }} title={t('dashboard.my_profile', 'Mon Profil')}>
          {userAvatarUrl ? (
            <img src={userAvatarUrl} alt="Avatar" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--or-l, #D4AF37)', flexShrink: 0, boxShadow: '0 2px 8px rgba(212,175,55,0.25)' }} />
          ) : (
            <div className="sb-av">{user?.first_name?.[0]?.toUpperCase() || 'P'}{user?.last_name?.[0]?.toUpperCase() || ''}</div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="sb-u-name">{user?.first_name} {user?.last_name}</div>
            <div className="sb-u-role">
              {isBailleur ? (
                <span className="sb-verified-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#D4AF37', fontSize: 11, fontWeight: 700 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                  {t('sidebar.verified_landlord')}
                </span>
              ) : (
                `${isPro ? t('sidebar.space_pro') : t('sidebar.space_tenant')} · ${user?.city || 'Cameroun'}`
              )}
            </div>
          </div>
          <div className="sb-pts">{points} {t('nav.points')}</div>
        </Link>

        <nav className="sb-nav">
          {/* ── SECTION PRINCIPAL ── */}
          <div className="sb-section-label">{t('sidebar.section_main')}</div>
          <Link className={`sb-item ${isActive(dashboardPath) ? 'active' : ''}`} to={dashboardPath}>
            <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            {t('sidebar.dashboard')}
          </Link>

          {isPro ? (
            <>
              {/* ── VITRINE & CHANTIERS (Professionnel) ── */}
              <div className="sb-section-label">{t('sidebar.section_portfolio')}</div>
              <Link className={`sb-item ${isActive('/dashboard/pro?tab=portfolio') ? 'active' : ''}`} to="/dashboard/pro?tab=portfolio">
                <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
                {t('sidebar.my_portfolio')}
              </Link>
              <Link className={`sb-item ${isActive('/dashboard/pro?tab=devis') ? 'active' : ''}`} to="/dashboard/pro?tab=devis">
                <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                {t('sidebar.quotes_requests')}
                {unreadMessages > 0 && <span className="sb-badge bl">{unreadMessages}</span>}
              </Link>
              <Link className={`sb-item ${isActive('/dashboard/pro?tab=profil') ? 'active' : ''}`} to="/dashboard/pro?tab=profil">
                <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                {t('sidebar.pro_settings')}
              </Link>
              <Link className={`sb-item ${isActive('/architectes') ? 'active' : ''}`} to="/architectes">
                <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                {t('sidebar.pros_directory')}
              </Link>
            </>
          ) : isBailleur ? (
            <>
              {/* ── MES ANNONCES (Bailleur) ── */}
              <div className="sb-section-label">{t('sidebar.section_my_listings')}</div>
              <Link className={`sb-item ${location.search.includes('owner=mine') ? 'active' : ''}`} to="/properties?owner=mine">
                <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                {t('sidebar.all_my_listings')}
                {totalProperties > 0 && <span className="sb-badge">{totalProperties}</span>}
              </Link>
              <Link className={`sb-item ${isActive('/properties/create') ? 'active' : ''}`} to="/properties/create">
                <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                {t('sidebar.publish_listing')}
              </Link>
              <Link className="sb-item" to="/dashboard/bailleur#archived">
                <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/></svg>
                {t('sidebar.archived_listings')}
                {archivedCount > 0 && <span className="sb-badge" style={{ background: '#4A5568', color: '#fff' }}>{archivedCount}</span>}
              </Link>

              {/* ── DEMANDES REÇUES (Bailleur) ── */}
              <div className="sb-section-label">{t('sidebar.section_requests')}</div>
              <Link className={`sb-item ${isActive('/visites') ? 'active' : ''}`} to="/visites">
                <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>
                {t('sidebar.visit_requests')}
                {upcomingVisits > 0 && <span className="sb-badge rd">{upcomingVisits}</span>}
              </Link>
              <Link className={`sb-item ${isActive('/dashboard/bailleur/locations') ? 'active' : ''}`} to="/dashboard/bailleur/locations">
                <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
                {t('sidebar.rental_requests')}
                {pendingLocations > 0 && <span className="sb-badge gn">{pendingLocations}</span>}
              </Link>

              {/* ── PLANNING (Bailleur) ── */}
              <div className="sb-section-label">{t('sidebar.section_planning')}</div>
              <Link className={`sb-item ${isActive('/calendrier') ? 'active' : ''}`} to="/calendrier">
                <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>
                {t('sidebar.visits_calendar')}
              </Link>
              <Link className={`sb-item ${isActive('/messages') ? 'active' : ''}`} to="/messages">
                <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                {t('sidebar.messages')}
                {unreadMessages > 0 && <span className="sb-badge bl">{unreadMessages}</span>}
              </Link>
            </>
          ) : (
            <>
              {/* ── RECHERCHE & GESTION (Locataire) ── */}
              <Link className={`sb-item ${isActive('/properties') ? 'active' : ''}`} to="/properties">
                <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                {t('sidebar.search_property')}
              </Link>
              <Link className={`sb-item ${isActive('/favoris') ? 'active' : ''}`} to="/favoris">
                <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/></svg>
                {t('sidebar.my_favorites')}
                {savedCount > 0 && <span className="sb-badge">{savedCount}</span>}
              </Link>
              <Link className={`sb-item ${isActive('/messages') ? 'active' : ''}`} to="/messages">
                <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                {t('sidebar.messages')}
                {unreadMessages > 0 && <span className="sb-badge bl">{unreadMessages}</span>}
              </Link>
              <Link className={`sb-item ${isActive('/visites') ? 'active' : ''}`} to="/visites">
                <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>
                {t('sidebar.scheduled_visits')}
                {upcomingVisits > 0 && <span className="sb-badge gn">{upcomingVisits}</span>}
              </Link>
              <Link className={`sb-item ${isActive('/dashboard/locataire/locations') ? 'active' : ''}`} to="/dashboard/locataire/locations">
                <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
                {t('sidebar.my_rental_files')}
              </Link>
              <Link className={`sb-item ${isActive('/alertes') ? 'active' : ''}`} to="/alertes">
                <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
                {t('sidebar.search_alerts')}
                {searchAlerts > 0 && <span className="sb-badge">{searchAlerts}</span>}
              </Link>
            </>
          )}

          {/* ── DÉCOUVRIR (Commun) ── */}
          <div className="sb-section-label">{t('sidebar.section_discover')}</div>
          <Link className={`sb-item ${isActive('/decouverte') ? 'active' : ''}`} to="/decouverte" style={{ color: '#D4AF37', fontWeight: 'bold' }}>
            <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            {t('sidebar.discovery_mode')}
            <span style={{ fontSize: 9, background: '#D4AF37', color: '#0D0B09', padding: '1px 6px', borderRadius: 10, marginLeft: 4, fontWeight: 900 }}>REEL</span>
          </Link>
          {!isBailleur && !isPro && (
            <Link className={`sb-item ${isActive('/map') ? 'active' : ''}`} to="/map">
              <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              {t('sidebar.interactive_map')}
            </Link>
          )}
          <Link className={`sb-item ${isActive('/architectes') || isActive('/professionnels') ? 'active' : ''}`} to="/architectes">
            <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
            {t('sidebar.pros_and_craftsmen')}
          </Link>

          {(user?.role === 'ADMIN' || user?.is_staff || user?.is_superuser) && (
            <>
              <div className="sb-section-label" style={{ color: 'var(--or-d)' }}>{t('sidebar.section_admin')}</div>
              <Link className={`sb-item ${isActive('/dashboard/admin') ? 'active' : ''}`} to="/dashboard/admin" style={{ fontWeight: 700, color: 'var(--or-d)' }}>
                <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
                {t('sidebar.superadmin_center')}
              </Link>
            </>
          )}

          {/* ── MON COMPTE (Commun) ── */}
          <div className="sb-section-label">{t('sidebar.section_account')}</div>
          <Link className={`sb-item ${isActive('/profil') ? 'active' : ''}`} to="/profil">
            <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            {t('sidebar.my_profile')}
          </Link>
          <Link className={`sb-item ${isActive('/securite') ? 'active' : ''}`} to="/securite">
            <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
            {t('sidebar.security_privacy')}
          </Link>
          <Link className={`sb-item ${isActive('/support') ? 'active' : ''}`} to="/support">
            <svg className="sb-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
            {t('sidebar.help_support')}
          </Link>

          {/* ── PRÉFÉRENCES ── */}
          <div className="sb-section-label">{t('sidebar.section_preferences')}</div>
          <button type="button" className="sb-item dark-mode-toggle-btn" onClick={toggleDark} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg className="sb-ico" viewBox="0 0 24 24" fill={dark ? '#D4AF37' : '#F6D365'}>
                {dark ? (
                  <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
                ) : (
                  <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
                )}
              </svg>
              <span>{t('sidebar.dark_mode')}</span>
            </div>
            <div style={{
              width: 34, height: 18, borderRadius: 10,
              background: dark ? 'linear-gradient(135deg, #D4AF37, #F6D365)' : 'rgba(255,255,255,0.2)',
              position: 'relative', transition: 'all 0.3s ease'
            }}>
              <div style={{
                width: 14, height: 14, borderRadius: '50%', background: dark ? '#0F0D09' : '#fff',
                position: 'absolute', top: 2, left: dark ? 18 : 2, transition: 'all 0.3s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
              }} />
            </div>
          </button>
          <button type="button" className="sb-item data-saver-toggle-btn" onClick={toggleDataSaver} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
            <svg className="sb-ico" viewBox="0 0 24 24" fill={dataSaver ? '#1E7A47' : '#D4AF37'}><path d="M11 15H6l7-14v8h5l-7 14v-8z"/></svg>
            {t('sidebar.data_saver')} {dataSaver && `(${t('sidebar.active')})`}
          </button>

          {/* ── LANGUE ── */}
          <div className="sb-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 10, margin: '6px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#F3F4F6' }}>
              <svg className="sb-ico" viewBox="0 0 24 24" fill="#D4AF37"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
              <span style={{ color: '#F9FAFB', fontWeight: 600, fontSize: 13 }}>{t('sidebar.language', 'Langue')}</span>
            </div>
            <LanguageSwitcher compact />
          </div>
        </nav>

        <button type="button" className="sb-logout" onClick={() => { logout(); navigate('/login'); }} style={{ border: 'none', background: 'none', width: '100%', cursor: 'pointer', marginTop: 'auto' }}>
          <svg viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
          {t('sidebar.logout')}
        </button>
      </aside>
    </>
  );
}
