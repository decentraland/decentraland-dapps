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
import { AUTHORIZATION_FLOW_REQUEST, GRANT_TOKEN_SUCCESS } from './actions'
import { AuthorizationType } from './types'

describe('Authorization selectors', () => {
  const mockAuthorization = {
    type: AuthorizationType.ALLOWANCE,
    address: '0x1',
    contractAddress: '0x2',
    authorizedAddress: '0x3',
    contractName: ContractName.MANAToken,
    chainId: ChainId.ETHEREUM_MAINNET,
    allowance: '1000'
  }

  const mockState = {
    authorization: {
      ...INITIAL_STATE,
      data: [mockAuthorization],
      loading: [{ type: AUTHORIZATION_FLOW_REQUEST }],
      error: 'test error',
      authorizationFlowError: 'flow error'
    }
  }

  const mockTransaction = {
    hash: '0x123',
    payload: {
      authorization: mockAuthorization
    },
    actionType: GRANT_TOKEN_SUCCESS
  }

  describe('getState', () => {
    it('should return the authorization state', () => {
      expect(getState(mockState)).toEqual(mockState.authorization)
    })
  })

  describe('getData', () => {
    it('should return the authorization data', () => {
      expect(getData(mockState)).toEqual([mockAuthorization])
    })
  })

  describe('getLoading', () => {
    it('should return the loading state', () => {
      expect(getLoading(mockState)).toEqual([
        { type: AUTHORIZATION_FLOW_REQUEST }
      ])
    })
  })

  describe('isLoading', () => {
    it('should return true when there are loading actions', () => {
      expect(isLoading(mockState)).toBe(true)
    })

    it('should return false when there are no loading actions', () => {
      expect(isLoading({ authorization: { ...INITIAL_STATE } })).toBe(false)
    })
  })

  describe('getError', () => {
    it('should return the error', () => {
      expect(getError(mockState)).toBe('test error')
    })
  })

  describe('getAuthorizationFlowError', () => {
    it('should return the authorization flow error', () => {
      expect(getAuthorizationFlowError(mockState)).toBe('flow error')
    })
  })

  describe('getTransactions', () => {
    const mockStateWithTransactions = {
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

    it('should return transactions of type GRANT_TOKEN_SUCCESS for the current address', () => {
      expect(getTransactions(mockStateWithTransactions)).toEqual([
        mockTransaction
      ])
    })

    it('should return empty array when no transactions exist', () => {
      expect(getTransactions(mockState)).toEqual([])
    })
  })

  describe('getAllowTransactions', () => {
    const mockStateWithTransactions = {
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

    it('should return only ALLOWANCE type transactions', () => {
      expect(getAllowTransactions(mockStateWithTransactions)).toEqual([
        mockTransaction
      ])
    })

    it('should return empty array when no allowance transactions exist', () => {
      const stateWithDifferentType = {
        ...mockStateWithTransactions,
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
        }
      }
      expect(getAllowTransactions(stateWithDifferentType)).toEqual([])
    })
  })

  describe('getApproveTransactions', () => {
    const approvalTransaction = {
      ...mockTransaction,
      payload: {
        authorization: {
          ...mockAuthorization,
          type: AuthorizationType.APPROVAL
        }
      }
    }

    const mockStateWithTransactions = {
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

    it('should return only APPROVAL type transactions', () => {
      expect(getApproveTransactions(mockStateWithTransactions)).toEqual([
        approvalTransaction
      ])
    })

    it('should return empty array when no approval transactions exist', () => {
      const stateWithDifferentType = {
        ...mockStateWithTransactions,
        transaction: {
          data: {
            '0x1': [mockTransaction]
          }
        }
      }
      expect(getApproveTransactions(stateWithDifferentType)).toEqual([])
    })
  })

  describe('isAuthorizing', () => {
    it('should return true when there is an authorization flow request in progress', () => {
      expect(isAuthorizing(mockState)).toBe(true)
    })

    it('should return false when there is no authorization flow request in progress', () => {
      const stateWithoutAuthFlow = {
        authorization: {
          ...INITIAL_STATE,
          loading: [{ type: 'OTHER_ACTION' }]
        }
      }
      expect(isAuthorizing(stateWithoutAuthFlow)).toBe(false)
    })
  })
})
