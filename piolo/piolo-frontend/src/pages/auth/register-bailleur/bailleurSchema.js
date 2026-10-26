// frontend/src/pages/auth/register-bailleur/bailleurSchema.js
import * as Yup from 'yup';

const phone = Yup.string()
  .required('Le numéro de téléphone est requis.')
  .matches(/^\+?[0-9\s\-]{8,15}$/, 'Numéro invalide. Ex : +237 6XX XXX XXX');

export const step1Schema = Yup.object({
  first_name: Yup.string().trim().required('Le prénom est requis.'),
  last_name:  Yup.string().trim().required('Le nom est requis.'),
  email: Yup.string()
    .email('Adresse email invalide.')
    .required("L'adresse email est requise."),
  phone,
  password: Yup.string()
    .min(8, 'Minimum 8 caractères.')
    .matches(/[A-Z]/, 'Au moins une majuscule.')
    .matches(/[0-9]/, 'Au moins un chiffre.')
    .required('Le mot de passe est requis.'),
  password2: Yup.string()
    .oneOf([Yup.ref('password')], 'Les mots de passe ne correspondent pas.')
    .required('Confirmez votre mot de passe.'),
});

export const step2Schema = Yup.object({
  otp: Yup.string()
    .length(6, 'Le code doit contenir 6 chiffres.')
    .matches(/^\d{6}$/, 'Chiffres uniquement.')
    .required('Entrez le code reçu par SMS.'),
});

export const step3Schema = Yup.object({
  doc_type:   Yup.string().required('Choisissez un type de document.'),
  doc_number: Yup.string()
    .trim()
    .required('Le numéro du document est requis.')
    .min(6, 'Numéro trop court.'),
  doc_recto:  Yup.mixed()
    .required('La photo recto est requise.')
    .test('fileSize', 'Fichier trop volumineux (max 5 Mo).', (v) =>
      !v || (v && v.size <= 5 * 1024 * 1024)
    )
    .test('fileType', 'Format accepté : JPG, PNG, PDF.', (v) =>
      !v || ['image/jpeg','image/png','application/pdf'].includes(v.type)
    ),
  doc_verso: Yup.mixed()
    .required('La photo verso est requise.')
    .test('fileSize', 'Fichier trop volumineux (max 5 Mo).', (v) =>
      !v || v.size <= 5 * 1024 * 1024
    ),
  selfie: Yup.mixed()
    .required('La photo selfie est requise.')
    .test('fileSize', 'Fichier trop volumineux (max 5 Mo).', (v) =>
      !v || v.size <= 5 * 1024 * 1024
    ),
});

export const step4Schema = Yup.object({
  city: Yup.string().required('La ville est requise.'),
  neighborhoods: Yup.string().trim().required('Indiquez au moins un quartier.'),
  nb_biens: Yup.number()
    .min(1, 'Minimum 1 bien.')
    .max(500, 'Maximum 500 biens.')
    .required(),
  types_biens: Yup.array()
    .of(Yup.string())
    .min(1, 'Sélectionnez au moins un type de bien.'),
  description: Yup.string()
    .trim()
    .min(30, 'Description trop courte (30 caractères minimum).')
    .required('La description est requise.'),
  loyer_min: Yup.number()
    .typeError('Montant invalide.')
    .min(0, 'Montant invalide.')
    .nullable(),
  loyer_max: Yup.number()
    .typeError('Montant invalide.')
    .min(Yup.ref('loyer_min'), 'Le max doit être supérieur au min.')
    .nullable(),
});

export const step5Schema = Yup.object({
  certif: Yup.boolean()
    .oneOf([true], 'Vous devez certifier l\'authenticité de votre dossier.'),
  terms: Yup.boolean()
    .oneOf([true], 'Vous devez accepter les conditions d\'utilisation.'),
});

export const SCHEMAS = [
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
];