import {
  call,
  delay,
  ForkEffect,
  put,
  race,
  select,
  take,
  takeEvery,
  takeLatest
} from 'redux-saga/effects'
import WertWidget from '@wert-io/widget-initializer'
import { LOAD } from 'redux-persistence'
import { Env, getEnv } from '@dcl/ui-env'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { Network } from '@dcl/schemas/dist/dapps/network'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { AuthIdentity } from 'decentraland-crypto-fetch'
import { MarketplaceAPI } from '../../lib/marketplaceApi'
import { getIdentityOrRedirect } from '../identity/sagas'
import { getChainIdByNetwork } from '../../lib/eth'
import {
  pollPurchaseStatusFailure,
  pollPurchaseStatusRequest,
  PollPurchaseStatusRequestAction,
  pollPurchaseStatusSuccess,
  POLL_PURCHASE_STATUS_REQUEST,
  setPurchase,
  SetPurchaseAction,
  SET_PURCHASE,
  OPEN_FIAT_GATEWAY_WIDGET_REQUEST,
  OpenFiatGatewayWidgetRequestAction,
  openFiatGatewayWidgetFailure,
  openFiatGatewayWidgetSuccess
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
  GatewaySagasConfig,
  Purchase,
  PurchaseStatus,
  WertMessage,
  WertPayload,
  WertSession
} from './types'
import { isManaPurchase, purchaseEventsChannel } from './utils'
import { Wallet } from '../wallet/types'
import { isErrorWithMessage } from '../../lib/error'
import {
  GENERATE_IDENTITY_FAILURE,
  GENERATE_IDENTITY_SUCCESS,
  GenerateIdentitySuccessAction
} from '../identity'

const DEFAULT_POLLING_DELAY = 3000
const BUY_MANA_WITH_FIAT_FEEDBACK_MODAL_NAME = 'BuyManaWithFiatFeedbackModal'

export const NO_IDENTITY_ERROR = 'No identity found'
export const MISSING_DATA_ERROR = 'Missing data needed for the message to sign'

