import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';

// Données types de prestations avec barèmes du marché au Cameroun (FCFA)
const SERVICES_DATA = [
  {
    id: 'tv_unit',
    category: 'mobilier',
    name: 'Meuble TV Mural Flottant & Étagères LED',
    desc: 'Structure bois noble (Iroko / MDF hydrofuge), finitions laquées et rubans LED intégrés',
    basePriceMin: 120000,
    basePriceMax: 250000,
    delay: '5 à 10 jours',
    options: [
      { id: 'wood_iroko', label: 'Bois massif Iroko / Padouk véritable', extraMin: 40000, extraMax: 70000 },
      { id: 'led_touch', label: 'Éclairage LED avec variateur tactile', extraMin: 15000, extraMax: 25000 },
      { id: 'acoustic_panel', label: 'Panneau acoustique à tasseaux arrière', extraMin: 35000, extraMax: 60000 }
    ]
  },
  {
    id: 'dressing',
    category: 'mobilier',
    name: 'Dressing sur-mesure encastré (Chambre)',
    desc: 'Penderies, tiroirs coulissants amortis et compartiments chaussures personnalisés',
    basePriceMin: 220000,
    basePriceMax: 480000,
    delay: '7 à 14 jours',
    options: [
      { id: 'mirror_doors', label: 'Portes coulissantes miroir teinté bronze', extraMin: 50000, extraMax: 90000 },
      { id: 'soft_close', label: 'Charnières & coulisses Blum soft-close', extraMin: 25000, extraMax: 45000 }
    ]
  },
  {
    id: 'resin_table',
    category: 'mobilier',
    name: 'Table à Manger Bois Massif & Résine Époxy',
    desc: 'Plateau river table en Iroko avec résine transparente ou noire et pieds métalliques mikado',
    basePriceMin: 180000,
    basePriceMax: 420000,
    delay: '10 à 18 jours',
    options: [
      { id: 'chairs_6', label: 'Lot de 6 chaises assorties scandinaves', extraMin: 90000, extraMax: 150000 }
    ]
  },
  {
    id: 'plans_villa',
    category: 'architecture',
    name: 'Plans de Villa R+1 + Visuels 3D Photoréalistes',
    desc: 'Dossier architectural complet, distribution des pièces, façades et rendu 3D haute définition',
    basePriceMin: 250000,
    basePriceMax: 650000,
    delay: '10 à 20 jours',
    options: [
      { id: 'permis_batir', label: 'Constitution dossier Permis de Bâtir (CUY/CUD)', extraMin: 150000, extraMax: 300000 },
      { id: 'vr_tour', label: 'Visite immersive 3D 360° sur smartphone', extraMin: 50000, extraMax: 90000 }
    ]
  },
  {
    id: 'salle_de_bain',
    category: 'plomberie',
    name: 'Rénovation Salle de Bain & Douche Italienne',
    desc: 'Receveur maçonné carrelé, paroi vitrée sécurit, colonne mitigeur thermostatique et WC suspendu',
    basePriceMin: 180000,
    basePriceMax: 380000,
    delay: '4 à 8 jours',
    options: [
      { id: 'meuble_vasque', label: 'Meuble sous-vasque suspendu hydrofuge', extraMin: 60000, extraMax: 110000 },
      { id: 'surpresseur', label: 'Installation surpresseur silencieux avec ballon', extraMin: 80000, extraMax: 140000 }
    ]
  },
  {
    id: 'clim_inverter',
    category: 'plomberie',
    name: 'Pose Climatiseur Split Inverter Économique',
    desc: 'Fixation unité intérieure/extérieure, tirage au vide, raccordement cuivre et disjoncteur dédié',
    basePriceMin: 35000,
    basePriceMax: 65000,
    delay: '24 à 48 heures',
    options: [
      { id: 'fourniture_clim', label: 'Fourniture du climatiseur 1.5 CV Tropicalisé neuf', extraMin: 190000, extraMax: 260000 }
    ]
  },
  {
    id: 'solaire_kit',
    category: 'electricite',
    name: 'Système Solaire Autonome (Relais Coupures)',
    desc: 'Onduleur hybride 3.5kVA, 2 batteries gel/lithium, panneaux photovoltaïques et inverseur automatique',
    basePriceMin: 550000,
    basePriceMax: 1100000,
    delay: '2 à 5 jours',
    options: [
      { id: 'lithium_upgrade', label: 'Batterie Lithium longue durée (10 ans)', extraMin: 250000, extraMax: 450000 }
    ]
  }
];

