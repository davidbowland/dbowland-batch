import { lambdaCleanupProject } from '../__mocks__'
import { scanLambdaCleanupProjects } from '@services/dynamodb'

const mockSend = jest.fn()
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDB: jest.fn(() => ({
    send: (...args) => mockSend(...args),
  })),
  ScanCommand: jest.fn().mockImplementation((x) => x),
}))

describe('dynamodb', () => {
  describe('scanLambdaCleanupProjects', () => {
    beforeAll(() => {
      mockSend.mockResolvedValue({
        Items: [{ Data: { S: JSON.stringify(lambdaCleanupProject) }, Project: { S: 'test-project' } }],
      })
    })

    it('should call DynamoDB with the correct arguments', async () => {
      const result = await scanLambdaCleanupProjects()

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          AttributesToGet: ['Data', 'Project'],
          TableName: 's3-lambda-cleanup-test',
        }),
      )
      expect(result).toEqual([lambdaCleanupProject])
    })
  })
})
