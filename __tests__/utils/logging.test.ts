import { S3 } from '@aws-sdk/client-s3'
import * as AWSXRay from 'aws-xray-sdk-core'
import https from 'https'
import { mocked } from 'jest-mock'

import { log, logError, xrayCapture, xrayCaptureHttps } from '@utils/logging'

jest.mock('aws-xray-sdk-core')

describe('logging', () => {
  beforeAll(() => {
    console.error = jest.fn()
    console.log = jest.fn()
  })

  describe('log', () => {
    it.each(['Hello', 0, null, undefined, { a: 1, b: 2 }])('should log the message for value %s', async (value) => {
      const message = `Log message for value ${JSON.stringify(value)}`
      await log(message)

      expect(console.log).toHaveBeenCalledWith(message)
    })
  })

  describe('logError', () => {
    it.each(['Hello', 0, null, undefined, { a: 1, b: 2 }])('should log the error for value %s', async (value) => {
      const message = `Error message for value ${JSON.stringify(value)}`
      const error = new Error(message)
      await logError(error)

      expect(console.error).toHaveBeenCalledWith(error)
    })
  })

  describe('xrayCapture', () => {
    const capturedS3 = 'captured-s3' as unknown as S3
    const s3 = 's3'

    beforeAll(() => {
      mocked(AWSXRay).captureAWSv3Client.mockReturnValue(capturedS3)
    })

    it('should return AWSXRay.captureAWSv3Client when x-ray is enabled', () => {
      process.env.AWS_SAM_LOCAL = 'false'
      const result = xrayCapture(s3)

      expect(mocked(AWSXRay).captureAWSv3Client).toHaveBeenCalledWith(s3)
      expect(result).toEqual(capturedS3)
    })

    it('should return same object when x-ray is disabled', () => {
      process.env.AWS_SAM_LOCAL = 'true'
      const result = xrayCapture(s3)

      expect(mocked(AWSXRay).captureAWSv3Client).toHaveBeenCalledTimes(0)
      expect(result).toEqual(s3)
    })
  })

  describe('xrayCaptureHttps', () => {
    it('should call AWSXRay.captureHTTPsGlobal when x-ray is enabled', () => {
      process.env.AWS_SAM_LOCAL = 'false'
      xrayCaptureHttps()

      expect(mocked(AWSXRay).captureHTTPsGlobal).toHaveBeenCalledWith(https)
    })

    it('should not call AWSXRay.captureHTTPsGlobal when x-ray is disabled', () => {
      process.env.AWS_SAM_LOCAL = 'true'
      xrayCaptureHttps()

      expect(mocked(AWSXRay).captureHTTPsGlobal).toHaveBeenCalledTimes(0)
    })
  })
})
