import React, { useState } from 'react';

/**
 * Modal d'Abonnement et Recharges de Points pour Professionnels
 * Permet aux artisans de souscrire un abonnement (Mensuel/Annuel) ou d'acheter des packs de points via Mobile Money
 */
export default function ProSubscriptionModal({ currentPoints, onClose, onRechargeSuccess, onSubscribeSuccess }) {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [selectedPlan, setSelectedPlan] = useState('pro'); // 'starter' | 'pro' | 'enterprise'
  const [selectedPack, setSelectedPack] = useState(null); // { points: 50, price: 5000 }
  const [operator, setOperator] = useState('OM'); // 'OM' | 'MOMO'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState('selection'); // 'selection' | 'checkout' | 'processing' | 'success'
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  const PLANS = [
    {
      id: 'starter',
      name: 'Pack Découverte',
      monthlyPrice: 0,
      yearlyPrice: 0,
      badge: 'Gratuit',
      features: [
        '50 points de bienvenue offerts',
        '2 projets en vitrine',
        '2 demandes de devis / mois',
        'Support standard Piolo'
      ],
      cta: 'Plan Actuel'
    },
    {
      id: 'pro',
      name: 'Artisan Pro Vérifié',
      monthlyPrice: 9900,
      yearlyPrice: 95000,
      badge: 'Le plus populaire',
      highlight: true,
      features: [
        'Publication illimitée de chantiers',
        'Slider Avant / Après interactif actif',
        'Badge officiel « Artisan Vérifié Piolo »',
        'Demandes de devis illimitées (0 point déduit)',
        'Priorité d’affichage dans l’annuaire',
        'Support prioritaire WhatsApp 7j/7'
      ],
      cta: 'Passer en Pro'
    },
    {
      id: 'enterprise',
      name: 'Cabinet & Entreprise BTP',
      monthlyPrice: 24900,
      yearlyPrice: 239000,
      badge: 'Grand Standing',
      features: [
        'Tout le plan Pro inclus',
        'Vitrine 3D et visite virtuelle de chantiers',
        'Mise en avant en page d’accueil',
        'Appels d’offres grands comptes & diaspora',
        '0% de frais sur les paiements séquestre Piolo',
        'Conseiller commercial dédié'
      ],
      cta: 'Choisir Entreprise'
    }
  ];

  const POINT_PACKS = [
    { points: 20, price: 2500, label: 'Pack Flash' },
    { points: 50, price: 5000, label: 'Pack Recommandé', highlight: true },
    { points: 120, price: 10000, label: 'Pack Expert (+20 pts offerts)' }
  ];

  const handleStartCheckoutPlan = (plan) => {
    if (plan.monthlyPrice === 0) return;
    setSelectedPlan(plan.id);
    setSelectedPack(null);
    setStep('checkout');
  };

  const handleStartCheckoutPack = (pack) => {
    setSelectedPack(pack);
    setSelectedPlan(null);
    setStep('checkout');
  };

  const handlePay = (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 8) {
      setError('Veuillez entrer un numéro de téléphone valide.');
      return;
    }
    setError('');
    setStep('processing');

    setTimeout(() => {
      if (selectedPack) {
        setSuccessMsg(`Félicitations ! +${selectedPack.points} points ont été crédités sur votre compte.`);
        if (onRechargeSuccess) onRechargeSuccess(selectedPack.points);
      } else {
        const planObj = PLANS.find(p => p.id === selectedPlan);
        setSuccessMsg(`Félicitations ! Votre abonnement "${planObj?.name}" est maintenant actif.`);
        if (onSubscribeSuccess) onSubscribeSuccess(planObj);
      }
      setStep('success');
    }, 2000);
  };

  const activePlanPrice = selectedPlan ? (
    billingCycle === 'monthly'
      ? PLANS.find(p => p.id === selectedPlan)?.monthlyPrice
      : PLANS.find(p => p.id === selectedPlan)?.yearlyPrice
  ) : selectedPack?.price;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,13,9,0.85)', backdropFilter: 'blur(8px)', zIndex: 50000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#FFFFFF', borderRadius: 24, width: '100%', maxWidth: 840, maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #E8E3DA', boxShadow: '0 35px 90px rgba(0,0,0,0.5)' }}>
        
        {/* HEADER */}
        <div style={{ background: 'linear-gradient(135deg, #0F0D09 0%, #1A160F 100%)', padding: '22px 28px', color: '#FFFFFF', borderBottom: '1.5px solid #D4AF37', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(212,175,55,0.15)', color: '#F6D365', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 12, border: '1px solid rgba(212,175,55,0.3)', marginBottom: 4 }}>
              <span>Monétisation &amp; Visibilité Piolo</span>
            </div>
            <h2 style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: 20, fontWeight: 800, color: '#FFF' }}>
              Abonnements &amp; Recharge de Points Professionnels
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.1)', color: '#FFF', border: 'none', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}
          >
            ✕
          </button>
        </div>

        {/* CORPS */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          {step === 'selection' && (
            <div>
              {/* Solde actuel & Règle publication */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAF9F6', padding: '14px 18px', borderRadius: 14, border: '1px solid #E8E3DA', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11.5, color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Votre Solde Actuel</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#D4AF37', marginTop: 2 }}>{currentPoints} Points disponibles</div>
                </div>
                <div style={{ fontSize: 12.5, color: '#555', maxWidth: 420 }}>
                  💡 <em>Chaque publication de projet en vitrine requiert <strong>5 points</strong> (ou gratuit et illimité avec l'abonnement Artisan Pro).</em>
                </div>
              </div>

              {/* BASCULE MENSUEL / ANNUEL */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <span style={{ fontSize: 13, fontWeight: billingCycle === 'monthly' ? 800 : 600, color: billingCycle === 'monthly' ? '#0F0D09' : '#888' }}>
                  Facturation Mensuelle
                </span>
                <button
                  type="button"
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                  style={{
                    width: 48,
                    height: 26,
                    borderRadius: 13,
                    background: billingCycle === 'yearly' ? '#D4AF37' : '#CCC',
                    border: 'none',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#FFF',
                    position: 'absolute',
                    top: 3,
                    left: billingCycle === 'yearly' ? 25 : 3,
                    transition: 'all 0.2s'
                  }} />
                </button>
                <span style={{ fontSize: 13, fontWeight: billingCycle === 'yearly' ? 800 : 600, color: billingCycle === 'yearly' ? '#0F0D09' : '#888' }}>
                  Facturation Annuelle <span style={{ background: '#2ECC71', color: '#FFF', padding: '2px 6px', borderRadius: 8, fontSize: 10.5, fontWeight: 800 }}>-20% de remise</span>
                </span>
              </div>

              {/* GRILLE DES 3 PLANS D'ABONNEMENT */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16, marginBottom: 32 }}>
                {PLANS.map((plan) => {
                  const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
                  const isPro = plan.id === 'pro';

                  return (
                    <div
                      key={plan.id}
                      style={{
                        borderRadius: 18,
                        padding: '22px 20px',
                        border: isPro ? '2px solid #D4AF37' : '1px solid #E8E3DA',
                        background: isPro ? 'linear-gradient(180deg, #FFFDF8 0%, #FFFFFF 100%)' : '#FFFFFF',
                        boxShadow: isPro ? '0 10px 30px rgba(212,175,55,0.18)' : '0 4px 12px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative'
                      }}
                    >
                      {plan.badge && (
                        <div style={{ position: 'absolute', top: -10, left: 20, background: isPro ? '#D4AF37' : '#0F0D09', color: isPro ? '#0F0D09' : '#FFF', fontSize: 10.5, fontWeight: 800, padding: '2px 10px', borderRadius: 10 }}>
                          {plan.badge}
                        </div>
                      )}

                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0F0D09', marginTop: 4 }}>{plan.name}</div>
                      <div style={{ margin: '12px 0 16px' }}>
                        <span style={{ fontSize: 24, fontWeight: 900, color: '#0F0D09' }}>
                          {price === 0 ? 'Gratuit' : `${price.toLocaleString('fr-FR')} FCFA`}
                        </span>
                        {price > 0 && (
                          <span style={{ fontSize: 12, color: '#888' }}>
                            {billingCycle === 'monthly' ? ' / mois' : ' / an'}
                          </span>
                        )}
                      </div>

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                        {plan.features.map((feat, fi) => (
                          <div key={fi} style={{ fontSize: 12, color: '#444', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                            <span style={{ color: '#2ECC71', fontWeight: 800, marginTop: 1 }}>✓</span>
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
                          border: isPro ? 'none' : '1.5px solid #0F0D09',
                          background: isPro ? 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)' : (price === 0 ? '#FAF9F6' : '#0F0D09'),
                          color: isPro ? '#0F0D09' : (price === 0 ? '#888' : '#FFF'),
                          fontWeight: 800,
                          fontSize: 13,
                          cursor: price === 0 ? 'default' : 'pointer'
                        }}
                      >
                        {plan.cta}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* OPTION 2 : PACKS DE POINTS À LA CARTE */}
              <div style={{ borderTop: '1.5px dashed #E8E3DA', paddingTop: 24 }}>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <h3 style={{ margin: '0 0 4px', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 17, color: '#0F0D09' }}>
                    Ou rechargez des points à la carte (Sans engagement)
                  </h3>
                  <p style={{ fontSize: 12.5, color: '#777', margin: 0 }}>
                    Idéal pour publier quelques projets ponctuels sans abonnement mensuel.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  {POINT_PACKS.map((pack, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleStartCheckoutPack(pack)}
                      style={{
                        background: '#FAF9F6',
                        borderRadius: 14,
                        padding: '16px',
                        border: pack.highlight ? '2px solid #D4AF37' : '1px solid #E8E3DA',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'transform 0.2s',
                        boxShadow: pack.highlight ? '0 6px 18px rgba(212,175,55,0.15)' : 'none'
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#AA820A', textTransform: 'uppercase' }}>{pack.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#0F0D09', margin: '4px 0' }}>+{pack.points} Points</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#D4AF37' }}>{pack.price.toLocaleString('fr-FR')} FCFA</div>
                      <button
                        type="button"
                        style={{
                          marginTop: 10,
                          width: '100%',
                          padding: '7px',
                          borderRadius: 8,
                          border: 'none',
                          background: pack.highlight ? '#0F0D09' : '#EDE8DF',
                          color: pack.highlight ? '#F6D365' : '#0F0D09',
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        Acheter ce pack
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'checkout' && (
            <div style={{ maxWidth: 480, margin: '0 auto' }}>
              <button
                type="button"
                onClick={() => setStep('selection')}
                style={{ background: 'none', border: 'none', fontSize: 12.5, fontWeight: 700, color: '#AA820A', cursor: 'pointer', marginBottom: 14 }}
              >
                ← Retour au choix des offres
              </button>

              <form onSubmit={handlePay}>
                <h3 style={{ margin: '0 0 8px', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 18, color: '#0F0D09' }}>
                  Paiement Mobile Money Sécurisé
                </h3>
                <p style={{ fontSize: 13, color: '#666', margin: '0 0 16px' }}>
                  Commande : <strong>{selectedPack ? `Pack +${selectedPack.points} Points` : `Abonnement ${PLANS.find(p => p.id === selectedPlan)?.name}`}</strong>
                </p>

                {/* Total */}
                <div style={{ background: '#FAF9F6', padding: '14px 18px', borderRadius: 14, border: '1px solid #E8E3DA', marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#0F0D09' }}>
                    <span>Montant total :</span>
                    <span style={{ color: '#D4AF37' }}>{activePlanPrice?.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>

                {/* Choix OM / MoMo */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>
                    Opérateur Mobile Money
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setOperator('OM')}
                      style={{
                        padding: '12px',
                        borderRadius: 12,
                        border: operator === 'OM' ? '2px solid #FF7900' : '1px solid #E8E3DA',
                        background: operator === 'OM' ? '#FFF6ED' : '#FAF9F6',
                        fontWeight: 800,
                        fontSize: 13,
                        color: '#0F0D09',
                        cursor: 'pointer'
                      }}
                    >
                      Orange Money
                    </button>
                    <button
                      type="button"
                      onClick={() => setOperator('MOMO')}
                      style={{
                        padding: '12px',
                        borderRadius: 12,
                        border: operator === 'MOMO' ? '2px solid #FFCC00' : '1px solid #E8E3DA',
                        background: operator === 'MOMO' ? '#FFFBE6' : '#FAF9F6',
                        fontWeight: 800,
                        fontSize: 13,
                        color: '#0F0D09',
                        cursor: 'pointer'
                      }}
                    >
                      MTN Mobile Money
                    </button>
                  </div>
                </div>

                {/* Champ numéro */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 6 }}>
                    Numéro de compte {operator === 'OM' ? 'Orange Money' : 'MTN MoMo'}
                  </label>
                  <input
                    type="tel"
                    placeholder="Ex: 699 00 11 22"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #E8E3DA', fontSize: 14, outline: 'none' }}
                    required
                  />
                </div>

                {error && (
                  <div style={{ background: 'rgba(231,76,60,0.1)', color: '#C0392B', padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, marginBottom: 14 }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)',
                    color: '#0F0D09',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(212,175,55,0.35)'
                  }}
                >
                  Valider et Payer {activePlanPrice?.toLocaleString('fr-FR')} FCFA
                </button>
              </form>
            </div>
          )}

          {step === 'processing' && (
            <div style={{ textAlign: 'center', padding: '40px 10px' }}>
              <div style={{ width: 44, height: 44, border: '3px solid #E8E3DA', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
              <h4 style={{ margin: '0 0 6px', fontFamily: 'Poppins, sans-serif', fontWeight: 800 }}>
                Validation du Paiement Mobile...
              </h4>
              <p style={{ fontSize: 13, color: '#777', margin: 0 }}>
                Veuillez confirmer l'invite USSD sur votre téléphone mobile ({phoneNumber}).
              </p>
            </div>
          )}

          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(46,204,113,0.15)', color: '#2ECC71', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>
                ✓
              </div>
              <h3 style={{ margin: '0 0 8px', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 20, color: '#0F0D09' }}>
                Paiement Validé avec Succès !
              </h3>
              <p style={{ fontSize: 13.5, color: '#666', lineHeight: 1.6, margin: '0 0 24px', maxWidth: 420, marginInline: 'auto' }}>
                {successMsg}
              </p>
              <button
                onClick={onClose}
                style={{ background: '#0F0D09', color: '#F6D365', border: 'none', padding: '12px 26px', borderRadius: 12, fontWeight: 800, fontSize: 13.5, cursor: 'pointer' }}
              >
                Fermer &amp; Publier mes chantiers
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
