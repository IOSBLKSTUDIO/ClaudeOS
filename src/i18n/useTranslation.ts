import { useSettingsStore } from '../stores/settingsStore';
import { translations, type Language } from './translations';

// Create a type for the translation structure (using 'fr' as base)
type Translations = typeof translations.fr;

export function useTranslation() {
  const language = useSettingsStore((s) => s.language);
  const t = translations[language] as Translations;

  return {
    t,
    language,
  };
}

export function getTranslation(language: Language): Translations {
  return translations[language] as Translations;
}

export type { Language };
export type TranslationKeys = Translations;
