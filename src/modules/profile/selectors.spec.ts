import { expect } from 'chai'
import { profile } from '../../tests/profileMocks'
import { INITIAL_STATE } from './reducer'
import {
  getData,
  getState,
  getError,
  getLoading,
  getProfileOfAddress
} from './selectors'

let profileState: any

describe('Profile selectors', () => {
  beforeEach(() => {
    profileState = { profile: INITIAL_STATE }
  })

  describe("when getting the profile's state", () => {
    it('should return the state', () => {
      expect(getState(profileState)).equals(profileState.profile)
    })
  })

  describe("when getting the profile state's data", () => {
    beforeEach(() => {
      profileState = {
        ...profileState,
        profile: { ...profileState.profile, data: { anAddress: profile } }
      }
    })

    it("should return the profile's state data", () => {
      expect(getData(profileState)).equals(profileState.profile.data)
    })
  })

  describe('when getting the error state of the profile', () => {
    it("should return the profile state's errors", () => {
      expect(getError(profileState)).equals(profileState.profile.error)
    })
  })

  describe('when getting the loading state of the profile', () => {
    it("should return the profile's state loading data", () => {
      expect(getLoading(profileState)).equals(profileState.profile.loading)
    })
  })

  describe('when getting the profile o an address', () => {
    describe('when the address exists', () => {
      beforeEach(() => {
        profileState = {
          ...profileState,
          profile: { ...profileState.profile, data: { anAddress: profile } }
        }
      })

      it('should return the profile associated with the address', () => {
        expect(getProfileOfAddress(profileState, 'anAddress')).equals(
          profileState.profile.data['anAddress']
        )
      })
    })

    describe("when the address doesn't exist", () => {
      beforeEach(() => {
        profileState = {
          ...profileState,
          profile: { ...profileState.profile, data: {} }
        }
      })

      it('should return undefined', () => {
        expect(getProfileOfAddress(profileState, 'anAddress')).is.undefined
      })
    })
  })
})
