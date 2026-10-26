/* static/js/property_detail.js
   ============================================================
   Page de détail — galerie interactive, carte Google Maps
   en lecture seule (marker fixe, pas de drag), modals, favoris.
   ============================================================ */

'use strict';

// ── Galerie ──────────────────────────────────────────────────────────────
class PropertyGallery {
  constructor(options = {}) {
    this.thumbs = Array.from(document.querySelectorAll('#gallery-thumbs .thumb'));
    this.mainImg = document.getElementById('gallery-main-img');
    this.posEl = document.getElementById('gallery-pos');
    this.totalEl = document.getElementById('gallery-total');
    this.prevBtn = document.getElementById('gallery-prev');
    this.nextBtn = document.getElementById('gallery-next');
    this.thumbsContainer = document.getElementById('gallery-thumbs');

    if (!this.mainImg || this.thumbs.length === 0) return;

    this.mainImg.style.cursor = 'pointer';
    this.mainImg.addEventListener('click', () => this.openLightbox());

    this.currentIndex = 0;
    this.totalEl.textContent = this.thumbs.length;

    // Autoplay : ne démarre que s'il y a plus d'une image
    this.autoplayDelay = options.autoplayDelay || 4500;
    this.autoplayTimer = null;
    this.isPaused = false;

    this.thumbs.forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        this.show(index);
        this.restartAutoplay();
      });
    });
    this.prevBtn?.addEventListener('click', () => { this.show(this.currentIndex - 1); this.restartAutoplay(); });
    this.nextBtn?.addEventListener('click', () => { this.show(this.currentIndex + 1); this.restartAutoplay(); });

    // Navigation clavier
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { 
        this.show(this.currentIndex - 1); this.restartAutoplay(); 
        if(document.getElementById('gallery-lightbox')?.style.display === 'flex') this.updateLightbox();
      }
      if (e.key === 'ArrowRight') { 
        this.show(this.currentIndex + 1); this.restartAutoplay(); 
        if(document.getElementById('gallery-lightbox')?.style.display === 'flex') this.updateLightbox();
      }
      if (e.key === 'Escape') {
        this.closeLightbox();
      }
    });

    // Pause au survol de la galerie (image principale ou miniatures)
    const galleryEl = document.querySelector('.gallery');
    galleryEl?.addEventListener('mouseenter', () => { this.isPaused = true; });
    galleryEl?.addEventListener('mouseleave', () => { 
      if(document.getElementById('gallery-lightbox')?.style.display !== 'flex') {
        this.isPaused = false; 
      }
    });

    // Pause quand l'onglet n'est pas visible (économie de ressources)
    document.addEventListener('visibilitychange', () => {
      this.isPaused = document.hidden;
    });

    if (this.thumbs.length > 1) {
      this.startAutoplay();
    }
  }

  show(index) {
    const total = this.thumbs.length;
    this.currentIndex = (index + total) % total;

    const thumb = this.thumbs[this.currentIndex];

    // Fondu doux sur l'image principale au changement
    this.mainImg.style.opacity = '0';
    setTimeout(() => {
      this.mainImg.src = thumb.dataset.full;
      this.mainImg.style.opacity = '1';
    }, 180);

    this.posEl.textContent = this.currentIndex + 1;

    this.thumbs.forEach((t) => t.classList.remove('active'));
    thumb.classList.add('active');

    // Les miniatures suivent automatiquement la sélection active
    this.scrollThumbIntoView(thumb);
  }

  openLightbox() {
    let lb = document.getElementById('gallery-lightbox');
    if (!lb) {
      lb = document.createElement('div');
      lb.id = 'gallery-lightbox';
      lb.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 10000;
        display: flex; align-items: center; justify-content: center;
        opacity: 0; transition: opacity 0.3s ease;
      `;
      lb.innerHTML = `
        <button id="lb-close" style="position:absolute; top:20px; right:30px; background:none; border:none; color:#fff; font-size:40px; cursor:pointer; font-family:sans-serif; z-index:10001; transition:transform 0.2s;">&times;</button>
        <button id="lb-prev" style="position:absolute; left:20px; background:rgba(255,255,255,0.1); border:none; color:#fff; padding:15px; border-radius:50%; cursor:pointer; z-index:10001; transition:background 0.2s;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <img id="lb-img" style="max-width:90vw; max-height:90vh; object-fit:contain; transition: opacity 0.2s; box-shadow:0 10px 40px rgba(0,0,0,0.5); border-radius:8px;">
        <button id="lb-next" style="position:absolute; right:20px; background:rgba(255,255,255,0.1); border:none; color:#fff; padding:15px; border-radius:50%; cursor:pointer; z-index:10001; transition:background 0.2s;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      `;
      document.body.appendChild(lb);
      
      document.getElementById('lb-close').addEventListener('click', () => this.closeLightbox());
      document.getElementById('lb-prev').addEventListener('click', (e) => { e.stopPropagation(); this.show(this.currentIndex - 1); this.updateLightbox(); });
      document.getElementById('lb-next').addEventListener('click', (e) => { e.stopPropagation(); this.show(this.currentIndex + 1); this.updateLightbox(); });
      
      document.getElementById('lb-prev').addEventListener('mouseover', function() { this.style.background = 'rgba(212,175,55,0.4)'; });
      document.getElementById('lb-prev').addEventListener('mouseout', function() { this.style.background = 'rgba(255,255,255,0.1)'; });
      document.getElementById('lb-next').addEventListener('mouseover', function() { this.style.background = 'rgba(212,175,55,0.4)'; });
      document.getElementById('lb-next').addEventListener('mouseout', function() { this.style.background = 'rgba(255,255,255,0.1)'; });
      document.getElementById('lb-close').addEventListener('mouseover', function() { this.style.transform = 'scale(1.2)'; this.style.color = '#D4AF37'; });
      document.getElementById('lb-close').addEventListener('mouseout', function() { this.style.transform = 'scale(1)'; this.style.color = '#fff'; });

      lb.addEventListener('click', (e) => { if(e.target === lb) this.closeLightbox(); });
    }
    
    this.updateLightbox();
    lb.style.display = 'flex';
    requestAnimationFrame(() => lb.style.opacity = '1');
    document.body.style.overflow = 'hidden';
    this.isPaused = true;
  }

  updateLightbox() {
    const lbImg = document.getElementById('lb-img');
    if (lbImg) {
      lbImg.style.opacity = '0';
      setTimeout(() => {
        lbImg.src = this.thumbs[this.currentIndex].dataset.full;
        lbImg.style.opacity = '1';
      }, 150);
    }
  }

  closeLightbox() {
    const lb = document.getElementById('gallery-lightbox');
    if (lb && lb.style.display !== 'none') {
      lb.style.opacity = '0';
      setTimeout(() => {
        lb.style.display = 'none';
        document.body.style.overflow = '';
        this.isPaused = false;
        this.restartAutoplay();
      }, 300);
    }
  }

  scrollThumbIntoView(thumb) {
    if (!this.thumbsContainer) return;
    const isHorizontal = getComputedStyle(this.thumbsContainer).flexDirection === 'row';
    
    // Calculate the scroll position manually to avoid the whole window jumping
    if (isHorizontal) {
      const containerRect = this.thumbsContainer.getBoundingClientRect();
      const thumbRect = thumb.getBoundingClientRect();
      const offset = thumbRect.left - containerRect.left - (containerRect.width / 2) + (thumbRect.width / 2);
      this.thumbsContainer.scrollBy({ left: offset, behavior: 'smooth' });
    } else {
      const containerRect = this.thumbsContainer.getBoundingClientRect();
      const thumbRect = thumb.getBoundingClientRect();
      const offset = thumbRect.top - containerRect.top - (containerRect.height / 2) + (thumbRect.height / 2);
      this.thumbsContainer.scrollBy({ top: offset, behavior: 'smooth' });
    }
  }

  startAutoplay() {
    this.autoplayTimer = setInterval(() => {
      if (!this.isPaused) this.show(this.currentIndex + 1);
    }, this.autoplayDelay);
  }

  restartAutoplay() {
    if (this.autoplayTimer) clearInterval(this.autoplayTimer);
    if (this.thumbs.length > 1) this.startAutoplay();
  }
}

