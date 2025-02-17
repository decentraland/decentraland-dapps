import type { Avatar } from '@dcl/schemas/dist/platform/profile'
import type { Profile } from '../modules/profile/types'
import { EntityType } from '@dcl/schemas/dist/platform/entity'
import { ProfileEntity } from '../lib'

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

export const profileFromContent: ProfileEntity = {
  id: 'bafkreidpb6f7oddzioczcm7g46d3mxy43prlbcat4dwjjreneqwgaoiinm',
  type: EntityType.PROFILE,
  pointers: ['0x9c76ae45c36a4da3801a5ba387bbfa3c073ecae2'],
  content: [
    {
      file: 'body.png',
      hash: 'bafkreidikdqefer34vp5qzwxh3efz4rkcoeb5fbehglfs6x6dvahv4fqr4'
    },
    {
      file: 'face256.png',
      hash: 'bafkreichycy5avovlazyrhipjzilqhs2lh7xqmhv2rxhxrykew6itpsn4u'
    }
  ],
  version: 'v3',
  timestamp: 1739828590372,
  metadata: {
    avatars: profile.avatars
  }
}
