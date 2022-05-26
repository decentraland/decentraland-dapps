import { getTrailingZeros, toFixedMANAValue } from './mana'

describe('when formatting the price', () => {
  describe('when formatting alphanumeric text', () => {
    it('should return the supplied value', () => {
      expect(toFixedMANAValue('abc')).toBe('abc')
    })
  })

  describe('when formatting an invalid number', () => {
    it('should return the supplied value', () => {
      expect(toFixedMANAValue('1.bc')).toBe('1.bc')
    })
  })

  describe('when formatting an incomplete number', () => {
    it('should return the supplied value', () => {
      expect(toFixedMANAValue('1.')).toBe('1.')
    })
  })

  describe('when formatting a valid integer number', () => {
    it('should return the supplied value', () => {
      expect(toFixedMANAValue('1')).toBe('1')
    })
  })

  describe('when formatting a valid float number', () => {
    describe('when the number has 2 or less decimal places', () => {
      it('should return the supplied value', () => {
        expect(toFixedMANAValue('51.3')).toBe('51.3')
      })
    })

    describe('when the number has more than 2 decimal places', () => {
      it('should fix the value to the first two decimal places', () => {
        expect(toFixedMANAValue('765.93023')).toBe('765.93')
      })
    })

    describe('when the number has decimal zeros to the right', () => {
      it('should remove them up to the maximum amount allowed', () => {
        expect(toFixedMANAValue('9.5000000')).toBe('9.50')
      })
    })

    describe('when all the decimals are zeros', () => {
      it('should remove them up to the maximum amount allowed', () => {
        expect(toFixedMANAValue('9.000')).toBe('9.00')
      })
    })

    describe('when it has the same amount of decimals as the maximum amount allowed', () => {
      it('return the supplied value', () => {
        expect(toFixedMANAValue('9.00')).toBe('9.00')
      })
    })

    describe('when it has trailing zeros but they are less than the maximum amount of decimals allowed', () => {
      it('return the supplied value', () => {
        expect(toFixedMANAValue('9.0')).toBe('9.0')
      })
    })
  })
})

describe('when getting trailing zeros', () => {
  describe('and the input is incomplete', () => {
    it('should return 0', () => {
      expect(getTrailingZeros('1.')).toBe(0)
    })
  })
  describe('and the input is invalid', () => {
    it('should return 0', () => {
      expect(getTrailingZeros('1.abc')).toBe(0)
    })
  })
  describe('and the input is an integer', () => {
    describe('and the input has no decimals', () => {
      it('should return 0', () => {
        expect(getTrailingZeros('1')).toBe(0)
      })
    })
    describe('and the input has one decimal', () => {
      it('should return 1', () => {
        expect(getTrailingZeros('1.0')).toBe(1)
      })
    })
    describe('and the input has two decimal', () => {
      it('should return 1', () => {
        expect(getTrailingZeros('1.00')).toBe(2)
      })
    })
    describe('and the input has three decimal', () => {
      it('should return 1', () => {
        expect(getTrailingZeros('1.000')).toBe(3)
      })
    })
  })
  describe('and the input is a float', () => {
    describe('and has no trailing zeros', () => {
      it('should return 0', () => {
        expect(getTrailingZeros('1.5')).toBe(0)
      })
    })
    describe('and has one trailing zero', () => {
      it('should return 1', () => {
        expect(getTrailingZeros('1.50')).toBe(1)
      })
    })
    describe('and has two trailing zeros', () => {
      it('should return 2', () => {
        expect(getTrailingZeros('1.500')).toBe(2)
      })
    })
    describe('and has three trailing zeros', () => {
      it('should return 3', () => {
        expect(getTrailingZeros('1.5000')).toBe(3)
      })
    })
  })
})
