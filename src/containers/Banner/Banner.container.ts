import { connect } from 'react-redux'
import { Banner } from 'decentraland-ui2'
import {
  getBanner,
  getBannerAssets,
  getError,
  isLoading
} from '../../modules/campaign'
import { MapStateProps, OwnProps } from './Banner.types'

const mapState = (state: any, ownProps: OwnProps): MapStateProps => ({
  fields: getBanner(state, ownProps.id) ?? null,
  assets: getBannerAssets(state, ownProps.id),
  isLoading: isLoading(state),
  error: getError(state)
})

export default connect<MapStateProps, {}, OwnProps>(mapState)(Banner)
