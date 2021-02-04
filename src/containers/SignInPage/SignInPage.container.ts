import { connect } from 'react-redux'

import { isEnabled } from '../../modules/translation/selectors'
import {
  isConnecting,
  isConnected,
  getError
} from '../../modules/wallet/selectors'
import {
  MapDispatchProps,
  MapStateProps,
  MapDispatch,
  SignInPageProps
} from './SignInPage.types'
import SignInPage from './SignInPage'

const mapState = (state: any): MapStateProps => ({
  isConnecting: isConnecting(state),
  isConnected: isConnected(state),
  hasError: !!getError(state),
  hasTranslations: isEnabled(state)
})

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

const mergeProps = (
  stateProps: MapStateProps,
  dispatchProps: MapDispatchProps,
  ownProps: SignInPageProps
): SignInPageProps => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps
})

export default connect(
  mapState,
  mapDispatch,
  mergeProps
)(SignInPage) as any
