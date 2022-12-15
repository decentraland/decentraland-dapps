import { Profile } from '../../modules/profile/types'

export const lambdaProfileToContentProfile = (profile: Profile) => {
  return {
    ...profile,
    avatars: profile.avatars.map(avatar => ({
      ...avatar,
      avatar: {
        ...avatar.avatar,
        snapshots: {
          body: avatar.avatar.snapshots.body.replace(
            /.*\/content\/contents\//,
            ''
          ),
          face256: avatar.avatar.snapshots.face256.replace(
            /.*\/content\/contents\//,
            ''
          )
        }
      }
    }))
  }
}
