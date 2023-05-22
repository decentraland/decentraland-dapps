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
import { t, t_cond } from '../../../modules/translation/utils'
import { getData as getAuthorizations } from '../../../modules/authorization/selectors'
import {
  AUTHORIZATION_FLOW_REQUEST,
  GRANT_TOKEN_REQUEST,
  REVOKE_TOKEN_REQUEST
} from '../../../modules/authorization/actions'
import {
  AuthorizationStepAction,
  AuthorizationStepStatus,
  AuthorizedAction
} from './AuthorizationModal.types'

const MAX_ERROR_LENGTH = 150

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

export function getStepError(
  error: string | null,
  action: AuthorizationStepAction
) {
  if (!error) {
    return undefined
  }

  // When revoke fails always return revoke cap error message
  if (action === AuthorizationStepAction.REVOKE) {
    return t('@dapps.authorization_modal.revoke_cap_error')
  }

  return error.length > MAX_ERROR_LENGTH
    ? t('@dapps.authorization_modal.generic_error')
    : error
}

export function getStepMessage(
  stepIndex: number,
  stepStatus: AuthorizationStepStatus,
  error: string | null,
  currentStep: number,
  price: string,
  action: AuthorizationStepAction
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
      return (
        <div className="authorization-error">{getStepError(error, action)}</div>
      )
    case AuthorizationStepStatus.ALLOWANCE_AMOUNT_ERROR:
      return (
        <div className="authorization-error">
          {t('@dapps.authorization_modal.spending_cap_error', { price })}
        </div>
      )
    case AuthorizationStepStatus.DONE:
      return t('@dapps.authorization_modal.done')
    default:
      return undefined
  }
}

export function getPriceInMana(requiredAllowance?: BigNumber): string {
  if (!requiredAllowance) return ''
  const mana = Number.parseFloat(ethers.utils.formatEther(requiredAllowance))
  const twoDecimalsMana = Math.ceil(mana * 100) / 100
  return twoDecimalsMana.toString().replace(/\.0+$/, '')
}

export function getSteps({
  authorization,
  authorizationType,
  network,
  requiredAllowance,
  authorizedContractLabel,
  currentAllowance,
  action
}: {
  action: AuthorizedAction
  authorization: Authorization
  authorizationType: AuthorizationType
  network: Network
  requiredAllowance?: BigNumber
  currentAllowance?: BigNumber
  authorizedContractLabel?: string
}) {
  const requiredAllowanceAsEth = getPriceInMana(requiredAllowance)
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
        description: t_cond(
          `@dapps.authorization_modal.${action}.revoke_cap_description`,
          '@dapps.authorization_modal.set_cap.description',
          {
            price: requiredAllowanceAsEth
          }
        ),
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
        description: t_cond(
          `@dapps.authorization_modal.${action}.authorize_mana_description`,
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
