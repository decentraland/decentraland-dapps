import { ModalState } from '../../modules/modal/reducer'
import { closeModal } from '../../modules/modal/actions'

export type ModalProps = {
  name: string
  metadata?: any
  onClose: () => ReturnType<typeof closeModal>
}
export type ModalComponent = React.ComponentType<ModalProps>

export type DefaultProps = {
  children: React.ReactNode | null
}

export type Props = DefaultProps & {
  components: Record<string, ModalComponent>
  modals: ModalState
  onClose: typeof closeModal
}

export type MapStateProps = Pick<Props, 'modals'>
export type MapDispatchProps = Pick<Props, 'onClose'>
