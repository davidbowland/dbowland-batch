// General

export const s3LambdaCleanupDaysToKeep = parseInt(process.env.S3_LAMBDA_CLEANUP_DAYS_TO_KEEP as string, 10)
export const s3LambdaCleanupNumberOfThreads = parseInt(process.env.S3_LAMBDA_CLEANUP_NUMBER_OF_THREADS as string, 10)

// DynamoDB

export const lambdaCleanupTable = process.env.S3_LAMBDA_CLEANUP_TABLE_NAME as string