// ── Carte Google Maps avec itinéraire à la demande ────────────────────────
// Par défaut : cercle flou (position approximative, confidentialité du bien).
// Au clic sur "Itinéraire" : géolocalise l'utilisateur, calcule le trajet
// routier exact jusqu'au bien, et l'affiche avec distance + durée.
let piDetailMap, piDetailCircle, piDetailMarker, piDirectionsService, piDirectionsRenderer;
let piPropertyPosition = null;

function initDetailMap() {
  const mapEl = document.getElementById('detail-map');
  if (!mapEl || !window.google || !window.PIOLO_DETAIL_COORDS) return;

  const { lat, lng, label } = window.PIOLO_DETAIL_COORDS;
  piPropertyPosition = { lat: parseFloat(lat), lng: parseFloat(lng) };

  piDetailMap = new google.maps.Map(mapEl, {
    zoom: 15,
    center: piPropertyPosition,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
    zoomControl: true,
  });

  // Cercle approximatif : protège la position exacte tant que l'utilisateur
  // n'a pas explicitement demandé l'itinéraire.
  piDetailCircle = new google.maps.Circle({
    strokeColor: '#D4AF37',
    strokeOpacity: 0.6,
    strokeWeight: 2,
    fillColor: '#D4AF37',
    fillOpacity: 0.15,
    map: piDetailMap,
    center: piPropertyPosition,
    radius: 350,
  });

  piDetailMarker = new google.maps.Marker({
    position: piPropertyPosition,
    map: piDetailMap,
    title: label || 'Position approximative du bien',
    icon: {
      path: 'M12 3L2 12h3v8h5v-6h4v6h5v-8h3L12 3z', // Icône Maison Premium
      fillColor: '#D4AF37', // Or Piolo
      fillOpacity: 1,
      strokeColor: '#0F0D09', // Noir profond
      strokeWeight: 1.5,
      scale: 1.5,
      anchor: new google.maps.Point(12, 12)
    },
  });

  piDirectionsService = new google.maps.DirectionsService();
  piDirectionsRenderer = new google.maps.DirectionsRenderer({
    map: piDetailMap,
    suppressMarkers: false,
    polylineOptions: { strokeColor: '#D4AF37', strokeWeight: 5 },
  });

  // Bouton "Itinéraire" injecté au-dessus de la carte
  bindItineraryButton();
}
window.initDetailMap = initDetailMap;

