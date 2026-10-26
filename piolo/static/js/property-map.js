/* static/js/property-map.js
   ============================================================
   Intégration Google Maps pour la création d'annonces Piolo
   - Géolocalisation initiale automatique (getCurrentPosition)
   - Suivi temps réel optionnel (watchPosition) tant que l'étape
     Localisation est active, puis arrêt pour économiser la batterie
   - Marker DRAGGABLE : l'utilisateur peut affiner la position
     en le déplaçant à la main sur la carte
   - Clic sur la carte = déplace aussi le marker
   - Recherche manuelle d'adresse (Geocoding) en fallback
   - Remplit automatiquement #id_latitude et #id_longitude
   ============================================================ */

let piMap;            // instance Google Map
let piMarker;          // marker draggable du bien
let piWatchId = null;   // id renvoyé par watchPosition (pour pouvoir l'arrêter)
let piGeocoder;        // pour la recherche manuelle d'adresse

const PI_DEFAULT_CENTER = { lat: 3.8480, lng: 11.5021 }; // Yaoundé par défaut

/* ── Callback appelé automatiquement par l'API Google Maps (?callback=initMap) ── */
function initMap() {
  piMap = new google.maps.Map(document.getElementById('property-map'), {
    zoom: 14,
    center: PI_DEFAULT_CENTER,
    mapId: 'PIOLO_PROPERTY_MAP',
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
  });

  piGeocoder = new google.maps.Geocoder();

  // Marker unique représentant la position du bien — déplaçable à la main
  piMarker = new google.maps.Marker({
    map: piMap,
    draggable: true,
    position: PI_DEFAULT_CENTER,
    title: 'Position du bien — glissez pour ajuster',
    animation: google.maps.Animation.DROP,
  });

  // Déplacement manuel du marker → met à jour les champs cachés
  piMarker.addListener('dragend', () => {
    const pos = piMarker.getPosition();
    setCoords(pos.lat(), pos.lng());
    reverseGeocode(pos.lat(), pos.lng());
  });

  // Clic sur la carte → déplace le marker à cet endroit
  piMap.addListener('click', (e) => {
    piMarker.setPosition(e.latLng);
    setCoords(e.latLng.lat(), e.latLng.lng());
    reverseGeocode(e.latLng.lat(), e.latLng.lng());
  });

  // Tente une géolocalisation immédiate au chargement de la carte
  geolocateOnce();
}

