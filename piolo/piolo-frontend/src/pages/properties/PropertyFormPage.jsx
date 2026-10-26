import React, { useEffect, useRef, useState, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { propertiesApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import PioloLoader from "../../components/PioloLoader";
import MobileBottomNav from "../../components/MobileBottomNav";
import LandlordSubscriptionModal from "../../components/LandlordSubscriptionModal";
import RentEstimatorModal from "../../components/RentEstimatorModal";
import PointConfirmationModal from "../../components/PointConfirmationModal";
import { subscriptionService } from "../../services/subscriptionService";
import { CITY_BOUNDARIES } from "./cityBoundaries";

const DEFAULT_POSITION = [3.848, 11.5021];
const CITIES = [
  "Yaoundé",
  "Douala",
  "Bafoussam",
  "Garoua",
  "Maroua",
  "Kribi",
  "Autre",
];
const CITY_NEIGHBORHOODS = {
  "Yaoundé": [
    "Bastos", "Soa", "Université Yaoundé II", "Nkolfoulou", "Nkoabang", "Nyom", "Nkolondom",
    "Mballa II", "Nlongkak", "Tsinga", "Mokolo", "Elig-Edzoa", "Omnisports", "Kondengui",
    "Madagascar", "Cité Verte", "Carrière", "Nkol-Eton", "Tongolo", "Santa Barbara",
    "Essos", "Mvog-Mbi", "Mvan", "Odza", "Ekounou", "Nsam", "Mendong", "Mvolyé",
    "Biyem-Assi", "Etoudi", "Ngousso", "Emana", "Ahala", "Nkolbisson", "Etoug-Ebe",
    "Mfandena", "Elig-Essono", "Damas", "Obili", "Ngoa-Ekelle", "Melen", "Nsimeyong",
    "Montée Jouvence", "Nkolmesseng", "Olembe", "Simbock", "Oyom-Abang", "Minboman",
    "Messassi", "Nsimalen", "Mbankomo", "Quartier du Lac", "Tropicana", "Messamendongo",
  ],
  "Douala": [
    "Bonanjo", "Bonapriso", "Akwa", "Bali", "Deido", "New Bell", "Bepanda",
    "Bonamoussadi", "Makepe", "Logpom", "PK 8", "PK 10", "PK 12", "PK 14", "PK 17", "PK 21",
    "Ndokoti", "Japoma", "Yassa", "Kotto", "Denver", "Village", "Ndogbong", "Ange-Raphael",
    "Cité des Palmiers", "Ndogpassi", "Nyalla", "Mboppi", "Bassa", "Bonabéri", "Bekoko",
    "Nylon", "Logbessou", "Mambanda", "Youpwè", "Koumassi", "Cité SIC", "Beedi", "Ndobo",
  ],
  "Bafoussam": [
    "Djemoun", "Tamgang", "Tougang", "Kamkop", "Banengo", "Famla", "Haoussa",
  ],
  "Kribi": [
    "Mboa-Manga", "Afan-Mabe", "Domi", "Bikondo", "Grand Batanga", "Mpalla",
  ],
  "Garoua": [
    "Plateau", "Marouaré", "Poli", "Lainde", "Bibémiré", "Yelwa",
  ],
  "Maroua": [
    "Domayo", "Pitoaré", "Dugoi", "Hardé", "Djarengol", "Founangué",
  ],
};
const CITY_ZONES = {
  "Yaoundé": {
    label: "Grand Yaoundé & Soa",
    center: { lat: 3.8689867, lng: 11.5213344 },
    bounds: { north: 4.0250, south: 3.7000, east: 11.6450, west: 11.3900 },
  },
  "Douala": {
    label: "Grand Douala",
    center: { lat: 4.055897, lng: 9.6670278 },
    bounds: { north: 4.2500, south: 3.7200, east: 9.8800, west: 9.3200 },
  },
};
const PROPERTY_TYPES = [
  ["APPARTEMENT", "Appartement"],
  ["VILLA", "Villa"],
  ["STUDIO", "Studio"],
  ["MAISON", "Maison"],
  ["MAISON_MEUBLEE", "Maison meublée"],
  ["VILLA_MEUBLEE", "Villa meublée"],
  ["PENTHOUSE", "Penthouse"],
  ["DUPLEX", "Duplex"],
  ["TRIPLEX", "Triplex"],
  ["LOFT", "Loft"],
  ["CHAMBRE", "Chambre"],
  ["CHAMBRE_MEUBLEE", "Chambre meublée"],
  ["BUREAU", "Bureau"],
  ["BOUTIQUE", "Boutique"],
  ["IMMEUBLE", "Immeuble"],
  ["LOCAL_COMMERCIAL", "Local commercial"],
  ["ENTREPOT", "Entrepôt"],
  ["RESTAURANT", "Restaurant"],
  ["HOTEL", "Hôtel"],
  ["MAISON_D_HOTES", "Maison d'hôtes"],
  ["MAGASIN", "Magasin"],
  ["RESIDENCE", "Résidence"],
  ["CONCESSION", "Concession"],
  ["BUNGALOW", "Bungalow"],
  ["FERME", "Ferme / exploitation"],
  ["TERRAIN", "Terrain"],
];
const TRANSACTIONS = [
  ["LOCATION", "Location longue durée (Standard)"],
  ["COURTE_DUREE", "Courte durée (Meublé / Nuitée)"],
  ["VENTE", "Vente immobilière"],
];
const AMENITIES = [
  ["furnished", "Meublé"],
  ["balcony", "Balcon/Terrasse"],
  ["parking", "Parking"],
  ["security", "Sécurité 24/7"],
  ["water", "Eau courante"],
  ["electricity", "Électricité"],
];
function normalizeLocationQuery(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/entrer|entree/g, "entree")
    .replace(/fecaf+o+t+/g, "fecafoot")
    .replace(/\s+/g, " ")
    .trim();
}

function isInsideCityZone() {
  // Délimitation stricte retirée pour couvrir toute la zone urbaine blanche et périphérique (Odza, Soa, Nkoabang, etc.)
  return true;
}

const FORM_STYLES = `
.property-form-page{--or:#D4AF37;--or-l:#F6D365;--or-d:#A8891C;--noir:#0F0D09;--gris:#64605A;--gris-m:#9B9690;--gris-f:#F7F5F1;--gris-b:#E8E3DA;--vert:#1E7A47;--rouge:#B83232;min-height:100vh;background:var(--gris-f);font-family:'DM Sans',sans-serif;color:var(--noir);padding:32px 20px 100px}.pf-shell{max-width:860px;margin:auto}.pf-back{display:inline-flex;align-items:center;gap:7px;color:var(--gris);text-decoration:none;font:600 13px Poppins,sans-serif;margin-bottom:16px;transition:color .18s}.pf-back:hover{color:var(--or-d)}.pf-title{font:800 26px Poppins,sans-serif;margin:0 0 6px;letter-spacing:-0.4px}.pf-sub{margin:0 0 24px;color:var(--gris-m);font-size:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}.pf-progress{display:flex;align-items:center;padding:20px 24px;background:#fff;border:1px solid var(--gris-b);border-radius:18px;margin-bottom:36px;overflow:auto}.pf-progress-step{display:flex;flex-direction:column;align-items:center;gap:6px;min-width:62px;color:var(--gris-m);font:600 10px Poppins,sans-serif;cursor:pointer}.pf-progress-num{width:34px;height:34px;border:2px solid var(--gris-b);border-radius:50%;display:grid;place-items:center;font-size:13px;transition:all .2s}.pf-progress-step.active{color:var(--or-d)}.pf-progress-step.active .pf-progress-num{background:var(--or);border-color:var(--or);color:var(--noir);box-shadow:0 0 0 4px rgba(212,175,55,.2)}.pf-progress-step.done{color:var(--vert)}.pf-progress-step.done .pf-progress-num{background:var(--vert);border-color:var(--vert);color:#fff}.pf-line{height:2px;background:var(--gris-b);min-width:20px;flex:1;margin-bottom:18px}.pf-line.done{background:var(--vert)}.pf-card{background:#fff;border:1px solid var(--gris-b);border-radius:18px;padding:32px;box-shadow:0 1px 6px rgba(0,0,0,.04)}.pf-step-title{font:800 18px Poppins,sans-serif;margin:0 0 22px}.pf-row{display:grid;grid-template-columns:1fr 1fr;gap:18px}.pf-row.three{grid-template-columns:repeat(3,1fr)}.pf-group{display:flex;flex-direction:column;gap:6px;margin-bottom:18px}.pf-group label,.pf-label{font:700 12px Poppins,sans-serif;color:var(--noir)}.pf-input,.pf-select,.pf-textarea{width:100%;background:var(--gris-f);border:1.5px solid var(--gris-b);border-radius:12px;padding:12px 14px;font:14px 'DM Sans',sans-serif;color:var(--noir);outline:0;transition:all .18s}.pf-input:focus,.pf-select:focus,.pf-textarea:focus{border-color:var(--or);box-shadow:0 0 0 3px rgba(212,175,55,.18);background:#fff}.pf-textarea{min-height:130px;resize:vertical}.pf-error{font-size:12px;color:var(--rouge);margin-top:2px;font-weight:600}.pf-help{font-size:11.5px;color:var(--gris-m);line-height:1.5}.pf-check{display:flex;align-items:center;gap:9px;font-size:13px;color:var(--gris);cursor:pointer}.pf-check input{accent-color:var(--or);width:18px;height:18px}.pf-notice{display:flex;gap:12px;padding:14px 16px;background:rgba(212,175,55,.08);border:1px solid rgba(212,175,55,.25);border-radius:14px;color:var(--gris);font-size:13px;line-height:1.55;margin-bottom:22px}.pf-map{height:380px;border:1.5px solid var(--gris-b);border-radius:14px;overflow:hidden;margin-top:10px}.pf-map-actions{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px}.pf-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:12px;padding:12px 20px;font:700 13px Poppins,sans-serif;cursor:pointer;transition:all .18s}.pf-btn.primary{background:linear-gradient(135deg,var(--or),var(--or-l));color:var(--noir);box-shadow:0 4px 14px rgba(212,175,55,.35)}.pf-btn.primary:active{transform:scale(0.98)}.pf-btn.secondary{background:var(--gris-f);border:1.5px solid var(--gris-b);color:var(--gris)}.pf-coords{margin-top:8px;padding:10px 14px;background:rgba(30,122,71,.08);border:1px solid rgba(30,122,71,.25);border-radius:10px;color:var(--vert);font:600 12px Poppins,sans-serif;display:flex;align-items:center;gap:6px}.pf-amenities{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.pf-amenity{display:flex;align-items:center;gap:8px;padding:12px 14px;border:1.5px solid var(--gris-b);border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;transition:all .18s ease}.pf-amenity.checked{border-color:var(--or);background:rgba(212,175,55,.08);box-shadow:0 2px 8px rgba(212,175,55,.15)}.pf-amenity input{accent-color:var(--or)}.pf-upload{border:2px dashed var(--or);background:#FFFDF8;border-radius:16px;min-height:210px;position:relative;display:grid;place-items:center;text-align:center;overflow:hidden;cursor:pointer;transition:background .2s}.pf-upload:hover{background:#FFF9E6}.pf-upload input,.pf-gallery-add input{position:absolute;inset:0;opacity:0;cursor:pointer;z-index:2}.pf-upload img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.pf-upload-content{padding:28px;display:grid;place-items:center;gap:8px}.pf-upload-icon{width:60px;height:60px;border-radius:50%;background:rgba(212,175,55,.18);display:grid;place-items:center;color:var(--or-d);font-size:26px}.pf-gallery-head{display:flex;justify-content:space-between;align-items:center;margin-top:28px}.pf-gallery-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:14px}.pf-preview{position:relative;border-radius:14px;overflow:hidden;height:160px;background:var(--gris-f);border:1px solid var(--gris-b)}.pf-preview img{width:100%;height:100%;object-fit:cover}.pf-remove{position:absolute;top:8px;right:8px;width:28px;height:28px;border:0;border-radius:50%;background:rgba(15,13,9,.78);color:#fff;font-size:16px;cursor:pointer;display:grid;place-items:center;backdrop-filter:blur(4px)}.pf-gallery-add{min-height:160px;border:2px dashed var(--gris-b);border-radius:16px;display:grid;place-items:center;position:relative;background:var(--gris-f);text-align:center;color:var(--gris)}.pf-review{padding:22px;background:var(--gris-f);border-radius:14px;display:grid;gap:12px;color:var(--gris);font-size:14px;border:1px solid var(--gris-b)}.pf-review strong{color:var(--noir)}.pf-nav{display:flex;justify-content:space-between;gap:12px;margin-top:28px}.pf-btn:disabled{opacity:.5;cursor:not-allowed}.pf-server-error{margin-top:18px;background:rgba(184,50,50,.08);border:1px solid rgba(184,50,50,.25);border-radius:12px;padding:12px 14px;color:var(--rouge);font-size:13px}
`;

const FORM_ENHANCEMENTS = `
.property-form-page .pf-input,.property-form-page .pf-select,.property-form-page .pf-textarea{background:#F7F5F1 !important;color:#0F0D09 !important;-webkit-text-fill-color:#0F0D09 !important;opacity:1 !important}.property-form-page .pf-input::placeholder,.property-form-page .pf-textarea::placeholder{color:#756F66 !important;-webkit-text-fill-color:#756F66 !important;opacity:1 !important}.property-form-page .pf-select option{background:#F7F5F1 !important;color:#0F0D09 !important}.property-form-page .pf-input:focus,.property-form-page .pf-select:focus,.property-form-page .pf-textarea:focus{background:#fff !important;color:#0F0D09 !important;-webkit-text-fill-color:#0F0D09 !important}.property-form-page .pf-select:disabled{cursor:not-allowed;background:#EFEBE3 !important;color:#8C857C !important;-webkit-text-fill-color:#8C857C !important}
.pf-city-modal-backdrop{position:fixed;inset:0;z-index:3200;display:grid;place-items:center;padding:20px;background:rgba(15,13,9,.58);backdrop-filter:blur(5px)}.pf-city-modal{width:min(460px,100%);padding:30px;border:1px solid rgba(212,175,55,.35);border-radius:22px;background:#fff;box-shadow:0 24px 80px rgba(0,0,0,.28);text-align:center}.pf-city-modal-icon{width:58px;height:58px;margin:0 auto 16px;border-radius:50%;display:grid;place-items:center;background:#FFFBF0;border:1px solid rgba(212,175,55,.45);color:#A8891C;font:800 24px Poppins,sans-serif}.pf-city-modal h3{margin:0 0 10px;font:800 20px Poppins,sans-serif;color:#0F0D09}.pf-city-modal p{margin:0;color:#64605A;font-size:14px;line-height:1.6}.pf-city-modal .pf-btn{margin-top:22px;min-width:150px}.pf-map-attribution{margin:4px 2px 0;color:#9B9690;font-size:10px}
.property-form-page{padding:34px clamp(24px,5vw,92px) 110px}.pf-shell{max-width:1280px}.pf-card{padding:38px 42px}.pf-map-toolbar{display:flex;gap:12px;justify-content:space-between;align-items:center;margin:4px 0 12px}.pf-map-search{display:flex;gap:10px;flex:1;max-width:760px}.pf-map-search .pf-input{background:#fff}.pf-google-map-wrap .pf-map{height:460px;margin:0;box-shadow:inset 0 0 0 1px rgba(15,13,9,.05)}.pf-map-status{margin:10px 2px 0;color:var(--gris);font-size:12px}.pf-amenity{min-height:52px;transition:transform .18s ease,box-shadow .18s ease}.pf-amenity:hover{transform:translateY(-2px);box-shadow:0 5px 16px rgba(15,13,9,.07)}.pf-amenity svg{width:19px;height:19px;color:var(--or-d);flex:none}.pf-confirm-backdrop{position:fixed;inset:0;background:rgba(15,13,9,.58);z-index:3000;display:grid;place-items:center;padding:18px;backdrop-filter:blur(4px)}.pf-confirm{width:min(480px,100%);background:#fff;border-radius:22px;padding:32px;box-shadow:0 24px 70px rgba(0,0,0,.3);text-align:center}.pf-confirm-icon{width:66px;height:66px;border-radius:50%;display:grid;place-items:center;margin:0 auto 16px;background:#FFFBF0;color:var(--or-d);font:800 25px Poppins,sans-serif;border:1px solid rgba(212,175,55,.35)}.pf-confirm h2{font:800 21px Poppins,sans-serif;margin:0 0 10px}.pf-confirm p{margin:0;color:var(--gris);line-height:1.65}.pf-confirm-cost{margin:20px 0;padding:13px;border-radius:12px;background:#FFFBF0;color:var(--noir);font:800 17px Poppins,sans-serif}.pf-confirm-actions{display:grid;grid-template-columns:1fr 1fr;gap:12px}

/* Segmented Mobile Stepper */
.pf-mobile-stepper-wrap { display: none; margin-bottom: 20px; }
.pf-mob-stepper-bar { height: 6px; background: var(--gris-b); border-radius: 999px; overflow: hidden; margin-bottom: 10px; }
.pf-mob-stepper-fill { height: 100%; background: linear-gradient(90deg, var(--or), #F6D365); border-radius: 999px; transition: width 0.35s ease; }
.pf-mob-stepper-pills { display: flex; gap: 8px; overflow-x: auto; padding: 2px 2px 6px; scrollbar-width: none; }
.pf-mob-stepper-pills::-webkit-scrollbar { display: none; }
.pf-mob-step-pill { padding: 6px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; white-space: nowrap; border: 1px solid var(--gris-b); background: #fff; color: var(--gris-m); cursor: pointer; display: flex; align-items: center; gap: 5px; }
.pf-mob-step-pill.active { background: #0F0D09; color: #F6D365; border-color: #0F0D09; }
.pf-mob-step-pill.done { background: rgba(30,122,71,0.08); color: var(--vert); border-color: rgba(30,122,71,0.2); }

/* Presets & Numeric Steppers */
.pf-chip-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.pf-chip-btn { border: 1px solid var(--gris-b); background: #fff; border-radius: 8px; padding: 5px 11px; font-size: 11.5px; font-weight: 600; color: var(--gris); cursor: pointer; transition: all .15s ease; }
.pf-chip-btn:hover, .pf-chip-btn.active { border-color: var(--or); background: rgba(212,175,55,0.12); color: #7A5B0B; font-weight: 700; }
.pf-stepper-input { display: flex; align-items: center; border: 1.5px solid var(--gris-b); border-radius: 12px; background: var(--gris-f); overflow: hidden; }
.pf-stepper-btn { width: 44px; height: 44px; display: grid; place-items: center; border: 0; background: #fff; color: var(--noir); font-size: 18px; font-weight: 800; cursor: pointer; transition: background .15s; }
.pf-stepper-btn:active { background: var(--gris-b); }
.pf-stepper-val { flex: 1; text-align: center; font-weight: 700; font-size: 15px; color: var(--noir); }

/* Floating Sticky Footer for Mobile */
.pf-sticky-footer { position: fixed; bottom: 64px; left: 0; right: 0; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-top: 1px solid rgba(212, 175, 55, 0.25); padding: 10px 16px; z-index: 100; display: flex; gap: 10px; box-shadow: 0 -4px 18px rgba(0,0,0,0.06); }
.pf-sticky-footer .pf-btn { flex: 1; }

@media(min-width: 851px) {
  .pf-sticky-footer { display: none; }
}

@media(max-width: 850px) {
  .pf-progress { display: none !important; }
  .pf-mobile-stepper-wrap { display: block; }
  .property-form-page { padding: 18px 14px 130px; }
  .pf-card { padding: 20px 16px; border-radius: 16px; }
  .pf-row, .pf-row.three, .pf-amenities { grid-template-columns: 1fr; gap: 14px; }
  .pf-map-toolbar, .pf-map-search, .pf-confirm-actions { grid-template-columns: 1fr; display: grid; }
  .pf-google-map-wrap .pf-map { height: 320px; }
  .pf-gallery-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .pf-preview { height: 130px; }
}
`;

function AmenityIcon({ name }) {
  const paths = { furnished: "M2 17h20v2H2v-2zm11-2H3v-5c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v5zm7-7h-4v7h4V8z", balcony: "M12 3 2 12h3v8h14v-8h3L12 3zm0 2.83 5 4.5V18H7v-7.67l5-4.5z", parking: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM5 11l1.5-4.5h11L19 11H5z", security: "M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z", water: "M12 2C6.67 6.55 4 10.48 4 13.8 4 18.78 7.8 22 12 22s8-3.22 8-8.2C20 10.48 17.33 6.55 12 2z", electricity: "M7 2v11h3v9l7-12h-4l4-8z" };
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={paths[name]} /></svg>;
}

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyDZyYvlR1SeSE6mk2kJn-gJxg-tfsDoJKc";
let googleMapsLoader;

function loadGoogleMaps() {
  if (window.google?.maps?.places) return Promise.resolve(window.google);
  if (googleMapsLoader) return googleMapsLoader;
  googleMapsLoader = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error("Google Maps n'a pas pu être chargé."));
    document.head.appendChild(script);
  });
  return googleMapsLoader;
}

