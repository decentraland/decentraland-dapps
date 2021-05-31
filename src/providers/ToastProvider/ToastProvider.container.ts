import { connect } from 'react-redux'
// import { RootDispatch } from '../../types'
import { getToasts } from '../../modules/toast/selectors'
import { hideToast } from '../../modules/toast/actions'
import { MapStateProps, MapDispatchProps } from './ToastProvider.types'
import ToastProvider from './ToastProvider'

type RootDispatch = any

const mapState = (state: any): MapStateProps => ({
  toasts: getToasts(state)
})

const mapDispatch = (dispatch: RootDispatch): MapDispatchProps => ({
  onClose: (id: number) => dispatch(hideToast(id))
})

export default connect(mapState, mapDispatch)(ToastProvider) as any
