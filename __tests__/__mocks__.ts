import { ZooTour, ZooTourSettings } from '@services/dynamodb'
import { AvailableDate, AvailableMonth, TourAvailability } from '@services/zoo'
import { LambdaCleanupProject, S3Object } from '@types'

/* Lambda cleanup project */

export const lambdaCleanupProject: LambdaCleanupProject = {
  bucket: 'project-name',
  prefixes: ['lambda-one/'],
  region: 'us-east-1',
}

/* S3 */

export const s3MockTime = new Date('2024-08-15T06:11:01.683Z')

export const s3Object: S3Object = {
  key: 'test-file.template',
  modified: new Date('2024-07-12T02:37:52.000Z'),
}

export const s3ObjectOlder: S3Object = {
  key: 'test-file-2.template',
  modified: new Date('2024-07-11T04:41:22.000Z'),
}

export const s3ObjectEvenOlder: S3Object = {
  key: 'test-file-3.template',
  modified: new Date('2024-07-10T11:19:19.000Z'),
}

export const s3ObjectTooNew: S3Object = {
  key: 'test-file-4.template',
  modified: new Date('2024-08-12T03:09:28.000Z'),
}

export const s3ObjectTooNewTwo: S3Object = {
  key: 'test-file-5.template',
  modified: new Date('2024-08-10T07:56:30.000Z'),
}

/* Zoo tours */

export const mockAvailabileMonths: AvailableMonth[] = ['1/1/2025', '2/1/2025']

export const mockAvailableEarlierWednesday: AvailableDate = {
  date: '2025-01-01T00:00:00.000Z',
  url: 'https://the.zoo/book-it?date=2025-01-01',
}

export const mockAvailableLaterWednesday: AvailableDate = {
  date: '2025-01-08T00:00:00.000Z',
  url: 'https://the.zoo/book-it?date=2025-01-08',
}

export const mockAvailableFriday: AvailableDate = {
  date: '2025-01-03T00:00:00.000Z',
  url: 'https://the.zoo/book-it?date=2025-01-03',
}

export const mockAvailableSaturday: AvailableDate = {
  date: '2025-01-11T00:00:00.000Z',
  url: 'https://the.zoo/book-it?date=2025-01-11',
}

export const mockBlackoutDate: AvailableDate = {
  date: '2025-04-12T00:00:00.000Z',
  url: 'https://the.zoo/book-it?date=2025-04-12',
}

export const mockTourAvailability: TourAvailability = {
  availableDates: [
    mockAvailableSaturday,
    mockAvailableFriday,
    mockAvailableEarlierWednesday,
    mockAvailableLaterWednesday,
    mockBlackoutDate,
  ],
  availableMonths: mockAvailabileMonths,
  updatedAt: '2025-01-22T12:19:18.000Z',
}

export const mockZooTourSettings: ZooTourSettings = {
  email_addresses: ['george@thejungle.com'],
  enabled: true,
  phone_numbers: ['+15558675309'],
  title: 'Da bears',
  url: 'https://the.zoo/da-bears',
}

export const mockZooTour: ZooTour = {
  history: [mockTourAvailability],
  settings: mockZooTourSettings,
  tourId: 'da-bears-2025',
}

export const mockZooBody = `
<select name="ctl00$eTAMContent$cboMonthFilter" id="ctl00_eTAMContent_cboMonthFilter" class="form-control form-control-sm">
  <option selected="selected" value="Jump to Month">Jump to Month</option>
  <option value="1/1/2025">January 2025</option>
  <option value="2/1/2025">February 2025</option>
</select>
<a class="tam-cal-cell py-2 px-1 px-sm-2 m-0 text-center ignore-anchor-font h5" href="https://estore.stlzoo.org/EventPurchase.aspx?dateselected=1/1/2025" style="background-color:lightgreen;color:black !important;">1</a>
<a class="tam-cal-cell py-2 px-1 px-sm-2 m-0 text-center ignore-anchor-font h5" href="https://estore.stlzoo.org/EventPurchase.aspx?dateselected=1/8/2025" style="background-color:lightgreen;color:black !important;">8</a>
<a class="tam-cal-cell py-2 px-1 px-sm-2 m-0 text-center ignore-anchor-font h5" href="https://estore.stlzoo.org/EventPurchase.aspx?dateselected=1/3/2025" style="background-color:lightgreen;color:black !important;">4</a>
<a class="tam-cal-cell py-2 px-1 px-sm-2 m-0 text-center ignore-anchor-font h5" href="https://estore.stlzoo.org/EventPurchase.aspx?dateselected=1/11/2025" style="background-color:lightgreen;color:black !important;">12</a>
<a class="tam-cal-cell py-2 px-1 px-sm-2 m-0 text-center ignore-anchor-font h5" href="https://estore.stlzoo.org/EventPurchase.aspx?dateselected=4/12/2025" style="background-color:lightgreen;color:black !important;">12</a>
`
