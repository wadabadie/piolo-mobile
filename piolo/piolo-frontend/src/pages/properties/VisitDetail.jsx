import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { cacheManager } from '../../services/cacheManager';
import PioloLoader from '../../components/PioloLoader';
import { getMediaUrl } from '../../utils/media';

export default function VisitDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const cachedVisit = cacheManager.get(`visit_detail_${id}`);
  const [visit, setVisit] = useState(() => cachedVisit || null);
  const [loading, setLoading] = useState(() => !cachedVisit);
  const [error, setError] = useState(null);

  // Formulaire d'action bailleur
  const [confirmedDate, setConfirmedDate] = useState(() => cachedVisit?.requested_date_raw || cachedVisit?.requested_date || '');
  const [confirmedTime, setConfirmedTime] = useState(() => cachedVisit?.requested_time || '');
  const [note, setNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState(null);

  useEffect(() => {
    const fetchVisit = async () => {
      const existing = cacheManager.get(`visit_detail_${id}`);
      if (!existing) setLoading(true);
      try {
        const res = await api.get(`/properties/visits/${id}/`);
        setVisit(res.data);
        cacheManager.set(`visit_detail_${id}`, res.data, 180000);
        if (res.data.requested_date_raw || res.data.requested_date) {
          setConfirmedDate(res.data.requested_date_raw || res.data.requested_date);
        }
        if (res.data.requested_time) {
          setConfirmedTime(res.data.requested_time);
        }
      } catch (err) {
        console.error('Erreur lors du chargement de la visite:', err);
        if (!existing) setError(err.response?.data?.error || 'Impossible de charger la demande de visite.');
      } finally {
        setLoading(false);
      }
    };
    fetchVisit();
  }, [id]);

  const handleAction = async (actionType) => {
    try {
      setActionLoading(true);
      setActionResult(null);
      const payload = { action: actionType, note };
      if (actionType === 'confirm') {
        payload.confirmed_date = confirmedDate;
        payload.confirmed_time = confirmedTime;
      }
      const res = await api.post(`/properties/visits/${id}/`, payload);
      if (res.data.ok) {
        setActionResult({ ok: true, message: res.data.message });
        setTimeout(() => {
          navigate(visit?.is_bailleur ? '/dashboard/bailleur/visites' : '/dashboard/locataire/visites');
        }, 1200);
      } else {
        setActionResult({ ok: false, error: res.data.error || 'Erreur lors de la modification.' });
      }
    } catch (err) {
      setActionResult({ ok: false, error: err.response?.data?.error || 'Une erreur est survenue.' });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDateFr = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8F9FA', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <PioloLoader text="Chargement de la demande de visite..." />
      </div>
    );
  }

  if (error || !visit) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8F9FA', padding: '40px 16px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', background: '#FFFFFF', borderRadius: 24, padding: '40px 24px', border: '1px solid #EAE5D9', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 18, color: '#DC2626', marginBottom: 12 }}>{error || 'Demande introuvable'}</h2>
          <Link to="/visites" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg, var(--or), var(--or-l))', color: '#0F0D09', fontWeight: 800, textDecoration: 'none' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
            Retour aux visites
          </Link>
        </div>
      </div>
    );
  }

  const isConfirmed = visit.status === 'CONFIRMED';
  const isPending = visit.status === 'PENDING';
  const isRefused = visit.status === 'REFUSED';
  const isCancelled = visit.status === 'CANCELLED';
  const propImg = getMediaUrl(visit.property?.main_image || visit.property?.cover_image || '/img/property-placeholder.jpg');

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', color: '#0F0D09', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 16px 80px' }}>
        
        {/* RETOUR ARRIÈRE */}
        <div style={{ marginBottom: 16 }}>
          <Link 
            to={visit.is_bailleur ? '/dashboard/bailleur/visites' : '/dashboard/locataire/visites'} 
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#6C665C', textDecoration: 'none', background: '#FFFFFF', padding: '8px 16px', borderRadius: 20, border: '1px solid #EAE5D9', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
            Retour aux visites
          </Link>
        </div>

        {/* HERO BANNER AVEC FOND DE VILLA CAMEROUNAISE */}
        <div 
          style={{ 
            marginBottom: 20,
            padding: '28px 24px',
            borderRadius: 24,
            background: "linear-gradient(135deg, rgba(15, 13, 9, 0.88) 0%, rgba(26, 23, 17, 0.78) 100%), url('/img/cameroun-luxury-banner.jpg') center/cover no-repeat",
            color: '#FFFFFF',
            border: '1px solid rgba(212,175,55,0.35)',
            boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--or-l)', marginBottom: 8, background: 'rgba(15,13,9,0.65)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(212,175,55,0.3)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--or)"><path d="M19 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>
                <span>{t('visits_detail.title')}</span>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px', color: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}>
                Demande de visite <span style={{ color: 'var(--or-l)' }}>#{visit.id}</span>
              </h1>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.82)' }}>
                Créée le {formatDateFr(visit.created_at)}
              </p>
            </div>

            {/* Badge de statut luxe */}
            <div>
              {isConfirmed && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'rgba(16,185,129,0.95)', color: '#FFFFFF', fontSize: 12, fontWeight: 800, fontFamily: 'Poppins, sans-serif', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Confirmée
                </span>
              )}
              {isPending && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'linear-gradient(135deg, var(--or), var(--or-l))', color: '#0F0D09', fontSize: 12, fontWeight: 800, fontFamily: 'Poppins, sans-serif', boxShadow: '0 4px 12px rgba(212,175,55,0.3)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  En attente
                </span>
              )}
              {isRefused && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'rgba(220,38,38,0.95)', color: '#FFFFFF', fontSize: 12, fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Refusée
                </span>
              )}
              {isCancelled && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'rgba(107,114,128,0.95)', color: '#FFFFFF', fontSize: 12, fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>
                  Annulée
                </span>
              )}
            </div>
          </div>
        </div>

        {/* CARTE PRINCIPALE */}
        <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #EAE5D9', padding: '24px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* BIEN IMMOBILIER CONCERNÉ */}
          <div style={{ display: 'flex', gap: 16, padding: 16, background: '#F8F6F1', borderRadius: 18, border: '1px solid #EAE5D9', alignItems: 'center', flexWrap: 'wrap' }}>
            <img 
              src={propImg} 
              alt={visit.property?.title || 'Logement'} 
              style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 14, flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              onError={e => { e.currentTarget.src = '/static/img/logo-piolo-clean.png'; }}
            />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 800, color: '#0F0D09', marginBottom: 3 }}>
                {visit.property?.title}
              </div>
              <div style={{ fontSize: 13, color: '#6C665C', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--or)"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                <span>{visit.property?.city}{visit.property?.neighborhood ? `, ${visit.property.neighborhood}` : ''}</span>
              </div>
              {visit.property?.price && (
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 800, color: 'var(--or-d)' }}>
                  {Number(visit.property.price).toLocaleString('fr-FR')} FCFA / mois
                </div>
              )}
            </div>
            {visit.property?.slug && (
              <Link 
                to={`/properties/${visit.property.slug}`} 
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 12, background: '#FFFFFF', border: '1px solid #EAE5D9', fontFamily: 'Poppins, sans-serif', fontSize: 12.5, fontWeight: 700, color: '#0F0D09', textDecoration: 'none', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Voir l'annonce
              </Link>
            )}
          </div>

          {/* CRÉNEAU CONFIRMÉ OU SOUHAITÉ */}
          {isConfirmed ? (
            <div style={{ padding: 18, background: 'rgba(16,185,129,0.06)', borderRadius: 18, border: '1.5px solid rgba(16,185,129,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#065F46', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                <span>{t('visits_detail.visit_confirmed')}</span>
              </div>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 800, color: '#065F46', textTransform: 'capitalize' }}>
                {formatDateFr(visit.confirmed_date || visit.requested_date)}
                {(visit.confirmed_time || visit.requested_time) ? ` à ${visit.confirmed_time || visit.requested_time}` : ''}
              </div>
              {visit.bailleur_note && (
                <div style={{ marginTop: 10, padding: '10px 14px', background: '#FFFFFF', borderRadius: 12, border: '1px solid rgba(16,185,129,0.2)', fontSize: 13, color: '#065F46' }}>
                  <b>{t('visits_detail.landlord_instructions')}</b> {visit.bailleur_note}
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: 18, background: '#F8F6F1', borderRadius: 18, border: '1px solid #EAE5D9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#854D0E', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>{t('visits_detail.desired_datetime')}</span>
              </div>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 15.5, fontWeight: 800, color: '#0F0D09', textTransform: 'capitalize' }}>
                {formatDateFr(visit.requested_date)}
                {visit.requested_time ? ` à ${visit.requested_time}` : ''}
              </div>
            </div>
          )}

          {/* MOTIF DE REFUS */}
          {isRefused && visit.bailleur_note && (
            <div style={{ padding: 16, background: 'rgba(220,38,38,0.06)', borderRadius: 16, border: '1px solid rgba(220,38,38,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#DC2626', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                <span>{t('visits_detail.refusal_reason')}</span>
              </div>
              <p style={{ fontSize: 13.5, color: '#DC2626', margin: 0, fontWeight: 600 }}>{visit.bailleur_note}</p>
            </div>
          )}

          {/* COORDONNÉES DE L'AUTRE PARTIE (LOCATAIRE OU BAILLEUR) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#7A7265', marginBottom: 10 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              <span>{visit.is_bailleur ? 'Identité du Locataire' : 'Coordonnées du Bailleur'}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: '#FAFAF8', borderRadius: 16, border: '1px solid #EAE5D9' }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, #1A1711, #0F0D09)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 800, color: 'var(--or-l)', flexShrink: 0, border: '1px solid rgba(212,175,55,0.3)' }}>
                {visit.tenant?.first_name?.[0]?.toUpperCase() || 'P'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14.5, fontWeight: 800, color: '#0F0D09' }}>
                  {visit.tenant?.full_name || `${visit.tenant?.first_name || ''} ${visit.tenant?.last_name || ''}`}
                </div>
                {visit.tenant?.email && (
                  <div style={{ fontSize: 12.5, color: '#6C665C', display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <span>{visit.tenant.email}</span>
                  </div>
                )}
                {visit.tenant?.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 12.5, color: '#6C665C', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      <span>{visit.tenant.phone}</span>
                    </div>
                    <a
                      href={`https://wa.me/${visit.tenant.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${visit.tenant.first_name || ''}, je vous contacte concernant votre demande de visite pour le bien « ${visit.property?.title || 'Piolo'} ».`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        background: '#25D366',
                        color: '#FFFFFF',
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontSize: 11.5,
                        fontWeight: 800,
                        textDecoration: 'none',
                        boxShadow: '0 2px 6px rgba(37,211,102,0.3)'
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg>
                      <span>{t('visits_detail.chat_whatsapp')}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MESSAGE DU LOCATAIRE */}
          {visit.message && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#7A7265', marginBottom: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span>{t('visits_detail.tenant_message')}</span>
              </div>
              <div style={{ padding: 14, background: '#FAFAF8', borderRadius: 14, border: '1px solid #EAE5D9', fontSize: 13.5, color: '#2B261F', lineHeight: 1.6, fontStyle: 'italic' }}>
                « {visit.message} »
              </div>
            </div>
          )}

          {/* ACTIONS BAILLEUR (VALIDER / REFUSER) */}
          {visit.is_bailleur && isPending && (
            <div style={{ borderTop: '1px solid #EAE5D9', paddingTop: 20, marginTop: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#0F0D09', marginBottom: 14 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                <span>{t('visits_detail.landlord_decision')}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#6C665C', display: 'block', marginBottom: 6 }}>{t('visits_detail.confirmed_date')}</label>
                  <input 
                    type="date" 
                    value={confirmedDate} 
                    onChange={e => setConfirmedDate(e.target.value)}
                    style={{ width: '100%', border: '1px solid #EAE5D9', borderRadius: 12, padding: '10px 12px', fontSize: 13.5, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#6C665C', display: 'block', marginBottom: 6 }}>{t('visits_detail.confirmed_time')}</label>
                  <input 
                    type="time" 
                    value={confirmedTime} 
                    onChange={e => setConfirmedTime(e.target.value)}
                    style={{ width: '100%', border: '1px solid #EAE5D9', borderRadius: 12, padding: '10px 12px', fontSize: 13.5, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#6C665C', display: 'block', marginBottom: 6 }}>Consignes pour le locataire (adresse exacte, étage...)</label>
                <textarea 
                  rows="3" 
                  value={note} 
                  onChange={e => setNote(e.target.value)} 
                  placeholder="Ex: Rendez-vous devant le portail noir, contactez-moi 10min avant..."
                  style={{ width: '100%', border: '1px solid #EAE5D9', borderRadius: 12, padding: '10px 12px', fontSize: 13.5, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  onClick={() => handleAction('confirm')} 
                  disabled={actionLoading}
                  style={{
                    flex: '1 1 180px',
                    padding: '12px 18px',
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, var(--or), var(--or-l))',
                    border: 'none',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 13.5,
                    fontWeight: 800,
                    color: '#0F0D09',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(212,175,55,0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>{actionLoading ? 'Traitement...' : 'Confirmer la visite'}</span>
                </button>

                <button 
                  type="button" 
                  onClick={() => handleAction('refuse')} 
                  disabled={actionLoading}
                  style={{
                    padding: '12px 20px',
                    borderRadius: 14,
                    background: 'rgba(220,38,38,0.08)',
                    border: '1px solid rgba(220,38,38,0.2)',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: '#DC2626',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  <span>{t('visits_detail.refuse_visit')}</span>
                </button>
              </div>
            </div>
          )}

          {/* ACTION ANNULER (LOCATAIRE) */}
          {!visit.is_bailleur && ['PENDING', 'CONFIRMED'].includes(visit.status) && (
            <div style={{ borderTop: '1px solid #EAE5D9', paddingTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={() => handleAction('cancel')} 
                disabled={actionLoading}
                style={{
                  padding: '9px 18px',
                  borderRadius: 12,
                  background: '#FFFFFF',
                  border: '1px solid #EAE5D9',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: '#DC2626',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                <span>{actionLoading ? 'Annulation...' : 'Annuler ma demande'}</span>
              </button>
            </div>
          )}

          {actionResult && (
            <div style={{ padding: 14, borderRadius: 14, fontSize: 13.5, fontWeight: 700, background: actionResult.ok ? 'rgba(16,185,129,0.1)' : 'rgba(220,38,38,0.1)', color: actionResult.ok ? '#065F46' : '#DC2626', textAlign: 'center', border: actionResult.ok ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(220,38,38,0.2)' }}>
              {actionResult.message || actionResult.error}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

