# HR Avatar Call Analysis - Lambda Backend

A serverless API that analyzes HR Avatar call transcripts using AWS Bedrock (Claude Haiku) and returns structured JSON summaries.

## Architecture

```
┌─────────────┐      HTTPS       ┌──────────────┐     ┌─────────────┐
│   Browser   │ ────────────────▶│  API Gateway │────▶│   Lambda    │
│  (HR Demo)  │ ◀──────────────── │   (HTTP v2)  │◀────│  (Python)   │
└─────────────┘      JSON        └──────────────┘     └──────┬──────┘
                                                             │
                                                     ┌───────▼───────┐
                                                     │    Bedrock    │
                                                     │ Claude Haiku  │
                                                     └───────────────┘
```

## Features

- **Serverless** - Pay only for what you use (~$0.002 per analysis)
- **Fast** - Claude 3 Haiku typically responds in 5-15 seconds
- **Secure** - No API keys in browser; IAM-based authentication
- **CORS-enabled** - Works from any origin
- **Resilient** - 90-second timeout, automatic retries, structured errors

## Prerequisites

- AWS CLI configured (`aws sts get-caller-identity` should work)
- Bedrock access enabled in your AWS account
- Claude models enabled in Bedrock console (us-west-2 region)

## Quick Deploy

```bash
cd lambda/
./deploy.sh
```

The script will:
1. Create an IAM role (or use existing)
2. Package and deploy the Lambda function
3. Create an HTTP API Gateway with CORS
4. Output the API endpoint URL

## Manual Deployment

### Step 1: Create IAM Role

```bash
# Create the role
aws iam create-role \
  --role-name hr-avatar-analysis-lambda-role \
  --assume-role-policy-document file://trust-policy.json

# Attach Bedrock access
aws iam put-role-policy \
  --role-name hr-avatar-analysis-lambda-role \
  --policy-name bedrock-invoke \
  --policy-document file://bedrock-policy.json

# Attach Lambda execution policy
aws iam attach-role-policy \
  --role-name hr-avatar-analysis-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

### Step 2: Deploy Lambda Function

```bash
# Package
zip -j function.zip lambda_function.py

# Create function
aws lambda create-function \
  --function-name hr-avatar-analysis \
  --runtime python3.11 \
  --handler lambda_function.lambda_handler \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/hr-avatar-analysis-lambda-role \
  --zip-file fileb://function.zip \
  --timeout 90 \
  --memory-size 256 \
  --description "Analyzes HR Avatar call transcripts using Bedrock Claude"
```

### Step 3: Create HTTP API Gateway

```bash
# Create HTTP API with Lambda integration
aws apigatewayv2 create-api \
  --name hr-avatar-analysis-api \
  --protocol-type HTTP \
  --cors-configuration '{"AllowOrigins":["*"],"AllowMethods":["POST","OPTIONS"],"AllowHeaders":["content-type"]}' \
  --target arn:aws:lambda:us-west-2:YOUR_ACCOUNT_ID:function:hr-avatar-analysis

# Get the API endpoint
aws apigatewayv2 get-apis --query "Items[?Name=='hr-avatar-analysis-api'].ApiEndpoint" --output text
```

### Step 4: Add Lambda Permission

```bash
# Allow API Gateway to invoke Lambda
aws lambda add-permission \
  --function-name hr-avatar-analysis \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com
```

## API Usage

### Request

```bash
POST https://YOUR_API_ENDPOINT/
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
    "mtg": {"mins": 5, "focus": ["topic1", "topic2"]}
  }
}
```

### Response (Success)

```json
{
  "success": true,
  "summary": {
    "v": "4.1",
    "mode": "interview",
    "ctx": {
      "org": "Company Name",
      "role": "Job Title",
      "person": "Candidate Name"
    },
    "overview": "...",
    "fit": { "score_0_100": 75, "rec": "yes", ... },
    "gaps": [...],
    "next_steps": [...]
  },
  "usage": {
    "input_tokens": 1234,
    "output_tokens": 567
  }
}
```

### Response (Error)

```json
{
  "success": false,
  "error": "Error message",
  "code": "VALIDATION_ERROR|BEDROCK_ERROR|TIMEOUT|THROTTLING"
}
```

## Testing

```bash
# Test with curl
curl -X POST https://YOUR_API_ENDPOINT/ \
  -H 'Content-Type: application/json' \
  -d '{
    "transcript": [
      {"role": "assistant", "content": "Hello, how are you?"},
      {"role": "user", "content": "I am doing well, thanks!"}
    ],
    "dpp": {
      "mode": "interview",
      "org": {"n": "Test Co"},
      "role": {"t": "Engineer"},
      "subj": {"name": "Test User"}
    }
  }'
