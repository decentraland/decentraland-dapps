import {
  call,
  delay,
  ForkEffect,
  put,
  select,
  takeEvery,
  takeLatest
} from 'redux-saga/effects'
import { LOAD } from 'redux-persistence'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { Network } from '@dcl/schemas/dist/dapps/network'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { getChainIdByNetwork } from '../../lib/eth'
import {
  pollPurchaseStatusFailure,
  pollPurchaseStatusRequest,
  PollPurchaseStatusRequestAction,
  pollPurchaseStatusSuccess,
  POLL_PURCHASE_STATUS_REQUEST,
  setPurchase,
  SetPurchaseAction,
  SET_PURCHASE
} from '../gateway/actions'
import { openModal } from '../modal/actions'
import { getTransactionHref } from '../transaction/utils'
import { getAddress } from '../wallet/selectors'
import { fetchWalletRequest } from '../wallet/actions'
import {
  OPEN_MANA_FIAT_GATEWAY_REQUEST,
  OpenManaFiatGatewayRequestAction,
  MANA_FIAT_GATEWAY_PURCHASE_COMPLETED,
  ManaFiatGatewayPurchaseCompletedAction,
  manaFiatGatewayPurchaseCompletedFailure,
  openManaFiatGatewaySuccess,
  openManaFiatGatewayFailure,
  OPEN_BUY_MANA_WITH_FIAT_MODAL_REQUEST,
  OpenBuyManaWithFiatModalRequestAction,
  openBuyManaWithFiatModalFailure,
  openBuyManaWithFiatModalSuccess,
  addManaPurchaseAsTransaction,
  manaFiatGatewayPurchaseCompleted
} from './actions'
import { MoonPay } from './moonpay'
import { MoonPayTransaction, MoonPayTransactionStatus } from './moonpay/types'
import { getPendingManaPurchase, getPendingPurchases } from './selectors'
import { Transak } from './transak'
import { CustomizationOptions, OrderResponse } from './transak/types'
import { ManaFiatGatewaySagasConfig, Purchase, PurchaseStatus } from './types'
import { isManaPurchase, purchaseEventsChannel } from './utils'

const DEFAULT_POLLING_DELAY = 3000
const BUY_MANA_WITH_FIAT_FEEDBACK_MODAL_NAME = 'BuyManaWithFiatFeedbackModal'

export function createGatewaySaga(config: ManaFiatGatewaySagasConfig) {
  return function* gatewaySaga(): IterableIterator<ForkEffect> {
    yield takeEvery(
      OPEN_BUY_MANA_WITH_FIAT_MODAL_REQUEST,
      handleOpenBuyManaWithFiatModal,
      config
    )
    yield takeEvery(
      OPEN_MANA_FIAT_GATEWAY_REQUEST,
      handleOpenFiatGateway,
      config
    )
    yield takeEvery(
      MANA_FIAT_GATEWAY_PURCHASE_COMPLETED,
      handleFiatGatewayPurchaseCompleted,
      config
    )
    yield takeEvery(SET_PURCHASE, handleSetPurchase)
    yield takeLatest(LOAD, handleStorageLoad)
    yield takeEvery(
      POLL_PURCHASE_STATUS_REQUEST,
      handlePollPurchaseStatusRequest,
      config
    )
    yield takeEvery(purchaseEventsChannel, handlePurchaseChannelEvent)

    function* handlePurchaseChannelEvent(action: { purchase: Purchase }) {
      const { purchase } = action
      yield put(setPurchase(purchase))
    }
  }
}

function* handleOpenBuyManaWithFiatModal(
  config: ManaFiatGatewaySagasConfig,
  action: OpenBuyManaWithFiatModalRequestAction
) {
  try {
    const { selectedNetwork } = action.payload
    const pendingManaPurchase: Purchase | undefined = yield select(
      getPendingManaPurchase
    )

    if (pendingManaPurchase) {
      let goToUrl: string | undefined

      if (pendingManaPurchase.gateway === NetworkGatewayType.MOON_PAY) {
        goToUrl = new MoonPay(config.moonPay).getTransactionReceiptUrl(
          pendingManaPurchase.id
        )
      }

      yield put(
        openModal(BUY_MANA_WITH_FIAT_FEEDBACK_MODAL_NAME, {
          purchase: pendingManaPurchase,
          goToUrl
        })
      )
    } else {
      yield put(openModal('BuyManaWithFiatModal', { selectedNetwork }))
    }

    yield put(openBuyManaWithFiatModalSuccess())
  } catch (error) {
    yield put(openBuyManaWithFiatModalFailure(error.message))
  }
}

function* handleOpenFiatGateway(
  config: ManaFiatGatewaySagasConfig,
  action: OpenManaFiatGatewayRequestAction
) {
  const { network, gateway } = action.payload
  const { transak: transakConfig, moonPay: moonPayConfig } = config

  try {
    switch (gateway) {
      case NetworkGatewayType.TRANSAK:
        const address: string = yield select(getAddress)
        const customizationOptions: Partial<CustomizationOptions> = {
          defaultCryptoCurrency: 'MANA',
          cyptoCurrencyList: 'MANA',
          fiatCurrency: '', // INR/GBP
          email: '', // Your customer's email address
          redirectURL: ''
        }
        const transak = new Transak(transakConfig, customizationOptions)
        transak.openWidget(address, network)
        break
      case NetworkGatewayType.MOON_PAY:
        const moonPay: MoonPay = new MoonPay(moonPayConfig)
        const widgetUrl = moonPay.getWidgetUrl(network)
        window.open(widgetUrl, '_blank', 'noopener,noreferrer')
        break
      default:
        break
    }

    yield put(openManaFiatGatewaySuccess())
  } catch (error) {
    yield put(openManaFiatGatewayFailure(network, gateway, error.message))
  }
}

