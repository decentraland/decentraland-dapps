import { providers } from '@0xsequence/multicall'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import type { Provider as EthersProvider } from '@ethersproject/providers'
import { Web3Provider } from '@ethersproject/providers'
import { call, fork, put, race, select, take, takeEvery } from 'redux-saga/effects'
import { Provider } from 'decentraland-connect'
import { ContractData, getContract } from 'decentraland-transactions'
import { getNetworkProvider } from '../../lib/eth'
import { getAnalytics } from '../analytics/utils'
import { getTransactionHashFromAction, waitForTx } from '../transaction/utils'
import { sendTransaction } from '../wallet/utils/sendTransaction'
import {
  AUTHORIZATION_FLOW_REQUEST,
  AuthorizationFlowRequestAction,
  FETCH_AUTHORIZATIONS_FAILURE,
  FETCH_AUTHORIZATIONS_REQUEST,
  FETCH_AUTHORIZATIONS_SUCCESS,
  FetchAuthorizationsFailureAction,
  FetchAuthorizationsRequestAction,
  FetchAuthorizationsSuccessAction,
  GRANT_TOKEN_FAILURE,
  GRANT_TOKEN_REQUEST,
  GRANT_TOKEN_SUCCESS,
  GrantTokenRequestAction,
  GrantTokenSuccessAction,
  REVOKE_TOKEN_FAILURE,
  REVOKE_TOKEN_REQUEST,
  REVOKE_TOKEN_SUCCESS,
  RevokeTokenFailureAction,
  RevokeTokenRequestAction,
  RevokeTokenSuccessAction,
  authorizationFlowFailure,
  authorizationFlowSuccess,
  fetchAuthorizationsFailure,
  fetchAuthorizationsRequest,
  fetchAuthorizationsSuccess,
  grantTokenFailure,
  grantTokenRequest,
  grantTokenSuccess,
  revokeTokenFailure,
  revokeTokenRequest,
  revokeTokenSuccess
} from './actions'
import { getData } from './selectors'
import { Authorization, AuthorizationAction, AuthorizationType } from './types'
import {
  AuthorizationError,
  getCollectionV2ContractInstance,
  getTokenAmountToApprove,
  hasAuthorization,
  hasAuthorizationAndEnoughAllowance,
  isValidType
} from './utils'