/* ── Géolocalisation ponctuelle (rapide, une seule lecture) ── */
function geolocateOnce() {
  if (!navigator.geolocation) {
    showMapNotice('La géolocalisation n\'est pas supportée par votre navigateur.', 'warn');
    return;
  }

  showMapNotice('Localisation en cours…', 'info');

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      centerOnPosition(userPos);
      showMapNotice('Position détectée. Glissez le marqueur pour ajuster si besoin.', 'success');
    },
    (err) => {
      console.warn('Géolocalisation refusée ou indisponible :', err.message);
      showMapNotice('Position non détectée. Placez le marqueur manuellement ou recherchez une adresse.', 'warn');
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

/* ── Suivi temps réel (utilisé seulement si l'utilisateur clique sur
     "Utiliser ma position en direct"), avec arrêt explicite ── */
function startLiveTracking() {
  if (!navigator.geolocation) return;
  if (piWatchId !== null) return; // déjà actif

  showMapNotice('Suivi GPS en direct activé…', 'info');

  piWatchId = navigator.geolocation.watchPosition(
    (position) => {
      const userPos = { lat: position.coords.latitude, lng: position.coords.longitude };
      centerOnPosition(userPos);
    },
    (error) => {
      showMapNotice('Suivi GPS interrompu : ' + error.message, 'warn');
      stopLiveTracking();
    },
    { enableHighAccuracy: true, timeout: 60000, maximumAge: 0 }
  );
}

function stopLiveTracking() {
  if (piWatchId !== null) {
    navigator.geolocation.clearWatch(piWatchId);
    piWatchId = null;
  }
}

/* ── Centre la carte + déplace le marker + met à jour les champs ── */
function centerOnPosition(latLng) {
  piMarker.setPosition(latLng);
  piMap.setCenter(latLng);
  piMap.setZoom(16);
  setCoords(latLng.lat, latLng.lng);
  reverseGeocode(latLng.lat, latLng.lng);
}

/* ── Remplit les champs cachés du formulaire Django ── */
function setCoords(lat, lng) {
  document.getElementById('id_latitude').value = lat.toFixed(6);
  document.getElementById('id_longitude').value = lng.toFixed(6);

  const coordsEl = document.getElementById('coords-display');
  if (coordsEl) {
    coordsEl.textContent = `Latitude : ${lat.toFixed(6)} · Longitude : ${lng.toFixed(6)}`;
  }
}

/* ── Geocoding inverse : déduit ville/quartier approximatif depuis lat/lng ── */
function reverseGeocode(lat, lng) {
  if (!piGeocoder) return;
  piGeocoder.geocode({ location: { lat, lng } }, (results, status) => {
    if (status === 'OK' && results[0]) {
      const addressInput = document.getElementById('id_address');
      if (addressInput && !addressInput.dataset.userEdited) {
        addressInput.value = results[0].formatted_address;
      }
    }
  });
}

/* ── Recherche manuelle d'adresse (fallback si pas de GPS) ── */
function searchAddress(query) {
  if (!piGeocoder || !query) return;
  
  piGeocoder.geocode({ address: query + ', Cameroun' }, (results, status) => {
    if (status === 'OK' && results[0]) {
      const loc = results[0].geometry.location;
      centerOnPosition({ lat: loc.lat(), lng: loc.lng() });
      showMapNotice('Localisation trouvée.', 'success');
    } else {
      // Fallback sur textSearch si geocode strict échoue (idéal pour les quartiers comme Odza)
      const service = new google.maps.places.PlacesService(piMap);
      service.textSearch({ query: query + ' Cameroun' }, (places, placeStatus) => {
        if (placeStatus === google.maps.places.PlacesServiceStatus.OK && places && places.length > 0) {
          const loc = places[0].geometry.location;
          centerOnPosition({ lat: loc.lat(), lng: loc.lng() });
          showMapNotice('Quartier/Zone trouvé(e).', 'success');
        } else {
          showMapNotice('Zone introuvable. Déplacez le curseur rouge manuellement.', 'warn');
        }
      });
    }
  });
}

/* ── Petit système de notice visuelle sous la carte ── */
function showMapNotice(message, type = 'info') {
  const el = document.getElementById('map-notice');
  if (!el) return;
  const colors = {
    info:    { bg: 'rgba(44,62,122,.08)',  text: '#2C3E7A', border: 'rgba(44,62,122,.25)' },
    success: { bg: 'rgba(30,132,73,.08)',  text: '#1E8449', border: 'rgba(30,132,73,.25)' },
    warn:    { bg: 'rgba(192,57,43,.08)',  text: '#C0392B', border: 'rgba(192,57,43,.25)' },
  };
  const c = colors[type] || colors.info;
  el.style.background = c.bg;
  el.style.color = c.text;
  el.style.borderColor = c.border;
  el.textContent = message;
  el.style.display = 'block';
}

/* ── Initialisation des boutons liés à la carte (appelée au DOMContentLoaded) ── */
document.addEventListener('DOMContentLoaded', () => {
  const btnGeolocate = document.getElementById('btn-geolocate');
  const btnManual     = document.getElementById('btn-manual');
  const addressInput  = document.getElementById('id_address');
  const btnSearchAddr  = document.getElementById('btn-search-address');

  if (btnGeolocate) {
    btnGeolocate.addEventListener('click', () => {
      geolocateOnce();
    });
  }

  // Le bouton "saisir manuellement" laisse l'utilisateur taper une adresse
  // puis déclenche une recherche geocoding au lieu du GPS
  if (btnManual) {
    btnManual.addEventListener('click', () => {
      if (addressInput) {
        addressInput.removeAttribute('readonly');
        addressInput.focus();
        showMapNotice('Tapez votre adresse puis validez avec le bouton "Rechercher".', 'info');
      }
    });
  }

  if (btnSearchAddr && addressInput) {
    btnSearchAddr.addEventListener('click', () => searchAddress(addressInput.value));
  }

  // Marque le champ adresse comme modifié manuellement pour ne plus
  // l'écraser via reverseGeocode()
  if (addressInput) {
    addressInput.addEventListener('input', () => {
      addressInput.dataset.userEdited = 'true';
    });
  }

  // Arrête le suivi GPS live si l'utilisateur quitte la page (propreté/batterie)
  window.addEventListener('beforeunload', stopLiveTracking);
});