export interface ProcessPromiseQueueOptions {
  concurrency: number
}
export type PromiseFn<T> = (value: T) => Promise<unknown>

const parallelProcessor = async <T>(promiseFn: PromiseFn<T>, iterator: Iterator<T>): Promise<void> => {
  /* eslint-disable-next-line no-constant-condition */
  while (true) {
    const { done, value } = iterator.next()
    if (done) break
    await promiseFn(value)
  }
}

export const processPromiseQueue = async <T>(
  promiseFn: PromiseFn<T>,
  iterable: T[],
  { concurrency }: ProcessPromiseQueueOptions = { concurrency: 1 },
): Promise<void> => {
  if (concurrency < 1) throw new Error('Concurrency must be greater than 0')
  const iterator = iterable[Symbol.iterator]()
  await Promise.all(Array.from({ length: concurrency }).map(() => parallelProcessor(promiseFn, iterator)))
}
