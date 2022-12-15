import { lambdaProfileToContentProfile } from './utils'

const mockedProfileFromLambda = {
  timestamp: 343243242,
  avatars: [
    {
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
  ]
}

describe('lambdaProfileToContentProfile', () => {
  describe('when transforming a profile fetched from the profile lambda to the one expected by the catalyst', () => {
    it('should replace the peer urls for just the hash', () => {
      expect(
        lambdaProfileToContentProfile(mockedProfileFromLambda)
      ).toStrictEqual({
        timestamp: 343243242,
        avatars: [
          {
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
                  'bafkreibxwevyktyrqikrlbbfohyec3ayvvjoolzagnlhppyph7q3l5qcky',
                face256:
                  'bafkreiamoamfdlzqodg6yserd74cseci62o7qq4uuwgglz2awxowgw737q'
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
        ]
      })
    })
  })
})
