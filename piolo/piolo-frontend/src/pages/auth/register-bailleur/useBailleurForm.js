// frontend/src/pages/auth/register-bailleur/useBailleurForm.js
import { useState, useCallback, useRef } from 'react';
import { SCHEMAS } from './bailleurSchema';
import {
  registerBailleur,
  sendOtp,
  verifyOtp,
  uploadKycDocuments,
  submitPatrimoine,
  submitDossier,
} from './bailleurApi';

const TOTAL_STEPS = 5;

const INITIAL_FORM = {
  // étape 1
  first_name: '', last_name: '', email: '', phone: '',
  password: '', password2: '',
  // étape 2
  otp: '',
  // étape 3
  doc_type: 'CNI', doc_number: '',
  doc_recto: null, doc_verso: null, selfie: null,
  // étape 4
  city: 'Yaoundé', neighborhoods: '',
  nb_biens: 1, types_biens: [],
  loyer_min: '', loyer_max: '', description: '',
  // étape 5
  certif: false, terms: false,
};

export function useBailleurForm() {
  const [step,     setStep]     = useState(1);
  const [form,     setForm]     = useState(INITIAL_FORM);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState('');
  const [success,  setSuccess]  = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // userId renvoyé après l'étape 1 pour les étapes suivantes
  const userIdRef = useRef(null);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const setField = useCallback((name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    // Efface l'erreur dès que l'utilisateur corrige
    setErrors((e) => {
      if (!e[name]) return e;
      const next = { ...e };
      delete next[name];
      return next;
    });
  }, []);

  const clearApiError = () => setApiError('');

  // ── Validation locale (Yup) ───────────────────────────────────────────────

  const validateStep = useCallback(async (stepNum, data) => {
    const schema = SCHEMAS[stepNum - 1];
    try {
      await schema.validate(data, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      const mapped = {};
      err.inner.forEach((e) => { mapped[e.path] = e.message; });
      setErrors(mapped);
      return false;
    }
  }, []);

  // ── Actions par étape ────────────────────────────────────────────────────

  const submitStep1 = async () => {
    const ok = await validateStep(1, form);
    if (!ok) return false;
    setLoading(true);
    setApiError('');
    try {
      const { data } = await registerBailleur(form);
      userIdRef.current = data.user_id;
      // Déclenche l'envoi OTP automatiquement
      await sendOtp(form.phone);
      return true;
    } catch (err) {
      const msg = err.response?.data?.detail
        || err.response?.data?.email?.[0]
        || 'Une erreur est survenue. Réessayez.';
      setApiError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try { await sendOtp(form.phone); }
    catch { /* silencieux, le timer gère l'UX */ }
  };

  const submitStep2 = async () => {
    const ok = await validateStep(2, form);
    if (!ok) return false;
    setLoading(true);
    setApiError('');
    try {
      await verifyOtp(form.phone, form.otp);
      return true;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Code incorrect ou expiré.';
      setApiError(msg);
      setErrors({ otp: msg });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const submitStep3 = async () => {
    const ok = await validateStep(3, form);
    if (!ok) return false;
    setLoading(true);
    setApiError('');
    setUploadProgress(0);
    try {
      await uploadKycDocuments(
        userIdRef.current,
        {
          doc_type:   form.doc_type,
          doc_number: form.doc_number,
          doc_recto:  form.doc_recto,
          doc_verso:  form.doc_verso,
          selfie:     form.selfie,
        },
        setUploadProgress
      );
      return true;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Erreur lors de l\'upload des documents.';
      setApiError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const submitStep4 = async () => {
    const ok = await validateStep(4, form);
    if (!ok) return false;
    setLoading(true);
    setApiError('');
    try {
      await submitPatrimoine(userIdRef.current, form);
      return true;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Erreur lors de l\'enregistrement du patrimoine.';
      setApiError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const submitStep5 = async () => {
    const ok = await validateStep(5, form);
    if (!ok) return false;
    setLoading(true);
    setApiError('');
    try {
      await submitDossier(userIdRef.current);
      setSuccess(true);
      return true;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Erreur lors de la soumission du dossier.';
      setApiError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ── Navigation ───────────────────────────────────────────────────────────

  const STEP_SUBMITTERS = [
    submitStep1,
    submitStep2,
    submitStep3,
    submitStep4,
    submitStep5,
  ];

  const goNext = async () => {
    const submitter = STEP_SUBMITTERS[step - 1];
    const ok = await submitter();
    if (ok && step < TOTAL_STEPS) setStep((s) => s + 1);
  };

  const goBack = () => {
    setErrors({});
    setApiError('');
    if (step > 1) setStep((s) => s - 1);
  };

  const resetFlow = () => {
    setStep(1);
    setForm(INITIAL_FORM);
    setErrors({});
    setApiError('');
    setSuccess(false);
    setUploadProgress(0);
    userIdRef.current = null;
  };

  return {
    // state
    step, form, errors, loading, apiError, success, uploadProgress,
    // actions
    setField,
    clearApiError,
    goNext,
    goBack,
    resetFlow,
    resendOtp,
    // metadata
    TOTAL_STEPS,
    userId: userIdRef.current,
  };
}