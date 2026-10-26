import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './OnboardingManager.css';

const storageKey = (user) => `piolo-onboarding:${user?.id || user?.email || 'guest'}`;

const roleSteps = {
  LOCATAIRE: [
    { eyebrow: '01 · Explorer', title: 'Trouvez votre prochain chez-vous', text: 'Utilisez la recherche, les filtres et la carte pour repérer les biens qui correspondent vraiment à votre projet.', visual: 'search' },
    { eyebrow: '02 · Sauvegarder', title: 'Gardez vos coups de cœur', text: 'Le cœur doré ajoute une annonce à vos favoris. Vos biens sauvegardés restent accessibles depuis votre espace.', visual: 'favorite' },
    { eyebrow: '03 · Sécuriser', title: 'Visitez toujours avant de décider', text: 'Une annonce ne remplace jamais une visite physique. Vérifiez l’adresse, l’état du logement et l’environnement avant tout paiement.', visual: 'visit' },
    { eyebrow: '04 · Être alerté', title: 'Ne ratez aucune opportunité', text: 'Créez une alerte de recherche et Piolo vous préviendra lorsqu’un bien correspondant sera trouvé.', visual: 'alert' },
  ],
  BAILLEUR: [
    { eyebrow: '01 · Publier', title: 'Transformez votre bien en annonce attractive', text: 'Un titre clair, un prix précis et des photos lumineuses augmentent la confiance et la qualité des demandes.', visual: 'publish' },
    { eyebrow: '02 · Localiser', title: 'Positionnez le logement avec précision', text: 'Si vous êtes absent, recherchez le quartier puis placez manuellement le marqueur. Vérifiez toujours la ville sélectionnée.', visual: 'location' },
    { eyebrow: '03 · Enrichir', title: 'Passez en mode découverte', text: 'Ajoutez une vidéo courte pour présenter l’ambiance du bien et une visite 360° pour rassurer les futurs locataires.', visual: 'media' },
    { eyebrow: '04 · Piloter', title: 'Gérez vos demandes au même endroit', text: 'Visites, dossiers, calendrier et notifications vous permettent de suivre chaque étape sans perdre le fil.', visual: 'dashboard' },
  ],
};

const visualContent = {
  search: { icon: '⌕', label: 'Recherche intelligente', chips: ['Yaoundé', 'Studio', '≤ 150 000'] },
  favorite: { icon: '♥', label: 'Favori enregistré', chips: ['Cœur doré', 'Vos sélections', 'Accès rapide'] },
  visit: { icon: '⌂', label: 'Visite recommandée', chips: ['Adresse', 'État du bien', 'Quartier'] },
  alert: { icon: '◌', label: 'Alerte active', chips: ['Ville', 'Budget', 'Notification'] },
  publish: { icon: '+', label: 'Nouvelle annonce', chips: ['Informations', 'Photos', 'Prix'] },
  location: { icon: '⌖', label: 'Localisation exacte', chips: ['Ville contrôlée', 'Quartier', 'Marqueur'] },
  media: { icon: '▷', label: 'Contenu immersif', chips: ['Vidéo', '360°', 'Découverte'] },
  dashboard: { icon: '▦', label: 'Espace bailleur', chips: ['Visites', 'Dossiers', 'Calendrier'] },
  published: { icon: '✦', label: 'Annonce en ligne', chips: ['Vidéo', 'Visite 360°', 'Découverte'] },
};

