import React from 'react'
import { ToastType } from 'decentraland-ui/dist/components/Toast/Toast'
import MetaTransactionError from '../../../containers/MetaTransactionError'
import { T, t } from '../../translation/utils'
import { Toast } from '../types'

const transactionsInPolygonDocs =
  'https://docs.decentraland.org/blockchain-integration/transactions-in-polygon/'

/* Using only the mainnet gas tracker because at the moment,
 * mumbai.polygonscan doesn't have a gas tracker implemented
 */
const polygonGasTracker = 'https://polygonscan.com/gastracker'

export function getContractAccountErrorToast(): Omit<Toast, 'id'> {
  return {
    type: ToastType.ERROR,
    title: t('@dapps.toasts.meta_transactions.contract_account_error.title'),
    body: (
      <MetaTransactionError
        text={t('@dapps.toasts.meta_transactions.contract_account_error.body')}
        learnMoreLink={transactionsInPolygonDocs}
      />
    ),
    closable: true,
    timeout: 30000
  }
}

export function getInvalidAddressErrorToast(): Omit<Toast, 'id'> {
  return {
    type: ToastType.ERROR,
    title: t('@dapps.toasts.meta_transactions.invalid_address_error.title'),
    body: (
      <MetaTransactionError
        text={
          <T id="@dapps.toasts.meta_transactions.invalid_address_error.body" />
        }
        learnMoreLink={transactionsInPolygonDocs}
      />
    ),
    closable: true,
    timeout: 30000
  }
}
export function getSalePriceTooLowErrorToast(): Omit<Toast, 'id'> {
  return {
    type: ToastType.ERROR,
    title: t('@dapps.toasts.meta_transactions.sale_price_too_low_error.title'),
    body: (
      <MetaTransactionError
        text={
          <T id="@dapps.toasts.meta_transactions.sale_price_too_low_error.body" />
        }
        learnMoreLink={transactionsInPolygonDocs}
      />
    ),
    closable: true,
    timeout: 30000
  }
}

export function getUnknownErrorToast(): Omit<Toast, 'id'> {
  return {
    type: ToastType.ERROR,
    title: t('@dapps.toasts.meta_transactions.unknown_error.title'),
    body: (
      <MetaTransactionError
        text={t('@dapps.toasts.meta_transactions.unknown_error.body')}
        learnMoreLink={transactionsInPolygonDocs}
      />
    ),
    closable: true,
    timeout: 30000
  }
}

export function getHighCongestionErrorToast(): Omit<Toast, 'id'> {
  return {
    type: ToastType.ERROR,
    title: t('@dapps.toasts.meta_transactions.high_congestion_error.title'),
    body: (
      <MetaTransactionError
        text={
          <span>
            {t('@dapps.toasts.meta_transactions.high_congestion_error.body', {
              a: (text: string) => (
                <a
                  href={polygonGasTracker}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {text}
                </a>
              )
            })}
          </span>
        }
        learnMoreLink={transactionsInPolygonDocs}
      />
    ),
    closable: true,
    timeout: 30000
  }
}
