import { delay } from './tools'

export type Range = [number, number]

/**
 * Calls function `f` repeatedly over the given `range`, dividing this range by `chunkSize`
 *
 * For example, if the range is [0, 11] and the chunk size is 3, then `f` will be called like this:
 *
 * f([9, 11])
 * f([6, 8])
 * f([3, 5])
 * f([0, 2])
 *
 * `f` must return an array, and the final result is obtained from concatenating these partial results.
 *
 * A `options.callUntil` callback can be specified. This function receives the accumulated result so far and returns a boolean.
 * If the response is `true`, the function finishes with this result.
 *
 * If `options.delay` is specified, then after each call to `f` there will be a delay of `options.delay` milliseconds.
 *
 * Returns the accumulated result, and the effective range that was used (equal to the input range if not `callUntil`
 * was specified).
 */
export async function callInChunks<T>(
  f: (subrange: Range) => Promise<T[]>,
  range: Range,
  options: {
    chunkSize: number
    delay?: number
    callUntil?: (result: T[]) => boolean
  },
): Promise<[T[], Range]> {
  const [start, end] = range
  let result: T[] = []

  let subrangeStart = end - options.chunkSize + 1
  if (subrangeStart < start) {
    subrangeStart = start
  }
  let subrangeEnd = end

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const subresult = await f([subrangeStart, subrangeEnd])
    result = subresult.concat(result)

    if (subrangeStart === start) {
      break
    }

    if (options.callUntil && options.callUntil(result)) {
      break
    }

    subrangeEnd = subrangeStart - 1
    subrangeStart = subrangeStart - options.chunkSize
    if (subrangeStart < start) {
      subrangeStart = start
    }

    if (options.delay) {
      await delay(options.delay)
    }
  }

  return [result, [subrangeStart, end]]
}
