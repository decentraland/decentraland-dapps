import { connect } from 'react-redux'
import { injectIntl, InjectedIntl } from 'react-intl'
import { setI18n } from '../../../modules/translation/utils'
import { MapStateProps, MapDispatchProps } from './TranslationSetup.types'

import TranslationSetup from './TranslationSetup'

const mapState = (_: any): MapStateProps => ({})

const mapDispatch = (): MapDispatchProps => ({
  setI18n: (intl: InjectedIntl) => setI18n(intl)
})

export default injectIntl<any>(
  connect(
    mapState,
    mapDispatch
  )(TranslationSetup)
) as any