export default function OnboardingManager() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [tourIndex, setTourIndex] = useState(null);
  const [contextTip, setContextTip] = useState(null);
  const steps = useMemo(() => roleSteps[user?.role] || [], [user?.role]);
  const key = storageKey(user);

  useEffect(() => {
    if (loading || !user || !steps.length) return;
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      const isNewReg = sessionStorage.getItem('piolo_is_new_registration') === 'true';
      // S'affiche UNIQUEMENT lors de la création d'un nouveau compte si jamais vu
      if (isNewReg && !saved.welcomeComplete && !saved.hasSeenInitialOnboarding) {
        setTourIndex(0);
      }
    } catch {
      // ignore
    }
  }, [key, loading, user, steps.length]);

  useEffect(() => {
    if (loading || !user) return undefined;
    const path = location.pathname;
    const timer = window.setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(key) || '{}');
        const isNewReg = sessionStorage.getItem('piolo_is_new_registration') === 'true';
        // Les astuces contextuelles ne s'affichent qu'une seule fois si nouveau compte
        if (isNewReg && user.role === 'BAILLEUR' && new URLSearchParams(location.search).get('published') === '1' && !saved.postPublishTipSeen) {
          setContextTip('published');
        } else if (isNewReg && user.role === 'BAILLEUR' && /^\/properties\/(create|new|[^/]+\/(edit|update))/.test(path) && !saved.publishTipSeen && !saved.welcomeComplete) {
          setContextTip('publish');
        } else if (isNewReg && user.role === 'LOCATAIRE' && /^\/properties\/[^/]+$/.test(path) && !saved.visitTipSeen && !saved.welcomeComplete) {
          setContextTip('visit');
        }
      } catch {
        // ignore
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.search, loading, user, key]);

  const persist = (patch) => {
    try {
      const existing = JSON.parse(localStorage.getItem(key) || '{}');
      const next = { ...existing, ...patch };
      localStorage.setItem(key, JSON.stringify(next));
    } catch { /* storage unavailable */ }
  };

  const closeTour = () => {
    persist({ welcomeComplete: true, hasSeenInitialOnboarding: true, visitTipSeen: true, publishTipSeen: true });
    sessionStorage.removeItem('piolo_is_new_registration');
    setTourIndex(null);
  };

  const nextTour = () => {
    if (tourIndex === null) return;
    if (tourIndex >= steps.length - 1) closeTour();
    else setTourIndex(tourIndex + 1);
  };

  const closeContextTip = () => {
    if (contextTip === 'publish') persist({ publishTipSeen: true });
    if (contextTip === 'visit') persist({ visitTipSeen: true });
    if (contextTip === 'published') persist({ postPublishTipSeen: true });
    setContextTip(null);
  };

  if (!user || loading || (tourIndex === null && !contextTip)) return null;

  const step = tourIndex !== null ? steps[tourIndex] : null;
  const visual = visualContent[step?.visual || contextTip] || visualContent.visit;
  const isContext = tourIndex === null;
  const contextCopy = contextTip === 'publish'
    ? { eyebrow: 'Conseil publication', title: 'Vous êtes sur place ?', text: 'Idéalement, publiez depuis le logement pour vérifier chaque détail. Sinon, recherchez la zone et placez manuellement le marqueur avant de continuer.' }
    : contextTip === 'published'
      ? { eyebrow: 'Annonce publiée', title: 'Donnez-lui une longueur d’avance', text: 'Ajoutez maintenant une vidéo courte et une visite 360° pour aider les locataires à se projeter et faire ressortir votre annonce dans le Mode Découverte.' }
      : { eyebrow: 'Conseil sécurité', title: 'Une visite physique reste essentielle', text: 'Les photos et la visite 360° aident à se projeter, mais vérifiez toujours le logement, l’accès, le quartier et les conditions avant de vous engager.' };
  const copy = isContext ? contextCopy : step;

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="onboarding-card">
        <button type="button" className="onboarding-close" onClick={isContext ? closeContextTip : closeTour} aria-label="Fermer">×</button>
        <div className="onboarding-visual">
          <span className="onboarding-visual-glow" />
          <strong>{visual.icon}</strong>
          <span>{visual.label}</span>
          <div className="onboarding-mini-chips">{visual.chips.map((chip) => <i key={chip}>{chip}</i>)}</div>
        </div>
        <div className="onboarding-copy">
          <span className="onboarding-eyebrow">{copy.eyebrow}</span>
          <h2 id="onboarding-title">{copy.title}</h2>
          <p>{copy.text}</p>
        </div>
        {!isContext && <div className="onboarding-progress" aria-label={`Étape ${tourIndex + 1} sur ${steps.length}`}><span style={{ width: `${((tourIndex + 1) / steps.length) * 100}%` }} /></div>}
        <div className="onboarding-actions">
          <button type="button" className="onboarding-skip" onClick={isContext ? closeContextTip : closeTour}>{isContext ? 'J’ai compris' : 'Passer le guide'}</button>
          {!isContext && <button type="button" className="onboarding-primary" onClick={nextTour}>{tourIndex === steps.length - 1 ? 'Commencer' : 'Suivant'}</button>}
          {isContext && contextTip === 'publish' && <button type="button" className="onboarding-primary" onClick={() => { closeContextTip(); navigate('/properties/create'); }}>Continuer</button>}
          {isContext && contextTip === 'published' && <button type="button" className="onboarding-primary" onClick={() => { closeContextTip(); navigate('/dashboard/bailleur'); }}>Voir mes outils</button>}
        </div>
        {!isContext && <small className="onboarding-footnote">Vous pourrez revoir ces conseils depuis la rubrique Aide.</small>}
      </div>
    </div>
  );
}
