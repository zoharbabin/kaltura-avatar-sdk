/**
 * Kaltura HR Avatar Demo
 * Interview, Post-Interview, and Separation Scenario Player
 *
 * This demo showcases the Kaltura Avatar SDK for HR use cases:
 * - Interview: Initial candidate phone screens
 * - Post-Interview: Offer calls and rejection feedback
 * - Separation: Layoff, performance, and misconduct meetings
 *
 * Schema: Dynamic Page Prompt (DPP) v2
 * @see dynamic_page_prompt.schema.json
 */

// =============================================================================
// VERSION (update when scenarios change to bust browser cache)
// =============================================================================
const APP_VERSION = '1.0.2';

// =============================================================================
// PDF.js CONFIGURATION
// =============================================================================
// Set the worker source for PDF.js
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// =============================================================================
// SCENARIO CONFIGURATION
// =============================================================================
// Add new scenarios here. Each scenario needs:
// - id: Unique identifier (used for DOM data attributes)
// - name: Display name shown in the UI
// - description: Short description for the scenario card
// - file: Path to the DPP JSON file
// - company: Company name for the meta display
// - Additional fields vary by type (location/duration for interview, type for others)

const SCENARIOS = {
    /**
     * Interview scenarios - Initial candidate phone screens
     * Mode in DPP: "interview"
     */
    interview: [
        {
            id: 'interview_amazon_driver',
            name: 'Amazon Delivery Driver',
            description: 'Experienced delivery driver interview',
            file: 'dynamic_page_prompt_samples/interview_amazon_experienced-delivery-driver.json',
            company: 'Amazon',
            role: 'Delivery Driver',
            location: 'Lisbon, PT',
            duration: '5 min'
        },
        {
            id: 'interview_acme_dispatch',
            name: 'Acme Dispatch Coordinator',
            description: 'Dispatch coordinator phone screen',
            file: 'dynamic_page_prompt_samples/interview_acme_logistics-dispenser.json',
            company: 'Acme Logistics',
            role: 'Dispatch Coordinator',
            location: 'Porto, PT',
            duration: '5 min'
        },
        {
            id: 'interview_mcdonalds_crew',
            name: 'McDonald\'s Crew Member',
            description: 'Entry-level crew member interview',
            file: 'dynamic_page_prompt_samples/interview_mcdonalds_crew-worker-entry-level.json',
            company: 'McDonald\'s',
            role: 'Crew Member',
            location: 'Orlando, FL',
            duration: '5 min'
        }
    ],

    /**
     * Post-Interview scenarios - Follow-up outcome calls
     * Mode in DPP: "post_interview"
     * Types: Offer (job offer), Rejection (not selected)
     */
    postInterview: [
        {
            id: 'post_mcdonalds_offer',
            name: 'McDonald\'s Offer Call',
            description: 'Job offer and next steps',
            file: 'dynamic_page_prompt_samples/post-interview_mcdonalds_offer-call.json',
            company: 'McDonald\'s',
            role: 'Crew Member',
            type: 'Offer'
        },
        {
            id: 'post_mcdonalds_not_selected',
            name: 'McDonald\'s Not Selected',
            description: 'Candidate not selected feedback call',
            file: 'dynamic_page_prompt_samples/post-interview_mcdonalds_candidate_not_selected.json',
            company: 'McDonald\'s',
            role: 'Crew Member',
            type: 'Rejection'
        }
    ],

    /**
     * Separation scenarios - Employee termination meetings
     * Mode in DPP: "separation"
     * Types: Layoff, Performance, Misconduct
     */
    separation: [
        {
            id: 'separation_amazon_layoff',
            name: 'Amazon Layoff',
            description: 'Business restructure layoff',
            file: 'dynamic_page_prompt_samples/separation_redundancy_amazon_delivery-driver.json',
            company: 'Amazon',
            role: 'Delivery Driver',
            type: 'Layoff'
        },
        {
            id: 'separation_acme_misconduct',
            name: 'Acme Policy Violation',
            description: 'Termination for policy violation',
            file: 'dynamic_page_prompt_samples/separation_misconduct_acme-logistics_warehouse-associate.json',
            company: 'Acme Logistics',
            role: 'Warehouse Associate',
            type: 'Misconduct'
        },
        {
            id: 'separation_mcdonalds_attendance',
            name: 'McDonald\'s Attendance',
            description: 'Termination for attendance issues',
            file: 'dynamic_page_prompt_samples/separation_mcdonalds_performance-attendance.json',
            company: 'McDonald\'s',
            role: 'Crew Member',
            type: 'Performance'
        },
        {
            id: 'separation_mcdonalds_misconduct',
            name: 'McDonald\'s Policy Violation',
            description: 'Termination for policy violation',
            file: 'dynamic_page_prompt_samples/separation_mcdonalds_misconduct.json',
            company: 'McDonald\'s',
            role: 'Cashier',
            type: 'Misconduct'
        }
    ]
};

