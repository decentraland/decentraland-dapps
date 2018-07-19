import * as React from 'react'
import { TranslationSetupProps } from './types'

export default class TranslationProvider extends React.PureComponent<
  TranslationSetupProps
> {
  componentWillMount() {
    this.props.setI18n(this.props.intl)
  }

  componentWillReceiveProps(nextProps: TranslationSetupProps) {
    const { intl } = nextProps
    if (intl) {
      this.props.setI18n(intl)
    }
  }

  render() {
    return null
  }
}
