import { connect } from "react-redux";
import { ChainId } from "@dcl/schemas";
import { getCredits } from "../../modules/credits/selectors";
import { ApplicationName, FeatureName } from "../../modules/features";
import {
  getIsFeatureEnabled,
  getLauncherLinksVariant,
} from "../../modules/features/selectors";
import { getData as getProfiles } from "../../modules/profile/selectors";
import { getLocale } from "../../modules/translation/selectors";
import {
  disconnectWalletRequest,
  switchNetworkRequest,
} from "../../modules/wallet/actions";
import {
  getAddress,
  getAppChainId,
  getChainId,
  getManaBalances,
  getError as getWalletError,
  isConnected,
  isConnecting,
  isDisconnecting,
  isSwitchingNetwork,
} from "../../modules/wallet/selectors";
import { RootDispatch } from "../../types";
import Navbar2 from "./Navbar2";
import { MapDispatchProps, MapStateProps, NavbarProps2 } from "./Navbar.types";

const mapState = (state: any): MapStateProps => {
  const address = getAddress(state);
  const profile = address ? getProfiles(state)[address] : undefined;
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
      FeatureName.DOWNLOAD_IN_SUCCESS_PAGE,
    ),
  };
};

const mapDispatch = (dispatch: RootDispatch): MapDispatchProps => ({
  onSwitchNetwork: (chainId: ChainId, fromChainId: ChainId) =>
    dispatch(switchNetworkRequest(chainId, fromChainId)),
  onSignOut: () => dispatch(disconnectWalletRequest()),
});

const mergeProps = (
  stateProps: MapStateProps,
  dispatchProps: MapDispatchProps,
  ownProps: NavbarProps2,
): NavbarProps2 => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps,
});

export default connect(mapState, mapDispatch, mergeProps)(Navbar2) as any;
