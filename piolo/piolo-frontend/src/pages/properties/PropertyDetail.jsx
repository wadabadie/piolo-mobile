import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import api, { propertiesApi, messagesApi, bookingsApi } from '../../services/api';
import PostPublishBoostModal from '../../components/PostPublishBoostModal';
import { useAuth } from '../../context/AuthContext';
import { SkeletonDetail } from '../../components/SkeletonCard';
import PropertyCard from '../../components/PropertyCard';
import { getMediaUrl } from '../../utils/media';
import PointConfirmationModal from '../../components/PointConfirmationModal';
import TenantSubscriptionModal from '../../components/TenantSubscriptionModal';
import { subscriptionService, POINT_COSTS } from '../../services/subscriptionService';
import { cacheManager } from '../../services/cacheManager';
import SmartImage from '../../components/SmartImage';

const transactionLabel = (type, t) => ({
  LOCATION: t ? t('card.for_rent', 'À louer') : 'À louer',
  VENTE: t ? t('card.for_sale', 'À vendre') : 'À vendre',
  COURTE_DUREE: t ? t('card.short_stay', 'Courte durée') : 'Courte durée',
}[type] || type || '');
const propertyTypeLabel = (property) => property?.property_type_display || String(property?.property_type || '').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()).replaceAll('_', ' ');

// ─── Styles CSS (défini en dehors pour ne pas recréer à chaque render) ─────────
const DETAIL_STYLES = `
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
`;

