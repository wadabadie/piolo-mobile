// src/pages/auth/LoginPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';
import { compressKycImage, formatFileSize } from '../../utils/imageCompressor';
import '../../auth.css';

// SVG Icons matching auth.html exactly
const EyeIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>
);

const LogoSvg = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 34 34" fill="none">
    <rect width="34" height="34" rx="9" fill="rgba(212,175,55,.14)"/>
    <path d="M17 5L4 15v16h10v-9h6v9h10V15L17 5z" fill="#D4AF37"/>
    <path d="M17 5L4 15v16h10v-9h6v9h10V15L17 5z" fill="url(#lg_login)" opacity=".45"/>
    <defs>
      <linearGradient id="lg_login" x1="4" y1="5" x2="30" y2="31">
        <stop stopColor="#F6D365"/>
        <stop offset="1" stopColor="#D4AF37" stopOpacity="0"/>
      </linearGradient>
    </defs>
  </svg>
);

const CheckSvg = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--noir)' }}>
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
  </svg>
);

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, isAuthenticated, user, establishSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const getTarget = () => {
    const rawFrom = location.state?.from?.pathname || '/dashboard';
    if (rawFrom === '/dashboard' || rawFrom === '/unauthorized' || rawFrom === '/login' || rawFrom.startsWith('/dashboard/')) {
      if (isAuthenticated && user) {
        const routes = {
          LOCATAIRE: '/dashboard/locataire',
          BAILLEUR: '/dashboard/bailleur',
          ARCHITECTE: '/dashboard/pro',
          PROFESSIONNEL: '/dashboard/pro',
          ADMIN: '/dashboard/admin',
        };
        return routes[user.role] || '/properties';
      }
      return '/dashboard';
    }
    return rawFrom;
  };
  const from = getTarget();

  const paramTab = searchParams.get('tab');
  const paramRole = searchParams.get('role');
  const socialCode = searchParams.get('social_code');
  const isRegisterRoute = location.pathname === '/register' || location.pathname === '/inscription';

  // Screens: 'auth' (login/register), 'bailleur', 'forgot', 'choose-role', 'success-loc', 'success-bail'
  const [currentScreen, setCurrentScreen] = useState(
    paramTab === 'choose_role' || paramTab === 'choose-role' ? 'choose-role' : (paramTab === 'forgot' ? 'forgot' : 'auth')
  );
  const [activeTab, setActiveTab] = useState(paramTab === 'register' || isRegisterRoute ? 'register' : 'login');
  const [role, setRole] = useState(paramRole || 'LOCATAIRE');
  const [showPwd, setShowPwd] = useState(false);

  // Sync tab & screen when route/searchParams change dynamically
  useEffect(() => {
    if (paramTab === 'choose_role' || paramTab === 'choose-role') {
      setCurrentScreen('choose-role');
    } else if (paramTab === 'forgot') {
      setCurrentScreen('forgot');
    } else {
      setCurrentScreen('auth');
    }

    if (paramTab === 'register' || isRegisterRoute) {
      setActiveTab('register');
    } else if (paramTab === 'login') {
      setActiveTab('login');
    }
  }, [paramTab, location.pathname, isRegisterRoute]);

  // States for Social Role Selection
  const [selectedSocialRole, setSelectedSocialRole] = useState('LOCATAIRE');
  const [socialRoleSubmitting, setSocialRoleSubmitting] = useState(false);

  // States for Login
  const [lEmail, setLEmail] = useState('');
  const [lPwd, setLPwd] = useState('');

  // States for Register Standard (Locataire / Architecte)
  const [rFname, setRFname] = useState('');
  const [rLname, setRLname] = useState('');
  const [rEmail, setREmail] = useState('');
  const [rPwd, setRPwd] = useState('');
  const [rPwd2, setRPwd2] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // States for Forgot Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // States for Bailleur Onboarding (5 steps)
  const [bStep, setBStep] = useState(1);
  const [bData, setBData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    document_type: 'CNI',
    document_number: '',
    cni_recto: null,
    cni_verso: null,
    selfie: null,
    city: 'Yaoundé',
    neighborhoods: '',
    property_count: 2,
    property_types: ['Appartements'],
    description: '',
  });
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const [bAcceptCertif, setBAcceptCertif] = useState(false);
  const [bAcceptTerms, setBAcceptTerms] = useState(false);

  // UI Error / Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // OTP inputs refs
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const socialExchangeRef = useRef(null);

  // Redirect if already logged in (unless picking role via social)
  useEffect(() => {
    if (isAuthenticated && currentScreen !== 'choose-role' && !socialCode) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from, currentScreen, socialCode]);

  // Social Auth code exchange
  useEffect(() => {
    if (!socialCode || socialExchangeRef.current === socialCode) return;
    socialExchangeRef.current = socialCode;
    setLoading(true);
    setError('');
    authApi.socialExchange(socialCode)
      .then(({ data }) => {
        establishSession(data);
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('social_code');
        window.history.replaceState({}, '', cleanUrl.toString());

        if (data.needs_role_selection) {
          setCurrentScreen('choose-role');
          setLoading(false);
          return;
        }
        const routes = {
          LOCATAIRE: '/dashboard/locataire',
          BAILLEUR: '/dashboard/bailleur',
          ARCHITECTE: '/dashboard/pro',
          PROFESSIONNEL: '/dashboard/pro',
          ADMIN: '/dashboard/admin',
        };
        navigate(routes[data.user?.role] || '/dashboard', { replace: true });
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'La connexion sociale a échoué. Réessayez.');
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('social_code');
        window.history.replaceState({}, '', cleanUrl.toString());
      })
      .finally(() => setLoading(false));
  }, [socialCode, establishSession, navigate]);

  // OTP Timer Countdown
  useEffect(() => {
    let t;
    if (currentScreen === 'bailleur' && bStep === 2 && otpTimer > 0) {
      t = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [currentScreen, bStep, otpTimer]);

  // Reset errors when changing tabs or screens
  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setFieldErrors({});
  };

  const selectRole = (r) => {
    setRole(r);
    setError('');
    setFieldErrors({});
  };

  const handleConfirmRole = async (chosenRole) => {
    const r = chosenRole || selectedSocialRole;
    setSocialRoleSubmitting(true);
    setError('');
    try {
      const { data } = await authApi.setRole(r);
      const access = localStorage.getItem('piolo_access');
      const refresh = localStorage.getItem('piolo_refresh');
      establishSession({ access, refresh, user: data.user });
      sessionStorage.setItem('piolo_is_new_registration', 'true');
      const routes = {
        LOCATAIRE: '/dashboard/locataire',
        BAILLEUR: '/dashboard/bailleur',
        ARCHITECTE: '/dashboard/pro',
        PROFESSIONNEL: '/dashboard/pro',
        ADMIN: '/dashboard/admin',
      };
      navigate(routes[r] || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la configuration du profil.');
    } finally {
      setSocialRoleSubmitting(false);
    }
  };

  // --- Handlers ---
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setFieldErrors({});
    setError('');

    let valid = true;
    const errs = {};
    if (!lEmail || !/\S+@\S+\.\S+/.test(lEmail)) {
      errs.email = 'Adresse email invalide.';
      valid = false;
    }
    if (!lPwd) {
      errs.password = 'Mot de passe requis.';
      valid = false;
    }
    if (!valid) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(lEmail, lPwd);
      const routes = {
        LOCATAIRE: '/dashboard/locataire',
        BAILLEUR: '/dashboard/bailleur',
        ARCHITECTE: '/dashboard/pro',
        PROFESSIONNEL: '/dashboard/pro',
        ADMIN: '/dashboard/admin',
      };
      const roleDest = routes[loggedUser?.role];
      const rawFrom = location.state?.from?.pathname;
      const dest = (rawFrom && !rawFrom.startsWith('/dashboard') && rawFrom !== '/login' && rawFrom !== '/unauthorized')
        ? rawFrom
        : (roleDest || from || '/dashboard');
      sessionStorage.removeItem('piolo_is_new_registration');
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Erreur de connexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStd = async (e) => {
    if (e) e.preventDefault();
    setFieldErrors({});
    setError('');

    let valid = true;
    const errs = {};
    if (!rFname || !rLname) {
      setError('Prénom et nom sont requis.');
      valid = false;
    }
    if (!rEmail || !/\S+@\S+\.\S+/.test(rEmail)) {
      errs.email = 'Email invalide.';
      valid = false;
    }
    if (!rPwd || rPwd.length < 8) {
      errs.password = 'Minimum 8 caractères.';
      valid = false;
    }
    if (rPwd !== rPwd2) {
      errs.password_confirm = 'Les mots de passe ne correspondent pas.';
      valid = false;
    }
    if (!acceptTerms) {
      setError("Veuillez accepter les conditions d'utilisation.");
      valid = false;
    }
    if (!valid) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        first_name: rFname.trim(),
        last_name: rLname.trim(),
        email: rEmail.trim(),
        password: rPwd,
        role: role === 'PROFESSIONNEL' ? 'ARCHITECTE' : role,
      });
      sessionStorage.setItem('piolo_is_new_registration', 'true');
      await login(rEmail.trim(), rPwd);
      setCurrentScreen('success-loc');
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const extracted = {};
        let firstMsg = '';
        Object.entries(data).forEach(([key, val]) => {
          const msg = Array.isArray(val) ? val.join(' ') : (typeof val === 'string' ? val : JSON.stringify(val));
          extracted[key] = msg;
          if (!firstMsg && key !== 'detail' && key !== 'error') {
            firstMsg = msg;
          }
        });
        setFieldErrors(extracted);
        setError(data.detail || data.error || firstMsg || "Erreur lors de l'inscription.");
      } else {
        setError(err.message || "Erreur lors de l'inscription.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    if (e) e.preventDefault();
    if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      setError('Saisissez une adresse email valide.');
      return;
    }

    setLoading(true);
    setError('');
    setForgotSent(false);
    try {
      await authApi.forgotPassword({ email: forgotEmail });
      setForgotSent(true);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || "Le service d'email est temporairement indisponible. Réessayez dans quelques instants.");
      // Ignorer l'erreur réseau pour des raisons de sécurité
    } finally {
      setLoading(false);
    }
  };

  // --- Bailleur Stepper Handlers ---
  const startBailleurFlow = () => {
    setCurrentScreen('bailleur');
    setBStep(1);
    setError('');
    setFieldErrors({});
  };

  const handleBailleurStep1 = () => {
    setFieldErrors({});
    setError('');
    let valid = true;
    const errs = {};

    if (!bData.first_name) { errs.first_name = 'Prénom requis.'; valid = false; }
    if (!bData.last_name) { errs.last_name = 'Nom requis.'; valid = false; }
    if (!bData.email || !/\S+@\S+\.\S+/.test(bData.email)) { errs.email = 'Email invalide.'; valid = false; }
    if (!bData.phone) { errs.phone = 'Téléphone requis.'; valid = false; }
    if (!bData.password || bData.password.length < 8) { errs.password = 'Minimum 8 caractères.'; valid = false; }

    if (!valid) {
      setFieldErrors(errs);
      return;
    }
    setOtpTimer(60);
    setBStep(2);
  };

  const handleOtpInput = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleBailleurOtp = () => {
    const code = otpDigits.join('');
    if (code.length < 6) {
      setError('Saisissez les 6 chiffres du code OTP.');
      return;
    }
    setError('');
    setBStep(3);
  };

  const toggleBChip = (typeStr) => {
    const exists = bData.property_types.includes(typeStr);
    const updated = exists
      ? bData.property_types.filter(t => t !== typeStr)
      : [...bData.property_types, typeStr];
    setBData({ ...bData, property_types: updated });
  };

  const [compressingFields, setCompressingFields] = useState({});
  const [submitPhase, setSubmitPhase] = useState('');

  const handleKycFileChange = async (field, file) => {
    if (!file) return;
    setCompressingFields((prev) => ({ ...prev, [field]: true }));
    setError('');
    try {
      const optimized = await compressKycImage(file);
      setBData((prev) => ({ ...prev, [field]: optimized }));
    } catch (err) {
      console.warn('Erreur compression KYC, conservation fichier brut:', err);
      setBData((prev) => ({ ...prev, [field]: file }));
    } finally {
      setCompressingFields((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmitBail = async () => {
    setError('');
    if (!bAcceptCertif || !bAcceptTerms) {
      setError('Veuillez cocher les deux cases de certification et de conditions.');
      return;
    }

    setLoading(true);
    setSubmitPhase('Optimisation des photos…');
    try {
      // S'assurer que tous les fichiers sont bien compressés avant expédition
      const recto = bData.cni_recto ? await compressKycImage(bData.cni_recto) : null;
      const verso = bData.cni_verso ? await compressKycImage(bData.cni_verso) : null;
      const selfie = bData.selfie ? await compressKycImage(bData.selfie) : null;

      setSubmitPhase('Envoi sécurisé du dossier…');
      const fd = new FormData();
      fd.append('first_name', bData.first_name);
      fd.append('last_name', bData.last_name);
      fd.append('email', bData.email);
      fd.append('phone', bData.phone);
      fd.append('password', bData.password);
      fd.append('role', 'BAILLEUR');
      fd.append('document_type', bData.document_type);
      fd.append('document_number', bData.document_number);
      fd.append('city', bData.city);
      fd.append('neighborhoods', bData.neighborhoods);
      fd.append('property_count', bData.property_count);
      fd.append('property_types', bData.property_types.join(', '));
      fd.append('description', bData.description);
      if (recto) fd.append('cni_recto', recto);
      if (verso) fd.append('cni_verso', verso);
      if (selfie) fd.append('selfie', selfie);

      await authApi.register(fd);
      sessionStorage.setItem('piolo_is_new_registration', 'true');
      setCurrentScreen('success-bail');
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || "Erreur lors de la soumission du dossier.");
    } finally {
      setLoading(false);
      setSubmitPhase('');
    }
  };

  const socialLogin = async (provider) => {
    const normalized = provider.toLowerCase();
    if (!['google', 'facebook'].includes(normalized)) {
      setError(`Connexion via ${provider} indisponible.`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await authApi.socialStatus(normalized);
      if (!data.configured) {
        setError(`La connexion ${provider} n'est pas encore configurée.`);
        setLoading(false);
        return;
      }
    } catch (err) {
      // Ignorer l'erreur préliminaire si le endpoint n'est pas accessible et rediriger
    } finally {
      setLoading(false);
    }
    const backendOrigin = window.location.port === '3000' ? 'http://localhost:8080' : '';
    const isSignup = activeTab === 'register' ? '1' : '0';
    const roleParam = activeTab === 'register' && role ? `&role=${encodeURIComponent(role)}` : '';
    window.location.assign(`${backendOrigin}/social/${normalized}/login/?process=login&is_signup=${isSignup}${roleParam}`);
  };

  return (
    <div className="auth-page-root">
      <div className="auth-bg" />
      <div id="app">

        {/* ═══════════════════════════════════════════════
             SCREEN: CONNEXION / INSCRIPTION
        ══════════════════════════════════════════════════ */}
        {currentScreen === 'auth' && (
          <div className="screen active" id="s-auth">
            <div className="auth-card">
              
              {/* Logo Header */}
              <div className="logo-row">
                <LogoSvg />
                <span className="logo-txt">Piolo</span>
              </div>
              <p className="logo-tag">{t('auth.tagline')}</p>

              {/* Tabs */}
              <div className="tabs">
                <button className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`} onClick={() => switchTab('login')}>
                  {t('auth.sign_in')}
                </button>
                <button className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`} onClick={() => switchTab('register')}>
                  {t('auth.sign_up')}
                </button>
              </div>

              {/* Global Error Alert */}
              {error && (
                <div className="alert alert-err" style={{ display: 'flex' }}>
                  <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                  {error}
                </div>
              )}

              {/* ── PANEL CONNEXION ── */}
              {activeTab === 'login' && (
                <div id="panel-login">
                  <h1 className="card-title">{t('auth.sign_in_title')}</h1>
                  <p className="card-sub">{t('auth.sign_in_sub')}</p>

                  <div className="field">
                     <label className="field-label" htmlFor="l-email">{t('auth.email')}</label>
                    <div className="field-wrap">
                      <svg className="field-ico" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                      <input
                        className={`field-input ${fieldErrors.email ? 'err' : ''}`}
                        id="l-email"
                        type="email"
                        placeholder="votre@email.com"
                        value={lEmail}
                        onChange={(e) => setLEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                    {fieldErrors.email && <div className="field-err" style={{ display: 'block' }}>{fieldErrors.email}</div>}
                  </div>

                  <div className="field">
                    <a className="forgot-link" onClick={() => { setCurrentScreen('forgot'); setError(''); setForgotSent(false); }}>
                      {t('auth.forgot_password')}
                    </a>
                    <label className="field-label" htmlFor="l-pwd">{t('auth.password')}</label>
                    <div className="field-wrap">
                      <svg className="field-ico" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                      <input
                        className={`field-input ${fieldErrors.password ? 'err' : ''}`}
                        id="l-pwd"
                        type={showPwd ? 'text' : 'password'}
                        placeholder="••••••••"
                        style={{ paddingRight: 42 }}
                        value={lPwd}
                        onChange={(e) => setLPwd(e.target.value)}
                        autoComplete="current-password"
                      />
                      <button className="eye-btn" type="button" onClick={() => setShowPwd(!showPwd)}>
                        {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    {fieldErrors.password && <div className="field-err" style={{ display: 'block' }}>{fieldErrors.password}</div>}
                  </div>

                  <button className="btn-primary" id="btn-login" disabled={loading} onClick={handleLogin}>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M10 17l5-5-5-5v10z"/></svg>
                     {loading ? <div className="spinner" /> : t('auth.sign_in_btn')}
                  </button>

                  <div className="divider">
                    <div className="div-line" /><span className="div-txt">{t('auth.or_sign_in_with')}</span><div className="div-line" />
                  </div>

                  <div className="social-row">
                    <button className="btn-social btn-fb" type="button" onClick={() => socialLogin('Facebook')}>
                      <svg viewBox="0 0 24 24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      Facebook
                    </button>
                    <button className="btn-social btn-gg" type="button" onClick={() => socialLogin('Google')}>
                      <svg viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Google
                    </button>
                  </div>

                  <p className="switch-row">
                    {t('auth.no_account')} <a className="switch-link" onClick={() => switchTab('register')}>{t('auth.sign_up')}</a>
                  </p>
                </div>
              )}

              {/* ── PANEL INSCRIPTION ── */}
              {activeTab === 'register' && (
                <div id="panel-register">
                  <h1 className="card-title">{t('auth.sign_up_title')}</h1>
                  <p className="card-sub">{t('auth.sign_up_sub')}</p>

                  <p className="sec-lbl">{t('auth.iam')}</p>

                  {/* Sélecteur de rôle */}
                  <div className="role-grid">
                    <button className={`role-btn ${role === 'LOCATAIRE' ? 'active' : ''}`} onClick={() => selectRole('LOCATAIRE')}>
                      <div className="role-icon-box">
                        <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                      </div>
                      <div className="role-name">{t('auth.role_locataire_name')}</div>
                      <div className="role-desc">{t('auth.role_locataire_desc')}</div>
                      <div className="role-check">{role === 'LOCATAIRE' && <CheckSvg />}</div>
                    </button>

                    <button className={`role-btn ${role === 'BAILLEUR' ? 'active' : ''}`} onClick={() => selectRole('BAILLEUR')}>
                      <div className="role-icon-box">
                        <svg viewBox="0 0 24 24"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
                      </div>
                      <div className="role-name">{t('auth.role_bailleur_name')}</div>
                      <div className="role-desc">{t('auth.role_bailleur_desc')}</div>
                      <div className="role-check">{role === 'BAILLEUR' && <CheckSvg />}</div>
                    </button>

                    <button className={`role-btn ${role === 'ARCHITECTE' || role === 'PROFESSIONNEL' ? 'active' : ''}`} onClick={() => selectRole('ARCHITECTE')}>
                      <div className="role-icon-box">
                        <svg viewBox="0 0 24 24"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
                      </div>
                      <div className="role-name">{t('auth.role_pro_name')}</div>
                      <div className="role-desc">{t('auth.role_pro_desc')}</div>
                      <div className="role-check">{(role === 'ARCHITECTE' || role === 'PROFESSIONNEL') && <CheckSvg />}</div>
                    </button>
                  </div>

                  {/* Info Bailleur */}
                  {role === 'BAILLEUR' && (
                    <>
                      <div className="info-box bl">
                        <div className="ib-ico">
                          <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                        </div>
                         <p className="ib-txt"><strong>{t('auth.bailleur_notice').split(':')[0]}:</strong>{t('auth.bailleur_notice').split(':').slice(1).join(':')}</p>
                      </div>

                      <div id="form-bailleur-cta">
                        <button className="btn-primary" onClick={startBailleurFlow}>
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                          {t('auth.start_bailleur')}
                        </button>
                      </div>
                    </>
                  )}

                  {/* Formulaire standard (Locataire / Architecte) */}
                  {role !== 'BAILLEUR' && (
                    <div id="form-std">
                      <div className="field-row">
                        <div className="field">
                          <label className="field-label">{t('auth.first_name')}</label>
                          <div className="field-wrap">
                            <svg className="field-ico" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                            <input className="field-input" type="text" placeholder="Jean" value={rFname} onChange={(e) => setRFname(e.target.value)} />
                          </div>
                        </div>
                        <div className="field">
                          <label className="field-label">{t('auth.last_name')}</label>
                          <div className="field-wrap">
                            <svg className="field-ico" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                            <input className="field-input" type="text" placeholder="Kamdem" value={rLname} onChange={(e) => setRLname(e.target.value)} />
                          </div>
                        </div>
                      </div>

                      <div className="field">
                        <label className="field-label">{t('auth.email')}</label>
                        <div className="field-wrap">
                          <svg className="field-ico" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                          <input className={`field-input ${fieldErrors.email ? 'err' : ''}`} type="email" placeholder="jean@email.com" value={rEmail} onChange={(e) => setREmail(e.target.value)} />
                        </div>
                        {fieldErrors.email && <div className="field-err" style={{ display: 'block' }}>{fieldErrors.email}</div>}
                      </div>

                      <div className="field">
                        <label className="field-label">{t('auth.password')}</label>
                        <div className="field-wrap">
                          <svg className="field-ico" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                          <input className={`field-input ${fieldErrors.password ? 'err' : ''}`} type={showPwd ? 'text' : 'password'} placeholder="Min. 8 caractères" style={{ paddingRight: 42 }} value={rPwd} onChange={(e) => setRPwd(e.target.value)} />
                          <button className="eye-btn" type="button" onClick={() => setShowPwd(!showPwd)}>
                            {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                          </button>
                        </div>
                        {fieldErrors.password && <div className="field-err" style={{ display: 'block' }}>{fieldErrors.password}</div>}
                      </div>

                      <div className="field">
                        <label className="field-label">{t('auth.confirm_password')}</label>
                        <div className="field-wrap">
                          <svg className="field-ico" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                          <input className="field-input" type={showPwd ? 'text' : 'password'} placeholder="Répétez le mot de passe" value={rPwd2} onChange={(e) => setRPwd2(e.target.value)} />
                        </div>
                        {fieldErrors.password_confirm && <div className="field-err" style={{ display: 'block' }}>{fieldErrors.password_confirm}</div>}
                      </div>

                      <div className="check-row">
                        <div className={`check-box ${acceptTerms ? 'checked' : ''}`} onClick={() => setAcceptTerms(!acceptTerms)} />
                        <p className="check-txt">{t('auth.accept_terms')} <a href="#">{t('auth.terms_link')}</a> {t('auth.and')} <a href="#">{t('auth.privacy_link')}</a></p>
                      </div>

                      <button className="btn-primary" disabled={loading} onClick={handleRegisterStd}>
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                        {loading ? <div className="spinner" /> : t('auth.create_account_btn')}
                      </button>
                    </div>
                  )}

                  <div className="divider">
                    <div className="div-line" /><span className="div-txt">{t('auth.or_sign_up_with')}</span><div className="div-line" />
                  </div>

                  <div className="social-row">
                    <button className="btn-social btn-fb" type="button" onClick={() => socialLogin('Facebook')}>
                      <svg viewBox="0 0 24 24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      Facebook
                    </button>
                    <button className="btn-social btn-gg" type="button" onClick={() => socialLogin('Google')}>
                      <svg viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Google
                    </button>
                  </div>

                  <p className="switch-row">
                    {t('auth.already_account')} <a className="switch-link" onClick={() => switchTab('login')}>{t('auth.sign_in')}</a>
                  </p>
                </div>
              )}

              <div className="card-footer">
                © 2025 Piolo
                <a href="#">{t('auth.footer_privacy')}</a>
                <a href="#">{t('auth.footer_terms')}</a>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
             SCREEN: BAILLEUR ONBOARDING (5 étapes)
        ══════════════════════════════════════════════════ */}
        {currentScreen === 'bailleur' && (
          <div className="screen active" id="s-bailleur">
            <div className="auth-card" style={{ maxWidth: 460, margin: '0 auto' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div className="logo-row" style={{ marginBottom: 0 }}>
                  <LogoSvg size={24} />
                  <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 16, fontWeight: 800, color: 'var(--noir)' }}>Piolo</span>
                </div>
                <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: 11, fontWeight: 700, color: 'var(--or-d)', background: 'rgba(212,175,55,.1)', padding: '4px 10px', borderRadius: 20 }}>
                  {t('auth.bailleur_register')}
                </span>
              </div>

              {/* Stepper Header */}
              <div className="stepper" id="bail-stepper">
                {[
                  { n: 1, label: t('auth.step_identity') },
                  { n: 2, label: t('auth.step_sms') },
                  { n: 3, label: t('auth.step_docs') },
                  { n: 4, label: t('auth.step_assets') },
                  { n: 5, label: t('auth.step_submit') },
                ].map((s, idx) => (
                  <React.Fragment key={s.n}>
                    {idx > 0 && <div className={`step-line ${s.n <= bStep ? 'done' : ''}`} />}
                    <div className="step-item">
                      <div className={`step-circle ${s.n < bStep ? 'done' : s.n === bStep ? 'active' : ''}`}>
                        {s.n < bStep ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                        ) : (
                          s.n
                        )}
                      </div>
                      <span className={`step-lbl ${s.n === bStep ? 'active' : ''}`}>{s.label}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              <div className="step-prog-bar">
                <div className="step-prog-fill" style={{ width: `${(bStep / 5) * 100}%` }} />
              </div>

              {/* Global Error Alert */}
              {error && (
                <div className="alert alert-err" style={{ display: 'flex' }}>
                  <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                  {error}
                </div>
              )}

              {/* ÉTAPE 1 : IDENTITÉ */}
              {bStep === 1 && (
                <div>
                  <h2 className="card-title">{t('auth.step1_title')}</h2>
                  <p className="card-sub">{t('auth.step1_sub')}</p>
                  
                  <div className="info-box bl">
                    <div className="ib-ico">
                      <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                    </div>
                     <p className="ib-txt">{t('auth.pending_notice')}</p>
                  </div>

                  <div className="field-row">
                    <div className="field">
                      <label className="field-label">{t('auth.first_name')}</label>
                      <div className="field-wrap">
                        <svg className="field-ico" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                        <input className={`field-input ${fieldErrors.first_name ? 'err' : ''}`} type="text" placeholder="Marie-Claire" value={bData.first_name} onChange={(e) => setBData({ ...bData, first_name: e.target.value })} />
                      </div>
                      {fieldErrors.first_name && <div className="field-err" style={{ display: 'block' }}>{fieldErrors.first_name}</div>}
                    </div>
                    <div className="field">
                      <label className="field-label">{t('auth.last_name')}</label>
                      <div className="field-wrap">
                        <svg className="field-ico" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                        <input className={`field-input ${fieldErrors.last_name ? 'err' : ''}`} type="text" placeholder="Nkemdirim" value={bData.last_name} onChange={(e) => setBData({ ...bData, last_name: e.target.value })} />
                      </div>
                      {fieldErrors.last_name && <div className="field-err" style={{ display: 'block' }}>{fieldErrors.last_name}</div>}
                    </div>
                  </div>

                  <div className="field">
                    <label className="field-label">{t('auth.email')}</label>
                    <div className="field-wrap">
                      <svg className="field-ico" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                      <input className={`field-input ${fieldErrors.email ? 'err' : ''}`} type="email" placeholder="marie@email.com" value={bData.email} onChange={(e) => setBData({ ...bData, email: e.target.value })} />
                    </div>
                    {fieldErrors.email && <div className="field-err" style={{ display: 'block' }}>{fieldErrors.email}</div>}
                  </div>

                  <div className="field">
                    <label className="field-label">{t('auth.phone')} <span style={{ color: 'var(--gris-m)', fontWeight: 400 }}>{t('auth.phone_otp_hint')}</span></label>
                    <div className="field-wrap">
                      <svg className="field-ico" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                      <input className={`field-input ${fieldErrors.phone ? 'err' : ''}`} type="tel" placeholder="+237 6XX XXX XXX" value={bData.phone} onChange={(e) => setBData({ ...bData, phone: e.target.value })} />
                    </div>
                    {fieldErrors.phone && <div className="field-err" style={{ display: 'block' }}>{fieldErrors.phone}</div>}
                  </div>

                  <div className="field">
                    <label className="field-label">{t('auth.password')}</label>
                    <div className="field-wrap">
                      <svg className="field-ico" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                      <input className={`field-input ${fieldErrors.password ? 'err' : ''}`} type={showPwd ? 'text' : 'password'} placeholder="Min. 8 caractères" style={{ paddingRight: 42 }} value={bData.password} onChange={(e) => setBData({ ...bData, password: e.target.value })} />
                      <button className="eye-btn" type="button" onClick={() => setShowPwd(!showPwd)}>
                        {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    {fieldErrors.password && <div className="field-err" style={{ display: 'block' }}>{fieldErrors.password}</div>}
                  </div>

                  <div className="btn-nav-row">
                    <button className="btn-back" type="button" onClick={() => setCurrentScreen('auth')}>{t('auth.cancel_btn')}</button>
                    <button className="btn-next" type="button" onClick={handleBailleurStep1}>
                      {t('auth.next_btn')} <svg viewBox="0 0 24 24"><path d="M10 17l5-5-5-5v10z"/></svg>
                    </button>
                  </div>
                </div>
              )}

              {/* ÉTAPE 2 : VÉRIFICATION SMS OTP */}
              {bStep === 2 && (
                <div>
                  <h2 className="card-title">{t('auth.step2_title')}</h2>
                  <p className="card-sub">{t('auth.step2_sub')}</p>

                  <div className="otp-inputs">
                    {otpDigits.map((digit, i) => (
                      <input
                        key={i}
                        ref={otpRefs[i]}
                        className={`otp-digit ${digit ? 'filled' : ''}`}
                        maxLength={1}
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) => handleOtpInput(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      />
                    ))}
                  </div>

                  <p className="otp-note" style={{ marginBottom: 18 }}>
                    {t('auth.otp_not_received')} <span className="otp-resend" onClick={() => setOtpTimer(60)}>{t('auth.otp_resend')} <span className="otp-timer-val">{otpTimer}s</span></span>
                  </p>

                  <div className="info-box gn">
                    <div className="ib-ico">
                      <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                    </div>
                     <p className="ib-txt">{t('auth.otp_security')}</p>
                  </div>

                  <div className="btn-nav-row">
                    <button className="btn-back" type="button" onClick={() => setBStep(1)}>{t('common.back')}</button>
                    <button className="btn-next" type="button" onClick={handleBailleurOtp}>
                      {t('auth.validate_btn')} <svg viewBox="0 0 24 24"><path d="M10 17l5-5-5-5v10z"/></svg>
                    </button>
                  </div>
                </div>
              )}

              {/* ÉTAPE 3 : PIÈCE D'IDENTITÉ */}
              {bStep === 3 && (
                <div>
                  <h2 className="card-title">{t('auth.step3_title')}</h2>
                  <p className="card-sub">{t('auth.step3_sub')}</p>

                  <div className="field">
                    <label className="field-label">{t('auth.doc_type')}</label>
                    <select className="field-select" value={bData.document_type} onChange={(e) => setBData({ ...bData, document_type: e.target.value })}>
                      <option value="CNI">{t('auth.doc_cni')}</option>
                      <option value="PASSEPORT">{t('auth.doc_passport')}</option>
                      <option value="SEJOUR">{t('auth.doc_permit')}</option>
                    </select>
                  </div>

                  <div className="field">
                    <label className="field-label">{t('auth.doc_number')}</label>
                    <div className="field-wrap">
                      <svg className="field-ico" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 3h2v2h-2V7zm0 4h2v2h-2v-2zM5 7h8v2H5V7zm0 4h8v2H5v-2zm0 4h14v2H5v-2z"/></svg>
                      <input className="field-input" type="text" placeholder="CM-12345678-A" value={bData.document_number} onChange={(e) => setBData({ ...bData, document_number: e.target.value })} />
                    </div>
                  </div>

                  <p className="sec-lbl">{t('auth.scan_label')}</p>
                  <div className="upload-grid">
                    <div className={`upload-box ${bData.cni_recto ? 'uploaded' : ''}`} onClick={() => document.getElementById('f-recto').click()}>
                      <input type="file" id="f-recto" accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }} onChange={(e) => handleKycFileChange('cni_recto', e.target.files[0])} />
                      <div className="ub-ico">
                        <svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>
                      </div>
                      <div className="ub-title">{t('auth.recto')}</div>
                      <div className="ub-sub">{t('auth.recto_sub')}</div>
                      <div className="ub-badge">
                        {compressingFields['cni_recto'] ? '⚡ Optimisation…' : bData.cni_recto ? `✓ ${formatFileSize(bData.cni_recto.size)}` : t('auth.upload')}
                      </div>
                    </div>

                    <div className={`upload-box ${bData.cni_verso ? 'uploaded' : ''}`} onClick={() => document.getElementById('f-verso').click()}>
                      <input type="file" id="f-verso" accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }} onChange={(e) => handleKycFileChange('cni_verso', e.target.files[0])} />
                      <div className="ub-ico">
                        <svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>
                      </div>
                      <div className="ub-title">{t('auth.verso')}</div>
                      <div className="ub-sub">{t('auth.verso_sub')}</div>
                      <div className="ub-badge">
                        {compressingFields['cni_verso'] ? '⚡ Optimisation…' : bData.cni_verso ? `✓ ${formatFileSize(bData.cni_verso.size)}` : t('auth.upload')}
                      </div>
                    </div>
                  </div>

                  <p className="sec-lbl">{t('auth.selfie_label')}</p>
                  <div className={`upload-box solo ${bData.selfie ? 'uploaded' : ''}`} onClick={() => document.getElementById('f-selfie').click()}>
                    <input type="file" id="f-selfie" accept=".jpg,.jpeg,.png" style={{ display: 'none' }} onChange={(e) => handleKycFileChange('selfie', e.target.files[0])} />
                    <div className="ub-ico">
                      <svg viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                    </div>
                    <div className="ub-title">{t('auth.selfie_title')}</div>
                    <div className="ub-sub">{t('auth.selfie_sub')}</div>
                    <div className="ub-badge">
                      {compressingFields['selfie'] ? '⚡ Optimisation…' : bData.selfie ? `✓ ${formatFileSize(bData.selfie.size)}` : t('auth.take_photo')}
                    </div>
                  </div>

                  <div className="btn-nav-row">
                    <button className="btn-back" type="button" onClick={() => setBStep(2)}>{t('common.back')}</button>
                    <button className="btn-next" type="button" onClick={() => setBStep(4)}>
                      {t('auth.next_btn')} <svg viewBox="0 0 24 24"><path d="M10 17l5-5-5-5v10z"/></svg>
                    </button>
                  </div>
                </div>
              )}

              {/* ÉTAPE 4 : PATRIMOINE */}
              {bStep === 4 && (
                <div>
                  <h2 className="card-title">{t('auth.step4_title')}</h2>
                  <p className="card-sub">{t('auth.step4_sub')}</p>

                  <div className="field">
                    <label className="field-label">{t('auth.main_city')}</label>
                    <select className="field-select" value={bData.city} onChange={(e) => setBData({ ...bData, city: e.target.value })}>
                      <option>Douala</option>
                      <option>Yaoundé</option>
                      <option>Bafoussam</option>
                      <option>Garoua</option>
                      <option>Maroua</option>
                      <option>Kribi</option>
                      <option>Autre</option>
                    </select>
                  </div>

                  <div className="field">
                    <label className="field-label">{t('auth.neighborhoods')}</label>
                    <div className="field-wrap">
                      <svg className="field-ico" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                      <input className="field-input" type="text" placeholder="Bastos, Bonapriso…" value={bData.neighborhoods} onChange={(e) => setBData({ ...bData, neighborhoods: e.target.value })} />
                    </div>
                  </div>

                  <div className="field">
                    <label className="field-label">{t('auth.property_count')}</label>
                    <div className="counter-row">
                      <span className="counter-lbl">{t('auth.property_assets_label')}</span>
                      <div className="counter-ctrl">
                        <button className="counter-btn" type="button" onClick={() => setBData({ ...bData, property_count: Math.max(1, bData.property_count - 1) })}>−</button>
                        <span className="counter-val">{bData.property_count}</span>
                        <button className="counter-btn" type="button" onClick={() => setBData({ ...bData, property_count: bData.property_count + 1 })}>+</button>
                      </div>
                    </div>
                  </div>

                  <div className="field">
                    <label className="field-label">{t('auth.property_types')}</label>
                    <div className="chips">
                      {['Appartements', 'Villas', 'Studios', 'Terrains', 'Bureaux', 'Boutiques'].map((chip) => (
                        <span key={chip} className={`chip ${bData.property_types.includes(chip) ? 'active' : ''}`} onClick={() => toggleBChip(chip)}>
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <label className="field-label">{t('auth.description')}</label>
                    <textarea className="field-textarea" rows="3" placeholder="Ex : 3 appartements à Bastos loués 80 000–120 000 FCFA/mois…" value={bData.description} onChange={(e) => setBData({ ...bData, description: e.target.value })} />
                  </div>

                  <div className="btn-nav-row">
                    <button className="btn-back" type="button" onClick={() => setBStep(3)}>{t('common.back')}</button>
                    <button className="btn-next" type="button" onClick={() => setBStep(5)}>
                      {t('auth.summary_btn')} <svg viewBox="0 0 24 24"><path d="M10 17l5-5-5-5v10z"/></svg>
                    </button>
                  </div>
                </div>
              )}

              {/* ÉTAPE 5 : RÉCAPITULATIF & ENVOI */}
              {bStep === 5 && (
                <div>
                  <h2 className="card-title">{t('auth.step5_title')}</h2>
                  <p className="card-sub">{t('auth.step5_sub')}</p>

                  <div className="recap-wrap">
                    <div className="recap-sec-title">{t('auth.recap_identity')}</div>
                    <div className="recap-row"><span className="recap-key">{t('auth.recap_full_name')}</span><span className="recap-val">{bData.first_name} {bData.last_name}</span></div>
                    <div className="recap-row"><span className="recap-key">{t('auth.recap_email')}</span><span className="recap-val">{bData.email}</span></div>
                    <div className="recap-row"><span className="recap-key">{t('auth.recap_phone')}</span><span className="recap-val ok">{t('auth.recap_verified')}</span></div>
                  </div>

                  <div className="recap-wrap">
                    <div className="recap-sec-title">{t('auth.recap_docs')}</div>
                    <div className="recap-row"><span className="recap-key">{t('auth.recap_type')}</span><span className="recap-val">{bData.document_type}</span></div>
                    <div className="recap-row"><span className="recap-key">{t('auth.recap_number')}</span><span className="recap-val">{bData.document_number || '—'}</span></div>
                    <div className="recap-row"><span className="recap-key">{t('auth.recap_cni_front')}</span><span className={`recap-val ${bData.cni_recto ? 'ok' : ''}`}>{bData.cni_recto ? bData.cni_recto.name : t('auth.recap_missing')}</span></div>
                    <div className="recap-row"><span className="recap-key">{t('auth.recap_cni_back')}</span><span className={`recap-val ${bData.cni_verso ? 'ok' : ''}`}>{bData.cni_verso ? bData.cni_verso.name : t('auth.recap_missing')}</span></div>
                    <div className="recap-row"><span className="recap-key">{t('auth.recap_selfie')}</span><span className={`recap-val ${bData.selfie ? 'ok' : ''}`}>{bData.selfie ? bData.selfie.name : t('auth.recap_missing')}</span></div>
                  </div>

                  <div className="recap-wrap">
                    <div className="recap-sec-title">{t('auth.recap_assets')}</div>
                    <div className="recap-row"><span className="recap-key">{t('auth.recap_city')}</span><span className="recap-val">{bData.city}</span></div>
                    <div className="recap-row"><span className="recap-key">{t('auth.recap_neighborhoods')}</span><span className="recap-val">{bData.neighborhoods || '—'}</span></div>
                    <div className="recap-row"><span className="recap-key">{t('auth.recap_properties')}</span><span className="recap-val">{bData.property_count}</span></div>
                  </div>

                  <div className="recap-wrap">
                    <div className="recap-sec-title">{t('auth.recap_status')}</div>
                    <div className="recap-row"><span className="recap-key">{t('auth.recap_account')}</span><span className="recap-val pend">{t('common.pending')}</span></div>
                    <div className="recap-row"><span className="recap-key">{t('auth.recap_delay')}</span><span className="recap-val">{t('auth.recap_delay_val')}</span></div>
                  </div>

                  <div className="info-box rd">
                    <div className="ib-ico">
                      <svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
                    </div>
                     <p className="ib-txt">{t('auth.rejection_warning')}</p>
                  </div>

                  <div className="check-row">
                    <div className={`check-box ${bAcceptCertif ? 'checked' : ''}`} onClick={() => setBAcceptCertif(!bAcceptCertif)} />
                     <p className="check-txt">{t('auth.certify_info')}</p>
                  </div>

                  <div className="check-row">
                    <div className={`check-box ${bAcceptTerms ? 'checked' : ''}`} onClick={() => setBAcceptTerms(!bAcceptTerms)} />
                     <p className="check-txt">{t('auth.accept_terms')} <a href="#">{t('auth.terms_link')}</a> {t('auth.and')} <a href="#">{t('auth.privacy_link')}</a>.</p>
                  </div>

                  <button className="btn-primary" disabled={loading} onClick={handleSubmitBail} style={{ marginTop: 6 }}>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                    {loading ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <div className="spinner" />
                        <span>{submitPhase || t('common.loading')}</span>
                      </span>
                    ) : t('auth.submit_btn')}
                  </button>

                  <div className="btn-nav-row" style={{ marginTop: 10 }}>
                    <button className="btn-back" style={{ flex: 1 }} type="button" onClick={() => setBStep(4)}>{t('auth.edit_btn')}</button>
                  </div>
                </div>
              )}

              <div className="card-footer">
                © 2025 Piolo
                <a href="#">{t('auth.footer_privacy')}</a>
                <a href="#">{t('auth.footer_terms')}</a>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
             SCREEN: MOT DE PASSE OUBLIÉ
        ══════════════════════════════════════════════════ */}
        {currentScreen === 'forgot' && (
          <div className="screen active" id="s-forgot">
            <div className="auth-card" style={{ maxWidth: 400, margin: '0 auto' }}>
              <div className="logo-row">
                <LogoSvg size={26} />
                <span className="logo-txt">Piolo</span>
              </div>
              <h1 className="card-title" style={{ marginTop: 18 }}>{t('auth.forgot_title')}</h1>
              <p className="card-sub">{t('auth.forgot_sub')}</p>

              {forgotSent && (
                <div className="alert alert-ok" style={{ display: 'flex' }}>
                  <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                  <small style={{ display: 'block', marginTop: 4 }}>{t('auth.forgot_check_spam')}</small>
                  {t('auth.forgot_sent')}
                </div>
              )}

              {error && (
                <div className="alert alert-err" style={{ display: 'flex' }}>
                  <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                  {error}
                </div>
              )}

              <div className="field">
                <label className="field-label">{t('auth.email')}</label>
                <div className="field-wrap">
                  <svg className="field-ico" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                  <input className="field-input" type="email" placeholder="votre@email.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
                </div>
              </div>

              <button className="btn-primary" disabled={loading} onClick={handleForgot}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                {loading ? <div className="spinner" /> : t('auth.send_link')}
              </button>

              <button className="btn-outline" type="button" onClick={() => setCurrentScreen('auth')}>
                {t('auth.back_to_login')}
              </button>

              <div className="card-footer">
                © 2025 Piolo <a href="#">{t('auth.footer_privacy')}</a>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
             SCREEN: SUCCÈS LOCATAIRE / ARCHITECTE
        ══════════════════════════════════════════════════ */}
        {currentScreen === 'success-loc' && (
          <div className="screen active" id="s-success-loc">
            <div className="success-wrap">
              <div className="success-circle">
                <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
              </div>
              <h2 className="success-title">{t('auth.success_loc_title')}</h2>
              <p className="success-sub">{t('auth.success_loc_sub')}</p>
              
              <div className="success-badge">
                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                {t('auth.success_loc_points')}
              </div>

              <button className="btn-primary" onClick={() => navigate(from, { replace: true })} style={{ maxWidth: 360, margin: '0 auto' }}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                {t('auth.go_to_dashboard')}
              </button>

              <div className="card-footer" style={{ borderTop: 'none' }}>
                © 2025 Piolo <a href="#">{t('auth.footer_privacy')}</a>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
             SCREEN: SUCCÈS BAILLEUR (EN ATTENTE)
        ══════════════════════════════════════════════════ */}
        {currentScreen === 'success-bail' && (
          <div className="screen active" id="s-success-bail">
            <div className="success-wrap">
              <div className="success-circle" style={{ background: 'linear-gradient(135deg,#3B6D11,#639922)' }}>
                <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
              </div>
              <h2 className="success-title">{t('auth.success_bail_title')}</h2>
              <p className="success-sub">{t('auth.success_bail_sub')}</p>
              
              <div className="success-badge pending-badge">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                {t('auth.pending_status')}
              </div>

              <div className="success-card">
                <div className="sc-row">
                  <div className="sc-ico gn"><svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"/></svg></div>
                  <div className="sc-body"><strong>{t('auth.verifying_in_progress')}</strong><p>{t('auth.verifying_detail')}</p></div>
                </div>
                <div className="sc-row">
                  <div className="sc-ico or"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg></div>
                  <div className="sc-body"><strong>{t('auth.if_approved')}</strong><p>{t('auth.if_approved_detail')}</p></div>
                </div>
                <div className="sc-row">
                  <div className="sc-ico rd"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></div>
                  <div className="sc-body"><strong>{t('auth.if_rejected')}</strong><p>{t('auth.if_rejected_detail')}</p></div>
                </div>
                <div className="sc-row">
                  <div className="sc-ico bl"><svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg></div>
                  <div className="sc-body"><strong>{t('auth.notification')}</strong><p>{t('auth.notification_detail')}</p></div>
                </div>
              </div>

              <button className="btn-primary" onClick={() => navigate(from, { replace: true })} style={{ maxWidth: 360, margin: '0 auto 10px' }}>
                {t('auth.go_to_space')}
              </button>

              <div className="card-footer" style={{ borderTop: 'none' }}>
                © 2025 Piolo <a href="#">{t('auth.footer_privacy')}</a>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
             SCREEN: CHOIX DU RÔLE (OAuth Social Signup)
        ══════════════════════════════════════════════════ */}
        {currentScreen === 'choose-role' && (
          <div className="screen active" id="s-choose-role">
            <div className="auth-card" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'left' }}>
              <div className="logo-row" style={{ justifyContent: 'center', marginBottom: 12 }}>
                <LogoSvg size={38} />
                <span className="logo-txt" style={{ fontSize: '1.45rem' }}>Piolo</span>
              </div>
              
              <h2 className="card-title" style={{ textAlign: 'center', fontSize: '1.4rem', marginBottom: 6, color: '#0F172A' }}>
                {t('auth.choose_role_title')}
              </h2>
              <p className="card-sub" style={{ textAlign: 'center', marginBottom: 24, fontSize: '0.92rem', color: '#64748B' }}>
                {t('auth.choose_role_sub')}
              </p>

              {error && (
                <div className="alert alert-err" style={{ display: 'flex', marginBottom: 16 }}>
                  <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {/* Option 1: LOCATAIRE */}
                <div
                  onClick={() => setSelectedSocialRole('LOCATAIRE')}
                  style={{
                    padding: '16px 18px',
                    borderRadius: 14,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    background: selectedSocialRole === 'LOCATAIRE' ? '#FFFBEB' : '#F8FAFC',
                    border: selectedSocialRole === 'LOCATAIRE' ? '2px solid #D4AF37' : '1.5px solid #E2E8F0',
                    boxShadow: selectedSocialRole === 'LOCATAIRE' ? '0 4px 18px rgba(212, 175, 55, 0.18)' : 'none',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                  }}
                >
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: selectedSocialRole === 'LOCATAIRE' ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)' : '#E2E8F0',
                    color: selectedSocialRole === 'LOCATAIRE' ? '#FFFFFF' : '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                      <strong style={{ fontSize: '1.02rem', color: '#0F172A', fontWeight: 700 }}>{t('auth.role_tenant_title')}</strong>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '3px 9px',
                        borderRadius: 6,
                        background: selectedSocialRole === 'LOCATAIRE' ? 'rgba(212,175,55,0.2)' : '#E2E8F0',
                        color: selectedSocialRole === 'LOCATAIRE' ? '#855E0B' : '#64748B',
                        fontWeight: 700,
                      }}>{t('auth.role_tenant_tag')}</span>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#475569', margin: 0, lineHeight: 1.45 }}>
                      {t('auth.role_tenant_desc')}
                    </p>
                  </div>
                  <div style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: selectedSocialRole === 'LOCATAIRE' ? '2px solid #D4AF37' : '2px solid #CBD5E1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: selectedSocialRole === 'LOCATAIRE' ? '#D4AF37' : 'transparent',
                    marginTop: 2,
                    flexShrink: 0,
                  }}>
                    {selectedSocialRole === 'LOCATAIRE' && <CheckSvg />}
                  </div>
                </div>

                {/* Option 2: BAILLEUR */}
                <div
                  onClick={() => setSelectedSocialRole('BAILLEUR')}
                  style={{
                    padding: '16px 18px',
                    borderRadius: 14,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    background: selectedSocialRole === 'BAILLEUR' ? '#FFFBEB' : '#F8FAFC',
                    border: selectedSocialRole === 'BAILLEUR' ? '2px solid #D4AF37' : '1.5px solid #E2E8F0',
                    boxShadow: selectedSocialRole === 'BAILLEUR' ? '0 4px 18px rgba(212, 175, 55, 0.18)' : 'none',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                  }}
                >
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: selectedSocialRole === 'BAILLEUR' ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)' : '#E2E8F0',
                    color: selectedSocialRole === 'BAILLEUR' ? '#FFFFFF' : '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                      <strong style={{ fontSize: '1.02rem', color: '#0F172A', fontWeight: 700 }}>{t('auth.role_landlord_title')}</strong>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '3px 9px',
                        borderRadius: 6,
                        background: selectedSocialRole === 'BAILLEUR' ? 'rgba(212,175,55,0.2)' : '#E2E8F0',
                        color: selectedSocialRole === 'BAILLEUR' ? '#855E0B' : '#64748B',
                        fontWeight: 700,
                      }}>{t('auth.role_landlord_tag')}</span>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#475569', margin: 0, lineHeight: 1.45 }}>
                      {t('auth.role_landlord_desc')}
                    </p>
                  </div>
                  <div style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: selectedSocialRole === 'BAILLEUR' ? '2px solid #D4AF37' : '2px solid #CBD5E1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: selectedSocialRole === 'BAILLEUR' ? '#D4AF37' : 'transparent',
                    marginTop: 2,
                    flexShrink: 0,
                  }}>
                    {selectedSocialRole === 'BAILLEUR' && <CheckSvg />}
                  </div>
                </div>

                {/* Option 3: ARCHITECTE / PROFESSIONNEL */}
                <div
                  onClick={() => setSelectedSocialRole('ARCHITECTE')}
                  style={{
                    padding: '16px 18px',
                    borderRadius: 14,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    background: selectedSocialRole === 'ARCHITECTE' ? '#FFFBEB' : '#F8FAFC',
                    border: selectedSocialRole === 'ARCHITECTE' ? '2px solid #D4AF37' : '1.5px solid #E2E8F0',
                    boxShadow: selectedSocialRole === 'ARCHITECTE' ? '0 4px 18px rgba(212, 175, 55, 0.18)' : 'none',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                  }}
                >
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: selectedSocialRole === 'ARCHITECTE' ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)' : '#E2E8F0',
                    color: selectedSocialRole === 'ARCHITECTE' ? '#FFFFFF' : '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                      <strong style={{ fontSize: '1.02rem', color: '#0F172A', fontWeight: 700 }}>{t('auth.role_pro_title')}</strong>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '3px 9px',
                        borderRadius: 6,
                        background: selectedSocialRole === 'ARCHITECTE' ? 'rgba(212,175,55,0.2)' : '#E2E8F0',
                        color: selectedSocialRole === 'ARCHITECTE' ? '#855E0B' : '#64748B',
                        fontWeight: 700,
                      }}>{t('auth.role_pro_tag')}</span>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#475569', margin: 0, lineHeight: 1.45 }}>
                      {t('auth.role_pro_desc2')}
                    </p>
                  </div>
                  <div style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: selectedSocialRole === 'ARCHITECTE' ? '2px solid #D4AF37' : '2px solid #CBD5E1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: selectedSocialRole === 'ARCHITECTE' ? '#D4AF37' : 'transparent',
                    marginTop: 2,
                    flexShrink: 0,
                  }}>
                    {selectedSocialRole === 'ARCHITECTE' && <CheckSvg />}
                  </div>
                </div>

              </div>

              <button
                className="btn-primary"
                disabled={socialRoleSubmitting}
                onClick={() => handleConfirmRole(selectedSocialRole)}
                style={{ width: '100%', padding: '15px 22px', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}
              >
                {socialRoleSubmitting ? (
                  <>
                    <div className="spinner" />
                    {t('auth.saving_role')}
                  </>
                ) : (
                  <>
                    {t('auth.continue_to_space')}
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
