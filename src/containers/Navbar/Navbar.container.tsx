import { connect } from 'react-redux'
import { RouterAction } from 'react-router-redux'

import Navbar from './Navbar'
import { NavbarProps, MapStateProps, MapDispatchProps } from './Navbar.types'
import {
  getData as getWallet,
  isConnected,
  isConnecting
} from '../../modules/wallet/selectors'
import { isEnabled } from '../../modules/translation/selectors'
import { connectWalletRequest } from '../../modules/wallet/actions'
import { RootDispatch } from '../../types'

const mapState = (state: any): MapStateProps => {
  const wallet = getWallet(state)
  return {
    mana: wallet.mana,
    address: wallet.address,
    isConnected: isConnected(state),
    isConnecting: isConnecting(state),
    hasTranslations: isEnabled(state)
  }
}

const mapDispatch = (
  dispatch: RootDispatch<RouterAction>
): MapDispatchProps => ({
  onSignIn: () => dispatch(connectWalletRequest())
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

export default connect(
  mapState,
  mapDispatch,
  mergeProps
)(Navbar) as any
