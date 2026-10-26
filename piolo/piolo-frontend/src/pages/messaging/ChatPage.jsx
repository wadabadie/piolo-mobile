import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { messagesApi } from '../../services/api';
import { getMediaUrl } from '../../utils/media';

const CHAT_STYLES = `
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
`;

// WhatsApp Double Ticks
const WhatsAppDoubleTicks = ({ isRead, isPending }) => {
  if (isPending) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 4, verticalAlign: 'middle', opacity: 0.7 }}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }
  return (
    <svg 
      viewBox="0 0 16 15" 
      width="15" 
      height="14" 
      style={{ 
        display: 'inline-block', 
        verticalAlign: 'middle', 
        marginLeft: '4px',
        fill: isRead ? '#D4AF37' : 'rgba(255,255,255,0.6)'
      }}
    >
      <path d="M15.01 3.3L8.11 10.19 5.3 7.4c-.3-.3-.8-.3-1.1 0-.3.3-.3.8 0 1.1l3.36 3.36c.16.16.37.24.59.24s.43-.08.59-.24l7.46-7.46c.3-.3.3-.8 0-1.1-.3-.3-.8-.3-1.1 0zM9 10.19l-.9-.9-.1-.1-.7.7L8.2 10.8c.16.16.37.24.59.24s.43-.08.59-.24L15 5c.3-.3.3-.8 0-1.1l-.1-.1-.1-.1L9 10.19z" />
    </svg>
  );
};

