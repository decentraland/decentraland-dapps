import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Profile as BaseProfile } from 'decentraland-ui/dist/components/Profile/Profile'
import { loadProfileRequest } from '../../modules/profile/actions'
import { getData as getProfiles } from '../../modules/profile/selectors'
import { Props } from './Profile.types'

const Profile = function<T extends React.ElementType>(props: Props<T>) {
  const { address, debounce, inline = true } = props
  const profiles = useSelector(getProfiles)
  const dispatch = useDispatch()

  const timeoutRef = useRef<number | null>()

  const avatar = useMemo(() => {
    const profile = profiles[address]
    return profile ? profile.avatars[0] : null
  }, [address, profiles])

  const onLoadProfile: typeof loadProfileRequest = useCallback(
    (address: string) => dispatch(loadProfileRequest(address)),
    [address]
  )

  useEffect(() => {
    if (!avatar) {
      if (debounce) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = window.setTimeout(
          () => onLoadProfile(address),
          debounce
        )
      } else {
        onLoadProfile(address)
      }
    }

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [address])

  return <BaseProfile {...props} avatar={avatar} inline={inline} />
}

export default Profile