```

## Configuration

Environment variables (set in Lambda console or via CLI):

| Variable | Default | Description |
|----------|---------|-------------|
| `MODEL_ID` | `anthropic.claude-3-haiku-20240307-v1:0` | Bedrock model ID |
| `MAX_TOKENS` | `4096` | Maximum output tokens |
| `TEMPERATURE` | `0.3` | Model temperature (lower = more deterministic) |

### Change Model

```bash
aws lambda update-function-configuration \
  --function-name hr-avatar-analysis \
  --environment "Variables={MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0}"
```

## Updating the Function

After editing `lambda_function.py`:

```bash
zip -j function.zip lambda_function.py
aws lambda update-function-code \
  --function-name hr-avatar-analysis \
  --zip-file fileb://function.zip
```

## Cost Estimate

| Component | Cost |
|-----------|------|
| Lambda | ~$0.0000001 per request (256MB, 15s avg) |
| API Gateway | ~$1.00 per million requests |
| Bedrock Claude Haiku | ~$0.00025/1K input + $0.00125/1K output tokens |
| **Typical analysis** | **~$0.002 per call** |

## Monitoring

### View Logs

```bash
aws logs tail /aws/lambda/hr-avatar-analysis --follow
```

### Check Function Status

```bash
aws lambda get-function --function-name hr-avatar-analysis \
  --query 'Configuration.{State:State,LastModified:LastModified}'
```

## Cleanup

```bash
./cleanup.sh

# Or manually:
aws apigatewayv2 delete-api --api-id YOUR_API_ID
aws lambda delete-function --function-name hr-avatar-analysis
aws iam delete-role-policy --role-name hr-avatar-analysis-lambda-role --policy-name bedrock-invoke
aws iam detach-role-policy --role-name hr-avatar-analysis-lambda-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam delete-role --role-name hr-avatar-analysis-lambda-role
```

## Extending

### Add New Summary Fields

1. Edit the `SYSTEM_PROMPT` in `lambda_function.py`
2. Update `call_summary.schema.json` with new fields
3. Update the modal display in `hr-demo.js` (`showCallSummary()`)

### Use Different Model

Change `MODEL_ID` environment variable. Options:
- `anthropic.claude-3-haiku-20240307-v1:0` (fast, cheap)
- `anthropic.claude-3-sonnet-20240229-v1:0` (balanced)
- `anthropic.claude-3-opus-20240229-v1:0` (best quality, expensive)

### Add Authentication

1. Create a Cognito User Pool
2. Update API Gateway to use JWT authorizer
3. Add authentication to frontend

## Troubleshooting

### 403 Forbidden
- Check Lambda resource policy allows API Gateway
- Verify API Gateway has correct Lambda integration

### Timeout (504)
- Increase Lambda timeout (max 900s)
- Consider using a faster model (Haiku)
- Check if transcript is unusually large

### Invalid JSON Response
- Check CloudWatch logs for parsing errors
- The Lambda handles markdown code blocks, but unusual formatting may slip through

### Bedrock Throttling
- Implement exponential backoff on client
- Request quota increase from AWS

## Files

| File | Description |
|------|-------------|
| `lambda_function.py` | Main Lambda handler and Bedrock integration |
| `deploy.sh` | Automated deployment script |
| `cleanup.sh` | Resource cleanup script |
| `trust-policy.json` | IAM trust policy for Lambda |
| `bedrock-policy.json` | IAM policy for Bedrock access |
| `.api-url` | Stores deployed API URL (created by deploy.sh) |
