import React from 'react'
import { Button as ButtonComponent } from 'decentraland-ui/dist/components/Button/Button'
import ChainCheck from '../ChainCheck'
import { Props } from './ChainButton.types'

const disabledStyle = { opacity: 0.5, cursor: 'not-allowed', transform: 'none' }

export default class ChainButton extends React.PureComponent<Props> {
  render() {
    const { chainId, onClick, ...rest } = this.props
    return (
      <ChainCheck chainId={chainId}>
        {(isEnabled) => {
          const props = isEnabled ? { onClick } : { style: disabledStyle }
          return <ButtonComponent {...rest} {...props} />
        }}
      </ChainCheck>
    )
  }
}
