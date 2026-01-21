import { ToastPosition } from 'decentraland-ui/dist/components/Toasts/Toasts'
import { hideToast } from '../../modules/toast/actions'
import { Toast } from '../../modules/toast/types'

export type DefaultProps = {
  position?: ToastPosition
  children: React.ReactNode
}

export type Props = DefaultProps & {
  toasts: Toast[]
  onClose: typeof hideToast
}

export type MapStateProps = Pick<Props, 'toasts'>
export type MapDispatchProps = Pick<Props, 'onClose'>
