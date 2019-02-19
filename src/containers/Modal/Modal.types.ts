import * as React from 'react'
import {
  ModalProps as ModalComponentProps,
  ModalActions,
  ModalContent,
  ModalDescription,
  ModalHeader
} from 'decentraland-ui'

import { closeModal } from '../../modules/modal/actions'

export type ModalProps = ModalComponentProps & {
  name: string
  onCloseModal: typeof closeModal
}

export interface ModalComponent extends React.PureComponent<ModalProps> {
  Actions: typeof ModalActions
  Content: typeof ModalContent
  Description: typeof ModalDescription
  Header: typeof ModalHeader
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<ModalProps, 'onCloseModal'>
