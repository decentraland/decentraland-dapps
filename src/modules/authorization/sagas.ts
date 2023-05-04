import { put, call, takeEvery, take, select, race } from 'redux-saga/effects'
import { providers } from '@0xsequence/multicall'
import { ethers } from 'ethers'
import { Provider } from 'decentraland-connect/dist/types'
import { ContractData, getContract } from 'decentraland-transactions'
import { getNetworkProvider } from '../../lib/eth'
import { sendTransaction } from '../wallet/utils/sendTransaction'
import { getTransactionFromAction, waitForTx } from '../transaction/utils'
import {
  AuthorizationError,
  getTokenAmountToApprove,
  hasAuthorization,
  hasAuthorizationAndEnoughAllowance,
  isValidType
} from './utils'
import {
  fetchAuthorizationsSuccess,
  fetchAuthorizationsFailure,
  FetchAuthorizationsRequestAction,
  FETCH_AUTHORIZATIONS_REQUEST,
  grantTokenSuccess,
  grantTokenFailure,
  GrantTokenRequestAction,
  GRANT_TOKEN_REQUEST,
  revokeTokenSuccess,
  revokeTokenFailure,
  RevokeTokenRequestAction,
  REVOKE_TOKEN_REQUEST,
  AuthorizationFlowRequestAction,
  AUTHORIZATION_FLOW_REQUEST,
  authorizationFlowFailure,
  authorizationFlowSuccess,
  fetchAuthorizationsRequest,
  FETCH_AUTHORIZATIONS_SUCCESS,
  REVOKE_TOKEN_SUCCESS,
  GRANT_TOKEN_SUCCESS,
  revokeTokenRequest,
  grantTokenRequest,
  GrantTokenSuccessAction,
  RevokeTokenSuccessAction,
  REVOKE_TOKEN_FAILURE,
  GRANT_TOKEN_FAILURE,
  RevokeTokenFailureAction,
  FETCH_AUTHORIZATIONS_FAILURE,
  FetchAuthorizationsSuccessAction,
  FetchAuthorizationsFailureAction
} from './actions'
import { Authorization, AuthorizationAction, AuthorizationType } from './types'
import { getData } from './selectors'

