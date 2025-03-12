import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export class WebsiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create an S3 bucket to store the website static files
    const websiteBucket = new s3.Bucket(this, 'XXXXXXXXXXXXX', {
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production
      autoDeleteObjects: true, // NOT recommended for production
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // Create a CloudFront Origin Access Identity
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OriginAccessIdentity', {
      comment: `OAI for Interactive Mouse Effects website`,
    });

    // Grant read access to the CloudFront distribution
    websiteBucket.grantRead(originAccessIdentity);

    // Create a CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        // TODO: S3Origin is deprecated, but direct replacement with S3BucketOrigin fails
        // as it appears to be an abstract class. This should be updated in a future release.
        origin: new origins.S3Origin(websiteBucket, {
          originAccessIdentity,
        }),
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // Use only North America and Europe
    });

    // Deploy site contents to S3 bucket
    new s3deploy.BucketDeployment(this, 'XXXXXXXXXXXXXXXXX', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../..', 'out'))],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // Output the CloudFront domain name
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
      description: 'The domain name of the CloudFront distribution',
    });

    // Output the S3 bucket name
    new cdk.CfnOutput(this, 'WebsiteBucketName', {
      value: websiteBucket.bucketName,
      description: 'The name of the S3 bucket hosting the website',
    });
  }
}