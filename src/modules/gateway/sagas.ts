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
import { ethers } from 'ethers'
import { v4 as uuidv4 } from 'uuid'
import { getEnv, Env } from '@dcl/ui-env'
import { AuthIdentity } from 'decentraland-crypto-fetch'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { Network } from '@dcl/schemas/dist/dapps/network'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { getChainIdByNetwork, getSigner } from '../../lib/eth'
import {
  pollPurchaseStatusFailure,
  pollPurchaseStatusRequest,
  PollPurchaseStatusRequestAction,
  pollPurchaseStatusSuccess,
  POLL_PURCHASE_STATUS_REQUEST,
  setPurchase,
  SetPurchaseAction,
  SET_PURCHASE,
  OPEN_CLAIM_NAME_WITH_FIAT_MODAL_REQUEST,
  OpenClaimNameWithFiatModalRequestAction,
  OPEN_FIAT_GATEWAY_WIDGET_REQUEST,
  OpenFiatGatewayWidgetRequestAction
} from '../gateway/actions'
import { openModal } from '../modal/actions'
import { getTransactionHref } from '../transaction/utils'
import { getAddress, getData as getWalletData } from '../wallet/selectors'
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
import {
  FiatGateway,
  ManaFiatGatewaySagasConfig,
  Purchase,
  PurchaseStatus
} from './types'
import { isManaPurchase, purchaseEventsChannel } from './utils'
import { Wallet } from '../wallet/types'
import { getIdentity } from '../identity/utils'
import WertWidget from '@wert-io/widget-initializer'

const DEFAULT_POLLING_DELAY = 3000
const BUY_MANA_WITH_FIAT_FEEDBACK_MODAL_NAME = 'BuyManaWithFiatFeedbackModal'

export function createGatewaySaga(config: ManaFiatGatewaySagasConfig) {
  return function* gatewaySaga(): IterableIterator<ForkEffect> {
    yield takeEvery(
      OPEN_FIAT_GATEWAY_WIDGET_REQUEST,
      handleOpenFiatGatewayWidget
    )
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

function* handleOpenFiatGatewayWidget(
  action: OpenFiatGatewayWidgetRequestAction
) {
  const {
    // SCInputData,
    data,
    gateway,
    listeners: { onLoaded, onPending, onSuccess }
  } = action.payload
  switch (gateway) {
    case FiatGateway.WERT:
      const wallet: Wallet | null = yield select(getWalletData)
      const identity: AuthIdentity | null = yield select(getIdentity)
      if (wallet && identity) {
        const signer: ethers.Signer = yield call(getSigner)
        // const factory = await DCLController__factory.connect(
        //   CONTROLLER_V2_ADDRESS,
        //   signer
        // )

        // const sc_input_data = factory.interface.encodeFunctionData('register', [
        //   ENSName,
        //   wallet.address
        // ])

        // const data = {
        //   address: wallet.address,
        //   commodity: getEnv() === Env.DEVELOPMENT ? 'TTS' : 'MANA', // will be MANA later on
        //   commodity_amount: Number(PRICE),
        //   network: getEnv() === Env.DEVELOPMENT ? 'sepolia' : 'ethereum', // will be wallet.network
        //   sc_address: '0x39421866645065c8d53e2d36906946f33465743d',
        //   sc_input_data: SCInputData
        // }

        if (identity) {
          // const signature = await marketplaceAPI.signWertMessage(data, identity)

          // const signedData = {
          //   ...data,
          //   signature
          // }

          // const nftOptions = {
          //   extra: {
          //     item_info: {
          //       category: 'Decentraland NAME',
          //       author: 'Decentraland',
          //       image_url: `${MARKETPLACE_SERVER_URL}/ens/generate?ens=${ENSName}&width=330&height=330`,
          //       ENSName,
          //       seller: 'DCL Names'
          //     }
          //   }
          // }

          const wertWidget = new WertWidget({
            ...data,
            ...{
              partner_id: '01HGFWXR5CQMYHYSR9KVTKWDT5', // your partner id
              origin:
                getEnv() === Env.DEVELOPMENT
                  ? 'https://sandbox.wert.io'
                  : 'https://widget.wert.io',
              lang: 'en',
              click_id: uuidv4(), // unique id of purchase in your system
              widgetLayoutMode: 'Modal'
            },
            // ...nftOptions,
            listeners: {
              loaded: onLoaded,
              'payment-status': options => {
                if (options.tx_id) {
                  // it's a success event
                  onSuccess?.({ data: options, type: 'payment-status' })
                } else {
                  onPending?.({ data: options, type: 'payment-status' })
                }
              }
            }
          })

          wertWidget.open()
        }
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
    PurchaseStatus.REFUNDED,
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
