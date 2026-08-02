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
export S3_LAMBDA_CLEANUP_TABLE_NAME=dbowland-batch-lambda-cleanup-test
sam local invoke --parameter-overrides 'Environment=test' --log-file local.log
