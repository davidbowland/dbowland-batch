import { processPromiseQueue, PromiseFn } from '@utils/parallel'

describe('processPromiseQueue', () => {
  const longPromise = { result: 'longPromise', timeout: 100 }
  const shortPromise = { result: 'shortPromise', timeout: 10 }

  const usePromiseFn = () => {
    const results = []
    const promiseFn: PromiseFn = ({ result, timeout }) =>
      new Promise((resolve) =>
        setTimeout(() => {
          results.push(result)
          resolve(result)
        }, timeout)
      )
    return { promiseFn, results }
  }

  it('processes promises sequentially when concurrency is 1', async () => {
    const { promiseFn, results } = usePromiseFn()
    await processPromiseQueue(promiseFn, [longPromise, shortPromise])

    expect(results).toEqual(['longPromise', 'shortPromise'])
  })

  it('processes promises concurrently when concurrency > 1', async () => {
    const { promiseFn, results } = usePromiseFn()
    await processPromiseQueue(promiseFn, [longPromise, shortPromise], { concurrency: 2 })

    expect(results).toEqual(['shortPromise', 'longPromise'])
  })

  it('errors if concurrency is < 1', async () => {
    const { promiseFn } = usePromiseFn()
    await expect(processPromiseQueue(promiseFn, [], { concurrency: 0 })).rejects.toThrow(
      'Concurrency must be greater than 0'
    )
  })
})
