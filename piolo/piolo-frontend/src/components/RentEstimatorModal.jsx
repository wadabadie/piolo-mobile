import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, useCallback } from 'react';
import { propertiesApi } from '../services/api';
import PointConfirmationModal from './PointConfirmationModal';
import LandlordSubscriptionModal from './LandlordSubscriptionModal';
import { subscriptionService } from '../services/subscriptionService';
import './RentEstimatorModal.css';

const POPULAR_NEIGHBORHOODS = {
  'Yaoundé': ['Bastos', 'Odza', 'Santa Barbara', 'Omnisports', 'Ngousso', 'Biyem-Assi', 'Mendong', 'Golf', 'Mermoz', 'Tsinga'],
  'Douala': ['Bonapriso', 'Akwa', 'Bonamoussadi', 'Makepe', 'Denver', 'Bali', 'Kotto', 'Logpom', 'Deido', 'Yassa'],
  'Kribi': ['Centre-ville', 'Plage / Bord de mer', 'Talla', 'Dombe'],
  'Bafoussam': ['Centre-ville', 'Banengo', 'Djeleng', 'Tam-Dja']
};

const DEFAULT_TYPE_SPECS = {
  'CHAMBRE': { surface: 16, bedrooms: 1, bathrooms: 1, label: 'Chambre' },
  'STUDIO': { surface: 30, bedrooms: 1, bathrooms: 1, label: 'Studio' },
  'APPARTEMENT': { surface: 75, bedrooms: 2, bathrooms: 1, label: 'Appartement' },
  'MAISON': { surface: 110, bedrooms: 3, bathrooms: 2, label: 'Maison' },
  'DUPLEX': { surface: 180, bedrooms: 4, bathrooms: 3, label: 'Duplex' },
  'VILLA': { surface: 250, bedrooms: 4, bathrooms: 3, label: 'Villa' },
  'PENTHOUSE': { surface: 220, bedrooms: 3, bathrooms: 3, label: 'Penthouse' },
  'BUREAU': { surface: 60, bedrooms: 1, bathrooms: 1, label: 'Bureau' },
};

/* ─── Inline Professional SVG Icons ───────────────────────────────────────── */
const Icons = {
  SparkleAI: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
      <circle cx="12" cy="12" r="4" fill="rgba(212,175,55,0.25)" stroke="#D4AF37" />
    </svg>
  ),
  Building: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <line x1="9" y1="22" x2="9" y2="22.01" />
      <line x1="15" y1="22" x2="15" y2="22.01" />
      <line x1="9" y1="6" x2="9" y2="6.01" />
      <line x1="15" y1="6" x2="15" y2="6.01" />
      <line x1="9" y1="10" x2="9" y2="10.01" />
      <line x1="15" y1="10" x2="15" y2="10.01" />
      <line x1="9" y1="14" x2="9" y2="14.01" />
      <line x1="15" y1="14" x2="15" y2="14.01" />
      <line x1="9" y1="18" x2="9" y2="18.01" />
      <line x1="15" y1="18" x2="15" y2="18.01" />
    </svg>
  ),
  MapPin: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Droplet: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  ),
  Zap: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Sofa: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8" />
      <path d="M19 11V7a4 4 0 0 0-8 0v4" />
    </svg>
  ),
  Shield: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Road: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="19" x2="8" y2="5" />
      <line x1="20" y1="19" x2="16" y2="5" />
      <line x1="12" y1="8" x2="12" y2="10" />
      <line x1="12" y1="14" x2="12" y2="16" />
    </svg>
  ),
  Bed: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
    </svg>
  ),
  Maximize: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  ),
  TrendingUp: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Sun: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  Moon: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  Close: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Award: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  )
};

