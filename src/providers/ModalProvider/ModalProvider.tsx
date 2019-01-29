import * as React from 'react'

import { Modal } from '../../modules/modal/types'
import { DefaultProps, Props } from './ModalProvider.types'

export default class ModalProvider extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    children: null
  }

  getCloseHandler(name: string) {
    return (event: React.MouseEvent<HTMLElement>) => {
      this.props.onClose(name)
      event.preventDefault()
    }
  }

  render() {
    const { children, components, modals } = this.props

    const ModalComponents: JSX.Element[] = []

    for (const name in modals) {
      const { open, metadata } = modals[name]
      let ModalComponent: React.ComponentType<Modal> = components[name]

      if (!ModalComponent) {
        if (name) {
          throw new Error(`Couldn't find a modal Component named "${name}"`)
        }
      }

      ModalComponents.push(
        <ModalComponent key={name} open={open} metadata={metadata} />
      )
    }

    return (
      <React.Fragment>
        {children}
        <div className="dapps-modals">{ModalComponents}</div>
      </React.Fragment>
    )
  }
}
