import { InjectedIntl } from 'react-intl'
import { setI18n } from '../../../modules/translation/utils'

export interface Props {
  intl: InjectedIntl
  setI18n: typeof setI18n
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'setI18n'>
