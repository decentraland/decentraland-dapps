import {
  AUTHORIZATION_FLOW_FAILURE,
  AUTHORIZATION_FLOW_REQUEST,
  AUTHORIZATION_FLOW_SUCCESS,
  authorizationFlowFailure,
  authorizationFlowRequest,
  authorizationFlowSuccess
} from './actions'
import { Authorization, AuthorizationAction } from './types'

let authorization: Authorization

describe('authorization flow actions', () => {
  beforeEach(() => {
    authorization = {} as Authorization
  })

  describe('when calling authorizationFlowRequest action', () => {
    it('should return the correct action type and payload', () => {
      const authorizationAction = AuthorizationAction.GRANT
      const allowance = '10'
      expect(
        authorizationFlowRequest(authorization, authorizationAction, allowance)
      ).toEqual({
        type: AUTHORIZATION_FLOW_REQUEST,
        payload: {
          authorization,
          authorizationAction,
          allowance
        }
      })
    })
  })

  describe('when calling authorizationFlowSuccess action', () => {
    it('should return the correct action type and payload', () => {
      expect(authorizationFlowSuccess(authorization)).toEqual({
        type: AUTHORIZATION_FLOW_SUCCESS,
        payload: {
          authorization
        }
      })
    })
  })

  describe('when calling authorizationFlowFailure action', () => {
    it('should return the correct action type and payload', () => {
      const error = 'some error'
      expect(authorizationFlowFailure(authorization, error)).toEqual({
        type: AUTHORIZATION_FLOW_FAILURE,
        payload: {
          authorization,
          error
        }
      })
    })
  })
})
