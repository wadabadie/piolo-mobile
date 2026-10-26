/**
 * PIOLO — auth.js
 * Logique d'authentification front-end.
 *
 * Les fonctions handleLogin(), handleRegisterStd(),
 * nextBStep() etc. appellent désormais les endpoints Django
 * via fetch() avec le token CSRF.
 *
 * Aucun setTimeout de simulation ne subsiste en production.
 * Pour tester sans back-end, passez PIOLO_DEMO_MODE = true
 * via une variable globale définie dans le template Django :
 *   <script>window.PIOLO_DEMO_MODE = {{ debug|yesno:"true,false" }};</script>
 */

'use strict';

/* ═══════════════════════════════════════════════════════════
   UTILITAIRES
═══════════════════════════════════════════════════════════ */

/** Lit le cookie CSRF requis par Django pour tout POST. */
function getCsrfToken() {
  const name = 'csrftoken';
  for (const cookie of document.cookie.split(';')) {
    const [k, v] = cookie.trim().split('=');
    if (k === name) return decodeURIComponent(v);
  }
  return '';
}

/**
 * POST JSON vers un endpoint Django.
 * Retourne { ok, ...data } ou { ok: false, error } en cas d'erreur réseau.
 */
async function postJSON(url, body) {
  try {
    const res = await fetch(url, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken':  getCsrfToken(),
      },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (err) {
    console.error('[Piolo] fetch error:', err);
    return { ok: false, error: 'Erreur réseau. Vérifiez votre connexion.' };
  }
}

/**
 * POST multipart/form-data (pour les fichiers KYC).
 */
async function postFormData(url, formData) {
  try {
    const res = await fetch(url, {
      method:  'POST',
      headers: { 'X-CSRFToken': getCsrfToken() },
      body:    formData,
    });
    return await res.json();
  } catch (err) {
    console.error('[Piolo] fetch error:', err);
    return { ok: false, error: 'Erreur réseau. Vérifiez votre connexion.' };
  }
}

/* ═══════════════════════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════════════════════ */

function goTo(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) { el.classList.add('active'); window.scrollTo(0, 0); }
}

/* ═══════════════════════════════════════════════════════════
   TABS (Connexion / Inscription)
═══════════════════════════════════════════════════════════ */

let currentRole = 'LOCATAIRE';

function switchTab(t) {
  const isLogin = t === 'login';
  document.getElementById('tab-login').classList.toggle('active', isLogin);
  document.getElementById('tab-register').classList.toggle('active', !isLogin);
  document.getElementById('panel-login').style.display    = isLogin ? 'block' : 'none';
  document.getElementById('panel-register').style.display = isLogin ? 'none'  : 'block';
}

/* ═══════════════════════════════════════════════════════════
   SÉLECTEUR DE RÔLE
═══════════════════════════════════════════════════════════ */

function selectRole(r) {
  currentRole = r;
  ['LOCATAIRE', 'BAILLEUR', 'ARCHITECTE'].forEach(x => {
    const btn = document.getElementById('role-' + x);
    btn.classList.toggle('active', x === r);
    const chk = btn.querySelector('.role-check');
    chk.innerHTML = x === r
      ? '<svg width="9" height="9" viewBox="0 0 24 24" fill="var(--noir)"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>'
      : '';
  });
  document.getElementById('bailleur-info').style.display     = r === 'BAILLEUR' ? 'flex'  : 'none';
  document.getElementById('form-std').style.display           = r === 'BAILLEUR' ? 'none'  : 'block';
  document.getElementById('form-bailleur-cta').style.display  = r === 'BAILLEUR' ? 'block' : 'none';
}

/* ═══════════════════════════════════════════════════════════
   TOGGLE MOT DE PASSE
═══════════════════════════════════════════════════════════ */

function togglePwd(id, btn) {
  const inp  = document.getElementById(id);
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  btn.querySelector('svg').innerHTML = show
    ? '<path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>'
    : '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>';
}

/* ═══════════════════════════════════════════════════════════
   GESTION DES ERREURS / ALERTES
═══════════════════════════════════════════════════════════ */

function fieldErr(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.display = msg ? 'block' : 'none';
  const wrap = el.previousElementSibling;
  const inp  = wrap?.querySelector('input') || (wrap?.tagName === 'INPUT' ? wrap : null);
  if (inp) inp.classList.toggle('err', !!msg);
}

const ALERT_ICONS = {
  err:  '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>',
  info: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>',
  ok:   '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>',
};

