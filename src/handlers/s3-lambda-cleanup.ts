import { deleteS3Object, listS3Objects, s3ClientEast1, s3ClientEast2 } from '../services/s3'
import { LambdaObjectsToDelete, LambdaRegion, OldestLambdaFileTracker, S3Client, S3Object } from '../types'
import { s3LambdaCleanupDaysToKeep, s3LambdaCleanupNumberOfThreads } from '../config'
import { log } from '../utils/logging'
import { processPromiseQueue } from '../utils/parallel'
import { scanLambdaCleanupProjects } from '../services/dynamodb'

/* S3 object processing */

const secondOldestReducer = (tracker: OldestLambdaFileTracker, s3Object: S3Object): OldestLambdaFileTracker => {
  if (!s3Object.key.endsWith('.template') || s3Object.modified >= tracker.cutoffDate) return tracker
  if (tracker.oldestTime === undefined || s3Object.modified > tracker.oldestTime) {
    return {
      cutoffDate: tracker.cutoffDate,
      oldestTime: s3Object.modified,
      secondOldestTime: tracker.oldestTime,
    }
  } else if (tracker.secondOldestTime === undefined ||
      (s3Object.modified > tracker.secondOldestTime && s3Object.modified < tracker.oldestTime)
  ) {
    return {
      cutoffDate: tracker.cutoffDate,
      oldestTime: tracker.oldestTime,
      secondOldestTime: s3Object.modified,
    }
  }
  return tracker
}

const findObjectsToDelete = (s3Objects: S3Object[]): LambdaObjectsToDelete => {
  const currentDate = new Date()
  const cutoffDate = new Date(
    currentDate.getUTCFullYear(),
    currentDate.getUTCMonth(),
    currentDate.getUTCDate() - s3LambdaCleanupDaysToKeep
  )
  const oldestFileTracker = s3Objects.reduce(secondOldestReducer, { cutoffDate } as OldestLambdaFileTracker)
  if (oldestFileTracker.secondOldestTime === undefined) return { objectsToDelete: [] }
  const secondOldestTime = oldestFileTracker.secondOldestTime
  // TypeScript isn't smart enough to recognize oldestFileTracker.secondOldestTime cannot be undefined
  return { objectsToDelete: s3Objects.filter((obj) => obj.modified <= secondOldestTime), secondOldestTime }
}

/* Clean up single prefix */

const cleanUpPrefix = async (s3Client: S3Client, bucket: string, prefix: string): Promise<void> => {
  const s3Objects = await listS3Objects(s3Client, bucket, prefix)
  const { objectsToDelete, secondOldestTime } = findObjectsToDelete(s3Objects)
  log('Determined objects to delete', { bucket, objectsToDelete, prefix, secondOldestTime })
  const promiseFn = (obj: S3Object) =>
    deleteS3Object(s3Client, bucket, obj.key).then(() => log('Object deleted', { bucket, key: obj.key }))
  return processPromiseQueue(promiseFn, objectsToDelete, { concurrency: s3LambdaCleanupNumberOfThreads })
}

const getS3ClientByRegion = (region: LambdaRegion): S3Client => {
  switch (region) {
  case 'us-east-1':
    return s3ClientEast1
  case 'us-east-2':
    return s3ClientEast2
  default:
    throw new Error(`Invalid region: ${region}`)
  }
}

/* Handler */

export const s3LambdaCleanup = async () => {
  const cleanupProjects = await scanLambdaCleanupProjects()
  const flattenedCleanupProjects = cleanupProjects.flatMap((project) =>
    project.prefixes.map((prefix: string) => ({ ...project, prefix }))
  )
  const promiseFn = ({ bucket, prefix, region }: (typeof flattenedCleanupProjects)[0]) =>
    cleanUpPrefix(getS3ClientByRegion(region), bucket, prefix)
  return processPromiseQueue(promiseFn, flattenedCleanupProjects)
}
