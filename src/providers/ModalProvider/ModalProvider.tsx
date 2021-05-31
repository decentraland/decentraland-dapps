import * as React from 'react'

import { DefaultProps, Props, ModalComponent } from './ModalProvider.types'

export default class ModalProvider extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    children: null
  }

  getCloseHandler = (name: string) => {
    return () => this.props.onClose(name)
  }

  render() {
    const { children, components, modals } = this.props

    const ModalComponents: JSX.Element[] = []

    for (const name in modals) {
      const modal = modals[name]
      if (!modal.open) {
        continue
      }

      const Component: ModalComponent = components[name]

      if (!Component) {
        throw new Error(`Couldn't find a modal Component named "${name}"`)
      }

      const onClose = this.getCloseHandler(modal.name)
      ModalComponents.push(
        <Component
          key={name}
          name={name}
          metadata={modal.metadata}
          onClose={onClose}
        />
      )
    }

    return (
      <>
        {children}
        {ModalComponents}
      </>
    )
  }
}
