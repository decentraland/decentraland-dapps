import { TranslationKeys } from '../../modules/translation/types'

export interface TranslationProviderProps {
  locale?: string
  translations?: TranslationKeys
  children?: React.ReactNode
  onFetchTranslations: Function
}
