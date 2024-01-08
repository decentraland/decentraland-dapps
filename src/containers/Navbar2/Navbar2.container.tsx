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
import {
  disconnectWallet,
  switchNetworkRequest
} from '../../modules/wallet/actions'
import { RootDispatch } from '../../types'
import { Navbar2Props, MapStateProps, MapDispatchProps } from './Navbar2.types'
import Navbar2 from './Navbar2'

const mapState = (state: any): MapStateProps => {
  return {
    chainId: getChainId(state),
    manaBalances: getManaBalances(state),
    address: getAddress(state),
    isSignedIn: isConnected(state),
    isSigningIn: isConnecting(state),
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
  ownProps: Navbar2Props
): Navbar2Props => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps
})

export default connect(mapState, mapDispatch, mergeProps)(Navbar2) as any
