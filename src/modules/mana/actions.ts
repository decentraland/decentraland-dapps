import { action } from 'typesafe-actions'
import { Purchase } from './types'

// Set Purchase
export const SET_PURCHASE = 'Set Purchase'
export const setPurchase = (purchase: Purchase) =>
  action(SET_PURCHASE, { purchase })
export type SetPurchaseAction = ReturnType<typeof setPurchase>
