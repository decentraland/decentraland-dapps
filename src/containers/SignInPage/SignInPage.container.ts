import { connect } from 'react-redux'
import { localStorageGetIdentity } from '@dcl/single-sign-on-client'
import { openModal } from '../../modules/modal/actions'
import { isEnabled } from '../../modules/translation/selectors'
import {
  getError,
  getData as getWallet,
  isConnected,
  isConnecting,
} from '../../modules/wallet/selectors'
import SignInPage from './SignInPage'
import {
  MapDispatch,
  MapDispatchProps,
  MapStateProps,
  SignInPageProps,
} from './SignInPage.types'

const mapState = (state: any): MapStateProps => {
  const wallet = getWallet(state)
  const identity = wallet ? localStorageGetIdentity(wallet?.address) : null
  return {
    isConnecting: isConnecting(state),
    isConnected: isConnected(state) && !!identity,
    hasError: !!getError(state),
    hasTranslations: isEnabled(state),
  }
}

const mapDispatch = (
  dispatch: MapDispatch,
  ownProps: SignInPageProps,
): MapDispatchProps => ({
  onConnect: ownProps.onConnect
    ? ownProps.onConnect
    : () =>
        dispatch(
          openModal('LoginModal', { onConnect: ownProps.handleLoginConnect }),
        ),
})

const mergeProps = (
  stateProps: MapStateProps,
  dispatchProps: MapDispatchProps,
  ownProps: SignInPageProps,
): SignInPageProps => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps,
})

export default connect(mapState, mapDispatch, mergeProps)(SignInPage) as any