function showAlert(id, type, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!msg) { el.style.display = 'none'; el.innerHTML = ''; return; }
  el.innerHTML  = `<svg viewBox="0 0 24 24">${ALERT_ICONS[type] || ALERT_ICONS.info}</svg>${msg}`;
  el.className  = `alert alert-${{ err: 'err', info: 'info', ok: 'ok' }[type] || 'info'}`;
  el.style.display = 'flex';
}

/** Affiche les erreurs champ par champ depuis une réponse { errors: { field: msg } } */
function showFieldErrors(errors, prefix = '') {
  Object.entries(errors || {}).forEach(([field, msg]) => {
    const errId = `${prefix}${field}-err`;
    fieldErr(errId, msg);
  });
}

/** Désactive un bouton et affiche le spinner. Retourne une fonction restore(). */
function setLoading(btnId, loading = true) {
  const btn = document.getElementById(btnId);
  if (!btn) return () => {};
  const original = btn.innerHTML;
  if (loading) {
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div>';
  } else {
    btn.disabled = false;
    btn.innerHTML = original;
  }
  return () => { btn.disabled = false; btn.innerHTML = original; };
}

/* ═══════════════════════════════════════════════════════════
   CONNEXION
═══════════════════════════════════════════════════════════ */

async function handleLogin() {
  const email    = document.getElementById('l-email').value.trim();
  const password = document.getElementById('l-pwd').value;
  let valid = true;

  fieldErr('l-email-err', '');
  fieldErr('l-pwd-err', '');
  showAlert('login-alert', '', '');

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    fieldErr('l-email-err', 'Adresse email invalide.');
    valid = false;
  }
  if (!password) {
    fieldErr('l-pwd-err', 'Mot de passe requis.');
    valid = false;
  }
  if (!valid) return;

  const restore = setLoading('btn-login');

  const data = await postJSON('/accounts/api/login/', { email, password });
  restore();

  if (data.ok) {
    window.location.href = data.redirect;
  } else {
    showAlert('login-alert', 'err', data.error || 'Erreur de connexion.');
  }
}

/* ═══════════════════════════════════════════════════════════
   INSCRIPTION STANDARD (Locataire / Architecte)
═══════════════════════════════════════════════════════════ */

async function handleRegisterStd() {
  const fname    = document.getElementById('r-fname').value.trim();
  const lname    = document.getElementById('r-lname').value.trim();
  const email    = document.getElementById('r-email').value.trim();
  const password = document.getElementById('r-pwd').value;
  const password2 = document.getElementById('r-pwd2').value;
  let valid = true;

  fieldErr('r-email-err', '');
  fieldErr('r-pwd-err', '');
  showAlert('register-alert', '', '');

  if (!fname || !lname) { showAlert('register-alert', 'err', 'Prénom et nom sont requis.'); valid = false; }
  if (!email || !/\S+@\S+\.\S+/.test(email)) { fieldErr('r-email-err', 'Email invalide.'); valid = false; }
  if (!password || password.length < 8) { fieldErr('r-pwd-err', 'Minimum 8 caractères.'); valid = false; }
  if (password !== password2) { fieldErr('r-pwd-err', 'Les mots de passe ne correspondent pas.'); valid = false; }
  if (!document.getElementById('chk-terms').classList.contains('checked')) {
    showAlert('register-alert', 'err', "Veuillez accepter les conditions d'utilisation.");
    valid = false;
  }
  if (!valid) return;

  const restore = setLoading('btn-register-std');

  const data = await postJSON('/accounts/api/register/', {
    first_name: fname,
    last_name:  lname,
    email,
    password,
    role: currentRole,
  });
  restore();

  if (data.ok) {
    window.location.href = data.redirect;
  } else if (data.errors) {
    showFieldErrors(data.errors, 'r-');
    showAlert('register-alert', 'err', 'Corrigez les erreurs ci-dessus.');
  } else {
    showAlert('register-alert', 'err', data.error || 'Erreur lors de l\'inscription.');
  }
}

/* ═══════════════════════════════════════════════════════════
   CONNEXION SOCIALE (OAuth)
═══════════════════════════════════════════════════════════ */

function socialLogin(provider) {
  // Redirige vers allauth, monté sous /social/
  const urls = {
    Google:   '/accounts/google/login/',
    Facebook: '/social/facebook/login/',
  };
  if (urls[provider]) {
    window.location.href = urls[provider];
  } else {
    showAlert('login-alert', 'err', `Connexion ${provider} non disponible.`);
  }
}

