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

describe('when the field does not hold a string at all', () => {
  // The type on the way in is a cast. Turning the content type into a Symbol LIST in the space would hand
  // these an array with no deploy here, and throwing would cost the whole campaign, not just this field.
  it('should read an array as the list it is', () => {
    expect(parseItemIds([`${CONTRACT_A}-1`, `${CONTRACT_B}-2`])).toEqual([`${CONTRACT_A}-1`, `${CONTRACT_B}-2`])
    expect(parseCollectionIds([CONTRACT_A, CONTRACT_B])).toEqual([CONTRACT_A, CONTRACT_B])
  })

  it('should name nothing for a shape it cannot read, rather than throw', () => {
    const unreadable = [42, { nested: true }, null, true]
    for (const value of unreadable) {
      expect(() => parseItemIds(value as never)).not.toThrow()
      expect(parseItemIds(value as never)).toEqual([])
      expect(parseCollectionIds(value as never)).toEqual([])
    }
  })

  it('should read the same items whether the text is one string or one element of a list', () => {
    const text = `${CONTRACT_A}-1, ${CONTRACT_B}-2`

    expect(parseItemIds([text])).toEqual(parseItemIds(text))
    expect(parseItemIds([text])).toEqual([`${CONTRACT_A}-1`, `${CONTRACT_B}-2`])
  })

  it('should skip non-string entries inside an array and keep the rest', () => {
    expect(parseItemIds([`${CONTRACT_A}-1`, 7, null] as never)).toEqual([`${CONTRACT_A}-1`])
  })
})

describe('when an item id is longer than a number can hold', () => {
  it('should keep it exactly, rather than rounding it into a different item', () => {
    // `Number('9007199254740993')` gives …92, which is another item entirely.
    expect(parseItemIds(`${CONTRACT_A}-9007199254740993`)).toEqual([`${CONTRACT_A}-9007199254740993`])
  })

  it('should still strip leading zeros', () => {
    expect(parseItemIds(`${CONTRACT_A}-000123`)).toEqual([`${CONTRACT_A}-123`])
    expect(parseItemIds(`${CONTRACT_A}-0`)).toEqual([`${CONTRACT_A}-0`])
    expect(parseItemIds(`${CONTRACT_A}-000`)).toEqual([`${CONTRACT_A}-0`])
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
