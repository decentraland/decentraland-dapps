import React, { useCallback } from 'react'
import {
  FeedbackModal as BaseBuyManaWithFiatFeedbackModal,
  FeedbackModalI18N,
  TransactionStatus
} from 'decentraland-ui/dist/components/BuyManaWithFiatModal/FeedbackModal'
import { gatewaysNames } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { getNetworkName } from 'decentraland-ui/dist/lib/network'
import { getAnalytics } from '../../../modules/analytics/utils'
import { Purchase, PurchaseStatus } from '../../../modules/gateway/types'
import { t } from '../../../modules/translation/utils'
import { Props } from './BuyManaWithFiatFeedbackModal.types'

const transactionStatuses = {
  [PurchaseStatus.PENDING]: TransactionStatus.PENDING,
  [PurchaseStatus.COMPLETE]: TransactionStatus.SUCCESS,
  [PurchaseStatus.FAILED]: TransactionStatus.FAILURE,
  [PurchaseStatus.CANCELLED]: TransactionStatus.FAILURE,
  [PurchaseStatus.REFUNDED]: TransactionStatus.FAILURE
}

const camelToSnakeCase = (str: string) =>
  str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)

const propsToTranslateByStatus = {
  [TransactionStatus.PENDING]: [
    'title',
    'statusTitle',
    'description',
    'goToText'
  ],
  [TransactionStatus.SUCCESS]: [
    'title',
    'description',
    'cta',
    'viewTransaction'
  ],
  [TransactionStatus.FAILURE]: [
    'title',
    'statusTitle',
    'description',
    'cta',
    'secondaryCta'
  ]
}

const getDefaultFeedbackTranslations = (
  { network, gateway }: Purchase,
  status: TransactionStatus
): FeedbackModalI18N => {
  const basePath = `@dapps.buyManaWithFiat.feedback_modal.${status}`
  return Object.fromEntries(
    propsToTranslateByStatus[status].map(prop => [
      prop,
      t(`${basePath}.${camelToSnakeCase(prop)}`, {
        network: getNetworkName(network),
        gateway: gatewaysNames[gateway]
      })
    ])
  ) as FeedbackModalI18N
}

const BuyManaWithFiatFeedbackModal = ({
  metadata: { purchase, goToUrl, transactionUrl },
  onTryAgain,
  onSelectOtherProvider,
  onClose
}: Props) => {
  const { network, gateway, status: purchaseStatus } = purchase
  const transactionStatus = transactionStatuses[purchaseStatus]
  const analytics = getAnalytics()

  const handleCtaClick = useCallback(() => {
    switch (transactionStatus) {
      case TransactionStatus.SUCCESS:
        onClose()
        break

      case TransactionStatus.FAILURE:
        analytics.track('Try again with same Gateway', { network, gateway })
        onTryAgain(network, gateway)
        onClose()
        break

      default:
        break
    }
  }, [transactionStatus, analytics, network, gateway, onClose, onTryAgain])

  const handleSecondaryCtaClick = useCallback(() => {
    if (transactionStatus === TransactionStatus.FAILURE) {
      analytics.track('Select other gateway', {
        network,
        previousGateway: gateway
      })
      onSelectOtherProvider(network)
      onClose()
    }
  }, [
    transactionStatus,
    analytics,
    network,
    gateway,
    onSelectOtherProvider,
    onClose
  ])

  return (
    <BaseBuyManaWithFiatFeedbackModal
      open
      status={transactionStatus}
      selectedNetwork={purchase.network}
      selectedGateway={purchase.gateway}
      goToUrl={goToUrl}
      transactionUrl={transactionUrl}
      onClickCta={handleCtaClick}
      onClickSecondaryCta={handleSecondaryCtaClick}
      onClose={onClose}
      i18n={getDefaultFeedbackTranslations(purchase, transactionStatus)}
    />
  )
}

export default React.memo(BuyManaWithFiatFeedbackModal)
