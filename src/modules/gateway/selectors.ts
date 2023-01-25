import { isLoadingType } from '../loading/selectors'
import {
  MANA_FIAT_GATEWAY_PURCHASE_COMPLETED,
  OPEN_MANA_FIAT_GATEWAY_REQUEST
} from './actions'
import { GatewayState } from './reducer'
import { NFTPurchase, Purchase, PurchaseStatus } from './types'
import { isManaPurchase } from './utils'

const sortByTimestamp = (a: Purchase, b: Purchase) =>
  a.timestamp > b.timestamp ? -1 : 1

export const getState: (state: any) => GatewayState = state => state.gateway

export const getData = (state: any) => getState(state).data
export const getLoading = (state: any) => getState(state).loading
export const getError = (state: any) => getState(state).error

export const getPurchases = (state: any) => getData(state).purchases
export const getPendingManaPurchase = (state: any) =>
  getPurchases(state).find(
    purchase =>
      isManaPurchase(purchase) && purchase.status === PurchaseStatus.PENDING
  )

// In case a user buys an NFT multiple times (after selling it), the purchases are sorted by timestamp, so only the last purchase will be taken into account.
export const getNFTPurchase = (
  state: any,
  contractAddress: string,
  tokenId: string
) => {
  const nftPurchases = getPurchases(state).filter(
    purchase => !isManaPurchase(purchase)
  ) as NFTPurchase[]

  return nftPurchases
    .sort(sortByTimestamp)
    .find(
      ({ nft }) =>
        nft.contractAddress == contractAddress && nft.tokenId == tokenId
    )
}

export const isFinishingPurchase = (state: any) =>
  isLoadingType(getLoading(state), MANA_FIAT_GATEWAY_PURCHASE_COMPLETED)
export const isOpeningGateway = (state: any) =>
  isLoadingType(getLoading(state), OPEN_MANA_FIAT_GATEWAY_REQUEST)
