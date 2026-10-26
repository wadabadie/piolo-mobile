import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { subscriptionService } from '../services/subscriptionService';
import { useAuth } from '../context/AuthContext';
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

/* ─── ICÔNES VECTORIELLES PROFESSIONNELLES (ZÉRO ÉMOJI / ZÉRO STICKER) ─── */
const PremiumCrownIcon = ({ size = 15, color = '#D4AF37' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M3 8l4.5 5.5L12 4l4.5 9.5L21 8l-2 12H5L3 8z" fill={color} fillOpacity="0.18" />
    <circle cx="3" cy="8" r="1.5" fill={color} />
    <circle cx="12" cy="4" r="1.5" fill={color} />
    <circle cx="21" cy="8" r="1.5" fill={color} />
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

const ShieldCheckIcon = ({ size = 14, color = '#9A6700' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={color} fillOpacity="0.15" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const CopyIcon = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const InfoIcon = ({ size = 15, color = '#D4AF37' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const WhatsAppIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#25D366">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.49 0-2.94-.4-4.21-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.203 8.203 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.21 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.75.59.26 1.05.41 1.41.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.12-.22-.19-.46-.31z" />
  </svg>
);

const BuildingIcon = ({ size = 15, color = '#D4AF37' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
  </svg>
);

const ZapIcon = ({ size = 15, color = '#D4AF37' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

/**
 * LandlordSubscriptionModal — Abonnements & Boosts de Gestion Bailleur
 * Design Professionnel, Épuré & Premium (Mode Clair Chaud + Dark Mode)
 * Mobile-first, identique au TenantSubscriptionModal
 */
export default function LandlordSubscriptionModal({
  isOpen = true,
  user: userProp,
  currentPoints,
  targetProperty = null,
  initialTab = 'plans',
  onClose,
  onRechargeSuccess,
  onSubscribeSuccess,
  onOpenConcierge,
}) {
  const { t } = useTranslation();
  const { user: authUser, refreshUser } = useAuth();
  const user = userProp || authUser;
  const darkCtx = useDarkMode();
  const isDark = !!darkCtx?.dark;

  const [activeTab, setActiveTab] = useState(targetProperty ? 'boosts' : initialTab);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState('serenite');
  const [selectedPack, setSelectedPack] = useState(null);
  const [operator, setOperator] = useState('OM');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || user?.phone || '');
  const [step, setStep] = useState('selection');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [copiedUssd, setCopiedUssd] = useState(false);
  const [lastTxId, setLastTxId] = useState('');

  // Masquer la navigation mobile inférieure et bloquer le scroll d'arrière-plan
  React.useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  if (isOpen === false) return null;

  const pointsDisplay = currentPoints !== undefined
    ? currentPoints
    : (user ? subscriptionService.getLandlordPoints(user.id) : 45);

  const PLANS = [
    {
      id: 'starter',
      name: t('subscriptions.landlord.plan_starter_name', 'Bailleur Essentiel'),
      description: t('subscriptions.landlord.plan_starter_desc', 'Pour les propriétaires débutants avec un seul logement à louer.'),
      monthlyPrice: 0,
      yearlyPrice: 0,
      badge: t('subscriptions.landlord.badge_standard', 'Accès Standard'),
      highlight: false,
      features: [
        '45 points de bienvenue offerts',
        '1 bien en ligne géré',
        'Réception des candidatures locataires',
        'Génération de 2 quittances / mois',
        'Option Gestion Déléguée & Conciergerie Piolo',
      ],
      cta: t('subscriptions.landlord.plan_starter_cta', 'Formule Active'),
    },
    {
      id: 'serenite',
      name: t('subscriptions.landlord.plan_serenite_name', 'Bailleur Sérénité'),
      description: t('subscriptions.landlord.plan_serenite_desc', 'Solution complète pour louer vite, sécuriser vos loyers et automatiser la gestion.'),
      monthlyPrice: 6900,
      yearlyPrice: 59000,
      badge: t('subscriptions.landlord.badge_recommended', 'Recommandé · Rentabilité Max'),
      highlight: true,
      features: [
        "Jusqu'à 10 logements gérés en simultané",
        'Annonces propulsées en tête de résultats',
        'Vérification solvabilité CNI + 3 bulletins locataires',
        'Baux conformes droit OHADA & quittances certifiées',
        'Encaissement automatisé Orange Money & MTN MoMo',
        'Relances automatiques SMS des échéances de loyer',
      ],
      cta: t('subscriptions.landlord.plan_serenite_cta', 'Activer Sérénité'),
    },
    {
      id: 'agency',
      name: t('subscriptions.landlord.plan_agency_name', 'Immeubles & Multi-Propriétaires'),
      description: t('subscriptions.landlord.plan_agency_desc', 'Pour bailleurs multi-immeubles ou gestionnaires immobiliers professionnels.'),
      monthlyPrice: 16900,
      yearlyPrice: 149000,
      badge: t('subscriptions.landlord.badge_portfolios', 'Portefeuilles & Agences'),
      highlight: false,
      features: [
        'Logements & immeubles illimités',
        'Visite 360° offerte pour chaque nouvelle annonce',
        'Comptes multi-accès (comptable, gérant de site)',
        'Accès direct aux juristes & huissiers partenaires',
        'Rapports comptables & fiscaux téléchargeables',
        'Gestionnaire de compte Piolo dédié',
      ],
      cta: t('subscriptions.landlord.plan_agency_cta', 'Choisir Formule Agence'),
    },
  ];

  const BOOST_PACKS = [
    {
      id: 'flash_48h',
      points: 15,
      price: 1500,
      label: t('subscriptions.landlord.boost_flash_name', 'Boost Flash 48 Heures'),
      badge: t('subscriptions.landlord.boost_flash_badge', 'Urgence Relocation'),
      days: 2,
      highlight: false,
      desc: t('subscriptions.landlord.boost_flash_desc', 'Positionné en premier résultat avec badge doré « Coup de Cœur ». Résultats en moins de 24h.'),
      quotas: [
        'Mise en avant immédiate dans les résultats',
        'Badge « Coup de Cœur » pendant 48h',
        'Alerte push WhatsApp aux locataires qualifiés',
      ],
    },
    {
      id: 'vedette_7j',
      points: 40,
      price: 3900,
      label: t('subscriptions.landlord.boost_vedette_name', 'Boost Vedette 7 Jours'),
      badge: t('subscriptions.landlord.boost_vedette_badge', 'Plus Populaire'),
      days: 7,
      highlight: true,
      desc: t('subscriptions.landlord.boost_vedette_desc', 'En tête de liste 7 jours + alerte push / WhatsApp immédiate aux locataires qualifiés.'),
      quotas: [
        'Top résultats pendant 7 jours complets',
        'Notification push directe aux locataires ciblés',
        'Badge Vedette + statistiques de vues en temps réel',
      ],
    },
    {
      id: 'multiboost_30j',
      points: 100,
      price: 9900,
      label: t('subscriptions.landlord.boost_multi_name', 'Pack Multi-Boosts 30 Jours'),
      badge: t('subscriptions.landlord.boost_multi_badge', 'Visibilité Maximale'),
      days: 30,
      highlight: false,
      desc: t('subscriptions.landlord.boost_multi_desc', 'Top ranking permanent 30 jours + mise en avant dans les Reels Découverte 4K Piolo.'),
      quotas: [
        'Classement prioritaire tout le mois',
        'Apparition dans les Reels Découverte Piolo',
        'Rapport de performance mensuel détaillé',
      ],
    },
  ];

  const LANDLORD_CATALOG = [
    { name: 'Boost Flash Annonce (48h)', points: 15, desc: 'Mise en avant immédiate & badge doré' },
    { name: 'Boost Vedette Annonce (7j)', points: 40, desc: 'Top résultats + alertes locataires ciblées' },
    { name: 'Vérification Solvabilité Locataire', points: 15, desc: 'CNI + bulletins de salaire + scoring' },
    { name: 'Génération Bail OHADA Certifié', points: 10, desc: 'Document juridique conforme et signable' },
    { name: 'Quittance de Loyer Officielle', points: 2, desc: 'Reçu horodaté et archivé Piolo' },
    { name: 'Séance Photo 360° Logement', points: 30, desc: 'Reportage professionnel pour annonce premium' },
  ];

  const getPlanPrice = (plan) => {
    if (billingCycle === 'yearly') return plan.yearlyPrice;
    return plan.monthlyPrice;
  };

  const handleStartCheckoutPlan = (plan) => {
    const price = getPlanPrice(plan);
    if (price === 0) return;
    setSelectedPlan(plan.id);
    setSelectedPack(null);
    setStep('checkout');
  };

  const handleStartCheckoutPack = (pack) => {
    setSelectedPack(pack);
    setSelectedPlan(null);
    setStep('checkout');
  };

  const handleCopyUssd = () => {
    const code = operator === 'OM' ? '#150*50#' : '*126#';
    navigator.clipboard.writeText(code);
    setCopiedUssd(true);
    setTimeout(() => setCopiedUssd(false), 2500);
  };

  const openWhatsAppConcierge = () => {
    const planName = selectedPlan ? PLANS.find(p => p.id === selectedPlan)?.name : 'Sérénité';
    const msg = encodeURIComponent(`Bonjour Piolo Conciergerie Bailleur, je suis propriétaire abonné (${planName}) et je souhaite un accompagnement pour la gestion de mes biens.`);
    window.open(`https://wa.me/237658324285?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadReceipt = () => {
    const txNumber = lastTxId || `PIO-B-${Math.floor(100000 + Math.random() * 900000)}`;
    const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const itemTitle = selectedPack
      ? `${selectedPack.label} (+${selectedPack.points} Points Bailleur)`
      : `${PLANS.find(p => p.id === selectedPlan)?.name || 'Bailleur Sérénité'}`;
    const amountStr = `${activePrice?.toLocaleString('fr-FR')} FCFA`;
    const opName = operator === 'OM' ? 'Orange Money Cameroun' : 'MTN Mobile Money';

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reçu Officiel Piolo Bailleur - ${txNumber}</title>
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
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">PIOLO<span>.</span></div>
            <div style="font-size: 12px; color: #6E665B; margin-top: 4px;">Espace Bailleur & Propriétaire — Cameroun</div>
          </div>
          <div style="text-align: right;">
            <span class="badge">PAIEMENT SÉCURISÉ VALIDÉ</span>
            <div style="font-size: 12px; color: #6E665B; margin-top: 8px;">Réf : <strong>${txNumber}</strong></div>
            <div style="font-size: 12px; color: #6E665B;">Date : ${dateStr}</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 25px;">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: #6E665B; font-weight: bold;">Bailleur / Bénéficiaire :</div>
            <div style="font-weight: bold; font-size: 15px; margin-top: 2px;">${user?.first_name || user?.username || 'Bailleur Piolo'} ${user?.last_name || ''}</div>
            <div style="font-size: 13px; color: #5C5449;">Tél : ${phoneNumber || user?.phone || 'Compte Piolo'}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; text-transform: uppercase; color: #6E665B; font-weight: bold;">Mode de Règlement :</div>
            <div style="font-weight: bold; font-size: 14px; margin-top: 2px; color: #1C1917;">${opName}</div>
            <div style="font-size: 13px; color: #2E7D32; font-weight: 600;">✓ Transaction Approuvée</div>
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Désignation de la formule / service</th>
              <th>Quantité</th>
              <th style="text-align: right;">Montant TTC</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${itemTitle}</strong><br><span style="font-size: 12px; color: #6E665B;">Gestion locative, boosts de visibilité & services Piolo Bailleur</span></td>
              <td>1</td>
              <td style="text-align: right; font-weight: bold;">${amountStr}</td>
            </tr>
          </tbody>
        </table>

        <div class="total">Total Réglé : ${amountStr}</div>

        <div class="stamp">
          <strong>Authentification Électronique Piolo SAS</strong><br>
          Ce reçu numérique certifie l'attribution immédiate des droits et points sur la plateforme Piolo. En cas de réclamation, contactez la conciergerie avec la référence <strong>${txNumber}</strong>.
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

  const handlePay = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.replace(/\s+/g, '').length < 9) {
      setError('Veuillez saisir un numéro de téléphone valide à 9 chiffres.');
      return;
    }
    setError('');
    setLoading(true);
    setStep('processing');

    const generatedTxId = `PIO-B-${Math.floor(100000 + Math.random() * 900000)}`;
    setLastTxId(generatedTxId);

    try {
      if (selectedPack) {
        if (targetProperty?.id) {
          // Boost via API backend réelle (déduit les points en base)
          const boostResult = await subscriptionService.applyPropertyBoost(
            targetProperty.id,
            selectedPack.id  // boost_type: flash_48h | vedette_7j | multiboost_30j
          );
          if (boostResult?.ok === false) {
            setError(boostResult.error || 'Erreur lors de l\'activation du boost.');
            setStep('checkout');
            setLoading(false);
            return;
          }
          const newBalance = boostResult?.new_balance;
          const expDate = boostResult?.expires_at
            ? new Date(boostResult.expires_at).toLocaleDateString('fr-FR')
            : '';
          setSuccessMsg(
            `🚀 Boost "${selectedPack.label || selectedPack.name}" activé sur « ${targetProperty.title} » !` +
            (expDate ? ` Expire le ${expDate}.` : '') +
            (newBalance !== undefined ? ` Solde restant : ${newBalance} pts.` : '')
          );
          if (refreshUser) refreshUser().catch(() => {});
          if (onRechargeSuccess) onRechargeSuccess(boostResult?.points_spent || 0, newBalance);
        } else {
          // Achat d'un pack de points de recharge pour le compte bailleur
          const rechargeResult = await subscriptionService.rechargeLandlordPoints({
            points: selectedPack.points,
            payment_method: operator,
            phone_number: phoneNumber,
            pack_label: selectedPack.label
          });

          if (rechargeResult?.ok === false) {
            setError(rechargeResult.detail || 'Erreur lors de la recharge de points.');
            setStep('checkout');
            setLoading(false);
            return;
          }

          const newBalance = rechargeResult?.new_balance !== undefined
            ? rechargeResult.new_balance
            : subscriptionService.addLandlordPoints(user?.id, selectedPack.points);

          subscriptionService.setLandlordPoints(user?.id, newBalance);
          if (refreshUser) refreshUser().catch(() => {});
          setSuccessMsg(
            `🚀 Recharge réussie ! +${selectedPack.points} points crédités avec succès sur votre compte bailleur. Nouveau solde : ${newBalance} pts.`
          );
          if (onRechargeSuccess) onRechargeSuccess(selectedPack.points, newBalance);
        }
        window.dispatchEvent(new CustomEvent('piolo_landlord_points_updated', { detail: { userId: user?.id } }));
      } else {
        const planObj = PLANS.find(p => p.id === selectedPlan);
        subscriptionService.setLandlordPlan(user?.id, { ...planObj, active: true, billingCycle, activatedAt: new Date().toISOString() });
        if (refreshUser) refreshUser().catch(() => {});
        window.dispatchEvent(new CustomEvent('piolo_landlord_plan_updated', { detail: { plan: planObj } }));
        setSuccessMsg(`Félicitations ! Votre abonnement « ${planObj?.name} » est désormais actif. Profitez de tous vos avantages Bailleur Piolo.`);
        if (onSubscribeSuccess) onSubscribeSuccess(planObj);
      }
      setStep('success');
    } catch {
      setError('Une erreur est survenue lors de la communication avec le serveur. Veuillez réessayer.');
      setStep('checkout');
    } finally {
      setLoading(false);
    }
  };

  const activePrice = selectedPlan
    ? getPlanPrice(PLANS.find(p => p.id === selectedPlan) || PLANS[1])
    : selectedPack?.price;

  // ── Palette Chaleureuse & Luxueuse (identique TenantSubscriptionModal) ──
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
    balanceBg: isDark ? 'rgba(255,255,255,0.03)' : '#FDFBF7',
    balanceBorder: isDark ? '1px solid rgba(212,175,55,0.2)' : '1px solid #EAE2D5',
    balanceLabel: isDark ? '#A39C92' : '#786F65',
    balanceValue: isDark ? '#F6D365' : '#B8860B',
    balanceText: isDark ? '#D8D2C7' : '#443F39',
    tabInactiveBg: isDark ? 'rgba(255,255,255,0.02)' : '#F6F2EB',
    tabInactiveBorder: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5DED2',
    tabInactiveColor: isDark ? '#A39C92' : '#6E665B',
    tabActiveBg: isDark ? 'rgba(212,175,55,0.14)' : '#FFF8E7',
    tabActiveBorder: isDark ? '1.5px solid #D4AF37' : '1.5px solid #D4AF37',
    tabActiveColor: isDark ? '#F6D365' : '#9A6700',
    cycleContainerBg: isDark ? 'rgba(255,255,255,0.04)' : '#F4EFE6',
    cycleActiveBg: isDark ? '#D4AF37' : '#1C1917',
    cycleActiveColor: isDark ? '#151310' : '#FFFFFF',
    cycleInactiveColor: isDark ? '#A39C92' : '#6E665B',
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
    inputBg: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
    inputBorder: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #D9CFC1',
    inputColor: isDark ? '#FAF6F0' : '#1C1917',
    summaryBg: isDark ? 'rgba(255,255,255,0.04)' : '#FDFBF7',
    summaryBorder: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #EAE2D5',
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: theme.overlayBg, backdropFilter: 'blur(8px)', zIndex: 50000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', boxSizing: 'border-box' }}
      onClick={onClose}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInModal { from { opacity: 0; transform: scale(0.97) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>

      <div
        style={{ background: theme.modalBg, color: theme.titleColor, borderRadius: 20, width: '100%', maxWidth: 860, maxHeight: '94dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: theme.modalBorder, boxShadow: theme.modalShadow, WebkitOverflowScrolling: 'touch', animation: 'fadeInModal 0.25s ease', fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── HEADER ── */}
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${theme.headerBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme.headerBg, flexShrink: 0, gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: theme.badgeText, background: theme.badgeBg, border: `1px solid ${theme.badgeBorder}`, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase', marginBottom: 4 }}>
              <PremiumCrownIcon size={13} color={isDark ? '#F6D365' : '#D4AF37'} />
              <span>{t('subscriptions.landlord.badge_privileges', 'Espace Bailleur & Propriétaire')}</span>
            </div>
            <h2 style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: 17, fontWeight: 700, color: theme.titleColor, lineHeight: 1.3 }}>
              {t('subscriptions.landlord.title', 'Abonnements Gestion & Boosts de Visibilité')}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: theme.closeBg, color: theme.closeColor, border: '1px solid rgba(0,0,0,0.06)', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, transition: 'background 0.2s', flexShrink: 0 }}
            title={t('common.close', 'Fermer')}
          >
            ✕
          </button>
        </div>

        {/* ── CONTENU ── */}
        <div style={{ padding: '18px 22px', overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}>

          {/* ── STEP: SELECTION ── */}
          {step === 'selection' && (
            <div>
              {/* Solde de points */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme.balanceBg, padding: '14px 18px', borderRadius: 14, border: theme.balanceBorder, marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: theme.balanceLabel, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.4px' }}>
                    {t('subscriptions.landlord.current_balance_label', 'Solde de Points Bailleur')}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: theme.balanceValue, marginTop: 2 }}>
                    {t('subscriptions.landlord.points_available', '{{count}} Points disponibles', { count: pointsDisplay })}
                  </div>
                </div>
                {targetProperty && (
                  <div style={{ background: isDark ? 'rgba(212,175,55,0.12)' : '#FFFDF5', border: '1px solid #D4AF37', borderRadius: 10, padding: '6px 12px', fontSize: 12, color: isDark ? '#F6D365' : '#8A6811', fontWeight: 700 }}>
                    {t('subscriptions.landlord.target_property_banner', 'Boost pour : {{title}}', { title: targetProperty.title })}
                  </div>
                )}
                <div style={{ fontSize: 12, color: theme.balanceText, lineHeight: 1.45 }}>
                  {t('subscriptions.landlord.points_notice', 'Un boost flash utilise 25 points. Avec le Plan Sérénité, vos annonces sont automatiquement propulsées en tête des résultats.')}
                </div>
              </div>

              {/* Bandeau preuve sociale */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: isDark ? 'rgba(212,175,55,0.08)' : '#FFFDF5', border: isDark ? '1px solid rgba(212,175,55,0.2)' : '1px solid #F5E5BE', borderRadius: 10, padding: '9px 14px', marginBottom: 18, fontSize: 11.5, color: isDark ? '#E5E0D5' : '#785A14', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600 }}>
                  <BuildingIcon size={14} color={isDark ? '#F6D365' : '#D4AF37'} />
                  <span>{t('subscriptions.landlord.social_proof', '+312 bailleurs ont loué leur bien en moins de 10 jours à Yaoundé & Douala avec Piolo.')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: isDark ? '#F6D365' : '#9A6700' }}>
                  <ShieldCheckIcon size={14} color={isDark ? '#F6D365' : '#9A6700'} />
                  <span>{t('subscriptions.landlord.social_proof_guarantee', '0 Frais Cachés • Résiliation à tout moment')}</span>
                </div>
              </div>

              {/* Navigation onglets */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                <button
                  type="button"
                  onClick={() => { setActiveTab('plans'); setStep('selection'); }}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 10,
                    border: activeTab === 'plans' ? theme.tabActiveBorder : theme.tabInactiveBorder,
                    background: activeTab === 'plans' ? theme.tabActiveBg : theme.tabInactiveBg,
                    color: activeTab === 'plans' ? theme.tabActiveColor : theme.tabInactiveColor,
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {t('subscriptions.landlord.tab_plans', 'Formules Gestion')}
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('boosts'); setStep('selection'); }}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 10,
                    border: activeTab === 'boosts' ? theme.tabActiveBorder : theme.tabInactiveBorder,
                    background: activeTab === 'boosts' ? theme.tabActiveBg : theme.tabInactiveBg,
                    color: activeTab === 'boosts' ? theme.tabActiveColor : theme.tabInactiveColor,
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {t('subscriptions.landlord.tab_boosts', 'Boosts d\'Annonces')}
                </button>
              </div>

              {/* ── TAB: PLANS D'ABONNEMENT ── */}
              {activeTab === 'plans' && (
                <div>
                  {/* Bascule Mensuel / Annuel */}
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 20, background: theme.cycleContainerBg, padding: '5px', borderRadius: 12, maxWidth: 320, marginInline: 'auto' }}>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('monthly')}
                      style={{ flex: 1, padding: '7px 10px', borderRadius: 8, border: 'none', background: billingCycle === 'monthly' ? theme.cycleActiveBg : 'transparent', color: billingCycle === 'monthly' ? theme.cycleActiveColor : theme.cycleInactiveColor, fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      {t('subscriptions.landlord.cycle_monthly', 'Mensuel')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('yearly')}
                      style={{ flex: 1, padding: '7px 10px', borderRadius: 8, border: 'none', background: billingCycle === 'yearly' ? theme.cycleActiveBg : 'transparent', color: billingCycle === 'yearly' ? theme.cycleActiveColor : theme.cycleInactiveColor, fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}
                    >
                      {t('subscriptions.landlord.cycle_yearly', 'Annuel')}
                      <span style={{ background: '#10B981', color: '#FFF', fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 4 }}>-20%</span>
                    </button>
                  </div>

                  {/* Grille des plans */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                    {PLANS.map(plan => {
                      const price = getPlanPrice(plan);
                      return (
                        <div
                          key={plan.id}
                          style={{
                            borderRadius: 16,
                            padding: '22px 18px',
                            border: plan.highlight ? theme.cardVipBorder : theme.cardStandardBorder,
                            background: plan.highlight ? theme.cardVipBg : theme.cardStandardBg,
                            boxShadow: plan.highlight ? theme.cardVipShadow : 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                          }}
                        >
                          {plan.badge && (
                            <div style={{ position: 'absolute', top: -10, left: 18, background: plan.highlight ? '#D4AF37' : (isDark ? 'rgba(255,255,255,0.14)' : '#EBE4D8'), color: plan.highlight ? '#0F0D09' : (isDark ? '#FFF' : '#5C5449'), fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 10, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                              {plan.badge}
                            </div>
                          )}

                          <div style={{ fontSize: 16, fontWeight: 700, color: theme.cardTitle, marginTop: 4 }}>{plan.name}</div>
                          <div style={{ fontSize: 11.5, color: theme.cardDesc, marginTop: 4, minHeight: 34 }}>{plan.description}</div>

                          <div style={{ margin: '12px 0 14px' }}>
                            <span style={{ fontSize: 22, fontWeight: 800, color: plan.highlight ? theme.cardPriceVip : theme.cardPriceNormal }}>
                              {price === 0 ? '0 FCFA' : `${price.toLocaleString('fr-FR')} FCFA`}
                            </span>
                            {price > 0 && (
                              <span style={{ fontSize: 11.5, color: theme.cardDesc, marginLeft: 4 }}>
                                {billingCycle === 'yearly' ? t('subscriptions.landlord.per_year', '/ an') : t('subscriptions.landlord.per_month', '/ mois')}
                              </span>
                            )}
                          </div>

                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                            {plan.features.map((feat, fi) => (
                              <div key={fi} style={{ fontSize: 12, color: theme.cardFeatures, display: 'flex', alignItems: 'flex-start', gap: 7, lineHeight: 1.4 }}>
                                <span style={{ color: '#D4AF37', fontWeight: 800 }}>✓</span>
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleStartCheckoutPlan(plan)}
                            disabled={price === 0}
                            style={{
                              width: '100%',
                              padding: '11px',
                              borderRadius: 10,
                              border: plan.highlight ? 'none' : (isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #D9CFC1'),
                              background: plan.highlight ? 'linear-gradient(135deg, #D4AF37 0%, #B8962A 100%)' : (price === 0 ? (isDark ? 'rgba(255,255,255,0.05)' : '#F6F2EB') : (isDark ? 'rgba(255,255,255,0.1)' : '#EBE4D8')),
                              color: plan.highlight ? '#0F0D09' : (price === 0 ? '#A39C92' : (isDark ? '#FFFFFF' : '#1C1917')),
                              fontFamily: 'Poppins, sans-serif',
                              fontWeight: 700,
                              fontSize: 12.5,
                              cursor: price === 0 ? 'default' : 'pointer',
                              transition: 'transform 0.15s ease',
                            }}
                          >
                            {plan.cta}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Lien vers gestion déléguée */}
                  {onOpenConcierge && (
                    <div style={{ marginTop: 18, padding: '12px 16px', borderRadius: 12, background: isDark ? 'rgba(212,175,55,0.08)' : '#FFF8E7', border: isDark ? '1px solid rgba(212,175,55,0.2)' : '1px solid #F5E5BE', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ fontSize: 12, color: isDark ? '#F6D365' : '#785A14' }}>
                        <strong>Zéro contrainte :</strong> Déléguez la totalité de la gestion locative à Piolo Conciergerie.
                      </div>
                      <button
                        type="button"
                        onClick={() => { onClose(); if (onOpenConcierge) onOpenConcierge(); }}
                        style={{ background: '#D4AF37', color: '#0F0D09', border: 'none', padding: '7px 16px', borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif', whiteSpace: 'nowrap' }}
                      >
                        Gestion Déléguée →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB: BOOSTS D'ANNONCES ── */}
              {activeTab === 'boosts' && (
                <div>
                  {/* Grille des boosts */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
                    {BOOST_PACKS.map((pack, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: pack.highlight ? theme.cardVipBg : theme.cardStandardBg,
                          borderRadius: 16,
                          padding: '22px 18px',
                          border: pack.highlight ? theme.cardVipBorder : theme.cardStandardBorder,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: pack.highlight ? theme.cardVipShadow : 'none',
                          position: 'relative',
                        }}
                      >
                        {pack.badge && (
                          <div style={{ position: 'absolute', top: -10, left: 18, background: pack.highlight ? '#D4AF37' : (isDark ? 'rgba(255,255,255,0.14)' : '#EBE4D8'), color: pack.highlight ? '#0F0D09' : (isDark ? '#FFF' : '#5C5449'), fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 10, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                            {pack.badge}
                          </div>
                        )}

                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                            <ZapIcon size={11} color="#D4AF37" />
                            {pack.label}
                          </div>
                          <div style={{ fontSize: 24, fontWeight: 800, color: theme.cardTitle, margin: '4px 0 2px' }}>+{pack.points} Points</div>
                          <p style={{ fontSize: 11.5, color: theme.cardDesc, margin: '0 0 12px', lineHeight: 1.4 }}>{pack.desc}</p>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F0EBE1'}`, paddingTop: 10 }}>
                            {pack.quotas.map((q, qi) => (
                              <div key={qi} style={{ fontSize: 11.5, color: theme.cardFeatures, display: 'flex', alignItems: 'flex-start', gap: 6, lineHeight: 1.35 }}>
                                <span style={{ color: '#D4AF37', fontWeight: 800 }}>✓</span>
                                <span>{q}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: 17, fontWeight: 800, color: theme.cardPriceVip, marginBottom: 10 }}>{pack.price.toLocaleString('fr-FR')} FCFA</div>
                          <button
                            type="button"
                            onClick={() => handleStartCheckoutPack(pack)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              borderRadius: 8,
                              border: 'none',
                              background: pack.highlight ? 'linear-gradient(135deg, #D4AF37 0%, #B8962A 100%)' : (isDark ? 'rgba(255,255,255,0.1)' : '#EBE4D8'),
                              color: pack.highlight ? '#0F0D09' : (isDark ? '#FFFFFF' : '#1C1917'),
                              fontFamily: 'Poppins, sans-serif',
                              fontWeight: 700,
                              fontSize: 12,
                              cursor: 'pointer',
                            }}
                          >
                            {t('subscriptions.landlord.activate_boost_btn', 'Activer ce Boost')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Barème des services */}
                  <div style={{ background: theme.balanceBg, border: theme.balanceBorder, borderRadius: 14, padding: '16px 20px', marginTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.titleColor, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <InfoIcon size={15} color={isDark ? '#F6D365' : '#D4AF37'} />
                        <span>{t('subscriptions.landlord.rates_title', 'Barème des Services Bailleur Piolo')}</span>
                      </div>
                      <div style={{ fontSize: 11, color: isDark ? '#F6D365' : '#9A6700', fontWeight: 700 }}>
                        {t('subscriptions.landlord.rates_serenite_included', 'Plan Sérénité = Boosts inclus automatiquement')}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                      {LANDLORD_CATALOG.map((item, ci) => (
                        <div key={ci} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF', padding: '9px 12px', borderRadius: 8, border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#EFE9DF'}` }}>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: theme.titleColor }}>{item.name}</div>
                            <div style={{ fontSize: 10, color: theme.cardDesc }}>{item.desc}</div>
                          </div>
                          <div style={{ fontSize: 12.5, fontWeight: 800, color: theme.cardPriceVip, paddingLeft: 8, whiteSpace: 'nowrap' }}>
                            {item.points} pts
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* CTA vers plan Sérénité */}
                    <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: isDark ? 'rgba(212,175,55,0.1)' : '#FFF8E7', border: isDark ? '1px solid rgba(212,175,55,0.25)' : '1px solid #F5E5BE', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ fontSize: 11.5, color: isDark ? '#F6D365' : '#785A14' }}>
                        <strong>{t('subscriptions.landlord.tip_title', 'Astuce Rentabilité :')}</strong> {t('subscriptions.landlord.tip_desc', 'Le Plan Sérénité inclut les boosts automatiques et rentabilise dès le premier locataire signé.')}
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('plans')}
                        style={{ background: '#D4AF37', color: '#0F0D09', border: 'none', padding: '6px 14px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
                      >
                        {t('subscriptions.landlord.view_serenite_plan', 'Voir les Formules')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP: CHECKOUT ── */}
          {step === 'checkout' && (
            <div style={{ maxWidth: 460, margin: '0 auto' }}>
              <button
                type="button"
                onClick={() => setStep('selection')}
                style={{ background: 'none', border: 'none', fontSize: 12, fontWeight: 700, color: isDark ? '#F6D365' : '#9A6700', cursor: 'pointer', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                {t('subscriptions.tenant.back_to_offers', '← Retour aux offres')}
              </button>

              <form onSubmit={handlePay}>
                <h3 style={{ margin: '0 0 4px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 17, color: theme.titleColor }}>
                  {t('subscriptions.tenant.secure_payment_title', 'Paiement Mobile Money Sécurisé')}
                </h3>
                <p style={{ fontSize: 12, color: theme.cardDesc, margin: '0 0 16px' }}>
                  {t('subscriptions.tenant.selection_label', 'Sélection :')} <strong>{selectedPack ? `${selectedPack.label} (+${selectedPack.points} Points Bailleur)` : `${PLANS.find(p => p.id === selectedPlan)?.name} (${billingCycle === 'yearly' ? '1 an' : '30 jours'})`}</strong>
                </p>

                {/* Récap montant */}
                <div style={{ background: theme.summaryBg, padding: '14px 18px', borderRadius: 12, border: theme.summaryBorder, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: theme.titleColor }}>
                    <span>{t('subscriptions.tenant.total_ttc', 'Montant total TTC :')}</span>
                    <span style={{ color: theme.cardPriceVip, fontSize: 16 }}>{activePrice?.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div style={{ fontSize: 11, color: theme.cardDesc, marginTop: 4 }}>
                    {t('subscriptions.tenant.no_hidden_fees', '0 frais cachés • Activation immédiate sur votre compte')}
                  </div>
                </div>

                {/* Choix opérateur */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: theme.cardDesc, marginBottom: 8 }}>
                    {t('subscriptions.tenant.momo_operator_label', 'Opérateur Mobile Money (Cameroun)')}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setOperator('OM')}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 12,
                        border: operator === 'OM' ? '2px solid #FF7900' : (isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #D9CFC1'),
                        background: operator === 'OM' ? (isDark ? 'rgba(255,121,0,0.15)' : '#FFF6ED') : (isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF'),
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <OrangeMoneyLogo size={32} />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: operator === 'OM' ? '#EA580C' : theme.titleColor }}>Orange Money</div>
                        <div style={{ fontSize: 10, color: theme.cardDesc }}>Cameroun (#150#)</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOperator('MOMO')}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 12,
                        border: operator === 'MOMO' ? '2px solid #EAB308' : (isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #D9CFC1'),
                        background: operator === 'MOMO' ? (isDark ? 'rgba(255,204,0,0.15)' : '#FEFCE8') : (isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF'),
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <MtnMomoLogo size={32} />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: operator === 'MOMO' ? '#CA8A04' : theme.titleColor }}>MTN MoMo</div>
                        <div style={{ fontSize: 10, color: theme.cardDesc }}>Cameroun (*126#)</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Numéro de téléphone */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: theme.cardFeatures, marginBottom: 6 }}>
                    {t('subscriptions.tenant.account_num_label', 'Numéro de compte')} {operator === 'OM' ? 'Orange Money' : 'MTN Mobile Money'}
                  </label>
                  <input
                    type="tel"
                    placeholder={t('subscriptions.tenant.phone_placeholder', 'Ex: 699 00 11 22 ou 677 00 11 22')}
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: theme.inputBorder, background: theme.inputBg, color: theme.inputColor, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                    required
                  />
                </div>

                {/* Instructions USSD */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: theme.summaryBg, border: theme.summaryBorder, borderRadius: 10, padding: '8px 12px', marginBottom: 16, fontSize: 11 }}>
                  <div style={{ color: theme.cardDesc }}>
                    {t('subscriptions.tenant.direct_ussd_code', 'Code direct opérateur :')} <strong>{operator === 'OM' ? '#150*50#' : '*126#'}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUssd}
                    style={{ background: 'none', border: 'none', color: isDark ? '#F6D365' : '#9A6700', fontWeight: 700, fontSize: 11, cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  >
                    <CopyIcon size={12} color={isDark ? '#F6D365' : '#9A6700'} />
                    <span>{copiedUssd ? t('subscriptions.tenant.code_copied', 'Code Copié !') : t('subscriptions.tenant.copy_code', 'Copier le code')}</span>
                  </button>
                </div>

                {error && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', padding: '9px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 600, marginBottom: 14 }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #D4AF37 0%, #B8962A 100%)',
                    color: '#0F0D09',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 700,
                    fontSize: 13.5,
                    cursor: loading ? 'wait' : 'pointer',
                    boxShadow: '0 4px 16px rgba(212,175,55,0.3)',
                  }}
                >
                  {loading ? '...' : t('subscriptions.tenant.pay_btn', 'Valider et Payer {{amount}} FCFA', { amount: activePrice?.toLocaleString('fr-FR') })}
                </button>
              </form>
            </div>
          )}

          {/* ── STEP: PROCESSING ── */}
          {step === 'processing' && (
            <div style={{ textAlign: 'center', padding: '36px 10px', maxWidth: 440, margin: '0 auto' }}>
              <div style={{ width: 44, height: 44, border: '3px solid rgba(212,175,55,0.2)', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
              <h4 style={{ margin: '0 0 6px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 16, color: theme.titleColor }}>
                {t('subscriptions.tenant.processing_title', 'Validation du Paiement...')}
              </h4>
              <p style={{ fontSize: 12.5, color: theme.cardDesc, margin: '0 0 18px', lineHeight: 1.5 }}>
                {t('subscriptions.tenant.processing_sub', 'Veuillez confirmer l\'invite USSD sur votre téléphone ({{phone}}).', { phone: phoneNumber })}
              </p>

              <div style={{ background: theme.summaryBg, border: theme.summaryBorder, borderRadius: 12, padding: '12px 14px', fontSize: 11.5, color: theme.cardFeatures, textAlign: 'left', lineHeight: 1.5 }}>
                <div style={{ fontWeight: 700, marginBottom: 6, color: theme.titleColor, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <InfoIcon size={14} color={isDark ? '#F6D365' : '#9A6700'} />
                  <span>{t('subscriptions.tenant.if_no_prompt', 'Si le message ne s\'affiche pas automatiquement :')}</span>
                </div>
                <div>{t('subscriptions.tenant.prompt_step_1', '1. Composez {{code}} sur votre téléphone.', { code: operator === 'OM' ? '#150*50#' : '*126#' })}</div>
                <div>{t('subscriptions.tenant.prompt_step_2', '2. Entrez votre code secret Orange Money / MTN MoMo.')}</div>
                <div>{t('subscriptions.tenant.prompt_step_3', '3. La validation est synchronisée en temps réel.')}</div>
              </div>
            </div>
          )}

          {/* ── STEP: SUCCESS ── */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '24px 10px', maxWidth: 480, margin: '0 auto' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(46,204,113,0.15)', color: '#2ECC71', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 24, border: '1px solid rgba(46,204,113,0.3)' }}>
                ✓
              </div>
              <h3 style={{ margin: '0 0 6px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 18, color: theme.titleColor }}>
                {t('subscriptions.tenant.success_title', 'Paiement Validé & Avantages Activés')}
              </h3>
              <p style={{ fontSize: 12.5, color: theme.cardFeatures, lineHeight: 1.5, margin: '0 0 20px' }}>
                {successMsg}
              </p>

              {/* Actions : Reçu PDF & Conciergerie WhatsApp */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  style={{
                    padding: '11px',
                    borderRadius: 10,
                    border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #D9CFC1',
                    background: theme.summaryBg,
                    color: theme.titleColor,
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 7,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <DownloadDocIcon size={15} color={isDark ? '#F6D365' : '#9A6700'} />
                  <span>{t('subscriptions.tenant.download_receipt', 'Télécharger Reçu PDF')}</span>
                </button>

                <button
                  type="button"
                  onClick={openWhatsAppConcierge}
                  style={{
                    padding: '11px',
                    borderRadius: 10,
                    border: '1px solid #25D366',
                    background: 'rgba(37,211,102,0.12)',
                    color: '#25D366',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 7,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <WhatsAppIcon size={15} />
                  <span>{t('subscriptions.tenant.vip_concierge', 'Conciergerie Bailleur')}</span>
                </button>
              </div>

              <button
                onClick={onClose}
                style={{ width: '100%', background: '#D4AF37', color: '#0F0D09', border: 'none', padding: '12px 24px', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 14px rgba(212,175,55,0.25)' }}
              >
                {t('subscriptions.landlord.go_to_space', 'Accéder à mon Espace Bailleur')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
