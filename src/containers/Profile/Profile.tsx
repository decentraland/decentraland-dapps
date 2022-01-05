import * as React from 'react'
import { Profile as BaseProfile } from 'decentraland-ui/dist/components/Profile/Profile'
import { Props } from './Profile.types'

export default class Profile extends React.PureComponent<Props> {
  static defaultProps = {
    inline: true
  }

  timeout: NodeJS.Timeout | null = null

  componentWillMount() {
    this.fetchProfile(this.props)
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.address !== this.props.address) {
      this.fetchProfile(this.props)
    }
  }

  fetchProfile(props: Props) {
    const { address, avatar, debounce, onLoadProfile } = props
    if (!avatar) {
      if (debounce) {
        if (this.timeout) {
          clearTimeout(this.timeout)
        }
        this.timeout = setTimeout(() => {
          onLoadProfile(address)
          this.timeout = null
        }, debounce)
      } else {
        onLoadProfile(address)
      }
    }
  }

  render() {
    return <BaseProfile {...this.props} />
  }
}