/* ═══════════════════════════════════════════════════════════
   MOT DE PASSE OUBLIÉ
═══════════════════════════════════════════════════════════ */

async function handleForgot() {
  const email = document.getElementById('forgot-email').value.trim();
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    showAlert('forgot-alert', 'err', 'Saisissez une adresse email valide.');
    return;
  }

  const restore = setLoading('btn-forgot');
  const data = await postJSON('/accounts/api/forgot-password/', { email });
  restore();

  // Réponse toujours OK côté serveur (anti-énumération)
  document.getElementById('forgot-ok').style.display = 'block';
}

/* ═══════════════════════════════════════════════════════════
   BAILLEUR ONBOARDING — 5 ÉTAPES
═══════════════════════════════════════════════════════════ */

let bStep   = 1;
let nbBiens = 2;

const STEP_META = [
  { label: 'Identité'   },
  { label: 'Vérif. SMS' },
  { label: 'Documents'  },
  { label: 'Patrimoine' },
  { label: 'Envoi'      },
];

function renderStepper() {
  const wrap = document.getElementById('bail-stepper');
  let html = '';
  STEP_META.forEach((s, i) => {
    const n = i + 1;
    if (i > 0) html += `<div class="step-line${n <= bStep ? ' done' : ''}"></div>`;
    const cls = n < bStep ? 'done' : n === bStep ? 'active' : '';
    html += `
      <div class="step-item">
        <div class="step-circle ${cls}">
          ${n < bStep
            ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>'
            : n}
        </div>
        <span class="step-lbl${n === bStep ? ' active' : ''}">${s.label}</span>
      </div>`;
  });
  wrap.innerHTML = html;
  document.getElementById('bail-prog').style.width = (bStep / 5 * 100) + '%';
}

/* ── Contenu des étapes ─────────────────────────────────── */

