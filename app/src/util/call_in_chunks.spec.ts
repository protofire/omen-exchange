/* eslint-env jest */
import { callInChunks } from './call_in_chunks'

describe('callInChunks', () => {
  it('should work when the range size is divisible by the chunk size', async () => {
    const [result, range] = await callInChunks<number>(async subrange => subrange, [0, 9], {
      chunkSize: 2,
    })

    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(range).toEqual([0, 9])
  })

  it('should work when the range size is not divisible by the chunk size', async () => {
    const [result, range] = await callInChunks<number>(async subrange => subrange, [0, 9], {
      chunkSize: 3,
    })

    expect(result).toEqual([0, 0, 1, 3, 4, 6, 7, 9])
    expect(range).toEqual([0, 9])
  })

  it('should work when the chunk size is bigger than the range size', async () => {
    const [result, range] = await callInChunks<number>(async subrange => subrange, [0, 9], {
      chunkSize: 15,
    })

    expect(result).toEqual([0, 9])
    expect(range).toEqual([0, 9])
  })

  it('should accept a callUntil option', async () => {
    const [result, range] = await callInChunks<number>(async subrange => subrange, [0, 9], {
      chunkSize: 3,
      callUntil: subresult => subresult.length >= 4,
    })

    expect(result).toEqual([4, 6, 7, 9])
    expect(range).toEqual([4, 9])
  })
})
