import { connect } from 'react-redux'
import { ChainId } from '@dcl/schemas'
import { getData as getProfiles } from '../../modules/profile/selectors'
import { getLocale } from '../../modules/translation/selectors'
import {
  disconnectWalletRequest,
  switchNetworkRequest,
} from '../../modules/wallet/actions'
import {
  getAddress,
  getAppChainId,
  getChainId,
  getManaBalances,
  getError as getWalletError,
  isConnected,
  isConnecting,
  isDisconnecting,
  isSwitchingNetwork,
} from '../../modules/wallet/selectors'
import { RootDispatch } from '../../types'
import Navbar from './Navbar'
import { MapDispatchProps, MapStateProps, NavbarProps } from './Navbar.types'

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
    walletError: getWalletError(state),
  }
}

const mapDispatch = (dispatch: RootDispatch): MapDispatchProps => ({
  onSwitchNetwork: (chainId: ChainId, fromChainId: ChainId) =>
    dispatch(switchNetworkRequest(chainId, fromChainId)),
  onSignOut: () => dispatch(disconnectWalletRequest()),
})

const mergeProps = (
  stateProps: MapStateProps,
  dispatchProps: MapDispatchProps,
  ownProps: NavbarProps,
): NavbarProps => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps,
})

export default connect(mapState, mapDispatch, mergeProps)(Navbar) as any
