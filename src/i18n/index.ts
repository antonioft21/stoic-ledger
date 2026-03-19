import { en } from './en';
import { es } from './es';

export type Lang = 'en' | 'es';

const translations = { en, es };

export function useTranslations(lang: Lang) {
  return translations[lang];
}

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang === 'es') return 'es';
  return 'en';
}

export function getLocalizedPath(path: string, lang: Lang): string {
  if (lang === 'es') return `/es${path}`;
  return path;
}
