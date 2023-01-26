import { channel } from 'redux-saga'
import { ManaPurchase, Purchase } from './types'

export const purchaseEventsChannel = channel()

export function isManaPurchase(purchase: Purchase): purchase is ManaPurchase {
  return !('nft' in purchase)
}
