import { expect } from 'chai'
import { ChainId } from '@dcl/schemas'
import {
  TRANSACTION_ACTION_FLAG,
  buildTransactionPayload,
  buildTransactionWithReceiptPayload,
  isTransactionAction,
  getTransactionFromAction,
  getTransactionHashFromAction
} from './utils'

describe('modules', function() {
  describe('transaction', function() {
    describe('utils', function() {
      const hash = '0xdeadbeef'
      const payload = { some: 'data' }
      const chainId = ChainId.ETHEREUM_MAINNET

      const tx = { hash, payload }
      const txWithReceipt = { hash, payload, withReceipt: true }

      describe('buildTransactionPayload', function() {
        it('should return a new object with the transaction flag an the action inside', function() {
          const txPayload = buildTransactionPayload(
            chainId,
            tx.hash,
            tx.payload
          )

          expect(txPayload).to.deep.equal({
            [TRANSACTION_ACTION_FLAG]: tx
          })
        })
        it('should support only supplying the transaction hash', function() {
          const tx = { hash }
          const txPayload = buildTransactionPayload(chainId, tx.hash)

          expect(txPayload).to.deep.equal({
            [TRANSACTION_ACTION_FLAG]: {
              ...tx,
              payload: {}
            }
          })
        })
      })

      describe('buildTransactionWithReceiptPayload', function() {
        it('should return a new object with the transaction flag an the action inside', function() {
          const txPayload = buildTransactionWithReceiptPayload(
            chainId,
            tx.hash,
            tx.payload
          )

          expect(txPayload).to.deep.equal({
            [TRANSACTION_ACTION_FLAG]: txWithReceipt
          })
        })
        it('should support only supplying the transaction hash', function() {
          const tx = { hash }
          const txPayload = buildTransactionWithReceiptPayload(chainId, tx.hash)

          expect(txPayload).to.deep.equal({
            [TRANSACTION_ACTION_FLAG]: {
              ...txWithReceipt,
              payload: {}
            }
          })
        })
      })

      describe('isTransactionAction', function() {
        it('should return true if the action was built with buildTransactionPayload', function() {
          const txPayload = buildTransactionPayload(
            chainId,
            tx.hash,
            tx.payload
          )
          const action = {
            type: '[Success] Transaction action',
            payload: txPayload
          }

          expect(isTransactionAction(action)).to.equal(true)
        })

        it('should return true if the action was built with buildTransactionWithReceiptPayload', function() {
          const txPayload = buildTransactionWithReceiptPayload(
            chainId,
            tx.hash,
            tx.payload
          )
          const action = {
            type: '[Success] Transaction action',
            payload: txPayload
          }

          expect(isTransactionAction(action)).to.equal(true)
        })

        it('should return false for normal actions', function() {
          expect(
            isTransactionAction({
              type: '[Success] Some success action'
            })
          ).to.equal(false)

          expect(
            isTransactionAction({
              type: '[Request] Some request action',
              payload: {
                mock_transaction_flag: tx
              }
            })
          ).to.equal(false)
        })
      })

      describe('getTransactionFromAction', function() {
        it('should return the transaction from a built transaction action with buildTransactionPayload', function() {
          const txPayload = buildTransactionWithReceiptPayload(
            chainId,
            tx.hash,
            tx.payload
          )
          const action = {
            type: '[Success] Transaction action',
            payload: {
              this: 'is',
              more: 2,
              data: ['a', 3],
              ...txPayload
            }
          }

          expect(getTransactionFromAction(action)).to.deep.equal(txWithReceipt)
        })

        it('should return the transaction from a built transaction action with buildTransactionWithReceiptPayload', function() {
          const txPayload = buildTransactionPayload(
            chainId,
            tx.hash,
            tx.payload
          )
          const action = {
            type: '[Success] Transaction action',
            payload: {
              this: 'is',
              more: 2,
              data: ['a', 3],
              ...txPayload
            }
          }

          expect(getTransactionFromAction(action)).to.deep.equal(tx)
        })

        it('should return undefined for a normal action', function() {
          const action = {
            type: '[Success] Transaction action',
            payload: { this: 'is', more: 2, data: ['a', 3] }
          }

          expect(getTransactionFromAction(action)).to.equal(undefined)
        })
      })

      describe('getTransactionHashFromAction', function() {
        it('should return the transaction hash from a built transaction action with buildTransactionPayload', function() {
          const txPayload = buildTransactionPayload(
            chainId,
            tx.hash,
            tx.payload
          )
          const action = {
            type: '[Success] Transaction action',
            payload: { data: ['a', 3], ...txPayload }
          }

          expect(getTransactionHashFromAction(action)).to.deep.equal(tx.hash)
        })

        it('should return the transaction hash from a built transaction action with buildTransactionWithReceiptPayload', function() {
          const txPayload = buildTransactionWithReceiptPayload(
            chainId,
            tx.hash,
            tx.payload
          )
          const action = {
            type: '[Success] Transaction action',
            payload: { data: ['a', 3], ...txPayload }
          }

          expect(getTransactionHashFromAction(action)).to.deep.equal(tx.hash)
        })

        it('should throw for a normal action (use isTransactionAction to avoid it)', function() {
          const action = {
            type: '[Success] Transaction action',
            payload: { more: 2 }
          }

          expect(() => getTransactionHashFromAction(action)).to.throw(
            "Cannot read property 'hash' of undefined"
          )
        })
      })
    })
  })
})
