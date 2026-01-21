import { connect } from 'react-redux'
import { changeAccount, changeNetwork, connectWalletRequest } from '../../modules/wallet/actions'
import { getAddress, getAppChainId, getChainId, isConnected, isConnecting } from '../../modules/wallet/selectors'
import WalletProvider from './WalletProvider'
import { MapDispatch, MapDispatchProps, MapStateProps } from './WalletProvider.types'

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
