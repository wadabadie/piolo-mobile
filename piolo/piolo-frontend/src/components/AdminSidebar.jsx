import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import './AppSidebar.css';

const iconPaths = {
  dashboard: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-7.5a4 4 0 0 1 0 7.75M22 21v-2a4 4 0 0 0-3-3.87',
  properties: 'M3 10.5 12 3l9 7.5M5 9v11h14V9M9 20v-6h6v6',
  discovery: 'M23 7l-7 5 7 5V7zM14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z',
  finance: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  broadcast: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  audit: 'M12 7v5l3 2M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6',
  theme: 'M12 3v18M3 12h18',
};

function AdminIcon({ name, size = 18 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={iconPaths[name] || iconPaths.dashboard} />
    </svg>
  );
}

export default function AdminSidebar({ counts = {} }) {
  const { user, logout } = useAuth();
  const { config } = useSiteConfig();
  const location = useLocation();
  const navigate = useNavigate();
  const currentTab = new URLSearchParams(location.search).get('tab') || 'dossiers';

  const nav = [
    { id: 'dossiers', label: 'Vue générale', sub: 'Dossiers KYC', count: counts.pending },
    { id: 'users', label: 'Utilisateurs', sub: 'Comptes & rôles', count: counts.users },
    { id: 'properties', label: 'Annonces', sub: 'Modération', count: counts.properties },
    { id: 'discovery', label: 'Mode Découverte', sub: 'Modération Reels & Trafic', count: counts.reels },
    { id: 'finance', label: 'Finances & Revenus', sub: 'Chiffre d’affaires & Bilans', count: counts.transactions },
    { id: 'broadcast', label: 'Diffusion d’Alertes', sub: 'Push & Annonces Flash' },
    { id: 'traffic', label: 'Journal d’audit', sub: 'Activité en direct', count: counts.audit },
    { id: 'theme', label: 'Apparence', sub: 'Thème global' },
  ];

  const go = (id) => `/dashboard/admin?tab=${id}`;
  const initials = `${user?.first_name?.[0] || 'S'}${user?.last_name?.[0] || 'A'}`.toUpperCase();
  const logoSrc = config?.logo_dark_url || config?.logo_url || '/img/logo-piolo-clean.png';

  return (
    <aside className="sidebar admin-sidebar" style={{ width: 250, minWidth: 250, maxWidth: 250, minHeight: '100vh', height: '100vh', position: 'sticky', top: 0, flex: '0 0 250px', overflowY: 'auto', overflowX: 'hidden', background: '#0D0B09', borderRight: '1px solid rgba(212,175,55,0.18)' }}>
      {/* Logo Area */}
      <div className="sb-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Link to="/" style={{ display: 'inline-block' }}>
          <img src={logoSrc} alt={config?.site_name || 'Piolo'} style={{ width: 104, height: 'auto', objectFit: 'contain' }} />
        </Link>
        <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4AF37', background: 'rgba(212,175,55,0.12)', padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(212,175,55,0.25)' }}>
          Super Administration
        </div>
      </div>

      {/* User Card */}
      <div className="sb-user" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="sb-av" style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #F6D365)', color: '#0D0B09', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0, boxShadow: '0 2px 8px rgba(212,175,55,0.3)' }}>
          {initials}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="sb-u-name" style={{ color: '#FFFFFF', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.first_name || 'Super'} {user?.last_name || 'Admin'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: 10, color: '#4ADE80', fontWeight: 800, background: 'rgba(74,222,128,0.15)', padding: '1px 6px', borderRadius: 4, letterSpacing: '0.05em' }}>
              SUPER ADMIN
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sb-nav" style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className="sb-section-label" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4AF37', padding: '6px 10px 4px', opacity: 0.9 }}>
          Pilotage Plateforme
        </div>
        {nav.map(item => {
          const active = currentTab === item.id;
          return (
            <Link
              key={item.id}
              to={go(item.id)}
              className={`sb-item ${active ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 10,
                color: active ? '#D4AF37' : 'rgba(255,255,255,0.75)',
                background: active ? 'rgba(212,175,55,0.14)' : 'transparent',
                border: active ? '1px solid rgba(212,175,55,0.3)' : '1px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                <span className="sb-ico" style={{ color: active ? '#F6D365' : 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center' }}>
                  <AdminIcon name={item.id === 'dossiers' ? 'dashboard' : item.id} />
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                  <span style={{ fontSize: 13.5, fontWeight: active ? 700 : 500 }}>{item.label}</span>
                  <small style={{ fontSize: 10.5, color: active ? 'rgba(246,211,101,0.8)' : 'rgba(255,255,255,0.4)', marginTop: 2 }}>{item.sub}</small>
                </div>
              </div>
              {item.count > 0 && (
                <span className="sb-badge" style={{ background: '#D4AF37', color: '#0D0B09', fontSize: 11, fontWeight: 800, padding: '2px 7px', borderRadius: 12 }}>
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}

        <div className="sb-section-label" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', padding: '16px 10px 4px' }}>
          Raccourcis
        </div>
        <Link
          className="sb-item"
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 10, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
        >
          <span className="sb-ico" style={{ color: 'rgba(255,255,255,0.5)', display: 'flex' }}><AdminIcon name="properties" size={17} /></span>
          <span style={{ fontSize: 13.5, fontWeight: 500 }}>Voir le site public</span>
        </Link>
        <Link
          className="sb-item"
          to="/profil"
          style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 10, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
        >
          <span className="sb-ico" style={{ color: 'rgba(255,255,255,0.5)', display: 'flex' }}><AdminIcon name="users" size={17} /></span>
          <span style={{ fontSize: 13.5, fontWeight: 500 }}>Mon profil</span>
        </Link>
      </nav>

      {/* Security footer */}
      <div style={{ margin: 'auto 12px 14px', padding: '14px', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: '#D4AF37' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Zone Super-Admin
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 4, lineHeight: 1.4 }}>
          Toutes les actions d'approbation et de modération sont auditées en temps réel.
        </div>
      </div>

      {/* Logout */}
      <div style={{ padding: '0 12px 18px' }}>
        <button
          type="button"
          onClick={() => { logout(); navigate('/login'); }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '10px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 10,
            color: '#F87171',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
