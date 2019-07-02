import * as React from 'react'
import { Modal as ModalComponent } from 'decentraland-ui'

import { ModalProps } from './Modal.types'

export default class Modal extends React.PureComponent<ModalProps> {
  handleClose = () => {
    const { name, onCloseModal } = this.props
    onCloseModal!(name)
  }

  render() {
    // Omit `onCloseModal` from the props we pass down to ModalComponent
    const { name, onCloseModal, ...modalProps } = this.props

    return (
      <ModalComponent
        open={true}
        className={name}
        size="small"
        onClose={this.handleClose}
        {...modalProps}
      />
    )
  }
}
