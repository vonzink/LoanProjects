#!/bin/bash

# MSFG Loan Tools - AWS Deployment Script
# This script deploys the web version to AWS S3 and optionally sets up CloudFront

set -e  # Exit on any error

# Configuration
S3_BUCKET_NAME="msfg-loan-tools"
CLOUDFRONT_DISTRIBUTION_ID=""  # Leave empty to skip CloudFront invalidation
AWS_REGION="us-east-1"
PROJECT_NAME="MSFG Loan Tools"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 $PROJECT_NAME - AWS Deployment${NC}"
echo ""

# Check if we're in the right directory
if [ ! -d "src" ] || [ ! -f "src/LoanToolsHub.html" ]; then
    echo -e "${RED}❌ Error: Please run this script from the LoanToolsApp directory${NC}"
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ Error: AWS CLI is not installed. Please install it first.${NC}"
    echo "Visit: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if user is authenticated with AWS
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ Error: Not authenticated with AWS. Please run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Checking AWS configuration...${NC}"
AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ Authenticated as AWS Account: $AWS_ACCOUNT${NC}"

# Check if S3 bucket exists, create if it doesn't
echo -e "${YELLOW}📦 Checking S3 bucket '$S3_BUCKET_NAME'...${NC}"
if ! aws s3 ls "s3://$S3_BUCKET_NAME" &> /dev/null; then
    echo -e "${YELLOW}📦 Creating S3 bucket '$S3_BUCKET_NAME'...${NC}"
    aws s3 mb "s3://$S3_BUCKET_NAME" --region $AWS_REGION
    
    # Configure bucket for static website hosting
    echo -e "${YELLOW}🌐 Configuring bucket for static website hosting...${NC}"
    aws s3 website "s3://$S3_BUCKET_NAME" --index-document LoanToolsHub.html --error-document LoanToolsHub.html
    
    # Set bucket policy for public read access
    echo -e "${YELLOW}🔓 Setting bucket policy for public access...${NC}"
    cat > /tmp/bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$S3_BUCKET_NAME/*"
        }
    ]
}
EOF
    aws s3api put-bucket-policy --bucket $S3_BUCKET_NAME --policy file:///tmp/bucket-policy.json
    rm /tmp/bucket-policy.json
    
    echo -e "${GREEN}✅ S3 bucket created and configured!${NC}"
else
    echo -e "${GREEN}✅ S3 bucket '$S3_BUCKET_NAME' already exists${NC}"
fi

# Sync files to S3
echo -e "${YELLOW}📤 Uploading files to S3...${NC}"
aws s3 sync src/ "s3://$S3_BUCKET_NAME/" \
    --delete \
    --cache-control "max-age=3600" \
    --exclude "*.html" \
    --exclude "*.js" \
    --exclude "*.css"

# Upload HTML, JS, and CSS files with no-cache headers
echo -e "${YELLOW}📤 Uploading HTML, JS, and CSS files...${NC}"
aws s3 sync src/ "s3://$S3_BUCKET_NAME/" \
    --delete \
    --cache-control "no-cache" \
    --include "*.html" \
    --include "*.js" \
    --include "*.css"

# Upload manifest and service worker with no-cache
echo -e "${YELLOW}📤 Uploading manifest and service worker...${NC}"
aws s3 cp src/manifest.json "s3://$S3_BUCKET_NAME/" --cache-control "no-cache"
aws s3 cp src/sw.js "s3://$S3_BUCKET_NAME/" --cache-control "no-cache"

echo -e "${GREEN}✅ Files uploaded successfully!${NC}"

# Get the website endpoint
WEBSITE_ENDPOINT=$(aws s3api get-bucket-website --bucket $S3_BUCKET_NAME --query WebsiteEndpoint --output text)

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Deployment Details:${NC}"
echo -e "   S3 Bucket: ${YELLOW}$S3_BUCKET_NAME${NC}"
echo -e "   Website URL: ${YELLOW}http://$WEBSITE_ENDPOINT${NC}"
echo -e "   Region: ${YELLOW}$AWS_REGION${NC}"
echo ""

# CloudFront invalidation (if distribution ID is provided)
if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "${YELLOW}🔄 Invalidating CloudFront cache...${NC}"
    aws cloudfront create-invalidation \
        --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
        --paths "/*"
    echo -e "${GREEN}✅ CloudFront cache invalidated!${NC}"
    echo ""
    echo -e "${BLUE}🌐 CloudFront URL:${NC}"
    echo -e "   ${YELLOW}https://$CLOUDFRONT_DISTRIBUTION_ID.cloudfront.net${NC}"
    echo ""
else
    echo -e "${YELLOW}💡 To set up CloudFront for HTTPS and better performance:${NC}"
    echo "   1. Create a CloudFront distribution pointing to your S3 bucket"
    echo "   2. Update the CLOUDFRONT_DISTRIBUTION_ID variable in this script"
    echo "   3. Re-run this script to invalidate the cache"
    echo ""
fi

echo -e "${BLUE}🎯 Next Steps:${NC}"
echo "   1. Test the website at: http://$WEBSITE_ENDPOINT"
echo "   2. Set up a custom domain (optional)"
echo "   3. Configure CloudFront for HTTPS (recommended)"
echo "   4. Set up monitoring and logging"
echo ""
echo -e "${GREEN}🚀 Your loan tools are now live on AWS!${NC}"
