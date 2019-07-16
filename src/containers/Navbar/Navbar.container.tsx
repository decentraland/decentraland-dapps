import { connect } from 'react-redux'

import Navbar from './Navbar'
import { NavbarProps, MapStateProps, MapDispatchProps } from './Navbar.types'
import {
  getData as getWallet,
  isConnected,
  isConnecting
} from '../../modules/wallet/selectors'
import { isEnabled } from '../../modules/translation/selectors'
import { isSignIn } from '../../modules/location/selectors'
import {
  navigateToSignIn,
  NavigateToSignInAction
} from '../../modules/location/actions'
import { RootDispatch } from '../../types'

const mapState = (state: any): MapStateProps => {
  const wallet = getWallet(state)
  return {
    mana: wallet.mana,
    address: wallet.address,
    isConnected: isConnected(state),
    isConnecting: isConnecting(state),
    isSignIn: isSignIn(state),
    hasTranslations: isEnabled(state)
  }
}

const mapDispatch = (
  dispatch: RootDispatch<NavigateToSignInAction>
): MapDispatchProps => ({
  onSignIn: () => dispatch(navigateToSignIn())
})

const mergeProps = (
  stateProps: MapStateProps,
  dispatchProps: MapDispatchProps,
  ownProps: NavbarProps
): NavbarProps => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps
})

export default connect(
  mapState,
  mapDispatch,
  mergeProps
)(Navbar) as any
