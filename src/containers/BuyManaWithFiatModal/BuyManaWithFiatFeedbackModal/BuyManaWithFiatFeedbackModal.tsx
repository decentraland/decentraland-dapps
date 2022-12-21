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

// TODO: fix the errors raised because of missing translations
const getDefaultFeedbackTranslations = (
  { network, gateway }: Purchase,
  status: TransactionStatus
): FeedbackModalI18N => {
  const basePath = `@dapps.buyManaWithFiat.feedback_modal.${status}`
  return Object.fromEntries(
    [
      'title',
      'statusTitle',
      'description',
      'cta',
      'goToText',
      'secondaryCta'
    ].map(it => [
      it,
      t(`${basePath}.${it}`, {
        network: networksNames[network],
        gateway: gatewaysNames[gateway]
      })
    ])
  ) as FeedbackModalI18N
}

const BuyManaWithFiatFeedbackModal = ({
  metadata: { purchase },
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
        // TODO: remove query params from url (network, gateway, transaction id, and status)
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
      // TODO: is it necessary?
      onClose()
    }
  }

  return (
    <BaseBuyManaWithFiatFeedbackModal
      open
      status={transactionStatus}
      selectedNetwork={purchase.network}
      selectedGateway={purchase.gateway}
      onClickCta={handleCtaClick}
      onClickSecondaryCta={handleSecondaryCtaClick}
      onClose={onClose}
      i18n={getDefaultFeedbackTranslations(purchase, transactionStatus)}
    />
  )
}

export default React.memo(BuyManaWithFiatFeedbackModal)
