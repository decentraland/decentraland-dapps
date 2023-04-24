import * as React from 'react'
import { Profile as BaseProfile } from 'decentraland-ui/dist/components/Profile/Profile'
import { Props } from './Profile.types'

export default class Profile<
  T extends React.ElementType = typeof React.Fragment
> extends React.PureComponent<Props<T>> {
  static defaultProps = {
    inline: true
  }

  timeout: NodeJS.Timeout | null = null

  componentWillMount() {
    this.fetchProfile()
  }

  componentDidUpdate(prevProps: Props<T>) {
    if (prevProps.address !== this.props.address) {
      this.fetchProfile()
    }
  }

  fetchProfile() {
    const { address, avatar, debounce, onLoadProfile } = this.props
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
    const { address } = this.props
    return <BaseProfile address={address} {...this.props} />
  }
}
