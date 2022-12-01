import {
  call,
  delay,
  ForkEffect,
  put,
  select,
  takeEvery
} from 'redux-saga/effects'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { setPurchase } from '../mana/actions'
import { Purchase } from '../mana/types'
import { getAddress } from '../wallet/selectors'
import {
  OPEN_MANA_FIAT_GATEWAY,
  OpenManaFiatGatewayAction,
  MANA_FIAT_GATEWAY_PURCHASE_COMPLETED_REQUEST,
  ManaFiatGatewayPurchaseCompletedAction,
  setWidgetUrl,
  manaFiatGatewayPurchaseCompletedFailure
} from './actions'
import { MoonPay } from './moonpay'
import { Transak } from './transak'
import { ManaFiatGatewaySagasConfig } from './types'
import { purchaseEventsChannel } from './utils'
import { Network } from '@dcl/schemas'
import { MoonPayTransaction } from './moonpay/types'

const DEFAULT_POLLING_DELAY = 3000

export function createManaFiatGatewaysSaga(config: ManaFiatGatewaySagasConfig) {
  return function* manaFiatGatewaysSaga(): IterableIterator<ForkEffect> {
    yield takeEvery(OPEN_MANA_FIAT_GATEWAY, handleOpenFiatGateway, config)
    yield takeEvery(
      MANA_FIAT_GATEWAY_PURCHASE_COMPLETED_REQUEST,
      handleFiatGatewayPurchaseCompleted,
      config
    )
    yield takeEvery(purchaseEventsChannel, handlePurchaseChannelEvent)

    function* handlePurchaseChannelEvent(action: { purchase: Purchase }) {
      yield put(setPurchase(action.purchase))
    }
  }
}

function* handleOpenFiatGateway(
  config: ManaFiatGatewaySagasConfig,
  action: OpenManaFiatGatewayAction
) {
  const { network, gateway } = action.payload
  const { transak: transakConfig, moonPay: moonPayConfig } = config
  const address: string = yield select(getAddress)

  switch (gateway) {
    case NetworkGatewayType.TRANSAK:
      const transak = new Transak(transakConfig, address, network)
      transak.openWidget(network)
      break
    case NetworkGatewayType.MOON_PAY:
      const widgetUrl = new MoonPay(moonPayConfig).widgetUrl(address, network)
      yield put(setWidgetUrl(widgetUrl))
      break
    default:
      break
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

function* handleFiatGatewayPurchaseCompleted(
  config: ManaFiatGatewaySagasConfig,
  action: ManaFiatGatewayPurchaseCompletedAction
) {
  const { network, gateway, transactionId, status } = action.payload
  const { moonPay: moonPayConfig } = config

  try {
    switch (gateway) {
      case NetworkGatewayType.MOON_PAY:
        const moonPay = new MoonPay(moonPayConfig)
        let transaction: MoonPayTransaction = yield call(
          [moonPay, moonPay.getTransaction],
          transactionId
        )

        yield call(upsertPurchase, moonPay, transaction, network)

        let statusHasChanged: boolean = status !== transaction.status
        while (!statusHasChanged) {
          const { status: newStatus } = transaction

          if (newStatus !== status) {
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
