export interface Translation {
  [locale: string]: TranslationKeys | null
}
export interface TranslationKeys {
  [key: string]: string
}
