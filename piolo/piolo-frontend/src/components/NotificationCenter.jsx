import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsApi } from '../services/api';
import './NotificationCenter.css';

/* ── Icônes SVG par type ─────────────────────────────────────────────────── */
const ICONS = {
  MESSAGE:  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  VISIT:    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  RENTAL:   <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  ALERT:    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  FAVORITE: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>,
  PROPERTY: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  ACCOUNT:  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  SYSTEM:   <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>,
};

function timeLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diff = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `Il y a ${days} j` : date.toLocaleDateString('fr-FR');
}

function SkeletonLoading() {
  return (
    <div className="notification-skeleton">
      {[1, 2, 3].map(i => (
        <div className="notification-skeleton-item" key={i}>
          <div className="sk-circle" />
          <div className="sk-lines">
            <div className="sk-line" />
            <div className="sk-line" />
            <div className="sk-line" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NotificationCenter() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async (withList = false) => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError('');
    try {
      const response = await notificationsApi.list({ limit: 30 });
      const payload = response.data || {};
      if (withList || open) setItems(Array.isArray(payload.results) ? payload.results : []);
      setUnreadCount(Number(payload.unread_count) || 0);
    } catch {
      setError('Notifications momentanément indisponibles.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, open]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    load(false);
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') load(false);
    }, 30000);
    const refreshOnFocus = () => { if (document.visibilityState === 'visible') load(false); };
    document.addEventListener('visibilitychange', refreshOnFocus);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refreshOnFocus);
    };
  }, [isAuthenticated, load, location.pathname]);

  useEffect(() => {
    const close = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  if (!isAuthenticated) return null;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) load(true);
  };

  const markRead = async (notification) => {
    if (notification.is_read) return;
    setItems((current) => current.map((item) => item.id === notification.id ? { ...item, is_read: true } : item));
    setUnreadCount((count) => Math.max(0, count - 1));
    try { await notificationsApi.markRead(notification.id); } catch { load(true); }
  };

  const handleOpen = async (notification) => {
    await markRead(notification);
    setOpen(false);
    if (notification.url) navigate(notification.url);
  };

  const markAllRead = async () => {
    setItems((current) => current.map((item) => ({ ...item, is_read: true })));
    setUnreadCount(0);
    try { await notificationsApi.markAllRead(); } catch { load(true); }
  };

  return (
    <div className="notification-center" ref={rootRef}>
      {/* ── Bouton Cloche ── */}
      <button
        type="button"
        className={`notification-trigger${open ? ' is-open' : ''}`}
        onClick={toggle}
        aria-label={unreadCount ? `${unreadCount} notifications non lues` : 'Notifications'}
        aria-expanded={open}
        title="Notifications"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8.5 12h5M12 3V1" />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-count" aria-live="polite">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Panneau déroulant ── */}
      {open && (
        <section className="notification-panel" role="dialog" aria-label="Centre de notifications">
          {/* Header */}
          <header className="notification-panel-header">
            <div>
              <span className="notification-eyebrow">Piolo</span>
              <h2>Notifications</h2>
            </div>
            <div className="notification-panel-header-right">
              {unreadCount > 0 && (
                <span className="notification-unread-badge">{unreadCount} non lu{unreadCount > 1 ? 'es' : 'e'}</span>
              )}
              <button
                type="button"
                className="notification-mark-all"
                onClick={markAllRead}
                disabled={!unreadCount}
                title="Marquer tout comme lu"
              >
                ✓ Tout lu
              </button>
            </div>
          </header>

          {/* Contenu */}
          {loading && !items.length && <SkeletonLoading />}

          {!loading && error && (
            <div className="notification-state notification-error">
              <span style={{ fontSize: 28 }}>⚠️</span>
              <strong>Oups !</strong>
              <span>{error}</span>
              <button type="button" onClick={() => load(true)}>{t('notifications.retry')}</button>
            </div>
          )}

          {!loading && !error && !items.length && (
            <div className="notification-state">
              <span className="notification-empty-icon">✓</span>
              <strong>{t('notifications.all_caught_up')}</strong>
              <span>{t('notifications.no_notifications')}</span>
            </div>
          )}

          {!!items.length && (
            <div className="notification-list">
              {items.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={`notification-item${notification.is_read ? '' : ' is-unread'}`}
                  onClick={() => handleOpen(notification)}
                >
                  <span className={`notification-item-icon kind-${String(notification.kind || 'SYSTEM').toLowerCase()}`}>
                    {ICONS[notification.kind] || ICONS.SYSTEM}
                  </span>
                  <span className="notification-item-content">
                    <strong>{notification.title}</strong>
                    <span>{notification.body}</span>
                    <small>{timeLabel(notification.created_at)}</small>
                  </span>
                  {!notification.is_read && <span className="notification-unread-dot" aria-label="Non lue" />}
                </button>
              ))}
            </div>
          )}

          {/* Footer */}
          <footer className="notification-panel-footer">
            <button
              type="button"
              onClick={() => { setOpen(false); navigate('/notifications'); }}
            >
              Voir toutes les notifications
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </footer>
        </section>
      )}
    </div>
  );
}