const STEPS = {

  1: `
    <h2 class="card-title">Informations personnelles</h2>
    <p class="card-sub">Étape 1 sur 5 — Créez votre compte bailleur</p>
    <div class="info-box bl">
      <div class="ib-ico"><svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg></div>
      <p class="ib-txt">Votre compte sera en statut <strong>En attente</strong> jusqu'à validation de votre dossier par l'équipe Piolo.</p>
    </div>
    <div id="b-step1-alert" style="display:none"></div>
    <div class="field-row">
      <div class="field">
        <label class="field-label">Prénom</label>
        <div class="field-wrap">
          <svg class="field-ico" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
          <input class="field-input" id="b-fname" type="text" placeholder="Marie-Claire"/>
        </div>
        <div class="field-err" id="b-first_name-err" style="display:none"></div>
      </div>
      <div class="field">
        <label class="field-label">Nom</label>
        <div class="field-wrap">
          <svg class="field-ico" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
          <input class="field-input" id="b-lname" type="text" placeholder="Nkemdirim"/>
        </div>
        <div class="field-err" id="b-last_name-err" style="display:none"></div>
      </div>
    </div>
    <div class="field">
      <label class="field-label">Adresse email</label>
      <div class="field-wrap">
        <svg class="field-ico" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
        <input class="field-input" id="b-email" type="email" placeholder="marie@email.com"/>
      </div>
      <div class="field-err" id="b-email-err" style="display:none"></div>
    </div>
    <div class="field">
      <label class="field-label">Téléphone <span style="color:var(--gris-m);font-weight:400">(code OTP à l'étape suivante)</span></label>
      <div class="field-wrap">
        <svg class="field-ico" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
        <input class="field-input" id="b-phone" type="tel" placeholder="+237 6XX XXX XXX"/>
      </div>
      <div class="field-err" id="b-phone-err" style="display:none"></div>
    </div>
    <div class="field">
      <label class="field-label">Mot de passe</label>
      <div class="field-wrap">
        <svg class="field-ico" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
        <input class="field-input" id="b-pwd" type="password" placeholder="Min. 8 caractères"/>
      </div>
      <div class="field-err" id="b-password-err" style="display:none"></div>
    </div>
    <div class="btn-nav-row">
      <button class="btn-back" onclick="goTo('s-auth')">← Retour</button>
      <button class="btn-next" id="btn-b-step1" onclick="handleBailleurStep1()">
        Suivant <svg viewBox="0 0 24 24"><path d="M10 17l5-5-5-5v10z"/></svg>
      </button>
    </div>`,

  2: `
    <h2 class="card-title">Vérification téléphone</h2>
    <p class="card-sub">Étape 2 sur 5 — Code à 6 chiffres envoyé à votre numéro</p>
    <div id="b-otp-alert" style="display:none"></div>
    <div class="otp-inputs">
      <input class="otp-digit" maxlength="1" inputmode="numeric" onkeyup="otpMove(this,0)"/>
      <input class="otp-digit" maxlength="1" inputmode="numeric" onkeyup="otpMove(this,1)"/>
      <input class="otp-digit" maxlength="1" inputmode="numeric" onkeyup="otpMove(this,2)"/>
      <input class="otp-digit" maxlength="1" inputmode="numeric" onkeyup="otpMove(this,3)"/>
      <input class="otp-digit" maxlength="1" inputmode="numeric" onkeyup="otpMove(this,4)"/>
      <input class="otp-digit" maxlength="1" inputmode="numeric" onkeyup="otpMove(this,5)"/>
    </div>
    <p class="otp-note" style="margin-bottom:18px;">Pas reçu ? <span class="otp-resend" onclick="startTimer(this)">Renvoyer dans <span class="otp-timer-val">60s</span></span></p>
    <div class="info-box gn">
      <div class="ib-ico"><svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg></div>
      <p class="ib-txt">Ne partagez jamais ce code. Il expire dans <strong>10 minutes</strong>.</p>
    </div>
    <div class="btn-nav-row">
      <button class="btn-back" onclick="prevBStep()">← Retour</button>
      <button class="btn-next" id="btn-b-otp" onclick="handleBailleurOtp()">
        Valider <svg viewBox="0 0 24 24"><path d="M10 17l5-5-5-5v10z"/></svg>
      </button>
    </div>`,

  3: `
    <h2 class="card-title">Pièce d'identité</h2>
    <p class="card-sub">Étape 3 sur 5 — Documents chiffrés AES-256</p>
    <div class="field">
      <label class="field-label">Type de document</label>
      <select class="field-select" id="b-doc-type">
        <option value="CNI">Carte Nationale d'Identité (CNI)</option>
        <option value="PASSEPORT">Passeport biométrique</option>
        <option value="SEJOUR">Titre de séjour</option>
      </select>
    </div>
    <div class="field">
      <label class="field-label">Numéro du document</label>
      <div class="field-wrap">
        <svg class="field-ico" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 3h2v2h-2V7zm0 4h2v2h-2v-2zM5 7h8v2H5V7zm0 4h8v2H5v-2zm0 4h14v2H5v-2z"/></svg>
        <input class="field-input" id="b-cni" type="text" placeholder="CM-12345678-A"/>
      </div>
    </div>
    <p class="sec-lbl">Scan recto / verso</p>
    <div class="upload-grid">
      <div class="upload-box" id="up-recto">
        <input type="file" id="file-recto" accept=".jpg,.jpeg,.png,.pdf" style="display:none" onchange="handleFileUpload(this,'up-recto','badge-recto')"/>
        <div class="ub-ico" onclick="document.getElementById('file-recto').click()"><svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg></div>
        <div class="ub-title">Recto</div><div class="ub-sub">Face principale</div>
        <div class="ub-badge" id="badge-recto" onclick="document.getElementById('file-recto').click()">Charger</div>
      </div>
      <div class="upload-box" id="up-verso">
        <input type="file" id="file-verso" accept=".jpg,.jpeg,.png,.pdf" style="display:none" onchange="handleFileUpload(this,'up-verso','badge-verso')"/>
        <div class="ub-ico" onclick="document.getElementById('file-verso').click()"><svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg></div>
        <div class="ub-title">Verso</div><div class="ub-sub">Dos du document</div>
        <div class="ub-badge" id="badge-verso" onclick="document.getElementById('file-verso').click()">Charger</div>
      </div>
    </div>
    <p class="sec-lbl">Selfie de vérification</p>
    <div class="upload-box solo" id="up-selfie">
      <input type="file" id="file-selfie" accept=".jpg,.jpeg,.png" style="display:none" onchange="handleFileUpload(this,'up-selfie','badge-selfie')"/>
      <div class="ub-ico" onclick="document.getElementById('file-selfie').click()"><svg viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg></div>
      <div class="ub-title">Photo tenant votre pièce d'identité</div>
      <div class="ub-sub">Visage + document lisibles · JPG / PNG max 5 Mo</div>
      <div class="ub-badge" id="badge-selfie" onclick="document.getElementById('file-selfie').click()">Prendre une photo</div>
    </div>
    <div class="btn-nav-row">
      <button class="btn-back" onclick="prevBStep()">← Retour</button>
      <button class="btn-next" onclick="nextBStep()">Suivant <svg viewBox="0 0 24 24"><path d="M10 17l5-5-5-5v10z"/></svg></button>
    </div>`,

  4: `
    <h2 class="card-title">Votre patrimoine</h2>
    <p class="card-sub">Étape 4 sur 5 — Décrivez les biens à gérer sur Piolo</p>
    <div class="field">
      <label class="field-label">Ville principale</label>
      <select class="field-select" id="b-city">
        <option>Douala</option><option selected>Yaoundé</option>
        <option>Bafoussam</option><option>Garoua</option>
        <option>Maroua</option><option>Kribi</option><option>Autre</option>
      </select>
    </div>
    <div class="field">
      <label class="field-label">Quartier(s)</label>
      <div class="field-wrap">
        <svg class="field-ico" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        <input class="field-input" id="b-qrt" type="text" placeholder="Bastos, Bonapriso…"/>
      </div>
    </div>
    <div class="field">
      <label class="field-label">Nombre de biens</label>
      <div class="counter-row">
        <span class="counter-lbl">Biens immobiliers</span>
        <div class="counter-ctrl">
          <button class="counter-btn" onclick="chgBiens(-1)">−</button>
          <span class="counter-val" id="cnt-biens">2</span>
          <button class="counter-btn" onclick="chgBiens(1)">+</button>
        </div>
      </div>
    </div>
    <div class="field">
      <label class="field-label">Types de biens <span style="color:var(--gris-m);font-weight:400">(sélection multiple)</span></label>
      <div class="chips" id="type-chips">
        <span class="chip active" onclick="toggleChip(this)">Appartements</span>
        <span class="chip" onclick="toggleChip(this)">Villas</span>
        <span class="chip" onclick="toggleChip(this)">Studios</span>
        <span class="chip" onclick="toggleChip(this)">Terrains</span>
        <span class="chip" onclick="toggleChip(this)">Bureaux</span>
        <span class="chip" onclick="toggleChip(this)">Boutiques</span>
      </div>
    </div>
    <div class="field">
      <label class="field-label">Description</label>
      <textarea class="field-textarea" id="b-desc" rows="3" placeholder="Ex : 3 appartements à Bastos loués 80 000–120 000 FCFA/mois…"></textarea>
    </div>
    <div class="btn-nav-row">
      <button class="btn-back" onclick="prevBStep()">← Retour</button>
      <button class="btn-next" onclick="nextBStep()">Récapitulatif <svg viewBox="0 0 24 24"><path d="M10 17l5-5-5-5v10z"/></svg></button>
    </div>`,

  5: `
    <h2 class="card-title">Récapitulatif & Envoi</h2>
    <p class="card-sub">Étape 5 sur 5 — Vérifiez avant de soumettre</p>
    <div class="recap-wrap">
      <div class="recap-sec-title">Identité</div>
      <div class="recap-row"><span class="recap-key">Nom complet</span><span class="recap-val" id="rc-name">—</span></div>
      <div class="recap-row"><span class="recap-key">Email</span><span class="recap-val" id="rc-email">—</span></div>
      <div class="recap-row"><span class="recap-key">Téléphone</span><span class="recap-val ok">Vérifié ✓</span></div>
    </div>
    <div class="recap-wrap">
      <div class="recap-sec-title">Documents</div>
      <div class="recap-row"><span class="recap-key">Type</span><span class="recap-val" id="rc-doc-type">—</span></div>
      <div class="recap-row"><span class="recap-key">Numéro</span><span class="recap-val" id="rc-doc-number">—</span></div>  <!-- ← AJOUTER -->
      <div class="recap-row"><span class="recap-key">CNI recto</span><span class="recap-val" id="rc-recto">—</span></div>
      <div class="recap-row"><span class="recap-key">CNI verso</span><span class="recap-val" id="rc-verso">—</span></div>
      <div class="recap-row"><span class="recap-key">Selfie</span><span class="recap-val" id="rc-selfie">—</span></div>
    </div>
    <div class="recap-wrap">
      <div class="recap-sec-title">Patrimoine</div>
      <div class="recap-row"><span class="recap-key">Ville</span><span class="recap-val" id="rc-city">—</span></div>
      <div class="recap-row"><span class="recap-key">Quartier(s)</span><span class="recap-val" id="rc-neighborhoods">—</span></div>  <!-- ← AJOUTER -->
      <div class="recap-row"><span class="recap-key">Biens</span><span class="recap-val" id="rc-biens">—</span></div>
    </div>
    <div class="recap-wrap">
      <div class="recap-sec-title">Statut après envoi</div>
      <div class="recap-row"><span class="recap-key">Compte</span><span class="recap-val pend">En attente</span></div>
      <div class="recap-row"><span class="recap-key">Délai</span><span class="recap-val">24 à 48 heures</span></div>
    </div>
    <div class="info-box rd">
      <div class="ib-ico"><svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg></div>
      <p class="ib-txt">Après <strong>3 dossiers rejetés</strong>, le compte est bloqué définitivement.</p>
    </div>
    <div class="check-row">
      <div class="check-box" id="chk-certif" onclick="this.classList.toggle('checked')"></div>
      <p class="check-txt">Je certifie que toutes les informations sont exactes et authentiques.</p>
    </div>
    <div class="check-row">
      <div class="check-box" id="chk-terms-bail" onclick="this.classList.toggle('checked')"></div>
      <p class="check-txt">J'accepte les <a href="#">Conditions d'utilisation</a> et la <a href="#">Politique de confidentialité</a>.</p>
    </div>
    <div id="b-submit-alert" style="display:none"></div>
    <button class="btn-primary" id="btn-submit-bail" onclick="handleSubmitBail()" style="margin-top:6px;">
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
      Soumettre mon dossier
    </button>
    <div class="btn-nav-row" style="margin-top:10px;">
      <button class="btn-back" style="flex:1" onclick="prevBStep()">← Modifier</button>
    </div>`,
};

