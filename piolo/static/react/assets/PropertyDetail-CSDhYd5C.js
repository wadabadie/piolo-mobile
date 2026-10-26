import{r as e}from"./rolldown-runtime-Cq0jCQ29.js";import{d as t,g as n,l as r,p as ee,r as i,t as te,u as ne}from"./vendor-react-DlxHbF51.js";import{c as re,i as ie,r as ae,s as oe,t as a}from"./api-B9EIXznq.js";import{n as se}from"./AuthContext-CFgS1DSp.js";import{t as ce}from"./media-CF4hGFW6.js";import{a as le}from"./prefetch-DmmbGXN_.js";import{t as ue}from"./PropertyCard-I9AicKVB.js";import{n as de}from"./SkeletonCard-C5SbezWv.js";import{t as fe}from"./PointConfirmationModal-C2OJmAfg.js";import{t as pe}from"./TenantSubscriptionModal-B_MpGedP.js";import{t as me}from"./PostPublishBoostModal-CHLAEXDZ.js";var o=e(n(),1),s=te(),he=(e,t)=>({LOCATION:t?t(`card.for_rent`,`À louer`):`À louer`,VENTE:t?t(`card.for_sale`,`À vendre`):`À vendre`,COURTE_DUREE:t?t(`card.short_stay`,`Courte durée`):`Courte durée`})[e]||e||``,c=e=>e?.property_type_display||String(e?.property_type||``).toLowerCase().replace(/\b\w/g,e=>e.toUpperCase()).replaceAll(`_`,` `),ge=`
  .detail-page-scope {
    --or: #D4AF37; --or-l: #F6D365; --or-d: #B8962A;
    --noir: #1A1A1A; --noir-profond: #0F0D09;
    --gris: #555; --gris-m: #888;
    --gris-f: #F8F9FA; --gris-b: #E8E4DC;
    --vert: #1E8449; --rouge: #C0392B;
    background-color: #F8F9FA;
    color: #1A1A1A;
    min-height: 100vh;
    padding-bottom: 80px;
    width: 100%;
    max-width: 100%;
    overflow-x: clip;
    box-sizing: border-box;
  }
  .detail-shell { max-width: 1320px; margin: 0 auto; padding: 20px 24px 60px; font-family: 'DM Sans', sans-serif; color: var(--noir); width: 100%; box-sizing: border-box; }
  .detail-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--gris-m); margin-bottom: 20px; }
  .detail-breadcrumb a { color: var(--gris-m); text-decoration: none; display: flex; align-items: center; gap: 5px; }
  .detail-breadcrumb a:hover { color: var(--or-d); }
  .detail-breadcrumb svg { width: 15px; height: 15px; fill: var(--or-d); }
  .detail-breadcrumb .sep { color: var(--gris-b); }
  .detail-breadcrumb .current { color: var(--noir); font-weight: 600; }
  .detail-grid { display: grid; grid-template-columns: 1fr 360px; gap: 28px; align-items: start; width: 100%; box-sizing: border-box; }
  .detail-main { display: flex; flex-direction: column; gap: 20px; width: 100%; max-width: 100%; box-sizing: border-box; min-width: 0; }
  
  /* Desktop Gallery */
  .gallery { display: grid; grid-template-columns: 110px 1fr; gap: 12px; background: #fff; border-radius: 20px; padding: 12px; border: 1px solid var(--gris-b); }
  .gallery-thumbs { display: flex; flex-direction: column; gap: 8px; max-height: 480px; overflow-y: auto; }
  .gallery-thumbs::-webkit-scrollbar { width: 4px; }
  .gallery-thumbs::-webkit-scrollbar-thumb { background: var(--gris-b); border-radius: 4px; }
  .thumb { width: 100%; height: 80px; border-radius: 12px; overflow: hidden; cursor: pointer; border: 2px solid transparent; flex-shrink: 0; position: relative; transition: border-color .2s ease; }
  .thumb.active { border-color: var(--or); }
  .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .gallery-main { position: relative; border-radius: 14px; overflow: hidden; background: var(--gris-f); min-height: 480px; }
  .gallery-main img { width: 100%; height: 480px; object-fit: cover; display: block; transition: opacity .2s ease; }
  .gallery-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; border-radius: 50%; background: rgba(20,20,20,.55); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; backdrop-filter: blur(4px); transition: background .2s ease; z-index: 5; }
  .gallery-nav:hover { background: rgba(20,20,20,.85); }
  .gallery-nav.prev { left: 14px; }
  .gallery-nav.next { right: 14px; }
  .gallery-nav svg { width: 20px; height: 20px; }
  .gallery-counter { position: absolute; bottom: 14px; right: 14px; background: rgba(20,20,20,.65); color: #fff; font-family: 'Poppins', sans-serif; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 20px; backdrop-filter: blur(6px); border: 1px solid rgba(255,255,255,0.15); }
  
  /* Mobile Hero Edge-to-Edge Slider */
  .mobile-hero-gallery { display: none; }
  .mobile-hero-thumbs-strip { display: none; }

  .detail-card { background: #fff; border-radius: 20px; border: 1px solid var(--gris-b); padding: 24px 26px; width: 100%; max-width: 100%; box-sizing: border-box; overflow: hidden; }
  .dsection-title { font-family: 'Poppins', sans-serif; font-size: 17px; font-weight: 800; color: var(--noir); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .detail-top-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 18px; flex-wrap: wrap; width: 100%; box-sizing: border-box; }
  .detail-titleblock { flex: 1 1 260px; min-width: 0; }
  .dbadge { display: inline-block; padding: 5px 12px; border-radius: 8px; font-family: 'Poppins', sans-serif; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .3px; color: var(--noir); background: linear-gradient(135deg, var(--or), var(--or-l)); margin-bottom: 10px; }
  .dbadge.vente { background: linear-gradient(135deg, #1D4ED8, #3B82F6); color: #fff; }
  .dbadge.courte_duree { background: linear-gradient(135deg, #059669, #10B981); color: #fff; }
  .detail-title { font-family: 'Poppins', sans-serif; font-size: 24px; font-weight: 800; color: var(--noir); line-height: 1.3; margin-bottom: 6px; word-break: break-word; }
  .detail-sub { font-size: 14px; color: var(--gris); display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .detail-price-block { text-align: right; flex-shrink: 0; }
  .dprice { font-family: 'Poppins', sans-serif; font-size: 26px; font-weight: 800; color: var(--or-d); white-space: nowrap; }
  .dcurrency { font-size: 15px; font-weight: 700; }
  .dperiod { font-size: 13px; font-weight: 500; color: var(--gris-m); }
  .dprice-sub { font-size: 12px; color: var(--gris-m); margin-top: 2px; }
  
  /* Luxury Spec Chips */
  .dbulles { display: flex; gap: 10px; flex-wrap: wrap; padding: 16px 0; border-top: 1px solid var(--gris-b); border-bottom: 1px solid var(--gris-b); margin-bottom: 18px; width: 100%; box-sizing: border-box; }
  .dbulle { display: flex; align-items: center; gap: 8px; padding: 9px 16px; border-radius: 14px; background: #fff; border: 1px solid rgba(212,175,55,0.3); box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
  .dbulle i, .dbulle svg { width: 16px; height: 16px; color: var(--or-d); fill: var(--or-d); flex-shrink: 0; }
  .dbulle span { font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 700; color: var(--noir); white-space: nowrap; }

  .dactions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; width: 100%; box-sizing: border-box; }
  .dact-btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 16px; border-radius: 10px; border: 1.5px solid var(--gris-b); background: #fff; font-family: 'Poppins', sans-serif; font-size: 12.5px; font-weight: 600; color: var(--gris); cursor: pointer; transition: all .2s ease; }
  .dact-btn:hover { border-color: var(--or); color: var(--noir); }
  .dact-btn svg, .dact-btn i { width: 16px; height: 16px; }
  .dact-btn.fav:hover svg { stroke: var(--or-d); }
  .dact-btn.fav.active { color: var(--or-d); border-color: var(--or); background: rgba(212,175,55,0.08); }
  .dact-btn.fav.active svg { fill: var(--or-d); stroke: var(--or-d); }
  .dref { margin-left: auto; font-size: 12px; color: var(--gris-m); font-family: 'Poppins', sans-serif; }
  
  .ddescription { font-size: 14.5px; line-height: 1.75; color: #333; word-break: break-word; }
  .ddescription p { margin-bottom: 12px; }
  
  .dfinance-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; width: 100%; box-sizing: border-box; }
  .dfin-item { background: linear-gradient(135deg, rgba(212,175,55,.08), rgba(246,211,101,.12)); border: 1px solid rgba(212,175,55,.25); border-radius: 14px; padding: 16px 18px; display: flex; flex-direction: column; gap: 4px; box-sizing: border-box; }
  .dfin-label { font-size: 12px; color: var(--gris-m); font-weight: 600; }
  .dfin-value { font-family: 'Poppins', sans-serif; font-size: 18px; font-weight: 800; color: var(--or-d); }
  
  .dcriteria-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; width: 100%; box-sizing: border-box; }
  .dcrit-block { width: 100%; min-width: 0; box-sizing: border-box; }
  .dcrit-block h3 { font-family: 'Poppins', sans-serif; font-size: 13.5px; font-weight: 800; color: var(--or-d); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
  .dcrit-block ul { list-style: none; display: flex; flex-direction: column; gap: 6px; padding:0; margin:0; width: 100%; }
  .dcrit-block li { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-radius: 10px; font-size: 13.5px; background: #fff; border: 1px solid rgba(212,175,55,.18); transition: background .2s ease; gap: 8px; width: 100%; box-sizing: border-box; }
  .dcrit-block li:hover { background: rgba(212,175,55,.06); }
  .dcrit-block li span { color: var(--gris); flex-shrink: 0; }
  .dcrit-block li b { font-weight: 700; color: var(--noir); text-align: right; word-break: break-word; min-width: 0; }
  
  .detail-map { width: 100%; height: 360px; border-radius: 18px; border: 1px solid var(--gris-b); margin-top: 6px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,.04); position: relative; background: #E8E4DC; box-sizing: border-box; }
  .dmap-sub { font-size: 13.5px; color: var(--gris-m); margin-bottom: 16px; line-height: 1.5; word-break: break-word; }
  .itineraire-btn { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 14px; padding: 11px 20px; border-radius: 12px; background: linear-gradient(135deg, var(--or), var(--or-l)); color: var(--noir); border: none; box-shadow: 0 4px 14px rgba(212,175,55,.35); font-family: 'Poppins', sans-serif; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.25s ease; max-width: 100%; box-sizing: border-box; }
  .itineraire-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(212,175,55,.45); color: var(--noir); }
  .itineraire-btn:disabled { opacity: .7; cursor: not-allowed; transform: none; }
  .itineraire-info { padding: 12px 16px; border-radius: 12px; font-size: 13px; font-weight: 600; margin-bottom: 14px; display: flex; align-items: center; gap: 10px; width: 100%; box-sizing: border-box; }
  .itineraire-info.info { background: rgba(44,62,122,.08); color: #2C3E7A; border: 1px solid rgba(44,62,122,.25); }
  .itineraire-info.success { background: rgba(30,132,73,.08); color: #1E8449; border: 1px solid rgba(30,132,73,.25); }
  .itineraire-info.warn { background: rgba(192,57,43,.08); color: #C0392B; border: 1px solid rgba(192,57,43,.25); }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  
  .detail-sidebar { position: relative; align-self: start; height: 100%; width: 100%; box-sizing: border-box; }
  .contact-card { position: sticky; top: 20px; background: linear-gradient(180deg, #fff 0%, #FFFBF2 100%); border-radius: 20px; border: 1px solid var(--gris-b); padding: 24px 22px; box-shadow: 0 8px 32px rgba(212,175,55,.12); z-index: 5; box-sizing: border-box; width: 100%; }
  .contact-agence { text-align: center; margin-bottom: 16px; }
  .contact-name { font-family: 'Poppins', sans-serif; font-size: 17px; font-weight: 800; color: var(--noir); }
  .contact-role { font-size: 12px; color: var(--gris-m); margin-top: 2px; }
  .contact-verified { display: flex; align-items: center; justify-content: center; gap: 6px; background: rgba(30,132,73,.08); color: var(--vert); border-radius: 10px; padding: 8px; font-family: 'Poppins', sans-serif; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
  .contact-verified svg { width: 14px; height: 14px; fill: var(--vert); }
  .contact-verified.premium { background: linear-gradient(135deg,#17140F,#33270D); color: #F7D66A; border: 1px solid rgba(247,214,106,.72); box-shadow: 0 6px 18px rgba(15,13,9,.16), inset 0 1px 0 rgba(255,255,255,.12); }
  .contact-verified.premium svg { fill: #F7D66A; }
  .contact-verified.verified { background: linear-gradient(135deg,rgba(23,100,59,.1),rgba(38,148,90,.14)); color: #17643B; border: 1px solid rgba(30,122,71,.2); }
  .contact-verified.verified svg { fill: #17643B; }
  .contact-verified.unverified { background: rgba(255,252,242,.96); color: #6D5A31; border: 1px solid rgba(212,175,55,.38); }
  .contact-verified.unverified svg { fill: #8B7336; }
  
  .cbtn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 13px; border-radius: 12px; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 13.5px; cursor: pointer; border: none; text-decoration: none; margin-bottom: 10px; transition: transform .15s ease, box-shadow .15s ease; box-sizing: border-box; }
  .cbtn:hover { transform: translateY(-1px); }
  .cbtn svg, .cbtn i { width: 16px; height: 16px; }
  .cbtn-primary { background: linear-gradient(135deg, var(--or), var(--or-l)); color: var(--noir); box-shadow: 0 4px 16px rgba(212,175,55,.35); }
  .cbtn-outline { background: #fff; border: 1.5px solid var(--or); color: var(--or-d); }
  .cbtn-ghost { background: var(--gris-f); color: var(--gris); border: 1px solid var(--gris-b); }
  .contact-share { display: flex; align-items: center; gap: 10px; justify-content: center; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--gris-b); }
  .contact-share span { font-size: 12px; color: var(--gris-m); }
  .contact-share a { width: 32px; height: 32px; border-radius: 50%; background: var(--gris-f); display: flex; align-items: center; justify-content: center; color: var(--gris); transition: background .2s ease, color .2s ease; text-decoration: none; }
  .contact-share a:hover { background: var(--or); color: var(--noir); }
  
  .btn-360-shake { background: linear-gradient(135deg, var(--or), var(--or-l)); color: #000 !important; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 14px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 8px 24px rgba(212,175,55,0.4); transition: all 0.3s ease; animation: bell-shake 3s infinite; transform-origin: center top; max-width: 100%; box-sizing: border-box; text-align: center; }
  .btn-360-shake:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 12px 32px rgba(212,175,55,0.5); animation: none; color: #000 !important; }
  .btn-360-shake svg { width: 22px !important; height: 22px !important; min-width: 22px; flex-shrink: 0; }
  .btn-discovery { background: #1A1A1A; color: #fff !important; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 14px; padding: 14px 24px; border-radius: 12px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 10px; border: 1px solid rgba(212,175,55,.55); box-shadow: 0 8px 22px rgba(0,0,0,.18); transition: all .25s ease; max-width: 100%; box-sizing: border-box; text-align: center; }
  .btn-discovery:hover { transform: translateY(-2px); background: #0F0D09; color: var(--or-l) !important; border-color: var(--or); box-shadow: 0 12px 28px rgba(0,0,0,.25); }
  .btn-discovery svg { width: 20px !important; height: 20px !important; min-width: 20px; flex-shrink: 0; }
  @keyframes bell-shake { 0%{transform:rotate(0)} 15%{transform:rotate(4deg)} 30%{transform:rotate(-4deg)} 45%{transform:rotate(3deg)} 60%{transform:rotate(-3deg)} 75%{transform:rotate(2deg)} 85%{transform:rotate(-2deg)} 92%{transform:rotate(1deg)} 100%{transform:rotate(0)} }
  
  .similar-properties-section { margin-top: 40px; border-top: 1px solid var(--gris-b, #E8E4DC); padding-top: 30px; margin-bottom: 24px; width: 100%; box-sizing: border-box; }
  .similar-props-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px; width: 100%; box-sizing: border-box; }

  /* ══════════════════════════════════════════
     STICKY FLOATING ACTION BAR FOR MOBILE (< 850px)
  ══════════════════════════════════════════ */
  .mobile-sticky-action-bar {
    display: none;
  }

  @media (max-width: 850px) {
    .detail-shell { padding: 14px 12px 110px; width: 100%; max-width: 100%; box-sizing: border-box; }
    .detail-breadcrumb { display: none; }
    .detail-grid { grid-template-columns: 1fr; gap: 14px; padding: 0; width: 100%; box-sizing: border-box; }
    .detail-main { width: 100%; max-width: 100%; box-sizing: border-box; }
    .gallery { display: none; }
    
    /* Mobile Hero Edge-to-Edge Slider */
    .mobile-hero-gallery {
      display: block;
      position: relative;
      width: 100%;
      max-width: 100%;
      height: 330px;
      background: #0F0D09;
      overflow: hidden;
      margin: 0;
      touch-action: pan-y pinch-zoom;
      box-sizing: border-box;
    }
    .mobile-hero-track {
      display: flex;
      width: 100%;
      height: 100%;
      transition: transform 0.38s cubic-bezier(0.22, 1, 0.36, 1);
      will-change: transform;
    }
    .mobile-hero-slide {
      flex: 0 0 100%;
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }
    .mobile-hero-slide img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      user-select: none;
      -webkit-user-drag: none;
    }
    
    /* Flèches de défilement tactile */
    .mobile-hero-nav-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(15, 13, 9, 0.55);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.22);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      cursor: pointer;
      z-index: 12;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .mobile-hero-nav-arrow:active {
      transform: translateY(-50%) scale(0.92);
      background: #D4AF37;
      color: #0F0D09;
      border-color: #D4AF37;
    }
    .mobile-hero-nav-arrow.prev { left: 10px; }
    .mobile-hero-nav-arrow.next { right: 10px; }

    .mobile-hero-top-bar {
      position: absolute;
      top: calc(12px + env(safe-area-inset-top, 0px));
      left: 12px;
      right: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 14;
      box-sizing: border-box;
    }
    .mobile-hero-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(15, 13, 9, 0.65);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.18);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      text-decoration: none;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0,0,0,0.3);
      transition: transform 0.15s ease;
    }
    .mobile-hero-btn:active {
      transform: scale(0.92);
    }
    .mobile-hero-btn.fav-active {
      color: #F6D365;
      background: rgba(15, 13, 9, 0.85);
      border-color: rgba(212,175,55,0.6);
    }

    /* Bottom Badges on Mobile Hero */
    .mobile-hero-bottom-bar {
      position: absolute;
      bottom: 12px;
      left: 12px;
      right: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 14;
      pointer-events: none;
      box-sizing: border-box;
    }
    .mobile-hero-360-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      background: linear-gradient(135deg, #D4AF37, #F6D365);
      color: #0F0D09;
      font-family: 'Poppins', sans-serif;
      font-size: 11.5px;
      font-weight: 800;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      pointer-events: auto;
      text-decoration: none;
      animation: bell-shake 3.5s infinite;
    }
    .mobile-hero-counter {
      padding: 4px 10px;
      border-radius: 20px;
      background: rgba(15, 13, 9, 0.65);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.2);
      color: #ffffff;
      font-family: 'Poppins', sans-serif;
      font-size: 11px;
      font-weight: 700;
      margin-left: auto;
    }

    /* Indicators dots on Mobile Hero */
    .mobile-hero-dots {
      position: absolute;
      bottom: 14px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 4px;
      z-index: 14;
    }
    .mobile-hero-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: rgba(255,255,255,0.45);
      transition: all 0.2s ease;
    }
    .mobile-hero-dot.active {
      width: 16px;
      border-radius: 6px;
      background: #D4AF37;
    }

    /* Mobile Hero Thumbs Strip */
    .mobile-hero-thumbs-strip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px 12px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      background: linear-gradient(180deg, #13110C 0%, #0C0A07 100%);
      border-bottom: 1px solid rgba(212, 175, 55, 0.25);
      margin: 0;
      width: 100%;
      box-sizing: border-box;
      scrollbar-width: none;
    }
    .mobile-hero-thumbs-strip::-webkit-scrollbar {
      display: none;
    }
    .mobile-hero-thumb {
      flex: 0 0 64px;
      height: 48px;
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid rgba(255, 255, 255, 0.12);
      opacity: 0.45;
      cursor: pointer;
      transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      background: #1a1710;
      flex-shrink: 0;
      padding: 0;
    }
    .mobile-hero-thumb.active {
      border-color: #D4AF37;
      opacity: 1;
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.45);
    }
    .mobile-hero-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      pointer-events: none;
    }

    /* Sticky Bottom Action Bar */
    .mobile-sticky-action-bar {
      display: flex;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(15, 13, 9, 0.96);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border-top: 1px solid rgba(212, 175, 55, 0.35);
      padding: 8px 12px calc(8px + env(safe-area-inset-bottom, 0px));
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      z-index: 999;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
      width: 100%;
      box-sizing: border-box;
    }
    .msab-price-col {
      display: flex;
      flex-direction: column;
      min-width: 0;
      flex-shrink: 1;
    }
    .msab-price {
      font-family: 'Poppins', sans-serif;
      font-size: 15px;
      font-weight: 800;
      color: #F6D365;
      line-height: 1.1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .msab-period {
      font-size: 10px;
      color: rgba(255,255,255,0.65);
      font-weight: 600;
    }
    .msab-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }
    .msab-btn-msg {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(212,175,55,0.4);
      color: #F6D365;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      cursor: pointer;
      flex-shrink: 0;
      text-decoration: none;
    }
    .msab-btn-primary {
      padding: 9px 14px;
      border-radius: 10px;
      background: linear-gradient(135deg, #D4AF37, #F6D365);
      color: #0F0D09;
      font-family: 'Poppins', sans-serif;
      font-size: 12.5px;
      font-weight: 800;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
      box-shadow: 0 3px 12px rgba(212,175,55,0.3);
    }

    /* Similar Properties Horizontal Scroll Snap */
    .similar-props-grid {
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      gap: 12px;
      padding-bottom: 10px;
      -webkit-overflow-scrolling: touch;
      width: 100%;
      box-sizing: border-box;
    }
    .similar-props-grid::-webkit-scrollbar {
      display: none;
    }
    .similar-props-grid > * {
      flex: 0 0 260px;
      scroll-snap-align: start;
    }

    .detail-card { padding: 16px 14px; border-radius: 16px; width: 100%; box-sizing: border-box; }
    .detail-title { font-size: 19px; }
    .contact-card { position: static; }
  }

  /* ── 1. SIMULATEUR DE FRAIS D'EMMÉNAGEMENT & BUDGET ──────────────── */
  .budget-sim-card {
    background: #fff;
    border-radius: 18px;
    border: 1px solid rgba(212, 175, 55, 0.35);
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(212, 175, 55, 0.08);
    transition: all 0.25s ease;
    width: 100%;
    box-sizing: border-box;
  }
  .budget-sim-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 18px;
    background: linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(246, 211, 101, 0.12));
    cursor: pointer;
    user-select: none;
    gap: 8px;
    width: 100%;
    box-sizing: border-box;
  }
  .budget-sim-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Poppins', sans-serif;
    font-size: 14.5px;
    font-weight: 800;
    color: var(--noir);
    flex-wrap: wrap;
    min-width: 0;
  }
  .budget-sim-badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 20px;
    background: #D4AF37;
    color: #0F0D09;
    font-size: 10.5px;
    font-weight: 800;
  }
  .budget-sim-toggle-icon {
    font-size: 14px;
    color: var(--or-d);
    transition: transform 0.25s ease;
    flex-shrink: 0;
  }
  .budget-sim-body {
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 100%;
    box-sizing: border-box;
  }
  .budget-sim-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #F0ECE4;
    gap: 10px;
    width: 100%;
    box-sizing: border-box;
  }
  .budget-sim-row:last-child {
    border-bottom: none;
  }
  .budget-sim-label {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }
  .budget-sim-name {
    font-family: 'Poppins', sans-serif;
    font-size: 13.5px;
    font-weight: 700;
    color: #2D2A26;
    word-break: break-word;
  }
  .budget-sim-desc {
    font-size: 11.5px;
    color: #888;
    word-break: break-word;
  }
  .budget-sim-controls {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  .budget-pill-select {
    display: flex;
    gap: 3px;
    background: #F4F1EA;
    padding: 3px;
    border-radius: 10px;
    max-width: 100%;
  }
  .budget-pill-btn {
    padding: 4px 8px;
    border-radius: 8px;
    border: none;
    background: transparent;
    font-family: 'Poppins', sans-serif;
    font-size: 11px;
    font-weight: 700;
    color: #666;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }
  .budget-pill-btn.active {
    background: #D4AF37;
    color: #0F0D09;
    box-shadow: 0 2px 6px rgba(212,175,55,0.3);
  }
  .budget-sim-amount {
    font-family: 'Poppins', sans-serif;
    font-size: 14px;
    font-weight: 800;
    color: #1A1A1A;
    text-align: right;
    white-space: nowrap;
  }
  .budget-total-box {
    background: linear-gradient(135deg, #181510, #0E0C09);
    border-radius: 14px;
    padding: 14px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid rgba(212, 175, 55, 0.4);
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    margin-top: 4px;
    width: 100%;
    box-sizing: border-box;
    gap: 8px;
  }
  .budget-total-label {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .budget-total-title {
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: #D4AF37;
    word-break: break-word;
  }
  .budget-total-note {
    font-size: 10.5px;
    color: rgba(255,255,255,0.65);
    word-break: break-word;
  }
  .budget-total-value {
    font-family: 'Poppins', sans-serif;
    font-size: 20px;
    font-weight: 900;
    color: #FFFFFF;
    text-shadow: 0 2px 8px rgba(212,175,55,0.3);
    white-space: nowrap;
  }
  
  /* Budget Sim Mobile Stack (< 640px) */
  @media (max-width: 640px) {
    .budget-sim-row {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
      padding: 10px 0;
    }
    .budget-sim-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      gap: 6px;
    }
    .budget-pill-select {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      flex: 1;
      min-width: 0;
    }
    .budget-pill-select::-webkit-scrollbar {
      display: none;
    }
    .budget-pill-btn {
      padding: 4px 7px;
      font-size: 10.5px;
    }
    .budget-sim-amount {
      font-size: 13.5px;
      margin-left: auto;
      flex-shrink: 0;
    }
    .budget-total-box {
      flex-direction: column;
      align-items: stretch;
      text-align: left;
      padding: 14px 14px;
    }
    .budget-total-value {
      font-size: 20px;
      color: #F6D365;
      text-align: left;
      margin-top: 4px;
    }
  }

  /* ── 2. COMMODITÉS DU QUARTIER & POINTS D'INTÉRÊT ──────────────────── */
  .poi-section {
    margin-top: 20px;
    padding-top: 18px;
    border-top: 1px solid #E8E4DC;
    width: 100%;
    box-sizing: border-box;
  }
  .poi-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
    box-sizing: border-box;
  }
  .poi-title {
    font-family: 'Poppins', sans-serif;
    font-size: 14.5px;
    font-weight: 800;
    color: var(--noir);
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
  }
  .poi-mode-tabs {
    display: flex;
    background: #F0ECE4;
    padding: 3px;
    border-radius: 12px;
    gap: 2px;
    max-width: 100%;
  }
  .poi-mode-tab {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 10px;
    border: none;
    background: transparent;
    font-family: 'Poppins', sans-serif;
    font-size: 11.5px;
    font-weight: 700;
    color: #666;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }
  .poi-mode-tab.active {
    background: #fff;
    color: #0F0D09;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }
  .poi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 10px;
    width: 100%;
    box-sizing: border-box;
  }
  .poi-card {
    background: #FAFAF7;
    border: 1px solid rgba(212, 175, 55, 0.2);
    border-radius: 12px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.2s ease;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
  }
  .poi-card:hover {
    background: #fff;
    border-color: #D4AF37;
    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.12);
    transform: translateY(-2px);
  }
  .poi-icon-box {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: rgba(212, 175, 55, 0.12);
    color: var(--or-d);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
  }
  .poi-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }
  .poi-name {
    font-family: 'Poppins', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: #1A1A1A;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .poi-sub {
    font-size: 10.5px;
    color: #777;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .poi-time-pill {
    padding: 3px 7px;
    border-radius: 10px;
    background: #110F0A;
    color: #F6D365;
    font-family: 'Poppins', sans-serif;
    font-size: 10.5px;
    font-weight: 800;
    white-space: nowrap;
    flex-shrink: 0;
  }
  @media (max-width: 600px) {
    .poi-header-row {
      flex-direction: column;
      align-items: stretch;
    }
    .poi-mode-tabs {
      width: 100%;
    }
    .poi-mode-tab {
      flex: 1;
      justify-content: center;
    }
    .poi-grid {
      grid-template-columns: 1fr;
      gap: 8px;
    }
  }

  /* ── 3. COMPARATEUR RAPIDE DE BIENS ────────────────────────────────── */
  .btn-compare-action {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 16px;
    border-radius: 10px;
    border: 1.5px solid var(--gris-b);
    background: #fff;
    font-family: 'Poppins', sans-serif;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--gris);
    cursor: pointer;
    transition: all .2s ease;
  }
  .btn-compare-action:hover, .btn-compare-action.active {
    border-color: var(--or);
    color: var(--noir);
    background: rgba(212,175,55,0.08);
  }
  .btn-compare-action.active {
    border-color: #D4AF37;
    color: #0F0D09;
    font-weight: 700;
  }
  
  /* Floating Bottom Compare Dock */
  .compare-dock {
    position: fixed;
    bottom: calc(72px + env(safe-area-inset-bottom, 0px) + 14px);
    right: 14px;
    background: rgba(15, 13, 9, 0.96);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1.5px solid rgba(212, 175, 55, 0.55);
    border-radius: 30px;
    padding: 6px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 8px 28px rgba(0,0,0,0.5);
    z-index: 1002;
    max-width: calc(100vw - 28px);
    animation: fadeIn 0.3s ease;
    box-sizing: border-box;
  }
  @media (min-width: 851px) {
    .compare-dock {
      bottom: 24px;
      right: 24px;
    }
  }
  .compare-dock-count {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #D4AF37, #F6D365);
    color: #0F0D09;
    font-family: 'Poppins', sans-serif;
    font-size: 11px;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .compare-dock-text {
    font-family: 'Poppins', sans-serif;
    font-size: 11.5px;
    font-weight: 700;
    color: #FFFFFF;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .compare-dock-btn {
    padding: 5px 12px;
    border-radius: 20px;
    background: linear-gradient(135deg, #D4AF37, #F6D365);
    border: none;
    font-family: 'Poppins', sans-serif;
    font-size: 11px;
    font-weight: 800;
    color: #0F0D09;
    cursor: pointer;
    transition: transform 0.15s ease;
    white-space: nowrap;
  }
  .compare-dock-btn:active {
    transform: scale(0.95);
  }
  .compare-dock-close {
    background: transparent;
    border: none;
    color: rgba(255,255,255,0.6);
    cursor: pointer;
    font-size: 13px;
    padding: 3px;
  }
  .compare-dock-close:hover {
    color: #fff;
  }

  /* Compare Modal Table */
  .compare-grid-modal {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
    padding: 16px 18px 24px;
    overflow-x: auto;
    width: 100%;
    box-sizing: border-box;
  }
  .compare-col-card {
    background: #FAF8F5;
    border: 1.5px solid #E8E4DC;
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    box-sizing: border-box;
    min-width: 0;
  }
  .compare-col-card.current {
    border-color: #D4AF37;
    box-shadow: 0 4px 18px rgba(212, 175, 55, 0.18);
  }
  .compare-card-thumb {
    height: 130px;
    width: 100%;
    position: relative;
  }
  .compare-card-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .compare-card-remove {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(15, 13, 9, 0.7);
    color: #fff;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    cursor: pointer;
  }
  .compare-card-content {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    box-sizing: border-box;
  }
  .compare-card-title {
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    font-weight: 800;
    color: #1A1A1A;
    margin: 0;
    word-break: break-word;
  }
  .compare-card-price {
    font-family: 'Poppins', sans-serif;
    font-size: 15px;
    font-weight: 900;
    color: var(--or-d);
  }
  .compare-spec-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-size: 12px;
    width: 100%;
  }
  .compare-spec-item {
    display: flex;
    justify-content: space-between;
    padding: 6px 8px;
    background: #fff;
    border-radius: 8px;
    border: 1px solid #ECE8E0;
    gap: 6px;
  }
  .compare-spec-label {
    color: #777;
    font-weight: 500;
    flex-shrink: 0;
  }
  .compare-spec-val {
    font-weight: 700;
    color: #1A1A1A;
    text-align: right;
    word-break: break-word;
  }

  /* ══════════════════════════════════════════
     MODALES PIOLO — Visite + Location + Comparateur
     (Desktop Centered Popups + Mobile Bottom Sheets)
  ══════════════════════════════════════════ */
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .dmodal {
    position: fixed;
    inset: 0;
    background: rgba(15, 13, 9, 0.75);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
    animation: fadeIn 0.22s ease;
  }
  .dmodal-content {
    background: #FFFFFF;
    border-radius: 20px;
    width: 100%;
    max-width: 540px;
    max-height: 90vh;
    overflow: hidden;
    position: relative;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    border: 1px solid rgba(212, 175, 55, 0.25);
    box-sizing: border-box;
    animation: modalPop 0.24s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    flex-direction: column;
  }
  .dmodal-content.dmodal-xl {
    max-width: 780px;
  }
  /* Drag handle (visible on mobile only) */
  .dmodal-drag-handle { display: none; }
  @keyframes modalPop {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  .dmodal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    background: #F4F1EA;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: #555;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 10;
    flex-shrink: 0;
  }
  .dmodal-close:hover {
    background: #E8E4DC;
    color: #000;
  }
  .dmodal-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 22px 56px 14px 24px;
    border-bottom: 1px solid #F0ECE4;
    font-family: 'Poppins', sans-serif;
    font-size: 18px;
    font-weight: 800;
    color: #1A1A1A;
    flex-shrink: 0;
  }
  .dmodal-header svg {
    color: var(--or-d);
    fill: var(--or-d);
    flex-shrink: 0;
  }
  .dmodal-pts-notice {
    margin: 14px 24px 0;
    padding: 10px 14px;
    background: rgba(212, 175, 55, 0.1);
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 12px;
    font-size: 12.5px;
    color: #6D5A31;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    flex-shrink: 0;
  }
  .dmodal-pts-notice svg {
    color: var(--or-d);
    fill: var(--or-d);
    flex-shrink: 0;
    margin-top: 1px;
  }
  /* Scrollable inner body of the modal */
  .dmodal-scroll-body {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    min-height: 0;
  }
  .dmodal-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 14px;
    width: 100%;
    box-sizing: border-box;
  }
  .dmodal-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }
  .dmodal-field label {
    font-family: 'Poppins', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .dmodal-input, .dmodal-textarea {
    width: 100%;
    padding: 11px 14px;
    border-radius: 10px;
    border: 1.5px solid #DCD8D0;
    background: #FAF9F6;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #1A1A1A;
    box-sizing: border-box;
    transition: all 0.2s ease;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    min-height: 44px;
  }
  .dmodal-input:focus, .dmodal-textarea:focus {
    border-color: var(--or);
    background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
  }
  .dmodal-textarea {
    resize: vertical;
    min-height: 88px;
  }
  .dmodal-toggle {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-family: 'Poppins', sans-serif;
    font-size: 13.5px;
    font-weight: 700;
    color: #1A1A1A;
    user-select: none;
  }
  .dmodal-toggle input {
    width: 18px;
    height: 18px;
    accent-color: var(--or);
  }
  .dmodal-hint {
    font-size: 12px;
    color: #888;
    margin-bottom: 12px;
  }
  .dmodal-upload-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    width: 100%;
    box-sizing: border-box;
  }
  .dmodal-upload-zone {
    border: 1.5px dashed #DCD8D0;
    border-radius: 12px;
    padding: 16px 10px;
    text-align: center;
    background: #FAF9F6;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 120px;
    box-sizing: border-box;
    position: relative;
    cursor: pointer;
  }
  .dmodal-upload-zone label {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    width: 100%;
  }
  .dmodal-upload-zone svg {
    color: var(--or-d);
    fill: var(--or-d);
    margin-bottom: 4px;
  }
  .dmodal-upload-zone span {
    font-family: 'Poppins', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: #222;
  }
  .dmodal-upload-zone small {
    font-size: 10px;
    color: #888;
  }
  .dmodal-upload-zone.has-file {
    border-color: var(--or);
    background: rgba(212, 175, 55, 0.08);
  }
  .upload-filename {
    font-size: 10.5px;
    color: #555;
    margin-top: 6px;
    word-break: break-all;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .loc-steps {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 14px 24px 10px;
    gap: 8px;
    border-bottom: 1px solid #F0ECE4;
  }
  .loc-step {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    font-family: 'Poppins', sans-serif;
    font-size: 12.5px;
    font-weight: 700;
    color: #888;
    transition: color 0.2s ease;
  }
  .loc-step.active {
    color: #0F0D09;
  }
  .loc-step.completed {
    color: #1E8449;
  }
  .ls-num {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #E8E4DC;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 800;
  }
  .loc-step.active .ls-num {
    background: linear-gradient(135deg, var(--or), var(--or-l));
    color: #0F0D09;
  }
  .loc-step.completed .ls-num {
    background: #1E8449;
    color: #fff;
  }
  .loc-step-line {
    flex: 1;
    max-width: 40px;
    height: 2px;
    background: #E8E4DC;
  }
  .loc-panel {
    padding: 18px 24px 10px;
    width: 100%;
    box-sizing: border-box;
  }
  .dossier-completion {
    margin: 10px 24px 14px;
    padding: 12px 14px;
    background: #FAF9F6;
    border-radius: 12px;
    border: 1px solid #E8E4DC;
  }
  .dc-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: 'Poppins', sans-serif;
    font-size: 12px;
    font-weight: 700;
    margin-bottom: 6px;
  }
  .dc-bar {
    height: 6px;
    background: #E8E4DC;
    border-radius: 4px;
    overflow: hidden;
  }
  .dc-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--or), #2ECC71);
    border-radius: 4px;
    transition: width 0.3s ease;
  }
  .dmodal-error {
    margin: 8px 24px;
    padding: 10px 14px;
    border-radius: 10px;
    background: rgba(192, 57, 43, 0.1);
    border: 1px solid rgba(192, 57, 43, 0.3);
    color: #C0392B;
    font-size: 12.5px;
    font-weight: 600;
  }
  .dmodal-footer {
    padding: 14px 24px max(22px, env(safe-area-inset-bottom));
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    border-top: 1px solid #F0ECE4;
    margin-top: 4px;
    flex-shrink: 0;
    background: #FFFFFF;
  }
  .dmodal-btn-cancel {
    padding: 10px 18px;
    border-radius: 10px;
    border: 1.5px solid #DCD8D0;
    background: #fff;
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: #555;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
  }
  .dmodal-btn-cancel:hover {
    background: #F4F1EA;
    color: #111;
  }
  .dmodal-btn-next {
    padding: 10px 20px;
    border-radius: 10px;
    border: none;
    background: #1A1A1A;
    color: #fff;
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    white-space: nowrap;
  }
  .dmodal-btn-next:hover {
    background: #000;
    transform: translateY(-1px);
  }
  .dmodal-btn-submit {
    padding: 10px 20px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, var(--or), var(--or-l));
    color: #0F0D09;
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    box-shadow: 0 4px 12px rgba(212,175,55,0.3);
    transition: all 0.2s ease;
    min-height: 44px;
    white-space: nowrap;
  }
  .dmodal-btn-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(212,175,55,0.45);
  }
  .dmodal-btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .image-lightbox {
    position: fixed;
    inset: 0;
    background: rgba(15, 13, 9, 0.96);
    backdrop-filter: blur(12px);
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    animation: fadeIn 0.25s ease;
    box-sizing: border-box;
  }
  .lightbox-content {
    position: relative;
    max-width: 95%;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .lightbox-img {
    max-width: 100%;
    max-height: 78vh;
    object-fit: contain;
    border-radius: 14px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.6);
    border: 2px solid var(--or);
  }
  .lightbox-close {
    position: absolute;
    top: 16px;
    right: 16px;
    background: rgba(255,255,255,0.15);
    color: #fff;
    border: none;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    font-size: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;
    z-index: 10;
  }
  .lightbox-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    border: none;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  .lightbox-nav.prev { left: 14px; }
  .lightbox-nav.next { right: 14px; }
  .lightbox-counter {
    margin-top: 12px;
    color: #F6D365;
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    font-weight: 700;
  }

  /* ─── MOBILE BOTTOM SHEETS ──────────────── */
  @keyframes slideUpMobile {
    from { transform: translateY(100%); opacity: 0.7; }
    to   { transform: translateY(0);    opacity: 1;   }
  }
  @media (max-width: 640px) {
    .dmodal { padding: 0; align-items: flex-end; }
    .dmodal-content,
    .dmodal-content.dmodal-xl {
      border-radius: 22px 22px 0 0;
      max-width: 100%;
      width: 100%;
      max-height: 92svh;
      max-height: 92dvh;
      max-height: calc(100vh - 40px);
      border-bottom: none;
      border-left: none;
      border-right: none;
      border-top: 1px solid rgba(212,175,55,0.2);
      box-shadow: 0 -8px 40px rgba(0,0,0,0.35);
      animation: slideUpMobile 0.32s cubic-bezier(0.25, 0.8, 0.25, 1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    /* Drag handle */
    .dmodal-drag-handle {
      display: block;
      width: 36px;
      height: 4px;
      background: #DCD8D0;
      border-radius: 4px;
      margin: 10px auto 2px;
      flex-shrink: 0;
    }
    /* Sticky header */
    .dmodal-header {
      padding: 10px 52px 10px 16px;
      font-size: 15.5px;
      flex-shrink: 0;
      border-bottom: 1px solid #F0ECE4;
    }
    .dmodal-close { top: 10px; right: 10px; width: 32px; height: 32px; font-size: 17px; }
    /* Notice points */
    .dmodal-pts-notice { margin: 8px 14px; padding: 9px 12px; font-size: 12px; border-radius: 10px; }
    /* Scrollable body */
    .dmodal-scroll-body {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
      min-height: 0;
      padding-bottom: 4px;
    }
    /* Panneau interne */
    .loc-panel { padding: 10px 14px 6px; }
    /* Grilles → 1 colonne */
    .dmodal-row { grid-template-columns: 1fr; gap: 10px; margin-bottom: 10px; }
    /* Inputs touch-friendly, prevent iOS zoom */
    .dmodal-input, .dmodal-textarea {
      font-size: 16px !important;
      padding: 13px 14px;
      min-height: 48px;
      border-radius: 12px;
    }
    .dmodal-textarea { min-height: 90px; }
    /* Upload zones → horizontal sur mobile */
    .dmodal-upload-row { grid-template-columns: 1fr; gap: 8px; }
    .dmodal-upload-zone {
      min-height: 72px;
      padding: 10px 14px;
      flex-direction: row;
      justify-content: flex-start;
      text-align: left;
      gap: 12px;
    }
    .dmodal-upload-zone label { flex-direction: row; align-items: center; gap: 10px; }
    .dmodal-upload-zone svg { margin-bottom: 0; flex-shrink: 0; }
    .dmodal-upload-zone span { font-size: 13px; }
    .upload-filename { margin-top: 0; margin-left: auto; max-width: 100px; font-size: 11px; }
    /* Steps */
    .loc-steps { padding: 8px 14px; gap: 4px; justify-content: space-between; }
    .loc-step { font-size: 11.5px; gap: 5px; }
    .ls-num { width: 26px; height: 26px; font-size: 12px; }
    .loc-step-line { flex: 1; min-width: 10px; max-width: none; }
    /* Complétion dossier */
    .dossier-completion { margin: 4px 14px 8px; padding: 10px 12px; }
    /* Erreur */
    .dmodal-error { margin: 4px 14px; }
    /* Toggle */
    .dmodal-toggle { font-size: 14.5px; min-height: 48px; }
    .dmodal-toggle input { width: 22px; height: 22px; }
    /* Hint */
    .dmodal-hint { font-size: 11.5px; margin-bottom: 8px; }
    /* Footer sticky */
    .dmodal-footer {
      padding: 10px 14px max(14px, env(safe-area-inset-bottom));
      flex-direction: column;
      gap: 8px;
      background: #FFFFFF;
      border-top: 1px solid #F0ECE4;
      flex-shrink: 0;
    }
    .dmodal-footer button {
      width: 100%;
      justify-content: center;
      padding: 14px 16px;
      font-size: 14px;
      border-radius: 12px;
      min-height: 48px;
    }
    .budget-pill-btn { padding: 9px 14px; font-size: 13px; min-height: 40px; }
  }
`;function l(){let{t:e}=ee(),{id:n}=ne(),[te]=t(),{user:l,isAuthenticated:u}=se(),d=r(),_e=l?.role===`BAILLEUR`||l?.is_bailleur,[ve,ye]=(0,o.useState)(()=>te.get(`published`)===`1`),be=l?.role===`PRO`||l?.is_pro||l?.professional_profile,f=_e||be,[xe,p]=(0,o.useState)(!1),Se=_e?`/dashboard/bailleur`:be?`/dashboard/pro`:`/`,Ce=_e?`/dashboard/bailleur#annonces`:be?`/dashboard/pro`:`/properties`,we=re.get(`property_detail_${n}`),[m,Te]=(0,o.useState)(()=>we||null),[Ee,De]=(0,o.useState)(()=>!we),[Oe,ke]=(0,o.useState)(!1),[h,g]=(0,o.useState)(0),[_,Ae]=(0,o.useState)(()=>we?.is_favorite||!1),[je,Me]=(0,o.useState)(()=>we?.favorites_count||0),Ne=(0,o.useRef)(null),[Pe,Fe]=(0,o.useState)(!1),[Ie,Le]=(0,o.useState)(!1),[Re,ze]=(0,o.useState)(!1),[Be,Ve]=(0,o.useState)(null),[He,v]=(0,o.useState)(!1),[Ue,We]=(0,o.useState)(0),[Ge,Ke]=(0,o.useState)(null),[qe,Je]=(0,o.useState)(null),[Ye,y]=(0,o.useState)(!0),Xe=(0,o.useRef)(null),Ze=async(e,t)=>{if(t.preventDefault(),t.stopPropagation(),!u){d(`/login`,{state:{from:{pathname:`/properties/${n}`}}});return}try{let t=await a.post(`/properties/${e}/favorite/`);t.data.ok&&Te(n=>({...n,similar_properties:n.similar_properties.map(n=>n.id===e?{...n,is_favorite:t.data.is_favorite,images_count:n.images_count}:n)}))}catch(e){console.error(`Error toggling similar favorite:`,e)}},[Qe,b]=(0,o.useState)(!1),[$e,x]=(0,o.useState)(!1),[et,tt]=(0,o.useState)(``),[nt,rt]=(0,o.useState)(!1),[it,S]=(0,o.useState)(``),[at,ot]=(0,o.useState)(``),[st,ct]=(0,o.useState)(``),[lt,ut]=(0,o.useState)(``),C=new Date().toISOString().split(`T`)[0],dt=(()=>{let e=new Date;return e.setDate(e.getDate()+1),e.toISOString().split(`T`)[0]})(),ft=(()=>{let e=new Date;return e.setDate(e.getDate()+3),e.toISOString().split(`T`)[0]})(),[w,pt]=(0,o.useState)(dt),[T,mt]=(0,o.useState)(ft),[E,ht]=(0,o.useState)(1),[gt,D]=(0,o.useState)(!1),[_t,vt]=(0,o.useState)(``),[yt,bt]=(0,o.useState)(!1),[xt,St]=(0,o.useState)(!1),O=(0,o.useMemo)(()=>{if(!w||!T)return 0;let e=new Date(w),t=new Date(T),n=Math.ceil((t-e)/(1e3*60*60*24));return n>0?n:0},[w,T]),k=(0,o.useMemo)(()=>{let e=O>0?O:1;return(Number(m?.price)||0)*e},[m?.price,O]),A=(0,o.useMemo)(()=>{let e=new Set(m?.blocked_dates||[]);if(!w||!T||e.size===0)return!1;let t=new Date(w),n=new Date(T);for(;t<n;){let n=t.toISOString().split(`T`)[0];if(e.has(n))return!0;t.setDate(t.getDate()+1)}return!1},[m?.blocked_dates,w,T]),Ct=e=>{let t=new Date;return t.setDate(t.getDate()+e),t.toISOString().split(`T`)[0]},wt=()=>{let e=new Date,t=(6-e.getDay()+7)%7||7;return e.setDate(e.getDate()+t),e.toISOString().split(`T`)[0]},[j,M]=(0,o.useState)(1),[Tt,Et]=(0,o.useState)(!1),[Dt,N]=(0,o.useState)(``),[P,Ot]=(0,o.useState)(``),[kt,At]=(0,o.useState)(`12`),[jt,Mt]=(0,o.useState)(`1`),[F,Nt]=(0,o.useState)(``),[Pt,Ft]=(0,o.useState)(``),[I,It]=(0,o.useState)(``),[Lt,Rt]=(0,o.useState)(``),[L,zt]=(0,o.useState)(null),[R,Bt]=(0,o.useState)(null),[z,Vt]=(0,o.useState)(null),[B,Ht]=(0,o.useState)(!1),[Ut,Wt]=(0,o.useState)(``),[Gt,Kt]=(0,o.useState)(``),[qt,Jt]=(0,o.useState)(``),[V,Yt]=(0,o.useState)(``),[H,Xt]=(0,o.useState)(null),[Zt,Qt]=(0,o.useState)(!0),[U,$t]=(0,o.useState)(2),[en,tn]=(0,o.useState)(1),[nn,rn]=(0,o.useState)(1e4),[W,an]=(0,o.useState)(`walk`),[G,on]=(0,o.useState)(()=>{try{return JSON.parse(localStorage.getItem(`piolo_compare_list`)||`[]`)}catch{return[]}}),[sn,K]=(0,o.useState)(!1),[q,J]=(0,o.useState)({isOpen:!1,actionKey:`CONTACT_LANDLORD`,targetTitle:``,targetSubtitle:``,onConfirmAction:null}),[cn,ln]=(0,o.useState)(!1),un=l?le.getTenantPoints(l.id):0,dn=!!(l?.is_vip_tenant||le.getTenantPlan(l?.id)?.plan_type===`vip_pass`),Y=m?G.some(e=>e.id===m.id):!1,fn=()=>{if(m)if(Y){let e=G.filter(e=>e.id!==m.id);on(e),localStorage.setItem(`piolo_compare_list`,JSON.stringify(e)),X(`Bien retiré du comparateur`)}else{if(G.length>=4){X(`Vous pouvez comparer jusqu’à 4 biens simultanément.`);return}let e={id:m.id,slug:m.slug,title:m.title||`${c(m)} à ${m.neighborhood||m.city}`,price:Number(m.price)||0,area:m.area,bedrooms:m.bedrooms,bathrooms:m.bathrooms,city:m.city,neighborhood:m.neighborhood,property_type_display:c(m),transaction_type:m.transaction_type,main_image:Q[0]||``},t=[...G,e];on(t),localStorage.setItem(`piolo_compare_list`,JSON.stringify(t)),X(`Bien ajouté au comparateur !`)}},pn=e=>{let t=G.filter(t=>t.id!==e);on(t),localStorage.setItem(`piolo_compare_list`,JSON.stringify(t))},mn=()=>{on([]),localStorage.removeItem(`piolo_compare_list`),K(!1)},hn=(()=>{let e=0;return P&&(e+=15),F&&parseFloat(F)>0&&(e+=15),Pt&&Pt.trim().length>1&&(e+=10),I&&I.trim().length>1&&(e+=5),Lt&&Lt.trim().length>3&&(e+=5),L&&(e+=20),R&&(e+=10),z&&(e+=10),B?(Ut&&Ut.trim().length>1&&(e+=5),(Gt||V&&parseFloat(V)>0||H)&&(e+=5)):P&&L&&(F||z)&&(e+=10),Math.min(100,e)})(),X=e=>{tt(e),setTimeout(()=>tt(``),4500)},gn=()=>{if(!l){d(`/login`,{state:{from:`/properties/${n}`}});return}if(f&&!$){p(!0);return}S(``),b(!0)},_n=()=>{if(!l){d(`/login`,{state:{from:`/properties/${n}`}});return}if(f&&!$){p(!0);return}N(``),M(1),x(!0)},vn=async()=>{try{let e=await ie.start(m.id||m.slug);e.data&&e.data.conversation_id?d(`/messages/${e.data.conversation_id}`):d(`/messages`)}catch(e){alert(e.response?.data?.error||`Erreur lors de l'ouverture de la messagerie.`)}},Z=()=>{if(!l){d(`/login`,{state:{from:`/properties/${n}`}});return}if(f&&!$){p(!0);return}J({isOpen:!0,actionKey:`CONTACT_LANDLORD`,targetTitle:m?.title||`Contact Direct Bailleur`,targetSubtitle:`${m?.city||`Yaoundé`} ${m?.neighborhood?`• `+m.neighborhood:``}`,onConfirmAction:vn})},yn=()=>{if(!l){d(`/login`,{state:{from:`/properties/${n}`}});return}if(f&&!$){p(!0);return}St(!1),D(!0)},bn=async()=>{bt(!0);try{await ae.book(m.id||m.slug,{check_in_date:w,check_out_date:T,guests_count:E,guest_note:_t}).catch(e=>{if(console.warn(`Notice DB booking:`,e.response?.data),e.response?.data?.error)throw Error(e.response.data.error)});let e=`🏨 Demande de Réservation Court Séjour :\n• Logement : ${m.title||`Meublé`}\n• Dates : du ${w} au ${T} (${O} nuitée${O>1?`s`:``})\n• Voyageurs : ${E} personne${E>1?`s`:``}\n• Total estimé : ${new Intl.NumberFormat(`fr-FR`).format(k)} FCFA\n`+(_t?`• Précision : "${_t}"\n`:``)+`
Bonjour, ce logement est-il disponible pour ces dates ? Merci de me confirmer les modalités.`,t=await ie.start(m.id||m.slug);t.data&&t.data.conversation_id?(await a.post(`/messages/${t.data.conversation_id}/send/`,{content:e}).catch(()=>{}),St(!0),setTimeout(()=>{D(!1),d(`/messages/${t.data.conversation_id}`)},1200)):(St(!0),setTimeout(()=>{D(!1),d(`/messages`)},1200))}catch(e){console.warn(`Erreur envoi réservation court séjour:`,e),X(e.message||e.response?.data?.error||`Erreur lors de la réservation.`)}finally{bt(!1)}},xn=e=>{if(e&&e.preventDefault&&e.preventDefault(),!l){d(`/login`,{state:{from:`/properties/${n}`}});return}if(f&&!$){p(!0);return}if(!w||!T||O<=0){X(`Veuillez sélectionner des dates de séjour valides.`);return}if(A){X(`Ces dates sont déjà occupées ou indisponibles.`);return}J({isOpen:!0,actionKey:`SHORT_STAY_BOOKING`,targetTitle:m?.title||`Réservation Court Séjour`,targetSubtitle:`Du ${w} au ${T} (${O} nuitées) • Total : ${new Intl.NumberFormat(`fr-FR`).format(k)} FCFA`,onConfirmAction:bn})},Sn=()=>{let e=(m?.owner?.phone_number||m?.owner?.phone||``).replace(/\D/g,``),t=e.startsWith(`237`)?e:e?`237${e}`:``,n=`Bonjour, je souhaite réserver votre meublé "${m?.title||`Court séjour`}" sur Piolo du ${w} au ${T} (${O} nuits, ${E} voyageur${E>1?`s`:``}). Total estimé : ${new Intl.NumberFormat(`fr-FR`).format(k)} FCFA. Est-il disponible ?`;return t?`https://wa.me/${t}?text=${encodeURIComponent(n)}`:`https://wa.me/?text=${encodeURIComponent(n)}`},Cn=e=>{if(e&&e.preventDefault&&e.preventDefault(),!l){d(`/login`,{state:{from:`/properties/${n}`}});return}if(f&&!$){p(!0);return}if(!w||!T||O<=0){X(`Veuillez sélectionner des dates de séjour valides.`);return}J({isOpen:!0,actionKey:`SHORT_STAY_BOOKING`,targetTitle:m?.title||`Réservation Court Séjour (WhatsApp)`,targetSubtitle:`Du ${w} au ${T} (${O} nuitées) • ${m?.city||`Yaoundé`}`,onConfirmAction:()=>{window.open(Sn(),`_blank`,`noopener,noreferrer`)}})},wn=async()=>{S(``),rt(!0);try{let e=await a.post(`/properties/${m.id}/visit/`,{requested_date:at,requested_time:st||null,message:lt});e.data.ok?(b(!1),X(`Demande de visite envoyée ! Le bailleur vous contactera bientôt.`),l&&e.data.points_remaining!==void 0&&(l.points=e.data.points_remaining,le.setTenantPoints(l.id,e.data.points_remaining))):S(e.data.error||`Une erreur est survenue.`)}catch(e){S(e.response?.data?.error||`Erreur lors de l'envoi. Vérifiez votre solde de points.`)}finally{rt(!1)}},Tn=e=>{if(e&&e.preventDefault&&e.preventDefault(),!at){S(`Date de visite requise.`);return}S(``),J({isOpen:!0,actionKey:`PHYSICAL_VISIT`,targetTitle:m?.title||`Demande de Visite Physique`,targetSubtitle:`Visite le ${at} à ${st||`heure convenue`} • ${m?.city||`Yaoundé`}`,onConfirmAction:wn})},En=async()=>{N(``),Et(!0);let e=new FormData;e.append(`move_in_date`,P),e.append(`lease_duration`,kt),e.append(`tenant_count`,jt),F&&e.append(`monthly_income`,F),e.append(`profession`,Pt),e.append(`employer`,I),e.append(`message`,Lt),e.append(`has_guarantor`,B?`true`:`false`),B&&(e.append(`guarantor_name`,Ut),e.append(`guarantor_phone`,Gt),e.append(`guarantor_relation`,qt),V&&e.append(`guarantor_income`,V),H&&e.append(`guarantor_cni`,H)),L&&e.append(`cni_front`,L),R&&e.append(`cni_back`,R),z&&e.append(`income_proof`,z);try{let t=await a.post(`/properties/${m.id}/location/`,e,{headers:{"Content-Type":`multipart/form-data`}});t.data.ok?(x(!1),X(`Dossier envoyé ! Complétude : ${t.data.dossier_completion}%. Le bailleur vous répondra bientôt.`),l&&t.data.points_remaining!==void 0&&(l.points=t.data.points_remaining,le.setTenantPoints(l.id,t.data.points_remaining))):N(t.data.error||`Une erreur est survenue.`)}catch(e){N(e.response?.data?.error||`Erreur lors de l'envoi. Vérifiez votre solde de points.`)}finally{Et(!1)}},Dn=e=>{if(e&&e.preventDefault&&e.preventDefault(),!P){N(`Veuillez renseigner la date d'entrée souhaitée à l'étape 1.`);return}N(``),J({isOpen:!0,actionKey:`RENTAL_APPLICATION`,targetTitle:m?.title||`Candidature Locative Prioritaire`,targetSubtitle:`Entrée souhaitée : ${P} • ${m?.city||`Yaoundé`}`,onConfirmAction:En})},On=e=>{if(e&&e.preventDefault&&e.preventDefault(),!l||!u){d(`/login`,{state:{from:`/properties/${m?.slug||m?.id}/tour`}});return}if(f&&!$){p(!0);return}J({isOpen:!0,actionKey:`VIRTUAL_TOUR_360`,targetTitle:m?.title||`Visite Virtuelle 360°`,targetSubtitle:`Immersion 3D interactive • ${m?.neighborhood||m?.city||`Yaoundé`}`,onConfirmAction:()=>{d(`/properties/${m?.slug||m?.id}/tour`)}})};(0,o.useEffect)(()=>{window.scrollTo(0,0);let e=re.get(`property_detail_${n}`);e||De(!0),ke(!1),g(0),oe.detail(n).then(({data:e})=>{Te(e),Ae(e.is_favorite||!1),Me(e.favorites_count||0),re.set(`property_detail_${n}`,e,18e4)}).catch(()=>{e||ke(!0)}).finally(()=>De(!1))},[n]);let kn=async()=>{if(!u){d(`/login`,{state:{from:{pathname:`/properties/${n}`}}});return}let e=!_,t=e?je+1:Math.max(0,je-1);Ae(e),Me(t);try{let e=await a.post(`/properties/${m?.id||n}/favorite/`);if(e.data?.ok&&(Ae(e.data.is_favorite),e.data.count!==void 0&&Me(e.data.count),m)){let t={...m,is_favorite:e.data.is_favorite,favorites_count:e.data.count};re.set(`property_detail_${n}`,t,18e4)}}catch(t){console.error(`Error toggling favorite:`,t),Ae(!e),Me(je)}},Q=m?(()=>{let e=m.main_image?ce(m.main_image):null,t=(m.images||[]).map(e=>ce(typeof e==`string`?e:e.image||e.image_url)).filter(Boolean);return e?[e,...t]:t})():[];(0,o.useEffect)(()=>{if(!Ye||Q.length<=1)return;let e=setInterval(()=>{g(e=>e<Q.length-1?e+1:0)},4500);return()=>clearInterval(e)},[Ye,Q.length]),(0,o.useEffect)(()=>{if(Xe.current){let e=Xe.current,t=e.querySelector(`.mobile-hero-thumb[data-idx="${h}"]`);if(t){let n=t.offsetLeft-e.clientWidth/2+t.clientWidth/2;e.scrollTo({left:Math.max(0,n),behavior:`smooth`})}}},[h]);let An=e=>{e&&e.stopPropagation&&e.stopPropagation(),We(e=>e>0?e-1:Q.length-1)},jn=e=>{e&&e.stopPropagation&&e.stopPropagation(),We(e=>e<Q.length-1?e+1:0)},Mn=e=>{Je(null),Ke(e.targetTouches[0].clientX)},Nn=e=>{Je(e.targetTouches[0].clientX)},Pn=()=>{if(!Ge||!qe)return;let e=Ge-qe;e>50?jn():e<-50&&An()};(0,o.useEffect)(()=>{if(!He)return;let e=e=>{e.key===`ArrowLeft`&&An(),e.key===`ArrowRight`&&jn(),e.key===`Escape`&&v(!1)};return window.addEventListener(`keydown`,e),()=>window.removeEventListener(`keydown`,e)},[He]),(0,o.useEffect)(()=>{if(!m)return;let e={lat:Fn(m.latitude,3.848),lng:Fn(m.longitude,11.5021)},t=()=>{if(!(!window.google||!window.google.maps||!Ne.current))try{let t=new window.google.maps.Map(Ne.current,{zoom:16,center:e,mapTypeId:`hybrid`,streetViewControl:!1,fullscreenControl:!1,mapTypeControl:!0,zoomControl:!0,gestureHandling:`greedy`});new window.google.maps.Circle({strokeColor:`#D4AF37`,strokeOpacity:.8,strokeWeight:2,fillColor:`#D4AF37`,fillOpacity:.15,map:t,center:e,radius:350}),new window.google.maps.Marker({position:e,map:t,title:m.property_type?`${c(m)} - ${m.neighborhood||m.city}`:`Position du bien`,icon:{path:`M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z`,fillColor:`#D4AF37`,fillOpacity:1,strokeColor:`#0F0D09`,strokeWeight:1.5,scale:1.5,anchor:new window.google.maps.Point(12,12)}}),Fe(!0)}catch(e){console.error(`Erreur d'initialisation de Google Maps:`,e)}};if(window.google&&window.google.maps)t();else{let e=m.google_maps_api_key||`AIzaSyDZyYvlR1SeSE6mk2kJn-gJxg-tfsDoJKc`,n=`google-maps-api-script`,r=document.getElementById(n);if(!r)r=document.createElement(`script`),r.id=n,r.src=`https://maps.googleapis.com/maps/api/js?key=${e}&callback=initPioloDetailMap`,r.async=!0,r.defer=!0,window.initPioloDetailMap=()=>{t()},document.head.appendChild(r);else{let e=setInterval(()=>{window.google&&window.google.maps&&(clearInterval(e),t())},150);setTimeout(()=>clearInterval(e),8e3)}}},[m]);let Fn=(e,t)=>{if(e!=null&&e!==``&&e!==`None`){let t=parseFloat(String(e).replace(`,`,`.`));if(!isNaN(t)&&t!==0)return t}return t},In=()=>{if(!m)return;let e=`https://www.google.com/maps/dir/?api=1&destination=${Fn(m.latitude,3.848)},${Fn(m.longitude,11.5021)}&travelmode=driving`;window.open(e,`_blank`,`noopener,noreferrer`),ze(!0),Ve({type:`success`,message:`Itinéraire ouvert dans Google Maps.`}),setTimeout(()=>Ve(null),6e3)},Ln=()=>{if(m){if(!l||!u){d(`/login`,{state:{from:`/properties/${n}`}});return}if(f&&!$){p(!0);return}J({isOpen:!0,actionKey:`PROPERTY_GPS_ROUTE`,targetTitle:m?.title||`Itinéraire GPS Logement`,targetSubtitle:`Guidage vers ${m?.neighborhood||m?.city||`le logement`}`,onConfirmAction:In})}},Rn=m?[m.neighborhood,m.city].filter(Boolean).join(`, `):`Yaoundé`,zn=()=>{g(e=>e>0?e-1:Q.length-1),y(!1)},Bn=()=>{g(e=>e<Q.length-1?e+1:0),y(!1)},$=l&&m&&l.id===m.owner?.id,Vn=!!(m?.video_reel&&String(m.video_reel).trim()),Hn=Number(m?.owner?.verification_level||0),Un=Hn>=2||m?.owner?.is_verified||m?.owner?.is_owner_verified,Wn=Hn>=3?`premium`:Un?`verified`:`unverified`;return Ee?(0,s.jsxs)(`div`,{className:`detail-page-scope`,children:[(0,s.jsx)(`style`,{children:ge}),(0,s.jsx)(de,{})]}):Oe||!m?(0,s.jsxs)(`div`,{className:`detail-page-scope`,children:[(0,s.jsx)(`style`,{children:ge}),(0,s.jsxs)(`div`,{style:{textAlign:`center`,padding:`80px 20px`},children:[(0,s.jsx)(`div`,{style:{fontSize:60,marginBottom:20},children:`🏠`}),(0,s.jsx)(`h2`,{style:{fontFamily:`Poppins, sans-serif`,marginBottom:12},children:`Annonce introuvable`}),(0,s.jsx)(`p`,{style:{color:`#888`,marginBottom:24},children:`Cette annonce n'existe pas ou a été supprimée.`}),(0,s.jsx)(i,{to:Ce,style:{display:`inline-block`,background:`linear-gradient(135deg,#D4AF37,#F6D365)`,color:`#000`,padding:`12px 28px`,borderRadius:12,fontWeight:700,fontFamily:`Poppins, sans-serif`,textDecoration:`none`},children:`← Retour aux annonces`})]})]}):(0,s.jsxs)(`div`,{className:`detail-page-scope`,children:[(0,s.jsx)(`style`,{children:ge}),(0,s.jsxs)(`div`,{className:`mobile-hero-gallery`,onTouchStart:Mn,onTouchMove:Nn,onTouchEnd:()=>{if(!Ge||!qe)return;let e=Ge-qe;e>40&&h<Q.length-1?(y(!1),g(e=>e+1)):e<-40&&h>0&&(y(!1),g(e=>e-1))},children:[(0,s.jsxs)(`div`,{className:`mobile-hero-top-bar`,children:[(0,s.jsx)(`button`,{type:`button`,className:`mobile-hero-btn`,onClick:e=>{e.preventDefault(),d(-1)},"aria-label":`Retour`,children:(0,s.jsx)(`i`,{className:`fas fa-arrow-left`})}),(0,s.jsxs)(`div`,{style:{display:`flex`,gap:10},children:[(0,s.jsx)(`button`,{type:`button`,className:`mobile-hero-btn ${_?`fav-active`:``}`,onClick:e=>{e.preventDefault(),kn()},"aria-label":`Favori`,children:(0,s.jsx)(`i`,{className:_?`fas fa-heart`:`far fa-heart`})}),(0,s.jsx)(`button`,{type:`button`,className:`mobile-hero-btn`,onClick:e=>{e.preventDefault(),navigator.share?navigator.share({title:m.title||c(m),url:window.location.href}):(navigator.clipboard?.writeText(window.location.href),X(`Lien copié dans le presse-papier !`))},"aria-label":e(`property_detail.share_btn`,`Partager`),children:(0,s.jsx)(`i`,{className:`fas fa-arrow-up-from-bracket`})})]})]}),(0,s.jsx)(`div`,{className:`mobile-hero-track`,style:{transform:`translateX(-${h*100}%)`},children:Q.map((e,t)=>(0,s.jsx)(`div`,{className:`mobile-hero-slide`,onClick:e=>{e.preventDefault(),We(h),v(!0)},children:(0,s.jsx)(`img`,{src:e,alt:`${c(m)} photo ${t+1}`,loading:t===0?`eager`:`lazy`})},t))}),Q.length>1&&(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(`button`,{type:`button`,className:`mobile-hero-nav-arrow prev`,onClick:e=>{e.preventDefault(),e.stopPropagation(),y(!1),g(e=>e>0?e-1:Q.length-1)},"aria-label":`Photo précédente`,children:(0,s.jsx)(`i`,{className:`fas fa-chevron-left`})}),(0,s.jsx)(`button`,{type:`button`,className:`mobile-hero-nav-arrow next`,onClick:e=>{e.preventDefault(),e.stopPropagation(),y(!1),g(e=>e<Q.length-1?e+1:0)},"aria-label":`Photo suivante`,children:(0,s.jsx)(`i`,{className:`fas fa-chevron-right`})})]}),(0,s.jsxs)(`div`,{className:`mobile-hero-bottom-bar`,children:[m.virtual_tours?.length>0?(0,s.jsxs)(`button`,{type:`button`,onClick:On,className:`mobile-hero-360-badge`,style:{border:`none`,cursor:`pointer`},children:[(0,s.jsx)(`i`,{className:`fas fa-vr-cardboard`}),(0,s.jsx)(`span`,{children:`Visite 360°`})]}):(0,s.jsx)(`span`,{className:`dbadge ${m.transaction_type?.toLowerCase()||`location`}`,style:{marginBottom:0},children:he(m.transaction_type)}),(0,s.jsxs)(`div`,{className:`mobile-hero-counter`,children:[h+1,` / `,Q.length||1]})]}),Q.length>1&&(0,s.jsx)(`div`,{className:`mobile-hero-dots`,children:Q.map((e,t)=>(0,s.jsx)(`div`,{className:`mobile-hero-dot ${t===h?`active`:``}`},t))})]}),Q.length>1&&(0,s.jsx)(`div`,{className:`mobile-hero-thumbs-strip`,ref:Xe,children:Q.map((e,t)=>(0,s.jsx)(`button`,{type:`button`,"data-idx":t,className:`mobile-hero-thumb ${t===h?`active`:``}`,onClick:e=>{e.preventDefault(),e.stopPropagation(),g(t),y(!1)},"aria-label":`Afficher photo ${t+1}`,children:(0,s.jsx)(`img`,{src:e,alt:`Miniature photo ${t+1}`,loading:`lazy`})},t))}),(0,s.jsxs)(`div`,{className:`detail-shell`,children:[(0,s.jsxs)(`div`,{className:`detail-breadcrumb`,children:[(0,s.jsxs)(i,{to:Se,children:[(0,s.jsx)(`svg`,{viewBox:`0 0 24 24`,fill:`currentColor`,children:(0,s.jsx)(`path`,{d:`M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z`})}),`Accueil`]}),(0,s.jsx)(`span`,{className:`sep`,children:`/`}),(0,s.jsx)(i,{to:Ce,children:c(m)}),(0,s.jsx)(`span`,{className:`sep`,children:`/`}),(0,s.jsxs)(`span`,{className:`current`,children:[m.bedrooms,` pièce(s) à `,m.city]})]}),(0,s.jsxs)(`div`,{className:`detail-grid`,children:[(0,s.jsxs)(`div`,{className:`detail-main`,children:[(0,s.jsxs)(`div`,{className:`gallery`,children:[(0,s.jsx)(`div`,{className:`gallery-thumbs`,children:Q.map((e,t)=>(0,s.jsx)(`div`,{className:`thumb ${t===h?`active`:``}`,onClick:()=>{g(t),y(!1)},children:(0,s.jsx)(`img`,{src:e,alt:`Photo ${t+1}`})},t))}),(0,s.jsxs)(`div`,{className:`gallery-main`,children:[(0,s.jsx)(`button`,{type:`button`,className:`gallery-nav prev`,onClick:zn,children:(0,s.jsx)(`svg`,{viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,children:(0,s.jsx)(`polyline`,{points:`15 18 9 12 15 6`})})}),Q[h]&&(0,s.jsx)(`img`,{src:Q[h],alt:c(m),style:{cursor:`zoom-in`},onClick:()=>{We(h),v(!0),y(!1)}}),(0,s.jsx)(`button`,{type:`button`,className:`gallery-nav next`,onClick:Bn,children:(0,s.jsx)(`svg`,{viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,children:(0,s.jsx)(`polyline`,{points:`9 18 15 12 9 6`})})}),(0,s.jsxs)(`span`,{className:`gallery-counter`,children:[(0,s.jsx)(`span`,{children:h+1}),` / `,(0,s.jsx)(`span`,{children:Q.length})]})]})]}),(0,s.jsxs)(`div`,{className:`detail-card`,children:[(0,s.jsxs)(`div`,{className:`detail-top-row`,children:[(0,s.jsxs)(`div`,{className:`detail-titleblock`,children:[(0,s.jsx)(`span`,{className:`dbadge ${m.transaction_type?.toLowerCase()||`location`}`,children:he(m.transaction_type)}),(0,s.jsxs)(`h1`,{className:`detail-title`,children:[c(m),` `,m.bedrooms,` pièces à `,m.neighborhood||m.city]}),(0,s.jsxs)(`div`,{className:`detail-sub`,children:[(0,s.jsx)(`i`,{className:`fas fa-location-dot`,style:{color:`var(--or-d)`}}),(0,s.jsxs)(`span`,{children:[m.neighborhood?`${m.neighborhood}, `:``,m.city]}),(0,s.jsxs)(`span`,{children:[`· `,m.area,` m²`]})]})]}),(0,s.jsxs)(`div`,{className:`detail-price-block`,children:[(0,s.jsxs)(`div`,{className:`dprice`,children:[new Intl.NumberFormat(`fr-FR`).format(Number(m.price)||0),` `,(0,s.jsx)(`span`,{className:`dcurrency`,children:`FCFA`}),m.transaction_type===`LOCATION`&&(0,s.jsx)(`span`,{className:`dperiod`,children:`/mois`}),m.transaction_type===`COURTE_DUREE`&&(0,s.jsx)(`span`,{className:`dperiod`,style:{color:`#059669`,fontWeight:700},children:`/nuit`}),m.transaction_type===`VENTE`&&(0,s.jsx)(`span`,{className:`dperiod`,style:{color:`#1D4ED8`,fontWeight:700,fontSize:13},children:` (Prix de vente)`})]}),(0,s.jsx)(`div`,{className:`dprice-sub`,children:m.transaction_type===`COURTE_DUREE`?`charges & wifi inclus`:m.transaction_type===`VENTE`?`prix d’acquisition global`:`charges non comprises`})]})]}),(0,s.jsxs)(`div`,{className:`dbulles`,children:[(0,s.jsxs)(`div`,{className:`dbulle`,children:[(0,s.jsx)(`i`,{className:`fas fa-door-open`}),(0,s.jsxs)(`span`,{children:[m.bedrooms,` pièce(s)`]})]}),(0,s.jsxs)(`div`,{className:`dbulle`,children:[(0,s.jsx)(`i`,{className:`fas fa-bed`}),(0,s.jsxs)(`span`,{children:[m.bedrooms,` chambre(s)`]})]}),(0,s.jsxs)(`div`,{className:`dbulle`,children:[(0,s.jsx)(`i`,{className:`fas fa-bath`}),(0,s.jsxs)(`span`,{children:[m.bathrooms,` sdb`]})]}),(0,s.jsxs)(`div`,{className:`dbulle`,children:[(0,s.jsx)(`i`,{className:`fas fa-ruler-combined`}),(0,s.jsxs)(`span`,{children:[m.area,` m²`]})]})]}),(0,s.jsxs)(`div`,{className:`dactions`,children:[(0,s.jsxs)(`button`,{type:`button`,className:`dact-btn fav ${_?`active`:``}`,onClick:kn,title:e(`property.favorite_add`,`Ajouter aux favoris`),children:[(0,s.jsx)(`svg`,{viewBox:`0 0 24 24`,fill:_?`var(--or-d)`:`none`,stroke:_?`var(--or-d)`:`currentColor`,strokeWidth:`2`,children:(0,s.jsx)(`path`,{d:`M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z`})}),(0,s.jsxs)(`span`,{children:[`Favoris (`,je,`)`]})]}),(0,s.jsxs)(`button`,{type:`button`,className:`dact-btn ${Y?`active`:``}`,onClick:fn,title:Y?`Retirer du comparateur`:`Ajouter au comparateur`,children:[(0,s.jsx)(`i`,{className:`fas fa-scale-balanced`,style:{color:Y?`var(--or-d)`:`inherit`}}),(0,s.jsx)(`span`,{children:Y?`Dans le comparateur`:`Comparer`})]}),(0,s.jsxs)(`button`,{type:`button`,className:`dact-btn`,onClick:()=>window.print(),title:e(`property_detail.print_btn`,`Imprimer`),children:[(0,s.jsx)(`i`,{className:`fas fa-print`}),(0,s.jsx)(`span`,{children:e(`property_detail.print_btn`,`Imprimer`)})]}),(0,s.jsxs)(`span`,{className:`dref`,children:[`Réf : `,m.id?.substring(0,8).toUpperCase()]})]})]}),Vn&&(0,s.jsx)(`div`,{style:{marginBottom:12,display:`flex`,justifyContent:`center`,width:`100%`},children:(0,s.jsxs)(i,{to:`/discovery?prop=${encodeURIComponent(m.slug||m.id)}`,className:`btn-discovery`,children:[(0,s.jsx)(`i`,{className:`fas fa-film`}),(0,s.jsx)(`span`,{children:e(`property_detail.view_reel_btn`,`Voir la vidéo en mode découverte`)})]})}),m.virtual_tours?.length>0&&(0,s.jsx)(`div`,{style:{marginBottom:16,display:`flex`,justifyContent:`center`,width:`100%`},children:(0,s.jsxs)(`button`,{type:`button`,onClick:On,className:`btn-360-shake`,style:{border:`none`,cursor:`pointer`},children:[(0,s.jsx)(`i`,{className:`fas fa-vr-cardboard`,style:{fontSize:20}}),(0,s.jsx)(`span`,{children:e(`property_detail.view_360_btn`,`Effectuer la visite 360° interactive`)})]})}),(0,s.jsxs)(`div`,{className:`detail-card`,children:[(0,s.jsxs)(`h2`,{className:`dsection-title`,children:[(0,s.jsx)(`i`,{className:`fas fa-align-left`,style:{color:`var(--or-d)`,fontSize:16}}),`Description`]}),(0,s.jsx)(`div`,{className:`ddescription`,children:(0,s.jsx)(`p`,{style:{whiteSpace:`pre-wrap`},children:m.description||`Aucune description fournie.`})})]}),(0,s.jsxs)(`div`,{className:`detail-card`,children:[(0,s.jsxs)(`h2`,{className:`dsection-title`,children:[(0,s.jsx)(`i`,{className:`fas fa-coins`,style:{color:`var(--or-d)`,fontSize:16}}),`Aspects financiers`]}),(0,s.jsxs)(`div`,{className:`dfinance-grid`,style:{marginBottom:m.transaction_type===`LOCATION`?18:0},children:[(0,s.jsxs)(`div`,{className:`dfin-item`,children:[(0,s.jsx)(`span`,{className:`dfin-label`,children:m.transaction_type===`COURTE_DUREE`?`Tarif par nuitée`:m.transaction_type===`VENTE`?`Prix de vente total`:`Loyer mensuel`}),(0,s.jsxs)(`span`,{className:`dfin-value`,children:[new Intl.NumberFormat(`fr-FR`).format(Number(m.price)||0),` FCFA`,m.transaction_type===`COURTE_DUREE`&&(0,s.jsx)(`span`,{style:{fontSize:13,color:`#059669`,fontWeight:600},children:` / nuit`}),m.transaction_type===`LOCATION`&&(0,s.jsx)(`span`,{style:{fontSize:13,color:`#6B7280`,fontWeight:500},children:` / mois`})]})]}),m.transaction_type===`LOCATION`&&(0,s.jsxs)(`div`,{className:`dfin-item`,children:[(0,s.jsxs)(`span`,{className:`dfin-label`,children:[`Caution standard (`,U,` mois)`]}),(0,s.jsxs)(`span`,{className:`dfin-value`,children:[new Intl.NumberFormat(`fr-FR`).format((Number(m.price)||0)*U),` FCFA`]})]}),m.transaction_type===`COURTE_DUREE`&&(0,s.jsxs)(`div`,{className:`dfin-item`,children:[(0,s.jsx)(`span`,{className:`dfin-label`,children:`Formule d’hébergement`}),(0,s.jsx)(`span`,{className:`dfin-value`,style:{color:`#059669`,fontSize:15},children:`Meublé court séjour (Nuitée)`})]}),m.transaction_type===`VENTE`&&(0,s.jsxs)(`div`,{className:`dfin-item`,children:[(0,s.jsx)(`span`,{className:`dfin-label`,children:`Type d’opération`}),(0,s.jsx)(`span`,{className:`dfin-value`,style:{color:`#1D4ED8`,fontSize:15},children:`Acquisition / Vente immobilière`})]})]}),m.transaction_type===`LOCATION`&&(0,s.jsxs)(`div`,{className:`budget-sim-card`,children:[(0,s.jsxs)(`div`,{className:`budget-sim-header`,onClick:()=>Qt(e=>!e),children:[(0,s.jsxs)(`div`,{className:`budget-sim-title`,children:[(0,s.jsx)(`i`,{className:`fas fa-calculator`,style:{color:`var(--or-d)`}}),(0,s.jsx)(`span`,{children:e(`property_detail.move_in_simulator_title`,`Simulateur de Frais d'Emménagement`)}),(0,s.jsx)(`span`,{className:`budget-sim-badge`,children:e(`property_detail.interactive_badge`,`Interactif`)})]}),(0,s.jsx)(`i`,{className:`fas fa-chevron-${Zt?`up`:`down`} budget-sim-toggle-icon`})]}),Zt&&(0,s.jsxs)(`div`,{className:`budget-sim-body`,children:[(0,s.jsxs)(`div`,{className:`budget-sim-row`,children:[(0,s.jsxs)(`div`,{className:`budget-sim-label`,children:[(0,s.jsx)(`span`,{className:`budget-sim-name`,children:e(`property_detail.first_month_rent`,`1er Loyer mensuel`)}),(0,s.jsx)(`span`,{className:`budget-sim-desc`,children:e(`property_detail.first_month_rent_sub`,`Loyer du premier mois d'occupation`)})]}),(0,s.jsxs)(`div`,{className:`budget-sim-amount`,children:[new Intl.NumberFormat(`fr-FR`).format(Number(m.price)||0),` FCFA`]})]}),(0,s.jsxs)(`div`,{className:`budget-sim-row`,children:[(0,s.jsxs)(`div`,{className:`budget-sim-label`,children:[(0,s.jsx)(`span`,{className:`budget-sim-name`,children:e(`property_detail.caution_deposit`,`Dépôt de garantie (Caution)`)}),(0,s.jsx)(`span`,{className:`budget-sim-desc`,children:e(`property_detail.caution_deposit_sub`,`Remboursable en fin de bail selon l'état des lieux`)})]}),(0,s.jsxs)(`div`,{className:`budget-sim-controls`,children:[(0,s.jsx)(`div`,{className:`budget-pill-select`,children:[1,2,3].map(e=>(0,s.jsxs)(`button`,{type:`button`,className:`budget-pill-btn ${U===e?`active`:``}`,onClick:()=>$t(e),children:[e,` `,`mois`]},e))}),(0,s.jsxs)(`div`,{className:`budget-sim-amount`,children:[new Intl.NumberFormat(`fr-FR`).format((Number(m.price)||0)*U),` FCFA`]})]})]}),(0,s.jsxs)(`div`,{className:`budget-sim-row`,children:[(0,s.jsxs)(`div`,{className:`budget-sim-label`,children:[(0,s.jsx)(`span`,{className:`budget-sim-name`,children:e(`property_detail.advance_rent`,`Avance sur loyers`)}),(0,s.jsx)(`span`,{className:`budget-sim-desc`,children:e(`property_detail.advance_rent_sub`,`Nombre de mois payés d'avance`)})]}),(0,s.jsxs)(`div`,{className:`budget-sim-controls`,children:[(0,s.jsx)(`div`,{className:`budget-pill-select`,children:[0,1,2,3,6].map(e=>(0,s.jsx)(`button`,{type:`button`,className:`budget-pill-btn ${en===e?`active`:``}`,onClick:()=>tn(e),children:e===0?`Aucune`:`${e}m`},e))}),(0,s.jsxs)(`div`,{className:`budget-sim-amount`,children:[new Intl.NumberFormat(`fr-FR`).format((Number(m.price)||0)*en),` FCFA`]})]})]}),(0,s.jsxs)(`div`,{className:`budget-sim-row`,children:[(0,s.jsxs)(`div`,{className:`budget-sim-label`,children:[(0,s.jsx)(`span`,{className:`budget-sim-name`,children:e(`property_detail.admin_fees`,`Frais de dossier & État des lieux`)}),(0,s.jsx)(`span`,{className:`budget-sim-desc`,children:e(`property_detail.admin_fees_sub`,`Gestion administrative et remise des clés`)})]}),(0,s.jsxs)(`div`,{className:`budget-sim-controls`,children:[(0,s.jsx)(`div`,{className:`budget-pill-select`,children:[0,1e4,25e3].map(e=>(0,s.jsx)(`button`,{type:`button`,className:`budget-pill-btn ${nn===e?`active`:``}`,onClick:()=>rn(e),children:e===0?`Offert`:`${new Intl.NumberFormat(`fr-FR`).format(e)} F`},e))}),(0,s.jsxs)(`div`,{className:`budget-sim-amount`,children:[new Intl.NumberFormat(`fr-FR`).format(nn),` FCFA`]})]})]}),(0,s.jsxs)(`div`,{className:`budget-total-box`,children:[(0,s.jsxs)(`div`,{className:`budget-total-label`,children:[(0,s.jsx)(`span`,{className:`budget-total-title`,children:e(`property_detail.total_move_in_estimate`,`Total estimé à prévoir pour emménager`)}),(0,s.jsx)(`span`,{className:`budget-total-note`,children:e(`property_detail.total_move_in_sub`,`Simulation indicative tout compris pour remise des clés`)})]}),(0,s.jsxs)(`div`,{className:`budget-total-value`,children:[new Intl.NumberFormat(`fr-FR`).format((Number(m.price)||0)*(1+en+U)+nn),` FCFA`]})]})]})]})]}),m.transaction_type===`COURTE_DUREE`&&(0,s.jsxs)(`div`,{className:`detail-card`,children:[(0,s.jsxs)(`h2`,{className:`dsection-title`,children:[(0,s.jsx)(`i`,{className:`fas fa-calendar-days`,style:{color:`#059669`,fontSize:16}}),`Modalités du Séjour & Arrivée`]}),(0,s.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(220px, 1fr))`,gap:14},children:[(0,s.jsxs)(`div`,{style:{padding:`14px 16px`,background:`#F0FDF4`,borderRadius:14,border:`1px solid rgba(16,185,129,0.2)`},children:[(0,s.jsxs)(`div`,{style:{fontSize:11,fontWeight:800,textTransform:`uppercase`,color:`#059669`,marginBottom:4},children:[(0,s.jsx)(`i`,{className:`fas fa-clock`,style:{marginRight:6}}),` Horaires du Séjour`]}),(0,s.jsxs)(`div`,{style:{fontSize:13,fontWeight:700,color:`#111827`},children:[`Arrivée : à partir de 14h00`,(0,s.jsx)(`br`,{}),`Départ : avant 11h00`]})]}),(0,s.jsxs)(`div`,{style:{padding:`14px 16px`,background:`#F0FDF4`,borderRadius:14,border:`1px solid rgba(16,185,129,0.2)`},children:[(0,s.jsxs)(`div`,{style:{fontSize:11,fontWeight:800,textTransform:`uppercase`,color:`#059669`,marginBottom:4},children:[(0,s.jsx)(`i`,{className:`fas fa-key`,style:{marginRight:6}}),` Remise des clés`]}),(0,s.jsx)(`div`,{style:{fontSize:13,fontWeight:700,color:`#111827`},children:`Accueil personnalisé sur place par l'hôte ou la conciergerie`})]}),(0,s.jsxs)(`div`,{style:{padding:`14px 16px`,background:`#F0FDF4`,borderRadius:14,border:`1px solid rgba(16,185,129,0.2)`},children:[(0,s.jsxs)(`div`,{style:{fontSize:11,fontWeight:800,textTransform:`uppercase`,color:`#059669`,marginBottom:4},children:[(0,s.jsx)(`i`,{className:`fas fa-shield-halved`,style:{marginRight:6}}),` Services inclus`]}),(0,s.jsx)(`div`,{style:{fontSize:13,fontWeight:700,color:`#111827`},children:`Wi-Fi haut débit, Eau & Électricité continues, Draps & Serviettes propres`})]})]})]}),(0,s.jsxs)(`div`,{className:`detail-card`,children:[(0,s.jsxs)(`h2`,{className:`dsection-title`,children:[(0,s.jsx)(`i`,{className:`fas fa-list-check`,style:{color:`var(--or-d)`,fontSize:16}}),`Caractéristiques du bien`]}),(0,s.jsxs)(`div`,{className:`dcriteria-grid`,children:[(0,s.jsxs)(`div`,{className:`dcrit-block`,children:[(0,s.jsxs)(`h3`,{children:[(0,s.jsx)(`i`,{className:`fas fa-building`}),` Général`]}),(0,s.jsxs)(`ul`,{children:[(0,s.jsxs)(`li`,{children:[(0,s.jsx)(`span`,{children:e(`property_detail.specs_type`,`Type de bien`)}),(0,s.jsx)(`b`,{children:c(m)})]}),(0,s.jsxs)(`li`,{children:[(0,s.jsx)(`span`,{children:e(`property_detail.specs_transaction`,`Transaction`)}),(0,s.jsx)(`b`,{children:he(m.transaction_type)})]})]})]}),(0,s.jsxs)(`div`,{className:`dcrit-block`,children:[(0,s.jsxs)(`h3`,{children:[(0,s.jsx)(`i`,{className:`fas fa-location-dot`}),` Localisation`]}),(0,s.jsxs)(`ul`,{children:[(0,s.jsxs)(`li`,{children:[(0,s.jsx)(`span`,{children:`Ville`}),(0,s.jsx)(`b`,{children:m.city})]}),(0,s.jsxs)(`li`,{children:[(0,s.jsx)(`span`,{children:`Quartier`}),(0,s.jsx)(`b`,{children:m.neighborhood||`Centre`})]})]})]}),(0,s.jsxs)(`div`,{className:`dcrit-block`,children:[(0,s.jsxs)(`h3`,{children:[(0,s.jsx)(`i`,{className:`fas fa-maximize`}),` Surfaces`]}),(0,s.jsx)(`ul`,{children:(0,s.jsxs)(`li`,{children:[(0,s.jsx)(`span`,{children:e(`property_detail.specs_total_surface`,`Surface totale`)}),(0,s.jsxs)(`b`,{children:[m.area,` m²`]})]})})]}),(0,s.jsxs)(`div`,{className:`dcrit-block`,children:[(0,s.jsxs)(`h3`,{children:[(0,s.jsx)(`i`,{className:`fas fa-couch`}),` Intérieur`]}),(0,s.jsxs)(`ul`,{children:[(0,s.jsxs)(`li`,{children:[(0,s.jsx)(`span`,{children:e(`property_detail.specs_rooms`,`Pièces`)}),(0,s.jsx)(`b`,{children:m.bedrooms})]}),(0,s.jsxs)(`li`,{children:[(0,s.jsx)(`span`,{children:e(`property_detail.specs_bedrooms`,`Chambres`)}),(0,s.jsx)(`b`,{children:m.bedrooms})]}),(0,s.jsxs)(`li`,{children:[(0,s.jsx)(`span`,{children:e(`property_detail.specs_bathrooms`,`Salles de bain`)}),(0,s.jsx)(`b`,{children:m.bathrooms})]})]})]})]})]}),(0,s.jsxs)(`div`,{className:`detail-card neighborhood-index-card`,style:{background:`linear-gradient(145deg, #FFFFFF 0%, #FAF8F5 100%)`,border:`1.5px solid rgba(212, 175, 55, 0.35)`,borderRadius:20,boxShadow:`0 8px 30px rgba(0,0,0,0.04)`,overflow:`hidden`},children:[(0,s.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,marginBottom:18,flexWrap:`wrap`,gap:10},children:[(0,s.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:12},children:[(0,s.jsx)(`div`,{style:{width:42,height:42,borderRadius:13,background:`linear-gradient(135deg, rgba(212,175,55,0.18), rgba(246,211,101,0.28))`,display:`flex`,alignItems:`center`,justifyContent:`center`,color:`#B8860B`,border:`1px solid rgba(212,175,55,0.35)`,boxShadow:`0 4px 12px rgba(212,175,55,0.15)`},children:(0,s.jsxs)(`svg`,{width:`22`,height:`22`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,s.jsx)(`polygon`,{points:`1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6`}),(0,s.jsx)(`line`,{x1:`8`,y1:`2`,x2:`8`,y2:`18`}),(0,s.jsx)(`line`,{x1:`16`,y1:`6`,x2:`16`,y2:`22`})]})}),(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`h2`,{style:{margin:0,fontSize:18,fontWeight:800,fontFamily:`Poppins, sans-serif`,color:`#111827`},children:`Indice de Vie du Quartier`}),(0,s.jsxs)(`span`,{style:{fontSize:12,color:`#6B7280`,fontWeight:500},children:[`Vérifications concrètes du terrain à `,m.neighborhood||m.city]})]})]}),(0,s.jsxs)(`div`,{style:{display:`inline-flex`,alignItems:`center`,gap:6,padding:`6px 14px`,borderRadius:999,background:`linear-gradient(135deg, #FFF9EB, #FBF3DC)`,border:`1px solid rgba(212, 175, 55, 0.4)`,fontSize:12,fontWeight:800,color:`#92700C`,boxShadow:`0 2px 8px rgba(212,175,55,0.12)`},children:[(0,s.jsx)(`svg`,{width:`14`,height:`14`,viewBox:`0 0 24 24`,fill:`currentColor`,children:(0,s.jsx)(`path`,{d:`M12 2L1 21h22L12 2zm0 3.5l8.5 15H3.5L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z`})}),(0,s.jsx)(`span`,{children:e(`property_detail.specs_certified_terrain`,`Terrain Certifié Piolo`)})]})]}),(0,s.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(260px, 1fr))`,gap:12,marginTop:14},children:[(0,s.jsxs)(`div`,{style:{padding:`14px 16px`,borderRadius:15,background:`#FFFFFF`,border:`1px solid rgba(212,175,55,0.22)`,boxShadow:`0 2px 10px rgba(0,0,0,0.02)`,display:`flex`,alignItems:`flex-start`,gap:12},children:[(0,s.jsx)(`div`,{style:{width:38,height:38,borderRadius:11,background:`linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)`,display:`flex`,alignItems:`center`,justifyContent:`center`,color:`#0284C7`,flexShrink:0,boxShadow:`0 2px 8px rgba(2,132,199,0.15)`},children:(0,s.jsx)(`svg`,{width:`20`,height:`20`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,s.jsx)(`path`,{d:`M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z`})})}),(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`span`,{style:{fontSize:11,fontWeight:700,color:`#64748B`,textTransform:`uppercase`,letterSpacing:`0.4px`,display:`block`},children:`Alimentation en Eau`}),(0,s.jsxs)(`strong`,{style:{fontSize:13.5,color:`#0F172A`,fontWeight:700,display:`block`,marginTop:2},children:[m.water_source===`FORAGE`&&`Forage privé permanent`,m.water_source===`FORAGE_CAMWATER`&&`Double source (Forage + CAMWATER)`,m.water_source===`CAMWATER`&&`Réseau public CAMWATER`,m.water_source===`CITERNE`&&`Citerne / Réserve d’eau`,!m.water_source&&(m.water?`Eau courante disponible`:`À vérifier sur place`)]}),(0,s.jsxs)(`span`,{style:{fontSize:11,color:`#16A34A`,fontWeight:600,display:`inline-flex`,alignItems:`center`,gap:4,marginTop:3},children:[(0,s.jsx)(`svg`,{width:`12`,height:`12`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.5`,children:(0,s.jsx)(`polyline`,{points:`20 6 9 17 4 12`})}),m.water_source?.includes(`FORAGE`)?`Zéro coupure prolongée`:`Pression contrôlée`]})]})]}),(0,s.jsxs)(`div`,{style:{padding:`14px 16px`,borderRadius:15,background:`#FFFFFF`,border:`1px solid rgba(212,175,55,0.22)`,boxShadow:`0 2px 10px rgba(0,0,0,0.02)`,display:`flex`,alignItems:`flex-start`,gap:12},children:[(0,s.jsx)(`div`,{style:{width:38,height:38,borderRadius:11,background:`linear-gradient(135deg, #FEF9C3 0%, #FEF08A 100%)`,display:`flex`,alignItems:`center`,justifyContent:`center`,color:`#CA8A04`,flexShrink:0,boxShadow:`0 2px 8px rgba(202,138,4,0.18)`},children:(0,s.jsx)(`svg`,{width:`20`,height:`20`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,s.jsx)(`polygon`,{points:`13 2 3 14 12 14 11 22 21 10 12 10 13 2`})})}),(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`span`,{style:{fontSize:11,fontWeight:700,color:`#64748B`,textTransform:`uppercase`,letterSpacing:`0.4px`,display:`block`},children:e(`property_detail.specs_electricity`,`Électricité & Compteur`)}),(0,s.jsxs)(`strong`,{style:{fontSize:13.5,color:`#0F172A`,fontWeight:700,display:`block`,marginTop:2},children:[m.electricity_type===`PREPAYE`&&`Compteur individuel prépayé`,m.electricity_type===`POSTPAYE`&&`Compteur classique (Postpayé)`,m.electricity_type===`PARTAGE`&&`Compteur divisionnaire`,m.electricity_type===`SOLAIRE`&&`Solaire / Groupe de secours`,!m.electricity_type&&(m.electricity?`Électricité raccordée`:`Raccordement en cours`)]}),(0,s.jsxs)(`span`,{style:{fontSize:11,color:`#16A34A`,fontWeight:600,display:`inline-flex`,alignItems:`center`,gap:4,marginTop:3},children:[(0,s.jsx)(`svg`,{width:`12`,height:`12`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.5`,children:(0,s.jsx)(`polyline`,{points:`20 6 9 17 4 12`})}),m.electricity_type===`PREPAYE`?`Maîtrise totale de votre consommation`:`Alimentation standard`]})]})]}),(0,s.jsxs)(`div`,{style:{padding:`14px 16px`,borderRadius:15,background:`#FFFFFF`,border:`1px solid rgba(212,175,55,0.22)`,boxShadow:`0 2px 10px rgba(0,0,0,0.02)`,display:`flex`,alignItems:`flex-start`,gap:12},children:[(0,s.jsx)(`div`,{style:{width:38,height:38,borderRadius:11,background:`linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)`,display:`flex`,alignItems:`center`,justifyContent:`center`,color:`#475569`,flexShrink:0,boxShadow:`0 2px 8px rgba(71,85,105,0.12)`},children:(0,s.jsxs)(`svg`,{width:`20`,height:`20`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,s.jsx)(`line`,{x1:`4`,y1:`21`,x2:`8`,y2:`3`}),(0,s.jsx)(`line`,{x1:`20`,y1:`21`,x2:`16`,y2:`3`}),(0,s.jsx)(`line`,{x1:`12`,y1:`17`,x2:`12`,y2:`19`}),(0,s.jsx)(`line`,{x1:`12`,y1:`11`,x2:`12`,y2:`13`}),(0,s.jsx)(`line`,{x1:`12`,y1:`5`,x2:`12`,y2:`7`})]})}),(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`span`,{style:{fontSize:11,fontWeight:700,color:`#64748B`,textTransform:`uppercase`,letterSpacing:`0.4px`,display:`block`},children:e(`property_detail.specs_road`,`Accès Routier`)}),(0,s.jsxs)(`strong`,{style:{fontSize:13.5,color:`#0F172A`,fontWeight:700,display:`block`,marginTop:2},children:[m.road_access===`GOUDRON_DIRECT`&&`Goudron direct jusqu’à la barrière`,m.road_access===`PISTE_PROCHE`&&`Piste aménagée (${m.distance_goudron?m.distance_goudron+` m`:`< 100 m`} du goudron)`,m.road_access===`PISTE_MOYENNE`&&`Piste carrossable (${m.distance_goudron?m.distance_goudron+` m`:`100m à 500m`})`,m.road_access===`PISTE_DIFFICILE`&&`Piste en terre (> 500 m)`,!m.road_access&&(m.distance_goudron?`À ${m.distance_goudron} m du goudron`:`Accès praticable toute saison`)]}),(0,s.jsx)(`span`,{style:{fontSize:11,color:`#475569`,fontWeight:600,display:`inline-flex`,alignItems:`center`,gap:4,marginTop:3},children:m.road_access===`GOUDRON_DIRECT`?`Accès véhicule bas garanti`:`Accessible moto & voiture`})]})]}),(0,s.jsxs)(`div`,{style:{padding:`14px 16px`,borderRadius:15,background:`#FFFFFF`,border:`1px solid rgba(212,175,55,0.22)`,boxShadow:`0 2px 10px rgba(0,0,0,0.02)`,display:`flex`,alignItems:`flex-start`,gap:12},children:[(0,s.jsx)(`div`,{style:{width:38,height:38,borderRadius:11,background:`linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)`,display:`flex`,alignItems:`center`,justifyContent:`center`,color:`#16A34A`,flexShrink:0,boxShadow:`0 2px 8px rgba(22,163,74,0.15)`},children:(0,s.jsxs)(`svg`,{width:`20`,height:`20`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,s.jsx)(`path`,{d:`M5 12.55a11 11 0 0 1 14.08 0`}),(0,s.jsx)(`path`,{d:`M1.42 9a16 16 0 0 1 21.16 0`}),(0,s.jsx)(`path`,{d:`M8.53 16.11a6 6 0 0 1 6.95 0`}),(0,s.jsx)(`line`,{x1:`12`,y1:`20`,x2:`12.01`,y2:`20`})]})}),(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`span`,{style:{fontSize:11,fontWeight:700,color:`#64748B`,textTransform:`uppercase`,letterSpacing:`0.4px`,display:`block`},children:`Réseau Télécoms`}),(0,s.jsxs)(`strong`,{style:{fontSize:13.5,color:`#0F172A`,fontWeight:700,display:`block`,marginTop:2},children:[m.network_quality===`EXCELLENT`&&`MTN & Orange 4G/5G parfaits`,m.network_quality===`BON`&&`Réseau mobile stable`,m.network_quality===`MOYEN`&&`Réseau moyen à l’intérieur`,!m.network_quality&&`Couverture MTN & Orange`]}),(0,s.jsx)(`span`,{style:{fontSize:11,color:`#16A34A`,fontWeight:600,display:`inline-flex`,alignItems:`center`,gap:4,marginTop:3},children:`Appels & Internet fluides`})]})]}),(0,s.jsxs)(`div`,{style:{padding:`14px 16px`,borderRadius:15,background:`#FFFFFF`,border:`1px solid rgba(212,175,55,0.22)`,boxShadow:`0 2px 10px rgba(0,0,0,0.02)`,display:`flex`,alignItems:`flex-start`,gap:12},children:[(0,s.jsx)(`div`,{style:{width:38,height:38,borderRadius:11,background:`linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)`,display:`flex`,alignItems:`center`,justifyContent:`center`,color:`#D97706`,flexShrink:0,boxShadow:`0 2px 8px rgba(217,119,6,0.15)`},children:(0,s.jsxs)(`svg`,{width:`20`,height:`20`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,s.jsx)(`rect`,{x:`3`,y:`4`,width:`18`,height:`12`,rx:`2`}),(0,s.jsx)(`path`,{d:`M7 16v4`}),(0,s.jsx)(`path`,{d:`M17 16v4`}),(0,s.jsx)(`circle`,{cx:`7`,cy:`11`,r:`1.5`}),(0,s.jsx)(`circle`,{cx:`17`,cy:`11`,r:`1.5`})]})}),(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`span`,{style:{fontSize:11,fontWeight:700,color:`#64748B`,textTransform:`uppercase`,letterSpacing:`0.4px`,display:`block`},children:`Disponibilité Transports`}),(0,s.jsxs)(`strong`,{style:{fontSize:13.5,color:`#0F172A`,fontWeight:700,display:`block`,marginTop:2},children:[m.transport_access===`DEPOT_MOTO_IMMEDIAT`&&`Motos & Taxis à la porte`,m.transport_access===`MARCHE_COURTE`&&`Ligne de taxi à < 5 min`,m.transport_access===`ELOIGNE`&&`Zone résidentielle calme`,!m.transport_access&&`Secteur accessible`]}),(0,s.jsx)(`span`,{style:{fontSize:11,color:`#D97706`,fontWeight:600,display:`inline-flex`,alignItems:`center`,gap:4,marginTop:3},children:`Déplacements simples au quotidien`})]})]}),(0,s.jsxs)(`div`,{style:{padding:`14px 16px`,borderRadius:15,background:`#FFFFFF`,border:`1px solid rgba(212,175,55,0.22)`,boxShadow:`0 2px 10px rgba(0,0,0,0.02)`,display:`flex`,alignItems:`flex-start`,gap:12},children:[(0,s.jsx)(`div`,{style:{width:38,height:38,borderRadius:11,background:`linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)`,display:`flex`,alignItems:`center`,justifyContent:`center`,color:`#9333EA`,flexShrink:0,boxShadow:`0 2px 8px rgba(147,51,234,0.15)`},children:(0,s.jsx)(`svg`,{width:`20`,height:`20`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,s.jsx)(`path`,{d:`M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z`})})}),(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`span`,{style:{fontSize:11,fontWeight:700,color:`#64748B`,textTransform:`uppercase`,letterSpacing:`0.4px`,display:`block`},children:`Sérénité & Climat`}),(0,s.jsxs)(`strong`,{style:{fontSize:13.5,color:`#0F172A`,fontWeight:700,display:`block`,marginTop:2},children:[m.flood_risk===`NUL`&&`Risque nul (Zone en hauteur)`,m.flood_risk===`FAIBLE`&&`Zone bien drainée`,m.flood_risk===`MOYEN`&&`Zone basse`,!m.flood_risk&&`Terrain stable`]}),(0,s.jsx)(`span`,{style:{fontSize:11,color:`#16A34A`,fontWeight:600,display:`inline-flex`,alignItems:`center`,gap:4,marginTop:3},children:`Protection saison des pluies`})]})]})]})]}),(0,s.jsxs)(`div`,{className:`detail-card`,children:[(0,s.jsxs)(`h2`,{className:`dsection-title`,children:[(0,s.jsx)(`i`,{className:`fas fa-map-location-dot`,style:{color:`var(--or-d)`,fontSize:16}}),`Localisation`]}),(0,s.jsxs)(`p`,{className:`dmap-sub`,children:[(0,s.jsx)(`strong`,{style:{color:`var(--noir, #0F0D09)`},children:Rn}),` — la position exacte est communiquée après confirmation de la demande de visite.`]}),(0,s.jsx)(`button`,{type:`button`,className:`itineraire-btn`,onClick:Ln,disabled:Ie,children:Ie?(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)(`svg`,{viewBox:`0 0 24 24`,width:`18`,height:`18`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,style:{animation:`spin 1s linear infinite`},children:[(0,s.jsx)(`circle`,{cx:`12`,cy:`12`,r:`10`,strokeOpacity:`0.25`}),(0,s.jsx)(`path`,{d:`M12 2a10 10 0 0 1 10 10`})]}),(0,s.jsx)(`span`,{children:`Localisation en cours…`})]}):Re?(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(`i`,{className:`fas fa-location-arrow`}),(0,s.jsx)(`span`,{children:`Recalculer l'itinéraire depuis ma position`})]}):(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(`i`,{className:`fas fa-location-arrow`}),(0,s.jsx)(`span`,{children:`Itinéraire depuis ma position`})]})}),Be&&(0,s.jsx)(`div`,{className:`itineraire-info ${Be.type}`,children:Be.message}),(0,s.jsxs)(`div`,{className:`detail-map`,style:{position:`relative`,borderRadius:`16px`,overflow:`hidden`,height:`360px`,border:`1px solid #E8E4DC`,zIndex:1},children:[(0,s.jsx)(`div`,{ref:Ne,style:{width:`100%`,height:`100%`,filter:!u||!l?`blur(8px)`:`none`,pointerEvents:!u||!l?`none`:`auto`}}),!Pe&&(0,s.jsxs)(`div`,{style:{position:`absolute`,inset:0,background:`#E8E4DC`,display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,color:`#64605A`,gap:10,zIndex:10},children:[(0,s.jsx)(`svg`,{viewBox:`0 0 24 24`,width:`36`,height:`36`,fill:`var(--or, #D4AF37)`,stroke:`#0F0D09`,strokeWidth:`1.5`,children:(0,s.jsx)(`path`,{d:`M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z`})}),(0,s.jsx)(`span`,{style:{fontSize:14,fontWeight:600,fontFamily:`'Poppins', sans-serif`},children:`Chargement de la carte satellite Google Maps…`})]}),(!u||!l)&&(0,s.jsxs)(`div`,{style:{position:`absolute`,inset:0,zIndex:20,background:`rgba(15, 13, 9, 0.65)`,backdropFilter:`blur(5px)`,display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,padding:`24px`,textAlign:`center`,color:`#fff`},children:[(0,s.jsx)(`div`,{style:{width:52,height:52,borderRadius:`50%`,background:`rgba(212,175,55,0.22)`,color:`#F6D365`,display:`flex`,alignItems:`center`,justifyContent:`center`,fontSize:22,marginBottom:12,border:`1.5px solid rgba(212,175,55,0.4)`,boxShadow:`0 0 16px rgba(212,175,55,0.3)`},children:`🔒`}),(0,s.jsx)(`h4`,{style:{fontFamily:`Poppins, sans-serif`,fontSize:17,fontWeight:800,margin:`0 0 6px 0`,color:`#fff`},children:`Localisation protégée`}),(0,s.jsx)(`p`,{style:{fontSize:13.5,color:`rgba(255,255,255,0.85)`,margin:`0 0 16px 0`,maxWidth:340,lineHeight:1.5},children:`Connectez-vous pour débloquer la carte satellite interactive et l'itinéraire depuis votre position.`}),(0,s.jsx)(`button`,{type:`button`,onClick:()=>d(`/login`,{state:{from:`/properties/${n}`}}),style:{padding:`11px 24px`,borderRadius:12,background:`linear-gradient(135deg, #D4AF37, #F6D365)`,border:0,color:`#0F0D09`,fontWeight:800,fontSize:13.5,cursor:`pointer`,fontFamily:`Poppins, sans-serif`,boxShadow:`0 4px 15px rgba(212,175,55,0.4)`},children:`Se connecter pour voir la carte`})]})]}),(0,s.jsxs)(`div`,{className:`poi-section`,children:[(0,s.jsxs)(`div`,{className:`poi-header-row`,children:[(0,s.jsxs)(`h3`,{className:`poi-title`,children:[(0,s.jsx)(`i`,{className:`fas fa-street-view`,style:{color:`var(--or-d)`}}),(0,s.jsx)(`span`,{children:`Commodités & Proximité`})]}),(0,s.jsxs)(`div`,{className:`poi-mode-tabs`,children:[(0,s.jsxs)(`button`,{type:`button`,className:`poi-mode-tab ${W===`walk`?`active`:``}`,onClick:()=>an(`walk`),children:[(0,s.jsx)(`i`,{className:`fas fa-person-walking`}),(0,s.jsx)(`span`,{children:`À pied`})]}),(0,s.jsxs)(`button`,{type:`button`,className:`poi-mode-tab ${W===`drive`?`active`:``}`,onClick:()=>an(`drive`),children:[(0,s.jsx)(`i`,{className:`fas fa-car-side`}),(0,s.jsx)(`span`,{children:`En voiture / Taxi`})]})]})]}),(0,s.jsxs)(`div`,{className:`poi-grid`,children:[(0,s.jsxs)(`div`,{className:`poi-card`,children:[(0,s.jsx)(`div`,{className:`poi-icon-box`,children:(0,s.jsx)(`i`,{className:`fas fa-graduation-cap`})}),(0,s.jsxs)(`div`,{className:`poi-info`,children:[(0,s.jsx)(`span`,{className:`poi-name`,children:`Écoles & Universités`}),(0,s.jsx)(`span`,{className:`poi-sub`,children:`Campus & Collèges`})]}),(0,s.jsx)(`span`,{className:`poi-time-pill`,children:W===`walk`?`5 min`:`2 min`})]}),(0,s.jsxs)(`div`,{className:`poi-card`,children:[(0,s.jsx)(`div`,{className:`poi-icon-box`,children:(0,s.jsx)(`i`,{className:`fas fa-basket-shopping`})}),(0,s.jsxs)(`div`,{className:`poi-info`,children:[(0,s.jsx)(`span`,{className:`poi-name`,children:`Supermarché & Marché`}),(0,s.jsx)(`span`,{className:`poi-sub`,children:`Commerces vivres`})]}),(0,s.jsx)(`span`,{className:`poi-time-pill`,children:W===`walk`?`3 min`:`1 min`})]}),(0,s.jsxs)(`div`,{className:`poi-card`,children:[(0,s.jsx)(`div`,{className:`poi-icon-box`,children:(0,s.jsx)(`i`,{className:`fas fa-kit-medical`})}),(0,s.jsxs)(`div`,{className:`poi-info`,children:[(0,s.jsx)(`span`,{className:`poi-name`,children:`Pharmacie & Soins`}),(0,s.jsx)(`span`,{className:`poi-sub`,children:`Cliniques de garde`})]}),(0,s.jsx)(`span`,{className:`poi-time-pill`,children:W===`walk`?`7 min`:`3 min`})]}),(0,s.jsxs)(`div`,{className:`poi-card`,children:[(0,s.jsx)(`div`,{className:`poi-icon-box`,children:(0,s.jsx)(`i`,{className:`fas fa-taxi`})}),(0,s.jsxs)(`div`,{className:`poi-info`,children:[(0,s.jsx)(`span`,{className:`poi-name`,children:`Axe & Dépôt Taxi`}),(0,s.jsx)(`span`,{className:`poi-sub`,children:`Transports urbains`})]}),(0,s.jsx)(`span`,{className:`poi-time-pill`,children:W===`walk`?`2 min`:`1 min`})]}),(0,s.jsxs)(`div`,{className:`poi-card`,children:[(0,s.jsx)(`div`,{className:`poi-icon-box`,children:(0,s.jsx)(`i`,{className:`fas fa-utensils`})}),(0,s.jsxs)(`div`,{className:`poi-info`,children:[(0,s.jsx)(`span`,{className:`poi-name`,children:`Restaurants & Cafés`}),(0,s.jsx)(`span`,{className:`poi-sub`,children:`Boulangeries, snacks`})]}),(0,s.jsx)(`span`,{className:`poi-time-pill`,children:W===`walk`?`4 min`:`2 min`})]}),(0,s.jsxs)(`div`,{className:`poi-card`,children:[(0,s.jsx)(`div`,{className:`poi-icon-box`,children:(0,s.jsx)(`i`,{className:`fas fa-building-columns`})}),(0,s.jsxs)(`div`,{className:`poi-info`,children:[(0,s.jsx)(`span`,{className:`poi-name`,children:`Banques & Guichets`}),(0,s.jsx)(`span`,{className:`poi-sub`,children:`DAB & Agences Express`})]}),(0,s.jsx)(`span`,{className:`poi-time-pill`,children:W===`walk`?`6 min`:`2 min`})]})]})]})]})]}),(0,s.jsx)(`div`,{className:`detail-sidebar`,children:(0,s.jsxs)(`div`,{className:`contact-card`,children:[(0,s.jsxs)(`div`,{className:`contact-agence`,children:[(0,s.jsxs)(`div`,{style:{width:64,height:64,borderRadius:`50%`,background:`#1A1A1A`,color:`#D4AF37`,display:`flex`,alignItems:`center`,justifyContent:`center`,fontSize:22,fontWeight:`bold`,margin:`0 auto 10px`,border:`2px solid rgba(212,175,55,0.4)`,boxShadow:`0 4px 14px rgba(0,0,0,0.1)`},children:[m.owner?.first_name?.[0],m.owner?.last_name?.[0]||`P`]}),(0,s.jsxs)(`div`,{className:`contact-name`,children:[m.owner?.first_name||`Bailleur Piolo`,` `,m.owner?.last_name||``]}),(0,s.jsxs)(`div`,{className:`contact-role`,children:[(0,s.jsx)(`i`,{className:`fas fa-bolt`,style:{color:`var(--or-d)`,marginRight:4}}),`Répond en moins de 2h`]})]}),(0,s.jsxs)(`div`,{className:`contact-verified ${Wn}`,children:[(0,s.jsx)(`i`,{className:Hn>=3?`fas fa-crown`:Un?`fas fa-circle-check`:`fas fa-shield-halved`}),(0,s.jsx)(`span`,{children:Hn>=3?`Bailleur Premium`:Un?`Bailleur Vérifié`:`Bailleur Partenaire`})]}),m.status===`RENTED`&&!$?(0,s.jsx)(`div`,{style:{padding:`13px 14px`,borderRadius:12,background:`rgba(184,50,50,.08)`,border:`1px solid rgba(184,50,50,.22)`,color:`#9F2D2D`,fontFamily:`Poppins, sans-serif`,fontSize:13,fontWeight:700,textAlign:`center`},children:`Logement déjà loué`}):$?(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)(i,{to:`/properties/${m.slug||m.id}/update`,className:`cbtn cbtn-primary`,style:{marginBottom:12},children:[(0,s.jsx)(`i`,{className:`fas fa-edit`}),`Modifier l'annonce`]}),(0,s.jsxs)(`button`,{className:`cbtn cbtn-outline`,style:{borderColor:`#C0392B`,color:`#C0392B`},children:[(0,s.jsx)(`i`,{className:`fas fa-box-archive`}),`Archiver l'annonce`]})]}):m.transaction_type===`COURTE_DUREE`?(0,s.jsxs)(`div`,{style:{background:`linear-gradient(145deg, #F0FDF4 0%, #ECFDF5 100%)`,border:`1.5px solid rgba(16, 185, 129, 0.4)`,borderRadius:16,padding:16,marginBottom:14,boxShadow:`0 4px 14px rgba(5,150,105,0.06)`},children:[(0,s.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginBottom:12},children:[(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`span`,{style:{fontSize:11,fontWeight:800,textTransform:`uppercase`,color:`#059669`,letterSpacing:`0.5px`,display:`block`},children:`Réservation Séjour`}),(0,s.jsxs)(`span`,{style:{fontSize:20,fontWeight:800,color:`#065F46`,fontFamily:`Poppins, sans-serif`},children:[new Intl.NumberFormat(`fr-FR`).format(m.price||0),` `,(0,s.jsx)(`span`,{style:{fontSize:13,fontWeight:600},children:`FCFA / nuit`})]})]}),(0,s.jsxs)(`span`,{style:{background:`#D1FAE5`,color:`#065F46`,fontSize:11,fontWeight:700,padding:`3px 8px`,borderRadius:20},children:[(0,s.jsx)(`i`,{className:`fas fa-bolt`,style:{color:`#10B981`,marginRight:4}}),` Immédiat`]})]}),(0,s.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:8,background:`#fff`,padding:`8px 10px`,borderRadius:12,border:`1px solid rgba(16, 185, 129, 0.3)`,marginBottom:10},children:[(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`label`,{style:{fontSize:10,fontWeight:700,textTransform:`uppercase`,color:`#6B7280`,display:`block`,marginBottom:2},children:`Arrivée`}),(0,s.jsx)(`input`,{type:`date`,min:C,value:w,onChange:e=>pt(e.target.value),style:{width:`100%`,border:`none`,background:`transparent`,fontSize:12,fontWeight:700,color:`#111827`,outline:`none`}})]}),(0,s.jsxs)(`div`,{style:{borderLeft:`1px solid #E5E7EB`,paddingLeft:8},children:[(0,s.jsx)(`label`,{style:{fontSize:10,fontWeight:700,textTransform:`uppercase`,color:`#6B7280`,display:`block`,marginBottom:2},children:`Départ`}),(0,s.jsx)(`input`,{type:`date`,min:w||C,value:T,onChange:e=>mt(e.target.value),style:{width:`100%`,border:`none`,background:`transparent`,fontSize:12,fontWeight:700,color:`#111827`,outline:`none`}})]})]}),(0,s.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,background:`#fff`,padding:`8px 10px`,borderRadius:12,border:`1px solid rgba(16, 185, 129, 0.3)`,marginBottom:12},children:[(0,s.jsxs)(`span`,{style:{fontSize:12,fontWeight:600,color:`#374151`},children:[(0,s.jsx)(`i`,{className:`fas fa-users`,style:{color:`#10B981`,marginRight:6}}),`Voyageurs`]}),(0,s.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:8},children:[(0,s.jsx)(`button`,{type:`button`,onClick:()=>ht(e=>Math.max(1,e-1)),style:{width:26,height:26,borderRadius:6,border:`1px solid #D1D5DB`,background:`#F9FAFB`,cursor:`pointer`,fontWeight:800},children:`-`}),(0,s.jsx)(`span`,{style:{fontSize:13,fontWeight:800,minWidth:16,textAlign:`center`},children:E}),(0,s.jsx)(`button`,{type:`button`,onClick:()=>ht(e=>Math.min(8,e+1)),style:{width:26,height:26,borderRadius:6,border:`1px solid #D1D5DB`,background:`#F9FAFB`,cursor:`pointer`,fontWeight:800},children:`+`})]})]}),A&&(0,s.jsxs)(`div`,{style:{background:`#FEF2F2`,color:`#991B1B`,border:`1px solid #FCA5A5`,borderRadius:10,padding:`8px 10px`,fontSize:11,fontWeight:700,marginBottom:10,display:`flex`,alignItems:`center`,gap:6},children:[(0,s.jsx)(`i`,{className:`fas fa-calendar-xmark`,style:{color:`#DC2626`}}),(0,s.jsx)(`span`,{children:`Dates indisponibles ou déjà réservées sur ce bien.`})]}),(0,s.jsxs)(`button`,{type:`button`,className:`cbtn cbtn-primary`,onClick:yn,disabled:A,style:{width:`100%`,background:A?`#9CA3AF`:`linear-gradient(135deg, #059669 0%, #10B981 100%)`,color:`#fff`,border:`none`,padding:`13px 16px`,borderRadius:12,fontSize:14,fontWeight:800,cursor:A?`not-allowed`:`pointer`,display:`flex`,alignItems:`center`,justifyContent:`center`,gap:8,boxShadow:A?`none`:`0 4px 14px rgba(5,150,105,0.35)`,marginBottom:8,transition:`all 0.2s ease`,opacity:A?.7:1},children:[(0,s.jsx)(`i`,{className:A?`fas fa-lock`:`fas fa-calendar-check`}),A?`Dates indisponibles`:`Réserver ce séjour (${new Intl.NumberFormat(`fr-FR`).format(k)} F)`]}),(0,s.jsxs)(`div`,{style:{background:`rgba(255,255,255,0.7)`,borderRadius:10,padding:`10px 12px`,marginBottom:12,fontSize:12,display:`flex`,flexDirection:`column`,gap:6},children:[(0,s.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,color:`#4B5563`},children:[(0,s.jsxs)(`span`,{children:[new Intl.NumberFormat(`fr-FR`).format(m.price||0),` F × `,O,` nuit`,O>1?`s`:``]}),(0,s.jsxs)(`span`,{style:{fontWeight:700,color:`#111827`},children:[new Intl.NumberFormat(`fr-FR`).format(k),` FCFA`]})]}),(0,s.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,color:`#059669`,fontSize:11.5},children:[(0,s.jsxs)(`span`,{children:[(0,s.jsx)(`i`,{className:`fas fa-check-circle`,style:{marginRight:4}}),` Eau, Élec, Wi-Fi`]}),(0,s.jsx)(`span`,{style:{fontWeight:700},children:`Inclus`})]}),(0,s.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,borderTop:`1px dashed #D1D5DB`,paddingTop:6,fontSize:13,fontWeight:800,color:`#065F46`},children:[(0,s.jsx)(`span`,{children:`Total estimé`}),(0,s.jsxs)(`span`,{children:[new Intl.NumberFormat(`fr-FR`).format(k),` FCFA`]})]})]}),(0,s.jsxs)(`button`,{type:`button`,onClick:Z,style:{width:`100%`,padding:`9px`,borderRadius:10,background:`#fff`,color:`#374151`,border:`1px solid #D1D5DB`,fontSize:12,fontWeight:600,cursor:`pointer`,display:`flex`,alignItems:`center`,justifyContent:`center`,gap:6},children:[(0,s.jsx)(`i`,{className:`fas fa-comment-dots`,style:{color:`#059669`}}),`Poser une question à l'hôte`]})]}):(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)(`button`,{type:`button`,className:`cbtn cbtn-primary`,onClick:Z,children:[(0,s.jsx)(`i`,{className:`fas fa-comment-dots`}),m.transaction_type===`VENTE`?`Contacter le vendeur`:`Contacter le bailleur`]}),(0,s.jsxs)(`button`,{type:`button`,className:`cbtn cbtn-outline`,onClick:gn,children:[(0,s.jsx)(`i`,{className:`fas fa-calendar-check`}),`Demander une visite`]}),m.transaction_type===`LOCATION`&&(0,s.jsxs)(`button`,{type:`button`,className:`cbtn cbtn-ghost`,onClick:_n,children:[(0,s.jsx)(`i`,{className:`fas fa-file-contract`}),`Faire une demande de location`]}),m.transaction_type===`VENTE`&&(0,s.jsxs)(`button`,{type:`button`,className:`cbtn cbtn-ghost`,onClick:Z,style:{background:`rgba(29, 78, 216, 0.08)`,color:`#1D4ED8`,border:`1.5px solid #3B82F6`,fontWeight:700},children:[(0,s.jsx)(`i`,{className:`fas fa-handshake`}),`Faire une offre d'achat`]})]}),(0,s.jsxs)(`div`,{className:`contact-share`,children:[(0,s.jsx)(`span`,{children:e(`property_detail.share_property_label`,`Partager le bien :`)}),(0,s.jsx)(`a`,{href:`#`,onClick:e=>{e.preventDefault(),navigator.share?.({title:m.title,url:window.location.href})},children:(0,s.jsx)(`i`,{className:`fas fa-share-nodes`})})]})]})})]}),!(l?.role===`BAILLEUR`||l?.is_bailleur)&&m.similar_properties&&m.similar_properties.length>0&&(0,s.jsxs)(`div`,{className:`similar-properties-section`,children:[(0,s.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:12,marginBottom:20},children:[(0,s.jsx)(`div`,{style:{width:4,height:28,background:`var(--or, #D4AF37)`,borderRadius:4}}),(0,s.jsx)(`h2`,{style:{fontFamily:`'Poppins', sans-serif`,fontSize:22,fontWeight:800,color:`var(--noir, #0F0D09)`,letterSpacing:`-0.4px`,margin:0},children:e(`property_detail.similar_properties_title`,`Biens similaires à découvrir`)})]}),(0,s.jsx)(`div`,{className:`similar-props-grid`,children:m.similar_properties.map(e=>(0,s.jsx)(ue,{property:e,onFavChange:Ze},e.id))})]})]}),(0,s.jsxs)(`div`,{className:`mobile-sticky-action-bar`,children:[(0,s.jsxs)(`div`,{className:`msab-price-col`,children:[(0,s.jsxs)(`div`,{className:`msab-price`,children:[new Intl.NumberFormat(`fr-FR`).format(m.price||0),` FCFA`]}),(0,s.jsx)(`div`,{className:`msab-period`,children:m.transaction_type===`COURTE_DUREE`?`par nuit`:m.transaction_type===`VENTE`?`Prix total`:`par mois`})]}),(0,s.jsx)(`div`,{className:`msab-actions`,children:m.status===`RENTED`&&!$?(0,s.jsx)(`div`,{style:{padding:`8px 12px`,borderRadius:8,background:`rgba(184,50,50,0.15)`,color:`#FF6B6B`,fontSize:12,fontWeight:700},children:`Déjà loué`}):$?(0,s.jsxs)(i,{to:`/properties/${m.slug||m.id}/update`,className:`msab-btn-primary`,style:{textDecoration:`none`},children:[(0,s.jsx)(`i`,{className:`fas fa-edit`,style:{marginRight:5}}),`Modifier`]}):(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(`button`,{type:`button`,className:`msab-btn-msg`,onClick:Z,title:`Message direct au bailleur`,"aria-label":`Envoyer un message`,children:(0,s.jsx)(`i`,{className:`fas fa-comment-dots`})}),(0,s.jsxs)(`button`,{type:`button`,className:`msab-btn-primary`,onClick:gn,children:[(0,s.jsx)(`i`,{className:`fas fa-calendar-check`,style:{marginRight:6}}),`Visiter`]}),m.transaction_type===`LOCATION`&&(0,s.jsxs)(`button`,{type:`button`,className:`msab-btn-dossier`,onClick:_n,style:{padding:`9px 12px`,borderRadius:`10px`,background:`rgba(255, 255, 255, 0.08)`,border:`1px solid rgba(212, 175, 55, 0.4)`,color:`#F6D365`,fontFamily:`'Poppins', sans-serif`,fontSize:`12.5px`,fontWeight:700,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`4px`},children:[(0,s.jsx)(`i`,{className:`fas fa-file-contract`}),`Dossier`]}),m.transaction_type===`COURTE_DUREE`&&(0,s.jsxs)(`button`,{type:`button`,className:`msab-btn-dossier`,onClick:yn,style:{padding:`9px 12px`,borderRadius:`10px`,background:`rgba(5, 150, 105, 0.25)`,border:`1px solid rgba(16, 185, 129, 0.6)`,color:`#34D399`,fontFamily:`'Poppins', sans-serif`,fontSize:`12.5px`,fontWeight:700,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`4px`},children:[(0,s.jsx)(`i`,{className:`fas fa-calendar-alt`}),`Réserver`]}),m.transaction_type===`VENTE`&&(0,s.jsxs)(`button`,{type:`button`,className:`msab-btn-dossier`,onClick:Z,style:{padding:`9px 12px`,borderRadius:`10px`,background:`rgba(29, 78, 216, 0.25)`,border:`1px solid rgba(59, 130, 246, 0.6)`,color:`#93C5FD`,fontFamily:`'Poppins', sans-serif`,fontSize:`12.5px`,fontWeight:700,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`4px`},children:[(0,s.jsx)(`i`,{className:`fas fa-handshake`}),`Offre`]})]})})]}),gt&&(0,s.jsx)(`div`,{className:`dmodal`,onClick:e=>{e.target.className===`dmodal`&&D(!1)},children:(0,s.jsxs)(`div`,{className:`dmodal-content`,style:{maxWidth:480},children:[(0,s.jsx)(`button`,{className:`dmodal-close`,onClick:()=>D(!1),"aria-label":`Fermer`,children:`×`}),(0,s.jsxs)(`div`,{className:`dmodal-header`,style:{color:`#065F46`},children:[(0,s.jsx)(`i`,{className:`fas fa-calendar-check`,style:{color:`#10B981`,marginRight:8,fontSize:18}}),(0,s.jsx)(`span`,{children:`Réserver votre court séjour`})]}),xt?(0,s.jsxs)(`div`,{style:{padding:`24px 20px`,textAlign:`center`},children:[(0,s.jsx)(`div`,{style:{width:56,height:56,borderRadius:`50%`,background:`#D1FAE5`,color:`#059669`,display:`flex`,alignItems:`center`,justifyContent:`center`,fontSize:26,margin:`0 auto 14px`},children:(0,s.jsx)(`i`,{className:`fas fa-check`})}),(0,s.jsx)(`h3`,{style:{fontSize:18,fontWeight:800,color:`#065F46`,marginBottom:8},children:`Demande transmise !`}),(0,s.jsx)(`p`,{style:{fontSize:13,color:`#4B5563`,lineHeight:1.5,marginBottom:16},children:`Votre demande a été envoyée à l'hôte avec vos dates et le calcul du séjour. Redirection vers la messagerie en cours...`})]}):(0,s.jsxs)(`form`,{onSubmit:xn,children:[(0,s.jsxs)(`div`,{className:`loc-panel`,children:[(0,s.jsxs)(`div`,{style:{display:`flex`,gap:12,padding:12,background:`#F0FDF4`,border:`1px solid rgba(16, 185, 129, 0.25)`,borderRadius:12,marginBottom:16,alignItems:`center`},children:[Q[0]&&(0,s.jsx)(`img`,{src:Q[0],alt:`Logement`,style:{width:60,height:60,borderRadius:8,objectFit:`cover`}}),(0,s.jsxs)(`div`,{style:{flex:1,minWidth:0},children:[(0,s.jsx)(`div`,{style:{fontSize:13,fontWeight:800,color:`#111827`,whiteSpace:`nowrap`,overflow:`hidden`,textOverflow:`ellipsis`},children:m.title}),(0,s.jsxs)(`div`,{style:{fontSize:11.5,color:`#059669`,fontWeight:600},children:[m.neighborhood||m.city,` · `,new Intl.NumberFormat(`fr-FR`).format(m.price||0),` FCFA / nuit`]})]})]}),(0,s.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:10,marginBottom:12},children:[(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`label`,{className:`dmodal-label`,style:{fontSize:11,textTransform:`uppercase`,color:`#4B5563`},children:`Arrivée`}),(0,s.jsx)(`input`,{type:`date`,min:C,value:w,onChange:e=>pt(e.target.value),className:`dmodal-input`,style:{padding:`8px 10px`,fontSize:13},required:!0})]}),(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`label`,{className:`dmodal-label`,style:{fontSize:11,textTransform:`uppercase`,color:`#4B5563`},children:`Départ`}),(0,s.jsx)(`input`,{type:`date`,min:w||C,value:T,onChange:e=>mt(e.target.value),className:`dmodal-input`,style:{padding:`8px 10px`,fontSize:13},required:!0})]})]}),(0,s.jsxs)(`div`,{style:{marginBottom:14},children:[(0,s.jsx)(`label`,{className:`dmodal-label`,style:{fontSize:11,textTransform:`uppercase`,color:`#4B5563`},children:`Nombre de voyageurs`}),(0,s.jsx)(`select`,{value:E,onChange:e=>ht(Number(e.target.value)),className:`dmodal-input`,style:{padding:`8px 10px`,fontSize:13},children:[1,2,3,4,5,6,7,8].map(e=>(0,s.jsxs)(`option`,{value:e,children:[e,` voyageur`,e>1?`s`:``]},e))})]}),(0,s.jsxs)(`div`,{style:{background:`#F9FAFB`,border:`1px solid #E5E7EB`,borderRadius:12,padding:`12px 14px`,marginBottom:14},children:[(0,s.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,fontSize:12.5,color:`#4B5563`,marginBottom:4},children:[(0,s.jsx)(`span`,{children:`Durée du séjour :`}),(0,s.jsxs)(`strong`,{style:{color:`#111827`},children:[O,` nuitée`,O>1?`s`:``]})]}),(0,s.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,fontSize:12.5,color:`#4B5563`,marginBottom:4},children:[(0,s.jsx)(`span`,{children:`Tarif par nuitée :`}),(0,s.jsxs)(`span`,{children:[new Intl.NumberFormat(`fr-FR`).format(m.price||0),` FCFA`]})]}),(0,s.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,fontSize:14,fontWeight:800,color:`#065F46`,borderTop:`1px solid #E5E7EB`,paddingTop:8,marginTop:6},children:[(0,s.jsx)(`span`,{children:`Total séjour estimé :`}),(0,s.jsxs)(`span`,{children:[new Intl.NumberFormat(`fr-FR`).format(k),` FCFA`]})]})]}),(0,s.jsxs)(`div`,{style:{marginBottom:14},children:[(0,s.jsx)(`label`,{className:`dmodal-label`,style:{fontSize:11,textTransform:`uppercase`,color:`#4B5563`},children:`Message ou demande spéciale pour l'hôte (optionnel)`}),(0,s.jsx)(`textarea`,{rows:2,className:`dmodal-textarea`,placeholder:`Ex: Arrivée prévue vers 16h, besoin de parking...`,value:_t,onChange:e=>vt(e.target.value),style:{fontSize:12.5}})]}),(0,s.jsxs)(`button`,{type:`button`,onClick:Cn,style:{display:`flex`,alignItems:`center`,justifyContent:`center`,gap:8,width:`100%`,boxSizing:`border-box`,padding:`11px`,borderRadius:10,background:`#25D366`,border:`none`,color:`#fff`,fontSize:13,fontWeight:700,textDecoration:`none`,marginBottom:10,boxShadow:`0 2px 8px rgba(37, 211, 102, 0.3)`,cursor:`pointer`},children:[(0,s.jsx)(`i`,{className:`fab fa-whatsapp`,style:{fontSize:16}}),`Réserver directement sur WhatsApp`]})]}),(0,s.jsxs)(`div`,{className:`dmodal-footer`,style:{borderTop:`1px solid #E5E7EB`,padding:`14px 18px`},children:[(0,s.jsx)(`button`,{type:`button`,className:`dmodal-btn-cancel`,onClick:()=>D(!1),children:`Annuler`}),(0,s.jsx)(`button`,{type:`submit`,disabled:yt||O<=0,className:`dmodal-btn-submit`,style:{background:`linear-gradient(135deg, #059669, #10B981)`,color:`#fff`,boxShadow:`0 4px 12px rgba(5, 150, 105, 0.3)`},children:yt?(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(`i`,{className:`fas fa-spinner fa-spin`}),` Transmission...`]}):(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(`i`,{className:`fas fa-paper-plane`}),` Envoyer la réservation`]})})]})]})]})}),Qe&&(0,s.jsx)(`div`,{className:`dmodal`,onClick:e=>{e.target.className===`dmodal`&&b(!1)},children:(0,s.jsxs)(`div`,{className:`dmodal-content`,children:[(0,s.jsx)(`div`,{className:`dmodal-drag-handle`,"aria-hidden":`true`}),(0,s.jsx)(`button`,{className:`dmodal-close`,onClick:()=>b(!1),"aria-label":`Fermer`,children:`×`}),(0,s.jsxs)(`div`,{className:`dmodal-header`,children:[(0,s.jsx)(`svg`,{width:`22`,height:`22`,viewBox:`0 0 24 24`,fill:`currentColor`,children:(0,s.jsx)(`path`,{d:`M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z`})}),(0,s.jsx)(`span`,{children:`Demander une visite`})]}),(0,s.jsxs)(`div`,{className:`dmodal-scroll-body`,children:[(0,s.jsxs)(`div`,{className:`dmodal-pts-notice`,children:[(0,s.jsx)(`svg`,{width:`18`,height:`18`,viewBox:`0 0 24 24`,fill:`currentColor`,children:(0,s.jsx)(`path`,{d:`M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z`})}),(0,s.jsxs)(`span`,{children:[`Cette demande déduira `,(0,s.jsx)(`strong`,{children:dn?`0 point (Inclus VIP)`:`5 points`}),` de votre solde. Solde actuel : `,(0,s.jsxs)(`strong`,{children:[un,` pts`]})]})]}),(0,s.jsxs)(`form`,{onSubmit:Tn,children:[(0,s.jsxs)(`div`,{className:`loc-panel`,children:[(0,s.jsxs)(`div`,{style:{display:`flex`,gap:6,marginBottom:12,flexWrap:`wrap`},children:[(0,s.jsx)(`button`,{type:`button`,className:`budget-pill-btn`,onClick:()=>ot(Ct(0)),children:`Aujourd'hui`}),(0,s.jsx)(`button`,{type:`button`,className:`budget-pill-btn`,onClick:()=>ot(Ct(1)),children:`Demain`}),(0,s.jsx)(`button`,{type:`button`,className:`budget-pill-btn`,onClick:()=>ot(wt()),children:`Ce samedi`})]}),(0,s.jsxs)(`div`,{className:`dmodal-row`,children:[(0,s.jsxs)(`div`,{className:`dmodal-field`,children:[(0,s.jsx)(`label`,{htmlFor:`visit-date`,children:`Date souhaitée *`}),(0,s.jsx)(`input`,{type:`date`,id:`visit-date`,required:!0,min:C,className:`dmodal-input`,value:at,onChange:e=>ot(e.target.value)})]}),(0,s.jsxs)(`div`,{className:`dmodal-field`,children:[(0,s.jsx)(`label`,{htmlFor:`visit-time`,children:`Heure souhaitée`}),(0,s.jsx)(`input`,{type:`time`,id:`visit-time`,className:`dmodal-input`,value:st,onChange:e=>ct(e.target.value)})]})]}),(0,s.jsxs)(`div`,{className:`dmodal-field`,children:[(0,s.jsx)(`label`,{htmlFor:`visit-message`,children:`Message au bailleur`}),(0,s.jsx)(`textarea`,{id:`visit-message`,rows:`3`,placeholder:`Présentez-vous brièvement, précisez vos disponibilités…`,className:`dmodal-input dmodal-textarea`,value:lt,onChange:e=>ut(e.target.value)})]})]}),it&&(0,s.jsx)(`div`,{className:`dmodal-error`,children:it}),(0,s.jsxs)(`div`,{className:`dmodal-footer`,children:[(0,s.jsx)(`button`,{type:`button`,className:`dmodal-btn-cancel`,onClick:()=>b(!1),children:`Annuler`}),(0,s.jsxs)(`button`,{type:`submit`,className:`dmodal-btn-submit`,disabled:nt,children:[(0,s.jsx)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 24 24`,fill:`currentColor`,children:(0,s.jsx)(`path`,{d:`M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z`})}),nt?`Envoi en cours…`:dn?`Envoyer la demande (Gratuit VIP)`:`Envoyer la demande (−5 pts)`]})]})]})]})]})}),$e&&(0,s.jsx)(`div`,{className:`dmodal`,onClick:e=>{e.target.className===`dmodal`&&x(!1)},children:(0,s.jsxs)(`div`,{className:`dmodal-content dmodal-xl`,children:[(0,s.jsx)(`div`,{className:`dmodal-drag-handle`,"aria-hidden":`true`}),(0,s.jsx)(`button`,{className:`dmodal-close`,onClick:()=>x(!1),"aria-label":`Fermer`,children:`×`}),(0,s.jsxs)(`div`,{className:`dmodal-header`,children:[(0,s.jsx)(`svg`,{width:`22`,height:`22`,viewBox:`0 0 24 24`,fill:`currentColor`,children:(0,s.jsx)(`path`,{d:`M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z`})}),(0,s.jsx)(`span`,{children:`Dossier de location`})]}),(0,s.jsxs)(`div`,{className:`loc-steps`,children:[(0,s.jsxs)(`div`,{className:`loc-step ${j===1?`active`:j>1?`completed`:``}`,onClick:()=>M(1),children:[(0,s.jsx)(`span`,{className:`ls-num`,children:`1`}),(0,s.jsx)(`span`,{className:`ls-lbl`,children:`Infos`})]}),(0,s.jsx)(`div`,{className:`loc-step-line`}),(0,s.jsxs)(`div`,{className:`loc-step ${j===2?`active`:j>2?`completed`:``}`,onClick:()=>{j>=1&&M(2)},children:[(0,s.jsx)(`span`,{className:`ls-num`,children:`2`}),(0,s.jsx)(`span`,{className:`ls-lbl`,children:e(`property_detail.specs_rooms`,`Pièces`)})]}),(0,s.jsx)(`div`,{className:`loc-step-line`}),(0,s.jsxs)(`div`,{className:`loc-step ${j===3?`active`:``}`,onClick:()=>{j>=2&&M(3)},children:[(0,s.jsx)(`span`,{className:`ls-num`,children:`3`}),(0,s.jsx)(`span`,{className:`ls-lbl`,children:`Garant`})]})]}),(0,s.jsxs)(`div`,{className:`dmodal-scroll-body`,children:[(0,s.jsxs)(`div`,{className:`dmodal-pts-notice`,children:[(0,s.jsx)(`svg`,{width:`18`,height:`18`,viewBox:`0 0 24 24`,fill:`currentColor`,children:(0,s.jsx)(`path`,{d:`M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z`})}),(0,s.jsxs)(`span`,{children:[`Cette demande déduira `,(0,s.jsx)(`strong`,{children:dn?`0 point (Inclus VIP)`:`6 points`}),` de votre solde. Solde actuel : `,(0,s.jsxs)(`strong`,{children:[un,` pts`]})]})]}),(0,s.jsxs)(`form`,{onSubmit:e=>e.preventDefault(),children:[j===1&&(0,s.jsxs)(`div`,{className:`loc-panel`,children:[(0,s.jsxs)(`div`,{className:`dmodal-row`,children:[(0,s.jsxs)(`div`,{className:`dmodal-field`,children:[(0,s.jsx)(`label`,{htmlFor:`loc-movein`,children:`Date d'entrée souhaitée *`}),(0,s.jsx)(`input`,{type:`date`,id:`loc-movein`,required:!0,min:C,className:`dmodal-input`,value:P,onChange:e=>Ot(e.target.value)})]}),(0,s.jsxs)(`div`,{className:`dmodal-field`,children:[(0,s.jsx)(`label`,{htmlFor:`loc-duration`,children:`Durée (mois)`}),(0,s.jsxs)(`select`,{id:`loc-duration`,className:`dmodal-input`,value:kt,onChange:e=>At(e.target.value),children:[(0,s.jsx)(`option`,{value:`6`,children:`6 mois`}),(0,s.jsx)(`option`,{value:`12`,children:`12 mois`}),(0,s.jsx)(`option`,{value:`24`,children:`24 mois`}),(0,s.jsx)(`option`,{value:`36`,children:`36 mois`})]})]})]}),(0,s.jsxs)(`div`,{className:`dmodal-row`,children:[(0,s.jsxs)(`div`,{className:`dmodal-field`,children:[(0,s.jsx)(`label`,{htmlFor:`loc-occupants`,children:`Nombre d'occupants`}),(0,s.jsx)(`input`,{type:`number`,id:`loc-occupants`,min:`1`,max:`10`,className:`dmodal-input`,value:jt,onChange:e=>Mt(e.target.value)})]}),(0,s.jsxs)(`div`,{className:`dmodal-field`,children:[(0,s.jsx)(`label`,{htmlFor:`loc-income`,children:`Revenus mensuels (FCFA)`}),(0,s.jsx)(`input`,{type:`number`,id:`loc-income`,placeholder:`Ex: 250000`,className:`dmodal-input`,value:F,onChange:e=>Nt(e.target.value)})]})]}),(0,s.jsxs)(`div`,{className:`dmodal-row`,children:[(0,s.jsxs)(`div`,{className:`dmodal-field`,children:[(0,s.jsx)(`label`,{htmlFor:`loc-profession`,children:`Profession`}),(0,s.jsx)(`input`,{type:`text`,id:`loc-profession`,placeholder:`Ex: Ingénieur, Commerçant…`,className:`dmodal-input`,value:Pt,onChange:e=>Ft(e.target.value)})]}),(0,s.jsxs)(`div`,{className:`dmodal-field`,children:[(0,s.jsx)(`label`,{htmlFor:`loc-employer`,children:`Employeur`}),(0,s.jsx)(`input`,{type:`text`,id:`loc-employer`,placeholder:`Ex: Orange Cameroun`,className:`dmodal-input`,value:I,onChange:e=>It(e.target.value)})]})]}),(0,s.jsxs)(`div`,{className:`dmodal-field`,children:[(0,s.jsx)(`label`,{htmlFor:`loc-message`,children:`Lettre de motivation`}),(0,s.jsx)(`textarea`,{id:`loc-message`,rows:`3`,placeholder:`Présentez-vous, expliquez votre projet de location…`,className:`dmodal-input dmodal-textarea`,value:Lt,onChange:e=>Rt(e.target.value)})]})]}),j===2&&(0,s.jsxs)(`div`,{className:`loc-panel`,children:[(0,s.jsxs)(`div`,{className:`dmodal-hint`,children:[(0,s.jsx)(`svg`,{width:`14`,height:`14`,viewBox:`0 0 24 24`,fill:`currentColor`,style:{verticalAlign:`middle`,marginRight:4},children:(0,s.jsx)(`path`,{d:`M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z`})}),`Formats acceptés : JPG, PNG, PDF — max 5 Mo chacun`]}),(0,s.jsxs)(`div`,{className:`dmodal-upload-row`,children:[(0,s.jsxs)(`div`,{className:`dmodal-upload-zone ${L?`has-file`:``}`,children:[(0,s.jsxs)(`label`,{htmlFor:`loc-cni-front`,children:[(0,s.jsx)(`svg`,{width:`32`,height:`32`,viewBox:`0 0 24 24`,fill:`currentColor`,children:(0,s.jsx)(`path`,{d:`M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 2.75c1.24 0 2.25 1.01 2.25 2.25S13.24 11.25 12 11.25 9.75 10.24 9.75 9s1.01-2.25 2.25-2.25zM20 18H4v-.57c0-.81.48-1.53 1.22-1.85C6.88 14.71 9.36 14 12 14s5.12.71 6.78 1.58c.74.32 1.22 1.04 1.22 1.85V18z`})}),(0,s.jsx)(`span`,{children:`CNI recto *`}),(0,s.jsx)(`small`,{children:`Recto carte d'identité`})]}),(0,s.jsx)(`input`,{type:`file`,id:`loc-cni-front`,accept:`.jpg,.jpeg,.png,.pdf`,className:`visually-hidden`,onChange:e=>zt(e.target.files[0]||null)}),(0,s.jsx)(`div`,{className:`upload-filename`,children:L?L.name:`Aucun fichier`})]}),(0,s.jsxs)(`div`,{className:`dmodal-upload-zone ${R?`has-file`:``}`,children:[(0,s.jsxs)(`label`,{htmlFor:`loc-cni-back`,children:[(0,s.jsx)(`svg`,{width:`32`,height:`32`,viewBox:`0 0 24 24`,fill:`currentColor`,children:(0,s.jsx)(`path`,{d:`M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 2.75c1.24 0 2.25 1.01 2.25 2.25S13.24 11.25 12 11.25 9.75 10.24 9.75 9s1.01-2.25 2.25-2.25zM20 18H4v-.57c0-.81.48-1.53 1.22-1.85C6.88 14.71 9.36 14 12 14s5.12.71 6.78 1.58c.74.32 1.22 1.04 1.22 1.85V18z`})}),(0,s.jsx)(`span`,{children:`CNI verso`}),(0,s.jsx)(`small`,{children:`Verso carte d'identité`})]}),(0,s.jsx)(`input`,{type:`file`,id:`loc-cni-back`,accept:`.jpg,.jpeg,.png,.pdf`,className:`visually-hidden`,onChange:e=>Bt(e.target.files[0]||null)}),(0,s.jsx)(`div`,{className:`upload-filename`,children:R?R.name:`Aucun fichier`})]}),(0,s.jsxs)(`div`,{className:`dmodal-upload-zone ${z?`has-file`:``}`,children:[(0,s.jsxs)(`label`,{htmlFor:`loc-income-proof`,children:[(0,s.jsx)(`svg`,{width:`32`,height:`32`,viewBox:`0 0 24 24`,fill:`currentColor`,children:(0,s.jsx)(`path`,{d:`M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z`})}),(0,s.jsx)(`span`,{children:`Justificatif de revenus`}),(0,s.jsx)(`small`,{children:`Fiche paie, relevé…`})]}),(0,s.jsx)(`input`,{type:`file`,id:`loc-income-proof`,accept:`.jpg,.jpeg,.png,.pdf`,className:`visually-hidden`,onChange:e=>Vt(e.target.files[0]||null)}),(0,s.jsx)(`div`,{className:`upload-filename`,children:z?z.name:`Aucun fichier`})]})]})]}),j===3&&(0,s.jsxs)(`div`,{className:`loc-panel`,children:[(0,s.jsxs)(`label`,{className:`dmodal-toggle`,children:[(0,s.jsx)(`input`,{type:`checkbox`,checked:B,onChange:e=>Ht(e.target.checked)}),(0,s.jsx)(`span`,{children:`J'ai un garant`})]}),B&&(0,s.jsxs)(`div`,{style:{marginTop:16},children:[(0,s.jsxs)(`div`,{className:`dmodal-row`,children:[(0,s.jsxs)(`div`,{className:`dmodal-field`,children:[(0,s.jsx)(`label`,{htmlFor:`guar-name`,children:`Nom complet *`}),(0,s.jsx)(`input`,{type:`text`,id:`guar-name`,className:`dmodal-input`,value:Ut,onChange:e=>Wt(e.target.value)})]}),(0,s.jsxs)(`div`,{className:`dmodal-field`,children:[(0,s.jsx)(`label`,{htmlFor:`guar-phone`,children:`Téléphone`}),(0,s.jsx)(`input`,{type:`tel`,id:`guar-phone`,placeholder:`+237 6XX XXX XXX`,className:`dmodal-input`,value:Gt,onChange:e=>Kt(e.target.value)})]})]}),(0,s.jsxs)(`div`,{className:`dmodal-row`,children:[(0,s.jsxs)(`div`,{className:`dmodal-field`,children:[(0,s.jsx)(`label`,{htmlFor:`guar-relation`,children:`Lien avec le garant`}),(0,s.jsxs)(`select`,{id:`guar-relation`,className:`dmodal-input`,value:qt,onChange:e=>Jt(e.target.value),children:[(0,s.jsx)(`option`,{value:``,children:`Sélectionner...`}),(0,s.jsx)(`option`,{value:`parent`,children:`Parent`}),(0,s.jsx)(`option`,{value:`frere_soeur`,children:`Frère / Sœur`}),(0,s.jsx)(`option`,{value:`conjoint`,children:`Conjoint(e)`}),(0,s.jsx)(`option`,{value:`collegue`,children:`Collègue`}),(0,s.jsx)(`option`,{value:`ami`,children:`Ami(e)`}),(0,s.jsx)(`option`,{value:`autre`,children:`Autre`})]})]}),(0,s.jsxs)(`div`,{className:`dmodal-field`,children:[(0,s.jsx)(`label`,{htmlFor:`guar-income`,children:`Revenus mensuels (FCFA)`}),(0,s.jsx)(`input`,{type:`number`,id:`guar-income`,placeholder:`Ex: 300000`,className:`dmodal-input`,value:V,onChange:e=>Yt(e.target.value)})]})]}),(0,s.jsxs)(`div`,{className:`dmodal-upload-zone ${H?`has-file`:``}`,style:{marginTop:12},children:[(0,s.jsxs)(`label`,{htmlFor:`guar-cni`,children:[(0,s.jsx)(`svg`,{width:`28`,height:`28`,viewBox:`0 0 24 24`,fill:`currentColor`,children:(0,s.jsx)(`path`,{d:`M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z`})}),(0,s.jsx)(`span`,{children:`CNI du garant`})]}),(0,s.jsx)(`input`,{type:`file`,id:`guar-cni`,accept:`.jpg,.jpeg,.png,.pdf`,className:`visually-hidden`,onChange:e=>Xt(e.target.files[0]||null)}),(0,s.jsx)(`div`,{className:`upload-filename`,children:H?H.name:`Aucun fichier`})]})]})]}),(0,s.jsxs)(`div`,{className:`dossier-completion`,children:[(0,s.jsxs)(`div`,{className:`dc-label`,children:[(0,s.jsx)(`span`,{children:`Complétude du dossier`}),(0,s.jsxs)(`span`,{style:{color:`var(--or-d)`,fontSize:13.5,fontWeight:800},children:[hn,`%`]})]}),(0,s.jsx)(`div`,{className:`dc-bar`,children:(0,s.jsx)(`div`,{className:`dc-fill`,style:{width:`${hn}%`}})})]}),Dt&&(0,s.jsx)(`div`,{className:`dmodal-error`,children:Dt}),(0,s.jsxs)(`div`,{className:`dmodal-footer`,children:[j>1&&(0,s.jsxs)(`button`,{type:`button`,className:`dmodal-btn-cancel`,onClick:()=>{N(``),M(e=>e-1)},children:[(0,s.jsx)(`svg`,{width:`14`,height:`14`,viewBox:`0 0 24 24`,fill:`currentColor`,children:(0,s.jsx)(`path`,{d:`M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z`})}),`Précédent`]},`btn-prev`),(0,s.jsx)(`button`,{type:`button`,className:`dmodal-btn-cancel`,onClick:()=>x(!1),children:`Annuler`},`btn-cancel`),j<3?(0,s.jsxs)(`button`,{type:`button`,className:`dmodal-btn-next`,onClick:()=>{if(j===1&&!P){N(`Veuillez renseigner la date d'entrée souhaitée avant de continuer.`);return}N(``),M(e=>e+1)},children:[`Suivant`,(0,s.jsx)(`svg`,{width:`14`,height:`14`,viewBox:`0 0 24 24`,fill:`currentColor`,children:(0,s.jsx)(`path`,{d:`M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z`})})]},`btn-next`):(0,s.jsxs)(`button`,{type:`button`,className:`dmodal-btn-submit`,disabled:Tt,onClick:Dn,children:[(0,s.jsx)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 24 24`,fill:`currentColor`,children:(0,s.jsx)(`path`,{d:`M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z`})}),Tt?`Envoi en cours…`:dn?`Envoyer le dossier (Gratuit VIP)`:`Envoyer le dossier (−6 pts)`]},`btn-submit`)]})]})]})]})}),et&&(0,s.jsxs)(`div`,{style:{position:`fixed`,bottom:28,right:28,background:`#0F0D09`,color:`#fff`,padding:`14px 22px`,borderRadius:14,boxShadow:`0 10px 35px rgba(0,0,0,0.3)`,display:`flex`,alignItems:`center`,gap:12,fontFamily:`Poppins, sans-serif`,fontSize:13.5,fontWeight:600,zIndex:99999,borderLeft:`4px solid #1E7A47`,maxWidth:`400px`,animation:`fadeIn 0.3s ease`},children:[(0,s.jsx)(`svg`,{width:`20`,height:`20`,fill:`#1E7A47`,viewBox:`0 0 24 24`,style:{flexShrink:0},children:(0,s.jsx)(`path`,{d:`M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z`})}),(0,s.jsx)(`span`,{children:et})]}),He&&Q[Ue]&&(0,s.jsxs)(`div`,{className:`image-lightbox`,onClick:()=>v(!1),onTouchStart:Mn,onTouchMove:Nn,onTouchEnd:Pn,children:[(0,s.jsx)(`button`,{type:`button`,className:`lightbox-close`,onClick:()=>v(!1),children:`×`}),(0,s.jsx)(`button`,{type:`button`,className:`lightbox-nav prev`,onClick:An,children:(0,s.jsx)(`svg`,{viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.5`,children:(0,s.jsx)(`polyline`,{points:`15 18 9 12 15 6`})})}),(0,s.jsxs)(`div`,{className:`lightbox-content`,onClick:e=>e.stopPropagation(),children:[(0,s.jsx)(`img`,{src:Q[Ue],alt:`Agrandissement`,className:`lightbox-img`,style:{cursor:`pointer`},onClick:jn,title:`Cliquez pour passer à l'image suivante`}),(0,s.jsxs)(`div`,{className:`lightbox-counter`,children:[Ue+1,` / `,Q.length]})]}),(0,s.jsx)(`button`,{type:`button`,className:`lightbox-nav next`,onClick:jn,children:(0,s.jsx)(`svg`,{viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.5`,children:(0,s.jsx)(`polyline`,{points:`9 18 15 12 9 6`})})})]}),G.length>0&&!sn&&(0,s.jsxs)(`div`,{className:`compare-dock`,children:[(0,s.jsx)(`div`,{className:`compare-dock-count`,children:G.length}),(0,s.jsx)(`div`,{className:`compare-dock-text`,onClick:()=>K(!0),children:G.length===1?`1 bien sélectionné`:`${G.length} biens à comparer`}),(0,s.jsxs)(`button`,{type:`button`,className:`compare-dock-btn`,onClick:()=>K(!0),children:[(0,s.jsx)(`i`,{className:`fas fa-scale-balanced`,style:{marginRight:6}}),`Comparer`]}),(0,s.jsx)(`button`,{type:`button`,className:`compare-dock-close`,onClick:mn,title:`Vider le comparateur`,"aria-label":`Vider le comparateur`,children:(0,s.jsx)(`i`,{className:`fas fa-xmark`})})]}),sn&&(0,s.jsx)(`div`,{className:`dmodal`,onClick:()=>K(!1),children:(0,s.jsxs)(`div`,{className:`dmodal-content dmodal-xl`,onClick:e=>e.stopPropagation(),children:[(0,s.jsxs)(`div`,{className:`dmodal-header`,children:[(0,s.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:10},children:[(0,s.jsx)(`i`,{className:`fas fa-scale-balanced`,style:{color:`var(--or-d)`,fontSize:20}}),(0,s.jsx)(`span`,{children:`Comparateur de Biens Piolo`}),(0,s.jsxs)(`span`,{className:`budget-sim-badge`,children:[G.length,` / 4 biens`]})]}),(0,s.jsx)(`button`,{type:`button`,className:`dmodal-close`,onClick:()=>K(!1),children:`×`})]}),(0,s.jsx)(`div`,{className:`compare-grid-modal`,children:G.map(t=>(0,s.jsxs)(`div`,{className:`compare-col-card ${t.id===m?.id?`current`:``}`,children:[(0,s.jsxs)(`div`,{className:`compare-card-thumb`,children:[t.main_image?(0,s.jsx)(`img`,{src:t.main_image,alt:t.title}):(0,s.jsx)(`div`,{style:{width:`100%`,height:`100%`,background:`#E8E4DC`,display:`flex`,alignItems:`center`,justifyContent:`center`,color:`#999`},children:(0,s.jsx)(`i`,{className:`fas fa-image`,style:{fontSize:32}})}),(0,s.jsx)(`button`,{type:`button`,className:`compare-card-remove`,onClick:()=>pn(t.id),title:`Retirer de la comparaison`,children:(0,s.jsx)(`i`,{className:`fas fa-trash-can`})})]}),(0,s.jsxs)(`div`,{className:`compare-card-content`,children:[(0,s.jsx)(`h4`,{className:`compare-card-title`,children:t.title}),(0,s.jsxs)(`div`,{className:`compare-card-price`,children:[new Intl.NumberFormat(`fr-FR`).format(t.price||0),` FCFA `,t.transaction_type===`LOCATION`?`/mois`:``]}),(0,s.jsxs)(`ul`,{className:`compare-spec-list`,children:[(0,s.jsxs)(`li`,{className:`compare-spec-item`,children:[(0,s.jsx)(`span`,{className:`compare-spec-label`,children:`Type`}),(0,s.jsx)(`span`,{className:`compare-spec-val`,children:t.property_type_display||`Logement`})]}),(0,s.jsxs)(`li`,{className:`compare-spec-item`,children:[(0,s.jsx)(`span`,{className:`compare-spec-label`,children:`Emplacement`}),(0,s.jsxs)(`span`,{className:`compare-spec-val`,children:[t.neighborhood?`${t.neighborhood}, `:``,t.city]})]}),(0,s.jsxs)(`li`,{className:`compare-spec-item`,children:[(0,s.jsx)(`span`,{className:`compare-spec-label`,children:`Surface`}),(0,s.jsxs)(`span`,{className:`compare-spec-val`,children:[t.area||`—`,` m²`]})]}),(0,s.jsxs)(`li`,{className:`compare-spec-item`,children:[(0,s.jsx)(`span`,{className:`compare-spec-label`,children:e(`property_detail.specs_bedrooms`,`Chambres`)}),(0,s.jsx)(`span`,{className:`compare-spec-val`,children:t.bedrooms||`—`})]}),(0,s.jsxs)(`li`,{className:`compare-spec-item`,children:[(0,s.jsx)(`span`,{className:`compare-spec-label`,children:e(`property_detail.specs_bathrooms`,`Salles de bain`)}),(0,s.jsx)(`span`,{className:`compare-spec-val`,children:t.bathrooms||`—`})]}),(0,s.jsxs)(`li`,{className:`compare-spec-item`,children:[(0,s.jsx)(`span`,{className:`compare-spec-label`,children:`Prix / m²`}),(0,s.jsx)(`span`,{className:`compare-spec-val`,children:t.area&&t.price?`${new Intl.NumberFormat(`fr-FR`).format(Math.round(t.price/t.area))} F/m²`:`—`})]})]}),(0,s.jsx)(`div`,{style:{marginTop:`auto`,paddingTop:10},children:t.id===m?.id?(0,s.jsx)(`div`,{style:{textAlign:`center`,padding:`10px 14px`,borderRadius:10,background:`rgba(212,175,55,0.15)`,color:`var(--or-d)`,fontWeight:800,fontSize:12.5,fontFamily:`Poppins, sans-serif`},children:`Bien actuellement affiché`}):(0,s.jsx)(i,{to:`/properties/${t.slug||t.id}`,onClick:()=>K(!1),style:{display:`block`,textAlign:`center`,padding:`10px 14px`,borderRadius:10,background:`linear-gradient(135deg, #D4AF37, #F6D365)`,color:`#0F0D09`,fontWeight:800,fontSize:12.5,textDecoration:`none`,fontFamily:`Poppins, sans-serif`},children:`Voir cette annonce →`})})]})]},t.id))}),(0,s.jsxs)(`div`,{className:`dmodal-footer`,children:[(0,s.jsx)(`button`,{type:`button`,className:`dmodal-btn-cancel`,onClick:mn,children:`Tout effacer`}),(0,s.jsx)(`button`,{type:`button`,className:`dmodal-btn-submit`,onClick:()=>K(!1),children:`Fermer`})]})]})}),xe&&(0,s.jsx)(`div`,{style:{position:`fixed`,inset:0,zIndex:10005,background:`rgba(0,0,0,0.85)`,backdropFilter:`blur(10px)`,display:`flex`,alignItems:`center`,justifyContent:`center`,padding:20},children:(0,s.jsxs)(`div`,{style:{background:`#141210`,border:`1.5px solid rgba(212,175,55,0.4)`,borderRadius:24,padding:`28px 24px`,maxWidth:420,width:`100%`,textAlign:`center`,boxShadow:`0 20px 50px rgba(0,0,0,0.8)`},children:[(0,s.jsx)(`div`,{style:{width:56,height:56,borderRadius:`50%`,background:`rgba(212,175,55,0.15)`,color:`#D4AF37`,display:`flex`,alignItems:`center`,justifyContent:`center`,margin:`0 auto 16px`,border:`1px solid rgba(212,175,55,0.3)`},children:(0,s.jsx)(`svg`,{width:`28`,height:`28`,viewBox:`0 0 24 24`,fill:`currentColor`,children:(0,s.jsx)(`path`,{d:`M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z`})})}),(0,s.jsx)(`h3`,{style:{fontFamily:`'Poppins', sans-serif`,color:`#fff`,fontSize:18,fontWeight:700,marginBottom:10},children:`Compte Locataire Requis`}),(0,s.jsxs)(`p`,{style:{color:`rgba(255,255,255,0.8)`,fontSize:13.5,lineHeight:1.5,marginBottom:24,fontFamily:`'DM Sans', sans-serif`},children:[`En tant que `,be?`professionnel`:`bailleur`,`, pour consulter les coordonnées, contacter le bailleur ou réserver une visite, vous devez créer ou utiliser un compte Locataire.`]}),(0,s.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:10},children:[(0,s.jsx)(`button`,{type:`button`,onClick:()=>d(`/login?tab=register&role=LOCATAIRE`),style:{padding:`12px 20px`,borderRadius:12,border:0,background:`linear-gradient(135deg, #D4AF37, #F6D365)`,color:`#0F0D09`,fontFamily:`'Poppins', sans-serif`,fontWeight:800,fontSize:13.5,cursor:`pointer`,boxShadow:`0 4px 15px rgba(212,175,55,0.4)`},children:`Créer un compte Locataire`}),(0,s.jsx)(`button`,{type:`button`,onClick:()=>p(!1),style:{padding:`12px 20px`,borderRadius:12,border:`1px solid rgba(255,255,255,0.2)`,background:`transparent`,color:`#fff`,fontFamily:`'DM Sans', sans-serif`,fontWeight:600,fontSize:13.5,cursor:`pointer`},children:`Continuer la navigation`})]})]})}),(0,s.jsx)(fe,{isOpen:q.isOpen,actionKey:q.actionKey,targetTitle:q.targetTitle,targetSubtitle:q.targetSubtitle,onConfirm:()=>{let e=q.onConfirmAction;J(e=>({...e,isOpen:!1})),e&&e()},onCancel:()=>J(e=>({...e,isOpen:!1})),onOpenRecharge:()=>{J(e=>({...e,isOpen:!1})),ln(!0)}}),cn&&(0,s.jsx)(pe,{isOpen:cn,onClose:()=>ln(!1)}),(0,s.jsx)(me,{propertyId:m?.id||n,propertyTitle:m?.title||`Votre bien`,isOpen:ve,onClose:()=>ye(!1),initialStep:`tour_360`})]})}export{l as default};