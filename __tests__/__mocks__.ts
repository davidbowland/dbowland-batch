import { LambdaCleanupProject, S3Object } from '@types'

export const lambdaCleanupProject: LambdaCleanupProject = {
  bucket: 'project-name',
  prefixes: ['lambda-one/'],
  region: 'us-east-1',
}

export const s3MockTime = new Date('2024-08-15T06:11:01.683Z')

export const s3Object: S3Object = {
  key: 'test-file.template',
  modified: new Date('2024-07-12T02:37:52.000Z'),
}

export const s3ObjectOlder: S3Object = {
  key: 'test-file-2.template',
  modified: new Date('2024-07-11T04:41:22.000Z'),
}

export const s3ObjectEvenOlder: S3Object = {
  key: 'test-file-3.template',
  modified: new Date('2024-07-10T11:19:19.000Z'),
}

export const s3ObjectTooNew: S3Object = {
  key: 'test-file-4.template',
  modified: new Date('2024-08-12T03:09:28.000Z'),
}

export const s3ObjectTooNewTwo: S3Object = {
  key: 'test-file-5.template',
  modified: new Date('2024-08-10T07:56:30.000Z'),
}
