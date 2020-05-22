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
  console.log(localTheme.outcomes.colors.length)
  const colors = localTheme.outcomes.colors
  const maxIndex = colors.length - 1
  const groupIndex = Math.trunc(index / colors.length)
  const outcomeIndex: number = index - groupIndex - maxIndex * groupIndex

  return colors[outcomeIndex]
}
