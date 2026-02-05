/**
 * Code Interview POC - AI Pair Programming
 *
 * Demonstrates real-time code context injection to an AI avatar,
 * enabling intelligent pair programming assistance.
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = Object.freeze({
    VERSION: '1.0.0',

    // Kaltura Avatar SDK (same as HR demo)
    CLIENT_ID: '115767973963657880005',
    FLOW_ID: 'agent-15',

    // Code context injection timing
    DEBOUNCE_MS: 3000,        // Wait 3s after typing stops
    MAX_INTERVAL_MS: 15000,   // Force update every 15s during active coding

    // Avatar name
    AVATAR_NAME: 'Alex'
});

// =============================================================================
// PROBLEM DEFINITIONS
// =============================================================================

const PROBLEMS = {
    'two-sum': {
        id: 'two-sum',
        title: 'Two Sum',
        difficulty: 'easy',
        description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
        examples: [
            {
                input: 'nums = [2,7,11,15], target = 9',
                output: '[0,1]',
                explanation: 'nums[0] + nums[1] = 2 + 7 = 9'
            }
        ],
        starterCode: {
            python: `def two_sum(nums, target):
    # Your code here
    pass

# Test
print(two_sum([2, 7, 11, 15], 9))`,
            javascript: `function twoSum(nums, target) {
    // Your code here

}

// Test
console.log(twoSum([2, 7, 11, 15], 9));`
        },
        testCases: [
            { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
            { input: [[3, 2, 4], 6], expected: [1, 2] },
            { input: [[3, 3], 6], expected: [0, 1] }
        ],
        hints: [
            'Consider using a hash map to store values you\'ve seen',
            'For each number, check if (target - number) exists in your map',
            'You can solve this in O(n) time with O(n) space'
        ],
        optimalComplexity: 'O(n) time, O(n) space'
    }
};

// =============================================================================
// APPLICATION STATE
// =============================================================================

/**
 * Master DPP object - this is what gets injected to the avatar.
 * Since each injection replaces previous context, we maintain
 * everything in this single object.
 */
const state = {
    // SDK instance
    sdk: null,

    // Monaco editor instance
    editor: null,

    // Current problem
    currentProblem: PROBLEMS['two-sum'],

    // Selected language
    language: 'python',

    // Session timing
    sessionStartTime: null,

    // Code injection tracking
    lastInjectedCode: '',
    lastInjectionTime: 0,
    debounceTimer: null,
    intervalTimer: null,

    // Run results
    lastRunResult: null,
    runCount: 0,

    // Hints given
    hintsGiven: 0,

    /**
     * Build the complete DPP object for injection.
     * This must contain ALL context the avatar needs.
     */
    buildDPP() {
        const code = this.editor?.getValue() || '';
        const elapsedMins = this.sessionStartTime
            ? Math.floor((Date.now() - this.sessionStartTime) / 60000)
            : 0;

        return {
            v: '1',
            mode: 'code_interview',

            // Avatar persona and instructions
            persona: {
                name: CONFIG.AVATAR_NAME,
                role: 'Senior Software Engineer & Coding Interview Coach',
                style: 'supportive, educational, conversational'
            },

            // Instructions for the avatar
            instructions: [
                'You are pair programming with a candidate on a coding challenge.',
                'You can see their code in real-time via the code_state field.',
                'Be encouraging but also help them learn.',
                'If they seem stuck (long idle time, repeated errors), offer gentle hints.',
                'Ask about their approach and thought process.',
                'When they complete the problem, discuss time/space complexity.',
                'Do NOT give away the solution directly - guide them to discover it.',
                'Reference specific parts of their code when giving feedback.',
                'Keep responses concise - this is a conversation, not a lecture.'
            ],

            // The coding problem
            problem: {
                id: this.currentProblem.id,
                title: this.currentProblem.title,
                difficulty: this.currentProblem.difficulty,
                description: this.currentProblem.description,
                hints_available: this.currentProblem.hints.length,
                optimal_complexity: this.currentProblem.optimalComplexity
            },

            // Current code state - THIS IS THE KEY PART
            code_state: {
                language: this.language,
                code: code,
                line_count: code.split('\n').length,
                char_count: code.length,
                is_empty: code.trim() === '' || code === this.currentProblem.starterCode[this.language]
            },

            // Execution results
            execution: this.lastRunResult ? {
                ran_at: this.lastRunResult.timestamp,
                passed: this.lastRunResult.passed,
                failed: this.lastRunResult.failed,
                total: this.lastRunResult.total,
                error: this.lastRunResult.error,
                output: this.lastRunResult.output
            } : null,

            // Session metrics
            session: {
                elapsed_mins: elapsedMins,
                run_count: this.runCount,
                hints_given: this.hintsGiven,
                language_switches: 0
            },

            // Behavioral guidance based on state
            guidance: this.generateGuidance(code, elapsedMins)
        };
    },

    /**
     * Generate contextual guidance for the avatar based on current state.
     */
    generateGuidance(code, elapsedMins) {
        const guidance = [];

        // Check if stuck
        if (elapsedMins >= 2 && (code.trim() === '' || code === this.currentProblem.starterCode[this.language])) {
            guidance.push('Candidate has not started coding yet. Ask if they need clarification on the problem.');
        }

        // Check for errors
        if (this.lastRunResult?.error) {
            guidance.push(`Code has an error: "${this.lastRunResult.error}". Help them debug without giving away the solution.`);
        }

        // Check for success
        if (this.lastRunResult?.passed === this.lastRunResult?.total && this.lastRunResult?.total > 0) {
            guidance.push('All tests passed! Congratulate them and discuss time/space complexity.');
        }

        // Check for partial success
        if (this.lastRunResult && this.lastRunResult.passed > 0 && this.lastRunResult.passed < this.lastRunResult.total) {
            guidance.push(`${this.lastRunResult.passed}/${this.lastRunResult.total} tests passing. Encourage them to think about edge cases.`);
        }

        // Long session
        if (elapsedMins >= 10 && this.hintsGiven === 0) {
            guidance.push('Session is getting long. Consider offering a hint if they seem stuck.');
        }

        return guidance;
    }
};

