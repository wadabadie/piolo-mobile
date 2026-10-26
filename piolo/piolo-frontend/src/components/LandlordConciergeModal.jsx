import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { subscriptionService } from '../services/subscriptionService';
import { useDarkMode } from '../context/DarkModeContext';

/* ─── LOGOS OFFICIELS DES OPÉRATEURS ─── */
const OrangeMoneyLogo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ borderRadius: 8, flexShrink: 0 }}>
    <rect width="40" height="40" rx="8" fill="#FF7900" />
    <rect x="7" y="21" width="26" height="12" rx="3" fill="#000000" />
    <circle cx="13" cy="27" r="2.5" fill="#FF7900" />
    <text x="24" y="29.2" fill="#FFFFFF" fontSize="6.5" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="0.4">OM</text>
    <text x="20" y="14" fill="#FFFFFF" fontSize="7.5" fontWeight="900" textAnchor="middle" fontFamily="system-ui, sans-serif" letterSpacing="0.6">orange</text>
  </svg>
);

const MtnMomoLogo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ borderRadius: 8, flexShrink: 0 }}>
    <rect width="40" height="40" rx="8" fill="#FFCC00" />
    <ellipse cx="20" cy="19" rx="16" ry="12" fill="#000000" />
    <text x="20" y="16.8" fill="#FFCC00" fontSize="8" fontWeight="900" fontStyle="italic" textAnchor="middle" fontFamily="system-ui, sans-serif">MTN</text>
    <text x="20" y="25" fill="#FFFFFF" fontSize="6.5" fontWeight="800" textAnchor="middle" fontFamily="system-ui, sans-serif">MoMo</text>
  </svg>
);

const DownloadDocIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <polyline points="9 15 12 18 15 15" />
  </svg>
);

/**
 * LandlordConciergeModal — Service de Conciergerie & Gestion Déléguée Clé en Main Piolo
 * Design Harmonisé avec les autres modales (Mode Clair Chaud + Dark Mode)
 * Sans stickers, 100% Responsive Mobile
 */
