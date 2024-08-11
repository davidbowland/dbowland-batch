import { DeleteObjectCommand, DeleteObjectOutput, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3'

import { S3Object } from '../types'
import { xrayCapture } from '../utils/logging'

export const s3ClientEast1 = xrayCapture(new S3Client({ region: 'us-east-1' }))
export const s3ClientEast2 = xrayCapture(new S3Client({ region: 'us-east-2' }))

export const deleteS3Object = async (s3Client: S3Client, bucket: string, key: string): Promise<DeleteObjectOutput> => {
  const command = new DeleteObjectCommand({ Bucket: bucket, Key: key })
  return s3Client.send(command)
}

export const listS3Objects = async (
  s3Client: S3Client,
  bucket: string,
  prefix: string,
  continuationToken?: string
): Promise<S3Object[]> => {
  const command = new ListObjectsV2Command({
    Bucket: bucket,
    ContinuationToken: continuationToken,
    Prefix: prefix,
  })
  const response = await s3Client.send(command)
  const s3Objects: S3Object[] =
    response.Contents?.map((obj) => ({
      key: obj.Key!,
      modified: obj.LastModified!,
    })) ?? []
  if (response.IsTruncated && response.ContinuationToken) {
    return [...s3Objects, ...(await listS3Objects(s3Client, bucket, prefix, response.ContinuationToken))]
  } else {
    return s3Objects
  }
}
