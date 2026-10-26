// src/components/SkeletonCard.jsx
export function SkeletonCard() {
  return (
    <>
      <style>{`
        @keyframes sk-shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .sk-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 800px 100%;
          animation: sk-shimmer 1.4s infinite;
          border-radius: 8px;
        }
        .sk-card {
          background: #fff;
          border-radius: 18px;
          border: 1px solid #E8E3DA;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .sk-img { height: 200px; }
        .sk-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        .sk-line { height: 14px; }
        .sk-line--short { width: 60%; }
        .sk-line--med { width: 80%; }
        .sk-line--full { width: 100%; }
        .sk-price { height: 20px; width: 50%; margin-top: 4px; }
        .sk-bulles { display: flex; gap: 8px; }
        .sk-bulle { height: 32px; width: 70px; border-radius: 20px; }
      `}</style>
      <div className="sk-card">
        <div className="sk-shimmer sk-img" />
        <div className="sk-body">
          <div className="sk-shimmer sk-line sk-line--full" />
          <div className="sk-shimmer sk-line sk-line--med" />
          <div className="sk-bulles">
            <div className="sk-shimmer sk-bulle" />
            <div className="sk-shimmer sk-bulle" />
            <div className="sk-shimmer sk-bulle" />
          </div>
          <div className="sk-shimmer sk-price" />
        </div>
      </div>
    </>
  );
}

