import { smsApiKey, smsApiUrl } from '@config'
import { sendSms } from '@services/sms'

const mockPostEndpoint = jest.fn()
jest.mock('axios', () => ({
  create: ({ baseURL, headers }) => ({
    post: (url, data) => {
      mockPostEndpoint(`${baseURL}${url}`, data, headers)
    },
  }),
}))
jest.mock('axios-retry')
jest.mock('@utils/logging')

describe('sms', () => {
  describe('sendSms', () => {
    const to = '+1800JENNYCRAIG'
    const contents = 'Hello, Goodbye!'

    it('pass sms contents to the endpoint', async () => {
      await sendSms(to, contents)
      expect(mockPostEndpoint).toHaveBeenCalledWith(
        `${smsApiUrl}/messages`,
        {
          contents,
          messageType: 'TRANSACTIONAL',
          to,
        },
        { 'x-api-key': smsApiKey }
      )
    })
  })
})
