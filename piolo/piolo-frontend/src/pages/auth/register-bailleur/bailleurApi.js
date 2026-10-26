// frontend/src/pages/auth/register-bailleur/bailleurApi.js
import api from '../../../services/api'; // axiosInstance avec baseURL + interceptors

/**
 * Étape 1 — Créer le compte (statut PENDING)
 * POST /api/auth/register/bailleur/
 */
export const registerBailleur = (data) =>
  api.post('/auth/register/bailleur/', {
    first_name: data.first_name,
    last_name:  data.last_name,
    email:      data.email,
    phone:      data.phone,
    password:   data.password,
    role:       'BAILLEUR',
  });

/**
 * Étape 2 — Envoyer le code OTP par SMS
 * POST /api/auth/otp/send/
 */
export const sendOtp = (phone) =>
  api.post('/auth/otp/send/', { phone });

/**
 * Étape 2 — Vérifier le code OTP
 * POST /api/auth/otp/verify/
 */
export const verifyOtp = (phone, otp) =>
  api.post('/auth/otp/verify/', { phone, otp });

/**
 * Étape 3 — Uploader les documents KYC
 * POST /api/kyc/upload/   (multipart/form-data)
 * Retourne { kyc_id, status: 'PENDING' }
 */
export const uploadKycDocuments = (userId, files, onProgress) => {
  const form = new FormData();
  form.append('user_id',  userId);
  form.append('doc_type', files.doc_type);
  form.append('doc_number', files.doc_number);
  form.append('doc_recto', files.doc_recto);
  form.append('doc_verso', files.doc_verso);
  form.append('selfie',    files.selfie);

  return api.post('/kyc/upload/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });
};

/**
 * Étape 4 — Soumettre les infos patrimoine
 * PATCH /api/bailleur/patrimoine/
 */
export const submitPatrimoine = (userId, data) =>
  api.patch('/bailleur/patrimoine/', {
    user_id:       userId,
    city:          data.city,
    neighborhoods: data.neighborhoods,
    nb_biens:      data.nb_biens,
    types_biens:   data.types_biens,
    loyer_min:     data.loyer_min || null,
    loyer_max:     data.loyer_max || null,
    description:   data.description,
  });

/**
 * Étape 5 — Soumettre le dossier final pour review admin
 * POST /api/bailleur/submit/
 * Retourne { dossier_id, status: 'UNDER_REVIEW' }
 */
export const submitDossier = (userId) =>
  api.post('/bailleur/submit/', { user_id: userId });

/**
 * Polling — Vérifier le statut du dossier (appelable depuis useEffect)
 * GET /api/bailleur/status/{userId}/
 * Retourne { status: 'PENDING'|'UNDER_REVIEW'|'APPROVED'|'REJECTED', motif? }
 */
export const getDossierStatus = (userId) =>
  api.get(`/bailleur/status/${userId}/`);