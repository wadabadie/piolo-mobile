import{r as e}from"./rolldown-runtime-Cq0jCQ29.js";import{g as t,l as n,p as r,r as i,t as a,u as o}from"./vendor-react-DlxHbF51.js";import{i as s}from"./api-B9EIXznq.js";import{n as c}from"./AuthContext-CFgS1DSp.js";import{t as l}from"./media-CF4hGFW6.js";var u=e(t(),1),d=a(),f=`
  /* ── LUXURY REAL ESTATE CHAT SYSTEM — PIOLO DESIGN ── */
  .chat-page-scope {
    --or: #D4AF37;
    --or-l: #F6D365;
    --or-d: #B8962A;
    --noir: #0F0D09;
    --noir-card: #17140E;
    --bg-main: #F4F2ED;
    --bg-sidebar: #FFFFFF;
    --border: #E8E3D8;
    --border-gold: rgba(212, 175, 55, 0.3);
    position: fixed;
    inset: 0;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    width: 100vw;
    height: 100%;
    height: 100vh;
    height: 100dvh;
    height: -webkit-fill-available;
    display: flex;
    background: #F4F2ED;
    overflow: hidden;
    z-index: 9999;
    min-height: 0;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Left Sidebar: Conversations List ── */
  .chat-sidebar {
    width: 390px;
    min-width: 350px;
    background: var(--bg-sidebar);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    z-index: 10;
    box-shadow: 4px 0 20px rgba(15, 13, 9, 0.03);
    height: 100%;
    height: 100vh;
    height: 100dvh;
    height: -webkit-fill-available;
    min-height: 0;
  }

  .chat-sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: max(14px, env(safe-area-inset-top, 14px)) 20px 14px;
    background: #FFFFFF;
    border-bottom: 1px solid var(--border);
    height: calc(72px + env(safe-area-inset-top, 0px));
    box-sizing: border-box;
    flex-shrink: 0;
  }

  .chat-sidebar-profile {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .chat-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2A261D, #0F0D09);
    color: var(--or);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 15px;
    border: 2px solid var(--or);
    flex-shrink: 0;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(212, 175, 55, 0.2);
  }
  
  .chat-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .chat-sidebar-header h2 {
    font-size: 19px;
    font-weight: 800;
    margin: 0;
    color: var(--noir);
    letter-spacing: -0.3px;
  }

  .chat-back-dash {
    font-size: 12px;
    font-weight: 700;
    color: var(--noir);
    background: #F5F2EB;
    border: 1px solid var(--border);
    padding: 7px 14px;
    border-radius: 20px;
    text-decoration: none;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .chat-back-dash:hover {
    background: linear-gradient(135deg, var(--or), var(--or-l));
    color: #0F0D09;
    border-color: var(--or);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.25);
  }

  .chat-search-bar {
    padding: 12px 18px;
    background: #FFFFFF;
    border-bottom: 1px solid #F0ECE4;
  }

  .chat-search-input-wrapper {
    display: flex;
    align-items: center;
    background: #F6F4EE;
    border: 1px solid #E6E1D6;
    border-radius: 24px;
    padding: 9px 16px;
    gap: 10px;
    transition: all 0.2s ease;
  }

  .chat-search-input-wrapper:focus-within {
    background: #FFFFFF;
    border-color: var(--or);
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
  }

  .chat-search-input-wrapper input {
    border: none;
    background: transparent;
    width: 100%;
    font-size: 16px !important;
    outline: none;
    font-family: 'Poppins', sans-serif;
    color: var(--noir);
  }

  .chat-search-input-wrapper input::placeholder {
    color: #9C9487;
    font-size: 13.5px;
  }

  .chat-sidebar-list {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  }

  .chat-conv-item {
    display: flex;
    align-items: center;
    padding: 15px 18px;
    border-bottom: 1px solid #F5F2EC;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    transition: background 0.2s ease;
    position: relative;
    gap: 14px;
  }

  .chat-conv-item:hover {
    background: #FAF8F4;
  }

  .chat-conv-item.active {
    background: #F5F1E6;
    border-left: 4px solid var(--or);
  }

  .chat-conv-info {
    flex: 1;
    min-width: 0;
  }

  .chat-conv-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 4px;
  }

  .chat-conv-name {
    font-weight: 700;
    font-size: 14.5px;
    color: var(--noir);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chat-conv-time {
    font-size: 11px;
    color: #8C8477;
    flex-shrink: 0;
    font-weight: 600;
  }

  .chat-conv-preview {
    font-size: 13px;
    color: #6C665C;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .chat-conv-prop {
    font-size: 11px;
    background: rgba(212, 175, 55, 0.12);
    color: #92700C;
    border: 1px solid rgba(212, 175, 55, 0.25);
    font-weight: 700;
    padding: 2px 9px;
    border-radius: 12px;
    display: inline-block;
    margin-top: 6px;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chat-unread-badge {
    background: linear-gradient(135deg, var(--or), var(--or-l));
    color: #0F0D09;
    font-size: 11px;
    font-weight: 800;
    padding: 2px 8px;
    border-radius: 12px;
    margin-left: auto;
    box-shadow: 0 2px 6px rgba(212, 175, 55, 0.4);
  }

  .chat-empty-sidebar {
    text-align: center;
    padding: 60px 24px;
    color: #8C8477;
    font-size: 14px;
  }

  /* ── Right Pane: Active Discussion ── */
  .chat-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #F4F2ED;
    background-image: radial-gradient(rgba(212, 175, 55, 0.12) 1.5px, transparent 1.5px);
    background-size: 26px 26px;
    position: relative;
    min-width: 0;
    min-height: 0;
    height: 100%;
    overflow: hidden;
  }

  /* Header Discussion */
  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: max(12px, env(safe-area-inset-top, 12px)) 24px 12px;
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--border);
    height: calc(72px + env(safe-area-inset-top, 0px));
    box-sizing: border-box;
    box-shadow: 0 2px 10px rgba(15, 13, 9, 0.04);
    flex: 0 0 calc(72px + env(safe-area-inset-top, 0px));
    position: sticky;
    top: 0;
    z-index: 25;
  }

  .chat-header-left {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
  }

  .chat-header-back {
    display: none;
    background: #F5F2EC;
    border: 1px solid var(--border);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: var(--noir);
    cursor: pointer;
    margin-right: 4px;
    transition: all 0.2s ease;
  }

  .chat-header-back:hover {
    background: var(--or);
    color: #000;
  }

  .chat-header-info {
    min-width: 0;
  }

  .chat-header-name {
    font-size: 16px;
    font-weight: 800;
    color: var(--noir);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chat-status-pill {
    font-size: 11.5px;
    color: #10B981;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 1px;
  }

  .chat-status-pill i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #10B981;
    display: inline-block;
  }

  /* ── Interactive Pinned Property Banner ── */
  .chat-pinned-property {
    background: linear-gradient(135deg, #1A1711, #0F0D09);
    color: #FFFFFF;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    border-bottom: 1px solid rgba(212, 175, 55, 0.35);
    flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
    animation: fadeIn 0.25s ease;
    z-index: 20;
  }

  .chat-pinned-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .chat-pinned-img {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    object-fit: cover;
    border: 1.5px solid var(--or);
    flex-shrink: 0;
  }

  .chat-pinned-meta {
    min-width: 0;
  }

  .chat-pinned-title {
    font-size: 13.5px;
    font-weight: 700;
    color: #FFFFFF;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chat-pinned-price {
    font-size: 12px;
    color: var(--or-l);
    font-weight: 700;
    margin-top: 2px;
  }

  .chat-pinned-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .chat-pinned-btn {
    padding: 6px 12px;
    border-radius: 18px;
    font-size: 11.5px;
    font-weight: 700;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: all 0.2s ease;
    cursor: pointer;
    border: none;
  }

  .chat-pinned-btn.gold {
    background: linear-gradient(135deg, var(--or), var(--or-l));
    color: #0F0D09;
    box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
  }

  .chat-pinned-btn.gold:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.5);
  }

  .chat-pinned-btn.outline {
    background: rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
    border: 1px solid rgba(255, 255, 255, 0.25);
  }

  .chat-pinned-btn.outline:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  /* ── Messages Container ── */
  .chat-messages-container {
    flex: 1 1 auto;
    min-height: 0;
    padding: 20px 24px;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* Date Badge Floating */
  .chat-date-separator {
    text-align: center;
    margin: 14px 0 10px;
    position: relative;
  }

  .chat-date-separator span {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(8px);
    border: 1px solid #E4DFD4;
    padding: 4px 14px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    color: #7A7265;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    text-transform: capitalize;
  }

  /* Message Bubbles */
  .chat-bubble-wrapper {
    display: flex;
    flex-direction: column;
    width: fit-content;
    max-width: 78%;
    position: relative;
    animation: popIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    margin-bottom: 2px;
  }

  @keyframes popIn {
    from { opacity: 0; transform: translateY(6px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .chat-bubble-wrapper.sent {
    align-self: flex-end;
    align-items: flex-end;
    margin-left: auto;
  }

  .chat-bubble-wrapper.received {
    align-self: flex-start;
    align-items: flex-start;
    margin-right: auto;
  }

  .chat-bubble {
    padding: 8px 14px;
    border-radius: 18px;
    position: relative;
    font-size: 14.5px;
    line-height: 1.45;
    box-shadow: 0 2px 8px rgba(15, 13, 9, 0.05);
    width: fit-content;
    max-width: 100%;
    box-sizing: border-box;
    display: inline-block;
  }

  .sent .chat-bubble {
    background: linear-gradient(145deg, #17140E 0%, #242017 100%);
    color: #FFFFFF;
    border: 1px solid rgba(212, 175, 55, 0.35);
    border-bottom-right-radius: 4px;
    text-align: left;
  }

  .received .chat-bubble {
    background: #FFFFFF;
    color: #17140E;
    border: 1px solid #EAE5D9;
    border-bottom-left-radius: 4px;
    text-align: left;
  }

  .chat-meta {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    margin-top: 4px;
    font-size: 10.5px;
    color: rgba(255, 255, 255, 0.65);
    font-weight: 500;
  }

  .received .chat-meta {
    color: #8C8477;
  }

  .chat-reply-quote {
    background: rgba(0, 0, 0, 0.06);
    border-left: 3.5px solid var(--or);
    padding: 6px 10px;
    margin-bottom: 8px;
    border-radius: 8px;
    font-size: 12.5px;
  }

  .sent .chat-reply-quote {
    background: rgba(255, 255, 255, 0.1);
  }

  .chat-reply-quote strong {
    color: var(--or-l);
    display: block;
    margin-bottom: 2px;
    font-size: 11px;
    text-transform: uppercase;
  }

  /* Option dropdown */
  .chat-bubble-menu-trigger {
    position: absolute;
    top: 6px;
    right: 6px;
    background: none;
    border: none;
    color: #888;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3px;
    border-radius: 50%;
    z-index: 10;
  }

  .sent .chat-bubble-menu-trigger {
    color: rgba(255, 255, 255, 0.7);
  }

  .chat-bubble-wrapper:hover .chat-bubble-menu-trigger {
    opacity: 1;
  }

  .chat-bubble-dropdown {
    position: absolute;
    top: 28px;
    right: 8px;
    background: #FFFFFF;
    border: 1px solid var(--border);
    border-radius: 12px;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
    z-index: 30;
    min-width: 170px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .chat-bubble-dropdown button {
    background: none;
    border: none;
    padding: 10px 14px;
    text-align: left;
    font-size: 13px;
    font-family: 'Poppins', sans-serif;
    color: var(--noir);
    cursor: pointer;
    transition: background 0.15s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .chat-bubble-dropdown button:hover {
    background: #F7F5EE;
    color: var(--or-d);
  }

  .chat-bubble-dropdown button.delete-btn {
    color: #DC2626;
  }

  .chat-bubble-dropdown button.delete-btn:hover {
    background: #FEF2F2;
  }

  /* Deleted message */
  .chat-bubble.deleted {
    font-style: italic;
    color: #8C8477 !important;
    background: #EAE6DD !important;
    border-color: #DBD5C9 !important;
  }

  .sent .chat-bubble.deleted {
    color: #AAA !important;
    background: #242017 !important;
  }

  /* ── Waveform Audio Player Component ── */
  .chat-voice-player {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 4px 0;
    min-width: 220px;
  }

  .chat-voice-play-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: none;
    background: linear-gradient(135deg, var(--or), var(--or-l));
    color: #0F0D09;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(212, 175, 55, 0.4);
    flex-shrink: 0;
    transition: transform 0.15s ease;
  }

  .chat-voice-play-btn:hover {
    transform: scale(1.06);
  }

  .chat-voice-waveform {
    display: flex;
    align-items: center;
    gap: 2.5px;
    flex: 1;
    height: 28px;
  }

  .chat-voice-bar {
    width: 3px;
    border-radius: 3px;
    background: rgba(212, 175, 55, 0.4);
    transition: height 0.15s ease, background 0.15s ease;
  }

  .chat-voice-bar.active {
    background: var(--or-l);
  }

  .received .chat-voice-bar {
    background: #D1CAC0;
  }

  .received .chat-voice-bar.active {
    background: #8A6811;
  }

  .chat-voice-time {
    font-size: 11px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .chat-voice-speed-btn {
    font-size: 10.5px;
    font-weight: 800;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: #FFFFFF;
    padding: 2px 6px;
    border-radius: 10px;
    cursor: pointer;
  }

  .received .chat-voice-speed-btn {
    background: #F0ECE4;
    border-color: #E0DAD0;
    color: #17140E;
  }

  /* ── Real-Estate Quick Action Chips Bar ── */
  .chat-quick-chips {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 18px 4px;
    background: #FFFFFF;
    overflow-x: auto;
    scrollbar-width: none;
    border-top: 1px solid #F0ECE4;
    flex-shrink: 0;
  }

  .chat-quick-chips::-webkit-scrollbar {
    display: none;
  }

  .chat-chip-btn {
    white-space: nowrap;
    border: 1px solid #E6E1D6;
    background: #FAF8F4;
    color: #6B6355;
    padding: 6px 13px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'Poppins', sans-serif;
  }

  .chat-chip-btn:hover {
    border-color: var(--or);
    background: #FFFFFF;
    color: #8A6811;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(212, 175, 55, 0.15);
  }

  /* ── Input Bar ── */
  .chat-input-bar {
    background: #FFFFFF;
    border-top: 1px solid var(--border);
    padding-top: 10px;
    padding-left: 16px;
    padding-right: 16px;
    padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-sizing: border-box;
    flex: 0 0 auto;
    width: 100%;
  }

  .chat-reply-preview {
    background: #FAF8F4;
    border-left: 4px solid var(--or);
    padding: 8px 14px;
    border-radius: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
  }

  .chat-file-staged {
    background: #FFFBEB;
    border: 1px solid var(--or);
    padding: 8px 14px;
    border-radius: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    font-weight: 600;
    color: #8A6811;
  }

  .chat-input-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .chat-btn-icon {
    background: #F6F4EE;
    border: 1px solid #E6E1D6;
    color: #5C5549;
    cursor: pointer;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .chat-btn-icon:hover {
    background: #FFFFFF;
    border-color: var(--or);
    color: var(--or-d);
    transform: scale(1.05);
  }

  .chat-btn-icon.recording {
    background: #FEF2F2;
    border-color: #DC2626;
    color: #DC2626;
    animation: pulseRed 1s infinite;
  }

  @keyframes pulseRed {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
    50% { transform: scale(1.08); box-shadow: 0 0 0 6px rgba(220, 38, 38, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
  }

  .chat-textarea {
    flex: 1;
    border: 1.5px solid #E2DDD2;
    background: #F9F8F5;
    border-radius: 24px;
    padding: 10px 18px;
    font-size: 16px !important;
    font-family: 'Poppins', sans-serif;
    outline: none;
    resize: none;
    max-height: 120px;
    transition: all 0.2s ease;
    color: var(--noir);
  }

  .chat-textarea:focus {
    background: #FFFFFF;
    border-color: var(--or);
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
  }

  .chat-btn-send {
    background: linear-gradient(135deg, var(--or), var(--or-l));
    color: #0F0D09;
    border: none;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    flex-shrink: 0;
    box-shadow: 0 3px 10px rgba(212, 175, 55, 0.4);
  }

  .chat-btn-send:hover {
    transform: scale(1.06);
    box-shadow: 0 5px 16px rgba(212, 175, 55, 0.6);
  }

  .chat-unselected-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #8C8477;
    text-align: center;
    padding: 30px;
  }

  /* ── Responsive Mobile ── */
  @media (max-width: 850px) {
    .chat-page-scope {
      height: 100%;
      height: 100vh;
      height: 100dvh;
      height: -webkit-fill-available;
      top: 0; bottom: 0; left: 0; right: 0; inset: 0;
    }
    .chat-sidebar {
      width: 100%;
      min-width: 100%;
      display: flex;
      flex-direction: column;
      height: 100%;
      height: 100vh;
      height: 100dvh;
      height: -webkit-fill-available;
      min-height: 0;
    }
    .chat-main {
      display: none;
      height: 100%;
      height: 100vh;
      height: 100dvh;
      height: -webkit-fill-available;
      min-height: 0;
    }
    .chat-page-scope.has-active-chat .chat-sidebar {
      display: none;
    }
    .chat-page-scope.has-active-chat .chat-main {
      display: flex;
      width: 100%;
    }
    .chat-header-back {
      display: flex;
    }
    .chat-bubble-wrapper {
      max-width: 88%;
    }
    .chat-pinned-property {
      padding: 8px 14px;
    }
    .chat-pinned-img {
      width: 40px;
      height: 40px;
    }
  }
`,p=({isRead:e,isPending:t})=>t?(0,d.jsxs)(`svg`,{width:`14`,height:`14`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,style:{marginLeft:4,verticalAlign:`middle`,opacity:.7},children:[(0,d.jsx)(`circle`,{cx:`12`,cy:`12`,r:`10`}),(0,d.jsx)(`polyline`,{points:`12 6 12 12 16 14`})]}):(0,d.jsx)(`svg`,{viewBox:`0 0 16 15`,width:`15`,height:`14`,style:{display:`inline-block`,verticalAlign:`middle`,marginLeft:`4px`,fill:e?`#D4AF37`:`rgba(255,255,255,0.6)`},children:(0,d.jsx)(`path`,{d:`M15.01 3.3L8.11 10.19 5.3 7.4c-.3-.3-.8-.3-1.1 0-.3.3-.3.8 0 1.1l3.36 3.36c.16.16.37.24.59.24s.43-.08.59-.24l7.46-7.46c.3-.3.3-.8 0-1.1-.3-.3-.8-.3-1.1 0zM9 10.19l-.9-.9-.1-.1-.7.7L8.2 10.8c.16.16.37.24.59.24s.43-.08.59-.24L15 5c.3-.3.3-.8 0-1.1l-.1-.1-.1-.1L9 10.19z`})});function m({src:e,isSent:t}){let n=(0,u.useRef)(null),[r,i]=(0,u.useState)(!1),[a,o]=(0,u.useState)(0),[s,c]=(0,u.useState)(0),[l,f]=(0,u.useState)(0),[p,m]=(0,u.useState)(1),h=()=>{n.current&&(r?(n.current.pause(),i(!1)):n.current.play().then(()=>i(!0)).catch(()=>{}))},g=()=>{if(!n.current)return;let e=n.current.currentTime,t=n.current.duration||1;f(e),o(e/t)},_=()=>{n.current&&c(n.current.duration||0)},v=()=>{i(!1),o(0),f(0)},y=()=>{let e=p===1?1.5:p===1.5?2:1;m(e),n.current&&(n.current.playbackRate=e)},b=e=>{let t=Math.floor(e||0),n=Math.floor(t/60),r=t%60;return`${n}:${r<10?`0`:``}${r}`},x=[40,70,30,90,50,80,100,60,45,85,30,75,95,60,40,80,55,35];return(0,d.jsxs)(`div`,{className:`chat-voice-player`,children:[(0,d.jsx)(`audio`,{ref:n,src:e,onTimeUpdate:g,onLoadedMetadata:_,onEnded:v,preload:`metadata`}),(0,d.jsx)(`button`,{type:`button`,className:`chat-voice-play-btn`,onClick:h,"aria-label":r?`Pause`:`Lecture`,children:r?(0,d.jsxs)(`svg`,{width:`14`,height:`14`,viewBox:`0 0 24 24`,fill:`currentColor`,children:[(0,d.jsx)(`rect`,{x:`6`,y:`4`,width:`4`,height:`16`}),(0,d.jsx)(`rect`,{x:`14`,y:`4`,width:`4`,height:`16`})]}):(0,d.jsx)(`svg`,{width:`14`,height:`14`,viewBox:`0 0 24 24`,fill:`currentColor`,children:(0,d.jsx)(`polygon`,{points:`5 3 19 12 5 21 5 3`})})}),(0,d.jsx)(`div`,{className:`chat-voice-waveform`,onClick:e=>{let t=e.currentTarget.getBoundingClientRect(),r=e.clientX-t.left,i=Math.max(0,Math.min(1,r/t.width));n.current&&s&&(n.current.currentTime=i*s,o(i))},children:x.map((e,t)=>(0,d.jsx)(`div`,{className:`chat-voice-bar ${t/x.length<=a?`active`:``}`,style:{height:`${e}%`}},t))}),(0,d.jsx)(`span`,{className:`chat-voice-time`,children:b(r?l:s)}),(0,d.jsxs)(`button`,{type:`button`,className:`chat-voice-speed-btn`,onClick:y,children:[p,`x`]})]})}function h(){let{t:e}=r(),{id:t}=o(),a=n(),{user:h}=c(),[g,_]=(0,u.useState)([]),[v,y]=(0,u.useState)(!0),[b,x]=(0,u.useState)(null),[S,C]=(0,u.useState)([]),[w,T]=(0,u.useState)(``),[E,D]=(0,u.useState)(null),[O,k]=(0,u.useState)(null),[A,j]=(0,u.useState)(``),[M,N]=(0,u.useState)(null),[P,F]=(0,u.useState)(null),[I,L]=(0,u.useState)(!1),[R,z]=(0,u.useState)(!1),[B,ee]=(0,u.useState)(null),[te,V]=(0,u.useState)({}),[ne,H]=(0,u.useState)(!1),U=(0,u.useRef)(null),W=(0,u.useRef)([]),G=(0,u.useRef)({}),K=(0,u.useRef)(null),q=(0,u.useRef)(null),J=(0,u.useRef)(null);(0,u.useEffect)(()=>{let e=()=>{window.innerWidth<=850&&window.visualViewport?V({height:`${window.visualViewport.height}px`,top:`${window.visualViewport.offsetTop}px`}):V({})};return e(),window.visualViewport?.addEventListener(`resize`,e),window.visualViewport?.addEventListener(`scroll`,e),window.addEventListener(`resize`,e),()=>{window.visualViewport?.removeEventListener(`resize`,e),window.visualViewport?.removeEventListener(`scroll`,e),window.removeEventListener(`resize`,e)}},[]),(0,u.useEffect)(()=>{let e=document.documentElement.style.backgroundColor,t=document.body.style.backgroundColor,n=b?`#F4F2ED`:`#FFFFFF`;return document.documentElement.style.backgroundColor=n,document.body.style.backgroundColor=n,()=>{document.documentElement.style.backgroundColor=e,document.body.style.backgroundColor=t}},[b]),(0,u.useEffect)(()=>{W.current=S},[S]);let Y=()=>{U.current?.scrollIntoView({behavior:`smooth`})},X=async()=>{try{_((await s.list()).data||[])}catch(e){console.error(`Erreur chargement discussions:`,e)}finally{y(!1)}};(0,u.useEffect)(()=>{X()},[]),(0,u.useEffect)(()=>{if(!t){x(null),C([]),q.current&&=(q.current.close(),null);return}let n=!0,r=g.find(e=>String(e.id)===String(t));r&&(!b||String(b.id)!==String(t))&&x(r),G.current[t]&&(C(G.current[t]),setTimeout(Y,40)),(async()=>{try{let e=await s.detail(t);if(n){x(e.data.conversation);let n=e.data.messages||[];C(n),G.current[t]=n,setTimeout(Y,80)}}catch(e){console.error(`Erreur chargement discussion:`,e),n&&!G.current[t]&&a(`/messages`)}})();let i=localStorage.getItem(`access_token`),o=`${window.location.protocol===`https:`?`wss:`:`ws:`}//${window.location.hostname||`127.0.0.1`}:${window.location.port===`3000`||window.location.port===`5173`?`8080`:window.location.port}/ws/chat/${t}/?token=${i||``}`,c=null;try{c=new WebSocket(o),q.current=c,c.onopen=()=>{try{c.send(JSON.stringify({type:`mark_read`}))}catch{}},c.onmessage=r=>{try{let i=JSON.parse(r.data);if(i.type===`chat_message`&&i.message){let e=i.message;n&&(C(n=>{if(new Set(n.map(e=>e.id)).has(e.id))return n;let r=[...n.filter(t=>!(typeof t.id==`string`&&t.id.startsWith(`temp-`)&&t.content===e.content&&t.sender?.id===e.sender?.id)),e];return G.current[t]=r,r}),e.sender?.id!==h?.id&&c&&c.readyState===WebSocket.OPEN&&c.send(JSON.stringify({type:`mark_read`})),setTimeout(Y,50))}else i.type===`user_typing`?n&&(H(i.is_typing),J.current&&clearTimeout(J.current),i.is_typing&&(J.current=setTimeout(()=>H(!1),3500))):i.type===`messages_read`?n&&C(e=>{let n=e.map(e=>e.sender?.id===h?.id?{...e,is_read:!0}:e);return G.current[t]=n,n}):i.type===`message_deleted`&&n&&C(n=>{let r;return r=i.delete_type===`everyone`?n.map(t=>t.id===i.message_id?{...t,is_deleted_for_everyone:!0,content:e(`chat.deleted_message`),file_url:null,voice_url:null}:t):n.filter(e=>e.id!==i.message_id),G.current[t]=r,r})}catch{}}}catch{}let l=setInterval(async()=>{if(!(!t||document.hidden)&&!(q.current&&q.current.readyState===WebSocket.OPEN))try{let e=W.current.filter(e=>typeof e.id==`number`),r=e.length>0?Math.max(...e.map(e=>e.id)):0,i=await s.poll(t,r);i.data&&i.data.messages&&i.data.messages.length>0&&n&&(C(e=>{let n=new Set(e.map(e=>e.id)),r=i.data.messages.filter(t=>n.has(t.id)?!1:!e.some(e=>typeof e.id==`string`&&e.id.startsWith(`temp-`)&&e.content===t.content&&e.sender?.id===t.sender?.id));if(r.length===0)return e;let a=[...e,...r];return G.current[t]=a,a}),setTimeout(Y,100))}catch{}},3e3);return()=>{n=!1,clearInterval(l),c&&c.close(),J.current&&clearTimeout(J.current)}},[t]),(0,u.useEffect)(()=>{let e=()=>{D(null)};return document.addEventListener(`click`,e),()=>document.removeEventListener(`click`,e)},[]);let Z=async(e,t=null)=>{if(e&&e.preventDefault&&e.preventDefault(),!A.trim()&&!M&&!t||I||!b)return;let n=A.trim(),r=M,i=P,a=`temp-${Date.now()}`,o={id:a,sender:h,content:n,file_url:r?URL.createObjectURL(r):null,file_name:r?r.name:null,voice_url:t?URL.createObjectURL(t):null,reply_to_content:i?.content,created_at:new Date().toISOString(),time_formatted:new Date().toLocaleTimeString(`fr-FR`,{hour:`2-digit`,minute:`2-digit`}),is_pending:!0,is_read:!1};C(e=>{let t=[...e,o];return G.current[b.id]=t,t}),j(``),N(null),F(null),K.current&&(K.current.value=null),setTimeout(Y,30),L(!0);let c=new FormData;n&&c.append(`content`,n),r&&c.append(`file`,r),t&&c.append(`voice`,t,`vocal_message.webm`),i&&c.append(`reply_to_id`,i.id);try{let e=await s.send(b.id,c);C(t=>{let n=t.some(t=>t.id===e.data.id),r;return r=n?t.filter(e=>e.id!==a):t.map(t=>t.id===a?e.data:t),G.current[b.id]=r,r}),X()}catch{alert(`Erreur lors de l'envoi du message.`),C(e=>{let t=e.filter(e=>e.id!==a);return G.current[b.id]=t,t})}finally{L(!1)}},re=e=>{e.key===`Enter`&&!e.shiftKey&&(e.preventDefault(),Z(e))},ie=async()=>{if(R)B&&B.state!==`inactive`&&B.stop(),z(!1);else try{let e=await navigator.mediaDevices.getUserMedia({audio:!0}),t=new MediaRecorder(e),n=[];t.ondataavailable=e=>{e.data.size>0&&n.push(e.data)},t.onstop=()=>{Z(null,new Blob(n,{type:`audio/webm`})),e.getTracks().forEach(e=>e.stop())},t.start(),ee(t),z(!0)}catch(e){console.error(`Erreur accès micro:`,e),alert(`Impossible d'accéder au microphone.`)}},Q=async(t,n)=>{try{if(typeof t==`string`&&t.startsWith(`temp-`)){C(e=>{let n=e.filter(e=>e.id!==t);return b&&(G.current[b.id]=n),n});return}await s.delete(t,n),C(r=>{let i;return i=n===`everyone`?r.map(n=>n.id===t?{...n,is_deleted_for_everyone:!0,content:e(`chat.deleted_message`),file_url:null,voice_url:null}:n):r.filter(e=>e.id!==t),b&&(G.current[b.id]=i),i}),X()}catch(e){console.error(`Erreur suppression:`,e),alert(e.response?.data?.error||`Erreur lors de la suppression du message.`)}},$=e=>{if(!e)return`P`;let t=(e.first_name||``)[0]||``,n=(e.last_name||``)[0]||``;return t||n?(t+n).toUpperCase():(e.email||`P`)[0].toUpperCase()},ae=g.filter(e=>{let t=`${e.other_user?.first_name||``} ${e.other_user?.last_name||``} ${e.other_user?.email||``}`.toLowerCase(),n=`${e.property?.property_type||``} ${e.property?.city||``} ${e.property?.title||``}`.toLowerCase();return t.includes(w.toLowerCase())||n.includes(w.toLowerCase())}),oe=h?.role===`BAILLEUR`||h?.is_bailleur,se=oe?[{label:`✅ Logement disponible`,text:`Bonjour, le bien est toujours disponible pour une location.`},{label:`📅 Proposer une visite`,text:`Êtes-vous disponible pour une visite cette semaine ? Indiquez-moi vos créneaux.`},{label:`📄 Demander le dossier`,text:`Merci de me transmettre votre dossier locataire sur Piolo afin que je puisse l'examiner.`},{label:`✍️ Conditions du bail`,text:`Le bail prévoit une caution de 2 mois et 1 mois d'avance. Êtes-vous en accord avec ces termes ?`}]:[{label:`📅 Demander une visite`,text:`Bonjour, je suis très intéressé par votre bien. Serait-il possible de programmer une visite ?`},{label:`📂 Partager mon dossier`,text:`Mon dossier locataire est 100% complet et vérifié sur Piolo. Je viens de vous le transmettre.`},{label:`❓ Disponibilité`,text:`Bonjour, ce logement est-il toujours disponible à la date indiquée ?`},{label:`🏷️ Négocier`,text:`Bonjour, je souhaiterais savoir si le loyer est légèrement négociable compte tenu d'un bail long terme.`}];return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(`style`,{children:f}),(0,d.jsxs)(`div`,{className:`chat-page-scope ${t?`has-active-chat`:``}`,style:te,children:[(0,d.jsxs)(`div`,{className:`chat-sidebar`,children:[(0,d.jsxs)(`div`,{className:`chat-sidebar-header`,children:[(0,d.jsxs)(`div`,{className:`chat-sidebar-profile`,children:[(0,d.jsx)(`div`,{className:`chat-avatar`,title:`Mon Profil`,children:h?.avatar_url||h?.avatar?(0,d.jsx)(`img`,{src:l(h.avatar_url||h.avatar),alt:`Me`,onError:e=>{e.currentTarget.style.display=`none`}}):h?.first_name?.[0]?.toUpperCase()||`U`}),(0,d.jsx)(`div`,{children:(0,d.jsx)(`h2`,{children:e(`chat.messages`)})})]}),(0,d.jsx)(i,{to:oe?`/dashboard/bailleur`:`/dashboard/locataire`,className:`chat-back-dash`,children:`← Dashboard`})]}),(0,d.jsx)(`div`,{className:`chat-search-bar`,children:(0,d.jsxs)(`div`,{className:`chat-search-input-wrapper`,children:[(0,d.jsxs)(`svg`,{width:`18`,height:`18`,viewBox:`0 0 24 24`,fill:`none`,stroke:`#8C8477`,strokeWidth:`2`,children:[(0,d.jsx)(`circle`,{cx:`11`,cy:`11`,r:`8`}),(0,d.jsx)(`line`,{x1:`21`,y1:`21`,x2:`16.65`,y2:`16.65`})]}),(0,d.jsx)(`input`,{type:`text`,placeholder:`Rechercher une discussion ou un bien...`,value:w,onChange:e=>T(e.target.value)}),w&&(0,d.jsx)(`span`,{style:{cursor:`pointer`,fontWeight:`bold`,color:`#8C8477`},onClick:()=>T(``),children:`×`})]})}),(0,d.jsx)(`div`,{className:`chat-sidebar-list`,children:v?(0,d.jsx)(`div`,{style:{padding:40,textAlign:`center`,color:`#8C8477`},children:e(`chat.loading`)}):ae.length===0?(0,d.jsxs)(`div`,{className:`chat-empty-sidebar`,children:[(0,d.jsx)(`div`,{style:{fontSize:42,marginBottom:12},children:`💬`}),(0,d.jsx)(`strong`,{style:{display:`block`,color:`var(--noir)`,marginBottom:4},children:e(`chat.no_messages`)}),(0,d.jsx)(`small`,{style:{color:`#8C8477`,lineHeight:1.5,display:`block`},children:`Cliquez sur « Contacter le bailleur » depuis une annonce pour lancer une discussion instantanée.`})]}):ae.map(e=>{let t=b&&b.id===e.id,n=e.other_user||{},r=n.first_name||n.last_name?`${n.first_name||``} ${n.last_name||``}`:n.email||`Bailleur`,i=l(n.avatar_url||n.avatar);return(0,d.jsxs)(`div`,{className:`chat-conv-item ${t?`active`:``}`,onClick:()=>{x(e),G.current[e.id]&&C(G.current[e.id]),a(`/messages/${e.id}`)},children:[(0,d.jsx)(`div`,{className:`chat-avatar`,children:i?(0,d.jsx)(`img`,{src:i,alt:r,onError:e=>{e.currentTarget.style.display=`none`}}):$(n)}),(0,d.jsxs)(`div`,{className:`chat-conv-info`,children:[(0,d.jsxs)(`div`,{className:`chat-conv-top`,children:[(0,d.jsx)(`span`,{className:`chat-conv-name`,children:r.trim()}),(0,d.jsx)(`span`,{className:`chat-conv-time`,children:e.updated_at?new Date(e.updated_at).toLocaleDateString(`fr-FR`,{day:`2-digit`,month:`short`}):``})]}),(0,d.jsxs)(`div`,{className:`chat-conv-preview`,children:[(0,d.jsx)(`span`,{style:{flex:1,overflow:`hidden`,textOverflow:`ellipsis`},children:e.last_message||`Nouvelle conversation`}),e.unread_count>0&&(0,d.jsx)(`span`,{className:`chat-unread-badge`,children:e.unread_count})]}),e.property&&(0,d.jsxs)(`span`,{className:`chat-conv-prop`,children:[`🏠 `,e.property.property_type||`Bien`,` — `,e.property.city||`Cameroun`]})]})]},e.id)})})]}),(0,d.jsx)(`div`,{className:`chat-main`,children:b?(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(`div`,{className:`chat-header`,children:(0,d.jsxs)(`div`,{className:`chat-header-left`,children:[(0,d.jsx)(`button`,{type:`button`,className:`chat-header-back`,onClick:()=>{x(null),a(`/messages`)},title:`Retour à la liste`,children:`←`}),(0,d.jsx)(`div`,{className:`chat-avatar`,children:b.other_user?.avatar_url||b.other_user?.avatar?(0,d.jsx)(`img`,{src:l(b.other_user.avatar_url||b.other_user.avatar),alt:`Avatar`,onError:e=>{e.currentTarget.style.display=`none`}}):$(b.other_user)}),(0,d.jsxs)(`div`,{className:`chat-header-info`,children:[(0,d.jsxs)(`h3`,{className:`chat-header-name`,children:[b.other_user?.first_name||b.other_user?.last_name?`${b.other_user.first_name||``} ${b.other_user.last_name||``}`:b.other_user?.email||`Interlocuteur Piolo`,b.other_user?.verification_level>=2&&(0,d.jsx)(`span`,{title:`Utilisateur certifié vérifié`,style:{color:`#10B981`,fontSize:16},children:`✓`})]}),(0,d.jsx)(`div`,{className:`chat-status-pill`,children:ne?(0,d.jsxs)(`span`,{style:{color:`var(--or)`,fontWeight:700,display:`inline-flex`,alignItems:`center`,gap:4},children:[`✍️ `,b.other_user?.first_name||`Votre interlocuteur`,` est en train d'écrire...`]}):(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(`i`,{}),` En ligne · discussion directe`]})})]})]})}),b.property&&(0,d.jsxs)(`div`,{className:`chat-pinned-property`,children:[(0,d.jsxs)(`div`,{className:`chat-pinned-left`,children:[(0,d.jsx)(`img`,{src:l(b.property.main_image||b.property.cover_image||`/img/property-placeholder.jpg`),alt:``,className:`chat-pinned-img`}),(0,d.jsxs)(`div`,{className:`chat-pinned-meta`,children:[(0,d.jsx)(`div`,{className:`chat-pinned-title`,children:b.property.title||`Logement certifié Piolo`}),(0,d.jsxs)(`div`,{className:`chat-pinned-price`,children:[b.property.price?`${new Intl.NumberFormat(`fr-FR`).format(b.property.price)} FCFA`:``,(0,d.jsxs)(`span`,{style:{color:`rgba(255,255,255,0.6)`,fontWeight:400},children:[` · `,b.property.city]})]})]})]}),(0,d.jsx)(`div`,{className:`chat-pinned-actions`,children:(0,d.jsx)(i,{to:`/properties/${b.property.slug||b.property.id}`,className:`chat-pinned-btn gold`,children:`👁️ Voir le bien`})})]}),(0,d.jsxs)(`div`,{className:`chat-messages-container`,children:[S.length===0?(0,d.jsxs)(`div`,{style:{textAlign:`center`,padding:`40px 24px`,color:`#8C8477`,background:`rgba(255,255,255,0.85)`,borderRadius:20,margin:`20px auto`,maxWidth:420,boxShadow:`0 4px 16px rgba(0,0,0,0.04)`,border:`1px solid #EAE5D9`},children:[(0,d.jsx)(`div`,{style:{fontSize:36,marginBottom:12},children:`👋`}),(0,d.jsx)(`strong`,{style:{display:`block`,color:`var(--noir)`,marginBottom:6,fontSize:16},children:e(`chat.new_discussion`)}),(0,d.jsxs)(`p`,{style:{margin:0,fontSize:13,lineHeight:1.5},children:[`Envoyez votre premier message à `,(0,d.jsx)(`b`,{children:b.other_user?.first_name||b.other_user?.email}),` au sujet de ce bien.`]})]}):S.filter(e=>!e.is_deleted_for_sender).map((t,n,r)=>{let i=t.sender?.id===h?.id,a=t.is_deleted_for_everyone,o=t.file_url&&(/\.(jpg|jpeg|png|webp|gif)$/i.test(t.file_url)||t.file_url.includes(`image`)),s=new Date(t.created_at||Date.now()).toLocaleDateString(`fr-FR`)!==(n>0?new Date(r[n-1].created_at||Date.now()).toLocaleDateString(`fr-FR`):null);return(0,d.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,width:`100%`,alignItems:i?`flex-end`:`flex-start`,marginBottom:4},children:[s&&(0,d.jsx)(`div`,{className:`chat-date-separator`,style:{width:`100%`},children:(0,d.jsx)(`span`,{children:new Date(t.created_at||Date.now()).toLocaleDateString(`fr-FR`,{weekday:`long`,day:`numeric`,month:`long`})})}),(0,d.jsx)(`div`,{className:`chat-bubble-wrapper ${i?`sent`:`received`}`,children:(0,d.jsxs)(`div`,{className:`chat-bubble ${a?`deleted`:``}`,children:[!a&&(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(`button`,{type:`button`,className:`chat-bubble-menu-trigger`,onClick:e=>{e.stopPropagation(),D(E===t.id?null:t.id)},title:`Options du message`,children:(0,d.jsx)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,children:(0,d.jsx)(`polyline`,{points:`6 9 12 15 18 9`})})}),E===t.id&&(0,d.jsxs)(`div`,{className:`chat-bubble-dropdown`,onClick:e=>e.stopPropagation(),children:[(0,d.jsxs)(`button`,{type:`button`,onClick:()=>{F(t),D(null)},children:[(0,d.jsx)(`span`,{children:`↩`}),` Répondre`]}),i&&(0,d.jsxs)(`button`,{type:`button`,className:`delete-btn`,onClick:()=>{Q(t.id,`everyone`),D(null)},children:[(0,d.jsx)(`span`,{children:`🗑`}),` Supprimer pour tous`]}),(0,d.jsxs)(`button`,{type:`button`,className:`delete-btn`,onClick:()=>{Q(t.id,`me`),D(null)},children:[(0,d.jsx)(`span`,{children:`🗑`}),` Supprimer pour moi`]})]})]}),t.reply_to_content&&!a&&(0,d.jsxs)(`div`,{className:`chat-reply-quote`,children:[(0,d.jsx)(`strong`,{children:e(`chat.quote`)}),t.reply_to_content.slice(0,70),`...`]}),t.file_url&&!a&&(0,d.jsx)(`div`,{style:{marginBottom:8},children:o?(0,d.jsx)(`img`,{src:l(t.file_url),alt:`Pièce jointe`,onClick:()=>k(l(t.file_url)),style:{maxWidth:280,maxHeight:300,borderRadius:12,display:`block`,border:`1px solid rgba(255,255,255,0.2)`,cursor:`zoom-in`}}):(0,d.jsxs)(`a`,{href:l(t.file_url),target:`_blank`,rel:`noopener noreferrer`,style:{display:`flex`,alignItems:`center`,gap:10,background:i?`rgba(255,255,255,0.12)`:`rgba(212,175,55,0.12)`,padding:`10px 14px`,borderRadius:12,color:`inherit`,textDecoration:`none`,fontWeight:600},children:[(0,d.jsx)(`span`,{children:`📎`}),(0,d.jsx)(`span`,{style:{wordBreak:`break-all`},children:t.file_name||`Télécharger le document (PDF)`})]})}),t.voice_url&&!a&&(0,d.jsx)(`div`,{style:{marginBottom:6},children:(0,d.jsx)(m,{src:l(t.voice_url),isSent:i})}),t.content&&(0,d.jsx)(`div`,{style:{wordBreak:`break-word`,whiteSpace:`pre-wrap`},children:a?(0,d.jsxs)(`span`,{children:[`🚫 `,e(`chat.deleted_message`)]}):t.content}),(0,d.jsxs)(`div`,{className:`chat-meta`,children:[(0,d.jsx)(`span`,{children:t.time_formatted||new Date(t.created_at||Date.now()).toLocaleTimeString(`fr-FR`,{hour:`2-digit`,minute:`2-digit`})}),i&&!a&&(0,d.jsx)(p,{isRead:t.is_read,isPending:t.is_pending})]})]})})]},t.id||n)}),(0,d.jsx)(`div`,{ref:U})]}),(0,d.jsx)(`div`,{className:`chat-quick-chips`,children:se.map((e,t)=>(0,d.jsx)(`button`,{type:`button`,className:`chat-chip-btn`,onClick:()=>{j(e.text)},children:e.label},t))}),(0,d.jsxs)(`div`,{className:`chat-input-bar`,children:[P&&(0,d.jsxs)(`div`,{className:`chat-reply-preview`,children:[(0,d.jsxs)(`div`,{style:{minWidth:0},children:[(0,d.jsxs)(`strong`,{style:{color:`var(--or-d)`,display:`block`,fontSize:11,marginBottom:2},children:[`RÉPONSE À `,P.sender?.id===h?.id?`VOUS-MÊME`:(P.sender?.first_name||P.sender?.email||`L'INTERLOCUTEUR`).toUpperCase()]}),(0,d.jsx)(`div`,{style:{whiteSpace:`nowrap`,overflow:`hidden`,textOverflow:`ellipsis`,color:`#555`,fontSize:13},children:P.content||(P.file_url?`📎 Pièce jointe`:`🎤 Message vocal`)})]}),(0,d.jsx)(`button`,{type:`button`,onClick:()=>F(null),style:{border:`none`,background:`#D6D0C5`,width:22,height:22,borderRadius:`50%`,color:`#fff`,fontWeight:`bold`,cursor:`pointer`},title:`Annuler la réponse`,children:`×`})]}),M&&(0,d.jsxs)(`div`,{className:`chat-file-staged`,style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,gap:12,padding:`8px 12px`},children:[(0,d.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:10,minWidth:0},children:[M.type.startsWith(`image/`)?(0,d.jsx)(`img`,{src:URL.createObjectURL(M),alt:`Aperçu`,style:{width:44,height:44,borderRadius:8,objectFit:`cover`,border:`1px solid var(--or)`}}):(0,d.jsx)(`span`,{style:{fontSize:24},children:`📄`}),(0,d.jsxs)(`div`,{style:{minWidth:0},children:[(0,d.jsx)(`strong`,{style:{display:`block`,whiteSpace:`nowrap`,overflow:`hidden`,textOverflow:`ellipsis`,fontSize:12.5},children:M.name}),(0,d.jsxs)(`span`,{style:{fontSize:11,color:`#8A6811`,opacity:.85},children:[(M.size/1024/1024).toFixed(2),` Mo · Prêt à l'envoi`]})]})]}),(0,d.jsx)(`button`,{type:`button`,onClick:()=>{N(null),K.current&&(K.current.value=null)},style:{border:`none`,background:`#DC2626`,padding:`6px 12px`,borderRadius:12,color:`#fff`,cursor:`pointer`,fontSize:12,fontWeight:`bold`,flexShrink:0},children:`Supprimer`})]}),(0,d.jsxs)(`form`,{onSubmit:Z,className:`chat-input-row`,children:[(0,d.jsx)(`input`,{type:`file`,ref:K,style:{display:`none`},accept:`image/*,application/pdf`,onChange:e=>N(e.target.files[0]||null)}),(0,d.jsx)(`button`,{type:`button`,className:`chat-btn-icon`,onClick:()=>K.current?.click(),title:`Joindre une photo ou un document (PDF)`,children:(0,d.jsx)(`svg`,{width:`22`,height:`22`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,d.jsx)(`path`,{d:`M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48`})})}),(0,d.jsx)(`textarea`,{className:`chat-textarea`,placeholder:R?`🔴 Enregistrement vocal... Cliquez sur le micro pour envoyer.`:`Écrivez un message à ${b.other_user?.first_name||`votre interlocuteur`}...`,rows:`1`,value:A,onChange:e=>{if(j(e.target.value),q.current&&q.current.readyState===WebSocket.OPEN)try{q.current.send(JSON.stringify({type:`typing`,is_typing:!0}))}catch{}},onKeyDown:re,disabled:R||I}),(0,d.jsx)(`button`,{type:`button`,className:`chat-btn-icon ${R?`recording`:``}`,onClick:ie,title:R?`Cliquer pour valider et envoyer le vocal`:`Enregistrer un message vocal`,disabled:I,children:(0,d.jsxs)(`svg`,{width:`22`,height:`22`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,d.jsx)(`path`,{d:`M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z`}),(0,d.jsx)(`path`,{d:`M19 10v2a7 7 0 0 1-14 0v-2`}),(0,d.jsx)(`line`,{x1:`12`,y1:`19`,x2:`12`,y2:`23`}),(0,d.jsx)(`line`,{x1:`8`,y1:`23`,x2:`16`,y2:`23`})]})}),(0,d.jsx)(`button`,{type:`submit`,className:`chat-btn-send`,disabled:I||!A.trim()&&!M,title:`Envoyer le message`,children:I?(0,d.jsxs)(`svg`,{width:`20`,height:`20`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.5`,style:{animation:`spin 1s linear infinite`},children:[(0,d.jsx)(`circle`,{cx:`12`,cy:`12`,r:`10`,strokeOpacity:`0.3`}),(0,d.jsx)(`path`,{d:`M12 2a10 10 0 0 1 10 10`})]}):(0,d.jsxs)(`svg`,{width:`20`,height:`20`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,d.jsx)(`line`,{x1:`22`,y1:`2`,x2:`11`,y2:`13`}),(0,d.jsx)(`polygon`,{points:`22 2 15 22 11 13 2 9 22 2`})]})})]})]})]}):(0,d.jsxs)(`div`,{className:`chat-unselected-state`,children:[(0,d.jsx)(`div`,{style:{width:88,height:88,borderRadius:`50%`,background:`#FFFFFF`,display:`flex`,alignItems:`center`,justifyContent:`center`,fontSize:38,boxShadow:`0 8px 24px rgba(0,0,0,0.06)`,margin:`0 auto 20px`,border:`2px solid var(--or)`},children:`✉️`}),(0,d.jsx)(`h3`,{style:{fontSize:22,fontWeight:800,color:`var(--noir)`,marginBottom:8},children:e(`chat.title`)}),(0,d.jsx)(`p`,{style:{maxWidth:440,lineHeight:1.6,color:`#6C665C`,margin:0,fontSize:14},children:`Sélectionnez une discussion à gauche pour dialoguer en temps réel avec votre bailleur ou locataire, planifier des visites et échanger vos dossiers en toute sécurité.`})]})})]}),O&&(0,d.jsxs)(`div`,{onClick:()=>k(null),style:{position:`fixed`,inset:0,background:`rgba(8, 7, 5, 0.96)`,zIndex:99999,display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,padding:16,backdropFilter:`blur(20px)`,WebkitBackdropFilter:`blur(20px)`,animation:`fadeIn 0.2s ease`},children:[(0,d.jsxs)(`div`,{onClick:e=>e.stopPropagation(),style:{position:`absolute`,top:0,left:0,right:0,padding:`max(14px, env(safe-area-inset-top, 14px)) 20px 14px`,display:`flex`,alignItems:`center`,justifyContent:`space-between`,background:`linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)`,zIndex:2},children:[(0,d.jsx)(`span`,{style:{color:`#fff`,fontSize:13,fontWeight:700,fontFamily:`Poppins, sans-serif`},children:`📷 Photo Piolo Luxury`}),(0,d.jsxs)(`div`,{style:{display:`flex`,gap:10,alignItems:`center`},children:[(0,d.jsx)(`a`,{href:O,download:`photo-piolo.jpg`,target:`_blank`,rel:`noopener noreferrer`,style:{background:`rgba(255,255,255,0.15)`,border:`1px solid rgba(255,255,255,0.25)`,color:`#fff`,padding:`7px 14px`,borderRadius:20,fontSize:12,fontWeight:700,textDecoration:`none`,display:`flex`,alignItems:`center`,gap:6},children:`⬇️ Télécharger`}),(0,d.jsx)(`button`,{type:`button`,onClick:()=>k(null),style:{background:`rgba(255,255,255,0.2)`,border:`1px solid rgba(255,255,255,0.3)`,color:`#fff`,width:36,height:36,borderRadius:`50%`,fontSize:18,cursor:`pointer`,display:`grid`,placeItems:`center`},children:`✕`})]})]}),(0,d.jsx)(`img`,{src:O,alt:`Plein écran`,onClick:e=>e.stopPropagation(),style:{maxWidth:`94vw`,maxHeight:`82vh`,objectFit:`contain`,borderRadius:14,boxShadow:`0 12px 50px rgba(0,0,0,0.7)`,animation:`popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)`}})]})]})}export{h as default};