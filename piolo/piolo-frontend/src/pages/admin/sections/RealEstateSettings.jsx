import Glyph from '../components/Glyph';

export default function RealEstateSettings({ themeForm, setThemeForm }) {
  const rules = themeForm.real_estate_rules || {};

  const handleChange = (key, val) => {
    setThemeForm({
      ...themeForm,
      real_estate_rules: {
        ...rules,
        [key]: val,
      },
    });
  };

  return (
    <div id="cfg-realestate" className="config-section">
      <div className="config-section__head">
        <div className="config-section__head-left">
          <span className="config-section__icon"><Glyph name="home" size={17} /></span>
          <div>
            <div className="config-section__title">Moteur Immobilier &amp; Règles de Publication</div>
            <div className="config-section__desc">Contrôlez les critères des annonces, les visites 360°, l'Indice Terrain 237 et la gestion déléguée.</div>
          </div>
        </div>
      </div>
      <div className="config-section__body">
        {/* Modération & Annonces */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gold-deep)', marginBottom: 12 }}>
            1. Politiques des Annonces &amp; Modération
          </div>
          <div className="field-grid">
            <div className="field">
              <label>Auto-publication des bailleurs certifiés KYC</label>
              <select
                value={rules.auto_publish_verified_landlords ? 'YES' : 'NO'}
                onChange={e => handleChange('auto_publish_verified_landlords', e.target.value === 'YES')}
              >
                <option value="YES">Oui — Publication immédiate sans validation manuelle</option>
                <option value="NO">Non — Modération admin requise pour chaque annonce</option>
              </select>
            </div>
            <div className="field">
              <label>Nombre maximum de photos par annonce</label>
              <input
                type="number"
                min="5"
                max="50"
                value={rules.max_photos_per_property || 20}
                onChange={e => handleChange('max_photos_per_property', parseInt(e.target.value))}
                placeholder="20"
              />
            </div>
            <div className="field">
              <label>Durée de validité d'une annonce (jours)</label>
              <input
                type="number"
                min="15"
                max="365"
                value={rules.ad_validity_days || 60}
                onChange={e => handleChange('ad_validity_days', parseInt(e.target.value))}
                placeholder="60"
              />
            </div>
            <div className="field">
              <label>Protection anti-fraude (Masquage auto numéros)</label>
              <select
                value={rules.sanitize_contact_info !== false ? 'ACTIVE' : 'INACTIVE'}
                onChange={e => handleChange('sanitize_contact_info', e.target.value === 'ACTIVE')}
              >
                <option value="ACTIVE">Actif — Masque les 6XX... dans titres &amp; descriptions</option>
                <option value="INACTIVE">Inactif — Autoriser numéros visibles</option>
              </select>
            </div>
          </div>
        </div>

        {/* Visites & Gestion Déléguée */}
        <div style={{ paddingTop: 18, borderTop: '1px dashed var(--line)', marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gold-deep)', marginBottom: 12 }}>
            2. Visites &amp; Service "Gestion Déléguée &amp; Clé en Main"
          </div>
          <div className="field-grid">
            <div className="field">
              <label>Frais de réservation de visite physique (FCFA)</label>
              <input
                type="number"
                value={rules.visit_reservation_fee_fcfa ?? 2500}
                onChange={e => handleChange('visit_reservation_fee_fcfa', parseInt(e.target.value))}
                placeholder="2500"
              />
            </div>
            <div className="field">
              <label>Commission Gestion Déléguée Piolo (%)</label>
              <input
                type="number"
                min="1"
                max="25"
                value={rules.delegated_mgmt_commission_pct ?? 8}
                onChange={e => handleChange('delegated_mgmt_commission_pct', parseInt(e.target.value))}
                placeholder="8"
              />
            </div>
            <div className="field">
              <label>Visite 360° requise pour biens Premium / Villas</label>
              <select
                value={rules.require_360_for_luxury ? 'YES' : 'NO'}
                onChange={e => handleChange('require_360_for_luxury', e.target.value === 'YES')}
              >
                <option value="YES">Obligatoire pour les biens de plus de 300 000 FCFA</option>
                <option value="NO">Optionnelle pour tous les types de biens</option>
              </select>
            </div>
            <div className="field">
              <label>Délai minimum de réservation de visite</label>
              <select
                value={rules.min_visit_notice_hours || 4}
                onChange={e => handleChange('min_visit_notice_hours', parseInt(e.target.value))}
              >
                <option value={2}>2 heures à l'avance</option>
                <option value={4}>4 heures à l'avance (Recommandé)</option>
                <option value={24}>24 heures à l'avance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Indice Terrain 237 */}
        <div style={{ paddingTop: 18, borderTop: '1px dashed var(--line)' }}>
          <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gold-deep)', marginBottom: 12 }}>
            3. Indice de Vie du Quartier (Spécificités Terrain Cameroun)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { key: 'enable_water_index', label: 'Eau : Forage & CAMWATER' },
              { key: 'enable_electricity_index', label: 'Électricité : Prépayé / Solaire' },
              { key: 'enable_road_index', label: 'Accès route : Goudron / Piste' },
              { key: 'enable_network_index', label: 'Couverture 4G/5G MTN & Orange' },
              { key: 'enable_flood_risk_index', label: 'Indice risque d\'inondation' },
            ].map(item => {
              const enabled = rules[item.key] !== false;
              return (
                <label
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: enabled ? 'rgba(212,175,55,0.08)' : 'var(--paper)',
                    border: `1px solid ${enabled ? 'rgba(212,175,55,0.35)' : 'var(--line)'}`,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--ink)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={e => handleChange(item.key, e.target.checked)}
                  />
                  <span>{item.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
