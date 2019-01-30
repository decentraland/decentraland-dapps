import { ModalState } from '../../modules/modal/reducer'
import { ModalComponent } from '../../modules/modal/types'
import { closeModal } from '../../modules/modal/actions'

export type DefaultProps = {
  children: React.ReactNode | null
}

export type Props = DefaultProps & {
  components: Record<string, React.ComponentType<ModalComponent>>
  modals: ModalState
  onClose: typeof closeModal
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onClose'>
