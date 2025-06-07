#!/usr/bin/env bash

# Stop immediately on error
set -e

if [[ -z "$1" ]]; then
  $(./scripts/assumeDeveloperRole.sh)
fi

# Only install production modules
export HUSKY=0
export NODE_ENV=production

# Build the project
SAM_TEMPLATE=template.yaml
sam build --template ${SAM_TEMPLATE}

# Start the service locally
export S3_LAMBDA_CLEANUP_DAYS_TO_KEEP=7
export S3_LAMBDA_CLEANUP_NUMBER_OF_THREADS=1
export ZOO_TOUR_SMS_NUMBER_OF_THREADS=2
export ZOO_TOUR_STATUS_NUMBER_OF_THREADS=3
export S3_LAMBDA_CLEANUP_TABLE_NAME=dbowland-batch-lambda-cleanup-test
export ZOO_TOUR_TABLE=dbowland-batch-zoo-tour-test
export SMS_API_KEY=$(aws apigateway get-api-key --api-key l3q9ffyih6 --include-value --region us-east-1 | jq -r .value)
export SMS_API_URL='https://sms-queue-api.bowland.link/v1'
sam local invoke --parameter-overrides "Environment=test SmsApiKey=$SMS_API_KEY" --log-file local.log
