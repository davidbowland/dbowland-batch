// General

export const s3LambdaCleanupDaysToKeep = parseInt(process.env.S3_LAMBDA_CLEANUP_DAYS_TO_KEEP as string, 10)
export const s3LambdaCleanupNumberOfThreads = parseInt(process.env.S3_LAMBDA_CLEANUP_NUMBER_OF_THREADS as string, 10)
export const zooSmsNumberOfThreads = parseInt(process.env.ZOO_TOUR_SMS_NUMBER_OF_THREADS as string, 10)
export const zooStatusCheckNumberOfThreads = parseInt(process.env.ZOO_TOUR_STATUS_NUMBER_OF_THREADS as string, 10)

// DynamoDB

export const lambdaCleanupTable = process.env.S3_LAMBDA_CLEANUP_TABLE_NAME as string
export const zooTourTable = process.env.ZOO_TOUR_TABLE as string

// SMS

export const smsApiKey = process.env.SMS_API_KEY as string
export const smsApiUrl = process.env.SMS_API_URL as string
