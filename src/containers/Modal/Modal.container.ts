import { connect } from "react-redux";
import { CloseModalAction, closeModal } from "../../modules/modal/actions";
import { RootDispatch } from "../../types";
import Modal from "./Modal";
import { MapDispatchProps, MapStateProps, ModalProps } from "./Modal.types";

const mapState = (_: any): MapStateProps => ({});

const mapDispatch = (
  dispatch: RootDispatch<CloseModalAction>,
): MapDispatchProps => ({
  onCloseModal: (name: string) => dispatch(closeModal(name)),
});

const mergeProps = (
  stateProps: MapStateProps,
  dispatchProps: MapDispatchProps,
  ownProps: ModalProps,
): ModalProps => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps,
});

export default connect(mapState, mapDispatch, mergeProps)(Modal) as any;
