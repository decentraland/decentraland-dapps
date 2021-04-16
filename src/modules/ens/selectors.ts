import { createSelector } from 'reselect'
import { LoadingState } from '../loading/reducer'
import { Transaction } from '../transaction/types'
import { getAddress } from '../wallet/selectors'
import { getPendingTransactions as getPendingTransactionsByWallet } from '../transaction/selectors'
import { isEqual } from '../wallet/utils'
import {
  SET_ENS_RESOLVER_SUCCESS,
  SET_ENS_CONTENT_REQUEST,
  SET_ENS_CONTENT_SUCCESS,
  CLAIM_NAME_SUCCESS,
  ALLOW_CLAIM_MANA_SUCCESS
} from './actions'
import { Authorization, ENS } from './types'
import { ENSState } from './reducer'

export const getState = (state: any) => state.ens
export const getData = (state: any) => getState(state).data
export const getAuthorizations = (state: any) => getState(state).authorizations
export const getError = (state: any) => getState(state).error
export const getLoading = (state: any) => getState(state).loading

export const getENSList = createSelector<any, ENSState['data'], ENS[]>(
  getData,
  (ensData: any) => Object.values(ensData)
)

export const getENSByWallet = createSelector<
  any,
  ENS[],
  string | undefined,
  ENS[]
>(
  getENSList,
  getAddress,
  (ensList: any, address = '') =>
    ensList.filter((ens: any) => isEqual(ens.address, address))
)

export const getAuthorizationByWallet = createSelector<
  any,
  ENSState['authorizations'],
  string | undefined,
  Authorization
>(
  getAuthorizations,
  getAddress,
  (authorizations: any, address = '') => authorizations[address]
)

export const getENSForLand = (state: any, landId: string) => {
  const ensList = getENSList(state)
  return ensList.filter((ens: any) => ens.landId === landId)
}

const getPendingTransactions = (state: any) => {
  const address = getAddress(state)
  return address ? getPendingTransactionsByWallet(state, address) : []
}

export const isWaitingTxClaimName = createSelector<any, Transaction[], boolean>(
  getPendingTransactions,
  (transactions: any) =>
    transactions.some(
      (transaction: any) => CLAIM_NAME_SUCCESS === transaction.actionType
    )
)

export const isWaitingTxAllowMana = createSelector<any, Transaction[], boolean>(
  getPendingTransactions,
  (transactions: any) =>
    transactions.some(
      (transaction: any) => ALLOW_CLAIM_MANA_SUCCESS === transaction.actionType
    )
)

export const isWaitingTxSetResolver = createSelector<
  any,
  Transaction[],
  boolean
>(
  getPendingTransactions,
  (transactions: any) =>
    transactions.some(
      (transaction: any) => SET_ENS_RESOLVER_SUCCESS === transaction.actionType
    )
)

export const isWaitingTxSetLandContent = (state: any, landId: string) =>
  getPendingTransactions(state).some(
    transaction =>
      SET_ENS_CONTENT_SUCCESS === transaction.actionType &&
      transaction.payload.land.id === landId
  )

export const isLoadingContentBySubdomain = createSelector<
  any,
  ENS[],
  LoadingState,
  Record<string, boolean>
>(
  getENSList,
  getLoading,
  (ensList: any, loading: any) =>
    ensList.reduce(
      (obj: any, ens: any) => ({
        ...obj,
        [ens.subdomain]: loading.some(
          (action: any) =>
            action.type === SET_ENS_CONTENT_REQUEST &&
            action.payload.ens.subdomain === ens.subdomain
        )
      }),
      {} as Record<string, boolean>
    )
)

export const isPendingContentBySubdomain = createSelector<
  any,
  ENS[],
  Transaction[],
  Record<string, boolean>
>(
  getENSList,
  getPendingTransactions,
  (ensList: any, transactions: any) =>
    ensList.reduce(
      (obj: any, ens: any) => ({
        ...obj,
        [ens.subdomain]: transactions.some(
          (transaction: any) =>
            SET_ENS_CONTENT_SUCCESS === transaction.actionType &&
            transaction.payload.ens.subdomain === ens.subdomain
        )
      }),
      {} as Record<string, boolean>
    )
)
