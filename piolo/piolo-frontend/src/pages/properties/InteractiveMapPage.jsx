import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { propertiesApi } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { getMediaUrl } from '../../utils/media';
import '../bailleur/dashboard.css';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyDZyYvlR1SeSE6mk2kJn-gJxg-tfsDoJKc";

const CITY_COORDINATES = {
  yaounde: { lat: 3.8480, lng: 11.5021, zoom: 13 },
  douala: { lat: 4.0511, lng: 9.7679, zoom: 13 },
  kribi: { lat: 2.9374, lng: 9.9077, zoom: 14 },
  bafoussam: { lat: 5.4778, lng: 10.4176, zoom: 13 },
  limbe: { lat: 4.0244, lng: 9.2081, zoom: 14 }
};

function loadGoogleMapsScript() {
  if (window.google?.maps) return Promise.resolve(window.google);
  return new Promise((resolve, reject) => {
    if (document.getElementById('google-maps-js')) {
      const check = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(check);
          resolve(window.google);
        }
      }, 100);
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-maps-js';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places,marker&v=weekly`;
    script.async = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error("Impossible de charger Google Maps"));
    document.head.appendChild(script);
  });
}

export default function InteractiveMapPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [locatingUser, setLocatingUser] = useState(false);
  const [isSatellite, setIsSatellite] = useState(true);

  const mapElement = useRef(null);
  const mapRef = useRef(null);
  const markersMap = useRef(new Map());
  const carouselContainerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const activeInfoWindowRef = useRef(null);

  // Chargement des propriétés géolocalisées
  useEffect(() => {
    let active = true;
    propertiesApi.list()
      .then((res) => {
        if (!active) return;
        const data = res.data?.results || res.data || [];
        const validProps = (Array.isArray(data) ? data : []).filter(
          p => p.latitude && p.longitude && !isNaN(parseFloat(p.latitude)) && !isNaN(parseFloat(p.longitude))
        );
        setProperties(validProps);
      })
      .catch((err) => console.error('Erreur chargement biens carte:', err))
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, []);

  // Filtrage réactif par ville et recherche (sur mobile et web)
  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {
      // Filtre de ville
      if (selectedCity !== 'ALL') {
        const cityNorm = (prop.city || '').toLowerCase();
        if (!cityNorm.includes(selectedCity.toLowerCase())) return false;
      }

      // Filtre de recherche texte
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const title = (prop.title || '').toLowerCase();
        const hood = (prop.neighborhood || '').toLowerCase();
        const city = (prop.city || '').toLowerCase();
        const propType = (prop.property_type || '').toLowerCase();
        return title.includes(q) || hood.includes(q) || city.includes(q) || propType.includes(q);
      }

      return true;
    });
  }, [properties, selectedCity, searchQuery]);

  // Initialisation et mise à jour de Google Maps avec vue SATELLITE (HYBRID) par défaut
  useEffect(() => {
    if (loading || !mapElement.current) return;

    loadGoogleMapsScript().then((google) => {
      const center = CITY_COORDINATES.yaounde;

      if (!mapRef.current) {
        const map = new google.maps.Map(mapElement.current, {
          zoom: 12,
          center: { lat: center.lat, lng: center.lng },
          mapTypeId: google.maps.MapTypeId.HYBRID, // Affichage Satellite par défaut avec noms de rues
          mapId: "PIOLO_MAP_ID",
          disableDefaultUI: false,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_LEFT,
          },
          zoomControl: true,
        });
        mapRef.current = map;
      }

      const map = mapRef.current;

      // Nettoyer les anciens marqueurs
      markersMap.current.forEach(({ marker }) => {
        if (marker.setMap) marker.setMap(null);
        else marker.map = null;
      });
      markersMap.current.clear();

      const bounds = new google.maps.LatLngBounds();
      let hasValidCoords = false;

      filteredProperties.forEach((prop) => {
        const lat = parseFloat(prop.latitude);
        const lng = parseFloat(prop.longitude);
        if (isNaN(lat) || isNaN(lng)) return;

        hasValidCoords = true;
        bounds.extend({ lat, lng });

        const formattedPrice = Number(prop.price).toLocaleString('fr-FR');
        const priceTag = document.createElement("div");
        priceTag.className = `custom-price-marker ${selectedId === prop.id ? 'active' : ''}`;
        priceTag.textContent = `${formattedPrice} F`;

        let marker;
        try {
          if (google.maps.marker?.AdvancedMarkerElement) {
            marker = new google.maps.marker.AdvancedMarkerElement({
              map,
              position: { lat, lng },
              content: priceTag,
              title: prop.title
            });
          } else {
            marker = new google.maps.Marker({
              position: { lat, lng },
              map,
              title: prop.title
            });
          }
        } catch {
          marker = new google.maps.Marker({
            position: { lat, lng },
            map,
            title: prop.title
          });
        }

        const imgUrl = getMediaUrl(prop.main_image || prop.cover_image);
        const infoContent = `
          <a href="/properties/${prop.slug || prop.id}" style="width:240px; display:block; text-decoration:none; color:inherit; font-family:'Poppins',sans-serif;">
            <img src="${imgUrl}" style="width:100%; height:130px; object-fit:cover; border-radius:12px 12px 0 0;" alt="${prop.title}" />
            <div style="padding:14px;">
              <div style="font-family:'Poppins',sans-serif; font-size:17px; font-weight:800; color:#A8891C;">${formattedPrice} FCFA</div>
              <div style="font-size:14px; font-weight:700; color:#0F0D09; margin:4px 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${prop.title}</div>
              <div style="font-size:12px; color:#64605A;">${prop.city}${prop.neighborhood ? ' • ' + prop.neighborhood : ''}</div>
            </div>
          </a>
        `;

        const infoWindow = new google.maps.InfoWindow({ content: infoContent });

        const openHandler = () => {
          setSelectedId(prop.id);
          if (activeInfoWindowRef.current) activeInfoWindowRef.current.close();
          infoWindow.open({ anchor: marker, map });
          activeInfoWindowRef.current = infoWindow;

          // Défilement automatique du carrousel mobile vers la carte sélectionnée
          if (carouselContainerRef.current) {
            const cardEl = carouselContainerRef.current.querySelector(`[data-prop-id="${prop.id}"]`);
            if (cardEl) {
              cardEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
          }
        };

        priceTag.addEventListener('click', openHandler);
        if (marker.addListener) marker.addListener('click', openHandler);

        markersMap.current.set(prop.id, { marker, element: priceTag, infoWindow });
      });

      // Recalibrer la vue
      if (hasValidCoords && filteredProperties.length > 1 && selectedCity === 'ALL') {
        map.fitBounds(bounds, { top: 60, right: 30, bottom: 60, left: 30 });
      } else if (selectedCity !== 'ALL' && CITY_COORDINATES[selectedCity.toLowerCase()]) {
        const cityCoord = CITY_COORDINATES[selectedCity.toLowerCase()];
        map.setCenter({ lat: cityCoord.lat, lng: cityCoord.lng });
        map.setZoom(cityCoord.zoom);
      }

      setTimeout(() => {
        if (google.maps.event) google.maps.event.trigger(map, 'resize');
      }, 150);

    }).catch(err => console.error("Maps init error:", err));

  }, [loading, filteredProperties, selectedCity]);

  // Synchroniser le marqueur actif lorsque `selectedId` change
  useEffect(() => {
    markersMap.current.forEach(({ element }, id) => {
      if (element) {
        if (id === selectedId) {
          element.classList.add('active');
        } else {
          element.classList.remove('active');
        }
      }
    });
  }, [selectedId]);

  const handleCardHover = (id, isEntering) => {
    setHoveredId(isEntering ? id : null);
    const item = markersMap.current.get(id);
    if (item?.element) {
      if (isEntering) item.element.classList.add('active');
      else if (id !== selectedId) item.element.classList.remove('active');
    }
  };

  const handleSelectProperty = (prop) => {
    setSelectedId(prop.id);
    const item = markersMap.current.get(prop.id);
    if (mapRef.current) {
      const lat = parseFloat(prop.latitude);
      const lng = parseFloat(prop.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        mapRef.current.panTo({ lat, lng });
        if (item?.infoWindow && item?.marker) {
          if (activeInfoWindowRef.current) activeInfoWindowRef.current.close();
          item.infoWindow.open({ anchor: item.marker, map: mapRef.current });
          activeInfoWindowRef.current = item.infoWindow;
        }
      }
    }
  };

  // Basculer entre Satellite et Plan
  const toggleMapType = () => {
    if (!mapRef.current || !window.google?.maps) return;
    const nextType = isSatellite ? window.google.maps.MapTypeId.ROADMAP : window.google.maps.MapTypeId.HYBRID;
    mapRef.current.setMapTypeId(nextType);
    setIsSatellite(!isSatellite);
  };

  // Action : Centrer sur la géolocalisation de l'utilisateur (Mobile)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocatingUser(false);
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        if (mapRef.current && window.google?.maps) {
          mapRef.current.panTo({ lat: userLat, lng: userLng });
          mapRef.current.setZoom(15);

          if (!userMarkerRef.current) {
            const pulseDot = document.createElement("div");
            pulseDot.className = "user-gps-pulse";
            pulseDot.innerHTML = "<div class='pulse-ring'></div><div class='pulse-dot'></div>";

            try {
              if (window.google.maps.marker?.AdvancedMarkerElement) {
                userMarkerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
                  map: mapRef.current,
                  position: { lat: userLat, lng: userLng },
                  content: pulseDot,
                  title: "Votre position"
                });
              } else {
                userMarkerRef.current = new window.google.maps.Marker({
                  position: { lat: userLat, lng: userLng },
                  map: mapRef.current,
                  title: "Votre position"
                });
              }
            } catch {
              userMarkerRef.current = new window.google.maps.Marker({
                position: { lat: userLat, lng: userLng },
                map: mapRef.current,
                title: "Votre position"
              });
            }
          } else if (userMarkerRef.current.setPosition) {
            userMarkerRef.current.setPosition({ lat: userLat, lng: userLng });
          }
        }
      },
      (error) => {
        setLocatingUser(false);
        console.warn("Erreur GPS:", error.message);
        alert("Impossible de récupérer votre position. Vérifiez vos autorisations GPS.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="layout" style={{ height: '100vh', overflow: 'hidden' }}>
      <Sidebar />

      <div className="main map-page-main" style={{ padding: 0, height: '100vh', display: 'flex', flexDirection: 'row', position: 'relative' }}>
        
        {/* ========================================================= */}
        {/* 1. SIDEBAR DES BIENS À GAUCHE — DESKTOP WEB SEULEMENT     */}
        {/* ========================================================= */}
        <div className="map-sidebar desktop-only">
          <div className="map-sidebar-header" style={{ padding: 24, borderBottom: '1px solid #E8E3DA', background: '#fff' }}>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 22, fontWeight: 800, color: '#0F0D09', margin: '0 0 5px' }}>{t('interactive_map.title', 'Carte Interactive')}</h2>
            <p style={{ fontSize: 13, color: '#64605A', margin: 0 }}>
              {loading ? t('interactive_map.loading_map', 'Chargement des biens…') : t('interactive_map.properties_found_count', '{{count}} bien(s) géolocalisé(s)', { count: properties.length })}
            </p>
          </div>

          <div className="map-list" style={{ flex: 1, overflowY: 'auto', padding: 20, background: '#F7F5F1', display: 'flex', flexDirection: 'column', gap: 15 }}>
            {loading && [1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: 'flex', gap: 15, padding: 15, borderRadius: 16, border: '1px solid #E8E3DA', background: '#fff' }}>
                <div style={{ width: 110, height: 95, borderRadius: 12, background: 'linear-gradient(90deg,#e8e3da 25%,#f5f0e8 50%,#e8e3da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
                  <div style={{ width: '60%', height: 16, borderRadius: 6, background: 'linear-gradient(90deg,#e8e3da 25%,#f5f0e8 50%,#e8e3da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                  <div style={{ width: '85%', height: 14, borderRadius: 6, background: 'linear-gradient(90deg,#e8e3da 25%,#f5f0e8 50%,#e8e3da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                  <div style={{ width: '40%', height: 12, borderRadius: 6, background: 'linear-gradient(90deg,#e8e3da 25%,#f5f0e8 50%,#e8e3da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                </div>
              </div>
            ))}
            {!loading && properties.length === 0 && (
              <div style={{ textAlign: 'center', padding: 30, color: '#64605A' }}>
                {t('interactive_map.no_properties_found', 'Aucun bien géolocalisé disponible.')}
              </div>
            )}
            {properties.map((prop) => {
              const formattedPrice = Number(prop.price).toLocaleString('fr-FR');
              const imgUrl = getMediaUrl(prop.main_image || prop.cover_image);

              return (
                <div
                  key={prop.id}
                  className={`property-card-html ${hoveredId === prop.id || selectedId === prop.id ? 'active' : ''}`}
                  onMouseEnter={() => handleCardHover(prop.id, true)}
                  onMouseLeave={() => handleCardHover(prop.id, false)}
                  onClick={() => handleSelectProperty(prop)}
                >
                  <img src={imgUrl} className="property-img-html" alt={prop.title} onError={e => { e.currentTarget.src = '/static/img/logo-piolo-clean.png'; }} />
                  <div className="property-info-html">
                    <div className="property-price-html">{formattedPrice} FCFA</div>
                    <div className="property-title-html">{prop.title}</div>
                    <div className="property-meta-html">{prop.city}{prop.neighborhood ? ` • ${prop.neighborhood}` : ''}</div>
                    <div className="property-meta-html" style={{ marginTop: 4 }}>
                      {prop.bedrooms || 0} ch. • {prop.bathrooms || 0} sdb. • {prop.area || 0} m²
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. CONTRÔLES MOBILES FLOTTANTS — MOBILE SEULEMENT (<768px)*/}
        {/* ========================================================= */}
        <div className="mobile-only mobile-top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link 
              to="/dashboard"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                flexShrink: 0,
                textDecoration: 'none'
              }}
              title="Retour"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
            </Link>

            <div style={{ flex: 1, position: 'relative' }}>
              <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, fill: 'var(--or)' }} viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input 
                type="text" 
                placeholder={t('interactive_map.search_placeholder', 'Quartier, type de bien...')} 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 24px 7px 30px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  color: '#FFFFFF',
                  fontSize: 12,
                  fontFamily: 'Poppins, sans-serif',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ padding: '6px 10px', borderRadius: 10, background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.4)', color: 'var(--or-l)', fontFamily: 'Poppins, sans-serif', fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap' }}>
              {filteredProperties.length} biens
            </div>
          </div>

          {/* Chips de villes rapides */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingTop: 2 }}>
            {[
              { id: 'ALL', label: t('interactive_map.all_cities', 'Toutes les villes') },
              { id: 'yaounde', label: 'Yaoundé' },
              { id: 'douala', label: 'Douala' },
              { id: 'kribi', label: 'Kribi' },
              { id: 'bafoussam', label: 'Bafoussam' },
              { id: 'limbe', label: 'Limbé' }
            ].map(city => (
              <button
                key={city.id}
                type="button"
                onClick={() => setSelectedCity(city.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 14,
                  fontSize: 10.5,
                  fontWeight: 700,
                  fontFamily: 'Poppins, sans-serif',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: selectedCity === city.id ? '1px solid var(--or)' : '1px solid rgba(255,255,255,0.15)',
                  background: selectedCity === city.id ? 'linear-gradient(135deg, var(--or), var(--or-l))' : 'rgba(255, 255, 255, 0.08)',
                  color: selectedCity === city.id ? '#0F0D09' : '#FFFFFF',
                  flexShrink: 0
                }}
              >
                {city.label}
              </button>
            ))}
          </div>
        </div>

        {/* BOUTONS FLOTTANTS MOBILES (GPS + VUE SATELLITE/PLAN) */}
        <div className="mobile-only mobile-floating-controls">
          {/* Bascule Satellite / Plan */}
          <button
            type="button"
            onClick={toggleMapType}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: isSatellite ? 'linear-gradient(135deg, #D4AF37, #F6D365)' : 'rgba(15, 13, 9, 0.92)',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid var(--or)',
              color: isSatellite ? '#0F0D09' : 'var(--or)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
              fontSize: 10,
              fontWeight: 800
            }}
            title={isSatellite ? "Passer en vue Plan" : "Passer en vue Satellite"}
          >
            {isSatellite ? "SAT" : "PLAN"}
          </button>

          {/* Bouton GPS */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locatingUser}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'rgba(15, 13, 9, 0.92)',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid var(--or)',
              color: 'var(--or)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(0,0,0,0.5)'
            }}
            title="Autour de moi"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
          </button>
        </div>

        {/* ========================================================= */}
        {/* 3. GOOGLE MAP CONTAINER PLEIN ÉCRAN                       */}
        {/* ========================================================= */}
        <div className="map-container" style={{ flex: 1, height: '100%', position: 'relative', minHeight: '100vh' }}>
          <div id="map" ref={mapElement} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
        </div>

        {/* ========================================================= */}
        {/* 4. CARROUSEL HORIZONTAL TACTILE — MOBILE SEULEMENT (<768px)*/}
        {/* ========================================================= */}
        <div ref={carouselContainerRef} className="mobile-only mobile-map-carousel">
          {filteredProperties.map(prop => {
            const formattedPrice = Number(prop.price).toLocaleString('fr-FR');
            const imgUrl = getMediaUrl(prop.main_image || prop.cover_image);
            const isSelected = selectedId === prop.id;

            return (
              <div
                key={prop.id}
                data-prop-id={prop.id}
                onClick={() => handleSelectProperty(prop)}
                className={`mobile-prop-card ${isSelected ? 'active' : ''}`}
              >
                <div style={{ position: 'relative', width: '100%', height: 110, background: '#1A1711' }}>
                  <img src={imgUrl} alt={prop.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.src = '/static/img/logo-piolo-clean.png'; }} />
                  <div style={{ position: 'absolute', bottom: 6, left: 8, background: 'rgba(15,13,9,0.85)', backdropFilter: 'blur(6px)', padding: '3px 8px', borderRadius: 8, color: 'var(--or-l)', fontSize: 11.5, fontWeight: 800 }}>
                    {formattedPrice} FCFA
                  </div>
                </div>

                <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 800, color: '#0F0D09', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {prop.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#6C665C', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--or)"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    <span>{prop.city}{prop.neighborhood ? `, ${prop.neighborhood}` : ''}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, paddingTop: 6, borderTop: '1px solid #F0ECE3' }}>
                    <span style={{ fontSize: 11, color: '#888', fontWeight: 600 }}>
                      {prop.bedrooms ? `${prop.bedrooms} ch. • ` : ''}{prop.area ? `${prop.area} m²` : 'Disponible'}
                    </span>
                    <Link 
                      to={`/properties/${prop.slug || prop.id}`}
                      style={{ padding: '4px 10px', borderRadius: 8, background: 'linear-gradient(135deg, #1A1711, #0F0D09)', color: 'var(--or-l)', fontSize: 11, fontWeight: 800, textDecoration: 'none', border: '1px solid rgba(212,175,55,0.3)' }}
                    >
                      Consulter
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      <style>{`
        /* ======================================================== */
        /* STYLES DESKTOP WEB ORIGINAUX (>768px)                    */
        /* ======================================================== */
        .mobile-only {
          display: none !important;
        }
        .desktop-only {
          display: flex !important;
        }
        .map-sidebar {
          width: 450px;
          background: #fff;
          border-right: 1px solid #E8E3DA;
          display: flex;
          flex-direction: column;
          z-index: 10;
          height: 100%;
          box-shadow: 2px 0 10px rgba(0,0,0,0.05);
        }
        .property-card-html {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          gap: 15px !important;
          padding: 15px !important;
          border-radius: 16px !important;
          border: 1px solid #E8E3DA !important;
          margin-bottom: 0 !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          text-decoration: none !important;
          color: #0F0D09 !important;
          background: #fff !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04) !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .property-card-html:hover, .property-card-html.active {
          border-color: #D4AF37 !important;
          background: rgba(212,175,55,0.05) !important;
          box-shadow: 0 4px 15px rgba(212,175,55,0.15) !important;
          transform: translateY(-2px);
        }
        .property-img-html {
          width: 110px !important;
          height: 95px !important;
          border-radius: 12px !important;
          object-fit: cover !important;
          flex-shrink: 0 !important;
        }
        .property-info-html {
          flex: 1 !important;
          min-width: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
        }
        .property-price-html {
          font-family: 'Poppins', sans-serif !important;
          font-weight: 800 !important;
          font-size: 16px !important;
          color: #A8891C !important;
          line-height: 1.2 !important;
        }
        .property-title-html {
          font-family: 'Poppins', sans-serif !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          color: #0F0D09 !important;
          margin: 4px 0 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        .property-meta-html {
          font-family: 'DM Sans', sans-serif !important;
          font-size: 12px !important;
          color: #64605A !important;
        }
        .custom-price-marker {
          background: #0F0D09;
          border: 2px solid #D4AF37;
          color: #fff;
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: 13px;
          padding: 6px 12px;
          border-radius: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          position: relative;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .custom-price-marker::after {
          content: '';
          position: absolute;
          bottom: -7px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 7px 7px 0;
          border-style: solid;
          border-color: #D4AF37 transparent transparent transparent;
        }
        .custom-price-marker:hover, .custom-price-marker.active {
          background: #D4AF37;
          color: #0F0D09;
          border-color: #0F0D09;
          transform: scale(1.15);
          z-index: 100;
          box-shadow: 0 8px 20px rgba(212,175,55,0.4);
        }
        .custom-price-marker:hover::after, .custom-price-marker.active::after {
          border-top-color: #0F0D09;
        }

        /* ======================================================== */
        /* RESPONSIVE MOBILE SEULEMENT (<=768px)                    */
        /* ======================================================== */
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-only {
            display: flex !important;
          }
          .map-page-main {
            flex-direction: column !important;
            height: 100vh !important;
          }
          .map-container {
            width: 100% !important;
            height: 100vh !important;
          }
          .mobile-top-bar {
            position: absolute;
            top: max(env(safe-area-inset-top, 0px) + 12px, 50px);
            left: 12px;
            right: 12px;
            z-index: 100;
            flex-direction: column;
            gap: 8px;
            background: rgba(15, 13, 9, 0.9);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(212, 175, 55, 0.35);
            border-radius: 16px;
            padding: 8px 10px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.6);
          }
          .mobile-floating-controls {
            position: absolute;
            right: 12px;
            top: max(env(safe-area-inset-top, 0px) + 135px, 175px);
            z-index: 100;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .mobile-map-carousel {
            position: absolute;
            bottom: calc(var(--bn-h, 54px) + 12px);
            left: 0;
            right: 0;
            z-index: 90;
            display: flex;
            gap: 12px;
            overflow-x: auto;
            padding: 0 16px;
            scroll-snap-type: x mandatory;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }
          .mobile-prop-card {
            flex: 0 0 280px;
            scroll-snap-align: center;
            background: #FFFFFF;
            border-radius: 18px;
            border: 1px solid rgba(0,0,0,0.08);
            box-shadow: 0 8px 24px rgba(0,0,0,0.18);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            cursor: pointer;
            transition: all 0.25s ease;
          }
          .mobile-prop-card.active {
            border: 2px solid var(--or);
            box-shadow: 0 10px 30px rgba(212,175,55,0.35);
          }
        }
      `}</style>
    </div>
  );
}

