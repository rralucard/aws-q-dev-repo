"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsiteStack = void 0;
const cdk = require("aws-cdk-lib");
const s3 = require("aws-cdk-lib/aws-s3");
const s3deploy = require("aws-cdk-lib/aws-s3-deployment");
const cloudfront = require("aws-cdk-lib/aws-cloudfront");
const origins = require("aws-cdk-lib/aws-cloudfront-origins");
const path = require("path");
class WebsiteStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Create an S3 bucket to store the website static files
        const websiteBucket = new s3.Bucket(this, 'XXXXXXXXXXXXX', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
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
exports.WebsiteStack = WebsiteStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vic2l0ZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndlYnNpdGUtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBRW5DLHlDQUF5QztBQUN6QywwREFBMEQ7QUFDMUQseURBQXlEO0FBQ3pELDhEQUE4RDtBQUU5RCw2QkFBNkI7QUFFN0IsTUFBYSxZQUFhLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDekMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4Qix3REFBd0Q7UUFDeEQsTUFBTSxhQUFhLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDekQsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsT0FBTztZQUN4QyxpQkFBaUIsRUFBRSxJQUFJO1lBQ3ZCLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTO1lBQ2pELFVBQVUsRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsVUFBVTtTQUMzQyxDQUFDLENBQUM7UUFFSCw2Q0FBNkM7UUFDN0MsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsc0JBQXNCLEVBQUU7WUFDN0YsT0FBTyxFQUFFLDJDQUEyQztTQUNyRCxDQUFDLENBQUM7UUFFSCxtREFBbUQ7UUFDbkQsYUFBYSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBRTlDLG1DQUFtQztRQUNuQyxNQUFNLFlBQVksR0FBRyxJQUFJLFVBQVUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUNyRSxpQkFBaUIsRUFBRSxZQUFZO1lBQy9CLGVBQWUsRUFBRTtnQkFDZixpRkFBaUY7Z0JBQ2pGLHFGQUFxRjtnQkFDckYsTUFBTSxFQUFFLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUU7b0JBQzFDLG9CQUFvQjtpQkFDckIsQ0FBQztnQkFDRixRQUFRLEVBQUUsSUFBSTtnQkFDZCxjQUFjLEVBQUUsVUFBVSxDQUFDLGNBQWMsQ0FBQyxzQkFBc0I7Z0JBQ2hFLG9CQUFvQixFQUFFLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxpQkFBaUI7YUFDeEU7WUFDRCxjQUFjLEVBQUU7Z0JBQ2Q7b0JBQ0UsVUFBVSxFQUFFLEdBQUc7b0JBQ2Ysa0JBQWtCLEVBQUUsR0FBRztvQkFDdkIsZ0JBQWdCLEVBQUUsYUFBYTtpQkFDaEM7YUFDRjtZQUNELFVBQVUsRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFBRSxvQ0FBb0M7U0FDeEYsQ0FBQyxDQUFDO1FBRUgsb0NBQW9DO1FBQ3BDLElBQUksUUFBUSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRTtZQUN2RCxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN0RSxpQkFBaUIsRUFBRSxhQUFhO1lBQ2hDLFlBQVk7WUFDWixpQkFBaUIsRUFBRSxDQUFDLElBQUksQ0FBQztTQUMxQixDQUFDLENBQUM7UUFFSCxvQ0FBb0M7UUFDcEMsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSx3QkFBd0IsRUFBRTtZQUNoRCxLQUFLLEVBQUUsWUFBWSxDQUFDLHNCQUFzQjtZQUMxQyxXQUFXLEVBQUUsZ0RBQWdEO1NBQzlELENBQUMsQ0FBQztRQUVILDRCQUE0QjtRQUM1QixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQzNDLEtBQUssRUFBRSxhQUFhLENBQUMsVUFBVTtZQUMvQixXQUFXLEVBQUUsK0NBQStDO1NBQzdELENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQS9ERCxvQ0ErREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgKiBhcyBzMyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMnO1xuaW1wb3J0ICogYXMgczNkZXBsb3kgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzLWRlcGxveW1lbnQnO1xuaW1wb3J0ICogYXMgY2xvdWRmcm9udCBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY2xvdWRmcm9udCc7XG5pbXBvcnQgKiBhcyBvcmlnaW5zIGZyb20gJ2F3cy1jZGstbGliL2F3cy1jbG91ZGZyb250LW9yaWdpbnMnO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuZXhwb3J0IGNsYXNzIFdlYnNpdGVTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vIENyZWF0ZSBhbiBTMyBidWNrZXQgdG8gc3RvcmUgdGhlIHdlYnNpdGUgc3RhdGljIGZpbGVzXG4gICAgY29uc3Qgd2Vic2l0ZUJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgJ1hYWFhYWFhYWFhYWFgnLCB7XG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLCAvLyBOT1QgcmVjb21tZW5kZWQgZm9yIHByb2R1Y3Rpb25cbiAgICAgIGF1dG9EZWxldGVPYmplY3RzOiB0cnVlLCAvLyBOT1QgcmVjb21tZW5kZWQgZm9yIHByb2R1Y3Rpb25cbiAgICAgIGJsb2NrUHVibGljQWNjZXNzOiBzMy5CbG9ja1B1YmxpY0FjY2Vzcy5CTE9DS19BTEwsXG4gICAgICBlbmNyeXB0aW9uOiBzMy5CdWNrZXRFbmNyeXB0aW9uLlMzX01BTkFHRUQsXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgYSBDbG91ZEZyb250IE9yaWdpbiBBY2Nlc3MgSWRlbnRpdHlcbiAgICBjb25zdCBvcmlnaW5BY2Nlc3NJZGVudGl0eSA9IG5ldyBjbG91ZGZyb250Lk9yaWdpbkFjY2Vzc0lkZW50aXR5KHRoaXMsICdPcmlnaW5BY2Nlc3NJZGVudGl0eScsIHtcbiAgICAgIGNvbW1lbnQ6IGBPQUkgZm9yIEludGVyYWN0aXZlIE1vdXNlIEVmZmVjdHMgd2Vic2l0ZWAsXG4gICAgfSk7XG5cbiAgICAvLyBHcmFudCByZWFkIGFjY2VzcyB0byB0aGUgQ2xvdWRGcm9udCBkaXN0cmlidXRpb25cbiAgICB3ZWJzaXRlQnVja2V0LmdyYW50UmVhZChvcmlnaW5BY2Nlc3NJZGVudGl0eSk7XG5cbiAgICAvLyBDcmVhdGUgYSBDbG91ZEZyb250IGRpc3RyaWJ1dGlvblxuICAgIGNvbnN0IGRpc3RyaWJ1dGlvbiA9IG5ldyBjbG91ZGZyb250LkRpc3RyaWJ1dGlvbih0aGlzLCAnRGlzdHJpYnV0aW9uJywge1xuICAgICAgZGVmYXVsdFJvb3RPYmplY3Q6ICdpbmRleC5odG1sJyxcbiAgICAgIGRlZmF1bHRCZWhhdmlvcjoge1xuICAgICAgICAvLyBUT0RPOiBTM09yaWdpbiBpcyBkZXByZWNhdGVkLCBidXQgZGlyZWN0IHJlcGxhY2VtZW50IHdpdGggUzNCdWNrZXRPcmlnaW4gZmFpbHNcbiAgICAgICAgLy8gYXMgaXQgYXBwZWFycyB0byBiZSBhbiBhYnN0cmFjdCBjbGFzcy4gVGhpcyBzaG91bGQgYmUgdXBkYXRlZCBpbiBhIGZ1dHVyZSByZWxlYXNlLlxuICAgICAgICBvcmlnaW46IG5ldyBvcmlnaW5zLlMzT3JpZ2luKHdlYnNpdGVCdWNrZXQsIHtcbiAgICAgICAgICBvcmlnaW5BY2Nlc3NJZGVudGl0eSxcbiAgICAgICAgfSksXG4gICAgICAgIGNvbXByZXNzOiB0cnVlLFxuICAgICAgICBhbGxvd2VkTWV0aG9kczogY2xvdWRmcm9udC5BbGxvd2VkTWV0aG9kcy5BTExPV19HRVRfSEVBRF9PUFRJT05TLFxuICAgICAgICB2aWV3ZXJQcm90b2NvbFBvbGljeTogY2xvdWRmcm9udC5WaWV3ZXJQcm90b2NvbFBvbGljeS5SRURJUkVDVF9UT19IVFRQUyxcbiAgICAgIH0sXG4gICAgICBlcnJvclJlc3BvbnNlczogW1xuICAgICAgICB7XG4gICAgICAgICAgaHR0cFN0YXR1czogNDA0LFxuICAgICAgICAgIHJlc3BvbnNlSHR0cFN0YXR1czogMjAwLFxuICAgICAgICAgIHJlc3BvbnNlUGFnZVBhdGg6ICcvaW5kZXguaHRtbCcsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgcHJpY2VDbGFzczogY2xvdWRmcm9udC5QcmljZUNsYXNzLlBSSUNFX0NMQVNTXzEwMCwgLy8gVXNlIG9ubHkgTm9ydGggQW1lcmljYSBhbmQgRXVyb3BlXG4gICAgfSk7XG5cbiAgICAvLyBEZXBsb3kgc2l0ZSBjb250ZW50cyB0byBTMyBidWNrZXRcbiAgICBuZXcgczNkZXBsb3kuQnVja2V0RGVwbG95bWVudCh0aGlzLCAnWFhYWFhYWFhYWFhYWFhYWFgnLCB7XG4gICAgICBzb3VyY2VzOiBbczNkZXBsb3kuU291cmNlLmFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi8uLicsICdvdXQnKSldLFxuICAgICAgZGVzdGluYXRpb25CdWNrZXQ6IHdlYnNpdGVCdWNrZXQsXG4gICAgICBkaXN0cmlidXRpb24sXG4gICAgICBkaXN0cmlidXRpb25QYXRoczogWycvKiddLFxuICAgIH0pO1xuXG4gICAgLy8gT3V0cHV0IHRoZSBDbG91ZEZyb250IGRvbWFpbiBuYW1lXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0Rpc3RyaWJ1dGlvbkRvbWFpbk5hbWUnLCB7XG4gICAgICB2YWx1ZTogZGlzdHJpYnV0aW9uLmRpc3RyaWJ1dGlvbkRvbWFpbk5hbWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSBkb21haW4gbmFtZSBvZiB0aGUgQ2xvdWRGcm9udCBkaXN0cmlidXRpb24nLFxuICAgIH0pO1xuXG4gICAgLy8gT3V0cHV0IHRoZSBTMyBidWNrZXQgbmFtZVxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdXZWJzaXRlQnVja2V0TmFtZScsIHtcbiAgICAgIHZhbHVlOiB3ZWJzaXRlQnVja2V0LmJ1Y2tldE5hbWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSBuYW1lIG9mIHRoZSBTMyBidWNrZXQgaG9zdGluZyB0aGUgd2Vic2l0ZScsXG4gICAgfSk7XG4gIH1cbn0iXX0=