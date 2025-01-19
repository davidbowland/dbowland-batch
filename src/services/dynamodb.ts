import { DynamoDB, PutItemCommand, PutItemCommandOutput, ScanCommand, ScanOutput } from '@aws-sdk/client-dynamodb'

import { lambdaCleanupTable, zooTourTable } from '../config'
import { LambdaCleanupProject } from '../types'
import { TourAvailability } from './zoo'
import { xrayCapture } from '../utils/logging'

const dynamodb = xrayCapture(new DynamoDB({ apiVersion: '2012-08-10' }))

export interface ZooTourSettings {
  email_addresses: string[]
  enabled: boolean
  phone_numbers: string[]
  title: string
  url: string
}

export interface ZooTour {
  history: TourAvailability[]
  settings: ZooTourSettings
  tourId: string
}

/* Lambda cleanup project */

export const scanLambdaCleanupProjects = async (): Promise<LambdaCleanupProject[]> => {
  const command = new ScanCommand({
    AttributesToGet: ['Data', 'Project'],
    TableName: lambdaCleanupTable,
  })
  const response: ScanOutput = await dynamodb.send(command)
  return response.Items?.map((item) => JSON.parse(item.Data.S as string)) as LambdaCleanupProject[]
}

/* Zoo tours */

export const scanZooTours = async (): Promise<ZooTour[]> => {
  const command = new ScanCommand({
    AttributesToGet: ['History', 'Settings', 'TourId'],
    TableName: zooTourTable,
  })
  const response: ScanOutput = await dynamodb.send(command)
  return response.Items?.map((item) => ({
    history: JSON.parse(item.History?.S ?? '[]'),
    settings: JSON.parse(item.Settings.S as string),
    tourId: item.TourId.S,
  })) as ZooTour[]
}

export const setZooTour = async (zooTour: ZooTour): Promise<PutItemCommandOutput> => {
  const command = new PutItemCommand({
    Item: {
      History: { S: JSON.stringify(zooTour.history) },
      Settings: { S: JSON.stringify(zooTour.settings) },
      TourId: { S: zooTour.tourId },
    },
    TableName: zooTourTable,
  })
  return await dynamodb.send(command)
}
