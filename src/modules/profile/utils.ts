import type { Avatar, Snapshots } from '@dcl/schemas/dist/platform/profile'
import type { Profile } from '../../modules/profile/types'

export const lambdaProfileToContentProfile = (profile: Profile) => {
  return {
    ...profile,
    avatars: profile.avatars.map(avatar => ({
      ...avatar,
      avatar: {
        ...avatar.avatar,
        snapshots: Object.entries(avatar.avatar.snapshots)
          .map(([key, value]) => ({
            [key]: value.replace(/.*\//, '')
          }))
          .reduce((acc, curr) => {
            return { ...acc, ...curr }
          }, {}) as Snapshots
      }
    }))
  }
}

export const getHashesByKeyMap = (avatar: Avatar) => {
  const hashesByKey = new Map()
  Object.entries(avatar.avatar.snapshots).forEach(([key, value]) => {
    hashesByKey.set(`${key}.png`, value)
  })
  return hashesByKey
}
