// src/components/BailleurKYCModal.jsx
// Modale de vérification d'identité (KYC) et certification pour les Bailleurs
// Support bimodal : Luxury Gold & Blanc (mode clair par défaut) et Luxury Gold & Noir (mode sombre)
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useDarkMode } from '../context/DarkModeContext';
import { compressKycImage, formatFileSize } from '../utils/imageCompressor';

/* ─── SVG ICONS PROFESSIONNELS PURS (AUCUN EMOJI / STICKER) ──────────────── */
const KYCIcons = {
  ShieldGold: () => (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  ShieldBadge: () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style={{ verticalAlign: 'middle', marginRight: 4 }}>
      <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5l-3.5-3.5 1.41-1.41L11 13.67l5.09-5.09 1.41 1.41L11 16.5z" />
    </svg>
  ),
  CheckGreen: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  ClockPending: () => (
    <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  AlertNotice: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  UploadCloud: () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 16l-4-4-4 4M12 12v9" />
      <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
      <path d="M16 16l-4-4-4 4" />
    </svg>
  ),
  UserCamera: () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  LockSecure: () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" style={{ verticalAlign: 'middle', marginRight: 5 }}>
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
    </svg>
  )
};

const VILLES_CAMEROUN = ['Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Maroua', 'Kribi', 'Bertoua', 'Bamenda', 'Autre'];
const LISTE_TYPES_BIENS = ['Appartements', 'Villas', 'Studios', 'Terrains', 'Bureaux', 'Boutiques'];

