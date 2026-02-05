#!/bin/bash
#
# HR Avatar Analysis Lambda - Deployment Script
#
# This script creates and deploys the Lambda function with all required
# IAM roles and permissions. Run from the lambda/ directory.
#
# Usage: ./deploy.sh
#

set -e  # Exit on error

# =============================================================================
# CONFIGURATION
# =============================================================================

FUNCTION_NAME="hr-avatar-analysis"
ROLE_NAME="hr-avatar-analysis-lambda-role"
REGION=$(aws configure get region)
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "========================================"
echo "HR Avatar Analysis Lambda Deployment"
echo "========================================"
echo "Region: $REGION"
echo "Account: $ACCOUNT_ID"
echo "Function: $FUNCTION_NAME"
echo ""

# =============================================================================
# STEP 1: Create IAM Role
# =============================================================================

echo "[1/5] Creating IAM role..."

# Check if role exists
if aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
    echo "  Role already exists, updating policies..."
else
    echo "  Creating new role..."
    aws iam create-role \
        --role-name "$ROLE_NAME" \
        --assume-role-policy-document file://trust-policy.json \
        --description "Role for HR Avatar Analysis Lambda" \
        >/dev/null

    # Wait for role to be available
    echo "  Waiting for role to propagate..."
    sleep 10
fi

# Attach/update policies
echo "  Attaching Bedrock policy..."
aws iam put-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-name bedrock-invoke \
    --policy-document file://bedrock-policy.json

echo "  Attaching Lambda execution policy..."
aws iam attach-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole \
    2>/dev/null || true  # Ignore if already attached

ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"
echo "  Role ARN: $ROLE_ARN"

# =============================================================================
# STEP 2: Package Lambda Function
# =============================================================================

echo ""
echo "[2/5] Packaging Lambda function..."

# Clean up any existing zip
rm -f function.zip

# Create the deployment package
zip -j function.zip lambda_function.py
echo "  Created function.zip"

# =============================================================================
# STEP 3: Create or Update Lambda Function
# =============================================================================

echo ""
echo "[3/5] Deploying Lambda function..."

if aws lambda get-function --function-name "$FUNCTION_NAME" >/dev/null 2>&1; then
    echo "  Function exists, updating code..."
    aws lambda update-function-code \
        --function-name "$FUNCTION_NAME" \
        --zip-file fileb://function.zip \
        >/dev/null

    echo "  Updating configuration..."
    aws lambda update-function-configuration \
        --function-name "$FUNCTION_NAME" \
        --timeout 90 \
        --memory-size 256 \
        >/dev/null
else
    echo "  Creating new function..."

    # Wait a bit more for role propagation
    sleep 5

    aws lambda create-function \
        --function-name "$FUNCTION_NAME" \
        --runtime python3.11 \
        --handler lambda_function.lambda_handler \
        --role "$ROLE_ARN" \
        --zip-file fileb://function.zip \
        --timeout 90 \
        --memory-size 256 \
        --description "Analyzes HR Avatar call transcripts using Bedrock Claude" \
        >/dev/null
fi

# Wait for function to be active
echo "  Waiting for function to be active..."
aws lambda wait function-active --function-name "$FUNCTION_NAME"
echo "  Function is active"

# =============================================================================
# STEP 4: Create Function URL
# =============================================================================

echo ""
echo "[4/5] Configuring Function URL..."

# Check if Function URL exists
EXISTING_URL=$(aws lambda get-function-url-config --function-name "$FUNCTION_NAME" 2>/dev/null | jq -r '.FunctionUrl' || echo "")

if [ -n "$EXISTING_URL" ] && [ "$EXISTING_URL" != "null" ]; then
    echo "  Function URL already exists"
    FUNCTION_URL="$EXISTING_URL"
else
    echo "  Creating Function URL..."
    FUNCTION_URL=$(aws lambda create-function-url-config \
        --function-name "$FUNCTION_NAME" \
        --auth-type NONE \
        --cors '{"AllowOrigins":["*"],"AllowMethods":["POST","OPTIONS"],"AllowHeaders":["content-type"],"MaxAge":86400}' \
        --query 'FunctionUrl' \
        --output text)

    echo "  Adding public access permission..."
    aws lambda add-permission \
        --function-name "$FUNCTION_NAME" \
        --statement-id FunctionURLAllowPublicAccess \
        --action lambda:InvokeFunctionUrl \
        --principal "*" \
        --function-url-auth-type NONE \
        2>/dev/null || true  # Ignore if already exists
fi

# =============================================================================
# STEP 5: Output Results
# =============================================================================

echo ""
echo "[5/5] Deployment complete!"
echo ""
echo "========================================"
echo "SUCCESS!"
echo "========================================"
echo ""
echo "Function URL:"
echo "  $FUNCTION_URL"
echo ""
echo "Test with:"
echo "  curl -X POST $FUNCTION_URL \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"transcript\":[{\"role\":\"user\",\"content\":\"test\"}],\"dpp\":{\"mode\":\"interview\"}}'"
echo ""
echo "Add this URL to your hr-demo.js configuration:"
echo "  const ANALYSIS_API_URL = '${FUNCTION_URL}';"
echo ""

# Save URL to file for reference
echo "$FUNCTION_URL" > .function-url
echo "(URL saved to .function-url)"
