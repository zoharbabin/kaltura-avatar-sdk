# Kaltura Avatar SDK

> **Note:** This is a non-official, research-level SDK. For official Kaltura SDKs, see [github.com/kaltura](https://github.com/kaltura/).

Embed AI avatar conversations in any website with just a few lines of code.

**Zero dependencies** · **~4KB minified** · **Works everywhere**

## Quick Start

```html
<div id="avatar" style="width: 800px; height: 600px;"></div>
<script src="kaltura-avatar-sdk.min.js"></script>
<script>
  const sdk = new KalturaAvatarSDK({
    clientId: 'YOUR_CLIENT_ID',
    flowId: 'YOUR_FLOW_ID',
    container: '#avatar'
  });

  await sdk.start();

  sdk.on('agent-talked', (data) => {
    console.log('Avatar said:', data.agentContent || data);
  });
</script>
```

## Live Demos

| Demo | Description | Link |
|------|-------------|------|
| **AT&T Seller Hub** | Dual-avatar sales coaching with knowledge checks and graded reports | [Launch](att_lily/) · [Docs](att_lily/README.md) |
| **HR Avatar** | Interview simulations, CV upload, AI call analysis | [Launch](hr_avatar/) · [Docs](hr_avatar/README.md) |
| **Code Interview** | AI pair programming with Monaco editor and real-time code context | [Launch](code_interview/) · [Docs](code_interview/README.md) |
| **Basic Demo** | Minimal example showing all SDK features | [Launch](basic_demo/) · [Source](basic_demo/demo.js) |

All demos run via any static server: `python3 -m http.server 8080`

## SDK Files

| File | Description |
|------|-------------|
| [`kaltura-avatar-sdk.min.js`](kaltura-avatar-sdk.min.js) | Production (~4KB) |
| [`kaltura-avatar-sdk.js`](kaltura-avatar-sdk.js) | Development (readable) |
| [`kaltura-avatar-sdk.d.ts`](kaltura-avatar-sdk.d.ts) | TypeScript declarations |

## Key Concepts

**Events** — Subscribe to avatar speech, user transcription, state changes:
```javascript
sdk.on('agent-talked', (data) => { /* avatar spoke */ });
sdk.on('user-transcription', (data) => { /* user spoke */ });
sdk.on('stateChange', ({ from, to }) => { /* lifecycle */ });
```

**Dynamic Page Prompt (DPP)** — Inject JSON context at runtime to customize avatar behavior per session:
```javascript
sdk.on('showing-agent', () => {
  setTimeout(() => sdk.injectPrompt(JSON.stringify(scenarioData)), 500);
});
```

**Transcripts** — Built-in recording with export:
```javascript
sdk.getTranscript();           // Array of {role, text, timestamp}
sdk.downloadTranscript();      // Downloads as file
```

## Documentation

- [Landing Page](index.html) — Visual overview with architecture diagram and live demo links
- [TypeScript API Reference](kaltura-avatar-sdk.d.ts) — Complete type definitions
- [Analysis Backend](hr_avatar/lambda/README.md) — Shared Lambda (AWS Bedrock) for all demos

## Browser Support

Chrome 60+ · Firefox 55+ · Safari 11+ · Edge 79+

## License

[MIT](LICENSE)
