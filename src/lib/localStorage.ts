import { Migrations, LocalStorage } from './types'

export function hasLocalStorage(): boolean {
  try {
    // https://gist.github.com/paulirish/5558557
    const localStorage = window.localStorage
    const val = 'val'
    localStorage.setItem(val, val)
    localStorage.removeItem(val)
    return true
  } catch (e) {
    return false
  }
}

export const localStorage: LocalStorage = hasLocalStorage()
  ? window.localStorage
  : {
      getItem: () => null,
      setItem: () => null,
      removeItem: () => null
    }

export function migrateStorage<T>(key: string, migrations: Migrations<T>) {
  let version = 1
  const dataString = localStorage.getItem(key)
  const data = JSON.parse(<string>dataString)

  if (data.storage) {
    version = parseInt(data.storage.version || 0) + 1
  }

  while (!!migrations[version]) {
    const newData = migrations[version](data)
    localStorage.setItem(
      key,
      JSON.stringify({ ...(<Object>newData), storage: { version } })
    )
    version++
  }
}
