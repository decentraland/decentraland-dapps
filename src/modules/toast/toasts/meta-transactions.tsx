import React from 'react'
import { ToastType } from 'decentraland-ui/dist/components/Toast/Toast'
import MetaTransactionError from '../../../containers/MetaTransactionError'
import { T, t } from '../../translation/utils'
import { Toast } from '../types'

const transactionsInPolygonDocs =
  'https://docs.decentraland.org/blockchain-integration/transactions-in-polygon/'

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
        text={t('@dapps.toasts.meta_transactions.high_congestion_error.body')}
        learnMoreLink={transactionsInPolygonDocs}
      />
    ),
    closable: true,
    timeout: 30000
  }
}
