import { Migrations } from './types'
import {
  hasLocalStorage,
  migrateStorage,
  getLocalStorage,
  getDefaultState
} from './localStorage'

describe('localStorage', function() {
  const migrations: Migrations<any> = {
    2: (data: any) => ({ ...data, data: 'new version' })
  }
  let fakeStore: Record<string, string>
  let localStorageSpy: jest.SpyInstance

  beforeEach(function() {
    fakeStore = {}

    localStorageSpy = jest
      .spyOn(global, 'localStorage', 'get')
      .mockImplementation(() => {
        return {
          length: 0,
          clear: () => {},
          key: (_index: number) => null,
          getItem: (key: string) => fakeStore[key],
          setItem: (key: string, value: string) => {
            fakeStore[key] = value
          },
          removeItem: (key: string) => delete fakeStore[key]
        }
      })
  })

  afterEach(() => {
    localStorageSpy.mockRestore()
  })

  describe('hasLocalStorage', function() {
    it('should return false if localStorage is not available', function() {
      localStorageSpy.mockImplementation(() => null)
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

  describe('getDefaultState', function() {
    it('should return 1 when no migrations are provided', function() {
      const state = getDefaultState({})
      expect(state).toEqual({ storage: { version: 1 } })
    })

    it('should return the migration key as version if there is only one', function() {
      const state = getDefaultState({ '2': () => {} })
      expect(state).toEqual({ storage: { version: 2 } })
    })

    it('should return the highest migration version if there is more than one', function() {
      const state = getDefaultState({ '2': () => {}, '3': () => {} })
      expect(state).toEqual({ storage: { version: 3 } })
    })

    it('should ignore migrations with keys that are not numbers', function() {
      const state = getDefaultState({ '2': () => {}, foo: () => {} })
      expect(state).toEqual({ storage: { version: 2 } })
    })
  })
})
