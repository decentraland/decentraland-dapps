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
import { getData as getProfiles } from '../../modules/profile/selectors'
import { getLocale } from '../../modules/translation/selectors'
import {
  disconnectWallet,
  switchNetworkRequest
} from '../../modules/wallet/actions'
import { RootDispatch } from '../../types'
import { NavbarProps, MapStateProps, MapDispatchProps } from './Navbar.types'
import Navbar from './Navbar'
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
    isSigningIn: isConnecting(state),
    appChainId: getAppChainId(state),
    isSwitchingNetwork: isSwitchingNetwork(state)
  }
}

const mapDispatch = (dispatch: RootDispatch): MapDispatchProps => ({
  onSwitchNetwork: (chainId: ChainId) => dispatch(switchNetworkRequest(chainId)),
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
