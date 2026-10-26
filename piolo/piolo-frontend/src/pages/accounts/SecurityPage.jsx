import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../services/api";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../context/AuthContext";
import '../bailleur/dashboard.css';

export default function SecurityPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwErr, setPwErr] = useState("");
  const [pwOk, setPwOk] = useState("");
  const [pwLoad, setPwLoad] = useState(false);

  // Préférences de confidentialité
  const [privacyPrefs, setPrivacyPrefs] = useState(() => {
    const saved = localStorage.getItem('piolo-privacy-prefs');
    return saved ? JSON.parse(saved) : {
      hidePhoneUntilVisit: true,
      encryptDocuments: true,
      activityLogs: true
    };
  });

  const togglePrivacy = (key) => {
    setPrivacyPrefs(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('piolo-privacy-prefs', JSON.stringify(next));
      return next;
    });
  };

  // Calcul force du mot de passe
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "Non renseigné", color: "#A09B90" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: t('security.strength_weak'), color: "#E53E3E" };
    if (score === 2) return { score: 50, label: t('security.strength_medium'), color: "#DD6B20" };
    if (score === 3) return { score: 75, label: t('security.strength_good'), color: "#319795" };
    return { score: 100, label: t('security.strength_strong'), color: "#38A169" };
  };

  const strength = getPasswordStrength(pwForm.newPw);

  const handleChangePw = async (e) => {
    e.preventDefault();
    setPwErr("");
    setPwOk("");
    if (pwForm.newPw !== pwForm.confirm) {
      setPwErr("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    if (pwForm.newPw.length < 8) {
      setPwErr("Le nouveau mot de passe doit comporter au moins 8 caractères.");
      return;
    }
    setPwLoad(true);
    try {
      await api.post("/auth/change-password/", { old_password: pwForm.current, new_password: pwForm.newPw });
      setPwOk("Votre mot de passe a été mis à jour avec succès.");
      setPwForm({ current: "", newPw: "", confirm: "" });
    } catch (err) {
      const msg = err.response?.data?.old_password?.[0] || err.response?.data?.detail || "Erreur lors du changement de mot de passe.";
      setPwErr(msg);
    } finally {
      setPwLoad(false);
    }
  };

  return (
    <div className="layout">
      <Sidebar />

      <div className="main security-page-main" style={{ overflowY: "auto", padding: "0 0 80px 0", background: "var(--bg, #F8F6F1)" }}>

        {/* ========================================================= */}
        {/* HERO BANNER LUXE CAMEROUNAIS SÉCURITÉ                     */}
        {/* ========================================================= */}
        <div 
          className="security-hero-banner"
          style={{
            position: "relative",
            background: "linear-gradient(180deg, rgba(15,13,9,0.92) 0%, rgba(20,17,13,0.98) 100%), url(/img/cameroun-luxury-banner.jpg) center/cover no-repeat",
            borderBottom: "1px solid rgba(212,175,55,0.3)",
            padding: "max(env(safe-area-inset-top, 0px) + 20px, 32px) clamp(20px, 3.5vw, 56px) 32px",
            color: "#FFFFFF",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            width: "100%",
            boxSizing: "border-box"
          }}
        >
          {/* Navigation Rapide */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <Link 
              to={user?.role === 'BAILLEUR' ? '/dashboard/bailleur' : '/dashboard/locataire'}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(212,175,55,0.3)",
                color: "#FFFFFF",
                fontSize: 12.5,
                fontWeight: 700,
                textDecoration: "none",
                fontFamily: "Poppins, sans-serif"
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              <span>{t('security.back_dashboard')}</span>
            </Link>

            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--or-l)", background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.35)", padding: "4px 12px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {t('security.ssl_protection')}
            </span>
          </div>

          {/* En-tête Sécurité Desktop / Mobile */}
          <div className="security-hero-content">
            <div className="security-hero-left">
              <div 
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 24,
                  background: "linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))",
                  border: "2px solid var(--or)",
                  boxShadow: "0 0 24px rgba(212,175,55,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--or-l)",
                  flexShrink: 0
                }}
              >
                <svg width="42" height="42" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8s0 0 0 0z"/></svg>
              </div>

              <div>
                <h1 style={{ fontFamily: "Poppins, sans-serif", fontSize: 24, fontWeight: 800, color: "#FFFFFF", margin: "0 0 6px", lineHeight: 1.2 }}>
                  {t('security.page_title')}
                </h1>
                <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.7)", margin: "0 0 14px", maxWidth: 540 }}>
                  {t('security.page_sub')}
                </p>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ background: "rgba(30,122,71,0.2)", border: "1px solid rgba(30,122,71,0.45)", padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 800, color: "#48BB78", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    <span>{t('security.account_protected')}</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, color: "#FFFFFF", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span>E-mail : {user?.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Score de Sécurité Global */}
            <div className="security-hero-right">
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px 20px", border: "1px solid rgba(255,255,255,0.12)", minWidth: 260 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 8, color: "rgba(255,255,255,0.9)" }}>
                  <span>{t('security.protection_index')}</span>
                  <span style={{ color: "var(--or-l)", fontWeight: 800 }}>{t('security.protection_high')}</span>
                </div>
                <div style={{ width: "100%", height: 7, borderRadius: 6, background: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
                  <div style={{ width: "88%", height: "100%", background: "linear-gradient(90deg, #38A169, var(--or-l))", transition: "width 0.4s ease" }} />
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>
                  {t('security.encryption_note')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CORPS DE LA PAGE (Grille Pleine Largeur Web / Mobile)     */}
        {/* ========================================================= */}
        <div style={{ padding: "28px clamp(20px, 3.5vw, 56px)", width: "100%", boxSizing: "border-box" }}>

          {/* Feedback Messages */}
          {pwOk && (
            <div style={{ padding: "14px 18px", borderRadius: 14, fontFamily: "Poppins, sans-serif", fontSize: 13.5, fontWeight: 700, background: "rgba(30,122,71,0.12)", color: "#1E7A47", border: "1px solid rgba(30,122,71,0.3)", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              <span>{pwOk}</span>
            </div>
          )}

          {pwErr && (
            <div style={{ padding: "14px 18px", borderRadius: 14, fontFamily: "Poppins, sans-serif", fontSize: 13.5, fontWeight: 700, background: "rgba(184,50,50,0.12)", color: "#B83232", border: "1px solid rgba(184,50,50,0.3)", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              <span>{pwErr}</span>
            </div>
          )}

          <div className="security-layout-grid">

            {/* COLONNE GAUCHE (Formulaires & Confidentialité) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* 1. Formulaire Changement de Mot de Passe */}
              <div className="security-card" style={{ background: "var(--blanc)", borderRadius: 20, padding: "26px 22px", border: "1px solid var(--gris-b)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
                <div style={{ paddingBottom: 16, borderBottom: "1px solid var(--gris-b)", marginBottom: 20 }}>
                  <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: 17, fontWeight: 800, color: "var(--noir)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="18" height="18" fill="var(--or)" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                    <span>{t('security.change_pwd_title')}</span>
                  </h2>
                  <p style={{ fontSize: 12.5, color: "var(--gris)", margin: 0 }}>
                    {t('security.change_pwd_reason')}
                  </p>
                </div>

                <form onSubmit={handleChangePw}>
                  {/* Ancien mot de passe */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>{t('security.current_pwd')}</label>
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                      <input
                        type={showCurrent ? "text" : "password"}
                        value={pwForm.current}
                        onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
                        placeholder="••••••••"
                        required
                        style={{ ...inputStyle, paddingRight: 44 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        style={eyeBtnStyle}
                        title={showCurrent ? t('security.hide_pwd') : t('security.show_pwd')}
                      >
                        <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                      </button>
                    </div>
                  </div>

                  {/* Nouveau mot de passe & Confirmation */}
                  <div className="form-row-2">
                    <div>
                      <label style={labelStyle}>{t('security.new_pwd')}</label>
                      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <input
                          type={showNew ? "text" : "password"}
                          value={pwForm.newPw}
                          onChange={(e) => setPwForm((f) => ({ ...f, newPw: e.target.value }))}
                          placeholder={t('security.pwd_placeholder_min')}
                          required
                          minLength={8}
                          style={{ ...inputStyle, paddingRight: 44 }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew(!showNew)}
                          style={eyeBtnStyle}
                          title={showNew ? t('security.hide_pwd') : t('security.show_pwd')}
                        >
                          <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                        </button>
                      </div>

                      {/* Jauge de complexité */}
                      {pwForm.newPw && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: strength.color, marginBottom: 4 }}>
                            <span>{t('security.strength_label')}</span>
                            <span>{strength.label}</span>
                          </div>
                          <div style={{ width: "100%", height: 5, borderRadius: 4, background: "var(--gris-b)", overflow: "hidden" }}>
                            <div style={{ width: `${strength.score}%`, height: "100%", background: strength.color, transition: "all 0.3s" }} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={labelStyle}>{t('security.confirm_pwd')}</label>
                      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <input
                          type={showConfirm ? "text" : "password"}
                          value={pwForm.confirm}
                          onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
                          placeholder={t('security.pwd_placeholder_repeat')}
                          required
                          minLength={8}
                          style={{ ...inputStyle, paddingRight: 44 }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          style={eyeBtnStyle}
                          title={showConfirm ? t('security.hide_pwd') : t('security.show_pwd')}
                        >
                          <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 24, textAlign: "right" }}>
                    <button
                      type="submit"
                      disabled={pwLoad}
                      style={{
                        background: "linear-gradient(135deg, #D4AF37, #F6D365)",
                        color: "#0F0D09",
                        border: "none",
                        borderRadius: 12,
                        padding: "12px 24px",
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 800,
                        fontSize: 13.5,
                        cursor: pwLoad ? "wait" : "pointer",
                        boxShadow: "0 4px 14px rgba(212,175,55,0.35)",
                        transition: "transform 0.15s ease"
                      }}
                    >
                      {pwLoad ? t('common.saving') : t('security.save_pwd')}
                    </button>
                  </div>
                </form>
              </div>

              {/* 2. Confidentialité & Chiffrement des données Cameroun */}
              <div className="security-card" style={{ background: "var(--blanc)", borderRadius: 20, padding: "26px 22px", border: "1px solid var(--gris-b)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
                <div style={{ paddingBottom: 16, borderBottom: "1px solid var(--gris-b)", marginBottom: 18 }}>
                  <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: 17, fontWeight: 800, color: "var(--noir)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="18" height="18" fill="var(--or)" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
                    <span>{t('security.privacy_title')}</span>
                  </h2>
                  <p style={{ fontSize: 12.5, color: "var(--gris)", margin: 0 }}>
                    {t('security.privacy_sub')}
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 14, background: "var(--gris-f)", border: "1px solid var(--gris-b)" }}>
                    <div>
                      <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 13.5, fontWeight: 700, color: "var(--noir)" }}>{t('security.privacy_phone')}</div>
                      <div style={{ fontSize: 11.5, color: "var(--gris)" }}>{t('security.privacy_phone_sub')}</div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={privacyPrefs.hidePhoneUntilVisit} 
                      onChange={() => togglePrivacy('hidePhoneUntilVisit')}
                      style={{ width: 20, height: 20, accentColor: "var(--or)", cursor: "pointer" }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 14, background: "var(--gris-f)", border: "1px solid var(--gris-b)" }}>
                    <div>
                      <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 13.5, fontWeight: 700, color: "var(--noir)" }}>{t('security.privacy_docs')}</div>
                      <div style={{ fontSize: 11.5, color: "var(--gris)" }}>{t('security.privacy_docs_sub')}</div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={privacyPrefs.encryptDocuments} 
                      onChange={() => togglePrivacy('encryptDocuments')}
                      style={{ width: 20, height: 20, accentColor: "var(--or)", cursor: "pointer" }}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Zone de Danger & Suppression du Compte */}
              <div style={{ background: "rgba(184,50,50,0.08)", borderRadius: 20, padding: "24px 22px", border: "1px solid rgba(184,50,50,0.25)" }}>
                <h3 style={{ fontFamily: "Poppins, sans-serif", fontSize: 15, fontWeight: 800, color: "#E53E3E", margin: "0 0 6px" }}>
                  {t('security.danger_title')}
                </h3>
                <p style={{ fontSize: 12.5, color: "var(--gris)", lineHeight: 1.5, margin: "0 0 16px" }}>
                  {t('security.danger_sub')}
                </p>
                <button
                  type="button"
                  onClick={() => alert(t('security.danger_alert'))}
                  style={{ background: "transparent", color: "#E53E3E", border: "1.5px solid #E53E3E", borderRadius: 12, padding: "10px 18px", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}
                >
                  {t('security.danger_btn')}
                </button>
              </div>

            </div>

            {/* COLONNE DROITE (Sessions & Recommandations) */}
            <div className="security-sidebar-col" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* Carte Sessions Actives */}
              <div className="security-card" style={{ background: "var(--blanc)", borderRadius: 20, padding: "22px 20px", border: "1px solid var(--gris-b)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
                <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 14.5, fontWeight: 800, color: "var(--noir)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="18" height="18" fill="var(--or-d)" viewBox="0 0 24 24"><path d="M4 6h16v10H4z M20 18H4v1c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-1z"/></svg>
                  <span>{t('security.sessions_title')}</span>
                </div>

                <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(30,122,71,0.1)", border: "1px solid rgba(30,122,71,0.25)", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#48BB78" }}>{t('security.session_current')}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, background: "#1E7A47", color: "#FFF", padding: "2px 8px", borderRadius: 10 }}>{t('security.session_in_progress')}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--gris)" }}>{t('security.session_device')}</div>
                  <div style={{ fontSize: 11, color: "var(--gris-m)", marginTop: 4 }}>{t('security.session_activity')}</div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(t('security.logout_all_confirm'))) {
                      logout?.();
                    }
                  }}
                  style={{ width: "100%", padding: "10px", borderRadius: 10, background: "var(--gris-f)", border: "1px solid var(--gris-b)", color: "var(--noir)", fontFamily: "Poppins, sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                >
                  {t('security.logout_all_btn')}
                </button>
              </div>

              {/* Recommandations de Sécurité Piolo */}
              <div style={{ background: "linear-gradient(135deg, #1A1713, #0F0D09)", borderRadius: 20, padding: "22px 20px", color: "#FFFFFF", border: "1px solid rgba(212,175,55,0.3)" }}>
                <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 14.5, fontWeight: 800, color: "var(--or-l)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4.18L19 8.3V11c0 4.52-3.1 8.76-7 9.93-3.9-1.17-7-5.41-7-9.93V8.3l7-3.12zM10.5 14.59L8.41 12.5 7 13.91l3.5 3.5 7-7-1.41-1.41z"/></svg>
                  <span>{t('security.recommendations_title')}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: "var(--or-l)", fontWeight: 800 }}>✓</span>
                    <span>{t('security.rec_1')}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: "var(--or-l)", fontWeight: 800 }}>✓</span>
                    <span>{t('security.rec_2')}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: "var(--or-l)", fontWeight: 800 }}>✓</span>
                    <span>{t('security.rec_3')}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .security-layout-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
        }
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }
        .security-hero-content {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          gap: 24px;
          width: 100%;
        }
        .security-hero-left {
          display: flex;
          align-items: center;
          gap: 22px;
          text-align: left;
        }
        .security-hero-right {
          display: block;
        }
        html.dark .security-card {
          background: var(--blanc) !important;
          border-color: var(--gris-b) !important;
        }
        @media (max-width: 900px) {
          .security-hero-content {
            flex-direction: column;
            text-align: center;
          }
          .security-hero-left {
            flex-direction: column;
            text-align: center;
            gap: 14px;
          }
          .security-hero-right {
            width: 100%;
            display: flex;
            justify-content: center;
          }
          .security-layout-grid {
            grid-template-columns: 1fr;
          }
          .security-sidebar-col {
            margin-top: 10px;
          }
          .security-page-main {
            padding-bottom: calc(var(--bn-h, 54px) + 20px) !important;
          }
        }
        @media (max-width: 600px) {
          .form-row-2 {
            grid-template-columns: 1fr;
          }
        }
      ` }} />
    </div>
  );
}

const eyeBtnStyle = {
  position: "absolute",
  right: 10,
  background: "none",
  border: "none",
  color: "var(--gris)",
  cursor: "pointer",
  padding: 6,
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const labelStyle = { 
  display: "block", 
  fontSize: 11.5, 
  fontWeight: 700, 
  color: "var(--gris)", 
  marginBottom: 6, 
  textTransform: "uppercase", 
  letterSpacing: 0.5, 
  fontFamily: "Poppins, sans-serif" 
};

const inputStyle = { 
  width: "100%", 
  boxSizing: "border-box", 
  border: "1.5px solid var(--gris-b)", 
  borderRadius: 12, 
  padding: "11px 14px", 
  fontFamily: "DM Sans, sans-serif", 
  fontSize: 14, 
  outline: "none", 
  background: "var(--blanc)", 
  color: "var(--noir)",
  transition: "border-color 0.2s, background 0.2s"
};

