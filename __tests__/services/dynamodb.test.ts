import { lambdaCleanupProject, mockZooTour, mockZooTourSettings } from '../__mocks__'
import { scanLambdaCleanupProjects, scanZooTours, setZooTour } from '@services/dynamodb'

const mockSend = jest.fn()
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDB: jest.fn(() => ({
    send: (...args) => mockSend(...args),
  })),
  PutItemCommand: jest.fn().mockImplementation((x) => x),
  ScanCommand: jest.fn().mockImplementation((x) => x),
}))
jest.mock('@utils/logging', () => ({
  xrayCapture: jest.fn().mockImplementation((x) => x),
}))

describe('dynamodb', () => {
  describe('scanLambdaCleanupProjects', () => {
    beforeAll(() => {
      mockSend.mockResolvedValueOnce({
        Items: [{ Data: { S: JSON.stringify(lambdaCleanupProject) }, Project: { S: 'test-project' } }],
      })
    })

    it('calls DynamoDB with the correct arguments', async () => {
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

  describe('scanZooTours', () => {
    beforeAll(() => {
      mockSend.mockResolvedValueOnce({
        Items: [
          {
            History: { S: JSON.stringify(mockZooTour.history) },
            Settings: { S: JSON.stringify(mockZooTourSettings) },
            TourId: { S: mockZooTour.tourId },
          },
        ],
      })
    })

    it('calls DynamoDB with the correct arguments', async () => {
      const result = await scanZooTours()

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          AttributesToGet: ['History', 'Settings', 'TourId'],
          TableName: 'zoo-tour-test',
        })
      )
      expect(result).toEqual([mockZooTour])
    })
  })

  describe('setZooTour', () => {
    it('calls DynamoDB with the correct arguments', async () => {
      await setZooTour(mockZooTour)

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          Item: {
            History: { S: JSON.stringify(mockZooTour.history) },
            Settings: { S: JSON.stringify(mockZooTourSettings) },
            TourId: { S: mockZooTour.tourId },
          },
          TableName: 'zoo-tour-test',
        })
      )
    })
  })
})
