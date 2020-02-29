export async function asyncFilter<T>(array: T[], filterFn: (x: T) => boolean | Promise<boolean>): Promise<T[]> {
  const result: T[] = []

  for (const x of array) {
    if (await filterFn(x)) {
      result.push(x)
    }
  }

  return result
}