function bindItineraryButton() {
  const btn = document.getElementById('btn-itineraire');
  if (!btn) return;
  btn.addEventListener('click', requestItinerary);
}

function requestItinerary() {
  const btn = document.getElementById('btn-itineraire');
  const infoEl = document.getElementById('itineraire-info');

  if (!navigator.geolocation) {
    setItineraryStatus('La géolocalisation n\'est pas supportée par votre navigateur.', 'warn');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Localisation en cours…';
  setItineraryStatus('Recherche de votre position…', 'info');

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      drawRoute(userPos);
    },
    (err) => {
      btn.disabled = false;
      btn.textContent = '🧭 Itinéraire depuis ma position';
      setItineraryStatus('Position non accessible : ' + err.message, 'warn');
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

function drawRoute(userPos) {
  const btn = document.getElementById('btn-itineraire');
  
  // Construit l'URL Google Maps avec l'itinéraire
  const origin = `${userPos.lat},${userPos.lng}`;
  const destination = `${piPropertyPosition.lat},${piPropertyPosition.lng}`;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
  
  // Ouvre Google Maps dans un nouvel onglet
  window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  
  // Réinitialise le bouton
  btn.disabled = false;
  btn.textContent = '🧭 Recalculer l\'itinéraire';
  
  // Affiche un message de succès
  setItineraryStatus(
    '✅ Itinéraire ouvert dans Google Maps. Vérifiez le nouvel onglet.',
    'success'
  );
  
  // Masque le message après 5 secondes
  setTimeout(() => {
    const el = document.getElementById('itineraire-info');
    if (el) el.style.display = 'none';
  }, 5000);
}

function setItineraryStatus(message, type = 'info') {
  const el = document.getElementById('itineraire-info');
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

// ── Modals ───────────────────────────────────────────────────────────────
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Cacher la navbar mobile
    const nav = document.querySelector('.mobile-bottom-nav');
    if (nav) nav.style.transform = 'translateY(150px)';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
    
    // Réafficher la navbar mobile
    const nav = document.querySelector('.mobile-bottom-nav');
    if (nav) nav.style.transform = '';
  }
}
window.openModal = openModal;
window.closeModal = closeModal;

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('dmodal')) {
    e.target.classList.remove('show');
    document.body.style.overflow = '';
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.dmodal.show').forEach((m) => m.classList.remove('show'));
    document.body.style.overflow = '';
  }
});

// ── Favoris ──────────────────────────────────────────────────────────────
function getCsrfCookie() {
  const name = 'csrftoken';
  for (const cookie of document.cookie.split(';')) {
    const [k, v] = cookie.trim().split('=');
    if (k === name) return decodeURIComponent(v);
  }
  return '';
}

function toggleFavoriteDetail(propertyId, btn) {
  fetch(`/toggle-favorite/${propertyId}/`, {
    method: 'POST',
    headers: { 'X-CSRFToken': getCsrfCookie() },
  })
    .then((r) => r.json())
    .then((data) => {
      const svg = btn.querySelector('svg');
      if (data.is_favorite) {
        svg.setAttribute('fill', '#D4AF37');
        svg.setAttribute('stroke', '#D4AF37');
      } else {
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
      }
    })
    .catch((err) => console.error('Erreur favoris :', err));
}
window.toggleFavoriteDetail = toggleFavoriteDetail;

// ── Init ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  new PropertyGallery({ autoplayDelay: 4500 });
});