import { useTranslation } from 'react-i18next';
import React from 'react';

/**
 * Modal de Confirmation de Suppression de Projet
 */
export default function ProDeleteConfirmModal({ project, onConfirm, onCancel }) {
  const { t } = useTranslation();
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,13,9,0.85)', backdropFilter: 'blur(8px)', zIndex: 50030, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#FFFFFF', borderRadius: 22, width: '100%', maxWidth: 440, padding: 26, border: '1px solid #E8E3DA', boxShadow: '0 30px 80px rgba(0,0,0,0.4)', textAlign: 'center' }}>
        
        {/* Icône Corbeille / Alerte */}
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(231,76,60,0.12)', color: '#E74C3C', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </div>

        <h3 style={{ margin: '0 0 8px', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 19, color: '#0F0D09' }}>
          {t('pro_modals.delete_confirm.title')}
        </h3>
        
        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5, margin: '0 0 18px' }}>
          Vous êtes sur le point de retirer définitivement « <strong>{project?.title}</strong> » de votre vitrine.
        </p>

        <div style={{ background: '#FFF5F5', border: '1px solid rgba(231,76,60,0.25)', borderRadius: 12, padding: '12px 14px', marginBottom: 20, fontSize: 12, color: '#C0392B', textAlign: 'left', display: 'flex', gap: 8, alignItems: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          <span>{t('pro_modals.delete_confirm.warning')}</span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 12,
              border: '1.5px solid #E8E3DA',
              background: '#FAF9F6',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer'
            }}
          >
            {t('common.cancel')}
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
              color: '#FFFFFF',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 800,
              fontSize: 13.5,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(231,76,60,0.35)'
            }}
          >
            Oui, supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
