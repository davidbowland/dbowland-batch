import { DynamoDB, ScanCommand, ScanOutput } from '@aws-sdk/client-dynamodb'

import { lambdaCleanupTable } from '../config'
import { LambdaCleanupProject } from '../types'
import { xrayCapture } from '../utils/logging'

const dynamodb = xrayCapture(new DynamoDB({ apiVersion: '2012-08-10' }))

/* Lambda cleanup project */

export const scanLambdaCleanupProjects = async (): Promise<LambdaCleanupProject[]> => {
  const command = new ScanCommand({
    AttributesToGet: ['Data', 'Project'],
    TableName: lambdaCleanupTable,
  })
  const response: ScanOutput = await dynamodb.send(command)
  return response.Items?.map((item) => JSON.parse(item.Data.S as string)) as LambdaCleanupProject[]
}
