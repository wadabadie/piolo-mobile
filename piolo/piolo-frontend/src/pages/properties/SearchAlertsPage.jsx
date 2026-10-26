import { useTranslation } from 'react-i18next';
import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { propertiesApi } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import UserAvatarMenu from '../../components/UserAvatarMenu';
import PioloLoader from '../../components/PioloLoader';
import '../bailleur/dashboard.css';

const emptyAlert = { title: '', city: '', neighborhood: '', property_type: '', transaction_type: 'LOCATION', min_price: '', max_price: '', min_area: '' };
const TYPES = [
  ['', 'Tous les types'],
  ['APPARTEMENT', 'Appartement'],
  ['VILLA', 'Villa'],
  ['STUDIO', 'Studio'],
  ['BUREAU', 'Bureau'],
  ['BOUTIQUE', 'Boutique'],
  ['IMMEUBLE', 'Immeuble'],
  ['TERRAIN', 'Terrain']
];

export default function SearchAlertsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [alerts, setAlerts] = useState([]);
  const [form, setForm] = useState(emptyAlert);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [results, setResults] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);

  // Auto-open via URL parameter guard
  const autoOpenedRef = useRef(false);

  // Modal de confirmation de suppression
  const [deleteConfirmAlert, setDeleteConfirmAlert] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const { data } = await propertiesApi.alerts();
      const rawList = Array.isArray(data) ? data : (data?.results || []);
      setAlerts(rawList);
    } catch (error) {
      console.error('Erreur chargement alertes:', error);
      setMessage('Impossible de charger vos alertes.');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const update = (name, value) => setForm((current) => ({ ...current, [name]: value }));

  const createAlert = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return setMessage("Donnez un nom à votre alerte.");
    setSaving(true);
    try {
      const { data } = await propertiesApi.createAlert(form);
      setAlerts((current) => [data, ...current]);
      setForm(emptyAlert);
      setOpen(false);
      setMessage('Alerte créée avec succès : vous serez averti dès qu’un bien correspondra.');
    } catch (error) {
      setMessage(error.response?.data?.detail || "Impossible de créer l'alerte.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmAlert) return;
    setDeleting(true);
    try {
      await propertiesApi.deleteAlert(deleteConfirmAlert.id);
      setAlerts((current) => current.filter((alert) => alert.id !== deleteConfirmAlert.id));
      setMessage(`Alerte « ${deleteConfirmAlert.title} » supprimée.`);
      setDeleteConfirmAlert(null);
    } catch {
      setMessage("Impossible de supprimer l'alerte.");
    } finally {
      setDeleting(false);
    }
  };

  const showResults = async (alert) => {
    setResults({ alert, items: [] });
    setResultsLoading(true);
    try {
      const { data } = await propertiesApi.alertResults(alert.id);
      const items = Array.isArray(data) ? data : (data?.results || []);
      setResults({ alert, items });
    } catch {
      setMessage('Impossible de charger les biens de cette alerte.');
    } finally {
      setResultsLoading(false);
    }
  };

  const handleCloseResults = () => {
    setResults(null);
    if (searchParams.get('alert')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('alert');
      setSearchParams(newParams, { replace: true });
    }
  };

  useEffect(() => {
    const target = searchParams.get('alert');
    if (!target) {
      autoOpenedRef.current = false;
      return;
    }
    if (!loading && target && alerts.length && !autoOpenedRef.current) {
      const targetAlert = alerts.find((item) => String(item.id) === String(target));
      if (targetAlert) {
        autoOpenedRef.current = true;
        showResults(targetAlert);
      }
    }
  }, [loading, alerts, searchParams]);

  return (
    <div className="layout">
      <Sidebar data={{ search_alerts: alerts }} />

      <div className="main" style={{ overflowY: 'auto' }}>
        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-title">Alertes de <span>Recherche</span></div>
          <div className="tb-actions" style={{ marginLeft: 'auto' }}>
            <UserAvatarMenu size={38} />
          </div>
        </header>

        <main className="content">
          {/* FIL D'ARIANE */}
          <div style={{ marginBottom: 20 }}>
            <Link to="/dashboard/locataire" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--gris)', textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              Retour au dashboard
            </Link>
          </div>

          {/* HERO BANNER */}
          <div className="hero-banner" style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div className="hero-content">
              <p className="hero-greet">{t('search_alerts.subtitle')}</p>
              <h1 className="hero-name">Mes <span>{t('search_alerts.title')}</span></h1>
              <p className="hero-sub">{alerts.length} alerte{alerts.length > 1 ? 's' : ''} active{alerts.length > 1 ? 's' : ''}</p>
            </div>
            <button onClick={() => setOpen(true)} style={goldButton}>
              + {t('search_alerts.create_btn')}
            </button>
          </div>

          {message && (
            <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(212,175,55,0.12)', color: 'var(--or-d)', border: '1px solid rgba(212,175,55,0.3)', marginBottom: 24, fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 600 }}>
              ✓ {message}
            </div>
          )}

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 22 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: 'var(--blanc)', border: '1.5px solid var(--gris-b)', borderRadius: 22, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ width: '50%', height: 20, borderRadius: 8, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                  <div style={{ width: '80%', height: 14, borderRadius: 6, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                  <div style={{ width: '65%', height: 14, borderRadius: 6, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                </div>
              ))}
            </div>
          ) : alerts.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 22 }}>
              {alerts.map((alert) => (
                <article
                  key={alert.id}
                  className="alert-card-premium"
                  style={{
                    background: 'var(--blanc)',
                    border: '1.5px solid var(--gris-b)',
                    borderRadius: 22,
                    padding: 24,
                    boxShadow: '0 8px 30px rgba(15,13,9,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    transition: 'all 0.25s ease',
                    position: 'relative',
                  }}
                >
                  <div>
                    {/* Header carte alerte */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(212,175,55,0.15)', display: 'grid', placeItems: 'center', color: 'var(--or-d)' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
                        </div>
                        <h2 style={{ fontSize: 18, margin: 0, fontFamily: 'Poppins, sans-serif', fontWeight: 800, color: 'var(--noir)' }}>
                          {alert.title}
                        </h2>
                      </div>
                      <span style={{ color: '#1E7A47', fontSize: 11, fontWeight: 700, background: 'rgba(30,122,71,0.1)', padding: '4px 10px', borderRadius: 20, fontFamily: 'Poppins, sans-serif' }}>
                        ✓ Active
                      </span>
                    </div>

                    {/* Contenu critères */}
                    <div style={{ background: 'var(--gris-f)', padding: '14px 16px', borderRadius: 14, marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--noir)', fontWeight: 600 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--or-d)"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        <span>{alert.city || 'Toutes les villes'}{alert.neighborhood ? `, ${alert.neighborhood}` : ''}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--gris-m)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--or-d)"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                        <span>{TYPES.find(([key]) => key === alert.property_type)?.[1] || 'Tous les types'} · {alert.transaction_type === 'VENTE' ? 'Vente' : 'Location'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--or-d)', fontWeight: 700 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--or-d)"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>
                        <span>{(alert.min_price || alert.max_price) ? `${alert.min_price ? Number(alert.min_price).toLocaleString('fr-FR') : '0'} - ${alert.max_price ? Number(alert.max_price).toLocaleString('fr-FR') : 'Max'} FCFA` : 'Sans limite de budget'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bas de carte */}
                  <div style={{ borderTop: '1px solid var(--gris-b)', paddingTop: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--or-d)', fontFamily: 'Poppins, sans-serif', background: 'rgba(212,175,55,0.1)', padding: '4px 12px', borderRadius: 20 }}>
                        {alert.matches_count ?? 0} bien{(alert.matches_count ?? 0) > 1 ? 's' : ''} trouvé{(alert.matches_count ?? 0) > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button type="button" onClick={() => showResults(alert)} style={{ ...outlineButton, flex: 2, textAlign: 'center', padding: '11px 14px' }}>
                        Voir les biens →
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmAlert(alert)}
                        style={{ padding: '11px 14px', borderRadius: 12, border: '1px solid rgba(184,50,50,0.25)', background: 'rgba(184,50,50,0.06)', color: 'var(--rouge)', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : !loading && (
            <div style={{ textAlign: 'center', padding: 54, background: 'var(--blanc)', borderRadius: 22, border: '1px solid var(--gris-b)' }}>
              <div style={{ fontSize: 46, marginBottom: 12 }}>🔔</div>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 20, fontWeight: 800, color: 'var(--noir)', marginBottom: 8 }}>{t('search_alerts.no_alerts')}</h2>
              <p style={{ color: 'var(--gris-m)', fontSize: 14, marginBottom: 24, maxWidth: 460, margin: '0 auto 24px' }}>
                Créez votre première alerte pour être notifié automatiquement dès qu'un bien immobilier correspondant à vos critères est publié.
              </p>
              <button onClick={() => setOpen(true)} style={goldButton}>{t('search_alerts.create_first_btn')}</button>
            </div>
          )}

          {/* MODAL DE CONFIRMATION DE SUPPRESSION */}
          {deleteConfirmAlert && (
            <div style={backdrop} onClick={() => setDeleteConfirmAlert(null)}>
              <div style={{ ...modal, maxWidth: 440, textElement: 'center', padding: 30 }} onClick={e => e.stopPropagation()}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(184,50,50,0.12)', color: 'var(--rouge)', display: 'grid', placeItems: 'center', margin: '0 auto 16px', fontSize: 24 }}>
                  ⚠️
                </div>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 19, fontWeight: 800, color: 'var(--noir)', margin: '0 0 10px', textAlign: 'center' }}>
                  Supprimer cette alerte ?
                </h3>
                <p style={{ fontSize: 13.5, color: 'var(--gris-m)', lineHeight: 1.6, textAlign: 'center', margin: '0 0 24px' }}>
                  Voulez-vous vraiment supprimer l'alerte « <strong>{deleteConfirmAlert.title}</strong> » ? Vous ne recevrez plus de notifications pour ces critères.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmAlert(null)}
                    style={{ flex: 1, padding: 12, borderRadius: 12, border: '1.5px solid var(--gris-b)', background: 'var(--gris-f)', color: 'var(--noir)', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    disabled={deleting}
                    style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: 'var(--rouge)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins, sans-serif', boxShadow: '0 4px 15px rgba(184,50,50,0.3)' }}
                  >
                    {deleting ? 'Suppression…' : 'Supprimer définitivement'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL RÉSULTATS */}
          {results && (
            <div style={backdrop} onClick={handleCloseResults}>
              <div style={{ ...modal, maxWidth: 900, maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={handleCloseResults}
                  style={{
                    position: 'absolute', top: 18, right: 20, border: 0,
                    background: 'rgba(0,0,0,0.06)', borderRadius: '50%',
                    width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, cursor: 'pointer', color: 'var(--noir)', zIndex: 10
                  }}
                  title="Fermer la fenêtre"
                >
                  ×
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, paddingRight: 40 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'rgba(212,175,55,.16)', color: 'var(--or-d)', fontWeight: 800 }}>🔔</div>
                  <div>
                    <h2 style={{ fontFamily: 'Poppins, sans-serif', margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--noir)' }}>{results.alert.title}</h2>
                    <p style={{ color: 'var(--gris-m)', margin: '2px 0 0', fontSize: 13 }}>
                      {resultsLoading ? 'Recherche des biens…' : `${results.items.length} bien${results.items.length === 1 ? '' : 's'} trouvé${results.items.length === 1 ? '' : 's'}`}
                    </p>
                  </div>
                </div>

                {resultsLoading ? (
                  <div style={{ padding: 50, textAlign: 'center', color: 'var(--gris-m)' }}>{t('search_alerts.loading_matches')}</div>
                ) : !results.items.length ? (
                  <p style={{ padding: 30, textAlign: 'center', color: 'var(--gris-m)' }}>{t('search_alerts.no_matches')}</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 16, marginTop: 18 }}>
                    {results.items.map((item) => (
                      <Link
                        key={item.id}
                        to={`/properties/${item.slug || item.id}`}
                        onClick={handleCloseResults}
                        style={{ textDecoration: 'none', color: 'var(--noir)', border: '1px solid var(--gris-b)', borderRadius: 16, overflow: 'hidden', background: 'var(--blanc)', boxShadow: 'var(--shadow-sm)' }}
                      >
                        <img src={item.cover_image || item.main_image || '/img/placeholder-property.jpg'} alt={item.title} style={{ width: '100%', height: 135, objectFit: 'cover' }} />
                        <div style={{ padding: 12, fontWeight: 700, fontSize: 14, color: 'var(--noir)' }}>{item.title}</div>
                        <div style={{ padding: '0 12px 12px', fontSize: 12, color: 'var(--or-d)', fontWeight: 800 }}>
                          {item.city} · {Number(item.price || 0).toLocaleString('fr-FR')} FCFA
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODAL CRÉATION */}
          {open && (
            <div style={backdrop} onClick={() => setOpen(false)}>
              <form onSubmit={createAlert} style={modal} onClick={e => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{
                    position: 'absolute', top: 18, right: 20, border: 0,
                    background: 'rgba(0,0,0,0.06)', borderRadius: '50%',
                    width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, cursor: 'pointer', color: 'var(--noir)', zIndex: 10
                  }}
                  title="Fermer"
                >
                  ×
                </button>
                <h2 style={{ fontFamily: 'Poppins, sans-serif', marginTop: 0, fontSize: 20, fontWeight: 800, color: 'var(--noir)' }}>{t('search_alerts.create_btn')}</h2>
                <p style={{ color: 'var(--gris-m)', fontSize: 13, marginBottom: 20 }}>{t('search_alerts.notify_hint')}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>{t('search_alerts.alert_name')}</label>
                    <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="Ex. Mon futur studio à Bastos" style={inputStyle} required />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Ville</label>
                      <select value={form.city} onChange={e => update('city', e.target.value)} style={inputStyle}>
                        <option value="">Toutes les villes</option>
                        <option>Yaoundé</option>
                        <option>Douala</option>
                        <option>Bafoussam</option>
                        <option>Garoua</option>
                        <option>Maroua</option>
                        <option>Kribi</option>
                        <option>Limbe</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>{t('search_alerts.neighborhood')}</label>
                      <input value={form.neighborhood} onChange={e => update('neighborhood', e.target.value)} placeholder="Ex. Bastos" style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Transaction</label>
                      <select value={form.transaction_type} onChange={e => update('transaction_type', e.target.value)} style={inputStyle}>
                        <option value="LOCATION">Location</option>
                        <option value="VENTE">Vente</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Type</label>
                      <select value={form.property_type} onChange={e => update('property_type', e.target.value)} style={inputStyle}>
                        {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>{t('search_alerts.min_budget')}</label>
                      <input type="number" min="0" value={form.min_price} onChange={e => update('min_price', e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>{t('search_alerts.max_budget')}</label>
                      <input type="number" min="0" value={form.max_price} onChange={e => update('max_price', e.target.value)} style={inputStyle} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  <button type="button" onClick={() => setOpen(false)} style={{ ...outlineButton, flex: 1, padding: 12 }}>Annuler</button>
                  <button disabled={saving} style={{ ...goldButton, flex: 2, padding: 12 }}>{saving ? 'Création…' : 'Créer l’alerte'}</button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .alert-card-premium {
          background: var(--blanc) !important;
          border-color: var(--gris-b) !important;
        }
        .alert-card-premium:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 35px rgba(212,175,55,0.15) !important;
          border-color: rgba(212,175,55,0.4) !important;
        }
        html.dark .alert-card-premium {
          background: var(--blanc) !important;
          border-color: var(--gris-b) !important;
        }
      `}</style>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--gris-m)', marginBottom: 6, textTransform: 'uppercase', fontFamily: 'Poppins, sans-serif' };
const inputStyle = { width: '100%', boxSizing: 'border-box', border: '1.5px solid var(--gris-b)', borderRadius: 12, padding: '11px 14px', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none', background: 'var(--gris-f)', color: 'var(--noir)' };
const labelHeaderStyle = { fontSize: 11, fontWeight: 700, color: 'var(--gris-m)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7, fontFamily: 'Poppins, sans-serif' };
const goldButton = { border: 0, borderRadius: 12, padding: '12px 22px', background: 'linear-gradient(135deg,#D4AF37,#F6D365)', fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#0F0D09', cursor: 'pointer', boxShadow: '0 4px 15px rgba(212,175,55,0.3)' };
const outlineButton = { border: '1.5px solid var(--or)', borderRadius: 12, padding: '10px 14px', background: 'rgba(212,175,55,0.12)', fontWeight: 700, fontSize: 13, color: 'var(--or-d)', textDecoration: 'none', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' };
const fullGoldBtnStyle = { width: '100%', border: 'none', borderRadius: 12, padding: '13px 18px', background: 'linear-gradient(135deg, var(--or), var(--or-l))', color: 'var(--noir)', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Poppins, sans-serif', boxShadow: '0 6px 18px rgba(212,175,55,0.3)' };
const backdrop = { position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(15,13,9,.75)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', padding: 18 };
const modal = { width: 'min(480px, 100%)', background: 'var(--blanc)', padding: 28, borderRadius: 22, boxShadow: '0 24px 60px rgba(0,0,0,.35)', position: 'relative' };
