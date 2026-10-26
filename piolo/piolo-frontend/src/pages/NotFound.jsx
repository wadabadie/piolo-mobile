import { useTranslation } from 'react-i18next';
// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';

export default function NotFound({ message }) {
  const { t } = useTranslation();
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#F7F5F1', textAlign:'center', padding:'32px' }}>
      <div style={{ fontSize:'80px', marginBottom:'24px' }}>🏠</div>
      <h1 style={{ fontFamily:'var(--font-head)', fontSize:'32px', marginBottom:'12px' }}>
        {message || 'Page introuvable'}
      </h1>
      <p style={{ color:'#64605A', marginBottom:'32px', maxWidth:'400px' }}>
        Cette page n'existe pas ou a été déplacée.
      </p>
      <Link to="/properties" className="btn btn-primary">{t('not_found.back_to_listings')}</Link>
    </div>
  );
}
