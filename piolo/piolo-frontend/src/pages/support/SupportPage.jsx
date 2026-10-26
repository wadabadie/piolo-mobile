import { useTranslation } from 'react-i18next';
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import '../bailleur/dashboard.css';

const FAQS_DATA = [
  {
    category: "visites",
    q: "Comment fonctionne la Visite 360° et le Mode Découverte (Reels) ?",
    a: "Le Mode Découverte vous permet d'explorer les logements sous forme de courtes vidéos verticales immersives (Reels). L'éditeur 360° intégré vous permet de naviguer dans les pièces à 360° et d'inspecter l'état réel du bien avant de vous déplacer."
  },
  {
    category: "visites",
    q: "Comment programmer une visite immobilière physique ?",
    a: "Sur la fiche du logement, touchez 'Demander une visite', sélectionnez votre date et votre créneau horaire. Le bailleur ou l'agence reçoit une notification instantanée par WhatsApp et e-mail pour confirmer le rendez-vous."
  },
  {
    category: "points",
    q: "Comment accumuler et utiliser mes Points Fidélité Piolo ?",
    a: "Chaque action (inscription +50 pts, profil complété +20 pts, première visite +30 pts, dossier validé +50 pts) crédite vos points. Ils débloquent des badges de confiance, des réductions sur les frais et des visites prioritaires."
  },
  {
    category: "securite",
    q: "Comment sont protégées mes pièces d'identité (CNI / Titre Foncier) ?",
    a: "Tous les documents administratifs téléversés sur Piolo sont chiffrés en SSL 256-bit, stockés sur un coffre-fort numérique sécurisé et filigranés automatiquement pour empêcher toute réutilisation non autorisée."
  },
  {
    category: "bailleurs",
    q: "Comment publier un bien immobilier et obtenir la certification ?",
    a: "Connectez-vous à votre espace Bailleur, cliquez sur 'Publier un bien', renseignez les informations du logement et téléversez vos photos et visite 360°. Notre équipe valide votre annonce sous 2 à 4 heures."
  },
  {
    category: "paiements",
    q: "Quels sont les modes de paiement acceptés pour les réservations ?",
    a: "Piolo prend en charge Orange Money Cameroun, MTN Mobile Money (+237) et les cartes bancaires sécurisées (Visa / Mastercard) via notre passerelle cryptée."
  }
];

