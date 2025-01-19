import axios, { AxiosResponse } from 'axios'

import { smsApiKey, smsApiUrl } from '../config'
import { xrayCaptureHttps } from '../utils/logging'

xrayCaptureHttps()
const api = axios.create({
  baseURL: smsApiUrl,
  headers: { 'x-api-key': smsApiKey },
})

export type MessageType = 'PROMOTIONAL' | 'TRANSACTIONAL'

export interface SMSMessage {
  to: string
  contents: string
  messageType?: MessageType
}

/* SMS */

const convertContentsToJson = (to: string, contents: string): SMSMessage => ({
  contents,
  messageType: 'TRANSACTIONAL',
  to,
})

const sendRawSms = (body: SMSMessage): Promise<AxiosResponse> => api.post('/messages', body, {})

export const sendSms = (to: string, contents: string): Promise<AxiosResponse> =>
  sendRawSms(convertContentsToJson(to, contents))
