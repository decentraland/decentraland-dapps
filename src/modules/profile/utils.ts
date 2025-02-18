import type { Avatar } from '@dcl/schemas/dist/platform/profile'

export const getHashesByKeyMap = (avatar: Avatar) => {
  const hashesByKey = new Map()
  Object.entries(avatar.avatar.snapshots).forEach(([key, value]) => {
    hashesByKey.set(`${key}.png`, value)
  })
  return hashesByKey
}
