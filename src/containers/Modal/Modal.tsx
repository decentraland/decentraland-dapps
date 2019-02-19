import * as React from 'react'
import { Modal as ModalComponent } from 'decentraland-ui'

import { ModalProps } from './Modal.types'

export default class Modal extends React.PureComponent<ModalProps> {
  handleOnClose = () => {
    const { name, onCloseModal } = this.props
    onCloseModal(name)
  }

  render() {
    const { name, ...modalProps } = this.props

    return (
      <ModalComponent
        open={true}
        className={name}
        size="small"
        onClose={this.handleOnClose}
        {...modalProps}
      />
    )
  }
}
