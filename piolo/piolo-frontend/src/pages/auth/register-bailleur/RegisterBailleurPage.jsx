// frontend/src/pages/auth/register-bailleur/RegisterBailleurPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useBailleurForm }  from './useBailleurForm';
import { StepShell }        from './components/StepShell';
import {
  Step1Identite,
  Step2OTP,
  Step3Documents,
  Step4Patrimoine,
  Step5Recap,
  SuccessScreen,
} from './components/Steps';

const STEP_NEXT_LABELS = [
  'Vérifier mon téléphone',
  'Valider le code',
  'Continuer vers le patrimoine',
  'Voir le récapitulatif',
  '🚀 Soumettre mon dossier',
];

export default function RegisterBailleurPage() {
  const navigate = useNavigate();
  const {
    step, form, errors, loading, apiError, success, uploadProgress,
    setField, clearApiError,
    goNext, goBack, resetFlow, resendOtp,
    TOTAL_STEPS,
  } = useBailleurForm();

  // ── Écran de succès ───────────────────────────────────────────────────────
  if (success) {
    return (
      <SuccessScreen
        form={form}
        onGoHome={() => navigate('/dashboard/waiting')}
      />
    );
  }

  // ── Contenu de l'étape courante ───────────────────────────────────────────
  const stepProps = { form, errors, setField, apiError, clearApiError };

  const stepContent = {
    1: <Step1Identite {...stepProps} />,
    2: <Step2OTP {...stepProps} onResend={resendOtp} phone={form.phone} />,
    3: <Step3Documents {...stepProps} uploadProgress={uploadProgress} />,
    4: <Step4Patrimoine {...stepProps} />,
    5: <Step5Recap {...stepProps} />,
  }[step];

  return (
    <StepShell
      step={step}
      total={TOTAL_STEPS}
      onNext={goNext}
      onBack={step === 1 ? () => navigate('/register') : goBack}
      loading={loading}
      nextLabel={STEP_NEXT_LABELS[step - 1]}
      hideBack={false}
    >
      {stepContent}
    </StepShell>
  );
}