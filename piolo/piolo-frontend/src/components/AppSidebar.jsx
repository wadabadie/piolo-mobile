// src/components/AppSidebar.jsx
// Sidebar universelle — Bailleur & Locataire
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavItem({ to, icon, label, badge, gold, exact }) {
  const location = useLocation();
  const active = exact
    ? location.pathname === to
    : location.pathname.startsWith(to);
  return (
    <Link to={to} className={`sb-item${active ? " active" : ""}${gold ? " sb-gold" : ""}`}>
      <span className="sb-ico">{icon}</span>
      <span className="sb-label">{label}</span>
      {badge > 0 && <span className="sb-badge">{badge}</span>}
    </Link>
  );
}

export default function AppSidebar({ kpis = {}, unreadMessages = 0, upcomingVisits = 0, savedCount = 0, alertsCount = 0, onLogout }) {
  const { user } = useAuth();
  const [ecoMode, setEcoMode] = useState(() => localStorage.getItem("piolo_eco") === "1");
  const isBailleur = user?.role === "BAILLEUR" || user?.is_bailleur;
  const isPro = user?.role === "ARCHITECTE" || user?.role === "PRO" || user?.role === "PROFESSIONNEL" || user?.is_architecte || user?.is_pro;
  const dashPath = isBailleur ? "/dashboard/bailleur" : (isPro ? "/dashboard/pro" : "/dashboard/locataire");
  const pts = kpis.points ?? user?.points ?? 0;
  const ptsPct = Math.min((pts / 500) * 100, 100);
  const initials = ((user?.first_name?.[0] || "") + (user?.last_name?.[0] || "")).toUpperCase() || "?";

  const toggleEco = () => {
    const next = !ecoMode;
    setEcoMode(next);
    localStorage.setItem("piolo_eco", next ? "1" : "0");
    document.body.classList.toggle("eco-mode", next);
  };

  const Ico = ({ d }) => <svg viewBox="0 0 24 24" fill="currentColor"><path d={d}/></svg>;

  return (
    <aside className="app-sidebar" id="sidebar">
      <div className="sb-logo-area">
        <Link to="/" className="sb-logo-link">
          <span className="sb-logo-text">piolo</span>
        </Link>
        <div className="sb-role-tag">{isBailleur ? "Espace Bailleur" : (isPro ? "Espace Professionnel" : "Espace Locataire")}</div>
      </div>

      <Link to="/profil" className="sb-user-card" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }} title="Mon Profil">
        {user?.avatar_url || user?.avatar ? (
          <img
            src={user?.avatar_url || user?.avatar}
            alt="Avatar"
            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--sb-gold)', flexShrink: 0 }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="sb-avatar">{initials}</div>
        )}
        <div className="sb-user-info">
          <div className="sb-user-name">{user?.first_name} {user?.last_name}</div>
          <div className="sb-user-sub">{isBailleur ? "Propriétaire" : (isPro ? "Professionnel Certifié" : "Locataire")}{user?.city ? ` · ${user.city}` : ""}</div>
        </div>
        <div className="sb-pts-badge"><span className="sb-pts-val">{pts}</span><span className="sb-pts-lbl"> pts</span></div>
      </Link>

      <div className="sb-pts-bar-wrap">
        <div className="sb-pts-bar" style={{ width: `${ptsPct}%` }} />
        <span className="sb-pts-target">{pts} / 500 pts · Niveau suivant</span>
      </div>

      <nav className="sb-nav">
        <div className="sb-section-label">Principal</div>
        <NavItem to={dashPath} exact icon={<Ico d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>} label="Tableau de bord" />
        {isPro ? (
          <>
            <NavItem to="/dashboard/pro?tab=portfolio" gold icon={<Ico d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>} label="Portfolio & Projets" />
            <NavItem to="/dashboard/pro?tab=devis" icon={<Ico d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>} label="Demandes de Devis" badge={unreadMessages} />
            <NavItem to="/dashboard/pro?tab=profil" icon={<Ico d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>} label="Configuration Métier" />
            <NavItem to="/messages" icon={<Ico d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>} label="Messagerie" badge={unreadMessages} />
          </>
        ) : isBailleur ? (
          <>
            <NavItem to="/properties" icon={<Ico d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>} label="Mes annonces" />
            <NavItem to="/properties/create" gold icon={<Ico d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>} label="Publier un bien" />
            <NavItem to="/visites" icon={<Ico d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/>} label="Demandes de visite" badge={upcomingVisits} />
            <NavItem to="/messages" icon={<Ico d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>} label="Messages" badge={unreadMessages} />
          </>
        ) : (
          <>
            <NavItem to="/properties" icon={<Ico d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 14z"/>} label="Rechercher un bien" />
            <NavItem to="/favoris" icon={<Ico d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>} label="Mes Favoris" badge={savedCount} />
            <NavItem to="/messages" icon={<Ico d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>} label="Messages" badge={unreadMessages} />
            <NavItem to="/visites" icon={<Ico d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/>} label="Visites programmées" badge={upcomingVisits} />
            <NavItem to="/alertes" icon={<Ico d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>} label="Alertes de recherche" badge={alertsCount} />
          </>
        )}

        <div className="sb-section-label" style={{marginTop:10}}>Découvrir</div>
        <NavItem to="/decouverte" gold icon={<Ico d="M8 5v14l11-7z"/>} label="Mode Découverte (Reels)" />
        <NavItem to="/architectes" icon={<Ico d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>} label="Annuaire des Pros" />
        {!isPro && (
          <NavItem to="/map" icon={<Ico d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>} label="Carte Interactive" />
        )}

        <div className="sb-section-label" style={{marginTop:10}}>Mon Compte</div>
        <NavItem to="/profil" icon={<Ico d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>} label="Mon Profil" />
        <NavItem to="/securite" icon={<Ico d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>} label="Sécurité" />

        <div className="sb-section-label" style={{marginTop:10}}>Préférences</div>
        <button className={`sb-item sb-toggle${ecoMode ? " active" : ""}`} onClick={toggleEco}>
          <span className="sb-ico"><Ico d="M11 15H6l7-14v8h5l-7 14v-8z"/></span>
          <span className="sb-label">Mode Éco Données</span>
          <span className={`sb-switch${ecoMode ? " on" : ""}`} />
        </button>
      </nav>

      <button className="sb-logout" onClick={onLogout}>
        <span className="sb-ico"><Ico d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></span>
        Se déconnecter
      </button>
    </aside>
  );
}
