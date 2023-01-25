import { call, select, take } from 'redux-saga/effects'
import * as matchers from 'redux-saga-test-plan/matchers'
import { expectSaga } from 'redux-saga-test-plan'
import { ErrorCode } from 'decentraland-transactions'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { switchNetworkSuccess } from '../wallet/actions'
import {
  getContractAccountErrorToast,
  getInvalidAddressErrorToast,
  getSalePriceTooLowErrorToast,
  getUnknownErrorToast
} from './toasts/meta-transactions'
import {
  createMetaTransactionsErrorChannel,
  handleMetaTransactionError,
  toastSaga,
  watchMetaTransactionErrors
} from './sagas'
import { getToasts } from './selectors'
import { hideAllToasts, showToast } from './actions'

describe('when handling a SWITCH_NETWORK_SUCCESS action', () => {
  it('should dispatch a HIDE_ALL_TOASTS action', () => {
    return expectSaga(toastSaga)
      .provide([[select(getToasts), []]])
      .put(hideAllToasts())
      .dispatch(switchNetworkSuccess(ChainId.MATIC_MAINNET))
      .silentRun()
  })
})

describe('when running the toastSaga', () => {
  it('should fork the watchMetaTransactionErrors saga', () => {
    return expectSaga(toastSaga)
      .fork(watchMetaTransactionErrors)
      .silentRun()
  })
})

describe('when running the watchMetaTransactionErrors', () => {
  it('should take actions from channel and forward them to the handleMetaTransactionError saga', () => {
    const fakeChannel = {
      take() { },
      flush() { },
      close() { }
    }

    return expectSaga(watchMetaTransactionErrors)
      .provide([
        [matchers.call.fn(createMetaTransactionsErrorChannel), fakeChannel],
        [take(fakeChannel), ErrorCode.INVALID_ADDRESS],
        [call(handleMetaTransactionError, ErrorCode.INVALID_ADDRESS), undefined]
      ])
      .silentRun()
  })
})

describe('when handling a meta-transaction error', () => {
  describe('when the error code is CONTRACT_ACCOUNT', () => {
    it('should show a contract account error toast', () => {
      return expectSaga(handleMetaTransactionError, ErrorCode.CONTRACT_ACCOUNT)
        .put(showToast(getContractAccountErrorToast()))
        .silentRun()
    })
  })

  describe('when the error code is INVALID_ADDRESS', () => {
    it('should show an invalid address error toast', () => {
      return expectSaga(handleMetaTransactionError, ErrorCode.INVALID_ADDRESS)
        .put(showToast(getInvalidAddressErrorToast()))
        .silentRun()
    })
  })

  describe('when the error code is USER_DENIED', () => {
    it('should not show a toast', () => {
      return expectSaga(
        handleMetaTransactionError,
        ErrorCode.USER_DENIED
      ).silentRun()
    })
  })

  describe('when the error code is SALE_PRICE_TOO_LOW', () => {
    it('should show a sales price too low error toast', () => {
      return expectSaga(
        handleMetaTransactionError,
        ErrorCode.SALE_PRICE_TOO_LOW
      )
        .put(showToast(getSalePriceTooLowErrorToast()))
        .silentRun()
    })
  })

  describe('when the error code is UNKNOWN', () => {
    it('should show an unknown error toast', () => {
      return expectSaga(handleMetaTransactionError, ErrorCode.UNKNOWN)
        .put(showToast(getUnknownErrorToast()))
        .silentRun()
    })
  })
})
