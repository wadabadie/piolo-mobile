// src/pages/auth/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../services/api';

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
  </svg>
);

const LogoSvg = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 34 34" fill="none">
    <rect width="34" height="34" rx="9" fill="rgba(212,175,55,.14)"/>
    <path d="M17 5L4 15v16h10v-9h6v9h10V15L17 5z" fill="#D4AF37"/>
  </svg>
);

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [verifying, setVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [tokenError, setTokenError] = useState('');

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  // 1. Vérification automatique de la validité du token
  useEffect(() => {
    if (!uid || !token) {
      setVerifying(false);
      setIsValidToken(false);
      setTokenError('Le lien de réinitialisation est incomplet.');
      return;
    }

    authApi.verifyResetToken(uid, token)
      .then(({ data }) => {
        if (data.valid) {
          setIsValidToken(true);
          setUserEmail(data.email || '');
        } else {
          setIsValidToken(false);
          setTokenError(data.detail || 'Ce lien de réinitialisation est invalide ou a expiré.');
        }
      })
      .catch((err) => {
        setIsValidToken(false);
        setTokenError(err.response?.data?.detail || 'Ce lien de réinitialisation est invalide ou a expiré.');
      })
      .finally(() => {
        setVerifying(false);
      });
  }, [uid, token]);

  // 2. Soumission du nouveau mot de passe
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 8) {
      setErrorMsg('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMsg('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.confirmResetPassword({
        uid,
        token,
        password,
        password_confirm: passwordConfirm,
      });

      if (data.ok) {
        setSuccess(true);
      } else {
        setErrorMsg(data.detail || 'Une erreur est survenue lors de la réinitialisation.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || err.response?.data?.error || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Calcul de force du mot de passe
  const getPasswordStrength = () => {
    if (!password) return { label: '', color: '', score: 0 };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { label: t('reset_pwd.strength_weak'), color: '#EF4444', score: 1 };
    if (score === 2) return { label: t('reset_pwd.strength_medium'), color: '#F59E0B', score: 2 };
    return { label: t('reset_pwd.strength_strong'), color: '#10B981', score: 3 };
  };

  const strength = getPasswordStrength();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0F0D09',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: '#1A1713',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        borderRadius: '20px',
        padding: '36px 28px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
        position: 'relative',
      }}>
        
        {/* Logo Piolo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
          <LogoSvg size={30} />
          <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '20px', fontWeight: 800, color: '#D4AF37' }}>
            Piolo
          </span>
        </div>

        {/* État : Vérification en cours */}
        {verifying && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: '36px',
              height: '36px',
              border: '3px solid rgba(212, 175, 55, 0.2)',
              borderTopColor: '#D4AF37',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: '#D6D1C7', fontSize: '14px', margin: 0 }}>{t('reset_pwd.verifying')}</p>
          </div>
        )}

        {/* État : Succès de la réinitialisation */}
        {success && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid #10B981',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
              {t('reset_pwd.success_title')}
            </h2>
            <p style={{ color: '#D6D1C7', fontSize: '14px', lineHeight: 1.5, marginBottom: '24px' }}>
              {t('reset_pwd.success_sub')}
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                padding: '13px',
                background: 'linear-gradient(135deg, #D4AF37, #F6D365)',
                color: '#0E0C0A',
                fontWeight: 800,
                fontSize: '15px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(212, 175, 55, 0.35)',
              }}
            >
              {t('reset_pwd.sign_in_now')}
            </button>
          </div>
        )}

        {/* État : Token Invalide ou Expiré */}
        {!verifying && !isValidToken && !success && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '2px solid #EF4444',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
              {t('reset_pwd.invalid_title')}
            </h2>
            <p style={{ color: '#D6D1C7', fontSize: '14px', lineHeight: 1.5, marginBottom: '24px' }}>
              {tokenError || t('reset_pwd.invalid_sub')}
            </p>
            <button
              type="button"
              onClick={() => navigate('/login?tab=forgot')}
              style={{
                width: '100%',
                padding: '13px',
                background: 'linear-gradient(135deg, #D4AF37, #F6D365)',
                color: '#0E0C0A',
                fontWeight: 800,
                fontSize: '14.5px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(212, 175, 55, 0.35)',
                marginBottom: '16px',
              }}
            >
              {t('reset_pwd.new_request')}
            </button>
          </div>
        )}

        {/* État : Formulaire de nouveau mot de passe */}
        {!verifying && isValidToken && !success && (
          <>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', textAlign: 'center', marginBottom: '6px' }}>
              {t('reset_pwd.new_pwd_title')}
            </h1>
            {userEmail && (
              <p style={{ textAlign: 'center', fontSize: '13.5px', color: '#D4AF37', marginBottom: '20px' }}>
                {t('reset_pwd.account_label')} <strong>{userEmail}</strong>
              </p>
            )}

            {errorMsg && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#FCA5A5',
                fontSize: '13.5px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span>⚠️</span> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Champ Nouveau mot de passe */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#D6D1C7', marginBottom: '6px' }}>
                  {t('reset_pwd.new_pwd_label')}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('reset_pwd.new_pwd_placeholder')}
                    required
                    autoFocus
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      borderRadius: '12px',
                      padding: '13px 44px 13px 14px',
                      color: '#FFFFFF',
                      fontSize: '14.5px',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#8B857D',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px',
                    }}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>

                {/* Barre de force du mot de passe */}
                {password && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '4px' }}>
                      <div style={{ flex: 1, borderRadius: '2px', background: strength.score >= 1 ? strength.color : 'rgba(255,255,255,0.1)' }} />
                      <div style={{ flex: 1, borderRadius: '2px', background: strength.score >= 2 ? strength.color : 'rgba(255,255,255,0.1)' }} />
                      <div style={{ flex: 1, borderRadius: '2px', background: strength.score >= 3 ? strength.color : 'rgba(255,255,255,0.1)' }} />
                    </div>
                    <div style={{ fontSize: '11.5px', color: strength.color, textAlign: 'right', fontWeight: 600 }}>
                      {t('reset_pwd.strength_label')} {strength.label}
                    </div>
                  </div>
                )}
              </div>

              {/* Champ Confirmation mot de passe */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#D6D1C7', marginBottom: '6px' }}>
                  {t('reset_pwd.confirm_label')}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder={t('reset_pwd.confirm_placeholder')}
                    required
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: `1px solid ${
                        passwordConfirm && password === passwordConfirm
                          ? '#10B981'
                          : passwordConfirm && password !== passwordConfirm
                          ? '#EF4444'
                          : 'rgba(212, 175, 55, 0.25)'
                      }`,
                      borderRadius: '12px',
                      padding: '13px 44px 13px 14px',
                      color: '#FFFFFF',
                      fontSize: '14.5px',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#8B857D',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px',
                    }}
                  >
                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {passwordConfirm && password === passwordConfirm && (
                  <div style={{ fontSize: '11.5px', color: '#10B981', marginTop: '4px', fontWeight: 600 }}>
                    {t('reset_pwd.passwords_match')}
                  </div>
                )}
              </div>

              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #D4AF37, #F6D365)',
                  color: '#0E0C0A',
                  fontWeight: 800,
                  fontSize: '15px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.8 : 1,
                  boxShadow: '0 4px 18px rgba(212, 175, 55, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {loading ? t('reset_pwd.saving') : t('reset_pwd.save_btn')}
              </button>
            </form>
          </>
        )}

        {/* Lien retour */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link
            to="/login"
            style={{
              color: '#D4AF37',
              textDecoration: 'none',
              fontSize: '13.5px',
              fontWeight: 600,
            }}
          >
                        {t('reset_pwd.back_login')}
          </Link>
        </div>

      </div>
    </div>
  );
}
