import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { put, call, select } from 'redux-saga/effects'
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
  grantTokenFailure,
  grantTokenRequest,
  grantTokenSuccess,
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

describe('handleAuthorizationFlowRequest', () => {
  describe('when granting a token', () => {
    describe('and authorization flow finishes successfully', () => {
      it('should put the success action', () => {
        return expectSaga(authorizationSaga)
          .provide([
            [put(fetchAuthorizationsRequest([authorization])), undefined],
            [put(grantTokenRequest(authorization)), undefined],
            [call(waitForTx, 'tx-hash'), undefined],
            [select(getData), [{ ...authorization, allowance: '10000' }]]
          ])
          .put(authorizationFlowSuccess(authorization))
          .dispatch(
            authorizationFlowRequest(
              authorization,
              AuthorizationAction.GRANT,
              '10'
            )
          )
          .dispatch(
            grantTokenSuccess(authorization, authorization.chainId, 'tx-hash')
          )
          .dispatch(
            fetchAuthorizationsSuccess([
              [authorization, { ...authorization, allowance: '10000' }]
            ])
          )
          .dispatch(fetchTransactionSuccess({ hash: 'tx-hash' } as Transaction))
          .run({ silenceTimeout: true })
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
            authorizationFlowRequest(
              authorization,
              AuthorizationAction.GRANT,
              '10'
            )
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
            authorizationFlowRequest(
              authorization,
              AuthorizationAction.GRANT,
              '10'
            )
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
            authorizationFlowRequest(
              authorization,
              AuthorizationAction.GRANT,
              '10'
            )
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
