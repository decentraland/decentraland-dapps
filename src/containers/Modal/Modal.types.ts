import { ModalProps as ModalComponentProps } from 'decentraland-ui/dist/components/Modal/Modal'

import { closeModal } from '../../modules/modal/actions'

export type ModalProps = ModalComponentProps & {
  name: string
  onCloseModal?: typeof closeModal
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<ModalProps, 'onCloseModal'>
