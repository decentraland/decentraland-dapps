import { connect } from 'react-redux'
import { connectWalletRequest } from '../../modules/wallet/actions'
import { RootDispatch } from '../../types'
import { MapStateProps, MapDispatchProps } from './WalletProvider.types'
import WalletProvider from './WalletProvider'

const mapState = (_: any): MapStateProps => ({})

const mapDispatch = (dispatch: RootDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(connectWalletRequest())
})

export default connect(
  mapState,
  mapDispatch
)(WalletProvider) as any
