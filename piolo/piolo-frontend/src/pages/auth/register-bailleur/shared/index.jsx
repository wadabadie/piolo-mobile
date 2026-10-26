// frontend/src/pages/auth/register-bailleur/shared/index.jsx
// Tous les composants partagés en un seul fichier pour la portabilité

import React, { useRef, useState } from 'react';

// ── Tokens ────────────────────────────────────────────────────────────────
const T = {
  or: '#D4AF37', orL: '#F6D365', orD: '#B8962A',
  noir: '#1A1A1A', gris: '#555', grisM: '#888',
  grisF: '#F8F9FA', grisB: '#E8E4DC',
  vert: '#1E8449', rouge: '#C0392B', bleu: '#2C3E7A',
};

const s = {
  label: {
    fontFamily: "'Poppins',sans-serif", fontSize: 11, fontWeight: 700,
    color: T.noir, display: 'flex', alignItems: 'center',
    gap: 5, marginBottom: 6,
  },
  req:  { color: T.orD },
  hint: { fontWeight: 400, color: T.grisM, fontSize: 10 },
  wrap: { position: 'relative' },
  icon: {
    position: 'absolute', left: 13, top: '50%',
    transform: 'translateY(-50%)', width: 16, height: 16,
    fill: T.grisM, pointerEvents: 'none',
  },
  input: (hasIcon, hasError) => ({
    width: '100%', background: T.grisF,
    border: `1.5px solid ${hasError ? T.rouge : T.grisB}`,
    borderRadius: 12,
    padding: `12px 14px 12px ${hasIcon ? 40 : 14}px`,
    fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: T.noir,
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color .2s, box-shadow .2s',
    background: hasError ? 'rgba(192,57,43,.04)' : T.grisF,
  }),
  error: { fontSize: 11, color: T.rouge, marginTop: 4 },
  fg: { marginBottom: 16 },
};

// ── FieldInput ────────────────────────────────────────────────────────────
export function FieldInput({
  label, required, hint, icon: Icon,
  error, id, rightSlot, style, ...inputProps
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={s.fg}>
      {label && (
        <label style={s.label} htmlFor={id}>
          {label}
          {required && <span style={s.req}>*</span>}
          {hint && <span style={s.hint}>{hint}</span>}
        </label>
      )}
      <div style={s.wrap}>
        {Icon && <Icon style={s.icon} />}
        <input
          id={id}
          {...inputProps}
          style={{
            ...s.input(!!Icon, !!error),
            paddingRight: rightSlot ? 44 : 14,
            boxShadow: focused ? `0 0 0 3px rgba(212,175,55,.15)` : 'none',
            borderColor: focused ? T.or : (error ? T.rouge : T.grisB),
            ...style,
          }}
          onFocus={(e) => { setFocused(true); inputProps.onFocus?.(e); }}
          onBlur={(e)  => { setFocused(false); inputProps.onBlur?.(e); }}
        />
        {rightSlot && (
          <div style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)' }}>
            {rightSlot}
          </div>
        )}
      </div>
      {error && <p style={s.error}>{error}</p>}
    </div>
  );
}

// ── FieldSelect ───────────────────────────────────────────────────────────
export function FieldSelect({ label, required, error, children, id, ...props }) {
  return (
    <div style={s.fg}>
      {label && (
        <label style={s.label} htmlFor={id}>
          {label}{required && <span style={s.req}>*</span>}
        </label>
      )}
      <select
        id={id}
        {...props}
        style={{
          width: '100%', background: T.grisF,
          border: `1.5px solid ${error ? T.rouge : T.grisB}`,
          borderRadius: 12, padding: '12px 36px 12px 14px',
          fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: T.noir,
          appearance: 'none', cursor: 'pointer',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 13px center',
        }}
      >
        {children}
      </select>
      {error && <p style={s.error}>{error}</p>}
    </div>
  );
}

