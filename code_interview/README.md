# Code Interview POC - AI Pair Programming

An interactive coding interview demo using the Kaltura Avatar SDK. Features a real-time AI pair programming assistant that watches code as it's typed and provides contextual guidance.

## Quick Start

1. **Serve the files** via any HTTP server (e.g., Apache, nginx, or `python -m http.server`)
2. **Open** `index.html` in a browser
3. **Start coding** - the avatar sees your code in real-time

## Files Overview

| File | Purpose |
|------|---------|
| `index.html` | Main HTML page with Monaco editor and avatar container |
| `code-interview.js` | Application logic, SDK integration, DPP injection |
| `code-interview.css` | Dark theme styles for editor and UI |
| `base_prompt.txt` | Avatar personality and behavior instructions |
| `avatar_prompt.txt` | DPP schema documentation (technical reference) |
| `summary_prompt.txt` | Post-session analysis JSON schema |
| `goals.txt` | Avatar session goals |

## Architecture

```
┌─────────────────┐     ┌──────────────────┐
│  Monaco Editor  │────▶│  DPP Builder     │
│  (user's code)  │     │  (buildDPP())    │
└─────────────────┘     └────────┬─────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │  Kaltura Avatar  │
                        │  SDK             │
                        │  (injectPrompt)  │
                        └──────────────────┘
```

## DPP (Dynamic Page Prompt)

The avatar receives real-time context via JSON injection:

```javascript
{
  problem: { id, title, difficulty, ... },
  live_code: { current_code, language, code_observations },
  last_execution: { tests_passed, tests_failed, error_message },
  session: { phase, problem_number, total_problems, next_problem }
}
```

See `avatar_prompt.txt` for full schema documentation.

## Session Phases

| Phase | Trigger |
|-------|---------|
| `START` | Just joined, hasn't typed yet |
| `STUCK` | No code changes for 60+ seconds |
| `CODING` | Actively writing code |
| `DEBUG` | Code threw an error |
| `PARTIAL` | Some tests pass |
| `WRONG_OUTPUT` | Code runs but 0 tests pass |
| `COMPLETE` | All tests pass |

## Problems Included

1. **Two Sum** (Easy) - Hash map solution
2. **Valid Palindrome** (Easy) - Two pointer solution
3. **Reverse Linked List** (Medium) - Iterative pointer manipulation
4. **Fizz Buzz** (Easy) - Modulo operations

## Adding New Problems

Add to the `PROBLEMS` object in `code-interview.js`:

```javascript
'problem-id': {
    id: 'problem-id',
    title: 'Problem Name',
    difficulty: 'easy', // easy | medium | hard
    description: `Problem description...`,
    examples: [{ input: '...', output: '...', explanation: '...' }],
    starterCode: {
        python: `def solution():\n    pass`,
        javascript: `function solution() {\n\n}`
    },
    testCases: [{ input: [...], expected: ... }],
    hints: ['Hint 1', 'Hint 2'],
    optimalComplexity: 'O(n) time, O(1) space'
}
```

Then add the ID to `PROBLEM_ORDER` and add problem knowledge to `base_prompt.txt`.

## Configuration

Edit `CONFIG` in `code-interview.js`:

```javascript
const CONFIG = {
    CLIENT_ID: '...',           // Kaltura SDK client ID
    FLOW_ID: 'agent-16',        // Avatar agent ID
    ANALYSIS_API_URL: '...',    // Bedrock analysis endpoint
    DEBOUNCE_MS: 200,           // Code change debounce
    AVATAR_NAME: 'Alex'         // Avatar display name
};
```

## Session Analysis

Click "End Session" to trigger Bedrock analysis, which evaluates:

- **Skills**: Problem solving, code fluency, communication, efficiency awareness
- **Potential**: Creativity, tenacity, aptitude, propensity
- **Fit Score**: 0-100 with hiring recommendation

## Notes

- **Simulated Execution**: `simulateExecution()` uses pattern matching, not real code execution. For production, integrate a sandboxed code runner.
- **Multi-Problem Sessions**: Avatar tracks progress across problems and prompts for next challenge on completion.

## Version

Current: v1.1.2
