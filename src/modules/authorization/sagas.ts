import { Eth } from 'web3x-es/eth'
import { Address } from 'web3x-es/address'
import { put, call, takeEvery } from 'redux-saga/effects'
import { Network } from '@dcl/schemas'
import { Provider, ProviderType } from 'decentraland-connect'
import {
  getContract,
  getContractName,
  sendMetaTransaction
} from 'decentraland-transactions'
import { createProvider, getConnectedProvider } from '../../lib/eth'
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
import { Authorization, AuthorizationAction, AuthorizationType } from './types'
import { TxSend } from 'web3x-es/contract'

export function* authorizationSaga() {
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
  try {
    const { authorizations } = action.payload
    const authorizationsToStore: Authorization[] = []

    for (const authorization of authorizations) {
      if (!isValidType(authorization.type)) {
        throw new Error(`Invalid authorization type ${authorization.type}`)
      }
      const { chainId } = authorization
      const address = Address.fromString(authorization.address)
      const tokenAddress = Address.fromString(authorization.tokenAddress)
      const authorizedAddress = Address.fromString(
        authorization.authorizedAddress
      )

      const provider: Provider = yield call(() =>
        createProvider(ProviderType.NETWORK, chainId)
      )
      const eth: Eth = new Eth(provider)

      switch (authorization.type) {
        case AuthorizationType.ALLOWANCE:
          const allowance: string = yield call(() =>
            new ERC20(eth, tokenAddress).methods
              .allowance(address, authorizedAddress)
              .call()
          )
          if (parseInt(allowance, 10) > 0) {
            authorizationsToStore.push(authorization)
          }
          break
        case AuthorizationType.APPROVAL:
          const isApproved: boolean = yield call(() =>
            new ERC721(eth, tokenAddress).methods
              .isApprovedForAll(address, authorizedAddress)
              .call()
          )
          if (isApproved) {
            authorizationsToStore.push(authorization)
          }
          break
      }
    }

    yield put(fetchAuthorizationsSuccess(authorizationsToStore))
  } catch (error) {
    yield put(fetchAuthorizationsFailure(error.message))
  }
}

function* handleGrantTokenRequest(action: GrantTokenRequestAction) {
  try {
    const { authorization } = action.payload
    const txHash: string = yield call(() =>
      changeAuthorization(authorization, AuthorizationAction.GRANT)
    )
    yield put(grantTokenSuccess(authorization, authorization.chainId, txHash))
  } catch (error) {
    yield put(grantTokenFailure(error.message))
  }
}

function* handleRevokeTokenRequest(action: RevokeTokenRequestAction) {
  try {
    const { authorization } = action.payload
    const txHash: string = yield call(() =>
      changeAuthorization(authorization, AuthorizationAction.REVOKE)
    )
    yield put(revokeTokenSuccess(authorization, authorization.chainId, txHash))
  } catch (error) {
    yield put(revokeTokenFailure(error.message))
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
  const tokenAddress = Address.fromString(authorization.tokenAddress)
  const authorizedAddress = Address.fromString(authorization.authorizedAddress)
  const chainId = authorization.chainId

  let method: TxSend<ERC20TransactionReceipt | ERC721TransactionReceipt>

  switch (authorization.type) {
    case AuthorizationType.ALLOWANCE:
      const amount =
        action === AuthorizationAction.GRANT ? getTokenAmountToApprove() : 0

      method = new ERC20(eth, tokenAddress).methods.approve(
        authorizedAddress,
        amount
      )
      break
    case AuthorizationType.APPROVAL:
      const isApproved = action === AuthorizationAction.GRANT

      method = new ERC721(eth, tokenAddress).methods.setApprovalForAll(
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
      const metaTxProvider = await createProvider(ProviderType.NETWORK, chainId)

      return sendMetaTransaction(
        provider,
        metaTxProvider,
        txData,
        getContract(getContractName(tokenAddress.toString()), chainId)
      )
  }
}
