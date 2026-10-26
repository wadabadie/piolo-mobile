import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import fr from './locales/fr.json';
import en from './locales/en.json';

const resources = {
  fr: { translation: fr },
  en: { translation: en }
};

const savedLang = typeof window !== 'undefined' ? localStorage.getItem('piolo_lang') : 'fr';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    lng: savedLang || 'fr',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'piolo_lang',
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  });

// Écoute des changements de langue pour mettre à jour l'attribut HTML lang
if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language || 'fr';
  i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
    try {
      localStorage.setItem('piolo_lang', lng);
    } catch {}
  });
}

export default i18n;
