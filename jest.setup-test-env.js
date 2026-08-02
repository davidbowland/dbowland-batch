// General

process.env.S3_LAMBDA_CLEANUP_DAYS_TO_KEEP = '7'
process.env.S3_LAMBDA_CLEANUP_NUMBER_OF_THREADS = '1'

// DynamoDB

process.env.S3_LAMBDA_CLEANUP_TABLE_NAME = 's3-lambda-cleanup-test'
