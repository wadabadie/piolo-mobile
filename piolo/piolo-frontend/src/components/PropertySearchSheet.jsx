// src/components/PropertySearchSheet.jsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const CITIES = [
  'Yaoundé', 'Douala', 'Bafoussam', 'Kribi', 'Limbe', 
  'Garoua', 'Bamenda', 'Buea', 'Bertoua', 'Maroua'
];

const POPULAR_NEIGHBORHOODS = {
  'Yaoundé': ['Bastos', 'Odza', 'Ngousso', 'Omnisports', 'Santa Barbara', 'Elig-Edzoa', 'Mendong', 'Biyem-Assi', 'Nlongkak', 'Emana'],
  'Douala': ['Bonapriso', 'Akwa', 'Bonamoussadi', 'Denver', 'Makepe', 'Bali', 'Kotto', 'Logpom', 'Deido', 'Bonanjo'],
  'Kribi': ['Centre-ville', 'Grand Batanga', 'Mpalla', 'Mboa Manga'],
  'Bafoussam': ['Djeleng', 'Banengo', 'Kamkop', 'Famla']
};

const AMENITIES = [
  { id: 'water', label: 'Eau 24/7 · Forage', icon: 'fa-tint' },
  { id: 'generator', label: 'Groupe électrogène', icon: 'fa-bolt' },
  { id: 'ac', label: 'Climatisation', icon: 'fa-snowflake' },
  { id: 'parking', label: 'Parking sécurisé', icon: 'fa-car' },
  { id: 'furnished', label: 'Meublé', icon: 'fa-couch' },
  { id: 'security', label: 'Gardien 24/7', icon: 'fa-shield-alt' },
  { id: 'pool', label: 'Piscine', icon: 'fa-swimming-pool' },
  { id: 'wifi', label: 'Fibre Optique / Wi-Fi', icon: 'fa-wifi' },
];

