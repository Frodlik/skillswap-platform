// react-i18next bootstrap. Imported once from main.jsx so every component
// down the tree can call useTranslation() / t().
//
// HOW IT WORKS
// ────────────
// 1. We register two language bundles: `en` (default) and `uk`.
// 2. LanguageDetector picks the initial language by looking at, in order:
//      a. localStorage key `skillswap-lang` (so the user's pick survives reloads)
//      b. <html lang="..."> attribute
//      c. navigator.language (browser preference)
//    If none match a known language, fallback is `en`.
// 3. The chosen language is persisted to localStorage on every change so
//    the next visit starts where the user left off.
//
// HOW TO USE in components:
//    import { useTranslation } from 'react-i18next';
//    function MyComponent() {
//      const { t } = useTranslation();
//      return <h1>{t('login.title')}</h1>;
//    }
//
// HOW TO ADD A STRING:
//    1. Add the key to both en.json and uk.json under the right namespace
//    2. Use t('namespace.key') in the component
//    3. For interpolation: t('foo.bar', { name: 'Alice' }) — JSON: "Hello {{name}}"

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import uk from './uk.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      uk: { translation: uk },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'uk'],
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    detection: {
      order: ['localStorage', 'htmlTag', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'skillswap-lang',
    },
  });

export default i18n;
