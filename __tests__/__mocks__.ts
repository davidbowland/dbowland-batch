import { LambdaCleanupProject, S3Object } from '@types'

export const lambdaCleanupProject: LambdaCleanupProject = {
  bucket: 'project-name',
  prefixes: ['lambda-one/'],
  region: 'us-east-1',
}

export const s3Object: S3Object = {
  key: 'test-file.template',
  modified: new Date('2024-09-12T02:37:52.000Z'),
}

export const s3ObjectOlder: S3Object = {
  key: 'test-file-2.template',
  modified: new Date('2024-09-11T02:37:52.000Z'),
}

export const s3ObjectEvenOlder: S3Object = {
  key: 'test-file-3.template',
  modified: new Date('2024-09-10T02:37:52.000Z'),
}
