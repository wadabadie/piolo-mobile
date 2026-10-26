import{t as e}from"./vendor-react-DlxHbF51.js";var t=e();function n(){return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(`style`,{children:`
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
      `}),(0,t.jsxs)(`div`,{className:`sk-card`,children:[(0,t.jsx)(`div`,{className:`sk-shimmer sk-img`}),(0,t.jsxs)(`div`,{className:`sk-body`,children:[(0,t.jsx)(`div`,{className:`sk-shimmer sk-line sk-line--full`}),(0,t.jsx)(`div`,{className:`sk-shimmer sk-line sk-line--med`}),(0,t.jsxs)(`div`,{className:`sk-bulles`,children:[(0,t.jsx)(`div`,{className:`sk-shimmer sk-bulle`}),(0,t.jsx)(`div`,{className:`sk-shimmer sk-bulle`}),(0,t.jsx)(`div`,{className:`sk-shimmer sk-bulle`})]}),(0,t.jsx)(`div`,{className:`sk-shimmer sk-price`})]})]})]})}function r(){return(0,t.jsxs)(`div`,{className:`sk-detail-container`,children:[(0,t.jsx)(`style`,{children:`
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
      `}),(0,t.jsxs)(`div`,{className:`sk-mobile-only`,children:[(0,t.jsxs)(`div`,{className:`sk-mobile-hero`,children:[(0,t.jsx)(`div`,{className:`sk-mobile-hero-shimmer`}),(0,t.jsxs)(`div`,{className:`sk-mobile-hero-top`,children:[(0,t.jsx)(`div`,{className:`sk-circle-btn`}),(0,t.jsxs)(`div`,{style:{display:`flex`,gap:10},children:[(0,t.jsx)(`div`,{className:`sk-circle-btn`}),(0,t.jsx)(`div`,{className:`sk-circle-btn`})]})]}),(0,t.jsx)(`div`,{style:{position:`absolute`,bottom:14,right:14},children:(0,t.jsx)(`div`,{style:{width:50,height:26,borderRadius:20,background:`rgba(255,255,255,0.18)`}})})]}),(0,t.jsx)(`div`,{className:`sk-mobile-thumbs-strip`,children:[1,2,3,4,5].map(e=>(0,t.jsx)(`div`,{className:`sk-mobile-thumb-item sk-shimmer`,style:{background:`#242017`}},e))})]}),(0,t.jsx)(`div`,{className:`sk-desktop-only`,children:(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:16,width:280,marginBottom:20}})}),(0,t.jsxs)(`div`,{className:`sk-detail-grid`,children:[(0,t.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[(0,t.jsxs)(`div`,{className:`sk-desktop-only`,style:{background:`#fff`,borderRadius:20,border:`1px solid #E8E4DC`,padding:12,display:`grid`,gridTemplateColumns:`110px 1fr`,gap:12},children:[(0,t.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:8},children:[1,2,3,4].map(e=>(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:80,borderRadius:12}},e))}),(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:480,borderRadius:14}})]}),(0,t.jsxs)(`div`,{style:{background:`#fff`,borderRadius:20,border:`1px solid #E8E4DC`,padding:`20px 22px`,display:`flex`,flexDirection:`column`,gap:14},children:[(0,t.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`},children:[(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:24,width:85,borderRadius:8}}),(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:28,width:140,borderRadius:8}})]}),(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:26,width:`85%`}}),(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:16,width:`45%`}}),(0,t.jsx)(`div`,{style:{display:`flex`,gap:10,flexWrap:`wrap`,paddingTop:14,borderTop:`1px solid #E8E4DC`,borderBottom:`1px solid #E8E4DC`,paddingBottom:14},children:[1,2,3,4].map(e=>(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:38,width:100,borderRadius:12}},e))}),(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:16,width:`100%`}}),(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:16,width:`92%`}}),(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:16,width:`70%`}})]})]}),(0,t.jsxs)(`div`,{style:{background:`#fff`,borderRadius:20,border:`1px solid #E8E4DC`,padding:`24px 22px`,display:`flex`,flexDirection:`column`,gap:16},children:[(0,t.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:14},children:[(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{width:56,height:56,borderRadius:`50%`}}),(0,t.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:6,flex:1},children:[(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:16,width:`60%`}}),(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:12,width:`40%`}})]})]}),[1,2,3].map(e=>(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:46,borderRadius:12}},e))]})]}),(0,t.jsx)(`div`,{className:`sk-mobile-only`,children:(0,t.jsxs)(`div`,{className:`sk-mobile-sticky-bar`,children:[(0,t.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:4},children:[(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:10,width:60,background:`rgba(255,255,255,0.2)`}}),(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:20,width:110,background:`linear-gradient(90deg,#D4AF37,#F6D365)`}})]}),(0,t.jsxs)(`div`,{style:{display:`flex`,gap:8},children:[(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:42,width:42,borderRadius:12,background:`rgba(255,255,255,0.15)`}}),(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:42,width:140,borderRadius:12,background:`linear-gradient(90deg,#D4AF37,#F6D365)`}})]})]})})]})}function i(){return(0,t.jsxs)(`div`,{className:`sk-card`,style:{minWidth:260,borderRadius:16,border:`1px solid #E8E3DA`},children:[(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:140,borderRadius:`16px 16px 0 0`}}),(0,t.jsxs)(`div`,{style:{padding:`12px 14px`,display:`flex`,flexDirection:`column`,gap:8},children:[(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:11,width:`40%`}}),(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:14,width:`85%`}}),(0,t.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginTop:10,paddingTop:8,borderTop:`1px solid #E8E3DA`},children:[(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:12,width:`50%`}}),(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:12,width:`25%`}})]})]})]})}function a(){return(0,t.jsxs)(`div`,{className:`sk-card`,style:{minWidth:300,borderRadius:20,border:`1px solid #E8E3DA`},children:[(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:135,borderRadius:`20px 20px 0 0`}}),(0,t.jsxs)(`div`,{style:{padding:`24px 16px 16px`,display:`flex`,flexDirection:`column`,gap:10},children:[(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:12,width:`35%`}}),(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:18,width:`65%`}}),(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:13,width:`45%`}}),(0,t.jsxs)(`div`,{style:{display:`flex`,gap:8,margin:`8px 0`},children:[(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:40,flex:1,borderRadius:10}}),(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:40,flex:1,borderRadius:10}}),(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:40,flex:1,borderRadius:10}})]}),(0,t.jsxs)(`div`,{style:{display:`flex`,gap:8,marginTop:4},children:[(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:38,flex:1,borderRadius:10}}),(0,t.jsx)(`div`,{className:`sk-shimmer`,style:{height:38,flex:1,borderRadius:10}})]})]})]})}export{i,r as n,a as r,n as t};