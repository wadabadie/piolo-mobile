import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyDZyYvlR1SeSE6mk2kJn-gJxg-tfsDoJKc";

// Coordonnées de référence pour les villes et quartiers du Cameroun
export const CAMEROON_LOCATIONS = {
  Yaoundé: {
    coords: [3.8480, 11.5021],
    neighborhoods: {
      'Bastos': [3.8963, 11.5126],
      'Odza': [3.8050, 11.5320],
      'Omnisports': [3.8820, 11.5360],
      'Biyem-Assi': [3.8340, 11.4880],
      'Melen': [3.8610, 11.4930],
      'Mendong': [3.8290, 11.4720],
      'Soa': [3.9550, 11.5950],
      'Nsam': [3.8250, 11.5100],
      'Ngousso': [3.8950, 11.5550],
      'Etoa-Meki': [3.8750, 11.5200],
      'Mvan': [3.8050, 11.5180],
      'Essos': [3.8720, 11.5380],
      'Tsinga': [3.8850, 11.5030],
      'Santa Barbara': [3.9050, 11.5280]
    }
  },
  Douala: {
    coords: [4.0511, 9.7679],
    neighborhoods: {
      'Akwa': [4.0520, 9.6970],
      'Bonapriso': [4.0280, 9.7020],
      'Bonanjo': [4.0430, 9.6880],
      'Bonamoussadi': [4.0910, 9.7380],
      'Makepe': [4.0820, 9.7520],
      'Deido': [4.0650, 9.7120],
      'Kotto': [4.0950, 9.7650],
      'Logpom': [4.0880, 9.7750],
      'Bonabéri': [4.0750, 9.6580],
      'Yassa': [4.0050, 9.7950],
      'Nyalla': [4.0320, 9.7680],
      'Ndokoti': [4.0480, 9.7420]
    }
  },
  Bafoussam: { coords: [5.4778, 10.4176], neighborhoods: {} },
  Kribi: { coords: [2.9378, 9.9077], neighborhoods: {} },
  Limbé: { coords: [4.0244, 9.2140], neighborhoods: {} },
  Buea: { coords: [4.1539, 9.2435], neighborhoods: {} },
  Bamenda: { coords: [5.9597, 10.1459], neighborhoods: {} },
  Garoua: { coords: [9.3014, 13.3977], neighborhoods: {} },
  Maroua: { coords: [10.5910, 14.3159], neighborhoods: {} },
  Ngaoundéré: { coords: [7.3195, 13.5842], neighborhoods: {} },
  Bertoua: { coords: [4.5773, 13.6846], neighborhoods: {} },
  Ebolowa: { coords: [2.9167, 11.1500], neighborhoods: {} },
  Dschang: { coords: [5.4439, 10.0536], neighborhoods: {} }
};

let googleMapsScriptPromise = null;

function loadGoogleMapsApi() {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (googleMapsScriptPromise) return googleMapsScriptPromise;

  googleMapsScriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('google-maps-api-script');
    if (existing && window.google?.maps) {
      return resolve(window.google.maps);
    }
    const script = document.createElement('script');
    script.id = 'google-maps-api-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
}

/**
 * Composant Officiel Google Maps API Satellite & Plan pour les Professionnels
 * Permet de :
 * - Basculer entre Vue Plan et Vue Satellite HD (avec commandes natives Google)
 * - Glisser le marqueur doré ou cliquer sur la carte pour définir la position précise
 * - Déplacer instantanément la caméra lors du choix d'une Ville ou d'un Quartier
 * - Consulter l'emplacement exact et calculer l'itinéraire côté client
 */
