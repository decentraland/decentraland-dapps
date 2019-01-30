import { connect } from 'react-redux'
import { RootDispatch } from '../../types'
import { getState as getModals } from '../../modules/modal/selectors'
import { MapStateProps, MapDispatchProps } from './ModalProvider.types'
import ModalProvider from './ModalProvider'

const mapState = (state: any): MapStateProps => ({
  modals: getModals(state)
})

const mapDispatch = (_: RootDispatch): MapDispatchProps => ({})

export default connect(
  mapState,
  mapDispatch
)(ModalProvider) as any