// =============================================================================
// APPLICATION STATE
// =============================================================================

let sdk = null;              // KalturaAvatarSDK instance
let currentScenario = null;  // Currently selected scenario metadata
let scenarioData = null;     // Loaded DPP JSON data
let cvText = null;           // Extracted CV text (null if no CV uploaded)

// =============================================================================
// DOM ELEMENTS
// =============================================================================

const ui = {
    // Main containers
    avatarContainer: document.getElementById('avatar-container'),
    emptyState: document.getElementById('empty-state'),
    scenarioDetails: document.getElementById('scenario-details'),

    // CV Upload
    cvUploadPanel: document.getElementById('cv-upload-panel'),
    cvUploadArea: document.getElementById('cv-upload-area'),
    cvFileInput: document.getElementById('cv-file-input'),
    cvStatus: document.getElementById('cv-status'),
    cvFilename: document.getElementById('cv-filename'),
    cvRemoveBtn: document.getElementById('cv-remove-btn'),
    startInterviewBtn: document.getElementById('start-interview-btn'),

    // Transcript
    transcriptContent: document.getElementById('transcript-content'),
    transcriptEmpty: document.getElementById('transcript-empty'),

    // Status display
    statusValue: document.getElementById('status-value'),
    scenarioValue: document.getElementById('scenario-value'),

    // Download buttons
    downloadBtn: document.getElementById('download-btn'),
    downloadMdBtn: document.getElementById('download-md-btn')
};

// =============================================================================
// SDK INITIALIZATION
// =============================================================================

/**
 * Initialize the Kaltura Avatar SDK with event handlers.
 * Configures the SDK for the HR avatar flow and sets up transcript recording.
 */
function initSDK() {
    sdk = new KalturaAvatarSDK({
        clientId: '115767973963657880005',  // HR Demo client
        flowId: 'agent-15',                  // Nora HR agent
        container: '#avatar-container'
    });

    // Track state changes for UI updates
    sdk.on('stateChange', ({ from, to }) => {
        updateStatus(to);
        updateButtons(to);
    });

    // Avatar speech -> add to transcript
    sdk.on(KalturaAvatarSDK.Events.AGENT_TALKED, (data) => {
        const text = data.agentContent || data;
        if (text && typeof text === 'string') {
            addTranscriptEntry('avatar', 'Nora (HR)', text);
        }
    });

    // User speech -> add to transcript
    sdk.on(KalturaAvatarSDK.Events.USER_TRANSCRIPTION, (data) => {
        const text = data.userTranscription || data;
        if (text && typeof text === 'string') {
            addTranscriptEntry('user', 'You', text);
        }
    });

    // Conversation ended -> prompt for download
    sdk.on(KalturaAvatarSDK.Events.CONVERSATION_ENDED, () => {
        showDownloadPrompt();
    });

    // Error handling
    sdk.on('error', ({ message }) => {
        console.error('SDK Error:', message);
        updateStatus('error');
    });
}

