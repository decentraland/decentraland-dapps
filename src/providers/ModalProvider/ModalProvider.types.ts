import { ModalState } from '../../modules/modal/reducer'
import { Modal } from '../../modules/modal/types'
import { closeModal } from '../../modules/modal/actions'

export interface DefaultProps {
  children: React.ReactNode | null
}

export interface Props extends DefaultProps {
  components: Record<string, React.ComponentType<Modal>>
  modals: ModalState
  onClose: typeof closeModal
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onClose'>
