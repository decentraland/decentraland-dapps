import { Locale, TranslationKeys } from './types';
import { getPreferredLocale } from './utils';

export function isLoading({ translation }: any) {
  return translation.status === 'loading';
}

export function mapLocale({ translation }: any, locales: Locale[]) {
  return translation.locale || getPreferredLocale(locales) || locales[0];
}

export function selectLocale(
  state: any,
  locales: Locale[],
): Locale | undefined {
  return !isLoading(state) ? mapLocale(state, locales) : undefined;
}

export function selectTranslations(
  state: any,
  locales: Locale[],
): {
  locale?: Locale;
  translations?: TranslationKeys;
} {
  const { translation } = state;
  const locale = selectLocale(state, locales);
  if (locale) {
    const translationsInState = translation.value[locale] || undefined;
    return { locale, translations: translationsInState };
  }

  return { locale };
}
