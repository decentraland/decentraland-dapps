import { Migrations, LocalStorage, StorageOwnData } from './types'

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

export function getLocalStorage(): LocalStorage {
  return hasLocalStorage()
    ? window.localStorage
    : {
        getItem: () => null,
        setItem: () => null,
        removeItem: () => null
      }
}

export function getDefaultState<T>(migrations: Migrations<T>) {
  const keys = Object.keys(migrations)

  const version =
    keys.length === 0
      ? 1
      : Object.keys(migrations)
          .map(Number)
          .filter(num => !isNaN(num))
          .sort((a, b) => b - a)[0]

  return { storage: { version } }
}

export function migrateStorage<T extends StorageOwnData>(
  key: string,
  migrations: Migrations<T>
): T {
  let version = 1
  const localStorage = getLocalStorage()
  const dataString = localStorage.getItem(key)

  if (dataString) {
    let data = JSON.parse(dataString)

    if (data.storage && data.storage.version) {
      version = parseInt(data.storage.version, 10)
    }
    let nextVersion = version + 1

    while (migrations[nextVersion]) {
      data = migrations[nextVersion](data)
      if (!data.storage) {
        data.storage = {}
      }
      data.storage.version = nextVersion
      nextVersion++
    }

    return data
  }

  return getDefaultState(migrations) as T
}
