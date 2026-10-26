// frontend/src/pages/auth/register-bailleur/components/StepShell.jsx
import React from 'react';

const T = { or:'#D4AF37', orL:'#F6D365', noir:'#1A1A1A', grisB:'#E8E4DC' };

const STEP_META = [
  { label:'👤 Identité',    title:'Informations personnelles' },
  { label:'📱 Vérification',title:'Vérification téléphone'    },
  { label:'🪪 Documents',   title:'Pièce d\'identité'         },
  { label:'🏘️ Patrimoine',  title:'Votre patrimoine'          },
  { label:'✅ Soumission',   title:'Récapitulatif & envoi'     },
];

export function StepShell({ step, total, children, onNext, onBack, loading, nextLabel, hideBack }) {
  const meta = STEP_META[step - 1];

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#D6CFC0', padding:'20px 16px', fontFamily:"'DM Sans',sans-serif" }}>
      {/* BG */}
      <div style={{ position:'fixed', inset:0, zIndex:0, background:'linear-gradient(170deg,rgba(10,6,0,.72) 0%,rgba(10,6,0,.2) 48%,rgba(10,6,0,.78) 100%), url(https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80) center/cover no-repeat' }} />

      <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:430, display:'flex', flexDirection:'column', gap:0 }}>

        {/* Header */}
        <div style={{ background:'rgba(10,6,0,.55)', backdropFilter:'blur(14px)', borderRadius:'20px 20px 0 0', padding:'16px 18px 12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {!hideBack && (
              <button type="button" onClick={onBack} style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.25)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff', fontSize:18, fontFamily:"'Poppins',sans-serif", fontWeight:600 }}>←</button>
            )}
            <div>
              <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:15, fontWeight:700, color:'#fff' }}>{meta.title}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.6)', marginTop:1 }}>Étape {step} sur {total}</div>
            </div>
          </div>
          {/* Logo mini */}
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <svg width="22" height="22" viewBox="0 0 34 34" fill="none"><rect width="34" height="34" rx="10" fill="rgba(212,175,55,.22)"/><path d="M17 6L5 16v13h9v-8h6v8h9V16L17 6z" fill="#D4AF37"/></svg>
            <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:16, fontWeight:800, color:T.orL }}>Piolo</span>
          </div>
        </div>

        {/* Progress pills */}
        <div style={{ background:'rgba(10,6,0,.4)', backdropFilter:'blur(8px)', padding:'12px 18px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} style={{ flex:1, height:4, borderRadius:4, background: i + 1 < step ? '#27AE60' : i + 1 === step ? T.or : 'rgba(255,255,255,.2)', transition:'background .3s' }} />
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:11, fontWeight:700, color:T.orL }}>Étape {step} / {total}</span>
            <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:13, fontWeight:700, color:'#fff' }}>{meta.label}</span>
          </div>
        </div>

        {/* Card content */}
        <div style={{ background:'rgba(255,255,255,.97)', padding:'24px 22px', maxHeight:'60vh', overflowY:'auto' }}>
          {children}
        </div>

        {/* Bottom action */}
        <div style={{ background:'rgba(255,255,255,.97)', borderTop:`1px solid ${T.grisB}`, padding:'14px 18px 20px', borderRadius:'0 0 20px 20px', boxShadow:'0 12px 50px rgba(0,0,0,.22)' }}>
          <button
            type="button"
            onClick={onNext}
            disabled={loading}
            style={{ width:'100%', background:`linear-gradient(135deg,${T.or},${T.orL})`, color:T.noir, fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:15, padding:14, borderRadius:14, border:'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow:'0 5px 20px rgba(212,175,55,.42)', display:'flex', alignItems:'center', justifyContent:'center', gap:9, opacity: loading ? .7 : 1, transition:'transform .15s' }}
          >
            {loading
              ? <span style={{ width:18, height:18, border:'2px solid rgba(26,26,26,.3)', borderTop:'2px solid #1A1A1A', borderRadius:'50%', display:'inline-block', animation:'spin .7s linear infinite' }} />
              : <>{nextLabel || 'Continuer'} <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M10 17l5-5-5-5v10z"/></svg></>
            }
          </button>
          {!hideBack && (
            <button type="button" onClick={onBack} style={{ width:'100%', background:'transparent', color:'#888', fontFamily:"'Poppins',sans-serif", fontWeight:600, fontSize:13, padding:11, borderRadius:12, border:`1.5px solid ${T.grisB}`, cursor:'pointer', marginTop:10 }}>
              ← Étape précédente
            </button>
          )}
          <div style={{ textAlign:'center', fontSize:11, color:'#AAA', marginTop:8 }}>🔒 Vos données sont chiffrées</div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}