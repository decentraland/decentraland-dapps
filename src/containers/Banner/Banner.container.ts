import { connect } from "react-redux";
import {
  getBanner,
  getBannerAssets,
  getContentfulNormalizedLocale,
  getError,
  isLoading,
} from "../../modules/campaign";
import { Banner } from "./Banner";
import { MapStateProps, OwnProps } from "./Banner.types";

const mapState = (state: any, ownProps: OwnProps): MapStateProps => ({
  fields: getBanner(state, ownProps.id) ?? null,
  assets: getBannerAssets(state, ownProps.id),
  isLoading: isLoading(state),
  error: getError(state),
  locale: getContentfulNormalizedLocale(state),
});

export default connect<MapStateProps, {}, OwnProps>(mapState)(Banner);
