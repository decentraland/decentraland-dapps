import { Profile } from '../modules/profile/types'
import { PeerAPI } from './peer'

const peerApi = new PeerAPI('aPeerURL')

describe('peerAPI', () => {
  let address: string
  let profile: Profile
  beforeEach(() => {
    address = 'anAddress'
    profile = {
      avatars: [
        {
          avatar: {
            bodyShape: ''
          },
          description: 'aDescription',
          name: 'aName'
        }
      ]
    } as Profile
  })

  describe('when fetching the user profile', () => {
    describe('and the useCache parameter is passed', () => {
      describe('and the result is in the cache', () => {
        beforeEach(() => {
          peerApi.cache = { [address]: Promise.resolve(profile) }
        })
        it('should get the result from the cache', async () => {
          expect(await peerApi.fetchProfile(address, { useCache: true })).toBe(
            profile
          )
        })
      })

      describe('and the result is not in the cache', () => {
        let profileUpdated: Profile
        beforeEach(() => {
          profileUpdated = {
            avatars: [
              {
                avatar: {
                  bodyShape: ''
                },
                description: 'aDescription',
                name: 'aNewName'
              }
            ]
          } as Profile
          peerApi.cache = {}
          jest
            .spyOn(peerApi.lambdasClient, 'fetchProfiles')
            .mockImplementation(() => Promise.resolve([profileUpdated]))
        })
        it('should fetch the profile', async () => {
          expect(await peerApi.fetchProfile(address, { useCache: true })).toBe(
            profileUpdated
          )
          await expect(peerApi.cache[address]).resolves.toStrictEqual(
            profileUpdated
          )
        })
      })
    })

    describe('and the useCache option parameter is not passed', () => {
      let profileUpdated: Profile
      peerApi.cache = { [address]: Promise.resolve(profile) }
      beforeEach(() => {
        profileUpdated = {
          avatars: [
            {
              avatar: {
                bodyShape: ''
              },
              description: 'aDescription',
              name: 'aNewName'
            }
          ]
        } as Profile
        peerApi.cache = {}
        jest
          .spyOn(peerApi.lambdasClient, 'fetchProfiles')
          .mockImplementation(() => Promise.resolve([profileUpdated]))
      })
      it('should fetch the profile', async () => {
        expect(await peerApi.fetchProfile(address, { useCache: false })).toBe(
          profileUpdated
        )
        await expect(peerApi.cache[address]).resolves.toStrictEqual(
          profileUpdated
        )
      })
    })
  })
})
