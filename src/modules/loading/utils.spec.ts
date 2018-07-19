import { expect } from 'chai'
import { removeLast, getType, getStatus } from './utils'

describe('modules', () => {
  describe('loading', () => {
    describe('utils', () => {
      const successAction = { type: '[Success] Some Action' }
      const failureAction = { type: '[Failure] Some Action' }
      const requestAction = { type: '[Request] Some Action' }
      const elements = [
        {
          type: 'A'
        },
        {
          type: 'B'
        },
        {
          type: 'C'
        },
        {
          type: 'B'
        },
        {
          type: 'A'
        }
      ]
      describe('removeLast', () => {
        it('should remove the forth element', () => {
          const newElements = removeLast(
            elements,
            element => element.type === 'B'
          )
          expect(newElements).to.deep.equal([
            {
              type: 'A'
            },
            {
              type: 'B'
            },
            {
              type: 'C'
            },
            {
              type: 'A'
            }
          ])
        })
        it('should remove the third element', () => {
          const newElements = removeLast(
            elements,
            element => element.type === 'C'
          )
          expect(newElements).to.deep.equal([
            {
              type: 'A'
            },
            {
              type: 'B'
            },
            {
              type: 'B'
            },
            {
              type: 'A'
            }
          ])
        })
        it('should remove the last element', () => {
          const newElements = removeLast(
            elements,
            element => element.type === 'A'
          )
          expect(newElements).to.deep.equal([
            {
              type: 'A'
            },
            {
              type: 'B'
            },
            {
              type: 'C'
            },
            {
              type: 'B'
            }
          ])
        })
        it('should not remove any element', () => {
          const newElements = removeLast(
            elements,
            element => element.type === 'D'
          )
          expect(newElements).to.deep.equal([
            {
              type: 'A'
            },
            {
              type: 'B'
            },
            {
              type: 'C'
            },
            {
              type: 'B'
            },
            {
              type: 'A'
            }
          ])
        })
      })
      describe('getType', () => {
        it('should return the action type of a success action', () => {
          const actionType = getType(successAction)
          expect(actionType).to.be.equal('Some Action')
        })
        it('should return the action type of a failure action', () => {
          const actionType = getType(failureAction)
          expect(actionType).to.be.equal('Some Action')
        })
        it('should return the action type of a request action', () => {
          const actionType = getType(requestAction)
          expect(actionType).to.be.equal('Some Action')
        })
      })
      describe('getStatus', () => {
        it('should return "SUCCESS" status', () => {
          const actionType = getStatus(successAction)
          expect(actionType).to.be.equal('SUCCESS')
        })
        it('should return "FAILURE" status', () => {
          const actionType = getStatus(failureAction)
          expect(actionType).to.be.equal('FAILURE')
        })
        it('should return "REQUEST" status', () => {
          const actionType = getStatus(requestAction)
          expect(actionType).to.be.equal('REQUEST')
        })
      })
    })
  })
})