export function createGatewaySaga(config: GatewaySagasConfig) {
  function* gatewaySaga(): IterableIterator<ForkEffect> {
    yield takeEvery(
      OPEN_FIAT_GATEWAY_WIDGET_REQUEST,
      handleOpenFiatGatewayWidget
    )
    yield takeEvery(
      OPEN_BUY_MANA_WITH_FIAT_MODAL_REQUEST,
      handleOpenBuyManaWithFiatModal
    )
    yield takeEvery(OPEN_MANA_FIAT_GATEWAY_REQUEST, handleOpenFiatGateway)
    yield takeEvery(
      MANA_FIAT_GATEWAY_PURCHASE_COMPLETED,
      handleFiatGatewayPurchaseCompleted
    )
    yield takeEvery(SET_PURCHASE, handleSetPurchase)
    yield takeLatest(LOAD, handleStorageLoad)
    yield takeEvery(
      POLL_PURCHASE_STATUS_REQUEST,
      handlePollPurchaseStatusRequest
    )
    yield takeEvery(purchaseEventsChannel, handlePurchaseChannelEvent)

    function* handlePurchaseChannelEvent(action: { purchase: Purchase }) {
      const { purchase } = action
      yield put(setPurchase(purchase))
    }
  }

  function* handleOpenFiatGatewayWidget(
    action: OpenFiatGatewayWidgetRequestAction
  ) {
    const { gateway, listeners } = action.payload
    const { target, ...data } = action.payload.data
    try {
      switch (gateway) {
        case FiatGateway.WERT:
          const wertConfig = config[FiatGateway.WERT]
          if (!wertConfig) {
            throw new Error('Wert config not found')
          }

          const { onLoaded, onPending, onSuccess, onClose } = listeners || {}
          const { marketplaceServerURL } = wertConfig

          const wallet: Wallet | null = yield select(getWalletData)
          if (wallet) {
            const identity: AuthIdentity | null = yield call(
              getIdentityOrRedirect
            )

            if (!identity) {
              yield put(openFiatGatewayWidgetFailure(NO_IDENTITY_ERROR))
              return
            }

            const isDev = getEnv() === Env.DEVELOPMENT
            const {
              commodity,
              commodity_amount,
              sc_address,
              sc_input_data
            } = data

            if (commodity && commodity_amount && sc_address && sc_input_data) {
              const { address } = wallet
              const network = data.network || (isDev ? 'sepolia' : 'ethereum')

              const dataToSign: WertMessage = {
                address,
                commodity,
                commodity_amount,
                network,
                sc_address,
                sc_input_data
              }

              const session: WertSession = {
                flow_type: 'simple_full_restrict',
                commodity,
                network,
                wallet_address: address,
                currency: 'USD'
              }

              const payload: WertPayload = {
                message: dataToSign,
                session,
                target
              }

              const marketplaceAPI = new MarketplaceAPI(marketplaceServerURL)

              const response: {
                signature: string
                sessionId: string
              } = yield call(
                [marketplaceAPI, 'signWertMessageAndCreateSession'],
                payload,
                identity
              )

              const { signature, sessionId } = response

              const wertWidget = new WertWidget({
                ...data,
                ...dataToSign,
                session_id: sessionId,
                signature,
                listeners: {
                  loaded: onLoaded,
                  close: onClose,
                  'payment-status': options => {
                    const { status, tx_id } = options
                    if (status === 'pending' && tx_id) {
                      onPending?.({
                        data: options,
                        type: 'payment-status'
                      })
                    } else if (status === 'success') {
                      onSuccess?.({ data: options, type: 'payment-status' })
                    }
                  }
                }
              })

              wertWidget.open()
              yield put(openFiatGatewayWidgetSuccess())
            } else {
              yield put(openFiatGatewayWidgetFailure(MISSING_DATA_ERROR))
            }
          }
      }
    } catch (error) {
      yield put(
        openFiatGatewayWidgetFailure(
          isErrorWithMessage(error) ? error.message : 'Unknown'
        )
      )
    }
  }

  function* handleOpenBuyManaWithFiatModal(
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
          const moonPayConfig = config[NetworkGatewayType.MOON_PAY]
          if (!moonPayConfig) {
            throw new Error('MoonPay config not found')
          }

          goToUrl = new MoonPay(moonPayConfig).getTransactionReceiptUrl(
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
  function* handleOpenFiatGateway(action: OpenManaFiatGatewayRequestAction) {
    const { network, gateway } = action.payload
    const { transak: transakConfig, moonPay: moonPayConfig } = config

    try {
      switch (gateway) {
        case NetworkGatewayType.TRANSAK:
          if (!transakConfig) {
            throw new Error('Transak config not found')
          }

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
          if (!moonPayConfig) {
            throw new Error('MoonPay config not found')
          }

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
          if (!transakConfig) {
            throw new Error('Transak config not found')
          }

          let identity: AuthIdentity | null = yield call(getIdentityOrRedirect)

          if (!identity) {
            const { success } = (yield race({
              success: take(GENERATE_IDENTITY_SUCCESS),
              failure: take(GENERATE_IDENTITY_FAILURE)
            })) as { success: GenerateIdentitySuccessAction }

            if (success) {
              identity = (yield call(getIdentityOrRedirect)) as AuthIdentity
            } else {
              throw new Error(NO_IDENTITY_ERROR)
            }
          }

          const marketplaceAPI = new MarketplaceAPI(transakConfig.apiBaseUrl)
          const transak = new Transak(transakConfig, {}, identity)
          let statusHasChanged = false

          while (!statusHasChanged) {
            const {
              data: { status, transactionHash, errorMessage }
            }: OrderResponse = yield call(
              [marketplaceAPI, 'getOrder'],
              id,
              identity
            )
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
    return gatewaySaga
  }
  function* handleFiatGatewayPurchaseCompleted(
    action: ManaFiatGatewayPurchaseCompletedAction
  ) {
    const { network, gateway, transactionId, status } = action.payload

    try {
      switch (gateway) {
        case NetworkGatewayType.MOON_PAY:
          const { moonPay: moonPayConfig } = config
          if (!moonPayConfig) {
            throw new Error('MoonPay config not found')
          }

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
  function* handleSetPurchase(action: SetPurchaseAction) {
    const { purchase } = action.payload

    if (isManaPurchase(purchase)) {
      yield call(handleSetManaPurchase, purchase)
    }
  }
  return gatewaySaga
}
