import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notificationsApi } from '../../services/api';
import './notification-page.css';

/* ── Icônes SVG par type ─────────────────────────────────────────────────── */
const ICONS = {
  MESSAGE:  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  VISIT:    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  RENTAL:   <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  ALERT:    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  FAVORITE: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>,
  PROPERTY: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  ACCOUNT:  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  SYSTEM:   <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>,
};

const KIND_LABELS = {
  MESSAGE: 'Message', VISIT: 'Visite', RENTAL: 'Location',
  ALERT: 'Alerte', FAVORITE: 'Favori', PROPERTY: 'Bien',
  ACCOUNT: 'Compte', SYSTEM: 'Système',
};

function formatDate(value) {
  return new Date(value).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
}

function timeAgo(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diff = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `Il y a ${days} j` : formatDate(value);
}

const FILTERS = [
  { key: 'all', label: 'Tout' },
  { key: 'unread', label: 'Non lues' },
  { key: 'MESSAGE', label: 'Messages' },
  { key: 'VISIT', label: 'Visites' },
  { key: 'ALERT', label: 'Alertes' },
  { key: 'PROPERTY', label: 'Biens' },
];

function SkeletonRow() {
  return (
    <div className="np-skeleton-row">
      <div className="np-sk-icon" />
      <div className="np-sk-lines">
        <div className="np-sk-line" />
        <div className="np-sk-line np-sk-short" />
        <div className="np-sk-line np-sk-shorter" />
      </div>
    </div>
  );
}

export default function NotificationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await notificationsApi.list({ limit: 100 });
      setItems(data.results || []);
      setUnreadCount(data.unread_count || 0);
    } catch {
      setError('Impossible de charger vos notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const read = async (item) => {
    if (item.is_read) return;
    setItems((current) => current.map((e) => e.id === item.id ? { ...e, is_read: true } : e));
    setUnreadCount((c) => Math.max(0, c - 1));
    try { await notificationsApi.markRead(item.id); } catch { load(); }
  };

  const readAll = async () => {
    setItems((current) => current.map((item) => ({ ...item, is_read: true })));
    setUnreadCount(0);
    try { await notificationsApi.markAllRead(); } catch { load(); }
  };

  const handleClick = async (item) => {
    await read(item);
    if (item.url) navigate(item.url);
  };

  /* Filtrage */
  const filtered = items.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !item.is_read;
    return item.kind === filter;
  });

  const totalUnread = items.filter((i) => !i.is_read).length;

  return (
    <main className="np-root">
      {/* ── Hero Header ── */}
      <div className="np-hero">
        <div className="np-hero-inner">
          <Link to="/dashboard" className="np-back-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Retour au tableau de bord
          </Link>
          <div className="np-hero-content">
            <div className="np-hero-icon">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8.5 12h5M12 3V1"/>
              </svg>
            </div>
            <div>
              <p className="np-eyebrow">Piolo — Centre de</p>
              <h1 className="np-title">Notifications</h1>
              <p className="np-subtitle">{t('notifications.page_subtitle')}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="np-stats">
            <div className="np-stat">
              <span className="np-stat-val">{items.length}</span>
              <span className="np-stat-label">Total</span>
            </div>
            <div className="np-stat np-stat--gold">
              <span className="np-stat-val">{totalUnread}</span>
              <span className="np-stat-label">{t('notifications.filters.unread')}</span>
            </div>
            <div className="np-stat">
              <span className="np-stat-val">{items.length - totalUnread}</span>
              <span className="np-stat-label">{t('notifications.filters.read')}</span>
            </div>
          </div>

          {/* Action */}
          {unreadCount > 0 && (
            <button type="button" className="np-mark-all-btn" onClick={readAll}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
              Tout marquer comme lu
            </button>
          )}
        </div>
      </div>

      {/* ── Contenu principal ── */}
      <div className="np-body">
        {/* Filtres */}
        <div className="np-filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`np-filter-btn${filter === f.key ? ' active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              {f.key === 'unread' && totalUnread > 0 && (
                <span className="np-filter-badge">{totalUnread}</span>
              )}
            </button>
          ))}
        </div>

        {/* Liste */}
        <div className="np-card">
          {loading && (
            <div className="np-skeleton-list">
              {[1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)}
            </div>
          )}

          {!loading && error && (
            <div className="np-empty-state">
              <div className="np-empty-icon np-empty-icon--error">⚠️</div>
              <strong>{t('notifications.error_loading')}</strong>
              <span>{error}</span>
              <button type="button" className="np-retry-btn" onClick={load}>{t('notifications.retry')}</button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="np-empty-state">
              <div className="np-empty-icon">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8.5 12h5M12 3V1"/>
                </svg>
              </div>
              <strong>
                {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
              </strong>
              <span>
                {filter === 'unread'
                  ? "Vous avez tout lu. Bravo ! 🎉"
                  : filter === 'all'
                  ? "Vous n'avez reçu aucune notification pour le moment."
                  : `Aucune notification de type « ${FILTERS.find(f => f.key === filter)?.label} » pour le moment.`
                }
              </span>
            </div>
          )}

          {!loading && !error && filtered.map((item, idx) => {
            const kindKey = String(item.kind || 'SYSTEM').toLowerCase();
            const icon = ICONS[item.kind] || ICONS.SYSTEM;
            const label = KIND_LABELS[item.kind] || 'Système';

            return (
              <button
                key={item.id}
                type="button"
                className={`np-item${item.is_read ? '' : ' np-item--unread'}`}
                onClick={() => handleClick(item)}
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                <span className={`np-item-icon kind-${kindKey}`}>{icon}</span>

                <span className="np-item-body">
                  <span className="np-item-meta">
                    <span className={`np-kind-chip kind-${kindKey}`}>{label}</span>
                    <span className="np-item-time">{timeAgo(item.created_at)}</span>
                  </span>
                  <strong className="np-item-title">{item.title}</strong>
                  {item.body && <span className="np-item-desc">{item.body}</span>}
                </span>

                <span className="np-item-right">
                  {!item.is_read && <span className="np-unread-dot" />}
                  <svg className="np-chevron" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