export default function ProBudgetCalculator({ onOpenDevis, onOpenEscrow, onClose }) {
  const { t } = useTranslation();
  const [selectedServiceId, setSelectedServiceId] = useState(SERVICES_DATA[0].id);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [city, setCity] = useState('Yaoundé');

  const activeService = SERVICES_DATA.find(s => s.id === selectedServiceId) || SERVICES_DATA[0];

  const toggleOption = (optId) => {
    if (selectedOptions.includes(optId)) {
      setSelectedOptions(selectedOptions.filter(id => id !== optId));
    } else {
      setSelectedOptions([...selectedOptions, optId]);
    }
  };

  // Calcul du budget estimé
  let minPrice = activeService.basePriceMin;
  let maxPrice = activeService.basePriceMax;

  activeService.options?.forEach(opt => {
    if (selectedOptions.includes(opt.id)) {
      minPrice += opt.extraMin;
      maxPrice += opt.extraMax;
    }
  });

  const acompteMin = Math.round((minPrice * 0.3) / 1000) * 1000;
  const acompteMax = Math.round((maxPrice * 0.3) / 1000) * 1000;

  return (
    <div style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #E8E3DA', overflow: 'hidden', boxShadow: '0 12px 36px rgba(0,0,0,0.06)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0F0D09 0%, #1E1A12 100%)', padding: '20px 24px', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(212,175,55,0.15)', color: '#F6D365', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12, marginBottom: 6, border: '1px solid rgba(212,175,55,0.3)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            <span>{t('pro_modals.budget.official_simulator')}</span>
          </div>
          <h3 style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 800, color: '#FFF' }}>
            Estimateur de Budget <span style={{ color: '#D4AF37' }}>{t('pro_modals.budget.title_highlight')}</span>
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.1)', color: '#FFF', border: 'none', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Corps du formulaire */}
      <div style={{ padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 20 }}>
          {/* Sélection du service */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>
              1. Type de Projet ou Prestation
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => {
                setSelectedServiceId(e.target.value);
                setSelectedOptions([]);
              }}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E8E3DA', fontSize: 13.5, fontWeight: 600, outline: 'none', background: '#FAF9F6' }}
            >
              {SERVICES_DATA.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sélection de la ville */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>
              2. Ville d'intervention
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E8E3DA', fontSize: 13.5, fontWeight: 600, outline: 'none', background: '#FAF9F6' }}
            >
              <option value="Yaoundé">{t('pro.cities.yaounde')}</option>
              <option value="Douala">{t('pro.cities.douala')}</option>
              <option value="Autre">{t('pro.cities.other')}</option>
            </select>
          </div>
        </div>

        {/* Description du service choisi */}
        <div style={{ background: '#FAF9F6', padding: '12px 16px', borderRadius: 12, border: '1px solid #F0ECE4', marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#444', lineHeight: 1.5 }}>
            {activeService.desc}
          </div>
          <div style={{ fontSize: 11.5, color: '#AA820A', fontWeight: 700, marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
            <span>Délai moyen estimé : {activeService.delay}</span>
          </div>
        </div>

        {/* Options personnalisables */}
        {activeService.options && activeService.options.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>
              Options &amp; Finitions Haut de Gamme
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeService.options.map(opt => {
                const isSelected = selectedOptions.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => toggleOption(opt.id)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: isSelected ? '1.5px solid #D4AF37' : '1px solid #E8E3DA',
                      background: isSelected ? 'rgba(212,175,55,0.08)' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        style={{ accentColor: '#D4AF37', width: 16, height: 16, cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 13, fontWeight: isSelected ? 700 : 500, color: '#0F0D09' }}>
                        {opt.label}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#AA820A' }}>
                      +{opt.extraMin.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Résultat Calculé */}
        <div style={{ background: 'linear-gradient(135deg, #0F0D09 0%, #1A160F 100%)', borderRadius: 16, padding: '20px 24px', color: '#FFF', border: '1px solid rgba(212,175,55,0.4)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11.5, color: '#F6D365', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Fourchette de Budget Indicatif
            </div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 24, fontWeight: 800, color: '#FFFFFF', margin: '4px 0' }}>
              {minPrice.toLocaleString('fr-FR')} – {maxPrice.toLocaleString('fr-FR')} <span style={{ fontSize: 15, color: '#D4AF37' }}>FCFA</span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
              Acompte de démarrage sécurisé : <strong>{acompteMin.toLocaleString('fr-FR')} – {acompteMax.toLocaleString('fr-FR')} FCFA</strong> (30%)
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => onOpenDevis && onOpenDevis({ service: activeService.name, minPrice, maxPrice, city })}
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)',
                color: '#0F0D09',
                border: 'none',
                padding: '12px 18px',
                borderRadius: 10,
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 800,
                fontSize: 12.5,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(212,175,55,0.35)'
              }}
            >
              Envoyer ce devis aux pros vérifiés
            </button>

            {onOpenEscrow && (
              <button
                onClick={() => onOpenEscrow && onOpenEscrow({ service: activeService.name, acompte: acompteMin, city })}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '12px 16px',
                  borderRadius: 10,
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 700,
                  fontSize: 12.5,
                  cursor: 'pointer'
                }}
              >
                Bloquer un artisan (Acompte Sécurisé)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
