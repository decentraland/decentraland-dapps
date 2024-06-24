import { ReactNode } from 'react';

import { Locale } from '../../modules/translation-v2/types';
import { createTranslationFetcher } from '../../modules/translation-v2/slice';

export type Props = {
  fetchTranslations: (
    locale: Locale,
  ) => ReturnType<ReturnType<typeof createTranslationFetcher>>;
  locales: Locale[];
  children?: ReactNode;
};