// =============================================================================
// UI ELEMENTS
// =============================================================================

let ui = {};

function initUI() {
    ui = {
        avatarContainer: document.getElementById('avatar-container'),
        loadingState: document.getElementById('loading-state'),
        statusDot: document.getElementById('status-dot'),
        statusText: document.getElementById('status-text'),
        editorContainer: document.getElementById('editor-container'),
        languageSelect: document.getElementById('language-select'),
        runBtn: document.getElementById('run-btn'),
        resetBtn: document.getElementById('reset-btn'),
        outputContent: document.getElementById('output-content'),
        testResults: document.getElementById('test-results'),
        debugDpp: document.getElementById('debug-dpp')
    };
}

// =============================================================================
// MONACO EDITOR
// =============================================================================

function initMonaco() {
    return new Promise((resolve) => {
        require.config({
            paths: {
                vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs'
            }
        });

        require(['vs/editor/editor.main'], function() {
            // Create editor
            state.editor = monaco.editor.create(ui.editorContainer, {
                value: state.currentProblem.starterCode[state.language],
                language: state.language,
                theme: 'vs-dark',
                fontSize: 14,
                fontFamily: "'Fira Code', monospace",
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                insertSpaces: true,
                wordWrap: 'on'
            });

            // Listen for code changes
            state.editor.onDidChangeModelContent(() => {
                onCodeChange();
            });

            resolve();
        });
    });
}

// =============================================================================
// AVATAR SDK
// =============================================================================

function initSDK() {
    state.sdk = new KalturaAvatarSDK({
        clientId: CONFIG.CLIENT_ID,
        flowId: CONFIG.FLOW_ID,
        container: '#avatar-container'
    });

    // State changes
    state.sdk.on('stateChange', ({ from, to }) => {
        updateStatus(to);
    });

    // Avatar spoke
    state.sdk.on(KalturaAvatarSDK.Events.AGENT_TALKED, (data) => {
        const text = data?.agentContent || data;
        console.log(`${CONFIG.AVATAR_NAME}:`, text);
    });

    // User spoke
    state.sdk.on(KalturaAvatarSDK.Events.USER_TRANSCRIPTION, (data) => {
        const text = data?.userTranscription || data;
        console.log('User:', text);
    });

    // Conversation ended
    state.sdk.on(KalturaAvatarSDK.Events.CONVERSATION_ENDED, () => {
        updateStatus('ended');
        stopCodeTracking();
    });

    // Errors
    state.sdk.on('error', ({ message }) => {
        console.error('SDK Error:', message);
        updateStatus('error');
    });
}

async function startAvatar() {
    try {
        updateStatus('connecting');
        await state.sdk.start();

        // Hide loading state
        ui.loadingState.style.display = 'none';

        // Record session start
        state.sessionStartTime = Date.now();

        // Inject initial DPP after short delay
        setTimeout(() => {
            injectDPP('initial');
            startCodeTracking();
        }, 2000);

    } catch (error) {
        console.error('Failed to start avatar:', error);
        updateStatus('error');
    }
}

