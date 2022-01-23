import React from 'react'
import { ToastType } from 'decentraland-ui/dist/components/Toast/Toast'
import MetaTransactionError from '../../../containers/MetaTransactionError'
import { T, t } from '../../translation/utils'
import { Toast } from '../types'

export function getContractAccountErrorToast(): Omit<Toast, 'id'> {
  return {
    type: ToastType.ERROR,
    title: t('@dapps.toasts.meta_transactions.contract_account_error.title'),
    body: (
      <MetaTransactionError
        text={t('@dapps.toasts.meta_transactions.contract_account_error.body')}
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
      />
    ),
    closable: true,
    timeout: 30000
  }
}
