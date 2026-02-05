# Kaltura Avatar SDK

Embed AI avatar conversations in any website with just a few lines of code.

**Zero dependencies** · **~4KB minified** · **Works everywhere**

## Quick Start

```html
<div id="avatar" style="width: 800px; height: 600px;"></div>
<script src="kaltura-avatar-sdk.min.js"></script>
<script>
  new KalturaAvatarSDK({
    clientId: 'YOUR_CLIENT_ID',
    flowId: 'YOUR_FLOW_ID',
    container: '#avatar'
  }).start();
</script>
```

That's it! The avatar loads and users can start talking.

## Installation

**Option 1: Direct download**
```html
<script src="kaltura-avatar-sdk.min.js"></script>
```

**Option 2: ES Module**
```javascript
import KalturaAvatarSDK from './kaltura-avatar-sdk.js';
```

## Basic Usage

```javascript
// Create and start
const sdk = new KalturaAvatarSDK({
  clientId: 'YOUR_CLIENT_ID',
  flowId: 'YOUR_FLOW_ID',
  container: '#avatar'
});

await sdk.start();

// Listen to avatar speech
sdk.on('agent-talked', (data) => {
  console.log('Avatar said:', data.agentContent || data);
});

// Listen to user speech
sdk.on('user-transcription', (data) => {
  console.log('User said:', data.userTranscription || data);
});

// Send a prompt programmatically
sdk.injectPrompt('Tell me a joke');

// End conversation
sdk.end();
```

## API Reference

### Constructor

```javascript
new KalturaAvatarSDK({
  clientId: string,      // Required: Your client ID
  flowId: string,        // Required: Your flow ID
  container: string,     // Optional: CSS selector or HTMLElement
  config: {              // Optional: Configuration
    debug: boolean,      // Enable console logging
    apiBaseUrl: string,  // Override API URL
    meetBaseUrl: string  // Override meet URL
  }
})
```

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `start(options?)` | `Promise<HTMLIFrameElement>` | Start the avatar conversation |
| `end()` | `void` | End the conversation |
| `destroy()` | `void` | Cleanup SDK resources |
| `injectPrompt(text)` | `boolean` | Send a prompt to the avatar |
| `sendMessage(message)` | `boolean` | Send raw message to iframe |
| `on(event, callback)` | `() => void` | Subscribe to events (returns unsubscribe fn) |
| `off(event, callback)` | `void` | Unsubscribe from event |
| `once(event, callback)` | `() => void` | Subscribe once |
| `getState()` | `string` | Get current SDK state |
| `getAssets()` | `object\|null` | Get loaded avatar assets |
| `getAvatarInfo()` | `object\|null` | Get avatar details |
| `getIframe()` | `HTMLIFrameElement\|null` | Get iframe element |
| `getTalkUrl()` | `string\|null` | Get talk URL |
| `getClientId()` | `string` | Get client ID |
| `getFlowId()` | `string` | Get flow ID |
| `getTranscript()` | `Array` | Get conversation transcript |
| `getTranscriptText(options?)` | `string` | Get transcript as formatted text |
| `downloadTranscript(options?)` | `void` | Download transcript as file |
| `clearTranscript()` | `void` | Clear the transcript |
| `setTranscriptEnabled(enabled)` | `void` | Enable/disable transcript recording |

### Events

Subscribe using `sdk.on(event, callback)`:

```javascript
// Avatar events
sdk.on('showing-join-meeting', () => {});  // Join screen displayed
sdk.on('join-meeting-clicked', () => {});  // User clicked join
sdk.on('showing-agent', () => {});         // Avatar is visible
sdk.on('agent-talked', (data) => {});      // Avatar spoke
sdk.on('user-transcription', (data) => {}); // User speech transcribed
sdk.on('pronunciation-score', (data) => {}); // Pronunciation score
sdk.on('permissions-denied', () => {});    // Mic/camera denied
sdk.on('conversation-ended', () => {});    // Conversation ended
sdk.on('load-agent-error', () => {});      // Failed to load avatar

// SDK events
sdk.on('ready', ({ assets }) => {});       // SDK initialized
sdk.on('started', ({ iframe }) => {});     // Conversation started
sdk.on('ended', () => {});                 // Conversation ended
sdk.on('error', ({ message }) => {});      // Error occurred
sdk.on('stateChange', ({ from, to }) => {}); // State changed

// Wildcard - receive all events
sdk.on('*', ({ event, data }) => {});
```