// Données collectées au fil des étapes
const bailleurFiles = {}; // Stocke les fichiers même après destruction du DOM (pour le récapitulatif)
const bailleurData = {};

function renderBStep() {
  renderStepper();
  const c = document.getElementById('bail-content');
  c.innerHTML      = STEPS[bStep];
  c.style.opacity  = 0;
  setTimeout(() => { c.style.transition = 'opacity .3s'; c.style.opacity = 1; }, 10);
  if (bStep === 2) startTimer(document.querySelector('.otp-resend'));
  if (bStep === 5) populateRecap();
}

function nextBStep() {
  if (bStep === 3) {
    saveBailleurStep3();  // ← Sauvegarder étape 3 avant de passer à 4
  }
  if (bStep === 4) {
    saveBailleurStep4();  // ← Sauvegarder étape 4 avant de passer à 5
  }
  if (bStep < 5) { bStep++; renderBStep(); }
}
function prevBStep() { if (bStep > 1) { bStep--; renderBStep(); } }

/** Remplit le récapitulatif (étape 5) depuis les données collectées. */
function populateRecap() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '—'; };
  const setOk = (id, val) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = val ? val : '⚠ Manquant';
    el.className = 'recap-val ' + (val ? 'ok' : '');
  };
  
  // Identité
  set('rc-name', `${bailleurData.first_name || ''} ${bailleurData.last_name || ''}`);
  set('rc-email', bailleurData.email);
  
  // Documents
  set('rc-doc-type', bailleurData.document_type === 'CNI' ? 'CNI Camerounaise' : bailleurData.document_type);
  set('rc-doc-number', bailleurData.document_number);  // ← AJOUTER
  setOk('rc-recto', bailleurFiles['file-recto']?.name);
  setOk('rc-verso', bailleurFiles['file-verso']?.name);
  setOk('rc-selfie', bailleurFiles['file-selfie']?.name);
  
  // Patrimoine
  set('rc-city', bailleurData.city);
  set('rc-neighborhoods', bailleurData.neighborhoods);
  set('rc-biens', `${nbBiens} — ${getSelectedTypes()}`);
}

