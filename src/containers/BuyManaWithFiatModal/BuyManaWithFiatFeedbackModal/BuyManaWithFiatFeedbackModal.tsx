import React from 'react'
import {
  FeedbackModal as BaseBuyManaWithFiatFeedbackModal,
  FeedbackModalI18N,
  TransactionStatus
} from 'decentraland-ui/dist/components/BuyManaWithFiatModal/FeedbackModal'
import {
  gatewaysNames,
  networksNames
} from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { getAnalytics } from '../../../modules/analytics/utils'
import { Purchase, PurchaseStatus } from '../../../modules/mana/types'
import { t } from '../../../modules/translation/utils'
import { Props } from './BuyManaWithFiatFeedbackModal.types'

const transactionStatuses = {
  [PurchaseStatus.PENDING]: TransactionStatus.PENDING,
  [PurchaseStatus.COMPLETE]: TransactionStatus.SUCCESS,
  [PurchaseStatus.FAILED]: TransactionStatus.FAILURE,
  [PurchaseStatus.CANCELLED]: TransactionStatus.FAILURE
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
  [TransactionStatus.SUCCESS]: ['title', 'description', 'cta'],
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
    propsToTranslateByStatus[status].map(it => [
      it,
      t(`${basePath}.${camelToSnakeCase(it)}`, {
        network: networksNames[network],
        gateway: gatewaysNames[gateway]
      })
    ])
  ) as FeedbackModalI18N
}

const BuyManaWithFiatFeedbackModal = ({
  metadata: { purchase, goToUrl },
  onTryAgain,
  onSelectOtherProvider,
  onClose
}: Props) => {
  const { network, gateway, status: purchaseStatus } = purchase
  const transactionStatus = transactionStatuses[purchaseStatus]
  const analytics = getAnalytics()

  const handleCtaClick = () => {
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
  }

  const handleSecondaryCtaClick = () => {
    if (transactionStatus === TransactionStatus.FAILURE) {
      analytics.track('Select other gateway', {
        network,
        previousGateway: gateway
      })
      onSelectOtherProvider(network)
      onClose()
    }
  }

  return (
    <BaseBuyManaWithFiatFeedbackModal
      open
      status={transactionStatus}
      selectedNetwork={purchase.network}
      selectedGateway={purchase.gateway}
      goToUrl={goToUrl}
      onClickCta={handleCtaClick}
      onClickSecondaryCta={handleSecondaryCtaClick}
      onClose={onClose}
      i18n={getDefaultFeedbackTranslations(purchase, transactionStatus)}
    />
  )
}

export default React.memo(BuyManaWithFiatFeedbackModal)
