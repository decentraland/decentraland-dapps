import type { Avatar } from '@dcl/schemas/dist/platform/profile'
import type { Profile } from '../modules/profile/types'

export const avatar: Avatar = {
  userId: 'userId',
  email: 'anEmail',
  name: 'aName',
  hasClaimedName: false,
  description: 'aDesc',
  ethAddress: 'anAddress',
  version: 1,
  avatar: {
    bodyShape: 'aShape',
    snapshots: {
      body:
        'https://peer.decentraland.zone/content/contents/bafkreibxwevyktyrqikrlbbfohyec3ayvvjoolzagnlhppyph7q3l5qcky',
      face256:
        'https://peer.decentraland.zone/content/contents/bafkreiamoamfdlzqodg6yserd74cseci62o7qq4uuwgglz2awxowgw737q'
    },
    eyes: {
      color: { r: 255, g: 255, b: 255 }
    },
    hair: {
      color: { r: 255, g: 255, b: 255 }
    },
    skin: {
      color: { r: 255, g: 255, b: 255 }
    },
    wearables: []
  },
  tutorialStep: 1
}

export const profile: Profile = {
  avatars: [avatar]
}

export const profileFromLambda: Profile & { timestamp: number } = {
  timestamp: 343243242,
  avatars: profile.avatars
}
