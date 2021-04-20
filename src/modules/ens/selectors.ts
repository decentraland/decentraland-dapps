import { createSelector } from 'reselect'
import { getAddress } from '../wallet/selectors'
import { Authorization, ENS } from './types'
import { ENSState } from './reducer'
import { getDomainFromName } from './utils'
import { getName } from '../profile/selectors'

function isEqual(addr1: string, addr2: string) {
  return addr1.toLowerCase() === addr2.toLowerCase()
}

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
>(getENSList, getAddress, (ensList, address = '') =>
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
>(getENSList, getAddress, getName, (ensList, address = '', name = '') =>
  ensList.filter(
    ens =>
      isEqual(ens.address, address) &&
      name &&
      ens.subdomain === getDomainFromName(name)
  )
)
