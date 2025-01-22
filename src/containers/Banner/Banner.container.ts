import { connect } from 'react-redux'
import { Banner } from 'decentraland-ui2'
import {
  getBanner,
  getBannerAssets,
  getError,
  isLoading
} from '../../modules/campaign'
import { getAnalytics } from '../../modules/analytics/utils'
import { MapStateProps, OwnProps } from './Banner.types'
import { sleep } from '../../lib/time'

const mapState = (state: any, ownProps: OwnProps): MapStateProps => {
  const fields = getBanner(state, ownProps.id) ?? null
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const anchorEvent = (event as unknown) as React.MouseEvent<
      HTMLAnchorElement
    >
    anchorEvent.preventDefault()

    const analytics = getAnalytics()
    if (analytics) {
      analytics.track('CLICK_BANNER', {
        id: fields?.id,
        location: ownProps.id
      })
    }
    // Delay the navigation to allow the analytics to be tracked
    sleep(300).then(() => {
      window.location.href = (anchorEvent.target as HTMLAnchorElement).href
    })
  }

  return {
    onClick: handleClick,
    fields,
    assets: getBannerAssets(state, ownProps.id),
    isLoading: isLoading(state),
    error: getError(state)
  }
}

export default connect<MapStateProps, {}, OwnProps>(mapState)(Banner)
