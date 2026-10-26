import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useDarkMode } from '../../context/DarkModeContext';
import api from '../../services/api';
import { cacheManager } from '../../services/cacheManager';
import Sidebar from '../../components/Sidebar';
import { getMediaUrl } from '../../utils/media';
import '../bailleur/dashboard.css';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const { dark, toggleDark } = useDarkMode();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const [activeTab, setActiveTab] = useState('INFO'); // 'INFO' | 'SECURITY' | 'NOTIFICATIONS' | 'THEME' | 'LOYALTY' | 'BAILLEUR'
  
  const cachedBailleur = cacheManager.get(`bailleur_profile_${user?.id || 'anon'}`);
  const [bailleurProfile, setBailleurProfile] = useState(() => cachedBailleur || null);
  const [bailleurForm, setBailleurForm] = useState(() => ({
    city: cachedBailleur?.dossier?.city || '',
    neighborhoods: cachedBailleur?.dossier?.neighborhoods || '',
    property_count: cachedBailleur?.dossier?.property_count || 1,
    property_types: cachedBailleur?.dossier?.property_types || '',
    description: cachedBailleur?.dossier?.description || '',
  }));
  const [bailleurLoading, setBailleurLoading] = useState(() => !cachedBailleur);
  const [bailleurSaving, setBailleurSaving] = useState(false);

  // Préférences de notifications (stockées localement et synchronisées)
  const [notifPrefs, setNotifPrefs] = useState(() => {
    const saved = localStorage.getItem('piolo-notif-prefs');
    return saved ? JSON.parse(saved) : {
      whatsapp_alerts: true,
      whatsapp_visits: true,
      whatsapp_messages: true,
      email_alerts: true,
      email_summary: false,
      sms_urgent: true
    };
  });

  useEffect(() => () => {
    if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

  // Track readOnly state for each field
  const [readOnly, setReadOnly] = useState({
    first_name: true,
    last_name: true,
    phone: true,
    city: true,
  });

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const refs = {
    first_name: useRef(null),
    last_name: useRef(null),
    phone: useRef(null),
    city: useRef(null),
  };

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        city: user.city || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (user?.role !== 'BAILLEUR') {
      setBailleurProfile(null);
      return undefined;
    }
    let active = true;
    const existing = cacheManager.get(`bailleur_profile_${user?.id || 'anon'}`);
    if (!existing) setBailleurLoading(true);

    api.get('/auth/bailleur-profile/')
      .then(({ data }) => {
        if (!active) return;
        setBailleurProfile(data);
        cacheManager.set(`bailleur_profile_${user?.id || 'anon'}`, data, 180000);
        if (data.dossier) {
          setBailleurForm({
            city: data.dossier.city || '',
            neighborhoods: data.dossier.neighborhoods || '',
            property_count: data.dossier.property_count || 1,
            property_types: data.dossier.property_types || '',
            description: data.dossier.description || '',
          });
        }
      })
      .catch(() => { if (active && !existing) setBailleurProfile({ exists: false, completion: 0, dossier: null }); })
      .finally(() => { if (active) setBailleurLoading(false); });
    return () => { active = false; };
  }, [user?.role, user?.id]);

  const toggleEditField = (field) => {
    setReadOnly((prev) => {
      const nextState = !prev[field];
      if (!nextState) {
        setTimeout(() => refs[field]?.current?.focus(), 50);
      }
      return { ...prev, [field]: nextState };
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setErrorMsg('');
    try {
      await api.patch('/auth/me/', form);
      await refreshUser?.();
      setMessage('Vos informations personnelles ont été enregistrées avec succès.');
      setReadOnly({ first_name: true, last_name: true, phone: true, city: true });
    } catch (err) {
      console.error('Profile update error:', err);
      setErrorMsg(err.response?.data?.detail || err.response?.data?.error || "Erreur lors de la mise à jour du profil.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      return setErrorMsg('Les mots de passe ne correspondent pas.');
    }
    setSaving(true);
    setMessage('');
    setErrorMsg('');
    try {
      await api.post('/auth/change-password/', {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      });
      setMessage('Votre mot de passe a été mis à jour avec succès.');
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || err.response?.data?.old_password?.[0] || "Erreur lors de la modification du mot de passe.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const localPreview = URL.createObjectURL(file);
    setAvatarPreview(localPreview);
    setAvatarError(false);
    const body = new FormData();
    body.append('avatar', file);
    setLoading(true);
    setMessage('');
    setErrorMsg('');
    try {
      const { data } = await api.patch('/auth/me/', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const remoteAvatar = getMediaUrl(data?.avatar_url || data?.avatar);
      if (remoteAvatar) setAvatarPreview(remoteAvatar);
      await refreshUser?.();
      setMessage('Photo de profil mise à jour avec succès.');
    } catch (err) {
      console.error('Avatar upload error:', err);
      setAvatarPreview(null);
      setErrorMsg("Impossible de mettre à jour la photo de profil.");
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleNotifToggle = (key) => {
    setNotifPrefs(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('piolo-notif-prefs', JSON.stringify(next));
      return next;
    });
    setMessage('Préférences de notifications mises à jour.');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleBailleurSubmit = async (e) => {
    e.preventDefault();
    if (!bailleurProfile?.exists) return;
    setBailleurSaving(true);
    setMessage('');
    setErrorMsg('');
    try {
      const { data } = await api.patch('/auth/bailleur-profile/', {
        ...bailleurForm,
        property_count: Number(bailleurForm.property_count) || 1,
      });
      setBailleurProfile(data);
      setMessage('Profil bailleur mis à jour avec succès.');
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || err.response?.data?.property_count?.[0] || 'Impossible de mettre à jour le profil bailleur.');
    } finally {
      setBailleurSaving(false);
    }
  };

  const avatarUrl = getMediaUrl(user?.avatar_url || user?.avatar);
  const displayAvatarUrl = avatarPreview || avatarUrl;
  const completionFields = [user?.first_name, user?.last_name, user?.email, user?.phone, user?.city, displayAvatarUrl];
  const completedCount = completionFields.filter(Boolean).length;
  const basicProfileCompletion = Math.round((completedCount / completionFields.length) * 100);
  const profileCompletion = user?.role === 'BAILLEUR' && bailleurProfile?.exists
    ? Math.round((basicProfileCompletion + (bailleurProfile.completion || 0)) / 2)
    : basicProfileCompletion;

  // Calcul du statut fidélité
  const points = user?.points ?? 50;
  const tier = points >= 200 ? 'Or' : points >= 100 ? 'Argent' : 'Bronze';

  return (
    <div className="layout">
      <Sidebar />

      <div className="main profile-page-main" style={{ overflowY: 'auto', padding: '0 0 80px 0', background: 'var(--bg, #F8F6F1)' }}>

        {/* ========================================================= */}
        {/* HERO BANNER LUXE CAMEROUNAIS AVEC HEADER PROFIL           */}
        {/* ========================================================= */}
        <div 
          className="profile-hero-banner"
          style={{
            position: 'relative',
            background: 'linear-gradient(180deg, rgba(15,13,9,0.92) 0%, rgba(20,17,13,0.98) 100%), url(/img/cameroun-luxury-banner.jpg) center/cover no-repeat',
            borderBottom: '1px solid rgba(212,175,55,0.3)',
            padding: 'max(env(safe-area-inset-top, 0px) + 20px, 32px) clamp(20px, 3.5vw, 56px) 32px',
            color: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {/* Ligne Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <Link 
              to={user?.role === 'BAILLEUR' ? '/dashboard/bailleur' : '/dashboard/locataire'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(212,175,55,0.3)',
                color: '#FFFFFF',
                fontSize: 12.5,
                fontWeight: 700,
                textDecoration: 'none',
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              <span>{t('profile.back_dashboard')}</span>
            </Link>

            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--or-l)', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.35)', padding: '4px 12px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('profile.secure_account')}
            </span>
          </div>

          {/* Profil Avatar, Noms & Stats Desktop / Mobile */}
          <div className="profile-hero-content">
            {/* Colonne Gauche : Avatar + Infos */}
            <div className="profile-hero-left">
              <div style={{ position: 'relative' }}>
                <label 
                  htmlFor="avatarInput" 
                  style={{
                    position: 'relative',
                    width: 104,
                    height: 104,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '3px solid var(--or)',
                    boxShadow: '0 0 24px rgba(212,175,55,0.45)',
                    cursor: 'pointer',
                    background: '#1A1713',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                  title="Modifier votre photo de profil"
                >
                  {displayAvatarUrl && !avatarError ? (
                    <img
                      src={displayAvatarUrl}
                      alt="Photo de profil"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--or-l)', fontFamily: 'Poppins, sans-serif' }}>
                      {user?.first_name?.[0]?.toUpperCase() || 'P'}{user?.last_name?.[0]?.toUpperCase() || ''}
                    </span>
                  )}
                  
                  {/* Overlay Caméra */}
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} className="avatar-hover-overlay">
                    <svg width="22" height="22" fill="#fff" viewBox="0 0 24 24"><path d="M4 4h3l2-2h6l2 2h3c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM12 15c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0-2c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"/></svg>
                  </div>
                </label>

                {/* Badge Caméra */}
                <label 
                  htmlFor="avatarInput"
                  style={{
                    position: 'absolute',
                    bottom: 2,
                    right: 2,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--or), var(--or-l))',
                    color: '#0F0D09',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    cursor: 'pointer',
                    border: '2px solid #0F0D09'
                  }}
                >
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h3l2-2h6l2 2h3c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM12 15c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0-2c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"/></svg>
                </label>
                <input type="file" id="avatarInput" style={{ display: 'none' }} accept="image/*" onChange={handleAvatarChange} />
              </div>

              <div className="profile-hero-meta">
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 24, fontWeight: 800, color: '#FFFFFF', margin: '0 0 4px', lineHeight: 1.2 }}>
                  {user?.first_name || 'Utilisateur'} {user?.last_name || ''}
                </h1>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.7)', margin: '0 0 12px' }}>
                  {user?.email}
                </p>

                {/* Badges d'état dorés */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }} className="profile-hero-badges">
                  <div 
                    onClick={() => setActiveTab('LOYALTY')}
                    style={{ background: 'rgba(212,175,55,0.18)', border: '1px solid rgba(212,175,55,0.45)', padding: '6px 16px', borderRadius: 30, fontSize: 12, fontWeight: 800, fontFamily: 'Poppins, sans-serif', color: 'var(--or-l)', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  <span>{user?.points ?? 50} {t('profile.points_level')} {tier}</span>
                  </div>
                  <div className="pfl-badge-role" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: 30, fontSize: 12, fontWeight: 700, fontFamily: 'Poppins, sans-serif', color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    <span>
                      {user?.role === 'BAILLEUR' 
                        ? t('profile.role_certified_landlord')
                        : (user?.role === 'ARCHITECTE' || user?.role === 'PROFESSIONNEL' 
                          ? t('profile.role_pro_habitat')
                          : (user?.role === 'ADMIN' ? t('profile.role_admin') : t('profile.role_tenant')))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne Droite (Desktop) : Progression de profil */}
            <div className="profile-hero-right">
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: '14px 20px', border: '1px solid rgba(255,255,255,0.12)', minWidth: 260 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'rgba(255,255,255,0.9)' }}>
                  <span>{t('profile.profile_completion')}</span>
                  <span style={{ color: 'var(--or-l)', fontWeight: 800 }}>{profileCompletion}%</span>
                </div>
                <div style={{ width: '100%', height: 7, borderRadius: 6, background: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
                  <div style={{ width: `${profileCompletion}%`, height: '100%', background: 'linear-gradient(90deg, var(--or), var(--or-l))', transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
                  {profileCompletion === 100 ? t('profile.completion_done') : t('profile.completion_hint')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CORPS DE LA PAGE (Pleine Largeur Web / Tactile Mobile)    */}
        {/* ========================================================= */}
        <div style={{ padding: '28px clamp(20px, 3.5vw, 56px)', width: '100%', boxSizing: 'border-box' }}>

          {/* Feedback Messages */}
          {message && (
            <div style={{ padding: '14px 18px', borderRadius: 14, fontFamily: 'Poppins, sans-serif', fontSize: 13.5, fontWeight: 700, background: 'rgba(30,122,71,0.12)', color: '#1E7A47', border: '1px solid rgba(30,122,71,0.3)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              <span>{message}</span>
            </div>
          )}

          {errorMsg && (
            <div style={{ padding: '14px 18px', borderRadius: 14, fontFamily: 'Poppins, sans-serif', fontSize: 13.5, fontWeight: 700, background: 'rgba(184,50,50,0.12)', color: '#B83232', border: '1px solid rgba(184,50,50,0.3)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Onglets Tactiles Segmentés & Anti-Chevauchement */}
          <div 
            className="profile-tabs-nav"
            style={{ 
              display: 'flex', 
              gap: 8, 
              background: 'var(--gris-b)', 
              padding: 6, 
              borderRadius: 16, 
              marginBottom: 26,
              overflowX: 'auto',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {[
              { id: 'INFO', label: t('profile.tab_info'), icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
              { id: 'SECURITY', label: t('profile.tab_security'), icon: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z' },
              { id: 'NOTIFICATIONS', label: t('profile.tab_notifs'), icon: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z' },
              { id: 'THEME', label: t('profile.tab_theme'), icon: 'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z' },
              { id: 'LOYALTY', label: t('profile.tab_loyalty'), icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
              ...(user?.role === 'BAILLEUR' ? [{ id: 'BAILLEUR', label: t('profile.tab_assets'), icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' }] : [])
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: '1 0 auto',
                  minWidth: 'max-content',
                  padding: '10px 18px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 13,
                  fontWeight: 700,
                  background: activeTab === tab.id ? 'var(--blanc)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--noir)' : 'var(--gris)',
                  boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  whiteSpace: 'nowrap'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d={tab.icon}/></svg>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="profile-layout-grid">
            
            {/* COLONNE PRINCIPALE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* 1. INFORMATIONS PERSONNELLES */}
              {activeTab === 'INFO' && (
                <div className="profile-card" style={{ background: 'var(--blanc)', borderRadius: 20, padding: '24px 22px', border: '1px solid var(--gris-b)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                  <div style={{ paddingBottom: 14, borderBottom: '1px solid var(--gris-b)', marginBottom: 18 }}>
                    <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16.5, fontWeight: 800, color: 'var(--noir)', margin: 0 }}>
                      {t('profile.personal_info_title')}
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--gris)', margin: '4px 0 0' }}>
                      {t('profile.personal_info_sub')}
                    </p>
                  </div>

                  <form onSubmit={handleProfileSubmit}>
                    <div className="form-row-2">
                      <div>
                        <label style={labelStyle}>{t('profile.first_name')}</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input
                            ref={refs.first_name}
                            type="text"
                            value={form.first_name}
                            onChange={e => setForm({ ...form, first_name: e.target.value })}
                            readOnly={readOnly.first_name}
                            style={{ ...inputStyle, paddingRight: 42, background: readOnly.first_name ? 'var(--gris-f)' : 'var(--blanc)', borderColor: readOnly.first_name ? 'var(--gris-b)' : 'var(--or)' }}
                            required
                          />
                          <button type="button" onClick={() => toggleEditField('first_name')} style={pencilBtnStyle(readOnly.first_name)} title={t('profile.edit_field')}>
                            <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label style={labelStyle}>{t('profile.last_name')}</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input
                            ref={refs.last_name}
                            type="text"
                            value={form.last_name}
                            onChange={e => setForm({ ...form, last_name: e.target.value })}
                            readOnly={readOnly.last_name}
                            style={{ ...inputStyle, paddingRight: 42, background: readOnly.last_name ? 'var(--gris-f)' : 'var(--blanc)', borderColor: readOnly.last_name ? 'var(--gris-b)' : 'var(--or)' }}
                            required
                          />
                          <button type="button" onClick={() => toggleEditField('last_name')} style={pencilBtnStyle(readOnly.last_name)} title={t('profile.edit_field')}>
                            <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>{t('profile.email')}</label>
                      <input type="email" value={user?.email || ''} readOnly style={{ ...inputStyle, background: 'var(--gris-f)', color: 'var(--gris)', cursor: 'not-allowed' }} />
                      <span style={{ fontSize: 11, color: 'var(--gris)', marginTop: 4, display: 'block' }}>{t('profile.email_security_hint')}</span>
                    </div>

                    <div className="form-row-2">
                      <div>
                        <label style={labelStyle}>{t('profile.phone')}</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input
                            ref={refs.phone}
                            type="tel"
                            value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value })}
                            readOnly={readOnly.phone}
                            placeholder="+237 6..."
                            style={{ ...inputStyle, paddingRight: 42, background: readOnly.phone ? 'var(--gris-f)' : 'var(--blanc)', borderColor: readOnly.phone ? 'var(--gris-b)' : 'var(--or)' }}
                          />
                          <button type="button" onClick={() => toggleEditField('phone')} style={pencilBtnStyle(readOnly.phone)} title={t('profile.edit_field')}>
                            <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label style={labelStyle}>{t('profile.city')}</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input
                            ref={refs.city}
                            type="text"
                            value={form.city}
                            onChange={e => setForm({ ...form, city: e.target.value })}
                            readOnly={readOnly.city}
                            placeholder="Yaoundé, Douala..."
                            style={{ ...inputStyle, paddingRight: 42, background: readOnly.city ? 'var(--gris-f)' : 'var(--blanc)', borderColor: readOnly.city ? 'var(--gris-b)' : 'var(--or)' }}
                          />
                          <button type="button" onClick={() => toggleEditField('city')} style={pencilBtnStyle(readOnly.city)} title={t('profile.edit_field')}>
                            <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: 22, textAlign: 'right' }}>
                      <button type="submit" disabled={saving} style={btnSubmit}>
                        {saving ? t('profile.saving_changes') : t('profile.save_changes')}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 2. SÉCURITÉ & MOT DE PASSE */}
              {activeTab === 'SECURITY' && (
                <div className="profile-card" style={{ background: 'var(--blanc)', borderRadius: 20, padding: '24px 22px', border: '1px solid var(--gris-b)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                  <div style={{ paddingBottom: 14, borderBottom: '1px solid var(--gris-b)', marginBottom: 18 }}>
                    <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16.5, fontWeight: 800, color: 'var(--noir)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg width="18" height="18" fill="var(--or)" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                      <span>{t('security.change_pwd_title')}</span>
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--gris)', margin: '4px 0 0' }}>
                      {t('profile.change_pwd_sub')}
                    </p>
                  </div>

                  <form onSubmit={handlePasswordSubmit}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>{t('security.current_pwd')}</label>
                      <input type="password" value={passwordForm.old_password} onChange={e => setPasswordForm({ ...passwordForm, old_password: e.target.value })} style={inputStyle} required placeholder="••••••••" />
                    </div>

                    <div className="form-row-2">
                      <div>
                        <label style={labelStyle}>{t('security.new_pwd')}</label>
                        <input type="password" value={passwordForm.new_password} onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })} style={inputStyle} required minLength={6} placeholder="••••••••" />
                      </div>
                      <div>
                        <label style={labelStyle}>{t('security.confirm_pwd')}</label>
                        <input type="password" value={passwordForm.confirm_password} onChange={e => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })} style={inputStyle} required minLength={6} placeholder="••••••••" />
                      </div>
                    </div>

                    <div style={{ marginTop: 22, textAlign: 'right' }}>
                      <button type="submit" disabled={saving} style={btnSubmit}>
                        {saving ? t('profile.updating_pwd') : t('profile.update_pwd_btn')}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 3. NOTIFICATIONS & WHATSAPP CAMEROUN */}
              {activeTab === 'NOTIFICATIONS' && (
                <div className="profile-card" style={{ background: 'var(--blanc)', borderRadius: 20, padding: '24px 22px', border: '1px solid var(--gris-b)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                  <div style={{ paddingBottom: 14, borderBottom: '1px solid var(--gris-b)', marginBottom: 18 }}>
                    <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16.5, fontWeight: 800, color: 'var(--noir)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg width="18" height="18" fill="var(--or)" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
                      <span>{t('profile.notif_title')}</span>
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--gris)', margin: '4px 0 0' }}>
                      {t('profile.notif_sub')}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* WhatsApp */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 14, background: 'var(--gris-f)', border: '1px solid var(--gris-b)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(37,211,102,0.12)', color: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg>
                        </div>
                        <div>
                          <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13.5, fontWeight: 700, color: 'var(--noir)' }}>{t('profile.notif_whatsapp_title')}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--gris)' }}>{t('profile.notif_whatsapp_sub')}</div>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={notifPrefs.whatsapp_alerts} 
                        onChange={() => handleNotifToggle('whatsapp_alerts')}
                        style={{ width: 20, height: 20, accentColor: 'var(--or)', cursor: 'pointer' }}
                      />
                    </div>

                    {/* Email */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 14, background: 'var(--gris-f)', border: '1px solid var(--gris-b)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(212,175,55,0.12)', color: 'var(--or-d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                        </div>
                        <div>
                          <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13.5, fontWeight: 700, color: 'var(--noir)' }}>{t('profile.notif_email_title')}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--gris)' }}>{t('profile.notif_email_sub')}</div>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={notifPrefs.email_alerts} 
                        onChange={() => handleNotifToggle('email_alerts')}
                        style={{ width: 20, height: 20, accentColor: 'var(--or)', cursor: 'pointer' }}
                      />
                    </div>

                    {/* SMS */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 14, background: 'var(--gris-f)', border: '1px solid var(--gris-b)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(30,58,110,0.15)', color: '#63B3ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                        </div>
                        <div>
                          <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13.5, fontWeight: 700, color: 'var(--noir)' }}>{t('profile.notif_sms_title')}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--gris)' }}>{t('profile.notif_sms_sub')}</div>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={notifPrefs.sms_urgent} 
                        onChange={() => handleNotifToggle('sms_urgent')}
                        style={{ width: 20, height: 20, accentColor: 'var(--or)', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 4. MODE SOMBRE / CLAIR DÉDIÉ */}
              {activeTab === 'THEME' && (
                <div className="profile-card" style={{ background: 'var(--blanc)', borderRadius: 20, padding: '24px 22px', border: '1px solid var(--gris-b)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                  <div style={{ paddingBottom: 14, borderBottom: '1px solid var(--gris-b)', marginBottom: 18 }}>
                    <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16.5, fontWeight: 800, color: 'var(--noir)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg width="18" height="18" fill="var(--or)" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>
                      <span>{t('profile.theme_title')}</span>
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--gris)', margin: '4px 0 0' }}>
                      {t('profile.theme_sub')}
                    </p>
                  </div>

                  <div className="form-row-2">
                    {/* Carte Mode Clair */}
                    <div 
                      onClick={() => { if (dark) toggleDark(); }}
                      style={{
                        padding: '18px 16px',
                        borderRadius: 16,
                        border: !dark ? '2px solid var(--or)' : '1px solid var(--gris-b)',
                        background: !dark ? 'rgba(212,175,55,0.08)' : 'var(--blanc)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 10,
                        textAlign: 'center',
                        boxShadow: !dark ? '0 4px 14px rgba(212,175,55,0.2)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gris-f)', border: '1px solid var(--gris-b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--noir)' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1z"/></svg>
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 800, color: 'var(--noir)' }}>{t('profile.theme_light_title')}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--gris)' }}>{t('profile.theme_light_sub')}</div>
                      </div>
                      {!dark && <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--or-d)' }}>{t('profile.theme_selected')}</span>}
                    </div>

                    {/* Carte Mode Sombre */}
                    <div 
                      onClick={() => { if (!dark) toggleDark(); }}
                      style={{
                        padding: '18px 16px',
                        borderRadius: 16,
                        border: dark ? '2px solid var(--or)' : '1px solid var(--gris-b)',
                        background: dark ? 'rgba(212,175,55,0.12)' : '#1A1713',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 10,
                        textAlign: 'center',
                        boxShadow: dark ? '0 4px 16px rgba(212,175,55,0.3)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#0F0D09', border: '1px solid var(--or)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--or-l)' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 800, color: '#FFFFFF' }}>{t('profile.theme_dark_title')}</div>
                        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.65)' }}>{t('profile.theme_dark_sub')}</div>
                      </div>
                      {dark && <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--or-l)' }}>{t('profile.theme_selected')}</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* 5. HISTORIQUE DES POINTS & RÉCOMPENSES FIDÉLITÉ */}
              {activeTab === 'LOYALTY' && (
                <div className="profile-card" style={{ background: 'var(--blanc)', borderRadius: 20, padding: '24px 22px', border: '1px solid var(--gris-b)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                  <div style={{ paddingBottom: 14, borderBottom: '1px solid var(--gris-b)', marginBottom: 18 }}>
                    <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16.5, fontWeight: 800, color: 'var(--noir)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg width="18" height="18" fill="var(--or)" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      <span>{t('profile.loyalty_title')}</span>
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--gris)', margin: '4px 0 0' }}>
                      {t('profile.loyalty_sub')}
                    </p>
                  </div>

                  {/* Statut & Solde */}
                  <div style={{ background: 'linear-gradient(135deg, #1A1713, #0F0D09)', borderRadius: 16, padding: '18px 20px', color: '#FFFFFF', border: '1px solid rgba(212,175,55,0.3)', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('profile.loyalty_balance')}</div>
                      <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--or-l)', margin: '2px 0' }}>{points} {t('profile.loyalty_points')}</div>
                      <div style={{ fontSize: 11.5, color: '#FFFFFF' }}>{t('profile.loyalty_status')} <strong style={{ color: 'var(--or-l)' }}>{t('profile.loyalty_tier')} {tier}</strong></div>
                    </div>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(212,175,55,0.2)', border: '1px solid var(--or)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--or-l)' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    </div>
                  </div>

                  {/* Historique des gains */}
                  <h4 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--noir)', margin: '0 0 12px' }}>{t('profile.loyalty_history')}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
                    {[
                      { title: 'Inscription & Bienvenue', pts: '+50 pts', date: 'Création du compte', done: true },
                      { title: 'Profil complété à 100%', pts: '+20 pts', date: profileCompletion === 100 ? 'Complété' : 'À compléter', done: profileCompletion === 100 },
                      { title: 'Première visite effectuée', pts: '+30 pts', date: 'Visite validée', done: false },
                      { title: 'Dossier de location approuvé', pts: '+50 pts', date: 'Bail signé', done: false }
                    ].map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 12, background: 'var(--gris-f)', border: '1px solid var(--gris-b)' }}>
                        <div>
                          <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--noir)' }}>{item.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--gris)' }}>{item.date}</div>
                        </div>
                        <span style={{ fontSize: 12.5, fontWeight: 800, color: item.done ? 'var(--vert)' : 'var(--gris)' }}>
                          {item.pts}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Avantages à débloquer */}
                  <h4 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--noir)', margin: '0 0 12px' }}>{t('profile.loyalty_unlocked')}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(30,122,71,0.1)', border: '1px solid rgba(30,122,71,0.25)', fontSize: 12.5, fontWeight: 700, color: '#48BB78', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>✓</span>
                      <span>{t('profile.loyalty_badge_active')}</span>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--gris-f)', border: '1px solid var(--gris-b)', fontSize: 12.5, color: 'var(--gris)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'var(--or-d)' }}>🔒</span>
                      <span>{t('profile.loyalty_priority_visits')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. PROFIL BAILLEUR (si applicable) */}
              {activeTab === 'BAILLEUR' && user?.role === 'BAILLEUR' && (
                <div className="profile-card" style={{ background: 'var(--blanc)', borderRadius: 20, padding: '24px 22px', border: '1px solid var(--gris-b)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: '1px solid var(--gris-b)', marginBottom: 18 }}>
                    <div>
                      <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16.5, fontWeight: 800, color: 'var(--noir)', margin: 0 }}>
                        {t('profile.bailleur_title')}
                      </h3>
                      <p style={{ fontSize: 12, color: 'var(--gris)', margin: '4px 0 0' }}>
                        {t('profile.bailleur_sub')}
                      </p>
                    </div>
                    {bailleurProfile?.dossier && (
                      <span style={{ padding: '4px 10px', borderRadius: 20, background: bailleurProfile.dossier.status === 'APPROVED' ? 'rgba(30,122,71,.12)' : 'rgba(212,175,55,.15)', color: bailleurProfile.dossier.status === 'APPROVED' ? 'var(--vert)' : 'var(--or-d)', fontSize: 11, fontWeight: 800 }}>
                        {bailleurProfile.dossier.status_label || t('profile.pending_review')}
                      </span>
                    )}
                  </div>

                  {bailleurLoading ? (
                    <div style={{ padding: '24px 0', color: 'var(--gris)', fontSize: 13, textAlign: 'center' }}>{t('profile.loading')}</div>
                  ) : !bailleurProfile?.exists ? (
                    <div style={{ padding: 18, borderRadius: 14, background: 'rgba(212,175,55,.08)', border: '1px solid rgba(212,175,55,.2)', color: 'var(--gris)', fontSize: 13, lineHeight: 1.55 }}>
                      {t('profile.bailleur_not_created')}
                    </div>
                  ) : (
                    <form onSubmit={handleBailleurSubmit}>
                      <div className="form-row-2">
                        <div>
                          <label style={labelStyle}>{t('profile.bailleur_main_city')}</label>
                          <input value={bailleurForm.city} onChange={e => setBailleurForm({ ...bailleurForm, city: e.target.value })} style={inputStyle} placeholder="Yaoundé" />
                        </div>
                        <div>
                          <label style={labelStyle}>{t('profile.bailleur_property_count')}</label>
                          <input type="number" min="1" max="999" value={bailleurForm.property_count} onChange={e => setBailleurForm({ ...bailleurForm, property_count: e.target.value })} style={inputStyle} />
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>{t('profile.bailleur_neighborhoods')}</label>
                        <input value={bailleurForm.neighborhoods} onChange={e => setBailleurForm({ ...bailleurForm, neighborhoods: e.target.value })} style={inputStyle} placeholder="Bastos, Omnisports, Bonapriso…" />
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>{t('profile.bailleur_property_types')}</label>
                        <input value={bailleurForm.property_types} onChange={e => setBailleurForm({ ...bailleurForm, property_types: e.target.value })} style={inputStyle} placeholder="Studios, Appartements, Villas…" />
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>{t('profile.bailleur_description')}</label>
                        <textarea value={bailleurForm.description} onChange={e => setBailleurForm({ ...bailleurForm, description: e.target.value })} style={{ ...inputStyle, minHeight: 88, resize: 'vertical' }} placeholder={t('profile.bailleur_description_placeholder')} />
                      </div>

                      <div style={{ marginTop: 22, textAlign: 'right' }}>
                        <button type="submit" disabled={bailleurSaving} style={btnSubmit}>
                          {bailleurSaving ? t('profile.saving_changes') : t('profile.bailleur_save_btn')}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

            </div>

            {/* COLONNE LATÉRALE WEB (STICKY) */}
            <div className="profile-sidebar-col" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Carte Fidélité Rapide */}
              <div style={{ background: 'linear-gradient(135deg, #1A1713, #0F0D09)', borderRadius: 20, padding: 24, color: '#FFFFFF', border: '1px solid rgba(212,175,55,0.3)', textAlign: 'center' }}>
                <div style={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  background: `conic-gradient(#D4AF37 ${profileCompletion}%, rgba(255,255,255,0.1) 0)`,
                  margin: '0 auto 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 22,
                  fontWeight: 800,
                  color: 'var(--or-l)'
                }}>
                  <div style={{ background: '#0F0D09', width: 74, height: 74, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {profileCompletion}%
                  </div>
                </div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{t('profile.completion_card_title')}</div>
                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, margin: '0 0 16px' }}>
                  {profileCompletion === 100 ? t('profile.completion_perfect') : t('profile.completion_boost')}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('LOYALTY')}
                  style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'rgba(212,175,55,0.15)', border: '1px solid var(--or)', color: 'var(--or-l)', fontFamily: 'Poppins, sans-serif', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                >
                  {t('profile.see_rewards')} ({points} pts)
                </button>
              </div>

              {/* Raccourcis Rapides */}
              <div className="profile-card" style={{ background: 'var(--blanc)', borderRadius: 20, padding: '20px 18px', border: '1px solid var(--gris-b)' }}>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 800, color: 'var(--noir)', marginBottom: 12 }}>
                  {t('profile.shortcuts_title')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link to="/properties" style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--gris-f)', textDecoration: 'none', color: 'var(--noir)', fontSize: 12.5, fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{t('profile.shortcut_explore')}</span>
                    <span style={{ color: 'var(--or-d)' }}>→</span>
                  </Link>
                  <Link to="/locations" style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--gris-f)', textDecoration: 'none', color: 'var(--noir)', fontSize: 12.5, fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{t('profile.shortcut_rentals')}</span>
                    <span style={{ color: 'var(--or-d)' }}>→</span>
                  </Link>
                  <Link to="/visits" style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--gris-f)', textDecoration: 'none', color: 'var(--noir)', fontSize: 12.5, fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{t('profile.shortcut_visits')}</span>
                    <span style={{ color: 'var(--or-d)' }}>→</span>
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        label:hover .avatar-hover-overlay {
          opacity: 1 !important;
        }
        .profile-layout-grid {
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
        .profile-hero-content {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          gap: 24px;
          width: 100%;
        }
        .profile-hero-left {
          display: flex;
          align-items: center;
          gap: 24px;
          text-align: left;
        }
        .profile-hero-right {
          display: block;
        }
        html.dark .profile-tabs-nav {
          background: #1C1914 !important;
        }
        html.dark .profile-card {
          background: var(--blanc) !important;
          border-color: var(--gris-b) !important;
        }
        @media (max-width: 900px) {
          .profile-hero-content {
            flex-direction: column;
            text-align: center;
          }
          .profile-hero-left {
            flex-direction: column;
            text-align: center;
            gap: 14px;
          }
          .profile-hero-badges {
            justify-content: center;
          }
          .profile-hero-right {
            width: 100%;
            display: flex;
            justify-content: center;
          }
          .profile-layout-grid {
            grid-template-columns: 1fr;
          }
          .profile-sidebar-col {
            display: none !important;
          }
          .profile-page-main {
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

const pencilBtnStyle = (isReadOnly) => ({
  position: 'absolute',
  right: 8,
  background: 'none',
  border: 'none',
  color: isReadOnly ? 'var(--gris)' : 'var(--or-d)',
  cursor: 'pointer',
  padding: 6,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
});

const labelStyle = { 
  display: 'block', 
  fontSize: 11.5, 
  fontWeight: 700, 
  color: 'var(--gris)', 
  marginBottom: 6, 
  textTransform: 'uppercase', 
  letterSpacing: 0.5, 
  fontFamily: 'Poppins, sans-serif' 
};

const inputStyle = { 
  width: '100%', 
  boxSizing: 'border-box', 
  border: '1.5px solid var(--gris-b)', 
  borderRadius: 12, 
  padding: '11px 14px', 
  fontFamily: 'DM Sans, sans-serif', 
  fontSize: 14, 
  outline: 'none', 
  background: 'var(--blanc)', 
  color: 'var(--noir)',
  transition: 'border-color 0.2s, background 0.2s'
};

const btnSubmit = { 
  background: 'linear-gradient(135deg, #D4AF37, #F6D365)', 
  color: '#0F0D09', 
  fontFamily: 'Poppins, sans-serif', 
  fontWeight: 800, 
  fontSize: 13.5, 
  border: 'none', 
  padding: '12px 22px', 
  borderRadius: 12, 
  cursor: 'pointer', 
  boxShadow: '0 4px 14px rgba(212,175,55,0.35)',
  transition: 'transform 0.15s ease'
};


