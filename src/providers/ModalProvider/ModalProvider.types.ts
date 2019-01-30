import { ModalState } from '../../modules/modal/reducer'
import { ModalProps } from '../../modules/modal/types'

export type DefaultProps = {
  children: React.ReactNode | null
}

export type Props = DefaultProps & {
  components: Record<string, React.ComponentType<ModalProps>>
  modals: ModalState
}

export type MapStateProps = Pick<Props, 'modals'>
export type MapDispatchProps = {}
