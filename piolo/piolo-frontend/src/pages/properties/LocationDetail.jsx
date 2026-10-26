import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PioloLoader from '../../components/PioloLoader';
import { getMediaUrl } from '../../utils/media';

export default function LocationDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loc, setLoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Visionneuse de document in-app
  const [previewDoc, setPreviewDoc] = useState(null);

  // Formulaire d'action bailleur
  const [note, setNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/properties/locations/${id}/`);
        setLoc(res.data);
      } catch (err) {
        console.error('Erreur lors du chargement du dossier:', err);
        setError(err.response?.data?.error || 'Impossible de charger le dossier de location.');
      } finally {
        setLoading(false);
      }
    };
    fetchLocation();
  }, [id]);

  // Verrouiller le scroll quand le modal de prévisualisation est ouvert
  useEffect(() => {
    if (previewDoc) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [previewDoc]);

  const handleAction = async (actionType) => {
    try {
      setActionLoading(true);
      setActionResult(null);
      const res = await api.post(`/properties/locations/${id}/`, { action: actionType, note });
      if (res.data.ok) {
        setActionResult({ ok: true, message: res.data.message });
        setTimeout(() => {
          navigate(loc?.is_bailleur ? '/dashboard/bailleur/locations' : '/dashboard/locataire/locations');
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
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const isPdf = (url) => {
    if (!url) return false;
    return url.toLowerCase().includes('.pdf');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8F9FA', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <PioloLoader text="Chargement du dossier de location..." />
      </div>
    );
  }

  if (error || !loc) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8F9FA', padding: '40px 16px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', background: '#FFFFFF', borderRadius: 24, padding: '40px 24px', border: '1px solid #EAE5D9', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 18, color: '#DC2626', marginBottom: 12 }}>{error || 'Dossier introuvable'}</h2>
          <Link to="/locations" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg, var(--or), var(--or-l))', color: '#0F0D09', fontWeight: 800, textDecoration: 'none' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
            Retour aux dossiers
          </Link>
        </div>
      </div>
    );
  }

  const isAccepted = loc.status === 'ACCEPTED';
  const isReviewing = loc.status === 'REVIEWING';
  const isPending = loc.status === 'PENDING';
  const isRefused = loc.status === 'REFUSED';
  const isCancelled = loc.status === 'CANCELLED';
  const propImg = getMediaUrl(loc.property?.main_image || loc.property?.cover_image || '/img/property-placeholder.jpg');

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', color: '#0F0D09', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 840, margin: '0 auto', padding: '20px 16px 80px' }}>
        
        {/* RETOUR RAPIDE */}
        <div style={{ marginBottom: 16 }}>
          <Link 
            to={loc.is_bailleur ? '/dashboard/bailleur/locations' : '/dashboard/locataire/locations'} 
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#6C665C', textDecoration: 'none', background: '#FFFFFF', padding: '8px 16px', borderRadius: 20, border: '1px solid #EAE5D9', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
            Retour aux dossiers
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
                <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--or)"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                <span>{t('locations_detail.title')}</span>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px', color: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}>
                Candidature <span style={{ color: 'var(--or-l)' }}>#{loc.id}</span>
              </h1>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.82)' }}>
                Déposé le {formatDateFr(loc.created_at)}
              </p>
            </div>

            {/* Badges de statut luxe */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {isAccepted && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'rgba(16,185,129,0.95)', color: '#FFFFFF', fontSize: 12, fontWeight: 800, fontFamily: 'Poppins, sans-serif', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Dossier accepté
                </span>
              )}
              {isReviewing && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'rgba(30,58,110,0.95)', color: '#FFFFFF', fontSize: 12, fontWeight: 800, fontFamily: 'Poppins, sans-serif', boxShadow: '0 4px 12px rgba(30,58,110,0.25)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  En cours d'examen
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
                  Refusé
                </span>
              )}
              {isCancelled && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'rgba(107,114,128,0.95)', color: '#FFFFFF', fontSize: 12, fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>
                  Annulé
                </span>
              )}

              {/* Jauge complétude */}
              {loc.dossier_completion !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(15,13,9,0.7)', backdropFilter: 'blur(8px)', padding: '5px 12px', borderRadius: 20, border: '1px solid rgba(212,175,55,0.3)' }}>
                  <div style={{ width: 60, height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${loc.dossier_completion}%`, height: '100%', background: 'linear-gradient(90deg, #D4AF37, #F6D365)', borderRadius: 6 }}></div>
                  </div>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, fontWeight: 800, color: 'var(--or-l)' }}>{loc.dossier_completion}%</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CARTE PRINCIPALE */}
        <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #EAE5D9', padding: '24px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 22 }}>
          
          {/* BIEN IMMOBILIER CONCERNÉ */}
          <div style={{ display: 'flex', gap: 16, padding: 16, background: '#F8F6F1', borderRadius: 18, border: '1px solid #EAE5D9', alignItems: 'center', flexWrap: 'wrap' }}>
            <img 
              src={propImg} 
              alt={loc.property?.title || 'Logement'} 
              style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 14, flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              onError={e => { e.currentTarget.src = '/static/img/logo-piolo-clean.png'; }}
            />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 800, color: '#0F0D09', marginBottom: 3 }}>
                {loc.property?.title}
              </div>
              <div style={{ fontSize: 13, color: '#6C665C', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--or)"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                <span>{loc.property?.city}{loc.property?.neighborhood ? `, ${loc.property.neighborhood}` : ''}</span>
              </div>
              {loc.property?.price && (
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 800, color: 'var(--or-d)' }}>
                  {Number(loc.property.price).toLocaleString('fr-FR')} FCFA / mois
                </div>
              )}
            </div>
            {loc.property?.slug && (
              <Link 
                to={`/properties/${loc.property.slug}`} 
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 12, background: '#FFFFFF', border: '1px solid #EAE5D9', fontFamily: 'Poppins, sans-serif', fontSize: 12.5, fontWeight: 700, color: '#0F0D09', textDecoration: 'none', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Voir l'annonce
              </Link>
            )}
          </div>

          {/* CANDIDAT / DEMANDEUR */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#7A7265', marginBottom: 10 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              <span>{loc.is_bailleur ? 'Identité du Candidat' : 'Vos Coordonnées'}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: '#FAFAF8', borderRadius: 16, border: '1px solid #EAE5D9' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #1A1711, #0F0D09)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 800, color: 'var(--or-l)', flexShrink: 0, border: '1px solid rgba(212,175,55,0.3)' }}>
                {loc.tenant?.first_name?.[0]?.toUpperCase() || 'P'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 15, fontWeight: 800, color: '#0F0D09' }}>
                  {loc.tenant?.full_name || `${loc.tenant?.first_name || ''} ${loc.tenant?.last_name || ''}`}
                </div>
                {loc.tenant?.email && (
                  <div style={{ fontSize: 12.5, color: '#6C665C', display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <span>{loc.tenant.email}</span>
                  </div>
                )}
                {loc.tenant?.phone && (
                  <div style={{ fontSize: 12.5, color: '#6C665C', display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span>{loc.tenant.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DÉTAILS DE LA LOCATION */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#7A7265', marginBottom: 10 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>{t('locations_detail.desired_conditions')}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <div style={{ padding: '14px', background: '#F8F6F1', borderRadius: 14, border: '1px solid #EAE5D9' }}>
                <div style={{ fontSize: 11, color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{t('locations_detail.desired_move_in')}</div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 800, color: '#0F0D09' }}>{formatDateFr(loc.move_in_date)}</div>
              </div>
              <div style={{ padding: '14px', background: '#F8F6F1', borderRadius: 14, border: '1px solid #EAE5D9' }}>
                <div style={{ fontSize: 11, color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{t('locations_detail.lease_duration')}</div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 800, color: '#0F0D09' }}>{loc.lease_duration} mois</div>
              </div>
              <div style={{ padding: '14px', background: '#F8F6F1', borderRadius: 14, border: '1px solid #EAE5D9' }}>
                <div style={{ fontSize: 11, color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{t('locations_detail.occupants')}</div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 800, color: '#0F0D09' }}>{loc.tenant_count} personne(s)</div>
              </div>
              {loc.profession && (
                <div style={{ padding: '14px', background: '#F8F6F1', borderRadius: 14, border: '1px solid #EAE5D9' }}>
                  <div style={{ fontSize: 11, color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{t('locations_detail.profession')}</div>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 800, color: '#0F0D09' }}>{loc.profession}</div>
                </div>
              )}
              {loc.employer && (
                <div style={{ padding: '14px', background: '#F8F6F1', borderRadius: 14, border: '1px solid #EAE5D9' }}>
                  <div style={{ fontSize: 11, color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{t('locations_detail.employer')}</div>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 800, color: '#0F0D09' }}>{loc.employer}</div>
                </div>
              )}
              {loc.monthly_income ? (
                <div style={{ padding: '14px', background: '#F8F6F1', borderRadius: 14, border: '1px solid #EAE5D9' }}>
                  <div style={{ fontSize: 11, color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{t('locations_detail.monthly_income')}</div>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 800, color: '#065F46' }}>{Number(loc.monthly_income).toLocaleString('fr-FR')} FCFA</div>
                </div>
              ) : null}
            </div>
          </div>

          {/* LETTRE DE MOTIVATION */}
          {loc.message && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#7A7265', marginBottom: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span>{t('locations_detail.applicant_presentation')}</span>
              </div>
              <div style={{ padding: 14, background: '#FAFAF8', borderRadius: 14, border: '1px solid #EAE5D9', fontSize: 13.5, color: '#2B261F', lineHeight: 1.6, fontStyle: 'italic' }}>
                « {loc.message} »
              </div>
            </div>
          )}

          {/* PIÈCES JUSTIFICATIVES AVEC APERÇU DIRECT DANS LE SITE */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#7A7265', marginBottom: 10 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              <span>{t('locations_detail.supporting_docs')}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {[
                { label: t('locations_detail.cni_front'), url: loc.cni_front },
                { label: t('locations_detail.cni_back'), url: loc.cni_back },
                { label: t('locations_detail.income_proof'), url: loc.income_proof }
              ].map((doc, idx) => (
                doc.url ? (
                  <button 
                    key={idx} 
                    type="button"
                    onClick={() => setPreviewDoc({ label: doc.label, url: doc.url })}
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: 8, 
                      padding: '16px 14px', 
                      background: '#FAFAF8', 
                      borderRadius: 16, 
                      border: '1.5px solid #EAE5D9', 
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease',
                      textAlign: 'center',
                      width: '100%'
                    }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--or)"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 800, color: '#0F0D09' }}>{doc.label}</span>
                    <span style={{ fontSize: 11, color: '#065F46', fontWeight: 800, background: 'rgba(16,185,129,0.1)', padding: '4px 12px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      Afficher directement
                    </span>
                  </button>
                ) : (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 14px', background: '#F8F6F1', borderRadius: 16, border: '1px dashed #D4AF37', opacity: 0.75 }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#8C8477"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 700, color: '#6C665C', textAlign: 'center' }}>{doc.label}</span>
                    <span style={{ fontSize: 11, color: '#DC2626', fontWeight: 700, background: 'rgba(220,38,38,0.08)', padding: '3px 10px', borderRadius: 20 }}>{t('locations_detail.not_provided')}</span>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* GARANT */}
          {loc.has_guarantor && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#7A7265', marginBottom: 10 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                <span>{t('locations_detail.guarantor_info')}</span>
              </div>
              <div style={{ padding: 18, background: '#FAFAF8', borderRadius: 16, border: '1px solid #EAE5D9' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#888', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>{t('locations_detail.guarantor_name')}</div>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 800, color: '#0F0D09' }}>{loc.guarantor_name || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#888', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>{t('locations_detail.phone')}</div>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 800, color: '#0F0D09' }}>{loc.guarantor_phone || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#888', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>{t('locations_detail.relationship')}</div>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 800, color: '#0F0D09' }}>{loc.guarantor_relation || '—'}</div>
                  </div>
                  {loc.guarantor_income && (
                    <div>
                      <div style={{ fontSize: 11, color: '#888', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>{t('locations_detail.income_per_month')}</div>
                      <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 800, color: '#065F46' }}>{Number(loc.guarantor_income).toLocaleString('fr-FR')} FCFA</div>
                    </div>
                  )}
                </div>
                {loc.guarantor_cni && (
                  <button 
                    type="button" 
                    onClick={() => setPreviewDoc({ label: t('locations_detail.guarantor_cni'), url: loc.guarantor_cni })}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, padding: '8px 16px', background: '#FFFFFF', borderRadius: 10, border: '1px solid #EAE5D9', fontFamily: 'Poppins, sans-serif', fontSize: 12.5, fontWeight: 800, color: '#0F0D09', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--or)"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                    Afficher la {t('locations_detail.guarantor_cni')}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* MOTIF DE REFUS */}
          {isRefused && loc.bailleur_note && (
            <div style={{ padding: 16, background: 'rgba(220,38,38,0.06)', borderRadius: 16, border: '1px solid rgba(220,38,38,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#DC2626', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                <span>{t('locations_detail.decision_reason')}</span>
              </div>
              <p style={{ fontSize: 13.5, color: '#DC2626', margin: 0, fontWeight: 600 }}>{loc.bailleur_note}</p>
            </div>
          )}

          {/* ACTIONS BAILLEUR (ACCEPTER / EXAMEN / REFUSER) */}
          {loc.is_bailleur && ['PENDING', 'REVIEWING'].includes(loc.status) && (
            <div style={{ borderTop: '1px solid #EAE5D9', paddingTop: 20, marginTop: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#0F0D09', marginBottom: 14 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                <span>{t('locations_detail.landlord_decision')}</span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#6C665C', display: 'block', marginBottom: 6 }}>Remarques ou motifs de décision (visible par le locataire)</label>
                <textarea 
                  rows="3" 
                  value={note} 
                  onChange={e => setNote(e.target.value)} 
                  placeholder="Ex: Dossier retenu, veuillez apporter les originaux lors de la signature du contrat..."
                  style={{ width: '100%', border: '1px solid #EAE5D9', borderRadius: 12, padding: '10px 12px', fontSize: 13.5, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {loc.status === 'PENDING' && (
                  <button 
                    type="button" 
                    onClick={() => handleAction('review')} 
                    disabled={actionLoading}
                    style={{
                      padding: '12px 18px',
                      borderRadius: 14,
                      background: 'rgba(30,58,110,0.08)',
                      border: '1px solid rgba(30,58,110,0.25)',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: 13,
                      fontWeight: 800,
                      color: '#1E3A6E',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <span>{t('locations_detail.put_under_review')}</span>
                  </button>
                )}

                <button 
                  type="button" 
                  onClick={() => handleAction('accept')} 
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
                  <span>{actionLoading ? 'Traitement...' : 'Accepter le dossier'}</span>
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
                  <span>{t('locations_detail.refuse')}</span>
                </button>
              </div>
            </div>
          )}

          {/* ACTION ANNULER (LOCATAIRE) */}
          {!loc.is_bailleur && ['PENDING', 'REVIEWING'].includes(loc.status) && (
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
                <span>{actionLoading ? 'Annulation...' : 'Annuler mon dossier de location'}</span>
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

      {/* VISIONNEUSE MODALE IN-APP DU DOCUMENT (CNI, REVENUS, ETC.) */}
      {previewDoc && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(15, 13, 9, 0.88)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.25s ease'
          }}
          onClick={() => setPreviewDoc(null)}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: 780,
              maxHeight: '90vh',
              background: '#1A1711',
              borderRadius: 24,
              border: '1.5px solid rgba(212,175,55,0.4)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header du document */}
            <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', background: '#0F0D09' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--or)"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 800, color: '#FFFFFF' }}>{previewDoc.label}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <a 
                  href={getMediaUrl(previewDoc.url)} 
                  download 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 12,
                    background: 'rgba(212,175,55,0.15)',
                    border: '1px solid rgba(212,175,55,0.35)',
                    color: 'var(--or-l)',
                    fontSize: 12,
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  <span>{t('locations_detail.download')}</span>
                </a>

                <button 
                  type="button" 
                  onClick={() => setPreviewDoc(null)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: '#FFFFFF',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 'bold',
                    transition: 'background 0.2s'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Corps du document */}
            <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', flex: 1, background: '#12100B', minHeight: 280 }}>
              {isPdf(previewDoc.url) ? (
                <iframe 
                  src={getMediaUrl(previewDoc.url)} 
                  title={previewDoc.label} 
                  style={{ width: '100%', height: '65vh', border: 'none', borderRadius: 14, background: '#FFFFFF' }} 
                />
              ) : (
                <img 
                  src={getMediaUrl(previewDoc.url)} 
                  alt={previewDoc.label} 
                  style={{ maxWidth: '100%', maxHeight: '68vh', objectFit: 'contain', borderRadius: 14, boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }} 
                  onError={e => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
