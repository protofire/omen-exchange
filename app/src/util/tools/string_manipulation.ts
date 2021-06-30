import Big from 'big.js'

export const truncateStringInTheMiddle = (str: string, strPositionStart: number, strPositionEnd: number) => {
  const minTruncatedLength = strPositionStart + strPositionEnd
  if (minTruncatedLength < str.length) {
    return `${str.substr(0, strPositionStart)}...${str.substr(str.length - strPositionEnd, str.length)}`
  }
  return str
}
export const strip0x = (input: string) => {
  return input.replace(/^0x/, '')
}
export const getUnit = (title: string): string => {
  const splitTitle = title.split('[')
  const unit = splitTitle[splitTitle.length - 1].split(']')[0]
  return unit
}
export const getScalarTitle = (title: string): string => {
  const unit = getUnit(title)
  const scalarTitle = title.substring(0, title.length - (unit.length + 3))
  return scalarTitle
}
/**
 * Round a given number string to a fixed number of significant digits
 */
export const roundNumberStringToSignificantDigits = (value: string, sd: number): string => {
  const r = new Big(value)
  const preciseValue = (r as any).prec(sd, 0)
  if (preciseValue.gt(0)) {
    return preciseValue.toString()
  } else {
    return '0'
  }
}
