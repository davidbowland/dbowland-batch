import * as s3 from '@services/s3'
import { LambdaCleanupProject, LambdaRegion, S3Client } from '@types'
import {
  lambdaCleanupProject,
  s3MockTime,
  s3Object,
  s3ObjectEvenOlder,
  s3ObjectOlder,
  s3ObjectTooNew,
  s3ObjectTooNewTwo,
} from '../__mocks__'
import { mocked } from 'jest-mock'
import { processPromiseQueue } from '@utils/parallel'
import { s3LambdaCleanup } from '@handlers/s3-lambda-cleanup'
import { s3LambdaCleanupNumberOfThreads } from '@config'
import { scanLambdaCleanupProjects } from '@services/dynamodb'

jest.mock('@services/dynamodb')
jest.mock('@services/s3')
jest.mock('@utils/logging')
jest.mock('@utils/parallel')

describe('s3-lambda-cleanup', () => {
  beforeAll(() => {
    mocked(s3).deleteS3Object.mockResolvedValue(undefined)
    mocked(s3).listS3Objects.mockResolvedValue([s3Object, s3ObjectOlder, s3ObjectEvenOlder])
    jest.replaceProperty(s3, 's3ClientEast1', jest.fn() as unknown as S3Client)
    jest.replaceProperty(s3, 's3ClientEast2', jest.fn() as unknown as S3Client)

    mocked(processPromiseQueue).mockImplementation(async (promiseFn, iterable) => {
      await Promise.all(iterable.map(promiseFn))
    })
    mocked(scanLambdaCleanupProjects).mockResolvedValue([lambdaCleanupProject])

    jest.useFakeTimers().setSystemTime(s3MockTime)
  })

  describe('s3LambdaCleanup', () => {
    test('expect the second-oldest template file and older files are deleted', async () => {
      await s3LambdaCleanup()

      expect(scanLambdaCleanupProjects).toHaveBeenCalledTimes(1)
      expect(s3.listS3Objects).toHaveBeenCalledWith(
        s3.s3ClientEast1,
        lambdaCleanupProject.bucket,
        lambdaCleanupProject.prefixes[0]
      )
      expect(s3.listS3Objects).toHaveBeenCalledTimes(1)
      expect(s3.deleteS3Object).toHaveBeenCalledWith(s3.s3ClientEast1, lambdaCleanupProject.bucket, s3ObjectOlder.key)
      expect(s3.deleteS3Object).toHaveBeenCalledWith(
        s3.s3ClientEast1,
        lambdaCleanupProject.bucket,
        s3ObjectEvenOlder.key
      )
      expect(s3.deleteS3Object).toHaveBeenCalledTimes(2)
      expect(processPromiseQueue).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
        concurrency: s3LambdaCleanupNumberOfThreads,
      })
    })

    test('expect us-east-2 client in us-east-2 region', async () => {
      const usEast2Project: LambdaCleanupProject = {
        ...lambdaCleanupProject,
        prefixes: ['lambda-one/', 'lambda-two/'],
        region: 'us-east-2',
      }
      mocked(scanLambdaCleanupProjects).mockResolvedValueOnce([usEast2Project])
      mocked(s3).listS3Objects.mockResolvedValueOnce([s3Object, s3ObjectEvenOlder, s3ObjectOlder])
      mocked(s3).listS3Objects.mockResolvedValueOnce([])
      await s3LambdaCleanup()

      expect(scanLambdaCleanupProjects).toHaveBeenCalledTimes(1)
      expect(s3.listS3Objects).toHaveBeenCalledWith(s3.s3ClientEast2, usEast2Project.bucket, usEast2Project.prefixes[0])
      expect(s3.listS3Objects).toHaveBeenCalledWith(s3.s3ClientEast2, usEast2Project.bucket, usEast2Project.prefixes[1])
      expect(s3.listS3Objects).toHaveBeenCalledTimes(2)
      expect(s3.deleteS3Object).toHaveBeenCalledWith(s3.s3ClientEast2, lambdaCleanupProject.bucket, s3ObjectOlder.key)
      expect(s3.deleteS3Object).toHaveBeenCalledWith(
        s3.s3ClientEast2,
        lambdaCleanupProject.bucket,
        s3ObjectEvenOlder.key
      )
      expect(s3.deleteS3Object).toHaveBeenCalledTimes(2)
    })

    test('expect invalid region rejects', async () => {
      const invalidRegionProject: LambdaCleanupProject = {
        ...lambdaCleanupProject,
        region: 'invalid-region' as LambdaRegion,
      }
      mocked(scanLambdaCleanupProjects).mockResolvedValueOnce([invalidRegionProject])

      await expect(s3LambdaCleanup()).rejects.toThrow('Invalid region: invalid-region')
    })

    test('expect no files deleted when no second-oldest template files exist', async () => {
      const secondOldestNotTemplate = { ...s3ObjectEvenOlder, key: 'test-not-template' }
      mocked(s3).listS3Objects.mockResolvedValueOnce([s3Object, secondOldestNotTemplate])
      await s3LambdaCleanup()

      expect(s3.listS3Objects).toHaveBeenCalledTimes(1)
      expect(s3.deleteS3Object).toHaveBeenCalledTimes(0)
    })

    test('expect no files deleted when all files within cutoff time', async () => {
      mocked(s3).listS3Objects.mockResolvedValueOnce([s3ObjectTooNew, s3ObjectTooNewTwo])
      await s3LambdaCleanup()

      expect(s3.listS3Objects).toHaveBeenCalledTimes(1)
      expect(s3.deleteS3Object).toHaveBeenCalledTimes(0)
    })

    test('expect second-oldest file not deleted when newest file is within cutoff', async () => {
      mocked(s3).listS3Objects.mockResolvedValueOnce([s3Object, s3ObjectTooNew])
      await s3LambdaCleanup()

      expect(s3.listS3Objects).toHaveBeenCalledTimes(1)
      expect(s3.deleteS3Object).toHaveBeenCalledTimes(0)
    })
  })
})
