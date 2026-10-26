import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { cacheManager } from '../../services/cacheManager';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import NotificationCenter from '../../components/NotificationCenter';
import UserAvatarMenu from '../../components/UserAvatarMenu';
import { getMediaUrl } from '../../utils/media';
import '../bailleur/dashboard.css';

export default function VisitsListPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const cachedVisits = cacheManager.get(`visits_list_${user?.id || 'anon'}`);
  const [loading, setLoading] = useState(() => !cachedVisits);
  const [error, setError] = useState('');
  const [visits, setVisits] = useState(() => cachedVisits || []);
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, CONFIRMED, PENDING, CANCELLED
  const [searchQuery, setSearchQuery] = useState('');
  const points = user?.points ?? 0;
  const isBailleur = user?.role === 'BAILLEUR' || user?.is_bailleur;
  const dashboardPath = isBailleur ? '/dashboard/bailleur' : '/dashboard/locataire';

  const fetchVisits = useCallback(async () => {
    const existing = cacheManager.get(`visits_list_${user?.id || 'anon'}`);
    if (!existing) setLoading(true);
    setError('');
    try {
      const response = await api.get('/properties/requests/visits/');
      const data = response.data?.results || response.data || [];
      setVisits(data);
      cacheManager.set(`visits_list_${user?.id || 'anon'}`, data, 180000);
    } catch (requestError) {
      console.error('Erreur chargement visites:', requestError);
      if (!existing) setError(requestError.response?.data?.detail || t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [user?.id, t]);

  useEffect(() => { 
    if (user?.id) fetchVisits(); 
  }, [fetchVisits, user?.id]);

  const cancelVisit = async (visitId) => {
    if (!window.confirm(t('visits.cancel_confirm'))) return;
    try {
      await api.post(`/properties/visits/${visitId}/`, { action: 'cancel' });
      fetchVisits();
    } catch (err) {
      alert(err.response?.data?.error || t('common.error'));
    }
  };

  // Filtrage réactif des visites
  const filteredVisits = useMemo(() => {
    return visits.filter(v => {
      // Filtre de statut
      if (filterStatus === 'CONFIRMED' && v.status !== 'CONFIRMED') return false;
      if (filterStatus === 'PENDING' && v.status !== 'PENDING') return false;
      if (filterStatus === 'CANCELLED' && !['CANCELLED', 'REFUSED'].includes(v.status)) return false;

      // Filtre de recherche
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const title = (v.property?.title || '').toLowerCase();
        const city = (v.property?.city || '').toLowerCase();
        const hood = (v.property?.neighborhood || '').toLowerCase();
        const tenant = (v.tenant?.full_name || `${v.tenant?.first_name || ''} ${v.tenant?.last_name || ''}`).toLowerCase();
        return title.includes(query) || city.includes(query) || hood.includes(query) || tenant.includes(query);
      }

      return true;
    });
  }, [visits, filterStatus, searchQuery]);

  return (
    <div className="layout">
      <Sidebar data={{ upcoming_visits: visits }} />

      <div className="main">
        {/* TOPBAR */}
        <header className="topbar" style={{ padding: '14px 20px', borderBottom: '1px solid var(--gris-b)', background: 'var(--blanc)' }}>
          <div className="topbar-title" style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>
            {isBailleur ? t('visits.title_bailleur') : t('visits.title_locataire')} <span style={{ color: 'var(--or-d)' }}>{t('visits.title_highlight')}</span>
          </div>
          
          <div className="tb-actions" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="tb-pts-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 20 }}>
              <svg width="14" height="14" fill="var(--or)" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              <span className="tb-pts-val" style={{ fontSize: 12, fontWeight: 800, color: 'var(--noir)' }}>{points} {t('nav.points')}</span>
            </div>
            <NotificationCenter />
            <UserAvatarMenu size={36} />
          </div>
        </header>

        <main className="content" style={{ padding: '20px 16px 80px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          {/* RETOUR RAPIDE */}
          <div style={{ marginBottom: 16 }}>
            <Link 
              to={dashboardPath} 
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--gris)', textDecoration: 'none', background: 'var(--gris-f)', padding: '6px 14px', borderRadius: 20, border: '1px solid var(--gris-b)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              {t('common.dashboard')}
            </Link>
          </div>

          {/* HERO BANNER AVEC FOND DE VILLA CAMEROUNAISE */}
          <div 
            style={{ 
              marginBottom: 20,
              padding: '30px 24px',
              borderRadius: 24,
              background: "linear-gradient(135deg, rgba(15, 13, 9, 0.88) 0%, rgba(26, 23, 17, 0.78) 100%), url('/img/cameroun-luxury-banner.jpg') center/cover no-repeat",
              color: '#FFFFFF',
              border: '1px solid rgba(212,175,55,0.35)',
              boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--or-l)', marginBottom: 8, background: 'rgba(15,13,9,0.65)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(212,175,55,0.3)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--or)"><path d="M19 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>
                <span>{t('visits.badge')}</span>
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px', color: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}>
                {isBailleur ? t('visits.title_bailleur') : t('visits.title_locataire')} <span style={{ color: 'var(--or-l)' }}>{t('visits.title_highlight')}</span>
              </h1>
              <p style={{ margin: 0, fontSize: 13.5, color: 'rgba(255,255,255,0.82)', lineHeight: 1.5, maxWidth: 540 }}>
                {isBailleur 
                  ? t('visits.desc_bailleur')
                  : t('visits.desc_locataire')}
              </p>
            </div>
          </div>

          {/* BARRE DE RECHERCHE & FILTRES TACTILES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {/* Barre de recherche */}
            <div style={{ position: 'relative', width: '100%' }}>
              <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, fill: 'var(--gris)' }} viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input 
                type="text" 
                placeholder={t('visits.search_placeholder')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  borderRadius: 14,
                  border: '1px solid var(--gris-b)',
                  background: 'var(--blanc)',
                  color: 'var(--noir)',
                  fontSize: 14,
                  fontFamily: 'Poppins, sans-serif',
                  outline: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  boxSizing: 'border-box'
                }}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'var(--gris-b)', color: 'var(--noir)', width: 22, height: 22, borderRadius: '50%', cursor: 'pointer', fontSize: 12, fontWeight: 'bold' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Chips de filtres */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
              {[
                { id: 'ALL', label: `${t('visits.status_all')} (${visits.length})`, icon: null },
                { 
                  id: 'CONFIRMED', 
                  label: t('visits.status_confirmed'), 
                  icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                },
                { 
                  id: 'PENDING', 
                  label: t('visits.status_pending'), 
                  icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                },
                { 
                  id: 'CANCELLED', 
                  label: t('locations.status_refused_cancelled'), 
                  icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                }
              ].map(chip => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setFilterStatus(chip.id)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: 'Poppins, sans-serif',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    border: filterStatus === chip.id ? '1px solid var(--or)' : '1px solid var(--gris-b)',
                    background: filterStatus === chip.id ? '#1A1711' : 'var(--blanc)',
                    color: filterStatus === chip.id ? '#FFFFFF' : 'var(--gris)',
                    boxShadow: filterStatus === chip.id ? '0 2px 8px rgba(212,175,55,0.25)' : 'none',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                >
                  {chip.icon}
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* LISTE DES DEMANDES DE VISITES */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ padding: 18, border: '1px solid var(--gris-b)', borderRadius: 20, background: 'var(--blanc)', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                  <div style={{ width: '100%', height: 160, borderRadius: 14, background: 'linear-gradient(90deg,var(--gris-b) 25%,var(--gris-f) 50%,var(--gris-b) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginBottom: 12 }} />
                  <div style={{ width: '60%', height: 16, borderRadius: 6, background: 'var(--gris-b)', marginBottom: 8 }} />
                  <div style={{ width: '40%', height: 14, borderRadius: 6, background: 'var(--gris-b)' }} />
                </div>
              ))}
            </div>
          ) : error ? (
            <div style={{ padding: 36, textAlign: 'center', background: 'var(--blanc)', borderRadius: 20, border: '1px solid #FCA5A5', color: '#DC2626' }}>
              <p style={{ margin: '0 0 14px', fontWeight: 600 }}>{error}</p>
              <button 
                type="button" 
                onClick={fetchVisits} 
                style={{ border: 0, borderRadius: 12, padding: '10px 20px', background: 'linear-gradient(135deg, var(--or), var(--or-l))', color: '#0F0D09', fontWeight: 800, cursor: 'pointer' }}
              >
                {t('common.retry')}
              </button>
            </div>
          ) : filteredVisits.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
              {filteredVisits.map((visit) => {
                const isConfirmed = visit.status === 'CONFIRMED';
                const isPending = visit.status === 'PENDING';
                const isRefused = visit.status === 'REFUSED';
                const isCancelled = visit.status === 'CANCELLED';
                const propImg = getMediaUrl(visit.property?.main_image || visit.property?.cover_image || '/img/property-placeholder.jpg');

                return (
                  <div 
                    key={visit.id} 
                    style={{
                      background: 'var(--blanc)',
                      borderRadius: 20,
                      border: isConfirmed ? '1.5px solid rgba(16,185,129,0.35)' : '1px solid var(--gris-b)',
                      boxShadow: isConfirmed ? '0 6px 20px rgba(16,185,129,0.08)' : '0 4px 16px rgba(15,13,9,0.04)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                  >
                    {/* Header Image & Status Badge */}
                    <div style={{ position: 'relative', width: '100%', height: 160, background: '#17140E', overflow: 'hidden' }}>
                      <img 
                        src={propImg} 
                        alt={visit.property?.title || 'Logement'} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.currentTarget.src = '/static/img/logo-piolo-clean.png'; }}
                      />

                      {/* Status Tag */}
                      <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
                        {isConfirmed && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: 'rgba(16,185,129,0.92)', backdropFilter: 'blur(8px)', color: '#FFFFFF', fontSize: 11, fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                            {t('visits.status_confirmed')}
                          </span>
                        )}
                        {isPending && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: 'rgba(212,175,55,0.92)', backdropFilter: 'blur(8px)', color: '#0F0D09', fontSize: 11, fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            {t('visits.status_pending')}
                          </span>
                        )}
                        {isRefused && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: 'rgba(220,38,38,0.92)', backdropFilter: 'blur(8px)', color: '#FFFFFF', fontSize: 11, fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>
                            {t('locations.status_refused')}
                          </span>
                        )}
                        {isCancelled && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: 'rgba(107,114,128,0.92)', backdropFilter: 'blur(8px)', color: '#FFFFFF', fontSize: 11, fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>
                            {t('visits.status_cancelled')}
                          </span>
                        )}
                      </div>

                      {/* Price Badge */}
                      {visit.property?.price && (
                        <div style={{ position: 'absolute', bottom: 10, right: 12, background: 'rgba(15,13,9,0.85)', backdropFilter: 'blur(6px)', padding: '4px 10px', borderRadius: 8, color: 'var(--or-l)', fontSize: 12, fontWeight: 800, border: '1px solid rgba(212,175,55,0.4)' }}>
                          {Number(visit.property.price).toLocaleString('fr-FR')} {t('common.fcfa')}
                        </div>
                      )}
                    </div>

                    {/* Content Body */}
                    <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      {/* Scheduled Date Pill */}
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, background: isConfirmed ? 'rgba(16,185,129,0.12)' : 'rgba(212,175,55,0.12)', border: isConfirmed ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(212,175,55,0.25)', marginBottom: 10, width: 'fit-content' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill={isConfirmed ? '#10B981' : 'var(--or)'}><path d="M19 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>
                        <span style={{ fontSize: 12, fontWeight: 700, color: isConfirmed ? 'var(--vert)' : 'var(--or-d)', fontFamily: 'Poppins, sans-serif' }}>
                          {isConfirmed ? (visit.confirmed_date || visit.requested_date) : `${t('visits.planned_for')} ${visit.requested_date}`}
                          {isConfirmed && visit.confirmed_time ? ` ${t('visits.at')} ${visit.confirmed_time.slice(0, 5)}` : ''}
                        </span>
                      </div>

                      {/* Property Title & Location */}
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--noir)', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'Poppins, sans-serif' }}>
                        {visit.property?.title || 'Logement Piolo'}
                      </h3>
                      <div style={{ fontSize: 12.5, color: 'var(--gris)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--or)"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        <span>{visit.property?.city}{visit.property?.neighborhood ? `, ${visit.property.neighborhood}` : ''}</span>
                      </div>

                      {/* Bailleur / Tenant Note */}
                      {visit.bailleur_note && (
                        <div style={{ padding: '8px 12px', borderRadius: 10, background: 'var(--gris-f)', borderLeft: '3px solid var(--or)', fontSize: 12, color: 'var(--gris)', fontStyle: 'italic', marginBottom: 14 }}>
                          <b>{t('visits.landlord_note')} :</b> {visit.bailleur_note}
                        </div>
                      )}

                      {/* Demandeur info for Bailleur */}
                      {isBailleur && visit.tenant && (
                        <div style={{ fontSize: 12, color: 'var(--gris)', background: 'var(--gris-f)', padding: '6px 10px', borderRadius: 8, marginBottom: 12, border: '1px solid var(--gris-b)' }}>
                          <b>{t('visits.tenant')} :</b> {visit.tenant.full_name || `${visit.tenant.first_name || ''} ${visit.tenant.last_name || ''}`}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--gris-b)', flexWrap: 'wrap' }}>
                        <Link 
                          to={`/dashboard/${isBailleur ? 'bailleur' : 'locataire'}/visites/${visit.id}`} 
                          style={{
                            flex: 1,
                            minWidth: 120,
                            padding: '9px 14px',
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #1A1711, #0F0D09)',
                            border: '1px solid rgba(212,175,55,0.3)',
                            color: 'var(--or-l)',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: 12,
                            fontWeight: 800,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                          <span>{t('visits.manage_btn')}</span>
                        </Link>

                        {visit.property?.slug && (
                          <Link 
                            to={`/properties/${visit.property.slug}`} 
                            style={{
                              padding: '9px 12px',
                              borderRadius: 12,
                              background: 'var(--gris-f)',
                              border: '1px solid var(--gris-b)',
                              color: 'var(--noir)',
                              fontFamily: 'Poppins, sans-serif',
                              fontSize: 12,
                              fontWeight: 700,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 5
                            }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            <span>{t('visits.view_listing')}</span>
                          </Link>
                        )}

                        {!isBailleur && isPending && (
                          <button 
                            type="button"
                            onClick={() => cancelVisit(visit.id)} 
                            style={{
                              padding: '9px 12px',
                              borderRadius: 12,
                              background: 'rgba(220,38,38,0.08)',
                              border: '1px solid rgba(220,38,38,0.2)',
                              color: 'var(--rouge)',
                              fontFamily: 'Poppins, sans-serif',
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {t('visits.cancel_visit')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : !loading && (
            <div 
              style={{ 
                textAlign: 'center', 
                padding: '48px 24px', 
                background: 'var(--blanc)', 
                borderRadius: 24, 
                border: '1px solid var(--gris-b)', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                margin: '20px auto',
                maxWidth: 480
              }}
            >
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(212,175,55,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(212,175,55,0.25)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--or)"><path d="M19 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>
              </div>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--noir)', marginBottom: 8 }}>
                {visits.length === 0 ? t('visits.empty_title') : t('visits.empty_filtered_title')}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--gris)', lineHeight: 1.5, margin: '0 0 20px' }}>
                {visits.length === 0 
                  ? t('visits.empty_desc') 
                  : t('visits.empty_filter_desc')}
              </p>
              {visits.length === 0 ? (
                <Link 
                  to="/properties" 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    padding: '11px 22px', 
                    background: 'linear-gradient(135deg, var(--or), var(--or-l))', 
                    borderRadius: 14, 
                    color: '#0F0D09', 
                    fontFamily: 'Poppins, sans-serif', 
                    fontSize: 13, 
                    fontWeight: 800, 
                    textDecoration: 'none', 
                    boxShadow: '0 4px 14px rgba(212,175,55,0.35)' 
                  }}
                >
                  {t('favorites.explore_btn')}
                </Link>
              ) : (
                <button 
                  type="button" 
                  onClick={() => { setFilterStatus('ALL'); setSearchQuery(''); }}
                  style={{ 
                    padding: '10px 20px', 
                    background: '#1A1711', 
                    borderRadius: 12, 
                    color: '#FFFFFF', 
                    fontSize: 13, 
                    fontWeight: 700, 
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  {t('favorites.reset_filters')}
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

