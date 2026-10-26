import { useTranslation } from 'react-i18next';
import React from 'react';
import { subscriptionService, POINT_COSTS, LANDLORD_POINT_COSTS } from '../services/subscriptionService';
import { useAuth } from '../context/AuthContext';

// Vector Icons
const CoinsIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
    <path d="M16.7 13.3l.6.7" />
  </svg>
);

const CrownIcon = ({ size = 20, color = '#D4AF37' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" fill="rgba(212,175,55,0.15)" />
    <circle cx="12" cy="4" r="1.5" fill={color} />
    <circle cx="2" cy="4" r="1.5" fill={color} />
    <circle cx="22" cy="4" r="1.5" fill={color} />
  </svg>
);

const CloseIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ShieldCheckIcon = ({ size = 18, color = '#16A34A' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const AlertTriangleIcon = ({ size = 22, color = '#D97706' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ActionIconMapper = ({ actionKey, size = 22, color = '#D4AF37' }) => {
  switch (actionKey) {
    case 'PROPERTY_PUBLISH':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
          <path d="M12 2v4" />
        </svg>
      );
    case 'RENT_AI_ESTIMATE_REPORT':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
          <circle cx="12" cy="12" r="4" fill="rgba(212,175,55,0.25)" stroke={color} />
        </svg>
      );
    case 'STUDIO_REEL_EXPORT':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
        </svg>
      );
    case 'BOOST_FLASH_48H':
    case 'BOOST_VEDETTE_7D':
    case 'BOOST_SERENITE_30D':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 'CONTACT_LANDLORD':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case 'SHORT_STAY_BOOKING':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'VIRTUAL_TOUR_360':
    case 'VIRTUAL_TOUR_CREATION':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <ellipse cx="12" cy="12" rx="10" ry="4" />
          <circle cx="12" cy="12" r="2" fill={color} />
        </svg>
      );
    case 'RENTAL_APPLICATION':
    case 'UNBLOCK_TENANT_FILE':
    case 'GENERATE_OHADA_LEASE':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    case 'PHYSICAL_VISIT':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <circle cx="12" cy="15" r="1.5" fill={color} />
        </svg>
      );
    case 'PROPERTY_GPS_ROUTE':
    case 'PRO_GPS_ROUTE':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="3 11 22 2 13 21 11 13 3 11" />
        </svg>
      );
    case 'PRO_QUOTE_REQUEST':
    case 'PRO_QUOTE_DISPATCH':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
          <path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
      );
    case 'CONTACT_PRO':
    case 'CONTACT_VERIFIED_TENANT':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
  }
};

/**
 * PointConfirmationModal
 * 
 * Modale de confirmation moderne, professionnelle et 100% adaptée au mobile
 * avant de débiter réellement les points sur les actions clés (Locataire & Bailleur).
 */
