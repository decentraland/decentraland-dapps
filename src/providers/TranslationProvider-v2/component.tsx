import React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Props } from './types';
import { I18nProvider } from '../../modules/translation-v2/utils';
import { selectTranslations } from '../../modules/translation-v2/selectors';
import { Locale } from '../../modules/translation-v2/types';

export function TranslationProvider({
  children,
  locales,
  fetchTranslations,
}: Props) {
  const dispatch = useDispatch();
  const { locale, translations } = useSelector((state) =>
    selectTranslations(state, locales),
  );
  const [_locale, setLocale] = useState<Locale | undefined>();

  useEffect(() => {
    if (locale && _locale !== locale) {
      dispatch(fetchTranslations(locale));
      setLocale(locale);
    }
  }, [locale, fetchTranslations]);

  return translations && locale ? (
    <I18nProvider key={locale} locale={locale} messages={translations}>
      {children}
    </I18nProvider>
  ) : (
    null
  );
}
