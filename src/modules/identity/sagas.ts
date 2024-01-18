import { takeLatest, put, call } from 'redux-saga/effects'
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
import { generateIdentitySuccess } from './actions'

type IdentitySagaConfig = {
  authURL: string
  identityExpirationInMinutes?: number
}

// Persist the address of the connected wallet.
// This is a workaround for when the user disconnects as there is no selector that provides the address at that point
let auxAddress: string | null = null

export function createIdentitySaga(options: IdentitySagaConfig) {
  function* identitySaga() {
    yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess)
    yield takeLatest(DISCONNECT_WALLET, handleDisconnect)
  }

  const { authURL } = options

  function* handleConnectWalletSuccess(action: ConnectWalletSuccessAction) {
    const address = action.payload.wallet.address

    yield call(setAuxAddress, address)

    const identity: AuthIdentity | null = localStorageGetIdentity(address)
    if (identity) {
      yield put(generateIdentitySuccess(address, identity))
    } else {
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

export function setAuxAddress(address: string | null) {
  auxAddress = address
}
