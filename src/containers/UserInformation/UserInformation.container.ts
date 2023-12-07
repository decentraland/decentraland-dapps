import { connect } from 'react-redux'
import { Network } from '@dcl/schemas/dist/dapps/network'
import { isPending } from '../../modules/transaction/utils'
import {
  getAddress,
  getNetworks,
  isConnected,
  isConnecting
} from '../../modules/wallet/selectors'
import { disconnectWallet } from '../../modules/wallet/actions'
import { getData as getProfiles } from '../../modules/profile/selectors'
import { getLocale, isEnabled } from '../../modules/translation/selectors'
import {
  getTransactions,
  getState as getTransactionsState
} from '../../modules/transaction/selectors'
import {
  MapStateProps,
  MapDispatch,
  MapDispatchProps,
  UserInformationProps,
  OwnProps
} from './UserInformation.types'
import { UserInformation } from './UserInformation'

const mapState = (state: any): MapStateProps => {
  const isSignedIn = isConnected(state)
  const address = getAddress(state)
  const profile = getProfiles(state)[address!]
  const networks = getNetworks(state)
  const transactionsState = getTransactionsState(state)

  const manaBalances: UserInformationProps['manaBalances'] = {}
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
    locale: getLocale(state),
    avatar: profile ? profile.avatars[0] : undefined,
    isSignedIn,
    isSigningIn: isConnecting(state),
    hasActivity: transactionsState
      ? getTransactions(state, address || '').some(tx => isPending(tx.status))
      : false,
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

export default connect(mapState, mapDispatch, mergeProps)(UserInformation)
