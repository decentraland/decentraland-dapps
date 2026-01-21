import { connect } from "react-redux";
import { closeModal } from "../../modules/modal/actions";
import { getState as getModals } from "../../modules/modal/selectors";
import { RootDispatch } from "../../types";
import ModalProvider from "./ModalProvider";
import { MapDispatchProps, MapStateProps } from "./ModalProvider.types";

const mapState = (state: any): MapStateProps => ({
  modals: getModals(state),
});

const mapDispatch = (dispatch: RootDispatch): MapDispatchProps => ({
  onClose: (name: string) => dispatch(closeModal(name)),
});

export default connect(mapState, mapDispatch)(ModalProvider) as any;
