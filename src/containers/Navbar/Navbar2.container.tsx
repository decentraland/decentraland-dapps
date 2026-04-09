import { connect } from 'react-redux'
import { ChainId } from '@dcl/schemas'
import { getCredits } from '../../modules/credits/selectors'
import { getData as getProfiles } from '../../modules/profile/selectors'
import { getLocale } from '../../modules/translation/selectors'
import { disconnectWalletRequest, switchNetworkRequest } from '../../modules/wallet/actions'
import {
  getAddress,
  getAppChainId,
  getChainId,
  getManaBalances,
  getError as getWalletError,
  isConnected,
  isConnecting,
  isSwitchingNetwork
} from '../../modules/wallet/selectors'
import { RootDispatch } from '../../types'
import Navbar2 from './Navbar2'
import { MapDispatchProps, MapStateProps } from './Navbar.types'

const mapState = (state: any): MapStateProps => {
  const address = getAddress(state)
  const profile = address ? getProfiles(state)[address] : undefined
  return {
    avatar: profile ? profile.avatars[0] : undefined,
    chainId: getChainId(state),
    manaBalances: getManaBalances(state),
    credits: address ? getCredits(state, address) : null,
    address: getAddress(state),
    locale: getLocale(state),
    isSignedIn: isConnected(state),
    isSigningIn: isConnecting(state),
    appChainId: getAppChainId(state),
    isSwitchingNetwork: isSwitchingNetwork(state),
    walletError: getWalletError(state)
  }
}

const mapDispatch = (dispatch: RootDispatch): MapDispatchProps => ({
  onSwitchNetwork: (chainId: ChainId, fromChainId: ChainId) => dispatch(switchNetworkRequest(chainId, fromChainId)),
  onSignOut: () => dispatch(disconnectWalletRequest())
})

export default connect(mapState, mapDispatch)(Navbar2)
