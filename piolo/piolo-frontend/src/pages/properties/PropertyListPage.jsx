import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { propertiesApi } from '../../services/api';
import { cacheManager } from '../../services/cacheManager';
import Sidebar from '../../components/Sidebar';
import PropertyCard from '../../components/PropertyCard';
import PropertySearchSheet from '../../components/PropertySearchSheet';
import PioloLoader from '../../components/PioloLoader';
import { SkeletonCard } from '../../components/SkeletonCard';
import UserAvatarMenu from '../../components/UserAvatarMenu';
import { subscriptionService } from '../../services/subscriptionService';
import '../bailleur/dashboard.css';

const CITIES = ['Yaoundé', 'Douala', 'Bafoussam', 'Garoua', 'Maroua', 'Kribi', 'Limbe'];

export default function PropertyListPage() {
  const { t } = useTranslation();
  const [properties, setProperties] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [favoritePending, setFavoritePending] = useState({});
  const [feedback, setFeedback] = useState('');
  const [searchSheetOpen, setSearchSheetOpen] = useState(false);

  const TYPES = [
    ['', t('property_list.all_types')],
    ['APPARTEMENT', t('property.apartment')],
    ['VILLA', t('property.villa')],
    ['STUDIO', t('property.studio')],
    ['CHAMBRE', t('property.room')],
    ['BUREAU', 'Bureau'],
    ['BOUTIQUE', t('property.commercial')],
    ['IMMEUBLE', 'Immeuble'],
    ['TERRAIN', t('property.land')]
  ];

  const [filters, setFilters] = useState({
    q: '',
    city: '',
    neighborhood: '',
    type: '',
    min_price: '',
    max_price: '',
    transaction: '',
    bedrooms: '',
    has_virtual_tour: false,
    is_verified: false
  });

  const fetchProperties = (params) => {
    const apiParams = {};
    if (params.q) apiParams.search = params.q;
    if (params.city) apiParams.city = params.city;
    if (params.neighborhood) apiParams.neighborhood = params.neighborhood;
    if (params.type) apiParams.property_type = params.type;
    if (params.min_price) apiParams.min_price = params.min_price;
    if (params.max_price) apiParams.max_price = params.max_price;
    if (params.transaction) apiParams.transaction_type = params.transaction;
    if (params.owner) apiParams.owner = params.owner;
    if (params.bedrooms) apiParams.bedrooms = params.bedrooms;
    if (params.has_virtual_tour) apiParams.has_virtual_tour = 'true';
    if (params.is_verified) apiParams.is_verified = 'true';
    if (params.has_forage) apiParams.has_forage = 'true';
    if (params.is_prepaid) apiParams.is_prepaid = 'true';
    if (params.is_tarred) apiParams.is_tarred = 'true';

    const cacheKey = `properties_list_${JSON.stringify(apiParams)}`;
    const cached = cacheManager.get(cacheKey);

    if (cached) {
      setProperties(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError(false);

    propertiesApi.list(apiParams)
      .then(res => {
        let data = res.data.results || res.data;
        if (!Array.isArray(data)) data = [];
        if (params.owner === 'mine' && user?.id) {
          data = data.filter(p => p.owner?.id === user.id || p.owner === user.id || p.owner_id === user.id);
        }
        // Priorisation des annonces boostées en tête de résultats
        const sortedData = subscriptionService.sortPropertiesByBoost(data);
        setProperties(sortedData);
        cacheManager.set(cacheKey, sortedData, 120000);
      })
      .catch(err => {
        console.error(err);
        if (!cached) setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialFilters = {
      q: params.get('q') || '',
      city: params.get('city') || '',
      neighborhood: params.get('neighborhood') || '',
      type: params.get('type') || params.get('property_type') || '',
      min_price: params.get('min_price') || '',
      max_price: params.get('max_price') || '',
      transaction: params.get('transaction') || params.get('transaction_type') || '',
      owner: params.get('owner') || '',
      bedrooms: params.get('bedrooms') || '',
      has_virtual_tour: params.get('has_virtual_tour') === 'true',
      is_verified: params.get('is_verified') === 'true',
      has_forage: params.get('has_forage') === 'true',
      is_prepaid: params.get('is_prepaid') === 'true',
      is_tarred: params.get('is_tarred') === 'true'
    };
    setFilters(initialFilters);
    fetchProperties(initialFilters);
  }, [location.search]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    fetchProperties(filters);
  };

  const applyChipFilter = (newFilters) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    fetchProperties(updated);
  };

  const getMediaUrl = (path) => {
    if (!path) return '/img/placeholder-property.jpg';
    if (typeof path !== 'string') return '/img/placeholder-property.jpg';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return cleanPath;
  };

  const toggleFavorite = async (propertyId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (favoritePending[propertyId]) return;
    const current = properties.find((p) => p.id === propertyId);
    if (!current) return;
    const nextFavorite = !current.is_favorite;
    setFavoritePending((pending) => ({ ...pending, [propertyId]: true }));
    setProperties((items) => items.map((p) => p.id === propertyId ? {
      ...p,
      is_favorite: nextFavorite,
      favorites_count: Math.max(0, (p.favorites_count || 0) + (nextFavorite ? 1 : -1)),
    } : p));
    try {
      const res = await propertiesApi.toggleFavorite(propertyId);
      if (res.data.ok) {
        setProperties(prev => prev.map(p => {
          if (p.id === propertyId) {
            return { ...p, is_favorite: res.data.is_favorite, favorites_count: res.data.count };
          }
          return p;
        }));
        setFeedback(res.data.is_favorite ? t('property_list.fav_added') : t('property_list.fav_removed'));
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setProperties((items) => items.map((p) => p.id === propertyId ? current : p));
      setFeedback(t('property_list.fav_error'));
    } finally {
      setFavoritePending((pending) => ({ ...pending, [propertyId]: false }));
    }
  };

  return (
    <div className="layout">
      <Sidebar />

      <div className="main" style={{ overflowY: 'auto' }}>
        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-title">
            {filters.owner === 'mine' ? t('property_list.my_listings_title') : t('property_list.search_properties_title')}
          </div>
          <div className="tb-actions" style={{ marginLeft: 'auto' }}>
            <UserAvatarMenu size={38} />
          </div>
        </header>

        <main className="content">
          {feedback && (
            <div role="status" style={{ position:'fixed', right:24, bottom:24, zIndex:2000, background:'#0F0D09', color:'#fff', borderRadius:12, padding:'12px 16px', boxShadow:'0 10px 30px rgba(0,0,0,.2)', fontWeight:600 }}>
              {feedback}
              <button type="button" onClick={() => setFeedback('')} style={{ marginLeft:12, border:0, background:'transparent', color:'#F6D365', cursor:'pointer', fontSize:16 }}>×</button>
            </div>
          )}

          {/* ── Mobile Search Bar & Bottom Sheet Trigger ── */}
          <div className="mobile-search-trigger-bar" style={{ display: 'none', marginBottom: 16 }}>
            <div style={{
              display: 'flex',
              gap: 8,
              background: '#fff',
              padding: '6px 8px 6px 14px',
              borderRadius: 16,
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              border: '1.5px solid rgba(212,175,55,0.3)',
              alignItems: 'center'
            }}>
              <i className="fas fa-search" style={{ color: '#D4AF37', fontSize: 16 }}></i>
              <input
                type="text"
                value={filters.q}
                onChange={(e) => setFilters(f => ({ ...f, q: e.target.value }))}
                placeholder={t('property_list.search_placeholder')}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: 15,
                  color: '#1A1A1A',
                  background: 'transparent'
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(e); }}
              />
              <button
                type="button"
                onClick={() => setSearchSheetOpen(true)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 12,
                  background: 'rgba(212,175,55,0.12)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  color: '#92700C',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >
                <i className="fas fa-sliders-h"></i> {t('property_list.filters')}
              </button>
              <button
                type="button"
                onClick={handleSearch}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #D4AF37, #F6D365)',
                  border: 'none',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>

          {/* FORMULAIRE DE RECHERCHE PRINCIPAL (DESKTOP) */}
          <div className="search-form-desktop" style={{ background: '#fff', borderRadius: 22, border: '1.5px solid var(--gris-b)', padding: '24px 28px', marginBottom: 20, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            <form onSubmit={handleSearch}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={labelHeaderStyle}>
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="#A8891C"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    {t('property_list.city')}
                  </label>
                  <select value={filters.city} onChange={e => setFilters({...filters, city: e.target.value})} style={inputStyle}>
                    <option value="">{t('property_list.all_cities')}</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelHeaderStyle}>
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="#A8891C"><path d="M15 11V5l-3-3-3 3v6H3v10h18V11h-6zm-4-7.17l1.17-1.17 1.17 1.17V11h-2.34V3.83zM5 13h4v2H5v-2zm0 4h4v2H5v-2zm14 2h-4v-2h4v2zm0-4h-4v-2h4v2z"/></svg>
                    {t('property_list.neighborhood')}
                  </label>
                  <input type="text" value={filters.neighborhood} onChange={e => setFilters({...filters, neighborhood: e.target.value})} placeholder={t('property_list.neighborhood_placeholder')} style={inputStyle} />
                </div>

                <div>
                  <label style={labelHeaderStyle}>
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="#A8891C"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                    {t('property_list.property_type')}
                  </label>
                  <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})} style={inputStyle}>
                    {TYPES.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelHeaderStyle}>
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="#A8891C"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42z"/></svg>
                    {t('property_list.min_rent')}
                  </label>
                  <input type="number" min="0" value={filters.min_price} onChange={e => setFilters({...filters, min_price: e.target.value})} placeholder="Ex: 50 000" style={inputStyle} />
                </div>

                <div>
                  <label style={labelHeaderStyle}>
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="#A8891C"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42z"/></svg>
                    {t('property_list.max_rent')}
                  </label>
                  <input type="number" min="0" value={filters.max_price} onChange={e => setFilters({...filters, max_price: e.target.value})} placeholder="Ex: 250 000" style={inputStyle} />
                </div>

                <div>
                  <label style={labelHeaderStyle}>
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="#A8891C"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                    {t('property_list.transaction')}
                  </label>
                  <select value={filters.transaction} onChange={e => setFilters({...filters, transaction: e.target.value})} style={inputStyle}>
                    <option value="">{t('property_list.all_transactions')}</option>
                    <option value="LOCATION">{t('property_list.for_rent')}</option>
                    <option value="VENTE">{t('property_list.for_sale')}</option>
                  </select>
                </div>
              </div>

              <button type="submit" style={fullGoldBtnStyle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                {t('property_list.search_btn')}
              </button>
            </form>
          </div>

          {/* FILTRES RAPIDES (BOUTONS CHIPS) */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
            <button
              type="button"
              onClick={() => applyChipFilter({ transaction: '', type: '' })}
              style={chipStyle(!filters.transaction && !filters.type)}
            >
              {t('property_list.all')}
            </button>
            <button
              type="button"
              onClick={() => applyChipFilter({ transaction: 'LOCATION' })}
              style={chipStyle(filters.transaction === 'LOCATION')}
            >
              {t('property_list.for_rent')}
            </button>
            <button
              type="button"
              onClick={() => applyChipFilter({ transaction: 'VENTE' })}
              style={chipStyle(filters.transaction === 'VENTE')}
            >
              {t('property_list.for_sale')}
            </button>
            <button
              type="button"
              onClick={() => applyChipFilter({ type: 'APPARTEMENT' })}
              style={chipStyle(filters.type === 'APPARTEMENT')}
            >
              {t('property_list.apartments')}
            </button>
            <button
              type="button"
              onClick={() => applyChipFilter({ type: 'STUDIO' })}
              style={chipStyle(filters.type === 'STUDIO')}
            >
              {t('property_list.studios')}
            </button>
            <button
              type="button"
              onClick={() => applyChipFilter({ type: 'VILLA' })}
              style={chipStyle(filters.type === 'VILLA')}
            >
              {t('property_list.villas')}
            </button>

            {/* Chips Réalités du Terrain (237) */}
            <button
              type="button"
              onClick={() => applyChipFilter({ has_forage: !filters.has_forage })}
              style={{
                ...chipStyle(Boolean(filters.has_forage)),
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                borderColor: filters.has_forage ? '#0284C7' : 'var(--gris-b)',
                color: filters.has_forage ? '#0284C7' : 'inherit',
                background: filters.has_forage ? 'rgba(2,132,199,0.1)' : '#fff'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
              </svg>
              <span>{t('property_list.forage_guaranteed')}</span>
            </button>

            <button
              type="button"
              onClick={() => applyChipFilter({ is_prepaid: !filters.is_prepaid })}
              style={{
                ...chipStyle(Boolean(filters.is_prepaid)),
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                borderColor: filters.is_prepaid ? '#CA8A04' : 'var(--gris-b)',
                color: filters.is_prepaid ? '#CA8A04' : 'inherit',
                background: filters.is_prepaid ? 'rgba(202,138,4,0.1)' : '#fff'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <span>{t('property_list.prepaid_meter')}</span>
            </button>

            <button
              type="button"
              onClick={() => applyChipFilter({ is_tarred: !filters.is_tarred })}
              style={{
                ...chipStyle(Boolean(filters.is_tarred)),
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                borderColor: filters.is_tarred ? '#475569' : 'var(--gris-b)',
                color: filters.is_tarred ? '#475569' : 'inherit',
                background: filters.is_tarred ? 'rgba(71,85,105,0.1)' : '#fff'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <line x1="4" y1="21" x2="8" y2="3"></line>
                <line x1="20" y1="21" x2="16" y2="3"></line>
                <line x1="12" y1="17" x2="12" y2="19"></line>
                <line x1="12" y1="11" x2="12" y2="13"></line>
              </svg>
              <span>{t('property_list.direct_tar')}</span>
            </button>
          </div>

          {/* LISTE DES ANNONCES */}
          {loading ? (
            <div className="props-grid">
              {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 20, border: '1px solid var(--gris-b)' }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>⚠️</div>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', marginBottom: 8 }}>{t('property_list.load_error')}</h3>
              <p style={{ color: 'var(--gris-m)', marginBottom: 20 }}>{t('property_list.load_error_sub')}</p>
              <button onClick={() => fetchProperties(filters)} style={fullGoldBtnStyle}>{t('property_list.retry')}</button>
            </div>
          ) : properties.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 20, border: '1px solid var(--gris-b)' }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>🔍</div>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>{t('property_list.no_properties')}</h3>
              <p style={{ color: 'var(--gris-m)', fontSize: 14 }}>{t('property_list.no_properties_sub')}</p>
            </div>
          ) : (
            <div className="props-grid">
              {properties.map(prop => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  onFavChange={(id, fav) => {
                    setProperties(prev => prev.map(p => p.id === id ? { ...p, is_favorite: fav } : p));
                  }}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Bottom Sheet Modal pour Mobile */}
      <PropertySearchSheet
        isOpen={searchSheetOpen}
        onClose={() => setSearchSheetOpen(false)}
        filters={{
          city: filters.city,
          neighborhood: filters.neighborhood,
          transaction_type: filters.transaction,
          property_type: filters.type,
          max_price: filters.max_price,
          bedrooms: filters.bedrooms,
          has_virtual_tour: filters.has_virtual_tour,
          is_verified: filters.is_verified
        }}
        onChange={(f) => {
          setFilters(prev => ({
            ...prev,
            city: f.city !== undefined ? f.city : prev.city,
            neighborhood: f.neighborhood !== undefined ? f.neighborhood : prev.neighborhood,
            transaction: f.transaction_type !== undefined ? f.transaction_type : (f.transaction !== undefined ? f.transaction : prev.transaction),
            type: f.property_type !== undefined ? f.property_type : (f.type !== undefined ? f.type : prev.type),
            max_price: f.max_price !== undefined ? f.max_price : prev.max_price,
            bedrooms: f.bedrooms !== undefined ? f.bedrooms : prev.bedrooms,
            has_virtual_tour: f.has_virtual_tour !== undefined ? f.has_virtual_tour : prev.has_virtual_tour,
            is_verified: f.is_verified !== undefined ? f.is_verified : prev.is_verified
          }));
        }}
        onApply={() => fetchProperties(filters)}
        onReset={() => {
          const reset = { q: '', city: '', neighborhood: '', type: '', min_price: '', max_price: '', transaction: '', bedrooms: '', has_virtual_tour: false, is_verified: false };
          setFilters(reset);
          fetchProperties(reset);
        }}
      />
    </div>
  );
}

const labelHeaderStyle = { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#64605A', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'Poppins, sans-serif' };
const inputStyle = { width: '100%', boxSizing: 'border-box', border: '1.5px solid #E8E3DA', borderRadius: 12, padding: '11px 14px', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none', background: '#F9F8F6', color: '#0F0D09' };
const fullGoldBtnStyle = { width: '100%', border: 0, borderRadius: 14, padding: '13px 20px', background: 'linear-gradient(135deg,#D4AF37,#F6D365)', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, color: '#0F0D09', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 15px rgba(212,175,55,0.3)' };

const chipStyle = (active) => ({
  border: active ? 'none' : '1.5px solid var(--gris-b)',
  borderRadius: 30,
  padding: '8px 18px',
  fontFamily: 'Poppins, sans-serif',
  fontSize: 13,
  fontWeight: 700,
  background: active ? 'var(--noir)' : '#fff',
  color: active ? '#fff' : 'var(--noir)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: active ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
});
