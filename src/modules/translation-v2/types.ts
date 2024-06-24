export type Locale = 'en' | 'es' | 'zh';

export type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface TranslationKeys {
  [key: string]: string;
}

export interface Translation {
  [locale: string]: TranslationKeys | null;
}

export type TranslationState = {
  value: Translation;
  locale: Locale;
  status: Status;
  error: string | null;
};

export type TranslationFetcherOpts = {
  getTranslation?: (locale: string) => Promise<Translation>;
  translations?: { [locale: string]: Translation };
};
