import { getLogger } from '../util/logger'

const logger = getLogger('Theme::Utils')

export const getOutcomeColor = (index: number): Record<string, any> => {
  const localTheme: Record<string, any> = {
    // text
    text1: '#37474F',
    text2: '#86909E',
    text3: '#333333',
    text4: '#757575',

    //primary colors
    primary1: '#5C6BC0',
    primary2: '#7986CB',
    primary3: '#3F51B5',
    primary4: '#E8EAF6',

    //other
    white: '#fff',
    green: '#4B9E98',
    red: '#E57373',
    link: '#1E88E5',

    //border
    border1: '#DCDFF2',
    border2: '#C5CAE9',
    border3: '#9FA8DA',

    outcomes: {
      colors: [
        {
          darker: '#8E24AA',
          medium: '#e1bee7',
        },
        {
          darker: '#00897B',
          medium: '#b2dfdb',
        },
        {
          darker: '#d2b994',
          medium: '#ffe0b2',
        },
        {
          darker: '#b9b992',
          medium: '#e7e7be',
        },
        {
          darker: '#9db992',
          medium: '#bedfb2',
        },
        {
          darker: '#ca89bd',
          medium: '#ffb2f0',
        },
        {
          darker: '#cc9c9c',
          medium: '#e7bebe',
        },
        {
          darker: '#9ebd91',
          medium: '#bfdfb2',
        },
        {
          darker: '#af7171',
          medium: '#ffb2b2',
        },
        {
          darker: '#6d9677',
          medium: '#90bb9b',
        },
        {
          darker: '#7b91a9',
          medium: '#b2c8df',
        },
        {
          darker: '#a980c3',
          medium: '#e1b2ff',
        },
        {
          darker: '#b18bac',
          medium: '#e7bee2',
        },
        {
          darker: '#484343',
          medium: '#757575',
        },
        {
          darker: '#b38037',
          medium: '#f0ad4e',
        },
        {
          darker: '#acb8c1',
          medium: '#e3f2fd',
        },
        {
          darker: '#679053',
          medium: '#8dc572',
        },
        {
          darker: '#131a1d',
          medium: '#37474f',
        },
        {
          darker: '#17486f',
          medium: '#216ba5',
        },
        {
          darker: '#7e97ad',
          medium: '#bbdefb',
        },
        {
          darker: '#879caf',
          medium: '#d6ebfd',
        },
        {
          darker: '#265986',
          medium: '#337ab7',
        },
        {
          darker: '#0e488a',
          medium: '#1565c0',
        },
        {
          darker: '#4d535d',
          medium: '#86909e',
        },
        {
          darker: '#6b3838',
          medium: '#be6464',
        },
        {
          darker: '#313f46',
          medium: '#607d8b',
        },
        {
          darker: '#464646',
          medium: '#9e9e9e',
        },
        {
          darker: '#3c2922',
          medium: '#795548',
        },
        {
          darker: '#a03716',
          medium: '#ff5722',
        },
        {
          darker: '#c17300',
          medium: '#ff9800',
        },
        {
          darker: '#b1a325',
          medium: '#ffeb3b',
        },
        {
          darker: '#a51546',
          medium: '#e91e63',
        },
      ],
    },
  }
  const defaultReturn = { darker: '#000', medium: '#999' }

  if (!localTheme || !localTheme['outcomes'] || !localTheme['outcomes']['colors']) {
    logger.error('Error when using theme or theme.outcomes')
    return defaultReturn
  }

  const colors = localTheme.outcomes.colors

  return colors[index % colors.length]
}
