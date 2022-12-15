import { Snapshots } from '@dcl/schemas'
import { Profile } from '../../modules/profile/types'

export const lambdaProfileToContentProfile = (profile: Profile) => {
  return {
    ...profile,
    avatars: profile.avatars.map(avatar => ({
      ...avatar,
      avatar: {
        ...avatar.avatar,
        snapshots: Object.entries(avatar.avatar.snapshots)
          .map(([key, value]) => ({
            [key]: value.replace(/.*\/content\/contents\//, '')
          }))
          .reduce((acc, curr) => {
            return { ...acc, ...curr }
          }, {}) as Snapshots
      }
    }))
  }
}