// Waveform Audio Component
function AudioMessagePlayer({ src, isSent }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 1;
    setCurrentTime(cur);
    setProgress(cur / dur);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration || 0);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  const cycleSpeed = () => {
    const next = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  const formatSecs = (sec) => {
    const s = Math.floor(sec || 0);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r < 10 ? '0' : ''}${r}`;
  };

  const barHeights = [40, 70, 30, 90, 50, 80, 100, 60, 45, 85, 30, 75, 95, 60, 40, 80, 55, 35];

  return (
    <div className="chat-voice-player">
      <audio 
        ref={audioRef} 
        src={src} 
        onTimeUpdate={handleTimeUpdate} 
        onLoadedMetadata={handleLoadedMetadata} 
        onEnded={handleEnded} 
        preload="metadata"
      />
      <button type="button" className="chat-voice-play-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Lecture'}>
        {isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        )}
      </button>

      <div className="chat-voice-waveform" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, clickX / rect.width));
        if (audioRef.current && duration) {
          audioRef.current.currentTime = pct * duration;
          setProgress(pct);
        }
      }}>
        {barHeights.map((h, i) => {
          const isActive = (i / barHeights.length) <= progress;
          return (
            <div 
              key={i} 
              className={`chat-voice-bar ${isActive ? 'active' : ''}`} 
              style={{ height: `${h}%` }}
            />
          );
        })}
      </div>

      <span className="chat-voice-time">
        {formatSecs(isPlaying ? currentTime : duration)}
      </span>

      <button type="button" className="chat-voice-speed-btn" onClick={cycleSpeed}>
        {speed}x
      </button>
    </div>
  );
}

export default function ChatPage() {
  const { t } = useTranslation();
  const { id } = useParams(); // conversation_id
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown actions menu & Lightbox preview
  const [activeMenuMsgId, setActiveMenuMsgId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Input states
  const [msgText, setMsgText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [sending, setSending] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [viewportStyle, setViewportStyle] = useState({});
  const [isTypingRemote, setIsTypingRemote] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesRef = useRef([]);
  const messagesCacheRef = useRef({});
  const fileInputRef = useRef(null);
  const wsRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Visual Viewport tracking for ultra-stable mobile keyboard
  useEffect(() => {
    const updateViewport = () => {
      if (window.innerWidth <= 850 && window.visualViewport) {
        setViewportStyle({
          height: `${window.visualViewport.height}px`,
          top: `${window.visualViewport.offsetTop}px`,
        });
      } else {
        setViewportStyle({});
      }
    };
    updateViewport();
    window.visualViewport?.addEventListener('resize', updateViewport);
    window.visualViewport?.addEventListener('scroll', updateViewport);
    window.addEventListener('resize', updateViewport);
    return () => {
      window.visualViewport?.removeEventListener('resize', updateViewport);
      window.visualViewport?.removeEventListener('scroll', updateViewport);
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  // Synchroniser la couleur du body et html pour un affichage plein écran sans bande blanche
  useEffect(() => {
    const origHtmlBg = document.documentElement.style.backgroundColor;
    const origBodyBg = document.body.style.backgroundColor;
    const targetBg = activeConv ? '#F4F2ED' : '#FFFFFF';

    document.documentElement.style.backgroundColor = targetBg;
    document.body.style.backgroundColor = targetBg;

    return () => {
      document.documentElement.style.backgroundColor = origHtmlBg;
      document.body.style.backgroundColor = origBodyBg;
    };
  }, [activeConv]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch conversation list
  const loadConversations = async () => {
    try {
      const res = await messagesApi.list();
      setConversations(res.data || []);
    } catch (e) {
      console.error('Erreur chargement discussions:', e);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // 2. Load active conversation & Connect Real-Time WebSocket (Django Channels / ASGI)
  useEffect(() => {
    if (!id) {
      setActiveConv(null);
      setMessages([]);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    let isMounted = true;

    // Instant switch from list or cache
    const existingConv = conversations.find(c => String(c.id) === String(id));
    if (existingConv && (!activeConv || String(activeConv.id) !== String(id))) {
      setActiveConv(existingConv);
    }
    if (messagesCacheRef.current[id]) {
      setMessages(messagesCacheRef.current[id]);
      setTimeout(scrollToBottom, 40);
    }

    const loadDetail = async () => {
      try {
        const res = await messagesApi.detail(id);
        if (isMounted) {
          setActiveConv(res.data.conversation);
          const loadedMsgs = res.data.messages || [];
          setMessages(loadedMsgs);
          messagesCacheRef.current[id] = loadedMsgs;
          setTimeout(scrollToBottom, 80);
        }
      } catch (e) {
        console.error('Erreur chargement discussion:', e);
        if (isMounted && !messagesCacheRef.current[id]) navigate('/messages');
      }
    };

    loadDetail();

    // ⚡ Real-Time WebSocket Connection (Django Channels / ASGI)
    const token = localStorage.getItem('access_token');
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname || '127.0.0.1';
    const wsPort = window.location.port === '3000' || window.location.port === '5173' ? '8080' : window.location.port;
    const wsUrl = `${wsProtocol}//${wsHost}:${wsPort}/ws/chat/${id}/?token=${token || ''}`;

    let ws = null;
    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        try {
          ws.send(JSON.stringify({ type: 'mark_read' }));
        } catch {
          /* ignore */
        }
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.type === 'chat_message' && payload.message) {
            const incoming = payload.message;
            if (isMounted) {
              setMessages(prev => {
                const ids = new Set(prev.map(m => m.id));
                if (ids.has(incoming.id)) return prev;

                const filtered = prev.filter(t => 
                  !(typeof t.id === 'string' && t.id.startsWith('temp-') && 
                    t.content === incoming.content && t.sender?.id === incoming.sender?.id)
                );

                const next = [...filtered, incoming];
                messagesCacheRef.current[id] = next;
                return next;
              });

              if (incoming.sender?.id !== user?.id && ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'mark_read' }));
              }
              setTimeout(scrollToBottom, 50);
            }
          } else if (payload.type === 'user_typing') {
            if (isMounted) {
              setIsTypingRemote(payload.is_typing);
              if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
              if (payload.is_typing) {
                typingTimeoutRef.current = setTimeout(() => setIsTypingRemote(false), 3500);
              }
            }
          } else if (payload.type === 'messages_read') {
            if (isMounted) {
              setMessages(prev => {
                const next = prev.map(m => m.sender?.id === user?.id ? { ...m, is_read: true } : m);
                messagesCacheRef.current[id] = next;
                return next;
              });
            }
          } else if (payload.type === 'message_deleted') {
            if (isMounted) {
              setMessages(prev => {
                let next;
                if (payload.delete_type === 'everyone') {
                  next = prev.map(m => m.id === payload.message_id ? {
                    ...m,
                    is_deleted_for_everyone: true,
                    content: t('chat.deleted_message'),
                    file_url: null,
                    voice_url: null
                  } : m);
                } else {
                  next = prev.filter(m => m.id !== payload.message_id);
                }
                messagesCacheRef.current[id] = next;
                return next;
              });
            }
          }
        } catch {
          /* ignore parse error */
        }
      };
    } catch {
      /* fallback */
    }

    // 3. Fast Adaptive Polling fallback (active if WebSocket unavailable)
    const interval = setInterval(async () => {
      if (!id || document.hidden) return;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

      try {
        const latestMessages = messagesRef.current;
        const realMsgs = latestMessages.filter(m => typeof m.id === 'number');
        const lastMsgId = realMsgs.length > 0 ? Math.max(...realMsgs.map(m => m.id)) : 0;
        const res = await messagesApi.poll(id, lastMsgId);
        if (res.data && res.data.messages && res.data.messages.length > 0) {
          if (isMounted) {
            setMessages(prev => {
              const ids = new Set(prev.map(m => m.id));
              const news = res.data.messages.filter(m => {
                if (ids.has(m.id)) return false;
                const hasTemp = prev.some(t => 
                  typeof t.id === 'string' && t.id.startsWith('temp-') && 
                  t.content === m.content && t.sender?.id === m.sender?.id
                );
                return !hasTemp;
              });
              if (news.length === 0) return prev;
              const updated = [...prev, ...news];
              messagesCacheRef.current[id] = updated;
              return updated;
            });
            setTimeout(scrollToBottom, 100);
          }
        }
      } catch {
        /* silent polling error */
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (ws) {
        ws.close();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveMenuMsgId(null);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Handle Send Message with Instant Optimistic UI & Anti-Duplication
  const handleSend = async (e, customVoiceBlob = null) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!msgText.trim() && !selectedFile && !customVoiceBlob) return;
    if (sending || !activeConv) return;

    const contentToSend = msgText.trim();
    const fileToSend = selectedFile;
    const replyToSend = replyTo;
    const tempId = `temp-${Date.now()}`;

    // ⚡ Optimistic UI insertion (0ms Latency feeling)
    const optimisticMessage = {
      id: tempId,
      sender: user,
      content: contentToSend,
      file_url: fileToSend ? URL.createObjectURL(fileToSend) : null,
      file_name: fileToSend ? fileToSend.name : null,
      voice_url: customVoiceBlob ? URL.createObjectURL(customVoiceBlob) : null,
      reply_to_content: replyToSend?.content,
      created_at: new Date().toISOString(),
      time_formatted: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      is_pending: true,
      is_read: false
    };

    setMessages(prev => {
      const next = [...prev, optimisticMessage];
      messagesCacheRef.current[activeConv.id] = next;
      return next;
    });
    setMsgText('');
    setSelectedFile(null);
    setReplyTo(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
    setTimeout(scrollToBottom, 30);

    setSending(true);
    const formData = new FormData();
    if (contentToSend) formData.append('content', contentToSend);
    if (fileToSend) formData.append('file', fileToSend);
    if (customVoiceBlob) formData.append('voice', customVoiceBlob, 'vocal_message.webm');
    if (replyToSend) formData.append('reply_to_id', replyToSend.id);

    try {
      const res = await messagesApi.send(activeConv.id, formData);
      setMessages(prev => {
        const alreadyHasReal = prev.some(m => m.id === res.data.id);
        let updated;
        if (alreadyHasReal) {
          updated = prev.filter(m => m.id !== tempId);
        } else {
          updated = prev.map(m => m.id === tempId ? res.data : m);
        }
        messagesCacheRef.current[activeConv.id] = updated;
        return updated;
      });
      loadConversations();
    } catch {
      alert("Erreur lors de l'envoi du message.");
      setMessages(prev => {
        const updated = prev.filter(m => m.id !== tempId);
        messagesCacheRef.current[activeConv.id] = updated;
        return updated;
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  // Voice recording handler
  const handleToggleRecord = async () => {
    if (isRecording) {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          handleSend(null, audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      } catch (err) {
        console.error('Erreur accès micro:', err);
        alert("Impossible d'accéder au microphone.");
      }
    }
  };

  // Delete message (API + Optimistic cache)
  const handleDeleteMessage = async (msgId, type) => {
    try {
      if (typeof msgId === 'string' && msgId.startsWith('temp-')) {
        setMessages(prev => {
          const next = prev.filter(m => m.id !== msgId);
          if (activeConv) messagesCacheRef.current[activeConv.id] = next;
          return next;
        });
        return;
      }

      // 1. Appeler l'API Django pour persister la suppression
      await messagesApi.delete(msgId, type);

      // 2. Mettre à jour l'état et le cache local
      setMessages(prev => {
        let next;
        if (type === 'everyone') {
          next = prev.map(m => m.id === msgId ? {
            ...m,
            is_deleted_for_everyone: true,
            content: t('chat.deleted_message'),
            file_url: null,
            voice_url: null
          } : m);
        } else {
          next = prev.filter(m => m.id !== msgId);
        }
        if (activeConv) messagesCacheRef.current[activeConv.id] = next;
        return next;
      });
      loadConversations();
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert(err.response?.data?.error || "Erreur lors de la suppression du message.");
    }
  };

  const getAvatarInitials = (other) => {
    if (!other) return "P";
    const f = (other.first_name || "")[0] || "";
    const l = (other.last_name || "")[0] || "";
    if (f || l) return (f + l).toUpperCase();
    return (other.email || "P")[0].toUpperCase();
  };

  const filteredConvs = conversations.filter(c => {
    const name = `${c.other_user?.first_name || ''} ${c.other_user?.last_name || ''} ${c.other_user?.email || ''}`.toLowerCase();
    const prop = `${c.property?.property_type || ''} ${c.property?.city || ''} ${c.property?.title || ''}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || prop.includes(searchQuery.toLowerCase());
  });

  const isBailleur = user?.role === 'BAILLEUR' || user?.is_bailleur;

  // Real estate quick action presets
  const quickActions = isBailleur ? [
    { label: "✅ Logement disponible", text: "Bonjour, le bien est toujours disponible pour une location." },
    { label: "📅 Proposer une visite", text: "Êtes-vous disponible pour une visite cette semaine ? Indiquez-moi vos créneaux." },
    { label: "📄 Demander le dossier", text: "Merci de me transmettre votre dossier locataire sur Piolo afin que je puisse l'examiner." },
    { label: "✍️ Conditions du bail", text: "Le bail prévoit une caution de 2 mois et 1 mois d'avance. Êtes-vous en accord avec ces termes ?" }
  ] : [
    { label: "📅 Demander une visite", text: "Bonjour, je suis très intéressé par votre bien. Serait-il possible de programmer une visite ?" },
    { label: "📂 Partager mon dossier", text: "Mon dossier locataire est 100% complet et vérifié sur Piolo. Je viens de vous le transmettre." },
    { label: "❓ Disponibilité", text: "Bonjour, ce logement est-il toujours disponible à la date indiquée ?" },
    { label: "🏷️ Négocier", text: "Bonjour, je souhaiterais savoir si le loyer est légèrement négociable compte tenu d'un bail long terme." }
  ];

  return (
    <>
      <style>{CHAT_STYLES}</style>
      <div className={`chat-page-scope ${id ? 'has-active-chat' : ''}`} style={viewportStyle}>
        
        {/* ── LEFT PANE : CONVERSATION LIST ──────────────────────────────── */}
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <div className="chat-sidebar-profile">
              <div className="chat-avatar" title="Mon Profil">
                {(user?.avatar_url || user?.avatar) ? (
                  <img 
                    src={getMediaUrl(user.avatar_url || user.avatar)} 
                    alt="Me" 
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (user?.first_name?.[0]?.toUpperCase() || 'U')}
              </div>
              <div>
                <h2>{t('chat.messages')}</h2>
              </div>
            </div>
            <Link to={isBailleur ? "/dashboard/bailleur" : "/dashboard/locataire"} className="chat-back-dash">
              ← Dashboard
            </Link>
          </div>

          <div className="chat-search-bar">
            <div className="chat-search-input-wrapper">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8C8477" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input 
                type="text" 
                placeholder="Rechercher une discussion ou un bien..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <span style={{ cursor: 'pointer', fontWeight: 'bold', color: '#8C8477' }} onClick={() => setSearchQuery('')}>×</span>
              )}
            </div>
          </div>

          <div className="chat-sidebar-list">
            {loadingList ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#8C8477' }}>{t('chat.loading')}</div>
            ) : filteredConvs.length === 0 ? (
              <div className="chat-empty-sidebar">
                <div style={{ fontSize: 42, marginBottom: 12 }}>💬</div>
                <strong style={{ display: 'block', color: 'var(--noir)', marginBottom: 4 }}>{t('chat.no_messages')}</strong>
                <small style={{ color: '#8C8477', lineHeight: 1.5, display: 'block' }}>
                  Cliquez sur « Contacter le bailleur » depuis une annonce pour lancer une discussion instantanée.
                </small>
              </div>
            ) : (
              filteredConvs.map(conv => {
                const isActive = activeConv && activeConv.id === conv.id;
                const other = conv.other_user || {};
                const name = other.first_name || other.last_name ? `${other.first_name || ''} ${other.last_name || ''}` : other.email || 'Bailleur';
                const avatarSrc = getMediaUrl(other.avatar_url || other.avatar);
                return (
                  <div 
                    key={conv.id} 
                    className={`chat-conv-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setActiveConv(conv);
                      if (messagesCacheRef.current[conv.id]) {
                        setMessages(messagesCacheRef.current[conv.id]);
                      }
                      navigate(`/messages/${conv.id}`);
                    }}
                  >
                    <div className="chat-avatar">
                      {avatarSrc ? (
                        <img 
                          src={avatarSrc} 
                          alt={name} 
                          onError={e => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : getAvatarInitials(other)}
                    </div>
                    <div className="chat-conv-info">
                      <div className="chat-conv-top">
                        <span className="chat-conv-name">{name.trim()}</span>
                        <span className="chat-conv-time">{conv.updated_at ? new Date(conv.updated_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : ''}</span>
                      </div>
                      <div className="chat-conv-preview">
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {conv.last_message || 'Nouvelle conversation'}
                        </span>
                        {conv.unread_count > 0 && (
                          <span className="chat-unread-badge">{conv.unread_count}</span>
                        )}
                      </div>
                      {conv.property && (
                        <span className="chat-conv-prop">
                          🏠 {conv.property.property_type || 'Bien'} — {conv.property.city || 'Cameroun'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT PANE : ACTIVE CHAT ──────────────────────────────────────── */}
        <div className="chat-main">
          {!activeConv ? (
            <div className="chat-unselected-state">
              <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', margin: '0 auto 20px', border: '2px solid var(--or)' }}>
                ✉️
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--noir)', marginBottom: 8 }}>{t('chat.title')}</h3>
              <p style={{ maxWidth: 440, lineHeight: 1.6, color: '#6C665C', margin: 0, fontSize: 14 }}>
                Sélectionnez une discussion à gauche pour dialoguer en temps réel avec votre bailleur ou locataire, planifier des visites et échanger vos dossiers en toute sécurité.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="chat-header">
                <div className="chat-header-left">
                  <button 
                    type="button" 
                    className="chat-header-back" 
                    onClick={() => {
                      setActiveConv(null);
                      navigate('/messages');
                    }} 
                    title="Retour à la liste"
                  >
                    ←
                  </button>
                  <div className="chat-avatar">
                    {(activeConv.other_user?.avatar_url || activeConv.other_user?.avatar) ? (
                      <img 
                        src={getMediaUrl(activeConv.other_user.avatar_url || activeConv.other_user.avatar)} 
                        alt="Avatar" 
                        onError={e => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : getAvatarInitials(activeConv.other_user)}
                  </div>
                  <div className="chat-header-info">
                    <h3 className="chat-header-name">
                      {activeConv.other_user?.first_name || activeConv.other_user?.last_name 
                        ? `${activeConv.other_user.first_name || ''} ${activeConv.other_user.last_name || ''}` 
                        : activeConv.other_user?.email || 'Interlocuteur Piolo'}
                      {activeConv.other_user?.verification_level >= 2 && (
                        <span title="Utilisateur certifié vérifié" style={{ color: '#10B981', fontSize: 16 }}>✓</span>
                      )}
                    </h3>
                    <div className="chat-status-pill">
                      {isTypingRemote ? (
                        <span style={{ color: 'var(--or)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          ✍️ {activeConv.other_user?.first_name || 'Votre interlocuteur'} est en train d'écrire...
                        </span>
                      ) : (
                        <>
                          <i /> En ligne · discussion directe
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pinned Property Banner */}
              {activeConv.property && (
                <div className="chat-pinned-property">
                  <div className="chat-pinned-left">
                    <img 
                      src={getMediaUrl(activeConv.property.main_image || activeConv.property.cover_image || '/img/property-placeholder.jpg')} 
                      alt="" 
                      className="chat-pinned-img" 
                    />
                    <div className="chat-pinned-meta">
                      <div className="chat-pinned-title">{activeConv.property.title || 'Logement certifié Piolo'}</div>
                      <div className="chat-pinned-price">
                        {activeConv.property.price ? `${new Intl.NumberFormat('fr-FR').format(activeConv.property.price)} FCFA` : ''} 
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}> · {activeConv.property.city}</span>
                      </div>
                    </div>
                  </div>
                  <div className="chat-pinned-actions">
                    <Link 
                      to={`/properties/${activeConv.property.slug || activeConv.property.id}`} 
                      className="chat-pinned-btn gold"
                    >
                      👁️ Voir le bien
                    </Link>
                  </div>
                </div>
              )}

              {/* Message History */}
              <div className="chat-messages-container">
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 24px', color: '#8C8477', background: 'rgba(255,255,255,0.85)', borderRadius: 20, margin: '20px auto', maxWidth: 420, boxShadow: '0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #EAE5D9' }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>👋</div>
                    <strong style={{ display: 'block', color: 'var(--noir)', marginBottom: 6, fontSize: 16 }}>{t('chat.new_discussion')}</strong>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>
                      Envoyez votre premier message à <b>{activeConv.other_user?.first_name || activeConv.other_user?.email}</b> au sujet de ce bien.
                    </p>
                  </div>
                ) : (
                  messages.filter(msg => !msg.is_deleted_for_sender).map((msg, index, arr) => {
                    const isSent = msg.sender?.id === user?.id;
                    const isDeleted = msg.is_deleted_for_everyone;
                    const isImage = msg.file_url && (/\.(jpg|jpeg|png|webp|gif)$/i.test(msg.file_url) || msg.file_url.includes('image'));
                    
                    // Show Date pill separator if different day from previous
                    const curDate = new Date(msg.created_at || Date.now()).toLocaleDateString('fr-FR');
                    const prevDate = index > 0 ? new Date(arr[index - 1].created_at || Date.now()).toLocaleDateString('fr-FR') : null;
                    const showDateSeparator = curDate !== prevDate;
                    
                    return (
                      <div 
                        key={msg.id || index}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          width: '100%',
                          alignItems: isSent ? 'flex-end' : 'flex-start',
                          marginBottom: 4
                        }}
                      >
                        {showDateSeparator && (
                          <div className="chat-date-separator" style={{ width: '100%' }}>
                            <span>{new Date(msg.created_at || Date.now()).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                          </div>
                        )}

                        <div className={`chat-bubble-wrapper ${isSent ? 'sent' : 'received'}`}>
                          <div className={`chat-bubble ${isDeleted ? 'deleted' : ''}`}>
                            
                            {/* Menu Trigger */}
                            {!isDeleted && (
                              <>
                                <button 
                                  type="button" 
                                  className="chat-bubble-menu-trigger" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuMsgId(activeMenuMsgId === msg.id ? null : msg.id);
                                  }}
                                  title="Options du message"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                                </button>

                                {activeMenuMsgId === msg.id && (
                                  <div className="chat-bubble-dropdown" onClick={(e) => e.stopPropagation()}>
                                    <button type="button" onClick={() => { setReplyTo(msg); setActiveMenuMsgId(null); }}>
                                      <span>↩</span> Répondre
                                    </button>
                                    {isSent && (
                                      <button type="button" className="delete-btn" onClick={() => { handleDeleteMessage(msg.id, 'everyone'); setActiveMenuMsgId(null); }}>
                                        <span>🗑</span> Supprimer pour tous
                                      </button>
                                    )}
                                    <button type="button" className="delete-btn" onClick={() => { handleDeleteMessage(msg.id, 'me'); setActiveMenuMsgId(null); }}>
                                      <span>🗑</span> Supprimer pour moi
                                    </button>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Reply quote */}
                            {msg.reply_to_content && !isDeleted && (
                              <div className="chat-reply-quote">
                                <strong>{t('chat.quote')}</strong>
                                {msg.reply_to_content.slice(0, 70)}...
                              </div>
                            )}

                            {/* File Attachment */}
                            {msg.file_url && !isDeleted && (
                              <div style={{ marginBottom: 8 }}>
                                {isImage ? (
                                  <img 
                                    src={getMediaUrl(msg.file_url)} 
                                    alt="Pièce jointe" 
                                    onClick={() => setPreviewImage(getMediaUrl(msg.file_url))}
                                    style={{ maxWidth: 280, maxHeight: 300, borderRadius: 12, display: 'block', border: '1px solid rgba(255,255,255,0.2)', cursor: 'zoom-in' }} 
                                  />
                                ) : (
                                  <a 
                                    href={getMediaUrl(msg.file_url)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ display: 'flex', alignItems: 'center', gap: 10, background: isSent ? 'rgba(255,255,255,0.12)' : 'rgba(212,175,55,0.12)', padding: '10px 14px', borderRadius: 12, color: 'inherit', textDecoration: 'none', fontWeight: 600 }}
                                  >
                                    <span>📎</span>
                                    <span style={{ wordBreak: 'break-all' }}>{msg.file_name || "Télécharger le document (PDF)"}</span>
                                  </a>
                                )}
                              </div>
                            )}

                            {/* Voice Message with Waveform */}
                            {msg.voice_url && !isDeleted && (
                              <div style={{ marginBottom: 6 }}>
                                <AudioMessagePlayer src={getMediaUrl(msg.voice_url)} isSent={isSent} />
                              </div>
                            )}

                            {/* Text content */}
                            {msg.content && (
                              <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                {isDeleted ? (
                                  <span>🚫 {t('chat.deleted_message')}</span>
                                ) : (
                                  msg.content
                                )}
                              </div>
                            )}

                            <div className="chat-meta">
                              <span>{msg.time_formatted || new Date(msg.created_at || Date.now()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                              {isSent && !isDeleted && <WhatsAppDoubleTicks isRead={msg.is_read} isPending={msg.is_pending} />}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Action Chips */}
              <div className="chat-quick-chips">
                {quickActions.map((action, idx) => (
                  <button 
                    key={idx} 
                    type="button" 
                    className="chat-chip-btn" 
                    onClick={() => {
                      setMsgText(action.text);
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="chat-input-bar">
                {/* Reply Preview */}
                {replyTo && (
                  <div className="chat-reply-preview">
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ color: 'var(--or-d)', display: 'block', fontSize: 11, marginBottom: 2 }}>
                        RÉPONSE À {(replyTo.sender?.id === user?.id) ? 'VOUS-MÊME' : (replyTo.sender?.first_name || replyTo.sender?.email || 'L\'INTERLOCUTEUR').toUpperCase()}
                      </strong>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#555', fontSize: 13 }}>
                        {replyTo.content || (replyTo.file_url ? '📎 Pièce jointe' : '🎤 Message vocal')}
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setReplyTo(null)} 
                      style={{ border: 'none', background: '#D6D0C5', width: 22, height: 22, borderRadius: '50%', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                      title="Annuler la réponse"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Staged File Preview */}
                {selectedFile && (
                  <div className="chat-file-staged" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      {selectedFile.type.startsWith('image/') ? (
                        <img 
                          src={URL.createObjectURL(selectedFile)} 
                          alt="Aperçu" 
                          style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--or)' }} 
                        />
                      ) : (
                        <span style={{ fontSize: 24 }}>📄</span>
                      )}
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 12.5 }}>
                          {selectedFile.name}
                        </strong>
                        <span style={{ fontSize: 11, color: '#8A6811', opacity: 0.85 }}>
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} Mo · Prêt à l'envoi
                        </span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = null; }}
                      style={{ border: 'none', background: '#DC2626', padding: '6px 12px', borderRadius: 12, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 'bold', flexShrink: 0 }}
                    >
                      Supprimer
                    </button>
                  </div>
                )}

                <form onSubmit={handleSend} className="chat-input-row">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    accept="image/*,application/pdf" 
                    onChange={(e) => setSelectedFile(e.target.files[0] || null)} 
                  />
                  
                  <button 
                    type="button" 
                    className="chat-btn-icon" 
                    onClick={() => fileInputRef.current?.click()} 
                    title="Joindre une photo ou un document (PDF)"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                  </button>

                  <textarea
                    className="chat-textarea"
                    placeholder={isRecording ? "🔴 Enregistrement vocal... Cliquez sur le micro pour envoyer." : `Écrivez un message à ${activeConv.other_user?.first_name || 'votre interlocuteur'}...`}
                    rows="1"
                    value={msgText}
                    onChange={(e) => {
                      setMsgText(e.target.value);
                      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                        try {
                          wsRef.current.send(JSON.stringify({ type: 'typing', is_typing: true }));
                        } catch {
                          /* ignore */
                        }
                      }
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={isRecording || sending}
                  />

                  {/* Mic button for voice messages */}
                  <button 
                    type="button" 
                    className={`chat-btn-icon ${isRecording ? 'recording' : ''}`} 
                    onClick={handleToggleRecord} 
                    title={isRecording ? "Cliquer pour valider et envoyer le vocal" : "Enregistrer un message vocal"}
                    disabled={sending}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                  </button>

                  <button type="submit" className="chat-btn-send" disabled={sending || (!msgText.trim() && !selectedFile)} title="Envoyer le message">
                    {sending ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)} 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(8, 7, 5, 0.96)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          {/* Top Bar with actions */}
          <div 
            onClick={e => e.stopPropagation()} 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              padding: 'max(14px, env(safe-area-inset-top, 14px)) 20px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
              zIndex: 2
            }}
          >
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
              📷 Photo Piolo Luxury
            </span>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <a 
                href={previewImage} 
                download="photo-piolo.jpg" 
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: '#fff',
                  padding: '7px 14px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                ⬇️ Télécharger
              </a>
              <button 
                type="button" 
                onClick={() => setPreviewImage(null)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#fff',
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  fontSize: 18,
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center'
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Image Display */}
          <img 
            src={previewImage} 
            alt="Plein écran" 
            onClick={e => e.stopPropagation()}
            style={{ 
              maxWidth: '94vw', 
              maxHeight: '82vh', 
              objectFit: 'contain', 
              borderRadius: 14, 
              boxShadow: '0 12px 50px rgba(0,0,0,0.7)',
              animation: 'popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }} 
          />
        </div>
      )}
    </>
  );
}
