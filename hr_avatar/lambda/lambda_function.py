"""
HR Avatar Call Analysis Lambda Function

Analyzes HR call transcripts using AWS Bedrock (Claude Haiku) and returns
structured summaries following the call_summary.schema.json format.

Environment Variables:
    MODEL_ID: Bedrock model ID (default: anthropic.claude-3-haiku-20240307-v1:0)
    MAX_TOKENS: Maximum output tokens (default: 4096)
    TEMPERATURE: Model temperature (default: 0.3)
"""

import json
import os
import boto3
from botocore.config import Config

# =============================================================================
# CONFIGURATION
# =============================================================================

MODEL_ID = os.environ.get('MODEL_ID', 'anthropic.claude-3-haiku-20240307-v1:0')
MAX_TOKENS = int(os.environ.get('MAX_TOKENS', '4096'))
TEMPERATURE = float(os.environ.get('TEMPERATURE', '0.3'))

# Configure Bedrock client with retries
bedrock_config = Config(
    retries={'max_attempts': 3, 'mode': 'adaptive'},
    read_timeout=60,
    connect_timeout=10
)

bedrock = boto3.client('bedrock-runtime', config=bedrock_config)

# =============================================================================
# CORS HEADERS
# =============================================================================

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
}

# =============================================================================
# SYSTEM PROMPT
# =============================================================================

SYSTEM_PROMPT = """You are an expert HR analyst. Your task is to analyze HR call transcripts and produce structured JSON summaries.

CRITICAL RULES:
1. Output ONLY valid JSON - no markdown, no explanations, no code blocks
2. Follow the schema exactly - all required fields must be present
3. Be evidence-based - only include information from the transcript and DPP
4. Be concise - keep strings short and factual
5. For interview mode: populate fit scores and STAR analysis
6. For non-interview modes: set fit scores to null, star_analysis to null

SCORING GUIDANCE:
- fit.score_0_100: 0-30 = poor fit, 31-50 = below average, 51-70 = average, 71-85 = good, 86-100 = excellent
- dims[].score_1_5: 1 = poor/no evidence, 2 = below expectations, 3 = meets expectations, 4 = above expectations, 5 = excellent
- believability.score_0_100: Based on consistency, specificity, and ability to explain claims

OUTPUT FORMAT:
Return ONLY the JSON object matching the schema. No other text."""

# =============================================================================
# LAMBDA HANDLER
# =============================================================================

def lambda_handler(event, context):
    """
    Main Lambda handler.

    Expected event body (JSON):
    {
        "transcript": [{"role": "assistant"|"user", "content": "..."}],
        "dpp": { Dynamic Page Prompt object },
        "schema": { Optional: JSON schema for validation context }
    }

    Returns:
    {
        "success": true,
        "summary": { ... structured summary ... },
        "usage": { "input_tokens": N, "output_tokens": N }
    }
    """

    # Handle CORS preflight
    if event.get('requestContext', {}).get('http', {}).get('method') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': ''
        }

    try:
        # Parse request body
        body = event.get('body', '{}')
        if isinstance(body, str):
            body = json.loads(body)

        # Validate required fields
        transcript = body.get('transcript', [])
        dpp = body.get('dpp', {})
        schema = body.get('schema')

        if not transcript:
            return error_response('Missing required field: transcript', 'VALIDATION_ERROR')

        if not dpp:
            return error_response('Missing required field: dpp', 'VALIDATION_ERROR')

        # Build the analysis prompt
        user_prompt = build_analysis_prompt(transcript, dpp, schema)

        # Call Bedrock
        summary, usage = call_bedrock(user_prompt)

        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'success': True,
                'summary': summary,
                'usage': usage
            })
        }

    except json.JSONDecodeError as e:
        return error_response(f'Invalid JSON in request: {str(e)}', 'VALIDATION_ERROR')
    except bedrock.exceptions.ThrottlingException:
        return error_response('Service temporarily busy, please retry', 'THROTTLING', 429)
    except bedrock.exceptions.ModelTimeoutException:
        return error_response('Analysis took too long, please retry', 'TIMEOUT', 504)
    except Exception as e:
        print(f'Error: {str(e)}')  # Log for CloudWatch
        return error_response(f'Analysis failed: {str(e)}', 'BEDROCK_ERROR', 500)


