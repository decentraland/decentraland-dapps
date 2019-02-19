import { connect } from 'react-redux'
import { RootDispatch } from '../../types'
import { getState as getModals } from '../../modules/modal/selectors'
import { closeModal } from '../../modules/modal/actions'
import { MapStateProps, MapDispatchProps } from './ModalProvider.types'
import ModalProvider from './ModalProvider'

const mapState = (state: any): MapStateProps => ({
  modals: getModals(state)
})

const mapDispatch = (dispatch: RootDispatch): MapDispatchProps => ({
  onClose: (name: string) => dispatch(closeModal(name))
})

export default connect(
  mapState,
  mapDispatch
)(ModalProvider) as any
