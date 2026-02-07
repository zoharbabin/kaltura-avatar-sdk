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
    VERSION: '1.5.4',

    // Kaltura Avatar SDK
    CLIENT_ID: '115767973963657880005',
    FLOW_ID: 'agent-16',

    // Call analysis API endpoint (same as HR demo)
    ANALYSIS_API_URL: 'https://30vsmo8j0l.execute-api.us-west-2.amazonaws.com',

    // Summary prompt file path (loaded at runtime)
    SUMMARY_PROMPT_PATH: 'summary_prompt.txt',

    // Code context injection timing
    DEBOUNCE_MS: 200,         // Wait 200ms after typing stops
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
    },

    'valid-palindrome': {
        id: 'valid-palindrome',
        title: 'Valid Palindrome',
        difficulty: 'easy',
        description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string s, return true if it is a palindrome, or false otherwise.`,
        examples: [
            {
                input: 's = "A man, a plan, a canal: Panama"',
                output: 'true',
                explanation: '"amanaplanacanalpanama" is a palindrome.'
            }
        ],
        starterCode: {
            python: `def is_palindrome(s):
    # Your code here
    pass

# Test
print(is_palindrome("A man, a plan, a canal: Panama"))`,
            javascript: `function isPalindrome(s) {
    // Your code here

}

// Test
console.log(isPalindrome("A man, a plan, a canal: Panama"));`
        },
        testCases: [
            { input: ['A man, a plan, a canal: Panama'], expected: true },
            { input: ['race a car'], expected: false },
            { input: [' '], expected: true }
        ],
        hints: [
            'First, filter out non-alphanumeric characters and convert to lowercase',
            'Compare the string with its reverse',
            'You can also use two pointers from both ends'
        ],
        optimalComplexity: 'O(n) time, O(1) space with two pointers'
    },

    'reverse-linked-list': {
        id: 'reverse-linked-list',
        title: 'Reverse Linked List',
        difficulty: 'medium',
        description: `Given the head of a singly linked list, reverse the list, and return the reversed list.

Each node has a value and a next pointer to the following node (or null/None for the last node).`,
        examples: [
            {
                input: 'head = [1,2,3,4,5]',
                output: '[5,4,3,2,1]',
                explanation: 'The list is reversed.'
            }
        ],
        starterCode: {
            python: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head):
    # Your code here
    pass

# Test with: 1 -> 2 -> 3 -> 4 -> 5
head = ListNode(1, ListNode(2, ListNode(3, ListNode(4, ListNode(5)))))
result = reverse_list(head)
# Print result
vals = []
while result:
    vals.append(result.val)
    result = result.next
print(vals)`,
            javascript: `class ListNode {
    constructor(val = 0, next = null) {
        this.val = val;
        this.next = next;
    }
}

function reverseList(head) {
    // Your code here

}

// Test with: 1 -> 2 -> 3 -> 4 -> 5
const head = new ListNode(1, new ListNode(2, new ListNode(3, new ListNode(4, new ListNode(5)))));
const result = reverseList(head);
// Print result
const vals = [];
let curr = result;
while (curr) {
    vals.push(curr.val);
    curr = curr.next;
}
console.log(vals);`
        },
        testCases: [
            { input: [[1,2,3,4,5]], expected: [5,4,3,2,1] },
            { input: [[1,2]], expected: [2,1] },
            { input: [[]], expected: [] }
        ],
        hints: [
            'You need to change where each node points to',
            'Keep track of the previous node as you iterate',
            'Think about what happens to the head and tail'
        ],
        optimalComplexity: 'O(n) time, O(1) space'
    },

    'fizz-buzz': {
        id: 'fizz-buzz',
        title: 'Fizz Buzz',
        difficulty: 'easy',
        description: `Given an integer n, return a string array answer (1-indexed) where:

- answer[i] == "FizzBuzz" if i is divisible by 3 and 5.
- answer[i] == "Fizz" if i is divisible by 3.
- answer[i] == "Buzz" if i is divisible by 5.
- answer[i] == i (as a string) if none of the above conditions are true.`,
        examples: [
            {
                input: 'n = 15',
                output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]',
                explanation: 'Numbers divisible by 3 become "Fizz", by 5 become "Buzz", by both become "FizzBuzz".'
            }
        ],
        starterCode: {
            python: `def fizz_buzz(n):
    # Your code here
    pass

# Test
print(fizz_buzz(15))`,
            javascript: `function fizzBuzz(n) {
    // Your code here

}

// Test
console.log(fizzBuzz(15));`
        },
        testCases: [
            { input: [3], expected: ["1", "2", "Fizz"] },
            { input: [5], expected: ["1", "2", "Fizz", "4", "Buzz"] },
            { input: [15], expected: ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"] }
        ],
        hints: [
            'Loop through numbers 1 to n',
            'Check divisibility by 15 first (both 3 and 5), then by 3, then by 5',
            'Use the modulo operator (%) to check divisibility'
        ],
        optimalComplexity: 'O(n) time, O(n) space'
    }
};

// Problem sequence
const PROBLEM_ORDER = ['two-sum', 'valid-palindrome', 'reverse-linked-list', 'fizz-buzz'];

// =============================================================================
// APPLICATION STATE
// =============================================================================

const state = {
    // Current screen: 'opening' | 'interview' | 'end'
    currentScreen: 'opening',

    // User info (collected at registration)
    user: {
        firstName: '',
        lastName: '',
        email: ''
    },

    // SDK instance
    sdk: null,

    // Monaco editor instance
    editor: null,

    // Current problem tracking
    currentProblemIndex: 0,
    currentProblem: PROBLEMS['two-sum'],
    completedProblems: [],  // IDs of completed problems

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

    // Hints given (per problem)
    hintsGiven: 0,

    // Problem completion tracking
    problemCompleted: false,

    // Analysis results
    lastSessionSummary: null,

    // Custom summary prompt (loaded from file)
    summaryPrompt: null,

    // Session end guard (prevents duplicate end handling)
    isEndingSession: false,

    /**
     * Build the complete DPP object for injection.
     */
    buildDPP() {
        const code = this.editor?.getValue() || '';
        const starterCode = this.currentProblem.starterCode[this.language];
        const isStarterCode = code.trim() === starterCode.trim();
        const elapsedMins = this.sessionStartTime
            ? Math.floor((Date.now() - this.sessionStartTime) / 60000)
            : 0;
        const elapsedSecs = this.sessionStartTime
            ? Math.floor((Date.now() - this.sessionStartTime) / 1000)
            : 0;

        const phase = this.getCurrentPhase(code, isStarterCode, elapsedSecs);

        // Track if problem was just completed
        if (phase === 'COMPLETE' && !this.problemCompleted) {
            this.problemCompleted = true;
            // Add to completed list if not already there
            if (!this.completedProblems.includes(this.currentProblem.id)) {
                this.completedProblems.push(this.currentProblem.id);
            }
        }

        // Determine next problem
        const nextProblemIndex = this.currentProblemIndex + 1;
        const hasNextProblem = nextProblemIndex < PROBLEM_ORDER.length;
        const nextProblem = hasNextProblem ? PROBLEMS[PROBLEM_ORDER[nextProblemIndex]] : null;

        return {
            v: '2',
            mode: 'coding_challenge',

            // User info (for personalized interaction)
            user: {
                first_name: this.user.firstName,
                full_name: `${this.user.firstName} ${this.user.lastName}`.trim(),
                email: this.user.email
            },

            // Session config
            mtg: {
                mins: 10
            },

            // Problem being solved
            problem: {
                id: this.currentProblem.id,
                title: this.currentProblem.title,
                difficulty: this.currentProblem.difficulty,
                description: this.currentProblem.description,
                example: this.currentProblem.examples[0]?.input + ' → ' + this.currentProblem.examples[0]?.output,
                optimal_complexity: this.currentProblem.optimalComplexity
            },

            // Live code state (updates in real-time)
            live_code: {
                language: this.language,
                current_code: code,
                is_starter_code: isStarterCode,
                line_count: code.split('\n').length,
                code_observations: this.analyzeCode(code)
            },

            // Execution results (null until they click Run)
            last_execution: this.lastRunResult ? {
                tests_passed: this.lastRunResult.passed,
                tests_failed: this.lastRunResult.failed,
                total_tests: this.lastRunResult.total,
                error_message: this.lastRunResult.error,
                output: this.lastRunResult.output
            } : null,

            // Session timing and progress
            session: {
                elapsed_seconds: elapsedSecs,
                elapsed_minutes: elapsedMins,
                times_code_was_run: this.runCount,
                hints_given: this.hintsGiven,
                phase: phase,
                problem_completed: this.problemCompleted,
                // Progress: "Problem X of Y"
                current_problem: this.currentProblemIndex + 1,
                total_problems: PROBLEM_ORDER.length,
                // Pre-calculated - just read these directly
                is_last_problem: !hasNextProblem,
                action_when_done: hasNextProblem ? 'SWITCH' : 'END'
            },

            // Next problem info (for avatar to offer transition)
            next_problem: hasNextProblem ? {
                id: nextProblem.id,
                title: nextProblem.title,
                difficulty: nextProblem.difficulty
            } : null,

            // Clear instruction for the avatar - ONLY included when problem is COMPLETE
            instruction_on_complete: phase === 'COMPLETE'
                ? (hasNextProblem
                    ? `SWITCH: Problem completed! After verifying understanding, say "Switching to the next challenge now." to proceed to ${nextProblem.title}.`
                    : `END: Final problem completed! After verifying understanding, say "Ending the session now."`)
                : null
        };
    },

    /**
     * Determine current phase based on state.
     */
    getCurrentPhase(code, isStarterCode, elapsedSecs) {
        if (this.lastRunResult?.passed === this.lastRunResult?.total && this.lastRunResult?.total > 0) {
            return 'COMPLETE';
        }
        if (this.lastRunResult?.error) {
            return 'DEBUG';
        }
        if (this.lastRunResult?.passed > 0) {
            return 'PARTIAL';
        }
        if (this.lastRunResult && this.lastRunResult.passed === 0) {
            return 'WRONG_OUTPUT';
        }
        if (!isStarterCode) {
            return 'CODING';
        }
        if (isStarterCode && elapsedSecs < 60) {
            return 'START';
        }
        return 'STUCK';
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
    }
};

