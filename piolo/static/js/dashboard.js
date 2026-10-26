/* ═══════════════════════════════════════════
   PIOLO — dashboard.js
   Interactivité complète du dashboard locataire
═══════════════════════════════════════════ */
'use strict';

/* ── TOAST ── */
function showToast(msg, icon = 'star') {
  const icons = {
    star: '<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>',
    ok:   '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>',
    info: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>',
  };
  let t = document.getElementById('piolo-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'piolo-toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.innerHTML = `<svg viewBox="0 0 24 24">${icons[icon] || icons.star}</svg>${msg}`;
  t.classList.add('show');
  clearTimeout(t._timeout);
  t._timeout = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ── FAVORI (cœur) ── */
function toggleFav(btn, propName) {
  btn.classList.toggle('saved');
  const saved = btn.classList.contains('saved');
  showToast(
    saved ? `"${propName}" ajouté aux favoris` : `"${propName}" retiré des favoris`,
    saved ? 'ok' : 'info'
  );
  // Mettre à jour le compteur KPI
  updateFavCount(saved ? 1 : -1);
}

function updateFavCount(delta) {
  const el = document.getElementById('kpi-fav-val');
  if (el) el.textContent = Math.max(0, parseInt(el.textContent || '0') + delta);
}

/* ── WELCOME BANNER ── */
function closeWelcome() {
  const b = document.getElementById('welcome-banner');
  if (b) {
    b.style.transition = 'opacity .3s, max-height .4s, margin .4s, padding .4s';
    b.style.opacity = '0';
    b.style.maxHeight = '0';
    b.style.marginBottom = '0';
    b.style.padding = '0';
    setTimeout(() => b.remove(), 450);
  }
}

/* ── FILTER CHIPS (biens) ── */
function initFilterChips() {
  document.querySelectorAll('.fchip').forEach(chip => {
    chip.addEventListener('click', function () {
      document.querySelectorAll('.fchip').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      filterProps(this.dataset.filter || 'all');
    });
  });
}

function filterProps(filter) {
  document.querySelectorAll('.prop-card').forEach(card => {
    const type      = card.dataset.type || '';
    const proptype  = card.dataset.proptype || '';
    
    let show = false;
    if (filter === 'all')          show = true;
    else if (filter === 'louer')   show = type === 'louer';
    else if (filter === 'vendre')  show = type === 'vendre';
    else if (filter === 'appartement') show = proptype === 'appartement';
    else if (filter === 'villa')   show = proptype === 'villa';
    else if (filter === 'studio')  show = proptype === 'studio';
    else show = type === filter || proptype === filter;
    
    card.style.display = show ? '' : 'none';
  });
}

/* ── VISITE ACTIONS ── */
function confirmVisit(btn, name) {
  btn.textContent = 'Confirmé';
  btn.style.background = 'var(--vert)';
  btn.style.color = '#fff';
  btn.disabled = true;
  showToast(`Visite confirmée : ${name}`, 'ok');
}

function cancelVisit(btn, name) {
  const item = btn.closest('.visite-item');
  if (item) {
    item.style.transition = 'opacity .3s, max-height .4s';
    item.style.opacity = '0';
    setTimeout(() => {
      item.remove();
      showToast(`Visite annulée : ${name}`, 'info');
      // Mettre à jour badge KPI visites
      const kpi = document.getElementById('kpi-visit-val');
      if (kpi) kpi.textContent = Math.max(0, parseInt(kpi.textContent || '0') - 1);
    }, 350);
  }
}

/* ── RECHERCHE TOPBAR ── */
function initSearch() {
  const inp = document.querySelector('.tb-search input');
  if (!inp) return;
  let timeout;
  inp.addEventListener('input', function () {
    clearTimeout(timeout);
    const q = this.value.trim().toLowerCase();
    timeout = setTimeout(() => {
      document.querySelectorAll('.prop-card').forEach(card => {
        const txt = card.textContent.toLowerCase();
        card.style.display = !q || txt.includes(q) ? '' : 'none';
      });
    }, 280);
  });
}

/* ── POINTS BARRE ── */
function animateProgressBars() {
  document.querySelectorAll('.pw-prog-fill, .comp-fill').forEach(bar => {
    const target = bar.style.width;
    bar.style.width = '0%';
    requestAnimationFrame(() => {
      setTimeout(() => { bar.style.width = target; }, 120);
    });
  });
}

/* ── SIDEBAR ACTIVE STATE ── */
function initSidebarActive() {
  const path = window.location.pathname;
  document.querySelectorAll('.sb-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('href') === path);
  });
}

/* ── DEVIS ARCHITECTE ── */
function demanderDevis(name) {
  showToast(`Demande de devis envoyée à ${name} (2 pts débités)`, 'ok');
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initFilterChips();
  initSearch();
  animateProgressBars();
  initSidebarActive();
});


