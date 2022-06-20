import { connect } from 'react-redux'
import {
  getAddress,
  getAppChainId,
  getChainId,
  isConnected,
  isConnecting
} from '../../modules/wallet/selectors'
import {
  connectWalletRequest,
  changeAccount,
  changeNetwork
} from '../../modules/wallet/actions'
import {
  MapStateProps,
  MapDispatchProps,
  MapDispatch
} from './WalletProvider.types'
import WalletProvider from './WalletProvider'

const mapState = (state: any): MapStateProps => ({
  address: getAddress(state),
  chainId: getChainId(state),
  appChainId: getAppChainId(state),
  isConnected: isConnected(state),
  isConnecting: isConnecting(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(connectWalletRequest()),
  onChangeAccount: address => dispatch(changeAccount(address)),
  onChangeNetwork: network => dispatch(changeNetwork(network))
})

export default connect(mapState, mapDispatch)(WalletProvider) as any
