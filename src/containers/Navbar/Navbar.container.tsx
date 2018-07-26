import { connect } from 'react-redux'
import { goBack, RouterAction } from 'react-router-redux'
import { Navbar, NavbarProps } from 'decentraland-ui'
import { RootDispatch } from '../../types'
import {
  getData as getWallet,
  isConnected,
  isConnecting
} from '../../modules/wallet/selectors'

const mapState = (state: any): NavbarProps => {
  const wallet = getWallet(state)
  return {
    mana: wallet.mana,
    address: wallet.address,
    isConnected: isConnected(state),
    isConnecting: isConnecting(state)
  }
}

const mapDispatch = (dispatch: RootDispatch<RouterAction>) => ({
  onBack: () => dispatch(goBack())
})

const mergeProps = (
  stateProps: Partial<NavbarProps>,
  dispatchProps: Partial<NavbarProps>,
  ownProps: Partial<NavbarProps>
) => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps
})

export default connect<NavbarProps>(mapState, mapDispatch, mergeProps)(
  Navbar
) as any
