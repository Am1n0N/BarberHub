import derja from './messages/derja.json';
import fr from './messages/fr.json';

export const locales = ['derja', 'fr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'derja';

const messages: Record<Locale, typeof derja> = { derja, fr };

type NestedRecord = { [key: string]: string | NestedRecord };

function getNestedValue(obj: NestedRecord, path: string): string {
  const keys = path.split('.');
  let current: string | NestedRecord = obj;
  for (const key of keys) {
    if (typeof current === 'string') return path;
    current = current[key];
    if (current === undefined) return path;
  }
  return typeof current === 'string' ? current : path;
}

export function getMessages(locale: string) {
  const loc = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  return messages[loc];
}

export function getTranslation(locale: string) {
  const msgs = getMessages(locale) as unknown as NestedRecord;
  return function t(key: string): string {
    return getNestedValue(msgs, key);
  };
}

export function isRtl(locale: string): boolean {
  return locale === 'derja';
}