// =============================================================================
// SCENARIO RENDERING
// =============================================================================

/**
 * Render all scenario cards in the sidebar.
 * Populates the three category lists with clickable scenario cards.
 */
function renderScenarios() {
    // Interview scenarios
    const interviewList = document.getElementById('interview-list');
    interviewList.innerHTML = SCENARIOS.interview
        .map(s => createScenarioCard(s, 'interview'))
        .join('');

    // Post-Interview scenarios
    const postInterviewList = document.getElementById('post-interview-list');
    postInterviewList.innerHTML = SCENARIOS.postInterview
        .map(s => createScenarioCard(s, 'postInterview'))
        .join('');

    // Separation scenarios
    const separationList = document.getElementById('separation-list');
    separationList.innerHTML = SCENARIOS.separation
        .map(s => createScenarioCard(s, 'separation'))
        .join('');

    // Attach click handlers to all cards
    document.querySelectorAll('.scenario-card').forEach(card => {
        card.addEventListener('click', () => {
            selectScenario(card.dataset.id, card.dataset.type);
        });
    });
}

/**
 * Create HTML for a scenario card.
 * @param {Object} scenario - Scenario configuration object
 * @param {string} type - Category type: 'interview', 'postInterview', or 'separation'
 * @returns {string} HTML string for the card
 */
function createScenarioCard(scenario, type) {
    // Build metadata line based on type
    let meta = '';
    if (type === 'interview') {
        meta = `<span>${scenario.company}</span><span>${scenario.duration}</span>`;
    } else {
        meta = `<span>${scenario.company}</span><span>${scenario.type}</span>`;
    }

    // CSS class needs hyphen for post-interview
    const typeClass = type === 'postInterview' ? 'post-interview' : type;

    return `
        <div class="scenario-card ${typeClass}" data-id="${scenario.id}" data-type="${type}">
            <h3>${scenario.name}</h3>
            <p>${scenario.description}</p>
            <div class="meta">${meta}</div>
        </div>
    `;
}

// =============================================================================
// SCENARIO SELECTION
// =============================================================================

/**
 * Handle scenario selection.
 * Loads the DPP JSON, shows scenario details, and auto-starts the conversation.
 * If a conversation is active, prompts user to confirm switching.
 * @param {string} id - Scenario ID
 * @param {string} type - Category type
 */
