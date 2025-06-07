import { mocked } from 'jest-mock'

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
      mocked(dynamodb).scanZooTours.mockResolvedValue([mockZooTour])
      mocked(zoo).fetchTourAvailability.mockResolvedValue(mockTourAvailability)
      mocked(processPromiseQueue).mockImplementation(async (promiseFn, iterable) => {
        await Promise.all(iterable.map(promiseFn))
      })
    })

    it('sends no SMS and does not update record when no changes have been made', async () => {
      await zooTourCheckHandler()

      expect(mocked(dynamodb).scanZooTours).toHaveBeenCalledTimes(1)
      expect(mocked(zoo).fetchTourAvailability).toHaveBeenCalledTimes(1)
      expect(mocked(dynamodb).setZooTour).not.toHaveBeenCalled()
      expect(mocked(sms).sendSms).not.toHaveBeenCalled()
    })

    it("logs an error but doesn't reject when processPromiseQueue rejects", async () => {
      mocked(processPromiseQueue).mockRejectedValueOnce(new Error('How did this even happen?'))

      await expect(zooTourCheckHandler()).resolves.toBeFalsy()
      expect(logError).toHaveBeenCalledTimes(1)
    })

    it('skips fetch tour when tour is disabled', async () => {
      mocked(dynamodb).scanZooTours.mockResolvedValueOnce([
        { ...mockZooTour, settings: { ...mockZooTour.settings, enabled: false } },
      ])

      await zooTourCheckHandler()
      expect(mocked(zoo).fetchTourAvailability).not.toHaveBeenCalled()
    })

    it("logs an error but doesn't reject when fetchTourAvailability rejects", async () => {
      mocked(zoo).fetchTourAvailability.mockRejectedValueOnce(new Error('Some HTTP error'))

      await expect(zooTourCheckHandler()).resolves.toBeFalsy()
      expect(logError).toHaveBeenCalledTimes(1)
    })

    it('adds the first history entry if none exist', async () => {
      const zooTourWithNoHistory = { ...mockZooTour, history: [] }
      const updatedZooTour = {
        ...mockZooTour,
        history: [mockTourAvailability],
      }
      mocked(dynamodb).scanZooTours.mockResolvedValueOnce([zooTourWithNoHistory])

      await zooTourCheckHandler()

      expect(mocked(dynamodb).setZooTour).toHaveBeenCalledWith(updatedZooTour)
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
      mocked(zoo).fetchTourAvailability.mockResolvedValueOnce(tourAvailabilityWithNewMonth)

      await zooTourCheckHandler()

      expect(mocked(sms).sendSms).toHaveBeenCalledWith(
        '+15558675309',
        `New available month found for STL zoo!!

Tour: Da bears - https://the.zoo/da-bears

Months now available: 3/1/2025

Best available dates: Sat, Jan 11; Fri, Jan 3; Wed, Jan 1; Wed, Jan 8; Sat, Apr 12`,
      )
      expect(mocked(dynamodb).setZooTour).toHaveBeenCalledWith(updatedZooTour)
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
      mocked(zoo).fetchTourAvailability.mockResolvedValueOnce(tourAvailabilityWithNoDates)

      await zooTourCheckHandler()

      expect(mocked(sms).sendSms).toHaveBeenCalledWith(
        '+15558675309',
        `New available month found for STL zoo!!

Tour: Da bears - https://the.zoo/da-bears

Months now available: 3/1/2025`,
      )
      expect(mocked(dynamodb).setZooTour).toHaveBeenCalledWith(updatedZooTour)
    })
  })
})
