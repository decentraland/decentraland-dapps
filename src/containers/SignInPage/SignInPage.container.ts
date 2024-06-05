import { connect } from 'react-redux'

import { isEnabled } from '../../modules/translation/selectors'
import {
  isConnecting,
  isConnected,
  getData as getWallet,
  getError
} from '../../modules/wallet/selectors'
import {
  MapDispatchProps,
  MapStateProps,
  MapDispatch,
  SignInPageProps
} from './SignInPage.types'
import SignInPage from './SignInPage'
import { openModal } from '../../modules/modal/actions'
import { localStorageGetIdentity } from '@dcl/single-sign-on-client'

const mapState = (state: any): MapStateProps => {
  const wallet = getWallet(state)
  const identity = wallet ? localStorageGetIdentity(wallet?.address) : null
  return {
    isConnecting: isConnecting(state),
    isConnected: isConnected(state) && !!identity,
    hasError: !!getError(state),
    hasTranslations: isEnabled(state)
  }
}

const mapDispatch = (
  dispatch: MapDispatch,
  ownProps: SignInPageProps
): MapDispatchProps => ({
  onConnect: ownProps.onConnect
    ? ownProps.onConnect
    : () =>
        dispatch(
          openModal('LoginModal', { onConnect: ownProps.handleLoginConnect })
        )
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

export default connect(mapState, mapDispatch, mergeProps)(SignInPage) as any
