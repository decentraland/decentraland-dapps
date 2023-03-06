import { connect } from 'react-redux'
import {
  isConnected,
  isConnecting,
  getAddress,
  getMana,
  getChainId,
  getAppChainId
} from '../../modules/wallet/selectors'
import { isEnabled } from '../../modules/translation/selectors'
import {
  disconnectWallet,
  switchNetworkRequest
} from '../../modules/wallet/actions'
import { RootDispatch } from '../../types'
import { NavbarProps, MapStateProps, MapDispatchProps } from './Navbar.types'
import Navbar from './Navbar'

const mapState = (state: any): MapStateProps => ({
  chainId: getChainId(state),
  mana: getMana(state),
  address: getAddress(state),
  isConnected: isConnected(state),
  isConnecting: isConnecting(state),
  hasTranslations: isEnabled(state),
  appChainId: getAppChainId(state)
})

const mapDispatch = (dispatch: RootDispatch): MapDispatchProps => ({
  onSwitchNetwork: chainId => dispatch(switchNetworkRequest(chainId)),
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