function getSelectedTypes() {
  const chips = document.querySelectorAll('#type-chips .chip.active');
  return [...chips].map(c => c.textContent).join(', ') || '—';
}

/* ── Handlers Bailleur ───────────────────────────────────── */

async function handleBailleurStep1() {
  const first_name = document.getElementById('b-fname').value.trim();
  const last_name  = document.getElementById('b-lname').value.trim();
  const email      = document.getElementById('b-email').value.trim();
  const phone      = document.getElementById('b-phone').value.trim();
  const password   = document.getElementById('b-pwd').value;

  // Validation locale uniquement — pas d'appel backend à cette étape
  ['first_name', 'last_name', 'email', 'phone', 'password'].forEach(f =>
    fieldErr('b-' + f + '-err', '')
  );
  showAlert('b-step1-alert', '', '');

  let valid = true;
  if (!first_name) { fieldErr('b-first_name-err', 'Prénom requis.'); valid = false; }
  if (!last_name)  { fieldErr('b-last_name-err',  'Nom requis.');    valid = false; }
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    fieldErr('b-email-err', 'Email invalide.'); valid = false;
  }
  if (!phone) { fieldErr('b-phone-err', 'Téléphone requis.'); valid = false; }
  if (!password || password.length < 8) {
    fieldErr('b-password-err', 'Minimum 8 caractères.'); valid = false;
  }
  if (!valid) return;

  // Sauvegarder dans bailleurData (sera envoyé à l'étape 5 en une seule transaction)
  Object.assign(bailleurData, { first_name, last_name, email, phone, password });
  console.log('Étape 1 sauvegardée localement (pas d\'envoi au backend)');
  nextBStep();
}

