# HR Avatar Call Analysis - AWS Lambda Proxy

A serverless proxy that uses AWS Bedrock (Claude Haiku) to analyze HR Avatar call transcripts and generate structured summaries.

## Architecture

```
┌─────────────┐     HTTPS      ┌─────────────────┐     ┌─────────────┐
│   Browser   │ ──────────────▶│  Lambda + URL   │────▶│   Bedrock   │
│  (HR Demo)  │ ◀────────────── │  (Python 3.11)  │◀────│ Claude Haiku│
└─────────────┘    JSON        └─────────────────┘     └─────────────┘
```

## Features

- **Serverless**: Pay only for what you use (~$0.0001 per analysis)
- **Fast**: Claude 3 Haiku typically responds in 5-15 seconds
- **Secure**: No API keys in browser; IAM-based authentication
- **CORS-enabled**: Works from any origin
- **Resilient**: 90-second timeout, structured error responses

## Prerequisites

- AWS CLI configured (`aws sts get-caller-identity` should work)
- Bedrock access enabled in your AWS account
- Claude models enabled in Bedrock console

## Quick Deploy

```bash
# From the lambda/ directory:
./deploy.sh
```

This will:
1. Create an IAM role for the Lambda
2. Package and deploy the Lambda function
3. Create a Function URL with CORS
4. Output the endpoint URL

## Manual Deployment

### 1. Create IAM Role

```bash
# Create the trust policy
aws iam create-role \
  --role-name hr-avatar-analysis-lambda-role \
  --assume-role-policy-document file://trust-policy.json

# Attach Bedrock access policy
aws iam put-role-policy \
  --role-name hr-avatar-analysis-lambda-role \
  --policy-name bedrock-invoke \
  --policy-document file://bedrock-policy.json

# Attach basic Lambda execution policy
aws iam attach-role-policy \
  --role-name hr-avatar-analysis-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

### 2. Deploy Lambda Function

```bash
# Package the function
zip -j function.zip lambda_function.py

# Create the function
aws lambda create-function \
  --function-name hr-avatar-analysis \
  --runtime python3.11 \
  --handler lambda_function.lambda_handler \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/hr-avatar-analysis-lambda-role \
  --zip-file fileb://function.zip \
  --timeout 90 \
  --memory-size 256
```

### 3. Create Function URL

```bash
# Add Function URL
aws lambda create-function-url-config \
  --function-name hr-avatar-analysis \
  --auth-type NONE \
  --cors '{
    "AllowOrigins": ["*"],
    "AllowMethods": ["POST", "OPTIONS"],
    "AllowHeaders": ["content-type"],
    "MaxAge": 86400
  }'

# Add permission for public access
aws lambda add-permission \
  --function-name hr-avatar-analysis \
  --statement-id FunctionURLAllowPublicAccess \
  --action lambda:InvokeFunctionUrl \
  --principal "*" \
  --function-url-auth-type NONE
```

## API Usage

### Request

```bash
POST https://itv5rhcn37.execute-api.us-west-2.amazonaws.com/
Content-Type: application/json

{
  "transcript": [
    {"role": "assistant", "content": "Hello, I'm calling about..."},
    {"role": "user", "content": "Hi, yes this is..."}
  ],
  "dpp": {
    "mode": "interview",
    "org": {"n": "Company Name"},
    "role": {"t": "Job Title", "id": "ROLE-001"},
    "subj": {"name": "Candidate Name", "id": "CAND-001"},
    ...
  },
  "schema": { ... }  // Optional: call_summary.schema.json
}
```

### Response

```json
{
  "success": true,
  "summary": {
    "v": "4.1",
    "mode": "interview",
    "ctx": { ... },
    "overview": "...",
    ...
  },
  "usage": {
    "input_tokens": 1234,
    "output_tokens": 567
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": "TIMEOUT|BEDROCK_ERROR|VALIDATION_ERROR|PARSE_ERROR"
}
```

## Configuration

Environment variables (set in Lambda console or deploy script):

| Variable | Default | Description |
|----------|---------|-------------|
| `MODEL_ID` | `anthropic.claude-3-haiku-20240307-v1:0` | Bedrock model ID |
| `MAX_TOKENS` | `4096` | Maximum output tokens |
| `TEMPERATURE` | `0.3` | Model temperature (lower = more deterministic) |

## Updating the Function

```bash
# Edit lambda_function.py, then:
zip -j function.zip lambda_function.py
aws lambda update-function-code \
  --function-name hr-avatar-analysis \
  --zip-file fileb://function.zip
```

## Cost Estimate

- **Lambda**: ~$0.0000001 per request (256MB, 15s avg)
- **Bedrock Claude Haiku**: ~$0.00025 input + $0.00125 output per 1K tokens
- **Typical call analysis**: ~2K input tokens, ~1K output = ~$0.002 per analysis

## Monitoring

View logs in CloudWatch:
```bash
aws logs tail /aws/lambda/hr-avatar-analysis --follow
```

## Cleanup

```bash
./cleanup.sh
# Or manually:
aws lambda delete-function --function-name hr-avatar-analysis
aws iam delete-role-policy --role-name hr-avatar-analysis-lambda-role --policy-name bedrock-invoke
aws iam detach-role-policy --role-name hr-avatar-analysis-lambda-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam delete-role --role-name hr-avatar-analysis-lambda-role
```
