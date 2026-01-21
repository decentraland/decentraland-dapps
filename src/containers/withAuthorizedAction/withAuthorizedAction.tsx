import React, { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import { BigNumber, ethers } from "ethers";
import { v4 as uuid } from "uuid";
import { getNetworkProvider } from "../../lib/eth";
import {
  authorizationFlowClear,
  authorizationFlowRequest,
} from "../../modules/authorization/actions";
import {
  getAuthorizationFlowError,
  isAuthorizing,
} from "../../modules/authorization/selectors";
import {
  Authorization,
  AuthorizationAction,
  AuthorizationType,
} from "../../modules/authorization/types";
import {
  getCollectionV2ContractInstance,
  getERC20ContractInstance,
  getERC721ContractInstance,
} from "../../modules/authorization/utils";
import { ApplicationName, FeatureName } from "../../modules/features";
import { getIsFeatureEnabled } from "../../modules/features/selectors";
import { getData as getWallet } from "../../modules/wallet/selectors";
import { isWeb2Wallet } from "../../modules/wallet/utils/providerChecks";
import { RootStateOrAny } from "../../types";
import {
  AuthorizationModal,
  OwnProps as AuthorizationModalOwnProps,
  AuthorizationStepStatus,
  AuthorizedAction,
  HandleGrantOptions,
} from "./AuthorizationModal";
import {
  AuthorizationTranslationKeys,
  AuthorizeActionOptions,
  MapDispatch,
  MapDispatchProps,
  MapStateProps,
  WithAuthorizedActionProps,
} from "./withAuthorizedAction.types";

const mapState = (state: RootStateOrAny): MapStateProps => ({
  isMagicAutoSignEnabled: getIsFeatureEnabled(
    state,
    ApplicationName.DAPPS,
    FeatureName.MAGIC_AUTO_SIGN,
  ),
  authorizationError: getAuthorizationFlowError(state),
  authorizerWallet: getWallet(state),
  isAuthorizing: isAuthorizing(state),
});

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onClearAuthorizationFlow: () => dispatch(authorizationFlowClear()),
  onRevoke: (
    traceId: string,
    authorization: Authorization,
    onAuthorized?: () => void,
  ) =>
    dispatch(
      authorizationFlowRequest(authorization, AuthorizationAction.REVOKE, {
        traceId,
        onAuthorized,
      }),
    ),
  onGrant: (
    traceId: string,
    authorization: Authorization,
    requiredAllowance?: BigNumber,
    currentAllowance?: BigNumber,
    onAuthorized?: () => void,
  ) =>
    dispatch(
      authorizationFlowRequest(authorization, AuthorizationAction.GRANT, {
        requiredAllowance: requiredAllowance?.toString(),
        currentAllowance: currentAllowance?.toString(),
        traceId,
        onAuthorized,
      }),
    ),
});

export default function withAuthorizedAction<
  P extends WithAuthorizedActionProps,
