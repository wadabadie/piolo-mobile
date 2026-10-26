import Glyph from '../components/Glyph';

export default function RolesSettings() {
  const roles = [
    { title: 'Super Admin', badge: 'Accès Total', desc: 'Gestion absolue du système, des finances, du branding, des rôles et de la sécurité.' },
    { title: 'Administrateur Contenu', badge: 'CMS & Textes', desc: 'Gestion des textes de la page d\'accueil, annonces, bannières et FAQ.' },
    { title: 'Modérateur KYC', badge: 'Certifications', desc: 'Validation et rejet des pièces CNI, passeports et titres fonciers.' },
    { title: 'Administrateur Technique', badge: 'DevOps & API', desc: 'Gestion des clés API, des intégrations, du mode maintenance et des feature flags.' },
    { title: 'Administrateur Financier', badge: 'Comptabilité', desc: 'Gestion des transactions, points fidélité, factures et remboursements.' },
  ];

  return (
    <div id="cfg-roles" className="config-section">
      <div className="config-section__head">
        <div className="config-section__head-left">
          <span className="config-section__icon"><Glyph name="users" size={17} /></span>
          <div>
            <div className="config-section__title">Gestion des Rôles &amp; Matrice de Permissions</div>
            <div className="config-section__desc">Définition des privilèges d'accès aux modules de la plateforme</div>
          </div>
        </div>
      </div>
      <div className="config-section__body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {roles.map(r => (
            <div key={r.title} style={{ background: 'var(--paper)', borderRadius: 14, padding: 16, border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--ink)', fontFamily: 'Poppins, sans-serif' }}>{r.title}</div>
                <span style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold-deep)', padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>{r.badge}</span>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
