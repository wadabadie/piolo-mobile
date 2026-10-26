// src/components/PropertyCard.jsx
import { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { propertiesApi } from '../services/api';
import { getMediaUrl } from '../utils/media';
import { subscriptionService } from '../services/subscriptionService';
import { prefetchProperty, prefetchRoute } from '../utils/prefetch';
import SmartImage from './SmartImage';

function formatTitle(property) {
  if (property.title && property.title.trim().length > 3) {
    return property.title;
  }
  const type = (property.property_type || 'Bien').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  const city = property.city || 'Yaoundé';
  const neighborhood = property.neighborhood ? ` · ${property.neighborhood.replace(/\b\w/g, l => l.toUpperCase())}` : '';
  return `${type} à ${city}${neighborhood}`;
}

export default function PropertyCard({ property, onFavChange }) {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isFav, setIsFav] = useState(property?.is_favorite || false);
  const [favPending, setFavPending] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  if (!property) return null;

  const imagesList = [
    property.main_image || property.cover_image,
    ...(property.images || []).map(img => (typeof img === 'string' ? img : img.image || img.image_url))
  ].filter(Boolean).map(url => getMediaUrl(url));

  const images = imagesList.length > 0 ? imagesList : ['/static/img/logo-piolo-clean.png'];
  const photoCount = images.length;
  const formattedPrice = Number(property.price || 0).toLocaleString('fr-FR');
  const isVerified = (property.owner?.verification_level >= 2) || property.is_verified || property.is_owner_verified;
  const isPremium = property.owner?.verification_level === 3;
  const has360 = property.has_virtual_tour || property.virtual_tour || (property.virtual_tours?.length > 0) || property.has_360;

  const boostedInfo = subscriptionService.isPropertyBoosted(property)
    || (property.is_boosted ? { boostType: property.boost_type || 'vedette_7j' } : null);
  const isBoosted = Boolean(boostedInfo);

  // Swipe tactile handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 45 && activeImgIndex < images.length - 1) {
      setActiveImgIndex(prev => prev + 1);
    } else if (distance < -45 && activeImgIndex > 0) {
      setActiveImgIndex(prev => prev - 1);
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleFavClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    if (favPending) return;
    const nextFav = !isFav;
    setIsFav(nextFav);
    setFavPending(true);

    try {
      const res = await propertiesApi.toggleFavorite(property.id);
      if (res.data?.ok) {
        setIsFav(res.data.is_favorite);
        if (onFavChange) onFavChange(property.id, res.data.is_favorite);
      }
    } catch (err) {
      setIsFav(!nextFav);
    } finally {
      setFavPending(false);
    }
  };

  const handlePrefetch = () => {
    if (property?.id) {
      prefetchProperty(property.id);
      prefetchRoute(() => import('../pages/properties/PropertyDetail'));
    }
  };

  return (
    <div
      className="prop-card"
      onMouseEnter={handlePrefetch}
      onTouchStart={(e) => {
        handlePrefetch();
        handleTouchStart(e);
      }}
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        background: 'var(--blanc)',
        border: '1px solid var(--gris-b)',
        boxShadow: 'var(--shadow)',
        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
        transform: 'translate3d(0, 0, 0)',
        willChange: 'transform',
      }}
    >
      {/* ── Image & Carousel ── */}
      <div 
        className="prop-img-container"
        style={{ position: 'relative', width: '100%', paddingTop: '64%', overflow: 'hidden', background: '#12100C' }}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Link to={`/properties/${property.slug || property.id}`} style={{ position: 'absolute', inset: 0 }}>
          <SmartImage 
            src={images[activeImgIndex]} 
            alt={property.title || 'Logement Piolo'} 
            style={{ width: '100%', height: '100%' }}
          />
        </Link>

        {/* Top Badges & Favoris */}
        <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' }}>
          {/* Photo Count badge */}
          <span style={{
            background: 'rgba(15,13,9,0.72)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            padding: '4px 9px',
            borderRadius: 8,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            border: '1px solid rgba(255,255,255,0.15)'
          }}>
            <i className="fas fa-camera" style={{ fontSize: 10, color: '#D4AF37' }}></i>
            <span>{photoCount}</span>
          </span>

          {/* Bouton Favori Tactile */}
          <button
            type="button"
            onClick={handleFavClick}
            disabled={favPending}
            aria-label={isFav ? t('card.fav_remove') : t('card.fav_add')}
            style={{
              pointerEvents: 'all',
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'rgba(15,13,9,0.72)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isFav ? '#D4AF37' : '#ffffff',
              fontSize: 15,
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              transition: 'transform 0.15s ease, color 0.15s ease'
            }}
          >
            <i className={`fa${isFav ? 's' : 'r'} fa-heart`} style={{ transform: isFav ? 'scale(1.15)' : 'scale(1)' }}></i>
          </button>
        </div>

        {/* Bottom Badges */}
        <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', gap: 6, flexWrap: 'wrap', pointerEvents: 'none', alignItems: 'center' }}>
          {/* Transaction Badge */}
          <span style={{
            background: property.transaction_type === 'VENTE'
              ? '#1D4ED8'
              : property.transaction_type === 'COURTE_DUREE'
              ? 'linear-gradient(135deg, #059669, #10B981)'
              : 'linear-gradient(135deg, #D4AF37, #F6D365)',
            color: (property.transaction_type === 'VENTE' || property.transaction_type === 'COURTE_DUREE') ? '#fff' : '#0F0D09',
            fontSize: 10.5,
            fontWeight: 800,
            padding: '3.5px 8px',
            borderRadius: 6,
            letterSpacing: '0.4px',
            textTransform: 'uppercase',
            fontFamily: 'Poppins, sans-serif'
          }}>
            {property.transaction_type === 'VENTE'
              ? t('card.for_sale')
              : property.transaction_type === 'COURTE_DUREE'
              ? t('card.short_stay')
              : t('card.for_rent')}
          </span>

          {/* Boost / Vedette Badge */}
          {isBoosted && (
            <span style={{
              background: 'linear-gradient(135deg, #0F0D09 0%, #2A2418 100%)',
              border: '1.5px solid #D4AF37',
              color: '#F6D365',
              fontSize: 10,
              fontWeight: 900,
              padding: '3.5px 8px',
              borderRadius: 6,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              boxShadow: '0 2px 8px rgba(212,175,55,0.35)',
              letterSpacing: '0.4px',
              textTransform: 'uppercase',
              fontFamily: 'Poppins, sans-serif'
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#FFD700"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              <span>{boostedInfo?.boostType === 'flash_48h' ? t('card.flash') : boostedInfo?.boostType === 'multiboost_30j' ? t('card.multiboost') : t('card.featured')}</span>
            </span>
          )}

          {/* 360 Badge */}
          {has360 && (
            <span style={{
              background: 'rgba(15,13,9,0.82)',
              border: '1px solid rgba(212,175,55,0.6)',
              color: '#FFE27A',
              fontSize: 10.5,
              fontWeight: 800,
              padding: '3.5px 8px',
              borderRadius: 6,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}>
              <i className="fas fa-vr-cardboard" style={{ color: '#D4AF37' }}></i> 360°
            </span>
          )}

          {isPremium ? (
            <span style={{
              background: '#0F0D09',
              border: '1px solid #D4AF37',
              color: '#D4AF37',
              fontSize: 10.5,
              fontWeight: 800,
              padding: '3.5px 8px',
              borderRadius: 6,
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}>
              <i className="fas fa-crown" style={{ fontSize: 9 }}></i> {t('card.premium')}
            </span>
          ) : isVerified ? (
            <span style={{
              background: 'rgba(16,185,129,0.92)',
              color: '#fff',
              fontSize: 10.5,
              fontWeight: 800,
              padding: '3.5px 8px',
              borderRadius: 6,
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}>
              <i className="fas fa-check" style={{ fontSize: 9 }}></i> {t('card.verified')}
            </span>
          ) : (
            <span style={{
              background: 'rgba(30, 27, 22, 0.82)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              color: '#FBBF24',
              fontSize: 10.5,
              fontWeight: 800,
              padding: '3.5px 8px',
              borderRadius: 6,
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}>
              <i className="fas fa-info-circle" style={{ fontSize: 9 }}></i> {t('card.unverified')}
            </span>
          )}
        </div>

        {/* Indicateurs de points du carrousel */}
        {images.length > 1 && (
          <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4, zIndex: 3 }}>
            {images.map((_, idx) => (
              <span
                key={idx}
                onClick={(e) => { e.preventDefault(); setActiveImgIndex(idx); }}
                style={{
                  width: idx === activeImgIndex ? 16 : 5,
                  height: 5,
                  borderRadius: 3,
                  background: idx === activeImgIndex ? '#D4AF37' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Body Info ── */}
      <Link to={`/properties/${property.slug || property.id}`} style={{ padding: '16px 18px 18px', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h3 style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: 15.5,
          fontWeight: 700,
          color: 'var(--noir)',
          margin: 0,
          lineHeight: 1.35,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {formatTitle(property)}
        </h3>

        {/* Localisation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gris)', fontSize: 13 }}>
          <i className="fas fa-map-marker-alt" style={{ color: '#D4AF37', fontSize: 12 }}></i>
          <span>{property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city || 'Yaoundé'}</span>
        </div>

        {/* Caractéristiques (Pièces, SDB, Surface) */}
        <div style={{ display: 'flex', gap: 14, padding: '9px 0', borderTop: '1px solid var(--gris-b)', borderBottom: '1px solid var(--gris-b)', color: 'var(--gris)', fontSize: 12.5, fontWeight: 600 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <i className="fas fa-bed" style={{ color: 'var(--gris-m)' }}></i> {property.bedrooms || 0} {t('card.bedroom_abbr')}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <i className="fas fa-bath" style={{ color: 'var(--gris-m)' }}></i> {property.bathrooms || 1} {t('card.bathroom_abbr')}
          </span>
          {property.area > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <i className="fas fa-vector-square" style={{ color: 'var(--gris-m)' }}></i> {property.area} {t('card.sqm_abbr')}
            </span>
          )}
        </div>

        {/* Prix & Réf */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
          <div>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--or-d)', fontFamily: 'Poppins, sans-serif' }}>
              {formattedPrice} {t('common.fcfa')}
            </span>
            {property.transaction_type === 'LOCATION' && <span style={{ fontSize: 12, color: 'var(--gris)', fontWeight: 500 }}> {t('common.per_month')}</span>}
            {property.transaction_type === 'COURTE_DUREE' && <span style={{ fontSize: 12, color: '#059669', fontWeight: 700 }}> {t('common.per_night')}</span>}
          </div>
          <span style={{ fontSize: 11, color: 'var(--gris-m)', fontFamily: 'monospace' }}>
            {t('card.ref')}: {property.id ? String(property.id).substring(0, 7).toUpperCase() : ''}
          </span>
        </div>
      </Link>
    </div>
  );
}
