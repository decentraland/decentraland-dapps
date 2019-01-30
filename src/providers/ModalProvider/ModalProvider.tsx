import * as React from 'react'

import { ModalProps } from '../../modules/modal/types'
import { DefaultProps, Props } from './ModalProvider.types'

export default class ModalProvider extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    children: null
  }

  render() {
    const { children, components, modals } = this.props

    const ModalComponents: JSX.Element[] = []

    for (const name in modals) {
      const modal = modals[name]
      let ModalComponent: React.ComponentType<ModalProps> = components[name]

      if (!ModalComponent) {
        if (name) {
          throw new Error(`Couldn't find a modal Component named "${name}"`)
        }
      }

      ModalComponents.push(<ModalComponent key={name} modal={modal} />)
    }

    return (
      <>
        {children}
        {ModalComponents}
      </>
    )
  }
}
