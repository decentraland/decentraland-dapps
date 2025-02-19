import React, { useCallback, useEffect, useState } from 'react'
import { Web2TransactionModal as UIWeb2TransactionModal } from 'decentraland-ui/dist/components/Web2TransactionModal'
import { transactionEvents } from '../../modules/wallet/utils/transactionEvents'
import { TransactionEventType } from '../../modules/wallet/utils/types'
import { isWeb2Wallet } from '../../modules/wallet/utils/providerChecks'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { Web2TransactionModalProps } from './Web2TransactionsModal.types'
type EventData = {
  transactionGasPrice: string
  userBalance: string
  chainId: ChainId
}

/**
 * This component is used to prompt the user to accept or reject a transaction via the Web2TransactionModal
 * and the sendTransaction function.
 */
export const Web2TransactionsModal = (props: Web2TransactionModalProps) => {
  const { isMagicAutoSignEnabled, wallet } = props
  const [eventData, setEventData] = useState<EventData | null>(null)
  const isUsingWeb2Wallet = wallet && isWeb2Wallet(wallet)

  const handleClose = useCallback(() => {
    setEventData(null)
  }, [setEventData])

  const handleAccept = useCallback(() => {
    handleClose()
    transactionEvents.emit(TransactionEventType.ACCEPT)
  }, [handleClose])

  const handleReject = useCallback(() => {
    handleClose()
    transactionEvents.emit(TransactionEventType.REJECT)
  }, [handleClose])

  useEffect(() => {
    const onPrompt = (receivedEventData: EventData) => {
      if (isMagicAutoSignEnabled && isUsingWeb2Wallet) {
        setEventData(receivedEventData)
      } else {
        handleAccept()
      }
    }

    transactionEvents.addListener(TransactionEventType.PROMPT, onPrompt)

    return () => {
      transactionEvents.removeListener(TransactionEventType.PROMPT, onPrompt)
    }
  }, [isUsingWeb2Wallet, isMagicAutoSignEnabled, handleAccept])

  return (
    <UIWeb2TransactionModal
      isOpen={eventData !== null}
      onClose={handleReject}
      onReject={handleReject}
      onAccept={handleAccept}
      chainId={eventData?.chainId ?? ChainId.ETHEREUM_MAINNET}
      transactionCostAmount={eventData?.transactionGasPrice?.toString() ?? '0'}
      userBalanceAmount={eventData?.userBalance?.toString() ?? '0'}
    />
  )
}