// ── FieldTextarea ─────────────────────────────────────────────────────────
export function FieldTextarea({ label, required, error, id, rows = 4, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={s.fg}>
      {label && (
        <label style={s.label} htmlFor={id}>
          {label}{required && <span style={s.req}>*</span>}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        {...props}
        style={{
          width: '100%', background: T.grisF,
          border: `1.5px solid ${error ? T.rouge : focused ? T.or : T.grisB}`,
          borderRadius: 12, padding: '13px 14px',
          fontFamily: "'DM Sans',sans-serif", fontSize: 13,
          color: T.noir, resize: 'none', lineHeight: 1.6,
          outline: 'none', boxSizing: 'border-box',
          boxShadow: focused ? '0 0 0 3px rgba(212,175,55,.15)' : 'none',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {error && <p style={s.error}>{error}</p>}
    </div>
  );
}

// ── UploadBox ─────────────────────────────────────────────────────────────
export function UploadBox({ label, subLabel, accept, error, value, onChange, icon = '📄' }) {
  const ref = useRef();
  const uploaded = !!value;

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onChange(file);
  };

  return (
    <div style={{ flex: 1 }}>
      <div
        onClick={() => ref.current.click()}
        style={{
          border: `2px dashed ${uploaded ? T.vert : error ? T.rouge : T.grisB}`,
          borderRadius: 16, padding: '16px 10px', textAlign: 'center',
          cursor: 'pointer', background: uploaded ? 'rgba(30,132,73,.05)' : T.grisF,
          transition: 'all .25s',
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 8 }}>{uploaded ? '✅' : icon}</div>
        <div style={{ fontFamily:"'Poppins',sans-serif", fontSize: 12, fontWeight: 700, color: T.noir, marginBottom: 3 }}>
          {label}
        </div>
        {subLabel && (
          <div style={{ fontSize: 10, color: T.grisM, lineHeight: 1.4, marginBottom: 8 }}>
            {subLabel}
          </div>
        )}
        <div style={{
          display: 'inline-block', padding: '3px 10px', borderRadius: 20,
          fontFamily:"'Poppins',sans-serif", fontSize: 10, fontWeight: 700,
          background: uploaded ? 'rgba(30,132,73,.15)' : 'rgba(212,175,55,.12)',
          color: uploaded ? T.vert : T.orD,
        }}>
          {uploaded ? `✓ ${value.name.slice(0,18)}` : 'Charger'}
        </div>
        <input ref={ref} type="file" accept={accept} style={{ display:'none' }} onChange={handleChange} />
      </div>
      {error && <p style={s.error}>{error}</p>}
    </div>
  );
}

// ── SelfieBox ─────────────────────────────────────────────────────────────
export function SelfieBox({ value, onChange, error }) {
  const ref = useRef();
  const uploaded = !!value;
  return (
    <div style={s.fg}>
      <label style={s.label}>
        Selfie de vérification <span style={s.req}>*</span>
      </label>
      <div
        onClick={() => ref.current.click()}
        style={{
          border: `2px dashed ${uploaded ? T.or : error ? T.rouge : T.grisB}`,
          borderRadius: 16, padding: '22px 16px', textAlign: 'center',
          cursor: 'pointer', background: uploaded ? 'rgba(212,175,55,.04)' : T.grisF,
          transition: 'all .25s',
        }}
      >
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg,#E0D0F0,#C9A8E0)',
          margin: '0 auto 12px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 34,
          border: `3px solid ${uploaded ? T.or : T.grisB}`,
        }}>
          {uploaded ? '✅' : '🤳'}
        </div>
        <div style={{ fontFamily:"'Poppins',sans-serif", fontSize: 12, fontWeight: 700, color: T.noir, marginBottom: 4 }}>
          {uploaded ? value.name.slice(0,22) : 'Tenez votre pièce d\'identité visible'}
        </div>
        <div style={{ fontSize: 10, color: T.grisM, lineHeight: 1.4, marginBottom: 10 }}>
          Visage + document lisibles · Bonne luminosité
        </div>
        <div style={{
          display: 'inline-block', padding: '3px 12px', borderRadius: 20,
          fontFamily:"'Poppins',sans-serif", fontSize: 10, fontWeight: 700,
          background: uploaded ? 'rgba(212,175,55,.12)' : 'rgba(212,175,55,.12)',
          color: T.orD,
        }}>
          {uploaded ? '✅ Photo ajoutée' : '📷 Prendre une photo'}
        </div>
        <input ref={ref} type="file" accept="image/*" capture="user" style={{ display:'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f); }} />
      </div>
      {error && <p style={s.error}>{error}</p>}
    </div>
  );
}

// ── CounterRow ────────────────────────────────────────────────────────────
export function CounterRow({ label, value, onChange, min = 1, max = 500, error }) {
  return (
    <div style={s.fg}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: T.grisF, border: `1.5px solid ${error ? T.rouge : T.grisB}`,
        borderRadius: 12, padding: '10px 14px',
      }}>
        <span style={{ fontFamily:"'Poppins',sans-serif", fontSize: 13, fontWeight: 600, color: T.noir }}>
          {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="button"
            onClick={() => onChange(Math.max(min, value - 1))}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: `2px solid ${T.or}`, background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700, color: T.orD, cursor: 'pointer',
            }}
          >−</button>
          <span style={{ fontFamily:"'Poppins',sans-serif", fontSize: 18, fontWeight: 800, color: T.noir, minWidth: 28, textAlign:'center' }}>
            {value}
          </span>
          <button
            type="button"
            onClick={() => onChange(Math.min(max, value + 1))}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: `2px solid ${T.or}`, background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700, color: T.orD, cursor: 'pointer',
            }}
          >+</button>
        </div>
      </div>
      {error && <p style={s.error}>{error}</p>}
    </div>
  );
}

