import { expect } from 'chai'
import {
  changeProfile,
  clearProfileError,
  loadProfileFailure,
  loadProfileRequest,
  loadProfileSuccess,
  setProfileAvatarDescriptionFailure,
  setProfileAvatarDescriptionRequest,
  setProfileAvatarDescriptionSuccess
} from './actions'
import { INITIAL_STATE, profileReducer } from './reducer'
import { profile } from '../../tests/profileMocks'
import { loadingReducer } from '../loading/reducer'

const address = 'anAddress'
const error = 'anError'

const requestActions = [
  setProfileAvatarDescriptionRequest(address, 'aDescription'),
  loadProfileRequest(address)
]

requestActions.forEach(action => {
  describe(`when reducing the "${action.type}" action`, () => {
    it('should return a state with the error nulled and the loading set', () => {
      const initialState = {
        ...INITIAL_STATE,
        error,
        loading: []
      }

      expect(profileReducer(initialState, action)).deep.equals({
        ...INITIAL_STATE,
        error: null,
        loading: loadingReducer(initialState.loading, action)
      })
    })
  })
})

const failureActions = [
  {
    request: setProfileAvatarDescriptionRequest(address, 'aDescription'),
    failure: setProfileAvatarDescriptionFailure(address, error)
  },
  {
    request: loadProfileRequest(address),
    failure: loadProfileFailure(address, error)
  }
]

failureActions.forEach(action => {
  describe(`when reducing the "${action.failure.type}" action`, () => {
    it('should return a state with the error set and the loading state cleared', () => {
      const initialState = {
        ...INITIAL_STATE,
        error: null,
        loading: loadingReducer([], action.request)
      }

      expect(profileReducer(initialState, action.failure)).deep.equals({
        ...INITIAL_STATE,
        error,
        loading: []
      })
    })
  })
})

const successActions = [
  {
    request: setProfileAvatarDescriptionRequest(address, 'aDescription'),
    success: setProfileAvatarDescriptionSuccess(address, profile)
  },
  {
    request: loadProfileRequest(address),
    success: loadProfileSuccess(address, profile)
  }
]

successActions.forEach(action => {
  describe(`when reducing the "${action.success.type}" action`, () => {
    it('should return a state with the profile set and the loading state cleared', () => {
      const initialState = {
        ...INITIAL_STATE,
        loading: loadingReducer([], action.request)
      }

      expect(profileReducer(initialState, action.success)).deep.equals({
        ...INITIAL_STATE,
        loading: [],
        data: {
          ...initialState.data,
          [address]: profile
        }
      })
    })
  })
})

describe('when reducing the action to clear the profile error', () => {
  it('should return a state with the profile error as null', () => {
    const initialState = { ...INITIAL_STATE, error: 'someError' }

    expect(profileReducer(initialState, clearProfileError())).to.deep.equal({
      ...INITIAL_STATE,
      error: null
    })
  })
})

describe('when reducing the action to change the profile', () => {
  describe("when there's no profile for a given address", () => {
    it('should return a state with a stored profile for the given address', () => {
      expect(
        profileReducer(INITIAL_STATE, changeProfile(address, profile))
      ).to.deep.equal({
        ...INITIAL_STATE,
        data: {
          [address]: profile
        }
      })
    })
  })
})
