import React, { useMemo } from 'react'
import { Props as BackToTopButtonUIProps } from 'decentraland-ui/dist/components/BackToTopButton/BackToTopButton.types'
import { BackToTopButton as BackToTopButtonUI } from 'decentraland-ui/dist/components/BackToTopButton'
import { t } from '../../modules/translation/utils'

export const BackToTopButton = (props: BackToTopButtonUIProps) => {
  const i18n = useMemo(
    () => ({
      title: t('@dapps.back_to_top_button.title')
    }),
    []
  )

  return <BackToTopButtonUI i18n={i18n} {...props} />
}
