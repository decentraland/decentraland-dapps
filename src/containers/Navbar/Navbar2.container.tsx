import { connect } from 'react-redux'
import {
  isConnected,
  isConnecting,
  getAddress,
  getChainId,
  getAppChainId,
  getManaBalances,
  isSwitchingNetwork,
  isDisconnecting
} from '../../modules/wallet/selectors'
import { getData as getProfiles } from '../../modules/profile/selectors'
import { getError as getWalletError } from '../../modules/wallet/selectors'
import { getLocale } from '../../modules/translation/selectors'
import {
  disconnectWalletRequest,
  switchNetworkRequest
} from '../../modules/wallet/actions'
import { RootDispatch } from '../../types'
import { NavbarProps2, MapStateProps, MapDispatchProps } from './Navbar.types'
import Navbar2 from './Navbar2'
import { ChainId } from '@dcl/schemas'

const mapState = (state: any): MapStateProps => {
  const address = getAddress(state)
  const profile = address ? getProfiles(state)[address] : undefined
  return {
    avatar: profile ? profile.avatars[0] : undefined,
    chainId: getChainId(state),
    manaBalances: getManaBalances(state),
    address: getAddress(state),
    locale: getLocale(state),
    isSignedIn: isConnected(state),
    isDisconnecting: isDisconnecting(state),
    isSigningIn: isConnecting(state),
    appChainId: getAppChainId(state),
    isSwitchingNetwork: isSwitchingNetwork(state),
    walletError: getWalletError(state)
  }
}

const mapDispatch = (dispatch: RootDispatch): MapDispatchProps => ({
  onSwitchNetwork: (chainId: ChainId, fromChainId: ChainId) =>
    dispatch(switchNetworkRequest(chainId, fromChainId)),
  onSignOut: () => dispatch(disconnectWalletRequest())
})

const mergeProps = (
  stateProps: MapStateProps,
  dispatchProps: MapDispatchProps,
  ownProps: NavbarProps2
): NavbarProps2 => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps
})

export default connect(mapState, mapDispatch, mergeProps)(Navbar2) as any
