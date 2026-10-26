// src/components/UserAvatarMenu.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

const getMediaUrl = (url) => {
  if (!url) return '';
  let clean = url.replace(/^https?:\/\/(127\.0\.0\.1|localhost):8080/i, '');
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('blob:') || clean.startsWith('data:')) return clean;
  return clean.startsWith('/') ? clean : `/${clean}`;
};

export default function UserAvatarMenu({ size = 38, className = '' }) {
  const { t } = useTranslation();
  const { user, logout, isBailleur } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Fermer au clic en dehors
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [open]);

  if (!user) return null;

  const avatarUrl = getMediaUrl(user.avatar_url || user.avatar);
  const initials = `${(user.first_name?.[0] || 'P').toUpperCase()}${(user.last_name?.[0] || '').toUpperCase()}`;
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || (isBailleur ? 'Bailleur' : 'Locataire');

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {/* BOUTON AVATAR ROND DÉCLENCHEUR */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`user-avatar-btn ${className}`}
        aria-expanded={open}
        aria-label="Menu du compte"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #D4AF37, #F6D365)',
          border: '2px solid rgba(212,175,55,0.4)',
          color: '#0F0D09',
          fontWeight: 800,
          fontSize: size >= 36 ? 14 : 12,
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          padding: 0,
          overflow: 'hidden',
          boxShadow: open ? '0 0 0 3px rgba(212,175,55,0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease',
          flexShrink: 0
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <span>{initials}</span>
        )}
      </button>

      {/* DROPDOWN MENU PRO & LUXURY */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: 250,
            background: '#FFFFFF',
            borderRadius: 18,
            border: '1.5px solid #E8E3DA',
            boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
            padding: '8px 0',
            zIndex: 99999,
            animation: 'fadeInMenu 0.18s ease-out',
            fontFamily: "'DM Sans', sans-serif"
          }}
        >
          {/* En-tête profil */}
          <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid #F0ECE4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'linear-gradient(135deg, #D4AF37, #F6D365)',
                color: '#0F0D09', fontWeight: 800, fontSize: 13,
                display: 'grid', placeItems: 'center', flexShrink: 0, overflow: 'hidden'
              }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#0F0D09', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {fullName}
                </div>
                <div style={{ fontSize: 11.5, color: '#9B9690', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </div>
              </div>
            </div>
          </div>

          {/* Liens de navigation */}
          <div style={{ padding: '6px 0' }}>
            <Link
              to="/profil"
              onClick={() => setOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 16px',
                color: '#0F0D09',
                textDecoration: 'none',
                fontSize: 13.5,
                fontWeight: 600,
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#FAF9F6'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#D4AF37"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              <span>{t('sidebar.my_profile')}</span>
            </Link>

            <Link
              to="/securite"
              onClick={() => setOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 16px',
                color: '#0F0D09',
                textDecoration: 'none',
                fontSize: 13.5,
                fontWeight: 600,
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#FAF9F6'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#D4AF37"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
              <span>{t('sidebar.security_privacy')}</span>
            </Link>

            <Link
              to="/support"
              onClick={() => setOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 16px',
                color: '#0F0D09',
                textDecoration: 'none',
                fontSize: 13.5,
                fontWeight: 600,
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#FAF9F6'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#D4AF37"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
              <span>{t('sidebar.help_support')}</span>
            </Link>
          </div>

          <div style={{ borderTop: '1px solid #F0ECE4', paddingTop: 4 }}>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 16px',
                color: '#B83232',
                background: 'none',
                border: 0,
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(184,50,50,0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#B83232"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
              <span>{t('nav.logout')}</span>
            </button>
          </div>

          {/* Sélecteur de langue */}
          <div style={{ borderTop: '1px solid #F0ECE4', padding: '8px 16px 6px', display: 'flex', justifyContent: 'center' }}>
            <LanguageSwitcher />
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInMenu {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