export default function PropertySearchSheet({
  isOpen,
  onClose,
  filters,
  onChange,
  onApply,
  onReset
}) {
  const { t } = useTranslation();
  const [citySearch, setCitySearch] = useState('');
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'amenities'

  // Verrouillage du scroll arrière-plan
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentCity = filters.city || '';
  const neighborhoodsList = currentCity && POPULAR_NEIGHBORHOODS[currentCity]
    ? POPULAR_NEIGHBORHOODS[currentCity]
    : ['Bastos', 'Bonapriso', 'Akwa', 'Odza', 'Bonamoussadi', 'Ngousso', 'Denver', 'Kotto'];

  const filteredCities = CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()));

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 15000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      background: 'rgba(15, 13, 9, 0.72)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      animation: 'fadeIn 0.25s ease'
    }} onClick={onClose}>
      <div
        style={{
          background: '#ffffff',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          maxHeight: '90dvh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -15px 50px rgba(0,0,0,0.3)',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Poignée de glissement tactile */}
        <div style={{ padding: '14px 0 6px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 48, height: 5, borderRadius: 3, background: '#D1D5DB' }} />
        </div>

        {/* En-tête Haute Finition */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 24px 16px',
          borderBottom: '1px solid #F3F4F6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(246,211,101,0.35))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#B8860B'
            }}>
              <i className="fas fa-sliders-h" style={{ fontSize: 15 }}></i>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, fontFamily: 'Poppins, sans-serif', color: '#111827' }}>
                {t('property_search.sheet_title', 'Filtres de recherche')}
              </h3>
              <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>Affinez selon vos critères exacts</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            style={{
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: 10,
              padding: '6px 12px',
              color: '#B8860B',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <i className="fas fa-undo-alt" style={{ fontSize: 11 }}></i> {t('property_search.reset', 'Réinitialiser')}
          </button>
        </div>

        {/* Onglets rapides (Critères Principaux / Équipements & Confort) */}
        <div style={{ display: 'flex', padding: '10px 24px 0', gap: 12, borderBottom: '1px solid #F3F4F6' }}>
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            style={{
              padding: '8px 14px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'general' ? '2.5px solid #D4AF37' : '2.5px solid transparent',
              color: activeTab === 'general' ? '#111827' : '#6B7280',
              fontWeight: activeTab === 'general' ? 800 : 600,
              fontSize: 13,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <i className="fas fa-map-marker-alt" style={{ color: activeTab === 'general' ? '#D4AF37' : '#9CA3AF' }}></i> {t('property_search.tab_general', 'Localisation & Type')}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('amenities')}
            style={{
              padding: '8px 14px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'amenities' ? '2.5px solid #D4AF37' : '2.5px solid transparent',
              color: activeTab === 'amenities' ? '#111827' : '#6B7280',
              fontWeight: activeTab === 'amenities' ? 800 : 600,
              fontSize: 13,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <i className="fas fa-check-circle" style={{ color: activeTab === 'amenities' ? '#D4AF37' : '#9CA3AF' }}></i> {t('property_search.tab_amenities', 'Confort & Options')}
          </button>
        </div>

        {/* Corps des Filtres Déroulant */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
          
          {activeTab === 'general' ? (
            <>
              {/* 1. Transaction Type */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                  <i className="fas fa-tag" style={{ color: '#D4AF37' }}></i> {t('property_search.transaction_type', 'Type de Transaction')}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { val: '', label: t('property_search.all_transactions', 'Toutes') },
                    { val: 'LOCATION', label: t('property.rental', 'Location') },
                    { val: 'VENTE', label: t('property.sale', 'Vente') }
                  ].map((t) => {
                    const isSelected = (filters.transaction_type || filters.transaction) === t.val || (!filters.transaction_type && !filters.transaction && t.val === '');
                    return (
                      <button
                        key={t.val}
                        type="button"
                        onClick={() => onChange({ transaction_type: t.val, transaction: t.val })}
                        style={{
                          padding: '11px 8px',
                          borderRadius: 12,
                          border: isSelected ? '1.5px solid #D4AF37' : '1px solid #E5E7EB',
                          background: isSelected ? 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(246,211,101,0.22))' : '#F9FAFB',
                          color: isSelected ? '#7A5B0B' : '#4B5563',
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: 13,
                          cursor: 'pointer',
                          boxShadow: isSelected ? '0 2px 8px rgba(212,175,55,0.2)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Villes du Cameroun */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <i className="fas fa-city" style={{ color: '#D4AF37' }}></i> {t('property_search.city_label', 'Ville')}
                  </label>
                  {filters.city && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#D4AF37' }}>
                      {filters.city}
                    </span>
                  )}
                </div>

                {/* Recherche rapide de ville */}
                <div style={{ position: 'relative', marginBottom: 10 }}>
                  <i className="fas fa-search" style={{ position: 'absolute', left: 12, top: 12, color: '#9CA3AF', fontSize: 13 }}></i>
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    placeholder={t('property_search.city_filter_placeholder', 'Filtrer parmi les villes...')}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 34px',
                      borderRadius: 10,
                      border: '1px solid #E5E7EB',
                      fontSize: 13,
                      background: '#F9FAFB',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Grille de sélection des villes */}
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
                  <button
                    type="button"
                    onClick={() => onChange({ city: '' })}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 12,
                      border: !filters.city ? '1.5px solid #D4AF37' : '1px solid #E5E7EB',
                      background: !filters.city ? 'rgba(212,175,55,0.15)' : '#fff',
                      color: !filters.city ? '#7A5B0B' : '#4B5563',
                      fontWeight: !filters.city ? 800 : 600,
                      fontSize: 13,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    Toutes les villes
                  </button>
                  {filteredCities.map((city) => {
                    const isSelected = filters.city === city;
                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() => onChange({ city })}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 12,
                          border: isSelected ? '1.5px solid #D4AF37' : '1px solid #E5E7EB',
                          background: isSelected ? 'rgba(212,175,55,0.15)' : '#fff',
                          color: isSelected ? '#7A5B0B' : '#4B5563',
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: 13,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          transition: 'all 0.15s'
                        }}
                      >
                        {city}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Quartier / Zone */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                  <i className="fas fa-map-pin" style={{ color: '#D4AF37' }}></i> {t('property_search.neighborhood_label', 'Quartier / Secteur')}
                </label>
                <div style={{ position: 'relative', marginBottom: 10 }}>
                  <i className="fas fa-compass" style={{ position: 'absolute', left: 12, top: 12, color: '#9CA3AF', fontSize: 13 }}></i>
                  <input
                    type="text"
                    value={filters.neighborhood || ''}
                    onChange={(e) => onChange({ neighborhood: e.target.value })}
                    placeholder={t('property_search.neighborhood_placeholder', 'Tapez un quartier (ex: Bastos, Bonapriso, Odza)...')}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 34px',
                      borderRadius: 12,
                      border: '1.5px solid #E5E7EB',
                      fontSize: 14,
                      outline: 'none',
                      background: '#F9FAFB'
                    }}
                  />
                </div>

                {/* Suggestions de quartiers populaires */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {neighborhoodsList.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => onChange({ neighborhood: filters.neighborhood === n ? '' : n })}
                      style={{
                        padding: '5px 11px',
                        borderRadius: 20,
                        border: filters.neighborhood === n ? '1px solid #D4AF37' : '1px solid #E5E7EB',
                        background: filters.neighborhood === n ? 'rgba(212,175,55,0.15)' : '#F3F4F6',
                        color: filters.neighborhood === n ? '#7A5B0B' : '#4B5563',
                        fontSize: 12,
                        fontWeight: filters.neighborhood === n ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Type de bien / Catégorie */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                  <i className="fas fa-home" style={{ color: '#D4AF37' }}></i> {t('property_search.property_type', 'Type de bien')}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { val: '', label: t('property_list.all', 'Tous'), icon: 'fa-th' },
                    { val: 'APPARTEMENT', label: t('property.apartment', 'Appartement'), icon: 'fa-building' },
                    { val: 'STUDIO', label: t('property.studio', 'Studio'), icon: 'fa-door-open' },
                    { val: 'VILLA', label: t('property.villa', 'Villa'), icon: 'fa-landmark' },
                    { val: 'CHAMBRE', label: t('property.room', 'Chambre'), icon: 'fa-bed' },
                    { val: 'TERRAIN', label: t('property.land', 'Terrain'), icon: 'fa-vector-square' }
                  ].map((cat) => {
                    const isSelected = (filters.property_type || filters.type) === cat.val || (!filters.property_type && !filters.type && cat.val === '');
                    return (
                      <button
                        key={cat.val}
                        type="button"
                        onClick={() => onChange({ property_type: cat.val, type: cat.val })}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 12,
                          border: isSelected ? '1.5px solid #D4AF37' : '1px solid #E5E7EB',
                          background: isSelected ? 'rgba(212,175,55,0.15)' : '#fff',
                          color: isSelected ? '#7A5B0B' : '#4B5563',
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: 12,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <i className={`fas ${cat.icon}`} style={{ fontSize: 14, color: isSelected ? '#D4AF37' : '#9CA3AF' }}></i>
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Budget Max */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <i className="fas fa-coins" style={{ color: '#D4AF37' }}></i> {t('property_search.budget_max', 'Budget max')}
                  </label>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#B8860B', fontFamily: 'Poppins, sans-serif' }}>
                    {filters.max_price ? `${Number(filters.max_price).toLocaleString('fr-FR')} FCFA` : t('property.unlimited', 'Illimité')}
                  </span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="1500000"
                  step="10000"
                  value={filters.max_price || 1500000}
                  onChange={(e) => onChange({ max_price: e.target.value >= 1500000 ? '' : e.target.value })}
                  style={{ width: '100%', accentColor: '#D4AF37', height: 6, cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                  <span>20 000 FCFA</span>
                  <span>500 000 FCFA</span>
                  <span>1 500 000+ FCFA</span>
                </div>
              </div>

              {/* 6. Nombre de Chambres */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                  <i className="fas fa-bed" style={{ color: '#D4AF37' }}></i> {t('property_search.bedrooms_label', 'Chambres')}
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['', '1', '2', '3', '4+'].map((beds) => {
                    const isSelected = (filters.bedrooms || '') === beds;
                    return (
                      <button
                        key={beds}
                        type="button"
                        onClick={() => onChange({ bedrooms: isSelected ? '' : beds })}
                        style={{
                          flex: 1,
                          padding: '9px 0',
                          borderRadius: 12,
                          border: isSelected ? '1.5px solid #D4AF37' : '1px solid #E5E7EB',
                          background: isSelected ? 'rgba(212,175,55,0.15)' : '#F9FAFB',
                          color: isSelected ? '#7A5B0B' : '#4B5563',
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: 13,
                          cursor: 'pointer'
                        }}
                      >
                        {beds ? t('property_search.bedrooms_count', '{{count}} ch.', { count: beds }) : t('property_search.all_bedrooms', 'Toutes')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Onglet Confort & Options Avancées */}
              {/* Visite 3D toggle */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(246,211,101,0.18))',
                border: '1px solid rgba(212,175,55,0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: '#0F0D09',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFE27A'
                  }}>
                    <i className="fas fa-vr-cardboard" style={{ fontSize: 16 }}></i>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>{t('property_search.virtual_tour_toggle', 'Visite virtuelle 360°')}</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{t('property_search.virtual_tour_sub', 'Uniquement les biens visitables à distance')}</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(filters.has_virtual_tour)}
                  onChange={(e) => onChange({ has_virtual_tour: e.target.checked })}
                  style={{ width: 22, height: 22, accentColor: '#D4AF37', cursor: 'pointer' }}
                />
              </div>

              {/* Bailleurs 100% Vérifiés */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: 16,
                background: '#F9FAFB',
                border: '1px solid #E5E7EB'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: 'rgba(16,185,129,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10B981'
                  }}>
                    <i className="fas fa-shield-alt" style={{ fontSize: 16 }}></i>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>{t('property_search.verified_landlords', 'Bailleurs vérifiés Piolo')}</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{t('property_search.verified_landlords_sub', 'Dossier CNI & titre vérifiés par nos experts')}</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(filters.is_verified)}
                  onChange={(e) => onChange({ is_verified: e.target.checked })}
                  style={{ width: 22, height: 22, accentColor: '#D4AF37', cursor: 'pointer' }}
                />
              </div>

              {/* ── Indice de Vie du Quartier (Terrain 237) ── */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                    <line x1="8" y1="2" x2="8" y2="18"></line>
                    <line x1="16" y1="6" x2="16" y2="22"></line>
                  </svg>
                  {t('property_search.terrain_realities', 'Réalités du Terrain & Quartier')}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Forage garanti */}
                  <div
                    onClick={() => onChange({ has_forage: !filters.has_forage })}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 14px', borderRadius: 14, cursor: 'pointer',
                      border: filters.has_forage ? '1.5px solid #0284C7' : '1px solid #E5E7EB',
                      background: filters.has_forage ? 'rgba(2,132,199,0.08)' : '#FFFFFF',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: 'rgba(2,132,199,0.12)', color: '#0284C7',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>{t('property_search.forage_guaranteed', 'Forage garanti')}</div>
                        <div style={{ fontSize: 11.5, color: '#6B7280' }}>{t('property_search.forage_sub', "Zéro coupure d'eau prolongée")}</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(filters.has_forage)}
                      onChange={() => {}}
                      style={{ width: 20, height: 20, accentColor: '#0284C7', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Compteur prépayé */}
                  <div
                    onClick={() => onChange({ is_prepaid: !filters.is_prepaid })}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 14px', borderRadius: 14, cursor: 'pointer',
                      border: filters.is_prepaid ? '1.5px solid #CA8A04' : '1px solid #E5E7EB',
                      background: filters.is_prepaid ? 'rgba(202,138,4,0.08)' : '#FFFFFF',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: 'rgba(202,138,4,0.12)', color: '#CA8A04',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>{t('property_search.prepaid_meter', 'Compteur prépayé individuel')}</div>
                        <div style={{ fontSize: 11.5, color: '#6B7280' }}>{t('property_search.prepaid_meter_sub', 'Maîtrise autonome de ses factures')}</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(filters.is_prepaid)}
                      onChange={() => {}}
                      style={{ width: 20, height: 20, accentColor: '#CA8A04', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Goudron direct */}
                  <div
                    onClick={() => onChange({ is_tarred: !filters.is_tarred })}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 14px', borderRadius: 14, cursor: 'pointer',
                      border: filters.is_tarred ? '1.5px solid #475569' : '1px solid #E5E7EB',
                      background: filters.is_tarred ? 'rgba(71,85,105,0.08)' : '#FFFFFF',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: 'rgba(71,85,105,0.12)', color: '#475569',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <line x1="4" y1="21" x2="8" y2="3"></line>
                          <line x1="20" y1="21" x2="16" y2="3"></line>
                          <line x1="12" y1="17" x2="12" y2="19"></line>
                          <line x1="12" y1="11" x2="12" y2="13"></line>
                          <line x1="12" y1="5" x2="12" y2="7"></line>
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>{t('property_search.tarred_road', 'Goudron direct')}</div>
                        <div style={{ fontSize: 11.5, color: '#6B7280' }}>{t('property_search.tarred_road_sub', "Accès bitumé jusqu'à la barrière")}</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(filters.is_tarred)}
                      onChange={() => {}}
                      style={{ width: 20, height: 20, accentColor: '#475569', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>

              {/* Équipements Sélectionnables */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                  <i className="fas fa-concierge-bell" style={{ color: '#D4AF37' }}></i> {t('property_search.key_amenities', 'Équipements clés')}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {AMENITIES.map((am) => {
                    const isChecked = Boolean(filters[am.id]);
                    return (
                      <button
                        key={am.id}
                        type="button"
                        onClick={() => onChange({ [am.id]: !isChecked })}
                        style={{
                          padding: '12px 10px',
                          borderRadius: 12,
                          border: isChecked ? '1.5px solid #D4AF37' : '1px solid #E5E7EB',
                          background: isChecked ? 'rgba(212,175,55,0.12)' : '#fff',
                          color: isChecked ? '#7A5B0B' : '#4B5563',
                          fontSize: 12,
                          fontWeight: isChecked ? 700 : 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          textAlign: 'left'
                        }}
                      >
                        <i className={`fas ${am.icon}`} style={{ color: isChecked ? '#D4AF37' : '#9CA3AF', fontSize: 13 }}></i>
                        <span>{am.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bouton d'Action Sticky Haut Standing */}
        <div style={{
          padding: '14px 24px 6px',
          borderTop: '1px solid #F3F4F6',
          background: '#ffffff',
          display: 'flex',
          gap: 12
        }}>
          <button
            type="button"
            onClick={() => { onApply(); onClose(); }}
            style={{
              flex: 1,
              padding: '15px 20px',
              borderRadius: 16,
              border: 'none',
              background: 'linear-gradient(135deg, #D4AF37, #F6D365)',
              color: '#0F0D09',
              fontFamily: 'Poppins, sans-serif',
              fontSize: 15,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(212,175,55,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <i className="fas fa-search"></i>
            <span>{t('property_search.show_results_btn', 'Afficher les résultats')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
