import { connect } from 'react-redux'
import { RouterAction } from 'react-router-redux'

import Footer from './Footer'
import { FooterProps, MapDispatchProps, MapStateProps } from './Footer.types'
import { RootDispatch } from '../../types'
import { getLocale } from '../../modules/wallet/selectors'
import { isEnabled } from '../../modules/translation/selectors'
import { changeLocale } from '../../modules/translation/actions'

const mapState = (state: any): MapStateProps => {
  return {
    locale: getLocale(state) as any,
    hasTranslations: isEnabled(state)
  }
}

const mapDispatch = (
  dispatch: RootDispatch<RouterAction>
): MapDispatchProps => ({
  onChange: (_, { value }) => dispatch(changeLocale(value as string))
})

const mergeProps = (
  stateProps: MapStateProps,
  dispatchProps: MapDispatchProps,
  ownProps: FooterProps
): FooterProps => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps
})

export default connect(
  mapState,
  mapDispatch,
  mergeProps
)(Footer) as any