>(
  WrappedComponent: React.ComponentType<P>,
  action: AuthorizedAction,
  translationKeys: AuthorizationTranslationKeys,
  getConfirmationStatus?: (state: RootStateOrAny) => AuthorizationStepStatus,
  getConfirmationError?: (state: RootStateOrAny) => string | null,
): React.ComponentType<Omit<P, keyof WithAuthorizedActionProps>> {
  // TODO: Remove any type
  const WithAuthorizedActionComponent = (
    props: MapStateProps & MapDispatchProps & any,
  ) => {
    const {
      authorizerWallet,
      onClearAuthorizationFlow,
      onRevoke,
      onGrant,
      isMagicAutoSignEnabled,
      isAuthorizing,
      authorizationError,
      ...rest
    } = props;
    const [showAuthorizationModal, setShowAuthorizationModal] = useState(false);
    const [authModalData, setAuthModalData] =
      useState<Omit<AuthorizationModalOwnProps, "onGrant" | "onRevoke">>();
    const [isLoadingAuthorization, setIsLoadingAuthorization] = useState(false);
    const isUserLoggedInWithMagic =
      authorizerWallet && isWeb2Wallet(authorizerWallet);
    const userAddress = authorizerWallet?.address;

    // Clear the authorization flow error when the component unmounts
    useEffect(() => {
      return () => {
        onClearAuthorizationFlow();
      };
    }, [onClearAuthorizationFlow]);

    const handleRevoke = useCallback(
      (
        authorization: Authorization,
        analyticsTraceId: string,
        onAuthorized?: () => void,
      ) => {
        onRevoke(analyticsTraceId, authorization, onAuthorized);
      },
      [onRevoke],
    );

    const handleGrant = useCallback(
      (authorization: Authorization, options?: HandleGrantOptions) => {
        onGrant(
          options?.traceId ?? uuid(),
          authorization,
          options?.requiredAllowance,
          options?.currentAllowance,
          options?.onAuthorized,
        );
      },
      [onGrant],
    );

    const handleAuthorizedAction = useCallback(
      async (authorizeOptions: AuthorizeActionOptions) => {
        if (!userAddress) {
          return;
        }
        setIsLoadingAuthorization(true);

        const {
          authorizationType,
          targetContract,
          authorizedAddress,
          targetContractName,
          authorizedContractLabel,
          onAuthorized,
        } = authorizeOptions;

        const networkProvider = await getNetworkProvider(
          targetContract.chainId,
        );
        const provider = new ethers.providers.Web3Provider(networkProvider);

        const authorization: Authorization = {
          type: authorizationType,
          address: userAddress,
          authorizedAddress,
          contractAddress: targetContract.address,
          chainId: targetContract.chainId,
          contractName: targetContractName,
        } as Authorization;

        try {
          if (authorizationType === AuthorizationType.ALLOWANCE) {
            const { requiredAllowanceInWei } = authorizeOptions;
            if (BigNumber.from(requiredAllowanceInWei).isZero()) {
              onAuthorized(true);
              setIsLoadingAuthorization(false);
              return;
            }

            const contract = getERC20ContractInstance(
              targetContract.address,
              provider,
            );
            const currentAllowance: BigNumber = await contract.allowance(
              userAddress,
              authorizedAddress,
            );

            if (currentAllowance.gte(BigNumber.from(requiredAllowanceInWei))) {
              onAuthorized(true);
              setIsLoadingAuthorization(false);
              return;
            }

            if (
              isMagicAutoSignEnabled &&
              isUserLoggedInWithMagic &&
              !authorizeOptions.manual
            ) {
              handleGrant(authorization, {
                requiredAllowance: BigNumber.from(requiredAllowanceInWei),
                currentAllowance: currentAllowance,
                onAuthorized: () => onAuthorized(false),
              });
              setIsLoadingAuthorization(false);
              return;
            }

            setAuthModalData({
              translationKeys,
              authorization,
              authorizedContractLabel,
              currentAllowance,
              requiredAllowance: BigNumber.from(requiredAllowanceInWei),
              authorizationType: authorizationType,
              action,
              network: targetContract.network,
              onAuthorized: () => onAuthorized(false),
              getConfirmationStatus,
              getConfirmationError,
            });
          } else if (authorizationType === AuthorizationType.APPROVAL) {
            const contract = getERC721ContractInstance(
              targetContract.address,
              provider,
            );
            const isApprovedForAll = await contract.isApprovedForAll(
              userAddress,
              authorizedAddress,
            );

            if (isApprovedForAll) {
              onAuthorized(true);
              setIsLoadingAuthorization(false);
              return;
            }

            const { targetContractLabel } = authorizeOptions;

            if (
              isMagicAutoSignEnabled &&
              isUserLoggedInWithMagic &&
              !authorizeOptions.manual
            ) {
              handleGrant(authorization, {
                onAuthorized: () => onAuthorized(false),
              });
              setIsLoadingAuthorization(false);
              return;
            }

            setAuthModalData({
              translationKeys,
              authorization,
              authorizationType: authorizationType,
              action,
              network: targetContract.network,
              authorizedContractLabel,
              targetContractLabel,
              onAuthorized: () => onAuthorized(false),
              getConfirmationStatus,
              getConfirmationError,
            });
          } else {
            const contract = getCollectionV2ContractInstance(
              targetContract.address,
              provider,
            );
            const isMintingAllowed =
              await contract.globalMinters(authorizedAddress);

            const { targetContractLabel } = authorizeOptions;

            if (isMintingAllowed) {
              onAuthorized(true);
              setIsLoadingAuthorization(false);
              return;
            }

            if (
              isMagicAutoSignEnabled &&
              isUserLoggedInWithMagic &&
              !authorizeOptions.manual
            ) {
              handleGrant(authorization, {
                onAuthorized: () => onAuthorized(false),
              });
              setIsLoadingAuthorization(false);
              return;
            }

            setAuthModalData({
              translationKeys,
              authorization,
              authorizationType: authorizationType,
              action,
              network: targetContract.network,
              targetContractLabel: targetContractLabel,
              authorizedContractLabel,
              onAuthorized: () => onAuthorized(false),
              getConfirmationStatus,
              getConfirmationError,
            });
          }

          setShowAuthorizationModal(true);
        } catch (error) {
          // TODO: handle error scenario
          console.error(error);
        }
      },
      [
        userAddress,
        isMagicAutoSignEnabled,
        isUserLoggedInWithMagic,
        handleGrant,
        handleRevoke,
      ],
    );

    const handleClose = useCallback(() => {
      setIsLoadingAuthorization(false);
      setShowAuthorizationModal(false);
      onClearAuthorizationFlow();
    }, [onClearAuthorizationFlow]);

    return (
      <>
        <WrappedComponent
          {...rest}
          onAuthorizedAction={handleAuthorizedAction}
          onCloseAuthorization={handleClose}
          isLoadingAuthorization={isLoadingAuthorization || isAuthorizing}
          authorizationError={authorizationError}
          isMagicAutoSignEnabled={isMagicAutoSignEnabled}
          isUsingMagic={isUserLoggedInWithMagic}
        />
        {showAuthorizationModal && authModalData ? (
          <AuthorizationModal
            isWeb2AutoSigning={isMagicAutoSignEnabled}
            onGrant={handleGrant}
            onRevoke={handleRevoke}
            onClose={handleClose}
            {...authModalData}
          />
        ) : null}
      </>
    );
  };
  return connect(
    mapState,
    mapDispatch,
  )(WithAuthorizedActionComponent) as React.ComponentType<
    Omit<P, keyof WithAuthorizedActionProps>
  >;
}
