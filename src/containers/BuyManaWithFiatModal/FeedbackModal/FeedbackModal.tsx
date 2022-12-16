import React from 'react'
import {
  FeedbackModal as BaseFeedbackModal,
  FeedbackModalI18N
} from 'decentraland-ui/dist/components/BuyManaWithFiatModal/FeedbackModal'
import { t } from '../../../modules/translation/utils'
import { Props } from './FeedbackModal.types'

const getDefaultFeedbackTranslations = (): FeedbackModalI18N => ({
  title: t('@dapps.buyManaWithFiat.feedback_modal.title'),
  description: t('@dapps.buyManaWithFiat.feedback_modal.description'),
  cta: t('@dapps.buyManaWithFiat.feedback_modal.cta'),
  error: ''
})

const FeedbackModal = ({ onClose }: Props) => {
  return (
    <BaseFeedbackModal
      open
      onClose={onClose}
      i18n={getDefaultFeedbackTranslations()}
    />
  )
}

export default React.memo(FeedbackModal)
