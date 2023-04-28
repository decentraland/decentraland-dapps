import { ChainId } from '@dcl/schemas'
import { grantTokenRequest } from './actions'
import { revokeTokenRequest } from './actions'
import { revokeTokenSuccess } from './actions'
import { grantTokenSuccess } from './actions'
import {
  FETCH_AUTHORIZATIONS_REQUEST,
  GRANT_TOKEN_REQUEST,
  GRANT_TOKEN_SUCCESS,
  REVOKE_TOKEN_REQUEST
} from './actions'
import { authorizationReducer, INITIAL_STATE } from './reducer'
import { Authorization } from './types'
import { fetchAuthorizationsRequest } from './actions'
import { REVOKE_TOKEN_SUCCESS } from './actions'

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
