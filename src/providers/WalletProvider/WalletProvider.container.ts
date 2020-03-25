import { connect } from 'react-redux'
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

const mapState = (_: any): MapStateProps => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(connectWalletRequest()),
  onChangeAccount: address => dispatch(changeAccount(address)),
  onChangeNetwork: network => dispatch(changeNetwork(network))
})

export default connect(
  mapState,
  mapDispatch
)(WalletProvider) as any
