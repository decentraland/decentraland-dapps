import { connect } from 'react-redux'
import { ChainId } from '@dcl/schemas'
import {
  isConnected,
  isConnecting,
  getAddress,
  getChainId,
  getAppChainId,
  getManaBalances,
  isSwitchingNetwork,
  isDisconnecting
} from '../../modules/wallet/selectors'
import { getData as getProfiles } from '../../modules/profile/selectors'
import { getError as getWalletError } from '../../modules/wallet/selectors'
import { getLocale } from '../../modules/translation/selectors'
import {
  disconnectWalletRequest,
  switchNetworkRequest
} from '../../modules/wallet/actions'
import { getCredits } from '../../modules/credits/selectors'
import {
  getIsFeatureEnabled,
  getLauncherLinksVariant
} from '../../modules/features/selectors'
import { RootDispatch } from '../../types'
import { NavbarProps2, MapStateProps, MapDispatchProps } from './Navbar.types'
import Navbar2 from './Navbar2'
import { ApplicationName, FeatureName } from '../../modules/features'

const mapState = (state: any): MapStateProps => {
  const address = getAddress(state)
  const profile = address ? getProfiles(state)[address] : undefined
  return {
    avatar: profile ? profile.avatars[0] : undefined,
    chainId: getChainId(state),
    manaBalances: getManaBalances(state),
    credits: address ? getCredits(state, address) : null,
    address: getAddress(state),
    locale: getLocale(state),
    isSignedIn: isConnected(state),
    isDisconnecting: isDisconnecting(state),
    isSigningIn: isConnecting(state),
    appChainId: getAppChainId(state),
    isSwitchingNetwork: isSwitchingNetwork(state),
    walletError: getWalletError(state),
    cdnLinks: getLauncherLinksVariant(state),
    shouldDownloadBeforeRedirect: !getIsFeatureEnabled(
      state,
      ApplicationName.DAPPS,
      FeatureName.DOWNLOAD_IN_SUCCESS_PAGE
    )
  }
}

const mapDispatch = (dispatch: RootDispatch): MapDispatchProps => ({
  onSwitchNetwork: (chainId: ChainId, fromChainId: ChainId) =>
    dispatch(switchNetworkRequest(chainId, fromChainId)),
  onSignOut: () => dispatch(disconnectWalletRequest())
})

const mergeProps = (
  stateProps: MapStateProps,
  dispatchProps: MapDispatchProps,
  ownProps: NavbarProps2
): NavbarProps2 => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps
})

export default connect(mapState, mapDispatch, mergeProps)(Navbar2) as any
