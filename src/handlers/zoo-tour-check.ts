import { AvailableDate, AvailableMonth, fetchTourAvailability } from '../services/zoo'
import { log, logError } from '../utils/logging'
import { scanZooTours, setZooTour, ZooTour, ZooTourSettings } from '../services/dynamodb'
import { zooSmsNumberOfThreads, zooStatusCheckNumberOfThreads } from '../config'
import { processPromiseQueue } from '../utils/parallel'
import { sendSms } from '../services/sms'

/* SMS */

const formatDateFromISO = (availableDate: AvailableDate) =>
  new Date(availableDate.date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    weekday: 'short',
  })

const generateMessageContents = (
  availableDates: AvailableDate[],
  availableMonths: AvailableMonth[],
  settings: ZooTourSettings
) => {
  const availableDatesString =
    availableDates.length === 0
      ? ''
      : `

Best available dates: ${availableDates.slice(0, 5).map(formatDateFromISO).join('; ')}`

  return `New available month found for STL zoo!!

Tour: ${settings.title} - ${settings.url}

Months now available: ${availableMonths.join(', ')}${availableDatesString}`
}

/* Tour status */

const checkTourStatus = async (tour: ZooTour): Promise<void> => {
  try {
    log('Checking status of tour', {
      enabled: tour.settings.enabled,
      name: tour.settings.title,
      url: tour.settings.url,
    })
    if (!tour.settings.enabled) {
      log('Skipping disabled tour', { name: tour.settings.title })
      return
    }

    const currentTourAvailability = await fetchTourAvailability(tour.settings.url)
    const previousTourAvailability = tour.history[tour.history.length - 1]

    const previousAvailableMonths = previousTourAvailability
      ? new Set<string>(previousTourAvailability.availableMonths)
      : new Set()
    const newlyAvailableMonths = currentTourAvailability.availableMonths.filter(
      (month: AvailableMonth) => !previousAvailableMonths.has(month)
    )
    if (newlyAvailableMonths.length === 0) {
      log('No new months found', {
        currentlyAvailableMonths: currentTourAvailability.availableMonths,
        name: tour.settings.title,
        previousAvailableMonths,
      })
      return
    }

    const textMessageContents = generateMessageContents(
      currentTourAvailability.availableDates,
      newlyAvailableMonths,
      tour.settings
    )
    log('Sending SMS messages', { phone_numbers: tour.settings.phone_numbers, textMessageContents })
    await processPromiseQueue(
      (phoneNumber: string) => sendSms(phoneNumber, textMessageContents),
      tour.settings.phone_numbers,
      { concurrency: zooSmsNumberOfThreads }
    )

    log('Updating tour history', { name: tour.settings.title })
    const updatedTour: ZooTour = {
      ...tour,
      history: [...tour.history, currentTourAvailability],
    }
    await setZooTour(updatedTour)
  } catch (error: any) {
    logError(error)
  }
}

export const zooTourCheckHandler = async (): Promise<void> => {
  try {
    const zooTours = await scanZooTours()
    log(`Found ${zooTours.length} zoo tours`, [zooTours.map((tour: ZooTour) => tour.tourId)])

    await processPromiseQueue(checkTourStatus, zooTours, { concurrency: zooStatusCheckNumberOfThreads })
  } catch (error: any) {
    logError(error)
  }
}
