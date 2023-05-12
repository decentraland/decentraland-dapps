import { RootStateOrAny, connect } from 'react-redux'
import React, { ComponentProps, useCallback, useState } from 'react'
import { BigNumber, ethers } from 'ethers'
import {
  Authorization,
  AuthorizationType
} from '../../modules/authorization/types'
import {
  getERC20ContractInstance,
  getERC721ContractInstance
} from '../../modules/authorization/utils'
import { getNetworkProvider } from '../../lib/eth'
import { getAddress } from '../../modules/wallet/selectors'
import {
  AuthorizationModal,
  AuthorizationStepStatus,
  AuthorizedAction
} from './AuthorizationModal'
import {
  WithAuthorizedActionProps,
  MapStateProps,
  AuthorizeActionOptions
} from './withAuthorizedAction.types'

const mapState = (state: RootStateOrAny): MapStateProps => ({
  address: getAddress(state)
})

export default function withAuthorizedAction<
  P extends WithAuthorizedActionProps
>(
  WrappedComponent: React.ComponentType<P>,
  action: AuthorizedAction,
  getConfirmationStatus?: (state: RootStateOrAny) => AuthorizationStepStatus,
  getConfirmationError?: (state: RootStateOrAny) => string | null
): React.ComponentType<Omit<P, keyof WithAuthorizedActionProps>> {
  // TODO: Remove any type
  const WithAutorizedActionComponent = (props: MapStateProps & any) => {
    const [showAuthorizationModal, setShowAuthorizationModal] = useState(false)
    const [authModalData, setAuthModalData] = useState<
      Omit<ComponentProps<typeof AuthorizationModal>, 'onClose'>
    >()
    const [isLoadingAuthorization, setIsLoadingAuthorization] = useState(false)
    const { address } = props

    const handleAuthorizedAction = useCallback(
      async (authorizeOptions: AuthorizeActionOptions) => {
        if (!address) {
          return
        }

        setIsLoadingAuthorization(true)

        const {
          authorizationType,
          targetContract,
          authorizedAddress,
          targetContractName,
          authorizedContractLabel,
          onAuthorized
        } = authorizeOptions

        const networkProvider = await getNetworkProvider(targetContract.chainId)
        const provider = new ethers.providers.Web3Provider(networkProvider)

        const authorization: Authorization = {
          type: authorizationType,
          address,
          authorizedAddress,
          contractAddress: targetContract.address,
          chainId: targetContract.chainId,
          contractName: targetContractName
        } as Authorization

        try {
          if (authorizationType === AuthorizationType.ALLOWANCE) {
            const { requiredAllowanceInWei } = authorizeOptions
            if (BigNumber.from(requiredAllowanceInWei).isZero()) {
              onAuthorized()
              setIsLoadingAuthorization(false)
              return
            }

            const contract = getERC20ContractInstance(
              targetContract.address,
              provider
            )
            const allowance: BigNumber = await contract.allowance(
              address,
              authorizedAddress
            )

            if (allowance.gte(BigNumber.from(requiredAllowanceInWei))) {
              onAuthorized()
              setIsLoadingAuthorization(false)
              return
            }

            setAuthModalData({
              authorization,
              authorizedContractLabel,
              currentAllowance: allowance,
              requiredAllowance: BigNumber.from(requiredAllowanceInWei),
              authorizationType: authorizationType,
              action,
              network: targetContract.network,
              onAuthorized,
              getConfirmationStatus,
              getConfirmationError
            })
          } else {
            const contract = getERC721ContractInstance(
              targetContract.address,
              provider
            )
            const isApprovedForAll = await contract.isApprovedForAll(
              address,
              authorizedAddress
            )

            if (isApprovedForAll) {
              onAuthorized()
              setIsLoadingAuthorization(false)
              return
            }

            setAuthModalData({
              authorization,
              authorizationType: authorizationType,
              action,
              network: targetContract.network,
              authorizedContractLabel,
              onAuthorized,
              getConfirmationStatus,
              getConfirmationError
            })
          }
          setShowAuthorizationModal(true)
        } catch (error) {
          // TODO: handle error scenario
          console.error(error)
        }
      },
      [address]
    )

    const handleClose = useCallback(() => {
      setIsLoadingAuthorization(false)
      setShowAuthorizationModal(false)
    }, [])

    return (
      <>
        <WrappedComponent
          {...props}
          onAuthorizedAction={handleAuthorizedAction}
          isLoadingAuthorization={isLoadingAuthorization}
        />
        {showAuthorizationModal && authModalData ? (
          <AuthorizationModal onClose={handleClose} {...authModalData} />
        ) : null}
      </>
    )
  }
  return connect(mapState)(WithAutorizedActionComponent)
}
