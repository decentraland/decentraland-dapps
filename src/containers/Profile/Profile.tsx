import * as React from 'react'
import { Profile as BaseProfile } from 'decentraland-ui'
import { Props } from './Profile.types'

export default class Profile extends React.PureComponent<Props> {
  static defaultProps = {
    inline: true
  }

  componentWillMount() {
    this.fetchProfile(this.props)
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.address !== this.props.address) {
      this.fetchProfile(nextProps)
    }
  }

  fetchProfile(props: Props) {
    const { address, avatar, onLoadProfile } = props
    if (!avatar) {
      onLoadProfile(address)
    }
  }

  render() {
    return <BaseProfile {...this.props} />
  }
}
