import { Migrations } from '../../lib/types'

export interface StorageMiddleware<T> {
  storageKey: string
  paths?: (string | string[])[]
  actions?: string[]
  migrations?: Migrations<T>
  transform?: <T>(state: T) => T
  onError?: (err: Error) => void
}
