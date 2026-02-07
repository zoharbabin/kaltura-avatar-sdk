"""
Avatar Analysis Lambda Function

Analyzes call/session transcripts using AWS Bedrock and returns structured
JSON summaries. Used by both HR Avatar and Code Interview demos.

Supports an optional 'summary_prompt' field in the request body to override
the default system prompt (used by code interview for custom schemas).

Environment Variables:
    MODEL_ID: Bedrock model ID (currently: anthropic.claude-3-5-haiku-20241022-v1:0)
    MAX_TOKENS: Maximum output tokens (currently: 8192)
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
2. Follow the schema EXACTLY - all required fields must be present with correct types
3. Be evidence-based - only include information from the transcript
4. Be concise - keep strings short and factual
5. NEVER include raw DPP objects in the output - extract only the required simple values
6. NEVER reference internal terms like "DPP", "schema", "prompt", or "JSON" in text values - the output must be human-readable and self-contained (e.g., say "job requirements" not "DPP requirements")

REQUIRED OUTPUT STRUCTURE:
{
  "v": "4.1",
  "mode": "<interview|post_interview|separation>",
  "ctx": {
    "org": "<company name STRING, e.g. 'Amazon'>",
    "role": "<role title STRING, e.g. 'Delivery Driver'>",
    "role_id": "<role ID STRING from DPP.role.id, or empty string>",
    "loc": "<location STRING, e.g. 'Lisbon, PT'>",
    "person": "<candidate name STRING, e.g. 'Daniela Silva'>",
    "subj_id": "<subject ID STRING from DPP.subj.id, or empty string>"
  },
  "dpp_digest": {
    "mins": <integer>,
    "focus": ["<string>", ...],
    "must": ["<string>", ...],
    "nice": ["<string>", ...],
    "cv_provided": <boolean>,
    "role_id": "<same as ctx.role_id>",
    "subj_id": "<same as ctx.subj_id>"
  },
  "turns": <integer count of user turns>,
  "overview": "<80-200 word summary of the call>",
  "key_answers": [
    {"id": "<id>", "q": "<question>", "a": "<answer>", "status": "<answered|partially_answered|not_answered>", "strength": "<strong|ok|weak|unknown>"}
  ],
  "fit": {
    "score_0_100": <number or null for non-interview>,
    "rec": "<strong_yes|yes|lean_yes|lean_no|no or null>",
    "conf": "<high|medium|low or null>",
    "dims": [{"id": "<id>", "score_1_5": <1-5>, "e": "<one sentence evidence>"}]
  },
  "star_analysis": <null or object with summary, ratings, quality, recommendation, confidence, follow_ups>,
  "believability": {
    "score_0_100": <number>,
    "cv_consistency": "<consistent|mixed|inconsistent|no_cv|unknown>",
    "mismatches": [],
    "signals": ["<signal>"],
    "notes": "<explanation>"
  },
  "gaps": [{"missing": "<what>", "why_matters": "<impact>", "next_q": "<question>"}],
  "cq": {"emo": "<emotion>", "tone": "<tone>", "eng": "<engagement>"},
  "risk": {"flags": ["none"], "escalated": false, "reason": ""},
  "next_steps": ["<action>", ...]
}

IMPORTANT:
- ctx fields must be SIMPLE STRINGS, not objects
- Extract values from DPP but output only the simple field values
- Never copy entire DPP sub-objects into the output
- All text in the output must be human-readable - never mention "DPP", "the prompt", "the schema", etc.
- Use natural HR language: "job requirements", "role criteria", "position requirements" instead of technical terms

SCORING GUIDANCE:
- fit.score_0_100: 0-30 = poor fit, 31-50 = below average, 51-70 = average, 71-85 = good, 86-100 = excellent
- dims[].score_1_5: 1 = poor/no evidence, 2 = below expectations, 3 = meets expectations, 4 = above expectations, 5 = excellent
- believability.score_0_100: Based on consistency, specificity, and ability to explain claims

OUTPUT FORMAT:
Return ONLY the JSON object. No markdown, no code blocks, no explanations."""

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
        "schema": { Optional: JSON schema for validation context },
        "summary_prompt": { Optional: Custom system prompt to override the default }
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

        # Optional: custom summary prompt (overrides default SYSTEM_PROMPT)
        custom_prompt = body.get('summary_prompt')

        if not transcript:
            return error_response('Missing required field: transcript', 'VALIDATION_ERROR')

        if not dpp:
            return error_response('Missing required field: dpp', 'VALIDATION_ERROR')

        # Build the analysis prompt
        user_prompt = build_analysis_prompt(transcript, dpp, schema, custom_prompt)

        # Call Bedrock with optional custom system prompt
        summary, usage = call_bedrock(user_prompt, custom_prompt)

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


def build_analysis_prompt(transcript: list, dpp: dict, schema: dict = None, custom_prompt: str = None) -> str:
    """
    Build the user prompt for the LLM.

    If a custom_prompt is provided, we use simplified instructions since the
    custom system prompt will contain the schema and detailed instructions.
    """

    # Format transcript
    transcript_text = format_transcript(transcript)

    # Calculate basic stats
    turn_count = len([t for t in transcript if t.get('role') == 'user'])

    prompt_parts = [
        "Analyze this session and produce a JSON summary.\n",
        f"## Session Mode\n{dpp.get('mode', 'interview')}\n",
        f"## Turn Count\n{turn_count} user turns\n",
        f"## Dynamic Page Prompt (DPP)\n```json\n{json.dumps(dpp, indent=2)}\n```\n",
        f"## Transcript\n{transcript_text}\n",
    ]

    if schema:
        prompt_parts.append(f"## Output Schema\n```json\n{json.dumps(schema, indent=2)}\n```\n")

    # If custom prompt provided, use minimal instructions (schema is in system prompt)
    if custom_prompt:
        prompt_parts.append(
            "\n## Instructions\n"
            "Follow the schema and instructions in the system prompt exactly.\n"
            "Analyze the transcript thoroughly and produce a complete JSON summary.\n"
            "Output ONLY the JSON object, no other text."
        )
    else:
        # Default instructions for backward compatibility
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


def call_bedrock(user_prompt: str, custom_system_prompt: str = None) -> tuple:
    """
    Call Bedrock with the analysis prompt.

    Args:
        user_prompt: The user prompt containing transcript and DPP
        custom_system_prompt: Optional custom system prompt to override default

    Returns:
        tuple: (summary_dict, usage_dict)
    """

    # Use custom system prompt if provided, otherwise use default
    system_prompt = custom_system_prompt if custom_system_prompt else SYSTEM_PROMPT

    request_body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": MAX_TOKENS,
        "temperature": TEMPERATURE,
        "system": system_prompt,
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