// =============================================================================
// DPP INJECTION
// =============================================================================

/**
 * Inject the current DPP state to the avatar.
 * @param {string} reason - Why this injection is happening (for debugging)
 */
function injectDPP(reason = 'update') {
    if (!state.sdk) return;

    const dpp = state.buildDPP();
    const json = JSON.stringify(dpp);

    state.sdk.injectPrompt(json);
    state.lastInjectedCode = dpp.code_state.code;
    state.lastInjectionTime = Date.now();

    // Update debug panel
    if (ui.debugDpp) {
        ui.debugDpp.textContent = `// Injection reason: ${reason}\n// Time: ${new Date().toLocaleTimeString()}\n\n${JSON.stringify(dpp, null, 2)}`;
    }

    console.log(`[DPP] Injected (${reason}):`, {
        code_lines: dpp.code_state.line_count,
        elapsed_mins: dpp.session.elapsed_mins,
        run_count: dpp.session.run_count
    });
}

// =============================================================================
// CODE CHANGE TRACKING
// =============================================================================

/**
 * Called when code changes in the editor.
 * Uses debouncing to avoid flooding the avatar with updates.
 */
function onCodeChange() {
    // Clear existing debounce timer
    if (state.debounceTimer) {
        clearTimeout(state.debounceTimer);
    }

    // Set new debounce timer
    state.debounceTimer = setTimeout(() => {
        const currentCode = state.editor?.getValue() || '';

        // Only inject if code actually changed
        if (currentCode !== state.lastInjectedCode) {
            injectDPP('code_change');
        }
    }, CONFIG.DEBOUNCE_MS);
}

/**
 * Start periodic code tracking (for max interval updates).
 */
function startCodeTracking() {
    // Clear any existing interval
    stopCodeTracking();

    // Set up periodic injection
    state.intervalTimer = setInterval(() => {
        const currentCode = state.editor?.getValue() || '';
        const timeSinceLastInjection = Date.now() - state.lastInjectionTime;

        // Inject if code changed and it's been a while
        if (currentCode !== state.lastInjectedCode && timeSinceLastInjection >= CONFIG.MAX_INTERVAL_MS) {
            injectDPP('interval');
        }
    }, CONFIG.MAX_INTERVAL_MS);
}

/**
 * Stop code tracking.
 */
function stopCodeTracking() {
    if (state.debounceTimer) {
        clearTimeout(state.debounceTimer);
        state.debounceTimer = null;
    }
    if (state.intervalTimer) {
        clearInterval(state.intervalTimer);
        state.intervalTimer = null;
    }
}

// =============================================================================
// CODE EXECUTION (SIMULATED)
// =============================================================================

/**
 * Run the current code against test cases.
 * This is a simplified simulation - real implementation would use Judge0 or similar.
 */
function runCode() {
    const code = state.editor.getValue();
    state.runCount++;

    ui.outputContent.textContent = 'Running...';
    ui.outputContent.className = 'output-content';
    ui.testResults.textContent = '';

    // Simulate execution delay
    setTimeout(() => {
        try {
            const result = simulateExecution(code, state.language);
            state.lastRunResult = result;

            // Update UI
            if (result.error) {
                ui.outputContent.textContent = `Error: ${result.error}`;
                ui.outputContent.className = 'output-content error';
                ui.testResults.textContent = 'Error';
                ui.testResults.className = 'test-results fail';
            } else {
                ui.outputContent.textContent = result.output;
                ui.outputContent.className = result.passed === result.total
                    ? 'output-content success'
                    : 'output-content';
                ui.testResults.textContent = `${result.passed}/${result.total} tests passed`;
                ui.testResults.className = result.passed === result.total
                    ? 'test-results pass'
                    : 'test-results fail';
            }

            // Inject updated state to avatar
            injectDPP('code_run');

        } catch (e) {
            state.lastRunResult = {
                timestamp: new Date().toISOString(),
                error: e.message,
                passed: 0,
                failed: 0,
                total: 0,
                output: null
            };
            ui.outputContent.textContent = `Execution error: ${e.message}`;
            ui.outputContent.className = 'output-content error';
            injectDPP('code_error');
        }
    }, 500);
}

/**
 * Simulate code execution (placeholder for real execution service).
 */
