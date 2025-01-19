import { http, HttpResponse, server } from '@setup-server'
import { mockAvailabileMonths, mockZooBody } from '../__mocks__'
import { fetchTourAvailability } from '@services/zoo'

jest.mock('@utils/logging')

describe('zoo', () => {
  describe('fetchTourAvailability', () => {
    const getEndpoint = jest.fn().mockReturnValue(mockZooBody)
    const url = 'https://the.zoo/da-bears'

    beforeAll(() => {
      server.use(
        http.get(url, async () => {
          const body = getEndpoint()
          return body ? HttpResponse.json(body) : new HttpResponse(null, { status: 400 })
        })
      )

      jest.useFakeTimers().setSystemTime(new Date(Date.UTC(2025, 1, 15)))
    })

    it('should return the availability', async () => {
      const result = await fetchTourAvailability(url)
      expect(result).toEqual({
        availableDates: [
          {
            date: '2025-01-11T00:00:00.000Z', // Saturday
            url: 'https://estore.stlzoo.org/EventPurchase.aspx?dateselected=1/11/2025',
          },
          {
            date: '2025-01-03T00:00:00.000Z', // Friday
            url: 'https://estore.stlzoo.org/EventPurchase.aspx?dateselected=1/3/2025',
          },
          {
            date: '2025-01-01T00:00:00.000Z', // Early Wednesday
            url: 'https://estore.stlzoo.org/EventPurchase.aspx?dateselected=1/1/2025',
          },
          {
            date: '2025-01-08T00:00:00.000Z', // Later Wednesday
            url: 'https://estore.stlzoo.org/EventPurchase.aspx?dateselected=1/8/2025',
          },
          {
            date: '2025-04-12T00:00:00.000Z', // Blackout
            url: 'https://estore.stlzoo.org/EventPurchase.aspx?dateselected=4/12/2025',
          },
        ],
        availableMonths: mockAvailabileMonths,
        updatedAt: '2025-02-15T00:00:00.000Z',
      })
    })

    it('should reject when no months exist', async () => {
      getEndpoint.mockReturnValue('no months here')

      await expect(fetchTourAvailability(url)).rejects.toEqual(new Error('Unable to parse available dates'))
    })
  })
})
