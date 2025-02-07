import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { put, call, select, fork, race, take } from 'redux-saga/effects'
import { ContractName } from 'decentraland-transactions'
import { ChainId } from '@dcl/schemas'
import { fetchTransactionSuccess } from '../transaction/actions'
import { Transaction } from '../transaction/types'
import { waitForTx } from '../transaction/utils'
import { getData } from './selectors'
import { AuthorizationError } from './utils'
import { createAuthorizationSaga } from './sagas'
import {
  authorizationFlowFailure,
  authorizationFlowRequest,
  authorizationFlowSuccess,
  fetchAuthorizationsFailure,
  fetchAuthorizationsRequest,
  fetchAuthorizationsSuccess,
  GRANT_TOKEN_FAILURE,
  GRANT_TOKEN_SUCCESS,
  grantTokenFailure,
  grantTokenRequest,
  grantTokenSuccess,
  REVOKE_TOKEN_FAILURE,
  REVOKE_TOKEN_SUCCESS,
  revokeTokenFailure,
  revokeTokenRequest,
  revokeTokenSuccess
} from './actions'
import { Authorization, AuthorizationAction, AuthorizationType } from './types'

const authorizationSaga = createAuthorizationSaga()

const authorization: Authorization = {
  type: AuthorizationType.ALLOWANCE,
  address: '0x9c76ae45c36a4da3801a5ba387bbfa3c073ecae2',
  contractAddress: '0x9c76ae45c36a4da3801a5ba387bbfa3c073ecae3',
  authorizedAddress: '0x9c76ae45c36a4da3801a5ba387bbfa3c073ecae4',
  contractName: ContractName.MANAToken,
  chainId: ChainId.ETHEREUM_GOERLI
}

jest.mock('../analytics/utils', () => ({
  getAnalytics: jest.fn().mockReturnValue({ track: jest.fn() })
}))

