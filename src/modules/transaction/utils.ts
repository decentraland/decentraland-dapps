import { AnyAction } from 'redux'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { fork, race, take } from 'redux-saga/effects'
import {
  Transaction,
  TransactionPayload,
  FINISHED_STATUS,
  TransactionStatus,
  FAILED_STATUS,
  SUCCESS_STATUS,
  ActionWithTransactionPayload,
  CrossChainProviderType,
  TRANSACTION_ACTION_FLAG
} from './types'
import {
  FetchTransactionFailureAction,
  FetchTransactionSuccessAction,
  ReplaceTransactionSuccessAction,
  FETCH_TRANSACTION_FAILURE,
  FETCH_TRANSACTION_REQUEST,
  FETCH_TRANSACTION_SUCCESS,
  REPLACE_TRANSACTION_SUCCESS,
  UPDATE_TRANSACTION_STATUS,
  FetchTransactionRequestAction,
  UpdateTransactionStatusAction
} from './actions'

export function buildActionRef(transaction: Transaction) {
  const { actionType, withReceipt, isCrossChain, payload } = transaction

  let transactionPayload: TransactionPayload

  if (
    isCrossChain &&
    transaction.toChainId &&
    transaction.requestId &&
    transaction.crossChainProviderType
  ) {
    transactionPayload = buildCrossChainTransactionFromPayload(
      transaction.chainId,
      transaction.toChainId,
      transaction.hash,
      transaction.requestId,
      payload,
      transaction.crossChainProviderType
    )
  } else {
    const buildFunction = withReceipt
      ? buildTransactionWithReceiptPayload
      : buildTransactionPayload
    transactionPayload = buildFunction(
      transaction.chainId,
      transaction.hash,
      payload,
      transaction.chainId
    )
  }

  return {
    type: actionType,
    payload: transactionPayload
  }
}

export function isTransactionAction(
  action: AnyAction
): action is ActionWithTransactionPayload {
  return Boolean(action.payload && action.payload[TRANSACTION_ACTION_FLAG])
}

export function getTransactionPayloadFromAction(
  action: ActionWithTransactionPayload
): TransactionPayload['_watch_tx'] {
  return action.payload[TRANSACTION_ACTION_FLAG]
}

export function isTransactionActionCrossChain(action: AnyAction): boolean {
  if (isTransactionAction(action)) {
    const { chainId, toChainId } = getTransactionPayloadFromAction(action)
    return chainId !== toChainId && toChainId !== undefined
  }

  return false
}

export function getTransactionFromAction(action: AnyAction): Transaction {
  const transactionPayload: TransactionPayload['_watch_tx'] =
    action.payload[TRANSACTION_ACTION_FLAG]
  const isCrossChain =
    transactionPayload.chainId !== transactionPayload.toChainId
  return {
    events: [],
    hash: transactionPayload.hash,
    timestamp: Date.now(),
    from: transactionPayload.from?.toLowerCase() || '',
    actionType: action.type,
    url: getTransactionHref(
      {
        txHash: transactionPayload.hash,
        address: transactionPayload.from,
        crossChainProviderType: transactionPayload.crossChainProviderType
      },
      transactionPayload.chainId
    ),
    isCrossChain,
    crossChainProviderType: transactionPayload.crossChainProviderType,
    requestId: transactionPayload.requestId,
    withReceipt: transactionPayload.withReceipt,
    payload: transactionPayload.payload,
    chainId: transactionPayload.chainId,
    toChainId: transactionPayload.toChainId,
    // these always start as null, and they get updated by the saga
    status: null,
    nonce: null,
    replacedBy: null
  }
}

export function getTransactionHashFromAction(
  action: ActionWithTransactionPayload
): Transaction['hash'] {
  return getTransactionPayloadFromAction(action).hash
}

export function getTransactionAddressFromAction(
  action: ActionWithTransactionPayload
): Transaction['from'] | undefined {
  return getTransactionPayloadFromAction(action).from
}

export function buildTransactionPayload(
  chainId: ChainId,
  hash: string,
  payload = {},
  toChainId?: ChainId
): TransactionPayload {
  return {
    [TRANSACTION_ACTION_FLAG]: {
      chainId,
      toChainId: toChainId ?? chainId,
      hash,
      payload
    }
  }
}

export function buildCrossChainTransactionFromPayload(
  chainId: ChainId,
  toChainId: ChainId,
  hash: string,
  requestId: string,
  payload = {},
  providerType: CrossChainProviderType = CrossChainProviderType.SQUID
) {
  const txPayload = buildTransactionPayload(chainId, hash, payload, toChainId)
  txPayload[TRANSACTION_ACTION_FLAG].requestId = requestId
  txPayload[TRANSACTION_ACTION_FLAG].crossChainProviderType = providerType
  return txPayload
}

export function buildTransactionWithReceiptPayload(
  chainId: ChainId,
  hash: string,
  payload = {}
): TransactionPayload {
  const txPayload = buildTransactionPayload(chainId, hash, payload, chainId)

  txPayload[TRANSACTION_ACTION_FLAG].withReceipt = true

  return txPayload
}

