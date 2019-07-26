import { Migrations } from '../../lib/types'
import { MiddlewareOptions } from 'redux-persistence/dist/types'

export interface StorageMiddleware<T> extends MiddlewareOptions<T> {
  storageKey: string
  paths?: (string | string[])[]
  actions?: string[]
  migrations?: Migrations<T>
}
