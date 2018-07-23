import { expect } from 'chai'
import { removeLast, getType, getStatus } from './utils'

describe('modules', function() {
  describe('loading', function() {
    describe('utils', function() {
      const successAction = { type: '[Success] Some Action' }
      const failureAction = { type: '[Failure] Some Action' }
      const requestAction = { type: '[Request] Some Action' }
      const elements = [
        { type: 'A' },
        { type: 'B' },
        { type: 'C' },
        { type: 'B' },
        { type: 'A' }
      ]

      describe('removeLast', function() {
        it('should remove the forth element', function() {
          const newElements = removeLast(
            elements,
            element => element.type === 'B'
          )
          expect(newElements).to.deep.equal([
            { type: 'A' },
            { type: 'B' },
            { type: 'C' },
            { type: 'A' }
          ])
        })

        it('should remove the third element', function() {
          const newElements = removeLast(
            elements,
            element => element.type === 'C'
          )
          expect(newElements).to.deep.equal([
            { type: 'A' },
            { type: 'B' },
            { type: 'B' },
            { type: 'A' }
          ])
        })

        it('should remove the last element', function() {
          const newElements = removeLast(
            elements,
            element => element.type === 'A'
          )
          expect(newElements).to.deep.equal([
            { type: 'A' },
            { type: 'B' },
            { type: 'C' },
            { type: 'B' }
          ])
        })

        it('should not remove any element', function() {
          const newElements = removeLast(
            elements,
            element => element.type === 'D'
          )
          expect(newElements).to.deep.equal([
            { type: 'A' },
            { type: 'B' },
            { type: 'C' },
            { type: 'B' },
            { type: 'A' }
          ])
        })
      })

      describe('getType', function() {
        it('should return the action type of a success action', function() {
          const actionType = getType(successAction)
          expect(actionType).to.be.equal('Some Action')
        })

        it('should return the action type of a failure action', function() {
          const actionType = getType(failureAction)
          expect(actionType).to.be.equal('Some Action')
        })

        it('should return the action type of a request action', function() {
          const actionType = getType(requestAction)
          expect(actionType).to.be.equal('Some Action')
        })
      })

      describe('getStatus', function() {
        it('should return "SUCCESS" status', function() {
          const actionType = getStatus(successAction)
          expect(actionType).to.be.equal('SUCCESS')
        })

        it('should return "FAILURE" status', function() {
          const actionType = getStatus(failureAction)
          expect(actionType).to.be.equal('FAILURE')
        })

        it('should return "REQUEST" status', function() {
          const actionType = getStatus(requestAction)
          expect(actionType).to.be.equal('REQUEST')
        })
      })
    })
  })
})
