import { LoginModalProps, LoginModalOptionType } from 'decentraland-ui'

export type Props = LoginModalProps & {
  hasTranslations?: boolean
  onConnect: (type: LoginModalOptionType) => void
}