def build_analysis_prompt(transcript: list, dpp: dict, schema: dict = None) -> str:
    """
    Build the user prompt for the LLM.
    """

    # Format transcript
    transcript_text = format_transcript(transcript)

    # Calculate basic stats
    turn_count = len([t for t in transcript if t.get('role') == 'user'])

    prompt_parts = [
        "Analyze this HR call and produce a JSON summary.\n",
        f"## Call Mode\n{dpp.get('mode', 'interview')}\n",
        f"## Turn Count\n{turn_count} user turns\n",
        f"## Dynamic Page Prompt (DPP)\n```json\n{json.dumps(dpp, indent=2)}\n```\n",
        f"## Transcript\n{transcript_text}\n",
    ]

    if schema:
        prompt_parts.append(f"## Output Schema\n```json\n{json.dumps(schema, indent=2)}\n```\n")

    prompt_parts.append(
        "\n## Instructions\n"
        "Produce a JSON summary following schema version 4.1. Include:\n"
        "- ctx: extracted from DPP (org, role, role_id, person, subj_id)\n"
        "- dpp_digest: key DPP fields (mins, focus, must, nice, cv_provided, role_id, subj_id)\n"
        "- turns: count of user turns\n"
        "- overview: 80-200 word summary\n"
        "- key_answers: answers to critical questions (must-haves, STAR, etc.)\n"
        "- fit: role fit assessment (only for interview mode)\n"
        "- star_analysis: STAR methodology analysis (only for interview mode)\n"
        "- believability: credibility assessment\n"
        "- gaps: missing/unclear items\n"
        "- cq: call quality signals (emo, tone, eng)\n"
        "- risk: any risk flags\n"
        "- next_steps: recommended actions\n\n"
        "Output ONLY the JSON object, no other text."
    )

    return '\n'.join(prompt_parts)


def format_transcript(transcript: list) -> str:
    """
    Format transcript for the prompt.
    """
    lines = []
    for i, turn in enumerate(transcript, 1):
        role = turn.get('role', 'unknown')
        content = turn.get('content', '')
        speaker = 'AI HR' if role == 'assistant' else 'Candidate'
        lines.append(f"[{i}] {speaker}: {content}")
    return '\n'.join(lines)


def call_bedrock(user_prompt: str) -> tuple:
    """
    Call Bedrock with the analysis prompt.

    Returns:
        tuple: (summary_dict, usage_dict)
    """

    request_body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": MAX_TOKENS,
        "temperature": TEMPERATURE,
        "system": SYSTEM_PROMPT,
        "messages": [
            {"role": "user", "content": user_prompt}
        ]
    }

    response = bedrock.invoke_model(
        modelId=MODEL_ID,
        body=json.dumps(request_body),
        contentType='application/json',
        accept='application/json'
    )

    response_body = json.loads(response['body'].read())

    # Extract the text content
    content = response_body.get('content', [{}])[0].get('text', '{}')

    # Parse the JSON response
    # Handle potential markdown code blocks
    content = content.strip()
    if content.startswith('```'):
        # Remove markdown code block
        lines = content.split('\n')
        content = '\n'.join(lines[1:-1] if lines[-1] == '```' else lines[1:])

    try:
        summary = json.loads(content)
    except json.JSONDecodeError as e:
        print(f'Failed to parse LLM response: {content[:500]}')
        raise ValueError(f'LLM returned invalid JSON: {str(e)}')

    # Extract usage
    usage = {
        'input_tokens': response_body.get('usage', {}).get('input_tokens', 0),
        'output_tokens': response_body.get('usage', {}).get('output_tokens', 0)
    }

    return summary, usage


def error_response(message: str, code: str, status_code: int = 400) -> dict:
    """
    Build an error response.
    """
    return {
        'statusCode': status_code,
        'headers': CORS_HEADERS,
        'body': json.dumps({
            'success': False,
            'error': message,
            'code': code
        })
    }
