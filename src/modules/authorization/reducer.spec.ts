import { ChainId } from '@dcl/schemas'
import {
  FETCH_AUTHORIZATIONS_REQUEST,
  GRANT_TOKEN_REQUEST,
  GRANT_TOKEN_SUCCESS,
  REVOKE_TOKEN_REQUEST,
  REVOKE_TOKEN_SUCCESS,
  fetchAuthorizationsRequest,
  revokeTokenSuccess,
  revokeTokenRequest,
  grantTokenRequest,
  grantTokenSuccess,
  authorizationFlowRequest,
  authorizationFlowSuccess,
  authorizationFlowFailure
} from './actions'
import { authorizationReducer, INITIAL_STATE } from './reducer'
import { Authorization, AuthorizationAction } from './types'

describe.each([
  {
    type: GRANT_TOKEN_REQUEST,
    action: grantTokenRequest({} as Authorization),
    addLoading: true
  },
  {
    type: REVOKE_TOKEN_REQUEST,
    action: revokeTokenRequest({} as Authorization),
    addLoading: true
  },
  {
    type: GRANT_TOKEN_SUCCESS,
    action: grantTokenSuccess(
      {} as Authorization,
      ChainId.ETHEREUM_GOERLI,
      'tsx'
    )
  },
  {
    type: REVOKE_TOKEN_SUCCESS,
    action: revokeTokenSuccess(
      {} as Authorization,
      ChainId.ETHEREUM_GOERLI,
      'tsx'
    )
  },
  {
    type: FETCH_AUTHORIZATIONS_REQUEST,
    action: fetchAuthorizationsRequest([]),
    addLoading: true
  }
])('when handling $type action', ({ action, addLoading }) => {
  it('should set error as null', () => {
    const initialStateWithError = {
      ...INITIAL_STATE,
      error: 'Something went wrong'
    }
    expect(authorizationReducer(initialStateWithError, action)).toEqual(
      expect.objectContaining({
        error: null
      })
    )
  })

  if (addLoading) {
    it('should add action to loading array', () => {
      expect(authorizationReducer(INITIAL_STATE, action)).toEqual(
        expect.objectContaining({
          loading: [action]
        })
      )
    })
  } else {
    it('should remove action from loading array', () => {
      const initialStateWithLoading = {
        ...INITIAL_STATE,
        loading: [action]
      }
      expect(authorizationReducer(initialStateWithLoading, action)).toEqual(
        expect.objectContaining({
          loading: []
        })
      )
    })
  }
})

describe('authorization flow actions', () => {
  describe('when handling AUTHORIZATION_FLOW_REQUEST action', () => {
    it('should add action to loading array', () => {
      const requestAction = authorizationFlowRequest(
        {} as Authorization,
        AuthorizationAction.GRANT
      )
      expect(authorizationReducer(INITIAL_STATE, requestAction)).toEqual(
        expect.objectContaining({
          loading: [requestAction]
        })
      )
    })

    it('should remove error', () => {
      const initialStateWithError = {
        ...INITIAL_STATE,
        authorizationFlowError: 'Some error'
      }

      expect(
        authorizationReducer(
          initialStateWithError,
          authorizationFlowRequest(
            {} as Authorization,
            AuthorizationAction.GRANT
          )
        )
      ).toEqual(
        expect.objectContaining({
          authorizationFlowError: null
        })
      )
    })
  })

  describe('when handling AUTHORIZATION_FLOW_SUCCESS action', () => {
    it('should remove action from loading array', () => {
      const successAction = authorizationFlowSuccess({} as Authorization)
      const initialStateWithLoading = {
        ...INITIAL_STATE,
        loading: [successAction]
      }
      expect(
        authorizationReducer(initialStateWithLoading, successAction)
      ).toEqual(
        expect.objectContaining({
          loading: []
        })
      )
    })

    it('should remove error', () => {
      const initialStateWithError = {
        ...INITIAL_STATE,
        authorizationFlowError: 'Some error'
      }

      expect(
        authorizationReducer(
          initialStateWithError,
          authorizationFlowSuccess({} as Authorization)
        )
      ).toEqual(
        expect.objectContaining({
          authorizationFlowError: null
        })
      )
    })
  })

  describe('when handling AUTHORIZATION_FLOW_FAILURE action', () => {
    it('should remove action from loading array', () => {
      const failureAction = authorizationFlowFailure(
        {} as Authorization,
        'an error'
      )
      const initialStateWithLoading = {
        ...INITIAL_STATE,
        loading: [failureAction]
      }
      expect(
        authorizationReducer(initialStateWithLoading, failureAction)
      ).toEqual(
        expect.objectContaining({
          loading: []
        })
      )
    })

    it('should add error', () => {
      expect(
        authorizationReducer(
          INITIAL_STATE,
          authorizationFlowFailure({} as Authorization, 'an error')
        )
      ).toEqual(
        expect.objectContaining({
          authorizationFlowError: 'an error'
        })
      )
    })
  })
})
