// Careful! This value is normally later formated by `toLocaleString` **but** if it ever goes above 3 (the default min maximumFractionDigits),
// we should review every call to `toLocaleString` as it will round up values beyond that decimal point
export const MAXIMUM_FRACTION_DIGITS = 2

/**
 * Gets value and tries to parse it with the supplied amount of decimals.
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

    if (decimalsCount >= maximumFractionDigits) {
      return value.toFixed(maximumFractionDigits)
    }
  }

  return strValue
}
