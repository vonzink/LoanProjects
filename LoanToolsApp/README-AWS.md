# MSFG Loan Tools - AWS Deployment Guide

This guide will help you deploy the MSFG Loan Tools web application to AWS with S3, CloudFront, and optional custom domain support.

## Prerequisites

1. **AWS CLI** installed and configured
2. **AWS Account** with appropriate permissions
3. **Domain name** (optional, for custom domain setup)

## Quick Start

### Option 1: Simple S3 Deployment (Recommended for testing)

```bash
# Navigate to the LoanToolsApp directory
cd LoanToolsApp

# Run the AWS deployment script
./deploy-aws.sh
```

This will:
- Create an S3 bucket for hosting
- Upload all files with proper caching headers
- Configure the bucket for static website hosting
- Provide you with the website URL

### Option 2: Complete Infrastructure with CloudFormation

```bash
# Deploy the complete infrastructure
aws cloudformation create-stack \
  --stack-name msfg-loan-tools \
  --template-body file://aws-infrastructure.yaml \
  --capabilities CAPABILITY_IAM

# Wait for the stack to complete, then deploy files
./deploy-aws.sh
```

## Configuration

### Basic Configuration

Edit `deploy-aws.sh` to customize:

```bash
# Configuration
S3_BUCKET_NAME="msfg-loan-tools"  # Change to your preferred bucket name
CLOUDFRONT_DISTRIBUTION_ID=""     # Add your CloudFront distribution ID
AWS_REGION="us-east-1"           # Change to your preferred region
```

### Custom Domain Setup

1. **Request SSL Certificate** in AWS Certificate Manager:
   ```bash
   aws acm request-certificate \
     --domain-name yourdomain.com \
     --subject-alternative-names *.yourdomain.com \
     --validation-method DNS
   ```

2. **Deploy with CloudFormation**:
   ```bash
   aws cloudformation create-stack \
     --stack-name msfg-loan-tools \
     --template-body file://aws-infrastructure.yaml \
     --parameters \
       ParameterKey=DomainName,ParameterValue=loantools.yourdomain.com \
       ParameterKey=CertificateArn,ParameterValue=arn:aws:acm:us-east-1:123456789012:certificate/your-cert-id \
     --capabilities CAPABILITY_IAM
   ```

3. **Update deploy script** with the CloudFront distribution ID from the CloudFormation outputs.

## File Structure

The deployment includes:

```
src/
├── LoanToolsHub.html          # Main hub page
├── APRCalculator.html         # APR Calculator
├── BuydownCalculator.html     # Buydown Calculator
├── IncomeCalculator*.html     # Various income calculators
├── LLPMTool.html             # LLPM Tool
├── manifest.json             # PWA manifest
├── sw.js                     # Service worker
├── theme-switcher.js         # Theme switching
├── *.js                      # Calculator logic files
└── assets/                   # Icons and assets
```

## Features

### Progressive Web App (PWA)
- **Offline Support**: Works without internet connection
- **Installable**: Users can install as a desktop/mobile app
- **Responsive**: Works on all device sizes
- **Fast Loading**: Optimized with service worker caching

### Security
- **HTTPS Only**: All traffic encrypted
- **CORS Configured**: Proper cross-origin settings
- **Public Read Access**: Files are publicly readable but not writable

### Performance
- **CloudFront CDN**: Global content delivery
- **Compression**: Gzip compression enabled
- **Caching**: Optimized cache headers
- **SPA Routing**: Single-page application routing

## Monitoring and Maintenance

### CloudWatch Alarms (Optional)

```bash
# Create CloudWatch alarms for monitoring
aws cloudwatch put-metric-alarm \
  --alarm-name "MSFG-LoanTools-5XX-Errors" \
  --alarm-description "5XX errors from CloudFront" \
  --metric-name "5xxError" \
  --namespace "AWS/CloudFront" \
  --statistic "Sum" \
  --period 300 \
  --threshold 5 \
  --comparison-operator "GreaterThanThreshold" \
  --evaluation-periods 2
```

### Logging

Enable CloudFront access logs:

```bash
aws cloudfront update-distribution \
  --id YOUR_DISTRIBUTION_ID \
  --distribution-config file://cloudfront-config.json
```

## Troubleshooting

### Common Issues

1. **Bucket Already Exists**
   - The script will use the existing bucket
   - Or change the bucket name in the configuration

2. **Permission Denied**
   - Ensure your AWS credentials have S3 and CloudFront permissions
   - Check IAM policies

3. **CloudFront Not Updating**
   - Run the script with a valid CloudFront distribution ID
   - Or manually invalidate the cache

4. **Custom Domain Not Working**
   - Verify DNS records are pointing to CloudFront
   - Check SSL certificate is valid and in the correct region

### Manual Steps

If the script fails, you can run these commands manually:

```bash
# Create S3 bucket
aws s3 mb s3://your-bucket-name

# Configure for website hosting
aws s3 website s3://your-bucket-name --index-document LoanToolsHub.html

# Upload files
aws s3 sync src/ s3://your-bucket-name/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

## Cost Optimization

### Estimated Monthly Costs (us-east-1)

- **S3 Storage**: ~$0.023/GB/month (typically < $1)
- **S3 Requests**: ~$0.0004 per 1,000 requests
- **CloudFront Data Transfer**: ~$0.085/GB (first 10TB)
- **Route53**: $0.50/month per hosted zone (if using custom domain)

**Total**: Typically $1-5/month for moderate usage

### Cost Reduction Tips

1. **Use CloudFront**: Reduces S3 request costs
2. **Optimize Images**: Compress images before upload
3. **Monitor Usage**: Set up CloudWatch billing alerts
4. **Choose Right Region**: Deploy close to your users

## Security Best Practices

1. **Enable CloudTrail**: Monitor API calls
2. **Use IAM Roles**: Don't use root credentials
3. **Regular Updates**: Keep dependencies updated
4. **Monitor Logs**: Review access logs regularly
5. **Backup Strategy**: Version control your source code

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review AWS CloudFormation stack events
3. Check CloudWatch logs
4. Contact your AWS administrator

## Updates

To update the application:

```bash
# Simply run the deployment script again
./deploy-aws.sh
```

The script will:
- Upload only changed files
- Maintain proper cache headers
- Invalidate CloudFront cache if configured
- Preserve existing configuration
