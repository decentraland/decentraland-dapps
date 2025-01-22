import React, { useCallback } from 'react'
import { Banner as BannerComponent } from 'decentraland-ui2'
import { getAnalytics } from '../../modules/analytics/utils'
import { BannerProps } from './Banner.types'
import { sleep } from '../../lib/time'

export const Banner: React.FC<BannerProps> = (props: BannerProps) => {
  const { fields, id, ...rest } = props
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const anchorEvent = (event as unknown) as React.MouseEvent<
        HTMLAnchorElement
      >
      anchorEvent.preventDefault()

      const analytics = getAnalytics()
      if (analytics) {
        analytics.track('CLICK_BANNER', {
          id: fields?.id,
          location: id
        })
      }
      // Delay the navigation to allow the analytics to be tracked
      sleep(300).then(() => {
        window.location.href = (anchorEvent.target as HTMLAnchorElement).href
      })
    },
    [fields?.id, id]
  )

  return <BannerComponent onClick={handleClick} fields={fields} {...rest} />
}