You can also use constants:
```javascript
sdk.on(KalturaAvatarSDK.Events.AGENT_TALKED, (data) => {});
sdk.on(KalturaAvatarSDK.Events.USER_TRANSCRIPTION, (data) => {});
```

### States

```javascript
sdk.getState(); // Returns one of:
// 'uninitialized' - SDK created but not initialized
// 'initializing'  - Loading avatar assets
// 'ready'         - Ready to start conversation
// 'in-conversation' - Conversation active
// 'ended'         - Conversation ended
// 'error'         - Error occurred
```

## Examples

### Auto-start on Page Load

```javascript
const sdk = new KalturaAvatarSDK({
  clientId: 'xxx',
  flowId: 'yyy',
  container: '#avatar'
});

sdk.start(); // Starts immediately
```

### Custom Styling

```javascript
await sdk.start({
  styles: {
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
  }
});
```

### Programmatic Prompts

```javascript
// Send a prompt to the avatar
sdk.injectPrompt('What is the weather today?');

// The avatar will respond as if the user said this
```

### React Component

```jsx
import { useEffect, useRef } from 'react';
import KalturaAvatarSDK from './kaltura-avatar-sdk';

function Avatar({ clientId, flowId }) {
  const ref = useRef();

  useEffect(() => {
    const sdk = new KalturaAvatarSDK({
      clientId,
      flowId,
      container: ref.current
    });
    sdk.start();
    return () => sdk.destroy();
  }, [clientId, flowId]);

  return <div ref={ref} style={{ height: 500 }} />;
}
```

### Vue Component

```vue
<template>
  <div ref="container" style="height: 500px"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import KalturaAvatarSDK from './kaltura-avatar-sdk';

const props = defineProps(['clientId', 'flowId']);
const container = ref();
let sdk;

onMounted(() => {
  sdk = new KalturaAvatarSDK({
    clientId: props.clientId,
    flowId: props.flowId,
    container: container.value
  });
  sdk.start();
});

onUnmounted(() => sdk?.destroy());
</script>
```

### Event Logging

```javascript
// Log all events
sdk.on('*', ({ event, data }) => {
  console.log(`[${event}]`, data);
});
```

### Transcript Recording

The SDK automatically records conversation transcripts.

```javascript
// Get transcript as array
const transcript = sdk.getTranscript();
// Returns: [{ role: 'Avatar'|'User', text: string, timestamp: Date }, ...]

// Get transcript as text
const text = sdk.getTranscriptText();
const markdown = sdk.getTranscriptText({ format: 'markdown' });
const json = sdk.getTranscriptText({ format: 'json' });

// Download transcript
sdk.downloadTranscript(); // Downloads as .txt
sdk.downloadTranscript({ format: 'markdown' }); // Downloads as .md
sdk.downloadTranscript({
  format: 'text',
  filename: 'my-transcript.txt',
  includeTimestamps: true
});

// Disable/enable transcript recording
sdk.setTranscriptEnabled(false);

// Clear transcript
sdk.clearTranscript();
```

## HR Avatar Demo

The `hr_avatar/` folder contains a complete HR use case demo with interview, post-interview, and separation scenarios. See [`hr_avatar/README.md`](hr_avatar/README.md) for detailed documentation.

### Features

- **Interview Scenarios**: Phone screen simulations for various roles (drivers, engineers, analysts)
- **Post-Interview Calls**: Job offer and rejection feedback calls
- **Separation Meetings**: Layoff, performance, and misconduct terminations
- **CV Upload**: Upload candidate resumes (PDF) for personalized interviews
- **Editable Fields**: Customize candidate name, role, company, location before starting
- **Live Transcript**: Real-time conversation recording with TXT/MD download
- **AI Call Analysis**: Automatic call summary generation using AWS Bedrock