async function selectScenario(id, type) {
    // Check if conversation is active and confirm switch
    if (sdk && sdk.getState() === 'in-conversation') {
        const confirmed = confirm('End the current conversation and start a new scenario?');
        if (!confirmed) {
            return; // User cancelled, don't switch
        }
        sdk.end();
    }

    // Update active state in UI
    document.querySelectorAll('.scenario-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-id="${id}"]`).classList.add('active');

    // Find scenario in the appropriate category
    const scenarioList = type === 'interview' ? SCENARIOS.interview
        : type === 'postInterview' ? SCENARIOS.postInterview
        : SCENARIOS.separation;

    currentScenario = scenarioList.find(s => s.id === id);

    // Load the DPP JSON file (with cache busting)
    try {
        const url = `${currentScenario.file}?v=${APP_VERSION}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        scenarioData = await response.json();

        showScenarioDetails();
        ui.scenarioValue.textContent = currentScenario.name;

        // For interview scenarios, wait for user to click Start (allows CV upload)
        // For other scenarios, auto-start the conversation
        if (scenarioData.mode !== 'interview') {
            await startConversation();
        }
    } catch (error) {
        console.error('Failed to load scenario:', error);
        ui.scenarioValue.textContent = 'Error loading scenario';
    }
}

/**
 * Display scenario details panel based on loaded DPP data.
 * Shows different fields based on the mode (interview, post_interview, separation).
 */
function showScenarioDetails() {
    if (!scenarioData) return;

    // Determine mode from DPP
    const mode = scenarioData.mode;
    const isInterview = mode === 'interview';
    const isPostInterview = mode === 'post_interview';
    const isSeparation = mode === 'separation';

    // Extract common fields from DPP v2 schema
    const subj = scenarioData.subj;  // Subject (candidate/employee)
    const role = scenarioData.role;  // Role details
    const org = scenarioData.org;    // Organization
    const mtg = scenarioData.mtg;    // Meeting config

    let html = `<h4>Scenario: ${currentScenario.name}</h4>`;

    if (isInterview) {
        // Interview: show candidate info, role, location, duration, focus areas
        html += `
            <div class="detail-row"><span class="label">Candidate:</span><span class="value">${subj?.name || 'N/A'}</span></div>
            <div class="detail-row"><span class="label">Role:</span><span class="value">${role?.t || 'N/A'}</span></div>
            <div class="detail-row"><span class="label">Company:</span><span class="value">${org?.n || 'N/A'}</span></div>
            <div class="detail-row"><span class="label">Location:</span><span class="value">${role?.loc || 'N/A'}</span></div>
            <div class="detail-row"><span class="label">Duration:</span><span class="value">${mtg?.mins || 5} minutes</span></div>
        `;
        if (mtg?.focus?.length) {
            html += `<div class="detail-row"><span class="label">Focus:</span><span class="value">${mtg.focus.join(', ')}</span></div>`;
        }
    } else if (isPostInterview) {
        // Post-Interview: show candidate, role, call type (offer vs feedback)
        const caseType = scenarioData.case?.type === 'Other'
            ? (scenarioData.case?.talk?.[0]?.toLowerCase().includes('offer') ? 'Offer Call' : 'Feedback Call')
            : scenarioData.case?.type;
        html += `
            <div class="detail-row"><span class="label">Candidate:</span><span class="value">${subj?.name || 'N/A'}</span></div>
            <div class="detail-row"><span class="label">Role:</span><span class="value">${role?.t || 'N/A'}</span></div>
            <div class="detail-row"><span class="label">Company:</span><span class="value">${org?.n || 'N/A'}</span></div>
            <div class="detail-row"><span class="label">Call Type:</span><span class="value">${caseType}</span></div>
            <div class="detail-row"><span class="label">Duration:</span><span class="value">${mtg?.mins || 5} minutes</span></div>
        `;
    } else if (isSeparation) {
        // Separation: show employee, type, effective date, immediate flag
        html += `
            <div class="detail-row"><span class="label">Employee:</span><span class="value">${subj?.name || 'N/A'}</span></div>
            <div class="detail-row"><span class="label">Role:</span><span class="value">${role?.t || 'N/A'}</span></div>
            <div class="detail-row"><span class="label">Company:</span><span class="value">${org?.n || 'N/A'}</span></div>
            <div class="detail-row"><span class="label">Type:</span><span class="value">${scenarioData.case?.type || 'N/A'}</span></div>
            <div class="detail-row"><span class="label">Effective:</span><span class="value">${scenarioData.case?.eff || 'N/A'}</span></div>
            <div class="detail-row"><span class="label">Immediate:</span><span class="value">${scenarioData.case?.imm ? 'Yes' : 'No'}</span></div>
        `;
    }

    ui.scenarioDetails.innerHTML = html;
    ui.scenarioDetails.style.display = 'block';

    // Set accent color based on mode
    const accentColors = {
        interview: 'var(--accent-interview)',
        post_interview: 'var(--accent-post-interview)',
        separation: 'var(--accent-separation)'
    };
    ui.scenarioDetails.style.borderLeftColor = accentColors[mode] || 'var(--accent-warm)';

    // Show CV upload panel only for interviews
    updateCVPanelVisibility(mode);
}

// =============================================================================
// CONVERSATION CONTROL
// =============================================================================

/**
 * Start the avatar conversation.
 * Initializes the SDK, clears previous transcript, and injects the DPP.
 */
async function startConversation() {
    if (!currentScenario || !scenarioData) return;

    // Reset transcript UI
    clearTranscriptUI();

    // Show avatar container
    ui.emptyState.style.display = 'none';
    ui.avatarContainer.classList.remove('empty');

    try {
        await sdk.start();

        // Inject the Dynamic Page Prompt after avatar loads
        // Small delay ensures the avatar is ready to receive the prompt
        // Uses buildDynamicPrompt() to include CV data if available
        setTimeout(() => {
            const promptJson = buildDynamicPrompt();
            sdk.injectPrompt(promptJson);
        }, 2000);
    } catch (error) {
        console.error('Failed to start conversation:', error);
        updateStatus('error');
    }
}

// =============================================================================
// UI STATE MANAGEMENT
// =============================================================================

/**
 * Update the status display.
 * @param {string} state - Current SDK state
 */
function updateStatus(state) {
    ui.statusValue.textContent = state;
    ui.statusValue.className = 'value';

    if (state === 'in-conversation') {
        ui.statusValue.classList.add('status-active');
    } else if (state === 'ended' || state === 'error') {
        ui.statusValue.classList.add('status-ended');
    }
}

/**
 * Update button enabled/disabled states.
 * @param {string} state - Current SDK state
 */
function updateButtons(state) {
    // Enable download buttons if transcript exists
    const hasTranscript = sdk && sdk.getTranscript().length > 0;
    ui.downloadBtn.disabled = !hasTranscript;
    ui.downloadMdBtn.disabled = !hasTranscript;
}

// =============================================================================
// TRANSCRIPT MANAGEMENT
// =============================================================================

/**
 * Add an entry to the transcript display.
 * @param {string} type - 'avatar' or 'user'
 * @param {string} role - Display name for the speaker
 * @param {string} text - The spoken text
 */
function addTranscriptEntry(type, role, text) {
    ui.transcriptEmpty.style.display = 'none';

    const entry = document.createElement('div');
    entry.className = `transcript-entry ${type}`;
    entry.innerHTML = `
        <div class="role">${escapeHtml(role)}</div>
        <div class="text">${escapeHtml(text)}</div>
        <div class="time">${new Date().toLocaleTimeString()}</div>
    `;

    ui.transcriptContent.appendChild(entry);
    ui.transcriptContent.scrollTop = ui.transcriptContent.scrollHeight;

    // Enable download buttons
    ui.downloadBtn.disabled = false;
    ui.downloadMdBtn.disabled = false;
}

/**
 * Clear the transcript display.
 */
function clearTranscriptUI() {
    ui.transcriptContent.innerHTML = '';
    ui.transcriptEmpty.style.display = 'block';
    ui.transcriptContent.appendChild(ui.transcriptEmpty);
}

/**
 * Highlight download button after conversation ends.
 */
function showDownloadPrompt() {
    if (!sdk || sdk.getTranscript().length === 0) return;

    ui.downloadBtn.classList.add('pulse');
    setTimeout(() => ui.downloadBtn.classList.remove('pulse'), 2000);
}

/**
 * Download the transcript in the specified format.
 * @param {string} format - 'text' or 'markdown'
 */
function downloadTranscript(format) {
    if (!sdk) return;

    const scenarioName = currentScenario?.name?.replace(/\s+/g, '-').toLowerCase() || 'session';
    const date = new Date().toISOString().slice(0, 10);
    const filename = `hr-transcript-${scenarioName}-${date}`;

    sdk.downloadTranscript({
        format: format,
        filename: `${filename}.${format === 'markdown' ? 'md' : 'txt'}`,
        includeTimestamps: true
    });
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Escape HTML entities to prevent XSS.
 * @param {string} text - Raw text
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// =============================================================================
// CV UPLOAD HANDLING
// =============================================================================

/**
 * Extract text from a PDF file using PDF.js
 * @param {File} file - PDF file object
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
    }

    return fullText.trim();
}

/**
 * Handle CV file selection
 * @param {File} file - Selected PDF file
 */
async function handleCVFile(file) {
    if (!file || file.type !== 'application/pdf') {
        alert('Please upload a PDF file.');
        return;
    }

    // Show processing state
    ui.cvUploadPanel.classList.add('processing');

    try {
        cvText = await extractTextFromPDF(file);

        // Update UI to show uploaded file
        ui.cvFilename.textContent = file.name;
        ui.cvStatus.style.display = 'flex';
        ui.cvUploadPanel.classList.add('has-cv');
        ui.cvUploadPanel.classList.remove('processing');

        console.log('CV extracted:', cvText.substring(0, 200) + '...');
    } catch (error) {
        console.error('Failed to extract CV text:', error);
        alert('Failed to read PDF. Please try another file.');
        ui.cvUploadPanel.classList.remove('processing');
        clearCV();
    }
}

/**
 * Clear the uploaded CV
 */
function clearCV() {
    cvText = null;
    ui.cvFileInput.value = '';
    ui.cvStatus.style.display = 'none';
    ui.cvUploadPanel.classList.remove('has-cv');
}

/**
 * Show or hide CV upload panel based on scenario type
 * @param {string} mode - Scenario mode
 */
function updateCVPanelVisibility(mode) {
    if (mode === 'interview') {
        ui.cvUploadPanel.style.display = 'block';
    } else {
        ui.cvUploadPanel.style.display = 'none';
        clearCV(); // Clear CV when switching away from interview
    }
}

/**
 * Build the dynamic prompt including CV if available
 * @returns {string} JSON string for prompt injection
 */
function buildDynamicPrompt() {
    if (!scenarioData) return null;

    // If no CV, return original scenario data
    if (!cvText) {
        return JSON.stringify(scenarioData);
    }

    // Clone scenario data and add CV information
    const promptData = JSON.parse(JSON.stringify(scenarioData));

    // Add CV text to the subject's profile notes
    if (!promptData.subj.prof) {
        promptData.subj.prof = {};
    }
    if (!promptData.subj.prof.notes) {
        promptData.subj.prof.notes = [];
    }

    // Add CV context instruction
    promptData.subj.prof.cv_summary = cvText;
    promptData.subj.prof.notes.push(
        'IMPORTANT: A CV/resume was provided. Review the cv_summary and ask relevant follow-up questions about their experience, skills, and background mentioned in the CV.'
    );

    // Add instruction to use CV
    if (!promptData.inst) {
        promptData.inst = [];
    }
    promptData.inst.push(
        'Reference specific details from the candidate\'s CV when asking questions. Ask about gaps, interesting projects, or skills mentioned.'
    );

    return JSON.stringify(promptData);
}

// =============================================================================
// EVENT LISTENERS
// =============================================================================

// CV file input change
ui.cvFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleCVFile(e.target.files[0]);
    }
});

// CV remove button
ui.cvRemoveBtn.addEventListener('click', clearCV);

// Start interview button
ui.startInterviewBtn.addEventListener('click', startConversation);

// Drag and drop for CV upload
ui.cvUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    ui.cvUploadArea.classList.add('dragover');
});

ui.cvUploadArea.addEventListener('dragleave', () => {
    ui.cvUploadArea.classList.remove('dragover');
});

ui.cvUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    ui.cvUploadArea.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
        handleCVFile(e.dataTransfer.files[0]);
    }
});

// Download buttons
ui.downloadBtn.addEventListener('click', () => downloadTranscript('text'));
ui.downloadMdBtn.addEventListener('click', () => downloadTranscript('markdown'));

// =============================================================================
// INITIALIZATION
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    renderScenarios();
    initSDK();
});
