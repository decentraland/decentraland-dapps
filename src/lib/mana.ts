// Careful! This value is normally later formated by `toLocaleString` **but** if it ever goes above 3 (the default min maximumFractionDigits),
// we should review every call to `toLocaleString` as it will round up values beyond that decimal point
export const MAXIMUM_FRACTION_DIGITS = 2

/**
 * Parses the mana value with the supplied amount of decimals. It uses MAXIMUM_FRACTION_DIGITS as a default (recommended).
 * It'll return the value as is if it's an invalid number or it doesn't have more than decimals than the upper limit.
 */
export function toFixedMANAValue(
  strValue: string,
  maximumFractionDigits = MAXIMUM_FRACTION_DIGITS
): string {
  const value = parseFloat(strValue)

  if (!isNaN(value)) {
    const decimals = value.toString().split('.')[1]
    const decimalsCount = decimals ? decimals.length : 0
    const trailingZeros = getTrailingZeros(strValue)
    if (trailingZeros + decimalsCount >= maximumFractionDigits) {
      return value.toFixed(maximumFractionDigits)
    }
  }

  return strValue
}

/**
 * Returns the amount of trailing zeros
 */
export function getTrailingZeros(strValue: string) {
  // count zeros
  let zeros = 0
  // parse string value to remove trailing zeros
  const parsed = parseFloat(strValue)
  // remove parsed value from original string value (ie. string value is "1.0576000" and parsed is "1.0576" the rest would be "000")
  let rest = strValue.split(parsed.toString()).pop()
  // if after removing the parsed value there's nothing left, return 0
  if (!rest) {
    return 0
  }
  // if the first char is a dot, skip it (this would be the case for an integer with decimals, like "1.00")
  if (rest[0] === '.') {
    rest = rest.slice(1)
  }
  // count zeros
  while (rest[0] === '0') {
    zeros++
    rest = rest.slice(1)
  }
  // return amount
  return zeros
}