### Quick Start

```bash
cd hr_avatar
python3 -m http.server 8080
# Open http://localhost:8080
```

### Dynamic Page Prompt (DPP)

HR scenarios use the Dynamic Page Prompt system to customize avatar behavior:

```javascript
// Load scenario JSON
const response = await fetch('scenario.json');
const scenarioData = await response.json();

// Start avatar and inject scenario
await sdk.start();
sdk.injectPrompt(JSON.stringify(scenarioData));
```

### DPP Schema (v2)

```json
{
  "v": "2",
  "mode": "interview | post_interview | separation",
  "org": { "n": "Company Name", "tone": "warm, professional" },
  "role": { "t": "Job Title", "loc": "Location", "must": ["requirement"] },
  "subj": { "name": "Person Name", "id": "CAND-001" },
  "mtg": { "mins": 5, "focus": ["topic1", "topic2"] },
  "case": { "type": "Layoff", "talk": ["Approved talking point"] }
}
```

See `hr_avatar/dynamic_page_prompt.schema.json` for the complete schema.

### Call Analysis Backend

The HR demo includes a serverless backend for AI-powered call analysis:

```bash
cd hr_avatar/lambda
./deploy.sh  # Deploys to AWS Lambda + API Gateway
```

See [`hr_avatar/lambda/README.md`](hr_avatar/lambda/README.md) for deployment details.

### Adding New Scenarios

1. Create a new JSON file in `hr_avatar/dynamic_page_prompt_samples/`
2. Add the scenario to `SCENARIOS` in `hr_avatar/hr-demo.js`
3. The UI automatically picks up new scenarios

## Files

### SDK Core

| File | Size | Description |
|------|------|-------------|
| `kaltura-avatar-sdk.min.js` | ~4KB | Production (minified) |
| `kaltura-avatar-sdk.js` | ~12KB | Development (readable, documented) |
| `kaltura-avatar-sdk.d.ts` | ~4KB | TypeScript definitions |

### Basic Demo

| File | Description |
|------|-------------|
| `index.html` | Simple demo page |
| `demo.js` | Basic SDK usage example |
| `demo.css` | Demo styles |

### HR Avatar Demo

| File | Description |
|------|-------------|
| `hr_avatar/README.md` | Comprehensive HR demo documentation |
| `hr_avatar/index.html` | HR demo page |
| `hr_avatar/hr-demo.js` | Application logic (scenarios, SDK integration, analysis) |
| `hr_avatar/hr-demo.css` | Styles (warm professional theme) |
| `hr_avatar/base_prompt.txt` | Base system prompt for Nora HR avatar |
| `hr_avatar/dynamic_page_prompt.schema.json` | DPP v2 JSON Schema |
| `hr_avatar/call_summary.schema.json` | Call analysis output schema (v4.1) |
| `hr_avatar/dynamic_page_prompt_samples/` | Sample scenario JSON files |

### Lambda Backend

| File | Description |
|------|-------------|
| `hr_avatar/lambda/README.md` | Lambda deployment guide |
| `hr_avatar/lambda/lambda_function.py` | Bedrock Claude analysis function |
| `hr_avatar/lambda/deploy.sh` | Automated deployment script |
| `hr_avatar/lambda/cleanup.sh` | Resource cleanup script |
| `hr_avatar/lambda/*.json` | IAM policy files |

## Browser Support

Chrome 60+ · Firefox 55+ · Safari 11+ · Edge 79+

## TypeScript

TypeScript definitions are included. Import types:

```typescript
import KalturaAvatarSDK from './kaltura-avatar-sdk';

const sdk = new KalturaAvatarSDK({
  clientId: 'xxx',
  flowId: 'yyy'
});

sdk.on('agent-talked', (data) => {
  // data is typed as string | { agentContent: string }
});
```

## License

MIT
