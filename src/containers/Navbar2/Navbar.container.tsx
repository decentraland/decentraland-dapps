import { connect } from 'react-redux'
import {
  isConnected,
  isConnecting,
  getAddress,
  getChainId,
  getAppChainId,
  getManaBalances,
  isSwitchingNetwork
} from '../../modules/wallet/selectors'
import { isEnabled } from '../../modules/translation/selectors'
import {
  disconnectWallet,
  switchNetworkRequest
} from '../../modules/wallet/actions'
import { RootDispatch } from '../../types'
import { NavbarProps, MapStateProps, MapDispatchProps } from './Navbar.types'
import Navbar from './Navbar'

const mapState = (state: any): MapStateProps => {
  return {
    chainId: getChainId(state),
    manaBalances: getManaBalances(state),
    address: getAddress(state),
    isSignedIn: isConnected(state),
    isSigningIn: isConnecting(state),
    hasTranslations: isEnabled(state),
    appChainId: getAppChainId(state),
    isSwitchingNetwork: isSwitchingNetwork(state)
  }
}

const mapDispatch = (dispatch: RootDispatch): MapDispatchProps => ({
  onSwitchNetwork: chainId => dispatch(switchNetworkRequest(chainId)),
  onSignOut: () => dispatch(disconnectWallet())
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

export default connect(mapState, mapDispatch, mergeProps)(Navbar) as any
