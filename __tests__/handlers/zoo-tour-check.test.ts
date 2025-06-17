import { mockAvailabileMonths, mockTourAvailability, mockZooTour } from '../__mocks__'
import { zooTourCheckHandler } from '@handlers/zoo-tour-check'
import * as dynamodb from '@services/dynamodb'
import * as sms from '@services/sms'
import * as zoo from '@services/zoo'
import { logError } from '@utils/logging'
import { processPromiseQueue } from '@utils/parallel'

jest.mock('@services/dynamodb')
jest.mock('@services/sms')
jest.mock('@services/zoo')
jest.mock('@utils/logging')
jest.mock('@utils/parallel')

describe('zoo-tour-check', () => {
  describe('zooTourCheckHandler', () => {
    beforeAll(() => {
      jest.mocked(dynamodb).scanZooTours.mockResolvedValue([mockZooTour])
      jest.mocked(zoo).fetchTourAvailability.mockResolvedValue(mockTourAvailability)
      jest.mocked(processPromiseQueue).mockImplementation(async (promiseFn, iterable) => {
        await Promise.all(iterable.map(promiseFn))
      })
    })

    it('sends no SMS and does not update record when no changes have been made', async () => {
      await zooTourCheckHandler()

      expect(dynamodb.scanZooTours).toHaveBeenCalledTimes(1)
      expect(zoo.fetchTourAvailability).toHaveBeenCalledTimes(1)
      expect(dynamodb.setZooTour).not.toHaveBeenCalled()
      expect(sms.sendSms).not.toHaveBeenCalled()
    })

    it("logs an error but doesn't reject when processPromiseQueue rejects", async () => {
      jest.mocked(processPromiseQueue).mockRejectedValueOnce(new Error('How did this even happen?'))

      await expect(zooTourCheckHandler()).resolves.toBeFalsy()
      expect(logError).toHaveBeenCalledTimes(1)
    })

    it('skips fetch tour when tour is disabled', async () => {
      jest
        .mocked(dynamodb)
        .scanZooTours.mockResolvedValueOnce([{ ...mockZooTour, settings: { ...mockZooTour.settings, enabled: false } }])

      await zooTourCheckHandler()
      expect(zoo.fetchTourAvailability).not.toHaveBeenCalled()
    })

    it("logs an error but doesn't reject when fetchTourAvailability rejects", async () => {
      jest.mocked(zoo).fetchTourAvailability.mockRejectedValueOnce(new Error('Some HTTP error'))

      await expect(zooTourCheckHandler()).resolves.toBeFalsy()
      expect(logError).toHaveBeenCalledTimes(1)
    })

    it('adds the first history entry if none exist', async () => {
      const zooTourWithNoHistory = { ...mockZooTour, history: [] }
      const updatedZooTour = {
        ...mockZooTour,
        history: [mockTourAvailability],
      }
      jest.mocked(dynamodb).scanZooTours.mockResolvedValueOnce([zooTourWithNoHistory])

      await zooTourCheckHandler()

      expect(dynamodb.setZooTour).toHaveBeenCalledWith(updatedZooTour)
    })

    it('sends a text message and updates the record when new months are found', async () => {
      const tourAvailabilityWithNewMonth = {
        ...mockTourAvailability,
        availableMonths: [...mockAvailabileMonths, '3/1/2025'],
      }
      const updatedZooTour = {
        ...mockZooTour,
        history: [...mockZooTour.history, tourAvailabilityWithNewMonth],
      }
      jest.mocked(zoo).fetchTourAvailability.mockResolvedValueOnce(tourAvailabilityWithNewMonth)

      await zooTourCheckHandler()

      expect(sms.sendSms).toHaveBeenCalledWith(
        '+15558675309',
        `New available month found for STL zoo!!

Tour: Da bears - https://the.zoo/da-bears

Months now available: 3/1/2025

Best available dates: Sat, Jan 11; Fri, Jan 3; Wed, Jan 1; Wed, Jan 8; Sat, Apr 12`,
      )
      expect(dynamodb.setZooTour).toHaveBeenCalledWith(updatedZooTour)
    })

    it('should send a different message when no dates are available', async () => {
      const tourAvailabilityWithNoDates = {
        ...mockTourAvailability,
        availableDates: [],
        availableMonths: [...mockAvailabileMonths, '3/1/2025'],
      }
      const updatedZooTour = {
        ...mockZooTour,
        history: [...mockZooTour.history, tourAvailabilityWithNoDates],
      }
      jest.mocked(zoo).fetchTourAvailability.mockResolvedValueOnce(tourAvailabilityWithNoDates)

      await zooTourCheckHandler()

      expect(sms.sendSms).toHaveBeenCalledWith(
        '+15558675309',
        `New available month found for STL zoo!!

Tour: Da bears - https://the.zoo/da-bears

Months now available: 3/1/2025`,
      )
      expect(dynamodb.setZooTour).toHaveBeenCalledWith(updatedZooTour)
    })
  })
})
