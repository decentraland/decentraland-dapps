import { takeLatest, put, call, select } from 'redux-saga/effects'
import { ethers } from 'ethers'
import { Authenticator, AuthIdentity } from '@dcl/crypto'
import {
  getIdentity,
  storeIdentity,
  clearIdentity,
  localStorageGetIdentity,
  localStorageClearIdentity
} from '@dcl/single-sign-on-client'
import { t } from '../translation/utils'
import {
  CONNECT_WALLET_SUCCESS,
  DISCONNECT_WALLET,
  DisconnectWalletAction
} from '../wallet/actions'
import { ConnectWalletSuccessAction } from '../wallet/actions'
import { isErrorWithMessage } from '../../lib/error'

import {
  GENERATE_IDENTITY_REQUEST,
  GenerateIdentityRequestAction,
  generateIdentityFailure,
  generateIdentityRequest,
  generateIdentitySuccess
} from './actions'
import { getConnectedProvider } from '../../lib/eth'
import { Provider } from '../wallet/types'

type IdentitySagaConfig = {
  authURL: string
  getIsAuthDappEnabled: () => boolean
  identityExpirationInMinutes?: number
}

// Persist the address of the connected wallet.
// This is a workaround for when the user disconnects as there is no selector that provides the address at that point
let auxAddress: string | null = null

export function createIdentitySaga(options: IdentitySagaConfig) {
  function* identitySaga() {
    yield takeLatest(GENERATE_IDENTITY_REQUEST, handleGenerateIdentityRequest)
    yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess)
    yield takeLatest(DISCONNECT_WALLET, handleDisconnect)
  }

  const { identityExpirationInMinutes, authURL, getIsAuthDappEnabled } = options

  const IDENTITY_EXPIRATION_IN_MINUTES = (() => {
    const expiration = identityExpirationInMinutes

    if (!expiration) {
      const ONE_MONTH_IN_MINUTES = 31 * 24 * 60
      return ONE_MONTH_IN_MINUTES
    }

    return Number(expiration)
  })()

  function* handleGenerateIdentityRequest(
    action: GenerateIdentityRequestAction
  ) {
    const address = action.payload.address.toLowerCase()

    try {
      const provider: Provider | null = yield call(getConnectedProvider)

      if (!provider) {
        throw new Error('Could not get a valid connected Wallet')
      }

      const eth: ethers.providers.Web3Provider = new ethers.providers.Web3Provider(
        provider
      )
      const account = ethers.Wallet.createRandom()

      const payload = {
        address: account.address.toString(),
        publicKey: ethers.utils.hexlify(account.publicKey),
        privateKey: ethers.utils.hexlify(account.privateKey)
      }

      const signer = eth.getSigner()

      const identity: AuthIdentity = yield Authenticator.initializeAuthChain(
        address,
        payload,
        IDENTITY_EXPIRATION_IN_MINUTES,
        message => signer.signMessage(message)
      )

      // Stores the identity into the SSO iframe.
      yield call(storeIdentity, address, identity)

      yield put(generateIdentitySuccess(address, identity))
    } catch (error) {
      yield put(
        generateIdentityFailure(
          address,
          isErrorWithMessage(error) ? error.message : t('global.unknown_error')
        )
      )
    }
  }

  function* handleConnectWalletSuccess(action: ConnectWalletSuccessAction) {
    const address = action.payload.wallet.address

    yield call(setAuxAddress, address)

    const isAuthDappEnabled: boolean = getIsAuthDappEnabled()

    if (isAuthDappEnabled) {
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
      return
    }

    // Obtains the identity from the SSO iframe.
    const identity: AuthIdentity | null = yield call(getIdentity, address)

    // If the identity was persisted in the iframe, store in in redux.
    // If not, generate a new one, which wil be stored in the iframe.
    if (!identity) {
      yield put(generateIdentityRequest(address))
    } else {
      yield put(generateIdentitySuccess(address, identity))
    }
  }

  function* handleDisconnect(_action: DisconnectWalletAction) {
    if (auxAddress) {
      const isAuthDappEnabled: boolean = yield select(getIsAuthDappEnabled)
      if (isAuthDappEnabled) {
        localStorageClearIdentity(auxAddress)
      } else {
        // Clears the identity from the SSO iframe when the user disconnects the wallet.
        yield call(clearIdentity, auxAddress)
      }
    }
  }

  return identitySaga
}

export function setAuxAddress(address: string | null) {
  auxAddress = address
}
