import {
  fetchCrossChainTransactionRequest,
  fetchTransactionRequest
} from './actions'
import {
  isTransactionAction,
  getTransactionAddressFromAction,
  getTransactionPayloadFromAction
} from './utils'
import { getAddress } from '../wallet/selectors'
import { RootMiddleware } from '../../types'

export const createTransactionMiddleware = () => {
  const middleware: RootMiddleware = store => next => action => {
    if (isTransactionAction(action)) {
      const address =
        getTransactionAddressFromAction(action) || getAddress(store.getState())
      const transaction = getTransactionPayloadFromAction(action)

      if (address) {
        if (transaction.chainId === transaction.toChainId) {
          store.dispatch(
            fetchTransactionRequest(address, transaction.hash, action)
          )
        } else if (transaction.requestId) {
          store.dispatch(
            fetchCrossChainTransactionRequest(
              address,
              transaction.hash,
              transaction.requestId,
              transaction.chainId,
              transaction.toChainId,
              action
            )
          )
        }
      }
    }

    return next(action)
  }

  return middleware
}
