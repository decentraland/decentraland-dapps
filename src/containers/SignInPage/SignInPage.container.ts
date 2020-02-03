import { connect } from 'react-redux'

import SignInPage from './SignInPage'
import {
  MapDispatchProps,
  MapStateProps,
  SignInPageProps,
  SignInPageState
} from './SignInPage.types'
import { RootDispatch } from '../../types'
import { isEnabled } from '../../modules/translation/selectors'
import { enableWalletRequest } from '../../modules/wallet/actions'
import {
  isConnecting,
  isConnected,
  getError
} from '../../modules/wallet/selectors'

const mapState = (state: any): MapStateProps => ({
  isConnecting: isConnecting(state),
  isConnected: isConnected(state),
  hasError: !!getError(state),
  hasTranslations: isEnabled(state)
})

const mapDispatch = (dispatch: RootDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(enableWalletRequest())
})

export default connect<
  MapStateProps,
  MapDispatchProps,
  SignInPageProps,
  SignInPageState
>(
  mapState,
  mapDispatch
)(SignInPage) as any
