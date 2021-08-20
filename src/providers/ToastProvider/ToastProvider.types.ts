import { ToastPosition } from 'decentraland-ui'

import { Toast } from '../../modules/toast/types'
import { hideToast } from '../../modules/toast/actions'

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
