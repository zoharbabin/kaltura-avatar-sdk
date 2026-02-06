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
    VERSION: '1.2.0',

    // Kaltura Avatar SDK
    CLIENT_ID: '115767973963657880005',
    FLOW_ID: 'agent-16',

    // Call analysis API endpoint (same as HR demo)
    ANALYSIS_API_URL: 'https://itv5rhcn37.execute-api.us-west-2.amazonaws.com',

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

            // Session config
            mtg: {
                mins: 5
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
                // Progress tracking
                problem_number: this.currentProblemIndex + 1,
                total_problems: PROBLEM_ORDER.length,
                completed_count: this.completedProblems.length
            },

            // Next problem info (for avatar to offer transition)
            next_problem: hasNextProblem ? {
                id: nextProblem.id,
                title: nextProblem.title,
                difficulty: nextProblem.difficulty
            } : null
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
        avatarContainer: document.getElementById('avatar-container'),
        loadingState: document.getElementById('loading-state'),
        statusDot: document.getElementById('status-dot'),
        statusText: document.getElementById('status-text'),
        editorContainer: document.getElementById('editor-container'),
        languageSelect: document.getElementById('language-select'),
        runBtn: document.getElementById('run-btn'),
        resetBtn: document.getElementById('reset-btn'),
        nextProblemBtn: document.getElementById('next-problem-btn'),
        endSessionBtn: document.getElementById('end-session-btn'),
        outputContent: document.getElementById('output-content'),
        testResults: document.getElementById('test-results'),
        debugDpp: document.getElementById('debug-dpp'),
        problemTitle: document.getElementById('problem-title'),
        problemDifficulty: document.getElementById('problem-difficulty'),
        problemDescription: document.getElementById('problem-description')
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
    });

    state.sdk.on(KalturaAvatarSDK.Events.USER_TRANSCRIPTION, (data) => {
        const text = data?.userTranscription || data;
        console.log('User:', text);
    });

    state.sdk.on(KalturaAvatarSDK.Events.CONVERSATION_ENDED, () => {
        updateStatus('ended');
        stopCodeTracking();
        analyzeSession();
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

                // Show next problem button if all tests pass
                if (result.passed === result.total) {
                    showNextProblemButton();
                }
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
        return makeResult(0, testCases.length, 'Output: None\n\nYour function returned None. Did you forget to return a value?');
    }
    if (language === 'javascript' && !code.includes('return')) {
        return makeResult(0, testCases.length, 'Output: undefined\n\nYour function returned undefined. Did you forget to return a value?');
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

    if (hasHashMap) {
        return makeResult(testCases.length, testCases.length,
            'Output: [0, 1]\n\nAll test cases passed!\nYour solution uses a hash map approach - O(n) time complexity!');
    }
    if (hasNestedLoops) {
        return makeResult(testCases.length, testCases.length,
            'Output: [0, 1]\n\nAll test cases passed!\nNote: Your solution uses nested loops (O(n²)). Can you optimize it?');
    }
    if (hasLoop) {
        return makeResult(1, testCases.length,
            'Output: [0, 1]\n\nPartial success - 1 test case passed.\nConsider what happens with duplicate values.');
    }
    return makeResult(0, testCases.length, 'No test cases passed yet. Keep working on your solution!');
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
            'Output: True\n\nAll test cases passed!\n"amanaplanacanalpanama" is indeed a palindrome!');
    }
    if (hasStringClean || hasReverse) {
        return makeResult(2, testCases.length,
            'Output: True\n\nPartial success - 2 test cases passed.\nMake sure you handle non-alphanumeric characters and case.');
    }
    if (code.includes('==') || code.includes('return')) {
        return makeResult(1, testCases.length,
            'Output: False\n\nPartial success - 1 test case passed.\nRemember to clean the string first (remove non-alphanumeric, lowercase).');
    }
    return makeResult(0, testCases.length, 'No test cases passed yet. Keep working on your solution!');
}