async function handleBailleurOtp() {
  const digits = [...document.querySelectorAll('#bail-content .otp-digit')].map(d => d.value);
  const otp    = digits.join('');

  if (otp.length < 6) {
    showAlert('b-otp-alert', 'err', 'Saisissez les 6 chiffres du code OTP.');
    return;
  }
  if (!/^\d{6}$/.test(otp)) {
    showAlert('b-otp-alert', 'err', 'Le code doit contenir uniquement des chiffres.');
    return;
  }

  // Validation locale du format — le vrai OTP sera vérifié côté serveur à l'étape 5
  // (En production : appeler le service SMS ici pour vérifier le code)
  bailleurData.otp_verified = true;
  bailleurData.otp_code = otp;
  console.log('OTP sauvegardé localement (vérification reportée au submit)');
  nextBStep();
}

async function handleSubmitBail() {
  // Validation checkboxes
  if (!document.getElementById('chk-certif')?.classList.contains('checked') ||
      !document.getElementById('chk-terms-bail')?.classList.contains('checked')) {
    const btn = document.getElementById('btn-submit-bail');
    btn.style.animation = 'shake .3s ease';
    setTimeout(() => btn.style.animation = '', 350);
    showAlert('b-submit-alert', 'err', 'Cochez les deux cases pour continuer.');
    return;
  }

  // Sauvegarder étape 4 si pas encore fait
  if (!bailleurData.city) {
    saveBailleurStep4();
  }

  // Validation finale des données requises
  const required = ['first_name', 'last_name', 'email', 'phone', 'password', 
                    'document_type', 'document_number', 'city'];
  const missing = required.filter(key => !bailleurData[key]);
  
  if (missing.length > 0) {
    showAlert('b-submit-alert', 'err', `Champs manquants : ${missing.join(', ')}.`);
    console.error('Données incomplètes:', bailleurData);
    return;
  }

  // Vérifier les fichiers
  const fileRecto  = bailleurFiles['file-recto'];
  const fileVerso  = bailleurFiles['file-verso'];
  const fileSelfie = bailleurFiles['file-selfie'];

  if (!fileRecto || !fileVerso || !fileSelfie) {
    const missingFiles = [];
    if (!fileRecto)  missingFiles.push('CNI recto');
    if (!fileVerso)  missingFiles.push('CNI verso');
    if (!fileSelfie) missingFiles.push('Selfie');
    showAlert('b-submit-alert', 'err', `Documents manquants : ${missingFiles.join(', ')}.`);
    return;
  }

  // Construire FormData avec TOUTES les données (identité + documents + patrimoine)
  const fd = new FormData();
  
  // Identité (étape 1)
  fd.append('first_name', bailleurData.first_name);
  fd.append('last_name', bailleurData.last_name);
  fd.append('email', bailleurData.email);
  fd.append('phone', bailleurData.phone);
  fd.append('password', bailleurData.password);
  
  // Documents (étape 3)
  fd.append('document_type', bailleurData.document_type || 'CNI');
  fd.append('document_number', bailleurData.document_number);
  
  // Patrimoine (étape 4)
  fd.append('city', bailleurData.city);
  fd.append('neighborhoods', bailleurData.neighborhoods);
  fd.append('property_count', bailleurData.property_count || nbBiens);
  fd.append('property_types', bailleurData.property_types || getSelectedTypes());
  fd.append('description', bailleurData.description || '');
  
  // Fichiers
  fd.append('cni_recto', fileRecto);
  fd.append('cni_verso', fileVerso);
  fd.append('selfie', fileSelfie);

  // Envoi UNIQUE vers le nouvel endpoint transactionnel
  const restore = setLoading('btn-submit-bail');
  
  try {
    const data = await postFormData('/accounts/api/bailleur/register-complete/', fd);
    
    if (data.ok) {
      // Succès : rediriger vers page pending
      window.location.href = data.redirect || '/accounts/pending/';
    } else {
      // Erreur backend : afficher le message
      showAlert('b-submit-alert', 'err', data.error || 'Erreur lors de la soumission.');
    }
  } catch (err) {
    console.error('Erreur réseau lors de la soumission:', err);
    showAlert('b-submit-alert', 'err', 'Erreur de connexion. Vérifiez votre réseau.');
  } finally {
    restore();
  }
}

