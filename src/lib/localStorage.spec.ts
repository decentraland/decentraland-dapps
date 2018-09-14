import { expect } from 'chai'
import { Migrations } from './types'
declare var global: any
let fakeStore = {}
global.window = {}
global.window['localStorage'] = {
  getItem: (key: string) => fakeStore[key],
  setItem: (key: string, value: string) => (fakeStore[key] = value),
  removeItem: (key: string) => delete fakeStore[key]
}
import { hasLocalStorage, migrateStorage, localStorage } from './localStorage'

describe('localStorage', function() {
  const migrations: Migrations<any> = {
    '1': (data: any) => data,
    '2': (data: any) => data
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
      expect(hasLocalStorage()).to.equal(false)
    })
    it('should return true if localStorage is available', function() {
      expect(hasLocalStorage()).to.equal(true)
    })
  })

  describe('migrateStorage', function() {
    it('should migrate', function() {
      const key = 'key'
      localStorage.setItem(key, JSON.stringify('{}'))
      let data = JSON.parse(localStorage.getItem(key) as string)
      expect(data.storage).to.equal(undefined)
      migrateStorage(key, migrations)
      data = JSON.parse(localStorage.getItem(key) as string)
      expect(data.storage.version).to.equal(2)
    })

    it('should not migrate if there is no migrations left', function() {
      const key = 'key'
      localStorage.setItem(key, JSON.stringify('{}'))
      let data = JSON.parse(localStorage.getItem(key) as string)
      expect(data.storage).to.equal(undefined)
      migrateStorage(key, migrations)
      data = JSON.parse(localStorage.getItem(key) as string)
      expect(data.storage.version).to.equal(2)
      migrateStorage(key, migrations)
      expect(data.storage.version).to.equal(2)
    })
  })
})