function simulateReverseList(code, language, testCases) {
    const hasThreePointers = (code.includes('prev') && code.includes('curr')) ||
                            (code.includes('previous') && code.includes('current'));
    const hasNextSave = code.includes('next') || code.includes('temp');
    const hasRecursion = code.includes('reverse') && (code.includes('head.next') || code.includes('node.next'));

    if ((hasThreePointers && hasNextSave) || hasRecursion) {
        return makeResult(testCases.length, testCases.length,
            'Output: [5, 4, 3, 2, 1]\n\nAll test cases passed!\nGreat job reversing the linked list!');
    }
    if (hasThreePointers || hasNextSave) {
        return makeResult(1, testCases.length,
            'Output: [5, 4, 3, 2, 1]\n\nPartial success - 1 test case passed.\nCheck your pointer manipulation logic.');
    }
    if (code.includes('while') || code.includes('for')) {
        return makeResult(1, testCases.length,
            'Output: None\n\nPartial success - logic started.\nRemember to save the next node before changing pointers.');
    }
    return makeResult(0, testCases.length, 'No test cases passed yet. Think about how to reverse the pointers.');
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
                'Output: ["1","2","Fizz","4","Buzz",...,"FizzBuzz"]\n\nAll test cases passed!\nGreat implementation of FizzBuzz!');
        }
        return makeResult(2, testCases.length,
            'Output: ["1","2","Fizz","4","Buzz",...]\n\nPartial success - 2 test cases passed.\nCheck the order of your conditions - test for 15 (or 3 AND 5) first!');
    }
    if (hasModulo && (hasThreeCheck || hasFiveCheck)) {
        return makeResult(1, testCases.length,
            'Output: ["1","2","Fizz",...]\n\nPartial success - 1 test case passed.\nMake sure you handle Fizz, Buzz, AND FizzBuzz cases.');
    }
    return makeResult(0, testCases.length, 'No test cases passed yet. Use modulo (%) to check divisibility.');
}

// =============================================================================
// SESSION ANALYSIS
// =============================================================================

async function endSession() {
    if (!state.sdk) return;

    stopCodeTracking();
    updateStatus('analyzing...');
    showAnalyzingState();

    try {
        await state.sdk.stop();
    } catch (e) {
        console.log('SDK stop:', e.message);
    }

    await analyzeSession();
}

function showAnalyzingState() {
    ui.avatarContainer.innerHTML = `
        <div class="analyzing-state">
            <div class="spinner"></div>
            <p>Analyzing session...</p>
        </div>
    `;
}

async function analyzeSession() {
    if (!state.sdk) {
        console.log('No session to analyze');
        return;
    }

    const transcript = state.sdk.getTranscript();
    if (!transcript?.length) {
        console.log('Empty transcript, skipping analysis');
        showSessionSummary(null);
        return;
    }

    try {
        const dpp = state.buildDPP();

        // Format transcript for API
        const formattedTranscript = transcript.map(entry => ({
            role: entry.role === 'Avatar' ? 'assistant' : 'user',
            content: entry.text
        }));

        // Add coding-specific context
        const analysisContext = {
            ...dpp,
            analysis_type: 'coding_interview',
            final_code: state.editor?.getValue() || '',
            summary_prompt: 'Analyze this coding interview session. Evaluate problem-solving ability, code quality, communication, and efficiency awareness. Provide a fit score, strengths, areas for improvement, and hiring recommendation.'
        };

        const response = await fetch(CONFIG.ANALYSIS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                transcript: formattedTranscript,
                dpp: analysisContext
            })
        });

        const result = await response.json();

        if (result.success) {
            state.lastSessionSummary = result.summary;
            console.log('Session analysis complete:', state.lastSessionSummary);
            showSessionSummary(result.summary);
        } else {
            console.error('Analysis failed:', result.error);
            showSessionSummary(null);
        }
    } catch (error) {
        console.error('Failed to analyze session:', error);
        showSessionSummary(null);
    }
}

