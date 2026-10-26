import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';

/**
 * Modal Détails Demande de Devis Client pour Professionnel
 * Affiche l'intégralité du cahier des charges, budget, délais et coordonnées du client
 */
export default function ProQuoteDetailModal({ quote, onClose }) {
  const { t } = useTranslation();

  useEffect(() => {
    document.body.classList.add('pro-modal-open', 'modal-open');
    return () => {
      const remaining = document.querySelectorAll('.pro-modal-backdrop');
      if (remaining.length <= 1) {
        document.body.classList.remove('pro-modal-open', 'modal-open');
      }
    };
  }, []);

  const [copied, setCopied] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  if (!quote) return null;

  const handleCopyPhone = () => {
    if (quote.client_phone) {
      navigator.clipboard.writeText(quote.client_phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const cleanPhone = (quote.client_phone || '').replace(/[^0-9]/g, '');
  const formattedDate = quote.created_at
    ? new Date(quote.created_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : "Récemment reçu";

  return (
    <div className="pro-modal-backdrop">
      <div className="pro-modal-card" style={{ maxWidth: 620 }}>
        
        {/* HEADER */}
        <div className="pro-modal-head" style={{ background: 'linear-gradient(135deg, #0F0D09 0%, #1A160F 100%)', padding: '22px 26px', color: '#FFFFFF', borderBottom: '1.5px solid #D4AF37', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(212,175,55,0.15)', color: '#F6D365', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 12, border: '1px solid rgba(212,175,55,0.3)', marginBottom: 6 }}>
              <span>{t('pro_modals.quote_detail.title')}</span>
            </div>
            <h3 style={{ margin: '0 0 4px', fontFamily: 'Poppins, sans-serif', fontSize: 19, fontWeight: 800, color: '#FFF' }}>
              {quote.project_type || 'Demande de Devis'}
            </h3>
            <div style={{ fontSize: 12, color: '#AAA' }}>
              Reçu le {formattedDate}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.1)', color: '#FFF', border: 'none', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}
          >
            ✕
          </button>
        </div>

        {/* CONTENU AVEC SCROLL */}
        <div style={{ padding: '24px 26px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          {/* IDENTITÉ DU PROSPECT */}
          <div style={{ background: '#FAF9F6', borderRadius: 16, padding: '16px 20px', border: '1px solid #E8E3DA', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #AA820A)', color: '#FFF', fontWeight: 900, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FFF', boxShadow: '0 3px 10px rgba(0,0,0,0.1)' }}>
                {(quote.client_name || 'C')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#0F0D09' }}>
                  {quote.client_name || 'Client Intéressé'}
                </div>
                <div style={{ fontSize: 12.5, color: '#666', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#D4AF37"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  <span>{quote.city || 'Yaoundé'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'rgba(46,204,113,0.15)', color: '#27AE60', padding: '4px 10px', borderRadius: 10, fontSize: 11.5, fontWeight: 800 }}>
                ● {quote.status || 'Nouveau'}
              </span>
            </div>
          </div>

          {/* PARAMÈTRES DU PROJET */}
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: '#888', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '.5px' }}>
              Paramètres &amp; Spécifications
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              <div style={{ background: '#FFFFFF', padding: '12px 16px', borderRadius: 12, border: '1px solid #E8E3DA' }}>
                <div style={{ fontSize: 11, color: '#888', fontWeight: 700 }}>{t('pro_modals.quote_detail.estimated_budget')}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#AA820A', marginTop: 3 }}>
                  {quote.budget_estimate || 'Sur devis'}
                </div>
              </div>

              <div style={{ background: '#FFFFFF', padding: '12px 16px', borderRadius: 12, border: '1px solid #E8E3DA' }}>
                <div style={{ fontSize: 11, color: '#888', fontWeight: 700 }}>{t('pro_modals.quote_detail.desired_timeline')}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0F0D09', marginTop: 3 }}>
                  {quote.desired_date || 'Dès que possible'}
                </div>
              </div>

              <div style={{ background: '#FFFFFF', padding: '12px 16px', borderRadius: 12, border: '1px solid #E8E3DA' }}>
                <div style={{ fontSize: 11, color: '#888', fontWeight: 700 }}>{t('pro_modals.quote_detail.location')}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0F0D09', marginTop: 3 }}>
                  {quote.city || 'Yaoundé'}
                </div>
              </div>
            </div>
          </div>

          {/* DESCRIPTION ET CAHIER DES CHARGES */}
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: '#888', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '.5px' }}>
              Description détaillée des travaux
            </div>
            <div style={{ background: '#FAF9F6', borderRadius: 14, padding: '16px 18px', border: '1px solid #E8E3DA', fontSize: 13.5, color: '#222', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {quote.description || 'Aucun détail textuel supplémentaire fourni.'}
            </div>
          </div>

          {/* PHOTOS D'INSPIRATION & PLANS JOINTS */}
          {quote.photos && quote.photos.length > 0 && (
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: '#888', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '.5px' }}>
                Photos d’inspiration &amp; Plans joints ({quote.photos.length})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                {quote.photos.map((photoUrl, pIdx) => {
                  const url = typeof photoUrl === 'string' ? photoUrl : photoUrl?.url;
                  return (
                    <div
                      key={pIdx}
                      onClick={() => setPreviewImage(url)}
                      style={{
                        position: 'relative',
                        height: 110,
                        borderRadius: 12,
                        overflow: 'hidden',
                        border: '1.5px solid #E8E3DA',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                      }}
                    >
                      <img
                        src={url}
                        alt={`Photo inspiration ${pIdx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* COORDONNÉES DIRECTES */}
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: '#888', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '.5px' }}>
              Coordonnées de contact direct
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#FFFFFF', padding: '14px 18px', borderRadius: 14, border: '1px solid #E8E3DA' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, color: '#555' }}>
                  Numéro de téléphone / WhatsApp : <strong style={{ color: '#0F0D09' }}>{quote.client_phone || 'Non communiqué'}</strong>
                </div>
                {quote.client_phone && (
                  <button
                    onClick={handleCopyPhone}
                    style={{ background: '#FAF9F6', border: '1px solid #E8E3DA', padding: '4px 10px', borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', color: copied ? '#27AE60' : '#555' }}
                  >
                    {copied ? '✓ Copié !' : 'Copier'}
                  </button>
                )}
              </div>
              {quote.client_email && (
                <div style={{ fontSize: 13, color: '#555' }}>
                  Adresse Email : <strong style={{ color: '#0F0D09' }}>{quote.client_email}</strong>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div style={{ padding: '16px 26px', borderTop: '1px solid #E8E3DA', background: '#FAF9F6', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #E8E3DA', background: '#FFF', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >
            Fermer
          </button>

          {quote.client_phone && (
            <a
              href={`tel:${cleanPhone}`}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 12,
                border: '1.5px solid #0F0D09',
                background: '#0F0D09',
                color: '#FFF',
                fontWeight: 800,
                fontSize: 13,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.047 15.047 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1.01A11.36 11.36 0 018.57 3.9c0-.5-.4-.9-.9-.9H4.11c-.5 0-.9.4-.9.9 0 9.39 7.63 17.02 17.02 17.02.5 0 .9-.4.9-.9v-3.56c0-.5-.4-.9-.9-.9-.22-.08-.22-.08-.22-.08z"/></svg>
              <span>{t('pro_modals.quote_detail.call_client')}</span>
            </a>
          )}

          {quote.client_phone && (
            <a
              href={`https://wa.me/${cleanPhone}?text=Bonjour%20${encodeURIComponent(quote.client_name || 'Client')},%20je%20fais%20suite%20à%20votre%20demande%20de%20devis%20sur%20Piolo%20concernant%20le%20projet%20«%20${encodeURIComponent(quote.project_type || 'Travaux')}%20».`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1.5,
                padding: '12px',
                borderRadius: 12,
                border: 'none',
                background: '#25D366',
                color: '#FFF',
                fontWeight: 800,
                fontSize: 13,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 4px 12px rgba(37,211,102,0.3)'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 012.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.79.6.26 1.07.41 1.44.53.61.19 1.16.16 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29z"/></svg>
              <span>{t('pro_modals.quote_detail.reply_whatsapp')}</span>
            </a>
          )}
        </div>

      </div>

      {/* ZOOM LIGHTBOX */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)', zIndex: 50030, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, cursor: 'zoom-out' }}
        >
          <img
            src={previewImage}
            alt="Agrandissement photo inspiration"
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 14, objectFit: 'contain', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}
          />
          <button
            onClick={() => setPreviewImage(null)}
            style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.2)', color: '#FFF', border: 'none', width: 42, height: 42, borderRadius: '50%', fontSize: 20, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