export function SkeletonDetail() {
  return (
    <div className="sk-detail-container">
      <style>{`
        @keyframes sk-shimmer { 
          0% { background-position: -400px 0; } 
          100% { background-position: 400px 0; } 
        }
        .sk-shimmer { 
          background: linear-gradient(90deg, #F0EDE6 25%, #E2DED5 50%, #F0EDE6 75%); 
          background-size: 800px 100%; 
          animation: sk-shimmer 1.4s infinite; 
          border-radius: 8px; 
        }
        .sk-detail-container {
          max-width: 1320px;
          margin: 0 auto;
          padding: 20px 24px 80px;
        }
        .sk-detail-grid { 
          display: grid; 
          grid-template-columns: 1fr 360px; 
          gap: 28px; 
        }
        .sk-mobile-only { display: none; }
        .sk-desktop-only { display: block; }

        /* Responsive Mobile Layout for Skeleton (< 850px) */
        @media (max-width: 850px) {
          .sk-detail-container {
            padding: 0 14px 100px;
          }
          .sk-detail-grid { 
            grid-template-columns: 1fr; 
            gap: 16px;
          }
          .sk-desktop-only { display: none !important; }
          .sk-mobile-only { display: block !important; }

          /* Mobile Hero Fullscreen Shimmer */
          .sk-mobile-hero {
            position: relative;
            width: 100vw;
            margin-left: calc(-50vw + 50%);
            height: 360px;
            background: #110F0A;
            overflow: hidden;
            margin-bottom: 0;
          }
          .sk-mobile-hero-shimmer {
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, #1C1913 25%, #29241B 50%, #1C1913 75%);
            background-size: 800px 100%;
            animation: sk-shimmer 1.4s infinite;
          }
          .sk-mobile-hero-top {
            position: absolute;
            top: 14px;
            left: 14px;
            right: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .sk-circle-btn {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(8px);
          }
          .sk-mobile-thumbs-strip {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 14px 12px;
            background: linear-gradient(180deg, #13110C 0%, #0C0A07 100%);
            margin-left: -14px;
            margin-right: -14px;
            margin-bottom: 16px;
            overflow-x: hidden;
          }
          .sk-mobile-thumb-item {
            flex: 0 0 68px;
            height: 52px;
            border-radius: 10px;
            background: #1F1C15;
            border: 2px solid rgba(255,255,255,0.08);
          }
          
          /* Sticky Bottom Bar Skeleton */
          .sk-mobile-sticky-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 64px;
            background: rgba(15, 13, 9, 0.96);
            border-top: 1px solid rgba(212, 175, 55, 0.3);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            z-index: 1000;
          }
        }
      `}</style>

      {/* ── MOBILE SKELETON HERO (Écran Edge-to-Edge) ── */}
      <div className="sk-mobile-only">
        <div className="sk-mobile-hero">
          <div className="sk-mobile-hero-shimmer" />
          <div className="sk-mobile-hero-top">
            <div className="sk-circle-btn" />
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="sk-circle-btn" />
              <div className="sk-circle-btn" />
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 14, right: 14 }}>
            <div style={{ width: 50, height: 26, borderRadius: 20, background: 'rgba(255,255,255,0.18)' }} />
          </div>
        </div>

        {/* Ruban de miniatures mobile */}
        <div className="sk-mobile-thumbs-strip">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="sk-mobile-thumb-item sk-shimmer" style={{ background: '#242017' }} />
          ))}
        </div>
      </div>

      {/* ── DESKTOP BREADCRUMB ── */}
      <div className="sk-desktop-only">
        <div className="sk-shimmer" style={{ height: 16, width: 280, marginBottom: 20 }} />
      </div>

      <div className="sk-detail-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* ── DESKTOP GALLERY ── */}
          <div className="sk-desktop-only" style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8E4DC', padding: 12, display: 'grid', gridTemplateColumns: '110px 1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1, 2, 3, 4].map(i => <div key={i} className="sk-shimmer" style={{ height: 80, borderRadius: 12 }} />)}
            </div>
            <div className="sk-shimmer" style={{ height: 480, borderRadius: 14 }} />
          </div>

          {/* ── DETAIL CARD (Adapté Desktop et Mobile) ── */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8E4DC', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="sk-shimmer" style={{ height: 24, width: 85, borderRadius: 8 }} />
              <div className="sk-shimmer" style={{ height: 28, width: 140, borderRadius: 8 }} />
            </div>
            <div className="sk-shimmer" style={{ height: 26, width: '85%' }} />
            <div className="sk-shimmer" style={{ height: 16, width: '45%' }} />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 14, borderTop: '1px solid #E8E4DC', borderBottom: '1px solid #E8E4DC', paddingBottom: 14 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="sk-shimmer" style={{ height: 38, width: 100, borderRadius: 12 }} />
              ))}
            </div>
            <div className="sk-shimmer" style={{ height: 16, width: '100%' }} />
            <div className="sk-shimmer" style={{ height: 16, width: '92%' }} />
            <div className="sk-shimmer" style={{ height: 16, width: '70%' }} />
          </div>
        </div>

        {/* ── SIDEBAR (Agent / Contact) ── */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8E4DC', padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="sk-shimmer" style={{ width: 56, height: 56, borderRadius: '50%' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              <div className="sk-shimmer" style={{ height: 16, width: '60%' }} />
              <div className="sk-shimmer" style={{ height: 12, width: '40%' }} />
            </div>
          </div>
          {[1, 2, 3].map(i => <div key={i} className="sk-shimmer" style={{ height: 46, borderRadius: 12 }} />)}
        </div>
      </div>

      {/* ── MOBILE STICKY BOTTOM BAR SKELETON ── */}
      <div className="sk-mobile-only">
        <div className="sk-mobile-sticky-bar">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div className="sk-shimmer" style={{ height: 10, width: 60, background: 'rgba(255,255,255,0.2)' }} />
            <div className="sk-shimmer" style={{ height: 20, width: 110, background: 'linear-gradient(90deg,#D4AF37,#F6D365)' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="sk-shimmer" style={{ height: 42, width: 42, borderRadius: 12, background: 'rgba(255,255,255,0.15)' }} />
            <div className="sk-shimmer" style={{ height: 42, width: 140, borderRadius: 12, background: 'linear-gradient(90deg,#D4AF37,#F6D365)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonProProjectCard() {
  return (
    <div className="sk-card" style={{ minWidth: 260, borderRadius: 16, border: '1px solid #E8E3DA' }}>
      <div className="sk-shimmer" style={{ height: 140, borderRadius: '16px 16px 0 0' }} />
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="sk-shimmer" style={{ height: 11, width: '40%' }} />
        <div className="sk-shimmer" style={{ height: 14, width: '85%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTop: '1px solid #E8E3DA' }}>
          <div className="sk-shimmer" style={{ height: 12, width: '50%' }} />
          <div className="sk-shimmer" style={{ height: 12, width: '25%' }} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonProCard() {
  return (
    <div className="sk-card" style={{ minWidth: 300, borderRadius: 20, border: '1px solid #E8E3DA' }}>
      <div className="sk-shimmer" style={{ height: 135, borderRadius: '20px 20px 0 0' }} />
      <div style={{ padding: '24px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="sk-shimmer" style={{ height: 12, width: '35%' }} />
        <div className="sk-shimmer" style={{ height: 18, width: '65%' }} />
        <div className="sk-shimmer" style={{ height: 13, width: '45%' }} />
        <div style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
          <div className="sk-shimmer" style={{ height: 40, flex: 1, borderRadius: 10 }} />
          <div className="sk-shimmer" style={{ height: 40, flex: 1, borderRadius: 10 }} />
          <div className="sk-shimmer" style={{ height: 40, flex: 1, borderRadius: 10 }} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <div className="sk-shimmer" style={{ height: 38, flex: 1, borderRadius: 10 }} />
          <div className="sk-shimmer" style={{ height: 38, flex: 1, borderRadius: 10 }} />
        </div>
      </div>
    </div>
  );
}

export default SkeletonCard;
