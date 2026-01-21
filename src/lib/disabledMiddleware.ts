import { RootMiddleware } from '../types'

export const disabledMiddleware: RootMiddleware = () => next => action => {
  next(action)
}
