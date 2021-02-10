import { connect } from 'react-redux'
import { isPending } from '../../modules/transaction/utils'
import {
  getAddress,
  getMana,
  isConnected,
  isConnecting,
  getManaL2
} from '../../modules/wallet/selectors'
import {
  connectWalletRequest,
  disconnectWallet
} from '../../modules/wallet/actions'
import { getData as getProfiles } from '../../modules/profile/selectors'
import { isEnabled } from '../../modules/translation/selectors'
import { getTransactions } from '../../modules/transaction/selectors'
import {
  MapStateProps,
  MapDispatch,
  MapDispatchProps,
  OwnProps
} from './UserMenu.types'
import UserMenu from './UserMenu'

const mapState = (state: any): MapStateProps => {
  const address = getAddress(state)
  const profile = getProfiles(state)[address!]
  return {
    address,
    mana: getMana(state),
    manaL2: getManaL2(state),
    avatar: profile ? profile.avatars[0] : undefined,
    isSignedIn: isConnected(state),
    isSigningIn: isConnecting(state),
    hasActivity: getTransactions(state, address || '').some(tx =>
      isPending(tx.status)
    ),
    hasTranslations: isEnabled(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSignIn: () => dispatch(disconnectWallet()),
  onSignOut: () => dispatch(connectWalletRequest())
})

const mergeProps = (
  mapStateProps: MapStateProps,
  mapDispatchProps: MapDispatchProps,
  ownProps: OwnProps
) => ({
  ...mapStateProps,
  ...mapDispatchProps,
  ...ownProps
})

export default connect(
  mapState,
  mapDispatch,
  mergeProps
)(UserMenu)