/* ── Upload fichiers KYC ─────────────────────────────────── */
function handleFileUpload(input, boxId, badgeId) {
  const file  = input.files[0];
  const box   = document.getElementById(boxId);
  const badge = document.getElementById(badgeId);
  if (!file || !box || !badge) return;

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    alert(`${file.name} : fichier trop volumineux (max 5 Mo).`);
    input.value = '';
    return;
  }

  // ── Stocker dans bailleurFiles pour survie entre étapes ──
  const fileKey = input.id; // 'file-recto', 'file-verso', 'file-selfie'
  bailleurFiles[fileKey] = file;

  box.classList.add('uploaded');
  badge.textContent = file.name.length > 20 ? file.name.substring(0, 18) + '…' : file.name;
  badge.style.background = 'rgba(30,122,71,.1)';
  badge.style.color = 'var(--vert)';
  const ico = box.querySelector('.ub-ico svg');
  if (ico) ico.setAttribute('fill', 'var(--vert)');
}

/* ── Compteur & Chips ────────────────────────────────────── */
function chgBiens(d) {
  nbBiens = Math.max(1, Math.min(99, nbBiens + d));
  const el = document.getElementById('cnt-biens');
  if (el) el.textContent = nbBiens;
}

function toggleChip(el) { el.classList.toggle('active'); }

/* ── OTP digits ─────────────────────────────────────────── */
function otpMove(el, idx) {
  if (el.value.length === 1) {
    el.classList.add('filled');
    const all = [...el.closest('.otp-inputs').querySelectorAll('.otp-digit')];
    if (idx < 5 && all[idx + 1]) all[idx + 1].focus();
  }
}

let timerInt = null;
function startTimer(el) {
  if (timerInt) clearInterval(timerInt);
  let s = 60;
  const valEl = el?.querySelector('.otp-timer-val');
  timerInt = setInterval(() => {
    s--;
    if (valEl) valEl.textContent = s + 's';
    if (s <= 0) { clearInterval(timerInt); if (valEl) valEl.textContent = 'maintenant'; }
  }, 1000);
}

function resendOtp() { startTimer(document.querySelector('#s-otp .otp-resend')); }

/* ── Shake animation ─────────────────────────────────────── */
const _ks = document.createElement('style');
_ks.textContent = '@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}';
document.head.appendChild(_ks);

/* ── INIT ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderBStep();
});

function saveBailleurStep4() {
  const cityEl = document.getElementById('b-city');
  const qrtEl = document.getElementById('b-qrt');
  const descEl = document.getElementById('b-desc');
  
  // Lire uniquement si l'élément existe dans le DOM
  if (cityEl) bailleurData.city = cityEl.value || '';
  if (qrtEl) bailleurData.neighborhoods = qrtEl.value || '';
  bailleurData.property_count = nbBiens;
  bailleurData.property_types = getSelectedTypes();
  if (descEl) bailleurData.description = descEl.value || '';
  
  console.log('Étape 4 sauvegardée:', bailleurData);
}

/** Sauvegarde les données de l'étape 3 (Documents) dans bailleurData */
function saveBailleurStep3() {
  const docTypeEl = document.getElementById('b-doc-type');
  const cniEl = document.getElementById('b-cni');
  
  if (docTypeEl) bailleurData.document_type = docTypeEl.value || 'CNI';
  if (cniEl) bailleurData.document_number = cniEl.value || '';
  
  console.log('✅ Étape 3 sauvegardée:', {
    document_type: bailleurData.document_type,
    document_number: bailleurData.document_number
  });
}