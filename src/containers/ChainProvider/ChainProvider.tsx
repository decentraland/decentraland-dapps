import React from 'react'

import { Props } from './ChainProvider.types'

export default class ChainProvider extends React.PureComponent<Props> {
  render() {
    const { children, ...data } = this.props
    return children(data)
  }
}
