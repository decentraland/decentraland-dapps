import { connect } from 'react-redux'

import Navbar from './Navbar'
import { NavbarProps, MapStateProps, MapDispatchProps } from './Navbar.types'
import {
  isConnected,
  isConnecting,
  getMana,
  getAddress
} from '../../modules/wallet/selectors'
import { isEnabled } from '../../modules/translation/selectors'
import { RootDispatch } from '../../types'

const mapState = (state: any): MapStateProps => {
  return {
    mana: getMana(state),
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