function* upsertPurchase(
  moonPay: MoonPay,
  transaction: MoonPayTransaction,
  network: Network
) {
  let purchase: Purchase = moonPay.createPurchase(transaction, network)
  yield put(setPurchase(purchase))
}

function* handleStorageLoad() {
  const pendingPurchases: ReturnType<typeof getPendingPurchases> = yield select(
    getPendingPurchases
  )

  if (pendingPurchases) {
    for (const pendingPurchase of pendingPurchases) {
      const { network, gateway, id } = pendingPurchase
      switch (gateway) {
        case NetworkGatewayType.TRANSAK:
          yield put(pollPurchaseStatusRequest(pendingPurchase))
          break
        case NetworkGatewayType.MOON_PAY:
          yield put(
            manaFiatGatewayPurchaseCompleted(
              network,
              gateway,
              id,
              MoonPayTransactionStatus.PENDING
            )
          )
          break
      }
    }
  }
}

function* handlePollPurchaseStatusRequest(
  config: ManaFiatGatewaySagasConfig,
  action: PollPurchaseStatusRequestAction
) {
  const { purchase } = action.payload
  const { gateway, id } = purchase

  try {
    if (purchase.status !== PurchaseStatus.PENDING) {
      yield put(pollPurchaseStatusSuccess())
      return
    }

    switch (gateway) {
      case NetworkGatewayType.TRANSAK:
        const { transak: transakConfig } = config
        const transak = new Transak(transakConfig)
        let statusHasChanged = false

        while (!statusHasChanged) {
          const {
            data: { status, transactionHash, errorMessage }
          }: OrderResponse = yield call([transak, transak.getOrder], id)
          const newStatus: PurchaseStatus = yield call(
            [transak, transak.getPurchaseStatus],
            status
          )
          if (newStatus !== purchase.status) {
            statusHasChanged = true
            yield put(
              setPurchase({
                ...purchase,
                status: newStatus,
                txHash: transactionHash || null,
                failureReason: errorMessage
              })
            )
            continue
          }
          yield delay(transakConfig.pollingDelay || DEFAULT_POLLING_DELAY)
        }
        break
      default:
        break
    }

    yield put(pollPurchaseStatusSuccess())
  } catch (error) {
    yield put(pollPurchaseStatusFailure(error.message))
  }
}

function* handleFiatGatewayPurchaseCompleted(
  config: ManaFiatGatewaySagasConfig,
  action: ManaFiatGatewayPurchaseCompletedAction
) {
  const { network, gateway, transactionId, status } = action.payload

  try {
    switch (gateway) {
      case NetworkGatewayType.MOON_PAY:
        const { moonPay: moonPayConfig } = config
        const finalStatuses = [
          MoonPayTransactionStatus.COMPLETED,
          MoonPayTransactionStatus.FAILED
        ]
        const moonPay: MoonPay = new MoonPay(moonPayConfig)
        let statusHasChanged: boolean = false
        let transaction: MoonPayTransaction = yield call(
          [moonPay, moonPay.getTransaction],
          transactionId
        )

        if (!finalStatuses.includes(transaction.status)) {
          yield put(
            openModal(BUY_MANA_WITH_FIAT_FEEDBACK_MODAL_NAME, {
              purchase: moonPay.createPurchase(transaction, network),
              goToUrl: moonPay.getTransactionReceiptUrl(transactionId)
            })
          )
        }

        yield call(upsertPurchase, moonPay, transaction, network)

        while (!statusHasChanged) {
          const { status: newStatus } = transaction

          if (newStatus !== status || finalStatuses.includes(newStatus)) {
            statusHasChanged = true
            yield call(upsertPurchase, moonPay, transaction, network)
            continue
          }

          yield delay(moonPayConfig.pollingDelay || DEFAULT_POLLING_DELAY)

          transaction = yield call(
            [moonPay, moonPay.getTransaction],
            transactionId
          )
        }
      default:
        break
    }
  } catch (error) {
    yield put(
      manaFiatGatewayPurchaseCompletedFailure(
        network,
        gateway,
        transactionId,
        error.message
      )
    )
  }
}

function* handleSetManaPurchase(purchase: Purchase) {
  const finalStatuses = [
    PurchaseStatus.COMPLETE,
    PurchaseStatus.FAILED,
    PurchaseStatus.CANCELLED
  ]
  const { status, network, txHash } = purchase

  if (finalStatuses.includes(status)) {
    let transactionUrl: string | undefined

    if (status === PurchaseStatus.COMPLETE) {
      yield put(fetchWalletRequest())

      if (txHash) {
        const chainId: ChainId = yield call(getChainIdByNetwork, network)
        transactionUrl = getTransactionHref({ txHash }, chainId)
      }
    }

    if (txHash) {
      yield put(addManaPurchaseAsTransaction(purchase))
    }

    yield put(
      openModal(BUY_MANA_WITH_FIAT_FEEDBACK_MODAL_NAME, {
        purchase,
        transactionUrl
      })
    )
  }
}

export function* handleSetPurchase(action: SetPurchaseAction) {
  const { purchase } = action.payload

  if (isManaPurchase(purchase)) {
    yield call(handleSetManaPurchase, purchase)
  }
}
