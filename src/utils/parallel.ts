export interface ProcessPromiseQueueOptions {
  concurrency: number
}
export type PromiseFn = (value: any) => Promise<any>

const parallelProcessor = async (promiseFn: PromiseFn, iterator: Iterator<any>): Promise<void> => {
  /* eslint-disable-next-line no-constant-condition */
  while (true) {
    const { done, value } = iterator.next()
    if (done) break
    await promiseFn(value)
  }
}

export const processPromiseQueue = async (
  promiseFn: PromiseFn,
  iterable: any[],
  { concurrency }: ProcessPromiseQueueOptions = { concurrency: 1 }
): Promise<void> => {
  if (concurrency < 1) throw new Error('Concurrency must be greater than 0')
  const iterator = iterable[Symbol.iterator]()
  await Promise.all(Array.from({ length: concurrency }).map(() => parallelProcessor(promiseFn, iterator)))
}
