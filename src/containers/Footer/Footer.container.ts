import { connect } from "react-redux";
import { Locale } from "decentraland-ui/dist/components/Language/Language";
import {
  ChangeLocaleAction,
  changeLocale,
} from "../../modules/translation/actions";
import { getLocale, isEnabled } from "../../modules/translation/selectors";
import { RootDispatch } from "../../types";
import Footer from "./Footer";
import { FooterProps, MapDispatchProps, MapStateProps } from "./Footer.types";

const mapState = (state: any): MapStateProps => {
  return {
    locale: getLocale(state),
    hasTranslations: isEnabled(state),
  };
};

const mapDispatch = (
  dispatch: RootDispatch<ChangeLocaleAction>,
): MapDispatchProps => ({
  onChange: (_, { value }) => dispatch(changeLocale(value as Locale)),
});

const mergeProps = (
  stateProps: MapStateProps,
  dispatchProps: MapDispatchProps,
  ownProps: FooterProps,
): FooterProps => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps,
});

export default connect(mapState, mapDispatch, mergeProps)(Footer) as any;