export default function PropertyDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isBailleur = user?.role === 'BAILLEUR' || user?.is_bailleur;
  const [showPublishBoostModal, setShowPublishBoostModal] = useState(() => searchParams.get('published') === '1');
  const isPro = user?.role === 'PRO' || user?.is_pro || user?.professional_profile;
  const isRestrictedRole = isBailleur || isPro;
  const [roleRestrictionModalOpen, setRoleRestrictionModalOpen] = useState(false);
  const detailHomePath = isBailleur ? '/dashboard/bailleur' : isPro ? '/dashboard/pro' : '/';
  // Un bailleur ou pro reste dans son espace de travail lorsqu'il remonte depuis le fil d'Ariane
  const detailPropertiesPath = isBailleur ? '/dashboard/bailleur#annonces' : isPro ? '/dashboard/pro' : '/properties';

  // ── TOUS les hooks doivent être AVANT tout return conditionnel ────────────────
  const cachedProp = cacheManager.get(`property_detail_${id}`);
  const [property, setProperty] = useState(() => cachedProp || null);
  const [loading,  setLoading]  = useState(() => !cachedProp);
  const [error,    setError]    = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [isFav, setIsFav] = useState(() => cachedProp?.is_favorite || false);
  const [favCount, setFavCount] = useState(() => cachedProp?.favorites_count || 0);

  // Google Maps & Itinéraire States
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [itineraireLoading, setItineraireLoading] = useState(false);
  const [routeOpened, setRouteOpened] = useState(false);
  const [itineraireStatus, setItineraireStatus] = useState(null);

  // Lightbox States
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImgIndex, setLightboxImgIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const mobileThumbsRef = useRef(null);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const toggleSimilarFavorite = async (propertyId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/properties/${id}` } } });
      return;
    }
    try {
      const res = await api.post(`/properties/${propertyId}/favorite/`);
      if (res.data.ok) {
        setProperty(prev => ({
          ...prev,
          similar_properties: prev.similar_properties.map(p => {
            if (p.id === propertyId) {
              return { ...p, is_favorite: res.data.is_favorite, images_count: p.images_count };
            }
            return p;
          })
        }));
      }
    } catch (err) {
      console.error('Error toggling similar favorite:', err);
    }
  };

  // ── États pour Modales & Notifications ────────────────────────────────────────
  const [visiteModalOpen, setVisiteModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Modale Visite
  const [visitSubmitting, setVisitSubmitting] = useState(false);
  const [visitError, setVisitError] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [visitMessage, setVisitMessage] = useState('');
  const todayDate = new Date().toISOString().split('T')[0];

  // ── Réservation Courte Durée (Séjours & Nuitées) ──────────────────────────
  const tomorrowDateStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();
  const defaultCheckOutDateStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  })();

  const [checkInDate, setCheckInDate] = useState(tomorrowDateStr);
  const [checkOutDate, setCheckOutDate] = useState(defaultCheckOutDateStr);
  const [guestsCount, setGuestsCount] = useState(1);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingMsg, setBookingMsg] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const stayNights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [checkInDate, checkOutDate]);

  const stayTotalPrice = useMemo(() => {
    const n = stayNights > 0 ? stayNights : 1;
    return (Number(property?.price) || 0) * n;
  }, [property?.price, stayNights]);

  const isDateBlocked = useMemo(() => {
    const blocked = new Set(property?.blocked_dates || []);
    if (!checkInDate || !checkOutDate || blocked.size === 0) return false;
    let d = new Date(checkInDate);
    const end = new Date(checkOutDate);
    while (d < end) {
      const iso = d.toISOString().split('T')[0];
      if (blocked.has(iso)) return true;
      d.setDate(d.getDate() + 1);
    }
    return false;
  }, [property?.blocked_dates, checkInDate, checkOutDate]);

  // ── Quick Helpers pour Modales Visite & Location ──────────────────────────
  const getQuickDate = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const getNextSaturdayDate = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = (6 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
  };

  const getFirstOfNextMonth = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(1);
    return d.toISOString().split('T')[0];
  };
  const [locStep, setLocStep] = useState(1);
  const [locSubmitting, setLocSubmitting] = useState(false);
  const [locError, setLocError] = useState('');
  const [locMoveIn, setLocMoveIn] = useState('');
  const [locDuration, setLocDuration] = useState('12');
  const [locOccupants, setLocOccupants] = useState('1');
  const [locIncome, setLocIncome] = useState('');
  const [locProfession, setLocProfession] = useState('');
  const [locEmployer, setLocEmployer] = useState('');
  const [locMessage, setLocMessage] = useState('');
  const [cniFront, setCniFront] = useState(null);
  const [cniBack, setCniBack] = useState(null);
  const [incomeProof, setIncomeProof] = useState(null);
  const [hasGuarantor, setHasGuarantor] = useState(false);
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorPhone, setGuarantorPhone] = useState('');
  const [guarantorRelation, setGuarantorRelation] = useState('');
  const [guarantorIncome, setGuarantorIncome] = useState('');
  const [guarantorCni, setGuarantorCni] = useState(null);

  // ── Simulateur de Budget / Frais d'emménagement ───────────────────────────
  const [budgetSimOpen, setBudgetSimOpen] = useState(true);
  const [calcCautionMonths, setCalcCautionMonths] = useState(2);
  const [calcAvanceMonths, setCalcAvanceMonths] = useState(1);
  const [calcFraisDossier, setCalcFraisDossier] = useState(10000);

  // ── Commodités / Points d'intérêt ─────────────────────────────────────────
  const [poiTravelMode, setPoiTravelMode] = useState('walk'); // 'walk' | 'drive'

  // ── Comparateur Rapide de Biens (LocalStorage) ────────────────────────────
  const [compareList, setCompareList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('piolo_compare_list') || '[]');
    } catch {
      return [];
    }
  });
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // ── Modale de Confirmation de Débit de Points & Pass VIP ──────────────────
  const [pointConfirmModal, setPointConfirmModal] = useState({
    isOpen: false,
    actionKey: 'CONTACT_LANDLORD',
    targetTitle: '',
    targetSubtitle: '',
    onConfirmAction: null
  });
  const [tenantSubModalOpen, setTenantSubModalOpen] = useState(false);

  const currentPointsBalance = user ? subscriptionService.getTenantPoints(user.id) : 0;
  const isVipTenant = Boolean(user?.is_vip_tenant || subscriptionService.getTenantPlan(user?.id)?.plan_type === 'vip_pass');

  const isCurrentInCompare = property ? compareList.some(p => p.id === property.id) : false;

  const toggleCompare = () => {
    if (!property) return;
    if (isCurrentInCompare) {
      const updated = compareList.filter(p => p.id !== property.id);
      setCompareList(updated);
      localStorage.setItem('piolo_compare_list', JSON.stringify(updated));
      showToast('Bien retiré du comparateur');
    } else {
      if (compareList.length >= 4) {
        showToast('Vous pouvez comparer jusqu’à 4 biens simultanément.');
        return;
      }
      const item = {
        id: property.id,
        slug: property.slug,
        title: property.title || `${propertyTypeLabel(property)} à ${property.neighborhood || property.city}`,
        price: Number(property.price) || 0,
        area: property.area,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        city: property.city,
        neighborhood: property.neighborhood,
        property_type_display: propertyTypeLabel(property),
        transaction_type: property.transaction_type,
        main_image: allImages[0] || '',
      };
      const updated = [...compareList, item];
      setCompareList(updated);
      localStorage.setItem('piolo_compare_list', JSON.stringify(updated));
      showToast('Bien ajouté au comparateur !');
    }
  };

  const removeFromCompare = (propId) => {
    const updated = compareList.filter(p => p.id !== propId);
    setCompareList(updated);
    localStorage.setItem('piolo_compare_list', JSON.stringify(updated));
  };

  const clearCompare = () => {
    setCompareList([]);
    localStorage.removeItem('piolo_compare_list');
    setCompareModalOpen(false);
  };

  const getDossierCompletion = () => {
    let pct = 0;
    // Étape 1 : Infos principales
    if (locMoveIn) pct += 15;
    if (locIncome && parseFloat(locIncome) > 0) pct += 15;
    if (locProfession && locProfession.trim().length > 1) pct += 10;
    if (locEmployer && locEmployer.trim().length > 1) pct += 5;
    if (locMessage && locMessage.trim().length > 3) pct += 5;

    // Étape 2 : Pièces justificatives
    if (cniFront) pct += 20;
    if (cniBack) pct += 10;
    if (incomeProof) pct += 10;

    // Étape 3 : Garant
    if (hasGuarantor) {
      if (guarantorName && guarantorName.trim().length > 1) pct += 5;
      if (guarantorPhone || (guarantorIncome && parseFloat(guarantorIncome) > 0) || guarantorCni) pct += 5;
    } else {
      if (locMoveIn && cniFront && (locIncome || incomeProof)) pct += 10;
    }

    return Math.min(100, pct);
  };
  const completionPct = getDossierCompletion();

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  const handleOpenVisite = () => {
    if (!user) { navigate('/login', { state: { from: `/properties/${id}` } }); return; }
    if (isRestrictedRole && !isOwner) {
      setRoleRestrictionModalOpen(true);
      return;
    }
    setVisitError('');
    setVisiteModalOpen(true);
  };

  const handleOpenLocation = () => {
    if (!user) { navigate('/login', { state: { from: `/properties/${id}` } }); return; }
    if (isRestrictedRole && !isOwner) {
      setRoleRestrictionModalOpen(true);
      return;
    }
    setLocError('');
    setLocStep(1);
    setLocationModalOpen(true);
  };

  const executeContactBailleur = async () => {
    try {
      const res = await messagesApi.start(property.id || property.slug);
      if (res.data && res.data.conversation_id) {
        navigate(`/messages/${res.data.conversation_id}`);
      } else {
        navigate('/messages');
      }
    } catch (e) {
      alert(e.response?.data?.error || "Erreur lors de l'ouverture de la messagerie.");
    }
  };

  const handleContactBailleur = () => {
    if (!user) { navigate('/login', { state: { from: `/properties/${id}` } }); return; }
    if (isRestrictedRole && !isOwner) {
      setRoleRestrictionModalOpen(true);
      return;
    }
    setPointConfirmModal({
      isOpen: true,
      actionKey: 'CONTACT_LANDLORD',
      targetTitle: property?.title || 'Contact Direct Bailleur',
      targetSubtitle: `${property?.city || 'Yaoundé'} ${property?.neighborhood ? '• ' + property.neighborhood : ''}`,
      onConfirmAction: executeContactBailleur
    });
  };

  const handleOpenBooking = () => {
    if (!user) {
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }
    if (isRestrictedRole && !isOwner) {
      setRoleRestrictionModalOpen(true);
      return;
    }
    setBookingSuccess(false);
    setBookingModalOpen(true);
  };

  const executeConfirmBooking = async () => {
    setBookingSubmitting(true);
    try {
      // 1. Enregistrer la réservation officielle dans la base de données Django
      await bookingsApi.book(property.id || property.slug, {
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        guests_count: guestsCount,
        guest_note: bookingMsg,
      }).catch((err) => {
        console.warn("Notice DB booking:", err.response?.data);
        if (err.response?.data?.error) {
          throw new Error(err.response.data.error);
        }
      });

      // 2. Transmettre le message récapitulatif dans le fil de discussion
      const summaryMsg = `🏨 Demande de Réservation Court Séjour :\n` +
        `• Logement : ${property.title || 'Meublé'}\n` +
        `• Dates : du ${checkInDate} au ${checkOutDate} (${stayNights} nuitée${stayNights > 1 ? 's' : ''})\n` +
        `• Voyageurs : ${guestsCount} personne${guestsCount > 1 ? 's' : ''}\n` +
        `• Total estimé : ${new Intl.NumberFormat('fr-FR').format(stayTotalPrice)} FCFA\n` +
        (bookingMsg ? `• Précision : "${bookingMsg}"\n` : '') +
        `\nBonjour, ce logement est-il disponible pour ces dates ? Merci de me confirmer les modalités.`;

      const res = await messagesApi.start(property.id || property.slug);
      if (res.data && res.data.conversation_id) {
        await api.post(`/messages/${res.data.conversation_id}/send/`, {
          content: summaryMsg
        }).catch(() => {});
        setBookingSuccess(true);
        setTimeout(() => {
          setBookingModalOpen(false);
          navigate(`/messages/${res.data.conversation_id}`);
        }, 1200);
      } else {
        setBookingSuccess(true);
        setTimeout(() => {
          setBookingModalOpen(false);
          navigate('/messages');
        }, 1200);
      }
    } catch (err) {
      console.warn("Erreur envoi réservation court séjour:", err);
      const msg = err.message || err.response?.data?.error || "Erreur lors de la réservation.";
      showToast(msg);
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleConfirmBooking = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!user) { navigate('/login', { state: { from: `/properties/${id}` } }); return; }
    if (isRestrictedRole && !isOwner) {
      setRoleRestrictionModalOpen(true);
      return;
    }
    if (!checkInDate || !checkOutDate || stayNights <= 0) {
      showToast("Veuillez sélectionner des dates de séjour valides.");
      return;
    }
    if (isDateBlocked) {
      showToast("Ces dates sont déjà occupées ou indisponibles.");
      return;
    }
    setPointConfirmModal({
      isOpen: true,
      actionKey: 'SHORT_STAY_BOOKING',
      targetTitle: property?.title || 'Réservation Court Séjour',
      targetSubtitle: `Du ${checkInDate} au ${checkOutDate} (${stayNights} nuitées) • Total : ${new Intl.NumberFormat('fr-FR').format(stayTotalPrice)} FCFA`,
      onConfirmAction: executeConfirmBooking
    });
  };

  const getWhatsAppBookingUrl = () => {
    const rawPhone = property?.owner?.phone_number || property?.owner?.phone || '';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const phone = cleanPhone.startsWith('237') ? cleanPhone : cleanPhone ? `237${cleanPhone}` : '';
    const text = `Bonjour, je souhaite réserver votre meublé "${property?.title || 'Court séjour'}" sur Piolo du ${checkInDate} au ${checkOutDate} (${stayNights} nuits, ${guestsCount} voyageur${guestsCount > 1 ? 's' : ''}). Total estimé : ${new Intl.NumberFormat('fr-FR').format(stayTotalPrice)} FCFA. Est-il disponible ?`;
    return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const handleBookingWhatsAppClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!user) { navigate('/login', { state: { from: `/properties/${id}` } }); return; }
    if (isRestrictedRole && !isOwner) {
      setRoleRestrictionModalOpen(true);
      return;
    }
    if (!checkInDate || !checkOutDate || stayNights <= 0) {
      showToast("Veuillez sélectionner des dates de séjour valides.");
      return;
    }
    setPointConfirmModal({
      isOpen: true,
      actionKey: 'SHORT_STAY_BOOKING',
      targetTitle: property?.title || 'Réservation Court Séjour (WhatsApp)',
      targetSubtitle: `Du ${checkInDate} au ${checkOutDate} (${stayNights} nuitées) • ${property?.city || 'Yaoundé'}`,
      onConfirmAction: () => {
        window.open(getWhatsAppBookingUrl(), '_blank', 'noopener,noreferrer');
      }
    });
  };

  const executeVisitSubmit = async () => {
    setVisitError('');
    setVisitSubmitting(true);
    try {
      const res = await api.post(`/properties/${property.id}/visit/`, {
        requested_date: visitDate,
        requested_time: visitTime || null,
        message: visitMessage
      });
      if (res.data.ok) {
        setVisiteModalOpen(false);
        showToast('Demande de visite envoyée ! Le bailleur vous contactera bientôt.');
        if (user && res.data.points_remaining !== undefined) {
          user.points = res.data.points_remaining;
          subscriptionService.setTenantPoints(user.id, res.data.points_remaining);
        }
      } else {
        setVisitError(res.data.error || 'Une erreur est survenue.');
      }
    } catch (err) {
      setVisitError(err.response?.data?.error || "Erreur lors de l'envoi. Vérifiez votre solde de points.");
    } finally {
      setVisitSubmitting(false);
    }
  };

  const handleVisitSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!visitDate) {
      setVisitError('Date de visite requise.');
      return;
    }
    setVisitError('');
    setPointConfirmModal({
      isOpen: true,
      actionKey: 'PHYSICAL_VISIT',
      targetTitle: property?.title || 'Demande de Visite Physique',
      targetSubtitle: `Visite le ${visitDate} à ${visitTime || 'heure convenue'} • ${property?.city || 'Yaoundé'}`,
      onConfirmAction: executeVisitSubmit
    });
  };

  const executeLocationSubmit = async () => {
    setLocError('');
    setLocSubmitting(true);
    const fd = new FormData();
    fd.append('move_in_date', locMoveIn);
    fd.append('lease_duration', locDuration);
    fd.append('tenant_count', locOccupants);
    if (locIncome) fd.append('monthly_income', locIncome);
    fd.append('profession', locProfession);
    fd.append('employer', locEmployer);
    fd.append('message', locMessage);
    fd.append('has_guarantor', hasGuarantor ? 'true' : 'false');
    if (hasGuarantor) {
      fd.append('guarantor_name', guarantorName);
      fd.append('guarantor_phone', guarantorPhone);
      fd.append('guarantor_relation', guarantorRelation);
      if (guarantorIncome) fd.append('guarantor_income', guarantorIncome);
      if (guarantorCni) fd.append('guarantor_cni', guarantorCni);
    }
    if (cniFront) fd.append('cni_front', cniFront);
    if (cniBack) fd.append('cni_back', cniBack);
    if (incomeProof) fd.append('income_proof', incomeProof);

    try {
      const res = await api.post(`/properties/${property.id}/location/`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.ok) {
        setLocationModalOpen(false);
        showToast(`Dossier envoyé ! Complétude : ${res.data.dossier_completion}%. Le bailleur vous répondra bientôt.`);
        if (user && res.data.points_remaining !== undefined) {
          user.points = res.data.points_remaining;
          subscriptionService.setTenantPoints(user.id, res.data.points_remaining);
        }
      } else {
        setLocError(res.data.error || 'Une erreur est survenue.');
      }
    } catch (err) {
      setLocError(err.response?.data?.error || "Erreur lors de l'envoi. Vérifiez votre solde de points.");
    } finally {
      setLocSubmitting(false);
    }
  };

  const handleLocationSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!locMoveIn) {
      setLocError("Veuillez renseigner la date d'entrée souhaitée à l'étape 1.");
      return;
    }
    setLocError('');
    setPointConfirmModal({
      isOpen: true,
      actionKey: 'RENTAL_APPLICATION',
      targetTitle: property?.title || 'Candidature Locative Prioritaire',
      targetSubtitle: `Entrée souhaitée : ${locMoveIn} • ${property?.city || 'Yaoundé'}`,
      onConfirmAction: executeLocationSubmit
    });
  };

  const handleOpen360Tour = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!user || !isAuthenticated) {
      navigate('/login', { state: { from: `/properties/${property?.slug || property?.id}/tour` } });
      return;
    }
    if (isRestrictedRole && !isOwner) {
      setRoleRestrictionModalOpen(true);
      return;
    }
    setPointConfirmModal({
      isOpen: true,
      actionKey: 'VIRTUAL_TOUR_360',
      targetTitle: property?.title || 'Visite Virtuelle 360°',
      targetSubtitle: `Immersion 3D interactive • ${property?.neighborhood || property?.city || 'Yaoundé'}`,
      onConfirmAction: () => {
        navigate(`/properties/${property?.slug || property?.id}/tour`);
      }
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const existingCache = cacheManager.get(`property_detail_${id}`);
    if (!existingCache) {
      setLoading(true);
    }
    setError(false);
    setActiveImg(0);

    propertiesApi.detail(id)
      .then(({ data }) => {
        setProperty(data);
        setIsFav(data.is_favorite || false);
        setFavCount(data.favorites_count || 0);
        cacheManager.set(`property_detail_${id}`, data, 180000);
      })
      .catch(() => {
        if (!existingCache) setError(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/properties/${id}` } } });
      return;
    }
    const nextFav = !isFav;
    const nextCount = nextFav ? favCount + 1 : Math.max(0, favCount - 1);
    setIsFav(nextFav);
    setFavCount(nextCount);

    try {
      const res = await api.post(`/properties/${property?.id || id}/favorite/`);
      if (res.data?.ok) {
        setIsFav(res.data.is_favorite);
        if (res.data.count !== undefined) setFavCount(res.data.count);
        // Sync cache
        if (property) {
          const updated = { ...property, is_favorite: res.data.is_favorite, favorites_count: res.data.count };
          cacheManager.set(`property_detail_${id}`, updated, 180000);
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setIsFav(!nextFav);
      setFavCount(favCount);
    }
  };

  const allImages = property
    ? (() => {
        const main = property.main_image ? getMediaUrl(property.main_image) : null;
        const gallery = (property.images || []).map((img) => getMediaUrl(typeof img === 'string' ? img : (img.image || img.image_url))).filter(Boolean);
        return main ? [main, ...gallery] : gallery;
      })()
    : [];

  // Autoplay slideshow for gallery (runs every 4.5 seconds until user interacts)
  useEffect(() => {
    if (!isAutoplay || allImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImg(curr => (curr < allImages.length - 1 ? curr + 1 : 0));
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoplay, allImages.length]);

  // Centrage automatique de la miniature active sur smartphone SANS perturber le défilement de la page
  useEffect(() => {
    if (mobileThumbsRef.current) {
      const container = mobileThumbsRef.current;
      const activeEl = container.querySelector(`.mobile-hero-thumb[data-idx="${activeImg}"]`);
      if (activeEl) {
        const targetScroll = activeEl.offsetLeft - (container.clientWidth / 2) + (activeEl.clientWidth / 2);
        container.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
      }
    }
  }, [activeImg]);

  const handleLightboxPrev = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setLightboxImgIndex(idx => (idx > 0 ? idx - 1 : allImages.length - 1));
  };

  const handleLightboxNext = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setLightboxImgIndex(idx => (idx < allImages.length - 1 ? idx + 1 : 0));
  };

  // Touch Swipe Handlers for Mobile (Zapper avec le doigt)
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;  // Swipe Left -> Next
    const isRightSwipe = distance < -50; // Swipe Right -> Prev
    if (isLeftSwipe) {
      handleLightboxNext();
    } else if (isRightSwipe) {
      handleLightboxPrev();
    }
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handleLightboxPrev();
      if (e.key === 'ArrowRight') handleLightboxNext();
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  useEffect(() => {
    if (!property) return;
    const lat = parseCoord(property.latitude, 3.8480);
    const lng = parseCoord(property.longitude, 11.5021);
    const center = { lat, lng };

    const initMap = () => {
      if (!window.google || !window.google.maps || !mapRef.current) return;
      try {
        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 16,
          center: center,
          mapTypeId: 'hybrid', // Vue satellite avec noms des rues
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: true,
          zoomControl: true,
          gestureHandling: 'greedy', // Permet de déplacer la carte à un doigt sur mobile
        });

        new window.google.maps.Circle({
          strokeColor: '#D4AF37',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#D4AF37',
          fillOpacity: 0.15,
          map: map,
          center: center,
          radius: 350,
        });

        new window.google.maps.Marker({
          position: center,
          map: map,
          title: property.property_type ? `${propertyTypeLabel(property)} - ${property.neighborhood || property.city}` : "Position du bien",
          icon: {
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
            fillColor: '#D4AF37',
            fillOpacity: 1,
            strokeColor: '#0F0D09',
            strokeWeight: 1.5,
            scale: 1.5,
            anchor: new window.google.maps.Point(12, 12)
          }
        });

        setMapLoaded(true);
      } catch (err) {
        console.error("Erreur d'initialisation de Google Maps:", err);
      }
    };

    if (window.google && window.google.maps) {
      initMap();
    } else {
      const apiKey = property.google_maps_api_key || 'AIzaSyDZyYvlR1SeSE6mk2kJn-gJxg-tfsDoJKc';
      const scriptId = 'google-maps-api-script';
      let script = document.getElementById(scriptId);
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initPioloDetailMap`;
        script.async = true;
        script.defer = true;
        window.initPioloDetailMap = () => {
          initMap();
        };
        document.head.appendChild(script);
      } else {
        const checkInterval = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkInterval);
            initMap();
          }
        }, 150);
        setTimeout(() => clearInterval(checkInterval), 8000);
      }
    }
  }, [property]);

  const parseCoord = (val, defaultVal) => {
    if (val !== null && val !== undefined && val !== '' && val !== 'None') {
      const parsed = parseFloat(String(val).replace(',', '.'));
      if (!isNaN(parsed) && parsed !== 0) return parsed;
    }
    return defaultVal;
  };


  const executeItineraire = () => {
    if (!property) return;
    const lat = parseCoord(property.latitude, 3.8480);
    const lng = parseCoord(property.longitude, 11.5021);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    setRouteOpened(true);
    setItineraireStatus({
      type: 'success',
      message: "Itinéraire ouvert dans Google Maps."
    });

    setTimeout(() => setItineraireStatus(null), 6000);
  };

  const handleItineraire = () => {
    if (!property) return;
    if (!user || !isAuthenticated) {
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }
    if (isRestrictedRole && !isOwner) {
      setRoleRestrictionModalOpen(true);
      return;
    }
    setPointConfirmModal({
      isOpen: true,
      actionKey: 'PROPERTY_GPS_ROUTE',
      targetTitle: property?.title || 'Itinéraire GPS Logement',
      targetSubtitle: `Guidage vers ${property?.neighborhood || property?.city || 'le logement'}`,
      onConfirmAction: executeItineraire
    });
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const locationLabel = property ? [property.neighborhood, property.city].filter(Boolean).join(', ') : 'Yaoundé';

  const handlePrev = () => {
    setActiveImg(a => (a > 0 ? a - 1 : allImages.length - 1));
    setIsAutoplay(false);
  };
  const handleNext = () => {
    setActiveImg(a => (a < allImages.length - 1 ? a + 1 : 0));
    setIsAutoplay(false);
  };
  const isOwner = user && property && user.id === property.owner?.id;
  const hasDiscoveryVideo = Boolean(property?.video_reel && String(property.video_reel).trim());
  const ownerVerificationLevel = Number(property?.owner?.verification_level || 0);
  const ownerIsVerified = ownerVerificationLevel >= 2 || property?.owner?.is_verified || property?.owner?.is_owner_verified;
  const ownerBadgeClass = ownerVerificationLevel >= 3 ? 'premium' : ownerIsVerified ? 'verified' : 'unverified';

  // ── Rendu : Loading ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="detail-page-scope">
        <style>{DETAIL_STYLES}</style>
        <SkeletonDetail />
      </div>
    );
  }

  // ── Rendu : Erreur / introuvable ─────────────────────────────────────────────
  if (error || !property) {
    return (
      <div className="detail-page-scope">
        <style>{DETAIL_STYLES}</style>
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 60, marginBottom: 20 }}>🏠</div>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', marginBottom: 12 }}>Annonce introuvable</h2>
          <p style={{ color: '#888', marginBottom: 24 }}>Cette annonce n'existe pas ou a été supprimée.</p>
          <Link to={detailPropertiesPath} style={{ display: 'inline-block', background: 'linear-gradient(135deg,#D4AF37,#F6D365)', color: '#000', padding: '12px 28px', borderRadius: 12, fontWeight: 700, fontFamily: 'Poppins, sans-serif', textDecoration: 'none' }}>
            ← Retour aux annonces
          </Link>
        </div>
      </div>
    );
  }

  // ── Rendu : Page complète ────────────────────────────────────────────────────
  return (
    <div className="detail-page-scope">
      <style>{DETAIL_STYLES}</style>

      {/* ── Mobile Hero Slider (Plein écran Edge-to-Edge sur Smartphone) ────────── */}
      <div 
        className="mobile-hero-gallery"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => {
          if (!touchStart || !touchEnd) return;
          const dist = touchStart - touchEnd;
          if (dist > 40 && activeImg < allImages.length - 1) {
            setIsAutoplay(false);
            setActiveImg(a => a + 1);
          } else if (dist < -40 && activeImg > 0) {
            setIsAutoplay(false);
            setActiveImg(a => a - 1);
          }
        }}
      >
        {/* Floating Top Nav on Mobile */}
        <div className="mobile-hero-top-bar">
          <button 
            type="button" 
            className="mobile-hero-btn" 
            onClick={(e) => { e.preventDefault(); navigate(-1); }} 
            aria-label="Retour"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button 
              type="button" 
              className={`mobile-hero-btn ${isFav ? 'fav-active' : ''}`} 
              onClick={(e) => { e.preventDefault(); handleToggleFavorite(); }}
              aria-label="Favori"
            >
              <i className={isFav ? "fas fa-heart" : "far fa-heart"}></i>
            </button>
            <button 
              type="button" 
              className="mobile-hero-btn" 
              onClick={(e) => {
                e.preventDefault();
                if (navigator.share) {
                  navigator.share({ title: property.title || propertyTypeLabel(property), url: window.location.href });
                } else {
                  navigator.clipboard?.writeText(window.location.href);
                  showToast('Lien copié dans le presse-papier !');
                }
              }}
              aria-label={t('property_detail.share_btn', 'Partager')}
            >
              <i className="fas fa-arrow-up-from-bracket"></i>
            </button>
          </div>
        </div>

        {/* Sliding Track for Smooth Real Slide Animation */}
        <div 
          className="mobile-hero-track"
          style={{ transform: `translateX(-${activeImg * 100}%)` }}
        >
          {allImages.map((imgUrl, idx) => (
            <div 
              key={idx} 
              className="mobile-hero-slide"
              onClick={(e) => { e.preventDefault(); setLightboxImgIndex(activeImg); setLightboxOpen(true); }}
            >
              <img src={imgUrl} alt={`${propertyTypeLabel(property)} photo ${idx + 1}`} loading={idx === 0 ? "eager" : "lazy"} />
            </div>
          ))}
        </div>

        {/* Flèches de navigation fluide sur Smartphone */}
        {allImages.length > 1 && (
          <>
            <button
              type="button"
              className="mobile-hero-nav-arrow prev"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsAutoplay(false);
                setActiveImg(a => (a > 0 ? a - 1 : allImages.length - 1));
              }}
              aria-label="Photo précédente"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button
              type="button"
              className="mobile-hero-nav-arrow next"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsAutoplay(false);
                setActiveImg(a => (a < allImages.length - 1 ? a + 1 : 0));
              }}
              aria-label="Photo suivante"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </>
        )}

        {/* Floating Bottom Info on Mobile Hero */}
        <div className="mobile-hero-bottom-bar">
          {property.virtual_tours?.length > 0 ? (
            <button 
              type="button"
              onClick={handleOpen360Tour}
              className="mobile-hero-360-badge"
              style={{ border: 'none', cursor: 'pointer' }}
            >
              <i className="fas fa-vr-cardboard"></i>
              <span>Visite 360°</span>
            </button>
          ) : (
            <span className={`dbadge ${property.transaction_type?.toLowerCase() || 'location'}`} style={{ marginBottom: 0 }}>
              {transactionLabel(property.transaction_type)}
            </span>
          )}

          <div className="mobile-hero-counter">
            {activeImg + 1} / {allImages.length || 1}
          </div>
        </div>

        {/* Dots */}
        {allImages.length > 1 && (
          <div className="mobile-hero-dots">
            {allImages.map((_, idx) => (
              <div key={idx} className={`mobile-hero-dot ${idx === activeImg ? 'active' : ''}`} />
            ))}
          </div>
        )}
      </div>

      {/* ── Ruban de Miniatures Tactile Mobile (Sous l'image principale) ─────── */}
      {allImages.length > 1 && (
        <div className="mobile-hero-thumbs-strip" ref={mobileThumbsRef}>
          {allImages.map((imgUrl, idx) => (
            <button
              type="button"
              key={idx}
              data-idx={idx}
              className={`mobile-hero-thumb ${idx === activeImg ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveImg(idx);
                setIsAutoplay(false);
              }}
              aria-label={`Afficher photo ${idx + 1}`}
            >
              <img src={imgUrl} alt={`Miniature photo ${idx + 1}`} loading="lazy" />
            </button>
          ))}
        </div>
      )}

      <div className="detail-shell">
        {/* Breadcrumb (Desktop) */}
        <div className="detail-breadcrumb">
          <Link to={detailHomePath}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            Accueil
          </Link>
          <span className="sep">/</span>
          <Link to={detailPropertiesPath}>{propertyTypeLabel(property)}</Link>
          <span className="sep">/</span>
          <span className="current">{property.bedrooms} pièce(s) à {property.city}</span>
        </div>

        <div className="detail-grid">
          {/* ── Colonne principale ─────────────────────────────────────────── */}
          <div className="detail-main">

            {/* Galerie Desktop (Masquée sur Mobile via CSS) */}
            <div className="gallery">
              <div className="gallery-thumbs">
                {allImages.map((url, idx) => (
                  <div key={idx} className={`thumb ${idx === activeImg ? 'active' : ''}`} onClick={() => { setActiveImg(idx); setIsAutoplay(false); }}>
                    <img src={url} alt={`Photo ${idx + 1}`} />
                  </div>
                ))}
              </div>
              <div className="gallery-main">
                <button type="button" className="gallery-nav prev" onClick={handlePrev}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                {allImages[activeImg] && (
                  <img 
                    src={allImages[activeImg]} 
                    alt={propertyTypeLabel(property)} 
                    style={{ cursor: 'zoom-in' }}
                    onClick={() => { setLightboxImgIndex(activeImg); setLightboxOpen(true); setIsAutoplay(false); }}
                  />
                )}
                <button type="button" className="gallery-nav next" onClick={handleNext}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
                <span className="gallery-counter">
                  <span>{activeImg + 1}</span> / <span>{allImages.length}</span>
                </span>
              </div>
            </div>

            {/* Carte titre + prix */}
            <div className="detail-card">
              <div className="detail-top-row">
                <div className="detail-titleblock">
                  <span className={`dbadge ${property.transaction_type?.toLowerCase() || 'location'}`}>
                    {transactionLabel(property.transaction_type)}
                  </span>
                  <h1 className="detail-title">{propertyTypeLabel(property)} {property.bedrooms} pièces à {property.neighborhood || property.city}</h1>
                  <div className="detail-sub">
                    <i className="fas fa-location-dot" style={{ color: 'var(--or-d)' }}></i>
                    <span>{property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}</span>
                    <span>&middot; {property.area} m²</span>
                  </div>
                </div>
                <div className="detail-price-block">
                  <div className="dprice">
                    {new Intl.NumberFormat('fr-FR').format(Number(property.price) || 0)} <span className="dcurrency">FCFA</span>
                    {property.transaction_type === 'LOCATION' && <span className="dperiod">/mois</span>}
                    {property.transaction_type === 'COURTE_DUREE' && <span className="dperiod" style={{ color: '#059669', fontWeight: 700 }}>/nuit</span>}
                    {property.transaction_type === 'VENTE' && <span className="dperiod" style={{ color: '#1D4ED8', fontWeight: 700, fontSize: 13 }}> (Prix de vente)</span>}
                  </div>
                  <div className="dprice-sub">
                    {property.transaction_type === 'COURTE_DUREE'
                      ? 'charges & wifi inclus'
                      : property.transaction_type === 'VENTE'
                      ? 'prix d’acquisition global'
                      : 'charges non comprises'}
                  </div>
                </div>
              </div>

              {/* Bulles caractéristiques */}
              <div className="dbulles">
                <div className="dbulle">
                  <i className="fas fa-door-open"></i>
                  <span>{property.bedrooms} pièce(s)</span>
                </div>
                <div className="dbulle">
                  <i className="fas fa-bed"></i>
                  <span>{property.bedrooms} chambre(s)</span>
                </div>
                <div className="dbulle">
                  <i className="fas fa-bath"></i>
                  <span>{property.bathrooms} sdb</span>
                </div>
                <div className="dbulle">
                  <i className="fas fa-ruler-combined"></i>
                  <span>{property.area} m²</span>
                </div>
              </div>

              {/* Actions Desktop */}
              <div className="dactions">
                <button 
                  type="button" 
                  className={`dact-btn fav ${isFav ? 'active' : ''}`} 
                  onClick={handleToggleFavorite}
                  title={t('property.favorite_add', 'Ajouter aux favoris')}
                >
                  <svg viewBox="0 0 24 24" fill={isFav ? "var(--or-d)" : "none"} stroke={isFav ? "var(--or-d)" : "currentColor"} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <span>Favoris ({favCount})</span>
                </button>
                <button 
                  type="button" 
                  className={`dact-btn ${isCurrentInCompare ? 'active' : ''}`}
                  onClick={toggleCompare}
                  title={isCurrentInCompare ? "Retirer du comparateur" : "Ajouter au comparateur"}
                >
                  <i className="fas fa-scale-balanced" style={{ color: isCurrentInCompare ? 'var(--or-d)' : 'inherit' }}></i>
                  <span>{isCurrentInCompare ? 'Dans le comparateur' : 'Comparer'}</span>
                </button>
                <button type="button" className="dact-btn" onClick={() => window.print()} title={t('property_detail.print_btn', 'Imprimer')}>
                  <i className="fas fa-print"></i>
                  <span>{t('property_detail.print_btn', 'Imprimer')}</span>
                </button>
                <span className="dref">Réf : {property.id?.substring(0, 8).toUpperCase()}</span>
              </div>
            </div>

            {/* Bouton visite 360° Interactive */}
            {hasDiscoveryVideo && (
              <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Link
                  to={`/discovery?prop=${encodeURIComponent(property.slug || property.id)}`}
                  className="btn-discovery"
                >
                  <i className="fas fa-film"></i>
                  <span>{t('property_detail.view_reel_btn', 'Voir la vidéo en mode découverte')}</span>
                </Link>
              </div>
            )}
            {property.virtual_tours?.length > 0 && (
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center', width: '100%' }}>
                <button 
                  type="button"
                  onClick={handleOpen360Tour}
                  className="btn-360-shake"
                  style={{ border: 'none', cursor: 'pointer' }}
                >
                  <i className="fas fa-vr-cardboard" style={{ fontSize: 20 }}></i>
                  <span>{t('property_detail.view_360_btn', 'Effectuer la visite 360° interactive')}</span>
                </button>
              </div>
            )}

            {/* Description */}
            <div className="detail-card">
              <h2 className="dsection-title">
                <i className="fas fa-align-left" style={{ color: 'var(--or-d)', fontSize: 16 }}></i>
                Description
              </h2>
              <div className="ddescription">
                <p style={{ whiteSpace: 'pre-wrap' }}>{property.description || "Aucune description fournie."}</p>
              </div>
            </div>

            {/* Aspects financiers & Simulateur de Budget */}
            <div className="detail-card">
              <h2 className="dsection-title">
                <i className="fas fa-coins" style={{ color: 'var(--or-d)', fontSize: 16 }}></i>
                Aspects financiers
              </h2>
              <div className="dfinance-grid" style={{ marginBottom: property.transaction_type === 'LOCATION' ? 18 : 0 }}>
                <div className="dfin-item">
                  <span className="dfin-label">
                    {property.transaction_type === 'COURTE_DUREE'
                      ? 'Tarif par nuitée'
                      : property.transaction_type === 'VENTE'
                      ? 'Prix de vente total'
                      : 'Loyer mensuel'}
                  </span>
                  <span className="dfin-value">
                    {new Intl.NumberFormat('fr-FR').format(Number(property.price) || 0)} FCFA
                    {property.transaction_type === 'COURTE_DUREE' && <span style={{ fontSize: 13, color: '#059669', fontWeight: 600 }}> / nuit</span>}
                    {property.transaction_type === 'LOCATION' && <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}> / mois</span>}
                  </span>
                </div>
                {property.transaction_type === 'LOCATION' && (
                  <div className="dfin-item">
                    <span className="dfin-label">Caution standard ({calcCautionMonths} mois)</span>
                    <span className="dfin-value">{new Intl.NumberFormat('fr-FR').format((Number(property.price) || 0) * calcCautionMonths)} FCFA</span>
                  </div>
                )}
                {property.transaction_type === 'COURTE_DUREE' && (
                  <div className="dfin-item">
                    <span className="dfin-label">Formule d’hébergement</span>
                    <span className="dfin-value" style={{ color: '#059669', fontSize: 15 }}>Meublé court séjour (Nuitée)</span>
                  </div>
                )}
                {property.transaction_type === 'VENTE' && (
                  <div className="dfin-item">
                    <span className="dfin-label">Type d’opération</span>
                    <span className="dfin-value" style={{ color: '#1D4ED8', fontSize: 15 }}>Acquisition / Vente immobilière</span>
                  </div>
                )}
              </div>

              {/* Simulateur interactif de frais d'emménagement pour les locations */}
              {property.transaction_type === 'LOCATION' && (
                <div className="budget-sim-card">
                  <div className="budget-sim-header" onClick={() => setBudgetSimOpen(o => !o)}>
                    <div className="budget-sim-title">
                      <i className="fas fa-calculator" style={{ color: 'var(--or-d)' }}></i>
                      <span>{t('property_detail.move_in_simulator_title', "Simulateur de Frais d'Emménagement")}</span>
                      <span className="budget-sim-badge">{t('property_detail.interactive_badge', 'Interactif')}</span>
                    </div>
                    <i className={`fas fa-chevron-${budgetSimOpen ? 'up' : 'down'} budget-sim-toggle-icon`}></i>
                  </div>

                  {budgetSimOpen && (
                    <div className="budget-sim-body">
                      {/* Loyer 1er mois */}
                      <div className="budget-sim-row">
                        <div className="budget-sim-label">
                          <span className="budget-sim-name">{t('property_detail.first_month_rent', '1er Loyer mensuel')}</span>
                          <span className="budget-sim-desc">{t('property_detail.first_month_rent_sub', "Loyer du premier mois d'occupation")}</span>
                        </div>
                        <div className="budget-sim-amount">
                          {new Intl.NumberFormat('fr-FR').format(Number(property.price) || 0)} FCFA
                        </div>
                      </div>

                      {/* Caution / Dépôt de garantie */}
                      <div className="budget-sim-row">
                        <div className="budget-sim-label">
                          <span className="budget-sim-name">{t('property_detail.caution_deposit', 'Dépôt de garantie (Caution)')}</span>
                          <span className="budget-sim-desc">{t('property_detail.caution_deposit_sub', "Remboursable en fin de bail selon l'état des lieux")}</span>
                        </div>
                        <div className="budget-sim-controls">
                          <div className="budget-pill-select">
                            {[1, 2, 3].map(m => (
                              <button
                                key={m}
                                type="button"
                                className={`budget-pill-btn ${calcCautionMonths === m ? 'active' : ''}`}
                                onClick={() => setCalcCautionMonths(m)}
                              >
                                {m} {m > 1 ? 'mois' : 'mois'}
                              </button>
                            ))}
                          </div>
                          <div className="budget-sim-amount">
                            {new Intl.NumberFormat('fr-FR').format((Number(property.price) || 0) * calcCautionMonths)} FCFA
                          </div>
                        </div>
                      </div>

                      {/* Avance sur loyers */}
                      <div className="budget-sim-row">
                        <div className="budget-sim-label">
                          <span className="budget-sim-name">{t('property_detail.advance_rent', 'Avance sur loyers')}</span>
                          <span className="budget-sim-desc">{t('property_detail.advance_rent_sub', "Nombre de mois payés d'avance")}</span>
                        </div>
                        <div className="budget-sim-controls">
                          <div className="budget-pill-select">
                            {[0, 1, 2, 3, 6].map(m => (
                              <button
                                key={m}
                                type="button"
                                className={`budget-pill-btn ${calcAvanceMonths === m ? 'active' : ''}`}
                                onClick={() => setCalcAvanceMonths(m)}
                              >
                                {m === 0 ? 'Aucune' : `${m}m`}
                              </button>
                            ))}
                          </div>
                          <div className="budget-sim-amount">
                            {new Intl.NumberFormat('fr-FR').format((Number(property.price) || 0) * calcAvanceMonths)} FCFA
                          </div>
                        </div>
                      </div>

                      {/* Frais de dossier / Formalités */}
                      <div className="budget-sim-row">
                        <div className="budget-sim-label">
                          <span className="budget-sim-name">{t('property_detail.admin_fees', 'Frais de dossier & État des lieux')}</span>
                          <span className="budget-sim-desc">{t('property_detail.admin_fees_sub', 'Gestion administrative et remise des clés')}</span>
                        </div>
                        <div className="budget-sim-controls">
                          <div className="budget-pill-select">
                            {[0, 10000, 25000].map(fee => (
                              <button
                                key={fee}
                                type="button"
                                className={`budget-pill-btn ${calcFraisDossier === fee ? 'active' : ''}`}
                                onClick={() => setCalcFraisDossier(fee)}
                              >
                                {fee === 0 ? 'Offert' : `${new Intl.NumberFormat('fr-FR').format(fee)} F`}
                              </button>
                            ))}
                          </div>
                          <div className="budget-sim-amount">
                            {new Intl.NumberFormat('fr-FR').format(calcFraisDossier)} FCFA
                          </div>
                        </div>
                      </div>

                      {/* Total Box */}
                      <div className="budget-total-box">
                        <div className="budget-total-label">
                          <span className="budget-total-title">{t('property_detail.total_move_in_estimate', 'Total estimé à prévoir pour emménager')}</span>
                          <span className="budget-total-note">{t('property_detail.total_move_in_sub', 'Simulation indicative tout compris pour remise des clés')}</span>
                        </div>
                        <div className="budget-total-value">
                          {new Intl.NumberFormat('fr-FR').format(
                            (Number(property.price) || 0) * (1 + calcAvanceMonths + calcCautionMonths) + calcFraisDossier
                          )} FCFA
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modalités et Équipements de Séjour (Courte durée) */}
            {property.transaction_type === 'COURTE_DUREE' && (
              <div className="detail-card">
                <h2 className="dsection-title">
                  <i className="fas fa-calendar-days" style={{ color: '#059669', fontSize: 16 }}></i>
                  Modalités du Séjour & Arrivée
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <div style={{ padding: '14px 16px', background: '#F0FDF4', borderRadius: 14, border: '1px solid rgba(16,185,129,0.2)' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#059669', marginBottom: 4 }}>
                      <i className="fas fa-clock" style={{ marginRight: 6 }}></i> Horaires du Séjour
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                      Arrivée : à partir de 14h00<br/>
                      Départ : avant 11h00
                    </div>
                  </div>

                  <div style={{ padding: '14px 16px', background: '#F0FDF4', borderRadius: 14, border: '1px solid rgba(16,185,129,0.2)' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#059669', marginBottom: 4 }}>
                      <i className="fas fa-key" style={{ marginRight: 6 }}></i> Remise des clés
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                      Accueil personnalisé sur place par l'hôte ou la conciergerie
                    </div>
                  </div>

                  <div style={{ padding: '14px 16px', background: '#F0FDF4', borderRadius: 14, border: '1px solid rgba(16,185,129,0.2)' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#059669', marginBottom: 4 }}>
                      <i className="fas fa-shield-halved" style={{ marginRight: 6 }}></i> Services inclus
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                      Wi-Fi haut débit, Eau & Électricité continues, Draps & Serviettes propres
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Caractéristiques */}
            <div className="detail-card">
              <h2 className="dsection-title">
                <i className="fas fa-list-check" style={{ color: 'var(--or-d)', fontSize: 16 }}></i>
                Caractéristiques du bien
              </h2>
              <div className="dcriteria-grid">
                <div className="dcrit-block">
                  <h3><i className="fas fa-building"></i> Général</h3>
                  <ul>
                    <li><span>{t('property_detail.specs_type', 'Type de bien')}</span><b>{propertyTypeLabel(property)}</b></li>
                    <li><span>{t('property_detail.specs_transaction', 'Transaction')}</span><b>{transactionLabel(property.transaction_type)}</b></li>
                  </ul>
                </div>
                <div className="dcrit-block">
                  <h3><i className="fas fa-location-dot"></i> Localisation</h3>
                  <ul>
                    <li><span>Ville</span><b>{property.city}</b></li>
                    <li><span>Quartier</span><b>{property.neighborhood || 'Centre'}</b></li>
                  </ul>
                </div>
                <div className="dcrit-block">
                  <h3><i className="fas fa-maximize"></i> Surfaces</h3>
                  <ul>
                    <li><span>{t('property_detail.specs_total_surface', 'Surface totale')}</span><b>{property.area} m²</b></li>
                  </ul>
                </div>
                <div className="dcrit-block">
                  <h3><i className="fas fa-couch"></i> Intérieur</h3>
                  <ul>
                    <li><span>{t('property_detail.specs_rooms', 'Pièces')}</span><b>{property.bedrooms}</b></li>
                    <li><span>{t('property_detail.specs_bedrooms', 'Chambres')}</span><b>{property.bedrooms}</b></li>
                    <li><span>{t('property_detail.specs_bathrooms', 'Salles de bain')}</span><b>{property.bathrooms}</b></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                INDICE DE VIE DU QUARTIER (RÉALITÉS DU TERRAIN 237)
            ══════════════════════════════════════════════════════════════ */}
            <div className="detail-card neighborhood-index-card" style={{
              background: 'linear-gradient(145deg, #FFFFFF 0%, #FAF8F5 100%)',
              border: '1.5px solid rgba(212, 175, 55, 0.35)',
              borderRadius: 20,
              boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 13,
                    background: 'linear-gradient(135deg, rgba(212,175,55,0.18), rgba(246,211,101,0.28))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#B8860B', border: '1px solid rgba(212,175,55,0.35)',
                    boxShadow: '0 4px 12px rgba(212,175,55,0.15)'
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                      <line x1="8" y1="2" x2="8" y2="18"></line>
                      <line x1="16" y1="6" x2="16" y2="22"></line>
                    </svg>
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: 'Poppins, sans-serif', color: '#111827' }}>
                      Indice de Vie du Quartier
                    </h2>
                    <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>
                      Vérifications concrètes du terrain à {property.neighborhood || property.city}
                    </span>
                  </div>
                </div>

                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 999,
                  background: 'linear-gradient(135deg, #FFF9EB, #FBF3DC)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  fontSize: 12, fontWeight: 800, color: '#92700C',
                  boxShadow: '0 2px 8px rgba(212,175,55,0.12)'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L1 21h22L12 2zm0 3.5l8.5 15H3.5L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
                  </svg>
                  <span>{t('property_detail.specs_certified_terrain', 'Terrain Certifié Piolo')}</span>
                </div>
              </div>

              {/* Grille des critères terrain avec SVG pros */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 12,
                marginTop: 14
              }}>
                {/* 1. Eau */}
                <div style={{
                  padding: '14px 16px', borderRadius: 15,
                  background: '#FFFFFF',
                  border: '1px solid rgba(212,175,55,0.22)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  display: 'flex', alignItems: 'flex-start', gap: 12
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 11,
                    background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#0284C7', flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(2,132,199,0.15)'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block' }}>
                      Alimentation en Eau
                    </span>
                    <strong style={{ fontSize: 13.5, color: '#0F172A', fontWeight: 700, display: 'block', marginTop: 2 }}>
                      {property.water_source === 'FORAGE' && 'Forage privé permanent'}
                      {property.water_source === 'FORAGE_CAMWATER' && 'Double source (Forage + CAMWATER)'}
                      {property.water_source === 'CAMWATER' && 'Réseau public CAMWATER'}
                      {property.water_source === 'CITERNE' && 'Citerne / Réserve d’eau'}
                      {!property.water_source && (property.water ? 'Eau courante disponible' : 'À vérifier sur place')}
                    </strong>
                    <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      {property.water_source?.includes('FORAGE') ? 'Zéro coupure prolongée' : 'Pression contrôlée'}
                    </span>
                  </div>
                </div>

                {/* 2. Électricité */}
                <div style={{
                  padding: '14px 16px', borderRadius: 15,
                  background: '#FFFFFF',
                  border: '1px solid rgba(212,175,55,0.22)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  display: 'flex', alignItems: 'flex-start', gap: 12
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 11,
                    background: 'linear-gradient(135deg, #FEF9C3 0%, #FEF08A 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#CA8A04', flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(202,138,4,0.18)'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block' }}>
                      {t('property_detail.specs_electricity', 'Électricité & Compteur')}
                    </span>
                    <strong style={{ fontSize: 13.5, color: '#0F172A', fontWeight: 700, display: 'block', marginTop: 2 }}>
                      {property.electricity_type === 'PREPAYE' && 'Compteur individuel prépayé'}
                      {property.electricity_type === 'POSTPAYE' && 'Compteur classique (Postpayé)'}
                      {property.electricity_type === 'PARTAGE' && 'Compteur divisionnaire'}
                      {property.electricity_type === 'SOLAIRE' && 'Solaire / Groupe de secours'}
                      {!property.electricity_type && (property.electricity ? 'Électricité raccordée' : 'Raccordement en cours')}
                    </strong>
                    <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      {property.electricity_type === 'PREPAYE' ? 'Maîtrise totale de votre consommation' : 'Alimentation standard'}
                    </span>
                  </div>
                </div>

                {/* 3. Accès & Route */}
                <div style={{
                  padding: '14px 16px', borderRadius: 15,
                  background: '#FFFFFF',
                  border: '1px solid rgba(212,175,55,0.22)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  display: 'flex', alignItems: 'flex-start', gap: 12
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 11,
                    background: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#475569', flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(71,85,105,0.12)'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="4" y1="21" x2="8" y2="3"></line>
                      <line x1="20" y1="21" x2="16" y2="3"></line>
                      <line x1="12" y1="17" x2="12" y2="19"></line>
                      <line x1="12" y1="11" x2="12" y2="13"></line>
                      <line x1="12" y1="5" x2="12" y2="7"></line>
                    </svg>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block' }}>
                      {t('property_detail.specs_road', 'Accès Routier')}
                    </span>
                    <strong style={{ fontSize: 13.5, color: '#0F172A', fontWeight: 700, display: 'block', marginTop: 2 }}>
                      {property.road_access === 'GOUDRON_DIRECT' && 'Goudron direct jusqu’à la barrière'}
                      {property.road_access === 'PISTE_PROCHE' && `Piste aménagée (${property.distance_goudron ? property.distance_goudron + ' m' : '< 100 m'} du goudron)`}
                      {property.road_access === 'PISTE_MOYENNE' && `Piste carrossable (${property.distance_goudron ? property.distance_goudron + ' m' : '100m à 500m'})`}
                      {property.road_access === 'PISTE_DIFFICILE' && 'Piste en terre (> 500 m)'}
                      {!property.road_access && (property.distance_goudron ? `À ${property.distance_goudron} m du goudron` : 'Accès praticable toute saison')}
                    </strong>
                    <span style={{ fontSize: 11, color: '#475569', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                      {property.road_access === 'GOUDRON_DIRECT' ? 'Accès véhicule bas garanti' : 'Accessible moto & voiture'}
                    </span>
                  </div>
                </div>

                {/* 4. Réseau Mobile */}
                <div style={{
                  padding: '14px 16px', borderRadius: 15,
                  background: '#FFFFFF',
                  border: '1px solid rgba(212,175,55,0.22)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  display: 'flex', alignItems: 'flex-start', gap: 12
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 11,
                    background: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#16A34A', flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(22,163,74,0.15)'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                      <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                      <line x1="12" y1="20" x2="12.01" y2="20"></line>
                    </svg>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block' }}>
                      Réseau Télécoms
                    </span>
                    <strong style={{ fontSize: 13.5, color: '#0F172A', fontWeight: 700, display: 'block', marginTop: 2 }}>
                      {property.network_quality === 'EXCELLENT' && 'MTN & Orange 4G/5G parfaits'}
                      {property.network_quality === 'BON' && 'Réseau mobile stable'}
                      {property.network_quality === 'MOYEN' && 'Réseau moyen à l’intérieur'}
                      {!property.network_quality && 'Couverture MTN & Orange'}
                    </strong>
                    <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                      Appels & Internet fluides
                    </span>
                  </div>
                </div>

                {/* 5. Transports */}
                <div style={{
                  padding: '14px 16px', borderRadius: 15,
                  background: '#FFFFFF',
                  border: '1px solid rgba(212,175,55,0.22)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  display: 'flex', alignItems: 'flex-start', gap: 12
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 11,
                    background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#D97706', flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(217,119,6,0.15)'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="12" rx="2"></rect>
                      <path d="M7 16v4"></path>
                      <path d="M17 16v4"></path>
                      <circle cx="7" cy="11" r="1.5"></circle>
                      <circle cx="17" cy="11" r="1.5"></circle>
                    </svg>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block' }}>
                      Disponibilité Transports
                    </span>
                    <strong style={{ fontSize: 13.5, color: '#0F172A', fontWeight: 700, display: 'block', marginTop: 2 }}>
                      {property.transport_access === 'DEPOT_MOTO_IMMEDIAT' && 'Motos & Taxis à la porte'}
                      {property.transport_access === 'MARCHE_COURTE' && 'Ligne de taxi à < 5 min'}
                      {property.transport_access === 'ELOIGNE' && 'Zone résidentielle calme'}
                      {!property.transport_access && 'Secteur accessible'}
                    </strong>
                    <span style={{ fontSize: 11, color: '#D97706', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                      Déplacements simples au quotidien
                    </span>
                  </div>
                </div>

                {/* 6. Inondation */}
                <div style={{
                  padding: '14px 16px', borderRadius: 15,
                  background: '#FFFFFF',
                  border: '1px solid rgba(212,175,55,0.22)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  display: 'flex', alignItems: 'flex-start', gap: 12
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 11,
                    background: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#9333EA', flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(147,51,234,0.15)'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block' }}>
                      Sérénité & Climat
                    </span>
                    <strong style={{ fontSize: 13.5, color: '#0F172A', fontWeight: 700, display: 'block', marginTop: 2 }}>
                      {property.flood_risk === 'NUL' && 'Risque nul (Zone en hauteur)'}
                      {property.flood_risk === 'FAIBLE' && 'Zone bien drainée'}
                      {property.flood_risk === 'MOYEN' && 'Zone basse'}
                      {!property.flood_risk && 'Terrain stable'}
                    </strong>
                    <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                      Protection saison des pluies
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Localisation & Carte & Commodités */}
            <div className="detail-card">
              <h2 className="dsection-title">
                <i className="fas fa-map-location-dot" style={{ color: 'var(--or-d)', fontSize: 16 }}></i>
                Localisation
              </h2>
              <p className="dmap-sub">
                <strong style={{ color: 'var(--noir, #0F0D09)' }}>{locationLabel}</strong> — la position exacte est communiquée après confirmation de la demande de visite.
              </p>

              <button
                type="button"
                className="itineraire-btn"
                onClick={handleItineraire}
                disabled={itineraireLoading}
              >
                {itineraireLoading ? (
                  <>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                    <span>Localisation en cours…</span>
                  </>
                ) : routeOpened ? (
                  <>
                    <i className="fas fa-location-arrow"></i>
                    <span>Recalculer l'itinéraire depuis ma position</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-location-arrow"></i>
                    <span>Itinéraire depuis ma position</span>
                  </>
                )}
              </button>

              {itineraireStatus && (
                <div className={`itineraire-info ${itineraireStatus.type}`}>
                  {itineraireStatus.message}
                </div>
              )}

              <div className="detail-map" style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', height: '360px', border: '1px solid #E8E4DC', zIndex: 1 }}>
                <div ref={mapRef} style={{ width: '100%', height: '100%', filter: (!isAuthenticated || !user) ? 'blur(8px)' : 'none', pointerEvents: (!isAuthenticated || !user) ? 'none' : 'auto' }} />
                {!mapLoaded && (
                  <div style={{ position: 'absolute', inset: 0, background: '#E8E4DC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64605A', gap: 10, zIndex: 10 }}>
                    <svg viewBox="0 0 24 24" width="36" height="36" fill="var(--or, #D4AF37)" stroke="#0F0D09" strokeWidth="1.5">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span style={{ fontSize: 14, fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>Chargement de la carte satellite Google Maps…</span>
                  </div>
                )}
                {(!isAuthenticated || !user) && (
                  <div style={{
                    position: 'absolute', inset: 0, zIndex: 20,
                    background: 'rgba(15, 13, 9, 0.65)', backdropFilter: 'blur(5px)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '24px', textAlign: 'center', color: '#fff'
                  }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(212,175,55,0.22)', color: '#F6D365', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 12, border: '1.5px solid rgba(212,175,55,0.4)', boxShadow: '0 0 16px rgba(212,175,55,0.3)' }}>
                      🔒
                    </div>
                    <h4 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 17, fontWeight: 800, margin: '0 0 6px 0', color: '#fff' }}>Localisation protégée</h4>
                    <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.85)', margin: '0 0 16px 0', maxWidth: 340, lineHeight: 1.5 }}>
                      Connectez-vous pour débloquer la carte satellite interactive et l'itinéraire depuis votre position.
                    </p>
                    <button type="button" onClick={() => navigate('/login', { state: { from: `/properties/${id}` } })} style={{ padding: '11px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #D4AF37, #F6D365)', border: 0, color: '#0F0D09', fontWeight: 800, fontSize: 13.5, cursor: 'pointer', fontFamily: 'Poppins, sans-serif', boxShadow: '0 4px 15px rgba(212,175,55,0.4)' }}>
                      Se connecter pour voir la carte
                    </button>
                  </div>
                )}
              </div>

              {/* ── Points d'intérêt & Commodités du Quartier ── */}
              <div className="poi-section">
                <div className="poi-header-row">
                  <h3 className="poi-title">
                    <i className="fas fa-street-view" style={{ color: 'var(--or-d)' }}></i>
                    <span>Commodités & Proximité</span>
                  </h3>
                  <div className="poi-mode-tabs">
                    <button
                      type="button"
                      className={`poi-mode-tab ${poiTravelMode === 'walk' ? 'active' : ''}`}
                      onClick={() => setPoiTravelMode('walk')}
                    >
                      <i className="fas fa-person-walking"></i>
                      <span>À pied</span>
                    </button>
                    <button
                      type="button"
                      className={`poi-mode-tab ${poiTravelMode === 'drive' ? 'active' : ''}`}
                      onClick={() => setPoiTravelMode('drive')}
                    >
                      <i className="fas fa-car-side"></i>
                      <span>En voiture / Taxi</span>
                    </button>
                  </div>
                </div>

                <div className="poi-grid">
                  <div className="poi-card">
                    <div className="poi-icon-box">
                      <i className="fas fa-graduation-cap"></i>
                    </div>
                    <div className="poi-info">
                      <span className="poi-name">Écoles & Universités</span>
                      <span className="poi-sub">Campus & Collèges</span>
                    </div>
                    <span className="poi-time-pill">{poiTravelMode === 'walk' ? '5 min' : '2 min'}</span>
                  </div>

                  <div className="poi-card">
                    <div className="poi-icon-box">
                      <i className="fas fa-basket-shopping"></i>
                    </div>
                    <div className="poi-info">
                      <span className="poi-name">Supermarché & Marché</span>
                      <span className="poi-sub">Commerces vivres</span>
                    </div>
                    <span className="poi-time-pill">{poiTravelMode === 'walk' ? '3 min' : '1 min'}</span>
                  </div>

                  <div className="poi-card">
                    <div className="poi-icon-box">
                      <i className="fas fa-kit-medical"></i>
                    </div>
                    <div className="poi-info">
                      <span className="poi-name">Pharmacie & Soins</span>
                      <span className="poi-sub">Cliniques de garde</span>
                    </div>
                    <span className="poi-time-pill">{poiTravelMode === 'walk' ? '7 min' : '3 min'}</span>
                  </div>

                  <div className="poi-card">
                    <div className="poi-icon-box">
                      <i className="fas fa-taxi"></i>
                    </div>
                    <div className="poi-info">
                      <span className="poi-name">Axe & Dépôt Taxi</span>
                      <span className="poi-sub">Transports urbains</span>
                    </div>
                    <span className="poi-time-pill">{poiTravelMode === 'walk' ? '2 min' : '1 min'}</span>
                  </div>

                  <div className="poi-card">
                    <div className="poi-icon-box">
                      <i className="fas fa-utensils"></i>
                    </div>
                    <div className="poi-info">
                      <span className="poi-name">Restaurants & Cafés</span>
                      <span className="poi-sub">Boulangeries, snacks</span>
                    </div>
                    <span className="poi-time-pill">{poiTravelMode === 'walk' ? '4 min' : '2 min'}</span>
                  </div>

                  <div className="poi-card">
                    <div className="poi-icon-box">
                      <i className="fas fa-building-columns"></i>
                    </div>
                    <div className="poi-info">
                      <span className="poi-name">Banques & Guichets</span>
                      <span className="poi-sub">DAB & Agences Express</span>
                    </div>
                    <span className="poi-time-pill">{poiTravelMode === 'walk' ? '6 min' : '2 min'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Colonne Sidebar Contact (Sticky Desktop) ───────────────────── */}
          <div className="detail-sidebar">
            <div className="contact-card">
              <div className="contact-agence">
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#1A1A1A', color: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 'bold', margin: '0 auto 10px', border: '2px solid rgba(212,175,55,0.4)', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>
                  {property.owner?.first_name?.[0]}{property.owner?.last_name?.[0] || 'P'}
                </div>
                <div className="contact-name">{property.owner?.first_name || 'Bailleur Piolo'} {property.owner?.last_name || ''}</div>
                <div className="contact-role">
                  <i className="fas fa-bolt" style={{ color: 'var(--or-d)', marginRight: 4 }}></i>
                  Répond en moins de 2h
                </div>
              </div>

              <div className={`contact-verified ${ownerBadgeClass}`}>
                <i className={ownerVerificationLevel >= 3 ? "fas fa-crown" : ownerIsVerified ? "fas fa-circle-check" : "fas fa-shield-halved"}></i>
                <span>{ownerVerificationLevel >= 3 ? 'Bailleur Premium' : ownerIsVerified ? 'Bailleur Vérifié' : 'Bailleur Partenaire'}</span>
              </div>

              {property.status === 'RENTED' && !isOwner ? (
                <div style={{ padding: '13px 14px', borderRadius: 12, background: 'rgba(184,50,50,.08)', border: '1px solid rgba(184,50,50,.22)', color: '#9F2D2D', fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 700, textAlign: 'center' }}>
                  Logement déjà loué
                </div>
              ) : isOwner ? (
                <>
                  <Link to={`/properties/${property.slug || property.id}/update`} className="cbtn cbtn-primary" style={{ marginBottom: 12 }}>
                    <i className="fas fa-edit"></i>
                    Modifier l'annonce
                  </Link>
                  <button className="cbtn cbtn-outline" style={{ borderColor: '#C0392B', color: '#C0392B' }}>
                    <i className="fas fa-box-archive"></i>
                    Archiver l'annonce
                  </button>
                </>
              ) : property.transaction_type === 'COURTE_DUREE' ? (
                    <div style={{
                      background: 'linear-gradient(145deg, #F0FDF4 0%, #ECFDF5 100%)',
                      border: '1.5px solid rgba(16, 185, 129, 0.4)',
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 14,
                      boxShadow: '0 4px 14px rgba(5,150,105,0.06)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div>
                          <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#059669', letterSpacing: '0.5px', display: 'block' }}>
                            Réservation Séjour
                          </span>
                          <span style={{ fontSize: 20, fontWeight: 800, color: '#065F46', fontFamily: 'Poppins, sans-serif' }}>
                            {new Intl.NumberFormat('fr-FR').format(property.price || 0)} <span style={{ fontSize: 13, fontWeight: 600 }}>FCFA / nuit</span>
                          </span>
                        </div>
                        <span style={{ background: '#D1FAE5', color: '#065F46', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>
                          <i className="fas fa-bolt" style={{ color: '#10B981', marginRight: 4 }}></i> Immédiat
                        </span>
                      </div>

                      {/* Dates Check-in / Check-out */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 8,
                        background: '#fff',
                        padding: '8px 10px',
                        borderRadius: 12,
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        marginBottom: 10
                      }}>
                        <div>
                          <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#6B7280', display: 'block', marginBottom: 2 }}>
                            Arrivée
                          </label>
                          <input
                            type="date"
                            min={todayDate}
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                            style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 12, fontWeight: 700, color: '#111827', outline: 'none' }}
                          />
                        </div>
                        <div style={{ borderLeft: '1px solid #E5E7EB', paddingLeft: 8 }}>
                          <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#6B7280', display: 'block', marginBottom: 2 }}>
                            Départ
                          </label>
                          <input
                            type="date"
                            min={checkInDate || todayDate}
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 12, fontWeight: 700, color: '#111827', outline: 'none' }}
                          />
                        </div>
                      </div>

                      {/* Voyageurs */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#fff',
                        padding: '8px 10px',
                        borderRadius: 12,
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        marginBottom: 12
                      }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
                          <i className="fas fa-users" style={{ color: '#10B981', marginRight: 6 }}></i>
                          Voyageurs
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => setGuestsCount(g => Math.max(1, g - 1))}
                            style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #D1D5DB', background: '#F9FAFB', cursor: 'pointer', fontWeight: 800 }}
                          >
                            -
                          </button>
                          <span style={{ fontSize: 13, fontWeight: 800, minWidth: 16, textAlign: 'center' }}>{guestsCount}</span>
                          <button
                            type="button"
                            onClick={() => setGuestsCount(g => Math.min(8, g + 1))}
                            style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #D1D5DB', background: '#F9FAFB', cursor: 'pointer', fontWeight: 800 }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      {isDateBlocked && (
                        <div style={{
                          background: '#FEF2F2',
                          color: '#991B1B',
                          border: '1px solid #FCA5A5',
                          borderRadius: 10,
                          padding: '8px 10px',
                          fontSize: 11,
                          fontWeight: 700,
                          marginBottom: 10,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}>
                          <i className="fas fa-calendar-xmark" style={{ color: '#DC2626' }}></i>
                          <span>Dates indisponibles ou déjà réservées sur ce bien.</span>
                        </div>
                      )}

                      <button
                        type="button"
                        className="cbtn cbtn-primary"
                        onClick={handleOpenBooking}
                        disabled={isDateBlocked}
                        style={{
                          width: '100%',
                          background: isDateBlocked ? '#9CA3AF' : 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                          color: '#fff',
                          border: 'none',
                          padding: '13px 16px',
                          borderRadius: 12,
                          fontSize: 14,
                          fontWeight: 800,
                          cursor: isDateBlocked ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          boxShadow: isDateBlocked ? 'none' : '0 4px 14px rgba(5,150,105,0.35)',
                          marginBottom: 8,
                          transition: 'all 0.2s ease',
                          opacity: isDateBlocked ? 0.7 : 1
                        }}
                      >
                        <i className={isDateBlocked ? "fas fa-lock" : "fas fa-calendar-check"}></i>
                        {isDateBlocked ? 'Dates indisponibles' : `Réserver ce séjour (${new Intl.NumberFormat('fr-FR').format(stayTotalPrice)} F)`}
                      </button>

                      {/* Live calculation */}
                      <div style={{
                        background: 'rgba(255,255,255,0.7)',
                        borderRadius: 10,
                        padding: '10px 12px',
                        marginBottom: 12,
                        fontSize: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
                          <span>{new Intl.NumberFormat('fr-FR').format(property.price || 0)} F × {stayNights} nuit{stayNights > 1 ? 's' : ''}</span>
                          <span style={{ fontWeight: 700, color: '#111827' }}>
                            {new Intl.NumberFormat('fr-FR').format(stayTotalPrice)} FCFA
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontSize: 11.5 }}>
                          <span><i className="fas fa-check-circle" style={{ marginRight: 4 }}></i> Eau, Élec, Wi-Fi</span>
                          <span style={{ fontWeight: 700 }}>Inclus</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          borderTop: '1px dashed #D1D5DB',
                          paddingTop: 6,
                          fontSize: 13,
                          fontWeight: 800,
                          color: '#065F46'
                        }}>
                          <span>Total estimé</span>
                          <span>{new Intl.NumberFormat('fr-FR').format(stayTotalPrice)} FCFA</span>
                        </div>
                      </div>


                      <button
                        type="button"
                        onClick={handleContactBailleur}
                        style={{
                          width: '100%',
                          padding: '9px',
                          borderRadius: 10,
                          background: '#fff',
                          color: '#374151',
                          border: '1px solid #D1D5DB',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6
                        }}
                      >
                        <i className="fas fa-comment-dots" style={{ color: '#059669' }}></i>
                        Poser une question à l'hôte
                      </button>
                    </div>
                  ) : (
                    <>
                      <button type="button" className="cbtn cbtn-primary" onClick={handleContactBailleur}>
                        <i className="fas fa-comment-dots"></i>
                        {property.transaction_type === 'VENTE' ? 'Contacter le vendeur' : 'Contacter le bailleur'}
                      </button>
                      <button type="button" className="cbtn cbtn-outline" onClick={handleOpenVisite}>
                        <i className="fas fa-calendar-check"></i>
                        Demander une visite
                      </button>
                      {property.transaction_type === 'LOCATION' && (
                        <button type="button" className="cbtn cbtn-ghost" onClick={handleOpenLocation}>
                          <i className="fas fa-file-contract"></i>
                          Faire une demande de location
                        </button>
                      )}
                      {property.transaction_type === 'VENTE' && (
                        <button
                          type="button"
                          className="cbtn cbtn-ghost"
                          onClick={handleContactBailleur}
                          style={{
                            background: 'rgba(29, 78, 216, 0.08)',
                            color: '#1D4ED8',
                            border: '1.5px solid #3B82F6',
                            fontWeight: 700
                          }}
                        >
                          <i className="fas fa-handshake"></i>
                          Faire une offre d'achat
                        </button>
                      )}
                    </>
                  )}

              <div className="contact-share">
                <span>{t('property_detail.share_property_label', 'Partager le bien :')}</span>
                <a href="#" onClick={(e) => { e.preventDefault(); navigator.share?.({ title: property.title, url: window.location.href }); }}>
                  <i className="fas fa-share-nodes"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Biens similaires au fond de la page (masqué pour le Bailleur) */}
        {!(user?.role === 'BAILLEUR' || user?.is_bailleur) && property.similar_properties && property.similar_properties.length > 0 && (
          <div className="similar-properties-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 4, height: 28, background: 'var(--or, #D4AF37)', borderRadius: 4 }}></div>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 22, fontWeight: 800, color: 'var(--noir, #0F0D09)', letterSpacing: '-0.4px', margin: 0 }}>
                {t('property_detail.similar_properties_title', 'Biens similaires à découvrir')}
              </h2>
            </div>
            <div className="similar-props-grid">
              {property.similar_properties.map(prop => (
                <PropertyCard 
                  key={prop.id} 
                  property={prop} 
                  onFavChange={toggleSimilarFavorite} 
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky Floating Action Bar pour Mobile (< 850px) ────────────────── */}
      <div className="mobile-sticky-action-bar">
        <div className="msab-price-col">
          <div className="msab-price">
            {new Intl.NumberFormat('fr-FR').format(property.price || 0)} FCFA
          </div>
          <div className="msab-period">
            {property.transaction_type === 'COURTE_DUREE'
              ? 'par nuit'
              : property.transaction_type === 'VENTE'
              ? 'Prix total'
              : 'par mois'}
          </div>
        </div>

        <div className="msab-actions">
          {property.status === 'RENTED' && !isOwner ? (
            <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(184,50,50,0.15)', color: '#FF6B6B', fontSize: 12, fontWeight: 700 }}>
              Déjà loué
            </div>
          ) : isOwner ? (
            <Link
              to={`/properties/${property.slug || property.id}/update`}
              className="msab-btn-primary"
              style={{ textDecoration: 'none' }}
            >
              <i className="fas fa-edit" style={{ marginRight: 5 }}></i>
              Modifier
            </Link>
          ) : (
            <>
              <button
                type="button"
                className="msab-btn-msg"
                onClick={handleContactBailleur}
                title="Message direct au bailleur"
                aria-label="Envoyer un message"
              >
                <i className="fas fa-comment-dots"></i>
              </button>

              <button
                type="button"
                className="msab-btn-primary"
                onClick={handleOpenVisite}
              >
                <i className="fas fa-calendar-check" style={{ marginRight: 6 }}></i>
                Visiter
              </button>

              {property.transaction_type === 'LOCATION' && (
                <button
                  type="button"
                  className="msab-btn-dossier"
                  onClick={handleOpenLocation}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    color: '#F6D365',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <i className="fas fa-file-contract"></i>
                  Dossier
                </button>
              )}

              {property.transaction_type === 'COURTE_DUREE' && (
                <button
                  type="button"
                  className="msab-btn-dossier"
                  onClick={handleOpenBooking}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '10px',
                    background: 'rgba(5, 150, 105, 0.25)',
                    border: '1px solid rgba(16, 185, 129, 0.6)',
                    color: '#34D399',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <i className="fas fa-calendar-alt"></i>
                  Réserver
                </button>
              )}

              {property.transaction_type === 'VENTE' && (
                <button
                  type="button"
                  className="msab-btn-dossier"
                  onClick={handleContactBailleur}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '10px',
                    background: 'rgba(29, 78, 216, 0.25)',
                    border: '1px solid rgba(59, 130, 246, 0.6)',
                    color: '#93C5FD',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <i className="fas fa-handshake"></i>
                  Offre
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Modal Réservation Court Séjour — PIOLO ─────────────────────────── */}
      {bookingModalOpen && (
        <div className="dmodal" onClick={(e) => { if (e.target.className === 'dmodal') setBookingModalOpen(false); }}>
          <div className="dmodal-content" style={{ maxWidth: 480 }}>
            <button className="dmodal-close" onClick={() => setBookingModalOpen(false)} aria-label="Fermer">&times;</button>
            <div className="dmodal-header" style={{ color: '#065F46' }}>
              <i className="fas fa-calendar-check" style={{ color: '#10B981', marginRight: 8, fontSize: 18 }}></i>
              <span>Réserver votre court séjour</span>
            </div>

            {bookingSuccess ? (
              <div style={{ padding: '24px 20px', textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 14px' }}>
                  <i className="fas fa-check"></i>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#065F46', marginBottom: 8 }}>Demande transmise !</h3>
                <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.5, marginBottom: 16 }}>
                  Votre demande a été envoyée à l'hôte avec vos dates et le calcul du séjour. Redirection vers la messagerie en cours...
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking}>
                <div className="loc-panel">
                  {/* Property mini recap */}
                  <div style={{
                    display: 'flex',
                    gap: 12,
                    padding: 12,
                    background: '#F0FDF4',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: 12,
                    marginBottom: 16,
                    alignItems: 'center'
                  }}>
                    {allImages[0] && (
                      <img src={allImages[0]} alt="Logement" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {property.title}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#059669', fontWeight: 600 }}>
                        {property.neighborhood || property.city} &middot; {new Intl.NumberFormat('fr-FR').format(property.price || 0)} FCFA / nuit
                      </div>
                    </div>
                  </div>

                  {/* Date Inputs in Modal */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <div>
                      <label className="dmodal-label" style={{ fontSize: 11, textTransform: 'uppercase', color: '#4B5563' }}>
                        Arrivée
                      </label>
                      <input
                        type="date"
                        min={todayDate}
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="dmodal-input"
                        style={{ padding: '8px 10px', fontSize: 13 }}
                        required
                      />
                    </div>
                    <div>
                      <label className="dmodal-label" style={{ fontSize: 11, textTransform: 'uppercase', color: '#4B5563' }}>
                        Départ
                      </label>
                      <input
                        type="date"
                        min={checkInDate || todayDate}
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="dmodal-input"
                        style={{ padding: '8px 10px', fontSize: 13 }}
                        required
                      />
                    </div>
                  </div>

                  {/* Guests in Modal */}
                  <div style={{ marginBottom: 14 }}>
                    <label className="dmodal-label" style={{ fontSize: 11, textTransform: 'uppercase', color: '#4B5563' }}>
                      Nombre de voyageurs
                    </label>
                    <select
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(Number(e.target.value))}
                      className="dmodal-input"
                      style={{ padding: '8px 10px', fontSize: 13 }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                        <option key={n} value={n}>{n} voyageur{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  {/* Summary Box */}
                  <div style={{
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: 12,
                    padding: '12px 14px',
                    marginBottom: 14
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#4B5563', marginBottom: 4 }}>
                      <span>Durée du séjour :</span>
                      <strong style={{ color: '#111827' }}>{stayNights} nuitée{stayNights > 1 ? 's' : ''}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#4B5563', marginBottom: 4 }}>
                      <span>Tarif par nuitée :</span>
                      <span>{new Intl.NumberFormat('fr-FR').format(property.price || 0)} FCFA</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, color: '#065F46', borderTop: '1px solid #E5E7EB', paddingTop: 8, marginTop: 6 }}>
                      <span>Total séjour estimé :</span>
                      <span>{new Intl.NumberFormat('fr-FR').format(stayTotalPrice)} FCFA</span>
                    </div>
                  </div>

                  {/* Note for Host */}
                  <div style={{ marginBottom: 14 }}>
                    <label className="dmodal-label" style={{ fontSize: 11, textTransform: 'uppercase', color: '#4B5563' }}>
                      Message ou demande spéciale pour l'hôte (optionnel)
                    </label>
                    <textarea
                      rows={2}
                      className="dmodal-textarea"
                      placeholder="Ex: Arrivée prévue vers 16h, besoin de parking..."
                      value={bookingMsg}
                      onChange={(e) => setBookingMsg(e.target.value)}
                      style={{ fontSize: 12.5 }}
                    />
                  </div>

                  {/* WhatsApp Alternative */}
                  <button
                    type="button"
                    onClick={handleBookingWhatsAppClick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '11px',
                      borderRadius: 10,
                      background: '#25D366',
                      border: 'none',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 700,
                      textDecoration: 'none',
                      marginBottom: 10,
                      boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)',
                      cursor: 'pointer'
                    }}
                  >
                    <i className="fab fa-whatsapp" style={{ fontSize: 16 }}></i>
                    Réserver directement sur WhatsApp
                  </button>
                </div>

                <div className="dmodal-footer" style={{ borderTop: '1px solid #E5E7EB', padding: '14px 18px' }}>
                  <button type="button" className="dmodal-btn-cancel" onClick={() => setBookingModalOpen(false)}>
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={bookingSubmitting || stayNights <= 0}
                    className="dmodal-btn-submit"
                    style={{
                      background: 'linear-gradient(135deg, #059669, #10B981)',
                      color: '#fff',
                      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                    }}
                  >
                    {bookingSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Transmission...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i> Envoyer la réservation
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Modal Demande de Visite — PIOLO ─────────────────────────────────── */}
      {visiteModalOpen && (
        <div className="dmodal" onClick={(e) => { if(e.target.className === 'dmodal') setVisiteModalOpen(false); }}>
          <div className="dmodal-content">
            <div className="dmodal-drag-handle" aria-hidden="true"></div>
            <button className="dmodal-close" onClick={() => setVisiteModalOpen(false)} aria-label="Fermer">&times;</button>
            <div className="dmodal-header">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/>
              </svg>
              <span>Demander une visite</span>
            </div>
            <div className="dmodal-scroll-body">
              <div className="dmodal-pts-notice">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                <span>Cette demande déduira <strong>{isVipTenant ? '0 point (Inclus VIP)' : '5 points'}</strong> de votre solde. Solde actuel : <strong>{currentPointsBalance} pts</strong></span>
              </div>
              <form onSubmit={handleVisitSubmit}>
                <div className="loc-panel">
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                    <button type="button" className="budget-pill-btn" onClick={() => setVisitDate(getQuickDate(0))}>Aujourd'hui</button>
                    <button type="button" className="budget-pill-btn" onClick={() => setVisitDate(getQuickDate(1))}>Demain</button>
                    <button type="button" className="budget-pill-btn" onClick={() => setVisitDate(getNextSaturdayDate())}>Ce samedi</button>
                  </div>
                  <div className="dmodal-row">
                    <div className="dmodal-field">
                      <label htmlFor="visit-date">Date souhaitée *</label>
                      <input type="date" id="visit-date" required min={todayDate} className="dmodal-input" value={visitDate} onChange={e => setVisitDate(e.target.value)} />
                    </div>
                    <div className="dmodal-field">
                      <label htmlFor="visit-time">Heure souhaitée</label>
                      <input type="time" id="visit-time" className="dmodal-input" value={visitTime} onChange={e => setVisitTime(e.target.value)} />
                    </div>
                  </div>
                  <div className="dmodal-field">
                    <label htmlFor="visit-message">Message au bailleur</label>
                    <textarea id="visit-message" rows="3" placeholder="Présentez-vous brièvement, précisez vos disponibilités…" className="dmodal-input dmodal-textarea" value={visitMessage} onChange={e => setVisitMessage(e.target.value)}></textarea>
                  </div>
                </div>
                {visitError && <div className="dmodal-error">{visitError}</div>}
                <div className="dmodal-footer">
                  <button type="button" className="dmodal-btn-cancel" onClick={() => setVisiteModalOpen(false)}>Annuler</button>
                  <button type="submit" className="dmodal-btn-submit" disabled={visitSubmitting}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                    {visitSubmitting ? 'Envoi en cours…' : isVipTenant ? 'Envoyer la demande (Gratuit VIP)' : 'Envoyer la demande (−5 pts)'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Demande de Location — PIOLO ──────────────────────────────── */}
      {locationModalOpen && (
        <div className="dmodal" onClick={(e) => { if(e.target.className === 'dmodal') setLocationModalOpen(false); }}>
          <div className="dmodal-content dmodal-xl">
            <div className="dmodal-drag-handle" aria-hidden="true"></div>
            <button className="dmodal-close" onClick={() => setLocationModalOpen(false)} aria-label="Fermer">&times;</button>
            <div className="dmodal-header">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
              <span>Dossier de location</span>
            </div>

            {/* Progress steps — sticky, outside scroll body */}
            <div className="loc-steps">
              <div className={`loc-step ${locStep === 1 ? 'active' : locStep > 1 ? 'completed' : ''}`} onClick={() => setLocStep(1)}>
                <span className="ls-num">1</span><span className="ls-lbl">Infos</span>
              </div>
              <div className="loc-step-line"></div>
              <div className={`loc-step ${locStep === 2 ? 'active' : locStep > 2 ? 'completed' : ''}`} onClick={() => { if(locStep >= 1) setLocStep(2); }}>
                <span className="ls-num">2</span><span className="ls-lbl">{t('property_detail.specs_rooms', 'Pièces')}</span>
              </div>
              <div className="loc-step-line"></div>
              <div className={`loc-step ${locStep === 3 ? 'active' : ''}`} onClick={() => { if(locStep >= 2) setLocStep(3); }}>
                <span className="ls-num">3</span><span className="ls-lbl">Garant</span>
              </div>
            </div>

            <div className="dmodal-scroll-body">
              <div className="dmodal-pts-notice">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <span>Cette demande déduira <strong>{isVipTenant ? '0 point (Inclus VIP)' : '6 points'}</strong> de votre solde. Solde actuel : <strong>{currentPointsBalance} pts</strong></span>
              </div>

              <form onSubmit={e => e.preventDefault()}>
                {/* Étape 1 — Infos personnelles */}
                {locStep === 1 && (
                  <div className="loc-panel">
                    <div className="dmodal-row">
                      <div className="dmodal-field">
                        <label htmlFor="loc-movein">Date d'entrée souhaitée *</label>
                        <input type="date" id="loc-movein" required min={todayDate} className="dmodal-input" value={locMoveIn} onChange={e => setLocMoveIn(e.target.value)} />
                      </div>
                      <div className="dmodal-field">
                        <label htmlFor="loc-duration">Durée (mois)</label>
                        <select id="loc-duration" className="dmodal-input" value={locDuration} onChange={e => setLocDuration(e.target.value)}>
                          <option value="6">6 mois</option>
                          <option value="12">12 mois</option>
                          <option value="24">24 mois</option>
                          <option value="36">36 mois</option>
                        </select>
                      </div>
                    </div>
                    <div className="dmodal-row">
                      <div className="dmodal-field">
                        <label htmlFor="loc-occupants">Nombre d'occupants</label>
                        <input type="number" id="loc-occupants" min="1" max="10" className="dmodal-input" value={locOccupants} onChange={e => setLocOccupants(e.target.value)} />
                      </div>
                      <div className="dmodal-field">
                        <label htmlFor="loc-income">Revenus mensuels (FCFA)</label>
                        <input type="number" id="loc-income" placeholder="Ex: 250000" className="dmodal-input" value={locIncome} onChange={e => setLocIncome(e.target.value)} />
                      </div>
                    </div>
                    <div className="dmodal-row">
                      <div className="dmodal-field">
                        <label htmlFor="loc-profession">Profession</label>
                        <input type="text" id="loc-profession" placeholder="Ex: Ingénieur, Commerçant…" className="dmodal-input" value={locProfession} onChange={e => setLocProfession(e.target.value)} />
                      </div>
                      <div className="dmodal-field">
                        <label htmlFor="loc-employer">Employeur</label>
                        <input type="text" id="loc-employer" placeholder="Ex: Orange Cameroun" className="dmodal-input" value={locEmployer} onChange={e => setLocEmployer(e.target.value)} />
                      </div>
                    </div>
                    <div className="dmodal-field">
                      <label htmlFor="loc-message">Lettre de motivation</label>
                      <textarea id="loc-message" rows="3" placeholder="Présentez-vous, expliquez votre projet de location…" className="dmodal-input dmodal-textarea" value={locMessage} onChange={e => setLocMessage(e.target.value)}></textarea>
                    </div>
                  </div>
                )}

                {/* Étape 2 — Pièces justificatives */}
                {locStep === 2 && (
                  <div className="loc-panel">
                    <div className="dmodal-hint">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{verticalAlign:'middle', marginRight:4}}><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg>
                      Formats acceptés : JPG, PNG, PDF — max 5 Mo chacun
                    </div>
                    <div className="dmodal-upload-row">
                      <div className={`dmodal-upload-zone ${cniFront ? 'has-file' : ''}`}>
                        <label htmlFor="loc-cni-front">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 2.75c1.24 0 2.25 1.01 2.25 2.25S13.24 11.25 12 11.25 9.75 10.24 9.75 9s1.01-2.25 2.25-2.25zM20 18H4v-.57c0-.81.48-1.53 1.22-1.85C6.88 14.71 9.36 14 12 14s5.12.71 6.78 1.58c.74.32 1.22 1.04 1.22 1.85V18z"/></svg>
                          <span>CNI recto *</span>
                          <small>Recto carte d'identité</small>
                        </label>
                        <input type="file" id="loc-cni-front" accept=".jpg,.jpeg,.png,.pdf" className="visually-hidden" onChange={e => setCniFront(e.target.files[0] || null)} />
                        <div className="upload-filename">{cniFront ? cniFront.name : 'Aucun fichier'}</div>
                      </div>

                      <div className={`dmodal-upload-zone ${cniBack ? 'has-file' : ''}`}>
                        <label htmlFor="loc-cni-back">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 2.75c1.24 0 2.25 1.01 2.25 2.25S13.24 11.25 12 11.25 9.75 10.24 9.75 9s1.01-2.25 2.25-2.25zM20 18H4v-.57c0-.81.48-1.53 1.22-1.85C6.88 14.71 9.36 14 12 14s5.12.71 6.78 1.58c.74.32 1.22 1.04 1.22 1.85V18z"/></svg>
                          <span>CNI verso</span>
                          <small>Verso carte d'identité</small>
                        </label>
                        <input type="file" id="loc-cni-back" accept=".jpg,.jpeg,.png,.pdf" className="visually-hidden" onChange={e => setCniBack(e.target.files[0] || null)} />
                        <div className="upload-filename">{cniBack ? cniBack.name : 'Aucun fichier'}</div>
                      </div>

                      <div className={`dmodal-upload-zone ${incomeProof ? 'has-file' : ''}`}>
                        <label htmlFor="loc-income-proof">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                          <span>Justificatif de revenus</span>
                          <small>Fiche paie, relevé…</small>
                        </label>
                        <input type="file" id="loc-income-proof" accept=".jpg,.jpeg,.png,.pdf" className="visually-hidden" onChange={e => setIncomeProof(e.target.files[0] || null)} />
                        <div className="upload-filename">{incomeProof ? incomeProof.name : 'Aucun fichier'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Étape 3 — Garant */}
                {locStep === 3 && (
                  <div className="loc-panel">
                    <label className="dmodal-toggle">
                      <input type="checkbox" checked={hasGuarantor} onChange={e => setHasGuarantor(e.target.checked)} />
                      <span>J'ai un garant</span>
                    </label>

                    {hasGuarantor && (
                      <div style={{ marginTop: 16 }}>
                        <div className="dmodal-row">
                          <div className="dmodal-field">
                            <label htmlFor="guar-name">Nom complet *</label>
                            <input type="text" id="guar-name" className="dmodal-input" value={guarantorName} onChange={e => setGuarantorName(e.target.value)} />
                          </div>
                          <div className="dmodal-field">
                            <label htmlFor="guar-phone">Téléphone</label>
                            <input type="tel" id="guar-phone" placeholder="+237 6XX XXX XXX" className="dmodal-input" value={guarantorPhone} onChange={e => setGuarantorPhone(e.target.value)} />
                          </div>
                        </div>
                        <div className="dmodal-row">
                          <div className="dmodal-field">
                            <label htmlFor="guar-relation">Lien avec le garant</label>
                            <select id="guar-relation" className="dmodal-input" value={guarantorRelation} onChange={e => setGuarantorRelation(e.target.value)}>
                              <option value="">Sélectionner...</option>
                              <option value="parent">Parent</option>
                              <option value="frere_soeur">Frère / Sœur</option>
                              <option value="conjoint">Conjoint(e)</option>
                              <option value="collegue">Collègue</option>
                              <option value="ami">Ami(e)</option>
                              <option value="autre">Autre</option>
                            </select>
                          </div>
                          <div className="dmodal-field">
                            <label htmlFor="guar-income">Revenus mensuels (FCFA)</label>
                            <input type="number" id="guar-income" placeholder="Ex: 300000" className="dmodal-input" value={guarantorIncome} onChange={e => setGuarantorIncome(e.target.value)} />
                          </div>
                        </div>
                        <div className={`dmodal-upload-zone ${guarantorCni ? 'has-file' : ''}`} style={{ marginTop: 12 }}>
                          <label htmlFor="guar-cni">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                            <span>CNI du garant</span>
                          </label>
                          <input type="file" id="guar-cni" accept=".jpg,.jpeg,.png,.pdf" className="visually-hidden" onChange={e => setGuarantorCni(e.target.files[0] || null)} />
                          <div className="upload-filename">{guarantorCni ? guarantorCni.name : 'Aucun fichier'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Complétion du dossier visible en permanence */}
                <div className="dossier-completion">
                  <div className="dc-label">
                    <span>Complétude du dossier</span>
                    <span style={{ color: 'var(--or-d)', fontSize: 13.5, fontWeight: 800 }}>{completionPct}%</span>
                  </div>
                  <div className="dc-bar"><div className="dc-fill" style={{ width: `${completionPct}%` }}></div></div>
                </div>

                {locError && <div className="dmodal-error">{locError}</div>}

                {/* Navigation entre étapes */}
                <div className="dmodal-footer">
                  {locStep > 1 && (
                    <button key="btn-prev" type="button" className="dmodal-btn-cancel" onClick={() => { setLocError(''); setLocStep(s => s - 1); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                      Précédent
                    </button>
                  )}
                  <button key="btn-cancel" type="button" className="dmodal-btn-cancel" onClick={() => setLocationModalOpen(false)}>Annuler</button>
                  {locStep < 3 ? (
                    <button key="btn-next" type="button" className="dmodal-btn-next" onClick={() => {
                      if (locStep === 1 && !locMoveIn) {
                        setLocError("Veuillez renseigner la date d'entrée souhaitée avant de continuer.");
                        return;
                      }
                      setLocError('');
                      setLocStep(s => s + 1);
                    }}>
                      Suivant
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                    </button>
                  ) : (
                    <button key="btn-submit" type="button" className="dmodal-btn-submit" disabled={locSubmitting} onClick={handleLocationSubmit}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                      {locSubmitting ? 'Envoi en cours…' : isVipTenant ? 'Envoyer le dossier (Gratuit VIP)' : 'Envoyer le dossier (−6 pts)'}
                    </button>
                  )}
                </div>
              </form>
            </div>{/* /dmodal-scroll-body */}
          </div>
        </div>
      )}



      {/* ── Toast de confirmation ───────────────────────────────────────────── */}
      {toastMsg && (
        <div style={{ position: 'fixed', bottom: 28, right: 28, background: '#0F0D09', color: '#fff', padding: '14px 22px', borderRadius: 14, boxShadow: '0 10px 35px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'Poppins, sans-serif', fontSize: 13.5, fontWeight: 600, zIndex: 99999, borderLeft: '4px solid #1E7A47', maxWidth: '400px', animation: 'fadeIn 0.3s ease' }}>
          <svg width="20" height="20" fill="#1E7A47" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
          <span>{toastMsg}</span>
        </div>
      )}



      {/* ── Lightbox Image Viewer ───────────────────────────────────────────── */}
      {lightboxOpen && allImages[lightboxImgIndex] && (
        <div 
          className="image-lightbox" 
          onClick={() => setLightboxOpen(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button type="button" className="lightbox-close" onClick={() => setLightboxOpen(false)}>×</button>
          
          <button type="button" className="lightbox-nav prev" onClick={handleLightboxPrev}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={allImages[lightboxImgIndex]} 
              alt="Agrandissement" 
              className="lightbox-img" 
              style={{ cursor: 'pointer' }}
              onClick={handleLightboxNext} // Zapper à la photo suivante au clic sur l'image
              title="Cliquez pour passer à l'image suivante"
            />
            <div className="lightbox-counter">
              {lightboxImgIndex + 1} / {allImages.length}
            </div>
          </div>
          
          <button type="button" className="lightbox-nav next" onClick={handleLightboxNext}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      )}

      {/* ── Dock Flottant de Comparaison Rapide ──────────────────────────── */}
      {compareList.length > 0 && !compareModalOpen && (
        <div className="compare-dock">
          <div className="compare-dock-count">{compareList.length}</div>
          <div className="compare-dock-text" onClick={() => setCompareModalOpen(true)}>
            {compareList.length === 1 ? '1 bien sélectionné' : `${compareList.length} biens à comparer`}
          </div>
          <button
            type="button"
            className="compare-dock-btn"
            onClick={() => setCompareModalOpen(true)}
          >
            <i className="fas fa-scale-balanced" style={{ marginRight: 6 }}></i>
            Comparer
          </button>
          <button
            type="button"
            className="compare-dock-close"
            onClick={clearCompare}
            title="Vider le comparateur"
            aria-label="Vider le comparateur"
          >
            <i className="fas fa-xmark"></i>
          </button>
        </div>
      )}

      {/* ── Modale Comparateur Côte-à-Côte ───────────────────────────────── */}
      {compareModalOpen && (
        <div className="dmodal" onClick={() => setCompareModalOpen(false)}>
          <div className="dmodal-content dmodal-xl" onClick={e => e.stopPropagation()}>
            <div className="dmodal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="fas fa-scale-balanced" style={{ color: 'var(--or-d)', fontSize: 20 }}></i>
                <span>Comparateur de Biens Piolo</span>
                <span className="budget-sim-badge">{compareList.length} / 4 biens</span>
              </div>
              <button type="button" className="dmodal-close" onClick={() => setCompareModalOpen(false)}>×</button>
            </div>

            <div className="compare-grid-modal">
              {compareList.map((cp) => (
                <div key={cp.id} className={`compare-col-card ${cp.id === property?.id ? 'current' : ''}`}>
                  <div className="compare-card-thumb">
                    {cp.main_image ? (
                      <img src={cp.main_image} alt={cp.title} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#E8E4DC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                        <i className="fas fa-image" style={{ fontSize: 32 }}></i>
                      </div>
                    )}
                    <button
                      type="button"
                      className="compare-card-remove"
                      onClick={() => removeFromCompare(cp.id)}
                      title="Retirer de la comparaison"
                    >
                      <i className="fas fa-trash-can"></i>
                    </button>
                  </div>
                  <div className="compare-card-content">
                    <h4 className="compare-card-title">{cp.title}</h4>
                    <div className="compare-card-price">
                      {new Intl.NumberFormat('fr-FR').format(cp.price || 0)} FCFA {cp.transaction_type === 'LOCATION' ? '/mois' : ''}
                    </div>

                    <ul className="compare-spec-list">
                      <li className="compare-spec-item">
                        <span className="compare-spec-label">Type</span>
                        <span className="compare-spec-val">{cp.property_type_display || 'Logement'}</span>
                      </li>
                      <li className="compare-spec-item">
                        <span className="compare-spec-label">Emplacement</span>
                        <span className="compare-spec-val">{cp.neighborhood ? `${cp.neighborhood}, ` : ''}{cp.city}</span>
                      </li>
                      <li className="compare-spec-item">
                        <span className="compare-spec-label">Surface</span>
                        <span className="compare-spec-val">{cp.area || '—'} m²</span>
                      </li>
                      <li className="compare-spec-item">
                        <span className="compare-spec-label">{t('property_detail.specs_bedrooms', 'Chambres')}</span>
                        <span className="compare-spec-val">{cp.bedrooms || '—'}</span>
                      </li>
                      <li className="compare-spec-item">
                        <span className="compare-spec-label">{t('property_detail.specs_bathrooms', 'Salles de bain')}</span>
                        <span className="compare-spec-val">{cp.bathrooms || '—'}</span>
                      </li>
                      <li className="compare-spec-item">
                        <span className="compare-spec-label">Prix / m²</span>
                        <span className="compare-spec-val">
                          {cp.area && cp.price ? `${new Intl.NumberFormat('fr-FR').format(Math.round(cp.price / cp.area))} F/m²` : '—'}
                        </span>
                      </li>
                    </ul>

                    <div style={{ marginTop: 'auto', paddingTop: 10 }}>
                      {cp.id !== property?.id ? (
                        <Link
                          to={`/properties/${cp.slug || cp.id}`}
                          onClick={() => setCompareModalOpen(false)}
                          style={{ display: 'block', textAlign: 'center', padding: '10px 14px', borderRadius: 10, background: 'linear-gradient(135deg, #D4AF37, #F6D365)', color: '#0F0D09', fontWeight: 800, fontSize: 12.5, textDecoration: 'none', fontFamily: 'Poppins, sans-serif' }}
                        >
                          Voir cette annonce →
                        </Link>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '10px 14px', borderRadius: 10, background: 'rgba(212,175,55,0.15)', color: 'var(--or-d)', fontWeight: 800, fontSize: 12.5, fontFamily: 'Poppins, sans-serif' }}>
                          Bien actuellement affiché
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="dmodal-footer">
              <button
                type="button"
                className="dmodal-btn-cancel"
                onClick={clearCompare}
              >
                Tout effacer
              </button>
              <button
                type="button"
                className="dmodal-btn-submit"
                onClick={() => setCompareModalOpen(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modale d'avertissement Compte Locataire Requis (Pro / Bailleur) ── */}
      {roleRestrictionModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10005,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: '#141210', border: '1.5px solid rgba(212,175,55,0.4)',
            borderRadius: 24, padding: '28px 24px', maxWidth: 420, width: '100%',
            textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: 'rgba(212,175,55,0.15)',
              color: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', border: '1px solid rgba(212,175,55,0.3)'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div>
            <h3 style={{ fontFamily: "'Poppins', sans-serif", color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
              Compte Locataire Requis
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13.5, lineHeight: 1.5, marginBottom: 24, fontFamily: "'DM Sans', sans-serif" }}>
              En tant que {isPro ? 'professionnel' : 'bailleur'}, pour consulter les coordonnées, contacter le bailleur ou réserver une visite, vous devez créer ou utiliser un compte Locataire.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={() => navigate('/login?tab=register&role=LOCATAIRE')}
                style={{
                  padding: '12px 20px', borderRadius: 12, border: 0,
                  background: 'linear-gradient(135deg, #D4AF37, #F6D365)', color: '#0F0D09',
                  fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 13.5, cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(212,175,55,0.4)'
                }}
              >
                Créer un compte Locataire
              </button>
              <button
                type="button"
                onClick={() => setRoleRestrictionModalOpen(false)}
                style={{
                  padding: '12px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)',
                  background: 'transparent', color: '#fff',
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13.5, cursor: 'pointer'
                }}
              >
                Continuer la navigation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmation de Débit de Points Locataire */}
      <PointConfirmationModal
        isOpen={pointConfirmModal.isOpen}
        actionKey={pointConfirmModal.actionKey}
        targetTitle={pointConfirmModal.targetTitle}
        targetSubtitle={pointConfirmModal.targetSubtitle}
        onConfirm={() => {
          const fn = pointConfirmModal.onConfirmAction;
          setPointConfirmModal(prev => ({ ...prev, isOpen: false }));
          if (fn) fn();
        }}
        onCancel={() => setPointConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onOpenRecharge={() => {
          setPointConfirmModal(prev => ({ ...prev, isOpen: false }));
          setTenantSubModalOpen(true);
        }}
      />

      {/* Modal d'Abonnement VIP & Recharge de Points */}
      {tenantSubModalOpen && (
        <TenantSubscriptionModal
          isOpen={tenantSubModalOpen}
          onClose={() => setTenantSubModalOpen(false)}
        />
      )}

      {/* Modal Séquentielle Boost Post-Publication (360° puis Découverte) */}
      <PostPublishBoostModal
        propertyId={property?.id || id}
        propertyTitle={property?.title || 'Votre bien'}
        isOpen={showPublishBoostModal}
        onClose={() => setShowPublishBoostModal(false)}
        initialStep="tour_360"
      />
    </div>
  );
}
