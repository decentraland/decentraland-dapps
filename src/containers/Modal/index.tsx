import { Modal as ModalComponent } from 'decentraland-ui'
import BaseModal from './Modal.container'

type ExtendedModal = typeof BaseModal & {
  Actions: typeof ModalComponent.Actions
  Content: typeof ModalComponent.Content
  Description: typeof ModalComponent.Description
  Header: typeof ModalComponent.Header
}

const Modal = BaseModal as ExtendedModal
Modal.Actions = ModalComponent.Actions
Modal.Content = ModalComponent.Content
Modal.Description = ModalComponent.Description
Modal.Header = ModalComponent.Header

export default Modal
