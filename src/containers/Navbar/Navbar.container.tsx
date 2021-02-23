import { connect } from 'react-redux'
import { Network } from 'decentraland-ui'
import {
  isConnected,
  isConnecting,
  getAddress,
  getNetworks
} from '../../modules/wallet/selectors'
import { isEnabled } from '../../modules/translation/selectors'
import { RootDispatch } from '../../types'
import { NavbarProps, MapStateProps, MapDispatchProps } from './Navbar.types'
import Navbar from './Navbar'

const mapState = (state: any): MapStateProps => {
  const networks = getNetworks(state)
  let mana: number | undefined
  // We're hardcoding the network here for now. The prop will be deprecated soon and replaced for UserMenu's implementation
  if (networks) {
    mana = networks[Network.ETHEREUM].mana
  }

  return {
    mana,
    address: getAddress(state),
    isConnected: isConnected(state),
    isConnecting: isConnecting(state),
    hasTranslations: isEnabled(state)
  }
}

const mapDispatch = (_dispatch: RootDispatch): MapDispatchProps => ({})

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
