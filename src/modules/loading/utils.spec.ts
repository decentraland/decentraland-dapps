import { removeLast, getType, getStatus } from './utils'

describe('modules', function () {
  describe('loading', function () {
    describe('utils', function () {
      const successAction = { type: '[Success] Some Action' }
      const failureAction = { type: '[Failure] Some Action' }
      const requestAction = { type: '[Request] Some Action' }
      const clearAction = { type: '[Clear] Some Action' }
      const elements = [
        { type: 'A' },
        { type: 'B' },
        { type: 'C' },
        { type: 'B' },
        { type: 'A' },
      ]

      describe('removeLast', function () {
        it('should remove the forth element', function () {
          const newElements = removeLast(
            elements,
            (element) => element.type === 'B',
          )
          expect(newElements).toEqual([
            { type: 'A' },
            { type: 'B' },
            { type: 'C' },
            { type: 'A' },
          ])
        })

        it('should remove the third element', function () {
          const newElements = removeLast(
            elements,
            (element) => element.type === 'C',
          )
          expect(newElements).toEqual([
            { type: 'A' },
            { type: 'B' },
            { type: 'B' },
            { type: 'A' },
          ])
        })

        it('should remove the last element', function () {
          const newElements = removeLast(
            elements,
            (element) => element.type === 'A',
          )
          expect(newElements).toEqual([
            { type: 'A' },
            { type: 'B' },
            { type: 'C' },
            { type: 'B' },
          ])
        })

        it('should not remove any element', function () {
          const newElements = removeLast(
            elements,
            (element) => element.type === 'D',
          )
          expect(newElements).toEqual([
            { type: 'A' },
            { type: 'B' },
            { type: 'C' },
            { type: 'B' },
            { type: 'A' },
          ])
        })
      })

      describe('getType', function () {
        it('should return the action type of a success action', function () {
          const actionType = getType(successAction)
          expect(actionType).toBe('Some Action')
        })

        it('should return the action type of a failure action', function () {
          const actionType = getType(failureAction)
          expect(actionType).toBe('Some Action')
        })

        it('should return the action type of a request action', function () {
          const actionType = getType(requestAction)
          expect(actionType).toBe('Some Action')
        })

        it('should return the action type of a clear action', function () {
          const actionType = getType(clearAction)
          expect(actionType).toBe('Some Action')
        })
      })

      describe('getStatus', function () {
        it('should return "SUCCESS" status', function () {
          const actionStatus = getStatus(successAction)
          expect(actionStatus).toBe('SUCCESS')
        })

        it('should return "FAILURE" status', function () {
          const actionStatus = getStatus(failureAction)
          expect(actionStatus).toBe('FAILURE')
        })

        it('should return "REQUEST" status', function () {
          const actionStatus = getStatus(requestAction)
          expect(actionStatus).toBe('REQUEST')
        })

        it('should return "CLEAR" status', function () {
          const actionStatus = getStatus(clearAction)
          expect(actionStatus).toBe('CLEAR')
        })
      })
    })
  })
})
