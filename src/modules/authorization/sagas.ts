import { put, call, takeEvery } from 'redux-saga/effects'
import { providers } from '@0xsequence/multicall'
import { Web3Provider } from '@ethersproject/providers/lib/web3-provider'
import { Contract } from '@ethersproject/contracts'
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber'
import { Provider } from 'decentraland-connect/dist/types'
import { ContractData, getContract } from 'decentraland-transactions'
import { getNetworkProvider } from '../../lib/eth'
import { getTokenAmountToApprove, isValidType } from './utils'
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
  REVOKE_TOKEN_REQUEST
} from './actions'
import { Authorization, AuthorizationAction, AuthorizationType } from './types'
import { sendTransaction } from '../wallet/utils/sendTransaction'

export function createAuthorizationSaga() {
  return function* authorizationSaga() {
    yield takeEvery(
      FETCH_AUTHORIZATIONS_REQUEST,
      handleFetchAuthorizationsRequest
    )
    yield takeEvery(GRANT_TOKEN_REQUEST, handleGrantTokenRequest)
    yield takeEvery(REVOKE_TOKEN_REQUEST, handleRevokeTokenRequest)
  }

  function* handleFetchAuthorizationsRequest(
    action: FetchAuthorizationsRequestAction
  ) {
    const { authorizations } = action.payload
    try {
      const promises: Promise<Authorization | null>[] = []
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
          const ethersProvider = new Web3Provider(provider)
          const multicallProvider = new providers.MulticallProvider(
            ethersProvider,
            { batchSize: 500 } // defaults to 50
          )
          multicallProviders[chainId] = multicallProvider
        }

        switch (authorization.type) {
          case AuthorizationType.ALLOWANCE:
            const erc20 = new Contract(
              authorization.contractAddress,
              [
                'function allowance(address owner, address spender) view returns (uint256)'
              ],
              multicallProviders[chainId]
            )
            promises.push(
              // @ts-ignore
              erc20
                .allowance(
                  authorization.address,
                  authorization.authorizedAddress
                )
                .then<Authorization | null>((allowance: BigNumber) =>
                  allowance.gt(0) ? authorization : null
                )
                .catch((error: Error) => {
                  console.warn(`Error fetching allowance`, authorization, error)
                  return null
                })
            )
            break
          case AuthorizationType.APPROVAL:
            const erc721 = new Contract(
              authorization.contractAddress,
              [
                'function isApprovedForAll(address owner, address operator) view returns (bool)'
              ],
              multicallProviders[chainId]
            )
            promises.push(
              // @ts-ignore
              erc721
                .isApprovedForAll(
                  authorization.address,
                  authorization.authorizedAddress
                )
                .then<Authorization | null>((isApproved: boolean) =>
                  isApproved ? authorization : null
                )
                .catch((error: Error) => {
                  console.warn(`Error fetching approval`, authorization, error)
                  return null
                })
            )
            break
        }
      }

      const authorizationsToStore: Authorization[] = yield call(async () => {
        const results = await Promise.all(promises)
        return results.filter(result => !!result) // filter nulls, or undefineds due to caught promises
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

export const authorizationSaga = createAuthorizationSaga()
