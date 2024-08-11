import { lambdaCleanupProject } from '../__mocks__'
import { scanLambdaCleanupProjects } from '@services/dynamodb'

const mockSend = jest.fn()
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDB: jest.fn(() => ({
    send: (...args) => mockSend(...args),
  })),
  ScanCommand: jest.fn().mockImplementation((x) => x),
}))
jest.mock('@utils/logging', () => ({
  xrayCapture: jest.fn().mockImplementation((x) => x),
}))

describe('dynamodb', () => {
  describe('scanLambdaCleanupProjects', () => {
    const projectName = 'test-project'

    test('should call DynamoDB with the correct arguments', async () => {
      mockSend.mockResolvedValueOnce({
        Items: [{ Data: { S: JSON.stringify(lambdaCleanupProject) }, Project: { S: projectName } }],
      })

      const result = await scanLambdaCleanupProjects()

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          AttributesToGet: ['Data', 'Project'],
          TableName: 's3-lambda-cleanup-test',
        })
      )
      expect(result).toEqual([lambdaCleanupProject])
    })
  })
})