// =============================================================================
// UI ELEMENTS
// =============================================================================

let ui = {};

function initUI() {
    ui = {
        // Screens
        openingScreen: document.getElementById('opening-screen'),
        interviewScreen: document.getElementById('interview-screen'),
        endScreen: document.getElementById('end-screen'),

        // Registration form
        registrationForm: document.getElementById('registration-form'),
        firstNameInput: document.getElementById('first-name'),
        lastNameInput: document.getElementById('last-name'),
        emailInput: document.getElementById('email'),
        firstNameError: document.getElementById('first-name-error'),
        lastNameError: document.getElementById('last-name-error'),
        emailError: document.getElementById('email-error'),
        startBtn: document.getElementById('start-btn'),

        // Interview screen
        avatarContainer: document.getElementById('avatar-container'),
        loadingState: document.getElementById('loading-state'),
        statusDot: document.getElementById('status-dot'),
        statusText: document.getElementById('status-text'),
        userBadge: document.getElementById('user-badge'),
        editorContainer: document.getElementById('editor-container'),
        languageSelect: document.getElementById('language-select'),
        runBtn: document.getElementById('run-btn'),
        resetBtn: document.getElementById('reset-btn'),
        outputContent: document.getElementById('output-content'),
        testResults: document.getElementById('test-results'),
        debugDpp: document.getElementById('debug-dpp'),
        problemTitle: document.getElementById('problem-title'),
        problemDifficulty: document.getElementById('problem-difficulty'),
        problemDescription: document.getElementById('problem-description'),

        // End screen
        endUserName: document.getElementById('end-user-name'),
        reportContent: document.getElementById('report-content'),
        downloadReportBtn: document.getElementById('download-report-btn'),
        restartBtn: document.getElementById('restart-btn')
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

    state.sdk.on('stateChange', ({ from, to }) => {
        updateStatus(to);
    });

    state.sdk.on(KalturaAvatarSDK.Events.AGENT_TALKED, (data) => {
        const text = data?.agentContent || data;
        console.log(`${CONFIG.AVATAR_NAME}:`, text);

        // Check if avatar is suggesting to move to next problem
        if (typeof text === 'string') {
            checkForProblemSwitchTrigger(text);
        }
    });

    state.sdk.on(KalturaAvatarSDK.Events.USER_TRANSCRIPTION, (data) => {
        const text = data?.userTranscription || data;
        console.log('User:', text);
    });

    state.sdk.on(KalturaAvatarSDK.Events.CONVERSATION_ENDED, () => {
        console.log('SDK CONVERSATION_ENDED event received');
        handleSessionEnd();
    });

    state.sdk.on('error', ({ message }) => {
        console.error('SDK Error:', message);
        updateStatus('error');
    });
}

async function startAvatar() {
    try {
        updateStatus('connecting');
        await state.sdk.start();

        ui.loadingState.style.display = 'none';
        state.sessionStartTime = Date.now();

        setTimeout(() => {
            injectDPP('initial');
            startCodeTracking();
        }, 200);

    } catch (error) {
        console.error('Failed to start avatar:', error);
        updateStatus('error');
    }
}

// =============================================================================
// DPP INJECTION
// =============================================================================

function injectDPP(reason = 'update') {
    if (!state.sdk) return;

    const dpp = state.buildDPP();
    const json = JSON.stringify(dpp);

    state.sdk.injectPrompt(json);
    state.lastInjectedCode = dpp.live_code.current_code;
    state.lastInjectionTime = Date.now();

    if (ui.debugDpp) {
        ui.debugDpp.textContent = `// Injection reason: ${reason}\n// Time: ${new Date().toLocaleTimeString()}\n\n${JSON.stringify(dpp, null, 2)}`;
    }

    console.log(`[DPP] Injected (${reason}):`, {
        phase: dpp.session.phase,
        code_lines: dpp.live_code.line_count,
        elapsed_secs: dpp.session.elapsed_seconds
    });
}

// =============================================================================
// CODE CHANGE TRACKING
// =============================================================================

function onCodeChange() {
    if (state.debounceTimer) {
        clearTimeout(state.debounceTimer);
    }

    state.debounceTimer = setTimeout(() => {
        const currentCode = state.editor?.getValue() || '';
        if (currentCode !== state.lastInjectedCode) {
            injectDPP('code_change');
        }
    }, CONFIG.DEBOUNCE_MS);
}

function startCodeTracking() {
    stopCodeTracking();

    state.intervalTimer = setInterval(() => {
        const currentCode = state.editor?.getValue() || '';
        const timeSinceLastInjection = Date.now() - state.lastInjectionTime;

        if (currentCode !== state.lastInjectedCode && timeSinceLastInjection >= CONFIG.MAX_INTERVAL_MS) {
            injectDPP('interval');
        }
    }, CONFIG.MAX_INTERVAL_MS);
}

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

function runCode() {
    const code = state.editor.getValue();
    state.runCount++;

    ui.outputContent.textContent = 'Running...';
    ui.outputContent.className = 'output-content';
    ui.testResults.textContent = '';

    setTimeout(() => {
        try {
            const result = simulateExecution(code, state.language);
            state.lastRunResult = result;

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
 * DEMO MODE: Simulates code execution using pattern matching.
 *
 * This is NOT real code execution - it detects common patterns in the code
 * to simulate pass/fail results based on the current problem.
 * For production, replace with actual code execution via a sandboxed backend.
 */
function simulateExecution(code, language) {
    const testCases = state.currentProblem.testCases;
    const problemId = state.currentProblem.id;

    // Check for empty/placeholder code
    if (language === 'python' && code.includes('pass') && !code.includes('return')) {
        return makeResult(0, testCases.length, 'Output: None');
    }
    if (language === 'javascript' && !code.includes('return')) {
        return makeResult(0, testCases.length, 'Output: undefined');
    }

    // Problem-specific pattern matching
    switch (problemId) {
        case 'two-sum':
            return simulateTwoSum(code, language, testCases);
        case 'valid-palindrome':
            return simulatePalindrome(code, language, testCases);
        case 'reverse-linked-list':
            return simulateReverseList(code, language, testCases);
        case 'fizz-buzz':
            return simulateFizzBuzz(code, language, testCases);
        default:
            return makeResult(0, testCases.length, 'Unknown problem type.');
    }
}

function makeResult(passed, total, output, error = null) {
    return {
        timestamp: new Date().toISOString(),
        error: error,
        passed: passed,
        failed: total - passed,
        total: total,
        output: output
    };
}

function simulateTwoSum(code, language, testCases) {
    const hasHashMap = language === 'python'
        ? (code.includes('dict') || code.includes('{}') || code.includes('enumerate'))
        : (code.includes('Map') || code.includes('{}') || code.includes('Object'));
    const hasNestedLoops = code.match(/for.*for/s);
    const hasLoop = code.includes('for') || code.includes('while');

    if (hasHashMap || hasNestedLoops) {
        return makeResult(testCases.length, testCases.length,
            'Output: [0, 1]\n\nAll test cases passed!');
    }
    if (hasLoop) {
        return makeResult(1, testCases.length,
            'Output: [0, 1]\n\nPartial success - 1 test case passed.');
    }
    return makeResult(0, testCases.length, 'No output produced.');
}

function simulatePalindrome(code, language, testCases) {
    const hasStringClean = language === 'python'
        ? (code.includes('isalnum') || code.includes('lower'))
        : (code.includes('replace') || code.includes('toLowerCase') || code.includes('match'));
    const hasReverse = language === 'python'
        ? (code.includes('[::-1]') || code.includes('reversed'))
        : (code.includes('.reverse()') || code.includes('split') && code.includes('join'));
    const hasTwoPointer = code.includes('left') && code.includes('right') || code.includes('i]') && code.includes('j]');

    if ((hasStringClean && hasReverse) || (hasStringClean && hasTwoPointer)) {
        return makeResult(testCases.length, testCases.length,
            'Output: True\n\nAll test cases passed!');
    }
    if (hasStringClean || hasReverse) {
        return makeResult(2, testCases.length,
            'Output: True\n\nPartial success - 2 test cases passed.');
    }
    if (code.includes('==') || code.includes('return')) {
        return makeResult(1, testCases.length,
            'Output: False\n\nPartial success - 1 test case passed.');
    }
    return makeResult(0, testCases.length, 'No output produced.');
}

function simulateReverseList(code, language, testCases) {
    const hasThreePointers = (code.includes('prev') && code.includes('curr')) ||
                            (code.includes('previous') && code.includes('current'));
    const hasNextSave = code.includes('next') || code.includes('temp');
    const hasRecursion = code.includes('reverse') && (code.includes('head.next') || code.includes('node.next'));

    if ((hasThreePointers && hasNextSave) || hasRecursion) {
        return makeResult(testCases.length, testCases.length,
            'Output: [5, 4, 3, 2, 1]\n\nAll test cases passed!');
    }
    if (hasThreePointers || hasNextSave) {
        return makeResult(1, testCases.length,
            'Output: [5, 4, 3, 2, 1]\n\nPartial success - 1 test case passed.');
    }
    if (code.includes('while') || code.includes('for')) {
        return makeResult(1, testCases.length,
            'Output: None\n\nPartial success - 1 test case passed.');
    }
    return makeResult(0, testCases.length, 'No output produced.');
}

function simulateFizzBuzz(code, language, testCases) {
    const hasModulo = code.includes('%');
    const hasThreeCheck = code.includes('3');
    const hasFiveCheck = code.includes('5');
    const hasFifteenCheck = code.includes('15') || (code.includes('3') && code.includes('5') && code.match(/%\s*3.*%\s*5|%\s*5.*%\s*3/s));
    const hasFizzBuzz = code.includes('FizzBuzz') || code.includes('Fizz') && code.includes('Buzz');

    if (hasModulo && hasFizzBuzz && hasThreeCheck && hasFiveCheck) {
        if (hasFifteenCheck || code.includes('elif') || code.includes('else if')) {
            return makeResult(testCases.length, testCases.length,
                'Output: ["1","2","Fizz","4","Buzz",...,"FizzBuzz"]\n\nAll test cases passed!');
        }
        return makeResult(2, testCases.length,
            'Output: ["1","2","Fizz","4","Buzz",...]\n\nPartial success - 2 test cases passed.');
    }
    if (hasModulo && (hasThreeCheck || hasFiveCheck)) {
        return makeResult(1, testCases.length,
            'Output: ["1","2","Fizz",...]\n\nPartial success - 1 test case passed.');
    }
    return makeResult(0, testCases.length, 'No output produced.');
}

// =============================================================================
// SESSION ANALYSIS
// =============================================================================

/**
 * Handle session end - called by SDK event or trigger phrase detection.
 * Prevents duplicate processing if already ending.
 */
async function handleSessionEnd() {
    // Prevent duplicate calls
    if (state.isEndingSession || state.currentScreen === 'end') {
        console.log('Session end already in progress, ignoring');
        return;
    }
    state.isEndingSession = true;

    console.log('Handling session end...');

    if (!state.sdk) {
        state.isEndingSession = false;
        return;
    }

    stopCodeTracking();
    updateStatus('ending...');

    // IMPORTANT: Get transcript BEFORE stopping SDK (stop may clear it)
    const transcript = state.sdk.getTranscript();
    const dpp = state.buildDPP();

    console.log('Captured transcript with', transcript?.length || 0, 'entries');

    // Switch to end screen first (so user sees immediate feedback)
    switchScreen('end');

    // Update end screen header with user name
    if (ui.endUserName) {
        ui.endUserName.textContent = `Thank you, ${state.user.firstName}!`;
    }

    // Show analyzing state in report area
    if (ui.reportContent) {
        ui.reportContent.innerHTML = `
            <div class="analyzing-state">
                <div class="spinner"></div>
                <p>Analyzing your session...</p>
            </div>
        `;
    }

    // Hide download button until report is ready
    if (ui.downloadReportBtn) {
        ui.downloadReportBtn.style.display = 'none';
    }

    // Stop the avatar: end() removes the iframe and stops all audio
    try {
        state.sdk.end();
        console.log('SDK ended successfully');
    } catch (e) {
        console.log('SDK end error:', e.message);
    }

    // Analyze with the transcript we captured earlier
    await analyzeSessionWithData(transcript, dpp);

    state.isEndingSession = false;
}

async function analyzeSessionWithData(transcript, dpp) {
    if (!transcript?.length) {
        console.log('Empty transcript, skipping analysis');
        showSessionSummary(null);
        return;
    }

    console.log('Analyzing session with', transcript.length, 'transcript entries');

    try {
        // Format transcript for API
        const formattedTranscript = transcript.map(entry => ({
            role: entry.role === 'Avatar' ? 'assistant' : 'user',
            content: entry.text
        }));

        // Build list of all problems attempted during session
        const problemsAttemptedList = state.completedProblems.map(id => ({
            id: id,
            title: PROBLEMS[id]?.title || id,
            difficulty: PROBLEMS[id]?.difficulty || 'unknown'
        }));

        // Include current problem if not already in completed list
        if (!state.completedProblems.includes(state.currentProblem.id)) {
            problemsAttemptedList.push({
                id: state.currentProblem.id,
                title: state.currentProblem.title,
                difficulty: state.currentProblem.difficulty
            });
        }

        // Add coding-specific context with FULL session history
        const analysisContext = {
            ...dpp,
            analysis_type: 'coding_interview',
            // User info for the report
            candidate: {
                first_name: state.user.firstName,
                last_name: state.user.lastName,
                full_name: `${state.user.firstName} ${state.user.lastName}`.trim(),
                email: state.user.email
            },
            final_code: state.editor?.getValue() || '',
            // Explicitly list all problems for the summary to analyze
            all_problems_in_session: PROBLEM_ORDER.map(id => ({
                id: id,
                title: PROBLEMS[id].title,
                difficulty: PROBLEMS[id].difficulty
            })),
            problems_attempted_list: problemsAttemptedList,
            problems_completed_ids: state.completedProblems,
            total_problems_attempted: problemsAttemptedList.length,
            total_problems_completed: state.completedProblems.length,
            summary_prompt: `Analyze this coding interview session THOROUGHLY. The candidate (${state.user.firstName} ${state.user.lastName}) attempted ${problemsAttemptedList.length} problem(s): ${problemsAttemptedList.map(p => p.title).join(', ')}. For EACH problem attempted, provide detailed evaluation of creativity, logic, code quality, explainability, complexity understanding, and scale awareness. Review the entire transcript to extract specific evidence for each assessment. Provide comprehensive feedback, not minimal summaries.`
        };

        // Build request body - include custom summary_prompt if loaded
        const requestBody = {
            transcript: formattedTranscript,
            dpp: analysisContext
        };

        // If custom summary prompt was loaded, send it to override API default
        if (state.summaryPrompt) {
            requestBody.summary_prompt = state.summaryPrompt;
            console.log('Using custom summary prompt for detailed analysis');
        }

        const payload = JSON.stringify(requestBody);
        const MAX_RETRIES = 3;
        let lastError = null;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                if (attempt > 1) {
                    const delay = attempt * 5000; // 5s, 10s backoff
                    console.log(`Retry ${attempt}/${MAX_RETRIES} after ${delay / 1000}s...`);
                    if (ui.reportContent) {
                        ui.reportContent.innerHTML = `
                            <div class="analyzing-state">
                                <div class="spinner"></div>
                                <p>Analysis is taking longer than expected... retrying (${attempt}/${MAX_RETRIES})</p>
                            </div>
                        `;
                    }
                    await new Promise(r => setTimeout(r, delay));
                }

                const response = await fetch(CONFIG.ANALYSIS_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: payload
                });

                // Retry on 503 (API Gateway timeout) or 429 (throttle)
                if ((response.status === 503 || response.status === 429) && attempt < MAX_RETRIES) {
                    console.warn(`Analysis API returned ${response.status}, will retry...`);
                    lastError = `API returned ${response.status}`;
                    continue;
                }

                if (!response.ok) {
                    console.error(`Analysis API returned ${response.status}: ${response.statusText}`);
                    showSessionSummary(null, `API error: ${response.status} ${response.statusText}`);
                    return;
                }

                const result = await response.json();

                if (result.success) {
                    state.lastSessionSummary = result.summary;
                    console.log('Session analysis complete:', state.lastSessionSummary);
                    showSessionSummary(result.summary);
                } else {
                    console.error('Analysis failed:', result.error);
                    showSessionSummary(null, result.error);
                }
                return; // Success or non-retryable error — exit loop

            } catch (fetchError) {
                console.error(`Attempt ${attempt} failed:`, fetchError);
                lastError = fetchError.message;
                if (attempt === MAX_RETRIES) break;
            }
        }

        // All retries exhausted
        console.error('All analysis attempts failed:', lastError);
        const isCors = lastError?.includes('Failed to fetch');
        const detail = isCors
            ? 'CORS error — the analysis API is not reachable from this origin.'
            : `Analysis failed after ${MAX_RETRIES} attempts: ${lastError}`;
        showSessionSummary(null, detail);
    } catch (error) {
        console.error('Failed to analyze session:', error);
        showSessionSummary(null, error.message);
    }
}

function showSessionSummary(summary, errorDetail = null) {
    // Show download button
    if (ui.downloadReportBtn) {
        ui.downloadReportBtn.style.display = summary ? 'inline-flex' : 'none';
    }

    if (!summary) {
        if (ui.reportContent) {
            ui.reportContent.innerHTML = `
                <div class="report-empty">
                    <p>Session ended. Analysis not available.</p>
                    ${errorDetail ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">${escapeHtml(errorDetail)}</p>` : ''}
                </div>
            `;
        }
        return;
    }

    // Add user info to summary for download
    summary.candidate = {
        first_name: state.user.firstName,
        last_name: state.user.lastName,
        full_name: `${state.user.firstName} ${state.user.lastName}`.trim(),
        email: state.user.email
    };

    const fitScore = summary.fit?.score_0_100;
    const fitClass = fitScore >= 70 ? 'good' : fitScore >= 50 ? 'ok' : 'poor';
    const rec = summary.fit?.rec || 'N/A';

    if (!ui.reportContent) return;

    // Get initials for avatar
    const initials = `${state.user.firstName.charAt(0)}${state.user.lastName.charAt(0)}`.toUpperCase();

    ui.reportContent.innerHTML = `
        <div class="report-sections">
            <!-- Candidate Header -->
            <div class="candidate-header">
                <div class="candidate-avatar">${initials}</div>
                <div class="candidate-info">
                    <h3>${escapeHtml(state.user.firstName)} ${escapeHtml(state.user.lastName)}</h3>
                    <p>${escapeHtml(state.user.email)}</p>
                </div>
            </div>

            <div class="summary-section">
                <h4>Overview</h4>
                <p>${escapeHtml(summary.overview || 'No overview available')}</p>
            </div>

                ${summary.session_stats ? `
                <div class="summary-section">
                    <h4>Session Statistics</h4>
                    <div class="stats-grid">
                        <div class="stat-item"><span class="stat-label">Duration:</span> <span class="stat-value">${summary.session_stats.elapsed_minutes ?? '?'}/${summary.session_stats.target_minutes ?? '?'} min</span></div>
                        <div class="stat-item"><span class="stat-label">Code Runs:</span> <span class="stat-value">${summary.session_stats.times_code_run ?? '?'}</span></div>
                        <div class="stat-item"><span class="stat-label">Hints Given:</span> <span class="stat-value">${summary.session_stats.hints_given ?? '?'}</span></div>
                        <div class="stat-item"><span class="stat-label">Tests Passed:</span> <span class="stat-value">${summary.session_stats.tests_passed ?? '?'}/${summary.session_stats.tests_total ?? '?'}</span></div>
                        <div class="stat-item"><span class="stat-label">Problems Completed:</span> <span class="stat-value">${summary.session_stats.problems_completed ?? '?'}/${summary.session_stats.problems_total ?? '?'}</span></div>
                    </div>
                </div>
                ` : ''}

                ${summary.key_answers?.length ? `
                <div class="summary-section">
                    <h4>Key Questions & Answers (${summary.key_answers.length})</h4>
                    <div class="key-answers">
                        ${summary.key_answers.map((qa, idx) => `
                            <div class="qa-item ${qa.strength || ''}">
                                <div class="qa-question"><strong>Q${idx + 1}:</strong> ${escapeHtml(qa.q || '')}</div>
                                <div class="qa-answer"><strong>A:</strong> ${escapeHtml(qa.a || '')}</div>
                                <div class="qa-meta">
                                    <span class="qa-status ${qa.status || ''}">${escapeHtml((qa.status || '').replace(/_/g, ' '))}</span>
                                    <span class="qa-strength ${qa.strength || ''}">${escapeHtml(qa.strength || '')}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${summary.believability ? `
                <div class="summary-section">
                    <h4>Believability Assessment</h4>
                    <div class="believability-score">
                        <span class="score-value">${summary.believability.score_0_100 ?? '?'}</span>
                        <span class="score-label">/ 100</span>
                    </div>
                    <div class="believability-meta">
                        <span class="badge">CV Consistency: ${escapeHtml((summary.believability.cv_consistency || '').replace(/_/g, ' '))}</span>
                    </div>
                    ${summary.believability.notes ? `<p class="believability-notes">${escapeHtml(summary.believability.notes)}</p>` : ''}
                    ${summary.believability.mismatches?.length ? `
                    <div class="mismatches">
                        <strong>Mismatches:</strong>
                        <ul>${summary.believability.mismatches.map(m => `<li>${escapeHtml(m)}</li>`).join('')}</ul>
                    </div>
                    ` : ''}
                </div>
                ` : ''}

                ${summary.dpp_digest || summary.turns ? `
                <div class="summary-section">
                    <h4>Session Info</h4>
                    <div class="session-focus">
                        ${summary.dpp_digest?.mins ? `<div class="focus-item"><strong>Duration:</strong> ${summary.dpp_digest.mins} min</div>` : ''}
                        ${summary.turns ? `<div class="focus-item"><strong>Conversation Turns:</strong> ${summary.turns}</div>` : ''}
                        ${summary.dpp_digest?.focus?.length ? `<div class="focus-item"><strong>Topics:</strong> ${summary.dpp_digest.focus.join(', ')}</div>` : ''}
                        ${summary.dpp_digest?.must?.length ? `<div class="focus-item"><strong>Requirements:</strong> ${summary.dpp_digest.must.join(', ')}</div>` : ''}
                    </div>
                </div>
                ` : ''}

                ${summary.problems_attempted?.length ? `
                <div class="summary-section">
                    <h4>Problems Attempted (${summary.problems_attempted.length})</h4>
                    <div class="problems-attempted">
                        ${summary.problems_attempted.map((p, idx) => `
                            <div class="problem-card ${p.outcome || ''}">
                                <div class="problem-card-header">
                                    <span class="problem-number">#${idx + 1}</span>
                                    <span class="problem-name">${escapeHtml(p.problem_title || p.title || 'Unknown')}</span>
                                    <span class="difficulty-tag ${p.difficulty || ''}">${escapeHtml(p.difficulty || '?')}</span>
                                    <span class="outcome-tag ${p.outcome || ''}">${escapeHtml(p.outcome || '?')}</span>
                                </div>
                                <div class="problem-card-body">
                                    <div class="problem-stats">
                                        <span>Tests: ${p.tests_passed ?? '?'}/${p.tests_total ?? '?'}</span>
                                        <span>Time: ${p.time_spent_minutes ?? '?'}min</span>
                                        <span>Hints: ${p.hints_used ?? 0}</span>
                                    </div>
                                    <div class="problem-complexity">
                                        <span><strong>Time:</strong> ${escapeHtml(p.time_complexity || '?')}</span>
                                        <span><strong>Space:</strong> ${escapeHtml(p.space_complexity || '?')}</span>
                                    </div>
                                    ${p.approach_used ? `<div class="problem-approach"><strong>Approach:</strong> ${escapeHtml(p.approach_used)}</div>` : ''}

                                    ${p.evaluation ? `
                                    <div class="problem-eval-section">
                                        <div class="problem-eval-grid">
                                            <div class="eval-item">
                                                <span class="eval-label">Creativity</span>
                                                <span class="eval-score">${p.evaluation.creativity?.score_1_5 ?? '?'}/5</span>
                                            </div>
                                            <div class="eval-item">
                                                <span class="eval-label">Logic</span>
                                                <span class="eval-score">${p.evaluation.logic_soundness?.score_1_5 ?? '?'}/5</span>
                                            </div>
                                            <div class="eval-item">
                                                <span class="eval-label">Code Quality</span>
                                                <span class="eval-score">${p.evaluation.code_quality?.score_1_5 ?? '?'}/5</span>
                                            </div>
                                            <div class="eval-item">
                                                <span class="eval-label">Explainability</span>
                                                <span class="eval-score">${p.evaluation.explainability?.score_1_5 ?? '?'}/5</span>
                                            </div>
                                            <div class="eval-item">
                                                <span class="eval-label">Complexity</span>
                                                <span class="eval-score">${p.evaluation.complexity_understanding?.score_1_5 ?? '?'}/5</span>
                                            </div>
                                            <div class="eval-item">
                                                <span class="eval-label">Scale</span>
                                                <span class="eval-score">${p.evaluation.scale_awareness?.score_1_5 ?? '?'}/5</span>
                                            </div>
                                        </div>

                                        <div class="problem-eval-checks">
                                            <span class="${p.evaluation.explainability?.walked_through_code ? 'check-pass' : 'check-fail'}">Walkthrough: ${p.evaluation.explainability?.walked_through_code ? 'Yes' : 'No'}</span>
                                            <span class="${p.evaluation.complexity_understanding?.knew_time_complexity ? 'check-pass' : 'check-fail'}">Time Complexity: ${p.evaluation.complexity_understanding?.knew_time_complexity ? 'Correct' : 'No'}</span>
                                            <span class="${p.evaluation.complexity_understanding?.knew_space_complexity ? 'check-pass' : 'check-fail'}">Space Complexity: ${p.evaluation.complexity_understanding?.knew_space_complexity ? 'Correct' : 'No'}</span>
                                            <span class="${p.evaluation.scale_awareness?.discussed_large_inputs ? 'check-pass' : 'check-fail'}">Scale Discussion: ${p.evaluation.scale_awareness?.discussed_large_inputs ? 'Yes' : 'No'}</span>
                                        </div>

                                        <div class="problem-eval-notes">
                                            ${p.evaluation.creativity?.notes ? `<div class="eval-note"><strong>Creativity:</strong> ${escapeHtml(p.evaluation.creativity.notes)}</div>` : ''}
                                            ${p.evaluation.logic_soundness?.notes ? `<div class="eval-note"><strong>Logic:</strong> ${escapeHtml(p.evaluation.logic_soundness.notes)}</div>` : ''}
                                            ${p.evaluation.code_quality?.notes ? `<div class="eval-note"><strong>Code Quality:</strong> ${escapeHtml(p.evaluation.code_quality.notes)}</div>` : ''}
                                            ${p.evaluation.explainability?.notes ? `<div class="eval-note"><strong>Explainability:</strong> ${escapeHtml(p.evaluation.explainability.notes)}</div>` : ''}
                                            ${p.evaluation.complexity_understanding?.notes ? `<div class="eval-note"><strong>Complexity:</strong> ${escapeHtml(p.evaluation.complexity_understanding.notes)}</div>` : ''}
                                            ${p.evaluation.scale_awareness?.notes ? `<div class="eval-note"><strong>Scale:</strong> ${escapeHtml(p.evaluation.scale_awareness.notes)}</div>` : ''}
                                        </div>
                                    </div>
                                    ` : ''}

                                    ${p.key_strengths?.length ? `
                                    <div class="problem-strengths">
                                        <strong>Strengths:</strong>
                                        <ul>${p.key_strengths.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
                                    </div>
                                    ` : ''}
                                    ${p.areas_to_improve?.length ? `
                                    <div class="problem-improvements">
                                        <strong>Areas to Improve:</strong>
                                        <ul>${p.areas_to_improve.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
                                    </div>
                                    ` : ''}
                                    ${p.key_feedback ? `<div class="problem-feedback"><strong>Summary:</strong> ${escapeHtml(p.key_feedback)}</div>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${summary.solution_analysis ? `
                <div class="summary-section">
                    <h4>Solution Analysis</h4>
                    <div class="solution-overview">
                        <span class="solution-badge ${summary.solution_analysis.solved ? 'solved' : 'unsolved'}">${summary.solution_analysis.solved ? 'Solved' : 'Not Solved'}</span>
                        ${summary.solution_analysis.optimal ? '<span class="solution-badge optimal">Optimal</span>' : ''}
                        <span class="solution-badge approach">${escapeHtml((summary.solution_analysis.approach || '').replace(/_/g, ' '))}</span>
                    </div>
                    ${summary.solution_analysis.approach_description ? `<p class="approach-desc">${escapeHtml(summary.solution_analysis.approach_description)}</p>` : ''}
                    <div class="complexity-summary">
                        <span><strong>Time:</strong> ${escapeHtml(summary.solution_analysis.time_complexity || '?')}</span>
                        <span><strong>Space:</strong> ${escapeHtml(summary.solution_analysis.space_complexity || '?')}</span>
                    </div>
                </div>
                ` : ''}

                ${summary.solution_analysis?.walkthrough_quality ? `
                <div class="summary-section">
                    <h4>Code Explanation & Comprehension</h4>
                    <div class="comprehension-grid">
                        <div class="comprehension-item">
                            <span class="label">Walkthrough Provided:</span>
                            <span class="${summary.solution_analysis.walkthrough_quality.provided_walkthrough ? 'check-pass' : 'check-fail'}">${summary.solution_analysis.walkthrough_quality.provided_walkthrough ? 'Yes' : 'No'}</span>
                        </div>
                        <div class="comprehension-item">
                            <span class="label">Clarity:</span>
                            <span>${escapeHtml((summary.solution_analysis.walkthrough_quality.clarity || '').replace(/_/g, ' '))}</span>
                        </div>
                        <div class="comprehension-item">
                            <span class="label">Covered Key Logic:</span>
                            <span class="${summary.solution_analysis.walkthrough_quality.covered_key_logic ? 'check-pass' : 'check-fail'}">${summary.solution_analysis.walkthrough_quality.covered_key_logic ? 'Yes' : 'No'}</span>
                        </div>
                        <div class="comprehension-item">
                            <span class="label">Discussed Edge Cases:</span>
                            <span class="${summary.solution_analysis.walkthrough_quality.mentioned_edge_cases ? 'check-pass' : 'check-fail'}">${summary.solution_analysis.walkthrough_quality.mentioned_edge_cases ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                    ${summary.solution_analysis.walkthrough_quality.notes ? `<p class="comprehension-notes">${escapeHtml(summary.solution_analysis.walkthrough_quality.notes)}</p>` : ''}
                </div>
                ` : ''}

                ${summary.solution_analysis?.complexity_understanding ? `
                <div class="summary-section">
                    <h4>Complexity & Scale Understanding</h4>
                    <div class="comprehension-grid">
                        <div class="comprehension-item">
                            <span class="label">Time Complexity:</span>
                            <span class="${summary.solution_analysis.complexity_understanding.identified_time_complexity ? 'check-pass' : 'check-fail'}">${summary.solution_analysis.complexity_understanding.identified_time_complexity ? 'Correct' : 'Incorrect/Missing'}</span>
                        </div>
                        <div class="comprehension-item">
                            <span class="label">Space Complexity:</span>
                            <span class="${summary.solution_analysis.complexity_understanding.identified_space_complexity ? 'check-pass' : 'check-fail'}">${summary.solution_analysis.complexity_understanding.identified_space_complexity ? 'Correct' : 'Incorrect/Missing'}</span>
                        </div>
                        <div class="comprehension-item">
                            <span class="label">Explained Reasoning:</span>
                            <span class="${summary.solution_analysis.complexity_understanding.explained_reasoning ? 'check-pass' : 'check-fail'}">${summary.solution_analysis.complexity_understanding.explained_reasoning ? 'Yes' : 'No'}</span>
                        </div>
                        <div class="comprehension-item">
                            <span class="label">Understood Tradeoffs:</span>
                            <span class="${summary.solution_analysis.complexity_understanding.understood_tradeoffs ? 'check-pass' : 'check-fail'}">${summary.solution_analysis.complexity_understanding.understood_tradeoffs ? 'Yes' : 'No'}</span>
                        </div>
                        <div class="comprehension-item">
                            <span class="label">Scale Awareness:</span>
                            <span>${escapeHtml((summary.solution_analysis.complexity_understanding.scale_awareness || '').replace(/_/g, ' '))}</span>
                        </div>
                    </div>
                    ${summary.solution_analysis.complexity_understanding.notes ? `<p class="comprehension-notes">${escapeHtml(summary.solution_analysis.complexity_understanding.notes)}</p>` : ''}
                </div>
                ` : ''}

                ${summary.solution_analysis?.code_quality ? `
                <div class="summary-section">
                    <h4>Code Quality Assessment</h4>
                    <div class="comprehension-grid">
                        <div class="comprehension-item">
                            <span class="label">Overall:</span>
                            <span class="quality-${summary.solution_analysis.code_quality.overall || ''}">${escapeHtml((summary.solution_analysis.code_quality.overall || '').replace(/_/g, ' '))}</span>
                        </div>
                        <div class="comprehension-item">
                            <span class="label">Organization:</span>
                            <span>${escapeHtml((summary.solution_analysis.code_quality.organization || '').replace(/_/g, ' '))}</span>
                        </div>
                        <div class="comprehension-item">
                            <span class="label">Naming:</span>
                            <span>${escapeHtml((summary.solution_analysis.code_quality.naming || '').replace(/_/g, ' '))}</span>
                        </div>
                        <div class="comprehension-item">
                            <span class="label">Readability:</span>
                            <span>${escapeHtml((summary.solution_analysis.code_quality.readability || '').replace(/_/g, ' '))}</span>
                        </div>
                    </div>
                    ${summary.solution_analysis.code_observations?.length ? `
                    <div class="code-observations">
                        <strong>Code Observations:</strong>
                        <ul>${summary.solution_analysis.code_observations.map(o => `<li>${escapeHtml(o)}</li>`).join('')}</ul>
                    </div>
                    ` : ''}
                </div>
                ` : ''}

                ${summary.debugging_history?.length ? `
                <div class="summary-section">
                    <h4>Debugging History</h4>
                    <div class="debug-history">
                        ${summary.debugging_history.map(d => `
                            <div class="debug-entry ${d.resolved ? 'resolved' : 'unresolved'}">
                                <span class="debug-type">${escapeHtml(d.error_type || 'Error')}</span>
                                <span class="debug-desc">${escapeHtml(d.description || '')}</span>
                                <span class="${d.resolved ? 'check-pass' : 'check-fail'}">${d.resolved ? 'Resolved' : 'Unresolved'}</span>
                                ${d.hint_needed ? '<span class="hint-badge">Hint Needed</span>' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${fitScore != null ? `
                <div class="summary-section">
                    <h4>Technical Fit</h4>
                    <div class="fit-score ${fitClass}">
                        <span class="score-value">${fitScore}</span>
                        <span class="score-label">/ 100</span>
                    </div>
                    <div class="recommendation">Recommendation: <strong>${rec.replace(/_/g, ' ')}</strong></div>
                    ${summary.fit?.conf ? `<div class="confidence-badge">Confidence: ${escapeHtml(summary.fit.conf)}</div>` : ''}
                    ${summary.fit?.rationale ? `<p class="fit-rationale">${escapeHtml(summary.fit.rationale)}</p>` : ''}
                </div>
                ` : ''}

                ${summary.skill_assessment ? `
                <div class="summary-section">
                    <h4>Skill Assessment</h4>
                    <div class="skill-assessment-detail">
                        ${Object.entries(summary.skill_assessment).map(([key, val]) => `
                            <div class="skill-item">
                                <div class="skill-header">
                                    <span class="skill-name">${escapeHtml(key.replace(/_/g, ' '))}</span>
                                    <span class="skill-score">${val.score_1_5}/5</span>
                                </div>
                                ${val.evidence ? `<p class="skill-evidence">${escapeHtml(val.evidence)}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${summary.potential_assessment ? `
                <div class="summary-section">
                    <h4>Potential Assessment</h4>
                    <p class="potential-note">Evaluated independently of problem outcome</p>
                    <div class="potential-dims">
                        <div class="potential-dim">
                            <div class="potential-header">
                                <span class="potential-name">Creativity</span>
                                <span class="potential-score">${summary.potential_assessment.creativity?.score_1_5 || '?'}/5</span>
                            </div>
                            <p class="potential-analysis">${escapeHtml(summary.potential_assessment.creativity?.analysis || '')}</p>
                        </div>
                        <div class="potential-dim">
                            <div class="potential-header">
                                <span class="potential-name">Tenacity</span>
                                <span class="potential-score">${summary.potential_assessment.tenacity?.score_1_5 || '?'}/5</span>
                            </div>
                            <p class="potential-analysis">${escapeHtml(summary.potential_assessment.tenacity?.analysis || '')}</p>
                        </div>
                        <div class="potential-dim">
                            <div class="potential-header">
                                <span class="potential-name">Aptitude</span>
                                <span class="potential-score">${summary.potential_assessment.aptitude?.score_1_5 || '?'}/5</span>
                            </div>
                            <p class="potential-analysis">${escapeHtml(summary.potential_assessment.aptitude?.analysis || '')}</p>
                        </div>
                        <div class="potential-dim">
                            <div class="potential-header">
                                <span class="potential-name">Propensity</span>
                                <span class="potential-score">${summary.potential_assessment.propensity?.score_1_5 || '?'}/5</span>
                            </div>
                            <p class="potential-analysis">${escapeHtml(summary.potential_assessment.propensity?.analysis || '')}</p>
                        </div>
                    </div>
                    ${summary.potential_assessment.talent_indicators?.length ? `
                    <div class="talent-indicators">
                        <strong>Talent Indicators:</strong>
                        <ul>
                            ${summary.potential_assessment.talent_indicators.map(t => `<li>${escapeHtml(t)}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                    <div class="potential-meta">
                        <span class="badge potential-badge">${escapeHtml((summary.potential_assessment.potential_vs_performance || '').replace(/_/g, ' '))}</span>
                        <span class="badge growth-badge">Growth: ${escapeHtml((summary.potential_assessment.growth_trajectory || '').replace(/_/g, ' '))}</span>
                    </div>
                </div>
                ` : ''}

                ${summary.strengths?.length ? `
                <div class="summary-section">
                    <h4>Strengths</h4>
                    <ul class="strengths-list">
                        ${summary.strengths.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}

                ${summary.areas_for_improvement?.length ? `
                <div class="summary-section">
                    <h4>Areas for Improvement</h4>
                    <ul class="improvement-list">
                        ${summary.areas_for_improvement.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}

                ${summary.gaps?.length ? `
                <div class="summary-section">
                    <h4>Gaps & Follow-ups</h4>
                    <p class="section-note">Issues in attempted problem(s)</p>
                    <div class="gaps-detail">
                        ${summary.gaps.map(g => `
                            <div class="gap-item">
                                <div class="gap-missing"><strong>Gap:</strong> ${escapeHtml(typeof g === 'string' ? g : g.missing || '')}</div>
                                ${g.why_matters ? `<div class="gap-why"><strong>Why it matters:</strong> ${escapeHtml(g.why_matters)}</div>` : ''}
                                ${g.next_q ? `<div class="gap-followup"><strong>Follow-up:</strong> ${escapeHtml(g.next_q)}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${summary.remaining_problems?.length ? `
                <div class="summary-section">
                    <h4>Remaining Problems</h4>
                    <p class="section-note">Not attempted in this session</p>
                    <ul class="remaining-list">
                        ${summary.remaining_problems.map(p => `
                            <li>
                                <span class="problem-name">${escapeHtml(p.problem_title || '')}</span>
                                <span class="difficulty-tag ${p.difficulty || ''}">${escapeHtml(p.difficulty || '')}</span>
                                ${p.reason_not_attempted ? `<span class="reason-tag">${escapeHtml(p.reason_not_attempted.replace(/_/g, ' '))}</span>` : ''}
                            </li>
                        `).join('')}
                    </ul>
                </div>
                ` : ''}

                ${summary.next_steps?.length ? `
                <div class="summary-section">
                    <h4>Next Steps</h4>
                    <ul class="next-steps-list">
                        ${summary.next_steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}

                ${summary.risk && (summary.risk.escalated || (summary.risk.flags?.length && !summary.risk.flags.includes('none'))) ? `
                <div class="summary-section">
                    <h4>Risk Flags</h4>
                    <div class="risk-section ${summary.risk.escalated ? 'escalated' : ''}">
                        ${summary.risk.flags?.filter(f => f !== 'none').map(f => `<span class="risk-flag">${escapeHtml(f.replace(/_/g, ' '))}</span>`).join('') || ''}
                        ${summary.risk.escalated ? '<span class="risk-escalated">Escalation Required</span>' : ''}
                        ${summary.risk.reason ? `<p class="risk-reason">${escapeHtml(summary.risk.reason)}</p>` : ''}
                    </div>
                </div>
                ` : ''}

                <div class="summary-section">
                    <h4>Session Quality</h4>
                    <div class="cq-badges">
                        <span class="badge">Emotion: ${escapeHtml(summary.cq?.emo || 'unknown')}</span>
                        <span class="badge">Tone: ${escapeHtml(summary.cq?.tone || 'unknown')}</span>
                        <span class="badge">Engagement: ${escapeHtml(summary.cq?.eng || 'unknown')}</span>
                        ${summary.cq?.think_aloud !== undefined ? `<span class="badge">Think Aloud: ${summary.cq.think_aloud ? 'Yes' : 'No'}</span>` : ''}
                    </div>
                </div>

                <details class="summary-debug">
                    <summary>Debug: Raw JSON Response</summary>
                    <pre>${escapeHtml(JSON.stringify(summary, null, 2))}</pre>
                </details>
        </div>
    `;
}

function downloadSessionSummary() {
    if (!state.lastSessionSummary) return;

    // Include user info in the download
    const reportData = {
        ...state.lastSessionSummary,
        candidate: {
            first_name: state.user.firstName,
            last_name: state.user.lastName,
            full_name: `${state.user.firstName} ${state.user.lastName}`.trim(),
            email: state.user.email
        },
        generated_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Create filename with user name
    const safeName = `${state.user.firstName}-${state.user.lastName}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
    a.download = `coding-interview-${safeName}-${Date.now()}.json`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
        case 'analyzing...':
            ui.statusText.textContent = 'Analyzing...';
            break;
        case 'error':
            ui.statusDot.classList.add('error');
            ui.statusText.textContent = 'Connection error';
            break;
        default:
            ui.statusText.textContent = status;
    }
}

/**
 * Reset output panel and execution state to initial values.
 */
function resetOutputState() {
    state.lastRunResult = null;
    state.problemCompleted = false;
    ui.outputContent.textContent = 'Click "Run Code" to execute your solution...';
    ui.outputContent.className = 'output-content';
    ui.testResults.textContent = '';
}

function resetCode() {
    if (state.editor) {
        state.editor.setValue(state.currentProblem.starterCode[state.language]);
    }
    state.runCount = 0;
    resetOutputState();
    injectDPP('reset');
}

function onLanguageChange(newLanguage) {
    state.language = newLanguage;

    if (state.editor) {
        monaco.editor.setModelLanguage(state.editor.getModel(), newLanguage);
        state.editor.setValue(state.currentProblem.starterCode[newLanguage]);
    }

    resetOutputState();
    injectDPP('language_change');
}

/**
 * Switch to the next problem in the sequence.
 */
function switchToNextProblem() {
    const nextIndex = state.currentProblemIndex + 1;

    if (nextIndex >= PROBLEM_ORDER.length) {
        console.log('No more problems available');
        return false;
    }

    // Update problem state
    state.currentProblemIndex = nextIndex;
    state.currentProblem = PROBLEMS[PROBLEM_ORDER[nextIndex]];
    state.runCount = 0;
    state.hintsGiven = 0;

    // Update editor
    if (state.editor) {
        state.editor.setValue(state.currentProblem.starterCode[state.language]);
    }

    // Update UI
    updateProblemUI();
    resetOutputState();

    // Inject updated DPP
    injectDPP('problem_switch');

    console.log(`Switched to problem: ${state.currentProblem.title}`);
    return true;
}

/**
 * Update the problem display in the UI.
 */
function updateProblemUI() {
    const problem = state.currentProblem;

    if (ui.problemTitle) {
        ui.problemTitle.textContent = problem.title;
    }

    if (ui.problemDifficulty) {
        ui.problemDifficulty.textContent = problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1);
        ui.problemDifficulty.className = `difficulty ${problem.difficulty}`;
    }

    if (ui.problemDescription) {
        const example = problem.examples[0];
        ui.problemDescription.innerHTML = `
            <p>${escapeHtml(problem.description).replace(/\n/g, '</p><p>')}</p>
            <div class="example">
                <strong>Example:</strong>
                <pre>Input: ${escapeHtml(example.input)}
Output: ${escapeHtml(example.output)}
Explanation: ${escapeHtml(example.explanation)}</pre>
            </div>
        `;
    }
}

/**
 * Check if the avatar's speech contains action triggers.
 * - "switching to the next challenge now" → switch to next problem
 * - "ending the session now" → end session and show analysis
 */
function checkForProblemSwitchTrigger(text) {
    const lowerText = text.toLowerCase();

    // Trigger: switch to next problem
    if (lowerText.includes('switching to the next challenge now')) {
        const hasNext = state.currentProblemIndex + 1 < PROBLEM_ORDER.length;
        if (hasNext) {
            console.log('[Avatar] Switch trigger detected');
            setTimeout(() => {
                switchToNextProblem();
            }, 1500);
        }
        return;
    }

    // Trigger: end session
    if (lowerText.includes('ending the session now')) {
        console.log('[Avatar] End session trigger detected');
        setTimeout(() => {
            handleSessionEnd();
        }, 2000);
    }
}

// Make switchToNextProblem available globally for avatar integration
window.switchToNextProblem = switchToNextProblem;

// =============================================================================
// EVENT LISTENERS
// =============================================================================

function attachEventListeners() {
    // Registration form
    ui.registrationForm?.addEventListener('submit', handleRegistrationSubmit);

    // Input validation on blur
    ui.firstNameInput?.addEventListener('blur', () => validateField('firstName'));
    ui.lastNameInput?.addEventListener('blur', () => validateField('lastName'));
    ui.emailInput?.addEventListener('blur', () => validateField('email'));

    // Clear errors on input
    ui.firstNameInput?.addEventListener('input', () => clearFieldError('firstName'));
    ui.lastNameInput?.addEventListener('input', () => clearFieldError('lastName'));
    ui.emailInput?.addEventListener('input', () => clearFieldError('email'));

    // Interview controls
    ui.runBtn?.addEventListener('click', runCode);
    ui.resetBtn?.addEventListener('click', resetCode);
    ui.languageSelect?.addEventListener('change', (e) => {
        onLanguageChange(e.target.value);
    });

    // End screen
    ui.downloadReportBtn?.addEventListener('click', downloadSessionSummary);
    ui.restartBtn?.addEventListener('click', restartInterview);
}

// =============================================================================
// SCREEN TRANSITIONS
// =============================================================================

/**
 * Switch to a different screen (opening, interview, end).
 */
function switchScreen(screenName) {
    state.currentScreen = screenName;

    // Hide all screens
    ui.openingScreen.style.display = 'none';
    ui.interviewScreen.style.display = 'none';
    ui.endScreen.style.display = 'none';

    // Show the target screen
    switch (screenName) {
        case 'opening':
            ui.openingScreen.style.display = 'flex';
            break;
        case 'interview':
            ui.interviewScreen.style.display = 'flex';
            break;
        case 'end':
            ui.endScreen.style.display = 'flex';
            break;
    }

    console.log(`[Screen] Switched to: ${screenName}`);
}

// =============================================================================
// FORM VALIDATION
// =============================================================================

/**
 * Validate a single field.
 */
function validateField(fieldName) {
    let value, errorEl, inputEl, isValid = true, errorMessage = '';

    switch (fieldName) {
        case 'firstName':
            value = ui.firstNameInput.value.trim();
            errorEl = ui.firstNameError;
            inputEl = ui.firstNameInput;
            if (!value) {
                isValid = false;
                errorMessage = 'First name is required';
            } else if (value.length < 2) {
                isValid = false;
                errorMessage = 'First name must be at least 2 characters';
            } else if (!/^[a-zA-Z\s\-']+$/.test(value)) {
                isValid = false;
                errorMessage = 'First name can only contain letters, spaces, hyphens, and apostrophes';
            }
            break;

        case 'lastName':
            value = ui.lastNameInput.value.trim();
            errorEl = ui.lastNameError;
            inputEl = ui.lastNameInput;
            if (!value) {
                isValid = false;
                errorMessage = 'Last name is required';
            } else if (value.length < 2) {
                isValid = false;
                errorMessage = 'Last name must be at least 2 characters';
            } else if (!/^[a-zA-Z\s\-']+$/.test(value)) {
                isValid = false;
                errorMessage = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
            }
            break;

        case 'email':
            value = ui.emailInput.value.trim();
            errorEl = ui.emailError;
            inputEl = ui.emailInput;
            if (!value) {
                isValid = false;
                errorMessage = 'Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;
    }

    // Update UI
    if (errorEl) {
        errorEl.textContent = errorMessage;
    }
    if (inputEl) {
        inputEl.classList.toggle('invalid', !isValid);
    }

    return isValid;
}

/**
 * Clear error for a single field.
 */
function clearFieldError(fieldName) {
    let errorEl, inputEl;

    switch (fieldName) {
        case 'firstName':
            errorEl = ui.firstNameError;
            inputEl = ui.firstNameInput;
            break;
        case 'lastName':
            errorEl = ui.lastNameError;
            inputEl = ui.lastNameInput;
            break;
        case 'email':
            errorEl = ui.emailError;
            inputEl = ui.emailInput;
            break;
    }

    if (errorEl) {
        errorEl.textContent = '';
    }
    if (inputEl) {
        inputEl.classList.remove('invalid');
    }
}

/**
 * Validate all fields and return overall validity.
 */
function validateAllFields() {
    const isFirstNameValid = validateField('firstName');
    const isLastNameValid = validateField('lastName');
    const isEmailValid = validateField('email');

    return isFirstNameValid && isLastNameValid && isEmailValid;
}

/**
 * Handle registration form submission.
 */
function handleRegistrationSubmit(e) {
    e.preventDefault();

    if (!validateAllFields()) {
        return;
    }

    // Store user info
    state.user.firstName = ui.firstNameInput.value.trim();
    state.user.lastName = ui.lastNameInput.value.trim();
    state.user.email = ui.emailInput.value.trim();

    console.log('[Registration] User registered:', state.user);

    // Start the interview
    startInterview();
}

/**
 * Start the interview session.
 */
async function startInterview() {
    // Switch to interview screen
    switchScreen('interview');

    // Update user badge
    if (ui.userBadge) {
        ui.userBadge.textContent = `${state.user.firstName} ${state.user.lastName}`;
    }

    // Initialize Monaco editor if not already done
    if (!state.editor) {
        await initMonaco();
    }

    // Start the avatar
    await startAvatar();
}

/**
 * Restart the interview (from end screen).
 */
function restartInterview() {
    // Reset all state
    resetFullState();

    // Switch back to opening screen
    switchScreen('opening');

    // Clear form fields
    if (ui.firstNameInput) ui.firstNameInput.value = '';
    if (ui.lastNameInput) ui.lastNameInput.value = '';
    if (ui.emailInput) ui.emailInput.value = '';

    // Clear any validation errors
    clearFieldError('firstName');
    clearFieldError('lastName');
    clearFieldError('email');
}

/**
 * Reset all application state for a new session.
 */
function resetFullState() {
    // Stop any running timers
    stopCodeTracking();

    // Reset user
    state.user = { firstName: '', lastName: '', email: '' };

    // Destroy previous SDK instance (cleanup listeners, remove iframe)
    if (state.sdk) {
        try { state.sdk.destroy(); } catch (e) { /* ignore */ }
    }
    state.sdk = null;

    // Reset problem tracking
    state.currentProblemIndex = 0;
    state.currentProblem = PROBLEMS['two-sum'];
    state.completedProblems = [];

    // Reset language
    state.language = 'python';

    // Reset timing
    state.sessionStartTime = null;

    // Reset code injection
    state.lastInjectedCode = '';
    state.lastInjectionTime = 0;
    state.debounceTimer = null;
    state.intervalTimer = null;

    // Reset run results
    state.lastRunResult = null;
    state.runCount = 0;

    // Reset hints
    state.hintsGiven = 0;

    // Reset completion
    state.problemCompleted = false;

    // Reset analysis
    state.lastSessionSummary = null;

    // Reset session end guard
    state.isEndingSession = false;

    // Reset editor content if exists
    if (state.editor) {
        state.editor.setValue(state.currentProblem.starterCode[state.language]);
    }

    // Reset UI elements
    if (ui.outputContent) {
        ui.outputContent.textContent = 'Click "Run Code" to execute your solution...';
        ui.outputContent.className = 'output-content';
    }
    if (ui.testResults) {
        ui.testResults.textContent = '';
    }
    // Reset problem UI
    updateProblemUI();

    // Re-initialize SDK
    initSDK();

    console.log('[State] Full state reset');
}

// =============================================================================
// INITIALIZATION
// =============================================================================

async function init() {
    initUI();
    attachEventListeners();

    // Load custom summary prompt for detailed analysis
    await loadSummaryPrompt();

    // Show opening screen
    switchScreen('opening');

    // Pre-initialize SDK (but don't start yet)
    initSDK();
}

/**
 * Load the custom summary prompt from file.
 * This enables detailed code interview analysis with per-problem evaluations.
 */
async function loadSummaryPrompt() {
    try {
        const response = await fetch(CONFIG.SUMMARY_PROMPT_PATH);
        if (response.ok) {
            state.summaryPrompt = await response.text();
            console.log('Summary prompt loaded successfully');
        } else {
            console.warn('Could not load summary prompt, using API default');
        }
    } catch (error) {
        console.warn('Failed to load summary prompt:', error);
    }
}

document.addEventListener('DOMContentLoaded', init);
