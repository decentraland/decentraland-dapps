import * as React from 'react'

import { ModalComponent } from '../../modules/modal/types'
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
      const modal = modals[name]
      let ModalComponent: React.ComponentType<ModalComponent> = components[name]

      if (!ModalComponent) {
        if (name) {
          throw new Error(`Couldn't find a modal Component named "${name}"`)
        }
      }

      ModalComponents.push(<ModalComponent key={name} modal={modal} />)
    }

    return (
      <React.Fragment>
        {children}
        <div className="dapps-modals">{ModalComponents}</div>
      </React.Fragment>
    )
  }
}
