import { useTranslation } from 'react-i18next';
import React from 'react';

/**
 * Modal de Confirmation de Publication de Projet (Déduction de 5 points)
 */
export default function ProPublishConfirmModal({ project, currentPoints, activePlan, onConfirm, onCancel, isSubmitting = false }) {
  const { t } = useTranslation();
  const pointsCost = activePlan ? 0 : 5;
  const newPoints = Math.max(0, currentPoints - pointsCost);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,13,9,0.85)', backdropFilter: 'blur(8px)', zIndex: 50030, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#FFFFFF', borderRadius: 22, width: '100%', maxWidth: 480, padding: 26, border: '1px solid #E8E3DA', boxShadow: '0 30px 80px rgba(0,0,0,0.4)', textAlign: 'center' }}>
        
        {/* Icône Dorée */}
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(212,175,55,0.15)', color: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
        </div>

        <h3 style={{ margin: '0 0 8px', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 19, color: '#0F0D09' }}>
          Confirmation de Publication
        </h3>
        
        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5, margin: '0 0 18px' }}>
          Vous êtes sur le point de publier « <strong>{project?.title}</strong> » dans votre vitrine et sur toute la plateforme Piolo.
        </p>

        {/* Détail du coût en points */}
        <div style={{ background: '#FAF9F6', borderRadius: 14, padding: '16px 18px', border: '1px solid #E8E3DA', marginBottom: 20, textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#555', marginBottom: 8 }}>
            <span>{t('pro_modals.publish_confirm.current_balance')}</span>
            <span style={{ fontWeight: 800, color: '#0F0D09' }}>{currentPoints} Pts</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#AA820A', marginBottom: 8, fontWeight: 700 }}>
            <span>{t('pro_modals.publish_confirm.cost')}</span>
            <span style={{ color: activePlan ? '#27AE60' : '#D97706', fontWeight: 800 }}>
              {activePlan ? '0 Pt (Abonnement Pro Actif)' : '-5 Points'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#0F0D09', paddingTop: 10, borderTop: '1px dashed #E8E3DA', fontWeight: 800 }}>
            <span>{t('pro_modals.publish_confirm.new_balance')}</span>
            <span style={{ color: '#D4AF37', fontSize: 15 }}>{newPoints} Points</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 12,
              border: '1.5px solid #E8E3DA',
              background: '#FAF9F6',
              fontWeight: 700,
              fontSize: 13,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.6 : 1
            }}
          >
            {t('common.cancel')}
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            style={{
              flex: 1.2,
              padding: '12px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)',
              color: '#0F0D09',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 800,
              fontSize: 13.5,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(212,175,55,0.35)',
              opacity: isSubmitting ? 0.75 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            {isSubmitting ? (
              <span>{t('pro_modals.publish_confirm.publishing')}</span>
            ) : (
              <span>{t('pro_modals.publish_confirm.confirm')}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
