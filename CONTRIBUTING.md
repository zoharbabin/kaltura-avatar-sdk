# Contributing

## Add a New Demo Application

Each demo lives in its own directory under `examples/`. Follow this structure:

```
examples/your_demo/
├── index.html              ← Entry point
├── your-demo.js            ← Application logic
├── your-demo.css           ← Styles
├── base_prompt.txt         ← Avatar persona definition
├── dynamic_page_prompt.schema.json  ← DPP schema (optional)
└── README.md               ← What it does, how to run, how to extend
```

### Step-by-step

1. **Create your directory** under `examples/`
2. **Add an `index.html`** that loads the SDK:
   ```html
   <script src="../../sdk/kaltura-avatar-sdk.min.js"></script>
   ```
3. **Write your `base_prompt.txt`** defining the avatar's persona and behavior rules
4. **Wire up the SDK** in your JS file:
   ```javascript
   const sdk = new KalturaAvatarSDK({
     clientId: CONFIG.CLIENT_ID,
     flowId: CONFIG.FLOW_ID,
     container: '#your-container'
   });

   // Inject DPP when avatar is ready
   sdk.on(KalturaAvatarSDK.Events.SHOWING_AGENT, () => {
     setTimeout(() => sdk.injectPrompt(JSON.stringify(buildDPP())), 500);
   });

   await sdk.start();
   ```
5. **Add your demo** to the table in `README.md` and to `index.html`
6. **Test locally**: `python3 -m http.server 8080` from the project root

### Key Patterns

- **DPP Injection**: Always inject on `SHOWING_AGENT` event with a ~500ms delay
- **Call-End Detection**: Listen for `CONVERSATION_ENDED` event and/or match avatar speech phrases
- **Analysis**: Add a new mode to `examples/hr_avatar/lambda/lambda_function.py` if you need post-call analysis
- **Dual Avatars**: See `examples/att_lily/` for managing multiple SDK instances with independent lifecycles

### Adding a New Analysis Mode

1. Add your mode handler in `examples/hr_avatar/lambda/lambda_function.py`:
   ```python
   elif analysis_mode == 'your_mode':
       system_prompt = "..."
       # Process and return structured JSON
   ```
2. Deploy: `cd examples/hr_avatar/lambda && ./deploy.sh`
3. Call from your demo: `POST` to the API URL with `{ "analysis_mode": "your_mode", "transcript": "..." }`

## Running Tests

```bash
npm install
npm run test:install    # Install Playwright browsers
npm test               # Run all E2E tests
```

## Project Structure

```
├── sdk/                         ← The SDK (don't modify without bumping version)
│   ├── kaltura-avatar-sdk.js
│   ├── kaltura-avatar-sdk.min.js
│   └── kaltura-avatar-sdk.d.ts
├── examples/                    ← Demo applications
│   ├── att_lily/                ← AT&T Seller Hub
│   ├── hr_avatar/               ← HR Avatar + shared Lambda backend
│   ├── code_interview/          ← Code Interview
│   └── basic_demo/              ← Minimal starter
├── index.html                   ← Landing page (GitHub Pages root)
└── .github/workflows/           ← CI and GitHub Pages deployment
```
