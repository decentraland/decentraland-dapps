import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { ContractName } from 'decentraland-transactions'
import { INITIAL_STATE } from './reducer'
import {
  getState,
  getData,
  getLoading,
  isLoading,
  getError,
  getAuthorizationFlowError,
  getTransactions,
  getAllowTransactions,
  getApproveTransactions,
  isAuthorizing
} from './selectors'
import {
  AUTHORIZATION_FLOW_REQUEST,
  GRANT_TOKEN_SUCCESS,
  REVOKE_TOKEN_REQUEST,
  REVOKE_TOKEN_SUCCESS
} from './actions'
import { AuthorizationType } from './types'

describe('Authorization selectors', () => {
  let mockState: any
  let mockAuthorization: any
  let mockTransaction: any

  beforeEach(() => {
    mockAuthorization = {
      type: AuthorizationType.ALLOWANCE,
      address: '0x1',
      contractAddress: '0x2',
      authorizedAddress: '0x3',
      contractName: ContractName.MANAToken,
      chainId: ChainId.ETHEREUM_MAINNET,
      allowance: '1000'
    }

    mockTransaction = {
      hash: '0x123',
      payload: {
        authorization: mockAuthorization
      },
      actionType: GRANT_TOKEN_SUCCESS
    }

    mockState = {
      authorization: {
        ...INITIAL_STATE,
        data: [mockAuthorization],
        loading: [{ type: AUTHORIZATION_FLOW_REQUEST }],
        error: 'test error',
        authorizationFlowError: 'flow error'
      }
    }
  })

  describe('when getting the authorization state', () => {
    it('should return the authorization state', () => {
      expect(getState(mockState)).toEqual(mockState.authorization)
    })
  })

  describe('when getting the authorization data', () => {
    it('should return the authorization data', () => {
      expect(getData(mockState)).toEqual([mockAuthorization])
    })
  })

  describe('when getting the loading state', () => {
    it('should return the loading state', () => {
      expect(getLoading(mockState)).toEqual([
        { type: AUTHORIZATION_FLOW_REQUEST }
      ])
    })
  })

  describe('when checking if authorization is loading', () => {
    describe('and there are loading actions', () => {
      it('should return true', () => {
        expect(isLoading(mockState)).toBe(true)
      })
    })

    describe('and there are no loading actions', () => {
      beforeEach(() => {
        mockState.authorization.loading = []
      })

      it('should return false', () => {
        expect(isLoading(mockState)).toBe(false)
      })
    })
  })

  describe('when getting the error', () => {
    it('should return the error message', () => {
      expect(getError(mockState)).toBe('test error')
    })
  })

  describe('when getting the authorization flow error', () => {
    it('should return the authorization flow error message', () => {
      expect(getAuthorizationFlowError(mockState)).toBe('flow error')
    })
  })

  describe('when getting transactions', () => {
    describe('and the wallet has transactions', () => {
      beforeEach(() => {
        mockState = {
          ...mockState,
          transaction: {
            data: {
              '0x1': [
                mockTransaction,
                { ...mockTransaction, actionType: REVOKE_TOKEN_SUCCESS }
              ]
            }
          },
          wallet: {
            data: {
              address: '0x1'
            }
          }
        }
      })

      it('should return transactions of type GRANT_TOKEN_SUCCESS for the current address', () => {
        expect(getTransactions(mockState)).toEqual([mockTransaction])
      })
    })

    describe('and the wallet has no transactions', () => {
      it('should return an empty array', () => {
        expect(getTransactions(mockState)).toEqual([])
      })
    })
  })

  describe('when getting allow transactions', () => {
    describe('and there are allowance type transactions', () => {
      beforeEach(() => {
        mockState = {
          ...mockState,
          transaction: {
            data: {
              '0x1': [mockTransaction]
            }
          },
          wallet: {
            data: {
              address: '0x1'
            }
          }
        }
      })

      it('should return only ALLOWANCE type transactions', () => {
        expect(getAllowTransactions(mockState)).toEqual([mockTransaction])
      })
    })

    describe('and there are no allowance type transactions', () => {
      beforeEach(() => {
        mockState = {
          ...mockState,
          transaction: {
            data: {
              '0x1': [
                {
                  ...mockTransaction,
                  payload: {
                    authorization: {
                      ...mockAuthorization,
                      type: AuthorizationType.APPROVAL
                    }
                  }
                }
              ]
            }
          },
          wallet: {
            data: {
              address: '0x1'
            }
          }
        }
      })

      it('should return an empty array', () => {
        expect(getAllowTransactions(mockState)).toEqual([])
      })
    })
  })

  describe('when getting approve transactions', () => {
    describe('and there are approval type transactions', () => {
      beforeEach(() => {
        const approvalTransaction = {
          ...mockTransaction,
          payload: {
            authorization: {
              ...mockAuthorization,
              type: AuthorizationType.APPROVAL
            }
          }
        }

        mockState = {
          ...mockState,
          transaction: {
            data: {
              '0x1': [approvalTransaction]
            }
          },
          wallet: {
            data: {
              address: '0x1'
            }
          }
        }
      })

      it('should return only APPROVAL type transactions', () => {
        expect(getApproveTransactions(mockState)).toEqual([
          mockState.transaction.data['0x1'][0]
        ])
      })
    })

    describe('and there are no approval type transactions', () => {
      beforeEach(() => {
        mockState = {
          ...mockState,
          transaction: {
            data: {
              '0x1': [mockTransaction]
            }
          },
          wallet: {
            data: {
              address: '0x1'
            }
          }
        }
      })

      it('should return an empty array', () => {
        expect(getApproveTransactions(mockState)).toEqual([])
      })
    })
  })

  describe('when checking if authorization is in progress', () => {
    describe('and there is an authorization flow request', () => {
      it('should return true', () => {
        expect(isAuthorizing(mockState)).toBe(true)
      })
    })

    describe('and there is no authorization flow request', () => {
      beforeEach(() => {
        mockState.authorization.loading = [{ type: 'OTHER_ACTION' }]
      })

      it('should return false', () => {
        expect(isAuthorizing(mockState)).toBe(false)
      })
    })
  })
})
