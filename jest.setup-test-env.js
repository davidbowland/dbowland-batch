/* Batch processes */

// S3 Cleanup
process.env.S3_LAMBDA_CLEANUP_NUMBER_OF_THREADS = 1

/* AWS resources */

// DynamoDB
process.env.S3_LAMBDA_CLEANUP_TABLE_NAME = 's3-lambda-cleanup-test'