export default function RentEstimatorModal({ isOpen, onClose, initialData = {}, onApplyPrice }) {
  const { t } = useTranslation();
  // Mode clair activé par défaut comme demandé
  const [isLightMode, setIsLightMode] = useState(() => {
    try {
      const saved = localStorage.getItem('piolo_estimator_theme');
      return saved !== null ? saved === 'light' : true;
    } catch {
      return true;
    }
  });

  const toggleTheme = () => {
    setIsLightMode(prev => {
      const next = !prev;
      try { localStorage.setItem('piolo_estimator_theme', next ? 'light' : 'dark'); } catch (e) { void e; }
      return next;
    });
  };

  const [formData, setFormData] = useState({
    city: initialData.city || 'Yaoundé',
    neighborhood: initialData.neighborhood || 'Bastos',
    property_type: initialData.property_type || 'APPARTEMENT',
    surface: initialData.area || initialData.surface || 75,
    bedrooms: initialData.bedrooms !== undefined ? initialData.bedrooms : 2,
    bathrooms: initialData.bathrooms !== undefined ? initialData.bathrooms : 1,
    standing: initialData.standing || 'Standard',
    furnished: Boolean(initialData.furnished),
    has_forage: Boolean(initialData.water_source === 'FORAGE' || initialData.water_source === 'FORAGE_CAMWATER'),
    has_generator: Boolean(initialData.electricity_type === 'SOLAIRE'),
    has_security: Boolean(initialData.security),
    has_parking: Boolean(initialData.parking),
    has_balcony: Boolean(initialData.balcony),
    distance_goudron: initialData.distance_goudron || 60,
    road_access: initialData.road_access || 'PISTE_PROCHE',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pointModalOpen, setPointModalOpen] = useState(false);
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);

  // Verrouillage du scroll d'arrière plan sur mobile
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  // Synchronisation avec initialData
  useEffect(() => {
    if (isOpen && initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({
        ...prev,
        city: initialData.city || prev.city,
        neighborhood: initialData.neighborhood || prev.neighborhood,
        property_type: initialData.property_type || prev.property_type,
        surface: initialData.area || initialData.surface || prev.surface,
        bedrooms: initialData.bedrooms !== undefined ? initialData.bedrooms : prev.bedrooms,
        bathrooms: initialData.bathrooms !== undefined ? initialData.bathrooms : prev.bathrooms,
        standing: initialData.standing || prev.standing,
        furnished: initialData.furnished !== undefined ? Boolean(initialData.furnished) : prev.furnished,
        has_forage: initialData.water_source ? (initialData.water_source === 'FORAGE' || initialData.water_source === 'FORAGE_CAMWATER') : prev.has_forage,
        has_generator: initialData.electricity_type ? (initialData.electricity_type === 'SOLAIRE') : prev.has_generator,
        has_security: initialData.security !== undefined ? Boolean(initialData.security) : prev.has_security,
        has_parking: initialData.parking !== undefined ? Boolean(initialData.parking) : prev.has_parking,
        has_balcony: initialData.balcony !== undefined ? Boolean(initialData.balcony) : prev.has_balcony,
        distance_goudron: initialData.distance_goudron !== undefined ? initialData.distance_goudron : prev.distance_goudron,
      }));
    }
  }, [isOpen, initialData]);

  // Estimation avec Debounce
  const runEstimation = useCallback(async (dataToEstimate) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        city: dataToEstimate.city,
        neighborhood: dataToEstimate.neighborhood,
        property_type: dataToEstimate.property_type,
        surface: Number(dataToEstimate.surface) || 50,
        bedrooms: Number(dataToEstimate.bedrooms) || 1,
        bathrooms: Number(dataToEstimate.bathrooms) || 1,
        standing: dataToEstimate.standing,
        furnished: Boolean(dataToEstimate.furnished),
        has_forage: Boolean(dataToEstimate.has_forage),
        has_generator: Boolean(dataToEstimate.has_generator),
        has_security: Boolean(dataToEstimate.has_security),
        has_parking: Boolean(dataToEstimate.has_parking),
        has_balcony: Boolean(dataToEstimate.has_balcony),
        distance_goudron: Number(dataToEstimate.distance_goudron) || 50,
        road_access: dataToEstimate.road_access,
      };
      const res = await propertiesApi.estimateRent(payload);
      setResult(res.data);
    } catch (err) {
      console.error("Erreur estimation loyer IA:", err);
      setError("Impossible d'effectuer l'estimation pour le moment.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !isUnlocked) return;
    const timer = setTimeout(() => {
      runEstimation(formData);
    }, 280);
    return () => clearTimeout(timer);
  }, [isOpen, isUnlocked, formData, runEstimation]);

  if (!isOpen) return null;

  const currentPopulars = POPULAR_NEIGHBORHOODS[formData.city] || POPULAR_NEIGHBORHOODS['Yaoundé'];

  const formatPrice = (val) => {
    if (!val && val !== 0) return '---';
    return Number(val).toLocaleString('fr-FR');
  };

  const handleApply = () => {
    if (onApplyPrice && result?.estimated_price) {
      onApplyPrice(result.estimated_price);
      onClose();
    }
  };

  return (
    <div className={`rent-modal-overlay ${isLightMode ? 'theme-light' : 'theme-dark'}`} onClick={onClose}>
      <div className="rent-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* ══ HEADER LUXE & PRO ══ */}
        <div className="rent-modal-header">
          <div className="rent-modal-title-group">
            <div className="rent-modal-icon-badge">
              <Icons.SparkleAI />
            </div>
            <div>
              <div className="rent-header-badge-row">
                <h2 className="rent-modal-title">{t('rent_estimator.title')}</h2>
                <span className="rent-spam-tag">[Modèle Prédictif 2026]</span>
              </div>
              <p className="rent-modal-subtitle">
                Algorithme calibré sur +10 000 transactions réelles du marché camerounais
              </p>
            </div>
          </div>

          <div className="rent-header-actions">
            <button
              type="button"
              className="rent-theme-btn"
              onClick={toggleTheme}
              title={isLightMode ? "Passer en mode sombre" : "Passer en mode clair"}
            >
              {isLightMode ? <Icons.Moon /> : <Icons.Sun />}
              <span className="rent-theme-btn-text">{isLightMode ? "Sombre" : "Clair"}</span>
            </button>

            <button className="rent-modal-close-btn" onClick={onClose} aria-label="Fermer">
              <Icons.Close />
            </button>
          </div>
        </div>

        {/* ══ BODY 2 COLONNES (FORMULAIRE + RÉSULTAT IA) ══ */}
        <div className="rent-modal-body">
          
          {/* COLONNE GAUCHE : FORMULAIRE PRO */}
          <div className="rent-form-section">
            
            {/* Ville & Type de Bien */}
            <div className="rent-row-2">
              <div className="rent-form-group">
                <label className="rent-label">
                  <span className="rent-label-text">
                    <Icons.MapPin />
                    <span>Ville</span>
                  </span>
                  <span className="rent-spam-badge">[Zone Active]</span>
                </label>
                <select
                  className="rent-select"
                  value={formData.city}
                  onChange={(e) => {
                    const newCity = e.target.value;
                    const defaultNeigh = POPULAR_NEIGHBORHOODS[newCity]?.[0] || '';
                    setFormData(prev => ({ ...prev, city: newCity, neighborhood: defaultNeigh }));
                  }}
                >
                  <option value="Yaoundé">Yaoundé</option>
                  <option value="Douala">Douala</option>
                  <option value="Kribi">Kribi</option>
                  <option value="Bafoussam">Bafoussam</option>
                </select>
              </div>

              <div className="rent-form-group">
                <label className="rent-label">
                  <span className="rent-label-text">
                    <Icons.Building />
                    <span>Type de bien</span>
                  </span>
                </label>
                <select
                  className="rent-select"
                  value={formData.property_type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    const spec = DEFAULT_TYPE_SPECS[newType] || { surface: 70, bedrooms: 2, bathrooms: 1 };
                    setFormData(prev => ({
                      ...prev,
                      property_type: newType,
                      surface: spec.surface,
                      bedrooms: spec.bedrooms,
                      bathrooms: spec.bathrooms
                    }));
                  }}
                >
                  <option value="APPARTEMENT">Appartement</option>
                  <option value="STUDIO">Studio</option>
                  <option value="CHAMBRE">Chambre</option>
                  <option value="VILLA">Villa</option>
                  <option value="DUPLEX">Duplex</option>
                  <option value="MAISON">Maison</option>
                  <option value="PENTHOUSE">Penthouse</option>
                  <option value="BUREAU">Bureau</option>
                </select>
              </div>
            </div>

            {/* Quartier avec tags rapides Pro */}
            <div className="rent-form-group">
              <label className="rent-label">
                <span className="rent-label-text">
                  <Icons.MapPin />
                  <span>Quartier & Secteur</span>
                </span>
                <span className="rent-label-hint">Impact direct sur la prédiction</span>
              </label>
              <input
                type="text"
                className="rent-input"
                placeholder="Ex: Bastos, Bonapriso, Odza, Santa Barbara..."
                value={formData.neighborhood}
                onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
              />
              <div className="rent-quick-tags">
                {currentPopulars.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`rent-tag-pill ${formData.neighborhood === n ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, neighborhood: n }))}
                  >
                    <span>{n}</span>
                    {formData.neighborhood === n && <span className="rent-tag-check">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Surface & Chambres */}
            <div className="rent-row-2">
              <div className="rent-form-group">
                <label className="rent-label">
                  <span className="rent-label-text">
                    <Icons.Maximize />
                    <span>Surface habitable</span>
                  </span>
                  <span className="rent-val-highlight">{formData.surface} m²</span>
                </label>
                <div className="rent-input-with-unit">
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    className="rent-input"
                    value={formData.surface}
                    onChange={(e) => setFormData(prev => ({ ...prev, surface: Math.max(10, Number(e.target.value)) }))}
                  />
                  <span className="rent-unit-tag">m²</span>
                </div>
              </div>

              <div className="rent-form-group">
                <label className="rent-label">
                  <span className="rent-label-text">
                    <Icons.Bed />
                    <span>Nombre de chambres</span>
                  </span>
                </label>
                <div className="rent-stepper">
                  <button
                    type="button"
                    className="rent-stepper-btn"
                    onClick={() => setFormData(prev => ({ ...prev, bedrooms: Math.max(0, prev.bedrooms - 1) }))}
                    aria-label="Diminuer les chambres"
                  >-</button>
                  <span className="rent-stepper-val">
                    {formData.bedrooms} {formData.bedrooms > 1 ? 'chambres' : 'chambre'}
                  </span>
                  <button
                    type="button"
                    className="rent-stepper-btn"
                    onClick={() => setFormData(prev => ({ ...prev, bedrooms: prev.bedrooms + 1 }))}
                    aria-label="Augmenter les chambres"
                  >+</button>
                </div>
              </div>
            </div>

            {/* Niveau de Standing */}
            <div className="rent-form-group">
              <label className="rent-label">
                <span className="rent-label-text">
                  <Icons.Award />
                  <span>Niveau de Standing & Finitions</span>
                </span>
              </label>
              <div className="rent-pills-group">
                {[
                  { id: 'Économique', label: 'Économique', badge: 'Standard' },
                  { id: 'Standard', label: 'Standard', badge: 'Équilibré' },
                  { id: 'Haut standing', label: 'Haut Standing', badge: 'Supérieur' },
                  { id: 'Luxe', label: 'Luxe Prestige', badge: 'Premium' },
                ].map((std) => (
                  <button
                    key={std.id}
                    type="button"
                    className={`rent-pill-option ${formData.standing === std.id ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, standing: std.id }))}
                  >
                    <span className="rent-pill-main">{std.label}</span>
                    <span className="rent-pill-sub">[{std.badge}]</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Équipements Clés Décisifs (Spams Professionnels / Badges certifiés) */}
            <div className="rent-form-group">
              <div className="rent-equipments-header">
                <label className="rent-label" style={{ marginBottom: 0 }}>
                  <span className="rent-label-text">
                    <Icons.SparkleAI />
                    <span>Équipements Décisifs</span>
                  </span>
                </label>
                <span className="rent-spam-badge-gold">[Valorisation Immédiate]</span>
              </div>
              
              <div className="rent-toggles-grid">
                
                {/* Forage */}
                <div
                  className={`rent-toggle-item ${formData.has_forage ? 'checked' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, has_forage: !prev.has_forage }))}
                >
                  <div className="rent-toggle-label">
                    <div className="rent-toggle-icon-wrap"><Icons.Droplet /></div>
                    <div className="rent-toggle-text-wrap">
                      <span className="rent-toggle-title">{t('rent_estimator.borehole')}</span>
                      <span className="rent-toggle-spam">[Eau Continue H24]</span>
                    </div>
                  </div>
                  <div className="rent-toggle-switch"><div className="rent-toggle-knob"/></div>
                </div>

                {/* Solaire / Groupe */}
                <div
                  className={`rent-toggle-item ${formData.has_generator ? 'checked' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, has_generator: !prev.has_generator }))}
                >
                  <div className="rent-toggle-label">
                    <div className="rent-toggle-icon-wrap"><Icons.Zap /></div>
                    <div className="rent-toggle-text-wrap">
                      <span className="rent-toggle-title">Groupe / Solaire</span>
                      <span className="rent-toggle-spam">[Zéro Coupure]</span>
                    </div>
                  </div>
                  <div className="rent-toggle-switch"><div className="rent-toggle-knob"/></div>
                </div>

                {/* Meublé & Équipé */}
                <div
                  className={`rent-toggle-item ${formData.furnished ? 'checked' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, furnished: !prev.furnished }))}
                >
                  <div className="rent-toggle-label">
                    <div className="rent-toggle-icon-wrap"><Icons.Sofa /></div>
                    <div className="rent-toggle-text-wrap">
                      <span className="rent-toggle-title">Meublé & Équipé</span>
                      <span className="rent-toggle-spam">[Prêt à Habiter]</span>
                    </div>
                  </div>
                  <div className="rent-toggle-switch"><div className="rent-toggle-knob"/></div>
                </div>

                {/* Sécurité 24/7 */}
                <div
                  className={`rent-toggle-item ${formData.has_security ? 'checked' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, has_security: !prev.has_security }))}
                >
                  <div className="rent-toggle-label">
                    <div className="rent-toggle-icon-wrap"><Icons.Shield /></div>
                    <div className="rent-toggle-text-wrap">
                      <span className="rent-toggle-title">{t('rent_estimator.guard')}</span>
                      <span className="rent-toggle-spam">[Résidence Sécurisée]</span>
                    </div>
                  </div>
                  <div className="rent-toggle-switch"><div className="rent-toggle-knob"/></div>
                </div>

              </div>
            </div>

            {/* Distance du Goudron */}
            <div className="rent-form-group">
              <div className="rent-distance-header">
                <label className="rent-label" style={{ marginBottom: 0 }}>
                  <span className="rent-label-text">
                    <Icons.Road />
                    <span>{t('rent_estimator.distance_tarred')}</span>
                  </span>
                </label>
                <span className="rent-val-distance">
                  {formData.distance_goudron <= 30 ? '[Bordure Goudron Direct]' : `[Accès à ${formData.distance_goudron}m]`}
                </span>
              </div>
              <div className="rent-slider-container">
                <input
                  type="range"
                  min="0"
                  max="600"
                  step="20"
                  value={formData.distance_goudron}
                  className="rent-range-slider"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    distance_goudron: Number(e.target.value),
                    road_access: Number(e.target.value) <= 30 ? 'GOUDRON_DIRECT' : (Number(e.target.value) <= 100 ? 'PISTE_PROCHE' : 'PISTE_MOYENNE')
                  }))}
                />
                <div className="rent-slider-ticks">
                  <span>0m (Bordure)</span>
                  <span>100m</span>
                  <span>300m</span>
                  <span>600m</span>
                </div>
              </div>
            </div>

          </div>

          {/* ══ COLONNE DROITE : RÉSULTATS PRÉDICTIFS IA ══ */}
          <div className="rent-result-section">
            
            {/* Header Résultat & Statut Débloqué */}
            <div className="rent-result-header">
              <div className="rent-result-header-left">
                <span className="rent-result-label-kpi">{t('rent_estimator.market_estimation')}</span>
                <span className="rent-spam-tag-live">{isUnlocked ? '● EN TEMPS RÉEL' : '[RAPPORT 4 PTS]'}</span>
              </div>
              <div className="rent-badge-confidence">
                <span className="rent-conf-dot"></span>
                <span>{isUnlocked ? `Fiabilité IA : ${result?.confidence_score || 96}%` : 'Précision IA Calibrée'}</span>
              </div>
            </div>

            {/* Alerte Erreur si API échoue */}
            {error && (
              <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', fontSize: '0.8rem', fontWeight: 600 }}>
                {error}
              </div>
            )}

            {!isUnlocked ? (
              /* ─── VUE VERROUILLÉE / PRÊTE POUR DÉBLOCAGE IA (4 POINTS) ─── */
              <div className="rent-locked-card">
                <div className="rent-locked-icon-wrap">
                  <Icons.SparkleAI />
                </div>
                <h3 className="rent-locked-title">Rapport Prédictif IA & Benchmarks</h3>
                <p className="rent-locked-desc">
                  Débloquez l'estimation algorithmique du loyer mensuel, la fourchette de négociation et les annonces comparables réelles.
                </p>

                <div className="rent-locked-features">
                  <div className="rent-locked-feature-item">
                    <span className="rent-locked-feature-check">✓</span>
                    <span>Loyer mensuel optimal & tarif au m²</span>
                  </div>
                  <div className="rent-locked-feature-item">
                    <span className="rent-locked-feature-check">✓</span>
                    <span>{t('rent_estimator.negotiation_range')}</span>
                  </div>
                  <div className="rent-locked-feature-item">
                    <span className="rent-locked-feature-check">✓</span>
                    <span>{t('rent_estimator.factors_desc')}</span>
                  </div>
                  <div className="rent-locked-feature-item">
                    <span className="rent-locked-feature-check">✓</span>
                    <span>{t('rent_estimator.comparables_desc')}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="rent-unlock-btn"
                  onClick={() => setPointModalOpen(true)}
                >
                  <Icons.SparkleAI />
                  <span>Obtenir l’Estimation IA (4 pts)</span>
                </button>

                <div className="rent-locked-subtext">
                  <span>Recharge en 1 clic par Orange Money & MTN MoMo</span>
                </div>
              </div>
            ) : (
              /* ─── VUE RÉSULTATS COMPLETS DÉBLOQUÉS ─── */
              <>
                {/* Prix Estimé Recommandé Principal */}
                <div className="rent-price-display">
                  <div className="rent-price-label-top">LOYER MENSUEL RECOMMANDÉ</div>
                  <div className="rent-price-main">
                    {loading ? (
                      <span className="rent-loading-pulse">{t('rent_estimator.calculating')}</span>
                    ) : (
                      <>
                        <span className="rent-price-number">{formatPrice(result?.estimated_price)}</span>
                        <span className="rent-price-currency">FCFA</span>
                      </>
                    )}
                  </div>
                  <div className="rent-price-sub">
                    Soit environ <strong>~{formatPrice(result?.price_per_sqm)} FCFA / m²</strong> par mois
                  </div>
                </div>

                {/* Fourchette de négociation Pro */}
                <div className="rent-range-box">
                  <div className="rent-range-item">
                    <span className="rent-range-label">{t('rent_estimator.min_range')}</span>
                    <span className="rent-range-val">{formatPrice(result?.price_min)} FCFA</span>
                  </div>
                  <div className="rent-range-separator">
                    <div className="rent-range-line"></div>
                    <span className="rent-range-tag">Marché</span>
                    <div className="rent-range-line"></div>
                  </div>
                  <div className="rent-range-item" style={{ textAlign: 'right' }}>
                    <span className="rent-range-label">{t('rent_estimator.max_range')}</span>
                    <span className="rent-range-val">{formatPrice(result?.price_max)} FCFA</span>
                  </div>
                </div>

                {/* {t('rent_estimator.key_factors')} */}
                {result?.factors && result.factors.length > 0 && (
                  <div className="rent-factors-box">
                    <div className="rent-factors-title">
                      <Icons.TrendingUp />
                      <span>{t('rent_estimator.key_factors')}</span>
                      <span className="rent-factors-count">({result.factors.length})</span>
                    </div>
                    <div className="rent-factors-list">
                      {result.factors.map((f, idx) => (
                        <div key={idx} className="rent-factor-row">
                          <div className="rent-factor-name">
                            <span className="rent-factor-title">{f.name}</span>
                            <span className="rent-factor-desc">{f.description}</span>
                          </div>
                          <span className={`rent-factor-val ${f.badge || 'gold'}`}>
                            {f.impact}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Biens Comparables sur Piolo */}
                {result?.comparables && result.comparables.length > 0 && (
                  <div className="rent-comparables-box">
                    <div className="rent-factors-title">
                      <Icons.Building />
                      <span>{t('rent_estimator.comparables_title')}</span>
                    </div>
                    <div className="rent-comparables-list">
                      {result.comparables.map((comp) => (
                        <a
                          key={comp.id}
                          href={`/properties/${comp.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rent-comp-card"
                        >
                          {comp.image_url ? (
                            <img src={comp.image_url} alt={comp.title} className="rent-comp-img" />
                          ) : (
                            <div className="rent-comp-img-placeholder">
                              <Icons.Building />
                            </div>
                          )}
                          <div className="rent-comp-info">
                            <div className="rent-comp-title">{comp.title}</div>
                            <div className="rent-comp-meta">
                              <span>{comp.neighborhood || comp.city}</span> • <span>{comp.surface} m²</span> • <span>{comp.bedrooms} ch.</span>
                            </div>
                          </div>
                          <div className="rent-comp-price">
                            {formatPrice(comp.price)} F
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bouton d'action principal */}
                <div className="rent-actions-wrapper">
                  {onApplyPrice ? (
                    <button type="button" className="rent-apply-btn" onClick={handleApply}>
                      <Icons.Check />
                      <span>Appliquer ce tarif ({formatPrice(result?.estimated_price)} FCFA)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="rent-apply-btn"
                      onClick={() => {
                        window.location.href = `/properties/create?price=${result?.estimated_price || ''}&city=${encodeURIComponent(formData.city)}&neighborhood=${encodeURIComponent(formData.neighborhood)}&property_type=${formData.property_type}&area=${formData.surface}&bedrooms=${formData.bedrooms}&standing=${encodeURIComponent(formData.standing)}`;
                      }}
                    >
                      <Icons.SparkleAI />
                      <span>Publier une annonce avec ce tarif</span>
                    </button>
                  )}
                </div>
              </>
            )}

            <div className="rent-model-tag">
              <span>Moteur Piolo ML 2.0</span> • <span>Régression Linéaire Multi-Facteurs</span> • <span>{t('rent_estimator.calibrated')}</span>
            </div>

          </div>

        </div>

      </div>

      {/* ── MODAL DE CONFIRMATION DE DÉBIT DE POINTS (ESTIMATION IA - 4 PTS) ── */}
      <PointConfirmationModal
        isOpen={pointModalOpen}
        actionKey="RENT_AI_ESTIMATE_REPORT"
        userRole="landlord"
        targetTitle={`Estimation Loyer IA : ${formData.property_type || 'Logement'}`}
        targetSubtitle={`${formData.city} • ${formData.neighborhood || 'Secteur'} • ${formData.surface} m² • ${formData.bedrooms} ch.`}
        onConfirm={() => {
          setIsUnlocked(true);
          setPointModalOpen(false);
          runEstimation(formData);
        }}
        onCancel={() => setPointModalOpen(false)}
        onOpenRecharge={() => {
          setPointModalOpen(false);
          setRechargeModalOpen(true);
        }}
      />

      {/* ── MODAL DE RECHARGE INSTANTANÉE BAILLEUR (OM / MOMO) ── */}
      {rechargeModalOpen && (
        <LandlordSubscriptionModal
          currentPoints={subscriptionService.getLandlordPoints()}
          onClose={() => setRechargeModalOpen(false)}
          onRechargeSuccess={() => {
            setRechargeModalOpen(false);
            setPointModalOpen(true);
          }}
          onSubscribeSuccess={() => {
            setRechargeModalOpen(false);
            setPointModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
