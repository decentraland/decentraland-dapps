import { connect } from "react-redux";
// import { RootDispatch } from '../../types'
import { hideToast } from "../../modules/toast/actions";
import { getToasts } from "../../modules/toast/selectors";
import ToastProvider from "./ToastProvider";
import { MapDispatchProps, MapStateProps } from "./ToastProvider.types";

type RootDispatch = any;

const mapState = (state: any): MapStateProps => ({
  toasts: getToasts(state),
});

const mapDispatch = (dispatch: RootDispatch): MapDispatchProps => ({
  onClose: (id: number) => dispatch(hideToast(id)),
});

export default connect(mapState, mapDispatch)(ToastProvider) as any;
