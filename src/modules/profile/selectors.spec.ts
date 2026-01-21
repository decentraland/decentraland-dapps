import { profile } from '../../tests/profileMocks'
import {
  loadProfileRequest,
  loadProfilesRequest,
  setProfileAvatarAliasRequest,
  setProfileAvatarDescriptionRequest,
} from './actions'
import { INITIAL_STATE, ProfileState } from './reducer'
import {
  getData,
  getState,
  getError,
  getLoading,
  getProfileOfAddress,
  isLoadingSetProfileAvatarDescription,
  getProfileError,
  isLoadingSetProfileAvatarAlias,
  getProfileOfAddresses,
  getProfilesBeingLoaded,
  isLoadingProfile,
  isLoadingSomeProfiles,
  isLoadingAllProfiles,
} from './selectors'
import { Profile } from './types'

let profileState: { profile: ProfileState }

describe('Profile selectors', () => {
  beforeEach(() => {
    profileState = { profile: INITIAL_STATE }
  })

  describe("when getting the profile's state", () => {
    it('should return the state', () => {
      expect(getState(profileState)).toEqual(profileState.profile)
    })
  })

  describe('when getting if the set profile avatar description request is on going', () => {
    describe('when it is on going', () => {
      beforeEach(() => {
        profileState = {
          ...profileState,
          profile: {
            ...profileState.profile,
            loading: [
              setProfileAvatarDescriptionRequest('anAddress', 'aDescription'),
            ],
          },
        }
      })

      it('should return true', () => {
        expect(isLoadingSetProfileAvatarDescription(profileState)).toBe(true)
      })
    })

    describe("when it isn't on going", () => {
      beforeEach(() => {
        profileState = {
          ...profileState,
          profile: {
            ...profileState.profile,
            loading: [],
          },
        }
      })

      it('should return false', () => {
        expect(isLoadingSetProfileAvatarDescription(profileState)).toBe(false)
      })
    })
  })

  describe('when getting if the set profile avatar alias request is on going', () => {
    describe('when it is on going', () => {
      beforeEach(() => {
        profileState = {
          ...profileState,
          profile: {
            ...profileState.profile,
            loading: [setProfileAvatarAliasRequest('anAlias', 'aDescription')],
          },
        }
      })

      it('should return true', () => {
        expect(isLoadingSetProfileAvatarAlias(profileState)).toBe(true)
      })
    })

    describe("when it isn't on going", () => {
      beforeEach(() => {
        profileState = {
          ...profileState,
          profile: {
            ...profileState.profile,
            loading: [],
          },
        }
      })

      it('should return false', () => {
        expect(isLoadingSetProfileAvatarAlias(profileState)).toBe(false)
      })
    })
  })

  describe("when getting the profile state's data", () => {
    beforeEach(() => {
      profileState = {
        ...profileState,
        profile: { ...profileState.profile, data: { anAddress: profile } },
      }
    })

    it("should return the profile's state data", () => {
      expect(getData(profileState)).toEqual(profileState.profile.data)
    })
  })

  describe('when getting the error state of the profile', () => {
    it("should return the profile state's errors", () => {
      expect(getError(profileState)).toEqual(profileState.profile.error)
    })
  })

  describe('when getting the loading state of the profile', () => {
    it("should return the profile's state loading data", () => {
      expect(getLoading(profileState)).toEqual(profileState.profile.loading)
    })
  })

  describe('when getting the profile of an address', () => {
    describe('when the address exists', () => {
      beforeEach(() => {
        profileState = {
          ...profileState,
          profile: { ...profileState.profile, data: { anAddress: profile } },
        }
      })

      it('should return the profile associated with the address', () => {
        expect(getProfileOfAddress(profileState, 'anAddress')).toEqual(
          profileState.profile.data['anAddress'],
        )
      })
    })

    describe("when the address doesn't exist", () => {
      beforeEach(() => {
        profileState = {
          ...profileState,
          profile: { ...profileState.profile, data: {} },
        }
      })

      it('should return undefined', () => {
        expect(getProfileOfAddress(profileState, 'anAddress')).toBeUndefined()
      })
    })
  })

  describe('when getting the profile error', () => {
    beforeEach(() => {
      profileState = {
        ...profileState,
        profile: {
          ...profileState.profile,
          error: 'aMessage',
        },
      }
    })

    it('should return the error', () => {
      expect(getProfileError(profileState)).toEqual(profileState.profile.error)
    })
  })

  describe('when getting multiple profiles', () => {
    let addresses: string[]
    let profiles: Profile[]

    beforeEach(() => {
      addresses = ['anAddress']
      profiles = [{ ...profile }]
      profileState = {
        ...profileState,
        profile: {
          ...profileState.profile,
          data: {
            [addresses[0]]: profiles[0],
          },
        },
      }
    })

    it("should return the profiles associated with the addresses if they're found", () => {
      expect(getProfileOfAddresses(profileState, addresses)).toEqual(profiles)
    })
  })

  describe('when getting the profiles being loaded', () => {
    let addresses: string[]

    describe('and the profiles being loaded come from single profile requests', () => {
      beforeEach(() => {
        addresses = ['anAddress', 'anotherAddress']
        profileState = {
          ...profileState,
          profile: {
            ...profileState.profile,
            loading: [
              loadProfileRequest(addresses[0]),
              loadProfileRequest(addresses[1]),
            ],
          },
        }
      })

      it('should return the addresses of the profiles being loaded', () => {
        expect(getProfilesBeingLoaded(profileState)).toEqual(addresses)
      })
    })

    describe('and the profiles being loaded come from multiple profile requests', () => {
      beforeEach(() => {
        addresses = ['anAddress', 'anotherAddress', 'someOtherAddress']
        profileState = {
          ...profileState,
          profile: {
            ...profileState.profile,
            loading: [
              loadProfilesRequest([addresses[0], addresses[1]]),
              loadProfilesRequest([addresses[2]]),
            ],
          },
        }
      })

      it('should return the addresses of the profiles being loaded', () => {
        expect(getProfilesBeingLoaded(profileState)).toEqual(addresses)
      })
    })

    describe('and the profiles being loaded come from both single and multiple profile requests', () => {
      beforeEach(() => {
        addresses = ['anAddress', 'anotherAddress', 'someOtherAddress']
        profileState = {
          ...profileState,
          profile: {
            ...profileState.profile,
            loading: [
              loadProfileRequest(addresses[0]),
              loadProfilesRequest([addresses[1], addresses[2]]),
            ],
          },
        }
      })

      it('should return the addresses of the profiles being loaded', () => {
        expect(getProfilesBeingLoaded(profileState)).toEqual(addresses)
      })
    })
  })

  describe('when getting if a profile is being loaded', () => {
    let address: string

    beforeEach(() => {
      address = 'anAddress'
    })

    describe('and the profile is not being loaded', () => {
      beforeEach(() => {
        profileState = {
          ...profileState,
          profile: { ...profileState.profile, loading: [] },
        }
      })

      it('should return false', () => {
        expect(isLoadingProfile(profileState, address)).toBe(false)
      })
    })

    describe('and the profile is being loaded from a single profile request', () => {
      beforeEach(() => {
        profileState = {
          ...profileState,
          profile: {
            ...profileState.profile,
            loading: [loadProfileRequest(address.toLowerCase())],
          },
        }
      })

      it('should return true', () => {
        expect(isLoadingProfile(profileState, address)).toBe(true)
      })
    })

    describe('and the profile is being loaded from a multiple profile request', () => {
      beforeEach(() => {
        profileState = {
          ...profileState,
          profile: {
            ...profileState.profile,
            loading: [loadProfilesRequest([address.toLowerCase()])],
          },
        }
      })

      it('should return true', () => {
        expect(isLoadingProfile(profileState, address)).toBe(true)
      })
    })
  })

  describe('when getting if some of the profiles are being loaded', () => {
    let addresses: string[]

    beforeEach(() => {
      addresses = ['anAddress', 'anotherAddress'].map((address) =>
        address.toLowerCase(),
      )
    })

    describe('and none of the profiles are being loaded', () => {
      beforeEach(() => {
        profileState = {
          ...profileState,
          profile: {
            ...profileState.profile,
            loading: [
              loadProfileRequest(
                'anAddressThatsNotPartOfTheRequestedAddresses',
              ),
            ],
          },
        }
      })

      it('should return false', () => {
        expect(isLoadingSomeProfiles(profileState, addresses)).toBe(false)
      })
    })

    describe('and some of the profiles are being loaded from single profile requests', () => {
      beforeEach(() => {
        profileState = {
          ...profileState,
          profile: {
            ...profileState.profile,
            loading: [loadProfileRequest(addresses[0])],
          },
        }
      })

      it('should return true', () => {
        expect(isLoadingSomeProfiles(profileState, addresses)).toBe(true)
      })
    })
  })

  describe('when getting if all of the profiles are being loaded', () => {
    let addresses: string[]

    beforeEach(() => {
      addresses = ['anAddress', 'anotherAddress'].map((address) =>
        address.toLowerCase(),
      )
    })

    describe('and none of the profiles are being loaded', () => {
      beforeEach(() => {
        profileState = {
          ...profileState,
          profile: {
            ...profileState.profile,
            loading: [
              loadProfileRequest(
                'anAddressThatsNotPartOfTheRequestedAddresses',
              ),
            ],
          },
        }
      })

      it('should return false', () => {
        expect(isLoadingAllProfiles(profileState, addresses)).toBe(false)
      })
    })

    describe('and some of the profiles are being loaded', () => {
      beforeEach(() => {
        profileState = {
          ...profileState,
          profile: {
            ...profileState.profile,
            loading: [loadProfileRequest(addresses[0])],
          },
        }
      })

      it('should return false', () => {
        expect(isLoadingAllProfiles(profileState, addresses)).toBe(false)
      })
    })

    describe('and all of the profiles are being loaded', () => {
      beforeEach(() => {
        profileState = {
          ...profileState,
          profile: {
            ...profileState.profile,
            loading: [loadProfilesRequest(addresses)],
          },
        }
      })

      it('should return true', () => {
        expect(isLoadingAllProfiles(profileState, addresses)).toBe(true)
      })
    })
  })
})