// ── ChipGroup ─────────────────────────────────────────────────────────────
export function ChipGroup({ label, required, hint, options, value = [], onChange, error }) {
  const toggle = (v) => {
    const next = value.includes(v) ? value.filter((x) => x !== v) : [...value, v];
    onChange(next);
  };
  return (
    <div style={s.fg}>
      {label && (
        <label style={s.label}>
          {label}{required && <span style={s.req}>*</span>}
          {hint && <span style={s.hint}>{hint}</span>}
        </label>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
        {options.map(({ value: v, label: l }) => {
          const selected = value.includes(v);
          return (
            <button
              key={v}
              type="button"
              onClick={() => toggle(v)}
              style={{
                padding: '7px 14px', borderRadius: 20,
                border: `1.5px solid ${selected ? T.or : T.grisB}`,
                background: selected ? 'rgba(212,175,55,.12)' : '#fff',
                fontFamily: "'Poppins',sans-serif", fontSize: 12, fontWeight: 600,
                color: selected ? T.orD : T.gris, cursor: 'pointer',
                transition: 'all .2s',
              }}
            >
              {l}
            </button>
          );
        })}
      </div>
      {error && <p style={s.error}>{error}</p>}
    </div>
  );
}

// ── InfoBox ───────────────────────────────────────────────────────────────
const INFO_VARIANTS = {
  default: { bg: 'rgba(212,175,55,.08)', border: 'rgba(212,175,55,.25)' },
  blue:    { bg: 'rgba(44,62,122,.06)',  border: 'rgba(44,62,122,.2)'   },
  green:   { bg: 'rgba(30,132,73,.06)', border: 'rgba(30,132,73,.2)'   },
  red:     { bg: 'rgba(192,57,43,.06)', border: 'rgba(192,57,43,.2)'   },
};

export function InfoBox({ variant = 'default', icon, children, style }) {
  const v = INFO_VARIANTS[variant] || INFO_VARIANTS.default;
  return (
    <div style={{
      background: v.bg, border: `1.5px solid ${v.border}`,
      borderRadius: 12, padding: '12px 14px', marginBottom: 16,
      display: 'flex', gap: 10, alignItems: 'flex-start', ...style,
    }}>
      {icon && <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{icon}</span>}
      <div style={{ fontSize: 12, color: T.gris, lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

// ── Checkbox ──────────────────────────────────────────────────────────────
export function Checkbox({ checked, onChange, children, error }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <button
          type="button"
          onClick={() => onChange(!checked)}
          style={{
            width: 20, height: 20,
            border: `2px solid ${checked ? T.or : T.grisB}`,
            borderRadius: 6, flexShrink: 0, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: 1, background: checked ? T.or : '#fff',
            transition: 'all .2s', fontSize: 12, fontWeight: 700, color: T.noir,
          }}
        >
          {checked ? '✓' : ''}
        </button>
        <p style={{ fontSize: 12, color: T.gris, lineHeight: 1.55 }}>{children}</p>
      </div>
      {error && <p style={{ ...s.error, marginLeft: 30 }}>{error}</p>}
    </div>
  );
}

// ── AlertError ────────────────────────────────────────────────────────────
export function AlertError({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div style={{
      background: 'rgba(192,57,43,.08)', border: '1px solid rgba(192,57,43,.25)',
      borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#A0281E',
      marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    }}>
      <span>{message}</span>
      {onDismiss && (
        <button type="button" onClick={onDismiss} style={{ background:'none', border:'none', cursor:'pointer', color:'#A0281E', fontSize: 16, lineHeight: 1, marginLeft: 8, flexShrink: 0 }}>
          ×
        </button>
      )}
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────
export function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
      <div style={{ flex: 1, height: 1, background: T.grisB }} />
      {label && <span style={{ fontSize: 11, color: T.grisM, whiteSpace: 'nowrap', fontFamily:"'Poppins',sans-serif" }}>{label}</span>}
      <div style={{ flex: 1, height: 1, background: T.grisB }} />
    </div>
  );
}

// ── TipRow ────────────────────────────────────────────────────────────────
export function TipRow({ icon, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: `1px solid rgba(232,228,220,.5)` }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 12, color: T.gris, lineHeight: 1.4 }}>{children}</span>
    </div>
  );
}

// ── UploadProgressBar ─────────────────────────────────────────────────────
export function UploadProgressBar({ progress }) {
  if (!progress || progress >= 100) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: T.grisM }}>Upload en cours…</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.orD }}>{progress}%</span>
      </div>
      <div style={{ height: 6, background: T.grisB, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg,${T.or},${T.orL})`, borderRadius: 4, transition: 'width .3s' }} />
      </div>
    </div>
  );
}