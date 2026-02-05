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
    VERSION: '1.0.1',

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
     * IMPORTANT: This overrides the base HR persona completely.
     */
    buildDPP() {
        const code = this.editor?.getValue() || '';
        const starterCode = this.currentProblem.starterCode[this.language];
        const isStarterCode = code.trim() === starterCode.trim();
        const elapsedMins = this.sessionStartTime
            ? Math.floor((Date.now() - this.sessionStartTime) / 60000)
            : 0;

        return {
            v: '2',
            mode: 'technical_interview',

            // OVERRIDE: New role for this session
            org: {
                n: 'TechCorp',
                val: 'We believe in collaborative problem-solving and helping engineers grow',
                tone: 'friendly, technical, supportive'
            },

            role: {
                t: 'Software Engineer',
                id: 'SWE-001',
                loc: 'Remote',
                must: ['Problem solving', 'Code fluency', 'Communication'],
                nice: ['Optimal solutions', 'Clean code']
            },

            subj: {
                name: 'Candidate',
                id: 'CAND-001',
                prof: {
                    notes: [
                        'This is a CODING INTERVIEW, not an HR screen.',
                        'The candidate is solving a live coding problem.',
                        'You can see their code in real-time in the live_code section below.'
                    ]
                }
            },

            mtg: {
                mins: 30,
                type: 'Technical Coding Interview',
                focus: ['Algorithm design', 'Code implementation', 'Problem solving approach']
            },

            // CRITICAL: Instructions that override base behavior
            inst: [
                'IMPORTANT: You are NOW a Senior Software Engineer conducting a CODING INTERVIEW.',
                'FORGET any HR interviewer persona - you are a technical interviewer.',
                'Your name is Alex and you are a friendly engineering mentor.',
                '',
                '=== YOUR ROLE ===',
                'You are pair-programming with the candidate on a coding challenge.',
                'You can SEE their code in real-time via the "live_code" field below.',
                'Act as a supportive senior engineer who wants to help them succeed.',
                '',
                '=== THE CODING PROBLEM ===',
                `Problem: ${this.currentProblem.title}`,
                `Difficulty: ${this.currentProblem.difficulty}`,
                `Description: ${this.currentProblem.description}`,
                `Optimal solution: ${this.currentProblem.optimalComplexity}`,
                '',
                '=== HOW TO HELP ===',
                '1. At the START: Greet them, confirm they understand the problem, ask about their initial approach',
                '2. WHILE CODING: Observe their code, ask about their thought process, give gentle nudges if stuck',
                '3. IF STUCK (idle >2 min or repeated errors): Offer a hint without giving away the answer',
                '4. AFTER THEY RUN CODE: Discuss the results, help debug errors, celebrate successes',
                '5. WHEN SOLVED: Discuss time/space complexity, ask about alternative approaches',
                '',
                '=== IMPORTANT RULES ===',
                '- NEVER give away the complete solution',
                '- Reference SPECIFIC lines or parts of their code when commenting',
                '- Keep responses SHORT (2-3 sentences) - this is a conversation',
                '- Be encouraging but also technically rigorous',
                '- If they ask for help, give hints not answers'
            ],

            // THE LIVE CODE - This is what the candidate is typing RIGHT NOW
            live_code: {
                language: this.language,
                current_code: code,
                is_starter_code: isStarterCode,
                line_count: code.split('\n').length,

                // Analysis hints for the avatar
                code_observations: this.analyzeCode(code)
            },

            // Execution results from "Run Code" button
            last_execution: this.lastRunResult ? {
                timestamp: this.lastRunResult.timestamp,
                tests_passed: this.lastRunResult.passed,
                tests_failed: this.lastRunResult.failed,
                total_tests: this.lastRunResult.total,
                error_message: this.lastRunResult.error,
                output: this.lastRunResult.output
            } : null,

            // Session state
            interview_state: {
                elapsed_minutes: elapsedMins,
                times_code_was_run: this.runCount,
                hints_given_so_far: this.hintsGiven,
                current_status: this.getInterviewStatus(code, isStarterCode, elapsedMins)
            },

            // Dynamic guidance based on current state
            avatar_guidance: this.generateGuidance(code, elapsedMins)
        };
    },

    /**
     * Analyze the code and provide observations for the avatar.
     */
    analyzeCode(code) {
        const observations = [];

        if (!code || code.trim() === '' || code === this.currentProblem.starterCode[this.language]) {
            observations.push('Candidate has not started coding yet');
            return observations;
        }

        // Check for common patterns
        if (this.language === 'python') {
            if (code.includes('for') && code.match(/for.*:[\s\S]*for.*:/)) {
                observations.push('Using nested loops (O(n²) approach)');
            }
            if (code.includes('dict(') || code.includes('= {}') || code.includes(': {')) {
                observations.push('Using a dictionary/hash map (good for O(n) solution)');
            }
            if (code.includes('enumerate')) {
                observations.push('Using enumerate for index tracking');
            }
            if (code.includes('return') && !code.includes('pass')) {
                observations.push('Has a return statement');
            }
            if (code.includes('pass') && !code.includes('return [')) {
                observations.push('Still has placeholder pass statement');
            }
        } else if (this.language === 'javascript') {
            if (code.includes('for') && code.match(/for.*\{[\s\S]*for.*\{/)) {
                observations.push('Using nested loops (O(n²) approach)');
            }
            if (code.includes('new Map') || code.includes('= {}') || code.includes('Object.')) {
                observations.push('Using an object/Map (good for O(n) solution)');
            }
            if (code.includes('return') && !code.includes('return;')) {
                observations.push('Has a return statement with value');
            }
        }

        if (observations.length === 0) {
            observations.push('Code in progress');
        }

        return observations;
    },

    /**
     * Get a human-readable interview status.
     */
    getInterviewStatus(code, isStarterCode, elapsedMins) {
        if (isStarterCode && elapsedMins < 1) {
            return 'Just started - candidate reviewing problem';
        }
        if (isStarterCode && elapsedMins >= 2) {
            return 'Candidate has not started coding - may need encouragement';
        }
        if (this.lastRunResult?.error) {
            return 'Code has an error - candidate may need debugging help';
        }
        if (this.lastRunResult?.passed === this.lastRunResult?.total && this.lastRunResult?.total > 0) {
            return 'ALL TESTS PASSED - ready to discuss complexity and alternatives';
        }
        if (this.lastRunResult?.passed > 0) {
            return `Partial progress: ${this.lastRunResult.passed}/${this.lastRunResult.total} tests passing`;
        }
        return 'Candidate is actively coding';
    },

    /**
     * Generate contextual guidance for the avatar based on current state.
     * These are ACTION ITEMS for what the avatar should do next.
     */
    generateGuidance(code, elapsedMins) {
        const guidance = [];
        const isStarterCode = code.trim() === this.currentProblem.starterCode[this.language].trim();

        // === PHASE 1: Getting Started ===
        if (isStarterCode && elapsedMins < 1) {
            guidance.push('ACTION: Greet the candidate warmly. Introduce yourself as Alex, a senior engineer.');
            guidance.push('ACTION: Ask them to read the problem and share their initial thoughts on how to approach it.');
            return guidance;
        }

        if (isStarterCode && elapsedMins >= 1 && elapsedMins < 3) {
            guidance.push('ACTION: The candidate hasn\'t started coding. Ask if they understand the problem.');
            guidance.push('ACTION: Encourage them to think out loud about their approach before coding.');
            return guidance;
        }

        if (isStarterCode && elapsedMins >= 3) {
            guidance.push('HINT NEEDED: Candidate seems stuck before starting. Offer a gentle hint.');
            guidance.push('HINT: Ask "What data structure might help you look up values quickly?"');
            return guidance;
        }

        // === PHASE 2: Active Coding ===
        if (!this.lastRunResult) {
            // They're coding but haven't run yet
            if (code.includes('for') && code.match(/for.*for/s)) {
                guidance.push('OBSERVATION: Candidate is using nested loops. This works but is O(n²).');
                guidance.push('ACTION: Let them finish this approach first. After it works, ask about optimization.');
            }
            if (code.includes('dict') || code.includes('{}') || code.includes('Map')) {
                guidance.push('OBSERVATION: Candidate is using a hash map - good approach for O(n) solution!');
                guidance.push('ACTION: Encourage them to continue. Ask what they plan to store in it.');
            }
            guidance.push('ACTION: Ask about their current approach. "I see you\'re working on the solution - what\'s your strategy here?"');
            return guidance;
        }

        // === PHASE 3: After Running Code ===
        if (this.lastRunResult?.error) {
            guidance.push(`ERROR DETECTED: "${this.lastRunResult.error}"`);
            guidance.push('ACTION: Help them debug. Ask "What do you think might be causing this error?"');
            guidance.push('ACTION: Point to the relevant line if you can identify it from the error message.');
            return guidance;
        }

        if (this.lastRunResult?.passed === this.lastRunResult?.total && this.lastRunResult?.total > 0) {
            guidance.push('SUCCESS: All tests passed! Celebrate this achievement.');
            guidance.push('ACTION: Say "Great job! Your solution works!" Then ask about complexity.');
            guidance.push('ACTION: Ask "What\'s the time complexity of your solution?" and "Can you think of any way to optimize it?"');

            // Check if they used O(n²) approach
            if (code.includes('for') && code.match(/for.*for/s)) {
                guidance.push('FOLLOW-UP: Their solution is O(n²). After discussing, hint at the O(n) hash map approach.');
            }
            return guidance;
        }

        if (this.lastRunResult && this.lastRunResult.passed > 0 && this.lastRunResult.passed < this.lastRunResult.total) {
            guidance.push(`PARTIAL SUCCESS: ${this.lastRunResult.passed}/${this.lastRunResult.total} tests passing.`);
            guidance.push('ACTION: Encourage them! "Good progress - some tests are passing."');
            guidance.push('ACTION: Ask them to think about edge cases. "What happens with duplicate numbers?"');
            return guidance;
        }

        if (this.lastRunResult && this.lastRunResult.passed === 0) {
            guidance.push('NO TESTS PASSING: Code runs but gives wrong output.');
            guidance.push('ACTION: Ask them to trace through their code with the example input.');
            guidance.push('ACTION: "Let\'s walk through your code with nums=[2,7,11,15] and target=9"');
            return guidance;
        }

        return ['ACTION: Continue observing. Ask about their progress if they seem stuck.'];
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
