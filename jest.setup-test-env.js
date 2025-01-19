// General

process.env.S3_LAMBDA_CLEANUP_DAYS_TO_KEEP = '7'
process.env.S3_LAMBDA_CLEANUP_NUMBER_OF_THREADS = '1'
process.env.ZOO_TOUR_SMS_NUMBER_OF_THREADS = '2'
process.env.ZOO_TOUR_STATUS_NUMBER_OF_THREADS = '3'

// DynamoDB

process.env.S3_LAMBDA_CLEANUP_TABLE_NAME = 's3-lambda-cleanup-test'
process.env.ZOO_TOUR_TABLE = 'zoo-tour-test'

// SMS

process.env.SMS_API_KEY = 'some-api-key'
process.env.SMS_API_URL = 'https://sms-queue-api.bowland.link/v1'
