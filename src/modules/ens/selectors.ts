import { createSelector } from 'reselect'
import { LoadingState } from '../loading/reducer'
import { Transaction } from '../transaction/types'
import { getAddress } from '../wallet/selectors'
import { getPendingTransactions } from '../transaction/selectors'
import { isEqual } from '../wallet/utils'
import { getName } from 'modules/profile/selectors'
import {
  SET_ENS_RESOLVER_SUCCESS,
  SET_ENS_CONTENT_REQUEST,
  SET_ENS_CONTENT_SUCCESS,
  CLAIM_NAME_SUCCESS,
  ALLOW_CLAIM_MANA_SUCCESS
} from './actions'
import { Authorization, ENS } from './types'
import { ENSState } from './reducer'
import { getDomainFromName } from './utils'

export const getState = (state: any) => state.ens
export const getData = (state: any) => getState(state).data
export const getAuthorizations = (state: any) => getState(state).authorizations
export const getError = (state: any) => getState(state).error
export const getLoading = (state: any) => getState(state).loading

export const getENSList = createSelector<any, ENSState['data'], ENS[]>(
  getData,
  ensData => Object.values(ensData)
)

export const getENSByWallet = createSelector<
  any,
  ENS[],
  string | undefined,
  ENS[]
>(
  getENSList,
  getAddress,
  (ensList, address = '') =>
    ensList.filter(ens => isEqual(ens.address, address))
)

export const getAuthorizationByWallet = createSelector<
  any,
  ENSState['authorizations'],
  string | undefined,
  Authorization
>(
  getAuthorizations,
  getAddress,
  (authorizations, address = '') => authorizations[address]
)

export const getAliases = createSelector<
  any,
  ENS[],
  string | undefined,
  string | null,
  ENS[]
>(
  getENSList,
  getAddress,
  getName,
  (ensList, address = '', name = '') =>
    ensList.filter(
      ens =>
        isEqual(ens.address, address) &&
        name &&
        ens.subdomain === getDomainFromName(name)
    )
)

export const getENSForLand = (state: any, landId: string) => {
  const ensList = getENSList(state)
  return ensList.filter(ens => ens.landId === landId)
}

export const isWaitingTxClaimName = createSelector<any, Transaction[], boolean>(
  getPendingTransactions,
  transactions =>
    transactions.some(
      transaction => CLAIM_NAME_SUCCESS === transaction.actionType
    )
)

export const isWaitingTxAllowMana = createSelector<any, Transaction[], boolean>(
  getPendingTransactions,
  transactions =>
    transactions.some(
      transaction => ALLOW_CLAIM_MANA_SUCCESS === transaction.actionType
    )
)

export const isWaitingTxSetResolver = createSelector<
  any,
  Transaction[],
  boolean
>(
  getPendingTransactions,
  transactions =>
    transactions.some(
      transaction => SET_ENS_RESOLVER_SUCCESS === transaction.actionType
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
  (ensList, loading) =>
    ensList.reduce(
      (obj, ens) => ({
        ...obj,
        [ens.subdomain]: loading.some(
          action =>
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
  (ensList, transactions) =>
    ensList.reduce(
      (obj, ens) => ({
        ...obj,
        [ens.subdomain]: transactions.some(
          transaction =>
            SET_ENS_CONTENT_SUCCESS === transaction.actionType &&
            transaction.payload.ens.subdomain === ens.subdomain
        )
      }),
      {} as Record<string, boolean>
    )
)
