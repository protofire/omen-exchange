import moment from 'moment-timezone'

export const formatDate = (date: Date, utcAdd = true): string => {
  return moment(date)
    .tz('UTC')
    .format(`YYYY-MM-DD - HH:mm${utcAdd ? ' [UTC]' : ''}`)
}
export const convertUTCToLocal = (date: Maybe<Date>): Maybe<Date> => {
  if (!date) {
    return date
  }
  const offsetMinutes = moment(date).utcOffset()

  return moment(date)
    .subtract(offsetMinutes, 'minutes')
    .toDate()
}
// we need to do this because the value selected by react-datepicker
// uses the local timezone, but we want to interpret it in UTC
export const convertLocalToUTC = (date: Date): Date => {
  const offsetMinutes = moment(date).utcOffset()
  return moment(date)
    .add(offsetMinutes, 'minutes')
    .toDate()
}
export const formatHistoryDate = (dateData: number | string): string => {
  const date = new Date(new Date(dateData).toUTCString().substr(0, 25))
  const minute = date.getMinutes()
  const minuteWithZero = (minute < 10 ? '0' : '') + minute
  const hour = date.getHours()
  const hourWithZero = (hour < 10 ? '0' : '') + hour
  return `${date.getDate()}.${date.getMonth() + 1} - ${hourWithZero}:${minuteWithZero}`
}
export const formatTimestampToDate = (timestamp: number, value: string) => {
  const date = new Date(new Date(timestamp * 1000).toUTCString().substr(0, 25))
  const ts = moment(date)
  if (value === '1D' || value === '1H') return ts.format('HH:mm')

  return ts.format('MMM D')
}
