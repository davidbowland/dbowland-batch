# dbowland.com Batch Processing

Lambda batch processing for dbowland.com. Two functions are deployed:

- **S3 lambda cleanup** — scheduled cleanup of stale objects across the fleet's Lambda
  source buckets (choosee, connections, emails, jokes, sse, dbowland), also invokable
  via `POST /s3-lambda-cleanup`.
- **Zoo tour check** — checks zoo tour availability and sends an SMS via
  `sms-queue-api` when a slot opens up, invoked via `POST /check-zoo-tour-status`
  (scheduled externally via EventBridge, e.g. by `scheduler-service`).

## Setup

The `developer` role is required to deploy this project.

### Node / NPM

1. [Node](https://nodejs.org/en/)
1. [NPM](https://www.npmjs.com/)

### AWS Credentials

To run locally, [AWS CLI](https://aws.amazon.com/cli/) is required in order to assume a role with permission to update resources. Install AWS CLI with:

```brew
brew install awscli
```

If file `~/.aws/credentials` does not exist, create it and add a default profile:

```toml
[default]
aws_access_key_id=<YOUR_ACCESS_KEY_ID>
aws_secret_access_key=<YOUR_SECRET_ACCESS_KEY>
region=us-east-2
```

If necessary, generate a [new access key ID and secret access key](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys).

Add a `developer` profile to the same credentials file:

```toml
[developer]
role_arn=arn:aws:iam::<account number>:role/developer
source_profile=default
mfa_serial=<YOUR_MFA_ARN>
region=us-east-2
```

If necessary, retrieve the ARN of the primary MFA device attached to the default profile:

```bash
aws iam list-mfa-devices --query 'MFADevices[].SerialNumber' --output text
```

## Developing Locally

### Unit Tests

[Jest](https://jestjs.io/) tests are run automatically on commit and push. If the test coverage threshold is not met, the push will fail. See `jest.config.ts` for coverage threshold.

Manually run tests with:

```bash
npm run test
```

### Prettier / Linter

Both [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/) are executed on commit. Manually prettify and lint code with:

```bash
npm run lint
```

### Deploying to Production

Deploys run via GitHub Actions (`.github/workflows/pipeline.yaml`). The lambda code is bundled with esbuild via `sam build`, then packaged and deployed with AWS SAM. When a pull request is merged into `master`, the build is promoted from the test stack (`dbowland-batch-test`) to production (`dbowland-batch`). Feature branches also deploy, but to the same shared `dbowland-batch-test` stack — they do not get unique resources, so concurrent feature branches can overwrite each other's test deployment.

## Additional Documentation

- [AWS Lambda](https://aws.amazon.com/lambda/)

- [ESLint](https://eslint.org/)

- [Jest](https://jestjs.io/)

- [Prettier](https://prettier.io/)
