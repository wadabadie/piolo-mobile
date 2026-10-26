import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import api from '../services/api';
import { getMediaUrl } from '../utils/media';
import './PioloChatbot.css';

const Icon = ({ path, size = 18 }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);
const chatPath = 'M20 11.5a8 8 0 0 1-8 8 8.8 8.8 0 0 1-3.3-.65L4 20l1.15-3.4A8 8 0 1 1 20 11.5Z';

function FormattedText({ text }) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </span>
  );
}

export default function PioloChatbot() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { config } = useSiteConfig();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(() => 
    user?.role === 'BAILLEUR'
      ? (i18n.language === 'en' ? ['How to publish a listing?', 'How to become a verified landlord?', 'Create a 360° virtual tour'] : ['Comment publier une annonce ?', 'Comment devenir bailleur vérifié ?', 'Créer une visite 360°'])
      : (i18n.language === 'en' ? ['Find a studio in Yaoundé', 'How to schedule a visit?', 'View available listings'] : ['Trouver un studio à Yaoundé', 'Comment planifier une visite ?', 'Voir les biens disponibles'])
  );
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: t('chatbot.welcome_msg', { name: user?.first_name ? ` ${user.first_name}` : '' }),
      time: new Date(),
    },
  ]);
  const endRef = useRef(null);
  const fabDragRef = useRef({ active: false, moved: false, startX: 0, startY: 0, right: 0, bottom: 0, pointerId: null });
  const suppressFabClickRef = useRef(false);
  const [fabPosition, setFabPosition] = useState(null);
  const [fabDragging, setFabDragging] = useState(false);
  const [mobileViewportStyle, setMobileViewportStyle] = useState({});

  useEffect(() => {
    if (!open) {
      setMobileViewportStyle({});
      return;
    }

    const updateViewport = () => {
      if (window.innerWidth <= 600) {
        if (window.visualViewport) {
          setMobileViewportStyle({
            height: `${window.visualViewport.height}px`,
            top: `${window.visualViewport.offsetTop}px`,
            position: 'fixed'
          });
        }
      } else {
        setMobileViewportStyle({});
      }
    };

    updateViewport();
    window.visualViewport?.addEventListener('resize', updateViewport);
    window.visualViewport?.addEventListener('scroll', updateViewport);
    window.addEventListener('resize', updateViewport);

    const prevOverflow = document.body.style.overflow;
    if (window.innerWidth <= 600) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.visualViewport?.removeEventListener('resize', updateViewport);
      window.visualViewport?.removeEventListener('scroll', updateViewport);
      window.removeEventListener('resize', updateViewport);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem('piolo-chat-fab-position') || 'null');
      if (saved && Number.isFinite(saved.right) && Number.isFinite(saved.bottom)) {
        setFabPosition({ right: saved.right, bottom: saved.bottom });
      }
    } catch { /* stockage indisponible : position CSS par défaut */ }
  }, []);

  const isMobileViewport = () => typeof window !== 'undefined'
    && (window.matchMedia?.('(max-width: 600px)').matches || window.innerWidth <= 600);

  const moveFab = (event) => {
    const d = fabDragRef.current;
    if (!d.active || (d.pointerId != null && event.pointerId !== d.pointerId)) return;
    event.preventDefault();
    const dx = event.clientX - d.startX;
    const dy = event.clientY - d.startY;
    if (Math.hypot(dx, dy) > 6) d.moved = true;
    const size = 58;
    const right = Math.max(8, Math.min(window.innerWidth - size - 8, d.right - dx));
    const bottom = Math.max(8, Math.min(window.innerHeight - size - 8, d.bottom - dy));
    d.startX = event.clientX;
    d.startY = event.clientY;
    d.right = right;
    d.bottom = bottom;
    setFabPosition({ right, bottom });
  };

  const stopFabDrag = () => {
    const d = fabDragRef.current;
    if (!d.active) return;
    d.active = false;
    setFabDragging(false);
    window.removeEventListener('pointermove', moveFab);
    window.removeEventListener('pointerup', stopFabDrag);
    window.removeEventListener('pointercancel', stopFabDrag);
    if (d.moved) {
      suppressFabClickRef.current = true;
      try { window.localStorage.setItem('piolo-chat-fab-position', JSON.stringify({ right: d.right, bottom: d.bottom })); } catch { /* ignore */ }
    }
  };

  const startFabDrag = (event) => {
    if (!isMobileViewport() || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    fabDragRef.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      startY: event.clientY,
      right: fabPosition?.right ?? window.innerWidth - rect.right,
      bottom: fabPosition?.bottom ?? window.innerHeight - rect.bottom,
      pointerId: event.pointerId,
    };
    setFabDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    window.addEventListener('pointermove', moveFab, { passive: false });
    window.addEventListener('pointerup', stopFabDrag);
    window.addEventListener('pointercancel', stopFabDrag);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (value = draft) => {
    const text = value.trim();
    if (!text || loading) return;
    const next = [...messages, { role: 'user', content: text, time: new Date() }];
    setMessages(next);
    setDraft('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/chat/assistant/', {
        message: text,
        // Envoyer uniquement les messages précédents : le message courant est
        // déjà transmis séparément dans "message".
        history: messages.slice(-8).map(m => ({ role: m.role, content: m.content })),
      });
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: data.message, 
          properties: data.properties || [], 
          require_login: data.require_login || false,
          time: new Date() 
        },
      ]);
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      const content =
        error.response?.status === 429
          ? t('chatbot.rate_limit')
          : error.response?.data?.error ||
            t('chatbot.network_error');
      setMessages(prev => [...prev, { role: 'assistant', content, time: new Date(), error: true }]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMessages([
      {
        role: 'assistant',
        content: t('chatbot.reset_msg'),
        time: new Date(),
      },
    ]);
  };

  const location = useLocation();
  const isFullscreenRoute = location.pathname.startsWith('/messages') ||
    location.pathname.includes('/tour') ||
    location.pathname === '/discovery' ||
    location.pathname === '/decouverte';

  if (isFullscreenRoute) return null;

  const handleSuggestionClick = (s) => {
    const lower = (s || '').toLowerCase();
    if (lower.includes('connecter') || lower.includes('connexion') || lower === 'login') {
      setOpen(false);
      navigate('/login');
    } else if (lower.includes('créer un compte') || lower.includes('creer un compte') || lower.includes('inscrire') || lower.includes('inscription') || lower.includes('register') || lower.includes('sign up')) {
      setOpen(false);
      navigate('/register');
    } else {
      send(s);
    }
  };

  return (
    <>
      <button
        className={`piolo-chat-fab ${open ? 'is-open' : ''} ${fabDragging ? 'is-dragging' : ''}`}
        style={fabPosition && isMobileViewport() ? { right: `${fabPosition.right}px`, bottom: `${fabPosition.bottom}px` } : undefined}
        onPointerDown={startFabDrag}
        onClick={() => {
          if (suppressFabClickRef.current) { suppressFabClickRef.current = false; return; }
          setOpen(v => !v);
        }}
        aria-label={open ? t('chatbot.close_btn') : t('chatbot.open_btn')}
      >
        <Icon path={open ? 'M6 6l12 12M18 6 6 18' : chatPath} size={22} />
        <span className="piolo-chat-fab__ping" />
      </button>

      {open && (
        <aside 
          className="piolo-chat-drawer" 
          aria-label={t('chatbot.title')}
          style={mobileViewportStyle}
        >
          <header className="piolo-chat-head">
            <div className="piolo-chat-brand">
              <div className="piolo-chat-mark">
                <Icon path={chatPath} size={20} />
              </div>
              <div>
                <strong>{config.site_name || 'Piolo'} {t('chatbot.title')}</strong>
                <span>
                  <i /> {t('chatbot.status')}
                </span>
              </div>
            </div>
            <div className="piolo-chat-actions">
              <button onClick={reset} aria-label={t('chatbot.reset_title')} title={t('chatbot.reset_title')}>
                <Icon path="M4 4v6h6M20 20v-6h-6M5.5 14a7 7 0 0 0 11.9 2M18.5 10A7 7 0 0 0 6.6 8" size={17} />
              </button>
              <button onClick={() => setOpen(false)} aria-label={t('chatbot.close_btn')}>
                <Icon path="M6 6l12 12M18 6 6 18" size={18} />
              </button>
            </div>
          </header>

          <div className="piolo-chat-body">
            <div className="piolo-chat-welcome">
              {t('chatbot.welcome_title')}
              <span>{t('chatbot.welcome_subtitle')}</span>
            </div>

            {messages.map((m, i) => (
              <div
                className={`piolo-chat-message ${m.role === 'user' ? 'is-user' : 'is-assistant'}`}
                key={`${m.time?.getTime?.() || i}-${i}`}
              >
                <div className="piolo-chat-bubble">
                  <FormattedText text={m.content} />
                  {m.require_login && (
                    <div style={{ marginTop: 12 }}>
                      <Link to="/login" onClick={() => setOpen(false)} className="btn btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 13, textDecoration: 'none', borderRadius: 8, fontWeight: 700 }}>
                        <Icon path="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" size={15} />
                        {t('chatbot.login_btn')}
                      </Link>
                    </div>
                  )}
                  <time>{m.time?.toLocaleTimeString?.(i18n.language === 'en' ? 'en-US' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })}</time>
                </div>

                {m.properties?.length > 0 && (
                  <div className="piolo-chat-results">
                    {m.properties.map(p => (
                      <Link to={`/properties/${p.slug || p.id}`} onClick={() => setOpen(false)} className="piolo-chat-property" key={p.id}>
                        <img src={getMediaUrl(p.cover_image || p.main_image)} alt="" />
                        <span>
                          <strong>{p.title}</strong>
                          <small>{p.city}{p.neighborhood ? ` · ${p.neighborhood}` : ''}</small>
                          <b>{Number(p.price || 0).toLocaleString(i18n.language === 'en' ? 'en-US' : 'fr-FR')} {t('common.fcfa')}</b>
                        </span>
                        <Icon path="M9 18l6-6-6-6" size={16} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="piolo-chat-typing">
                <span />
                <span />
                <span /> {t('chatbot.typing')}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="piolo-chat-composer">
            <div className="piolo-chat-suggestions">
              {suggestions.map(s => (
                <button key={s} onClick={() => handleSuggestionClick(s)}>
                  {s}
                </button>
              ))}
            </div>
            <div className="piolo-chat-input">
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') send();
                }}
                placeholder={t('chatbot.placeholder')}
                maxLength={2000}
                spellCheck={false}
                autoComplete="off"
              />
              <button onClick={() => send()} disabled={!draft.trim() || loading} aria-label={t('common.send')}>
                <Icon path="M4 12h15M13 6l6 6-6 6" size={18} />
              </button>
            </div>
            <small>{t('chatbot.disclaimer')}</small>
          </div>
        </aside>
      )}
    </>
  );
}
