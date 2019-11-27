import { delay } from './tools'

export async function callInChunks<T>(
  f: (subrange: [number, number]) => Promise<T[]>,
  [start, end]: [number, number],
  options: {
    chunkSize: number
    delay?: number
    callUntil?: (result: T[]) => boolean
  },
): Promise<[T[], [number, number]]> {
  let result: T[] = []

  let subrangeStart = end - options.chunkSize + 1
  if (subrangeStart < start) {
    subrangeStart = start
  }
  let subrangeEnd = end

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const subresult = await f([subrangeStart, subrangeEnd])
    result = result.concat(subresult)

    if (subrangeStart === start) {
      break
    }

    if (options.callUntil && options.callUntil(result)) {
      break
    }

    subrangeEnd = subrangeStart - 1
    subrangeStart = subrangeStart - options.chunkSize + 1
    if (subrangeStart < start) {
      subrangeStart = start
    }

    if (options.delay) {
      await delay(options.delay)
    }
  }

  return [result, [subrangeStart, subrangeEnd]]
}
