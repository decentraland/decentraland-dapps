import { takeLatest, call, put } from 'redux-saga/effects'
import { AuthIdentity } from '@dcl/crypto'
import {
  localStorageGetIdentity,
  localStorageClearIdentity
} from '@dcl/single-sign-on-client'
import {
  CONNECT_WALLET_SUCCESS,
  DISCONNECT_WALLET,
  DisconnectWalletAction
} from '../wallet/actions'
import { ConnectWalletSuccessAction } from '../wallet/actions'
import {
  GENERATE_IDENTITY_REQUEST,
  GenerateIdentityRequestAction,
  generateIdentitySuccess
} from './actions'

type IdentitySagaConfig = {
  authURL: string
  identityExpirationInMinutes?: number
}

// Persist the address of the connected wallet.
// This is a workaround for when the user disconnects as there is no selector that provides the address at that point
let auxAddress: string | null = null
let dappAuthURL: string | null = null

export function createIdentitySaga(options: IdentitySagaConfig) {
  function* identitySaga() {
    yield takeLatest(GENERATE_IDENTITY_REQUEST, handleGetIdentity)
    yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess)
    yield takeLatest(DISCONNECT_WALLET, handleDisconnect)
  }

  const { authURL } = options
  dappAuthURL = authURL

  function* handleGetIdentity(action: GenerateIdentityRequestAction) {
    const { address } = action.payload
    const identity: AuthIdentity | null = localStorageGetIdentity(address)
    if (!identity) {
      window.location.replace(
        `${authURL}/login?redirectTo=${window.location.href}`
      )
      return
    }
    yield put(generateIdentitySuccess(address, identity))
  }

  function* handleConnectWalletSuccess(action: ConnectWalletSuccessAction) {
    const address = action.payload.wallet.address

    yield call(setAuxAddress, address)

    const identity: AuthIdentity | null = localStorageGetIdentity(address)
    if (!identity) {
      window.location.replace(
        `${authURL}/login?redirectTo=${encodeURIComponent(
          window.location.href
        )}`
      )
    }
  }

  function* handleDisconnect(_action: DisconnectWalletAction) {
    if (auxAddress) {
      localStorageClearIdentity(auxAddress)
    }
  }

  return identitySaga
}

export function* getIdentityOrRedirect() {
  if (!auxAddress || !dappAuthURL) {
    return
  }

  const identity: AuthIdentity | null = localStorageGetIdentity(auxAddress)
  if (!identity) {
    window.location.replace(
      `${dappAuthURL}/login?redirectTo=${encodeURIComponent(
        window.location.href
      )}`
    )
    return
  }
  return identity
}

export function setAuxAddress(address: string | null) {
  auxAddress = address
}
