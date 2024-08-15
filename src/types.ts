export * from 'aws-lambda'
export { S3Client } from '@aws-sdk/client-s3'

export type LambdaRegion = 'us-east-1' | 'us-east-2'

export interface LambdaCleanupProject {
  bucket: string
  prefixes: string[]
  region: LambdaRegion
}

export interface LambdaObjectsToDelete {
  objectsToDelete: S3Object[]
  secondOldestTime?: Date
}

export interface OldestLambdaFileTracker {
  cutoffDate: Date
  oldestTime?: Date
  secondOldestTime?: Date
}

export interface S3Object {
  key: string
  modified: Date
}
