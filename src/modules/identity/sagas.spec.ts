import { expectSaga } from 'redux-saga-test-plan'
import { AuthIdentity } from '@dcl/crypto'
import { call } from 'redux-saga/effects'
import { Wallet } from '../wallet/types'
import { connectWalletSuccess, disconnectWallet } from '../wallet/actions'
import {
  getIdentity,
  clearIdentity,
  localStorageClearIdentity,
  localStorageGetIdentity
} from '@dcl/single-sign-on-client'
import { createIdentitySaga, setAuxAddress } from './sagas'
import { generateIdentityRequest, generateIdentitySuccess } from './actions'

jest.mock('@dcl/single-sign-on-client', () => {
  return {
    getIdentity: jest.fn(),
    clearIdentity: jest.fn(),
    localStorageClearIdentity: jest.fn(),
    localStorageGetIdentity: jest.fn(),
    localStorageStoreIdentity: jest.fn()
  }
})

const baseIdentitySagasConfig = {
  authURL: 'https://auth.example.com',
  getIsAuthDappEnabled: () => true
}

beforeEach(() => {
  jest.resetAllMocks()

  setAuxAddress(null)
})

describe('when handling the wallet connection success', () => {
  let wallet: Wallet
  let windowLocation: Location
  let isAuthDappEnabled: boolean

  beforeEach(() => {
    wallet = {
      address: '0x0'
    } as Wallet
  })

  describe('and the auth dapp is enabled', () => {
    describe("and there's no identity", () => {
      beforeEach(() => {
        windowLocation = window.location
        // @ts-ignore
        delete window.location
        window.location = ({
          replace: jest.fn()
        } as any) as Location
      })
      afterEach(() => {
        window.location = windowLocation
      })
      it('should redirect to auth dapp', async () => {
        await expectSaga(createIdentitySaga(baseIdentitySagasConfig))
          .provide([[call(localStorageGetIdentity, wallet.address), null]])
          .dispatch(connectWalletSuccess(wallet))
          .run({ silenceTimeout: true })
        expect(window.location.replace).toHaveBeenCalled()
      })
    })

    describe("and there's an identity", () => {
      let identity: AuthIdentity

      beforeEach(() => {
        identity = {} as any
        ;(localStorageGetIdentity as jest.Mock).mockReturnValue(identity)
      })
      it('should put an action to store the identity', () => {
        return expectSaga(createIdentitySaga(baseIdentitySagasConfig))
          .put(generateIdentitySuccess(wallet.address, identity))
          .dispatch(connectWalletSuccess(wallet))
          .run({ silenceTimeout: true })
      })
    })
  })

  describe('and the auth dapp is not enabled', () => {
    let getIsAuthDappEnabled: () => boolean
    beforeEach(() => {
      getIsAuthDappEnabled = () => false
    })
    describe("and there's no identity", () => {
      it('should put an action to generate the identity', () => {
        return expectSaga(
          createIdentitySaga({
            ...baseIdentitySagasConfig,
            getIsAuthDappEnabled
          })
        )
          .provide([[call(getIdentity, wallet.address), null]])
          .put(generateIdentityRequest(wallet.address))
          .dispatch(connectWalletSuccess(wallet))
          .run({ silenceTimeout: true })
      })
    })

    describe("and there's an identity", () => {
      it('should put an action to store the identity', () => {
        const identity = {} as any

        return expectSaga(
          createIdentitySaga({
            ...baseIdentitySagasConfig,
            getIsAuthDappEnabled
          })
        )
          .provide([[call(getIdentity, wallet.address), identity]])
          .put(generateIdentitySuccess(wallet.address, identity))
          .dispatch(connectWalletSuccess(wallet))
          .run({ silenceTimeout: true })
      })
    })
  })
})

describe('when handling the disconnect', () => {
  describe('when the auxiliary address is set', () => {
    const address = '0xSomeAddress'

    beforeEach(() => {
      setAuxAddress(address)
    })

    describe('and the auth dapp is enabled', () => {
      it('should call the sso client to clear the identity in the local storage', async () => {
        await expectSaga(createIdentitySaga(baseIdentitySagasConfig))
          .dispatch(disconnectWallet())
          .run({ silenceTimeout: true })

        expect(localStorageClearIdentity).toHaveBeenCalledWith(address)
      })
    })

    let getIsAuthDappEnabled: () => boolean
    describe('and the auth dapp is not enabled', () => {
      beforeEach(() => {
        getIsAuthDappEnabled = () => false
      })
      it('should call the sso client to clear the identity', async () => {
        await expectSaga(
          createIdentitySaga({
            ...baseIdentitySagasConfig,
            getIsAuthDappEnabled
          })
        )
          .dispatch(disconnectWallet())
          .run({ silenceTimeout: true })

        expect(clearIdentity).toHaveBeenCalledWith(address)
      })
    })
  })

  describe('when the auxiliary address is not set', () => {
    beforeEach(() => {
      setAuxAddress(null)
    })

    it('should not call the sso client to clear the identity', async () => {
      await expectSaga(createIdentitySaga(baseIdentitySagasConfig))
        .dispatch(disconnectWallet())
        .run({ silenceTimeout: true })

      expect(clearIdentity).not.toHaveBeenCalled()
    })
  })
})