const KNOWN_NEIGHBORHOODS = {
  // ─── YAOUNDÉ : QUARTIERS ET SOUS-ZONES / REPÈRES ───
  "odza": { lat: 3.8050, lng: 11.5320, label: "Odza, Yaoundé" },
  "odza entree fecafoot": { lat: 3.8012, lng: 11.5348, label: "Odza Entrée FECAFOOT, Yaoundé" },
  "odza entrer fecafoot": { lat: 3.8012, lng: 11.5348, label: "Odza Entrée FECAFOOT, Yaoundé" },
  "odza fecafoot": { lat: 3.8012, lng: 11.5348, label: "Odza Entrée FECAFOOT, Yaoundé" },
  "fecafoot odza": { lat: 3.8012, lng: 11.5348, label: "Odza Entrée FECAFOOT, Yaoundé" },
  "odza borne 10": { lat: 3.7960, lng: 11.5360, label: "Odza Borne 10, Yaoundé" },
  "odza messamendongo": { lat: 3.7920, lng: 11.5280, label: "Odza Messamendongo, Yaoundé" },
  "odza koweit city": { lat: 3.8080, lng: 11.5380, label: "Odza Koweït City, Yaoundé" },
  "odza abattoir": { lat: 3.8020, lng: 11.5290, label: "Odza Abattoir, Yaoundé" },
  "odza total": { lat: 3.8040, lng: 11.5310, label: "Odza Total, Yaoundé" },

  "bastos": { lat: 3.8963, lng: 11.5126, label: "Bastos, Yaoundé" },
  "bastos ambassade": { lat: 3.8990, lng: 11.5140, label: "Bastos Ambassade de France, Yaoundé" },
  "bastos ambassade de france": { lat: 3.8990, lng: 11.5140, label: "Bastos Ambassade de France, Yaoundé" },
  "bastos dragages": { lat: 3.8980, lng: 11.5190, label: "Bastos Dragages, Yaoundé" },
  "bastos mini ferme": { lat: 3.9040, lng: 11.5110, label: "Bastos Mini Ferme, Yaoundé" },
  "bastos carrefour warda": { lat: 3.8750, lng: 11.5130, label: "Bastos Carrefour Warda, Yaoundé" },
  "bastos laboratoire": { lat: 3.8940, lng: 11.5160, label: "Bastos Laboratoire, Yaoundé" },

  "biyem-assi": { lat: 3.8340, lng: 11.4880, label: "Biyem-Assi, Yaoundé" },
  "biyem assi": { lat: 3.8340, lng: 11.4880, label: "Biyem-Assi, Yaoundé" },
  "biyem assi acacia": { lat: 3.8370, lng: 11.4920, label: "Biyem-Assi Carrefour Acacia, Yaoundé" },
  "biyem assi carrefour acacia": { lat: 3.8370, lng: 11.4920, label: "Biyem-Assi Carrefour Acacia, Yaoundé" },
  "acacia": { lat: 3.8370, lng: 11.4920, label: "Carrefour Acacia, Yaoundé" },
  "biyem assi rond point express": { lat: 3.8320, lng: 11.4860, label: "Biyem-Assi Rond-Point Express, Yaoundé" },
  "biyem assi maison blanche": { lat: 3.8350, lng: 11.4890, label: "Biyem-Assi Maison Blanche, Yaoundé" },
  "biyem assi superette": { lat: 3.8330, lng: 11.4870, label: "Biyem-Assi Supérette, Yaoundé" },

  "omnisports": { lat: 3.8820, lng: 11.5360, label: "Omnisports, Yaoundé" },
  "omnisports stade": { lat: 3.8820, lng: 11.5360, label: "Stade Omnisports Ahmadou Ahidjo, Yaoundé" },
  "omnisports mobil": { lat: 3.8800, lng: 11.5330, label: "Carrefour Mobil Omnisports, Yaoundé" },
  "omnisports carrefour mobil": { lat: 3.8800, lng: 11.5330, label: "Carrefour Mobil Omnisports, Yaoundé" },
  "omnisports carrefour mvog-ada": { lat: 3.8760, lng: 11.5310, label: "Omnisports Carrefour Mvog-Ada, Yaoundé" },

  "mendong": { lat: 3.8290, lng: 11.4720, label: "Mendong, Yaoundé" },
  "mendong carrefour simbi": { lat: 3.8270, lng: 11.4740, label: "Mendong Carrefour Simbi, Yaoundé" },
  "mendong simbi": { lat: 3.8270, lng: 11.4740, label: "Mendong Carrefour Simbi, Yaoundé" },
  "mendong chapelle": { lat: 3.8300, lng: 11.4710, label: "Mendong Chapelle, Yaoundé" },
  "mendong camp sic": { lat: 3.8310, lng: 11.4760, label: "Mendong Camp SIC, Yaoundé" },

  "santa barbara": { lat: 3.9050, lng: 11.5280, label: "Santa Barbara, Yaoundé" },
  "tsinga": { lat: 3.8850, lng: 11.5030, label: "Tsinga, Yaoundé" },
  "tsinga febe": { lat: 3.8890, lng: 11.5010, label: "Tsinga Mont Fébé, Yaoundé" },
  "nlongkak": { lat: 3.8810, lng: 11.5180, label: "Nlongkak, Yaoundé" },
  "nlongkak rond point": { lat: 3.8810, lng: 11.5180, label: "Nlongkak Rond-Point, Yaoundé" },
  "emana": { lat: 3.9180, lng: 11.5330, label: "Emana, Yaoundé" },
  "emana pont": { lat: 3.9150, lng: 11.5310, label: "Emana Pont, Yaoundé" },
  "mvan": { lat: 3.8180, lng: 11.5180, label: "Mvan, Yaoundé" },
  "mvan complexe beac": { lat: 3.8160, lng: 11.5210, label: "Mvan Complexe BEAC, Yaoundé" },
  "mvan gare routiere": { lat: 3.8190, lng: 11.5160, label: "Mvan Gare Routière, Yaoundé" },
  "golf": { lat: 3.8920, lng: 11.5230, label: "Golf, Yaoundé" },
  "dragages": { lat: 3.8980, lng: 11.5190, label: "Dragages, Yaoundé" },
  "melen": { lat: 3.8610, lng: 11.4980, label: "Melen, Yaoundé" },
  "melen polytechnique": { lat: 3.8630, lng: 11.5010, label: "Melen École Polytechnique, Yaoundé" },
  "melen emia": { lat: 3.8590, lng: 11.4970, label: "Melen Carrefour EMIA, Yaoundé" },
  "simbock": { lat: 3.8040, lng: 11.4710, label: "Simbock, Yaoundé" },
  "simbock chapelle": { lat: 3.8050, lng: 11.4700, label: "Simbock Chapelle, Yaoundé" },
  "essos": { lat: 3.8740, lng: 11.5450, label: "Essos, Yaoundé" },
  "mvog-mbi": { lat: 3.8440, lng: 11.5220, label: "Mvog-Mbi, Yaoundé" },
  "mvog mbi": { lat: 3.8440, lng: 11.5220, label: "Mvog-Mbi, Yaoundé" },
  "olezoa": { lat: 3.8510, lng: 11.5080, label: "Olezoa, Yaoundé" },
  "ahala": { lat: 3.7910, lng: 11.4960, label: "Ahala, Yaoundé" },
  "ahala barriere": { lat: 3.7880, lng: 11.4940, label: "Ahala Barrière, Yaoundé" },
  "soa": { lat: 3.9850, lng: 11.5950, label: "Soa, Grand Yaoundé" },
  "soa universite": { lat: 3.9880, lng: 11.6020, label: "Université de Yaoundé II, Soa" },
  "universite de yaounde 2": { lat: 3.9880, lng: 11.6020, label: "Université de Yaoundé II, Soa" },
  "universite yaounde ii": { lat: 3.9880, lng: 11.6020, label: "Université de Yaoundé II, Soa" },
  "soa cocotiers": { lat: 3.9820, lng: 11.6150, label: "L'Île des Cocotiers, Soa" },
  "ile des cocotiers soa": { lat: 3.9820, lng: 11.6150, label: "L'Île des Cocotiers, Soa" },
  "nkolfoulou": { lat: 3.9250, lng: 11.6100, label: "Nkolfoulou, Yaoundé" },
  "nkoabang": { lat: 3.8800, lng: 11.6150, label: "Nkoabang, Yaoundé" },
  "nyom": { lat: 3.9820, lng: 11.5280, label: "Nyom, Yaoundé" },
  "nkolondom": { lat: 3.9550, lng: 11.5150, label: "Nkolondom, Yaoundé" },
  "nsimalen": { lat: 3.7220, lng: 11.5510, label: "Nsimalen Aéroport, Yaoundé" },
  "mbankomo": { lat: 3.7800, lng: 11.4100, label: "Mbankomo, Yaoundé" },
  "messassi": { lat: 3.9350, lng: 11.5390, label: "Messassi, Yaoundé" },
  "ngousso": { lat: 3.8940, lng: 11.5480, label: "Ngousso, Yaoundé" },
  "ngousso hopital general": { lat: 3.8960, lng: 11.5510, label: "Ngousso Hôpital Général, Yaoundé" },
  "mimboman": { lat: 3.8680, lng: 11.5560, label: "Mimboman, Yaoundé" },
  "jouvence": { lat: 3.8110, lng: 11.4820, label: "Jouvence, Yaoundé" },
  "mokolo": { lat: 3.8720, lng: 11.5010, label: "Marché Mokolo, Yaoundé" },

  // ─── DOUALA : QUARTIERS ET SOUS-ZONES / REPÈRES ───
  "akwa": { lat: 4.0510, lng: 9.7040, label: "Akwa, Douala" },
  "akwa glacier moderne": { lat: 4.0520, lng: 9.7020, label: "Akwa Glacier Moderne, Douala" },
  "akwa salle des fetes": { lat: 4.0480, lng: 9.7010, label: "Akwa Salle des Fêtes, Douala" },
  "akwa carrefour ideal": { lat: 4.0530, lng: 9.7050, label: "Akwa Carrefour Idéal, Douala" },
  "bonapriso": { lat: 4.0280, lng: 9.6960, label: "Bonapriso, Douala" },
  "bonapriso armee de l'air": { lat: 4.0250, lng: 9.6990, label: "Bonapriso Armée de l'Air, Douala" },
  "bonapriso carrefour foch": { lat: 4.0300, lng: 9.6940, label: "Bonapriso Carrefour Foch, Douala" },
  "bonapriso foch": { lat: 4.0300, lng: 9.6940, label: "Bonapriso Carrefour Foch, Douala" },
  "bonapriso rue tokyo": { lat: 4.0290, lng: 9.6970, label: "Bonapriso Rue Tokyo, Douala" },
  "bonanjo": { lat: 4.0430, lng: 9.6890, label: "Bonanjo, Douala" },
  "bonanjo poste centrale": { lat: 4.0440, lng: 9.6880, label: "Bonanjo Poste Centrale, Douala" },
  "bali": { lat: 4.0370, lng: 9.6920, label: "Bali, Douala" },
  "bali koumassi": { lat: 4.0380, lng: 9.6910, label: "Bali Carrefour Koumassi, Douala" },
  "deido": { lat: 4.0650, lng: 9.7120, label: "Deido, Douala" },
  "deido rond point": { lat: 4.0660, lng: 9.7140, label: "Deido Rond-Point 4 Étages, Douala" },
  "deido grand moulin": { lat: 4.0630, lng: 9.7100, label: "Deido Grand Moulin, Douala" },
  "makepe": { lat: 4.0840, lng: 9.7420, label: "Makepe, Douala" },
  "makepe rhone poulenc": { lat: 4.0820, lng: 9.7390, label: "Makepe Rhône Poulenc, Douala" },
  "makepe saint tropez": { lat: 4.0860, lng: 9.7450, label: "Makepe Saint Tropez, Douala" },
  "makepe missoke": { lat: 4.0800, lng: 9.7410, label: "Makepe Missokè, Douala" },
  "bonamoussadi": { lat: 4.0890, lng: 9.7360, label: "Bonamoussadi, Douala" },
  "bonamoussadi carrossel": { lat: 4.0880, lng: 9.7340, label: "Bonamoussadi Carrefour Carrossel, Douala" },
  "bonamoussadi carrefour carrossel": { lat: 4.0880, lng: 9.7340, label: "Bonamoussadi Carrefour Carrossel, Douala" },
  "bonamoussadi maetur": { lat: 4.0910, lng: 9.7380, label: "Bonamoussadi Rond-Point MAETUR, Douala" },
  "bonamoussadi rond point maetur": { lat: 4.0910, lng: 9.7380, label: "Bonamoussadi Rond-Point MAETUR, Douala" },
  "kotto": { lat: 4.0950, lng: 9.7540, label: "Kotto, Douala" },
  "kotto bloc": { lat: 4.0940, lng: 9.7520, label: "Kotto Bloc, Douala" },
  "kotto antenne": { lat: 4.0960, lng: 9.7560, label: "Kotto Carrefour Antenne, Douala" },
  "denver": { lat: 4.0910, lng: 9.7480, label: "Denver, Douala" },
  "logbessou": { lat: 4.0980, lng: 9.7780, label: "Logbessou, Douala" },
  "yassa": { lat: 4.0150, lng: 9.7820, label: "Yassa, Douala" },
  "yassa japoma": { lat: 4.0120, lng: 9.7850, label: "Yassa Stade Japoma, Douala" },
  "yassa stade japoma": { lat: 4.0120, lng: 9.7850, label: "Yassa Stade Japoma, Douala" },
  "bassa": { lat: 4.0450, lng: 9.7420, label: "Bassa, Douala" },
  "ndogbong": { lat: 4.0580, lng: 9.7480, label: "Ndogbong, Douala" },
  "ndogbong carrefour des fleurs": { lat: 4.0590, lng: 9.7510, label: "Ndogbong Carrefour des Fleurs, Douala" },
  "ndogbong fleurs": { lat: 4.0590, lng: 9.7510, label: "Ndogbong Carrefour des Fleurs, Douala" },
  "nyalla": { lat: 4.0320, lng: 9.7690, label: "Nyalla, Douala" },
  "bonaberi": { lat: 4.0720, lng: 9.6640, label: "Bonabéri, Douala" },
  "cite des palmiers": { lat: 4.0680, lng: 9.7580, label: "Cité des Palmiers, Douala" },
  "pk10": { lat: 4.0780, lng: 9.7850, label: "PK10, Douala" },
  "pk14": { lat: 4.0920, lng: 9.8120, label: "PK14, Douala" },
};

