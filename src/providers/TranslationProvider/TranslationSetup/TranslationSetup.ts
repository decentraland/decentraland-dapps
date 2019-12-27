import * as React from 'react'
import { Props } from './TranslationSetup.types'

export default class TranslationProvider extends React.PureComponent<Props> {
  UNSAFE_componentWillMount() {
    this.props.setI18n(this.props.intl)
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    const { intl } = nextProps
    if (intl) {
      this.props.setI18n(intl)
    }
  }

  render() {
    return null
  }
}
