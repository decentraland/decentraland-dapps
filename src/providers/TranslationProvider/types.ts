import { TranslationKeys } from '../../modules/translation/types'

export interface TranslationProviderProps {
  locale?: string
  locales: string[]
  translations?: TranslationKeys
  children?: React.ReactNode
  onFetchTranslations: Function
}
