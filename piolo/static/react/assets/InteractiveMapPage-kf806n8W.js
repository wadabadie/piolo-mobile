import{r as e}from"./rolldown-runtime-Cq0jCQ29.js";import{g as t,p as n,r,t as i}from"./vendor-react-DlxHbF51.js";import{s as a}from"./api-B9EIXznq.js";import{t as o}from"./media-CF4hGFW6.js";import{t as s}from"./Sidebar-BnvPh3AM.js";/* empty css                  */var c=e(t(),1),l=i(),u=`AIzaSyDZyYvlR1SeSE6mk2kJn-gJxg-tfsDoJKc`,d={yaounde:{lat:3.848,lng:11.5021,zoom:13},douala:{lat:4.0511,lng:9.7679,zoom:13},kribi:{lat:2.9374,lng:9.9077,zoom:14},bafoussam:{lat:5.4778,lng:10.4176,zoom:13},limbe:{lat:4.0244,lng:9.2081,zoom:14}};function f(){return window.google?.maps?Promise.resolve(window.google):new Promise((e,t)=>{if(document.getElementById(`google-maps-js`)){let t=setInterval(()=>{window.google?.maps&&(clearInterval(t),e(window.google))},100);return}let n=document.createElement(`script`);n.id=`google-maps-js`,n.src=`https://maps.googleapis.com/maps/api/js?key=${u}&libraries=places,marker&v=weekly`,n.async=!0,n.onload=()=>e(window.google),n.onerror=()=>t(Error(`Impossible de charger Google Maps`)),document.head.appendChild(n)})}function p(){let{t:e}=n(),[t,i]=(0,c.useState)(!0),[u,p]=(0,c.useState)([]),[m,h]=(0,c.useState)(null),[g,_]=(0,c.useState)(null),[v,y]=(0,c.useState)(`ALL`),[b,x]=(0,c.useState)(``),[S,C]=(0,c.useState)(!1),[w,T]=(0,c.useState)(!0),E=(0,c.useRef)(null),D=(0,c.useRef)(null),O=(0,c.useRef)(new Map),k=(0,c.useRef)(null),A=(0,c.useRef)(null),j=(0,c.useRef)(null);(0,c.useEffect)(()=>{let e=!0;return a.list().then(t=>{if(!e)return;let n=t.data?.results||t.data||[];p((Array.isArray(n)?n:[]).filter(e=>e.latitude&&e.longitude&&!isNaN(parseFloat(e.latitude))&&!isNaN(parseFloat(e.longitude))))}).catch(e=>console.error(`Erreur chargement biens carte:`,e)).finally(()=>{e&&i(!1)}),()=>{e=!1}},[]);let M=(0,c.useMemo)(()=>u.filter(e=>{if(v!==`ALL`&&!(e.city||``).toLowerCase().includes(v.toLowerCase()))return!1;if(b.trim()){let t=b.toLowerCase(),n=(e.title||``).toLowerCase(),r=(e.neighborhood||``).toLowerCase(),i=(e.city||``).toLowerCase(),a=(e.property_type||``).toLowerCase();return n.includes(t)||r.includes(t)||i.includes(t)||a.includes(t)}return!0}),[u,v,b]);(0,c.useEffect)(()=>{t||!E.current||f().then(e=>{let t=d.yaounde;D.current||=new e.maps.Map(E.current,{zoom:12,center:{lat:t.lat,lng:t.lng},mapTypeId:e.maps.MapTypeId.HYBRID,mapId:`PIOLO_MAP_ID`,disableDefaultUI:!1,mapTypeControl:!0,mapTypeControlOptions:{style:e.maps.MapTypeControlStyle.HORIZONTAL_BAR,position:e.maps.ControlPosition.TOP_LEFT},zoomControl:!0});let n=D.current;O.current.forEach(({marker:e})=>{e.setMap?e.setMap(null):e.map=null}),O.current.clear();let r=new e.maps.LatLngBounds,i=!1;if(M.forEach(t=>{let a=parseFloat(t.latitude),s=parseFloat(t.longitude);if(isNaN(a)||isNaN(s))return;i=!0,r.extend({lat:a,lng:s});let c=Number(t.price).toLocaleString(`fr-FR`),l=document.createElement(`div`);l.className=`custom-price-marker ${m===t.id?`active`:``}`,l.textContent=`${c} F`;let u;try{u=e.maps.marker?.AdvancedMarkerElement?new e.maps.marker.AdvancedMarkerElement({map:n,position:{lat:a,lng:s},content:l,title:t.title}):new e.maps.Marker({position:{lat:a,lng:s},map:n,title:t.title})}catch{u=new e.maps.Marker({position:{lat:a,lng:s},map:n,title:t.title})}let d=o(t.main_image||t.cover_image),f=`
          <a href="/properties/${t.slug||t.id}" style="width:240px; display:block; text-decoration:none; color:inherit; font-family:'Poppins',sans-serif;">
            <img src="${d}" style="width:100%; height:130px; object-fit:cover; border-radius:12px 12px 0 0;" alt="${t.title}" />
            <div style="padding:14px;">
              <div style="font-family:'Poppins',sans-serif; font-size:17px; font-weight:800; color:#A8891C;">${c} FCFA</div>
              <div style="font-size:14px; font-weight:700; color:#0F0D09; margin:4px 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t.title}</div>
              <div style="font-size:12px; color:#64605A;">${t.city}${t.neighborhood?` • `+t.neighborhood:``}</div>
            </div>
          </a>
        `,p=new e.maps.InfoWindow({content:f}),g=()=>{if(h(t.id),j.current&&j.current.close(),p.open({anchor:u,map:n}),j.current=p,k.current){let e=k.current.querySelector(`[data-prop-id="${t.id}"]`);e&&e.scrollIntoView({behavior:`smooth`,inline:`center`,block:`nearest`})}};l.addEventListener(`click`,g),u.addListener&&u.addListener(`click`,g),O.current.set(t.id,{marker:u,element:l,infoWindow:p})}),i&&M.length>1&&v===`ALL`)n.fitBounds(r,{top:60,right:30,bottom:60,left:30});else if(v!==`ALL`&&d[v.toLowerCase()]){let e=d[v.toLowerCase()];n.setCenter({lat:e.lat,lng:e.lng}),n.setZoom(e.zoom)}setTimeout(()=>{e.maps.event&&e.maps.event.trigger(n,`resize`)},150)}).catch(e=>console.error(`Maps init error:`,e))},[t,M,v]),(0,c.useEffect)(()=>{O.current.forEach(({element:e},t)=>{e&&(t===m?e.classList.add(`active`):e.classList.remove(`active`))})},[m]);let N=(e,t)=>{_(t?e:null);let n=O.current.get(e);n?.element&&(t?n.element.classList.add(`active`):e!==m&&n.element.classList.remove(`active`))},P=e=>{h(e.id);let t=O.current.get(e.id);if(D.current){let n=parseFloat(e.latitude),r=parseFloat(e.longitude);!isNaN(n)&&!isNaN(r)&&(D.current.panTo({lat:n,lng:r}),t?.infoWindow&&t?.marker&&(j.current&&j.current.close(),t.infoWindow.open({anchor:t.marker,map:D.current}),j.current=t.infoWindow))}};return(0,l.jsxs)(`div`,{className:`layout`,style:{height:`100vh`,overflow:`hidden`},children:[(0,l.jsx)(s,{}),(0,l.jsxs)(`div`,{className:`main map-page-main`,style:{padding:0,height:`100vh`,display:`flex`,flexDirection:`row`,position:`relative`},children:[(0,l.jsxs)(`div`,{className:`map-sidebar desktop-only`,children:[(0,l.jsxs)(`div`,{className:`map-sidebar-header`,style:{padding:24,borderBottom:`1px solid #E8E3DA`,background:`#fff`},children:[(0,l.jsx)(`h2`,{style:{fontFamily:`Poppins, sans-serif`,fontSize:22,fontWeight:800,color:`#0F0D09`,margin:`0 0 5px`},children:e(`interactive_map.title`,`Carte Interactive`)}),(0,l.jsx)(`p`,{style:{fontSize:13,color:`#64605A`,margin:0},children:t?e(`interactive_map.loading_map`,`Chargement des biens…`):e(`interactive_map.properties_found_count`,`{{count}} bien(s) géolocalisé(s)`,{count:u.length})})]}),(0,l.jsxs)(`div`,{className:`map-list`,style:{flex:1,overflowY:`auto`,padding:20,background:`#F7F5F1`,display:`flex`,flexDirection:`column`,gap:15},children:[t&&[1,2,3,4].map(e=>(0,l.jsxs)(`div`,{style:{display:`flex`,gap:15,padding:15,borderRadius:16,border:`1px solid #E8E3DA`,background:`#fff`},children:[(0,l.jsx)(`div`,{style:{width:110,height:95,borderRadius:12,background:`linear-gradient(90deg,#e8e3da 25%,#f5f0e8 50%,#e8e3da 75%)`,backgroundSize:`200% 100%`,animation:`shimmer 1.5s infinite`,flexShrink:0}}),(0,l.jsxs)(`div`,{style:{flex:1,display:`flex`,flexDirection:`column`,gap:8,justifyContent:`center`},children:[(0,l.jsx)(`div`,{style:{width:`60%`,height:16,borderRadius:6,background:`linear-gradient(90deg,#e8e3da 25%,#f5f0e8 50%,#e8e3da 75%)`,backgroundSize:`200% 100%`,animation:`shimmer 1.5s infinite`}}),(0,l.jsx)(`div`,{style:{width:`85%`,height:14,borderRadius:6,background:`linear-gradient(90deg,#e8e3da 25%,#f5f0e8 50%,#e8e3da 75%)`,backgroundSize:`200% 100%`,animation:`shimmer 1.5s infinite`}}),(0,l.jsx)(`div`,{style:{width:`40%`,height:12,borderRadius:6,background:`linear-gradient(90deg,#e8e3da 25%,#f5f0e8 50%,#e8e3da 75%)`,backgroundSize:`200% 100%`,animation:`shimmer 1.5s infinite`}})]})]},e)),!t&&u.length===0&&(0,l.jsx)(`div`,{style:{textAlign:`center`,padding:30,color:`#64605A`},children:e(`interactive_map.no_properties_found`,`Aucun bien géolocalisé disponible.`)}),u.map(e=>{let t=Number(e.price).toLocaleString(`fr-FR`),n=o(e.main_image||e.cover_image);return(0,l.jsxs)(`div`,{className:`property-card-html ${g===e.id||m===e.id?`active`:``}`,onMouseEnter:()=>N(e.id,!0),onMouseLeave:()=>N(e.id,!1),onClick:()=>P(e),children:[(0,l.jsx)(`img`,{src:n,className:`property-img-html`,alt:e.title,onError:e=>{e.currentTarget.src=`/static/img/logo-piolo-clean.png`}}),(0,l.jsxs)(`div`,{className:`property-info-html`,children:[(0,l.jsxs)(`div`,{className:`property-price-html`,children:[t,` FCFA`]}),(0,l.jsx)(`div`,{className:`property-title-html`,children:e.title}),(0,l.jsxs)(`div`,{className:`property-meta-html`,children:[e.city,e.neighborhood?` • ${e.neighborhood}`:``]}),(0,l.jsxs)(`div`,{className:`property-meta-html`,style:{marginTop:4},children:[e.bedrooms||0,` ch. • `,e.bathrooms||0,` sdb. • `,e.area||0,` m²`]})]})]},e.id)})]})]}),(0,l.jsxs)(`div`,{className:`mobile-only mobile-top-bar`,children:[(0,l.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:8},children:[(0,l.jsx)(r,{to:`/dashboard`,style:{width:36,height:36,borderRadius:10,background:`rgba(255, 255, 255, 0.08)`,border:`1px solid rgba(212, 175, 55, 0.3)`,display:`flex`,alignItems:`center`,justifyContent:`center`,color:`#FFFFFF`,flexShrink:0,textDecoration:`none`},title:`Retour`,children:(0,l.jsx)(`svg`,{width:`17`,height:`17`,viewBox:`0 0 24 24`,fill:`currentColor`,children:(0,l.jsx)(`path`,{d:`M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z`})})}),(0,l.jsxs)(`div`,{style:{flex:1,position:`relative`},children:[(0,l.jsx)(`svg`,{style:{position:`absolute`,left:10,top:`50%`,transform:`translateY(-50%)`,width:13,height:13,fill:`var(--or)`},viewBox:`0 0 24 24`,children:(0,l.jsx)(`path`,{d:`M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z`})}),(0,l.jsx)(`input`,{type:`text`,placeholder:e(`interactive_map.search_placeholder`,`Quartier, type de bien...`),value:b,onChange:e=>x(e.target.value),style:{width:`100%`,padding:`7px 24px 7px 30px`,borderRadius:10,background:`rgba(255, 255, 255, 0.08)`,border:`1px solid rgba(212, 175, 55, 0.3)`,color:`#FFFFFF`,fontSize:12,fontFamily:`Poppins, sans-serif`,outline:`none`,boxSizing:`border-box`}})]}),(0,l.jsxs)(`div`,{style:{padding:`6px 10px`,borderRadius:10,background:`rgba(212, 175, 55, 0.15)`,border:`1px solid rgba(212, 175, 55, 0.4)`,color:`var(--or-l)`,fontFamily:`Poppins, sans-serif`,fontSize:11,fontWeight:800,whiteSpace:`nowrap`},children:[M.length,` biens`]})]}),(0,l.jsx)(`div`,{style:{display:`flex`,gap:6,overflowX:`auto`,scrollbarWidth:`none`,WebkitOverflowScrolling:`touch`,paddingTop:2},children:[{id:`ALL`,label:e(`interactive_map.all_cities`,`Toutes les villes`)},{id:`yaounde`,label:`Yaoundé`},{id:`douala`,label:`Douala`},{id:`kribi`,label:`Kribi`},{id:`bafoussam`,label:`Bafoussam`},{id:`limbe`,label:`Limbé`}].map(e=>(0,l.jsx)(`button`,{type:`button`,onClick:()=>y(e.id),style:{padding:`4px 10px`,borderRadius:14,fontSize:10.5,fontWeight:700,fontFamily:`Poppins, sans-serif`,whiteSpace:`nowrap`,cursor:`pointer`,border:v===e.id?`1px solid var(--or)`:`1px solid rgba(255,255,255,0.15)`,background:v===e.id?`linear-gradient(135deg, var(--or), var(--or-l))`:`rgba(255, 255, 255, 0.08)`,color:v===e.id?`#0F0D09`:`#FFFFFF`,flexShrink:0},children:e.label},e.id))})]}),(0,l.jsxs)(`div`,{className:`mobile-only mobile-floating-controls`,children:[(0,l.jsx)(`button`,{type:`button`,onClick:()=>{if(!D.current||!window.google?.maps)return;let e=w?window.google.maps.MapTypeId.ROADMAP:window.google.maps.MapTypeId.HYBRID;D.current.setMapTypeId(e),T(!w)},style:{width:40,height:40,borderRadius:12,background:w?`linear-gradient(135deg, #D4AF37, #F6D365)`:`rgba(15, 13, 9, 0.92)`,backdropFilter:`blur(10px)`,border:`1.5px solid var(--or)`,color:w?`#0F0D09`:`var(--or)`,display:`flex`,alignItems:`center`,justifyContent:`center`,cursor:`pointer`,boxShadow:`0 6px 20px rgba(0,0,0,0.5)`,fontSize:10,fontWeight:800},title:w?`Passer en vue Plan`:`Passer en vue Satellite`,children:w?`SAT`:`PLAN`}),(0,l.jsx)(`button`,{type:`button`,onClick:()=>{if(!navigator.geolocation){alert(`La géolocalisation n'est pas supportée par votre navigateur.`);return}C(!0),navigator.geolocation.getCurrentPosition(e=>{C(!1);let t=e.coords.latitude,n=e.coords.longitude;if(D.current&&window.google?.maps)if(D.current.panTo({lat:t,lng:n}),D.current.setZoom(15),A.current)A.current.setPosition&&A.current.setPosition({lat:t,lng:n});else{let e=document.createElement(`div`);e.className=`user-gps-pulse`,e.innerHTML=`<div class='pulse-ring'></div><div class='pulse-dot'></div>`;try{window.google.maps.marker?.AdvancedMarkerElement?A.current=new window.google.maps.marker.AdvancedMarkerElement({map:D.current,position:{lat:t,lng:n},content:e,title:`Votre position`}):A.current=new window.google.maps.Marker({position:{lat:t,lng:n},map:D.current,title:`Votre position`})}catch{A.current=new window.google.maps.Marker({position:{lat:t,lng:n},map:D.current,title:`Votre position`})}}},e=>{C(!1),console.warn(`Erreur GPS:`,e.message),alert(`Impossible de récupérer votre position. Vérifiez vos autorisations GPS.`)},{enableHighAccuracy:!0,timeout:8e3})},disabled:S,style:{width:40,height:40,borderRadius:12,background:`rgba(15, 13, 9, 0.92)`,backdropFilter:`blur(10px)`,border:`1.5px solid var(--or)`,color:`var(--or)`,display:`flex`,alignItems:`center`,justifyContent:`center`,cursor:`pointer`,boxShadow:`0 6px 20px rgba(0,0,0,0.5)`},title:`Autour de moi`,children:(0,l.jsx)(`svg`,{width:`17`,height:`17`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.5`,children:(0,l.jsx)(`polygon`,{points:`3 11 22 2 13 21 11 13 3 11`})})})]}),(0,l.jsx)(`div`,{className:`map-container`,style:{flex:1,height:`100%`,position:`relative`,minHeight:`100vh`},children:(0,l.jsx)(`div`,{id:`map`,ref:E,style:{width:`100%`,height:`100%`,position:`absolute`,inset:0}})}),(0,l.jsx)(`div`,{ref:k,className:`mobile-only mobile-map-carousel`,children:M.map(e=>{let t=Number(e.price).toLocaleString(`fr-FR`),n=o(e.main_image||e.cover_image),i=m===e.id;return(0,l.jsxs)(`div`,{"data-prop-id":e.id,onClick:()=>P(e),className:`mobile-prop-card ${i?`active`:``}`,children:[(0,l.jsxs)(`div`,{style:{position:`relative`,width:`100%`,height:110,background:`#1A1711`},children:[(0,l.jsx)(`img`,{src:n,alt:e.title,style:{width:`100%`,height:`100%`,objectFit:`cover`},onError:e=>{e.currentTarget.src=`/static/img/logo-piolo-clean.png`}}),(0,l.jsxs)(`div`,{style:{position:`absolute`,bottom:6,left:8,background:`rgba(15,13,9,0.85)`,backdropFilter:`blur(6px)`,padding:`3px 8px`,borderRadius:8,color:`var(--or-l)`,fontSize:11.5,fontWeight:800},children:[t,` FCFA`]})]}),(0,l.jsxs)(`div`,{style:{padding:`10px 12px`,display:`flex`,flexDirection:`column`,gap:2},children:[(0,l.jsx)(`div`,{style:{fontFamily:`Poppins, sans-serif`,fontSize:13,fontWeight:800,color:`#0F0D09`,whiteSpace:`nowrap`,overflow:`hidden`,textOverflow:`ellipsis`},children:e.title}),(0,l.jsxs)(`div`,{style:{fontSize:11,color:`#6C665C`,display:`flex`,alignItems:`center`,gap:4},children:[(0,l.jsx)(`svg`,{width:`10`,height:`10`,viewBox:`0 0 24 24`,fill:`var(--or)`,children:(0,l.jsx)(`path`,{d:`M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z`})}),(0,l.jsxs)(`span`,{children:[e.city,e.neighborhood?`, ${e.neighborhood}`:``]})]}),(0,l.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginTop:6,paddingTop:6,borderTop:`1px solid #F0ECE3`},children:[(0,l.jsxs)(`span`,{style:{fontSize:11,color:`#888`,fontWeight:600},children:[e.bedrooms?`${e.bedrooms} ch. • `:``,e.area?`${e.area} m²`:`Disponible`]}),(0,l.jsx)(r,{to:`/properties/${e.slug||e.id}`,style:{padding:`4px 10px`,borderRadius:8,background:`linear-gradient(135deg, #1A1711, #0F0D09)`,color:`var(--or-l)`,fontSize:11,fontWeight:800,textDecoration:`none`,border:`1px solid rgba(212,175,55,0.3)`},children:`Consulter`})]})]})]},e.id)})})]}),(0,l.jsx)(`style`,{children:`
        /* ======================================================== */
        /* STYLES DESKTOP WEB ORIGINAUX (>768px)                    */
        /* ======================================================== */
        .mobile-only {
          display: none !important;
        }
        .desktop-only {
          display: flex !important;
        }
        .map-sidebar {
          width: 450px;
          background: #fff;
          border-right: 1px solid #E8E3DA;
          display: flex;
          flex-direction: column;
          z-index: 10;
          height: 100%;
          box-shadow: 2px 0 10px rgba(0,0,0,0.05);
        }
        .property-card-html {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          gap: 15px !important;
          padding: 15px !important;
          border-radius: 16px !important;
          border: 1px solid #E8E3DA !important;
          margin-bottom: 0 !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          text-decoration: none !important;
          color: #0F0D09 !important;
          background: #fff !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04) !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .property-card-html:hover, .property-card-html.active {
          border-color: #D4AF37 !important;
          background: rgba(212,175,55,0.05) !important;
          box-shadow: 0 4px 15px rgba(212,175,55,0.15) !important;
          transform: translateY(-2px);
        }
        .property-img-html {
          width: 110px !important;
          height: 95px !important;
          border-radius: 12px !important;
          object-fit: cover !important;
          flex-shrink: 0 !important;
        }
        .property-info-html {
          flex: 1 !important;
          min-width: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
        }
        .property-price-html {
          font-family: 'Poppins', sans-serif !important;
          font-weight: 800 !important;
          font-size: 16px !important;
          color: #A8891C !important;
          line-height: 1.2 !important;
        }
        .property-title-html {
          font-family: 'Poppins', sans-serif !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          color: #0F0D09 !important;
          margin: 4px 0 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        .property-meta-html {
          font-family: 'DM Sans', sans-serif !important;
          font-size: 12px !important;
          color: #64605A !important;
        }
        .custom-price-marker {
          background: #0F0D09;
          border: 2px solid #D4AF37;
          color: #fff;
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: 13px;
          padding: 6px 12px;
          border-radius: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          position: relative;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .custom-price-marker::after {
          content: '';
          position: absolute;
          bottom: -7px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 7px 7px 0;
          border-style: solid;
          border-color: #D4AF37 transparent transparent transparent;
        }
        .custom-price-marker:hover, .custom-price-marker.active {
          background: #D4AF37;
          color: #0F0D09;
          border-color: #0F0D09;
          transform: scale(1.15);
          z-index: 100;
          box-shadow: 0 8px 20px rgba(212,175,55,0.4);
        }
        .custom-price-marker:hover::after, .custom-price-marker.active::after {
          border-top-color: #0F0D09;
        }

        /* ======================================================== */
        /* RESPONSIVE MOBILE SEULEMENT (<=768px)                    */
        /* ======================================================== */
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-only {
            display: flex !important;
          }
          .map-page-main {
            flex-direction: column !important;
            height: 100vh !important;
          }
          .map-container {
            width: 100% !important;
            height: 100vh !important;
          }
          .mobile-top-bar {
            position: absolute;
            top: max(env(safe-area-inset-top, 0px) + 12px, 50px);
            left: 12px;
            right: 12px;
            z-index: 100;
            flex-direction: column;
            gap: 8px;
            background: rgba(15, 13, 9, 0.9);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(212, 175, 55, 0.35);
            border-radius: 16px;
            padding: 8px 10px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.6);
          }
          .mobile-floating-controls {
            position: absolute;
            right: 12px;
            top: max(env(safe-area-inset-top, 0px) + 135px, 175px);
            z-index: 100;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .mobile-map-carousel {
            position: absolute;
            bottom: calc(var(--bn-h, 54px) + 12px);
            left: 0;
            right: 0;
            z-index: 90;
            display: flex;
            gap: 12px;
            overflow-x: auto;
            padding: 0 16px;
            scroll-snap-type: x mandatory;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }
          .mobile-prop-card {
            flex: 0 0 280px;
            scroll-snap-align: center;
            background: #FFFFFF;
            border-radius: 18px;
            border: 1px solid rgba(0,0,0,0.08);
            box-shadow: 0 8px 24px rgba(0,0,0,0.18);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            cursor: pointer;
            transition: all 0.25s ease;
          }
          .mobile-prop-card.active {
            border: 2px solid var(--or);
            box-shadow: 0 10px 30px rgba(212,175,55,0.35);
          }
        }
      `})]})}export{p as default};