import Glyph from '../components/Glyph';

export default function FeatureFlagSettings({ themeForm, setThemeForm }) {
  const flags = themeForm.feature_flags || {};

  const toggleFlag = (key) => {
    setThemeForm({
      ...themeForm,
      feature_flags: {
        ...flags,
        [key]: !flags[key],
      },
    });
  };

  const featureList = [
    { key: 'virtual_tour_360', label: 'Visite 360° Interactive & Éditeur Pannellum', desc: 'Permet aux bailleurs d\'intégrer des panoramas 360° et de créer des visites virtuelles immersives' },
    { key: 'discovery_reels', label: 'Mode Découverte Vidéo Reel (Courtes vidéos)', desc: 'Flux vidéo plein écran vertical des plus beaux biens façon réseaux sociaux' },
    { key: 'rent_estimator_ai', label: 'Simulateur d\'Estimation de Loyer IA', desc: 'Outil prédictif pour bailleurs et locataires estimant le loyer juste par quartier' },
    { key: 'realtime_chat_voice', label: 'Messagerie WebSocket & Notes Vocales', desc: 'Canal de discussion instantané direct entre locataires, bailleurs et support Piolo' },
    { key: 'satellite_map', label: 'Carte Interactive des Quartiers (Leaflet)', desc: 'Exploration cartographique des biens avec géolocalisation et repères de standing' },
    { key: 'pro_marketplace', label: 'Espace Artisans, Décorateurs & Architectes', desc: 'Annuaire de professionnels BTP vérifiés avec demande de devis et séquestre Protec' },
    { key: 'tenant_single_dossier', label: 'Dossier Unique de Location & Solvabilité', desc: 'Constitution d\'un passeport locatif vérifié pour postuler en un clic' },
    { key: 'point_payments', label: 'Paiement par Points & Programme Parrainage', desc: 'Permet d\'utiliser les points fidélité pour payer les boosts d\'annonces' },
    { key: 'strict_kyc_verification', label: 'Vérification KYC Stricte avec Selfie', desc: 'Exiger la reconnaissance faciale avec CNI avant d\'octroyer le badge de vérification' },
    { key: 'data_saver_mode', label: 'Mode Économie de Données (Optimisation 237)', desc: 'Compression automatique des images et lazy loading avancé pour connexions mobiles' },
    { key: 'search_alerts_auto', label: 'Alertes Automatiques de Biens', desc: 'Notification push et email dès qu\'un logement correspond aux critères d\'un chercheur' },
  ];

  return (
    <div id="cfg-features" className="config-section">
      <div className="config-section__head">
        <div className="config-section__head-left">
          <span className="config-section__icon"><Glyph name="flag" size={17} /></span>
          <div>
            <div className="config-section__title">Modules Système &amp; Feature Flags</div>
            <div className="config-section__desc">Activez ou désactivez instantanément les fonctionnalités clés de la plateforme sans redéploiement.</div>
          </div>
        </div>
      </div>
      <div className="config-section__body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {featureList.map(({ key, label, desc }) => {
            const isActive = flags[key] !== false;
            return (
              <div
                key={key}
                style={{
                  background: 'var(--paper)',
                  borderRadius: 14,
                  padding: '14px 18px',
                  border: `1px solid ${isActive ? 'rgba(212,175,55,0.3)' : 'var(--line)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  transition: 'all .2s ease',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' }}>{label}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 2 }}>{desc}</div>
                </div>
                <div
                  style={{ position: 'relative', width: 44, height: 24, flexShrink: 0, cursor: 'pointer' }}
                  onClick={() => toggleFlag(key)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Bascule ${label}`}
                >
                  <div style={{ position: 'absolute', inset: 0, borderRadius: 12, background: isActive ? 'var(--gold)' : 'var(--line)', transition: 'background .2s' }}>
                    <div style={{ position: 'absolute', left: isActive ? 'calc(100% - 20px)' : 2, top: 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