describe('handleAuthorizationFlowRequest', () => {
  describe('when granting a token', () => {
    describe('and authorization flow finishes successfully', () => {
      let onAuthorized: (() => void) | undefined

      describe('and onAuthorized is defined', () => {
        let currentAllowance: string
        beforeEach(() => {
          onAuthorized = () => undefined
        })

        describe('and the user already has an allowance set which is not zero', () => {
          beforeEach(() => {
            currentAllowance = '10000'
          })

          it('should revoke the allowance before granting the new one and fork the onAuthorized callback', () => {
            return expectSaga(authorizationSaga)
              .provide([
                [put(fetchAuthorizationsRequest([authorization])), undefined],
                [put(grantTokenRequest(authorization)), undefined],
                [put(revokeTokenRequest(authorization)), undefined],
                [
                  race({
                    success: take(REVOKE_TOKEN_SUCCESS),
                    failure: take(REVOKE_TOKEN_FAILURE)
                  }),
                  { success: { payload: { _watch_tx: { hash: 'tx-hash' } } } }
                ],
                [
                  race({
                    success: take(GRANT_TOKEN_SUCCESS),
                    failure: take(GRANT_TOKEN_FAILURE)
                  }),
                  { success: { payload: { _watch_tx: { hash: 'tx-hash' } } } }
                ],
                [call(waitForTx, 'tx-hash'), undefined],
                [select(getData), [{ ...authorization, allowance: '10000' }]],
                [fork(onAuthorized!), undefined]
              ])
              .put(revokeTokenRequest(authorization))
              .put(grantTokenRequest(authorization))
              .put(authorizationFlowSuccess(authorization))
              .fork(onAuthorized!)
              .dispatch(
                authorizationFlowRequest(
                  authorization,
                  AuthorizationAction.GRANT,
                  {
                    requiredAllowance: '10',
                    currentAllowance,
                    onAuthorized
                  }
                )
              )
              .dispatch(
                fetchAuthorizationsSuccess([
                  [authorization, { ...authorization, allowance: '10000' }]
                ])
              )
              .run({ silenceTimeout: true })
          })
        })

        describe('and the user already has an allowance set which is zero', () => {
          beforeEach(() => {
            currentAllowance = '0'
          })

          it('should put only the grant token request and the success action and fork the onAuthorized callback', () => {
            return expectSaga(authorizationSaga)
              .provide([
                [put(fetchAuthorizationsRequest([authorization])), undefined],
                [put(grantTokenRequest(authorization)), undefined],
                [call(waitForTx, 'tx-hash'), undefined],
                [select(getData), [{ ...authorization, allowance: '10000' }]],
                [fork(onAuthorized!), undefined]
              ])
              .put(authorizationFlowSuccess(authorization))
              .put(grantTokenRequest(authorization))
              .not.put(revokeTokenRequest(authorization))
              .fork(onAuthorized!)
              .dispatch(
                authorizationFlowRequest(
                  authorization,
                  AuthorizationAction.GRANT,
                  {
                    requiredAllowance: '10',
                    currentAllowance,
                    onAuthorized
                  }
                )
              )
              .dispatch(
                grantTokenSuccess(
                  authorization,
                  authorization.chainId,
                  'tx-hash'
                )
              )
              .dispatch(
                fetchAuthorizationsSuccess([
                  [authorization, { ...authorization, allowance: '10000' }]
                ])
              )
              .dispatch(
                fetchTransactionSuccess({ hash: 'tx-hash' } as Transaction)
              )
              .run({ silenceTimeout: true })
          })
        })
      })

      describe('and onAuthorized is not defined', () => {
        beforeEach(() => {
          onAuthorized = undefined
        })

        it('should put the success action without forking the onAuthorized callback', () => {
          return (
            expectSaga(authorizationSaga)
              .provide([
                [put(fetchAuthorizationsRequest([authorization])), undefined],
                [put(grantTokenRequest(authorization)), undefined],
                [call(waitForTx, 'tx-hash'), undefined],
                [select(getData), [{ ...authorization, allowance: '10000' }]]
              ])
              .put(authorizationFlowSuccess(authorization))
              // No fork was called
              .not.fork.like({ fn: () => {} })
              .dispatch(
                authorizationFlowRequest(
                  authorization,
                  AuthorizationAction.GRANT,
                  {
                    requiredAllowance: '10',
                    onAuthorized
                  }
                )
              )
              .dispatch(
                grantTokenSuccess(
                  authorization,
                  authorization.chainId,
                  'tx-hash'
                )
              )
              .dispatch(
                fetchAuthorizationsSuccess([
                  [authorization, { ...authorization, allowance: '10000' }]
                ])
              )
              .dispatch(
                fetchTransactionSuccess({ hash: 'tx-hash' } as Transaction)
              )
              .run({ silenceTimeout: true })
          )
        })
      })
    })

    describe('and grant token transaction fails', () => {
      it('should put the failure action', () => {
        const error = new Error('an error occur')
        return expectSaga(authorizationSaga)
          .provide([
            [put(grantTokenRequest(authorization)), undefined],
            [call(waitForTx, 'tx-hash'), undefined],
            [put(fetchAuthorizationsRequest([authorization])), undefined],
            [
              matchers.select(getData),
              [{ ...authorization, allowance: '10000' }]
            ]
          ])
          .put(authorizationFlowFailure(authorization, error.message))
          .dispatch(
            authorizationFlowRequest(authorization, AuthorizationAction.GRANT, {
              requiredAllowance: '10'
            })
          )
          .dispatch(grantTokenFailure(authorization, error.message))
          .run({ silenceTimeout: true })
      })
    })

    describe('and fetch authorizations action fails', () => {
      it('should put the failure action with correct error message', () => {
        const error = new Error('authorizations fetch error')
        return expectSaga(authorizationSaga)
          .provide([
            [put(grantTokenRequest(authorization)), undefined],
            [call(waitForTx, 'tx-hash'), undefined],
            [put(fetchAuthorizationsRequest([authorization])), undefined],
            [select(getData), [{ ...authorization, allowance: '10000' }]]
          ])
          .put(authorizationFlowFailure(authorization, error.message))
          .dispatch(
            authorizationFlowRequest(authorization, AuthorizationAction.GRANT, {
              requiredAllowance: '10'
            })
          )
          .dispatch(
            grantTokenSuccess(authorization, authorization.chainId, 'tx-hash')
          )
          .dispatch(fetchTransactionSuccess({ hash: 'tx-hash' } as Transaction))
          .dispatch(fetchAuthorizationsFailure([], error.message))
          .run({ silenceTimeout: true })
      })
    })

    describe('and user sets an allowance smaller than the required value', () => {
      it('should put the failure action with correct error message', () => {
        return expectSaga(authorizationSaga)
          .provide([
            [put(grantTokenRequest(authorization)), undefined],
            [call(waitForTx, 'tx-hash'), undefined],
            [put(fetchAuthorizationsRequest([authorization])), undefined],
            [select(getData), [{ ...authorization, allowance: '1' }]]
          ])
          .put(
            authorizationFlowFailure(
              authorization,
              AuthorizationError.INSUFFICIENT_ALLOWANCE
            )
          )
          .dispatch(
            authorizationFlowRequest(authorization, AuthorizationAction.GRANT, {
              requiredAllowance: '10'
            })
          )
          .dispatch(
            grantTokenSuccess(authorization, authorization.chainId, 'tx-hash')
          )
          .dispatch(fetchTransactionSuccess({ hash: 'tx-hash' } as Transaction))
          .dispatch(fetchAuthorizationsSuccess([]))
          .run({ silenceTimeout: true })
      })
    })

    describe('and authorization type is approval', () => {
      describe("and user doesn't have authorization when flow finishes", () => {
        it('should put the failure action with the correct error message', () => {
          const approvalAuth = {
            ...authorization,
            type: AuthorizationType.APPROVAL
          }
          return expectSaga(authorizationSaga)
            .provide([
              [put(grantTokenRequest(approvalAuth)), undefined],
              [call(waitForTx, 'tx-hash'), undefined],
              [put(fetchAuthorizationsRequest([approvalAuth])), undefined],
              [select(getData), []]
            ])
            .put(
              authorizationFlowFailure(
                approvalAuth,
                AuthorizationError.GRANT_FAILED
              )
            )
            .dispatch(
              authorizationFlowRequest(approvalAuth, AuthorizationAction.GRANT)
            )
            .dispatch(
              grantTokenSuccess(approvalAuth, approvalAuth.chainId, 'tx-hash')
            )
            .dispatch(
              fetchTransactionSuccess({ hash: 'tx-hash' } as Transaction)
            )
            .dispatch(fetchAuthorizationsSuccess([]))
            .run({ silenceTimeout: true })
        })
      })
    })
  })

  describe('when revoking a token', () => {
    describe('and authorization flow finishes successfully', () => {
      it('should put the success action', () => {
        return expectSaga(authorizationSaga)
          .provide([
            [put(revokeTokenRequest(authorization)), undefined],
            [call(waitForTx, 'tx-hash'), undefined],
            [put(fetchAuthorizationsRequest([authorization])), undefined],
            [select(getData), []]
          ])
          .put(authorizationFlowSuccess(authorization))
          .dispatch(
            authorizationFlowRequest(authorization, AuthorizationAction.REVOKE)
          )
          .dispatch(
            revokeTokenSuccess(authorization, authorization.chainId, 'tx-hash')
          )
          .dispatch(fetchAuthorizationsSuccess([[authorization, null]]))
          .dispatch(fetchTransactionSuccess({ hash: 'tx-hash' } as Transaction))
          .run({ silenceTimeout: true })
      })
    })

    describe('and revoke token transaction fails', () => {
      it('should put the failure action with correct error message', () => {
        const error = new Error('an error occur')
        return expectSaga(authorizationSaga)
          .provide([
            [put(revokeTokenRequest(authorization)), undefined],
            [call(waitForTx, 'tx-hash'), undefined],
            [put(fetchAuthorizationsRequest([authorization])), undefined],
            [select(getData), []]
          ])
          .put(authorizationFlowFailure(authorization, error.message))
          .dispatch(
            authorizationFlowRequest(authorization, AuthorizationAction.REVOKE)
          )
          .dispatch(revokeTokenFailure(authorization, error.message))
          .run({ silenceTimeout: true })
      })
    })

    describe('and fetch authorizations action fails', () => {
      it('should put the failure action with correct error message', () => {
        const error = new Error('authorizations fetch error')
        return expectSaga(authorizationSaga)
          .provide([
            [put(revokeTokenRequest(authorization)), undefined],
            [call(waitForTx, 'tx-hash'), undefined],
            [put(fetchAuthorizationsRequest([authorization])), undefined],
            [select(getData), []]
          ])
          .put(authorizationFlowFailure(authorization, error.message))
          .dispatch(
            authorizationFlowRequest(authorization, AuthorizationAction.REVOKE)
          )
          .dispatch(
            revokeTokenSuccess(authorization, authorization.chainId, 'tx-hash')
          )
          .dispatch(fetchTransactionSuccess({ hash: 'tx-hash' } as Transaction))
          .dispatch(fetchAuthorizationsFailure([], error.message))
          .run({ silenceTimeout: true })
      })
    })

    describe('and user sets an allowance higher than 0', () => {
      it('should put the failure action with correct error message', () => {
        return expectSaga(authorizationSaga)
          .provide([
            [put(fetchAuthorizationsRequest([authorization])), undefined],
            [put(revokeTokenRequest(authorization)), undefined],
            [call(waitForTx, 'tx-hash'), undefined],
            [select(getData), [{ ...authorization, allowance: '1' }]]
          ])
          .put(
            authorizationFlowFailure(
              authorization,
              AuthorizationError.REVOKE_FAILED
            )
          )
          .dispatch(
            authorizationFlowRequest(authorization, AuthorizationAction.REVOKE)
          )
          .dispatch(
            revokeTokenSuccess(authorization, authorization.chainId, 'tx-hash')
          )
          .dispatch(fetchTransactionSuccess({ hash: 'tx-hash' } as Transaction))
          .dispatch(fetchAuthorizationsSuccess([]))
          .run({ silenceTimeout: true })
      })
    })
  })
})
