import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { propertiesApi } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import NotificationCenter from '../../components/NotificationCenter';
import PropertyCard from '../../components/PropertyCard';
import { SkeletonCard } from '../../components/SkeletonCard';
import { useAuth } from '../../context/AuthContext';
import UserAvatarMenu from '../../components/UserAvatarMenu';
import '../bailleur/dashboard.css';

export default function FavoritesListPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, LOCATION, VENTE, 360
  const points = user?.points ?? 0;

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const { data } = await propertiesApi.favorites();
      const results = data.results || data;
      setFavorites(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleFavChange = (propertyId, isFav) => {
    if (!isFav) {
      setFavorites(prev => prev.filter(item => item.id !== propertyId));
    }
  };

  // Filtrage et recherche réactive
  const filteredFavorites = useMemo(() => {
    return favorites.filter(prop => {
      // Filtre de type
      if (filterType === 'LOCATION' && prop.transaction_type !== 'LOCATION') return false;
      if (filterType === 'VENTE' && prop.transaction_type !== 'VENTE') return false;
      if (filterType === '360' && !(prop.virtual_tours?.length > 0 || prop.has_360 || prop.has_virtual_tour)) return false;

      // Recherche par texte
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const title = (prop.title || '').toLowerCase();
        const city = (prop.city || '').toLowerCase();
        const type = (prop.property_type || '').toLowerCase();
        const hood = (prop.neighborhood || '').toLowerCase();
        return title.includes(query) || city.includes(query) || type.includes(query) || hood.includes(query);
      }

      return true;
    });
  }, [favorites, filterType, searchQuery]);

  return (
    <div className="layout">
      <Sidebar data={{ saved_count: favorites.length }} />

      <div className="main">
        {/* TOPBAR */}
        <header className="topbar" style={{ padding: '14px 20px', borderBottom: '1px solid var(--gris-b)', background: '#FFFFFF' }}>
          <div className="topbar-title" style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>
            {t('favorites.title_prefix')} <span style={{ color: 'var(--or-d)' }}>{t('favorites.title_highlight')}</span>
          </div>
          
          <div className="tb-actions" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="tb-pts-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 20 }}>
              <svg width="14" height="14" fill="var(--or)" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              <span className="tb-pts-val" style={{ fontSize: 12, fontWeight: 800, color: 'var(--noir)' }}>{points} {t('nav.points')}</span>
            </div>
            <NotificationCenter />
            <UserAvatarMenu size={36} />
          </div>
        </header>

        <main className="content" style={{ padding: '20px 16px 80px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          {/* FIL D'ARIANE / RETOUR RAPIDE */}
          <div style={{ marginBottom: 16 }}>
            <Link 
              to="/dashboard/locataire" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#6C665C', textDecoration: 'none', background: '#F5F2EC', padding: '6px 14px', borderRadius: 20, border: '1px solid #EAE5D9' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              {t('common.dashboard')}
            </Link>
          </div>

          {/* HERO BANNER AVEC BACKGROUND DE VILLA CAMEROUNAISE */}
          <div 
            style={{ 
              marginBottom: 20,
              padding: '30px 24px',
              borderRadius: 24,
              background: "linear-gradient(135deg, rgba(15, 13, 9, 0.88) 0%, rgba(26, 23, 17, 0.78) 100%), url('/img/cameroun-luxury-banner.jpg') center/cover no-repeat",
              color: '#FFFFFF',
              border: '1px solid rgba(212,175,55,0.35)',
              boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--or-l)', marginBottom: 8, background: 'rgba(15,13,9,0.65)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(212,175,55,0.3)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--or)"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/></svg>
                <span>{t('favorites.badge')}</span>
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px', color: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}>
                {t('favorites.title_prefix')} <span style={{ color: 'var(--or-l)' }}>{t('favorites.title_highlight')}</span>
              </h1>
              <p style={{ margin: 0, fontSize: 13.5, color: 'rgba(255,255,255,0.82)', lineHeight: 1.5, maxWidth: 540 }}>
                {t('favorites.subtitle')}
              </p>
            </div>
          </div>

          {/* BARRE DE RECHERCHE & FILTRES RAPIDES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {/* Barre de recherche */}
            <div style={{ position: 'relative', width: '100%' }}>
              <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, fill: '#8C8477' }} viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input 
                type="text" 
                placeholder={t('favorites.search_placeholder')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  borderRadius: 14,
                  border: '1px solid #E4DFD4',
                  background: '#FFFFFF',
                  fontSize: 14,
                  fontFamily: 'Poppins, sans-serif',
                  outline: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  boxSizing: 'border-box'
                }}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', border: 'none', background: '#EAE5D9', width: 22, height: 22, borderRadius: '50%', cursor: 'pointer', fontSize: 12, fontWeight: 'bold' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Chips de filtres tactiles professionnels (sans emoji) */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
              {[
                { 
                  id: 'ALL', 
                  label: `${t('favorites.filter_all')} (${favorites.length})`,
                  icon: null
                },
                { 
                  id: 'LOCATION', 
                  label: t('favorites.filter_rent'),
                  icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                },
                { 
                  id: 'VENTE', 
                  label: t('favorites.filter_sale'),
                  icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>
                },
                { 
                  id: '360', 
                  label: t('favorites.filter_360'),
                  icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 12A10 10 0 0 0 15 21.54A10 10 0 0 1 15 2.46A10 10 0 0 0 2 12Z"></path><path d="M15 2.46A10 10 0 0 0 22 12a10 10 0 0 0-7-9.54"></path><path d="M2 12h20"></path></svg>
                }
              ].map(chip => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setFilterType(chip.id)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: 'Poppins, sans-serif',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    border: filterType === chip.id ? '1px solid var(--or)' : '1px solid #EAE5D9',
                    background: filterType === chip.id ? '#1A1711' : '#FFFFFF',
                    color: filterType === chip.id ? '#FFFFFF' : '#6C665C',
                    boxShadow: filterType === chip.id ? '0 2px 8px rgba(212,175,55,0.25)' : 'none',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                >
                  {chip.icon}
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* GRILLE DES BIENS FAVORIS */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 }}>
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : filteredFavorites.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 }}>
              {filteredFavorites.map((prop) => (
                <PropertyCard 
                  key={prop.id} 
                  property={prop} 
                  onFavChange={handleFavChange}
                />
              ))}
            </div>
          ) : !loading && (
            <div 
              style={{ 
                textAlign: 'center', 
                padding: '48px 24px', 
                background: '#FFFFFF', 
                borderRadius: 20, 
                border: '1px solid #EAE5D9', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                margin: '20px auto',
                maxWidth: 480
              }}
            >
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(212,175,55,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(212,175,55,0.25)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--or)"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/></svg>
              </div>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--noir)', marginBottom: 8 }}>
                {favorites.length === 0 ? t('favorites.empty_title') : t('favorites.empty_filtered_title')}
              </h3>
              <p style={{ fontSize: 13, color: '#7A7265', lineHeight: 1.5, margin: '0 0 20px' }}>
                {favorites.length === 0 
                  ? t('favorites.empty_desc')
                  : t('favorites.empty_filtered_desc')}
              </p>
              {favorites.length === 0 ? (
                <Link 
                  to="/properties" 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    padding: '11px 22px', 
                    background: 'linear-gradient(135deg, var(--or), var(--or-l))', 
                    borderRadius: 14, 
                    color: '#0F0D09', 
                    fontFamily: 'Poppins, sans-serif', 
                    fontSize: 13, 
                    fontWeight: 800, 
                    textDecoration: 'none', 
                    boxShadow: '0 4px 14px rgba(212,175,55,0.35)' 
                  }}
                >
                  {t('favorites.explore_btn')}
                </Link>
              ) : (
                <button 
                  type="button" 
                  onClick={() => { setFilterType('ALL'); setSearchQuery(''); }}
                  style={{ 
                    padding: '10px 20px', 
                    background: '#1A1711', 
                    borderRadius: 12, 
                    color: '#FFFFFF', 
                    fontSize: 13, 
                    fontWeight: 700, 
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  {t('favorites.reset_filters')}
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

