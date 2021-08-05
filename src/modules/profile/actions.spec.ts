import { expect } from 'chai'
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
  SET_PROFILE_AVATAR_DESCRIPTION_SUCCESS
} from './actions'

const address = 'anAddress'
const error = 'anErrorMessage'
const description = 'aDescription'
const version = 1234

describe('when creating the action to clear the profile error', () => {
  it('should return an object representing the action', () => {
    expect(clearProfileError()).deep.equals({
      type: CLEAR_PROFILE_ERROR,
      meta: undefined,
      payload: undefined
    })
  })
})

describe('when creating the action to signal the start of the profile request', () => {
  it('should return an object representing the action', () => {
    expect(loadProfileRequest(address)).deep.equals({
      type: LOAD_PROFILE_REQUEST,
      meta: undefined,
      payload: { address }
    })
  })
})

describe('when creating the action to signal a failure in the profile request', () => {
  it('should return an object representing the action', () => {
    expect(loadProfileFailure(address, error)).deep.equals({
      type: LOAD_PROFILE_FAILURE,
      meta: undefined,
      payload: { address, error }
    })
  })
})

describe('when creating the action to signal a successful profile request', () => {
  it('should return an object representing the action', () => {
    expect(loadProfileSuccess(address, profile)).deep.equals({
      type: LOAD_PROFILE_SUCCESS,
      meta: undefined,
      payload: { address, profile }
    })
  })
})

describe("when creating the action to signal the start of the request to set the decription of a profile's avatar", () => {
  it('should return an object representing the action', () => {
    const description = 'aDescription'

    expect(
      setProfileAvatarDescriptionRequest(address, description)
    ).deep.equals({
      type: SET_PROFILE_AVATAR_DESCRIPTION_REQUEST,
      meta: undefined,
      payload: { address, description }
    })
  })
})

describe("when creating the action to signal a failure in the request to set the description of a profile's avatar", () => {
  it('should return an object representing the action', () => {
    expect(setProfileAvatarDescriptionFailure(address, error)).deep.equals({
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
    ).deep.equals({
      type: SET_PROFILE_AVATAR_DESCRIPTION_SUCCESS,
      meta: undefined,
      payload: { address, description, version }
    })
  })
})

describe('when creating the action to signal a change in a profile', () => {
  it('should return an object representing the action', () => {
    expect(loadProfileRequest(address)).deep.equals({
      type: LOAD_PROFILE_REQUEST,
      meta: undefined,
      payload: { address }
    })
  })
})
