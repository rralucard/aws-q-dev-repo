# CDK CLI Version Notice Resolution

This project has been updated to handle the AWS CDK CLI version notice (ID: 32775) regarding the divergence of CLI versions and CDK library versions.

## Changes Made

1. Updated `infrastructure/package.json` to use aws-cdk-lib version ^2.182.0, matching the version in the root package.json
2. Added code to the `bootstrapCdkEnvironment` function in `deploy-to-aws.js` to automatically acknowledge the CDK CLI notice with ID 32775

## Background

Starting with CDK 2.179.0, AWS CDK CLI versions are no longer synchronized with CDK library versions. CLI versions will now follow the versioning scheme 2.1000.0, 2.1001.0, etc., while library versions continue with their existing scheme.

This change was implemented according to the notice and the information provided in [AWS CDK Issue #32775](https://github.com/aws/aws-cdk/issues/32775).

## Next Steps

No further action is required. The deployment script will now automatically acknowledge this notice, and the versions have been aligned between the root project and the infrastructure directory.