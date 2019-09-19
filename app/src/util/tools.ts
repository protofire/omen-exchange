export const truncateStringInTheMiddle = (
  str: string,
  strLength = 41,
  strPositionStart = 8,
  strPositionEnd = 8,
) => {
  if (str.length > strLength) {
    return `${str.substr(0, strPositionStart)}...${str.substr(
      str.length - strPositionEnd,
      str.length,
    )}`
  }
  return str
}
