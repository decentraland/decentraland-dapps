import { profile } from '../../tests/profileMocks'
import {
  clearProfileError,
  loadProfileFailure,
  loadProfileRequest,
  loadProfileSuccess,
  CLEAR_PROFILE_ERROR,
  LOAD_PROFILE_FAILURE,
  LOAD_PROFILE_REQUEST,
  LOAD_PROFILE_SUCCESS,
  setProfileAvatarDescriptionFailure,
  setProfileAvatarDescriptionRequest,
  setProfileAvatarDescriptionSuccess,
  SET_PROFILE_AVATAR_DESCRIPTION_FAILURE,
  SET_PROFILE_AVATAR_DESCRIPTION_REQUEST,
  SET_PROFILE_AVATAR_DESCRIPTION_SUCCESS,
  setProfileAvatarAliasRequest,
  SET_PROFILE_AVATAR_ALIAS_REQUEST,
  SET_PROFILE_AVATAR_ALIAS_FAILURE,
  SET_PROFILE_AVATAR_ALIAS_SUCCESS,
  setProfileAvatarAliasSuccess,
  setProfileAvatarAliasFailure,
  loadProfilesRequest,
  LOAD_PROFILES_REQUEST,
  LOAD_PROFILES_FAILURE,
  loadProfilesFailure,
  loadProfilesSuccess,
  LOAD_PROFILES_SUCCESS
} from './actions'
import { Profile } from './types'

const alias = 'anAlias'
const address = 'anAddress'
const error = 'anErrorMessage'
const description = 'aDescription'
const version = 1234

describe('when creating the action to clear the profile error', () => {
  it('should return an object representing the action', () => {
    expect(clearProfileError()).toEqual({
      type: CLEAR_PROFILE_ERROR,
      meta: undefined,
      payload: undefined
    })
  })
})

describe('when creating the action to signal the start of the profile request', () => {
  it('should return an object representing the action', () => {
    expect(loadProfileRequest(address)).toEqual({
      type: LOAD_PROFILE_REQUEST,
      meta: undefined,
      payload: { address }
    })
  })
})

describe('when creating the action to signal a failure in the profile request', () => {
  it('should return an object representing the action', () => {
    expect(loadProfileFailure(address, error)).toEqual({
      type: LOAD_PROFILE_FAILURE,
      meta: undefined,
      payload: { address, error }
    })
  })
})

describe('when creating the action to signal a successful profile request', () => {
  it('should return an object representing the action', () => {
    expect(loadProfileSuccess(address, profile)).toEqual({
      type: LOAD_PROFILE_SUCCESS,
      meta: undefined,
      payload: { address, profile }
    })
  })
})

describe('when creating the action to signal the start of the request of multiple profiles', () => {
  let addresses: string[]

  beforeEach(() => {
    addresses = [address]
  })

  it('should return an object representing the action', () => {
    expect(loadProfilesRequest([address])).toEqual({
      type: LOAD_PROFILES_REQUEST,
      meta: undefined,
      payload: { addresses }
    })
  })
})

describe('when creating the action to signal a failure in the request of multiple profiles', () => {
  it('should return an object representing the action', () => {
    expect(loadProfilesFailure(error)).toEqual({
      type: LOAD_PROFILES_FAILURE,
      meta: undefined,
      payload: { error }
    })
  })
})

describe('when creating the action to signal a successful request of multiple profiles', () => {
  let profiles: Profile[]

  beforeEach(() => {
    profiles = [profile]
  })

  it('should return an object representing the action', () => {
    expect(loadProfilesSuccess([profile])).toEqual({
      type: LOAD_PROFILES_SUCCESS,
      meta: undefined,
      payload: { profiles }
    })
  })
})

describe("when creating the action to signal the start of the request to set the description of a profile's avatar", () => {
  it('should return an object representing the action', () => {
    const description = 'aDescription'

    expect(setProfileAvatarDescriptionRequest(address, description)).toEqual({
      type: SET_PROFILE_AVATAR_DESCRIPTION_REQUEST,
      meta: undefined,
      payload: { address, description }
    })
  })
})

describe("when creating the action to signal a failure in the request to set the description of a profile's avatar", () => {
  it('should return an object representing the action', () => {
    expect(setProfileAvatarDescriptionFailure(address, error)).toEqual({
      type: SET_PROFILE_AVATAR_DESCRIPTION_FAILURE,
      meta: undefined,
      payload: { address, error }
    })
  })
})

describe("when creating the action to signal a successful request to set the description of a profile's avatar", () => {
  it('should return an object representing the action', () => {
    expect(
      setProfileAvatarDescriptionSuccess(address, description, version)
    ).toEqual({
      type: SET_PROFILE_AVATAR_DESCRIPTION_SUCCESS,
      meta: undefined,
      payload: { address, description, version }
    })
  })
})

describe('when creating the action to signal a change in a profile', () => {
  it('should return an object representing the action', () => {
    expect(loadProfileRequest(address)).toEqual({
      type: LOAD_PROFILE_REQUEST,
      meta: undefined,
      payload: { address }
    })
  })
})

describe("when creating the action to signal the start of the request to set the alias of a profile's avatar", () => {
  it('should return an object representing the action', () => {
    expect(setProfileAvatarAliasRequest(address, alias)).toEqual({
      type: SET_PROFILE_AVATAR_ALIAS_REQUEST,
      meta: undefined,
      payload: { address, alias }
    })
  })
})

describe("when creating the action to signal a failure in the request to set the alias of a profile's avatar", () => {
  it('should return an object representing the action', () => {
    expect(setProfileAvatarAliasFailure(address, error)).toEqual({
      type: SET_PROFILE_AVATAR_ALIAS_FAILURE,
      meta: undefined,
      payload: { address, error }
    })
  })
})

describe("when creating the action to signal a successful request to set the alias of a profile's avatar", () => {
  it('should return an object representing the action', () => {
    expect(setProfileAvatarAliasSuccess(address, alias, version)).toEqual({
      type: SET_PROFILE_AVATAR_ALIAS_SUCCESS,
      meta: undefined,
      payload: { alias, address, version }
    })
  })
})
