// frontend/src/pages/auth/register-bailleur/components/Steps.jsx
// Regroupe Step1…Step5 + SuccessScreen

import React, { useState, useEffect } from 'react';
import {
  FieldInput, FieldSelect, FieldTextarea,
  UploadBox, SelfieBox, CounterRow, ChipGroup,
  InfoBox, Checkbox, AlertError, Divider, TipRow, UploadProgressBar,
} from '../shared';

const T = { or:'#D4AF37', orL:'#F6D365', orD:'#B8962A', noir:'#1A1A1A', gris:'#555', grisM:'#888', grisB:'#E8E4DC', vert:'#1E8449' };

// ── Icônes SVG partagées ──────────────────────────────────────────────────
const icons = {
  User:  (s) => <svg style={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>,
  Mail:  (s) => <svg style={s} viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>,
  Phone: (s) => <svg style={s} viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>,
  Lock:  (s) => <svg style={s} viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>,
  Pin:   (s) => <svg style={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>,
  Card:  (s) => <svg style={s} viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 3h2v2h-2V7zm0 4h2v2h-2v-2zM5 7h8v2H5V7zm0 4h8v2H5v-2zm0 4h14v2H5v-2z"/></svg>,
  Money: (s) => <svg style={s} viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>,
};

function StepCard({ iconBg, icon, title, desc, children }) {
  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:20, paddingBottom:16, borderBottom:`1px solid ${T.grisB}` }}>
        <div style={{ width:52, height:52, borderRadius:16, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, background:iconBg }}>{icon}</div>
        <div>
          <h3 style={{ fontFamily:"'Poppins',sans-serif", fontSize:17, fontWeight:800, color:T.noir, marginBottom:4 }}>{title}</h3>
          <p style={{ fontSize:12, color:T.gris, lineHeight:1.5 }}>{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ÉTAPE 1 — Identité
// ═══════════════════════════════════════════════════════════════════════════
export function Step1Identite({ form, errors, setField, apiError, clearApiError }) {
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const EyeBtn = ({ show, onToggle }) => (
    <button type="button" onClick={onToggle} style={{ background:'none', border:'none', cursor:'pointer', color:T.grisM, display:'flex', alignItems:'center', padding:0 }}>
      {show
        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>
        : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
      }
    </button>
  );

  return (
    <StepCard iconBg="linear-gradient(135deg,#E8F4FD,#BBDEFB)" icon="👤" title="Qui êtes-vous ?" desc="Ces informations créeront votre compte bailleur et identifieront votre dossier.">
      <AlertError message={apiError} onDismiss={clearApiError} />
      <InfoBox variant="blue" icon="🛡️">
        Votre compte sera en statut <strong>"En attente"</strong> jusqu'à validation admin. Aucune annonce ne peut être publiée avant approbation.
      </InfoBox>
      <div style={{ display:'flex', gap:12 }}>
        <FieldInput label="Prénom" required id="first_name" type="text" placeholder="Marie-Claire" value={form.first_name} onChange={(e) => setField('first_name', e.target.value)} error={errors.first_name} icon={icons.User} />
        <FieldInput label="Nom" required id="last_name" type="text" placeholder="Nkemdirim" value={form.last_name} onChange={(e) => setField('last_name', e.target.value)} error={errors.last_name} icon={icons.User} />
      </div>
      <FieldInput label="Adresse email" required id="email" type="email" autoComplete="email" placeholder="marie@email.com" value={form.email} onChange={(e) => setField('email', e.target.value)} error={errors.email} icon={icons.Mail} />
      <FieldInput label="Numéro de téléphone" required hint="(OTP SMS à l'étape suivante)" id="phone" type="tel" placeholder="+237 6XX XXX XXX" value={form.phone} onChange={(e) => setField('phone', e.target.value)} error={errors.phone} icon={icons.Phone} />
      <FieldInput label="Mot de passe" required id="password" type={showPwd ? 'text' : 'password'} placeholder="Minimum 8 caractères" value={form.password} onChange={(e) => setField('password', e.target.value)} error={errors.password} icon={icons.Lock} rightSlot={<EyeBtn show={showPwd} onToggle={() => setShowPwd(!showPwd)} />} />
      <FieldInput label="Confirmer le mot de passe" required id="password2" type={showPwd2 ? 'text' : 'password'} placeholder="Répétez votre mot de passe" value={form.password2} onChange={(e) => setField('password2', e.target.value)} error={errors.password2} icon={icons.Lock} rightSlot={<EyeBtn show={showPwd2} onToggle={() => setShowPwd2(!showPwd2)} />} />
    </StepCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ÉTAPE 2 — Vérification OTP
// ═══════════════════════════════════════════════════════════════════════════
export function Step2OTP({ form, errors, setField, apiError, clearApiError, onResend, phone }) {
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputsRef = React.useRef([]);

  useEffect(() => {
    let t = 60;
    setCanResend(false);
    const interval = setInterval(() => {
      t--;
      setTimer(t);
      if (t <= 0) { clearInterval(interval); setCanResend(true); }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const arr = (form.otp || '      ').split('');
    arr[idx] = val;
    setField('otp', arr.join(''));
    if (val && idx < 5) inputsRef.current[idx + 1]?.focus();
    if (!val && idx > 0) inputsRef.current[idx - 1]?.focus();
  };

  const handleResend = async () => {
    if (!canResend) return;
    setTimer(60);
    setCanResend(false);
    onResend();
    let t = 60;
    const interval = setInterval(() => {
      t--;
      setTimer(t);
      if (t <= 0) { clearInterval(interval); setCanResend(true); }
    }, 1000);
  };

  const otpArr = (form.otp || '      ').split('').slice(0, 6);

  return (
    <StepCard iconBg="linear-gradient(135deg,#FFF9E6,#FFE082)" icon="📱" title="Vérification SMS" desc={`Un code à 6 chiffres a été envoyé au ${phone || form.phone}. Saisissez-le ci-dessous.`}>
      <AlertError message={apiError} onDismiss={clearApiError} />
      <InfoBox variant="green" icon="✅">
        Cette vérification garantit que votre numéro est bien le vôtre. Elle est obligatoire pour les bailleurs Piolo.
      </InfoBox>

      {/* OTP digits */}
      <div style={{ display:'flex', gap:8, justifyContent:'center', margin:'8px 0 4px' }}>
        {otpArr.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            type="text" inputMode="numeric" maxLength={1}
            value={digit.trim()}
            onChange={(e) => handleOtpChange(i, e.target.value)}
            style={{
              width:46, height:52, border:`2px solid ${digit.trim() ? T.or : errors.otp ? '#C0392B' : T.grisB}`,
              borderRadius:12, fontFamily:"'Poppins',sans-serif", fontSize:20, fontWeight:700,
              textAlign:'center', background: digit.trim() ? 'rgba(212,175,55,.06)' : '#F8F9FA',
              color:T.noir, outline:'none', transition:'border-color .2s',
            }}
          />
        ))}
      </div>
      {errors.otp && <p style={{ fontSize:11, color:'#C0392B', textAlign:'center', marginTop:4 }}>{errors.otp}</p>}

      <p style={{ fontSize:11, color:T.grisM, textAlign:'center', marginBottom:20, marginTop:8 }}>
        Code non reçu ?{' '}
        <span
          onClick={handleResend}
          style={{ color: canResend ? T.orD : T.grisM, fontWeight:600, cursor: canResend ? 'pointer' : 'default' }}
        >
          {canResend ? 'Renvoyer maintenant' : `Renvoyer dans ${timer}s`}
        </span>
      </p>

      <Divider label="Sécurité du compte" />
      <TipRow icon="🔐">Ne partagez jamais ce code avec personne, même un agent Piolo.</TipRow>
      <TipRow icon="⏱️">Le code expire après <strong>10 minutes</strong>. Saisissez-le rapidement.</TipRow>
      <TipRow icon="📶">Assurez-vous d'avoir une connexion réseau MTN ou Orange active.</TipRow>
    </StepCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ÉTAPE 3 — Documents KYC
// ═══════════════════════════════════════════════════════════════════════════
export function Step3Documents({ form, errors, setField, apiError, clearApiError, uploadProgress }) {
  return (
    <StepCard iconBg="linear-gradient(135deg,#E8F5E9,#A5D6A7)" icon="🪪" title="Pièce d'identité officielle" desc="Cette étape permet de vérifier votre identité et d'éviter toute fraude sur la plateforme.">
      <AlertError message={apiError} onDismiss={clearApiError} />
      <InfoBox icon="🔒">
        Vos documents sont <strong>chiffrés AES-256</strong> et ne sont jamais partagés. Seul l'administrateur Piolo y accède pour la vérification.
      </InfoBox>

      <FieldSelect label="Type de document" required id="doc_type" value={form.doc_type} onChange={(e) => setField('doc_type', e.target.value)} error={errors.doc_type}>
        <option value="CNI">Carte Nationale d'Identité (CNI)</option>
        <option value="PASSEPORT">Passeport biométrique</option>
        <option value="SEJOUR">Titre de séjour</option>
      </FieldSelect>

      <FieldInput label="Numéro du document" required id="doc_number" type="text" placeholder="Ex : CM-12345678-A" value={form.doc_number} onChange={(e) => setField('doc_number', e.target.value)} error={errors.doc_number} icon={icons.Card} />

      <div style={{ marginBottom:16 }}>
        <label style={{ fontFamily:"'Poppins',sans-serif", fontSize:11, fontWeight:700, color:T.noir, display:'block', marginBottom:8 }}>
          Scan recto / verso <span style={{ color:T.orD }}>*</span>
        </label>
        <div style={{ display:'flex', gap:10 }}>
          <UploadBox label="Recto" subLabel="Face principale" accept="image/*,application/pdf" value={form.doc_recto} onChange={(f) => setField('doc_recto', f)} error={errors.doc_recto} />
          <UploadBox label="Verso" subLabel="Dos du document" accept="image/*,application/pdf" value={form.doc_verso} onChange={(f) => setField('doc_verso', f)} error={errors.doc_verso} />
        </div>
      </div>

      <UploadProgressBar progress={uploadProgress} />
      <SelfieBox value={form.selfie} onChange={(f) => setField('selfie', f)} error={errors.selfie} />

      <Divider label="Conseils pour vos photos" />
      <TipRow icon="✅">Documents <strong>nets, lisibles</strong>, sans reflet ni flou.</TipRow>
      <TipRow icon="✅">Formats : JPG, PNG, PDF · Taille max : <strong>5 Mo</strong>.</TipRow>
      <TipRow icon="✅">Le numéro CNI doit être <strong>entièrement visible</strong> sur les deux faces.</TipRow>
    </StepCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ÉTAPE 4 — Patrimoine
// ═══════════════════════════════════════════════════════════════════════════
const VILLES = ['Douala','Yaoundé','Bafoussam','Garoua','Maroua','Kribi','Bertoua','Bamenda','Autre'];
const TYPES_BIENS = [
  { value:'Appartements', label:'🏢 Appartements' },
  { value:'Villas',       label:'🏡 Villas'       },
  { value:'Studios',      label:'🛏 Studios'      },
  { value:'Terrains',     label:'🌿 Terrains'     },
  { value:'Bureaux',      label:'🏢 Bureaux'      },
  { value:'Boutiques',    label:'🏪 Boutiques'    },
];

export function Step4Patrimoine({ form, errors, setField, apiError, clearApiError }) {
  return (
    <StepCard iconBg="linear-gradient(135deg,#F3E5F5,#CE93D8)" icon="🏘️" title="Votre patrimoine immobilier" desc="Décrivez les biens que vous souhaitez gérer et louer via Piolo.">
      <AlertError message={apiError} onDismiss={clearApiError} />

      <FieldSelect label="Ville d'activité principale" required id="city" value={form.city} onChange={(e) => setField('city', e.target.value)} error={errors.city}>
        {VILLES.map((v) => <option key={v} value={v}>{v}</option>)}
      </FieldSelect>

      <FieldInput label="Quartier(s) principaux" required id="neighborhoods" type="text" placeholder="Ex : Bastos, Bonapriso, Bonamoussadi…" value={form.neighborhoods} onChange={(e) => setField('neighborhoods', e.target.value)} error={errors.neighborhoods} icon={icons.Pin} />

      <div style={{ marginBottom:4 }}>
        <label style={{ fontFamily:"'Poppins',sans-serif", fontSize:11, fontWeight:700, color:T.noir, display:'block', marginBottom:8 }}>
          Nombre de biens <span style={{ color:T.orD }}>*</span>
        </label>
        <CounterRow label="Biens immobiliers" value={form.nb_biens} onChange={(v) => setField('nb_biens', v)} min={1} max={500} error={errors.nb_biens} />
      </div>

      <ChipGroup label="Types de biens" required hint="(sélection multiple)" options={TYPES_BIENS} value={form.types_biens} onChange={(v) => setField('types_biens', v)} error={errors.types_biens} />

      <div style={{ marginBottom:16 }}>
        <label style={{ fontFamily:"'Poppins',sans-serif", fontSize:11, fontWeight:700, color:T.noir, display:'block', marginBottom:8 }}>
          Fourchette de loyer mensuel
        </label>
        <div style={{ display:'flex', gap:12 }}>
          <FieldInput id="loyer_min" type="number" placeholder="Min. FCFA" value={form.loyer_min} onChange={(e) => setField('loyer_min', e.target.value)} error={errors.loyer_min} icon={icons.Money} style={{ marginBottom:0 }} />
          <FieldInput id="loyer_max" type="number" placeholder="Max. FCFA" value={form.loyer_max} onChange={(e) => setField('loyer_max', e.target.value)} error={errors.loyer_max} icon={icons.Money} style={{ marginBottom:0 }} />
        </div>
      </div>

      <FieldTextarea label="Description de votre patrimoine" required id="description" rows={4} placeholder="Ex : Je possède 3 appartements à Bastos loués entre 80 000 et 120 000 FCFA/mois…" value={form.description} onChange={(e) => setField('description', e.target.value)} error={errors.description} />
    </StepCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ÉTAPE 5 — Récapitulatif
// ═══════════════════════════════════════════════════════════════════════════
function RecapSection({ title, items }) {
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:11, fontWeight:700, color:T.orD, letterSpacing:1, textTransform:'uppercase', marginBottom:8, paddingBottom:4, borderBottom:`1px solid ${T.grisB}` }}>{title}</div>
      {items.map(({ key, value, status }) => (
        <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:`1px solid rgba(232,228,220,.5)` }}>
          <span style={{ fontSize:12, color:T.gris }}>{key}</span>
          <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:12, fontWeight:700, textAlign:'right', maxWidth:'55%', color: status === 'ok' ? T.vert : status === 'pend' ? T.orD : T.noir }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

export function Step5Recap({ form, errors, setField, apiError, clearApiError }) {
  return (
    <StepCard iconBg="linear-gradient(135deg,#FFF3E0,#FFCC80)" icon="📋" title="Récapitulatif du dossier" desc="Vérifiez toutes vos informations avant de soumettre votre dossier à l'équipe Piolo.">
      <AlertError message={apiError} onDismiss={clearApiError} />

      <RecapSection title="👤 Identité" items={[
        { key:'Nom complet', value:`${form.first_name} ${form.last_name}` },
        { key:'Email', value: form.email },
        { key:'Téléphone', value:`✓ ${form.phone} vérifié`, status:'ok' },
      ]} />
      <RecapSection title="🪪 Documents" items={[
        { key:'Type', value: form.doc_type === 'CNI' ? 'CNI Camerounaise' : form.doc_type },
        { key:'Numéro', value: form.doc_number },
        { key:'Recto CNI', value: form.doc_recto ? '✓ Chargé' : '⚠ Manquant', status: form.doc_recto ? 'ok' : 'pend' },
        { key:'Verso CNI', value: form.doc_verso ? '✓ Chargé' : '⚠ Manquant', status: form.doc_verso ? 'ok' : 'pend' },
        { key:'Selfie', value: form.selfie ? '✓ Photo reçue' : '⚠ Manquant', status: form.selfie ? 'ok' : 'pend' },
      ]} />
      <RecapSection title="🏘️ Patrimoine" items={[
        { key:'Ville', value: form.city },
        { key:'Quartiers', value: form.neighborhoods },
        { key:'Nb. de biens', value:`${form.nb_biens} bien${form.nb_biens > 1 ? 's' : ''}` },
        { key:'Types', value: form.types_biens.join(', ') || '—' },
        { key:'Loyers', value: form.loyer_min || form.loyer_max ? `${form.loyer_min || '?'} – ${form.loyer_max || '?'} FCFA` : 'Non renseigné' },
      ]} />
      <RecapSection title="⏳ Statut après envoi" items={[
        { key:'Statut compte', value:'⏳ En attente de validation', status:'pend' },
        { key:'Délai vérification', value:'24 à 48 heures' },
        { key:'Notification', value:'SMS + Email' },
      ]} />

      <InfoBox variant="red" icon="⚠️" style={{ marginTop:4 }}>
        Après <strong>3 dossiers rejetés</strong>, le compte est bloqué définitivement. Assurez-vous que tous vos documents sont authentiques.
      </InfoBox>

      <Checkbox checked={form.certif} onChange={(v) => setField('certif', v)} error={errors.certif}>
        Je certifie que toutes les informations et documents fournis sont <a style={{ color:T.orD, fontWeight:600 }}>exacts et authentiques</a>. Tout document frauduleux entraîne un bannissement définitif de Piolo.
      </Checkbox>
      <Checkbox checked={form.terms} onChange={(v) => setField('terms', v)} error={errors.terms}>
        J'accepte les <a style={{ color:T.orD, fontWeight:600 }}>Conditions d'utilisation</a> et la <a style={{ color:T.orD, fontWeight:600 }}>Politique de Confidentialité</a> de Piolo.
      </Checkbox>
    </StepCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUCCESS SCREEN
// ═══════════════════════════════════════════════════════════════════════════
export function SuccessScreen({ form, onGoHome }) {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#D6CFC0', padding:'20px 16px' }}>
      <div style={{ position:'fixed', inset:0, zIndex:0, background:'linear-gradient(170deg,rgba(10,6,0,.72) 0%,rgba(10,6,0,.2) 48%,rgba(10,6,0,.78) 100%), url(https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80) center/cover no-repeat' }} />
      <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:430, textAlign:'center', padding:'32px 24px' }}>

        {/* Animated badge */}
        <div style={{ width:100, height:100, borderRadius:'50%', background:`linear-gradient(135deg,${T.or},${T.orL})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:46, margin:'0 auto 24px', boxShadow:`0 8px 36px rgba(212,175,55,.5), 0 0 0 16px rgba(212,175,55,.1)`, animation:'pulse 2s infinite' }}>
          📋
        </div>

        <h2 style={{ fontFamily:"'Poppins',sans-serif", fontSize:24, fontWeight:800, color:'#fff', marginBottom:10 }}>Dossier soumis avec succès !</h2>
        <p style={{ fontSize:14, color:'rgba(255,255,255,.72)', lineHeight:1.65, marginBottom:24 }}>
          Votre dossier bailleur est entre les mains de l'équipe Piolo. Vous recevrez une réponse par <strong style={{ color:T.orL }}>SMS et email</strong> dans les 24 à 48 heures.
        </p>

        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(212,175,55,.2)', border:'1.5px solid rgba(212,175,55,.4)', borderRadius:20, padding:'10px 20px', fontFamily:"'Poppins',sans-serif", fontSize:13, fontWeight:700, color:T.orL, marginBottom:28 }}>
          ⏳ En attente de validation
        </div>

        {/* Info card */}
        <div style={{ background:'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.2)', borderRadius:18, padding:20, marginBottom:24, textAlign:'left' }}>
          {[
            { icon:'🔍', title:'Vérification en cours', desc:"L'admin Piolo examine votre CNI et votre selfie pour confirmer votre identité." },
            { icon:'✅', title:'Si approuvé', desc:"Badge « Bailleur Vérifié Piolo » activé. Accès immédiat à la publication d'annonces." },
            { icon:'❌', title:'Si rejeté', desc:"Vous recevrez un motif détaillé et pourrez soumettre un dossier corrigé (3 tentatives max)." },
            { icon:'📩', title:'Notification', desc:`SMS au ${form.phone} et email à ${form.email} dès la décision prise.` },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,.1)' }}>
              <span style={{ fontSize:20, flexShrink:0 }}>{icon}</span>
              <div style={{ fontSize:12, color:'rgba(255,255,255,.75)', lineHeight:1.5 }}>
                <strong style={{ color:'#fff', display:'block', fontFamily:"'Poppins',sans-serif", fontSize:13, fontWeight:700, marginBottom:2 }}>{title}</strong>
                {desc}
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={onGoHome} style={{ width:'100%', background:`linear-gradient(135deg,${T.or},${T.orL})`, color:T.noir, fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:15, padding:14, borderRadius:14, border:'none', cursor:'pointer', boxShadow:'0 5px 20px rgba(212,175,55,.42)', display:'flex', alignItems:'center', justifyContent:'center', gap:9, marginBottom:12 }}>
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          Accéder à mon espace d'attente
        </button>
      </div>
      <style>{`@keyframes pulse{0%,100%{box-shadow:0 8px 36px rgba(212,175,55,.5),0 0 0 16px rgba(212,175,55,.1)}50%{box-shadow:0 8px 36px rgba(212,175,55,.5),0 0 0 24px rgba(212,175,55,.04)}}`}</style>
    </div>
  );
}