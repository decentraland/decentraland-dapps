import { FooterProps as FooterComponentProps } from 'decentraland-ui'

export type FooterProps = FooterComponentProps & {
  hasTranslations?: boolean
}

export type MapStateProps = Pick<FooterProps, 'locale' | 'hasTranslations'>

export type MapDispatchProps = Pick<FooterProps, 'onChange'>
