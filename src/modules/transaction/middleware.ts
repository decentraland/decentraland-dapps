import { fetchTransactionRequest } from './actions'
import {
  isTransactionAction,
  getTransactionAddressFromAction,
  getTransactionHashFromAction
} from './utils'
import { getAddress } from '../wallet/selectors'
import { RootMiddleware } from '../../types'

export const createTransactionMiddleware = () => {
  const middleware: RootMiddleware = store => next => action => {
    if (isTransactionAction(action)) {
      const address =
        getTransactionAddressFromAction(action) || getAddress(store.getState())
      const transactionHash = getTransactionHashFromAction(action)

      if (address) {
        store.dispatch(
          fetchTransactionRequest(address, transactionHash, action)
        )
      }
    }

    return next(action)
  }

  return middleware
}