export default function ProLocationPickerMap({
  latitude = 3.8480,
  longitude = 11.5021,
  city = 'Yaoundé',
  title = "Atelier / Showroom",
  readOnly = false,
  height = 340,
  currentUser = null,
  onRequireAuth = null,
  onLocationChange
}) {
  const navigate = useNavigate();
  const isLocked = readOnly && !currentUser;

  const handleAuthRedirect = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (onRequireAuth) {
      onRequireAuth();
    } else {
      navigate('/login', {
        state: {
          from: window.location.pathname,
          message: 'Connectez-vous à votre compte Piolo pour déverrouiller la localisation satellite et le calcul d’itinéraire.'
        }
      });
    }
  };

  const mapRef = useRef(null);
  const googleMapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  const [currentLat, setCurrentLat] = useState(parseFloat(latitude) || 3.8480);
  const [currentLng, setCurrentLng] = useState(parseFloat(longitude) || 11.5021);
  const [mapReady, setMapReady] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadGoogleMapsApi().then((maps) => {
      if (!isMounted || !mapRef.current) return;

      const centerPos = { lat: currentLat, lng: currentLng };

      const map = new maps.Map(mapRef.current, {
        center: centerPos,
        zoom: 16,
        mapTypeId: maps.MapTypeId.HYBRID, // Satellite avec étiquettes de rues comme sur la capture
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: maps.ControlPosition.TOP_LEFT
        },
        zoomControl: true,
        zoomControlOptions: {
          position: maps.ControlPosition.RIGHT_BOTTOM
        },
        fullscreenControl: true,
        fullscreenControlOptions: {
          position: maps.ControlPosition.RIGHT_TOP
        },
        streetViewControl: false,
        gestureHandling: 'greedy'
      });

      // Pin Doré Piolo Personnalisé
      const marker = new maps.Marker({
        position: centerPos,
        map: map,
        draggable: !readOnly,
        title: title || "Atelier Professionnel",
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: '#D4AF37',
          fillOpacity: 1,
          strokeColor: '#0F0D09',
          strokeWeight: 2,
          scale: 1.8,
          anchor: new maps.Point(12, 22)
        }
      });

      // Cercle de Rayon Doré
      const circle = new maps.Circle({
        strokeColor: '#D4AF37',
        strokeOpacity: 0.85,
        strokeWeight: 2,
        fillColor: '#D4AF37',
        fillOpacity: 0.12,
        map: map,
        center: centerPos,
        radius: 180
      });

      googleMapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;
      setMapReady(true);

      // Événements de clic et de drag sur la carte Google Maps
      if (!readOnly) {
        map.addListener('click', (e) => {
          const newLat = e.latLng.lat();
          const newLng = e.latLng.lng();
          const newPos = { lat: newLat, lng: newLng };
          marker.setPosition(newPos);
          circle.setCenter(newPos);
          setCurrentLat(newLat);
          setCurrentLng(newLng);
          if (onLocationChange) onLocationChange(newLat, newLng);
        });

        marker.addListener('dragend', (e) => {
          const newLat = e.latLng.lat();
          const newLng = e.latLng.lng();
          const newPos = { lat: newLat, lng: newLng };
          circle.setCenter(newPos);
          setCurrentLat(newLat);
          setCurrentLng(newLng);
          if (onLocationChange) onLocationChange(newLat, newLng);
        });
      }
    }).catch(err => {
      console.error("Erreur chargement Google Maps API:", err);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Synchronisation avec les props latitude / longitude externes
  useEffect(() => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!isNaN(lat) && !isNaN(lng) && googleMapInstanceRef.current && markerRef.current && circleRef.current) {
      if (Math.abs(lat - currentLat) > 0.0001 || Math.abs(lng - currentLng) > 0.0001) {
        const newPos = { lat, lng };
        setCurrentLat(lat);
        setCurrentLng(lng);
        markerRef.current.setPosition(newPos);
        circleRef.current.setCenter(newPos);
        googleMapInstanceRef.current.panTo(newPos);
      }
    }
  }, [latitude, longitude]);

  // Me géolocaliser automatiquement avec le GPS
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const newPos = { lat, lng };
        setCurrentLat(lat);
        setCurrentLng(lng);
        if (googleMapInstanceRef.current && markerRef.current && circleRef.current) {
          markerRef.current.setPosition(newPos);
          circleRef.current.setCenter(newPos);
          googleMapInstanceRef.current.panTo(newPos);
          googleMapInstanceRef.current.setZoom(17);
        }
        if (onLocationChange) onLocationChange(lat, lng);
        setGpsLoading(false);
      },
      (err) => {
        console.error("Erreur GPS:", err);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div 
      onClick={isLocked ? handleAuthRedirect : undefined}
      style={{ 
        position: 'relative', 
        width: '100%', 
        borderRadius: 16, 
        overflow: 'hidden', 
        border: '1.5px solid #D4AF37', 
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        cursor: isLocked ? 'pointer' : 'default'
      }}
    >
      
      {/* BOUTON GPS SUR LA CARTE */}
      {!readOnly && (
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={gpsLoading}
          style={{
            position: 'absolute',
            top: 12,
            right: 56,
            zIndex: 10,
            background: 'rgba(15,13,9,0.9)',
            color: '#F6D365',
            border: '1.5px solid #D4AF37',
            padding: '6px 14px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 800,
            cursor: gpsLoading ? 'wait' : 'pointer',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.35)'
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
          </svg>
          <span>{gpsLoading ? 'Localisation en cours...' : 'Me positionner par GPS'}</span>
        </button>
      )}

      {/* CONTENEUR GOOGLE MAPS (FLOU SI NON CONNECTÉ) */}
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height,
          filter: isLocked ? 'blur(6px)' : 'none',
          transform: isLocked ? 'scale(1.05)' : 'none',
          transition: 'filter 0.3s ease, transform 0.3s ease',
          pointerEvents: isLocked ? 'none' : 'auto'
        }} 
      />

      {/* OVERLAY DE VEROUILLAGE / AUTHENTIFICATION SI NON CONNECTÉ */}
      {isLocked && (
        <div
          onClick={handleAuthRedirect}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15, 13, 9, 0.68)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            textAlign: 'center',
            zIndex: 25,
            cursor: 'pointer'
          }}
        >
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0F0D09',
            fontSize: 19,
            marginBottom: 10,
            boxShadow: '0 6px 20px rgba(212,175,55,0.45)'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
          </div>
          <div style={{ color: '#FFFFFF', fontWeight: 800, fontSize: 15, fontFamily: 'Poppins, sans-serif', marginBottom: 4 }}>
            Localisation Précise & Vue Satellite
          </div>
          <div style={{ color: '#E8E3DA', fontSize: 12, maxWidth: 330, lineHeight: 1.45, marginBottom: 14 }}>
            Connectez-vous pour déverrouiller la vue satellite HD, le calcul d'itinéraire et les coordonnées exactes.
          </div>
          <button
            type="button"
            onClick={handleAuthRedirect}
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #F6D365 100%)',
              color: '#0F0D09',
              border: 'none',
              borderRadius: 10,
              padding: '8px 18px',
              fontWeight: 800,
              fontSize: 12.5,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(212,175,55,0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7
            }}
          >
            <span>Se connecter pour déverrouiller</span>
            <span>→</span>
          </button>
        </div>
      )}

      {/* BARRE INFORMATIVE PROFESSIONNELLE EN BAS DE CARTE */}
      <div style={{ background: '#0F0D09', padding: '10px 16px', color: '#FFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, borderTop: '1px solid rgba(212,175,55,0.3)', flexWrap: 'wrap', gap: 10, position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#D4AF37', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.4px', fontSize: 11 }}>Coordonnées GPS</span>
          <span style={{ fontFamily: 'monospace', color: '#E8E3DA', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)' }}>
            {isLocked ? `${currentLat.toFixed(2)}***, ${currentLng.toFixed(2)}***` : `${currentLat.toFixed(5)}, ${currentLng.toFixed(5)}`}
          </span>
        </div>

        {!readOnly ? (
          <span style={{ color: '#AAA', fontSize: 11.5, fontWeight: 600 }}>
            Positionnez le repère doré sur l'emplacement exact de votre atelier ou bureau.
          </span>
        ) : isLocked ? (
          <button
            type="button"
            onClick={handleAuthRedirect}
            style={{
              background: 'none',
              border: 'none',
              color: '#F6D365',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              cursor: 'pointer',
              padding: 0
            }}
          >
            <span>Calculer l'itinéraire Google Maps (Connexion requise)</span>
            <span>→</span>
          </button>
        ) : (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${currentLat},${currentLng}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#F6D365',
              textDecoration: 'none',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12
            }}
          >
            <span>Calculer l'itinéraire Google Maps</span>
            <span>→</span>
          </a>
        )}
      </div>

    </div>
  );
}
