import { connect } from 'react-redux'
import { Network } from '@dcl/schemas'
import { isPending } from '../../modules/transaction/utils'
import {
  getAddress,
  getNetworks,
  isConnected,
  isConnecting
} from '../../modules/wallet/selectors'
import { disconnectWallet } from '../../modules/wallet/actions'
import { getData as getProfiles } from '../../modules/profile/selectors'
import { isEnabled } from '../../modules/translation/selectors'
import { getTransactions } from '../../modules/transaction/selectors'
import {
  MapStateProps,
  MapDispatch,
  MapDispatchProps,
  Props,
  OwnProps
} from './UserMenu.types'
import UserMenu from './UserMenu'

const mapState = (state: any): MapStateProps => {
  const isSignedIn = isConnected(state)
  const address = getAddress(state)
  const profile = getProfiles(state)[address!]
  const networks = getNetworks(state)

  const manaBalances: Props['manaBalances'] = {}
  if (isSignedIn) {
    const networkList = Object.values(Network) as Network[]
    for (const network of networkList) {
      const networkData = networks![network]
      if (networkData) {
        manaBalances[network] = networks![network].mana
      }
    }
  }

  return {
    address,
    manaBalances,
    avatar: profile ? profile.avatars[0] : undefined,
    isSignedIn,
    isSigningIn: isConnecting(state),
    hasActivity: getTransactions(state, address || '').some(tx =>
      isPending(tx.status)
    ),
    hasTranslations: isEnabled(state)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSignOut: () => dispatch(disconnectWallet())
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
