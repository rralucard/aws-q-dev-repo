# AWS Infrastructure for Interactive Mouse Effects Website

This directory contains the AWS CDK code for deploying the Next.js application to AWS CloudFront and S3.

## Architecture

The infrastructure consists of:
- An S3 bucket to host the static website files
- A CloudFront distribution for content delivery
- Origin Access Identity for secure S3 access

## Prerequisites

1. AWS CLI installed and configured with appropriate credentials
2. Node.js installed (version 14.x or later)
3. AWS CDK installed globally:
   ```bash
   npm install -g aws-cdk
   ```
4. If this is your first time using CDK in your AWS account, you need to bootstrap the environment:
   ```bash
   cdk bootstrap aws://ACCOUNT-NUMBER/REGION
   ```

## Deployment Steps

### 1. Build the Next.js application

From the project root directory:

```bash
# Install dependencies
npm install

# Build and export the static site
npm run build
npm run export
```

This will create an `out` directory containing the static site files.

### 2. Deploy the infrastructure

From the infrastructure directory:

```bash
# Install CDK dependencies
npm install

# Build the TypeScript code
npm run build

# Deploy the stack
npm run deploy
```

The deployment will output the CloudFront distribution domain name, which you can use to access the website.

## Updating the Website

To update the website content:

1. Make changes to the Next.js application
2. Rebuild and export the application:
   ```bash
   npm run build
   npm run export
   ```
3. Redeploy the infrastructure:
   ```bash
   cd infrastructure
   npm run deploy
   ```

## Cleaning Up

To remove all resources created by this stack:

```bash
cd infrastructure
cdk destroy
```

## Notes for Production Deployments

The current setup uses settings suitable for development and testing:

- The S3 bucket is configured with `RemovalPolicy.DESTROY`, which means it will be deleted when the stack is destroyed.
- `autoDeleteObjects` is set to `true`, which will delete all objects in the bucket when the stack is destroyed.

For production deployments, you should modify these settings to prevent accidental data loss.