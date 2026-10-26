const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/PropertyListPage-B67losFD.js","assets/rolldown-runtime-Cq0jCQ29.js","assets/vendor-react-DlxHbF51.js","assets/api-B9EIXznq.js","assets/Sidebar-BnvPh3AM.js","assets/LanguageSwitcher-DswgqiiV.js","assets/MobileBottomNav-D4MU-Ep3.js","assets/AuthContext-CFgS1DSp.js","assets/prefetch-DmmbGXN_.js","assets/AppSidebar.css","assets/DarkModeContext-Dv4KCI6O.js","assets/PioloLoader-mtAGafTw.js","assets/PropertyCard-I9AicKVB.js","assets/media-CF4hGFW6.js","assets/PropertySearchSheet-BshpP5Gz.js","assets/SkeletonCard-C5SbezWv.js","assets/UserAvatarMenu-B28QvoTw.js","assets/dashboard.css","assets/PropertyDetail-CSDhYd5C.js","assets/PointConfirmationModal-C2OJmAfg.js","assets/PostPublishBoostModal-CHLAEXDZ.js","assets/TenantSubscriptionModal-B_MpGedP.js","assets/PropertyFormPage-dJGWyU3F.js","assets/RentEstimatorModal-DNPnZ_4g.js","assets/RentEstimatorModal.css","assets/SearchAlertsPage-CukvDFQg.js","assets/FavoritesListPage-CWNBJRYk.js","assets/NotificationCenter-DTAd2LG1.js","assets/NotificationCenter.css","assets/VisitsListPage-CG7DEdkO.js","assets/LocationsListPage-5T_9r92j.js","assets/InteractiveMapPage-kf806n8W.js","assets/ArchitectsPage-5Xsg5PBB.js","assets/ProLocationPickerMap-BpVHmGNa.js","assets/ProBudgetCalculator-Dz4ZnBGo.js","assets/ProDiscoveryVideoModal-DJZ-jLVE.js","assets/TourViewer-NwBZT_N6.js","assets/TourEditor-DRR4aC-Z.js","assets/DiscoveryPage-MPU77NSy.js","assets/ResetPasswordPage-CkHRbo0s.js","assets/Dashboard-CGsXZYbv.js","assets/Dashboard-Bh_RuraM.js","assets/imageCompressor-BjQdudgJ.js","assets/SuperAdminDashboard-BcZgTQPZ.js","assets/SiteConfigContext-Kn0tPRIv.js","assets/SuperAdminDashboard.css","assets/Dashboard-B7TrVLm2.js","assets/ProfilePage-GEuR10X5.js","assets/SecurityPage-DnF5aSrF.js","assets/SupportPage-UIiK699z.js","assets/CalendarPage-Cv4ofW--.js","assets/VisitDetail-DeWC8NTR.js","assets/LocationDetail-59pb5nQ_.js","assets/ChatPage-DzTOV7VB.js","assets/NotificationPage-DErclmvK.js","assets/NotificationPage.css","assets/PioloChatbot-CQoX345b.js","assets/PioloChatbot.css","assets/OnboardingManager-brrJBlcp.js","assets/OnboardingManager.css"])))=>i.map(i=>d[i]);
import{r as e}from"./rolldown-runtime-Cq0jCQ29.js";import{a as t,c as n,d as r,f as i,g as a,h as o,i as s,l as ee,n as c,o as l,p as te,r as u,s as d,t as f}from"./vendor-react-DlxHbF51.js";import{n as ne,t as p}from"./imageCompressor-BjQdudgJ.js";import{n as m,o as h,s as re}from"./api-B9EIXznq.js";import{n as ie,t as g}from"./AuthContext-CFgS1DSp.js";import{t as _}from"./DarkModeContext-Dv4KCI6O.js";import{n as v,t as ae}from"./SiteConfigContext-Kn0tPRIv.js";import{t as y}from"./media-CF4hGFW6.js";import{t as b}from"./NotificationCenter-DTAd2LG1.js";import{t as x}from"./LanguageSwitcher-DswgqiiV.js";import{a as oe}from"./prefetch-DmmbGXN_.js";import{t as S}from"./PropertyCard-I9AicKVB.js";import{t as se}from"./PropertySearchSheet-BshpP5Gz.js";import{i as ce,r as le,t as C}from"./SkeletonCard-C5SbezWv.js";import{a as ue,i as de,r as fe}from"./ProLocationPickerMap-BpVHmGNa.js";import{n as pe,t as me}from"./ProBudgetCalculator-Dz4ZnBGo.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var w=e(a(),1),T=o(),E=f();function he(){let{isAuthenticated:e,loading:r}=ie(),i=n();return r?(0,E.jsx)(`div`,{className:`auth-loading`,children:(0,E.jsx)(`div`,{className:`spinner`})}):e?(0,E.jsx)(t,{}):(0,E.jsx)(s,{to:`/login`,state:{from:i},replace:!0})}function D({allowedRoles:e=[]}){let{user:n,loading:r}=ie();if(r)return(0,E.jsx)(`div`,{className:`auth-loading`,children:(0,E.jsx)(`div`,{className:`spinner`})});if(!n)return(0,E.jsx)(s,{to:`/login`,replace:!0});let i=e.includes(`ADMIN`)&&(n.role===`ADMIN`||n.is_staff||n.is_superuser);return e.length&&!e.includes(n.role)&&!i?(0,E.jsx)(s,{to:`/unauthorized`,replace:!0}):(0,E.jsx)(t,{})}function ge(){let{t:e}=te(),{isAuthenticated:t,user:r,logout:i}=ie(),{config:a}=v(),o=n();ee();let[s,c]=(0,w.useState)(!1),[l,d]=(0,w.useState)(!1),f=(0,w.useRef)(null),ne=a.logo_url||`/static/img/logo-piolo-clean.png`,p=()=>c(!1);(0,w.useEffect)(()=>{let e=e=>{f.current&&!f.current.contains(e.target)&&d(!1)};return document.addEventListener(`mousedown`,e),document.addEventListener(`touchstart`,e),()=>{document.removeEventListener(`mousedown`,e),document.removeEventListener(`touchstart`,e)}},[]),(0,w.useEffect)(()=>{c(!1)},[o.pathname]),(0,w.useEffect)(()=>(s?document.body.style.overflow=`hidden`:document.body.style.overflow=``,()=>{document.body.style.overflow=``}),[s]);let m=r?.role===`ARCHITECTE`||r?.role===`PRO`||r?.role===`PROFESSIONNEL`||r?.is_architecte||r?.is_pro,h=r?.role===`BAILLEUR`||r?.is_bailleur?`/dashboard/bailleur`:m?`/dashboard/pro`:r?.role===`ADMIN`?`/dashboard/admin`:`/dashboard/locataire`;return(0,E.jsxs)(`header`,{className:`navbar-header`,style:{position:`fixed`,top:0,left:0,right:0,zIndex:12e3},children:[(0,E.jsx)(`style`,{children:`
        @media (max-width: 850px) {
          .nav-desktop-links { display: none !important; }
          .nav-desktop-actions { display: none !important; }
          .nav-mobile-bar-actions { display: flex !important; }
        }
        @media (min-width: 851px) {
          .nav-mobile-bar-actions { display: none !important; }
          .nav-mobile-drawer { display: none !important; }
        }
        .nav-logo-link {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          min-width: 0;
          flex-shrink: 1;
        }
        .nav-logo-img {
          height: 36px;
          width: auto;
          object-fit: contain;
          flex-shrink: 0;
        }
        .nav-logo-text {
          font-family: 'Poppins', sans-serif;
          font-weight: 800;
          color: #D4AF37;
          font-size: 18px;
          letter-spacing: -0.3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        @media (max-width: 540px) {
          .navbar-top-container {
            padding: 0 10px !important;
          }
          .nav-logo-img {
            height: 30px !important;
          }
          .nav-logo-text {
            font-size: 15px !important;
            max-width: 120px !important;
          }
          .nav-mobile-bar-actions {
            gap: 5px !important;
          }
          .nav-mobile-points-badge {
            padding: 3px 6px !important;
            font-size: 10.5px !important;
          }
          .nav-mobile-burger-btn {
            width: 36px !important;
            height: 36px !important;
            font-size: 15px !important;
          }
        }
        @media (max-width: 380px) {
          .navbar-top-container {
            padding: 0 6px !important;
          }
          .nav-logo-text {
            font-size: 13.5px !important;
            max-width: 85px !important;
          }
          .nav-mobile-bar-actions {
            gap: 3px !important;
          }
        }
      `}),(0,E.jsx)(`div`,{className:`navbar-top-bar`,style:{background:`rgba(15, 13, 9, 0.96)`,backdropFilter:`blur(16px)`,WebkitBackdropFilter:`blur(16px)`,borderBottom:`1px solid rgba(212, 175, 55, 0.25)`,minHeight:`calc(62px + env(safe-area-inset-top, 0px))`,paddingTop:`env(safe-area-inset-top, 0px)`,boxSizing:`border-box`,display:`flex`,alignItems:`center`,position:`relative`,zIndex:12010},children:(0,E.jsxs)(`div`,{className:`navbar-top-container`,style:{maxWidth:1360,width:`100%`,margin:`0 auto`,padding:`0 16px`,display:`flex`,alignItems:`center`,justifyContent:`space-between`,gap:8},children:[(0,E.jsxs)(u,{to:`/`,onClick:p,className:`nav-logo-link`,children:[(0,E.jsx)(`img`,{src:ne,alt:a.site_name||`Piolo`,className:`nav-logo-img`,onError:e=>{e.currentTarget.src=`/static/img/logo-piolo-clean.png`}}),(0,E.jsx)(`span`,{className:`nav-logo-text`,children:a.site_name||`PIOLO`})]}),(0,E.jsxs)(`ul`,{className:`nav-desktop-links`,style:{display:`flex`,gap:24,alignItems:`center`,listStyle:`none`,margin:0,padding:0},children:[(0,E.jsx)(`li`,{children:(0,E.jsx)(u,{to:`/`,style:{color:o.pathname===`/`?`#F6D365`:`#E5E7EB`,fontWeight:600,fontSize:14},children:e(`nav.home`,`Accueil`)})}),(0,E.jsx)(`li`,{children:(0,E.jsxs)(u,{to:`/discovery`,className:`mode-decouverte-nav-highlight`,style:{background:`linear-gradient(135deg, rgba(212,175,55,0.2), rgba(230,197,106,0.35))`,border:`1px solid #D4AF37`,borderRadius:50,padding:`5px 14px`,color:`#FFE27A`,fontWeight:800,fontSize:13,display:`inline-flex`,alignItems:`center`,gap:6},children:[(0,E.jsx)(`i`,{className:`fas fa-play-circle`,style:{color:`#FFD700`}}),` `,e(`nav.discovery`,`Mode Découverte`)]})}),(0,E.jsx)(`li`,{children:(0,E.jsx)(`a`,{href:`/#annonces`,style:{color:`#E5E7EB`,fontWeight:500,fontSize:14},children:e(`nav.properties`,`Biens`)})}),(0,E.jsx)(`li`,{children:(0,E.jsx)(`a`,{href:`/#visite-3d`,style:{color:`#E5E7EB`,fontWeight:500,fontSize:14},children:e(`property.virtual_tour_badge`,`Visite 360°`)})}),(0,E.jsx)(`li`,{children:(0,E.jsx)(`a`,{href:`/#carte`,style:{color:`#E5E7EB`,fontWeight:500,fontSize:14},children:e(`nav.map`,`Carte 3D`)})}),(0,E.jsx)(`li`,{children:(0,E.jsx)(`a`,{href:`/#securite`,style:{color:`#E5E7EB`,fontWeight:500,fontSize:14},children:e(`common.verified`,`Sécurité CNI`)})})]}),(0,E.jsxs)(`div`,{className:`nav-desktop-actions`,style:{display:`flex`,alignItems:`center`,gap:14},children:[(0,E.jsx)(x,{compact:!0}),t?(0,E.jsxs)(E.Fragment,{children:[(0,E.jsxs)(`div`,{style:{background:`rgba(212,175,55,0.12)`,border:`1px solid rgba(212,175,55,0.35)`,borderRadius:20,padding:`5px 12px`,display:`inline-flex`,alignItems:`center`,gap:6,color:`#FFE27A`,fontSize:13,fontWeight:700},children:[(0,E.jsx)(`i`,{className:`fas fa-star`,style:{color:`#FFD700`,fontSize:11}}),(0,E.jsxs)(`span`,{children:[r?.points??50,` `,e(`nav.points`,`pts`)]})]}),(0,E.jsx)(b,{}),(0,E.jsxs)(`div`,{ref:f,style:{position:`relative`},children:[(0,E.jsx)(`button`,{type:`button`,onClick:()=>d(!l),style:{width:38,height:38,borderRadius:`50%`,background:`linear-gradient(135deg, #2A261D, #0F0D09)`,border:`2px solid #D4AF37`,display:`flex`,alignItems:`center`,justifyContent:`center`,color:`#D4AF37`,fontWeight:800,fontSize:14,cursor:`pointer`,overflow:`hidden`,padding:0},children:y(r?.avatar_url||r?.avatar)?(0,E.jsx)(`img`,{src:y(r.avatar_url||r.avatar),alt:`Avatar`,style:{width:`100%`,height:`100%`,objectFit:`cover`},onError:e=>{e.currentTarget.style.display=`none`}}):r?.first_name?.[0]?.toUpperCase()||`P`}),l&&(0,E.jsxs)(`div`,{style:{position:`absolute`,top:`calc(100% + 10px)`,right:0,width:220,background:`#1A1813`,border:`1px solid rgba(212,175,55,0.3)`,borderRadius:14,boxShadow:`0 10px 30px rgba(0,0,0,0.5)`,padding:`8px 0`,display:`flex`,flexDirection:`column`,zIndex:13e3},children:[(0,E.jsxs)(`div`,{style:{padding:`8px 16px`,borderBottom:`1px solid rgba(255,255,255,0.08)`},children:[(0,E.jsxs)(`div`,{style:{color:`#fff`,fontWeight:700,fontSize:14},children:[r?.first_name,` `,r?.last_name]}),(0,E.jsx)(`div`,{style:{color:`rgba(255,255,255,0.5)`,fontSize:12},children:r?.email})]}),(0,E.jsxs)(u,{to:h,onClick:()=>d(!1),style:{padding:`10px 16px`,color:`#E5E7EB`,textDecoration:`none`,fontSize:14,display:`flex`,alignItems:`center`,gap:10},children:[(0,E.jsx)(`i`,{className:`fas fa-th-large`,style:{color:`#D4AF37`,width:18}}),` `,e(`nav.dashboard`,`Tableau de bord`)]}),(0,E.jsxs)(u,{to:`/profil`,onClick:()=>d(!1),style:{padding:`10px 16px`,color:`#E5E7EB`,textDecoration:`none`,fontSize:14,display:`flex`,alignItems:`center`,gap:10},children:[(0,E.jsx)(`i`,{className:`fas fa-user`,style:{color:`#D4AF37`,width:18}}),` `,e(`dashboard.my_profile`,`Mon profil`)]}),(0,E.jsxs)(`button`,{type:`button`,onClick:()=>{i(),d(!1)},style:{padding:`10px 16px`,background:`none`,border:`none`,color:`#EF4444`,textAlign:`left`,fontSize:14,fontWeight:600,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:10,borderTop:`1px solid rgba(255,255,255,0.08)`},children:[(0,E.jsx)(`i`,{className:`fas fa-sign-out-alt`,style:{width:18}}),` `,e(`nav.logout`,`Se déconnecter`)]})]})]})]}):(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(u,{to:`/login`,style:{color:`#E5E7EB`,textDecoration:`none`,fontWeight:600,fontSize:14},children:e(`nav.login`,`Connexion`)}),(0,E.jsx)(u,{to:`/register`,style:{background:`linear-gradient(135deg, #D4AF37, #F6D365)`,color:`#000`,fontWeight:700,fontSize:13,padding:`8px 18px`,borderRadius:20,textDecoration:`none`},children:e(`nav.register`,`S'inscrire`)})]})]}),(0,E.jsxs)(`div`,{className:`nav-mobile-bar-actions`,style:{display:`none`,alignItems:`center`,gap:6},children:[(0,E.jsx)(x,{compact:!0}),t&&(0,E.jsxs)(E.Fragment,{children:[(0,E.jsxs)(`div`,{className:`nav-mobile-points-badge`,style:{background:`rgba(212,175,55,0.12)`,border:`1px solid rgba(212,175,55,0.3)`,borderRadius:14,padding:`4px 7px`,color:`#FFE27A`,fontSize:11,fontWeight:700,display:`inline-flex`,alignItems:`center`,gap:3,flexShrink:0},children:[(0,E.jsx)(`i`,{className:`fas fa-star`,style:{color:`#FFD700`,fontSize:10}}),(0,E.jsx)(`span`,{children:r?.points??50})]}),(0,E.jsx)(b,{})]}),(0,E.jsx)(`button`,{type:`button`,className:`nav-mobile-burger-btn`,onClick:e=>{e.stopPropagation(),c(e=>!e)},"aria-label":s?`Fermer le menu`:`Ouvrir le menu`,style:{background:`rgba(212, 175, 55, 0.12)`,border:`1px solid rgba(212, 175, 55, 0.35)`,borderRadius:10,color:`#F6D365`,fontSize:16,width:38,height:38,padding:0,cursor:`pointer`,display:`flex`,alignItems:`center`,justifyContent:`center`,zIndex:12020,flexShrink:0},children:(0,E.jsx)(`i`,{className:`fas ${s?`fa-times`:`fa-bars`}`})})]})]})}),s&&(0,E.jsx)(`div`,{onClick:p,style:{position:`fixed`,inset:0,background:`rgba(0,0,0,0.65)`,backdropFilter:`blur(4px)`,WebkitBackdropFilter:`blur(4px)`,zIndex:12004}}),(0,E.jsxs)(`div`,{className:`nav-mobile-drawer`,style:{position:`fixed`,top:`calc(62px + env(safe-area-inset-top, 0px))`,left:0,right:0,bottom:0,height:`calc(100vh - 62px - env(safe-area-inset-top, 0px))`,height:`calc(100dvh - 62px - env(safe-area-inset-top, 0px))`,background:`rgba(15, 13, 9, 0.98)`,backdropFilter:`blur(20px)`,WebkitBackdropFilter:`blur(20px)`,zIndex:12005,padding:`20px 20px calc(36px + env(safe-area-inset-bottom, 20px))`,display:`flex`,flexDirection:`column`,gap:10,overflowY:`auto`,transform:s?`translateY(0)`:`translateY(-120%)`,opacity:+!!s,pointerEvents:s?`all`:`none`,transition:`transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease`},children:[t&&(0,E.jsxs)(u,{to:`/profil`,onClick:p,style:{display:`flex`,alignItems:`center`,gap:12,padding:`14px 16px`,borderRadius:14,background:`rgba(212,175,55,0.1)`,border:`1px solid rgba(212,175,55,0.25)`,marginBottom:6,textDecoration:`none`,color:`inherit`},children:[(0,E.jsx)(`div`,{style:{width:42,height:42,borderRadius:`50%`,background:`linear-gradient(135deg, #2A261D, #0F0D09)`,border:`2px solid #D4AF37`,display:`flex`,alignItems:`center`,justifyContent:`center`,color:`#D4AF37`,fontWeight:800,fontSize:16,overflow:`hidden`,flexShrink:0},children:y(r?.avatar_url||r?.avatar)?(0,E.jsx)(`img`,{src:y(r.avatar_url||r.avatar),alt:`Avatar`,style:{width:`100%`,height:`100%`,objectFit:`cover`},onError:e=>{e.currentTarget.style.display=`none`}}):r?.first_name?.[0]?.toUpperCase()||`P`}),(0,E.jsxs)(`div`,{style:{minWidth:0,flex:1},children:[(0,E.jsxs)(`div`,{style:{color:`#fff`,fontWeight:700,fontSize:15,whiteSpace:`nowrap`,overflow:`hidden`,textOverflow:`ellipsis`},children:[r?.first_name,` `,r?.last_name]}),(0,E.jsx)(`div`,{style:{color:`rgba(255,255,255,0.5)`,fontSize:12,whiteSpace:`nowrap`,overflow:`hidden`,textOverflow:`ellipsis`},children:r?.email})]}),(0,E.jsx)(`i`,{className:`fas fa-chevron-right`,style:{color:`#D4AF37`,fontSize:12,opacity:.8}})]}),(0,E.jsxs)(u,{to:`/`,onClick:p,style:{display:`flex`,alignItems:`center`,gap:12,padding:`14px 16px`,borderRadius:12,background:`rgba(255,255,255,0.05)`,color:`#fff`,textDecoration:`none`,fontWeight:600,fontSize:15},children:[(0,E.jsx)(`i`,{className:`fas fa-home`,style:{color:`#D4AF37`,width:20}}),` `,e(`nav.home`,`Accueil`)]}),(0,E.jsxs)(u,{to:`/discovery`,onClick:p,style:{display:`flex`,alignItems:`center`,gap:12,padding:`14px 16px`,borderRadius:12,background:`linear-gradient(135deg, rgba(212,175,55,0.2), rgba(246,211,101,0.3))`,color:`#FFE27A`,textDecoration:`none`,fontWeight:700,fontSize:15,border:`1px solid rgba(212,175,55,0.35)`},children:[(0,E.jsx)(`i`,{className:`fas fa-play-circle`,style:{color:`#FFD700`,width:20}}),` `,e(`nav.discovery`,`Mode Découverte Reels`)]}),t&&(0,E.jsxs)(E.Fragment,{children:[(0,E.jsxs)(u,{to:h,onClick:p,style:{display:`flex`,alignItems:`center`,gap:12,padding:`14px 16px`,borderRadius:12,background:`rgba(255,255,255,0.05)`,color:`#fff`,textDecoration:`none`,fontWeight:600,fontSize:15},children:[(0,E.jsx)(`i`,{className:`fas fa-th-large`,style:{color:`#D4AF37`,width:20}}),` `,e(`nav.dashboard`,`Tableau de bord`)]}),(0,E.jsxs)(u,{to:`/profil`,onClick:p,style:{display:`flex`,alignItems:`center`,gap:12,padding:`14px 16px`,borderRadius:12,background:`rgba(255,255,255,0.05)`,color:`#fff`,textDecoration:`none`,fontWeight:600,fontSize:15},children:[(0,E.jsx)(`i`,{className:`fas fa-user`,style:{color:`#D4AF37`,width:20}}),` `,e(`dashboard.my_profile`,`Mon Profil`)]})]}),(0,E.jsxs)(u,{to:`/properties`,onClick:p,style:{display:`flex`,alignItems:`center`,gap:12,padding:`14px 16px`,borderRadius:12,background:`rgba(255,255,255,0.05)`,color:`#fff`,textDecoration:`none`,fontWeight:600,fontSize:15},children:[(0,E.jsx)(`i`,{className:`fas fa-building`,style:{color:`#D4AF37`,width:20}}),` `,e(`nav.properties`,`Biens Disponibles`)]}),(0,E.jsxs)(u,{to:`/map`,onClick:p,style:{display:`flex`,alignItems:`center`,gap:12,padding:`14px 16px`,borderRadius:12,background:`rgba(255,255,255,0.05)`,color:`#fff`,textDecoration:`none`,fontWeight:600,fontSize:15},children:[(0,E.jsx)(`i`,{className:`fas fa-map-marked-alt`,style:{color:`#D4AF37`,width:20}}),` `,e(`nav.map`,`Carte Interactive`)]}),(0,E.jsx)(`div`,{style:{marginTop:`auto`,paddingTop:16,borderTop:`1px solid rgba(255,255,255,0.1)`},children:t?(0,E.jsxs)(`button`,{type:`button`,onClick:()=>{i(),p()},style:{width:`100%`,padding:`14px`,borderRadius:14,border:`1px solid rgba(239,68,68,0.3)`,background:`rgba(239,68,68,0.12)`,color:`#EF4444`,fontFamily:`Poppins, sans-serif`,fontWeight:700,fontSize:15,cursor:`pointer`,display:`flex`,alignItems:`center`,justifyContent:`center`,gap:8},children:[(0,E.jsx)(`i`,{className:`fas fa-sign-out-alt`}),` `,e(`nav.logout`,`Se déconnecter`)]}):(0,E.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:10},children:[(0,E.jsx)(u,{to:`/login`,onClick:p,style:{width:`100%`,padding:`14px`,borderRadius:14,border:`1px solid rgba(255,255,255,0.2)`,background:`rgba(255,255,255,0.06)`,color:`#fff`,textAlign:`center`,textDecoration:`none`,fontWeight:700,fontSize:15},children:e(`nav.login`,`Connexion`)}),(0,E.jsx)(u,{to:`/register`,onClick:p,style:{width:`100%`,padding:`14px`,borderRadius:14,border:`none`,background:`linear-gradient(135deg, #D4AF37, #F6D365)`,color:`#000`,textAlign:`center`,textDecoration:`none`,fontWeight:800,fontSize:15},children:e(`nav.register`,`Créer un compte`)})]})})]})]})}function O(){let{t:e}=te(),{isAuthenticated:t,user:r}=ie(),{config:i}=v(),a=ee();n();let o=t?`/dashboard`:`/login`,s=(e,n)=>{!t||!r?a(`/login`,{state:{from:e,message:n||`Connectez-vous à votre compte Piolo pour continuer.`}}):a(e)},[c,l]=(0,w.useState)(`salon`),[d,f]=(0,w.useState)(`all`),[ne,p]=(0,w.useState)(85),[m,g]=(0,w.useState)(3),[_,ae]=(0,w.useState)(`bastos`),[b,x]=(0,w.useState)([]),[T,he]=(0,w.useState)(!0),[D,O]=(0,w.useState)({}),[_e,ve]=(0,w.useState)([]),[k,A]=(0,w.useState)([]),[j,ye]=(0,w.useState)(!0),[be,xe]=(0,w.useState)(null),[M,N]=(0,w.useState)(null),[P,F]=(0,w.useState)(null),[Se,I]=(0,w.useState)(null),[L,R]=(0,w.useState)(!1),[z,B]=(0,w.useState)(null),[V,H]=(0,w.useState)(null);(0,w.useEffect)(()=>{let e=e=>{e.key===`Escape`&&V&&H(null)};return window.addEventListener(`keydown`,e),()=>window.removeEventListener(`keydown`,e)},[V]);let Ce=(0,w.useRef)(null),we=(0,w.useRef)(null),U=(e,t=null)=>{I(t),F(e)},W=e=>{let t=parseInt(String(e?.budget||e?.acompte||``).replace(/[^0-9]/g,``),10),n=t&&t>0?t<=1e5?t:Math.round(t*.5):5e4;B({service:e?.title||e?.service||`Prestation Habitat sur-mesure`,acompte:n,totalBudget:t||n,pro:e?.author?.name||e?.pro||`Artisan Certifié`})},[Te,G]=(0,w.useState)(!1),[K,q]=(0,w.useState)({city:``,neighborhood:``,transaction_type:``,property_type:``,max_price:``,bedrooms:``,has_virtual_tour:!1,is_verified:!1}),[J,Y]=(0,w.useState)(``),X=[`Rechercher une villa à Bastos…`,`Studio meublé moderne à Akwa…`,`Appartement 3 chambres à Bonapriso…`,`Duplex avec visite 360° à Odza…`,`Résidence meublée à Bonamoussadi…`,`Villa de maître avec piscine à Bonanjo…`],[Z,Ee]=(0,w.useState)(``),[De,Oe]=(0,w.useState)(0),[ke,Ae]=(0,w.useState)(!1);(0,w.useEffect)(()=>{let e=X[De],t;return ke?Z.length>0?t=setTimeout(()=>{Ee(e.slice(0,Z.length-1))},28):(Ae(!1),Oe(e=>(e+1)%X.length)):t=Z.length<e.length?setTimeout(()=>{Ee(e.slice(0,Z.length+1))},55):setTimeout(()=>{Ae(!0)},2200),()=>clearTimeout(t)},[Z,ke,De,X]);let je=b.filter(e=>e.transaction_type===`COURTE_DUREE`||e.is_short_term||e.short_term),Me=b.filter(e=>e.transaction_type===`LOCATION`||!e.transaction_type),Ne=b.filter(e=>e.transaction_type===`VENTE`),Pe=(0,w.useRef)(null),Fe=(0,w.useRef)(null),Ie=(0,w.useRef)(null);(0,w.useEffect)(()=>{let e=e=>{if(!e.current)return;let t=e.current;if(t.matches(`:hover`)||t.matches(`:active`))return;let n=t.querySelector(`.horizontal-carousel-item, .pro-btp-project-card, .pro-btp-pro-card`),r=n?n.offsetWidth+18:300,i=t.scrollWidth-t.clientWidth;i<=0||(t.scrollLeft+r>=i-15?t.scrollTo({left:0,behavior:`smooth`}):t.scrollBy({left:r,behavior:`smooth`}))},t=setInterval(()=>{e(Pe),e(Fe),e(Ie),e(Ce),e(we)},4500);return()=>clearInterval(t)},[b,_e,k]);let Le=(e,t)=>{if(!e.current)return;let n=e.current,r=n.querySelector(`.horizontal-carousel-item`),i=r?r.offsetWidth+18:320;n.scrollBy({left:t===`left`?-i:i,behavior:`smooth`})},Re=!!(J.trim()||d!==`all`&&[`apartment`,`villa`,`studio`].includes(d)||K.city||K.neighborhood||K.transaction_type||K.property_type||K.max_price||K.bedrooms||K.has_virtual_tour||K.is_verified),Q=b.filter(e=>{if(J.trim()){let t=J.toLowerCase().trim();if(!(e.title&&e.title.toLowerCase().includes(t)||e.neighborhood&&e.neighborhood.toLowerCase().includes(t)||e.city&&e.city.toLowerCase().includes(t)||e.description&&e.description.toLowerCase().includes(t)||e.property_type&&e.property_type.toLowerCase().includes(t)))return!1}if(d===`apartment`){if(e.property_type!==`APPARTEMENT`)return!1}else if(d===`villa`){if(![`VILLA`,`MAISON`,`DUPLEX`,`PENTHOUSE`].includes(e.property_type))return!1}else if(d===`studio`&&![`STUDIO`,`CHAMBRE`].includes(e.property_type))return!1;return!(K.city&&e.city&&!e.city.toLowerCase().includes(K.city.toLowerCase())||K.neighborhood&&e.neighborhood&&!e.neighborhood.toLowerCase().includes(K.neighborhood.toLowerCase())||K.transaction_type&&e.transaction_type&&e.transaction_type!==K.transaction_type||K.property_type&&e.property_type&&e.property_type!==K.property_type||K.max_price&&Number(e.price)>Number(K.max_price)||K.bedrooms&&Number(e.bedrooms)<Number(K.bedrooms)||K.has_virtual_tour&&!(e.has_virtual_tour||e.tour_360_url||e.virtual_tour)||K.is_verified&&!e.is_verified)}),ze=()=>{G(!1);let e=document.getElementById(`annonces`);e&&e.scrollIntoView({behavior:`smooth`,block:`start`})},Be=()=>{q({city:``,neighborhood:``,transaction_type:``,property_type:``,max_price:``,bedrooms:``,has_virtual_tour:!1,is_verified:!1}),Y(``),f(`all`)},$=e=>{if(f(e),e===`all`){let e=document.getElementById(`annonces`);e&&e.scrollIntoView({behavior:`smooth`,block:`start`})}else if(e===`discovery`)a(`/discovery`);else if(e===`map`){let e=document.getElementById(`carte`);e?e.scrollIntoView({behavior:`smooth`,block:`start`}):a(`/map`)}else if(e===`ia`){let e=document.getElementById(`estimateur-ia`);e&&e.scrollIntoView({behavior:`smooth`,block:`start`})}else{let e=document.getElementById(`annonces`);e&&e.scrollIntoView({behavior:`smooth`,block:`start`})}},Ve={salon:`https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80`,chambre:`https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80`,cuisine:`https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80`,sdb:`https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80`},He={salon:`Salon Moderne & Balcon`,chambre:`Suite Parentale Lumineuse`,cuisine:`Cuisine Équipée Américaine`,sdb:`Salle de Bain Contemporaine`},Ue=()=>{let e=1200;(_===`bastos`||_===`bonapriso`)&&(e=1600),(_===`akwa`||_===`odza`)&&(e=1350),(_===`bonamoussadi`||_===`ngousso`)&&(e=1100);let t=ne*e+m*15e3,n=Math.round(t*.85/5e3)*5e3,r=Math.round(t*1.15/5e3)*5e3;return{min:n.toLocaleString(`fr-FR`),max:r.toLocaleString(`fr-FR`)}};return(0,w.useEffect)(()=>{(async()=>{let e=e=>oe.sortPropertiesByBoost(e);try{let t=await re.list({}),n=t.data?.results||t.data;if(Array.isArray(n)&&n.length>0){x(e(n)),he(!1);return}}catch(e){console.warn(`Authenticated properties fetch failed, attempting public fallback...`,e)}try{let t=await fetch(`/api/v1/properties/`);if(t.ok){let n=await t.json(),r=n.results||n;Array.isArray(r)&&x(e(r))}}catch(e){console.error(`Error loading properties for home page:`,e)}finally{he(!1)}})()},[]),(0,w.useEffect)(()=>{h.list().then(e=>{Array.isArray(e.data)&&e.data.length>0?ve(e.data.map(e=>{let t=e.projects&&e.projects.length>0?e.projects[0].main_image_display||e.projects[0].image||e.projects[0].main_image_url:null,n=e.avatar_url||e.user_avatar||e.user?.avatar||e.avatar||null;return{id:e.id,name:e.business_name||`Artisan Piolo`,title:e.primary_trade||`Artisan du Bâtiment & Habitat`,specialty:e.primary_trade||`Artisan du Bâtiment & Habitat`,city:e.city||`Yaoundé`,rating:e.rating||5,reviewsCount:e.reviews_count||0,projectsCount:e.projects_count||(e.projects?e.projects.length:0),experience:e.experience_years||`5 ans`,pointsRequired:`Gratuit`,phone:e.phone||e.whatsapp,whatsapp:e.whatsapp||e.phone,avatarUrl:n?y(n):null,cover:y(e.cover_image_url||t,`https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80`),initials:(e.business_name||`P`).substring(0,2).toUpperCase(),avatarBg:`linear-gradient(135deg, #D4AF37, #AA820A)`,availColor:e.is_available===!1?`#E74C3C`:`#2ECC71`,availText:e.is_available===!1?`Indisponible`:`Disponible maintenant`,tags:e.secondary_trades&&e.secondary_trades.length>0?e.secondary_trades:[`Rénovation`,`Design int.`],bio:e.bio,projects:e.projects||[],raw:e}})):ve([])}).catch(e=>{console.warn(`Impossible de charger les artisans:`,e),ve([])}).finally(()=>{ye(!1)}),h.projects().then(e=>{A(Array.isArray(e.data)?e.data:[])}).catch(e=>{console.warn(`Impossible de charger les chantiers:`,e),A([])})},[]),(0,E.jsxs)(`div`,{className:`home-page-root`,children:[(0,E.jsx)(ge,{}),(0,E.jsx)(`style`,{children:`
        /* ── Core Design System ── */
        :root {
          --flow-gold: #D4AF37;
          --flow-gold-light: #F6D365;
          --flow-gold-dark: #B8962A;
          --flow-dark: #0F0D09;
          --flow-card: #181510;
          --flow-border: rgba(212, 175, 55, 0.22);
        }

        .home-page-root {
          background-color: #F8F9FA;
          color: #1A1A1A;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* Fluid, resilient entry animation */
        .reveal { 
          opacity: 1;
          transform: translateY(0);
          transition: transform 0.4s ease;
        }

        /* ── 1. HERO SECTION (Vue de la ville de Douala d'en haut au coucher du soleil) ── */
        .gflow-hero {
          position: relative;
          background: linear-gradient(110deg, rgba(10, 6, 0, 0.82) 0%, rgba(10, 6, 0, 0.50) 50%, rgba(10, 6, 0, 0.88) 100%),
                      url('https://media.istockphoto.com/id/1328860707/photo/beautiful-view-of-douala-at-sunset.jpg?s=1024x1024&w=is&k=20&c=i_hUkEzzgOOVDwJXWXf0u_16DeftLJEW4wodgXtx4V0=') center/cover no-repeat;
          color: #fff;
          padding: calc(62px + env(safe-area-inset-top, 0px) + 28px) 1.25rem 3.5rem;
          text-align: center;
          overflow: hidden;
          border-bottom: 1px solid rgba(212, 175, 55, 0.25);
        }

        .gflow-hero::before {
          content: '';
          position: absolute;
          top: -25%;
          left: 50%;
          transform: translateX(-50%);
          width: 650px;
          height: 650px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.18) 0%, transparent 68%);
          pointer-events: none;
          z-index: 0;
          animation: ambientPulse 6s ease-in-out infinite alternate;
        }

        @keyframes ambientPulse {
          0% { transform: translateX(-50%) scale(0.9); opacity: 0.5; }
          100% { transform: translateX(-50%) scale(1.15); opacity: 0.9; }
        }

        .gflow-hero-content {
          position: relative;
          z-index: 1;
          max-width: 920px;
          margin: 0 auto;
        }

        .gflow-badge-top {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 16px;
          border-radius: 999px;
          background: rgba(212, 175, 55, 0.18);
          border: 1px solid rgba(212, 175, 55, 0.45);
          color: #F6D365;
          font-family: 'Poppins', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.3px;
          margin-bottom: 1.15rem;
          backdrop-filter: blur(8px);
        }

        .gflow-badge-top i {
          font-size: 11px;
          color: var(--flow-gold);
        }

        .gflow-hero-title {
          font-family: 'Poppins', sans-serif;
          font-size: clamp(2rem, 6vw, 3.5rem);
          font-weight: 900;
          line-height: 1.16;
          margin-bottom: 0.95rem;
          letter-spacing: -0.5px;
        }

        .gflow-hero-title span {
          background: linear-gradient(135deg, #FFF1C5 0%, #D4AF37 50%, #F6D365 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .gflow-hero-subtitle {
          font-size: clamp(13.5px, 2.5vw, 16px);
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.6;
          max-width: 620px;
          margin: 0 auto 1.85rem;
          text-shadow: 0 2px 10px rgba(0,0,0,0.6);
        }

        /* ── Search Capsule ── */
        .gflow-search-capsule {
          background: rgba(255, 255, 255, 0.98);
          border-radius: 999px;
          padding: 6px 8px 6px 18px;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(212, 175, 55, 0.4);
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: 640px;
          margin: 0 auto 1.5rem;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }

        .gflow-search-capsule:hover, .gflow-search-capsule:focus-within {
          box-shadow: 0 16px 45px rgba(212, 175, 55, 0.35), 0 0 0 2px var(--flow-gold);
          transform: translateY(-2px);
        }

        .gflow-search-icon {
          color: var(--flow-gold-dark);
          font-size: 17px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gflow-search-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-family: 'DM Sans', sans-serif;
          font-size: 14.5px;
          font-weight: 500;
          color: #1A1A1A;
          min-width: 0;
        }

        .gflow-search-input::placeholder {
          color: #7E786F;
          transition: opacity 0.3s ease;
        }

        .gflow-capsule-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .gflow-filter-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(212, 175, 55, 0.12);
          border: 1px solid rgba(212, 175, 55, 0.3);
          color: #92700C;
          font-family: 'Poppins', sans-serif;
          font-size: 12.5px;
          font-weight: 700;
          padding: 8px 14px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gflow-filter-btn:hover {
          background: rgba(212, 175, 55, 0.22);
          color: #6C5205;
        }

        .gflow-submit-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--flow-gold), var(--flow-gold-light));
          border: none;
          color: #0F0D09;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
          flex-shrink: 0;
        }

        .gflow-submit-circle:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 18px rgba(212, 175, 55, 0.6);
        }

        /* ── Category Chips Strip ── */
        .gflow-categories-strip {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          padding: 0.25rem 0.25rem 0.75rem;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          justify-content: flex-start;
        }

        .gflow-categories-strip::-webkit-scrollbar {
          display: none;
        }

        .gflow-cat-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.9);
          font-family: 'Poppins', sans-serif;
          font-size: 12.5px;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
          backdrop-filter: blur(4px);
        }

        .gflow-cat-chip:hover {
          background: rgba(212, 175, 55, 0.25);
          border-color: rgba(212, 175, 55, 0.5);
          color: #FFF;
        }

        .gflow-cat-chip.active {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.95), rgba(246, 211, 101, 0.95));
          border-color: var(--flow-gold);
          color: #0F0D09;
          font-weight: 700;
          box-shadow: 0 4px 14px rgba(212, 175, 55, 0.35);
        }

        .gflow-cat-chip.special-reels {
          background: linear-gradient(135deg, rgba(255, 59, 48, 0.2), rgba(212, 175, 55, 0.3));
          border-color: rgba(255, 107, 107, 0.6);
          color: #FFE27A;
        }

        /* ── Discovery Reels Banner ── */
        .gflow-reels-banner {
          margin: 1.5rem auto 0;
          max-width: 820px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(28, 24, 16, 0.92) 0%, rgba(15, 13, 9, 0.96) 100%);
          border: 1px solid rgba(212, 175, 55, 0.4);
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }

        .gflow-reels-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .gflow-reels-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: linear-gradient(135deg, #D4AF37, #E65100);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #fff;
          box-shadow: 0 6px 16px rgba(212, 175, 55, 0.35);
          flex-shrink: 0;
        }

        .gflow-reels-text h4 {
          font-family: 'Poppins', sans-serif;
          font-size: 15px;
          font-weight: 800;
          color: #FFF;
          margin-bottom: 2px;
        }

        .gflow-reels-text p {
          font-size: 12.5px;
          color: rgba(255, 255, 255, 0.75);
          margin: 0;
        }

        .gflow-reels-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--flow-gold), var(--flow-gold-light));
          color: #0F0D09;
          font-family: 'Poppins', sans-serif;
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(212, 175, 55, 0.4);
          transition: transform 0.2s ease;
        }

        .gflow-reels-btn:hover {
          transform: scale(1.04);
        }

        /* ── 2. PROPERTIES SECTION & HORIZONTAL CAROUSELS ── */
        .gflow-props-section {
          padding: 3rem 1.25rem 4rem;
          max-width: 1360px;
          margin: 0 auto;
        }

        .home-carousel-wrapper {
          position: relative;
          margin-bottom: 2.75rem;
        }

        .horizontal-sec-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 14px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .horizontal-sec-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 4px 12px;
          border-radius: 8px;
          margin-bottom: 6px;
        }

        .horizontal-sec-title {
          font-size: clamp(1.3rem, 3.5vw, 1.8rem);
          font-weight: 800;
          font-family: 'Poppins', sans-serif;
          color: #0F0D09;
          margin: 0;
          line-height: 1.2;
        }

        .horizontal-sec-sub {
          font-size: 13px;
          color: #666;
          margin: 4px 0 0;
          font-weight: 500;
        }

        .horizontal-sec-link {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--flow-gold-dark);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          padding: 7px 14px;
          border-radius: 10px;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.25);
          transition: all 0.2s ease;
        }

        .horizontal-sec-link:hover {
          background: rgba(212, 175, 55, 0.2);
          transform: translateX(2px);
        }

        .horizontal-properties-carousel {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          gap: 18px;
          padding: 6px 4px 18px;
          margin: 0 -4px;
          scrollbar-width: none;
        }

        .horizontal-properties-carousel::-webkit-scrollbar {
          display: none;
        }

        .horizontal-carousel-item {
          flex: 0 0 315px;
          min-width: 290px;
          max-width: 330px;
          scroll-snap-align: start;
        }

        @media (max-width: 600px) {
          .horizontal-carousel-item {
            flex: 0 0 84vw;
            min-width: 270px;
            max-width: 320px;
          }
        }

        .home-carousel-nav-btn {
          position: absolute;
          top: 55%;
          transform: translateY(-50%);
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(15, 13, 9, 0.85);
          backdrop-filter: blur(8px);
          border: 1.5px solid rgba(212, 175, 55, 0.4);
          color: #F6D365;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          box-shadow: 0 6px 20px rgba(0,0,0,0.25);
          opacity: 0;
          transition: all 0.25s ease;
        }

        .home-carousel-wrapper:hover .home-carousel-nav-btn {
          opacity: 1;
        }

        .home-carousel-nav-btn:hover {
          background: #0F0D09;
          border-color: #D4AF37;
          transform: translateY(-50%) scale(1.08);
          color: #FFF;
        }

        .home-carousel-nav-btn.prev {
          left: -14px;
        }

        .home-carousel-nav-btn.next {
          right: -14px;
        }

        @media (max-width: 768px) {
          .home-carousel-nav-btn {
            display: none;
          }
        }

        /* ── 3. VISITE VIRTUELLE 360° SECTION ── */
        .showcase-3d-section {
          background: linear-gradient(135deg, #18140E 0%, #0F0D09 100%);
          color: #fff;
          padding: 4rem 1.25rem;
          border-top: 1px solid rgba(212,175,55,0.2);
          border-bottom: 1px solid rgba(212,175,55,0.2);
        }

        .showcase-3d-wrap {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          gap: 36px;
          align-items: center;
        }

        .showcase-3d-frame {
          background: #0A0A0E;
          border-radius: 20px;
          overflow: hidden;
          border: 1.5px solid rgba(212, 175, 55, 0.4);
          box-shadow: 0 20px 50px rgba(0,0,0,0.6);
        }

        .showcase-3d-image-box {
          position: relative;
          height: 320px;
          overflow: hidden;
        }

        .showcase-3d-image-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .showcase-3d-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          background: rgba(15,13,9,0.8);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(212,175,55,0.4);
          color: #F6D365;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .showcase-3d-nav {
          display: flex;
          background: #14110B;
          padding: 10px;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .showcase-3d-nav-btn {
          flex: 1;
          padding: 9px 12px;
          border-radius: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.8);
          font-family: 'Poppins', sans-serif;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          text-align: center;
          transition: all 0.2s ease;
        }

        .showcase-3d-nav-btn.active {
          background: linear-gradient(135deg, var(--flow-gold), var(--flow-gold-light));
          color: #0F0D09;
          font-weight: 800;
          border-color: var(--flow-gold);
        }

        /* ── 4. CARTE & QUARTIERS SECTION ── */
        .showcase-map-section {
          padding: 4rem 1.25rem;
          max-width: 1280px;
          margin: 0 auto;
        }

        .showcase-map-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 36px;
          align-items: center;
        }

        .showcase-map-preview {
          position: relative;
          height: 350px;
          border-radius: 20px;
          overflow: hidden;
          background: #11161D;
          border: 1.5px solid rgba(212, 175, 55, 0.35);
          box-shadow: 0 16px 40px rgba(0,0,0,0.2);
          cursor: pointer;
        }

        .showcase-map-bg-grid {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(17, 22, 29, 0.75) 0%, rgba(17, 22, 29, 0.45) 100%),
                      url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1000&q=80') center/cover no-repeat;
        }

        .showcase-map-bg-grid::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(212, 175, 55, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 175, 55, 0.08) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }

        .showcase-map-lock-overlay {
          position: absolute;
          inset: 0;
          z-index: 15;
          background: rgba(15, 13, 9, 0.68);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          text-align: center;
          color: #fff;
          border-radius: 20px;
          transition: background 0.3s ease;
        }

        .showcase-map-lock-overlay:hover {
          background: rgba(15, 13, 9, 0.62);
        }

        .showcase-map-lock-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(212, 175, 55, 0.2);
          color: #F6D365;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin-bottom: 12px;
          border: 1.5px solid rgba(212, 175, 55, 0.45);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
        }

        .showcase-map-login-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 22px;
          border-radius: 12px;
          background: linear-gradient(135deg, #D4AF37, #F6D365);
          border: none;
          color: #0F0D09;
          font-family: 'Poppins', sans-serif;
          font-size: 13.5px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 4px 18px rgba(212, 175, 55, 0.4);
          transition: all 0.25s ease;
        }

        .showcase-map-login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 22px rgba(212, 175, 55, 0.5);
        }

        .showcase-pin {
          position: absolute;
          transform: translate(-50%, -100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: transform 0.2s ease;
          z-index: 5;
        }

        .showcase-pin:hover {
          transform: translate(-50%, -115%) scale(1.1);
        }

        .showcase-pin i {
          font-size: 26px;
          color: var(--flow-gold);
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6));
        }

        .showcase-pin span {
          background: #0F0D09;
          color: #F6D365;
          border: 1px solid rgba(212,175,55,0.4);
          font-family: 'Poppins', sans-serif;
          font-size: 10.5px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 6px;
          white-space: nowrap;
          margin-top: 2px;
        }

        /* ── 5. ESTIMATEUR IA SECTION ── */
        .showcase-ia-section {
          background: #12100C;
          color: #fff;
          padding: 4rem 1.25rem;
          border-top: 1px solid rgba(212, 175, 55, 0.2);
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        }

        .showcase-ia-wrap {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 36px;
          align-items: center;
        }

        .showcase-ia-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 20px;
          padding: 1.75rem;
          backdrop-filter: blur(10px);
        }

        .ia-slider-group {
          margin-bottom: 16px;
        }

        .ia-slider-label {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: rgba(255,255,255,0.75);
          margin-bottom: 8px;
          font-weight: 600;
        }

        .ia-slider-label strong {
          color: #F6D365;
        }

        .ia-range {
          width: 100%;
          accent-color: var(--flow-gold);
          cursor: pointer;
        }

        .ia-result-box {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.18), rgba(246, 211, 101, 0.08));
          border: 1px solid rgba(212, 175, 55, 0.4);
          border-radius: 14px;
          padding: 16px;
          text-align: center;
          margin-top: 18px;
        }

        .ia-result-box small {
          font-size: 11px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.65);
          letter-spacing: 0.5px;
        }

        .ia-result-price {
          font-family: 'Poppins', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #F6D365;
          margin: 4px 0;
        }

        /* ── 6. SÉCURITÉ & CNI PILLARS ── */
        .showcase-security-section {
          padding: 4rem 1.25rem;
          max-width: 1280px;
          margin: 0 auto;
        }

        .sec-pillars-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-top: 2rem;
        }

        .sec-pillar-card {
          background: #fff;
          border: 1px solid #E8E4DC;
          border-radius: 18px;
          padding: 1.5rem;
          text-align: center;
          box-shadow: 0 6px 20px rgba(0,0,0,0.03);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .sec-pillar-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.08);
        }

        .sec-pillar-icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: rgba(212, 175, 55, 0.15);
          color: var(--flow-gold-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin: 0 auto 14px;
        }

        .sec-pillar-card h4 {
          font-family: 'Poppins', sans-serif;
          font-size: 15px;
          font-weight: 800;
          color: #0F0D09;
          margin-bottom: 6px;
        }

        .sec-pillar-card p {
          font-size: 12.5px;
          color: #666;
          line-height: 1.5;
          margin: 0;
        }
        /* ── 7. BTP & ARCHITECTURE PRO SHOWCASE (Fond Blanc & Lumineux) ── */
        .showcase-btp-section {
          background: #FFFFFF;
          color: #0F0D09;
          padding: 4.5rem 1.25rem;
          border-top: 1px solid #E8E3DA;
          border-bottom: 1px solid #E8E3DA;
          position: relative;
          overflow: hidden;
        }

        .showcase-btp-section::before {
          content: '';
          position: absolute;
          top: -120px;
          right: -100px;
          width: 450px;
          height: 450px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 68%);
          pointer-events: none;
        }

        .btp-main-wrap {
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .btp-header-block {
          text-align: center;
          max-width: 780px;
          margin: 0 auto 2.5rem;
        }

        .btp-badge-top {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 16px;
          border-radius: 999px;
          background: rgba(212, 175, 55, 0.12);
          border: 1px solid rgba(212, 175, 55, 0.35);
          color: #92700C;
          font-family: 'Poppins', sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 1rem;
        }

        .pro-btp-vitrine-box {
          margin-bottom: 2.2rem;
          background: #FAF9F6;
          padding: 20px 22px;
          border-radius: 20px;
          border: 1px solid #E8E3DA;
          box-shadow: 0 6px 20px rgba(0,0,0,0.04);
        }

        .pro-btp-projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }

        .pro-btp-project-card {
          background: #FFFFFF;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #E8E3DA;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          color: #0F0D09;
          box-shadow: 0 4px 14px rgba(0,0,0,0.03);
        }

        .pro-btp-project-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.1);
          border-color: #D4AF37;
        }

        .pro-btp-pros-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 22px;
          margin-bottom: 30px;
        }

        .pro-btp-pro-card {
          background: #FFFFFF;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #E8E3DA;
          box-shadow: 0 6px 20px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          color: #0F0D09;
        }

        .pro-btp-pro-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 34px rgba(212,175,55,0.16);
          border-color: #D4AF37;
        }

        .pro-mobile-swipe-hint {
          display: none;
        }

        @media (max-width: 768px) {
          .pro-mobile-swipe-hint {
            display: inline-flex !important;
            align-items: center;
            gap: 4px;
            font-size: 11px;
            color: #92700C;
            font-weight: 700;
          }
          .pro-btp-projects-grid {
            display: flex !important;
            overflow-x: auto !important;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            gap: 14px !important;
            padding-bottom: 6px;
            scrollbar-width: none;
          }
          .pro-btp-projects-grid::-webkit-scrollbar {
            display: none;
          }
          .pro-btp-project-card {
            min-width: 250px !important;
            max-width: 270px !important;
            flex: 0 0 auto !important;
            scroll-snap-align: start;
          }
          .pro-btp-pros-grid {
            display: flex !important;
            overflow-x: auto !important;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            gap: 16px !important;
            padding-bottom: 10px;
            scrollbar-width: none;
          }
          .pro-btp-pros-grid::-webkit-scrollbar {
            display: none;
          }
          .pro-btp-pro-card {
            min-width: 290px !important;
            max-width: 320px !important;
            flex: 0 0 auto !important;
            scroll-snap-align: start;
          }
        }

        /* Responsive Breakpoints pour tous les téléphones */
        @media (max-width: 850px) {
          .showcase-3d-wrap, .showcase-map-grid, .showcase-ia-wrap {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .sec-pillars-grid {
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }
          .gflow-reels-banner {
            flex-direction: column;
            text-align: center;
          }
          .gflow-reels-left {
            flex-direction: column;
          }
          .gflow-reels-btn {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 600px) {
          .sec-pillars-grid {
            grid-template-columns: 1fr;
          }
          .gflow-props-section {
            padding: 2rem 14px 3rem;
          }
          .horizontal-carousel-item {
            flex: 0 0 85vw;
            min-width: 250px;
            max-width: 315px;
          }
          .showcase-map-preview {
            height: 260px;
          }
          .showcase-ia-card {
            padding: 1.25rem 1rem;
          }
        }

        @media (max-width: 420px) {
          .gflow-hero {
            padding: calc(56px + env(safe-area-inset-top, 0px) + 14px) 12px 2.25rem;
          }
          .gflow-hero-title {
            font-size: clamp(1.6rem, 7vw, 2.2rem);
          }
          .gflow-hero-subtitle {
            font-size: 13px;
            margin-bottom: 1.25rem;
          }
          .gflow-badge-top {
            font-size: 11px;
            padding: 5px 12px;
          }
          .gflow-search-capsule {
            padding: 5px 8px 5px 12px;
            gap: 6px;
          }
          .gflow-search-input {
            font-size: 13px;
          }
          .gflow-filter-btn {
            padding: 6px 10px;
            font-size: 11.5px;
            gap: 4px;
          }
          .gflow-submit-circle {
            width: 35px;
            height: 35px;
            font-size: 12px;
          }
          .gflow-cat-chip {
            padding: 7px 12px;
            font-size: 11.5px;
            gap: 5px;
          }
          .horizontal-sec-title {
            font-size: 1.3rem;
          }
          .horizontal-carousel-item {
            flex: 0 0 88vw;
            min-width: 240px;
            max-width: 290px;
          }
        }

        @media (max-width: 360px) {
          .gflow-hero {
            padding: calc(52px + env(safe-area-inset-top, 0px) + 10px) 8px 1.75rem;
          }
          .gflow-hero-title {
            font-size: 1.5rem;
          }
          .gflow-search-capsule {
            padding: 4px 6px 4px 10px;
          }
          .gflow-search-input {
            font-size: 12px;
          }
          .gflow-filter-btn {
            padding: 5px 8px;
            font-size: 10.5px;
          }
          .gflow-submit-circle {
            width: 32px;
            height: 32px;
          }
          .horizontal-sec-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
          .horizontal-sec-link {
            font-size: 11.5px;
            padding: 5px 10px;
          }
          .horizontal-carousel-item {
            flex: 0 0 90vw;
            min-width: 230px;
            max-width: 270px;
          }
        }

        /* ── Dynamic Filtered Section Styles ── */
        .gflow-filtered-section {
          max-width: 1280px;
          margin: 0 auto;
          padding: 1.5rem 1.25rem 3rem;
        }

        .gflow-filtered-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 1.5rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        }

        .gflow-filtered-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 999px;
          background: rgba(212, 175, 55, 0.15);
          color: #B8962A;
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .gflow-filtered-title {
          font-family: 'Poppins', sans-serif;
          font-size: clamp(1.4rem, 3.5vw, 2rem);
          font-weight: 800;
          color: #0F0D09;
          margin: 0 0 4px;
        }

        .gflow-filtered-sub {
          font-size: 13.5px;
          color: #666;
          margin: 0;
        }

        .gflow-filtered-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .gflow-filter-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fff;
          color: #0F0D09;
          border: 1px solid rgba(212, 175, 55, 0.35);
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gflow-filter-tag:hover {
          background: #FAF7F0;
          border-color: #D4AF37;
        }

        .gflow-filter-tag-remove {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: rgba(0,0,0,0.08);
          font-size: 10px;
          margin-left: 2px;
        }

        .gflow-reset-all-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          border-radius: 12px;
          background: #0F0D09;
          color: #F6D365;
          font-size: 13px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .gflow-reset-all-btn:hover {
          background: #242018;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }

        .gflow-filtered-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(285px, 1fr));
          gap: 22px;
          margin-bottom: 2rem;
        }

        .gflow-empty-results {
          text-align: center;
          padding: 3.5rem 1.5rem;
          background: #fff;
          border-radius: 24px;
          border: 1px dashed rgba(212, 175, 55, 0.4);
          margin: 1.5rem 0;
          box-shadow: 0 8px 30px rgba(0,0,0,0.03);
        }

        .gflow-empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(212, 175, 55, 0.12);
          color: #B8962A;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          margin: 0 auto 1rem;
        }
      `}),(0,E.jsx)(`section`,{className:`gflow-hero`,children:(0,E.jsxs)(`div`,{className:`gflow-hero-content`,children:[(0,E.jsxs)(`div`,{className:`gflow-badge-top`,children:[(0,E.jsx)(`i`,{className:`fas fa-certificate`}),`Plateforme Immobilière Certifiée · Cameroun`]}),(0,E.jsxs)(`h1`,{className:`gflow-hero-title`,children:[`Trouvez le Logement`,(0,E.jsx)(`br`,{}),(0,E.jsx)(`span`,{children:`qui vous ressemble`})]}),(0,E.jsx)(`p`,{className:`gflow-hero-subtitle`,children:`Annonces 100% vérifiées par CNI, visites virtuelles 360° et vidéos immersives à Yaoundé et Douala.`}),(0,E.jsxs)(`div`,{className:`gflow-search-capsule`,onClick:()=>G(!0),children:[(0,E.jsx)(`div`,{className:`gflow-search-icon`,children:(0,E.jsx)(`i`,{className:`fas fa-search`})}),(0,E.jsx)(`input`,{type:`text`,className:`gflow-search-input`,value:J,onChange:e=>Y(e.target.value),placeholder:Z||`Rechercher une villa, un appartement…`,onClick:e=>e.stopPropagation(),onKeyDown:e=>{e.key===`Enter`&&ze()}}),(0,E.jsxs)(`div`,{className:`gflow-capsule-actions`,onClick:e=>e.stopPropagation(),children:[(0,E.jsxs)(`button`,{type:`button`,className:`gflow-filter-btn`,onClick:()=>G(!0),children:[(0,E.jsx)(`i`,{className:`fas fa-sliders-h`}),(0,E.jsx)(`span`,{children:e(`home.filters`)})]}),(0,E.jsx)(`button`,{type:`button`,className:`gflow-submit-circle`,onClick:ze,"aria-label":`Rechercher`,children:(0,E.jsx)(`i`,{className:`fas fa-arrow-right`})})]})]}),(0,E.jsxs)(`div`,{className:`gflow-categories-strip`,children:[(0,E.jsxs)(`button`,{type:`button`,className:`gflow-cat-chip ${d===`all`?`active`:``}`,onClick:()=>$(`all`),children:[(0,E.jsxs)(`svg`,{width:`15`,height:`15`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,E.jsx)(`rect`,{x:`3`,y:`3`,width:`7`,height:`7`,rx:`1.5`}),(0,E.jsx)(`rect`,{x:`14`,y:`3`,width:`7`,height:`7`,rx:`1.5`}),(0,E.jsx)(`rect`,{x:`14`,y:`14`,width:`7`,height:`7`,rx:`1.5`}),(0,E.jsx)(`rect`,{x:`3`,y:`14`,width:`7`,height:`7`,rx:`1.5`})]}),(0,E.jsx)(`span`,{children:`Tous les biens`})]}),(0,E.jsxs)(`button`,{type:`button`,className:`gflow-cat-chip special-reels`,onClick:()=>$(`discovery`),children:[(0,E.jsxs)(`svg`,{width:`15`,height:`15`,viewBox:`0 0 24 24`,fill:`none`,stroke:`#FF4D4D`,strokeWidth:`2.2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,E.jsx)(`circle`,{cx:`12`,cy:`12`,r:`9.5`}),(0,E.jsx)(`polygon`,{points:`10 8 16 12 10 16 10 8`,fill:`#FF4D4D`})]}),(0,E.jsx)(`span`,{children:`Mode Reels`})]}),(0,E.jsxs)(`button`,{type:`button`,className:`gflow-cat-chip ${d===`apartment`?`active`:``}`,onClick:()=>$(`apartment`),children:[(0,E.jsxs)(`svg`,{width:`15`,height:`15`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,E.jsx)(`rect`,{x:`4`,y:`2`,width:`16`,height:`20`,rx:`2`}),(0,E.jsx)(`line`,{x1:`9`,y1:`6`,x2:`9.01`,y2:`6`}),(0,E.jsx)(`line`,{x1:`15`,y1:`6`,x2:`15.01`,y2:`6`}),(0,E.jsx)(`line`,{x1:`9`,y1:`10`,x2:`9.01`,y2:`10`}),(0,E.jsx)(`line`,{x1:`15`,y1:`10`,x2:`15.01`,y2:`10`}),(0,E.jsx)(`line`,{x1:`9`,y1:`14`,x2:`9.01`,y2:`14`}),(0,E.jsx)(`line`,{x1:`15`,y1:`14`,x2:`15.01`,y2:`14`}),(0,E.jsx)(`path`,{d:`M10 22v-4h4v4`})]}),(0,E.jsx)(`span`,{children:`Appartements`})]}),(0,E.jsxs)(`button`,{type:`button`,className:`gflow-cat-chip ${d===`villa`?`active`:``}`,onClick:()=>$(`villa`),children:[(0,E.jsxs)(`svg`,{width:`15`,height:`15`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,E.jsx)(`path`,{d:`M3 10.5L12 3l9 7.5`}),(0,E.jsx)(`path`,{d:`M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5`}),(0,E.jsx)(`path`,{d:`M10 21v-6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v6`})]}),(0,E.jsx)(`span`,{children:`Villas`})]}),(0,E.jsxs)(`button`,{type:`button`,className:`gflow-cat-chip ${d===`studio`?`active`:``}`,onClick:()=>$(`studio`),children:[(0,E.jsxs)(`svg`,{width:`15`,height:`15`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,E.jsx)(`path`,{d:`M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2`}),(0,E.jsx)(`rect`,{x:`2`,y:`11`,width:`20`,height:`8`,rx:`2`}),(0,E.jsx)(`path`,{d:`M4 19v2`}),(0,E.jsx)(`path`,{d:`M20 19v2`})]}),(0,E.jsx)(`span`,{children:`Studios`})]}),(0,E.jsxs)(`button`,{type:`button`,className:`gflow-cat-chip`,onClick:()=>$(`map`),children:[(0,E.jsxs)(`svg`,{width:`15`,height:`15`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,E.jsx)(`polygon`,{points:`1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6`}),(0,E.jsx)(`line`,{x1:`8`,y1:`2`,x2:`8`,y2:`18`}),(0,E.jsx)(`line`,{x1:`16`,y1:`6`,x2:`16`,y2:`22`})]}),(0,E.jsx)(`span`,{children:e(`home.interactive_map_live`)})]}),(0,E.jsxs)(`button`,{type:`button`,className:`gflow-cat-chip`,onClick:()=>$(`ia`),children:[(0,E.jsxs)(`svg`,{width:`15`,height:`15`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,E.jsx)(`path`,{d:`M12 2v3`}),(0,E.jsx)(`path`,{d:`M12 19v3`}),(0,E.jsx)(`rect`,{x:`4`,y:`5`,width:`16`,height:`14`,rx:`4`}),(0,E.jsx)(`circle`,{cx:`9`,cy:`11`,r:`1.2`,fill:`currentColor`}),(0,E.jsx)(`circle`,{cx:`15`,cy:`11`,r:`1.2`,fill:`currentColor`}),(0,E.jsx)(`path`,{d:`M9 15h6`})]}),(0,E.jsx)(`span`,{children:e(`home.budget_calculator.badge`)})]})]}),(0,E.jsxs)(`div`,{className:`gflow-reels-banner reveal`,children:[(0,E.jsxs)(`div`,{className:`gflow-reels-left`,children:[(0,E.jsx)(`div`,{className:`gflow-reels-icon-box`,children:(0,E.jsx)(`i`,{className:`fas fa-play`})}),(0,E.jsxs)(`div`,{className:`gflow-reels-text`,children:[(0,E.jsx)(`h4`,{children:e(`home.reels_discovery_title`)}),(0,E.jsx)(`p`,{children:e(`home.reels_discovery_subtitle`)})]})]}),(0,E.jsxs)(u,{to:`/discovery`,className:`gflow-reels-btn`,children:[(0,E.jsx)(`i`,{className:`fas fa-play`}),` Lancer le flux`]})]})]})}),(0,E.jsx)(`section`,{className:`gflow-props-section`,id:`annonces`,children:Re?(0,E.jsxs)(`div`,{className:`gflow-filtered-section reveal`,children:[(0,E.jsxs)(`div`,{className:`gflow-filtered-header`,children:[(0,E.jsxs)(`div`,{children:[(0,E.jsxs)(`span`,{className:`gflow-filtered-badge`,children:[(0,E.jsx)(`i`,{className:`fas fa-filter`}),` Filtres appliqués`]}),(0,E.jsx)(`h2`,{className:`gflow-filtered-title`,children:`Résultats de votre recherche`}),(0,E.jsxs)(`p`,{className:`gflow-filtered-sub`,children:[(0,E.jsx)(`strong`,{children:Q.length}),` bien`,Q.length>1?`s`:``,` trouvé`,Q.length>1?`s`:``,` sur cette page`]}),(0,E.jsxs)(`div`,{className:`gflow-filtered-tags`,children:[J&&(0,E.jsxs)(`span`,{className:`gflow-filter-tag`,onClick:()=>Y(``),children:[(0,E.jsx)(`i`,{className:`fas fa-search`}),` "`,J,`"`,(0,E.jsx)(`span`,{className:`gflow-filter-tag-remove`,children:`✕`})]}),d===`apartment`&&(0,E.jsxs)(`span`,{className:`gflow-filter-tag`,onClick:()=>f(`all`),children:[(0,E.jsx)(`i`,{className:`fas fa-building`}),` Appartements`,(0,E.jsx)(`span`,{className:`gflow-filter-tag-remove`,children:`✕`})]}),d===`villa`&&(0,E.jsxs)(`span`,{className:`gflow-filter-tag`,onClick:()=>f(`all`),children:[(0,E.jsx)(`i`,{className:`fas fa-home`}),` Villas & Duplex`,(0,E.jsx)(`span`,{className:`gflow-filter-tag-remove`,children:`✕`})]}),d===`studio`&&(0,E.jsxs)(`span`,{className:`gflow-filter-tag`,onClick:()=>f(`all`),children:[(0,E.jsx)(`i`,{className:`fas fa-bed`}),` Studios & Chambres`,(0,E.jsx)(`span`,{className:`gflow-filter-tag-remove`,children:`✕`})]}),K.city&&(0,E.jsxs)(`span`,{className:`gflow-filter-tag`,onClick:()=>q(e=>({...e,city:``})),children:[(0,E.jsx)(`i`,{className:`fas fa-map-marker-alt`}),` `,K.city,(0,E.jsx)(`span`,{className:`gflow-filter-tag-remove`,children:`✕`})]}),K.neighborhood&&(0,E.jsxs)(`span`,{className:`gflow-filter-tag`,onClick:()=>q(e=>({...e,neighborhood:``})),children:[(0,E.jsx)(`i`,{className:`fas fa-compass`}),` `,K.neighborhood,(0,E.jsx)(`span`,{className:`gflow-filter-tag-remove`,children:`✕`})]}),K.transaction_type&&(0,E.jsxs)(`span`,{className:`gflow-filter-tag`,onClick:()=>q(e=>({...e,transaction_type:``})),children:[(0,E.jsx)(`i`,{className:`fas fa-tag`}),` `,K.transaction_type,(0,E.jsx)(`span`,{className:`gflow-filter-tag-remove`,children:`✕`})]}),K.max_price&&(0,E.jsxs)(`span`,{className:`gflow-filter-tag`,onClick:()=>q(e=>({...e,max_price:``})),children:[(0,E.jsx)(`i`,{className:`fas fa-coins`}),` Max `,Number(K.max_price).toLocaleString(`fr-FR`),` FCFA`,(0,E.jsx)(`span`,{className:`gflow-filter-tag-remove`,children:`✕`})]}),K.bedrooms&&(0,E.jsxs)(`span`,{className:`gflow-filter-tag`,onClick:()=>q(e=>({...e,bedrooms:``})),children:[(0,E.jsx)(`i`,{className:`fas fa-door-open`}),` `,K.bedrooms,`+ Ch.`,(0,E.jsx)(`span`,{className:`gflow-filter-tag-remove`,children:`✕`})]}),K.has_virtual_tour&&(0,E.jsxs)(`span`,{className:`gflow-filter-tag`,onClick:()=>q(e=>({...e,has_virtual_tour:!1})),children:[(0,E.jsx)(`i`,{className:`fas fa-vr-cardboard`}),` Visite 360°`,(0,E.jsx)(`span`,{className:`gflow-filter-tag-remove`,children:`✕`})]})]})]}),(0,E.jsxs)(`button`,{type:`button`,className:`gflow-reset-all-btn`,onClick:Be,children:[(0,E.jsx)(`i`,{className:`fas fa-undo`}),` Réinitialiser les filtres`]})]}),T?(0,E.jsx)(`div`,{className:`gflow-filtered-grid`,children:[1,2,3,4,5,6].map(e=>(0,E.jsx)(C,{},e))}):Q.length>0?(0,E.jsx)(`div`,{className:`gflow-filtered-grid`,children:Q.map(e=>(0,E.jsx)(S,{property:e,onFavChange:(e,t)=>O(n=>({...n,[e]:t}))},`filtered-${e.id}`))}):(0,E.jsxs)(`div`,{className:`gflow-empty-results`,children:[(0,E.jsx)(`div`,{className:`gflow-empty-icon`,children:(0,E.jsx)(`i`,{className:`fas fa-search-minus`})}),(0,E.jsx)(`h3`,{style:{fontFamily:`Poppins`,fontSize:`1.25rem`,fontWeight:700,margin:`0 0 8px`,color:`#0F0D09`},children:`Aucun bien ne correspond à vos critères`}),(0,E.jsx)(`p`,{style:{color:`#777`,fontSize:13.5,margin:`0 0 1.25rem`},children:`Essayez d'élargir votre recherche, de changer de quartier ou de réinitialiser vos filtres.`}),(0,E.jsxs)(`button`,{type:`button`,className:`gflow-reset-all-btn`,onClick:Be,children:[(0,E.jsx)(`i`,{className:`fas fa-th-large`}),` Afficher tous les biens`]})]})]}):(0,E.jsxs)(E.Fragment,{children:[je.length>0&&(0,E.jsxs)(`div`,{className:`home-carousel-wrapper reveal`,children:[(0,E.jsxs)(`div`,{className:`horizontal-sec-header`,children:[(0,E.jsxs)(`div`,{children:[(0,E.jsxs)(`span`,{className:`horizontal-sec-badge`,style:{background:`rgba(5,150,105,0.14)`,color:`#059669`},children:[(0,E.jsx)(`i`,{className:`fas fa-suitcase-rolling`}),` Vacances & Affaires · Court terme`]}),(0,E.jsx)(`h2`,{className:`horizontal-sec-title`,children:e(`home.short_stay`)}),(0,E.jsx)(`p`,{className:`horizontal-sec-sub`,children:e(`home.short_stay_desc`)})]}),(0,E.jsxs)(`button`,{type:`button`,onClick:()=>s(`/properties?transaction=COURTE_DUREE`),className:`horizontal-sec-link`,style:{background:`none`,border:`none`,cursor:`pointer`},children:[`Voir tous (`,je.length,`) →`]})]}),(0,E.jsx)(`button`,{type:`button`,className:`home-carousel-nav-btn prev`,onClick:()=>Le(Pe,`left`),"aria-label":`Précédent`,children:(0,E.jsx)(`i`,{className:`fas fa-chevron-left`})}),(0,E.jsx)(`button`,{type:`button`,className:`home-carousel-nav-btn next`,onClick:()=>Le(Pe,`right`),"aria-label":`Suivant`,children:(0,E.jsx)(`i`,{className:`fas fa-chevron-right`})}),(0,E.jsx)(`div`,{ref:Pe,className:`horizontal-properties-carousel`,children:T?[1,2,3,4].map(e=>(0,E.jsx)(`div`,{className:`horizontal-carousel-item`,children:(0,E.jsx)(C,{})},e)):je.map(e=>(0,E.jsx)(`div`,{className:`horizontal-carousel-item`,children:(0,E.jsx)(S,{property:e,onFavChange:(e,t)=>O(n=>({...n,[e]:t}))})},`short-${e.id}`))})]}),(0,E.jsxs)(`div`,{className:`home-carousel-wrapper reveal`,children:[(0,E.jsxs)(`div`,{className:`horizontal-sec-header`,children:[(0,E.jsxs)(`div`,{children:[(0,E.jsxs)(`span`,{className:`horizontal-sec-badge`,style:{background:`rgba(212,175,55,0.14)`,color:`#A8891C`},children:[(0,E.jsx)(`i`,{className:`fas fa-key`}),` Long terme · Location`]}),(0,E.jsx)(`h2`,{className:`horizontal-sec-title`,children:e(`home.rent`)}),(0,E.jsx)(`p`,{className:`horizontal-sec-sub`,children:e(`home.rent_desc`)})]}),(0,E.jsxs)(`button`,{type:`button`,onClick:()=>s(`/properties?transaction=LOCATION`),className:`horizontal-sec-link`,style:{background:`none`,border:`none`,cursor:`pointer`},children:[`Voir tous (`,Me.length,`) →`]})]}),(0,E.jsx)(`button`,{type:`button`,className:`home-carousel-nav-btn prev`,onClick:()=>Le(Fe,`left`),"aria-label":`Précédent`,children:(0,E.jsx)(`i`,{className:`fas fa-chevron-left`})}),(0,E.jsx)(`button`,{type:`button`,className:`home-carousel-nav-btn next`,onClick:()=>Le(Fe,`right`),"aria-label":`Suivant`,children:(0,E.jsx)(`i`,{className:`fas fa-chevron-right`})}),(0,E.jsx)(`div`,{ref:Fe,className:`horizontal-properties-carousel`,children:T?[1,2,3,4].map(e=>(0,E.jsx)(`div`,{className:`horizontal-carousel-item`,children:(0,E.jsx)(C,{})},e)):Me.map(e=>(0,E.jsx)(`div`,{className:`horizontal-carousel-item`,children:(0,E.jsx)(S,{property:e,onFavChange:(e,t)=>O(n=>({...n,[e]:t}))})},`rent-${e.id}`))})]}),(0,E.jsxs)(`div`,{className:`home-carousel-wrapper reveal`,children:[(0,E.jsxs)(`div`,{className:`horizontal-sec-header`,children:[(0,E.jsxs)(`div`,{children:[(0,E.jsxs)(`span`,{className:`horizontal-sec-badge`,style:{background:`rgba(16,185,129,0.14)`,color:`#059669`},children:[(0,E.jsx)(`i`,{className:`fas fa-tag`}),` Investissement & Achat · Titré`]}),(0,E.jsx)(`h2`,{className:`horizontal-sec-title`,children:e(`home.buy`)}),(0,E.jsx)(`p`,{className:`horizontal-sec-sub`,children:e(`home.buy_desc`)})]}),(0,E.jsxs)(`button`,{type:`button`,onClick:()=>s(`/properties?transaction=VENTE`),className:`horizontal-sec-link`,style:{background:`none`,border:`none`,cursor:`pointer`},children:[`Voir tous (`,Ne.length,`) →`]})]}),(0,E.jsx)(`button`,{type:`button`,className:`home-carousel-nav-btn prev`,onClick:()=>Le(Ie,`left`),"aria-label":`Précédent`,children:(0,E.jsx)(`i`,{className:`fas fa-chevron-left`})}),(0,E.jsx)(`button`,{type:`button`,className:`home-carousel-nav-btn next`,onClick:()=>Le(Ie,`right`),"aria-label":`Suivant`,children:(0,E.jsx)(`i`,{className:`fas fa-chevron-right`})}),(0,E.jsx)(`div`,{ref:Ie,className:`horizontal-properties-carousel`,children:T?[1,2,3,4].map(e=>(0,E.jsx)(`div`,{className:`horizontal-carousel-item`,children:(0,E.jsx)(C,{})},e)):Ne.map(e=>(0,E.jsx)(`div`,{className:`horizontal-carousel-item`,children:(0,E.jsx)(S,{property:e,onFavChange:(e,t)=>O(n=>({...n,[e]:t}))})},`sale-${e.id}`))})]}),(0,E.jsx)(`div`,{style:{textAlign:`center`,marginTop:`1rem`,marginBottom:`1rem`},children:(0,E.jsxs)(`button`,{type:`button`,onClick:()=>s(`/properties`),className:`gflow-filter-btn`,style:{padding:`12px 28px`,fontSize:14,background:`#0F0D09`,color:`#F6D365`,border:`none`,boxShadow:`0 4px 15px rgba(0,0,0,0.12)`,cursor:`pointer`},children:[(0,E.jsx)(`i`,{className:`fas fa-th-large`}),` Parcourir l'ensemble du catalogue (`,b.length||24,`+)`]})})]})}),(0,E.jsx)(`section`,{className:`showcase-btp-section reveal`,id:`btp-section`,children:(0,E.jsxs)(`div`,{className:`btp-main-wrap`,children:[(0,E.jsxs)(`div`,{className:`btp-header-block`,children:[(0,E.jsxs)(`div`,{className:`btp-badge-top`,children:[(0,E.jsx)(`i`,{className:`fas fa-hard-hat`}),` Professionnels Certifiés · Architecture & BTP`]}),(0,E.jsxs)(`h3`,{style:{fontFamily:`Poppins`,fontSize:`clamp(1.7rem, 4vw, 2.4rem)`,fontWeight:800,margin:`0 0 12px`,color:`#0F0D09`,letterSpacing:`-0.3px`},children:[`Architectes, BTP & `,(0,E.jsx)(`span`,{style:{color:`#92700C`},children:`Mobilier sur-mesure`})]}),(0,E.jsx)(`p`,{style:{color:`#555555`,fontSize:14.5,lineHeight:1.65,margin:`0 0 1.5rem`},children:`Explorez les réalisations d'artisans d'élite au Cameroun. Consultez leurs profils librement et demandez un devis garanti avec paiement séquestre.`}),(0,E.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`center`,gap:12,flexWrap:`wrap`},children:[(0,E.jsxs)(`button`,{type:`button`,onClick:()=>R(!0),style:{background:`#0F0D09`,color:`#F6D365`,border:`1.5px solid #0F0D09`,padding:`9px 18px`,borderRadius:12,fontSize:13,fontWeight:800,cursor:`pointer`,display:`inline-flex`,alignItems:`center`,gap:8,boxShadow:`0 4px 14px rgba(0,0,0,0.12)`},children:[(0,E.jsx)(`i`,{className:`fas fa-calculator`,style:{color:`#D4AF37`}}),(0,E.jsx)(`span`,{children:e(`home.budget_calculator.title`)})]}),(0,E.jsx)(u,{to:`/architectes`,style:{color:`#92700C`,textDecoration:`none`,fontSize:13,fontWeight:700,display:`inline-flex`,alignItems:`center`,gap:6},children:`Voir l'annuaire complet →`})]})]}),(j||k.length>0)&&(0,E.jsxs)(`div`,{className:`pro-btp-vitrine-box`,children:[(0,E.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginBottom:14,flexWrap:`wrap`,gap:8},children:[(0,E.jsxs)(`div`,{style:{fontWeight:800,fontSize:15,color:`#0F0D09`,display:`flex`,alignItems:`center`,gap:8},children:[(0,E.jsx)(`i`,{className:`fas fa-hammer`,style:{color:`#D4AF37`}}),(0,E.jsx)(`span`,{children:e(`home.showcase_projects`)})]}),(0,E.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:10},children:[(0,E.jsx)(`span`,{className:`pro-mobile-swipe-hint`,children:`Glisser ➔`}),(0,E.jsxs)(u,{to:`/architectes`,style:{fontSize:12,color:`#92700C`,fontWeight:700,textDecoration:`none`},children:[`Voir tout (`,k.length,`) →`]})]})]}),j?(0,E.jsx)(`div`,{className:`pro-btp-projects-grid`,children:[1,2,3,4].map(e=>(0,E.jsx)(ce,{},e))}):k&&k.length>0?(0,E.jsx)(`div`,{ref:Ce,className:`pro-btp-projects-grid`,children:k.slice(0,6).map((e,t)=>(0,E.jsxs)(`div`,{className:`pro-btp-project-card`,onClick:()=>N(e),style:{cursor:`pointer`},children:[(0,E.jsxs)(`div`,{style:{position:`relative`,height:140,background:`#111`,overflow:`hidden`},children:[(0,E.jsx)(`img`,{src:y(e.main_image_display||e.main_image_url||e.image,`https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80`),alt:e.title,onError:e=>{e.currentTarget.src=`https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80`},style:{width:`100%`,height:`100%`,objectFit:`cover`,transition:`transform 0.4s ease`},onMouseEnter:e=>e.currentTarget.style.transform=`scale(1.05)`,onMouseLeave:e=>e.currentTarget.style.transform=`scale(1)`}),!!(e.before_image_display||e.before_image_url||e.beforeImage)&&(0,E.jsxs)(`div`,{style:{position:`absolute`,top:8,left:8,background:`rgba(15,13,9,0.9)`,backdropFilter:`blur(4px)`,color:`#F6D365`,padding:`3px 8px`,borderRadius:6,fontSize:10,fontWeight:800,border:`1px solid rgba(212,175,55,0.4)`,zIndex:2,display:`flex`,alignItems:`center`,gap:4},children:[(0,E.jsx)(`i`,{className:`fas fa-exchange-alt`,style:{fontSize:8}}),` Avant / Après`]}),(0,E.jsx)(`div`,{style:{position:`absolute`,bottom:8,left:8,background:`rgba(0,0,0,0.75)`,backdropFilter:`blur(4px)`,color:`#FFF`,padding:`3px 8px`,borderRadius:6,fontSize:10.5,fontWeight:700,zIndex:2},children:e.city||e.place||`Cameroun`})]}),(0,E.jsxs)(`div`,{style:{padding:`12px 14px`,flex:1,display:`flex`,flexDirection:`column`,justifyContent:`space-between`},children:[(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`div`,{style:{fontSize:10.5,color:`#AA820A`,fontWeight:800,textTransform:`uppercase`,letterSpacing:`0.4px`},children:e.category}),(0,E.jsx)(`div`,{style:{fontWeight:800,fontSize:13,color:`#0F0D09`,lineHeight:1.35,marginTop:4},children:e.title})]}),(0,E.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginTop:10,paddingTop:8,borderTop:`1px solid #E8E3DA`,fontSize:11,color:`#666`},children:[(0,E.jsxs)(`span`,{children:[`Par `,(0,E.jsx)(`strong`,{children:e.author?.name||`Artisan Piolo`})]}),(0,E.jsx)(`span`,{style:{color:`#D4AF37`,fontWeight:700},children:`Détails →`})]})]})]},t))}):null]}),(0,E.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginBottom:16},children:[(0,E.jsxs)(`div`,{style:{fontWeight:800,fontSize:16,color:`#0F0D09`,display:`flex`,alignItems:`center`,gap:8},children:[(0,E.jsx)(`i`,{className:`fas fa-medal`,style:{color:`#D4AF37`}}),(0,E.jsx)(`span`,{children:e(`home.recommended_pros`)})]}),(0,E.jsx)(`span`,{className:`pro-mobile-swipe-hint`,children:`Glisser ➔`})]}),j?(0,E.jsx)(`div`,{className:`pro-btp-pros-grid`,children:[1,2,3].map(e=>(0,E.jsx)(le,{},e))}):_e.length===0?(0,E.jsx)(`div`,{style:{padding:`28px 20px`,borderRadius:16,border:`1px dashed rgba(212,175,55,0.4)`,textAlign:`center`,color:`#64605A`,fontSize:13.5,marginBottom:24},children:`Aucun professionnel certifié n'est encore inscrit. Les premiers artisans apparaîtront ici dès leur validation.`}):(0,E.jsx)(`div`,{ref:we,className:`pro-btp-pros-grid`,children:_e.map(e=>(0,E.jsxs)(`div`,{className:`pro-btp-pro-card`,children:[(0,E.jsxs)(`div`,{style:{position:`relative`,height:135,background:`#1A160F`},children:[(0,E.jsx)(`img`,{src:y(e.cover,`https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80`),alt:e.name,onError:e=>{e.currentTarget.src=`https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80`},style:{width:`100%`,height:`100%`,objectFit:`cover`}}),(0,E.jsx)(`div`,{style:{position:`absolute`,inset:0,background:`linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)`}}),(0,E.jsxs)(`div`,{style:{position:`absolute`,top:10,right:10,background:`#D4AF37`,color:`#0F0D09`,padding:`4px 9px`,borderRadius:10,fontSize:10.5,fontWeight:800,display:`flex`,alignItems:`center`,gap:5,zIndex:2},children:[(0,E.jsx)(`i`,{className:`fas fa-check-circle`}),(0,E.jsx)(`span`,{children:`Certifié Piolo`})]}),(0,E.jsx)(`div`,{style:{position:`absolute`,bottom:-22,left:16,width:54,height:54,borderRadius:`50%`,background:e.avatarBg||`linear-gradient(135deg, #D4AF37, #AA820A)`,color:`#FFF`,fontWeight:800,fontSize:18,display:`flex`,alignItems:`center`,justifyContent:`center`,border:`3px solid #FFF`,boxShadow:`0 4px 12px rgba(0,0,0,0.18)`,overflow:`hidden`,zIndex:5},children:e.avatarUrl?(0,E.jsx)(`img`,{src:y(e.avatarUrl),alt:e.name,onError:e=>{e.currentTarget.style.display=`none`},style:{width:`100%`,height:`100%`,objectFit:`cover`}}):(0,E.jsx)(`span`,{children:e.initials||e.name?.[0]||`P`})})]}),(0,E.jsxs)(`div`,{style:{padding:`28px 16px 16px`,flex:1,display:`flex`,flexDirection:`column`},children:[(0,E.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:6,fontSize:11,color:e.availColor,fontWeight:700,marginBottom:4},children:[(0,E.jsx)(`span`,{style:{width:7,height:7,borderRadius:`50%`,background:e.availColor}}),(0,E.jsx)(`span`,{children:e.availText})]}),(0,E.jsx)(`div`,{style:{fontFamily:`Poppins, sans-serif`,fontWeight:800,fontSize:16,color:`#0F0D09`},children:e.name}),(0,E.jsxs)(`div`,{style:{fontSize:12,color:`#888`,display:`flex`,alignItems:`center`,gap:4,marginTop:2},children:[(0,E.jsx)(`i`,{className:`fas fa-map-marker-alt`,style:{color:`#D4AF37`}}),(0,E.jsx)(`span`,{children:e.city})]}),(0,E.jsx)(`div`,{style:{fontSize:12.5,color:`#555`,marginTop:5,fontWeight:600},children:e.specialty}),(0,E.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:4,marginTop:7,fontSize:12},children:[(0,E.jsxs)(`span`,{style:{color:`#D4AF37`,fontWeight:800,display:`flex`,alignItems:`center`,gap:3},children:[(0,E.jsx)(`i`,{className:`fas fa-star`,style:{color:`#D4AF37`}}),e.rating]}),(0,E.jsxs)(`span`,{style:{color:`#888`,fontSize:11},children:[`(`,e.reviewsCount,` avis)`]})]}),(0,E.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,background:`#FAF9F6`,padding:`8px 10px`,borderRadius:10,margin:`10px 0`,border:`1px solid #F0ECE4`,textAlign:`center`},children:[(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`div`,{style:{fontWeight:800,fontSize:12.5,color:`#0F0D09`},children:e.projectsCount}),(0,E.jsx)(`div`,{style:{fontSize:9,color:`#888`,textTransform:`uppercase`},children:`Projets`})]}),(0,E.jsx)(`div`,{style:{width:1,background:`#E8E3DA`}}),(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`div`,{style:{fontWeight:800,fontSize:12.5,color:`#0F0D09`},children:e.experience}),(0,E.jsx)(`div`,{style:{fontSize:9,color:`#888`,textTransform:`uppercase`},children:`Expérience`})]}),(0,E.jsx)(`div`,{style:{width:1,background:`#E8E3DA`}}),(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`div`,{style:{fontWeight:800,fontSize:12.5,color:`#D4AF37`},children:e.pointsRequired}),(0,E.jsx)(`div`,{style:{fontSize:9,color:`#888`,textTransform:`uppercase`},children:`Devis`})]})]}),(0,E.jsx)(`div`,{style:{display:`flex`,flexWrap:`wrap`,gap:4,marginBottom:14},children:(e.tags||[]).slice(0,3).map((e,t)=>(0,E.jsx)(`span`,{style:{fontSize:10.5,fontWeight:600,padding:`2px 8px`,borderRadius:8,background:`rgba(212,175,55,0.12)`,color:`#926F08`},children:e},t))}),(0,E.jsxs)(`div`,{style:{display:`flex`,gap:8,marginTop:`auto`},children:[(0,E.jsxs)(`button`,{type:`button`,onClick:()=>U(e),style:{flex:1,background:`linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)`,color:`#0F0D09`,border:`none`,padding:`10px 8px`,borderRadius:10,fontWeight:800,fontSize:12,cursor:`pointer`,display:`flex`,alignItems:`center`,justifyContent:`center`,gap:5,boxShadow:`0 2px 8px rgba(212,175,55,0.3)`},children:[(0,E.jsx)(`i`,{className:`fas fa-file-invoice-dollar`}),(0,E.jsx)(`span`,{children:`Devis`})]}),(0,E.jsxs)(`button`,{type:`button`,onClick:()=>xe(e),style:{flex:1,background:`#F8F6F0`,color:`#0F0D09`,border:`1px solid #E8E3DA`,padding:`10px 8px`,borderRadius:10,fontWeight:700,fontSize:12,cursor:`pointer`,display:`flex`,alignItems:`center`,justifyContent:`center`,gap:5},children:[(0,E.jsx)(`i`,{className:`fas fa-user-circle`}),(0,E.jsx)(`span`,{children:`Profil`})]})]})]})]},e.id))}),(0,E.jsxs)(`div`,{style:{textAlign:`center`,marginTop:`1.75rem`,fontSize:13,color:`#666666`},children:[`Vous êtes architecte, artisan ou entrepreneur BTP ?`,` `,(0,E.jsx)(`button`,{type:`button`,onClick:()=>s(`/dashboard/pro`,`Connectez-vous pour accéder à votre espace professionnel.`),style:{background:`none`,border:`none`,color:`#92700C`,fontWeight:800,textDecoration:`underline`,cursor:`pointer`,padding:0},children:`Rejoindre le réseau Piolo Pro →`})]})]})}),(0,E.jsx)(`section`,{className:`showcase-3d-section reveal`,id:`visite-3d`,children:(0,E.jsxs)(`div`,{className:`showcase-3d-wrap`,children:[(0,E.jsxs)(`div`,{children:[(0,E.jsxs)(`span`,{style:{color:`#F6D365`,fontSize:12,fontWeight:700,textTransform:`uppercase`,letterSpacing:.5},children:[(0,E.jsx)(`i`,{className:`fas fa-vr-cardboard`}),` Immersion Totale 360°`]}),(0,E.jsx)(`h3`,{style:{fontFamily:`Poppins`,fontSize:`clamp(1.5rem, 3.5vw, 2.2rem)`,fontWeight:800,margin:`8px 0 12px`,color:`#FFF`},children:`Explorez chaque pièce à 360° sans vous déplacer`}),(0,E.jsx)(`p`,{style:{color:`rgba(255,255,255,0.72)`,fontSize:14,lineHeight:1.65,marginBottom:20},children:`Inspectez les finitions, la luminosité naturelle, les volumes et l'état général du logement avant de planifier une visite sur place.`}),(0,E.jsx)(`div`,{style:{display:`flex`,gap:12,flexWrap:`wrap`},children:(0,E.jsxs)(`button`,{type:`button`,onClick:()=>s(`/properties?has_virtual_tour=true`),className:`gflow-filter-btn`,style:{background:`linear-gradient(135deg, #D4AF37, #F6D365)`,color:`#0F0D09`,border:`none`,padding:`10px 22px`,cursor:`pointer`},children:[(0,E.jsx)(`i`,{className:`fas fa-play`}),` Découvrir les biens 360°`]})})]}),(0,E.jsxs)(`div`,{className:`showcase-3d-frame`,children:[(0,E.jsxs)(`div`,{className:`showcase-3d-image-box`,children:[(0,E.jsx)(`img`,{src:Ve[c],alt:He[c]}),(0,E.jsxs)(`div`,{className:`showcase-3d-badge`,children:[(0,E.jsx)(`i`,{className:`fas fa-compass fa-spin`,style:{animationDuration:`10s`}}),` `,He[c]]})]}),(0,E.jsx)(`div`,{className:`showcase-3d-nav`,children:Object.keys(He).map(e=>(0,E.jsx)(`button`,{type:`button`,className:`showcase-3d-nav-btn ${c===e?`active`:``}`,onClick:()=>l(e),children:He[e].split(` `)[0]},e))})]})]})}),(0,E.jsx)(`section`,{className:`showcase-map-section reveal`,id:`carte`,children:(0,E.jsxs)(`div`,{className:`showcase-map-grid`,children:[(0,E.jsxs)(`div`,{className:`showcase-map-preview`,onClick:()=>s(`/map`),children:[(0,E.jsx)(`div`,{className:`showcase-map-bg-grid`,style:{filter:!t||!r?`blur(6px)`:`none`,transform:!t||!r?`scale(1.05)`:`none`,transition:`all 0.3s ease`}}),(0,E.jsxs)(`div`,{style:{filter:!t||!r?`blur(4px)`:`none`,pointerEvents:!t||!r?`none`:`auto`},children:[(0,E.jsxs)(`div`,{className:`showcase-pin`,style:{top:`35%`,left:`38%`},children:[(0,E.jsx)(`i`,{className:`fas fa-map-marker-alt`}),(0,E.jsx)(`span`,{children:`Bastos · 250k`})]}),(0,E.jsxs)(`div`,{className:`showcase-pin`,style:{top:`55%`,left:`68%`},children:[(0,E.jsx)(`i`,{className:`fas fa-map-marker-alt`}),(0,E.jsx)(`span`,{children:`Bonapriso · 180k`})]}),(0,E.jsxs)(`div`,{className:`showcase-pin`,style:{top:`65%`,left:`30%`},children:[(0,E.jsx)(`i`,{className:`fas fa-map-marker-alt`}),(0,E.jsx)(`span`,{children:`Akwa · 90k`})]})]}),!t||!r?(0,E.jsxs)(`div`,{className:`showcase-map-lock-overlay`,children:[(0,E.jsx)(`div`,{className:`showcase-map-lock-icon`,children:(0,E.jsx)(`i`,{className:`fas fa-lock`})}),(0,E.jsxs)(`h4`,{style:{fontFamily:`Poppins, sans-serif`,fontSize:16,fontWeight:800,margin:`0 0 6px`,color:`#fff`},children:[e(`home.interactive_map`),` protégée`]}),(0,E.jsx)(`p`,{style:{fontSize:13,color:`rgba(255,255,255,0.85)`,margin:`0 0 15px`,maxWidth:320,lineHeight:1.5},children:`Connectez-vous pour débloquer la carte interactive, filtrer par quartier et calculer vos itinéraires.`}),(0,E.jsxs)(`button`,{type:`button`,className:`showcase-map-login-btn`,onClick:e=>{e.stopPropagation(),a(`/login`,{state:{from:`/map`}})},children:[(0,E.jsx)(`i`,{className:`fas fa-sign-in-alt`}),` Se connecter pour voir la carte`]})]}):(0,E.jsxs)(`div`,{style:{position:`absolute`,bottom:12,right:12,background:`rgba(0,0,0,0.8)`,color:`#F6D365`,padding:`6px 12px`,borderRadius:8,fontSize:11.5,fontWeight:700,zIndex:10},children:[(0,E.jsx)(`i`,{className:`fas fa-hand-pointer`}),` Toucher pour ouvrir la carte plein écran`]})]}),(0,E.jsxs)(`div`,{children:[(0,E.jsxs)(`span`,{style:{color:`#B8962A`,fontSize:12,fontWeight:700,textTransform:`uppercase`,letterSpacing:.5},children:[(0,E.jsx)(`i`,{className:`fas fa-map-marked-alt`}),` Géolocalisation Intelligente`]}),(0,E.jsx)(`h3`,{style:{fontFamily:`Poppins`,fontSize:`clamp(1.5rem, 3.5vw, 2.2rem)`,fontWeight:800,margin:`8px 0 12px`,color:`#0F0D09`},children:`Trouvez votre quartier idéal en quelques secondes`}),(0,E.jsx)(`p`,{style:{color:`#666`,fontSize:14,lineHeight:1.65,marginBottom:20},children:`Visualisez les écoles, commerces, axes routiers et commodités autour de votre futur logement à Yaoundé et Douala.`}),(0,E.jsxs)(`button`,{type:`button`,onClick:()=>s(`/map`),className:`gflow-filter-btn`,style:{background:`#0F0D09`,color:`#F6D365`,border:`none`,padding:`10px 22px`,cursor:`pointer`},children:[(0,E.jsx)(`i`,{className:`fas fa-map-marked-alt`}),` Explorer la carte plein écran`]})]})]})}),(0,E.jsx)(`section`,{className:`showcase-ia-section reveal`,id:`estimateur-ia`,children:(0,E.jsxs)(`div`,{className:`showcase-ia-wrap`,children:[(0,E.jsxs)(`div`,{children:[(0,E.jsxs)(`span`,{style:{color:`#F6D365`,fontSize:12,fontWeight:700,textTransform:`uppercase`,letterSpacing:.5},children:[(0,E.jsx)(`i`,{className:`fas fa-robot`}),` Intelligence Artificielle Piolo`]}),(0,E.jsx)(`h3`,{style:{fontFamily:`Poppins`,fontSize:`clamp(1.5rem, 3.5vw, 2.2rem)`,fontWeight:800,margin:`8px 0 12px`,color:`#FFF`},children:`Simulez la juste valeur de marché en temps réel`}),(0,E.jsx)(`p`,{style:{color:`rgba(255,255,255,0.72)`,fontSize:14,lineHeight:1.65,marginBottom:20},children:`Algorithme entraîné sur les transactions réelles au Cameroun pour vous garantir un loyer équitable sans mauvaises surprises.`}),(0,E.jsxs)(u,{to:o,className:`gflow-filter-btn`,style:{background:`linear-gradient(135deg, #D4AF37, #F6D365)`,color:`#0F0D09`,border:`none`,padding:`10px 22px`},children:[(0,E.jsx)(`i`,{className:`fas fa-calculator`}),` Estimation complète de mon bien`]})]}),(0,E.jsxs)(`div`,{className:`showcase-ia-card`,children:[(0,E.jsxs)(`div`,{className:`ia-slider-group`,children:[(0,E.jsxs)(`div`,{className:`ia-slider-label`,children:[(0,E.jsx)(`span`,{children:e(`home.budget_calculator.neighborhood`)}),(0,E.jsx)(`strong`,{children:_.toUpperCase()})]}),(0,E.jsxs)(`select`,{value:_,onChange:e=>ae(e.target.value),style:{width:`100%`,padding:`9px 12px`,borderRadius:10,background:`rgba(255,255,255,0.1)`,color:`#fff`,border:`1px solid rgba(255,255,255,0.2)`,fontSize:13},children:[(0,E.jsx)(`option`,{value:`bastos`,style:{color:`#000`},children:`Bastos (Yaoundé)`}),(0,E.jsx)(`option`,{value:`bonapriso`,style:{color:`#000`},children:`Bonapriso (Douala)`}),(0,E.jsx)(`option`,{value:`akwa`,style:{color:`#000`},children:`Akwa (Douala)`}),(0,E.jsx)(`option`,{value:`odza`,style:{color:`#000`},children:`Odza (Yaoundé)`}),(0,E.jsx)(`option`,{value:`bonamoussadi`,style:{color:`#000`},children:`Bonamoussadi (Douala)`}),(0,E.jsx)(`option`,{value:`ngousso`,style:{color:`#000`},children:`Ngousso (Yaoundé)`})]})]}),(0,E.jsxs)(`div`,{className:`ia-slider-group`,children:[(0,E.jsxs)(`div`,{className:`ia-slider-label`,children:[(0,E.jsx)(`span`,{children:e(`home.budget_calculator.surface`)}),(0,E.jsxs)(`strong`,{children:[ne,` m²`]})]}),(0,E.jsx)(`input`,{type:`range`,min:`25`,max:`300`,step:`5`,value:ne,onChange:e=>p(Number(e.target.value)),className:`ia-range`})]}),(0,E.jsxs)(`div`,{className:`ia-slider-group`,children:[(0,E.jsxs)(`div`,{className:`ia-slider-label`,children:[(0,E.jsx)(`span`,{children:e(`home.budget_calculator.rooms`)}),(0,E.jsxs)(`strong`,{children:[m,` ch.`]})]}),(0,E.jsx)(`input`,{type:`range`,min:`1`,max:`6`,step:`1`,value:m,onChange:e=>g(Number(e.target.value)),className:`ia-range`})]}),(0,E.jsxs)(`div`,{className:`ia-result-box`,children:[(0,E.jsx)(`small`,{children:e(`home.budget_calculator.estimated_rent`)}),(0,E.jsxs)(`div`,{className:`ia-result-price`,children:[Ue().min,` – `,Ue().max,` FCFA`]}),(0,E.jsxs)(`div`,{style:{color:`#10B981`,fontSize:12,fontWeight:700},children:[(0,E.jsx)(`i`,{className:`fas fa-check-circle`}),` Données temps réel du marché`]})]})]})]})}),(0,E.jsxs)(`section`,{className:`showcase-security-section reveal`,id:`securite`,children:[(0,E.jsxs)(`div`,{style:{textAlign:`center`,maxWidth:650,margin:`0 auto 2rem`},children:[(0,E.jsxs)(`span`,{style:{color:`#B8962A`,fontSize:12,fontWeight:700,textTransform:`uppercase`,letterSpacing:.5},children:[(0,E.jsx)(`i`,{className:`fas fa-shield-alt`}),` Sécurité & Garantie`]}),(0,E.jsx)(`h3`,{style:{fontFamily:`Poppins`,fontSize:`clamp(1.5rem, 3.5vw, 2.2rem)`,fontWeight:800,margin:`8px 0 10px`,color:`#0F0D09`},children:`Une expérience 100% sécurisée`}),(0,E.jsx)(`p`,{style:{color:`#666`,fontSize:14,margin:0},children:`Nous vérifions chaque acteur de la plateforme pour éliminer les arnaques et sécuriser vos dépôts.`})]}),(0,E.jsxs)(`div`,{className:`sec-pillars-grid`,children:[(0,E.jsxs)(`div`,{className:`sec-pillar-card`,children:[(0,E.jsx)(`div`,{className:`sec-pillar-icon`,children:(0,E.jsx)(`i`,{className:`fas fa-id-card`})}),(0,E.jsx)(`h4`,{children:e(`home.trusted_pillars.cni_verified`)}),(0,E.jsx)(`p`,{children:e(`home.trusted_pillars.cni_verified_desc`)})]}),(0,E.jsxs)(`div`,{className:`sec-pillar-card`,children:[(0,E.jsx)(`div`,{className:`sec-pillar-icon`,children:(0,E.jsx)(`i`,{className:`fas fa-user-check`})}),(0,E.jsx)(`h4`,{children:e(`home.trusted_pillars.audit_visit`)}),(0,E.jsx)(`p`,{children:e(`home.trusted_pillars.audit_visit_desc`)})]}),(0,E.jsxs)(`div`,{className:`sec-pillar-card`,children:[(0,E.jsx)(`div`,{className:`sec-pillar-icon`,children:(0,E.jsx)(`i`,{className:`fas fa-file-contract`})}),(0,E.jsx)(`h4`,{children:e(`home.trusted_pillars.legal_contract`)}),(0,E.jsx)(`p`,{children:e(`home.trusted_pillars.legal_contract_desc`)})]}),(0,E.jsxs)(`div`,{className:`sec-pillar-card`,children:[(0,E.jsx)(`div`,{className:`sec-pillar-icon`,children:(0,E.jsx)(`i`,{className:`fas fa-lock`})}),(0,E.jsx)(`h4`,{children:e(`home.trusted_pillars.secure_deposit`)}),(0,E.jsx)(`p`,{children:e(`home.trusted_pillars.secure_deposit_desc`)})]})]})]}),(0,E.jsx)(`section`,{style:{maxWidth:1280,margin:`3rem auto`,padding:`0 1.25rem`},children:(0,E.jsxs)(`div`,{style:{background:`#fff`,borderRadius:24,padding:`1.75rem`,border:`1px solid #E8E4DC`,display:`flex`,alignItems:`center`,justifyContent:`space-between`,gap:20,flexWrap:`wrap`,boxShadow:`0 8px 30px rgba(0,0,0,0.04)`},children:[(0,E.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:16},children:[(0,E.jsx)(`div`,{style:{width:52,height:52,borderRadius:16,background:`linear-gradient(135deg, #D4AF37, #F6D365)`,display:`flex`,alignItems:`center`,justifyContent:`center`,color:`#0F0D09`,fontSize:22,flexShrink:0},children:(0,E.jsx)(`i`,{className:`fas fa-coins`})}),(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`h4`,{style:{fontFamily:`Poppins`,fontSize:16,fontWeight:800,margin:`0 0 4px`,color:`#0F0D09`},children:`Rechargez vos points via Orange Money & MTN MoMo`}),(0,E.jsx)(`p`,{style:{fontSize:13,color:`#666`,margin:0},children:`Débloquez les contacts directs, lancez les visites 3D et obtenez les analyses de marché.`})]})]}),(0,E.jsxs)(u,{to:o,className:`gflow-filter-btn`,style:{background:`#0F0D09`,color:`#F6D365`,border:`none`,padding:`10px 22px`},children:[(0,E.jsx)(`i`,{className:`fas fa-wallet`}),` Voir mes points (`,r?.points||0,` pts)`]})]})}),(0,E.jsxs)(`footer`,{style:{background:`#0F0D09`,color:`#fff`,padding:`3.5rem 1.25rem 2rem`,borderTop:`1px solid rgba(212,175,55,0.2)`},children:[(0,E.jsxs)(`div`,{style:{maxWidth:1280,margin:`0 auto`,display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(220px, 1fr))`,gap:32,marginBottom:24},children:[(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`span`,{style:{fontFamily:`Poppins`,fontSize:24,fontWeight:900,color:`#F6D365`,display:`block`,marginBottom:10},children:`Piolo`}),(0,E.jsx)(`p`,{style:{fontSize:13,color:`rgba(255,255,255,0.65)`,lineHeight:1.6},children:`Plateforme Immobilière Numérique d'Excellence au Cameroun. Louez, achetez et visitez en toute sécurité.`})]}),(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`h5`,{style:{fontFamily:`Poppins`,fontSize:14,fontWeight:700,color:`#FFF`,marginBottom:12},children:`Navigation`}),(0,E.jsxs)(`ul`,{style:{listStyle:`none`,padding:0,margin:0,display:`flex`,flexDirection:`column`,gap:8,fontSize:13},children:[(0,E.jsx)(`li`,{children:(0,E.jsxs)(u,{to:`/properties`,style:{color:`rgba(255,255,255,0.7)`,textDecoration:`none`},children:[(0,E.jsx)(`i`,{className:`fas fa-chevron-right`,style:{fontSize:10,marginRight:6,color:`#D4AF37`}}),` `,e(`home.all_properties`)]})}),(0,E.jsx)(`li`,{children:(0,E.jsxs)(u,{to:`/discovery`,style:{color:`rgba(255,255,255,0.7)`,textDecoration:`none`},children:[(0,E.jsx)(`i`,{className:`fas fa-chevron-right`,style:{fontSize:10,marginRight:6,color:`#D4AF37`}}),` `,e(`home.reels_discovery`)]})}),(0,E.jsx)(`li`,{children:(0,E.jsxs)(u,{to:`/map`,style:{color:`rgba(255,255,255,0.7)`,textDecoration:`none`},children:[(0,E.jsx)(`i`,{className:`fas fa-chevron-right`,style:{fontSize:10,marginRight:6,color:`#D4AF37`}}),` `,e(`home.interactive_map`)]})}),(0,E.jsx)(`li`,{children:(0,E.jsxs)(u,{to:o,style:{color:`rgba(255,255,255,0.7)`,textDecoration:`none`},children:[(0,E.jsx)(`i`,{className:`fas fa-chevron-right`,style:{fontSize:10,marginRight:6,color:`#D4AF37`}}),` `,e(`home.publish_listing`)]})})]})]}),(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`h5`,{style:{fontFamily:`Poppins`,fontSize:14,fontWeight:700,color:`#FFF`,marginBottom:12},children:e(`home.contact_support`)}),(0,E.jsxs)(`p`,{style:{fontSize:13,color:`rgba(255,255,255,0.7)`,margin:`0 0 6px`},children:[(0,E.jsx)(`i`,{className:`fas fa-map-marker-alt`,style:{marginRight:8,color:`#D4AF37`}}),` Yaoundé & Douala, Cameroun`]}),(0,E.jsxs)(`p`,{style:{fontSize:13,color:`rgba(255,255,255,0.7)`,margin:0},children:[(0,E.jsx)(`i`,{className:`fas fa-comments`,style:{marginRight:8,color:`#D4AF37`}}),` `,e(`home.support_desc`)]})]})]}),(0,E.jsxs)(`div`,{style:{maxWidth:1280,margin:`0 auto`,borderTop:`1px solid rgba(255,255,255,0.1)`,paddingTop:16,textAlign:`center`,fontSize:12,color:`rgba(255,255,255,0.45)`},children:[`© `,new Date().getFullYear(),` Piolo. Tous droits réservés.`]})]}),(0,E.jsx)(se,{isOpen:Te,onClose:()=>G(!1),filters:K,onChange:e=>q(t=>({...t,...e})),onApply:ze,onReset:Be}),be&&(0,E.jsx)(pe,{pro:be,currentUser:r,onClose:()=>xe(null),onSelectProject:e=>N(e),onRequestQuote:e=>U(e)}),M&&(0,E.jsx)(fe,{project:M,currentUser:r,onClose:()=>N(null),onRequestQuote:e=>{N(null),U(e.author||be||e,e)},onOrderEscrow:e=>{N(null),W(e)}}),P&&(0,E.jsx)(ue,{proData:P,projectData:Se,onClose:()=>{F(null),I(null)},onSubmitSuccess:e=>{alert(`Votre demande de devis a été transmise avec succès à l'artisan.`),F(null),I(null)}}),L&&(0,E.jsx)(`div`,{style:{position:`fixed`,inset:0,background:`rgba(15,13,9,0.85)`,backdropFilter:`blur(8px)`,zIndex:5e4,display:`flex`,alignItems:`center`,justifyContent:`center`,padding:16},children:(0,E.jsx)(`div`,{style:{width:`100%`,maxWidth:760,maxHeight:`92vh`,overflowY:`auto`},children:(0,E.jsx)(me,{onClose:()=>R(!1),onRequestQuote:()=>{R(!1),U({name:`Projet Travaux & Rénovation`})}})})}),z&&(0,E.jsx)(de,{projectData:z,onClose:()=>B(null),onSuccess:()=>{alert(`Commande sécurisée initiée avec succès !`),B(null)}}),V&&(0,E.jsxs)(`div`,{role:`dialog`,"aria-modal":`true`,"aria-label":`Vue agrandie de la photo`,style:{position:`fixed`,inset:0,background:`rgba(5,4,3,0.97)`,backdropFilter:`blur(12px)`,zIndex:6e4,display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,padding:`16px`},onClick:()=>H(null),children:[(0,E.jsx)(`button`,{onClick:()=>H(null),style:{position:`absolute`,top:18,right:18,background:`rgba(255,255,255,0.1)`,border:`1px solid rgba(255,255,255,0.25)`,color:`#FFF`,width:44,height:44,borderRadius:`50%`,cursor:`pointer`,fontSize:18,display:`flex`,alignItems:`center`,justifyContent:`center`,backdropFilter:`blur(8px)`,boxShadow:`0 4px 18px rgba(0,0,0,0.4)`,zIndex:2,transition:`background 0.2s`},"aria-label":`Fermer`,onMouseEnter:e=>e.currentTarget.style.background=`rgba(255,255,255,0.22)`,onMouseLeave:e=>e.currentTarget.style.background=`rgba(255,255,255,0.1)`,children:(0,E.jsx)(`i`,{className:`fas fa-times`})}),(0,E.jsx)(`img`,{src:V.src,alt:V.title,onClick:e=>e.stopPropagation(),style:{maxWidth:`92vw`,maxHeight:`80vh`,objectFit:`contain`,borderRadius:14,boxShadow:`0 24px 80px rgba(0,0,0,0.7)`,border:`1.5px solid rgba(212,175,55,0.18)`,animation:`lightboxFadeIn 0.28s cubic-bezier(0.34,1.56,0.64,1)`}}),(V.title||V.caption)&&(0,E.jsxs)(`div`,{onClick:e=>e.stopPropagation(),style:{marginTop:20,textAlign:`center`,color:`rgba(255,255,255,0.9)`,maxWidth:560},children:[V.title&&(0,E.jsx)(`div`,{style:{fontFamily:`Poppins, sans-serif`,fontWeight:800,fontSize:16,marginBottom:6},children:V.title}),V.caption&&(0,E.jsx)(`div`,{style:{fontSize:12.5,color:`rgba(255,255,255,0.55)`,letterSpacing:`0.2px`},children:V.caption})]}),(0,E.jsxs)(`div`,{style:{position:`absolute`,bottom:18,left:`50%`,transform:`translateX(-50%)`,fontSize:11,color:`rgba(255,255,255,0.3)`},children:[`Appuyer sur `,(0,E.jsx)(`kbd`,{style:{background:`rgba(255,255,255,0.1)`,border:`1px solid rgba(255,255,255,0.2)`,padding:`1px 6px`,borderRadius:4},children:`Échap`}),` ou cliquer en dehors pour fermer`]}),(0,E.jsx)(`style`,{children:`
            @keyframes lightboxFadeIn {
              from { opacity: 0; transform: scale(0.88); }
              to   { opacity: 1; transform: scale(1); }
            }
            .pro-btp-project-card:hover .btp-zoom-icon { opacity: 1 !important; }
          `})]})]})}var _e=()=>(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z`})}),ve=()=>(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z`})}),k=({size:e=30})=>(0,E.jsxs)(`svg`,{width:e,height:e,viewBox:`0 0 34 34`,fill:`none`,children:[(0,E.jsx)(`rect`,{width:`34`,height:`34`,rx:`9`,fill:`rgba(212,175,55,.14)`}),(0,E.jsx)(`path`,{d:`M17 5L4 15v16h10v-9h6v9h10V15L17 5z`,fill:`#D4AF37`}),(0,E.jsx)(`path`,{d:`M17 5L4 15v16h10v-9h6v9h10V15L17 5z`,fill:`url(#lg_login)`,opacity:`.45`}),(0,E.jsx)(`defs`,{children:(0,E.jsxs)(`linearGradient`,{id:`lg_login`,x1:`4`,y1:`5`,x2:`30`,y2:`31`,children:[(0,E.jsx)(`stop`,{stopColor:`#F6D365`}),(0,E.jsx)(`stop`,{offset:`1`,stopColor:`#D4AF37`,stopOpacity:`0`})]})})]}),A=()=>(0,E.jsx)(`svg`,{width:`9`,height:`9`,viewBox:`0 0 24 24`,fill:`currentColor`,style:{color:`var(--noir)`},children:(0,E.jsx)(`path`,{d:`M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z`})});function j(){let{t:e}=te(),{login:t,isAuthenticated:i,user:a,establishSession:o}=ie(),s=ee(),c=n(),[l]=r(),u=(()=>{let e=c.state?.from?.pathname||`/dashboard`;return e===`/dashboard`||e===`/unauthorized`||e===`/login`||e.startsWith(`/dashboard/`)?i&&a?{LOCATAIRE:`/dashboard/locataire`,BAILLEUR:`/dashboard/bailleur`,ARCHITECTE:`/dashboard/pro`,PROFESSIONNEL:`/dashboard/pro`,ADMIN:`/dashboard/admin`}[a.role]||`/properties`:`/dashboard`:e})(),d=l.get(`tab`),f=l.get(`role`),h=l.get(`social_code`),re=c.pathname===`/register`||c.pathname===`/inscription`,[g,_]=(0,w.useState)(d===`choose_role`||d===`choose-role`?`choose-role`:d===`forgot`?`forgot`:`auth`),[v,ae]=(0,w.useState)(d===`register`||re?`register`:`login`),[y,b]=(0,w.useState)(f||`LOCATAIRE`),[x,oe]=(0,w.useState)(!1);(0,w.useEffect)(()=>{_(d===`choose_role`||d===`choose-role`?`choose-role`:d===`forgot`?`forgot`:`auth`),d===`register`||re?ae(`register`):d===`login`&&ae(`login`)},[d,c.pathname,re]);let[S,se]=(0,w.useState)(`LOCATAIRE`),[ce,le]=(0,w.useState)(!1),[C,ue]=(0,w.useState)(``),[de,fe]=(0,w.useState)(``),[pe,me]=(0,w.useState)(``),[T,he]=(0,w.useState)(``),[D,ge]=(0,w.useState)(``),[O,j]=(0,w.useState)(``),[ye,be]=(0,w.useState)(``),[xe,M]=(0,w.useState)(!1),[N,P]=(0,w.useState)(``),[F,Se]=(0,w.useState)(!1),[I,L]=(0,w.useState)(1),[R,z]=(0,w.useState)({first_name:``,last_name:``,email:``,phone:``,password:``,document_type:`CNI`,document_number:``,cni_recto:null,cni_verso:null,selfie:null,city:`Yaoundé`,neighborhoods:``,property_count:2,property_types:[`Appartements`],description:``}),[B,V]=(0,w.useState)([``,``,``,``,``,``]),[H,Ce]=(0,w.useState)(60),[we,U]=(0,w.useState)(!1),[W,Te]=(0,w.useState)(!1),[G,K]=(0,w.useState)(!1),[q,J]=(0,w.useState)(``),[Y,X]=(0,w.useState)({}),Z=[(0,w.useRef)(),(0,w.useRef)(),(0,w.useRef)(),(0,w.useRef)(),(0,w.useRef)(),(0,w.useRef)()],Ee=(0,w.useRef)(null);(0,w.useEffect)(()=>{i&&g!==`choose-role`&&!h&&s(u,{replace:!0})},[i,s,u,g,h]),(0,w.useEffect)(()=>{!h||Ee.current===h||(Ee.current=h,K(!0),J(``),m.socialExchange(h).then(({data:e})=>{o(e);let t=new URL(window.location.href);if(t.searchParams.delete(`social_code`),window.history.replaceState({},``,t.toString()),e.needs_role_selection){_(`choose-role`),K(!1);return}s({LOCATAIRE:`/dashboard/locataire`,BAILLEUR:`/dashboard/bailleur`,ARCHITECTE:`/dashboard/pro`,PROFESSIONNEL:`/dashboard/pro`,ADMIN:`/dashboard/admin`}[e.user?.role]||`/dashboard`,{replace:!0})}).catch(e=>{J(e.response?.data?.detail||`La connexion sociale a échoué. Réessayez.`);let t=new URL(window.location.href);t.searchParams.delete(`social_code`),window.history.replaceState({},``,t.toString())}).finally(()=>K(!1)))},[h,o,s]),(0,w.useEffect)(()=>{let e;return g===`bailleur`&&I===2&&H>0&&(e=setTimeout(()=>Ce(H-1),1e3)),()=>clearTimeout(e)},[g,I,H]);let De=e=>{ae(e),J(``),X({})},Oe=e=>{b(e),J(``),X({})},ke=async e=>{let t=e||S;le(!0),J(``);try{let{data:e}=await m.setRole(t);o({access:localStorage.getItem(`piolo_access`),refresh:localStorage.getItem(`piolo_refresh`),user:e.user}),sessionStorage.setItem(`piolo_is_new_registration`,`true`),s({LOCATAIRE:`/dashboard/locataire`,BAILLEUR:`/dashboard/bailleur`,ARCHITECTE:`/dashboard/pro`,PROFESSIONNEL:`/dashboard/pro`,ADMIN:`/dashboard/admin`}[t]||`/dashboard`,{replace:!0})}catch(e){J(e.response?.data?.detail||`Erreur lors de la configuration du profil.`)}finally{le(!1)}},Ae=async e=>{e&&e.preventDefault(),X({}),J(``);let n=!0,r={};if((!C||!/\S+@\S+\.\S+/.test(C))&&(r.email=`Adresse email invalide.`,n=!1),de||(r.password=`Mot de passe requis.`,n=!1),!n){X(r);return}K(!0);try{let e={LOCATAIRE:`/dashboard/locataire`,BAILLEUR:`/dashboard/bailleur`,ARCHITECTE:`/dashboard/pro`,PROFESSIONNEL:`/dashboard/pro`,ADMIN:`/dashboard/admin`}[(await t(C,de))?.role],n=c.state?.from?.pathname,r=n&&!n.startsWith(`/dashboard`)&&n!==`/login`&&n!==`/unauthorized`?n:e||u||`/dashboard`;sessionStorage.removeItem(`piolo_is_new_registration`),s(r,{replace:!0})}catch(e){J(e.response?.data?.detail||e.response?.data?.error||`Erreur de connexion.`)}finally{K(!1)}},je=async e=>{e&&e.preventDefault(),X({}),J(``);let n=!0,r={};if((!pe||!T)&&(J(`Prénom et nom sont requis.`),n=!1),(!D||!/\S+@\S+\.\S+/.test(D))&&(r.email=`Email invalide.`,n=!1),(!O||O.length<8)&&(r.password=`Minimum 8 caractères.`,n=!1),O!==ye&&(r.password_confirm=`Les mots de passe ne correspondent pas.`,n=!1),xe||(J(`Veuillez accepter les conditions d'utilisation.`),n=!1),!n){X(r);return}K(!0);try{await m.register({first_name:pe.trim(),last_name:T.trim(),email:D.trim(),password:O,role:y===`PROFESSIONNEL`?`ARCHITECTE`:y}),sessionStorage.setItem(`piolo_is_new_registration`,`true`),await t(D.trim(),O),_(`success-loc`)}catch(e){let t=e.response?.data;if(t&&typeof t==`object`){let e={},n=``;Object.entries(t).forEach(([t,r])=>{let i=Array.isArray(r)?r.join(` `):typeof r==`string`?r:JSON.stringify(r);e[t]=i,!n&&t!==`detail`&&t!==`error`&&(n=i)}),X(e),J(t.detail||t.error||n||`Erreur lors de l'inscription.`)}else J(e.message||`Erreur lors de l'inscription.`)}finally{K(!1)}},Me=async e=>{if(e&&e.preventDefault(),!N||!/\S+@\S+\.\S+/.test(N)){J(`Saisissez une adresse email valide.`);return}K(!0),J(``),Se(!1);try{await m.forgotPassword({email:N}),Se(!0)}catch(e){J(e.response?.data?.detail||e.response?.data?.error||`Le service d'email est temporairement indisponible. Réessayez dans quelques instants.`)}finally{K(!1)}},Ne=()=>{_(`bailleur`),L(1),J(``),X({})},Pe=()=>{X({}),J(``);let e=!0,t={};if(R.first_name||(t.first_name=`Prénom requis.`,e=!1),R.last_name||(t.last_name=`Nom requis.`,e=!1),(!R.email||!/\S+@\S+\.\S+/.test(R.email))&&(t.email=`Email invalide.`,e=!1),R.phone||(t.phone=`Téléphone requis.`,e=!1),(!R.password||R.password.length<8)&&(t.password=`Minimum 8 caractères.`,e=!1),!e){X(t);return}Ce(60),L(2)},Fe=(e,t)=>{if(!/^\d*$/.test(t))return;let n=[...B];n[e]=t.slice(-1),V(n),t&&e<5&&Z[e+1].current?.focus()},Ie=(e,t)=>{t.key===`Backspace`&&!B[e]&&e>0&&Z[e-1].current?.focus()},Le=()=>{if(B.join(``).length<6){J(`Saisissez les 6 chiffres du code OTP.`);return}J(``),L(3)},Re=e=>{let t=R.property_types.includes(e)?R.property_types.filter(t=>t!==e):[...R.property_types,e];z({...R,property_types:t})},[Q,ze]=(0,w.useState)({}),[Be,$]=(0,w.useState)(``),Ve=async(e,t)=>{if(t){ze(t=>({...t,[e]:!0})),J(``);try{let n=await p(t);z(t=>({...t,[e]:n}))}catch(n){console.warn(`Erreur compression KYC, conservation fichier brut:`,n),z(n=>({...n,[e]:t}))}finally{ze(t=>({...t,[e]:!1}))}}},He=async()=>{if(J(``),!we||!W){J(`Veuillez cocher les deux cases de certification et de conditions.`);return}K(!0),$(`Optimisation des photos…`);try{let e=R.cni_recto?await p(R.cni_recto):null,t=R.cni_verso?await p(R.cni_verso):null,n=R.selfie?await p(R.selfie):null;$(`Envoi sécurisé du dossier…`);let r=new FormData;r.append(`first_name`,R.first_name),r.append(`last_name`,R.last_name),r.append(`email`,R.email),r.append(`phone`,R.phone),r.append(`password`,R.password),r.append(`role`,`BAILLEUR`),r.append(`document_type`,R.document_type),r.append(`document_number`,R.document_number),r.append(`city`,R.city),r.append(`neighborhoods`,R.neighborhoods),r.append(`property_count`,R.property_count),r.append(`property_types`,R.property_types.join(`, `)),r.append(`description`,R.description),e&&r.append(`cni_recto`,e),t&&r.append(`cni_verso`,t),n&&r.append(`selfie`,n),await m.register(r),sessionStorage.setItem(`piolo_is_new_registration`,`true`),_(`success-bail`)}catch(e){J(e.response?.data?.detail||e.response?.data?.error||`Erreur lors de la soumission du dossier.`)}finally{K(!1),$(``)}},Ue=async e=>{let t=e.toLowerCase();if(![`google`,`facebook`].includes(t)){J(`Connexion via ${e} indisponible.`);return}K(!0),J(``);try{let{data:n}=await m.socialStatus(t);if(!n.configured){J(`La connexion ${e} n'est pas encore configurée.`),K(!1);return}}catch{}finally{K(!1)}let n=window.location.port===`3000`?`http://localhost:8080`:``,r=v===`register`?`1`:`0`,i=v===`register`&&y?`&role=${encodeURIComponent(y)}`:``;window.location.assign(`${n}/social/${t}/login/?process=login&is_signup=${r}${i}`)};return(0,E.jsxs)(`div`,{className:`auth-page-root`,children:[(0,E.jsx)(`div`,{className:`auth-bg`}),(0,E.jsxs)(`div`,{id:`app`,children:[g===`auth`&&(0,E.jsx)(`div`,{className:`screen active`,id:`s-auth`,children:(0,E.jsxs)(`div`,{className:`auth-card`,children:[(0,E.jsxs)(`div`,{className:`logo-row`,children:[(0,E.jsx)(k,{}),(0,E.jsx)(`span`,{className:`logo-txt`,children:`Piolo`})]}),(0,E.jsx)(`p`,{className:`logo-tag`,children:e(`auth.tagline`)}),(0,E.jsxs)(`div`,{className:`tabs`,children:[(0,E.jsx)(`button`,{className:`tab-btn ${v===`login`?`active`:``}`,onClick:()=>De(`login`),children:e(`auth.sign_in`)}),(0,E.jsx)(`button`,{className:`tab-btn ${v===`register`?`active`:``}`,onClick:()=>De(`register`),children:e(`auth.sign_up`)})]}),q&&(0,E.jsxs)(`div`,{className:`alert alert-err`,style:{display:`flex`},children:[(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z`})}),q]}),v===`login`&&(0,E.jsxs)(`div`,{id:`panel-login`,children:[(0,E.jsx)(`h1`,{className:`card-title`,children:e(`auth.sign_in_title`)}),(0,E.jsx)(`p`,{className:`card-sub`,children:e(`auth.sign_in_sub`)}),(0,E.jsxs)(`div`,{className:`field`,children:[(0,E.jsx)(`label`,{className:`field-label`,htmlFor:`l-email`,children:e(`auth.email`)}),(0,E.jsxs)(`div`,{className:`field-wrap`,children:[(0,E.jsx)(`svg`,{className:`field-ico`,viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z`})}),(0,E.jsx)(`input`,{className:`field-input ${Y.email?`err`:``}`,id:`l-email`,type:`email`,placeholder:`votre@email.com`,value:C,onChange:e=>ue(e.target.value),autoComplete:`email`})]}),Y.email&&(0,E.jsx)(`div`,{className:`field-err`,style:{display:`block`},children:Y.email})]}),(0,E.jsxs)(`div`,{className:`field`,children:[(0,E.jsx)(`a`,{className:`forgot-link`,onClick:()=>{_(`forgot`),J(``),Se(!1)},children:e(`auth.forgot_password`)}),(0,E.jsx)(`label`,{className:`field-label`,htmlFor:`l-pwd`,children:e(`auth.password`)}),(0,E.jsxs)(`div`,{className:`field-wrap`,children:[(0,E.jsx)(`svg`,{className:`field-ico`,viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z`})}),(0,E.jsx)(`input`,{className:`field-input ${Y.password?`err`:``}`,id:`l-pwd`,type:x?`text`:`password`,placeholder:`••••••••`,style:{paddingRight:42},value:de,onChange:e=>fe(e.target.value),autoComplete:`current-password`}),(0,E.jsx)(`button`,{className:`eye-btn`,type:`button`,onClick:()=>oe(!x),children:x?(0,E.jsx)(ve,{}):(0,E.jsx)(_e,{})})]}),Y.password&&(0,E.jsx)(`div`,{className:`field-err`,style:{display:`block`},children:Y.password})]}),(0,E.jsxs)(`button`,{className:`btn-primary`,id:`btn-login`,disabled:G,onClick:Ae,children:[(0,E.jsx)(`svg`,{width:`16`,height:`16`,fill:`currentColor`,viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M10 17l5-5-5-5v10z`})}),G?(0,E.jsx)(`div`,{className:`spinner`}):e(`auth.sign_in_btn`)]}),(0,E.jsxs)(`div`,{className:`divider`,children:[(0,E.jsx)(`div`,{className:`div-line`}),(0,E.jsx)(`span`,{className:`div-txt`,children:e(`auth.or_sign_in_with`)}),(0,E.jsx)(`div`,{className:`div-line`})]}),(0,E.jsxs)(`div`,{className:`social-row`,children:[(0,E.jsxs)(`button`,{className:`btn-social btn-fb`,type:`button`,onClick:()=>Ue(`Facebook`),children:[(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,fill:`#fff`,children:(0,E.jsx)(`path`,{d:`M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z`})}),`Facebook`]}),(0,E.jsxs)(`button`,{className:`btn-social btn-gg`,type:`button`,onClick:()=>Ue(`Google`),children:[(0,E.jsxs)(`svg`,{viewBox:`0 0 24 24`,children:[(0,E.jsx)(`path`,{d:`M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z`,fill:`#4285F4`}),(0,E.jsx)(`path`,{d:`M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z`,fill:`#34A853`}),(0,E.jsx)(`path`,{d:`M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z`,fill:`#FBBC05`}),(0,E.jsx)(`path`,{d:`M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z`,fill:`#EA4335`})]}),`Google`]})]}),(0,E.jsxs)(`p`,{className:`switch-row`,children:[e(`auth.no_account`),` `,(0,E.jsx)(`a`,{className:`switch-link`,onClick:()=>De(`register`),children:e(`auth.sign_up`)})]})]}),v===`register`&&(0,E.jsxs)(`div`,{id:`panel-register`,children:[(0,E.jsx)(`h1`,{className:`card-title`,children:e(`auth.sign_up_title`)}),(0,E.jsx)(`p`,{className:`card-sub`,children:e(`auth.sign_up_sub`)}),(0,E.jsx)(`p`,{className:`sec-lbl`,children:e(`auth.iam`)}),(0,E.jsxs)(`div`,{className:`role-grid`,children:[(0,E.jsxs)(`button`,{className:`role-btn ${y===`LOCATAIRE`?`active`:``}`,onClick:()=>Oe(`LOCATAIRE`),children:[(0,E.jsx)(`div`,{className:`role-icon-box`,children:(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z`})})}),(0,E.jsx)(`div`,{className:`role-name`,children:e(`auth.role_locataire_name`)}),(0,E.jsx)(`div`,{className:`role-desc`,children:e(`auth.role_locataire_desc`)}),(0,E.jsx)(`div`,{className:`role-check`,children:y===`LOCATAIRE`&&(0,E.jsx)(A,{})})]}),(0,E.jsxs)(`button`,{className:`role-btn ${y===`BAILLEUR`?`active`:``}`,onClick:()=>Oe(`BAILLEUR`),children:[(0,E.jsx)(`div`,{className:`role-icon-box`,children:(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z`})})}),(0,E.jsx)(`div`,{className:`role-name`,children:e(`auth.role_bailleur_name`)}),(0,E.jsx)(`div`,{className:`role-desc`,children:e(`auth.role_bailleur_desc`)}),(0,E.jsx)(`div`,{className:`role-check`,children:y===`BAILLEUR`&&(0,E.jsx)(A,{})})]}),(0,E.jsxs)(`button`,{className:`role-btn ${y===`ARCHITECTE`||y===`PROFESSIONNEL`?`active`:``}`,onClick:()=>Oe(`ARCHITECTE`),children:[(0,E.jsx)(`div`,{className:`role-icon-box`,children:(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z`})})}),(0,E.jsx)(`div`,{className:`role-name`,children:e(`auth.role_pro_name`)}),(0,E.jsx)(`div`,{className:`role-desc`,children:e(`auth.role_pro_desc`)}),(0,E.jsx)(`div`,{className:`role-check`,children:(y===`ARCHITECTE`||y===`PROFESSIONNEL`)&&(0,E.jsx)(A,{})})]})]}),y===`BAILLEUR`&&(0,E.jsxs)(E.Fragment,{children:[(0,E.jsxs)(`div`,{className:`info-box bl`,children:[(0,E.jsx)(`div`,{className:`ib-ico`,children:(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z`})})}),(0,E.jsxs)(`p`,{className:`ib-txt`,children:[(0,E.jsxs)(`strong`,{children:[e(`auth.bailleur_notice`).split(`:`)[0],`:`]}),e(`auth.bailleur_notice`).split(`:`).slice(1).join(`:`)]})]}),(0,E.jsx)(`div`,{id:`form-bailleur-cta`,children:(0,E.jsxs)(`button`,{className:`btn-primary`,onClick:Ne,children:[(0,E.jsx)(`svg`,{width:`16`,height:`16`,fill:`currentColor`,viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z`})}),e(`auth.start_bailleur`)]})})]}),y!==`BAILLEUR`&&(0,E.jsxs)(`div`,{id:`form-std`,children:[(0,E.jsxs)(`div`,{className:`field-row`,children:[(0,E.jsxs)(`div`,{className:`field`,children:[(0,E.jsx)(`label`,{className:`field-label`,children:e(`auth.first_name`)}),(0,E.jsxs)(`div`,{className:`field-wrap`,children:[(0,E.jsx)(`svg`,{className:`field-ico`,viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z`})}),(0,E.jsx)(`input`,{className:`field-input`,type:`text`,placeholder:`Jean`,value:pe,onChange:e=>me(e.target.value)})]})]}),(0,E.jsxs)(`div`,{className:`field`,children:[(0,E.jsx)(`label`,{className:`field-label`,children:e(`auth.last_name`)}),(0,E.jsxs)(`div`,{className:`field-wrap`,children:[(0,E.jsx)(`svg`,{className:`field-ico`,viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z`})}),(0,E.jsx)(`input`,{className:`field-input`,type:`text`,placeholder:`Kamdem`,value:T,onChange:e=>he(e.target.value)})]})]})]}),(0,E.jsxs)(`div`,{className:`field`,children:[(0,E.jsx)(`label`,{className:`field-label`,children:e(`auth.email`)}),(0,E.jsxs)(`div`,{className:`field-wrap`,children:[(0,E.jsx)(`svg`,{className:`field-ico`,viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z`})}),(0,E.jsx)(`input`,{className:`field-input ${Y.email?`err`:``}`,type:`email`,placeholder:`jean@email.com`,value:D,onChange:e=>ge(e.target.value)})]}),Y.email&&(0,E.jsx)(`div`,{className:`field-err`,style:{display:`block`},children:Y.email})]}),(0,E.jsxs)(`div`,{className:`field`,children:[(0,E.jsx)(`label`,{className:`field-label`,children:e(`auth.password`)}),(0,E.jsxs)(`div`,{className:`field-wrap`,children:[(0,E.jsx)(`svg`,{className:`field-ico`,viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z`})}),(0,E.jsx)(`input`,{className:`field-input ${Y.password?`err`:``}`,type:x?`text`:`password`,placeholder:`Min. 8 caractères`,style:{paddingRight:42},value:O,onChange:e=>j(e.target.value)}),(0,E.jsx)(`button`,{className:`eye-btn`,type:`button`,onClick:()=>oe(!x),children:x?(0,E.jsx)(ve,{}):(0,E.jsx)(_e,{})})]}),Y.password&&(0,E.jsx)(`div`,{className:`field-err`,style:{display:`block`},children:Y.password})]}),(0,E.jsxs)(`div`,{className:`field`,children:[(0,E.jsx)(`label`,{className:`field-label`,children:e(`auth.confirm_password`)}),(0,E.jsxs)(`div`,{className:`field-wrap`,children:[(0,E.jsx)(`svg`,{className:`field-ico`,viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z`})}),(0,E.jsx)(`input`,{className:`field-input`,type:x?`text`:`password`,placeholder:`Répétez le mot de passe`,value:ye,onChange:e=>be(e.target.value)})]}),Y.password_confirm&&(0,E.jsx)(`div`,{className:`field-err`,style:{display:`block`},children:Y.password_confirm})]}),(0,E.jsxs)(`div`,{className:`check-row`,children:[(0,E.jsx)(`div`,{className:`check-box ${xe?`checked`:``}`,onClick:()=>M(!xe)}),(0,E.jsxs)(`p`,{className:`check-txt`,children:[e(`auth.accept_terms`),` `,(0,E.jsx)(`a`,{href:`#`,children:e(`auth.terms_link`)}),` `,e(`auth.and`),` `,(0,E.jsx)(`a`,{href:`#`,children:e(`auth.privacy_link`)})]})]}),(0,E.jsxs)(`button`,{className:`btn-primary`,disabled:G,onClick:je,children:[(0,E.jsx)(`svg`,{width:`16`,height:`16`,fill:`currentColor`,viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z`})}),G?(0,E.jsx)(`div`,{className:`spinner`}):e(`auth.create_account_btn`)]})]}),(0,E.jsxs)(`div`,{className:`divider`,children:[(0,E.jsx)(`div`,{className:`div-line`}),(0,E.jsx)(`span`,{className:`div-txt`,children:e(`auth.or_sign_up_with`)}),(0,E.jsx)(`div`,{className:`div-line`})]}),(0,E.jsxs)(`div`,{className:`social-row`,children:[(0,E.jsxs)(`button`,{className:`btn-social btn-fb`,type:`button`,onClick:()=>Ue(`Facebook`),children:[(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,fill:`#fff`,children:(0,E.jsx)(`path`,{d:`M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z`})}),`Facebook`]}),(0,E.jsxs)(`button`,{className:`btn-social btn-gg`,type:`button`,onClick:()=>Ue(`Google`),children:[(0,E.jsxs)(`svg`,{viewBox:`0 0 24 24`,children:[(0,E.jsx)(`path`,{d:`M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z`,fill:`#4285F4`}),(0,E.jsx)(`path`,{d:`M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z`,fill:`#34A853`}),(0,E.jsx)(`path`,{d:`M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z`,fill:`#FBBC05`}),(0,E.jsx)(`path`,{d:`M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z`,fill:`#EA4335`})]}),`Google`]})]}),(0,E.jsxs)(`p`,{className:`switch-row`,children:[e(`auth.already_account`),` `,(0,E.jsx)(`a`,{className:`switch-link`,onClick:()=>De(`login`),children:e(`auth.sign_in`)})]})]}),(0,E.jsxs)(`div`,{className:`card-footer`,children:[`© 2025 Piolo`,(0,E.jsx)(`a`,{href:`#`,children:e(`auth.footer_privacy`)}),(0,E.jsx)(`a`,{href:`#`,children:e(`auth.footer_terms`)})]})]})}),g===`bailleur`&&(0,E.jsx)(`div`,{className:`screen active`,id:`s-bailleur`,children:(0,E.jsxs)(`div`,{className:`auth-card`,style:{maxWidth:460,margin:`0 auto`},children:[(0,E.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,marginBottom:20},children:[(0,E.jsxs)(`div`,{className:`logo-row`,style:{marginBottom:0},children:[(0,E.jsx)(k,{size:24}),(0,E.jsx)(`span`,{style:{fontFamily:`Poppins,sans-serif`,fontSize:16,fontWeight:800,color:`var(--noir)`},children:`Piolo`})]}),(0,E.jsx)(`span`,{style:{fontFamily:`Poppins,sans-serif`,fontSize:11,fontWeight:700,color:`var(--or-d)`,background:`rgba(212,175,55,.1)`,padding:`4px 10px`,borderRadius:20},children:e(`auth.bailleur_register`)})]}),(0,E.jsx)(`div`,{className:`stepper`,id:`bail-stepper`,children:[{n:1,label:e(`auth.step_identity`)},{n:2,label:e(`auth.step_sms`)},{n:3,label:e(`auth.step_docs`)},{n:4,label:e(`auth.step_assets`)},{n:5,label:e(`auth.step_submit`)}].map((e,t)=>(0,E.jsxs)(w.Fragment,{children:[t>0&&(0,E.jsx)(`div`,{className:`step-line ${e.n<=I?`done`:``}`}),(0,E.jsxs)(`div`,{className:`step-item`,children:[(0,E.jsx)(`div`,{className:`step-circle ${e.n<I?`done`:e.n===I?`active`:``}`,children:e.n<I?(0,E.jsx)(`svg`,{width:`12`,height:`12`,viewBox:`0 0 24 24`,fill:`currentColor`,children:(0,E.jsx)(`path`,{d:`M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z`})}):e.n}),(0,E.jsx)(`span`,{className:`step-lbl ${e.n===I?`active`:``}`,children:e.label})]})]},e.n))}),(0,E.jsx)(`div`,{className:`step-prog-bar`,children:(0,E.jsx)(`div`,{className:`step-prog-fill`,style:{width:`${I/5*100}%`}})}),q&&(0,E.jsxs)(`div`,{className:`alert alert-err`,style:{display:`flex`},children:[(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z`})}),q]}),I===1&&(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`h2`,{className:`card-title`,children:e(`auth.step1_title`)}),(0,E.jsx)(`p`,{className:`card-sub`,children:e(`auth.step1_sub`)}),(0,E.jsxs)(`div`,{className:`info-box bl`,children:[(0,E.jsx)(`div`,{className:`ib-ico`,children:(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z`})})}),(0,E.jsx)(`p`,{className:`ib-txt`,children:e(`auth.pending_notice`)})]}),(0,E.jsxs)(`div`,{className:`field-row`,children:[(0,E.jsxs)(`div`,{className:`field`,children:[(0,E.jsx)(`label`,{className:`field-label`,children:e(`auth.first_name`)}),(0,E.jsxs)(`div`,{className:`field-wrap`,children:[(0,E.jsx)(`svg`,{className:`field-ico`,viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z`})}),(0,E.jsx)(`input`,{className:`field-input ${Y.first_name?`err`:``}`,type:`text`,placeholder:`Marie-Claire`,value:R.first_name,onChange:e=>z({...R,first_name:e.target.value})})]}),Y.first_name&&(0,E.jsx)(`div`,{className:`field-err`,style:{display:`block`},children:Y.first_name})]}),(0,E.jsxs)(`div`,{className:`field`,children:[(0,E.jsx)(`label`,{className:`field-label`,children:e(`auth.last_name`)}),(0,E.jsxs)(`div`,{className:`field-wrap`,children:[(0,E.jsx)(`svg`,{className:`field-ico`,viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z`})}),(0,E.jsx)(`input`,{className:`field-input ${Y.last_name?`err`:``}`,type:`text`,placeholder:`Nkemdirim`,value:R.last_name,onChange:e=>z({...R,last_name:e.target.value})})]}),Y.last_name&&(0,E.jsx)(`div`,{className:`field-err`,style:{display:`block`},children:Y.last_name})]})]}),(0,E.jsxs)(`div`,{className:`field`,children:[(0,E.jsx)(`label`,{className:`field-label`,children:e(`auth.email`)}),(0,E.jsxs)(`div`,{className:`field-wrap`,children:[(0,E.jsx)(`svg`,{className:`field-ico`,viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z`})}),(0,E.jsx)(`input`,{className:`field-input ${Y.email?`err`:``}`,type:`email`,placeholder:`marie@email.com`,value:R.email,onChange:e=>z({...R,email:e.target.value})})]}),Y.email&&(0,E.jsx)(`div`,{className:`field-err`,style:{display:`block`},children:Y.email})]}),(0,E.jsxs)(`div`,{className:`field`,children:[(0,E.jsxs)(`label`,{className:`field-label`,children:[e(`auth.phone`),` `,(0,E.jsx)(`span`,{style:{color:`var(--gris-m)`,fontWeight:400},children:e(`auth.phone_otp_hint`)})]}),(0,E.jsxs)(`div`,{className:`field-wrap`,children:[(0,E.jsx)(`svg`,{className:`field-ico`,viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z`})}),(0,E.jsx)(`input`,{className:`field-input ${Y.phone?`err`:``}`,type:`tel`,placeholder:`+237 6XX XXX XXX`,value:R.phone,onChange:e=>z({...R,phone:e.target.value})})]}),Y.phone&&(0,E.jsx)(`div`,{className:`field-err`,style:{display:`block`},children:Y.phone})]}),(0,E.jsxs)(`div`,{className:`field`,children:[(0,E.jsx)(`label`,{className:`field-label`,children:e(`auth.password`)}),(0,E.jsxs)(`div`,{className:`field-wrap`,children:[(0,E.jsx)(`svg`,{className:`field-ico`,viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z`})}),(0,E.jsx)(`input`,{className:`field-input ${Y.password?`err`:``}`,type:x?`text`:`password`,placeholder:`Min. 8 caractères`,style:{paddingRight:42},value:R.password,onChange:e=>z({...R,password:e.target.value})}),(0,E.jsx)(`button`,{className:`eye-btn`,type:`button`,onClick:()=>oe(!x),children:x?(0,E.jsx)(ve,{}):(0,E.jsx)(_e,{})})]}),Y.password&&(0,E.jsx)(`div`,{className:`field-err`,style:{display:`block`},children:Y.password})]}),(0,E.jsxs)(`div`,{className:`btn-nav-row`,children:[(0,E.jsx)(`button`,{className:`btn-back`,type:`button`,onClick:()=>_(`auth`),children:e(`auth.cancel_btn`)}),(0,E.jsxs)(`button`,{className:`btn-next`,type:`button`,onClick:Pe,children:[e(`auth.next_btn`),` `,(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M10 17l5-5-5-5v10z`})})]})]})]}),I===2&&(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`h2`,{className:`card-title`,children:e(`auth.step2_title`)}),(0,E.jsx)(`p`,{className:`card-sub`,children:e(`auth.step2_sub`)}),(0,E.jsx)(`div`,{className:`otp-inputs`,children:B.map((e,t)=>(0,E.jsx)(`input`,{ref:Z[t],className:`otp-digit ${e?`filled`:``}`,maxLength:1,inputMode:`numeric`,value:e,onChange:e=>Fe(t,e.target.value),onKeyDown:e=>Ie(t,e)},t))}),(0,E.jsxs)(`p`,{className:`otp-note`,style:{marginBottom:18},children:[e(`auth.otp_not_received`),` `,(0,E.jsxs)(`span`,{className:`otp-resend`,onClick:()=>Ce(60),children:[e(`auth.otp_resend`),` `,(0,E.jsxs)(`span`,{className:`otp-timer-val`,children:[H,`s`]})]})]}),(0,E.jsxs)(`div`,{className:`info-box gn`,children:[(0,E.jsx)(`div`,{className:`ib-ico`,children:(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z`})})}),(0,E.jsx)(`p`,{className:`ib-txt`,children:e(`auth.otp_security`)})]}),(0,E.jsxs)(`div`,{className:`btn-nav-row`,children:[(0,E.jsx)(`button`,{className:`btn-back`,type:`button`,onClick:()=>L(1),children:e(`common.back`)}),(0,E.jsxs)(`button`,{className:`btn-next`,type:`button`,onClick:Le,children:[e(`auth.validate_btn`),` `,(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M10 17l5-5-5-5v10z`})})]})]})]}),I===3&&(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`h2`,{className:`card-title`,children:e(`auth.step3_title`)}),(0,E.jsx)(`p`,{className:`card-sub`,children:e(`auth.step3_sub`)}),(0,E.jsxs)(`div`,{className:`field`,children:[(0,E.jsx)(`label`,{className:`field-label`,children:e(`auth.doc_type`)}),(0,E.jsxs)(`select`,{className:`field-select`,value:R.document_type,onChange:e=>z({...R,document_type:e.target.value}),children:[(0,E.jsx)(`option`,{value:`CNI`,children:e(`auth.doc_cni`)}),(0,E.jsx)(`option`,{value:`PASSEPORT`,children:e(`auth.doc_passport`)}),(0,E.jsx)(`option`,{value:`SEJOUR`,children:e(`auth.doc_permit`)})]})]}),(0,E.jsxs)(`div`,{className:`field`,children:[(0,E.jsx)(`label`,{className:`field-label`,children:e(`auth.doc_number`)}),(0,E.jsxs)(`div`,{className:`field-wrap`,children:[(0,E.jsx)(`svg`,{className:`field-ico`,viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 3h2v2h-2V7zm0 4h2v2h-2v-2zM5 7h8v2H5V7zm0 4h8v2H5v-2zm0 4h14v2H5v-2z`})}),(0,E.jsx)(`input`,{className:`field-input`,type:`text`,placeholder:`CM-12345678-A`,value:R.document_number,onChange:e=>z({...R,document_number:e.target.value})})]})]}),(0,E.jsx)(`p`,{className:`sec-lbl`,children:e(`auth.scan_label`)}),(0,E.jsxs)(`div`,{className:`upload-grid`,children:[(0,E.jsxs)(`div`,{className:`upload-box ${R.cni_recto?`uploaded`:``}`,onClick:()=>document.getElementById(`f-recto`).click(),children:[(0,E.jsx)(`input`,{type:`file`,id:`f-recto`,accept:`.jpg,.jpeg,.png,.pdf`,style:{display:`none`},onChange:e=>Ve(`cni_recto`,e.target.files[0])}),(0,E.jsx)(`div`,{className:`ub-ico`,children:(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z`})})}),(0,E.jsx)(`div`,{className:`ub-title`,children:e(`auth.recto`)}),(0,E.jsx)(`div`,{className:`ub-sub`,children:e(`auth.recto_sub`)}),(0,E.jsx)(`div`,{className:`ub-badge`,children:Q.cni_recto?`⚡ Optimisation…`:R.cni_recto?`✓ ${ne(R.cni_recto.size)}`:e(`auth.upload`)})]}),(0,E.jsxs)(`div`,{className:`upload-box ${R.cni_verso?`uploaded`:``}`,onClick:()=>document.getElementById(`f-verso`).click(),children:[(0,E.jsx)(`input`,{type:`file`,id:`f-verso`,accept:`.jpg,.jpeg,.png,.pdf`,style:{display:`none`},onChange:e=>Ve(`cni_verso`,e.target.files[0])}),(0,E.jsx)(`div`,{className:`ub-ico`,children:(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z`})})}),(0,E.jsx)(`div`,{className:`ub-title`,children:e(`auth.verso`)}),(0,E.jsx)(`div`,{className:`ub-sub`,children:e(`auth.verso_sub`)}),(0,E.jsx)(`div`,{className:`ub-badge`,children:Q.cni_verso?`⚡ Optimisation…`:R.cni_verso?`✓ ${ne(R.cni_verso.size)}`:e(`auth.upload`)})]})]}),(0,E.jsx)(`p`,{className:`sec-lbl`,children:e(`auth.selfie_label`)}),(0,E.jsxs)(`div`,{className:`upload-box solo ${R.selfie?`uploaded`:``}`,onClick:()=>document.getElementById(`f-selfie`).click(),children:[(0,E.jsx)(`input`,{type:`file`,id:`f-selfie`,accept:`.jpg,.jpeg,.png`,style:{display:`none`},onChange:e=>Ve(`selfie`,e.target.files[0])}),(0,E.jsx)(`div`,{className:`ub-ico`,children:(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z`})})}),(0,E.jsx)(`div`,{className:`ub-title`,children:e(`auth.selfie_title`)}),(0,E.jsx)(`div`,{className:`ub-sub`,children:e(`auth.selfie_sub`)}),(0,E.jsx)(`div`,{className:`ub-badge`,children:Q.selfie?`⚡ Optimisation…`:R.selfie?`✓ ${ne(R.selfie.size)}`:e(`auth.take_photo`)})]}),(0,E.jsxs)(`div`,{className:`btn-nav-row`,children:[(0,E.jsx)(`button`,{className:`btn-back`,type:`button`,onClick:()=>L(2),children:e(`common.back`)}),(0,E.jsxs)(`button`,{className:`btn-next`,type:`button`,onClick:()=>L(4),children:[e(`auth.next_btn`),` `,(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M10 17l5-5-5-5v10z`})})]})]})]}),I===4&&(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`h2`,{className:`card-title`,children:e(`auth.step4_title`)}),(0,E.jsx)(`p`,{className:`card-sub`,children:e(`auth.step4_sub`)}),(0,E.jsxs)(`div`,{className:`field`,children:[(0,E.jsx)(`label`,{className:`field-label`,children:e(`auth.main_city`)}),(0,E.jsxs)(`select`,{className:`field-select`,value:R.city,onChange:e=>z({...R,city:e.target.value}),children:[(0,E.jsx)(`option`,{children:`Douala`}),(0,E.jsx)(`option`,{children:`Yaoundé`}),(0,E.jsx)(`option`,{children:`Bafoussam`}),(0,E.jsx)(`option`,{children:`Garoua`}),(0,E.jsx)(`option`,{children:`Maroua`}),(0,E.jsx)(`option`,{children:`Kribi`}),(0,E.jsx)(`option`,{children:`Autre`})]})]}),(0,E.jsxs)(`div`,{className:`field`,children:[(0,E.jsx)(`label`,{className:`field-label`,children:e(`auth.neighborhoods`)}),(0,E.jsxs)(`div`,{className:`field-wrap`,children:[(0,E.jsx)(`svg`,{className:`field-ico`,viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z`})}),(0,E.jsx)(`input`,{className:`field-input`,type:`text`,placeholder:`Bastos, Bonapriso…`,value:R.neighborhoods,onChange:e=>z({...R,neighborhoods:e.target.value})})]})]}),(0,E.jsxs)(`div`,{className:`field`,children:[(0,E.jsx)(`label`,{className:`field-label`,children:e(`auth.property_count`)}),(0,E.jsxs)(`div`,{className:`counter-row`,children:[(0,E.jsx)(`span`,{className:`counter-lbl`,children:e(`auth.property_assets_label`)}),(0,E.jsxs)(`div`,{className:`counter-ctrl`,children:[(0,E.jsx)(`button`,{className:`counter-btn`,type:`button`,onClick:()=>z({...R,property_count:Math.max(1,R.property_count-1)}),children:`−`}),(0,E.jsx)(`span`,{className:`counter-val`,children:R.property_count}),(0,E.jsx)(`button`,{className:`counter-btn`,type:`button`,onClick:()=>z({...R,property_count:R.property_count+1}),children:`+`})]})]})]}),(0,E.jsxs)(`div`,{className:`field`,children:[(0,E.jsx)(`label`,{className:`field-label`,children:e(`auth.property_types`)}),(0,E.jsx)(`div`,{className:`chips`,children:[`Appartements`,`Villas`,`Studios`,`Terrains`,`Bureaux`,`Boutiques`].map(e=>(0,E.jsx)(`span`,{className:`chip ${R.property_types.includes(e)?`active`:``}`,onClick:()=>Re(e),children:e},e))})]}),(0,E.jsxs)(`div`,{className:`field`,children:[(0,E.jsx)(`label`,{className:`field-label`,children:e(`auth.description`)}),(0,E.jsx)(`textarea`,{className:`field-textarea`,rows:`3`,placeholder:`Ex : 3 appartements à Bastos loués 80 000–120 000 FCFA/mois…`,value:R.description,onChange:e=>z({...R,description:e.target.value})})]}),(0,E.jsxs)(`div`,{className:`btn-nav-row`,children:[(0,E.jsx)(`button`,{className:`btn-back`,type:`button`,onClick:()=>L(3),children:e(`common.back`)}),(0,E.jsxs)(`button`,{className:`btn-next`,type:`button`,onClick:()=>L(5),children:[e(`auth.summary_btn`),` `,(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M10 17l5-5-5-5v10z`})})]})]})]}),I===5&&(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`h2`,{className:`card-title`,children:e(`auth.step5_title`)}),(0,E.jsx)(`p`,{className:`card-sub`,children:e(`auth.step5_sub`)}),(0,E.jsxs)(`div`,{className:`recap-wrap`,children:[(0,E.jsx)(`div`,{className:`recap-sec-title`,children:e(`auth.recap_identity`)}),(0,E.jsxs)(`div`,{className:`recap-row`,children:[(0,E.jsx)(`span`,{className:`recap-key`,children:e(`auth.recap_full_name`)}),(0,E.jsxs)(`span`,{className:`recap-val`,children:[R.first_name,` `,R.last_name]})]}),(0,E.jsxs)(`div`,{className:`recap-row`,children:[(0,E.jsx)(`span`,{className:`recap-key`,children:e(`auth.recap_email`)}),(0,E.jsx)(`span`,{className:`recap-val`,children:R.email})]}),(0,E.jsxs)(`div`,{className:`recap-row`,children:[(0,E.jsx)(`span`,{className:`recap-key`,children:e(`auth.recap_phone`)}),(0,E.jsx)(`span`,{className:`recap-val ok`,children:e(`auth.recap_verified`)})]})]}),(0,E.jsxs)(`div`,{className:`recap-wrap`,children:[(0,E.jsx)(`div`,{className:`recap-sec-title`,children:e(`auth.recap_docs`)}),(0,E.jsxs)(`div`,{className:`recap-row`,children:[(0,E.jsx)(`span`,{className:`recap-key`,children:e(`auth.recap_type`)}),(0,E.jsx)(`span`,{className:`recap-val`,children:R.document_type})]}),(0,E.jsxs)(`div`,{className:`recap-row`,children:[(0,E.jsx)(`span`,{className:`recap-key`,children:e(`auth.recap_number`)}),(0,E.jsx)(`span`,{className:`recap-val`,children:R.document_number||`—`})]}),(0,E.jsxs)(`div`,{className:`recap-row`,children:[(0,E.jsx)(`span`,{className:`recap-key`,children:e(`auth.recap_cni_front`)}),(0,E.jsx)(`span`,{className:`recap-val ${R.cni_recto?`ok`:``}`,children:R.cni_recto?R.cni_recto.name:e(`auth.recap_missing`)})]}),(0,E.jsxs)(`div`,{className:`recap-row`,children:[(0,E.jsx)(`span`,{className:`recap-key`,children:e(`auth.recap_cni_back`)}),(0,E.jsx)(`span`,{className:`recap-val ${R.cni_verso?`ok`:``}`,children:R.cni_verso?R.cni_verso.name:e(`auth.recap_missing`)})]}),(0,E.jsxs)(`div`,{className:`recap-row`,children:[(0,E.jsx)(`span`,{className:`recap-key`,children:e(`auth.recap_selfie`)}),(0,E.jsx)(`span`,{className:`recap-val ${R.selfie?`ok`:``}`,children:R.selfie?R.selfie.name:e(`auth.recap_missing`)})]})]}),(0,E.jsxs)(`div`,{className:`recap-wrap`,children:[(0,E.jsx)(`div`,{className:`recap-sec-title`,children:e(`auth.recap_assets`)}),(0,E.jsxs)(`div`,{className:`recap-row`,children:[(0,E.jsx)(`span`,{className:`recap-key`,children:e(`auth.recap_city`)}),(0,E.jsx)(`span`,{className:`recap-val`,children:R.city})]}),(0,E.jsxs)(`div`,{className:`recap-row`,children:[(0,E.jsx)(`span`,{className:`recap-key`,children:e(`auth.recap_neighborhoods`)}),(0,E.jsx)(`span`,{className:`recap-val`,children:R.neighborhoods||`—`})]}),(0,E.jsxs)(`div`,{className:`recap-row`,children:[(0,E.jsx)(`span`,{className:`recap-key`,children:e(`auth.recap_properties`)}),(0,E.jsx)(`span`,{className:`recap-val`,children:R.property_count})]})]}),(0,E.jsxs)(`div`,{className:`recap-wrap`,children:[(0,E.jsx)(`div`,{className:`recap-sec-title`,children:e(`auth.recap_status`)}),(0,E.jsxs)(`div`,{className:`recap-row`,children:[(0,E.jsx)(`span`,{className:`recap-key`,children:e(`auth.recap_account`)}),(0,E.jsx)(`span`,{className:`recap-val pend`,children:e(`common.pending`)})]}),(0,E.jsxs)(`div`,{className:`recap-row`,children:[(0,E.jsx)(`span`,{className:`recap-key`,children:e(`auth.recap_delay`)}),(0,E.jsx)(`span`,{className:`recap-val`,children:e(`auth.recap_delay_val`)})]})]}),(0,E.jsxs)(`div`,{className:`info-box rd`,children:[(0,E.jsx)(`div`,{className:`ib-ico`,children:(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z`})})}),(0,E.jsx)(`p`,{className:`ib-txt`,children:e(`auth.rejection_warning`)})]}),(0,E.jsxs)(`div`,{className:`check-row`,children:[(0,E.jsx)(`div`,{className:`check-box ${we?`checked`:``}`,onClick:()=>U(!we)}),(0,E.jsx)(`p`,{className:`check-txt`,children:e(`auth.certify_info`)})]}),(0,E.jsxs)(`div`,{className:`check-row`,children:[(0,E.jsx)(`div`,{className:`check-box ${W?`checked`:``}`,onClick:()=>Te(!W)}),(0,E.jsxs)(`p`,{className:`check-txt`,children:[e(`auth.accept_terms`),` `,(0,E.jsx)(`a`,{href:`#`,children:e(`auth.terms_link`)}),` `,e(`auth.and`),` `,(0,E.jsx)(`a`,{href:`#`,children:e(`auth.privacy_link`)}),`.`]})]}),(0,E.jsxs)(`button`,{className:`btn-primary`,disabled:G,onClick:He,style:{marginTop:6},children:[(0,E.jsx)(`svg`,{width:`16`,height:`16`,fill:`currentColor`,viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z`})}),G?(0,E.jsxs)(`span`,{style:{display:`inline-flex`,alignItems:`center`,gap:8},children:[(0,E.jsx)(`div`,{className:`spinner`}),(0,E.jsx)(`span`,{children:Be||e(`common.loading`)})]}):e(`auth.submit_btn`)]}),(0,E.jsx)(`div`,{className:`btn-nav-row`,style:{marginTop:10},children:(0,E.jsx)(`button`,{className:`btn-back`,style:{flex:1},type:`button`,onClick:()=>L(4),children:e(`auth.edit_btn`)})})]}),(0,E.jsxs)(`div`,{className:`card-footer`,children:[`© 2025 Piolo`,(0,E.jsx)(`a`,{href:`#`,children:e(`auth.footer_privacy`)}),(0,E.jsx)(`a`,{href:`#`,children:e(`auth.footer_terms`)})]})]})}),g===`forgot`&&(0,E.jsx)(`div`,{className:`screen active`,id:`s-forgot`,children:(0,E.jsxs)(`div`,{className:`auth-card`,style:{maxWidth:400,margin:`0 auto`},children:[(0,E.jsxs)(`div`,{className:`logo-row`,children:[(0,E.jsx)(k,{size:26}),(0,E.jsx)(`span`,{className:`logo-txt`,children:`Piolo`})]}),(0,E.jsx)(`h1`,{className:`card-title`,style:{marginTop:18},children:e(`auth.forgot_title`)}),(0,E.jsx)(`p`,{className:`card-sub`,children:e(`auth.forgot_sub`)}),F&&(0,E.jsxs)(`div`,{className:`alert alert-ok`,style:{display:`flex`},children:[(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z`})}),(0,E.jsx)(`small`,{style:{display:`block`,marginTop:4},children:e(`auth.forgot_check_spam`)}),e(`auth.forgot_sent`)]}),q&&(0,E.jsxs)(`div`,{className:`alert alert-err`,style:{display:`flex`},children:[(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z`})}),q]}),(0,E.jsxs)(`div`,{className:`field`,children:[(0,E.jsx)(`label`,{className:`field-label`,children:e(`auth.email`)}),(0,E.jsxs)(`div`,{className:`field-wrap`,children:[(0,E.jsx)(`svg`,{className:`field-ico`,viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z`})}),(0,E.jsx)(`input`,{className:`field-input`,type:`email`,placeholder:`votre@email.com`,value:N,onChange:e=>P(e.target.value)})]})]}),(0,E.jsxs)(`button`,{className:`btn-primary`,disabled:G,onClick:Me,children:[(0,E.jsx)(`svg`,{width:`16`,height:`16`,fill:`currentColor`,viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M2.01 21L23 12 2.01 3 2 10l15 2-15 2z`})}),G?(0,E.jsx)(`div`,{className:`spinner`}):e(`auth.send_link`)]}),(0,E.jsx)(`button`,{className:`btn-outline`,type:`button`,onClick:()=>_(`auth`),children:e(`auth.back_to_login`)}),(0,E.jsxs)(`div`,{className:`card-footer`,children:[`© 2025 Piolo `,(0,E.jsx)(`a`,{href:`#`,children:e(`auth.footer_privacy`)})]})]})}),g===`success-loc`&&(0,E.jsx)(`div`,{className:`screen active`,id:`s-success-loc`,children:(0,E.jsxs)(`div`,{className:`success-wrap`,children:[(0,E.jsx)(`div`,{className:`success-circle`,children:(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z`})})}),(0,E.jsx)(`h2`,{className:`success-title`,children:e(`auth.success_loc_title`)}),(0,E.jsx)(`p`,{className:`success-sub`,children:e(`auth.success_loc_sub`)}),(0,E.jsxs)(`div`,{className:`success-badge`,children:[(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z`})}),e(`auth.success_loc_points`)]}),(0,E.jsxs)(`button`,{className:`btn-primary`,onClick:()=>s(u,{replace:!0}),style:{maxWidth:360,margin:`0 auto`},children:[(0,E.jsx)(`svg`,{width:`16`,height:`16`,fill:`currentColor`,viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z`})}),e(`auth.go_to_dashboard`)]}),(0,E.jsxs)(`div`,{className:`card-footer`,style:{borderTop:`none`},children:[`© 2025 Piolo `,(0,E.jsx)(`a`,{href:`#`,children:e(`auth.footer_privacy`)})]})]})}),g===`success-bail`&&(0,E.jsx)(`div`,{className:`screen active`,id:`s-success-bail`,children:(0,E.jsxs)(`div`,{className:`success-wrap`,children:[(0,E.jsx)(`div`,{className:`success-circle`,style:{background:`linear-gradient(135deg,#3B6D11,#639922)`},children:(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z`})})}),(0,E.jsx)(`h2`,{className:`success-title`,children:e(`auth.success_bail_title`)}),(0,E.jsx)(`p`,{className:`success-sub`,children:e(`auth.success_bail_sub`)}),(0,E.jsxs)(`div`,{className:`success-badge pending-badge`,children:[(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z`})}),e(`auth.pending_status`)]}),(0,E.jsxs)(`div`,{className:`success-card`,children:[(0,E.jsxs)(`div`,{className:`sc-row`,children:[(0,E.jsx)(`div`,{className:`sc-ico gn`,children:(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z`})})}),(0,E.jsxs)(`div`,{className:`sc-body`,children:[(0,E.jsx)(`strong`,{children:e(`auth.verifying_in_progress`)}),(0,E.jsx)(`p`,{children:e(`auth.verifying_detail`)})]})]}),(0,E.jsxs)(`div`,{className:`sc-row`,children:[(0,E.jsx)(`div`,{className:`sc-ico or`,children:(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z`})})}),(0,E.jsxs)(`div`,{className:`sc-body`,children:[(0,E.jsx)(`strong`,{children:e(`auth.if_approved`)}),(0,E.jsx)(`p`,{children:e(`auth.if_approved_detail`)})]})]}),(0,E.jsxs)(`div`,{className:`sc-row`,children:[(0,E.jsx)(`div`,{className:`sc-ico rd`,children:(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z`})})}),(0,E.jsxs)(`div`,{className:`sc-body`,children:[(0,E.jsx)(`strong`,{children:e(`auth.if_rejected`)}),(0,E.jsx)(`p`,{children:e(`auth.if_rejected_detail`)})]})]}),(0,E.jsxs)(`div`,{className:`sc-row`,children:[(0,E.jsx)(`div`,{className:`sc-ico bl`,children:(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z`})})}),(0,E.jsxs)(`div`,{className:`sc-body`,children:[(0,E.jsx)(`strong`,{children:e(`auth.notification`)}),(0,E.jsx)(`p`,{children:e(`auth.notification_detail`)})]})]})]}),(0,E.jsx)(`button`,{className:`btn-primary`,onClick:()=>s(u,{replace:!0}),style:{maxWidth:360,margin:`0 auto 10px`},children:e(`auth.go_to_space`)}),(0,E.jsxs)(`div`,{className:`card-footer`,style:{borderTop:`none`},children:[`© 2025 Piolo `,(0,E.jsx)(`a`,{href:`#`,children:e(`auth.footer_privacy`)})]})]})}),g===`choose-role`&&(0,E.jsx)(`div`,{className:`screen active`,id:`s-choose-role`,children:(0,E.jsxs)(`div`,{className:`auth-card`,style:{maxWidth:480,margin:`0 auto`,textAlign:`left`},children:[(0,E.jsxs)(`div`,{className:`logo-row`,style:{justifyContent:`center`,marginBottom:12},children:[(0,E.jsx)(k,{size:38}),(0,E.jsx)(`span`,{className:`logo-txt`,style:{fontSize:`1.45rem`},children:`Piolo`})]}),(0,E.jsx)(`h2`,{className:`card-title`,style:{textAlign:`center`,fontSize:`1.4rem`,marginBottom:6,color:`#0F172A`},children:e(`auth.choose_role_title`)}),(0,E.jsx)(`p`,{className:`card-sub`,style:{textAlign:`center`,marginBottom:24,fontSize:`0.92rem`,color:`#64748B`},children:e(`auth.choose_role_sub`)}),q&&(0,E.jsxs)(`div`,{className:`alert alert-err`,style:{display:`flex`,marginBottom:16},children:[(0,E.jsx)(`svg`,{viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z`})}),q]}),(0,E.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:12,marginBottom:24},children:[(0,E.jsxs)(`div`,{onClick:()=>se(`LOCATAIRE`),style:{padding:`16px 18px`,borderRadius:14,cursor:`pointer`,transition:`all 0.25s ease`,background:S===`LOCATAIRE`?`#FFFBEB`:`#F8FAFC`,border:S===`LOCATAIRE`?`2px solid #D4AF37`:`1.5px solid #E2E8F0`,boxShadow:S===`LOCATAIRE`?`0 4px 18px rgba(212, 175, 55, 0.18)`:`none`,display:`flex`,alignItems:`flex-start`,gap:14},children:[(0,E.jsx)(`div`,{style:{width:44,height:44,borderRadius:12,background:S===`LOCATAIRE`?`linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)`:`#E2E8F0`,color:S===`LOCATAIRE`?`#FFFFFF`:`#475569`,display:`flex`,alignItems:`center`,justifyContent:`center`,flexShrink:0},children:(0,E.jsx)(`svg`,{width:`22`,height:`22`,viewBox:`0 0 24 24`,fill:`currentColor`,children:(0,E.jsx)(`path`,{d:`M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z`})})}),(0,E.jsxs)(`div`,{style:{flex:1},children:[(0,E.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,marginBottom:3},children:[(0,E.jsx)(`strong`,{style:{fontSize:`1.02rem`,color:`#0F172A`,fontWeight:700},children:e(`auth.role_tenant_title`)}),(0,E.jsx)(`span`,{style:{fontSize:`0.72rem`,padding:`3px 9px`,borderRadius:6,background:S===`LOCATAIRE`?`rgba(212,175,55,0.2)`:`#E2E8F0`,color:S===`LOCATAIRE`?`#855E0B`:`#64748B`,fontWeight:700},children:e(`auth.role_tenant_tag`)})]}),(0,E.jsx)(`p`,{style:{fontSize:`0.84rem`,color:`#475569`,margin:0,lineHeight:1.45},children:e(`auth.role_tenant_desc`)})]}),(0,E.jsx)(`div`,{style:{width:22,height:22,borderRadius:`50%`,border:S===`LOCATAIRE`?`2px solid #D4AF37`:`2px solid #CBD5E1`,display:`flex`,alignItems:`center`,justifyContent:`center`,background:S===`LOCATAIRE`?`#D4AF37`:`transparent`,marginTop:2,flexShrink:0},children:S===`LOCATAIRE`&&(0,E.jsx)(A,{})})]}),(0,E.jsxs)(`div`,{onClick:()=>se(`BAILLEUR`),style:{padding:`16px 18px`,borderRadius:14,cursor:`pointer`,transition:`all 0.25s ease`,background:S===`BAILLEUR`?`#FFFBEB`:`#F8FAFC`,border:S===`BAILLEUR`?`2px solid #D4AF37`:`1.5px solid #E2E8F0`,boxShadow:S===`BAILLEUR`?`0 4px 18px rgba(212, 175, 55, 0.18)`:`none`,display:`flex`,alignItems:`flex-start`,gap:14},children:[(0,E.jsx)(`div`,{style:{width:44,height:44,borderRadius:12,background:S===`BAILLEUR`?`linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)`:`#E2E8F0`,color:S===`BAILLEUR`?`#FFFFFF`:`#475569`,display:`flex`,alignItems:`center`,justifyContent:`center`,flexShrink:0},children:(0,E.jsx)(`svg`,{width:`22`,height:`22`,viewBox:`0 0 24 24`,fill:`currentColor`,children:(0,E.jsx)(`path`,{d:`M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z`})})}),(0,E.jsxs)(`div`,{style:{flex:1},children:[(0,E.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,marginBottom:3},children:[(0,E.jsx)(`strong`,{style:{fontSize:`1.02rem`,color:`#0F172A`,fontWeight:700},children:e(`auth.role_landlord_title`)}),(0,E.jsx)(`span`,{style:{fontSize:`0.72rem`,padding:`3px 9px`,borderRadius:6,background:S===`BAILLEUR`?`rgba(212,175,55,0.2)`:`#E2E8F0`,color:S===`BAILLEUR`?`#855E0B`:`#64748B`,fontWeight:700},children:e(`auth.role_landlord_tag`)})]}),(0,E.jsx)(`p`,{style:{fontSize:`0.84rem`,color:`#475569`,margin:0,lineHeight:1.45},children:e(`auth.role_landlord_desc`)})]}),(0,E.jsx)(`div`,{style:{width:22,height:22,borderRadius:`50%`,border:S===`BAILLEUR`?`2px solid #D4AF37`:`2px solid #CBD5E1`,display:`flex`,alignItems:`center`,justifyContent:`center`,background:S===`BAILLEUR`?`#D4AF37`:`transparent`,marginTop:2,flexShrink:0},children:S===`BAILLEUR`&&(0,E.jsx)(A,{})})]}),(0,E.jsxs)(`div`,{onClick:()=>se(`ARCHITECTE`),style:{padding:`16px 18px`,borderRadius:14,cursor:`pointer`,transition:`all 0.25s ease`,background:S===`ARCHITECTE`?`#FFFBEB`:`#F8FAFC`,border:S===`ARCHITECTE`?`2px solid #D4AF37`:`1.5px solid #E2E8F0`,boxShadow:S===`ARCHITECTE`?`0 4px 18px rgba(212, 175, 55, 0.18)`:`none`,display:`flex`,alignItems:`flex-start`,gap:14},children:[(0,E.jsx)(`div`,{style:{width:44,height:44,borderRadius:12,background:S===`ARCHITECTE`?`linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)`:`#E2E8F0`,color:S===`ARCHITECTE`?`#FFFFFF`:`#475569`,display:`flex`,alignItems:`center`,justifyContent:`center`,flexShrink:0},children:(0,E.jsx)(`svg`,{width:`22`,height:`22`,viewBox:`0 0 24 24`,fill:`currentColor`,children:(0,E.jsx)(`path`,{d:`M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z`})})}),(0,E.jsxs)(`div`,{style:{flex:1},children:[(0,E.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,marginBottom:3},children:[(0,E.jsx)(`strong`,{style:{fontSize:`1.02rem`,color:`#0F172A`,fontWeight:700},children:e(`auth.role_pro_title`)}),(0,E.jsx)(`span`,{style:{fontSize:`0.72rem`,padding:`3px 9px`,borderRadius:6,background:S===`ARCHITECTE`?`rgba(212,175,55,0.2)`:`#E2E8F0`,color:S===`ARCHITECTE`?`#855E0B`:`#64748B`,fontWeight:700},children:e(`auth.role_pro_tag`)})]}),(0,E.jsx)(`p`,{style:{fontSize:`0.84rem`,color:`#475569`,margin:0,lineHeight:1.45},children:e(`auth.role_pro_desc2`)})]}),(0,E.jsx)(`div`,{style:{width:22,height:22,borderRadius:`50%`,border:S===`ARCHITECTE`?`2px solid #D4AF37`:`2px solid #CBD5E1`,display:`flex`,alignItems:`center`,justifyContent:`center`,background:S===`ARCHITECTE`?`#D4AF37`:`transparent`,marginTop:2,flexShrink:0},children:S===`ARCHITECTE`&&(0,E.jsx)(A,{})})]})]}),(0,E.jsx)(`button`,{className:`btn-primary`,disabled:ce,onClick:()=>ke(S),style:{width:`100%`,padding:`15px 22px`,fontSize:`1rem`,fontWeight:700,display:`flex`,alignItems:`center`,justifyContent:`center`,gap:10,cursor:`pointer`},children:ce?(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(`div`,{className:`spinner`}),e(`auth.saving_role`)]}):(0,E.jsxs)(E.Fragment,{children:[e(`auth.continue_to_space`),(0,E.jsx)(`svg`,{width:`18`,height:`18`,fill:`currentColor`,viewBox:`0 0 24 24`,children:(0,E.jsx)(`path`,{d:`M5 12h14M12 5l7 7-7 7`})})]})})]})})]})]})}function ye({message:e}){let{t}=te();return(0,E.jsxs)(`div`,{style:{minHeight:`100vh`,display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,background:`#F7F5F1`,textAlign:`center`,padding:`32px`},children:[(0,E.jsx)(`div`,{style:{fontSize:`80px`,marginBottom:`24px`},children:`🏠`}),(0,E.jsx)(`h1`,{style:{fontFamily:`var(--font-head)`,fontSize:`32px`,marginBottom:`12px`},children:e||`Page introuvable`}),(0,E.jsx)(`p`,{style:{color:`#64605A`,marginBottom:`32px`,maxWidth:`400px`},children:`Cette page n'existe pas ou a été déplacée.`}),(0,E.jsx)(u,{to:`/properties`,className:`btn btn-primary`,children:t(`not_found.back_to_listings`)})]})}var be=(0,w.lazy)(()=>i(()=>import(`./PropertyListPage-B67losFD.js`),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]))),xe=(0,w.lazy)(()=>i(()=>import(`./PropertyDetail-CSDhYd5C.js`),__vite__mapDeps([18,1,2,3,19,7,8,20,10,12,13,15,21]))),M=(0,w.lazy)(()=>i(()=>import(`./PropertyFormPage-dJGWyU3F.js`),__vite__mapDeps([22,1,2,3,23,19,7,8,10,24,6,9,11]))),N=(0,w.lazy)(()=>i(()=>import(`./SearchAlertsPage-CukvDFQg.js`),__vite__mapDeps([25,1,2,3,4,5,6,7,8,9,10,11,16,17]))),P=(0,w.lazy)(()=>i(()=>import(`./FavoritesListPage-CWNBJRYk.js`),__vite__mapDeps([26,1,2,3,4,5,6,7,8,9,10,27,28,12,13,15,16,17]))),F=(0,w.lazy)(()=>i(()=>import(`./VisitsListPage-CG7DEdkO.js`),__vite__mapDeps([29,1,2,3,4,5,6,7,8,9,10,27,28,16,13,17]))),Se=(0,w.lazy)(()=>i(()=>import(`./LocationsListPage-5T_9r92j.js`),__vite__mapDeps([30,1,2,3,4,5,6,7,8,9,10,27,28,16,13,17]))),I=(0,w.lazy)(()=>i(()=>import(`./InteractiveMapPage-kf806n8W.js`),__vite__mapDeps([31,1,2,3,4,5,6,7,8,9,10,13,17]))),L=(0,w.lazy)(()=>i(()=>import(`./ArchitectsPage-5Xsg5PBB.js`),__vite__mapDeps([32,1,2,3,33,19,7,8,21,10,13,4,5,6,9,34,35,16,17]))),R=(0,w.lazy)(()=>i(()=>import(`./TourViewer-NwBZT_N6.js`),__vite__mapDeps([36,1,2,3]))),z=(0,w.lazy)(()=>i(()=>import(`./TourEditor-DRR4aC-Z.js`),__vite__mapDeps([37,1,2,3,20,10]))),B=(0,w.lazy)(()=>i(()=>import(`./DiscoveryPage-MPU77NSy.js`),__vite__mapDeps([38,1,2,3,7,13]))),V=(0,w.lazy)(()=>i(()=>import(`./ResetPasswordPage-CkHRbo0s.js`),__vite__mapDeps([39,1,2,3]))),H=(0,w.lazy)(()=>i(()=>import(`./Dashboard-CGsXZYbv.js`),__vite__mapDeps([40,1,2,3,33,19,7,8,21,10,13,4,5,6,9,27,28,11,34,12,14,16,17]))),Ce=(0,w.lazy)(()=>i(()=>import(`./Dashboard-Bh_RuraM.js`),__vite__mapDeps([41,1,2,3,42,4,5,6,7,8,9,10,23,19,24,27,28,11,16,13,17]))),we=(0,w.lazy)(()=>i(()=>import(`./SuperAdminDashboard-BcZgTQPZ.js`),__vite__mapDeps([43,1,2,3,11,7,44,13,45,9]))),U=(0,w.lazy)(()=>i(()=>import(`./Dashboard-B7TrVLm2.js`),__vite__mapDeps([46,1,2,3,33,19,7,8,21,10,13,4,5,6,9,35,16,17]))),W=(0,w.lazy)(()=>i(()=>import(`./ProfilePage-GEuR10X5.js`),__vite__mapDeps([47,1,2,3,4,5,6,7,8,9,10,13,17]))),Te=(0,w.lazy)(()=>i(()=>import(`./SecurityPage-DnF5aSrF.js`),__vite__mapDeps([48,1,2,3,4,5,6,7,8,9,10,17]))),G=(0,w.lazy)(()=>i(()=>import(`./SupportPage-UIiK699z.js`),__vite__mapDeps([49,1,2,4,5,6,7,3,8,9,10,17]))),K=(0,w.lazy)(()=>i(()=>import(`./CalendarPage-Cv4ofW--.js`),__vite__mapDeps([50,1,2,3,4,5,6,7,8,9,10,13]))),q=(0,w.lazy)(()=>i(()=>import(`./VisitDetail-DeWC8NTR.js`),__vite__mapDeps([51,1,2,3,11,13]))),J=(0,w.lazy)(()=>i(()=>import(`./LocationDetail-59pb5nQ_.js`),__vite__mapDeps([52,1,2,3,11,13]))),Y=(0,w.lazy)(()=>i(()=>import(`./ChatPage-DzTOV7VB.js`),__vite__mapDeps([53,1,2,3,7,13]))),X=(0,w.lazy)(()=>i(()=>import(`./NotificationPage-DErclmvK.js`),__vite__mapDeps([54,1,2,3,55]))),Z=(0,w.lazy)(()=>i(()=>import(`./PioloChatbot-CQoX345b.js`),__vite__mapDeps([56,1,2,3,7,44,13,57]))),Ee=(0,w.lazy)(()=>i(()=>import(`./OnboardingManager-brrJBlcp.js`),__vite__mapDeps([58,1,2,7,3,59])));function De(){return(0,E.jsxs)(`div`,{style:{minHeight:`60vh`,display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,gap:`16px`},children:[(0,E.jsx)(`div`,{style:{width:`38px`,height:`38px`,border:`3px solid rgba(212, 160, 23, 0.15)`,borderTopColor:`#D4A017`,borderRadius:`50%`,animation:`piolo-spin 0.75s cubic-bezier(0.4, 0, 0.2, 1) infinite`}}),(0,E.jsx)(`style`,{children:`
        @keyframes piolo-spin {
          to { transform: rotate(360deg); }
        }
      `})]})}function Oe(){let{user:e}=ie();return e?(0,E.jsx)(s,{to:{LOCATAIRE:`/dashboard/locataire`,BAILLEUR:`/dashboard/bailleur`,ARCHITECTE:`/dashboard/pro`,PROFESSIONNEL:`/dashboard/pro`,ADMIN:`/dashboard/admin`}[e.role]||`/properties`,replace:!0}):(0,E.jsx)(s,{to:`/login`,replace:!0})}function ke(){return(0,E.jsx)(ae,{children:(0,E.jsx)(_,{children:(0,E.jsx)(g,{children:(0,E.jsxs)(c,{children:[(0,E.jsx)(w.Suspense,{fallback:(0,E.jsx)(De,{}),children:(0,E.jsxs)(d,{children:[(0,E.jsx)(l,{path:`/`,element:(0,E.jsx)(O,{})}),(0,E.jsx)(l,{path:`/login`,element:(0,E.jsx)(j,{})}),(0,E.jsx)(l,{path:`/register`,element:(0,E.jsx)(j,{})}),(0,E.jsx)(l,{path:`/inscription`,element:(0,E.jsx)(j,{})}),(0,E.jsx)(l,{path:`/reset-password/:uid/:token`,element:(0,E.jsx)(V,{})}),(0,E.jsx)(l,{path:`/reset-password`,element:(0,E.jsx)(j,{})}),(0,E.jsx)(l,{path:`/properties`,element:(0,E.jsx)(be,{})}),(0,E.jsx)(l,{path:`/properties/:id`,element:(0,E.jsx)(xe,{})}),(0,E.jsx)(l,{path:`/properties/:id/tour`,element:(0,E.jsx)(R,{})}),(0,E.jsx)(l,{path:`/discovery`,element:(0,E.jsx)(B,{})}),(0,E.jsx)(l,{path:`/decouverte`,element:(0,E.jsx)(B,{})}),(0,E.jsx)(l,{path:`/map`,element:(0,E.jsx)(I,{})}),(0,E.jsx)(l,{path:`/interactive-map`,element:(0,E.jsx)(I,{})}),(0,E.jsx)(l,{path:`/architectes`,element:(0,E.jsx)(L,{})}),(0,E.jsx)(l,{path:`/unauthorized`,element:(0,E.jsx)(ye,{message:`Accès refusé.`})}),(0,E.jsxs)(l,{element:(0,E.jsx)(he,{}),children:[(0,E.jsx)(l,{path:`/dashboard`,element:(0,E.jsx)(Oe,{})}),(0,E.jsxs)(l,{element:(0,E.jsx)(D,{allowedRoles:[`BAILLEUR`,`ADMIN`]}),children:[(0,E.jsx)(l,{path:`/properties/create`,element:(0,E.jsx)(M,{})}),(0,E.jsx)(l,{path:`/properties/new`,element:(0,E.jsx)(M,{})}),(0,E.jsx)(l,{path:`/properties/update/:id`,element:(0,E.jsx)(M,{})}),(0,E.jsx)(l,{path:`/properties/:id/edit`,element:(0,E.jsx)(M,{})}),(0,E.jsx)(l,{path:`/properties/:id/update`,element:(0,E.jsx)(M,{})}),(0,E.jsx)(l,{path:`/properties/:id/tour-editor`,element:(0,E.jsx)(z,{})})]}),(0,E.jsx)(l,{path:`/messages`,element:(0,E.jsx)(Y,{})}),(0,E.jsx)(l,{path:`/messages/:id`,element:(0,E.jsx)(Y,{})}),(0,E.jsx)(l,{path:`/dashboard/locataire/favoris`,element:(0,E.jsx)(P,{})}),(0,E.jsx)(l,{path:`/dashboard/bailleur/favoris`,element:(0,E.jsx)(P,{})}),(0,E.jsx)(l,{path:`/favorites`,element:(0,E.jsx)(P,{})}),(0,E.jsx)(l,{path:`/favoris`,element:(0,E.jsx)(P,{})}),(0,E.jsx)(l,{path:`/dashboard/locataire/visites`,element:(0,E.jsx)(F,{})}),(0,E.jsx)(l,{path:`/dashboard/bailleur/visites`,element:(0,E.jsx)(F,{})}),(0,E.jsx)(l,{path:`/visites`,element:(0,E.jsx)(F,{})}),(0,E.jsx)(l,{path:`/visits`,element:(0,E.jsx)(F,{})}),(0,E.jsx)(l,{path:`/visites/:id`,element:(0,E.jsx)(q,{})}),(0,E.jsx)(l,{path:`/visits/:id`,element:(0,E.jsx)(q,{})}),(0,E.jsx)(l,{path:`/dashboard/locataire/visites/:id`,element:(0,E.jsx)(q,{})}),(0,E.jsx)(l,{path:`/dashboard/bailleur/visites/:id`,element:(0,E.jsx)(q,{})}),(0,E.jsx)(l,{path:`/dashboard/locataire/locations`,element:(0,E.jsx)(Se,{})}),(0,E.jsx)(l,{path:`/dashboard/bailleur/locations`,element:(0,E.jsx)(Se,{})}),(0,E.jsx)(l,{path:`/locations`,element:(0,E.jsx)(Se,{})}),(0,E.jsx)(l,{path:`/locations/:id`,element:(0,E.jsx)(J,{})}),(0,E.jsx)(l,{path:`/dashboard/locataire/locations/:id`,element:(0,E.jsx)(J,{})}),(0,E.jsx)(l,{path:`/dashboard/bailleur/locations/:id`,element:(0,E.jsx)(J,{})}),(0,E.jsx)(l,{path:`/dashboard/locataire/alertes`,element:(0,E.jsx)(N,{})}),(0,E.jsx)(l,{path:`/dashboard/bailleur/alertes`,element:(0,E.jsx)(N,{})}),(0,E.jsx)(l,{path:`/alertes`,element:(0,E.jsx)(N,{})}),(0,E.jsx)(l,{path:`/alerts`,element:(0,E.jsx)(N,{})}),(0,E.jsx)(l,{path:`/dashboard/locataire/profil`,element:(0,E.jsx)(W,{})}),(0,E.jsx)(l,{path:`/dashboard/bailleur/profil`,element:(0,E.jsx)(W,{})}),(0,E.jsx)(l,{path:`/profil`,element:(0,E.jsx)(W,{})}),(0,E.jsx)(l,{path:`/profile`,element:(0,E.jsx)(W,{})}),(0,E.jsx)(l,{path:`/securite`,element:(0,E.jsx)(Te,{})}),(0,E.jsx)(l,{path:`/security`,element:(0,E.jsx)(Te,{})}),(0,E.jsx)(l,{path:`/privacy`,element:(0,E.jsx)(Te,{})}),(0,E.jsx)(l,{path:`/terms`,element:(0,E.jsx)(Te,{})}),(0,E.jsx)(l,{path:`/support`,element:(0,E.jsx)(G,{})}),(0,E.jsx)(l,{path:`/help`,element:(0,E.jsx)(G,{})}),(0,E.jsx)(l,{path:`/calendrier`,element:(0,E.jsx)(K,{})}),(0,E.jsx)(l,{path:`/calendar`,element:(0,E.jsx)(K,{})}),(0,E.jsx)(l,{path:`/notifications`,element:(0,E.jsx)(X,{})}),(0,E.jsx)(l,{path:`/dashboard/locataire/*`,element:(0,E.jsx)(H,{})}),(0,E.jsx)(l,{path:`/dashboard/bailleur/*`,element:(0,E.jsx)(Ce,{})}),(0,E.jsx)(l,{path:`/dashboard/pro/*`,element:(0,E.jsx)(U,{})}),(0,E.jsx)(l,{path:`/dashboard/professionnel/*`,element:(0,E.jsx)(U,{})}),(0,E.jsx)(l,{path:`/dashboard/architecte/*`,element:(0,E.jsx)(U,{})}),(0,E.jsxs)(l,{element:(0,E.jsx)(D,{allowedRoles:[`ADMIN`]}),children:[(0,E.jsx)(l,{path:`/dashboard/admin/*`,element:(0,E.jsx)(we,{})}),(0,E.jsx)(l,{path:`/admin/dashboard/*`,element:(0,E.jsx)(we,{})})]})]}),(0,E.jsx)(l,{path:`*`,element:(0,E.jsx)(ye,{})})]})}),(0,E.jsxs)(w.Suspense,{fallback:null,children:[(0,E.jsx)(Z,{}),(0,E.jsx)(Ee,{})]})]})})})})}(0,T.createRoot)(document.getElementById(`root`)).render((0,E.jsx)(w.StrictMode,{children:(0,E.jsx)(ke,{})}));