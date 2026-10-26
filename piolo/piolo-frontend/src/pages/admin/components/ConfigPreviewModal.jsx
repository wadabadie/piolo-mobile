import { useState } from 'react';
import Glyph from './Glyph';

export default function ConfigPreviewModal({ isOpen, onClose, themeForm, originalTheme, onPublish }) {
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'mobile'

  if (!isOpen) return null;

  const changedKeys = Object.keys(themeForm).filter(
    key => JSON.stringify(themeForm[key]) !== JSON.stringify(originalTheme[key])
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 13, 9, 0.85)', zIndex: 11000, display: 'flex', flexDirection: 'column' }}>
      {/* Header Modal */}
      <div style={{ background: '#181510', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(212,175,55,0.15)', color: 'var(--gold, #D4AF37)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Glyph name="eye" size={20} />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 16, fontFamily: 'Poppins, sans-serif' }}>
              Prévisualisation de la Configuration Avant Publication
            </div>
            <div style={{ color: '#A79C84', fontSize: 12 }}>
              Vérifiez le rendu visuel et le diff des modifications avant d'appliquer aux utilisateurs
            </div>
          </div>
        </div>

        {/* Viewport Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 4, display: 'flex', gap: 4 }}>
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              style={{
                background: viewport === 'desktop' ? 'var(--gold, #D4AF37)' : 'transparent',
                color: viewport === 'desktop' ? '#1C1811' : '#A79C84',
                border: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer'
              }}
            >
              Bureau (1400px)
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              style={{
                background: viewport === 'mobile' ? 'var(--gold, #D4AF37)' : 'transparent',
                color: viewport === 'mobile' ? '#1C1811' : '#A79C84',
                border: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer'
              }}
            >
              Mobile (375px)
            </button>
          </div>

          <button
            type="button"
            onClick={onPublish}
            style={{
              background: 'linear-gradient(135deg, #F6D365, #D4AF37)',
              color: '#1C1811', border: 'none', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
            }}
          >
            <Glyph name="save" size={15} /> Valider &amp; Publier
          </button>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>
      </div>

      {/* Main Content Stage */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: changedKeys.length > 0 ? '320px 1fr' : '1fr', overflow: 'hidden' }}>
        {/* Left Sidebar: Diff list */}
        {changedKeys.length > 0 && (
          <div style={{ background: '#12100B', borderRight: '1px solid rgba(255,255,255,0.08)', padding: 20, overflowY: 'auto' }}>
            <div style={{ color: '#F6D365', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 14 }}>
              Diff des modifications ({changedKeys.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {changedKeys.map(key => (
                <div key={key} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ color: '#fff', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{key}</div>
                  <div style={{ fontSize: 11, color: '#E53E3E', textDecoration: 'line-through', fontFamily: 'monospace' }}>
                    - {String(originalTheme[key] ?? 'non défini')}
                  </div>
                  <div style={{ fontSize: 11, color: '#38A169', fontWeight: 700, fontFamily: 'monospace', marginTop: 2 }}>
                    + {String(themeForm[key] ?? '')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Mock Stage */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 24, overflowY: 'auto', background: '#090805' }}>
          <div
            style={{
              width: viewport === 'mobile' ? 375 : '100%',
              maxWidth: viewport === 'mobile' ? 375 : 1200,
              height: '100%',
              background: themeForm.light_bg || '#F7F4EC',
              borderRadius: viewport === 'mobile' ? 24 : 12,
              border: viewport === 'mobile' ? '8px solid #222' : 'none',
              overflow: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              transition: 'all 0.3s ease'
            }}
          >
            {/* Header Simulator */}
            <div style={{ background: '#fff', padding: '14px 20px', borderBottom: '1px solid #E8E3DA', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {themeForm.logo_url ? (
                  <img src={themeForm.logo_url} alt="Logo" style={{ height: 28 }} />
                ) : (
                  <div style={{ fontFamily: themeForm.font_heading || 'Poppins', fontWeight: 800, fontSize: 18, color: themeForm.primary_gold || '#D4AF37' }}>
                    {themeForm.site_name || 'Piolo'}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64605A' }}>
                {themeForm.site_slogan || 'Plateforme Immobilière'}
              </div>
            </div>

            {/* Hero Simulator */}
            <div style={{ padding: '36px 24px', background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(0,0,0,0.02))', textAlign: 'center' }}>
              <h1 style={{ fontFamily: `'${themeForm.font_heading || 'Poppins'}', sans-serif`, fontSize: viewport === 'mobile' ? 20 : 28, fontWeight: 800, color: '#0F0D09', marginBottom: 10 }}>
                {themeForm.hero_title || 'Trouvez votre bien idéal'}
              </h1>
              <p style={{ fontFamily: `'${themeForm.font_body || 'Inter'}', sans-serif`, fontSize: 13, color: '#64605A', maxWidth: 600, margin: '0 auto 20px' }}>
                {themeForm.hero_subtitle || 'Des annonces vérifiées par Piolo au Cameroun'}
              </p>
              <button
                type="button"
                style={{
                  background: `linear-gradient(135deg, ${themeForm.gold_light || '#F6D365'}, ${themeForm.primary_gold || '#D4AF37'})`,
                  color: '#1C1811', border: 'none', padding: '12px 24px', borderRadius: themeForm.border_radius || 14, fontSize: 13, fontWeight: 800
                }}
              >
                Rechercher un bien
              </button>
            </div>

            {/* KPI Cards Simulator */}
            <div style={{ padding: 24, display: 'grid', gridTemplateColumns: viewport === 'mobile' ? '1fr' : 'repeat(4, 1fr)', gap: 14 }}>
              {[
                { title: 'Biens favoris', val: 5, color: themeForm.primary_gold || '#D4AF37' },
                { title: 'Points fidélité', val: themeForm.welcome_points_tenant || 50, color: '#10B981' },
                { title: 'Messages reçus', val: 0, color: '#1E3A8A' },
                { title: 'Visites à venir', val: 0, color: '#EF4444' },
              ].map((c, i) => (
                <div key={i} style={{ background: '#FFFFFF', borderRadius: themeForm.border_radius || 14, padding: 18, border: '1px solid #E8E3DA', boxShadow: '0 4px 14px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9B9690', textTransform: 'uppercase', marginBottom: 6 }}>{c.title}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#0F0D09' }}>{c.val}</div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3.5, background: c.color }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
