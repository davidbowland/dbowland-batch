/* Batch processes */

// S3 Cleanup
export const s3LambdaCleanupNumberOfThreads = parseInt(process.env.S3_LAMBDA_CLEANUP_NUMBER_OF_THREADS as string, 10)

/* AWS resources */

// DynamoDB

export const lambdaCleanupTable = process.env.S3_LAMBDA_CLEANUP_TABLE_NAME as string
