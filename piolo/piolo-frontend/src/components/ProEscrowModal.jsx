import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';

/**
 * Modal Paiement Sécurisé de l'Acompte (Piolo Escrow)
 * Sécurise les fonds via Orange Money / MTN MoMo jusqu'à la livraison du chantier
 */
export default function ProEscrowModal({ projectData, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [operator, setOperator] = useState('OM'); // 'OM' | 'MOMO'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'processing' | 'success'
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.classList.add('pro-modal-open', 'modal-open');
    return () => {
      const remaining = document.querySelectorAll('.pro-modal-backdrop');
      if (remaining.length <= 1) {
        document.body.classList.remove('pro-modal-open', 'modal-open');
      }
    };
  }, []);

  const rawAcompte = projectData?.acompte ?? projectData?.budget ?? 50000;
  const acompte = typeof rawAcompte === 'number'
    ? rawAcompte
    : (parseInt(String(rawAcompte).replace(/[^0-9]/g, ''), 10) || 50000);
  const pioloFee = Math.round(acompte * 0.05); // 5% de commission de protection Piolo
  const totalAmount = acompte + pioloFee;

  const handlePay = (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 8) {
      setError('Veuillez entrer un numéro de téléphone valide (ex: 699001122 ou 677889900).');
      return;
    }
    setError('');
    setStep('processing');

    // Simulation de validation paiement MoMo / OM
    setTimeout(() => {
      setStep('success');
      if (onSuccess) onSuccess();
    }, 2000);
  };

  return (
    <div className="pro-modal-backdrop">
      <div className="pro-modal-card" style={{ maxWidth: 480 }}>
        
        {/* Header Haut de Gamme */}
        <div className="pro-modal-head" style={{ background: 'linear-gradient(135deg, #12100C 0%, #1E1912 100%)', padding: '18px 24px', color: '#FFFFFF', borderBottom: '1.5px solid rgba(212,175,55,0.4)', flexShrink: 0 }}>
          {/* Mobile Drag Indicator */}
          <div className="pro-modal-drag-pill" />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(46,204,113,0.15)', color: '#2ECC71', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(46,204,113,0.3)', marginBottom: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                </svg>
                <span>Garantie Piolo Protec (0% Risque)</span>
              </div>
              <h3 style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 800, color: '#FFF', lineHeight: 1.3 }}>
                Acompte de Commande Sécurisé
              </h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Fermer"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#FFF', border: '1px solid rgba(255,255,255,0.2)', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0, transition: 'all 0.2s ease' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="pro-modal-body" style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {step === 'form' && (
            <form onSubmit={handlePay}>
              <div style={{ fontSize: 13, color: '#555', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div>Projet : <strong style={{ color: '#0F0D09' }}>{projectData?.service || projectData?.title || 'Prestation Habitat sur-mesure'}</strong></div>
                {(projectData?.pro || projectData?.author?.name) && (
                  <div>Artisan : <strong style={{ color: '#0F0D09' }}>{projectData?.pro || projectData?.author?.name}</strong></div>
                )}
              </div>

              {/* Récapitulatif montant */}
              <div style={{ background: '#FAF9F6', padding: '14px 16px', borderRadius: 14, border: '1px solid #E8E3DA', marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666', marginBottom: 6 }}>
                  <span>{t('pro_modals.escrow.down_payment')}</span>
                  <span style={{ fontWeight: 700, color: '#0F0D09' }}>{acompte.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 8 }}>
                  <span>{t('pro_modals.escrow.escrow_fees')}</span>
                  <span>+{pioloFee.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div style={{ height: 1, background: '#E8E3DA', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, color: '#0F0D09' }}>
                  <span>{t('pro_modals.escrow.total_to_pay')}</span>
                  <span style={{ color: '#D4AF37' }}>{totalAmount.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              {/* Choix de l'opérateur */}
              <div style={{ marginBottom: 16 }}>
                <label className="pro-field-label">
                  Choisissez votre moyen de paiement Mobile
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setOperator('OM')}
                    style={{
                      padding: '12px',
                      borderRadius: 14,
                      border: operator === 'OM' ? '2px solid #FF7900' : '1.5px solid #E5E0D5',
                      background: operator === 'OM' ? '#FFF6ED' : '#FAF9F6',
                      fontWeight: 800,
                      fontSize: 13,
                      color: '#0F0D09',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s ease',
                      boxShadow: operator === 'OM' ? '0 2px 10px rgba(255,121,0,0.15)' : 'none'
                    }}
                  >
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF7900' }} />
                    <span>{t('pro_modals.escrow.orange_money')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOperator('MOMO')}
                    style={{
                      padding: '12px',
                      borderRadius: 14,
                      border: operator === 'MOMO' ? '2px solid #E6B800' : '1.5px solid #E5E0D5',
                      background: operator === 'MOMO' ? '#FFFBE6' : '#FAF9F6',
                      fontWeight: 800,
                      fontSize: 13,
                      color: '#0F0D09',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s ease',
                      boxShadow: operator === 'MOMO' ? '0 2px 10px rgba(230,184,0,0.15)' : 'none'
                    }}
                  >
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFCC00' }} />
                    <span>{t('pro_modals.escrow.mtn_momo')}</span>
                  </button>
                </div>
              </div>

              {/* Champ téléphone */}
              <div style={{ marginBottom: 16 }}>
                <label className="pro-field-label">
                  Numéro de compte {operator === 'OM' ? t('pro_modals.escrow.orange_money') : t('pro_modals.escrow.mtn_momo')}
                </label>
                <input
                  type="tel"
                  placeholder={t("pro_modals.escrow.phone_placeholder")}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pro-field-input"
                  required
                />
              </div>

              {error && (
                <div style={{ background: 'rgba(231,76,60,0.1)', color: '#C0392B', padding: '10px 14px', borderRadius: 10, fontSize: 12.5, fontWeight: 600, marginBottom: 14, border: '1px solid rgba(231,76,60,0.2)' }}>
                  {error}
                </div>
              )}

              {/* Engagement Sécurité Piolo */}
              <div style={{ fontSize: 12, color: '#666', background: '#F8F6F0', padding: '12px 14px', borderRadius: 12, marginBottom: 16, lineHeight: 1.5, border: '1px solid #EFEAE0' }}>
                🛡️ <strong>{t('pro_modals.escrow.how_it_works')}</strong> Vos fonds restent bloqués sur le compte séquestre Piolo. L'artisan commence les travaux et n'est payé que lorsque vous confirmez la bonne réception conforme.
              </div>

              {/* Action Sticky Footer */}
              <div className="pro-modal-sticky-footer">
                <button
                  type="button"
                  onClick={onClose}
                  className="pro-btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="pro-btn-gold"
                >
                  Payer l'acompte sécurisé
                </button>
              </div>
            </form>
          )}

          {step === 'processing' && (
            <div style={{ textAlign: 'center', padding: '36px 12px' }}>
              <div style={{ width: 48, height: 48, border: '3.5px solid #E8E3DA', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 18px' }} />
              <h4 style={{ margin: '0 0 8px', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 17, color: '#0F0D09' }}>
                Validation du Paiement en cours...
              </h4>
              <p style={{ fontSize: 13.5, color: '#666', margin: 0, lineHeight: 1.5 }}>
                Veuillez valider l'invite de paiement sur votre téléphone mobile ({phoneNumber}).
              </p>
            </div>
          )}

          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '24px 10px' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(46,204,113,0.15)', color: '#2ECC71', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 30 }}>
                ✓
              </div>
              <h3 style={{ margin: '0 0 8px', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 19, color: '#0F0D09' }}>
                Acompte Sécurisé avec Succès !
              </h3>
              <p style={{ fontSize: 13.5, color: '#666', lineHeight: 1.6, margin: '0 0 22px' }}>
                Votre commande a été transmise à l'artisan certifié. Les fonds de <strong>{totalAmount.toLocaleString('fr-FR')} FCFA</strong> sont sécurisés par Piolo Protec.
              </p>
              <button
                onClick={onClose}
                style={{ background: '#0F0D09', color: '#F6D365', border: 'none', padding: '13px 24px', borderRadius: 12, fontWeight: 800, fontSize: 13.5, cursor: 'pointer' }}
              >
                Fermer &amp; Suivre ma commande
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

