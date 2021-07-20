import { expect } from 'chai'
import {
  changeProfile
  // LOAD_PROFILE_FAILURE,
  // LOAD_PROFILE_REQUEST,
  // SET_PROFILE_DESCRIPTION_FAILURE,
  // SET_PROFILE_DESCRIPTION_REQUEST
} from './actions'
import { INITIAL_STATE, profileReducer } from './reducer'
import { profile } from '../../tests/profileMocks'

const address = 'anAddress'

// const requestActions = [SET_PROFILE_DESCRIPTION_REQUEST, LOAD_PROFILE_REQUEST]
// const failureActions = [SET_PROFILE_DESCRIPTION_FAILURE, LOAD_PROFILE_FAILURE]

// requestActions.forEach(action => {})

// describe('', () => {
//   // case SET_PROFILE_DESCRIPTION_REQUEST:
//   //   case SET_PROFILE_DESCRIPTION_FAILURE:
//   //   case LOAD_PROFILE_REQUEST:
//   //   case LOAD_PROFILE_FAILURE: {
// })

// describe('', () => {
//   // case SET_PROFILE_DESCRIPTION_SUCCESS:
//   //   case LOAD_PROFILE_SUCCESS: {
// })

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
