import { connect } from 'react-redux'
import {
  connectWalletRequest,
  ConnectWalletRequestAction
} from '../../modules/wallet/actions'
import { WalletProviderProps } from './types'
import WalletProvider from './WalletProvider'
import { RootDispatch } from '../../types'

const mapState = (_: any, ownProps: WalletProviderProps): WalletProviderProps =>
  ownProps

const mapDispatch = (dispatch: RootDispatch<ConnectWalletRequestAction>) => ({
  onConnect: () => dispatch(connectWalletRequest())
})

export default connect<WalletProviderProps>(mapState, mapDispatch)(
  WalletProvider as any
) as any
