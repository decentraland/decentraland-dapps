import React from 'react'
import { BigNumber, ethers } from 'ethers'
import { Network } from '@dcl/schemas'
import { RootStateOrAny } from 'react-redux'
import {
  getAuthorizationFlowError,
  getError,
  getLoading
} from '../../../modules/authorization/selectors'
import {
  Authorization,
  AuthorizationAction,
  AuthorizationType
} from '../../../modules/authorization/types'
import {
  AuthorizationError,
  areEqual,
  hasAuthorization,
  hasAuthorizationAndEnoughAllowance
} from '../../../modules/authorization/utils'
import { TransactionLink } from '../..'
import { isLoadingType } from '../../../modules/loading/selectors'
import { getType } from '../../../modules/loading/utils'
import { getTransactions } from '../../../modules/transaction/selectors'
import { isPending } from '../../../modules/transaction/utils'
import { t } from '../../../modules/translation/utils'
import { getData as getAuthorizations } from '../../../modules/authorization/selectors'
import {
  AUTHORIZATION_FLOW_REQUEST,
  GRANT_TOKEN_REQUEST,
  REVOKE_TOKEN_REQUEST
} from '../../../modules/authorization/actions'
import {
  AuthorizationStepAction,
  AuthorizationStepStatus
} from './AuthorizationModal.types'

export function getStepStatus(
  state: RootStateOrAny,
  authorizationAction: AuthorizationAction,
  authorization: Authorization,
  allowance: BigNumber | undefined
): AuthorizationStepStatus {
  const actionType =
    authorizationAction === AuthorizationAction.REVOKE
      ? REVOKE_TOKEN_REQUEST
      : GRANT_TOKEN_REQUEST

  if (isLoadingType(getLoading(state), actionType)) {
    return AuthorizationStepStatus.WAITING
  }

  const pendingActionTypeTransactions = getTransactions(
    state,
    authorization.address
  ).filter(
    transaction =>
      isPending(transaction.status) &&
      getType({ type: actionType }) ===
        getType({ type: transaction.actionType }) &&
      areEqual(transaction.payload.authorization, authorization)
  )

  if (pendingActionTypeTransactions.length) {
    return AuthorizationStepStatus.PROCESSING
  }

  const error = getAuthorizationFlowError(state)

  if (error === AuthorizationError.INSUFFICIENT_ALLOWANCE) {
    return AuthorizationStepStatus.ALLOWANCE_AMOUNT_ERROR
  }

  if (error || getError(state)) {
    return AuthorizationStepStatus.ERROR
  }

  let isDone = false
  const authorizations = getAuthorizations(state)

  if (authorization.type === AuthorizationType.ALLOWANCE) {
    // If allowance is undefined, then the action is revoke
    if (!allowance) {
      isDone = !hasAuthorization(authorizations, authorization)
    } else {
      // grant action
      isDone = hasAuthorizationAndEnoughAllowance(
        authorizations,
        authorization,
        allowance.toString()
      )
    }
  } else {
    isDone = hasAuthorization(authorizations, authorization)
  }

  if (isDone) {
    return AuthorizationStepStatus.DONE
  }

  if (
    isLoadingType(getLoading(state), AUTHORIZATION_FLOW_REQUEST) &&
    getLoading(state).find(
      loadingAction =>
        loadingAction.payload?.authorizationAction === authorizationAction
    )
  ) {
    return AuthorizationStepStatus.LOADING_INFO
  }

  return AuthorizationStepStatus.PENDING
}

export function getStepError(error: string | null) {
  if (!error) {
    return undefined
  }

  return error.length > 100
    ? t('@dapps.authorization_modal.generic_error')
    : error
}

export function getStepMessage(
  stepIndex: number,
  stepStatus: AuthorizationStepStatus,
  error: string | null,
  currentStep: number
) {
  if (stepIndex > currentStep) {
    return ''
  }

  if (stepIndex < currentStep) {
    return t('@dapps.authorization_modal.done')
  }

  switch (stepStatus) {
    case AuthorizationStepStatus.WAITING:
      return t('@dapps.authorization_modal.waiting_wallet')
    case AuthorizationStepStatus.PROCESSING:
      return t('@dapps.authorization_modal.waiting_confirmation')
    case AuthorizationStepStatus.ERROR:
      return <div className="authorization-error">{getStepError(error)}</div>
    case AuthorizationStepStatus.ALLOWANCE_AMOUNT_ERROR:
      return (
        <div className="authorization-error">
          {t('@dapps.authorization_modal.spending_cap_error')}
        </div>
      )
    case AuthorizationStepStatus.DONE:
      return t('@dapps.authorization_modal.done')
    default:
      return undefined
  }
}

export function getSteps({
  authorization,
  authorizationType,
  network,
  requiredAllowance,
  authorizedContractLabel,
  currentAllowance
}: {
  authorization: Authorization
  authorizationType: AuthorizationType
  network: Network
  requiredAllowance?: BigNumber
  currentAllowance?: BigNumber
  authorizedContractLabel?: string
}) {
  const requiredAllowanceAsEth = requiredAllowance
    ? ethers.utils.formatEther(requiredAllowance)
    : ''
  if (
    (!currentAllowance || !currentAllowance.isZero()) &&
    authorizationType === AuthorizationType.ALLOWANCE &&
    network === Network.ETHEREUM
  ) {
    return [
      {
        title: t('@dapps.authorization_modal.revoke_cap.title'),
        description: t('@dapps.authorization_modal.revoke_cap.description', {
          price: requiredAllowanceAsEth
        }),
        actionType: AuthorizationStepAction.REVOKE
      },
      {
        title: t('@dapps.authorization_modal.set_cap.title'),
        description: t('@dapps.authorization_modal.set_cap.description', {
          price: requiredAllowanceAsEth
        }),
        actionType: AuthorizationStepAction.GRANT
      }
    ]
  }

  if (authorizationType === AuthorizationType.ALLOWANCE) {
    return [
      {
        title: t('@dapps.authorization_modal.authorize_mana.title', {
          contract: () => (
            <TransactionLink
              address={authorization.authorizedAddress || ''}
              chainId={authorization.chainId}
              txHash=""
            >
              {authorizedContractLabel || authorization.authorizedAddress}
            </TransactionLink>
          )
        }),
        description: t(
          '@dapps.authorization_modal.authorize_mana.description',
          {
            price: requiredAllowanceAsEth
          }
        ),
        actionType: AuthorizationStepAction.GRANT
      }
    ]
  }

  return [
    {
      title: t('@dapps.authorization_modal.authorize_nft.title', {
        contract: () => (
          <TransactionLink
            address={authorization.authorizedAddress || ''}
            chainId={authorization.chainId}
            txHash=""
          >
            {authorizedContractLabel || authorization.authorizedAddress}
          </TransactionLink>
        )
      }),
      actionType: AuthorizationStepAction.GRANT
    }
  ]
}
