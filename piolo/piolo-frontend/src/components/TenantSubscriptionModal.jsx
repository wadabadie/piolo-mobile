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

const WhatsAppIcon = ({ size = 16, color = '#25D366' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.49 0-2.94-.4-4.21-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.203 8.203 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.21 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.75.59.26 1.05.41 1.41.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.12-.22-.19-.46-.31z" />
  </svg>
);

/**
 * Modal d'Abonnement et Recharges de Points pour Locataires Piolo
 * Design Professionnel, Épuré & Premium (Mode Clair Chaud par défaut + Dark Mode Chaleureux)
 */
export default function TenantSubscriptionModal({ isOpen = true, currentPoints, onClose, onRechargeSuccess, onSubscribeSuccess }) {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const darkCtx = useDarkMode();
  const isDark = !!darkCtx?.dark;

  const [activeTab, setActiveTab] = useState('passes'); // 'passes' | 'points'
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'weekly' | 'monthly' | 'yearly'
  const [selectedPlan, setSelectedPlan] = useState('vip'); // 'starter' | 'vip' | 'expat'
  const [selectedPack, setSelectedPack] = useState(null); // { points: 40, price: 3500 }
  const [operator, setOperator] = useState('OM'); // 'OM' | 'MOMO'
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [step, setStep] = useState('selection'); // 'selection' | 'checkout' | 'processing' | 'success'
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
    : (user ? subscriptionService.getTenantPoints(user.id) : 20);

  const PLANS = [
    {
      id: 'starter',
      name: t('subscriptions.tenant.plan_starter_name', 'Recherche Standard'),
      description: t('subscriptions.tenant.plan_starter_desc', 'Pour explorer les annonces publiques à votre rythme.'),
      weeklyPrice: 0,
      monthlyPrice: 0,
      yearlyPrice: 0,
      badge: t('subscriptions.tenant.badge_free', 'Gratuit'),
      highlight: false,
      features: [
        '20 points de bienvenue offerts',
        '2 demandes de visites / mois incluses',
        'Accès illimité aux annonces publiques',
        'Dossier de candidature standard',
      ],
      cta: t('subscriptions.tenant.plan_starter_cta', 'Formule Active'),
    },
    {
      id: 'vip',
      name: t('subscriptions.tenant.plan_vip_name', 'Pass Recherche VIP'),
      description: t('subscriptions.tenant.plan_vip_desc', 'Priorité absolue sur les logements avant tout le monde.'),
      weeklyPrice: 1500,
      monthlyPrice: 4900,
      yearlyPrice: 39000,
      badge: t('subscriptions.tenant.badge_recommended', 'Recommandé'),
      highlight: true,
      features: [
        'Accès Anticipé 48h aux nouvelles annonces',
        'Demandes de visites illimitées (0 point déduit)',
        'Candidature en tête de liste auprès des bailleurs',
        'Badge officiel « Locataire VIP & Solvable »',
        'Alertes instantanées WhatsApp par quartier',
        'Modèles de contrats de bail certifiés conformes',
      ],
      cta: t('subscriptions.tenant.plan_vip_cta', 'Activer le Pass VIP'),
    },
    {
      id: 'expat',
      name: t('subscriptions.tenant.plan_expat_name', 'Relocation & Diaspora'),
      description: t('subscriptions.tenant.plan_expat_desc', 'Accompagnement complet à distance et sur place.'),
      weeklyPrice: 0,
      monthlyPrice: 14900,
      yearlyPrice: 129000,
      badge: t('subscriptions.tenant.badge_dedicated', 'Accompagnement Dédié'),
      highlight: false,
      features: [
        'Tous les avantages du Pass VIP inclus',
        'Chasseur immobilier dédié sur place (Yaoundé / Douala)',
        'Visites guidées en direct vidéo WhatsApp',
        'Séquestre caution 0% frais (Piolo Protec)',
        'Assistance juridique & remise des clés sécurisée',
      ],
      cta: t('subscriptions.tenant.plan_expat_cta', 'Choisir Relocation'),
    },
  ];

  const POINT_PACKS = [
    {
      points: 15,
      price: 1500,
      label: t('subscriptions.tenant.pack_starter_label', 'Pack Découverte'),
      badge: t('subscriptions.tenant.pack_starter_badge', 'Démarrage'),
      desc: t('subscriptions.tenant.pack_starter_desc', 'Idéal pour débloquer les premières coordonnées et tester.'),
      quotas: [
        '1 Contact direct & WhatsApp Bailleur (8 pts)',
        '1 Itinéraire GPS & position logement (4 pts)',
        '1 Contact Artisan ou 3 Demandes de visites',
      ],
      highlight: false,
    },
    {
      points: 40,
      price: 3500,
      label: t('subscriptions.tenant.pack_active_label', 'Pack Recherche Active'),
      badge: t('subscriptions.tenant.pack_active_badge', 'Recommandé'),
      desc: t('subscriptions.tenant.pack_active_desc', 'Le pack équilibré pour trouver un logement rapidement sans intermédiaire.'),
      quotas: [
        'Jusqu’à 5 Contacts Bailleurs directs (40 pts)',
        'OU 3 Bailleurs + 2 Itinéraires GPS + 2 Devis',
        'Demandes de visites & candidatures incluses',
      ],
      highlight: true,
    },
    {
      points: 120,
      price: 7500,
      label: t('subscriptions.tenant.pack_serenity_label', 'Pack Sérénité & Habitat'),
      badge: t('subscriptions.tenant.pack_serenity_badge', 'Meilleure Valeur'),
      desc: t('subscriptions.tenant.pack_serenity_desc', 'Recherche exhaustive + mise en relation artisans, architectes & devis travaux.'),
      quotas: [
        'Jusqu’à 15 Contacts Bailleurs directs vérifiés',
        'Itinéraires GPS logements & ateliers illimités',
        'Demandes de devis travaux & artisans illimitées',
      ],
      highlight: false,
    },
  ];

  const POINT_COST_CATALOG = [
    { name: 'Contact Direct & WhatsApp Bailleur', points: 8, desc: 'Numéro certifié sans intermédiaire' },
    { name: 'Dossier de Candidature Prioritaire', points: 6, desc: 'Placé en tête de liste auprès du bailleur' },
    { name: 'Demande de Visite Physique', points: 5, desc: 'Créneau réservé et confirmé' },
    { name: 'Itinéraire & Position GPS Logement', points: 4, desc: 'Guidage précis Google Maps / Waze' },
    { name: 'Demande de Devis Chiffré Artisan', points: 4, desc: 'Cahier des charges travaux / aménagement' },
    { name: 'Contact Artisan / Architecte Certifié', points: 3, desc: 'Coordonnées directes d’un pro vérifié' },
    { name: 'Itinéraire Atelier / Bureau Pro', points: 2, desc: 'Localisation de l’atelier de l’artisan' },
  ];

  const getPlanPrice = (plan) => {
    if (billingCycle === 'weekly') return plan.weeklyPrice;
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
    const planName = selectedPlan ? PLANS.find(p => p.id === selectedPlan)?.name : 'Pass VIP';
    const msg = encodeURIComponent(`Bonjour Piolo Conciergerie, je suis membre abonné (${planName}) et je souhaite un accompagnement prioritaire pour ma recherche de logement.`);
    window.open(`https://wa.me/237658324285?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadReceipt = () => {
    const txNumber = lastTxId || `PIO-${Math.floor(100000 + Math.random() * 900000)}`;
    const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const itemTitle = selectedPack ? `${selectedPack.label} (+${selectedPack.points} Points)` : `${PLANS.find(p => p.id === selectedPlan)?.name || 'Pass VIP'}`;
    const amountStr = `${activePrice?.toLocaleString('fr-FR')} FCFA`;
    const opName = operator === 'OM' ? 'Orange Money Cameroun' : 'MTN Mobile Money';

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reçu Officiel Piolo - ${txNumber}</title>
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
            <div style="font-size: 12px; color: #6E665B; margin-top: 4px;">Plateforme Immobilière Certifiée Cameroun</div>
          </div>
          <div style="text-align: right;">
            <span class="badge">PAIEMENT SÉCURISÉ VALIDÉ</span>
            <div style="font-size: 12px; color: #6E665B; margin-top: 8px;">Réf : <strong>${txNumber}</strong></div>
            <div style="font-size: 12px; color: #6E665B;">Date : ${dateStr}</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 25px;">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: #6E665B; font-weight: bold;">Client / Bénéficiaire :</div>
            <div style="font-weight: bold; font-size: 15px; margin-top: 2px;">${user?.first_name || user?.username || 'Locataire Piolo'} ${user?.last_name || ''}</div>
            <div style="font-size: 13px; color: #5C5449;">Téléphone : ${phoneNumber || user?.phone || 'Compte Piolo'}</div>
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
              <td><strong>${itemTitle}</strong><br><span style="font-size: 12px; color: #6E665B;">Accès direct annonces, visites prioritaires & avantages certifiés</span></td>
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
      setTimeout(() => {
        printWin.print();
      }, 300);
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

    const generatedTxId = `PIO-${Math.floor(100000 + Math.random() * 900000)}`;
    setLastTxId(generatedTxId);

    try {
      if (selectedPack) {
        const res = await subscriptionService.rechargeTenantPoints({
          points: selectedPack.points,
          payment_method: operator,
          phone_number: phoneNumber,
        });

        const newPts = res?.new_balance ?? subscriptionService.addTenantPoints(user?.id, selectedPack.points);
        if (refreshUser) refreshUser().catch(() => {});
        setSuccessMsg(`Félicitations ! +${selectedPack.points} points ont été crédités sur votre compte locataire (Nouveau solde : ${newPts} pts).`);
        if (onRechargeSuccess) onRechargeSuccess(selectedPack.points);
      } else {
        const planObj = PLANS.find((p) => p.id === selectedPlan);
        const res = await subscriptionService.subscribeTenantPlan({
          plan_type: selectedPlan,
          billing_cycle: billingCycle,
          payment_method: operator,
          phone_number: phoneNumber,
        });

        const planData = {
          id: selectedPlan,
          name: planObj?.name || 'Pass VIP',
          billingCycle,
          expires_at: res?.subscription?.expires_at,
          days_remaining: res?.subscription?.days_remaining || (billingCycle === 'yearly' ? 365 : (billingCycle === 'weekly' ? 7 : 30)),
        };

        subscriptionService.setTenantPlan(user?.id, planData);
        if (refreshUser) refreshUser().catch(() => {});
        setSuccessMsg(`Votre ${planObj?.name} est désormais actif ! Vous bénéficiez immédiatement de vos visites gratuites et de vos alertes prioritaires.`);
        if (onSubscribeSuccess) onSubscribeSuccess(planData);
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
    ? getPlanPrice(PLANS.find((p) => p.id === selectedPlan) || PLANS[1])
    : selectedPack?.price;

  // Palette Chaleureuse & Luxueuse (Sans reflet bleu froid)
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
      style={{ position: 'fixed', inset: 0, background: theme.overlayBg, backdropFilter: 'blur(8px)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}
      onClick={onClose}
    >
      <div 
        style={{ background: theme.modalBg, color: theme.titleColor, borderRadius: 20, width: '100%', maxWidth: 860, maxHeight: '94dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: theme.modalBorder, boxShadow: theme.modalShadow, WebkitOverflowScrolling: 'touch' }}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* HEADER */}
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${theme.headerBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme.headerBg, flexShrink: 0 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: theme.badgeText, background: theme.badgeBg, border: `1px solid ${theme.badgeBorder}`, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase', marginBottom: 4 }}>
              <PremiumCrownIcon size={14} color={isDark ? '#F6D365' : '#D4AF37'} />
              <span>{t('subscriptions.tenant.badge_privileges', 'Privilèges & Accompagnement Locataire')}</span>
            </div>
            <h2 style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 700, color: theme.titleColor }}>
              {t('subscriptions.tenant.title', 'Pass Recherche VIP & Recharge de Points')}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: theme.closeBg, color: theme.closeColor, border: '1px solid rgba(0,0,0,0.06)', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, transition: 'background 0.2s', flexShrink: 0 }}
            title={t('common.close', 'Fermer')}
          >
            ✕
          </button>
        </div>

        {/* CONTENU */}
        <div style={{ padding: '18px 22px', overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}>
          {step === 'selection' && (
            <div>
              {/* Solde de points & Statut */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme.balanceBg, padding: '14px 18px', borderRadius: 14, border: theme.balanceBorder, marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: theme.balanceLabel, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.4px' }}>
                    {t('subscriptions.tenant.current_balance_label', 'Solde de Points Actuel')}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: theme.balanceValue, marginTop: 2 }}>
                    {t('subscriptions.tenant.points_available', '{{count}} Points disponibles', { count: pointsDisplay })}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: theme.balanceText, maxWidth: 440, lineHeight: 1.45 }}>
                  {t('subscriptions.tenant.points_notice', 'Une visite physique utilise 5 points. Avec le Pass Recherche VIP, toutes vos demandes de visites sont 100% gratuites et illimitées.')}
                </div>
              </div>

              {/* BANDEAU DE RASSURANCE & PREUVE SOCIALE AVEC VRAIS SVG */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: isDark ? 'rgba(212,175,55,0.08)' : '#FFFDF5', border: isDark ? '1px solid rgba(212,175,55,0.2)' : '1px solid #F5E5BE', borderRadius: 10, padding: '9px 14px', marginBottom: 18, fontSize: 11.5, color: isDark ? '#E5E0D5' : '#785A14', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600 }}>
                  <PremiumCrownIcon size={14} color={isDark ? '#F6D365' : '#D4AF37'} />
                  <span>{t('subscriptions.tenant.social_proof', '+487 locataires ont trouvé leur logement en moins de 7 jours à Yaoundé & Douala.')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: isDark ? '#F6D365' : '#9A6700' }}>
                  <ShieldCheckIcon size={14} color={isDark ? '#F6D365' : '#9A6700'} />
                  <span>{t('subscriptions.tenant.social_proof_guarantee', '0 Frais Cachés • Satisfait ou +7j offerts')}</span>
                </div>
              </div>

              {/* NAVIGATION ONGLETS : PASS VIP VS POINTS À LA CARTE */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('passes')}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 10,
                    border: activeTab === 'passes' ? theme.tabActiveBorder : theme.tabInactiveBorder,
                    background: activeTab === 'passes' ? theme.tabActiveBg : theme.tabInactiveBg,
                    color: activeTab === 'passes' ? theme.tabActiveColor : theme.tabInactiveColor,
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {t('subscriptions.tenant.tab_passes', 'Formules & Pass Recherche')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('points')}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 10,
                    border: activeTab === 'points' ? theme.tabActiveBorder : theme.tabInactiveBorder,
                    background: activeTab === 'points' ? theme.tabActiveBg : theme.tabInactiveBg,
                    color: activeTab === 'points' ? theme.tabActiveColor : theme.tabInactiveColor,
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {t('subscriptions.tenant.tab_points', 'Packs de Points à la Carte')}
                </button>
              </div>

              {activeTab === 'passes' && (
                <div>
                  {/* BASCULE DE CYCLE : SEMAINE / MOIS / AN */}
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 20, background: theme.cycleContainerBg, padding: '5px', borderRadius: 12, maxWidth: 380, marginInline: 'auto' }}>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('weekly')}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        borderRadius: 8,
                        border: 'none',
                        background: billingCycle === 'weekly' ? theme.cycleActiveBg : 'transparent',
                        color: billingCycle === 'weekly' ? theme.cycleActiveColor : theme.cycleInactiveColor,
                        fontWeight: 700,
                        fontSize: 11.5,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {t('subscriptions.tenant.cycle_weekly', '7 Jours (Flash)')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('monthly')}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        borderRadius: 8,
                        border: 'none',
                        background: billingCycle === 'monthly' ? theme.cycleActiveBg : 'transparent',
                        color: billingCycle === 'monthly' ? theme.cycleActiveColor : theme.cycleInactiveColor,
                        fontWeight: 700,
                        fontSize: 11.5,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {t('subscriptions.tenant.cycle_monthly', '1 Mois (Optimal)')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('yearly')}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        borderRadius: 8,
                        border: 'none',
                        background: billingCycle === 'yearly' ? theme.cycleActiveBg : 'transparent',
                        color: billingCycle === 'yearly' ? theme.cycleActiveColor : theme.cycleInactiveColor,
                        fontWeight: 700,
                        fontSize: 11.5,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {t('subscriptions.tenant.cycle_yearly', '1 An (-20%)')}
                    </button>
                  </div>

                  {/* GRILLE DES 3 PLANS */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                    {PLANS.map((plan) => {
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
                                {billingCycle === 'weekly' ? t('subscriptions.tenant.per_week', '/ semaine') : (billingCycle === 'yearly' ? t('subscriptions.tenant.per_year', '/ an') : t('subscriptions.tenant.per_month', '/ mois'))}
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
                </div>
              )}

              {activeTab === 'points' && (
                <div>
                  {/* GRILLE DES PACKS DE POINTS */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
                    {POINT_PACKS.map((pack, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleStartCheckoutPack(pack)}
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
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: 4 }}>{pack.label}</div>
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
                            {t('subscriptions.tenant.recharge_btn', 'Recharger {{count}} Points', { count: pack.points })}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* BARÈME D'UTILISATION DES POINTS & CONSEIL VIP */}
                  <div style={{ background: theme.balanceBg, border: theme.balanceBorder, borderRadius: 14, padding: '16px 20px', marginTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.titleColor, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <InfoIcon size={15} color={isDark ? '#F6D365' : '#D4AF37'} />
                        <span>{t('subscriptions.tenant.rates_title', 'Barème de Consommation des Points Piolo')}</span>
                      </div>
                      <div style={{ fontSize: 11, color: isDark ? '#F6D365' : '#9A6700', fontWeight: 700 }}>
                        {t('subscriptions.tenant.rates_vip_free', '👑 Pass VIP = 0 point déduit (Illimité)')}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                      {POINT_COST_CATALOG.map((item, ci) => (
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

                    {/* BANNIÈRE DE CONVERSION PASS VIP */}
                    <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: isDark ? 'rgba(212,175,55,0.1)' : '#FFF8E7', border: isDark ? '1px solid rgba(212,175,55,0.25)' : '1px solid #F5E5BE', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ fontSize: 11.5, color: isDark ? '#F6D365' : '#785A14' }}>
                        💡 <strong>{t('subscriptions.tenant.tip_title', 'Astuce Économie :')}</strong> {t('subscriptions.tenant.tip_desc', 'En recherche active, le Pass VIP à 4 900 FCFA/mois est rentabilisé dès 5 contacts et vous donne un accès illimité sans décompte.')}
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('passes')}
                        style={{ background: '#D4AF37', color: '#0F0D09', border: 'none', padding: '6px 14px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
                      >
                        {t('subscriptions.tenant.view_vip_pass', 'Voir le Pass VIP')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
                  {t('subscriptions.tenant.selection_label', 'Sélection :')} <strong>{selectedPack ? `${selectedPack.label} (+${selectedPack.points} Points)` : `${PLANS.find((p) => p.id === selectedPlan)?.name} (${billingCycle === 'weekly' ? '7 jours' : (billingCycle === 'yearly' ? '1 an' : '30 jours')})`}</strong>
                </p>

                {/* Récapitulatif montant */}
                <div style={{ background: theme.summaryBg, padding: '14px 18px', borderRadius: 12, border: theme.summaryBorder, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: theme.titleColor }}>
                    <span>{t('subscriptions.tenant.total_ttc', 'Montant total TTC :')}</span>
                    <span style={{ color: theme.cardPriceVip, fontSize: 16 }}>{activePrice?.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div style={{ fontSize: 11, color: theme.cardDesc, marginTop: 4 }}>
                    {t('subscriptions.tenant.no_hidden_fees', '0 frais cachés • Activation immédiate sur votre compte')}
                  </div>
                </div>

                {/* Choix opérateur Mobile Money avec Logos officiels */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: theme.cardDesc, marginBottom: 8 }}>
                    {t('subscriptions.tenant.momo_operator_label', 'Opérateur Mobile Money (Cameroun)')}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {/* ORANGE MONEY */}
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

                    {/* MTN MoMo */}
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

                {/* Champ numéro de téléphone */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: theme.cardFeatures, marginBottom: 6 }}>
                    {t('subscriptions.tenant.account_num_label', 'Numéro de compte')} {operator === 'OM' ? 'Orange Money' : 'MTN Mobile Money'}
                  </label>
                  <input
                    type="tel"
                    placeholder={t('subscriptions.tenant.phone_placeholder', 'Ex: 699 00 11 22 ou 677 00 11 22')}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: theme.inputBorder, background: theme.inputBg, color: theme.inputColor, fontSize: 14, outline: 'none' }}
                    required
                  />
                </div>

                {/* Instructions & Raccourci USSD avec vrai SVG */}
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
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

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

              {/* ACTIONS PRO : REÇU PDF & CONCIERGERIE WHATSAPP AVEC VRAIS SVG */}
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
                  <WhatsAppIcon size={15} color="#25D366" />
                  <span>{t('subscriptions.tenant.vip_concierge', 'Conciergerie VIP')}</span>
                </button>
              </div>

              <button
                onClick={onClose}
                style={{ width: '100%', background: '#D4AF37', color: '#0F0D09', border: 'none', padding: '12px 24px', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 14px rgba(212,175,55,0.25)' }}
              >
                {t('subscriptions.tenant.go_to_vip', 'Accéder à mon espace VIP')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



