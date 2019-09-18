import logdown from 'logdown'

import { LOGGER_ID } from '../common/constants'

export const getLogger = (title: string) => {
  const logger = logdown(`${LOGGER_ID}::${title}`)
  logger.state.isEnabled = true
  return logger
}
