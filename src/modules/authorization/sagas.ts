import { put, call, takeEvery } from 'redux-saga/effects'
import { providers } from '@0xsequence/multicall'
import { providers as ethersProviders, Contract, BigNumber } from 'ethers'
import { Eth } from 'web3x-es/eth'
import { TxSend } from 'web3x-es/contract'
import { Address } from 'web3x-es/address'
import { Network } from '@dcl/schemas'
import { Provider } from 'decentraland-connect'
import {
  ContractData,
  getContract,
  sendMetaTransaction
} from 'decentraland-transactions'
import { getNetworkProvider, getConnectedProvider } from '../../lib/eth'
import { getChainConfiguration } from '../../lib/chainConfiguration'
import { ERC20, ERC20TransactionReceipt } from '../../contracts/ERC20'
import { ERC721, ERC721TransactionReceipt } from '../../contracts/ERC721'
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
import {
  Authorization,
  AuthorizationAction,
  AuthorizationSagaOptions,
  AuthorizationType
} from './types'

export function createAuthorizationSaga(options?: AuthorizationSagaOptions) {
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
          const ethersProvider = new ethersProviders.Web3Provider(provider)
          const multicallProvider = new providers.MulticallProvider(
            ethersProvider
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

    const provider: Provider | null = await getConnectedProvider()
    if (!provider) {
      throw new Error('Could not connect to Ethereum')
    }

    const eth: Eth = new Eth(provider)
    const { network } = getChainConfiguration(authorization.chainId)

    const from = Address.fromString(authorization.address)
    const contractAddress = Address.fromString(authorization.contractAddress)
    const authorizedAddress = Address.fromString(
      authorization.authorizedAddress
    )
    const { contractName, chainId } = authorization

    let method: TxSend<ERC20TransactionReceipt | ERC721TransactionReceipt>

    switch (authorization.type) {
      case AuthorizationType.ALLOWANCE:
        const amount =
          action === AuthorizationAction.GRANT
            ? getTokenAmountToApprove().toString()
            : '0'

        method = new ERC20(eth, contractAddress).methods.approve(
          authorizedAddress,
          amount
        )
        break
      case AuthorizationType.APPROVAL:
        const isApproved = action === AuthorizationAction.GRANT

        method = new ERC721(eth, contractAddress).methods.setApprovalForAll(
          authorizedAddress,
          isApproved
        )
        break
    }

    switch (network) {
      case Network.ETHEREUM:
        return method.send({ from }).getTxHash()
      case Network.MATIC:
        const payload = method.getSendRequestPayload({ from })
        const txData = payload.params[0].data
        const metaTxProvider = await getNetworkProvider(chainId)
        const contract: ContractData = {
          ...getContract(contractName, chainId),
          address: contractAddress.toString()
        }

        return sendMetaTransaction(provider, metaTxProvider, txData, contract, {
          serverURL: options?.metaTransactionServerUrl
        })
    }
  }
}

export const authorizationSaga = createAuthorizationSaga()
