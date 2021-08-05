import { dynamic } from 'redux-saga-test-plan/providers'
import * as R from 'ramda'

export function dynamicDeepParametersEquality(
  parameters: Array<unknown>,
  returnValue: unknown
) {
  return dynamic(({ args }, next) =>
    R.equals(args, parameters) ? Promise.resolve(returnValue) : next()
  )
}
