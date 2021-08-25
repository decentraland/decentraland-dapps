import { Migrations } from './types'
import {
  hasLocalStorage,
  migrateStorage,
  getLocalStorage
} from './localStorage'
declare var global: any
let fakeStore = {}
global.window = {}

describe('localStorage', function() {
  const migrations: Migrations<any> = {
    2: (data: any) => ({ ...data, data: 'new version' })
  }

  beforeEach(function() {
    fakeStore = {}
    global.window['localStorage'] = {
      getItem: (key: string) => fakeStore[key],
      setItem: (key: string, value: string) => (fakeStore[key] = value),
      removeItem: (key: string) => delete fakeStore[key]
    }
  })

  describe('hasLocalStorage', function() {
    it('should return false if localStorage is not available', function() {
      delete global.window['localStorage']
      expect(hasLocalStorage()).toBe(false)
    })
    it('should return true if localStorage is available', function() {
      expect(hasLocalStorage()).toBe(true)
    })
  })

  describe('migrateStorage', function() {
    it('should migrate', function() {
      const key = 'key'
      const localStorage = getLocalStorage()
      localStorage.setItem(key, JSON.stringify('{}'))
      const data = migrateStorage(key, migrations)
      expect(data.storage.version).toBe(2)
      expect(data.data).toBe('new version')
    })

    it('should set corrent version', function() {
      const key = 'key'
      const localStorage = getLocalStorage()

      localStorage.setItem(key, JSON.stringify('{ storage: { version: null }}'))
      const data = migrateStorage(key, migrations)
      expect(data.storage.version).toBe(2)
    })

    it('should not migrate if there is no migrations left', function() {
      const key = 'key'
      const localStorage = getLocalStorage()
      localStorage.setItem(key, JSON.stringify('{}'))
      let data = migrateStorage(key, migrations)
      expect(data.storage.version).toBe(2)

      localStorage.setItem(key, JSON.stringify(data))

      data = migrateStorage(key, migrations)
      expect(data.storage.version).toBe(2)
    })
  })
})
