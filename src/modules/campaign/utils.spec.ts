import { parseCollectionIds, parseItemIds } from './utils'

const CONTRACT_A = '0x' + 'a'.repeat(40)
const CONTRACT_B = '0x' + 'b'.repeat(40)

describe('when parsing the items a campaign names one by one', () => {
  describe('and the field is empty', () => {
    it('should name no items', () => {
      expect(parseItemIds(undefined)).toEqual([])
      expect(parseItemIds('')).toEqual([])
      expect(parseItemIds('   ')).toEqual([])
    })
  })

  describe('and the field lists composite ids', () => {
    it('should return them', () => {
      expect(parseItemIds(`${CONTRACT_A}-0,${CONTRACT_B}-12`)).toEqual([`${CONTRACT_A}-0`, `${CONTRACT_B}-12`])
    })
  })

  describe('and the editor typed the list across lines or with stray spacing', () => {
    it('should still read every entry', () => {
      expect(parseItemIds(`${CONTRACT_A}-0\n  ${CONTRACT_B}-1 ;`)).toEqual([`${CONTRACT_A}-0`, `${CONTRACT_B}-1`])
    })
  })

  describe('and an entry is not a composite id', () => {
    it('should drop that one and keep the rest, so one typo cannot empty a campaign', () => {
      expect(parseItemIds(`${CONTRACT_A}-0,nonsense,${CONTRACT_A},${CONTRACT_B}-3`)).toEqual([`${CONTRACT_A}-0`, `${CONTRACT_B}-3`])
    })
  })

  describe('and the same item is written twice', () => {
    it('should return it once, whatever the casing or the leading zeros', () => {
      expect(parseItemIds(`${CONTRACT_A.toUpperCase().replace('0X', '0x')}-7,${CONTRACT_A}-007`)).toEqual([`${CONTRACT_A}-7`])
    })
  })
})

describe('when parsing the collections a campaign names one by one', () => {
  describe('and the field is empty', () => {
    it('should name no collections', () => {
      expect(parseCollectionIds(undefined)).toEqual([])
      expect(parseCollectionIds('')).toEqual([])
    })
  })

  describe('and the field lists addresses', () => {
    it('should return them lowercased and de-duplicated', () => {
      expect(parseCollectionIds(`${CONTRACT_A},${CONTRACT_A.toUpperCase().replace('0X', '0x')}, ${CONTRACT_B}`)).toEqual([
        CONTRACT_A,
        CONTRACT_B
      ])
    })
  })

  describe('and an entry is not an address', () => {
    it('should drop that one and keep the rest', () => {
      expect(parseCollectionIds(`${CONTRACT_A},0x123,not-an-address`)).toEqual([CONTRACT_A])
    })
  })

  describe('and an entry is a composite item id', () => {
    it('should drop it, since an item is not a collection', () => {
      expect(parseCollectionIds(`${CONTRACT_A}-0`)).toEqual([])
    })
  })
})