export function createAuthorizationSaga() {
  return function* authorizationSaga() {
    yield takeEvery(FETCH_AUTHORIZATIONS_REQUEST, handleFetchAuthorizationsRequest)
    yield takeEvery(GRANT_TOKEN_REQUEST, handleGrantTokenRequest)
    yield takeEvery(REVOKE_TOKEN_REQUEST, handleRevokeTokenRequest)
    yield takeEvery(AUTHORIZATION_FLOW_REQUEST, handleAuthorizationFlowRequest)
  }

  function* handleFetchAuthorizationsRequest(action: FetchAuthorizationsRequestAction) {
    const { authorizations } = action.payload
    try {
      const promises: Promise<[Authorization, Authorization | null]>[] = []
      const multicallProviders: Record<string, providers.MulticallProvider> = {}

      for (const authorization of authorizations) {
        if (!isValidType(authorization.type)) {
          throw new Error(`Invalid authorization type ${authorization.type}`)
        }
        const { chainId } = authorization

        if (!multicallProviders[chainId]) {
          // provider party 🎉
          const provider: Provider = yield call(() => getNetworkProvider(chainId))
          const ethersProvider = new Web3Provider(provider)
          const multicallProvider = new providers.MulticallProvider(
            ethersProvider,
            { batchSize: 500 } // defaults to 50
          )
          multicallProviders[chainId] = multicallProvider
        }

        switch (authorization.type) {
          case AuthorizationType.ALLOWANCE:
            const erc20 = getERC20ContractInstance(authorization, multicallProviders[chainId])

            promises.push(
              // @ts-ignore
              erc20
                .allowance(authorization.address, authorization.authorizedAddress)
                .then<Authorization | null>((allowance: BigNumber) => {
                  return [
                    authorization,
                    allowance.gt(0)
                      ? {
                          ...authorization,
                          allowance: allowance.toString()
                        }
                      : null
                  ]
                })
                .catch((error: Error) => {
                  console.warn('Error fetching allowance', authorization, error)
                  return [authorization, null]
                })
            )
            break
          case AuthorizationType.APPROVAL:
            const erc721 = getERC721ContractInstance(authorization, multicallProviders[chainId])

            promises.push(
              // @ts-ignore
              erc721
                .isApprovedForAll(authorization.address, authorization.authorizedAddress)
                .then<Authorization | null>((isApproved: boolean) => [authorization, isApproved ? authorization : null])
                .catch((error: Error) => {
                  console.warn('Error fetching approval', authorization, error)
                  return [authorization, null]
                })
            )
            break
          case AuthorizationType.MINT:
            const collectionContract = getCollectionV2ContractInstance(authorization.contractAddress, multicallProviders[chainId])

            promises.push(
              collectionContract
                .globalMinters(authorization.authorizedAddress)
                .then((isMinter: boolean) => [authorization, isMinter ? authorization : null])
                .catch((error: Error) => {
                  console.error('Error fetching minters', authorization, error)
                  return [authorization, null]
                })
            )
        }
      }

      const authorizationsToStore: [Authorization, Authorization | null][] = yield call(async () => {
        return Promise.all(promises)
      })

      yield put(fetchAuthorizationsSuccess(authorizationsToStore))
    } catch (error) {
      yield put(fetchAuthorizationsFailure(authorizations, error.message))
    }
  }

  function* handleGrantTokenRequest(action: GrantTokenRequestAction) {
    const { authorization } = action.payload
    try {
      const txHash: string = yield call(() => changeAuthorization(authorization, AuthorizationAction.GRANT))
      yield put(grantTokenSuccess(authorization, authorization.chainId, txHash))
    } catch (error) {
      yield put(grantTokenFailure(authorization, error.message))
    }
  }

  function* handleRevokeTokenRequest(action: RevokeTokenRequestAction) {
    const { authorization } = action.payload
    try {
      const txHash: string = yield call(() => changeAuthorization(authorization, AuthorizationAction.REVOKE))
      yield put(revokeTokenSuccess(authorization, authorization.chainId, txHash))
    } catch (error) {
      yield put(revokeTokenFailure(authorization, error.message))
    }
  }

  function* authorizeAndWaitForTx(authorization: Authorization, authorizationAction: AuthorizationAction, traceId: string) {
    const isRevoke = authorizationAction === AuthorizationAction.REVOKE
    const tokenRequest = isRevoke ? revokeTokenRequest(authorization) : grantTokenRequest(authorization)
    const TOKEN_SUCCESS = isRevoke ? REVOKE_TOKEN_SUCCESS : GRANT_TOKEN_SUCCESS
    const TOKEN_FAILURE = isRevoke ? REVOKE_TOKEN_FAILURE : GRANT_TOKEN_FAILURE

    yield put(tokenRequest)

    const {
      success,
      failure
    }: {
      success: RevokeTokenSuccessAction | GrantTokenSuccessAction | undefined
      failure: RevokeTokenFailureAction | RevokeTokenFailureAction | undefined
    } = yield race({
      success: take(TOKEN_SUCCESS),
      failure: take(TOKEN_FAILURE)
    })
    if (failure) {
      throw new Error(failure.payload.error)
    }

    const analytics = getAnalytics()
    if (analytics) {
      analytics.track(`[Authorization Flow] ${isRevoke ? 'Revoke' : 'Grant'} Transaction Approved in Wallet`, { traceId })
    }
    const txHash = getTransactionHashFromAction(success as RevokeTokenSuccessAction | GrantTokenSuccessAction)
    yield call(waitForTx, txHash)
  }

  function* handleAuthorizationFlowRequest(action: AuthorizationFlowRequestAction) {
    const { authorizationAction, authorization, requiredAllowance, currentAllowance, traceId, onAuthorized } = action.payload

    try {
      // If we're building an allowance request, we need to check if the user has any allowance set
      // If they have it already set, we need to revoke it before granting the new allowance
      if (
        authorizationAction === AuthorizationAction.GRANT &&
        authorization.type === AuthorizationType.ALLOWANCE &&
        requiredAllowance !== undefined &&
        currentAllowance !== undefined &&
        !BigNumber.from(currentAllowance).isZero() &&
        onAuthorized
      ) {
        // Build revoke request
        yield call(authorizeAndWaitForTx, authorization, AuthorizationAction.REVOKE, traceId ?? 'Unknown trace id')
      }

      // Perform the solicited action
      yield call(authorizeAndWaitForTx, authorization, authorizationAction, traceId ?? 'Unknown trace id')
      yield put(fetchAuthorizationsRequest([authorization]))

      const {
        fetchFailure
      }: {
        fetchSuccess: FetchAuthorizationsSuccessAction | undefined
        fetchFailure: FetchAuthorizationsFailureAction | undefined
      } = yield race({
        fetchSuccess: take(FETCH_AUTHORIZATIONS_SUCCESS),
        fetchFailure: take(FETCH_AUTHORIZATIONS_FAILURE)
      })

      if (fetchFailure) {
        throw new Error(fetchFailure.payload.error || AuthorizationError.FETCH_AUTHORIZATIONS_FAILURE)
      }
      const authorizations: Authorization[] = yield select(getData)

      if (authorizationAction === AuthorizationAction.REVOKE && hasAuthorization(authorizations, authorization)) {
        throw new Error(AuthorizationError.REVOKE_FAILED)
      }

      if (authorizationAction === AuthorizationAction.GRANT) {
        if (
          authorization.type === AuthorizationType.ALLOWANCE &&
          requiredAllowance &&
          !hasAuthorizationAndEnoughAllowance(authorizations, authorization, requiredAllowance)
        ) {
          throw new Error(AuthorizationError.INSUFFICIENT_ALLOWANCE)
        }

        if (
          (authorization.type === AuthorizationType.APPROVAL || authorization.type === AuthorizationType.MINT) &&
          !hasAuthorization(authorizations, authorization)
        ) {
          throw new Error(AuthorizationError.GRANT_FAILED)
        }
      }

      if (onAuthorized) {
        yield fork(onAuthorized)
      }

      yield put(authorizationFlowSuccess(authorization))
    } catch (error) {
      yield put(authorizationFlowFailure(authorization, error.message))
    }
  }

  async function changeAuthorization(authorization: Authorization, action: AuthorizationAction): Promise<string> {
    if (!isValidType(authorization.type)) {
      throw new Error(`Invalid authorization type ${authorization.type}`)
    }

    const contract: ContractData = {
      ...getContract(authorization.contractName, authorization.chainId),
      address: authorization.contractAddress
    }

    switch (authorization.type) {
      case AuthorizationType.ALLOWANCE:
        const amount = action === AuthorizationAction.GRANT ? getTokenAmountToApprove().toString() : '0'
        return sendTransaction(contract, erc20 => erc20.approve(authorization.authorizedAddress, amount))
      case AuthorizationType.APPROVAL:
        const isApproved = action === AuthorizationAction.GRANT
        return sendTransaction(contract, erc712 => erc712.setApprovalForAll(authorization.authorizedAddress, isApproved))
      case AuthorizationType.MINT:
        const isMinter = action === AuthorizationAction.GRANT
        return sendTransaction(contract, collection => collection.setMinters([authorization.authorizedAddress], [isMinter]))
    }
  }
}

// TODO: Use decentraland-transactions
function getERC20ContractInstance(authorization: Authorization, provider: EthersProvider) {
  return new Contract(
    authorization.contractAddress,
    ['function allowance(address owner, address spender) view returns (uint256)'],
    provider
  )
}

function getERC721ContractInstance(authorization: Authorization, provider: EthersProvider) {
  return new Contract(
    authorization.contractAddress,
    ['function isApprovedForAll(address owner, address operator) view returns (bool)'],
    provider
  )
}

export const authorizationSaga = createAuthorizationSaga()
