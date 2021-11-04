import React from 'react'
import { Button as ButtonComponent } from 'decentraland-ui'
import { Props } from './NetworkButton.types'
import NetworkCheck from '../NetworkCheck'

const disabledStyle = { opacity: 0.5, cursor: 'not-allowed', transform: 'none' }

export default class NetworkButton extends React.PureComponent<Props> {
  render() {
    const { network, onClick, ...rest } = this.props
    return (
      <NetworkCheck network={network}>
        {isEnabled => {
          const props = isEnabled ? { onClick } : { style: disabledStyle }
          return <ButtonComponent {...rest} {...props} />
        }}
      </NetworkCheck>
    )
  }
}