function GooglePropertyMap({ position, city, neighborhood, onChange, onNeighborhoodFound }) {
  const mapElement = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const geocoder = useRef(null);
  const boundaries = useRef([]);
  const cityRef = useRef(city);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Chargez votre position ou recherchez un quartier/repère (ex: Odza entrée FECAFOOT), puis ajustez le marqueur.");
  const [mapError, setMapError] = useState("");
  const [outOfCity, setOutOfCity] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    cityRef.current = city;
  }, [city]);

  const drawCityZone = (google, selectedCity, recenter = false) => {
    boundaries.current.forEach((polygon) => polygon.setMap(null));
    boundaries.current = [];
    if (!map.current || !google) return;
    map.current.setOptions({ restriction: null });

    const zone = CITY_ZONES[selectedCity];
    if (recenter && zone?.center) {
      map.current.setCenter(zone.center);
      map.current.setZoom(14);
    }
  };

  const moveTo = (lat, lng, zoom = 16, successMessage = "") => {
    const next = { lat: Number(lat), lng: Number(lng) };
    map.current?.setCenter(next);
    map.current?.setZoom(zoom);
    marker.current?.setVisible(true);
    marker.current?.setPosition(next);
    onChange([next.lat, next.lng]);
    if (successMessage) setStatus(successMessage);
    return true;
  };

  const searchTarget = (rawQuery, shouldUpdateInput = true) => {
    const term = (rawQuery || query || "").trim();
    if (!term) return;

    if (shouldUpdateInput) {
      setQuery(term);
    }
    setShowSuggestions(false);

    // 1. Détection immédiate dans le dictionnaire de sous-zones & repères (0ms)
    const normKey = normalizeLocationQuery(term);
    const known = KNOWN_NEIGHBORHOODS[normKey];
    if (known && isInsideCityZone(cityRef.current, known.lat, known.lng)) {
      moveTo(known.lat, known.lng, 16, `Zone « ${known.label} » localisée sur la carte ✓`);
      if (onNeighborhoodFound) onNeighborhoodFound(term);
      return;
    }

    // Recherche par mot-clé dans les repères connus (ex: "fecafoot", "acacia", "rhone poulenc")
    const matchedPartial = Object.entries(KNOWN_NEIGHBORHOODS).find(([k]) => {
      const parts = normKey.split(' ').filter(p => p.length > 2);
      return parts.length >= 2 && parts.every(part => k.includes(part));
    });
    if (matchedPartial && isInsideCityZone(cityRef.current, matchedPartial[1].lat, matchedPartial[1].lng)) {
      moveTo(matchedPartial[1].lat, matchedPartial[1].lng, 16, `Repère « ${matchedPartial[1].label} » localisé sur la carte ✓`);
      if (onNeighborhoodFound) onNeighborhoodFound(term);
      return;
    }

    if (!geocoder.current || !map.current) {
      setStatus("Chargement de la carte en cours…");
      return;
    }

    const normalized = normalizeLocationQuery(term);
    const zone = CITY_ZONES[cityRef.current];
    const googleQuery = `${normalized}${zone ? `, ${zone.label}` : (cityRef.current ? `, ${cityRef.current}` : "")}, Cameroun`;
    setStatus(`Recherche de « ${term} » sur la carte…`);

    const foundLocation = (location, label) => {
      if (!moveTo(location.lat(), location.lng(), 16)) return;
      if (shouldUpdateInput) setQuery(label || term);
      setStatus(`Zone « ${label || term} » affichée sur la carte. Cliquez pour ajuster le marqueur.`);
      if (onNeighborhoodFound && label) onNeighborhoodFound(label);
    };

    const invalidateLocation = (message) => {
      // Si la sous-zone spécifique n'est pas répertoriée par Google, tenter de centrer sur le quartier parent
      const firstWord = normalized.split(' ')[0];
      const parentQuarter = KNOWN_NEIGHBORHOODS[firstWord];
      if (parentQuarter && isInsideCityZone(cityRef.current, parentQuarter.lat, parentQuarter.lng)) {
        moveTo(parentQuarter.lat, parentQuarter.lng, 15, `Quartier ${firstWord.toUpperCase()} centré. Glissez le marqueur pour affiner vers « ${term} ».`);
        return;
      }
      setStatus(message);
    };

    // 2. Recherche par Google Places TextSearch (puissant pour les repères "Odza entrée Fecafoot", etc.)
    if (window.google?.maps?.places?.PlacesService && map.current) {
      const places = new window.google.maps.places.PlacesService(map.current);
      places.textSearch({
        query: googleQuery,
        location: map.current.getCenter(),
        radius: 35000
      }, (items, placesStatus) => {
        if (placesStatus === window.google.maps.places.PlacesServiceStatus.OK && items?.[0]?.geometry?.location) {
          foundLocation(items[0].geometry.location, items[0].name || term);
        } else {
          // Fallback Geocoder
          geocoder.current.geocode({
            address: googleQuery,
            componentRestrictions: { country: "CM" }
          }, (results, resultStatus) => {
            if (resultStatus === "OK" && results?.[0]?.geometry?.location) {
              foundLocation(results[0].geometry.location, term);
            } else {
              invalidateLocation(`Repère « ${term} » affiché approximativement. Ajustez le marqueur au besoin.`);
            }
          });
        }
      });
    } else {
      geocoder.current.geocode({
        address: googleQuery,
        componentRestrictions: { country: "CM" }
      }, (results, resultStatus) => {
        if (resultStatus === "OK" && results?.[0]?.geometry?.location) {
          foundLocation(results[0].geometry.location, term);
        } else {
          invalidateLocation(`Cliquez directement sur la carte pour placer le logement.`);
        }
      });
    }
  };

  // Re-synchronisation et affichage immédiat quand le quartier change dans le formulaire
  useEffect(() => {
    if (neighborhood && neighborhood !== "__custom__") {
      setQuery(neighborhood);
      searchTarget(neighborhood, false);
    }
  }, [neighborhood, city]);

  useEffect(() => {
    let active = true;
    loadGoogleMaps()
      .then((google) => {
        if (!active || !mapElement.current) return;
        const center = { lat: Number(position[0]), lng: Number(position[1]) };
        map.current = new google.maps.Map(mapElement.current, {
          center,
          zoom: 15,
          minZoom: 5,
          maxZoom: 20,
          scrollwheel: true,
          gestureHandling: "greedy",
          zoomControl: false,
          mapTypeControl: true,
          mapTypeControlOptions: { mapTypeIds: ["roadmap", "satellite", "hybrid"] },
          streetViewControl: false,
          fullscreenControl: true,
          disableDoubleClickZoom: false,
        });
        drawCityZone(google, cityRef.current, Boolean(CITY_ZONES[cityRef.current]));
        geocoder.current = new google.maps.Geocoder();
        marker.current = new google.maps.Marker({ map: map.current, position: center, draggable: true, title: "Position du logement — glissez pour ajuster" });
        marker.current.addListener("dragend", (event) => moveTo(event.latLng.lat(), event.latLng.lng(), map.current.getZoom()));
        map.current.addListener("click", (event) => moveTo(event.latLng.lat(), event.latLng.lng(), map.current.getZoom()));

        // Si un quartier/repère est déjà présent au chargement, centrer dessus
        if (neighborhood && neighborhood !== "__custom__") {
          searchTarget(neighborhood, false);
        }
      })
      .catch((error) => active && setMapError(error.message));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!window.google?.maps || !map.current) return;
    const selectedCity = cityRef.current;
    const zone = CITY_ZONES[selectedCity];
    drawCityZone(window.google, city, Boolean(zone));
    if (zone && !isInsideCityZone(city, position[0], position[1])) {
      moveTo(zone.center.lat, zone.center.lng, 13, `Carte centrée sur ${city}. Choisissez le quartier puis positionnez le logement dans la zone.`);
    }
  }, [city]);

  // Autocomplétion dynamique pendant la saisie avec suggestions de repères et sous-zones
  const handleQueryChange = (val) => {
    setQuery(val);
    if (!val.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const clean = normalizeLocationQuery(val);
    const matchedKnown = Object.entries(KNOWN_NEIGHBORHOODS)
      .filter(([k, v]) => k.includes(clean) || v.label.toLowerCase().includes(clean))
      .slice(0, 6)
      .map(([k, v]) => ({ label: v.label, key: k, lat: v.lat, lng: v.lng }));

    if (matchedKnown.length > 0) {
      setSuggestions(matchedKnown);
      setShowSuggestions(true);
    } else if (window.google?.maps?.places?.AutocompleteService) {
      const autoService = new window.google.maps.places.AutocompleteService();
      autoService.getPlacePredictions({
        input: `${val}, ${cityRef.current || 'Cameroun'}, Cameroun`,
        componentRestrictions: { country: "cm" }
      }, (preds) => {
        if (preds?.length) {
          setSuggestions(preds.slice(0, 6).map(p => ({ label: p.description, placeId: p.place_id })));
          setShowSuggestions(true);
        }
      });
    }
  };

  const locate = () => {
    if (!navigator.geolocation) return setStatus("La géolocalisation n'est pas disponible sur cet appareil.");
    setStatus("Localisation en cours…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (moveTo(coords.latitude, coords.longitude)) setStatus("Position détectée. Ajustez le marqueur si nécessaire.");
      },
      () => setStatus("Position indisponible. Recherchez un quartier/repère ou placez le marqueur manuellement."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  return <>
    <div className="pf-google-map-wrap">
      <div className="pf-map-toolbar" style={{ position: 'relative' }}>
        <div className="pf-map-search" style={{ position: 'relative', flex: 1 }}>
          <input
            className="pf-input"
            value={query}
            placeholder="Rechercher un quartier (Bastos, Odza, Bonapriso, Akwa…)"
            onChange={(event) => handleQueryChange(event.target.value)}
            onFocus={() => query.trim() && setSuggestions.length > 0 && setShowSuggestions(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                searchTarget(query);
              }
            }}
          />
          <button className="pf-btn secondary" type="button" onClick={() => searchTarget(query)}>
            Rechercher
          </button>

          {/* LISTE D'AUTOCOMPLÉTION INSTANTANÉE */}
          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              background: '#FFFFFF',
              borderRadius: 12,
              border: '1.5px solid #E8E3DA',
              boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
              zIndex: 1000,
              overflow: 'hidden'
            }}>
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (item.lat && item.lng) {
                      moveTo(item.lat, item.lng, 16, `Quartier ${item.label} affiché.`);
                      setQuery(item.label);
                      if (onNeighborhoodFound) onNeighborhoodFound(item.label.split(',')[0]);
                    } else {
                      searchTarget(item.label);
                    }
                    setShowSuggestions(false);
                  }}
                  style={{
                    padding: '10px 14px',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#0F0D09',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    borderBottom: idx < suggestions.length - 1 ? '1px solid #F0ECE4' : 'none'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FAF9F6'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#D4AF37"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button className="pf-btn primary" type="button" onClick={locate}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>
          <span>Ma position</span>
        </button>
      </div>
      <div style={{ position: 'relative' }}>
        <div ref={mapElement} className="pf-map" />

        {/* Boutons de zoom dédiés haute précision (+ / -) */}
        <div style={{
          position: 'absolute',
          right: 14,
          bottom: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          zIndex: 10
        }}>
          <button
            type="button"
            onClick={() => {
              if (map.current) map.current.setZoom(Math.min((map.current.getZoom() || 15) + 1, 20));
            }}
            title="Zoomer (+)"
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: '#0F0D09',
              color: '#F6D365',
              border: '1.5px solid rgba(212,175,55,0.45)',
              fontSize: 22,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
              transition: 'transform 0.1s, background 0.2s',
              userSelect: 'none'
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.92)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            +
          </button>
          <button
            type="button"
            onClick={() => {
              if (map.current) map.current.setZoom(Math.max((map.current.getZoom() || 15) - 1, 5));
            }}
            title="Dézoomer (-)"
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: '#0F0D09',
              color: '#F6D365',
              border: '1.5px solid rgba(212,175,55,0.45)',
              fontSize: 22,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
              transition: 'transform 0.1s, background 0.2s',
              userSelect: 'none'
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.92)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            −
          </button>
          <button
            type="button"
            onClick={() => {
              if (map.current && marker.current) {
                map.current.panTo(marker.current.getPosition());
                map.current.setZoom(16);
              }
            }}
            title="Recentrer sur le logement"
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: '#0F0D09',
              color: '#F6D365',
              border: '1.5px solid rgba(212,175,55,0.45)',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
              transition: 'transform 0.1s, background 0.2s',
              userSelect: 'none'
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.92)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>
          </button>
        </div>
      </div>
      <p className="pf-map-status">{mapError || status}</p>
    </div>
  </>;
}

