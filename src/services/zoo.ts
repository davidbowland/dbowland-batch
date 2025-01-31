import axios from 'axios'
import axiosRetry from 'axios-retry'

import { log } from '../utils/logging'

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay })

export interface AvailableDate {
  date: string
  url: string
}

export type AvailableMonth = string

export interface TourAvailability {
  availableMonths: AvailableMonth[]
  availableDates: AvailableDate[]
  updatedAt: string
}

/* Find the best day */

const isBlackoutDate = (date: Date): boolean => date <= new Date('2025-04-13 GMT') && date >= new Date('2025-04-10 GMT')

const getDateSortValue = (date: Date) => [
  isBlackoutDate(date), // Not a traveling date
  date.getUTCDay() !== 6, // Prefer Saturdays
  date.getUTCDay() !== 5, // then prefer Fridays
  date, // Prefer closer dates
]

const dateSortFn = (a: Date, b: Date): number => {
  const [a_value, b_value] = [getDateSortValue(a), getDateSortValue(b)]
  if (a_value < b_value) {
    return -1
  } else if (a_value > b_value) {
    return 1
  } else {
    return 0
  }
}

/* Find available dates */

const findAvailableDates = (body: string): AvailableDate[] =>
  Array.from(body.matchAll(/<a [^>]*href="([^"]*dateselected=([^"]+))"[^>]*>/g)).map((match) => ({
    date: new Date(`${match[2]} GMT`).toISOString(),
    url: match[1],
  }))

const findAvailableMonths = (body: string): AvailableMonth[] => {
  const selectHtml = body.match(/<select [^>]+>.+Jump to Month<\/option>(.*?)<\/select>/s)?.[1] ?? ''
  const availableMonths = Array.from(selectHtml.matchAll(/<option value="([^"]+)">[^<]*<\/option>/g)).map(
    (match) => match[1]
  )
  if (availableMonths.length === 0) {
    log('Unable to parse available dates', { availableMonths, selectHtml })
    throw new Error('Unable to parse available dates')
  }
  return availableMonths
}

/* Find tour information */

export const fetchTourAvailability = async (url: string): Promise<TourAvailability> => {
  const { data } = await axios.get<string>(url)
  return {
    availableDates: findAvailableDates(data).toSorted((a, b) => dateSortFn(new Date(a.date), new Date(b.date))),
    availableMonths: findAvailableMonths(data),
    updatedAt: new Date().toISOString(),
  }
}