export default function SupportPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [openFaq, setOpenFaq] = useState(0);
  const [contactForm, setContactForm] = useState({ category: 'VISITE', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filtrage intelligent des questions
  const filteredFaqs = useMemo(() => {
    return FAQS_DATA.filter(item => {
      const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchQuery = !searchQuery || 
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [searchQuery, selectedCategory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.subject || !contactForm.message) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      setContactForm({ category: 'VISITE', subject: '', message: '' });
    }, 600);
  };

  return (
    <div className="layout">
      <Sidebar />

      <div className="main support-page-main" style={{ overflowY: 'auto', padding: '0 0 80px 0', background: 'var(--bg, #F8F6F1)' }}>

        {/* ========================================================= */}
        {/* HERO BANNER LUXE CAMEROUNAIS AIDE & SUPPORT               */}
        {/* ========================================================= */}
        <div 
          className="support-hero-banner"
          style={{
            position: 'relative',
            background: 'linear-gradient(180deg, rgba(15,13,9,0.92) 0%, rgba(20,17,13,0.98) 100%), url(/img/cameroun-luxury-banner.jpg) center/cover no-repeat',
            borderBottom: '1px solid rgba(212,175,55,0.3)',
            padding: 'max(env(safe-area-inset-top, 0px) + 20px, 32px) clamp(20px, 3.5vw, 56px) 36px',
            color: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {/* Ligne Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <Link 
              to={user?.role === 'BAILLEUR' ? '/dashboard/bailleur' : '/dashboard/locataire'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(212,175,55,0.3)',
                color: '#FFFFFF',
                fontSize: 12.5,
                fontWeight: 700,
                textDecoration: 'none',
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              <span>Tableau de bord</span>
            </Link>

            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--or-l)', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.35)', padding: '4px 12px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Assistance Piolo 7j/7
            </span>
          </div>

          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <div 
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.08))',
                border: '2px solid var(--or)',
                boxShadow: '0 0 24px rgba(212,175,55,0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--or-l)',
                marginBottom: 14
              }}
            >
              <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/></svg>
            </div>

            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 800, color: '#FFFFFF', margin: '0 0 8px', lineHeight: 1.2 }}>
              Centre d'Aide &amp; Support Piolo
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: '0 0 22px', lineHeight: 1.5 }}>
              Une question sur une visite, une annonce ou votre compte ? Notre équipe basée à Yaoundé et Douala vous accompagne.
            </p>

            {/* Barre de recherche instantanée */}
            <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto' }}>
              <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--or-l)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher une réponse (visite 360°, caution, CNI, compte...)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.12)',
                  border: '1.5px solid rgba(212,175,55,0.45)',
                  borderRadius: 30,
                  padding: '13px 20px 13px 46px',
                  color: '#FFFFFF',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                  backdropFilter: 'blur(10px)',
                  fontFamily: 'DM Sans, sans-serif'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', fontSize: 16 }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CORPS DE LA PAGE                                          */}
        {/* ========================================================= */}
        <div style={{ padding: '28px clamp(20px, 3.5vw, 56px)', width: '100%', boxSizing: 'border-box' }}>

          {/* 4 Cartes d'Assistance Rapide */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
            {/* WhatsApp */}
            <div 
              style={{ background: '#FFFFFF', border: '1px solid #E8E3DA', borderRadius: 16, padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(37,211,102,0.12)', color: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg>
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 800, background: 'rgba(37,211,102,0.12)', color: '#16A34A', padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
                  Réponse directe
                </span>
              </div>
              <div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 15, fontWeight: 700, color: '#0F0D09' }}>WhatsApp Support Piolo</div>
                <div style={{ fontSize: 12, color: '#64605A', marginTop: 2 }}>{t('support.instant_help')}</div>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4 }}>
                <a 
                  href="https://wa.me/237658324285?text=Bonjour%20Piolo,%20j'ai%20besoin%20d'aide%20sur%20la%20plateforme" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ fontSize: 12.5, fontWeight: 700, color: '#25D366', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span>+237 658 32 42 85 (Principal)</span>
                  <span>→</span>
                </a>
                <a 
                  href="https://wa.me/237689542333?text=Bonjour%20Piolo,%20j'ai%20besoin%20d'aide%20sur%20la%20plateforme" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, fontWeight: 600, color: '#16A34A', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.9 }}
                >
                  <span>+237 689 54 23 33 (Ligne 2)</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            {/* Téléphone */}
            <div 
              style={{ background: '#FFFFFF', border: '1px solid #E8E3DA', borderRadius: 16, padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(212,175,55,0.12)', color: 'var(--or-d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-2.2 2.2a15.053 15.053 0 0 1-6.59-6.59l2.2-2.21a.96.96 0 0 0 .25-1A11.36 11.36 0 0 1 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM19 12h2a9 9 0 0 0-9-9v2c3.87 0 7 3.13 7 7zm-4 0h2c0-2.76-2.24-5-5-5v2c1.66 0 3 1.34 3 3z"/></svg>
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 800, background: 'rgba(212,175,55,0.12)', color: 'var(--or-d)', padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
                  8h00 - 19h00
                </span>
              </div>
              <div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 15, fontWeight: 700, color: '#0F0D09' }}>{t('support.direct_call')}</div>
                <div style={{ fontSize: 12, color: '#64605A', marginTop: 2 }}>{t('support.business_hours')}</div>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4 }}>
                <a 
                  href="tel:+237658324285"
                  style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--or-d)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span>+237 658 32 42 85 (Principal)</span>
                  <span>→</span>
                </a>
                <a 
                  href="tel:+237689542333"
                  style={{ fontSize: 12, fontWeight: 600, color: '#9A6700', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.9 }}
                >
                  <span>+237 689 54 23 33 (Ligne 2)</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            {/* Espace Sécurité */}
            <Link 
              to="/securite"
              style={{ background: '#FFFFFF', border: '1px solid #E8E3DA', borderRadius: 16, padding: '20px 18px', textDecoration: 'none', color: '#0F0D09', display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.03)', transition: 'transform 0.2s' }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(30,122,71,0.12)', color: '#1E7A47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8s0 0 0 0z"/></svg>
              </div>
              <div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 15, fontWeight: 700, color: '#0F0D09' }}>{t('support.security_title')}</div>
                <div style={{ fontSize: 12, color: '#64605A', marginTop: 2 }}>{t('support.security_desc')}</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1E7A47', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>Paramètres de sécurité</span>
                <span>→</span>
              </div>
            </Link>

            {/* Carte Interactive */}
            <Link 
              to="/map"
              style={{ background: '#FFFFFF', border: '1px solid #E8E3DA', borderRadius: 16, padding: '20px 18px', textDecoration: 'none', color: '#0F0D09', display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.03)', transition: 'transform 0.2s' }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(30,58,110,0.1)', color: '#1E3A6E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              </div>
              <div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 15, fontWeight: 700, color: '#0F0D09' }}>Carte Interactive</div>
                <div style={{ fontSize: 12, color: '#64605A', marginTop: 2 }}>{t('support.locate_neighborhoods')}</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1E3A6E', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>{t('support.open_gps')}</span>
                <span>→</span>
              </div>
            </Link>
          </div>

          {/* Grille Principale (FAQ & Formulaire) */}
          <div className="support-layout-grid">

            {/* COLONNE GAUCHE (FAQ & Filtres) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 800, color: '#0F0D09', margin: 0 }}>
                  Questions Fréquentes ({filteredFaqs.length})
                </h2>
              </div>

              {/* Filtres de catégories */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
                {[
                  { id: 'ALL', label: 'Toutes' },
                  { id: 'visites', label: 'Visites & 360°' },
                  { id: 'points', label: 'Points & Fidélité' },
                  { id: 'securite', label: 'Sécurité & CNI' },
                  { id: 'bailleurs', label: 'Bailleurs & Annonces' },
                  { id: 'paiements', label: 'Paiements & Caution' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 20,
                      border: selectedCategory === cat.id ? '1px solid var(--or)' : '1px solid #E8E3DA',
                      background: selectedCategory === cat.id ? 'rgba(212,175,55,0.14)' : '#FFFFFF',
                      color: selectedCategory === cat.id ? 'var(--or-d)' : '#64605A',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Accordion FAQ */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredFaqs.length === 0 ? (
                  <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '24px 20px', border: '1px solid #E8E3DA', textAlign: 'center', color: '#64605A', fontSize: 13 }}>
                    Aucune réponse trouvée pour votre recherche. Contactez notre assistance via le formulaire ci-contre ou sur WhatsApp.
                  </div>
                ) : (
                  filteredFaqs.map((item, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        background: '#FFFFFF', 
                        border: openFaq === idx ? '1px solid var(--or)' : '1px solid #E8E3DA', 
                        borderRadius: 16, 
                        overflow: 'hidden', 
                        boxShadow: openFaq === idx ? '0 4px 14px rgba(212,175,55,0.12)' : '0 2px 8px rgba(0,0,0,0.02)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        style={{
                          width: '100%',
                          padding: '16px 18px',
                          background: 'none',
                          border: 'none',
                          color: '#0F0D09',
                          textAlign: 'left',
                          fontFamily: 'Poppins, sans-serif',
                          fontSize: 14,
                          fontWeight: 700,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          gap: 12
                        }}
                      >
                        <span>{item.q}</span>
                        <span style={{ color: 'var(--or-d)', display: 'flex', alignItems: 'center', transform: openFaq === idx ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
                        </span>
                      </button>

                      {openFaq === idx && (
                        <div style={{ padding: '0 18px 18px', color: '#4A463F', fontSize: 13.5, lineHeight: 1.6, borderTop: '1px solid #F0ECE3' }}>
                          {item.a}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLONNE DROITE (Formulaire de Ticket Support) */}
            <div>
              <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '24px 22px', border: '1px solid #E8E3DA', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                <div style={{ paddingBottom: 14, borderBottom: '1px solid #F0ECE3', marginBottom: 18 }}>
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16.5, fontWeight: 800, color: '#0F0D09', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="18" height="18" fill="var(--or)" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                    <span>{t('support.send_request')}</span>
                  </h3>
                  <p style={{ fontSize: 12, color: '#64605A', margin: 0 }}>
                    Un ticket est ouvert et traité par nos agents sous 2h
                  </p>
                </div>

                {sent ? (
                  <div style={{ textAlign: 'center', padding: '28px 16px' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(30,122,71,0.12)', color: '#1E7A47', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    </div>
                    <h4 style={{ fontFamily: 'Poppins, sans-serif', color: '#0F0D09', fontSize: 17, fontWeight: 800, margin: '0 0 6px' }}>{t('support.success_msg')}</h4>
                    <p style={{ fontSize: 13, color: '#64605A', margin: '0 0 18px', lineHeight: 1.5 }}>
                      Votre message a bien été pris en compte. Vous recevrez une notification par e-mail et WhatsApp dès la réponse de l'équipe.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSent(false)}
                      style={{ background: '#F9F8F5', border: '1px solid #E8E3DA', color: '#0F0D09', borderRadius: 12, padding: '10px 20px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: 12.5, fontWeight: 700 }}
                    >
                      Envoyer un autre message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 14 }}>
                      <label style={labelStyle}>Type de demande</label>
                      <select
                        value={contactForm.category}
                        onChange={e => setContactForm({ ...contactForm, category: e.target.value })}
                        style={inputStyle}
                      >
                        <option value="VISITE">Question sur une visite / RDV</option>
                        <option value="DOSSIER">Dossier de location / Justificatifs CNI</option>
                        <option value="ANNONCE">Publication d'annonce / Bailleur</option>
                        <option value="PAIEMENT">Paiement / Frais de réservation</option>
                        <option value="AUTRE">Autre assistance</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <label style={labelStyle}>{t('support.subject')}</label>
                      <input
                        type="text"
                        placeholder="Ex: Confirmation de visite non reçue..."
                        value={contactForm.subject}
                        onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                        required
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ marginBottom: 18 }}>
                      <label style={labelStyle}>Votre message</label>
                      <textarea
                        rows={5}
                        placeholder="Détaillez votre situation ou la référence de l'annonce..."
                        value={contactForm.message}
                        onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                        required
                        style={{ ...inputStyle, minHeight: 96, resize: 'vertical' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #D4AF37, #F6D365)',
                        color: '#0F0D09',
                        border: 'none',
                        borderRadius: 12,
                        padding: '13px',
                        fontWeight: 800,
                        fontSize: 14,
                        cursor: loading ? 'wait' : 'pointer',
                        boxShadow: '0 4px 14px rgba(212,175,55,0.35)',
                        fontFamily: 'Poppins, sans-serif',
                        transition: 'transform 0.15s'
                      }}
                    >
                      {loading ? 'Transmission en cours…' : 'Envoyer la demande au support'}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .support-layout-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 28px;
        }
        @media (max-width: 900px) {
          .support-layout-grid {
            grid-template-columns: 1fr;
          }
          .support-page-main {
            padding-bottom: calc(var(--bn-h, 54px) + 20px) !important;
          }
        }
      ` }} />
    </div>
  );
}

const labelStyle = { 
  display: 'block', 
  fontSize: 11.5, 
  fontWeight: 700, 
  color: '#64605A', 
  marginBottom: 6, 
  textTransform: 'uppercase', 
  letterSpacing: 0.5, 
  fontFamily: 'Poppins, sans-serif' 
};

const inputStyle = { 
  width: '100%', 
  boxSizing: 'border-box', 
  border: '1.5px solid #E8E3DA', 
  borderRadius: 12, 
  padding: '11px 14px', 
  fontFamily: 'DM Sans, sans-serif', 
  fontSize: 13.5, 
  outline: 'none', 
  background: '#FFFFFF', 
  color: '#0F0D09',
  transition: 'border-color 0.2s, background 0.2s'
};

