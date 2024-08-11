import { deleteS3Object, listS3Objects } from '@services/s3'
import { S3Client } from '@aws-sdk/client-s3'

const mockSend = jest.fn()
jest.mock('@aws-sdk/client-s3', () => ({
  DeleteObjectCommand: jest.fn().mockImplementation((x) => x),
  ListObjectsV2Command: jest.fn().mockImplementation((x) => x),
  S3Client: jest.fn(() => ({
    send: (...args) => mockSend(...args),
  })),
}))
jest.mock('@utils/logging', () => ({
  xrayCapture: jest.fn().mockImplementation((x) => x),
}))

describe('S3', () => {
  const bucket = 's3-bucket-name'
  const key = 'prefix/key'
  const mockS3Client = new S3Client()

  describe('deleteS3Object', () => {
    test('expect key passed to mock', async () => {
      await deleteS3Object(mockS3Client, bucket, key)

      expect(mockSend).toHaveBeenCalledWith({
        Bucket: bucket,
        Key: key,
      })
    })

    test('expect reject when promise rejects', async () => {
      const rejectReason = 'unable to foo the bar'
      mockSend.mockRejectedValueOnce(rejectReason)

      await expect(deleteS3Object(mockS3Client, bucket, key)).rejects.toEqual(rejectReason)
    })
  })

  describe('listS3Objects', () => {
    const responseNoContinuation = {
      Contents: [
        { Key: 'file1', LastModified: new Date('2024-01-01') },
        { Key: 'folder/file2.template', LastModified: new Date('2022-07-07') },
      ],
      IsTruncated: false,
    }
    const responseWithContinuation = {
      Contents: [
        { Key: 'file3.template', LastModified: new Date('2023-02-02') },
        { Key: 'folder/file4', LastModified: new Date('2020-05-05') },
      ],
      ContinuationToken: 'a-continuation-token',
      IsTruncated: true,
    }

    beforeAll(() => {
      mockSend.mockResolvedValue(responseNoContinuation)
    })

    test('expect no results when no files', async () => {
      mockSend.mockResolvedValueOnce({})

      const result = await listS3Objects(mockS3Client, 'my-bucket', 'my-prefix')
      expect(result).toEqual([])
    })

    test('expect non-truncated results when results are not truncated', async () => {
      const result = await listS3Objects(mockS3Client, 'my-bucket', 'my-prefix')
      expect(result).toEqual([
        {
          key: 'file1',
          modified: new Date('2024-01-01T00:00:00.000Z'),
        },
        {
          key: 'folder/file2.template',
          modified: new Date('2022-07-07T00:00:00.000Z'),
        },
      ])
    })

    test('expect all results when results are truncated', async () => {
      mockSend.mockResolvedValueOnce(responseWithContinuation)

      const result = await listS3Objects(mockS3Client, 'my-bucket', 'my-prefix')
      expect(result).toEqual([
        {
          key: 'file3.template',
          modified: new Date('2023-02-02T00:00:00.000Z'),
        },
        {
          key: 'folder/file4',
          modified: new Date('2020-05-05T00:00:00.000Z'),
        },
        {
          key: 'file1',
          modified: new Date('2024-01-01T00:00:00.000Z'),
        },
        {
          key: 'folder/file2.template',
          modified: new Date('2022-07-07T00:00:00.000Z'),
        },
      ])
    })

    test('expect reject when promise rejects', async () => {
      const rejectReason = 'unable to foo the bar'
      mockSend.mockRejectedValueOnce(rejectReason)

      await expect(listS3Objects(mockS3Client, bucket, key)).rejects.toEqual(rejectReason)
    })
  })
})
