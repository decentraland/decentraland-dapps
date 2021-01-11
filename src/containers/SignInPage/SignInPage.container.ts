import { connect } from 'react-redux'

import SignInPage from './SignInPage'
import {
  MapDispatchProps,
  MapStateProps,
  SignInPageProps
} from './SignInPage.types'
import { RootDispatch } from '../../types'
import { isEnabled } from '../../modules/translation/selectors'
import { isConnecting, isConnected } from '../../modules/wallet/selectors'

const mapState = (state: any): MapStateProps => ({
  isConnecting: isConnecting(state),
  isConnected: isConnected(state),
  hasTranslations: isEnabled(state)
})

const mapDispatch = (_dispatch: RootDispatch): MapDispatchProps => ({
  onConnect: () => {}
})

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
