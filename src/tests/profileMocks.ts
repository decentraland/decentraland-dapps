import { EntityType } from 'dcl-catalyst-commons/dist/types'
import { ProfileEntity } from '../lib/types'
import { Profile } from '../modules/profile/types'
import { Avatar } from '@dcl/schemas'

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
      face256: 'aFace',
      body: 'aBody'
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

export const profileEntity: ProfileEntity = {
  id: 'anId',
  type: EntityType.PROFILE,
  pointers: [],
  timestamp: 343243242,
  content: [],
  metadata: profile
}
