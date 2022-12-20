import React from 'react'
import { Network } from '@dcl/schemas'
import {
  FeedbackModal as BaseBuyManaWithFiatFeedbackModal,
  FeedbackModalI18N
} from 'decentraland-ui/dist/components/BuyManaWithFiatModal/FeedbackModal'
import { t } from '../../../modules/translation/utils'
import { Props } from './BuyManaWithFiatFeedbackModal.types'

const getDefaultFeedbackTranslations = (
  network: Network
): FeedbackModalI18N => ({
  title: t(
    `@dapps.buyManaWithFiat.feedback_modal.${network.toLowerCase()}.title`
  ),
  description: t(
    `@dapps.buyManaWithFiat.feedback_modal.${network.toLowerCase()}.description`
  ),
  cta: t(`@dapps.buyManaWithFiat.feedback_modal.${network.toLowerCase()}.cta`),
  error: ''
})

const BuyManaWithFiatFeedbackModal = ({
  metadata: { purchase },
  onClose
}: Props) => {
  return (
    <BaseBuyManaWithFiatFeedbackModal
      open
      onClose={onClose}
      i18n={getDefaultFeedbackTranslations(purchase.network)}
    />
  )
}

export default React.memo(BuyManaWithFiatFeedbackModal)
