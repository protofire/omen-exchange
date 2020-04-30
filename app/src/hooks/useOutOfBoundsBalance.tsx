import { useEffect, useState } from 'react'

import { BigNumberInputError } from '../components/common/form/big_number_input'

export const useOutOfBoundsBalance = (
  error: BigNumberInputError,
  min = '',
  max = '',
  symbol = '',
  extraText = '',
): string => {
  const [isError, setIsError] = useState<string>('')

  useEffect(() => {
    const undefinedBounds =
      (!min && !max && error !== BigNumberInputError.noError) ||
      (error === BigNumberInputError.min && !min) ||
      (error === BigNumberInputError.max && !max)

    if (undefinedBounds) {
      setIsError('Value out of bounds.')
    } else if (error === BigNumberInputError.min && min) {
      setIsError(`Value must be more than ${min} ${symbol}. ${extraText}`)
    } else if (error === BigNumberInputError.max && max) {
      setIsError(`Value must be less than or equal to ${max} ${symbol}. ${extraText}`)
    } else {
      setIsError('')
    }
  }, [error, extraText, max, min, symbol])

  return isError
}
