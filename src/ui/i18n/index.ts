// Módulo i18n de Lumina — helper t() y estado de idioma
import { es } from './es';
import { en } from './en';

/** Idiomas soportados */
export type Lang = 'es' | 'en';

/** Claves de traducción (inferidas del diccionario ES) */
export type TranslationKey = keyof typeof es;

// Estado de idioma (por defecto ES)
let _lang: Lang = 'es';

const diccionarios: Record<Lang, Record<TranslationKey, string>> = { es, en };

/**
 * Devuelve la cadena traducida para la clave dada en el idioma activo.
 */
export function t(key: TranslationKey): string {
  return diccionarios[_lang][key];
}

/** Establece el idioma activo. */
export function setLang(lang: Lang): void {
  _lang = lang;
}

/** Devuelve el idioma activo. */
export function getLang(): Lang {
  return _lang;
}
