import Glyph from '../components/Glyph';

export default function FinancialSettings({ themeForm, setThemeForm }) {
  const fin = themeForm.financial_rules || {};

  const handleChange = (key, val) => {
    setThemeForm({
      ...themeForm,
      financial_rules: {
        ...fin,
        [key]: val,
      },
    });
  };

  return (
    <div id="cfg-financial" className="config-section">
      <div className="config-section__head">
        <div className="config-section__head-left">
          <span className="config-section__icon"><Glyph name="dollar" size={17} /></span>
          <div>
            <div className="config-section__title">Finances, Monétisation &amp; Passerelles de Paiement</div>
            <div className="config-section__desc">Gérez la grille tarifaire, les packs de boost, les commissions de séquestre et les canaux MoMo.</div>
          </div>
        </div>
      </div>
      <div className="config-section__body">
        {/* Tarifs des Annonces & Boosts */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gold-deep)', marginBottom: 12 }}>
            1. Grille des Boosts &amp; Publications (FCFA)
          </div>
          <div className="field-grid">
            <div className="field">
              <label>Publication standard (Bailleur non-certifié)</label>
              <input
                type="number"
                value={fin.standard_listing_price_fcfa ?? 2500}
                onChange={e => handleChange('standard_listing_price_fcfa', parseInt(e.target.value))}
                placeholder="2500"
              />
            </div>
            <div className="field">
              <label>Pack "Boost Flash 48h"</label>
              <input
                type="number"
                value={fin.boost_flash_price_fcfa ?? 3000}
                onChange={e => handleChange('boost_flash_price_fcfa', parseInt(e.target.value))}
                placeholder="3000"
              />
            </div>
            <div className="field">
              <label>Pack "Mise en avant Vedette 7 jours"</label>
              <input
                type="number"
                value={fin.spotlight_price_fcfa ?? 7500}
                onChange={e => handleChange('spotlight_price_fcfa', parseInt(e.target.value))}
                placeholder="7500"
              />
            </div>
            <div className="field">
              <label>Pack "Multiboost 30 jours (3x)"</label>
              <input
                type="number"
                value={fin.multiboost_price_fcfa ?? 18000}
                onChange={e => handleChange('multiboost_price_fcfa', parseInt(e.target.value))}
                placeholder="18000"
              />
            </div>
          </div>
        </div>

        {/* Commissions & Escrow Piolo Protec */}
        <div style={{ paddingTop: 18, borderTop: '1px dashed var(--line)', marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gold-deep)', marginBottom: 12 }}>
            2. Commissions, Séquestre "Piolo Protec" &amp; Fidélité
          </div>
          <div className="field-grid">
            <div className="field">
              <label>Commission sur loyers / baux signés (%)</label>
              <input
                type="number"
                min="0"
                max="20"
                value={fin.landlord_commission_pct ?? 5}
                onChange={e => handleChange('landlord_commission_pct', parseInt(e.target.value))}
                placeholder="5"
              />
            </div>
            <div className="field">
              <label>Taux d'acompte sécurisé Artisans / Pro (%)</label>
              <input
                type="number"
                min="10"
                max="90"
                value={fin.escrow_advance_pct ?? 40}
                onChange={e => handleChange('escrow_advance_pct', parseInt(e.target.value))}
                placeholder="40"
              />
            </div>
            <div className="field">
              <label>Valeur de conversion d'un Point Piolo (FCFA)</label>
              <input
                type="number"
                value={fin.point_value_fcfa ?? 50}
                onChange={e => handleChange('point_value_fcfa', parseInt(e.target.value))}
                placeholder="50"
              />
            </div>
            <div className="field">
              <label>Bonus parrainage nouvel utilisateur (Points)</label>
              <input
                type="number"
                value={fin.referral_bonus_points ?? 25}
                onChange={e => handleChange('referral_bonus_points', parseInt(e.target.value))}
                placeholder="25"
              />
            </div>
          </div>
        </div>

        {/* Passerelles de Paiement */}
        <div style={{ paddingTop: 18, borderTop: '1px dashed var(--line)' }}>
          <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gold-deep)', marginBottom: 12 }}>
            3. Canaux de Paiement Mobile Money &amp; Cartes
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { key: 'gateway_mtn_momo', label: 'MTN Mobile Money (*126#)' },
              { key: 'gateway_orange_money', label: 'Orange Money (*150#)' },
              { key: 'gateway_visa_mastercard', label: 'Cartes Visa / Mastercard' },
              { key: 'gateway_agency_cash', label: 'Dépôt / Espèces en Agence Piolo' },
            ].map(item => {
              const enabled = fin[item.key] !== false;
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