export default function BailleurKYCModal({ isOpen, onClose, user, initialDossier, onDossierUpdated }) {
  const { dark: isDark } = useDarkMode();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [dossier, setDossier] = useState(initialDossier || null);
  const [isEditing, setIsEditing] = useState(false);

  // Champs de formulaire conformes à l'inscription bailleur
  const [documentType, setDocumentType] = useState('CNI');
  const [documentNumber, setDocumentNumber] = useState('');
  const [city, setCity] = useState(user?.city || 'Douala');
  const [neighborhoods, setNeighborhoods] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [propertyCount, setPropertyCount] = useState(1);
  const [selectedTypes, setSelectedTypes] = useState(['Appartements']);
  const [description, setDescription] = useState('');
  const [certifChecked, setCertifChecked] = useState(false);

  // Fichiers uploadés & previews
  const [cniRectoFile, setCniRectoFile] = useState(null);
  const [cniRectoPreview, setCniRectoPreview] = useState(null);

  const [cniVersoFile, setCniVersoFile] = useState(null);
  const [cniVersoPreview, setCniVersoPreview] = useState(null);

  const [selfieFile, setSelfieFile] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);

  // Charger le dossier KYC existant à l'ouverture
  useEffect(() => {
    if (!isOpen) return;

    setErrorMsg('');
    setSuccessMsg('');

    const fetchDossier = async () => {
      try {
        setLoading(true);
        const res = await api.get('/accounts/bailleur/profile/');
        if (res.data?.exists && res.data.dossier) {
          const d = res.data.dossier;
          setDossier(d);
          setDocumentType(d.document_type || 'CNI');
          setDocumentNumber(d.document_number || '');
          setCity(d.city || user?.city || 'Douala');
          setNeighborhoods(d.neighborhoods || '');
          setPropertyCount(d.property_count || 1);
          setDescription(d.description || '');
          if (d.property_types) {
            const typesArr = d.property_types.split(',').map(s => s.trim()).filter(Boolean);
            if (typesArr.length > 0) setSelectedTypes(typesArr);
          }
        }
      } catch (err) {
        console.error('Erreur chargement profil KYC:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDossier();
  }, [isOpen, user]);

  if (!isOpen) return null;

  const isPending = dossier?.status === 'PENDING' && !isEditing;
  const isApproved = (dossier?.status === 'APPROVED' || user?.verification_level >= 2) && !isEditing;
  const isRejected = dossier?.status === 'REJECTED' && !isEditing;

  const togglePropertyType = (type) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter(t => t !== type));
      }
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const [compressingMap, setCompressingMap] = useState({});

  const handleFileSelect = async (e, fieldKey, setFile, setPreview) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setCompressingMap(prev => ({ ...prev, [fieldKey]: true }));
    try {
      const optimized = await compressKycImage(file);
      setFile(optimized);
      if (optimized.type?.startsWith('image/')) {
        setPreview(URL.createObjectURL(optimized));
      } else {
        setPreview(optimized.name);
      }
    } catch (err) {
      console.warn('Compression échouée, fallback fichier brut:', err);
      setFile(file);
      if (file.type?.startsWith('image/')) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(file.name);
      }
    } finally {
      setCompressingMap(prev => ({ ...prev, [fieldKey]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!documentNumber.trim()) {
      setErrorMsg('Veuillez saisir le numéro de votre pièce d’identité.');
      return;
    }

    if (!city.trim()) {
      setErrorMsg('Veuillez sélectionner votre ville d’activité.');
      return;
    }

    if (!neighborhoods.trim()) {
      setErrorMsg('Veuillez indiquer au moins un quartier pour vos biens.');
      return;
    }

    if (!dossier && !cniRectoFile) {
      setErrorMsg('Veuillez fournir au moins le recto de votre pièce d’identité.');
      return;
    }

    if (!certifChecked) {
      setErrorMsg('Veuillez certifier l’authenticité des informations et documents transmis.');
      return;
    }

    setSubmitting(true);
    try {
      // Compression client de sécurité
      const optRecto = cniRectoFile ? await compressKycImage(cniRectoFile) : null;
      const optVerso = cniVersoFile ? await compressKycImage(cniVersoFile) : null;
      const optSelfie = selfieFile ? await compressKycImage(selfieFile) : null;

      const formData = new FormData();
      formData.append('document_type', documentType);
      formData.append('document_number', documentNumber.trim());
      formData.append('city', city.trim());
      formData.append('neighborhoods', neighborhoods.trim());
      if (phone.trim()) formData.append('phone', phone.trim());
      formData.append('property_count', propertyCount);
      formData.append('property_types', selectedTypes.join(', '));
      if (description.trim()) formData.append('description', description.trim());

      if (optRecto) formData.append('cni_recto', optRecto);
      if (optVerso) formData.append('cni_verso', optVerso);
      if (optSelfie) formData.append('selfie', optSelfie);

      const res = await api.post('/accounts/bailleur/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.dossier) {
        setDossier(res.data.dossier);
        setIsEditing(false);
        setSuccessMsg('Votre dossier de certification a été soumis avec succès.');
        onDossierUpdated?.(res.data.dossier);
      }
    } catch (err) {
      console.error('Erreur soumission KYC:', err);
      const data = err.response?.data;
      let msg = 'Une erreur est survenue lors de la soumission.';
      if (typeof data === 'string') {
        msg = data;
      } else if (data?.detail) {
        msg = data.detail;
      } else if (data?.error) {
        msg = data.error;
      } else if (typeof data === 'object' && data !== null) {
        const errorList = Object.entries(data).map(([k, v]) => `${Array.isArray(v) ? v.join(', ') : v}`);
        if (errorList.length > 0) msg = errorList.join(' · ');
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`piolo-kyc-backdrop ${isDark ? 'mode-dark' : 'mode-light'}`}>
      <style>{`
        .piolo-kyc-backdrop {
          position: fixed;
          inset: 0;
          z-index: 10006;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          box-sizing: border-box;
          animation: pioloKycFade 0.22s ease;
        }

        .piolo-kyc-backdrop.mode-dark {
          background: rgba(8, 7, 5, 0.92);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .piolo-kyc-backdrop.mode-light {
          background: rgba(15, 13, 9, 0.55);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .piolo-kyc-modal-card {
          width: 100%;
          max-width: 580px;
          max-height: 92vh;
          border-radius: 26px;
          border: 1.5px solid rgba(212, 175, 55, 0.35);
          padding: 28px 24px;
          box-sizing: border-box;
          position: relative;
          font-family: 'DM Sans', sans-serif;
          overflow-y: auto;
          scrollbar-width: thin;
          animation: pioloKycPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mode-dark .piolo-kyc-modal-card {
          background: #0F0D09;
          color: #FFFFFF;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.85);
        }

        .mode-light .piolo-kyc-modal-card {
          background: #FFFFFF;
          color: #0F0D09;
          box-shadow: 0 25px 70px rgba(212, 175, 55, 0.2), 0 10px 30px rgba(0,0,0,0.08);
        }

        @keyframes pioloKycFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pioloKycPop {
          from { transform: scale(0.96) translateY(10px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }

        .piolo-kyc-benefit-row {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 13px;
          margin-bottom: 6px;
          line-height: 1.4;
        }

        .mode-dark .piolo-kyc-benefit-row { color: rgba(255, 255, 255, 0.88); }
        .mode-light .piolo-kyc-benefit-row { color: #2C2822; }

        .piolo-kyc-field-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-bottom: 14px;
          text-align: left;
        }

        .piolo-kyc-label {
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          font-family: 'Poppins', sans-serif;
        }

        .mode-dark .piolo-kyc-label { color: #F6D365; }
        .mode-light .piolo-kyc-label { color: #785D08; }

        .piolo-kyc-input, .piolo-kyc-select, .piolo-kyc-textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 13px;
          border-radius: 12px;
          font-size: 13.5px;
          outline: none;
          font-family: inherit;
          transition: all 0.2s ease;
        }

        .mode-dark .piolo-kyc-input, .mode-dark .piolo-kyc-select, .mode-dark .piolo-kyc-textarea {
          background: rgba(255, 255, 255, 0.05);
          border: 1.5px solid rgba(255, 255, 255, 0.14);
          color: #FFFFFF;
        }
        .mode-dark .piolo-kyc-input:focus, .mode-dark .piolo-kyc-select:focus, .mode-dark .piolo-kyc-textarea:focus {
          border-color: #D4AF37;
          background: rgba(255, 255, 255, 0.08);
        }

        .mode-light .piolo-kyc-input, .mode-light .piolo-kyc-select, .mode-light .piolo-kyc-textarea {
          background: #FDFBF7;
          border: 1.5px solid #E8E3DA;
          color: #0F0D09;
        }
        .mode-light .piolo-kyc-input:focus, .mode-light .piolo-kyc-select:focus, .mode-light .piolo-kyc-textarea:focus {
          border-color: #D4AF37;
          background: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.14);
        }

        .piolo-kyc-upload-box {
          border: 1.5px dashed #D4AF37;
          border-radius: 14px;
          padding: 12px 10px;
          text-align: center;
          cursor: pointer;
          position: relative;
          transition: all 0.18s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 94px;
        }

        .mode-dark .piolo-kyc-upload-box { background: rgba(212, 175, 55, 0.05); }
        .mode-light .piolo-kyc-upload-box { background: #FFFDF9; }

        .piolo-kyc-upload-box:hover {
          background: rgba(212, 175, 55, 0.12);
        }

        .piolo-type-chip {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
        }

        .mode-dark .piolo-type-chip.active {
          background: linear-gradient(135deg, #D4AF37, #F6D365);
          color: #0F0D09;
          border: 1px solid #F6D365;
        }
        .mode-dark .piolo-type-chip:not(.active) {
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .mode-light .piolo-type-chip.active {
          background: linear-gradient(135deg, #D4AF37, #F6D365);
          color: #0F0D09;
          border: 1px solid #D4AF37;
          box-shadow: 0 2px 8px rgba(212, 175, 55, 0.25);
        }
        .mode-light .piolo-type-chip:not(.active) {
          background: #F4EFE6;
          color: #555047;
          border: 1px solid #E2DCD2;
        }

        .piolo-kyc-btn-submit {
          width: 100%;
          padding: 14px 20px;
          border-radius: 14px;
          border: 0;
          background: linear-gradient(135deg, #D4AF37, #F6D365);
          color: #0F0D09;
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 18px rgba(212, 175, 55, 0.35);
          transition: transform 0.15s ease;
          margin-top: 14px;
        }

        .piolo-kyc-btn-submit:active {
          transform: scale(0.99);
        }

        .piolo-kyc-btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <div className="piolo-kyc-modal-card">
        {/* Bouton Fermeture */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 13, 9, 0.05)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(15, 13, 9, 0.08)',
            borderRadius: '50%',
            width: 34,
            height: 34,
            color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#64605A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <KYCIcons.Close />
        </button>

        {isApproved ? (
          /* ══════════════════════════════════════════════════════════════
             STATUT 1 : BAILLEUR APPROUVÉ & VÉRIFIÉ
             ══════════════════════════════════════════════════════════════ */
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div style={{ margin: '0 auto 16px', display: 'grid', placeItems: 'center' }}>
              <KYCIcons.ShieldGold />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', padding: '5px 14px', borderRadius: 999, marginBottom: 12 }}>
              <KYCIcons.ShieldBadge />
              <span style={{ fontSize: 11.5, fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'Poppins, sans-serif' }}>
                Compte Certifié Bailleur Pro
              </span>
            </div>

            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 21, fontWeight: 800, margin: '0 0 10px' }}>
              Félicitations, vous êtes Bailleur Vérifié
            </h2>

            <p style={{ fontSize: 13.5, color: isDark ? 'rgba(255, 255, 255, 0.75)' : '#4A453E', lineHeight: 1.5, margin: '0 0 20px' }}>
              Votre identité et votre patrimoine ont été validés par l'équipe de conformité Piolo. Vos annonces et échanges bénéficient du badge de confiance officiel.
            </p>

            <button
              type="button"
              className="piolo-kyc-btn-submit"
              onClick={onClose}
            >
              Retourner au tableau de bord
            </button>
          </div>
        ) : isPending ? (
          /* ══════════════════════════════════════════════════════════════
             STATUT 2 : DOSSIER EN COURS D'EXAMEN (PENDING)
             ══════════════════════════════════════════════════════════════ */
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div style={{ margin: '0 auto 16px', display: 'grid', placeItems: 'center' }}>
              <KYCIcons.ClockPending />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: isDark ? 'rgba(212,175,55,0.14)' : 'rgba(212,175,55,0.16)', border: '1px solid rgba(212,175,55,0.4)', padding: '5px 14px', borderRadius: 999, marginBottom: 12 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: isDark ? '#F6D365' : '#785D08', textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'Poppins, sans-serif' }}>
                Dossier en cours d'examen
              </span>
            </div>

            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 20, fontWeight: 800, margin: '0 0 10px' }}>
              Dossier transmis avec succès
            </h2>

            <p style={{ fontSize: 13.5, color: isDark ? 'rgba(255, 255, 255, 0.75)' : '#4A453E', lineHeight: 1.5, margin: '0 0 20px' }}>
              Vos pièces justificatives sont actuellement en cours d'analyse par nos administrateurs. Vous serez notifié par SMS et email dès la validation de votre certification (sous 24h à 48h).
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid rgba(212,175,55,0.4)',
                  background: 'transparent', color: isDark ? '#F6D365' : '#785D08',
                  fontWeight: 700, fontSize: 13, cursor: 'pointer'
                }}
              >
                Compléter / Modifier mes pièces
              </button>
              <button
                type="button"
                className="piolo-kyc-btn-submit"
                style={{ flex: 1, marginTop: 0 }}
                onClick={onClose}
              >
                Compris
              </button>
            </div>
          </div>
        ) : (
          /* ══════════════════════════════════════════════════════════════
             STATUT 3 : FORMULAIRE DE SOUMISSION KYC COMPLET
             ══════════════════════════════════════════════════════════════ */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: isDark ? 'rgba(212,175,55,0.15)' : 'rgba(212,175,55,0.12)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <KYCIcons.ShieldGold />
              </div>
              <div>
                <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 19, fontWeight: 800, margin: '0 0 2px', letterSpacing: -0.3 }}>
                  Certification Bailleur Vérifié
                </h2>
                <div style={{ fontSize: 12.5, color: isDark ? 'rgba(255, 255, 255, 0.65)' : '#5A544A' }}>
                  Faites certifier votre compte pour débloquer la confiance maximale des locataires.
                </div>
              </div>
            </div>

            {/* Notification de rejet si applicable */}
            {isRejected && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1.5px solid rgba(239, 68, 68, 0.35)', borderRadius: 14, padding: '12px 14px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <KYCIcons.AlertNotice />
                <div>
                  <div style={{ fontWeight: 800, color: '#EF4444', fontSize: 12.5, marginBottom: 2 }}>
                    Dossier à corriger :
                  </div>
                  <div style={{ fontSize: 12, color: isDark ? '#FCA5A5' : '#991B1B' }}>
                    {dossier?.rejection_reason || 'Veuillez soumettre une photo plus nette et bien cadrée de votre pièce d’identité.'}
                  </div>
                </div>
              </div>
            )}

            {/* Boîte bénéfices pro */}
            <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#FDFBF7', border: '1px solid rgba(212,175,55,0.22)', borderRadius: 16, padding: '12px 14px', marginBottom: 16 }}>
              <div className="piolo-kyc-benefit-row">
                <KYCIcons.CheckGreen />
                <span>Attribution du badge officiel <strong>Bailleur Vérifié Piolo</strong> sur toutes vos annonces.</span>
              </div>
              <div className="piolo-kyc-benefit-row">
                <KYCIcons.CheckGreen />
                <span>Augmentation de <strong>+80% des candidatures</strong> de locataires solvables.</span>
              </div>
              <div className="piolo-kyc-benefit-row">
                <KYCIcons.CheckGreen />
                <span>Examen confidentiel et sécurisé sous <strong>24h à 48h</strong> par notre équipe.</span>
              </div>
            </div>

            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #EF4444', borderRadius: 12, padding: '10px 14px', color: '#EF4444', fontSize: 13, marginBottom: 14, fontWeight: 600 }}>
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div style={{ background: 'rgba(34, 197, 94, 0.12)', border: '1px solid #22C55E', borderRadius: 12, padding: '10px 14px', color: '#16A34A', fontSize: 13, marginBottom: 14, fontWeight: 700 }}>
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Ligne 1 : Type & Numéro de pièce */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="piolo-kyc-field-group">
                  <label className="piolo-kyc-label">Type de pièce *</label>
                  <select
                    className="piolo-kyc-select"
                    value={documentType}
                    onChange={e => setDocumentType(e.target.value)}
                  >
                    <option value="CNI">Carte Nationale d'Identité (CNI)</option>
                    <option value="PASSEPORT">Passeport biométrique</option>
                    <option value="SEJOUR">Titre de séjour</option>
                  </select>
                </div>

                <div className="piolo-kyc-field-group">
                  <label className="piolo-kyc-label">Numéro du document *</label>
                  <input
                    type="text"
                    className="piolo-kyc-input"
                    placeholder="Ex: 102948576"
                    value={documentNumber}
                    onChange={e => setDocumentNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Ligne 2 : Ville & Quartiers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 10 }}>
                <div className="piolo-kyc-field-group">
                  <label className="piolo-kyc-label">Ville d'activité *</label>
                  <select
                    className="piolo-kyc-select"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    required
                  >
                    {VILLES_CAMEROUN.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <div className="piolo-kyc-field-group">
                  <label className="piolo-kyc-label">Quartier(s) principaux *</label>
                  <input
                    type="text"
                    className="piolo-kyc-input"
                    placeholder="Ex: Bastos, Bonapriso…"
                    value={neighborhoods}
                    onChange={e => setNeighborhoods(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Ligne 3 : Nombre de biens & Téléphone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 10 }}>
                <div className="piolo-kyc-field-group">
                  <label className="piolo-kyc-label">Nombre de biens *</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    className="piolo-kyc-input"
                    value={propertyCount}
                    onChange={e => setPropertyCount(Math.max(1, parseInt(e.target.value) || 1))}
                    required
                  />
                </div>

                <div className="piolo-kyc-field-group">
                  <label className="piolo-kyc-label">Téléphone de contact</label>
                  <input
                    type="tel"
                    className="piolo-kyc-input"
                    placeholder="Ex: +237 6..."
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Types de biens (Chips multi-select) */}
              <div className="piolo-kyc-field-group" style={{ marginBottom: 12 }}>
                <label className="piolo-kyc-label">Types de biens gérés *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
                  {LISTE_TYPES_BIENS.map(t => {
                    const isSelected = selectedTypes.includes(t);
                    return (
                      <span
                        key={t}
                        className={`piolo-type-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => togglePropertyType(t)}
                      >
                        {isSelected && '✓ '} {t}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Uploads : Recto, Verso et Selfie */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                {/* Recto */}
                <div className="piolo-kyc-field-group" style={{ marginBottom: 0 }}>
                  <label className="piolo-kyc-label">Photo Recto *</label>
                  <label className="piolo-kyc-upload-box">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      hidden
                      onChange={e => handleFileSelect(e, 'recto', setCniRectoFile, setCniRectoPreview)}
                    />
                    {compressingMap['recto'] ? (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 13, marginBottom: 2 }}>⚡</div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#D4AF37' }}>Optimisation…</span>
                      </div>
                    ) : cniRectoPreview ? (
                      <div>
                        {cniRectoFile?.type?.startsWith('image/') ? (
                          <img src={cniRectoPreview} alt="Recto" style={{ maxHeight: 48, borderRadius: 6, objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 700 }}>Doc Recto</span>
                        )}
                        <div style={{ fontSize: 9.5, color: '#16A34A', fontWeight: 800, marginTop: 3 }}>
                          ✓ Chargé {cniRectoFile ? `(${formatFileSize(cniRectoFile.size)})` : ''}
                        </div>
                      </div>
                    ) : (
                      <>
                        <KYCIcons.UploadCloud />
                        <span style={{ fontSize: 11, fontWeight: 700, marginTop: 3 }}>Recto</span>
                        <span style={{ fontSize: 9, opacity: 0.6 }}>JPG, PNG, PDF</span>
                      </>
                    )}
                  </label>
                </div>

                {/* Verso */}
                <div className="piolo-kyc-field-group" style={{ marginBottom: 0 }}>
                  <label className="piolo-kyc-label">Photo Verso {documentType === 'CNI' ? '*' : ''}</label>
                  <label className="piolo-kyc-upload-box">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      hidden
                      onChange={e => handleFileSelect(e, 'verso', setCniVersoFile, setCniVersoPreview)}
                    />
                    {compressingMap['verso'] ? (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 13, marginBottom: 2 }}>⚡</div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#D4AF37' }}>Optimisation…</span>
                      </div>
                    ) : cniVersoPreview ? (
                      <div>
                        {cniVersoFile?.type?.startsWith('image/') ? (
                          <img src={cniVersoPreview} alt="Verso" style={{ maxHeight: 48, borderRadius: 6, objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 700 }}>Doc Verso</span>
                        )}
                        <div style={{ fontSize: 9.5, color: '#16A34A', fontWeight: 800, marginTop: 3 }}>
                          ✓ Chargé {cniVersoFile ? `(${formatFileSize(cniVersoFile.size)})` : ''}
                        </div>
                      </div>
                    ) : (
                      <>
                        <KYCIcons.UploadCloud />
                        <span style={{ fontSize: 11, fontWeight: 700, marginTop: 3 }}>Verso</span>
                        <span style={{ fontSize: 9, opacity: 0.6 }}>JPG, PNG, PDF</span>
                      </>
                    )}
                  </label>
                </div>

                {/* Selfie vérification */}
                <div className="piolo-kyc-field-group" style={{ marginBottom: 0 }}>
                  <label className="piolo-kyc-label">Selfie vérif. *</label>
                  <label className="piolo-kyc-upload-box">
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={e => handleFileSelect(e, 'selfie', setSelfieFile, setSelfiePreview)}
                    />
                    {compressingMap['selfie'] ? (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 13, marginBottom: 2 }}>⚡</div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#D4AF37' }}>Optimisation…</span>
                      </div>
                    ) : selfiePreview ? (
                      <div>
                        <img src={selfiePreview} alt="Selfie" style={{ maxHeight: 48, borderRadius: 6, objectFit: 'contain' }} />
                        <div style={{ fontSize: 9.5, color: '#16A34A', fontWeight: 800, marginTop: 3 }}>
                          ✓ Chargé {selfieFile ? `(${formatFileSize(selfieFile.size)})` : ''}
                        </div>
                      </div>
                    ) : (
                      <>
                        <KYCIcons.UserCamera />
                        <span style={{ fontSize: 11, fontWeight: 700, marginTop: 3 }}>Selfie net</span>
                        <span style={{ fontSize: 9, opacity: 0.6 }}>Visage visible</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Description facultative */}
              <div className="piolo-kyc-field-group" style={{ marginBottom: 12 }}>
                <label className="piolo-kyc-label">Présentation de votre activité (optionnel)</label>
                <textarea
                  rows={2}
                  className="piolo-kyc-textarea"
                  placeholder="Ex : Propriétaire de 3 appartements meublés à Bonapriso et Bastos..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              {/* Certification sur l'honneur */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 8, marginBottom: 6 }}>
                <input
                  type="checkbox"
                  id="kyc_certif"
                  checked={certifChecked}
                  onChange={e => setCertifChecked(e.target.checked)}
                  style={{ marginTop: 2, accentColor: '#D4AF37', width: 16, height: 16, cursor: 'pointer' }}
                  required
                />
                <label htmlFor="kyc_certif" style={{ fontSize: 11.5, color: isDark ? 'rgba(255,255,255,0.8)' : '#4A453E', lineHeight: 1.4, cursor: 'pointer' }}>
                  Je certifie sur l'honneur l'exactitude des pièces fournies. Toute pièce frauduleuse entraîne la suspension immédiate du compte.
                </label>
              </div>

              <div style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.5)' : '#7C766D', display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                <KYCIcons.LockSecure /> Données chiffrées de bout en bout et protégées selon la réglementation.
              </div>

              <button
                type="submit"
                className="piolo-kyc-btn-submit"
                disabled={submitting}
              >
                {submitting ? 'Envoi du dossier en cours…' : 'Soumettre mon dossier de certification'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