export default function PointConfirmationModal({
  isOpen,
  actionKey = 'CONTACT_LANDLORD',
  userRole = null,
  targetTitle = '',
  targetSubtitle = '',
  onConfirm,
  onCancel,
  onOpenRecharge
}) {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!isOpen) return null;

  // Déterminer si l'action relève du profil Bailleur ou Locataire
  const isLandlordAction =
    userRole === 'landlord' ||
    userRole === 'bailleur' ||
    Boolean(LANDLORD_POINT_COSTS[actionKey]) ||
    user?.role === 'bailleur';

  const costMeta = isLandlordAction
    ? (LANDLORD_POINT_COSTS[actionKey] || {
        key: actionKey,
        points: actionKey === 'PROPERTY_PUBLISH' ? 20 : (actionKey === 'RENT_AI_ESTIMATE_REPORT' ? 4 : 5),
        label: t('point_confirmation.title_landlord'),
        desc: 'Opération certifiée Piolo'
      })
    : (POINT_COSTS[actionKey] || {
        key: actionKey,
        points: 5,
        label: t('point_confirmation.title_secure'),
        desc: 'Déblocage de ressource vérifiée'
      });

  const currentPoints = user
    ? (isLandlordAction ? subscriptionService.getLandlordPoints(user.id) : subscriptionService.getTenantPoints(user.id))
    : 0;

  const activePlan = user && !isLandlordAction ? subscriptionService.getTenantPlan(user.id) : null;
  const isVip = Boolean(!isLandlordAction && (user?.is_vip_tenant || activePlan?.plan_type === 'vip_pass'));

  const cost = isVip ? 0 : costMeta.points;
  const hasSufficientPoints = isVip || currentPoints >= cost;
  const remainingPoints = hasSufficientPoints ? (isVip ? currentPoints : currentPoints - cost) : currentPoints;
  const missingPoints = cost - currentPoints;

  const handleExecute = () => {
    if (!hasSufficientPoints) {
      if (onOpenRecharge) onOpenRecharge();
      return;
    }

    if (user) {
      if (isLandlordAction) {
        const deductionResult = subscriptionService.deductLandlordPoints(user.id, actionKey);
        if (!deductionResult.success) {
          if (onOpenRecharge) onOpenRecharge();
          return;
        }
      } else {
        const deductionResult = subscriptionService.deductTenantPoints(user.id, actionKey, isVip);
        if (!deductionResult.success) {
          if (onOpenRecharge) onOpenRecharge();
          return;
        }
      }
    }

    if (onConfirm) onConfirm();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(28, 25, 23, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '16px',
        animation: 'pointModalFadeIn 0.22s ease-out'
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#FAF8F5',
          borderRadius: '24px',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(255, 255, 255, 0.8) inset',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar with Action Icon */}
        <div
          style={{
            padding: '24px 24px 18px',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF8F5 100%)',
            borderBottom: '1px solid #EFECE6',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: isVip
                  ? 'linear-gradient(135deg, rgba(212,175,55,0.18), rgba(212,175,55,0.06))'
                  : 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(154,103,0,0.08))',
                border: '1px solid rgba(212,175,55,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {isVip ? <CrownIcon size={24} color="#D4AF37" /> : <ActionIconMapper actionKey={actionKey} size={22} color="#D4AF37" />}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.6px',
                    textTransform: 'uppercase',
                    color: isVip ? '#D4AF37' : '#9A6700',
                    background: isVip ? 'rgba(212,175,55,0.14)' : 'rgba(212,175,55,0.12)',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}
                >
                  {isVip ? 'Privilège VIP Illimité' : 'Confirmation de Débit'}
                </span>
              </div>
              <h3
                style={{
                  margin: '4px 0 0',
                  fontSize: '17px',
                  fontWeight: 800,
                  color: '#1C1917',
                  fontFamily: 'Outfit, Plus Jakarta Sans, sans-serif'
                }}
              >
                {costMeta.label}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: '#EAE6DF',
              color: '#57534E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background 0.15s ease'
            }}
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Target Description */}
          {targetTitle && (
            <div
              style={{
                padding: '12px 14px',
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #EFECE6'
              }}
            >
              <div style={{ fontSize: '11.5px', color: '#78716C', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Élément concerné
              </div>
              <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#1C1917', marginTop: '2px' }}>
                {targetTitle}
              </div>
              {targetSubtitle && (
                <div style={{ fontSize: '12.5px', color: '#78716C', marginTop: '2px' }}>
                  {targetSubtitle}
                </div>
              )}
            </div>
          )}

          {/* Point Calculation Box */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: isVip ? '1px solid rgba(212,175,55,0.35)' : '1px solid #EAE6DF',
              padding: '16px'
            }}
          >
            {isVip ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(212,175,55,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <ShieldCheckIcon size={22} color="#D4AF37" />
                </div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1C1917' }}>
                    Pass VIP Actif — 0 Point Débité
                  </div>
                  <div style={{ fontSize: '12px', color: '#78716C', marginTop: '1px' }}>
                    Toutes vos demandes et contacts sont illimités et 100% prioritaires.
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#57534E' }}>
                  <span>{t('point_confirmation.current_balance')}</span>
                  <span style={{ fontWeight: 700, color: '#1C1917', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CoinsIcon size={14} color="#D4AF37" /> {currentPoints} pts
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13.5px' }}>
                  <span style={{ color: '#57534E' }}>{t('point_confirmation.action_cost')}</span>
                  <span style={{ fontWeight: 800, color: '#DC2626' }}>
                    -{cost} pts
                  </span>
                </div>

                <div
                  style={{
                    height: '1px',
                    background: '#EAE6DF',
                    margin: '2px 0'
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13.5px' }}>
                  <span style={{ fontWeight: 700, color: '#1C1917' }}>{t('point_confirmation.balance_after')}</span>
                  <span
                    style={{
                      fontWeight: 800,
                      color: hasSufficientPoints ? '#16A34A' : '#DC2626',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <CoinsIcon size={14} color={hasSufficientPoints ? '#16A34A' : '#DC2626'} />
                    {hasSufficientPoints ? `${remainingPoints} pts` : 'Insuffisant'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Insufficient balance warning */}
          {!hasSufficientPoints && (
            <div
              style={{
                background: 'rgba(217, 119, 6, 0.08)',
                border: '1px solid rgba(217, 119, 6, 0.28)',
                borderRadius: '14px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              <AlertTriangleIcon size={19} color="#D97706" />
              <div style={{ fontSize: '12.5px', color: '#92400E', lineHeight: '1.45' }}>
                <strong>{t('point_confirmation.insufficient_points')}</strong> {t('point_confirmation.missing_points')} <strong>{missingPoints} point{missingPoints > 1 ? 's' : ''}</strong> pour effectuer cette action. {isLandlordAction ? 'Rechargez vos points en 1 clic par Orange Money ou MTN MoMo.' : 'Rechargez un pack ou passez au Pass VIP pour un accès illimité.'}
              </div>
            </div>
          )}

          {/* Reassurance note */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#78716C' }}>
            <ShieldCheckIcon size={15} color="#16A34A" />
            <span>
              {isLandlordAction
                ? 'Action garantie : diffusion prioritaire, validation rapide et mise en relation certifiée.'
                : 'Action garantie : mise en relation certifiée et assistance Piolo disponible 7j/7.'}
            </span>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div
          style={{
            padding: '16px 24px 22px',
            background: '#FAF8F5',
            borderTop: '1px solid #EFECE6',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          {hasSufficientPoints ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onCancel}
                style={{
                  flex: 1,
                  padding: '13px 16px',
                  borderRadius: '14px',
                  border: '1px solid #D6D1C7',
                  background: '#FFFFFF',
                  color: '#44403C',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleExecute}
                style={{
                  flex: 1.8,
                  padding: '13px 18px',
                  borderRadius: '14px',
                  border: 'none',
                  background: isVip
                    ? 'linear-gradient(135deg, #1C1917 0%, #292524 100%)'
                    : 'linear-gradient(135deg, #D4AF37 0%, #B89628 100%)',
                  color: isVip ? '#D4AF37' : '#1C1917',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(212, 175, 55, 0.3)',
                  transition: 'transform 0.15s ease'
                }}
              >
                {isVip ? (
                  <>
                    <CrownIcon size={16} color="#D4AF37" /> Continuer (Gratuit VIP)
                  </>
                ) : (
                  <>
                    <CoinsIcon size={16} color="#1C1917" /> Débiter {cost} pts & Continuer
                  </>
                )}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  onCancel();
                  if (onOpenRecharge) onOpenRecharge();
                }}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #D4AF37 0%, #B89628 100%)',
                  color: '#1C1917',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(212, 175, 55, 0.35)'
                }}
              >
                <CrownIcon size={17} color="#1C1917" /> {isLandlordAction ? 'Recharger mes points (OM / MoMo)' : 'Recharger ou Passer VIP'}
              </button>

              <button
                type="button"
                onClick={onCancel}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'transparent',
                  color: '#78716C',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Non merci, fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
