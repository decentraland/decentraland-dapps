import * as React from 'react'

import { IntercomWidget } from './IntercomWidget'
import { DefaultProps, Props } from './Intercom.types'

export default class Intercom extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    data: {},
    settings: {
      alignment: 'left',
      horizontal_padding: 10,
      vertical_padding: 10
    }
  }

  widget: IntercomWidget

  constructor(props: Props) {
    super(props)
    this.widget = IntercomWidget.getInstance()

    if (!this.widget.appId) {
      this.widget.init(props.appId, props.settings)
    } else {
      if (this.widget.appId !== props.appId) {
        throw new Error(
          `Intercom widget already inicialized with app id "${
            props.appId
          }". Only one intercom widget is allowed.`
        )
      }

      // Else, all settings will be ignored but no notice will be given
    }
  }

  componentDidMount() {
    this.renderWidget()
  }

  componentDidUpdate() {
    this.widget.settings = this.props.settings
    this.renderWidget()
  }

  componentWillUnmount() {
    this.widget.unmount()
  }

  async renderWidget() {
    const { data } = this.props

    try {
      await this.widget.inject()
      this.widget.render(data)
    } catch (error) {
      console.error('Could not render intercom', error.message)
    }
  }

  render() {
    return null
  }
}
