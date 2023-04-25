import React, { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Profile as BaseProfile } from 'decentraland-ui/dist/components/Profile/Profile'
import { loadProfileRequest } from '../../modules/profile/actions'
import { getData as getProfiles } from '../../modules/profile/selectors'
import { Props } from './Profile.types'

const Profile = function<T extends React.ElementType>(props: Props<T>) {
  const { address, debounce, inline = true } = props
  const profiles = useSelector(getProfiles)
  const dispatch = useDispatch()

  let timeout: NodeJS.Timeout | null = null

  const avatar = useMemo(() => {
    const profile = profiles[address]
    return profile ? profile.avatars[0] : null
  }, [address, profiles])

  const onLoadProfile: typeof loadProfileRequest = useCallback(
    (address: string) => dispatch(loadProfileRequest(address)),
    [address]
  )

  const fetchProfile = useCallback(() => {
    if (!avatar) {
      if (debounce) {
        if (timeout) {
          clearTimeout(timeout)
        }
        timeout = setTimeout(() => {
          onLoadProfile(address)
          timeout = null
        }, debounce)
      } else {
        onLoadProfile(address)
      }
    }
  }, [address, avatar, debounce, onLoadProfile])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile, address])

  return <BaseProfile {...props} avatar={avatar} inline={inline} />
}

export default Profile
