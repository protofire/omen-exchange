import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'

interface Options {
  debounce: number
}

const defaultOptions: Options = {
  debounce: 500,
}

/**
 * Given a `value` and a deriving function `f`, returns the value `f(value)`. Calls to `f` are debounced, and if several
 * concurrent calls are executed, only the last value is returned.
 *
 * `f` should be a memoized function to avoid re-computations.
 */
export function useAsyncDerivedValue<T, U>(
  value: T,
  defaultValue: U,
  f: (t: T) => Promise<U>,
  options: Options = defaultOptions,
) {
  const [derivedValue, setDerivedValue] = useState<U>(defaultValue)
  const [debouncedValue] = useDebounce(value, options.debounce)

  useEffect(() => {
    let cancelled = false

    f(debouncedValue).then(result => {
      if (!cancelled) setDerivedValue(result)
    })

    return () => {
      cancelled = true
    }
  }, [debouncedValue, f])

  return derivedValue
}
