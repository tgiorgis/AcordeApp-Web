import es from './es';
import en from './en';

type Language = 'es' | 'en';

// idioma fijo por ahora
const currentLanguage: Language = 'es';

const translations = {
  es,
  en,
};

export function t(key: string): string {
  const keys = key.split('.');
  let result: any = translations[currentLanguage];

  for (const k of keys) {
    result = result?.[k];
    if (!result) return key;
  }

  return result;
}
