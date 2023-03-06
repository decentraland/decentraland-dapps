import { channel } from 'redux-saga'
import { ManaPurchase, NFTPurchase, Purchase } from './types'

export const purchaseEventsChannel = channel()

export function isNFTPurchase(purchase: Purchase): purchase is NFTPurchase {
  return 'nft' in purchase
}

export function isManaPurchase(purchase: Purchase): purchase is ManaPurchase {
  return !isNFTPurchase(purchase)
}
