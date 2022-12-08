import React from 'react'
import { Toasts } from 'decentraland-ui/dist/components/Toasts/Toasts'
import { Toast } from 'decentraland-ui/dist/components/Toast/Toast'

import { DefaultProps, Props } from './ToastProvider.types'

export default class ToastProvider extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    children: null
  }

  getCloseHandler = (id: number) => {
    return () => this.props.onClose(id)
  }

  render() {
    const { children, toasts, position: defaultPosition } = this.props

    const ToastComponents: JSX.Element[] = []

    let position = defaultPosition

    for (const id in toasts) {
      const toast = toasts[id]
      position = toast.position ?? position

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
          icon={toast.icon}
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
