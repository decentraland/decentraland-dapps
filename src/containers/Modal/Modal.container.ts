import { connect } from 'react-redux'
import { RouterAction } from 'react-router-redux'

import Modal from './Modal'
import { ModalProps, MapStateProps, MapDispatchProps } from './Modal.types'
import { RootDispatch } from '../../types'
import { closeModal } from '../../modules/modal/actions'

const mapState = (_: any): MapStateProps => ({})

const mapDispatch = (
  dispatch: RootDispatch<RouterAction>
): MapDispatchProps => ({
  onCloseModal: (name: string) => dispatch(closeModal(name))
})

const mergeProps = (
  stateProps: MapStateProps,
  dispatchProps: MapDispatchProps,
  ownProps: ModalProps
): ModalProps => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps
})

export default connect(
  mapState,
  mapDispatch,
  mergeProps
)(Modal) as any