const emptyData = {
  title: "",
  transaction_type: "LOCATION",
  property_type: "",
  price: "",
  price_negotiable: false,
  avance_mois: 0,
  caution_mois: 0,
  surface_terrain: "",
  titre_propriete: "",
  duree_min_nuits: 1,
  caution_sejour: "",
  description: "",
  address: "",
  city: "",
  neighborhood: "",
  latitude: "",
  longitude: "",
  area: "",
  bedrooms: 0,
  bathrooms: 1,
  furnished: false,
  balcony: false,
  parking: false,
  security: false,
  water: true,
  electricity: true,
  water_source: "",
  electricity_type: "",
  road_access: "",
  distance_goudron: "",
  network_quality: "",
  flood_risk: "",
  transport_access: "",
};

export default function PropertyFormPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { user, refreshUser } = useAuth();
  const effectivePoints = (user?.points !== undefined && user?.points !== null && user.points > 0)
    ? user.points
    : (subscriptionService.getLandlordPoints(user?.id) || 30);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState(emptyData);
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [customNeighborhoodMode, setCustomNeighborhoodMode] = useState(false);
  const [mainImage, setMainImage] = useState(null);
  const [mainPreview, setMainPreview] = useState("");
  const [photos, setPhotos] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [rentEstimatorOpen, setRentEstimatorOpen] = useState(false);
  const update = (field, value) =>
    setData((current) => {
      const next = { ...current, [field]: value };
      if (field === "transaction_type") {
        if (value === "COURTE_DUREE") {
          next.furnished = true;
          if (!next.duree_min_nuits) next.duree_min_nuits = 1;
        } else if (value === "VENTE") {
          next.avance_mois = 0;
          next.caution_mois = 0;
        }
      }
      return next;
    });

  useEffect(() => {
    if (!isEditing) return;
    propertiesApi
      .detail(id)
      .then(({ data: property }) => {
        setData({
          ...emptyData,
          ...property,
          price: String(property.price || ""),
          latitude: property.latitude || "",
          longitude: property.longitude || "",
        });
        setExistingImages(property.images || []);
        if (property.main_image) setMainPreview(property.main_image);
        if (property.latitude && property.longitude)
          setPosition([Number(property.latitude), Number(property.longitude)]);
      })
      .catch(() => setServerError("Impossible de charger cette annonce."))
      .finally(() => setLoading(false));
  }, [id, isEditing]);
  useEffect(
    () => () => {
      if (mainPreview?.startsWith("blob:")) URL.revokeObjectURL(mainPreview);
      photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    },
    [],
  );
  const setCoords = (coordinates) => {
    if (!coordinates) {
      update("latitude", "");
      update("longitude", "");
      return;
    }
    const [lat, lng] = coordinates;
    setPosition([lat, lng]);
    update("latitude", lat.toFixed(6));
    update("longitude", lng.toFixed(6));
  };
  const selectMain = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024)
      return setErrors((e) => ({ ...e, main_image: "Image limitée à 5 Mo." }));
    setMainImage(file);
    setMainPreview(URL.createObjectURL(file));
    setErrors((e) => ({ ...e, main_image: "" }));
  };
  const selectPhotos = (files) => {
    const available = 10 - existingImages.length - photos.length;
    const next = Array.from(files)
      .filter((file) => file.size <= 5 * 1024 * 1024)
      .slice(0, available)
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setPhotos((current) => [...current, ...next]);
  };
  const validate = () => {
    const next = {};
    if (step === 1) {
      if (!data.title.trim()) next.title = "Titre requis";
      if (!data.transaction_type)
        next.transaction_type = "Type de transaction requis";
      if (!data.property_type) next.property_type = "Type de bien requis";
      if (data.transaction_type === "VENTE") {
        if (!data.price || Number(data.price) < 100000)
          next.price = "Prix de vente minimum : 100 000 FCFA";
      } else if (data.transaction_type === "COURTE_DUREE") {
        if (!data.price || Number(data.price) < 5000)
          next.price = "Tarif par nuitée minimum : 5 000 FCFA";
      } else {
        if (!data.price || Number(data.price) < 10000)
          next.price = "Loyer mensuel minimum : 10 000 FCFA";
      }
    }
    if (step === 2) {
      if (!data.address.trim()) next.address = "Adresse requise";
      if (!data.city) next.city = "Ville requise";
      if (!data.latitude || !data.longitude)
        next.location = "Localisation précise requise";
    }
    if (step === 3 && Number(data.area) < 5)
      next.area = "Surface minimale : 5 m²";
    if (step === 4 && !isEditing && !mainImage)
      next.main_image = "Image principale requise";
    if (step === 5 && !accepted)
      next.terms = "Vous devez certifier les informations.";
    setErrors(next);
    return !Object.keys(next).length;
  };
  const nextStep = () => {
    if (validate()) setStep((current) => Math.min(5, current + 1));
  };
  const submit = async (event, confirmed = false) => {
    event?.preventDefault();
    if (!validate()) return;
    if (!isEditing && !confirmed) {
      setConfirmOpen(true);
      return;
    }
    setConfirmOpen(false);
    setSubmitting(true);
    setServerError("");

    const cleanContact = (text) => {
      if (!text || typeof text !== "string") return text;
      const phonePattern = /(\+?237\s*)?[62]\s*[0-9](\s*[\.\-_/]?\s*[0-9]){7}/g;
      return text.replace(phonePattern, "[Contact via Piolo]").replace(/\b\d{9,12}\b/g, "[Contact via Piolo]");
    };

    let extraNote = "";
    if (data.transaction_type === "VENTE" && data.titre_propriete) {
      extraNote = `\n\n[Statut Foncier : ${data.titre_propriete}${data.surface_terrain ? ` · Surface terrain : ${data.surface_terrain} m²` : ''}]`;
    } else if (data.transaction_type === "COURTE_DUREE") {
      extraNote = `\n\n[Location Courte Durée · Séjour min : ${data.duree_min_nuits || 1} nuit(s)${data.caution_sejour ? ` · Caution de séjour : ${Number(data.caution_sejour).toLocaleString('fr-FR')} FCFA` : ''}]`;
    }

    const editableKeys = [
      'title', 'description', 'property_type', 'transaction_type',
      'price', 'price_negotiable', 'avance_mois', 'caution_mois',
      'address', 'city', 'neighborhood', 'latitude', 'longitude',
      'area', 'bedrooms', 'bathrooms',
      'furnished', 'balcony', 'parking', 'security', 'water', 'electricity',
      'water_source', 'electricity_type', 'road_access', 'distance_goudron',
      'network_quality', 'flood_risk', 'transport_access',
      'surface_terrain', 'titre_propriete', 'duree_min_nuits', 'caution_sejour'
    ];

    const body = new FormData();
    editableKeys.forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        let finalVal = data[key];
        if (key === "title") {
          finalVal = cleanContact(finalVal);
        } else if (key === "description") {
          finalVal = cleanContact((finalVal || "") + extraNote);
        }
        body.append(
          key,
          typeof finalVal === "boolean" ? String(finalVal) : String(finalVal),
        );
      }
    });
    if (mainImage) body.append("main_image", mainImage);
    photos.forEach(({ file }) => body.append("secondary_images", file));
    try {
      const response = isEditing
        ? await propertiesApi.update(id, body)
        : await propertiesApi.create(body);
      await refreshUser?.();
      navigate(`/properties/${response.data.slug || response.data.id}?published=1`);
    } catch (error) {
      const payload = error.response?.data;
      setErrors(payload?.errors || payload || {});
      let errorMsg = payload?.detail || payload?.error;
      if (!errorMsg && payload && typeof payload === 'object') {
        const errList = [];
        Object.entries(payload).forEach(([k, v]) => {
          if (k !== 'errors') {
            const text = Array.isArray(v) ? v.join(', ') : String(v);
            errList.push(`${k}: ${text}`);
          }
        });
        if (errList.length > 0) {
          errorMsg = errList.join(' | ');
        }
      }
      setServerError(
        errorMsg || "Une erreur est survenue. Vérifiez les informations saisies.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const STEP_TITLES = [
    "Informations de base",
    "Localisation du bien",
    "Caractéristiques",
    "Photos & Galerie",
    "Vérification & Publication"
  ];

  if (loading) return <PioloLoader />;

  return (
    <div className="property-form-page">
      <style>{FORM_STYLES}{FORM_ENHANCEMENTS}</style>
      <main className="pf-shell">
        <Link className="pf-back" to="/dashboard/bailleur">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          <span>Retour au dashboard</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
          <div>
            <h1 className="pf-title">
              {isEditing ? "Modifier mon annonce" : "Publier une nouvelle annonce"}
            </h1>
            <p className="pf-sub" style={{ margin: '4px 0 16px' }}>
              Remplissez les informations ci-dessous pour présenter votre bien avec élégance sur Piolo.
            </p>
          </div>

          <div
            onClick={() => !isEditing && setRechargeModalOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '7px 14px', background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(246,211,101,0.22))',
              border: '1.5px solid rgba(212,175,55,0.35)', borderRadius: 999,
              fontSize: 12, fontWeight: 700, color: 'var(--noir)',
              cursor: isEditing ? 'default' : 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
            title={isEditing ? 'Modification gratuite' : 'Cliquer pour recharger vos points'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--or-d)"><path d="M12 2L2 9l10 13 10-13-10-7zm0 3.2L17.8 9H6.2L12 5.2zM4.7 10.5h4.6l-2.6 6.5-2-6.5zm6.3 0h2l-1 7.2-1-7.2zm3.7 0h4.6l-2 6.5-2.6-6.5z"/></svg>
            <span>{isEditing ? 'Modification gratuite' : `${effectivePoints} pts dispo`}</span>
            {!isEditing && <span style={{ color: 'var(--gris-m)', fontSize: 11 }}>· Coût : 20 pts</span>}
            {!isEditing && effectivePoints < 20 && (
              <span style={{ fontSize: 10, background: '#0F0D09', color: '#F6D365', padding: '2px 7px', borderRadius: 8, fontWeight: 800, marginLeft: 2 }}>
                + Recharger
              </span>
            )}
          </div>
        </div>

        {/* ── Segmented Mobile Stepper ── */}
        <div className="pf-mobile-stepper-wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--noir)' }}>
              Étape {step}/5 : <span style={{ color: 'var(--or-d)' }}>{STEP_TITLES[step - 1]}</span>
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gris-m)' }}>
              {step * 20}%
            </span>
          </div>
          <div className="pf-mob-stepper-bar">
            <div className="pf-mob-stepper-fill" style={{ width: `${step * 20}%` }} />
          </div>
          <div className="pf-mob-stepper-pills">
            {["1. Infos", "2. Lieu", "3. Caractér.", "4. Photos", "5. Publier"].map((label, idx) => (
              <button
                key={label}
                type="button"
                className={`pf-mob-step-pill ${step === idx + 1 ? 'active' : ''} ${step > idx + 1 ? 'done' : ''}`}
                onClick={() => { if (step > idx + 1) setStep(idx + 1); }}
              >
                {step > idx + 1 && <span>✓</span>}
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Desktop Stepper ── */}
        <div className="pf-progress">
          {[
            "Informations",
            "Localisation",
            "Caractéristiques",
            "Photos",
            "Publication",
          ].map((label, index) => (
            <Fragment key={label}>
              <div
                className={`pf-progress-step ${step === index + 1 ? "active" : ""} ${step > index + 1 ? "done" : ""}`}
                onClick={() => { if (step > index + 1) setStep(index + 1); }}
              >
                <span className="pf-progress-num">
                  {step > index + 1 ? "✓" : index + 1}
                </span>
                <span>{label}</span>
              </div>
              {index < 4 && (
                <div
                  className={`pf-line ${step > index + 1 ? "done" : ""}`}
                />
              )}
            </Fragment>
          ))}
        </div>

        <form onSubmit={submit}>
          {/* ══════════════════════════════════════
              ÉTAPE 1 : INFORMATIONS DE BASE
          ══════════════════════════════════════ */}
          {step === 1 && (
            <section className="pf-card">
              <h2 className="pf-step-title">Informations de base</h2>
              <div className="pf-row">
                <Field label="Titre de l'annonce *" error={errors.title}>
                  <input
                    className="pf-input"
                    value={data.title}
                    maxLength="200"
                    placeholder="Ex: Appartement moderne 3 pièces à Bastos"
                    onChange={(e) => update("title", e.target.value)}
                  />
                </Field>
                <Field
                  label="Type de transaction *"
                  error={errors.transaction_type}
                >
                  <select
                    className="pf-select"
                    value={data.transaction_type}
                    onChange={(e) => update("transaction_type", e.target.value)}
                  >
                    <option value="">Sélectionner...</option>
                    {TRANSACTIONS.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="pf-row">
                <Field label="Type de bien *" error={errors.property_type}>
                  <select
                    className="pf-select"
                    value={data.property_type}
                    onChange={(e) => update("property_type", e.target.value)}
                  >
                    <option value="">Sélectionner...</option>
                    {PROPERTY_TYPES.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </Field>
                <Field
                  label={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span>
                        {data.transaction_type === "VENTE"
                          ? "Prix de vente total (FCFA) *"
                          : data.transaction_type === "COURTE_DUREE"
                          ? "Tarif par nuitée (FCFA / nuit) *"
                          : "Loyer mensuel (FCFA) *"}
                      </span>
                      {data.transaction_type !== "VENTE" && (
                        <button
                          type="button"
                          onClick={() => setRentEstimatorOpen(true)}
                          style={{
                            background: 'rgba(212, 175, 55, 0.12)',
                            border: '1px solid rgba(212, 175, 55, 0.4)',
                            color: '#D4AF37',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            borderRadius: 6,
                            padding: '3px 8px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5
                          }}
                          title="Estimer le prix optimal selon les critères du marché"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
                            <path d="M12 12L2.5 7.5"/>
                            <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
                          </svg>
                          Estimer avec l'IA
                        </button>
                      )}
                    </div>
                  }
                  error={errors.price}
                >
                  <input
                    className="pf-input"
                    inputMode="numeric"
                    value={data.price}
                    placeholder={
                      data.transaction_type === "VENTE"
                        ? "Ex: 45000000"
                        : data.transaction_type === "COURTE_DUREE"
                        ? "Ex: 25000"
                        : "Ex: 150000"
                    }
                    onChange={(e) =>
                      update("price", e.target.value.replace(/\D/g, ""))
                    }
                  />
                  {data.price && Number(data.price) > 0 && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: '#7A5B0B', fontWeight: 700, marginTop: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm-1 18h2v1h-2v-1zm-2-1h6v1H9v-1z"/></svg>
                      <span>
                        {Number(data.price).toLocaleString('fr-FR')} FCFA
                        {data.transaction_type === 'LOCATION' && ' / mois'}
                        {data.transaction_type === 'COURTE_DUREE' && ' / nuitée'}
                        {data.transaction_type === 'VENTE' && ' (Prix total)'}
                      </span>
                    </div>
                  )}
                  <label className="pf-check" style={{ marginTop: 6 }}>
                    <input
                      type="checkbox"
                      checked={data.price_negotiable}
                      onChange={(e) =>
                        update("price_negotiable", e.target.checked)
                      }
                    />
                    Prix négociable
                  </label>
                </Field>
              </div>

              {/* ── Champs conditionnels selon le type de transaction ── */}
              {data.transaction_type === "VENTE" ? (
                <div className="pf-row">
                  <Field label="Titre de propriété / Statut foncier (Recommandé)">
                    <select
                      className="pf-select"
                      value={data.titre_propriete || ""}
                      onChange={(e) => update("titre_propriete", e.target.value)}
                    >
                      <option value="">Sélectionner le document foncier...</option>
                      <option value="TITRE_FONCIER">Titre Foncier individuel (Direct)</option>
                      <option value="MUTATION_PARTIELLE">Titre Foncier global (Mutation à effectuer)</option>
                      <option value="CERTIFICAT_PROPRIETE">Certificat de propriété délivré</option>
                      <option value="DOSSIER_TECHNIQUE">Dossier technique de morcellement approuvé</option>
                      <option value="SEING_PRIVE">Acte sous seing privé / Abandon coutumier</option>
                    </select>
                  </Field>
                  <Field label="Superficie du terrain / parcelle (m²) - Optionnel">
                    <input
                      className="pf-input"
                      type="number"
                      placeholder="Ex: 500"
                      value={data.surface_terrain || ""}
                      onChange={(e) => update("surface_terrain", e.target.value)}
                    />
                  </Field>
                </div>
              ) : data.transaction_type === "COURTE_DUREE" ? (
                <div className="pf-row">
                  <Field label="Séjour minimum requis (nuits)">
                    <input
                      className="pf-input"
                      type="number"
                      min="1"
                      max="30"
                      value={data.duree_min_nuits || 1}
                      onChange={(e) => update("duree_min_nuits", e.target.value)}
                    />
                    <div className="pf-chip-row">
                      {[1, 2, 3, 5, 7].map((n) => (
                        <button
                          key={`min-${n}`}
                          type="button"
                          className={`pf-chip-btn ${Number(data.duree_min_nuits || 1) === n ? 'active' : ''}`}
                          onClick={() => update("duree_min_nuits", n)}
                        >
                          {n === 1 ? '1 nuit' : `${n} nuits`}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Caution de séjour forfaitaire (FCFA) - Optionnel">
                    <input
                      className="pf-input"
                      inputMode="numeric"
                      placeholder="Ex: 25000 (0 si aucune)"
                      value={data.caution_sejour || ""}
                      onChange={(e) => update("caution_sejour", e.target.value.replace(/\D/g, ""))}
                    />
                    <div className="pf-help">Garantie forfaitaire restituée au voyageur au départ.</div>
                  </Field>
                </div>
              ) : (
                <div className="pf-row">
                  <Field label="Avance exigée (mois)">
                    <input
                      className="pf-input"
                      type="number"
                      min="0"
                      max="24"
                      value={data.avance_mois}
                      onChange={(e) => update("avance_mois", e.target.value)}
                    />
                    <div className="pf-chip-row">
                      {[0, 1, 2, 3, 6, 12].map((n) => (
                        <button
                          key={`av-${n}`}
                          type="button"
                          className={`pf-chip-btn ${Number(data.avance_mois) === n ? 'active' : ''}`}
                          onClick={() => update("avance_mois", n)}
                        >
                          {n === 0 ? '0' : `${n}m`}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Caution (mois)">
                    <input
                      className="pf-input"
                      type="number"
                      min="0"
                      max="24"
                      value={data.caution_mois}
                      onChange={(e) => update("caution_mois", e.target.value)}
                    />
                    <div className="pf-chip-row">
                      {[0, 1, 2, 3, 6, 12].map((n) => (
                        <button
                          key={`caut-${n}`}
                          type="button"
                          className={`pf-chip-btn ${Number(data.caution_mois) === n ? 'active' : ''}`}
                          onClick={() => update("caution_mois", n)}
                        >
                          {n === 0 ? '0' : `${n}m`}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              )}
              <Field label="Description du bien (Optionnelle)" error={errors.description}>
                <textarea
                  className="pf-textarea"
                  maxLength="2000"
                  value={data.description}
                  placeholder="Décrivez votre bien : état général, points forts, environnement, commodités proches... (Optionnel)"
                  onChange={(e) => update("description", e.target.value)}
                />
                <small className="pf-help">
                  Précisez les atouts du logement si vous le souhaitez. Maximum 2 000 caractères.
                </small>
              </Field>
            </section>
          )}

          {/* ══════════════════════════════════════
              ÉTAPE 2 : LOCALISATION DU BIEN
          ══════════════════════════════════════ */}
          {step === 2 && (
            <section className="pf-card">
              <h2 className="pf-step-title">Localisation du bien</h2>
              <div className="pf-notice">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="var(--or-d)" style={{ flexShrink: 0, marginTop: 2 }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                <span>
                  <strong>Conseil :</strong> Autorisez l'accès à votre position ou recherchez votre quartier, puis placez précisément le marqueur sur la carte.
                </span>
              </div>
              <div className="pf-row">
                <Field label="Adresse complète *" error={errors.address}>
                  <input
                    className="pf-input"
                    value={data.address}
                    placeholder="Ex: Rue 1420, face supermarché"
                    onChange={(e) => update("address", e.target.value)}
                  />
                </Field>
                <Field label="Ville *" error={errors.city}>
                  <select
                    className="pf-select"
                    value={data.city}
                    onChange={(e) => {
                      setCustomNeighborhoodMode(false);
                      update("city", e.target.value);
                      update("neighborhood", "");
                    }}
                  >
                    <option value="">Sélectionner...</option>
                    {CITIES.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <div style={{ marginBottom: 18 }}>
                {(() => {
                  const neighborhoods = CITY_NEIGHBORHOODS[data.city] || [];
                  const count = neighborhoods.length;
                  const isCustom = customNeighborhoodMode || (Boolean(data.neighborhood) && !neighborhoods.includes(data.neighborhood));

                  return (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7, flexWrap: 'wrap', gap: 6 }}>
                        <label className="pf-label" style={{ margin: 0 }}>
                          Quartier {data.city ? (
                            <span style={{ color: 'var(--or-d)', fontWeight: 800, marginLeft: 4 }}>
                              ({count > 0 ? `${count} quartiers répertoriés` : 'Saisie libre'})
                            </span>
                          ) : (
                            <span style={{ color: 'var(--gris-m)', fontWeight: 400, fontSize: 12 }}>
                              — choisissez d'abord une ville
                            </span>
                          )}
                        </label>
                        {data.city && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = !isCustom;
                              setCustomNeighborhoodMode(next);
                              if (!next) update("neighborhood", "");
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#B8860B',
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '2px 6px',
                              borderRadius: 6,
                              textDecoration: 'underline'
                            }}
                          >
                            {isCustom ? `← Choisir dans la liste (${count})` : "✏️ Mon quartier n'est pas listé ? Saisir ici"}
                          </button>
                        )}
                      </div>

                      {isCustom ? (
                        <div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <input
                              className="pf-input"
                              value={data.neighborhood}
                              placeholder="Saisissez le nom exact de votre quartier..."
                              onChange={(e) => update("neighborhood", e.target.value)}
                              autoFocus
                            />
                            {count > 0 && (
                              <button
                                type="button"
                                className="pf-btn secondary"
                                onClick={() => {
                                  setCustomNeighborhoodMode(false);
                                  update("neighborhood", "");
                                }}
                                style={{ flexShrink: 0, padding: '0 12px', fontSize: 12 }}
                                title="Revenir à la liste déroulante"
                              >
                                Liste ({count})
                              </button>
                            )}
                          </div>
                          <small className="pf-help" style={{ marginTop: 4, display: 'block' }}>
                            Saisissez librement le nom de votre quartier s'il n'est pas dans les {count} quartiers proposés.
                          </small>
                        </div>
                      ) : (
                        <div>
                          <select
                            className="pf-select"
                            value={data.neighborhood}
                            disabled={!data.city}
                            onChange={(e) => {
                              if (e.target.value === "__custom__") {
                                setCustomNeighborhoodMode(true);
                                update("neighborhood", "");
                              } else {
                                update("neighborhood", e.target.value);
                              }
                            }}
                          >
                            <option value="">
                              {data.city
                                ? `Sélectionner un quartier (${count} quartiers à ${data.city})...`
                                : "Sélectionnez d'abord une ville ci-dessus"}
                            </option>
                            {data.city && (
                              <option value="__custom__" style={{ fontWeight: 'bold', color: '#B8860B' }}>
                                ✏️ Mon quartier n'est pas dans la liste (Saisir manuellement)...
                              </option>
                            )}
                            {neighborhoods.map((n) => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                            {data.city && (
                              <option value="__custom__" style={{ fontWeight: 'bold', color: '#B8860B' }}>
                                ✏️ Autre quartier (Saisir manuellement)...
                              </option>
                            )}
                          </select>
                          {data.city && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 5, fontSize: 11.5, color: 'var(--gris-m)' }}>
                              <span>💡 {count} quartiers répertoriés pour {data.city}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setCustomNeighborhoodMode(true);
                                  update("neighborhood", "");
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#B8860B',
                                  fontSize: 11.5,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  textDecoration: 'underline'
                                }}
                              >
                                Quartier introuvable ? Saisir manuellement
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
              <GooglePropertyMap
                city={data.city}
                neighborhood={data.neighborhood}
                position={position}
                onChange={setCoords}
                onNeighborhoodFound={(n) => update("neighborhood", n)}
              />
              {data.latitude && (
                <div className="pf-coords">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                  <span>Position confirmée : {Number(data.latitude).toFixed(5)}, {Number(data.longitude).toFixed(5)}</span>
                </div>
              )}
              {errors.location && (
                <div className="pf-error">{errors.location}</div>
              )}
            </section>
          )}

          {/* ══════════════════════════════════════
              ÉTAPE 3 : CARACTÉRISTIQUES
          ══════════════════════════════════════ */}
          {step === 3 && (
            <section className="pf-card">
              <h2 className="pf-step-title">Caractéristiques du bien</h2>
              <div className="pf-row three">
                <Field label="Surface (m²) *" error={errors.area}>
                  <input
                    className="pf-input"
                    type="number"
                    min="10"
                    value={data.area}
                    placeholder="Ex: 85"
                    onChange={(e) => update("area", e.target.value)}
                  />
                  <div className="pf-chip-row">
                    {[25, 45, 75, 100, 150, 200].map((s) => (
                      <button
                        key={`surf-${s}`}
                        type="button"
                        className={`pf-chip-btn ${Number(data.area) === s ? 'active' : ''}`}
                        onClick={() => update("area", s)}
                      >
                        {s}m²
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Chambres">
                  <div className="pf-stepper-input">
                    <button
                      type="button"
                      className="pf-stepper-btn"
                      onClick={() => update("bedrooms", Math.max(0, Number(data.bedrooms || 0) - 1))}
                    >
                      −
                    </button>
                    <span className="pf-stepper-val">{data.bedrooms || 0}</span>
                    <button
                      type="button"
                      className="pf-stepper-btn"
                      onClick={() => update("bedrooms", Number(data.bedrooms || 0) + 1)}
                    >
                      +
                    </button>
                  </div>
                </Field>
                <Field label="Salles de bain">
                  <div className="pf-stepper-input">
                    <button
                      type="button"
                      className="pf-stepper-btn"
                      onClick={() => update("bathrooms", Math.max(1, Number(data.bathrooms || 1) - 1))}
                    >
                      −
                    </button>
                    <span className="pf-stepper-val">{data.bathrooms || 1}</span>
                    <button
                      type="button"
                      className="pf-stepper-btn"
                      onClick={() => update("bathrooms", Number(data.bathrooms || 1) + 1)}
                    >
                      +
                    </button>
                  </div>
                </Field>
              </div>
              <span className="pf-label" style={{ display: 'block', marginTop: 12 }}>Équipements & Prestations</span>
              <div className="pf-amenities">
                {AMENITIES.map(([key, label]) => (
                  <label key={key} className={`pf-amenity ${data[key] ? "checked" : ""}`}>
                    <input
                      type="checkbox"
                      checked={data[key]}
                      onChange={(e) => update(key, e.target.checked)}
                    />
                    <span>
                      <AmenityIcon name={key} /> {label}
                    </span>
                  </label>
                ))}
              </div>

              {/* ── Réalités du Terrain & Quartier (Terrain 237 - 100% Optionnel) ── */}
              <div style={{
                marginTop: 28,
                padding: '20px 22px',
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 246, 238, 0.8) 100%)',
                border: '1.5px solid rgba(212, 175, 55, 0.35)',
                borderRadius: 18,
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: 'rgba(212, 175, 55, 0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#B8860B'
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                        <line x1="8" y1="2" x2="8" y2="18"></line>
                        <line x1="16" y1="6" x2="16" y2="22"></line>
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, fontFamily: 'Poppins, sans-serif', color: '#111827' }}>
                        Réalités du Terrain & Quartier
                      </h3>
                      <span style={{ fontSize: 11.5, color: '#6B7280' }}>Détails rassurants pour les futurs locataires (Facultatif)</span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10.5, fontWeight: 700,
                    padding: '3px 9px', borderRadius: 20,
                    background: 'rgba(30, 122, 71, 0.1)', color: '#1E7A47'
                  }}>
                    Optionnel
                  </span>
                </div>

                <div className="pf-row" style={{ gap: 14 }}>
                  {/* Source d'eau */}
                  <Field label="Alimentation en Eau">
                    <div style={{ position: 'relative' }}>
                      <select
                        className="pf-select"
                        value={data.water_source || ''}
                        onChange={(e) => update('water_source', e.target.value)}
                      >
                        <option value="">Non précisé</option>
                        <option value="FORAGE">Forage privé garanti</option>
                        <option value="CAMWATER">Réseau CAMWATER</option>
                        <option value="FORAGE_CAMWATER">Double source (Forage + CAMWATER)</option>
                        <option value="CITERNE">Citerne / Réserve d'eau</option>
                      </select>
                    </div>
                  </Field>

                  {/* Type d'électricité / Compteur */}
                  <Field label="Compteur & Électricité">
                    <select
                      className="pf-select"
                      value={data.electricity_type || ''}
                      onChange={(e) => update('electricity_type', e.target.value)}
                    >
                      <option value="">Non précisé</option>
                      <option value="PREPAYE">Compteur prépayé individuel (ENEO)</option>
                      <option value="POSTPAYE">Compteur classique (Postpayé)</option>
                      <option value="PARTAGE">Compteur divisionnaire / partagé</option>
                      <option value="SOLAIRE">Solaire / Groupe de secours</option>
                    </select>
                  </Field>
                </div>

                <div className="pf-row" style={{ gap: 14, marginTop: 10 }}>
                  {/* Accès routier */}
                  <Field label="État de la Route & Accès">
                    <select
                      className="pf-select"
                      value={data.road_access || ''}
                      onChange={(e) => update('road_access', e.target.value)}
                    >
                      <option value="">Non précisé</option>
                      <option value="GOUDRON_DIRECT">Goudron direct jusqu'à la barrière</option>
                      <option value="PISTE_PROCHE">Piste aménagée (moins de 100m du goudron)</option>
                      <option value="PISTE_MOYENNE">Piste carrossable (100m à 500m)</option>
                      <option value="PISTE_DIFFICILE">Piste en terre (plus de 500m)</option>
                    </select>
                  </Field>

                  {/* Distance du goudron */}
                  <Field label="Distance exacte du goudron (mètres)">
                    <input
                      type="number"
                      min="0"
                      className="pf-input"
                      value={data.distance_goudron || ''}
                      placeholder="Ex: 50 (laisser vide si sur le goudron)"
                      onChange={(e) => update('distance_goudron', e.target.value)}
                    />
                  </Field>
                </div>

                <div className="pf-row three" style={{ gap: 12, marginTop: 10 }}>
                  {/* Réseau mobile */}
                  <Field label="Réseau Mobile (MTN & Orange)">
                    <select
                      className="pf-select"
                      value={data.network_quality || ''}
                      onChange={(e) => update('network_quality', e.target.value)}
                    >
                      <option value="">Non précisé</option>
                      <option value="EXCELLENT">4G / 5G parfaits</option>
                      <option value="BON">Réseau stable</option>
                      <option value="MOYEN">Réseau moyen à l'intérieur</option>
                    </select>
                  </Field>

                  {/* Transports */}
                  <Field label="Accès Transports">
                    <select
                      className="pf-select"
                      value={data.transport_access || ''}
                      onChange={(e) => update('transport_access', e.target.value)}
                    >
                      <option value="">Non précisé</option>
                      <option value="DEPOT_MOTO_IMMEDIAT">Motos & Taxis à la porte</option>
                      <option value="MARCHE_COURTE">Taxis à moins de 5 min à pied</option>
                      <option value="ELOIGNE">Zone calme / isolée</option>
                    </select>
                  </Field>

                  {/* Risque inondation */}
                  <Field label="Risque d'Inondation">
                    <select
                      className="pf-select"
                      value={data.flood_risk || ''}
                      onChange={(e) => update('flood_risk', e.target.value)}
                    >
                      <option value="">Non précisé</option>
                      <option value="NUL">Risque nul (Zone en hauteur)</option>
                      <option value="FAIBLE">Zone bien drainée</option>
                      <option value="MOYEN">Zone basse en saison de pluie</option>
                    </select>
                  </Field>
                </div>
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════
              ÉTAPE 4 : PHOTOS DU BIEN
          ══════════════════════════════════════ */}
          {step === 4 && (
            <section className="pf-card">
              <h2 className="pf-step-title">Photos du bien</h2>
              <label className="pf-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => selectMain(e.target.files[0])}
                />
                {mainPreview ? (
                  <img src={mainPreview} alt="Image principale" />
                ) : (
                  <div className="pf-upload-content">
                    <span className="pf-upload-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg>
                    </span>
                    <strong style={{ fontSize: 15, color: 'var(--noir)' }}>Photo principale (Couverture) *</strong>
                    <small style={{ color: 'var(--gris-m)' }}>
                      Touchez ou glissez-déposez la meilleure photo de votre bien (max 5 Mo)
                    </small>
                  </div>
                )}
              </label>
              {errors.main_image && (
                <div className="pf-error">{errors.main_image}</div>
              )}
              <small className="pf-help">
                L'image principale sera mise en avant dans les résultats de recherche et sur votre tableau de bord.
              </small>

              {/* Galerie secondaire */}
              <div className="pf-gallery-head">
                <h3 style={{ fontSize: 15, fontWeight: 800 }}>Galerie photos additionnelles</h3>
                <strong style={{ color: 'var(--or-d)' }}>{existingImages.length + photos.length} / 10</strong>
              </div>
              <p className="pf-help">
                Ajoutez jusqu’à 10 photos supplémentaires pour mettre en valeur chaque pièce.
              </p>
              <div className="pf-gallery-grid">
                {existingImages.map((image) => (
                  <div key={image.id || image.image_url || image.image} className="pf-preview">
                    <img src={image.image_url || image.image} alt="Galerie" />
                    <button
                      type="button"
                      className="pf-remove"
                      onClick={async () => {
                        await propertiesApi.deleteImage(id, image.id);
                        setExistingImages((current) =>
                          current.filter((item) => item.id !== image.id),
                        );
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {photos.map((photo, index) => (
                  <div key={photo.preview || index} className="pf-preview">
                    <img src={photo.preview} alt="Galerie" />
                    <button
                      type="button"
                      className="pf-remove"
                      onClick={() =>
                        setPhotos((current) =>
                          current.filter(
                            (_, currentIndex) => currentIndex !== index,
                          ),
                        )
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
                {existingImages.length + photos.length < 10 && (
                  <label className="pf-gallery-add">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => selectPhotos(e.target.files)}
                    />
                    <span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--or-d)" style={{ marginBottom: 4 }}><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                      <br />
                      <strong>Ajouter des photos</strong>
                      <br />
                      <small>JPG, PNG, WebP</small>
                    </span>
                  </label>
                )}
              </div>

              {/* Callout Visite 360° */}
              <div style={{
                marginTop: 22, padding: '14px 16px',
                background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(246,211,101,0.12))',
                borderRadius: 14, border: '1px solid rgba(212,175,55,0.3)',
                display: 'flex', alignItems: 'center', gap: 12
              }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#0F0D09', display: 'grid', placeItems: 'center', color: '#F6D365', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                  360°
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--noir)' }}>
                  <strong>Visite Virtuelle 360° & Reels Vidéo :</strong>
                  <div style={{ fontSize: 11.5, color: 'var(--gris-m)', marginTop: 2 }}>
                    Dès la publication de votre annonce, vous pourrez configurer une immersion 360° interactive directement depuis votre Dashboard !
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════
              ÉTAPE 5 : VÉRIFICATION & PUBLICATION
          ══════════════════════════════════════ */}
          {step === 5 && (
            <section className="pf-card">
              <h2 className="pf-step-title">Vérification et publication</h2>
              
              {/* Ticket de prévisualisation luxury */}
              <div style={{
                border: '1px solid rgba(212,175,55,0.35)',
                borderRadius: 16,
                background: '#fff',
                padding: '16px 18px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                marginBottom: 20
              }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12 }}>
                  {mainPreview ? (
                    <img src={mainPreview} alt="" style={{ width: 70, height: 70, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 70, height: 70, borderRadius: 12, background: 'var(--gris-b)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--gris-m)"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--noir)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {data.title || "Titre de l'annonce"}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--gris-m)', marginTop: 2 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                      <span>{[data.neighborhood, data.city].filter(Boolean).join(", ") || "Emplacement non spécifié"}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--vert)', marginTop: 4 }}>
                      {data.price ? `${Number(data.price).toLocaleString("fr-FR")} FCFA` : "Prix non fixé"}
                      {data.transaction_type === 'LOCATION' && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gris-m)' }}> / mois</span>}
                      {data.transaction_type === 'COURTE_DUREE' && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gris-m)' }}> / nuitée</span>}
                      {data.transaction_type === 'VENTE' && <span style={{ fontSize: 11, fontWeight: 600, color: '#B8860B' }}> (Prix de vente)</span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px solid var(--gris-b)', fontSize: 11.5, color: 'var(--gris)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: 'var(--gris-f)', borderRadius: 6 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z"/></svg>
                    <span>{data.property_type || "Bien"}</span>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: 'var(--gris-f)', borderRadius: 6 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/></svg>
                    <span>{data.area || "—"} m²</span>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: 'var(--gris-f)', borderRadius: 6 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M20 10V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3a2 2 0 0 0-2 2v5h1.33L4 19h1l.67-2h12.66l.67 2h1l.67-2H22v-5a2 2 0 0 0-2-2zm-9-3h6v3h-6V7zm-7 5h16v3H4v-3z"/></svg>
                    <span>{data.bedrooms || 0} ch.</span>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: 'var(--gris-f)', borderRadius: 6 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M21 14v1c0 2.76-2.24 5-5 5H8c-2.76 0-5-2.24-5-5v-1H2v-2h20v2h-1zM7 11V4c0-.55.45-1 1-1s1 .45 1 1v7H7z"/></svg>
                    <span>{data.bathrooms || 1} sdb.</span>
                  </span>
                  {data.transaction_type === 'VENTE' && data.titre_propriete && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: '#FEF3C7', color: '#92400E', borderRadius: 6, fontWeight: 700 }}>
                      <span>TF : {data.titre_propriete}</span>
                    </span>
                  )}
                  {data.transaction_type === 'COURTE_DUREE' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: '#ECFDF5', color: '#065F46', borderRadius: 6, fontWeight: 700 }}>
                      <span>Séjour min : {data.duree_min_nuits || 1} nuit(s)</span>
                    </span>
                  )}
                  {data.transaction_type === 'LOCATION' && Number(data.avance_mois) > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: 'var(--gris-f)', borderRadius: 6 }}>
                      <span>Avance : {data.avance_mois}m</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="pf-notice">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--or-d)" style={{ flexShrink: 0, marginTop: 2 }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                <span>
                  {isEditing ? (
                    'Vos modifications seront enregistrées et appliquées immédiatement sur votre annonce.'
                  ) : (
                    <>
                      Votre annonce sera auditée et mise en avant sur Piolo. Coût de la publication : <strong>20 points</strong>.
                    </>
                  )}
                </span>
              </div>

              <label className="pf-check" style={{ marginTop: 14 }}>
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                />
                Je certifie que toutes les informations sont exactes et que je suis autorisé à publier ce bien.
              </label>
              {errors.terms && <div className="pf-error">{errors.terms}</div>}
            </section>
          )}

          {/* Navigation standard */}
          <div className="pf-nav">
            <button
              className="pf-btn secondary"
              type="button"
              disabled={step === 1}
              onClick={() => setStep((current) => current - 1)}
            >
              ← Étape précédente
            </button>
            {step < 5 ? (
              <button
                className="pf-btn primary"
                type="button"
                onClick={nextStep}
              >
                Étape suivante →
              </button>
            ) : (
              <button
                className="pf-btn primary"
                type="submit"
                disabled={submitting}
              >
                {submitting
                  ? "Publication en cours…"
                  : isEditing
                    ? "Enregistrer les modifications"
                    : "Publier mon annonce"}
              </button>
            )}
          </div>

          {/* Barre flottante sticky pour mobile */}
          <div className="pf-sticky-footer">
            {step > 1 && (
              <button
                type="button"
                className="pf-btn secondary"
                onClick={() => setStep((current) => current - 1)}
                style={{ flex: 1, padding: '10px 12px', fontSize: 12 }}
              >
                ← Précédent
              </button>
            )}
            {step < 5 ? (
              <button
                type="button"
                className="pf-btn primary"
                onClick={nextStep}
                style={{ flex: 2, padding: '10px 14px', fontSize: 12.5 }}
              >
                Continuer ({step}/5) →
              </button>
            ) : (
              <button
                type="submit"
                className="pf-btn primary"
                disabled={submitting}
                style={{ flex: 2, padding: '10px 14px', fontSize: 12.5 }}
              >
                {submitting ? "Publication…" : isEditing ? "Enregistrer" : "Publier (20 pts)"}
              </button>
            )}
          </div>

          {serverError && <div className="pf-server-error">{serverError}</div>}
        </form>
      </main>

      {/* ── MODAL DE CONFIRMATION DE DÉBIT DE POINTS (PUBLICATION ANNONCE - 20 PTS) ── */}
      <PointConfirmationModal
        isOpen={confirmOpen}
        actionKey="PROPERTY_PUBLISH"
        userRole="landlord"
        targetTitle={data.title || "Nouvelle annonce immobilière"}
        targetSubtitle={`${data.city || 'Yaoundé'}${data.neighborhood ? ' · ' + data.neighborhood : ''} • ${data.price ? Number(data.price).toLocaleString('fr-FR') + ' FCFA' : ''}`}
        onConfirm={() => submit(null, true)}
        onCancel={() => setConfirmOpen(false)}
        onOpenRecharge={() => {
          setConfirmOpen(false);
          setRechargeModalOpen(true);
        }}
      />

      {/* Modal de recharge directe de points */}
      {rechargeModalOpen && (
        <LandlordSubscriptionModal
          currentPoints={user?.points ?? 0}
          onClose={() => setRechargeModalOpen(false)}
          onRechargeSuccess={async () => {
            await refreshUser?.();
            setRechargeModalOpen(false);
            setConfirmOpen(true);
          }}
          onSubscribeSuccess={async () => {
            await refreshUser?.();
            setRechargeModalOpen(false);
            setConfirmOpen(true);
          }}
        />
      )}

      {/* ── MODAL ESTIMATEUR DE LOYER IA ── */}
      {rentEstimatorOpen && (
        <RentEstimatorModal
          isOpen={rentEstimatorOpen}
          onClose={() => setRentEstimatorOpen(false)}
          initialData={data}
          onApplyPrice={(estimatedPrice) => {
            update("price", String(estimatedPrice));
          }}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeTab="create" />
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="pf-group">
      <label>{label}</label>
      {children}
      {error && (
        <span className="pf-error">
          {typeof error === "string" ? error : "Champ invalide"}
        </span>
      )}
    </div>
  );
}