export default function LandlordConciergeModal({ properties = [], user, onClose, onRequestCreated }) {
  const { t } = useTranslation();
  const [step, setStep] = useState('choice'); // 'choice' | 'form' | 'payment' | 'success'
  const [selectedPackage, setSelectedPackage] = useState('full_management'); // 'full_management' | 'shooting_only'
  const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0]?.id || 'custom');
  const [customTitle, setCustomTitle] = useState('');
  const [city, setCity] = useState(properties[0]?.city || 'Douala');
  const [neighborhood, setNeighborhood] = useState(properties[0]?.neighborhood || 'Bonapriso');
  const [contactName, setContactName] = useState(user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '');
  const [contactPhone, setContactPhone] = useState(user?.phone_number || user?.phone || '');
  const [preferredDate, setPreferredDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('morning'); // 'morning' (09h-12h) | 'afternoon' (14h-17h)
  const [notes, setNotes] = useState('');
  const [operator, setOperator] = useState('OM'); // 'OM' | 'MOMO' | 'CARD'
  const [paymentPhone, setPaymentPhone] = useState(user?.phone_number || user?.phone || '');
  const [createdDossier, setCreatedDossier] = useState(null);
  const [error, setError] = useState('');

  const darkCtx = useDarkMode();
  const isDark = !!darkCtx?.dark;

  // Masquer la barre mobile inférieure et bloquer le scroll sous la modale
  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  const PACKAGES = [
    {
      id: 'full_management',
      name: t('concierge.formula_full', 'Gestion Déléguée Intégrale Piolo Signature'),
      badge: t('concierge.badge', 'Recommandé · Clé en Main'),
      price: t('concierge.formula_full_price', '19 000 FCFA'),
      rawPrice: 19000,
      subPrice: '+ Commission standard à la signature',
      description: t('concierge.full_desc', 'Délégation totale : nous tournons le 360°, publions l’annonce, réalisons 100% des visites physiques et sélectionnons le meilleur locataire solvable pour vous.'),
      features: [
        'Déplacement d’un agent & photographe pro sur site',
        'Shooting photo reflex HDR + Visite virtuelle 360° + Vidéo 4K',
        'Rédaction & publication de l’annonce certifiée « Piolo Exclusive »',
        'Gestion complète de 100% des appels, messages et candidats',
        'Conduite de toutes les visites physiques par l’agent Piolo',
        'Audit de solvabilité certifié (CNI, 3 bulletins, contrat, garant)',
        'Rédaction du bail conforme droit OHADA & remise des clés'
      ]
    },
    {
      id: 'shooting_only',
      name: t('concierge.formula_shooting', 'Captation 360° & Numérisation Seule'),
      badge: 'Production Média',
      price: t('concierge.formula_shooting_price', '9 500 FCFA'),
      rawPrice: 9500,
      subPrice: 'Paiement unique · Sans engagement',
      description: t('concierge.shooting_desc', 'Un technicien Piolo vient numériser l’intégralité de votre bien en 360° et vous remet la visite interactive prête à être intégrée à votre annonce.'),
      features: [
        'Prise de vue 360° haute précision (Pannellum / Matterport)',
        'Pack de 15 photos professionnelles retouchées en haute définition',
        'Montage d’une vidéo Reel verticale pour les réseaux',
        'Hébergement et intégration immédiate sur votre annonce Piolo'
      ]
    }
  ];

  const handleSelectPackage = (pkgId) => {
    setSelectedPackage(pkgId);
    setStep('form');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!contactPhone || contactPhone.trim().length < 8) {
      setError('Veuillez renseigner un numéro de téléphone de contact valide.');
      return;
    }
    if (!preferredDate) {
      setError('Veuillez sélectionner une date souhaitée de passage.');
      return;
    }
    setError('');
    setPaymentPhone(contactPhone);
    setStep('payment');
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!paymentPhone || paymentPhone.trim().length < 8) {
      setError('Veuillez renseigner le numéro de téléphone pour le débit Mobile Money.');
      return;
    }
    setError('');

    let propTitle = customTitle || 'Logement Haut Standing';
    if (selectedPropertyId !== 'custom') {
      const found = properties.find(p => String(p.id) === String(selectedPropertyId));
      if (found) propTitle = found.title;
    }

    const pkg = PACKAGES.find(p => p.id === selectedPackage);
    const newReq = await subscriptionService.submitConciergeRequest(user?.id, {
      propertyTitle: propTitle,
      propertyId: selectedPropertyId,
      city,
      neighborhood,
      packageType: selectedPackage,
      packageName: pkg?.name || 'Gestion Déléguée Piolo Signature',
      price: pkg?.rawPrice || 19000,
      contactName,
      contactPhone,
      paymentPhone,
      paymentOperator: operator,
      preferredDate,
      timeSlot,
      notes,
      paymentMethod: operator,
      paidAmount: pkg?.price
    });

    setCreatedDossier(newReq);
    setStep('success');
    if (onRequestCreated) onRequestCreated(newReq);
  };

  const handleDownloadReceipt = () => {
    const txNumber = createdDossier?.id || `PIO-CONC-${Math.floor(100000 + Math.random() * 900000)}`;
    const dateStr = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const pkg = PACKAGES.find(p => p.id === selectedPackage);
    const itemTitle = pkg?.name || 'Gestion Déléguée Intégrale Piolo Signature';
    const amountStr = `${(pkg?.rawPrice || 19000).toLocaleString('fr-FR')} FCFA`;
    const opName = operator === 'OM' ? 'Orange Money Cameroun' : (operator === 'MOMO' ? 'MTN Mobile Money' : 'Carte Bancaire');
    const propTitle = createdDossier?.propertyTitle || customTitle || 'Logement Clé en Main';
    const locationStr = `${neighborhood || ''}, ${city || 'Cameroun'}`.trim();
    const interventionStr = preferredDate
      ? `${preferredDate} (${timeSlot === 'morning' ? 'Matinée 09h-12h' : 'Après-midi 14h-17h'})`
      : 'À convenir avec la logistique Piolo';

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reçu Officiel Conciergerie Piolo - ${txNumber}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1C1917; background: #FFF; padding: 40px; margin: 0; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #D4AF37; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 26px; font-weight: 900; color: #1C1917; letter-spacing: -0.5px; }
          .logo span { color: #D4AF37; }
          .badge { background: #FFF8E7; color: #9A6700; border: 1px solid #F5E5BE; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .table { width: 100%; border-collapse: collapse; margin: 25px 0; }
          .table th { background: #FAF7F2; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; color: #6E665B; border-bottom: 1px solid #EBE4D8; }
          .table td { padding: 14px 12px; border-bottom: 1px solid #EBE4D8; font-size: 14px; }
          .total { text-align: right; font-size: 18px; font-weight: bold; color: #9A6700; margin-top: 15px; }
          .stamp { margin-top: 40px; padding: 15px; background: #FAF7F2; border-left: 4px solid #D4AF37; border-radius: 4px; font-size: 12px; color: #5C5449; }
          .info-block { background: #FAF8F5; border: 1px solid #EAE2D5; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; color: #443F39; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">PIOLO<span>.</span></div>
            <div style="font-size: 12px; color: #6E665B; margin-top: 4px;">Conciergerie & Gestion Déléguée Immobilière — Cameroun</div>
          </div>
          <div style="text-align: right;">
            <span class="badge">PAIEMENT & MANDAT SÉCURISÉ VALIDÉ</span>
            <div style="font-size: 12px; color: #6E665B; margin-top: 8px;">Dossier Réf : <strong>${txNumber}</strong></div>
            <div style="font-size: 12px; color: #6E665B;">Date : ${dateStr}</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: #6E665B; font-weight: bold;">Bailleur Propriétaire :</div>
            <div style="font-weight: bold; font-size: 15px; margin-top: 2px;">${contactName || user?.first_name || 'Bailleur Piolo'} ${user?.last_name || ''}</div>
            <div style="font-size: 13px; color: #5C5449;">Contact : ${contactPhone || paymentPhone || 'Non renseigné'}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; text-transform: uppercase; color: #6E665B; font-weight: bold;">Règlement :</div>
            <div style="font-weight: bold; font-size: 14px; margin-top: 2px; color: #1C1917;">${opName}</div>
            <div style="font-size: 13px; color: #2E7D32; font-weight: 600;">✓ Transaction Approuvée</div>
          </div>
        </div>

        <div class="info-block">
          <strong>Bien pris en charge :</strong> ${propTitle} (${locationStr})<br>
          <strong>Intervention équipe Piolo :</strong> ${interventionStr}
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Désignation de la prestation</th>
              <th>Prise en charge</th>
              <th style="text-align: right;">Montant TTC</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${itemTitle}</strong><br><span style="font-size: 12px; color: #6E665B;">Captation média pro 360°, shooting 4K, visites et commercialisation locataire</span></td>
              <td>1 bien</td>
              <td style="text-align: right; font-weight: bold;">${amountStr}</td>
            </tr>
          </tbody>
        </table>

        <div class="total">Total Réglé : ${amountStr}</div>

        <div class="stamp">
          <strong>Mandat Officiel Piolo SAS</strong><br>
          Ce reçu numérique fait foi de commande et d'engagement de conciergerie. L'équipe logistique et technique Piolo prendra attache avec vous pour le déroulement sur site sous la référence <strong>${txNumber}</strong>.
        </div>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(receiptHtml);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => { printWin.print(); }, 300);
    }
  };

  const theme = {
    overlayBg: isDark ? 'rgba(12, 10, 8, 0.88)' : 'rgba(26, 22, 18, 0.72)',
    modalBg: isDark ? '#151310' : '#FFFFFF',
    modalBorder: isDark ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid #EBE4D8',
    modalShadow: isDark ? '0 30px 90px rgba(0,0,0,0.85)' : '0 24px 60px rgba(45, 38, 30, 0.22)',
    headerBg: isDark ? '#1C1A16' : '#FAF8F5',
    headerBorder: isDark ? 'rgba(255,255,255,0.08)' : '#EFE9DF',
    titleColor: isDark ? '#FAF6F0' : '#1C1917',
    badgeText: isDark ? '#F6D365' : '#9A6700',
    badgeBg: isDark ? 'rgba(212,175,55,0.12)' : '#FFF8E7',
    badgeBorder: isDark ? 'rgba(212,175,55,0.25)' : '#F5E5BE',
    closeBg: isDark ? 'rgba(255,255,255,0.08)' : '#F4EFE6',
    closeColor: isDark ? '#FAF6F0' : '#5C5449',
    cardStandardBg: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF',
    cardStandardBorder: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #EBE4D8',
    cardVipBg: isDark ? 'linear-gradient(180deg, rgba(212,175,55,0.1) 0%, rgba(21,19,16,0.95) 100%)' : 'linear-gradient(180deg, #FFFCF2 0%, #FFFFFF 100%)',
    cardVipBorder: '2px solid #D4AF37',
    cardVipShadow: isDark ? '0 12px 36px rgba(212,175,55,0.18)' : '0 12px 30px rgba(212, 175, 55, 0.14)',
    cardTitle: isDark ? '#FAF6F0' : '#1C1917',
    cardDesc: isDark ? '#A39C92' : '#6E665B',
    cardPriceVip: isDark ? '#F6D365' : '#9A6700',
    cardPriceNormal: isDark ? '#FAF6F0' : '#1C1917',
    cardFeatures: isDark ? '#E2DDD4' : '#3B352E',
    inputBg: isDark ? 'rgba(255,255,255,0.04)' : '#FAF8F5',
    inputBorder: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #D9CFC1',
    inputColor: isDark ? '#FAF6F0' : '#1C1917',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: theme.overlayBg,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 100000,
        overflowY: 'auto',
        animation: 'fadeIn 0.2s ease',
        boxSizing: 'border-box'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: theme.modalBg,
          border: theme.modalBorder,
          borderRadius: 24,
          maxWidth: 680,
          width: '100%',
          boxShadow: theme.modalShadow,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          position: 'relative',
          margin: 'auto',
          boxSizing: 'border-box',
          fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── EN-TÊTE ÉLÉGANT CLAIR (Même design system que LandlordSubscriptionModal) ── */}
        <div
          style={{
            backgroundColor: theme.headerBg,
            borderBottom: `1px solid ${theme.headerBorder}`,
            padding: '22px 24px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexShrink: 0
          }}
        >
          <div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: theme.badgeBg,
                color: theme.badgeText,
                border: `1px solid ${theme.badgeBorder}`,
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 8
              }}
            >
              <span>🔑</span>
              <span>{t('concierge.badge', 'CONCIERGERIE & GESTION DÉLÉGUÉE')}</span>
            </span>

            <h2
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: theme.titleColor,
                margin: 0,
                letterSpacing: '-0.02em',
                fontFamily: "'Poppins', sans-serif"
              }}
            >
              {t('concierge.title', 'Gestion Déléguée & Clé en Main')}
            </h2>
            <p
              style={{
                fontSize: 13,
                color: isDark ? '#A39C92' : '#6E665B',
                margin: '4px 0 0 0',
                lineHeight: 1.4
              }}
            >
              {t('concierge.full_desc', 'Déléguez le tournage 360°, la promotion et 100% des visites à l\'équipe Piolo')}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close', 'Fermer')}
            style={{
              backgroundColor: theme.closeBg,
              color: theme.closeColor,
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: 'bold',
              transition: 'all 0.15s ease',
              flexShrink: 0,
              marginLeft: 12
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.15)' : '#E8E1D5'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = theme.closeBg; }}
          >
            ✕
          </button>
        </div>

        {/* ── CORPS DE LA MODALE ── */}
        <div
          style={{
            padding: '24px 24px 28px',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            flex: 1,
            boxSizing: 'border-box'
          }}
        >
          {error && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #F87171',
                color: '#991B1B',
                padding: '12px 16px',
                borderRadius: 14,
                fontSize: 13.5,
                marginBottom: 18,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* ── ÉTAPE 1 : CHOIX DE LA FORMULE ── */}
          {step === 'choice' && (
            <div>
              <div
                style={{
                  fontSize: 13.5,
                  color: isDark ? '#C7BFB3' : '#5C5449',
                  marginBottom: 18,
                  lineHeight: 1.5
                }}
              >
                {t('concierge.step_choice', 'Choisissez votre formule d\'accompagnement. Nos agents certifiés interviennent à Douala, Yaoundé, Kribi, Bafoussam et leurs environs.')}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {PACKAGES.map((pkg) => {
                  const isSelected = selectedPackage === pkg.id;
                  const isHighlight = pkg.id === 'full_management';

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg.id)}
                      style={{
                        backgroundColor: isSelected
                          ? (isDark ? 'rgba(212,175,55,0.12)' : '#FFFDF7')
                          : theme.cardStandardBg,
                        border: isSelected
                          ? '2px solid #D4AF37'
                          : theme.cardStandardBorder,
                        borderRadius: 18,
                        padding: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        boxShadow: isSelected
                          ? (isDark ? '0 8px 30px rgba(212,175,55,0.2)' : '0 8px 24px rgba(212, 175, 55, 0.16)')
                          : 'none'
                      }}
                    >
                      {/* Badge Formule */}
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: 10.5,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          padding: '4px 10px',
                          borderRadius: 20,
                          backgroundColor: isHighlight ? '#FFF8E7' : (isDark ? 'rgba(255,255,255,0.06)' : '#F2ECE1'),
                          color: isHighlight ? '#9A6700' : (isDark ? '#C7BFB3' : '#5C5449'),
                          border: `1px solid ${isHighlight ? '#F5E5BE' : 'transparent'}`,
                          marginBottom: 10
                        }}
                      >
                        {pkg.badge}
                      </span>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
                        <h3
                          style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: 17,
                            fontWeight: 800,
                            margin: '0 0 6px 0',
                            color: theme.cardTitle
                          }}
                        >
                          {pkg.name}
                        </h3>

                        <div style={{ textAlign: 'right' }}>
                          <div
                            style={{
                              fontFamily: "'Poppins', sans-serif",
                              fontSize: 21,
                              fontWeight: 800,
                              color: isHighlight ? (isDark ? '#F6D365' : '#9A6700') : theme.cardTitle
                            }}
                          >
                            {pkg.price}
                          </div>
                          <div style={{ fontSize: 11.5, color: isDark ? '#A39C92' : '#786F65', fontWeight: 600 }}>
                            {pkg.subPrice}
                          </div>
                        </div>
                      </div>

                      <p style={{ fontSize: 13, color: theme.cardDesc, margin: '8px 0 14px 0', lineHeight: 1.5 }}>
                        {pkg.description}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                        {pkg.features.map((feat, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: theme.cardFeatures, lineHeight: 1.4 }}>
                            <span style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: 14 }}>✓</span>
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 22 }}>
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)',
                    color: '#0B0906',
                    border: 'none',
                    borderRadius: 14,
                    padding: '14px 24px',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 15,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    width: '100%',
                    boxShadow: '0 4px 18px rgba(212, 175, 55, 0.35)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{t('concierge.order_btn', 'Continuer')}</span>
                  <span style={{ fontSize: 16 }}>→</span>
                </button>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 2 : FORMULAIRE DE PLANIFICATION ── */}
          {step === 'form' && (
            <form onSubmit={handleFormSubmit}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: theme.badgeText, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t('concierge.step_form', 'Étape 1 sur 2 · Localisation & Contact')}
                </span>
                <button
                  type="button"
                  onClick={() => setStep('choice')}
                  style={{ background: 'none', border: 'none', color: isDark ? '#A39C92' : '#6E665B', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
                >
                  ← {t('subscriptions.tenant.back_to_offers', 'Changer de formule')}
                </button>
              </div>

              {/* Sélection du bien */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: theme.cardTitle, marginBottom: 6, display: 'block' }}>
                  {t('concierge.select_property', 'Bien immobilier concerné')}
                </label>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  style={{
                    width: '100%',
                    border: theme.inputBorder,
                    borderRadius: 12,
                    padding: '12px 14px',
                    fontSize: 14,
                    background: theme.inputBg,
                    color: theme.inputColor,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.title} ({p.city})</option>
                  ))}
                  <option value="custom">{t('concierge.custom_property', '+ Autre logement (non encore listé)')}</option>
                </select>
              </div>

              {selectedPropertyId === 'custom' && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: theme.cardTitle, marginBottom: 6, display: 'block' }}>
                    {t('concierge.custom_title', 'Titre ou désignation du logement')}
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Villa 4 Chambres & Jardin — Bonamoussadi"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      border: theme.inputBorder,
                      borderRadius: 12,
                      padding: '12px 14px',
                      fontSize: 14,
                      background: theme.inputBg,
                      color: theme.inputColor,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: theme.cardTitle, marginBottom: 6, display: 'block' }}>
                    {t('concierge.city_label', 'Ville')}
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{
                      width: '100%',
                      border: theme.inputBorder,
                      borderRadius: 12,
                      padding: '12px 14px',
                      fontSize: 14,
                      background: theme.inputBg,
                      color: theme.inputColor,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Douala">Douala</option>
                    <option value="Yaoundé">Yaoundé</option>
                    <option value="Kribi">Kribi</option>
                    <option value="Bafoussam">Bafoussam</option>
                    <option value="Limbé">Limbé</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: theme.cardTitle, marginBottom: 6, display: 'block' }}>
                    {t('concierge.neighborhood_label', 'Quartier précis')}
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Bonapriso, Bastos, Odza…"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      border: theme.inputBorder,
                      borderRadius: 12,
                      padding: '12px 14px',
                      fontSize: 14,
                      background: theme.inputBg,
                      color: theme.inputColor,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Contact sur place */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: theme.cardTitle, marginBottom: 6, display: 'block' }}>
                    {t('concierge.contact_name_label', 'Contact sur place (Nom)')}
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Moi-même ou Nom du gardien"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      border: theme.inputBorder,
                      borderRadius: 12,
                      padding: '12px 14px',
                      fontSize: 14,
                      background: theme.inputBg,
                      color: theme.inputColor,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: theme.cardTitle, marginBottom: 6, display: 'block' }}>
                    {t('concierge.contact_phone_label', 'Téléphone / WhatsApp')}
                  </label>
                  <input
                    type="tel"
                    placeholder="Ex: 6XXXXXXXX"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      border: theme.inputBorder,
                      borderRadius: 12,
                      padding: '12px 14px',
                      fontSize: 14,
                      background: theme.inputBg,
                      color: theme.inputColor,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Date & créneau */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: theme.cardTitle, marginBottom: 6, display: 'block' }}>
                    {t('concierge.preferred_date', 'Date souhaitée d\'intervention')}
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      border: theme.inputBorder,
                      borderRadius: 12,
                      padding: '12px 14px',
                      fontSize: 14,
                      background: theme.inputBg,
                      color: theme.inputColor,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: theme.cardTitle, marginBottom: 6, display: 'block' }}>
                    {t('concierge.time_slot', 'Créneau horaire')}
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    style={{
                      width: '100%',
                      border: theme.inputBorder,
                      borderRadius: 12,
                      padding: '12px 14px',
                      fontSize: 14,
                      background: theme.inputBg,
                      color: theme.inputColor,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="morning">{t('concierge.morning', 'Matin (09h00 - 12h30)')}</option>
                    <option value="afternoon">{t('concierge.afternoon', 'Après-midi (14h00 - 17h30)')}</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 22 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: theme.cardTitle, marginBottom: 6, display: 'block' }}>
                  {t('concierge.notes_label', 'Consignes d\'accès ou précisions (optionnel)')}
                </label>
                <textarea
                  rows="2"
                  placeholder={t('concierge.notes_placeholder', 'Ex: Clés disponibles chez le gardien de la barrière, prévenir 30 min avant…')}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    width: '100%',
                    border: theme.inputBorder,
                    borderRadius: 12,
                    padding: '12px 14px',
                    fontSize: 14,
                    background: theme.inputBg,
                    color: theme.inputColor,
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setStep('choice')}
                  style={{
                    background: 'transparent',
                    color: isDark ? '#FAF6F0' : '#4A4438',
                    border: theme.inputBorder,
                    borderRadius: 14,
                    padding: '13px 20px',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {t('common.back', 'Retour')}
                </button>

                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)',
                    color: '#0B0906',
                    border: 'none',
                    borderRadius: 14,
                    padding: '14px 20px',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 14.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    boxShadow: '0 4px 16px rgba(212, 175, 55, 0.35)'
                  }}
                >
                  <span>{t('concierge.order_btn', 'Passer au paiement & confirmation')}</span>
                  <span style={{ fontSize: 16 }}>→</span>
                </button>
              </div>
            </form>
          )}

          {/* ── ÉTAPE 3 : PAIEMENT MOBILE MONEY ── */}
          {step === 'payment' && (
            <form onSubmit={handleProcessPayment}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: theme.badgeText, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t('concierge.step_indicator_2', 'Étape 2 sur 2 · Paiement Sécurisé')}
                </span>
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  style={{ background: 'none', border: 'none', color: isDark ? '#A39C92' : '#6E665B', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
                >
                  {t('concierge.edit_info', '← Modifier les informations')}
                </button>
              </div>

              {/* Récapitulatif commande */}
              <div
                style={{
                  background: isDark ? 'rgba(255,255,255,0.03)' : '#FAF8F5',
                  border: theme.cardStandardBorder,
                  borderRadius: 16,
                  padding: '16px 18px',
                  marginBottom: 20
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13.5, color: theme.cardDesc }}>{t('concierge.chosen_plan', 'Formule choisie :')}</span>
                  <strong style={{ fontSize: 13.5, color: theme.cardTitle }}>
                    {PACKAGES.find(p => p.id === selectedPackage)?.name}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13.5, color: theme.cardDesc }}>{t('concierge.intervention_place', "Lieu d'intervention :")}</span>
                  <strong style={{ fontSize: 13.5, color: theme.cardTitle }}>{neighborhood}, {city}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${theme.headerBorder}`, paddingTop: 10, marginTop: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: theme.cardTitle }}>{t('concierge.total_to_pay', 'Total à régler :')}</span>
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 19, fontWeight: 800, color: isDark ? '#F6D365' : '#9A6700' }}>
                    {PACKAGES.find(p => p.id === selectedPackage)?.price}
                  </span>
                </div>
              </div>

              <label style={{ fontSize: 13, fontWeight: 700, color: theme.cardTitle, marginBottom: 8, display: 'block' }}>
                {t('concierge.mobile_operator', 'Opérateur de débit mobile')}
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                <button
                  type="button"
                  onClick={() => setOperator('OM')}
                  style={{
                    border: operator === 'OM' ? '2px solid #FF7900' : theme.inputBorder,
                    backgroundColor: operator === 'OM' ? (isDark ? 'rgba(255,121,0,0.12)' : '#FFF6ED') : theme.cardStandardBg,
                    borderRadius: 14,
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <OrangeMoneyLogo size={32} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: theme.cardTitle }}>Orange Money</div>
                    <div style={{ fontSize: 11, color: theme.cardDesc }}>#150*50# Cameroun</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setOperator('MOMO')}
                  style={{
                    border: operator === 'MOMO' ? '2px solid #FFCC00' : theme.inputBorder,
                    backgroundColor: operator === 'MOMO' ? (isDark ? 'rgba(255,204,0,0.12)' : '#FFFAEB') : theme.cardStandardBg,
                    borderRadius: 14,
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <MtnMomoLogo size={32} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: theme.cardTitle }}>MTN MoMo</div>
                    <div style={{ fontSize: 11, color: theme.cardDesc }}>*126# Cameroun</div>
                  </div>
                </button>
              </div>

              <div style={{ marginBottom: 22 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: theme.cardTitle, marginBottom: 6, display: 'block' }}>
                  {t('concierge.debit_number', 'Numéro de débit {{operator}}', { operator: operator === 'OM' ? 'Orange Money' : 'MTN Mobile Money' })}
                </label>
                <input
                  type="tel"
                  placeholder="Ex: 6XXXXXXXX"
                  value={paymentPhone}
                  onChange={(e) => setPaymentPhone(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    border: theme.inputBorder,
                    borderRadius: 12,
                    padding: '12px 14px',
                    fontSize: 14,
                    background: theme.inputBg,
                    color: theme.inputColor,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{ fontSize: 12, color: theme.cardDesc, marginTop: 5, display: 'block' }}>
                  {t('concierge.ussd_prompt', 'Une notification USSD vous sera envoyée pour valider le débit avec votre code PIN secret.')}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  style={{
                    background: 'transparent',
                    color: isDark ? '#FAF6F0' : '#4A4438',
                    border: theme.inputBorder,
                    borderRadius: 14,
                    padding: '13px 20px',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {t('common.back', 'Retour')}
                </button>

                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)',
                    color: '#0B0906',
                    border: 'none',
                    borderRadius: 14,
                    padding: '14px 20px',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 14.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    boxShadow: '0 4px 16px rgba(212, 175, 55, 0.35)'
                  }}
                >
                  <span>{t('concierge.confirm_order_btn', "Valider & Commander l'intervention")}</span>
                  <span style={{ fontSize: 16 }}>✓</span>
                </button>
              </div>
            </form>
          )}

          {/* ── ÉTAPE 4 : SUCCÈS & RÉCAPITULATIF ── */}
          {step === 'success' && createdDossier && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #D4AF37, #F6D365)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)',
                  marginBottom: 16,
                  color: '#0F0D09',
                  fontSize: 28,
                  fontWeight: 900
                }}
              >
                ✓
              </div>

              <h3
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 20,
                  fontWeight: 800,
                  color: theme.titleColor,
                  margin: '0 0 8px 0'
                }}
              >
                {t('concierge.order_success_title', 'Prise en charge confirmée avec succès !')}
              </h3>

              <p style={{ fontSize: 14, color: theme.cardDesc, lineHeight: 1.5, margin: '0 auto 20px auto', maxWidth: 460 }}>
                {t('concierge.order_success_desc', "Votre dossier n° {{id}} est ouvert. Notre équipe logistique vous contacte sur WhatsApp ({{phone}}) pour confirmer l'heure exacte de passage.", {
                  id: createdDossier.id,
                  phone: contactPhone
                })}
              </p>

              {/* Timeline de suivi en direct */}
              <div
                style={{
                  background: isDark ? 'rgba(255,255,255,0.03)' : '#FAF8F5',
                  border: theme.cardStandardBorder,
                  borderRadius: 18,
                  padding: '18px',
                  textAlign: 'left',
                  marginBottom: 22
                }}
              >
                <div style={{ fontSize: 12.5, fontWeight: 800, color: theme.badgeText, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
                  {t('concierge.tracking_title', 'Suivi en temps réel de votre bien :')}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#10B981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 'bold' }}>✓</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: theme.cardTitle }}>{t('concierge.tracking_step_1', 'Commande & Paiement validés')}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#D4AF37', color: '#0F0D09', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 'bold' }}>2</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#F6D365' : '#9A6700' }}>{t('concierge.tracking_step_2', 'Tournage & Numérisation 360° ({{date}})', { date: preferredDate || t('concierge.to_schedule', 'À planifier') })}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.6 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: isDark ? '#332F28' : '#E2DCD0', color: theme.cardDesc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 'bold' }}>3</div>
                    <div style={{ fontSize: 13, color: theme.cardDesc }}>{t('concierge.tracking_step_3', 'Visites physiques assurées par l’agent Piolo')}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.6 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: isDark ? '#332F28' : '#E2DCD0', color: theme.cardDesc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 'bold' }}>4</div>
                    <div style={{ fontSize: 13, color: theme.cardDesc }}>{t('concierge.tracking_step_4', 'Signature du bail & Sélection du locataire solvable')}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  style={{
                    background: isDark ? 'rgba(212,175,55,0.12)' : '#FFF8E7',
                    color: isDark ? '#F6D365' : '#9A6700',
                    border: isDark ? '1px solid rgba(212,175,55,0.3)' : '1px solid #F5E5BE',
                    borderRadius: 14,
                    padding: '13px 20px',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 14.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    width: '100%',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <DownloadDocIcon size={16} color={isDark ? '#F6D365' : '#9A6700'} />
                  <span>{t('concierge.download_receipt_btn', 'Télécharger mon Reçu Officiel (PDF)')}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)',
                    color: '#0B0906',
                    border: 'none',
                    borderRadius: 14,
                    padding: '14px 24px',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 15,
                    fontWeight: 800,
                    cursor: 'pointer',
                    width: '100%',
                    boxShadow: '0 4px 18px rgba(212, 175, 55, 0.35)'
                  }}
                >
                  {t('concierge.access_dashboard_btn', 'Accéder au Dashboard Bailleur')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