function showSessionSummary(summary) {
    let modal = document.getElementById('summary-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'summary-modal';
        modal.className = 'summary-modal';
        document.body.appendChild(modal);
    }

    if (!summary) {
        modal.innerHTML = `
            <div class="summary-modal-content">
                <div class="summary-header">
                    <h3>Session Complete</h3>
                    <button class="summary-close-btn" onclick="closeSummaryModal()">&times;</button>
                </div>
                <div class="summary-body">
                    <p>Session ended. Analysis not available.</p>
                </div>
                <div class="summary-footer">
                    <button class="btn btn-primary" onclick="closeSummaryModal()">Close</button>
                </div>
            </div>
        `;
        modal.style.display = 'flex';
        return;
    }

    const fitScore = summary.fit?.score_0_100;
    const fitClass = fitScore >= 70 ? 'good' : fitScore >= 50 ? 'ok' : 'poor';
    const rec = summary.fit?.rec || 'N/A';

    modal.innerHTML = `
        <div class="summary-modal-content">
            <div class="summary-header">
                <h3>Coding Session Summary</h3>
                <button class="summary-close-btn" onclick="closeSummaryModal()">&times;</button>
            </div>
            <div class="summary-body">
                <div class="summary-section">
                    <h4>Overview</h4>
                    <p>${escapeHtml(summary.overview || 'No overview available')}</p>
                </div>

                ${fitScore != null ? `
                <div class="summary-section">
                    <h4>Technical Fit</h4>
                    <div class="fit-score ${fitClass}">
                        <span class="score-value">${fitScore}</span>
                        <span class="score-label">/ 100</span>
                    </div>
                    <div class="recommendation">Recommendation: <strong>${rec.replace(/_/g, ' ')}</strong></div>
                    ${summary.skill_assessment ? `
                    <div class="skill-dims">
                        ${Object.entries(summary.skill_assessment).map(([key, val]) => `
                            <div class="dim">
                                <span class="dim-name">${escapeHtml(key.replace(/_/g, ' '))}</span>
                                <span class="dim-score">${val.score_1_5}/5</span>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
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
                    <ul class="gaps-list">
                        ${summary.gaps.map(g => `<li>${escapeHtml(typeof g === 'string' ? g : g.missing || '')}</li>`).join('')}
                    </ul>
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

                <div class="summary-section">
                    <h4>Session Quality</h4>
                    <div class="cq-badges">
                        <span class="badge">Emotion: ${escapeHtml(summary.cq?.emo || 'unknown')}</span>
                        <span class="badge">Tone: ${escapeHtml(summary.cq?.tone || 'unknown')}</span>
                        <span class="badge">Engagement: ${escapeHtml(summary.cq?.eng || 'unknown')}</span>
                        ${summary.cq?.think_aloud !== undefined ? `<span class="badge">Think Aloud: ${summary.cq.think_aloud ? 'Yes' : 'No'}</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="summary-footer">
                <button class="btn btn-secondary" onclick="downloadSessionSummary()">Download JSON</button>
                <button class="btn btn-primary" onclick="closeSummaryModal()">Close</button>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
}

function closeSummaryModal() {
    const modal = document.getElementById('summary-modal');
    if (modal) modal.style.display = 'none';
}

function downloadSessionSummary() {
    if (!state.lastSessionSummary) return;

    const blob = new Blob([JSON.stringify(state.lastSessionSummary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coding-session-${state.currentProblem.id}-${Date.now()}.json`;
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

    // Hide next problem button
    if (ui.nextProblemBtn) {
        ui.nextProblemBtn.style.display = 'none';
    }

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
 * Show the "Next Problem" button when problem is completed.
 */
function showNextProblemButton() {
    if (!ui.nextProblemBtn) return;

    const hasNext = state.currentProblemIndex + 1 < PROBLEM_ORDER.length;
    if (hasNext && state.problemCompleted) {
        ui.nextProblemBtn.style.display = 'inline-flex';
    }
}

// Make switchToNextProblem available globally for avatar integration
window.switchToNextProblem = switchToNextProblem;

// =============================================================================
// EVENT LISTENERS
// =============================================================================

function attachEventListeners() {
    ui.runBtn.addEventListener('click', runCode);
    ui.resetBtn.addEventListener('click', resetCode);
    ui.nextProblemBtn?.addEventListener('click', switchToNextProblem);
    ui.endSessionBtn?.addEventListener('click', endSession);
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

    await initMonaco();
    await startAvatar();
}

document.addEventListener('DOMContentLoaded', init);
