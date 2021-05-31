import React from 'react'
import { Toasts, Toast } from 'decentraland-ui'

import { DefaultProps, Props } from './ToastProvider.types'

export default class ToastProvider extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    children: null
  }

  getCloseHandler = (id: number) => {
    return () => this.props.onClose(id)
  }

  render() {
    const { children, toasts, position } = this.props

    const ToastComponents: JSX.Element[] = []

    for (const id in toasts) {
      const toast = toasts[id]

      if (!toast) {
        throw new Error(`Couldn't find a toast for id "${id}"`)
      }

      ToastComponents.push(
        <Toast
          key={id}
          type={toast.type}
          title={toast.title}
          body={toast.body}
          closable={toast.closable}
          timeout={toast.timeout}
          onClose={this.getCloseHandler(toast.id)}
        />
      )
    }

    return (
      <>
        {children}
        <Toasts position={position}>{ToastComponents}</Toasts>
      </>
    )
  }
}
