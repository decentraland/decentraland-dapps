export interface Translation {
  [locale: string]: TranslationKeys | null
}
export interface TranslationKeys {
  [key: string]: string
}

export type TranslationSagaOptions = {
  getTranslation?: (locale: string) => Promise<Translation>
  translations?: { [locale: string]: Translation }
}
