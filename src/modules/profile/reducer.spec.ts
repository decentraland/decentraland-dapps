import { Avatar } from '@dcl/schemas/dist/platform/profile'
import { profile } from '../../tests/profileMocks'
import { loadingReducer } from '../loading/reducer'
import {
  changeProfile,
  clearProfileError,
  loadProfileFailure,
  loadProfileRequest,
  loadProfileSuccess,
  setProfileAvatarAliasFailure,
  setProfileAvatarAliasRequest,
  setProfileAvatarAliasSuccess,
  setProfileAvatarDescriptionFailure,
  setProfileAvatarDescriptionRequest,
  setProfileAvatarDescriptionSuccess
} from './actions'
import { INITIAL_STATE, profileReducer, ProfileState } from './reducer'

const alias = 'anAlias'
const address = 'anAddress'
const error = 'anError'
const description = 'aDescription'
const version = 1234

const requestActions = [
  setProfileAvatarDescriptionRequest(address, 'aDescription'),
  setProfileAvatarAliasRequest(address, alias),
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

      expect(profileReducer(initialState, action)).toEqual({
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
    request: setProfileAvatarAliasRequest(address, alias),
    failure: setProfileAvatarAliasFailure(address, error)
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

      expect(profileReducer(initialState, action.failure)).toEqual({
        ...INITIAL_STATE,
        error,
        loading: []
      })
    })
  })
})

describe('when reducing the action that signals a successful profile load', () => {
  it('should return a state with the profile set and the loading state cleared', () => {
    const request = loadProfileRequest(address)
    const success = loadProfileSuccess(address, profile)
    const initialState = {
      ...INITIAL_STATE,
      loading: loadingReducer([], request)
    }

    expect(profileReducer(initialState, success)).toEqual({
      ...INITIAL_STATE,
      loading: [],
      data: {
        ...initialState.data,
        [address]: profile
      }
    })
  })
})

describe('when reducing the action that signals a successful profile avatar description change', () => {
  it('should return a state with the avatar description and version changed and the loading state cleared', () => {
    const request = setProfileAvatarDescriptionRequest(address, description)
    const success = setProfileAvatarDescriptionSuccess(
      address,
      description,
      version
    )
    const initialState: ProfileState = {
      ...INITIAL_STATE,
      data: {
        ...INITIAL_STATE.data,
        [address]: profile
      },
      loading: loadingReducer([], request)
    }

    const expectedAvatar: Avatar = {
      ...initialState.data[address].avatars[0],
      version,
      description
    }

    expect(profileReducer(initialState, success)).toEqual({
      ...initialState,
      loading: [],
      data: {
        ...initialState.data,
        [address]: {
          ...profile,
          avatars: [
            expectedAvatar,
            ...initialState.data[address].avatars.slice(1)
          ]
        }
      }
    })
  })
})

describe('when reducing the action that signals a successful profile avatar alias change', () => {
  it('should return a state with the avatar description and version changed and the loading state cleared', () => {
    const request = setProfileAvatarAliasRequest(address, alias)
    const success = setProfileAvatarAliasSuccess(address, alias, version)
    const initialState: ProfileState = {
      ...INITIAL_STATE,
      data: {
        ...INITIAL_STATE.data,
        [address]: profile
      },
      loading: loadingReducer([], request)
    }

    const expectedAvatar: Avatar = {
      ...initialState.data[address].avatars[0],
      version,
      hasClaimedName: true,
      name: alias
    }

    expect(profileReducer(initialState, success)).toEqual({
      ...initialState,
      loading: [],
      data: {
        ...initialState.data,
        [address]: {
          ...profile,
          avatars: [
            expectedAvatar,
            ...initialState.data[address].avatars.slice(1)
          ]
        }
      }
    })
  })
})

describe('when reducing the action to clear the profile error', () => {
  it('should return a state with the profile error as null', () => {
    const initialState = { ...INITIAL_STATE, error: 'someError' }

    expect(profileReducer(initialState, clearProfileError())).toEqual({
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
      ).toEqual({
        ...INITIAL_STATE,
        data: {
          [address]: profile
        }
      })
    })
  })
})
