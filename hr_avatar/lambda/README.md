# Avatar Analysis - Lambda Backend

A serverless API that analyzes Avatar call/session transcripts using AWS Bedrock (Claude 3.5 Haiku) and returns structured JSON summaries. Used by both the HR Avatar and Code Interview demos.

## Architecture

```
┌─────────────┐      HTTPS       ┌──────────────┐     ┌─────────────┐
│   Browser   │ ────────────────▶│  API Gateway │────▶│   Lambda    │
│ (Demo Page) │ ◀──────────────── │   (HTTP v2)  │◀────│  (Python)   │
└─────────────┘      JSON        └──────────────┘     └──────┬──────┘
                                                             │
                                                     ┌───────▼───────┐
                                                     │    Bedrock    │
                                                     │Claude 3.5 Haiku│
                                                     └───────────────┘
```

**Security:** The Lambda is NOT directly accessible from the internet. It is exposed only via API Gateway, enforced by the Lambda resource policy (`sourceArn` scoped to the specific API Gateway ID).

## Features

- **Serverless** - Pay only for what you use
- **Custom prompts** - Supports optional `summary_prompt` field to override the default system prompt
- **Secure** - No API keys in browser; Lambda accessible only via API Gateway
- **CORS-enabled** - Works from any origin
- **Resilient** - 90-second Lambda timeout, automatic Bedrock retries, structured errors

## Prerequisites

- AWS CLI configured (`aws sts get-caller-identity` should work)
- Bedrock access enabled in your AWS account
- Claude 3.5 Haiku enabled in Bedrock console (us-west-2 region)

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

**Note:** If you already have a manually-created API Gateway (e.g., `30vsmo8j0l`), you can skip the deploy script and just update the Lambda code:

```bash
zip -j function.zip lambda_function.py
aws lambda update-function-code \
  --function-name hr-avatar-analysis \
  --zip-file fileb://function.zip
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
  },
  "summary_prompt": "(optional) Custom system prompt to override the default"
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
    "fit": { "score_0_100": 75, "rec": "yes" },
    "gaps": [],
    "next_steps": []
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

## Configuration

Environment variables (set in Lambda console or via CLI):

| Variable | Current Value | Description |
|----------|---------------|-------------|
| `MODEL_ID` | `anthropic.claude-3-5-haiku-20241022-v1:0` | Bedrock model ID |
| `MAX_TOKENS` | `8192` | Maximum output tokens |
| `TEMPERATURE` | `0.3` | Model temperature (lower = more deterministic) |

### Change Model

```bash
aws lambda update-function-configuration \
  --function-name hr-avatar-analysis \
  --environment "Variables={MODEL_ID=anthropic.claude-3-5-haiku-20241022-v1:0,MAX_TOKENS=8192,TEMPERATURE=0.3}"
```

Available models:
- `anthropic.claude-3-5-haiku-20241022-v1:0` (current - fast, good quality)
- `anthropic.claude-3-haiku-20240307-v1:0` (older, cheaper)
- `anthropic.claude-3-sonnet-20240229-v1:0` (balanced)
- `anthropic.claude-3-opus-20240229-v1:0` (best quality, expensive)

## Updating the Function

After editing `lambda_function.py`:

```bash
zip -j function.zip lambda_function.py
aws lambda update-function-code \
  --function-name hr-avatar-analysis \
  --zip-file fileb://function.zip
```

Then update the `ANALYSIS_API_URL` in both:
- `hr_avatar/hr-demo.js`
- `code_interview/code-interview.js`

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

## Troubleshooting

### 403 Forbidden
- Check Lambda resource policy allows API Gateway
- Verify API Gateway has correct Lambda integration

### 503 Service Unavailable
- HTTP API Gateway has a hard 30-second timeout
- Client-side retry logic handles this (3 attempts with backoff)
- Consider simplifying the summary prompt to reduce response time

### Timeout (504)
- Increase Lambda timeout (max 900s)
- Check if transcript is unusually large

### Invalid JSON Response
- Check CloudWatch logs for parsing errors
- Increase `MAX_TOKENS` if output is being truncated

### Bedrock Throttling
- Client implements retry with backoff for 429 responses
- Request quota increase from AWS if persistent

## Files

| File | Description |
|------|-------------|
| `lambda_function.py` | Main Lambda handler and Bedrock integration |
| `deploy.sh` | Automated deployment script |
| `cleanup.sh` | Resource cleanup script |
| `trust-policy.json` | IAM trust policy for Lambda |
| `bedrock-policy.json` | IAM policy for Bedrock access (includes Claude 3.5 Haiku) |
| `.api-url` | Stores deployed API URL |