function simulateExecution(code, language) {
    const testCases = state.currentProblem.testCases;
    let passed = 0;
    let failed = 0;
    let output = '';
    let error = null;

    // Very basic simulation - just check for some patterns
    // Real implementation would use Judge0 API

    if (language === 'python') {
        // Check for common Python errors
        if (code.includes('pass') && !code.includes('return')) {
            return {
                timestamp: new Date().toISOString(),
                error: null,
                passed: 0,
                failed: testCases.length,
                total: testCases.length,
                output: 'Output: None\n\nYour function returned None. Did you forget to return a value?'
            };
        }

        // Check for hash map solution (optimal)
        if (code.includes('dict') || code.includes('{}') || code.includes('enumerate')) {
            passed = testCases.length;
            output = 'Output: [0, 1]\n\nAll test cases passed!\nYour solution appears to use a hash map approach - nice!';
        }
        // Check for nested loop solution (works but O(n²))
        else if (code.includes('for') && code.match(/for.*for/s)) {
            passed = testCases.length;
            output = 'Output: [0, 1]\n\nAll test cases passed!\nNote: Your solution uses nested loops (O(n²)). Can you think of a more efficient approach?';
        }
        // Some attempt made
        else if (code.includes('for') || code.includes('while')) {
            passed = 1;
            failed = testCases.length - 1;
            output = 'Output: [0, 1]\n\nPartial success - 1 test case passed.\nSome edge cases are failing. Consider what happens with duplicate values.';
        }
        else {
            passed = 0;
            failed = testCases.length;
            output = 'Output: None\n\nNo test cases passed yet. Keep working on your solution!';
        }
    } else if (language === 'javascript') {
        // Similar checks for JavaScript
        if (code.includes('Map') || code.includes('{}') || code.includes('Object')) {
            passed = testCases.length;
            output = 'Output: [0, 1]\n\nAll test cases passed!\nYour solution appears to use a hash map approach - nice!';
        }
        else if (code.includes('for') && code.match(/for.*for/s)) {
            passed = testCases.length;
            output = 'Output: [0, 1]\n\nAll test cases passed!\nNote: Your solution uses nested loops (O(n²)). Can you think of a more efficient approach?';
        }
        else if (code.includes('for') || code.includes('while')) {
            passed = 1;
            failed = testCases.length - 1;
            output = 'Output: [0, 1]\n\nPartial success - 1 test case passed.';
        }
        else {
            passed = 0;
            failed = testCases.length;
            output = 'No test cases passed yet.';
        }
    }

    return {
        timestamp: new Date().toISOString(),
        error: error,
        passed: passed,
        failed: failed,
        total: testCases.length,
        output: output
    };
}

// =============================================================================
// UI UPDATES
// =============================================================================

function updateStatus(status) {
    ui.statusDot.className = 'status-dot';

    switch (status) {
        case 'connecting':
            ui.statusText.textContent = 'Connecting...';
            break;
        case 'ready':
            ui.statusDot.classList.add('connected');
            ui.statusText.textContent = 'Ready';
            break;
        case 'in-conversation':
            ui.statusDot.classList.add('connected');
            ui.statusText.textContent = 'In conversation';
            break;
        case 'ended':
            ui.statusText.textContent = 'Session ended';
            break;
        case 'error':
            ui.statusDot.classList.add('error');
            ui.statusText.textContent = 'Connection error';
            break;
        default:
            ui.statusText.textContent = status;
    }
}

function resetCode() {
    if (state.editor) {
        state.editor.setValue(state.currentProblem.starterCode[state.language]);
    }
    state.lastRunResult = null;
    state.runCount = 0;
    ui.outputContent.textContent = 'Click "Run Code" to execute your solution...';
    ui.outputContent.className = 'output-content';
    ui.testResults.textContent = '';

    injectDPP('reset');
}

function onLanguageChange(newLanguage) {
    state.language = newLanguage;

    // Update Monaco language
    if (state.editor) {
        monaco.editor.setModelLanguage(state.editor.getModel(), newLanguage);
        state.editor.setValue(state.currentProblem.starterCode[newLanguage]);
    }

    // Reset run results
    state.lastRunResult = null;
    ui.outputContent.textContent = 'Click "Run Code" to execute your solution...';
    ui.outputContent.className = 'output-content';
    ui.testResults.textContent = '';

    injectDPP('language_change');
}

// =============================================================================
// EVENT LISTENERS
// =============================================================================

function attachEventListeners() {
    ui.runBtn.addEventListener('click', runCode);
    ui.resetBtn.addEventListener('click', resetCode);
    ui.languageSelect.addEventListener('change', (e) => {
        onLanguageChange(e.target.value);
    });
}

// =============================================================================
// INITIALIZATION
// =============================================================================

async function init() {
    initUI();
    attachEventListeners();
    initSDK();

    // Initialize Monaco editor
    await initMonaco();

    // Start the avatar
    await startAvatar();
}

document.addEventListener('DOMContentLoaded', init);