export function buildTransactionWithFromPayload(
  chainId: ChainId,
  hash: string,
  from: string,
  payload = {}
): TransactionPayload {
  const txPayload = buildTransactionPayload(chainId, hash, payload, chainId)

  txPayload[TRANSACTION_ACTION_FLAG].from = from

  return txPayload
}

export type TransactionHrefOptions = {
  txHash?: string
  address?: string
  crossChainProviderType?: CrossChainProviderType
  blockNumber?: number
}

export function getTransactionHref(
  {
    txHash,
    address,
    blockNumber,
    crossChainProviderType
  }: TransactionHrefOptions,
  network?: number
) {
  if (crossChainProviderType) {
    switch (crossChainProviderType) {
      case CrossChainProviderType.SQUID:
        return `https://axelarscan.io/gmp/${txHash}`
      default:
        console.error('getTransactionHref: Unknown cross chain provider')
        return ''
    }
  }

  const pathname = address
    ? `/address/${address}`
    : blockNumber
    ? `/block/${blockNumber}`
    : `/tx/${txHash}`

  return `${getTransactionOrigin(network)}${pathname}`
}

export function getTransactionOrigin(
  chainId: number = ChainId.ETHEREUM_MAINNET
) {
  switch (chainId) {
    case ChainId.ETHEREUM_ROPSTEN:
      return 'https://ropsten.etherscan.io'
    case ChainId.ETHEREUM_RINKEBY:
      return 'https://rinkeby.etherscan.io'
    case ChainId.ETHEREUM_GOERLI:
      return 'https://goerli.etherscan.io'
    case ChainId.ETHEREUM_SEPOLIA:
      return 'https://sepolia.etherscan.io'
    case ChainId.MATIC_MAINNET:
      return 'https://explorer-mainnet.maticvigil.com'
    case ChainId.MATIC_MUMBAI:
      return 'https://explorer-mumbai.maticvigil.com'
    default:
      return 'https://etherscan.io'
  }
}

export function isPending(status: TransactionStatus | null): boolean {
  return !(FINISHED_STATUS as any[]).includes(status)
}

export function hasFailed(status: TransactionStatus | null): boolean {
  return (FAILED_STATUS as any[]).includes(status)
}

export function hasSucceeded(status: TransactionStatus | null): boolean {
  return (SUCCESS_STATUS as any[]).includes(status)
}

/**
 * Waits for a transaction to be completed.
 *
 * @param txHash - The hash of the transaction to wait for.
 */
export function* waitForTx(txHash: string) {
  let txHashToWaitFor = txHash

  while (true) {
    const {
      success,
      failure
    }: {
      success: FetchTransactionSuccessAction | undefined
      failure: FetchTransactionFailureAction | undefined
    } = yield race({
      success: take(FETCH_TRANSACTION_SUCCESS),
      failure: take(FETCH_TRANSACTION_FAILURE)
    })

    if (success?.payload.transaction.hash === txHashToWaitFor) {
      break
    } else if (
      failure &&
      failure.payload.transaction.hash === txHashToWaitFor
    ) {
      if (failure.payload.status === TransactionStatus.DROPPED) {
        let continueWaiting = true
        // If the transaction was dropped, follow the procedure to check what to do
        while (true) {
          const {
            replace,
            fetchAgain,
            update
          }: {
            replace: ReplaceTransactionSuccessAction | undefined
            fetchAgain: FetchTransactionRequestAction | undefined
            update: UpdateTransactionStatusAction | undefined
          } = yield race({
            replace: take(REPLACE_TRANSACTION_SUCCESS),
            fetchAgain: take(FETCH_TRANSACTION_REQUEST),
            update: take(UPDATE_TRANSACTION_STATUS)
          })

          if (fetchAgain && fetchAgain.payload.hash === txHashToWaitFor) {
            // Re start the transaction fetching process.
            txHashToWaitFor = fetchAgain.payload.hash
            continueWaiting = true
            break
          } else if (replace && replace.payload.hash === txHashToWaitFor) {
            // The transaction hash was replaced for another one, track the other transaction hash.
            txHashToWaitFor = replace.payload.replaceBy
            continueWaiting = true
            break
          } else if (
            update &&
            update.payload.hash === txHashToWaitFor &&
            update.payload.status === TransactionStatus.REPLACED
          ) {
            // A new hash wasn't found, but the transaction was replaced. We should consider the wait finished because we don't know if it failed.
            continueWaiting = false
            break
          }
        }

        if (continueWaiting) {
          continue
        }
        break
      } else {
        throw new Error(
          `The transaction ${txHash} failed to be mined. The status is ${failure.payload.status}.`
        )
      }
    }
  }
}

export const takeEverySuccessfulTx = (
  actionType: string,
  worker: (...args: any[]) => any,
  ...args: Parameters<(...args: any[]) => any>
) =>
  fork(function*() {
    while (true) {
      const action: FetchTransactionSuccessAction = yield take(
        FETCH_TRANSACTION_SUCCESS
      )

      if (action.payload.transaction.actionType === actionType) {
        yield fork(worker, ...args.concat(action))
      }
    }
  })