export function createAuthorizationSaga() {
  return function* authorizationSaga() {
    yield takeEvery(
      FETCH_AUTHORIZATIONS_REQUEST,
      handleFetchAuthorizationsRequest
    )
    yield takeEvery(GRANT_TOKEN_REQUEST, handleGrantTokenRequest)
    yield takeEvery(REVOKE_TOKEN_REQUEST, handleRevokeTokenRequest)
    yield takeEvery(AUTHORIZATION_FLOW_REQUEST, handleAuthorizationFlowRequest)
  }

  function* handleFetchAuthorizationsRequest(
    action: FetchAuthorizationsRequestAction
  ) {
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
          const provider: Provider = yield call(() =>
            getNetworkProvider(chainId)
          )
          const ethersProvider = new ethers.providers.Web3Provider(provider)
          const multicallProvider = new providers.MulticallProvider(
            ethersProvider,
            { batchSize: 500 } // defaults to 50
          )
          multicallProviders[chainId] = multicallProvider
        }

        switch (authorization.type) {
          case AuthorizationType.ALLOWANCE:
            const erc20 = getERC20ContractInstance(
              authorization,
              multicallProviders[chainId]
            )

            promises.push(
              // @ts-ignore
              erc20
                .allowance(
                  authorization.address,
                  authorization.authorizedAddress
                )
                .then<Authorization | null>((allowance: ethers.BigNumber) => {
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
                  console.warn(`Error fetching allowance`, authorization, error)
                  return [authorization, null]
                })
            )
            break
          case AuthorizationType.APPROVAL:
            const erc721 = getERC721ContractInstance(
              authorization,
              multicallProviders[chainId]
            )

            promises.push(
              // @ts-ignore
              erc721
                .isApprovedForAll(
                  authorization.address,
                  authorization.authorizedAddress
                )
                .then<Authorization | null>((isApproved: boolean) => [
                  authorization,
                  isApproved ? authorization : null
                ])
                .catch((error: Error) => {
                  console.warn(`Error fetching approval`, authorization, error)
                  return [authorization, null]
                })
            )
            break
        }
      }

      const authorizationsToStore: [
        Authorization,
        Authorization | null
      ][] = yield call(async () => {
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
      const txHash: string = yield call(() =>
        changeAuthorization(authorization, AuthorizationAction.GRANT)
      )
      yield put(grantTokenSuccess(authorization, authorization.chainId, txHash))
    } catch (error) {
      yield put(grantTokenFailure(authorization, error.message))
    }
  }

  function* handleRevokeTokenRequest(action: RevokeTokenRequestAction) {
    const { authorization } = action.payload
    try {
      const txHash: string = yield call(() =>
        changeAuthorization(authorization, AuthorizationAction.REVOKE)
      )
      yield put(
        revokeTokenSuccess(authorization, authorization.chainId, txHash)
      )
    } catch (error) {
      yield put(revokeTokenFailure(authorization, error.message))
    }
  }

  function* handleAuthorizationFlowRequest(
    action: AuthorizationFlowRequestAction
  ) {
    const { authorizationAction, authorization, allowance } = action.payload
    const isRevoke = authorizationAction === AuthorizationAction.REVOKE
    const tokenRequest = isRevoke
      ? revokeTokenRequest(authorization)
      : grantTokenRequest(authorization)
    const TOKEN_SUCCESS = isRevoke ? REVOKE_TOKEN_SUCCESS : GRANT_TOKEN_SUCCESS
    const TOKEN_FAILURE = isRevoke ? REVOKE_TOKEN_FAILURE : GRANT_TOKEN_FAILURE

    yield put(tokenRequest)

    try {
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
      const txHash = getTransactionFromAction(
        success as RevokeTokenSuccessAction | GrantTokenSuccessAction
      ).hash

      yield call(waitForTx, txHash)

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
        throw new Error(
          fetchFailure.payload.error ||
            AuthorizationError.FETCH_AUTHORIZATIONS_FAILURE
        )
      }
      const authorizations: Authorization[] = yield select(getData)

      if (
        authorizationAction === AuthorizationAction.REVOKE &&
        hasAuthorization(authorizations, authorization)
      ) {
        throw new Error(AuthorizationError.REVOKE_FAILED)
      }

      if (authorizationAction === AuthorizationAction.GRANT) {
        if (
          authorization.type === AuthorizationType.ALLOWANCE &&
          allowance &&
          !hasAuthorizationAndEnoughAllowance(
            authorizations,
            authorization,
            allowance
          )
        ) {
          throw new Error(AuthorizationError.INSUFFICIENT_ALLOWANCE)
        }

        if (
          authorization.type === AuthorizationType.APPROVAL &&
          !hasAuthorization(authorizations, authorization)
        ) {
          throw new Error(AuthorizationError.GRANT_FAILED)
        }
      }

      yield put(authorizationFlowSuccess(authorization))
    } catch (error) {
      yield put(authorizationFlowFailure(authorization, error.message))
    }
  }

  async function changeAuthorization(
    authorization: Authorization,
    action: AuthorizationAction
  ): Promise<string> {
    if (!isValidType(authorization.type)) {
      throw new Error(`Invalid authorization type ${authorization.type}`)
    }

    const contract: ContractData = {
      ...getContract(authorization.contractName, authorization.chainId),
      address: authorization.contractAddress
    }

    switch (authorization.type) {
      case AuthorizationType.ALLOWANCE:
        const amount =
          action === AuthorizationAction.GRANT
            ? getTokenAmountToApprove().toString()
            : '0'
        return sendTransaction(contract, erc20 =>
          erc20.approve(authorization.authorizedAddress, amount)
        )
      case AuthorizationType.APPROVAL:
        const isApproved = action === AuthorizationAction.GRANT
        return sendTransaction(contract, erc712 =>
          erc712.setApprovalForAll(authorization.authorizedAddress, isApproved)
        )
    }
  }
}

// TODO: Use decentraland-transactions
function getERC20ContractInstance(
  authorization: Authorization,
  provider: ethers.providers.Provider
) {
  return new ethers.Contract(
    authorization.contractAddress,
    [
      'function allowance(address owner, address spender) view returns (uint256)'
    ],
    provider
  )
}

function getERC721ContractInstance(
  authorization: Authorization,
  provider: ethers.providers.Provider
) {
  return new ethers.Contract(
    authorization.contractAddress,
    [
      'function isApprovedForAll(address owner, address operator) view returns (bool)'
    ],
    provider
  )
}

export const authorizationSaga = createAuthorizationSaga()
