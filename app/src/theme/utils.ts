import { getLogger } from '../util/logger'

import theme from './index'

const logger = getLogger('Theme::Utils')

export const getOutcomeColor = (index: number): Record<string, any> => {
  const localTheme: Record<string, any> = theme
  const defaultReturn = { darker: '#000', medium: '#999' }

  if (!localTheme || !localTheme['outcomes'] || !localTheme['outcomes']['colors']) {
    logger.error('Error when using theme or theme.outcomes')
    return defaultReturn
  }

  const colors = localTheme.outcomes.colors

  return colors[index % colors.length]
}
