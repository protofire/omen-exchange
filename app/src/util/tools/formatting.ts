import { BigNumber, formatUnits } from 'ethers/utils'

export const formatBigNumber = (value: BigNumber, decimals: number, precision = 2): string => {
  return Number(formatUnits(value, decimals)).toFixed(precision)
}
export const bigNumberToString = (value: BigNumber, decimals: number, precision = 2): string => {
  return formatNumber(formatUnits(value, decimals), precision)
}
export const bigNumberToNumber = (value: BigNumber, decimals: number): number => {
  return Number(formatUnits(value, decimals))
}
export const formatNumber = (number: string, decimals = 2): string => {
  const fixedInt = parseFloat(number.split(',').join('')).toFixed(decimals)
  const splitFixedInt = fixedInt.split('.')[0]
  const formattedSubstring = splitFixedInt.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  if (number.length < 1) {
    return `0${decimals > 0 ? '.' + '0'.repeat(decimals) : ''}`
  }

  if (Number(number) < 0.01 && Number(number) > 0) {
    return '<0.01'
  }

  return `${formattedSubstring}${decimals > 0 ? '.' + fixedInt.split('.')[1] : ''}`
}
export const formatHistoryUser = (user: string) => {
  const firstStringPart = user ? user.substring(0, 5) + '...' : ''
  const lastPart = user ? user.substring(user.length - 3, user.length) : ''

  return firstStringPart + lastPart
}
export const formatToShortNumber = (number: string, decimals = 2): string => {
  if (number.length < 1) {
    return '0'
  }

  const units = ['', 'K', 'M', 'B', 'T']
  let unitIndex = 0
  let rNumber = parseFloat(number.split(',').join(''))

  while (rNumber >= 1000 && unitIndex < 5) {
    unitIndex += 1
    rNumber = rNumber / 1000
  }

  return `${parseFloat(rNumber.toFixed(decimals))}${units[unitIndex]}`
}
export const numberToByte32 = (num: string | number, isScalar: boolean): string => {
  let hex: any
  if (isScalar) hex = num
  else hex = new BigNumber(num).toHexString()

  const frontZeros = '0'.repeat(66 - hex.length)

  return `0x${frontZeros}${hex.split('0x')[1]}`
}

/**
 * Given a string representing a floating point number,
 * return a floating point number with a fixed amount of decimal places.
 */
export const limitDecimalPlaces = (value: string, decimals: number) => {
  const limitedString: string =
    value.indexOf('.') >= 0
      ? value.substr(0, value.indexOf('.')) + value.substr(value.indexOf('.'), decimals + 1)
      : value
  return Number.parseFloat(limitedString)
}
