#!/bin/bash
#
# HR Avatar Analysis Lambda - Cleanup Script
#
# Removes all AWS resources created by deploy.sh
#
# Usage: ./cleanup.sh
#

set -e

FUNCTION_NAME="hr-avatar-analysis"
ROLE_NAME="hr-avatar-analysis-lambda-role"

echo "========================================"
echo "HR Avatar Analysis Lambda Cleanup"
echo "========================================"
echo ""

read -p "This will delete all Lambda resources. Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "[1/3] Deleting Lambda function..."
aws lambda delete-function --function-name "$FUNCTION_NAME" 2>/dev/null || echo "  (Function not found or already deleted)"

echo ""
echo "[2/3] Deleting IAM role policies..."
aws iam delete-role-policy --role-name "$ROLE_NAME" --policy-name bedrock-invoke 2>/dev/null || true
aws iam detach-role-policy --role-name "$ROLE_NAME" --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole 2>/dev/null || true

echo ""
echo "[3/3] Deleting IAM role..."
aws iam delete-role --role-name "$ROLE_NAME" 2>/dev/null || echo "  (Role not found or already deleted)"

echo ""
echo "========================================"
echo "Cleanup complete!"
echo "========================================"

# Clean up local files
rm -f .function-url function.zip
