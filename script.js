let manifest = {};
let studentDatabase = [];
let exerciseData = {};
let currentFile = "";
let currentUser = "";

// Settings and Mode Management
let appSettings = {
    mode: 'exam',
    timerMinutes: 30
};

let timerIntervalId = null;
let timeRemaining = 0;

window.onload = async function() {
    // Load manifest first — drives exercises, title, and highlighting
    try {
        const mRes = await fetch('manifest.json');
        if (!mRes.ok) throw new Error('manifest.json not found');
        manifest = await mRes.json();
        if (!manifest.language || !manifest.title || !Array.isArray(manifest.exercises)) {
            throw new Error('manifest.json missing required fields (language, title, exercises)');
        }
        document.title = manifest.title;
        const appTitleEl = document.getElementById('appTitle');
        if (appTitleEl) appTitleEl.textContent = manifest.title;
    } catch (err) {
        console.error('Manifest load error:', err);
        document.getElementById('loginError').textContent = 'Configuration error: manifest.json could not be loaded.';
        return;
    }

    // Load student database
    try {
        const res = await fetch('students.csv');
        const text = await res.text();
        const rows = text.split('\n').slice(1);
        studentDatabase = rows.map(row => {
            const [email, id] = row.split(',');
            return { email: email?.trim(), id: id?.trim() };
        });
    } catch (err) { console.error("Database failed to load."); }
};

function handleLogin() {
    const email = document.getElementById('emailInput').value.trim();
    const id = document.getElementById('studentNumInput').value.trim();
    const user = studentDatabase.find(s => s.email === email && s.id === id);

    if (user) {
        currentUser = email;
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('appContainer').style.display = 'flex';
        document.getElementById('userDisplay').textContent = email;
        loadAllExercises();

        if (appSettings.mode === 'exam') {
            startTimer();
        }
    } else {
        document.getElementById('loginError').textContent = "Invalid credentials.";
    }
}

async function loadAllExercises() {
    const list = document.getElementById('fileList');
    list.innerHTML = "";
    document.getElementById('loader').style.display = 'block';

    for (const fileName of manifest.exercises) {
        try {
            const res = await fetch('./exercises/' + fileName);
            const code = await res.text();
            exerciseData[fileName] = parseExercise(code);

            const li = document.createElement('li');
            const safeId = fileName.replace(/\./g, '-');
            li.id = `nav-${safeId}`;
            const totalPoints = exerciseData[fileName].totalPoints;

            li.innerHTML = `
                <span>${fileName.replace(/\.[^.]+$/, '')}</span>
                <span class="nav-score" id="score-${safeId}">0/${totalPoints}</span>
            `;

            li.onclick = () => switchExercise(fileName, li);
            list.appendChild(li);

            updateSidebarScore(fileName);
            updateSummaryPanel();
        } catch (e) { console.warn("Missing: " + fileName); }
    }
    document.getElementById('loader').style.display = 'none';
    if (list.firstChild) list.firstChild.click();

    document.getElementById('actionButton').addEventListener('click', () => {
        const ex = exerciseData[currentFile];
        if (!currentFile) return;
        if (ex && ex.locked) {
            resetCurrentExercise();
        } else {
            checkAnswers();
        }
    });
}

// --- Built-in syntax highlighting configs per language ---
const LANG_HIGHLIGHT = {
    'C': {
        types: ['int','char','float','double','void','long','short','unsigned','signed','const','static','struct','typedef','enum','union'],
        keywords: ['if','else','for','while','do','switch','case','break','continue','default','return'],
        extra: [{ pattern: /^(#\s*\w+.*)$/gm, cls: 'hl-prep' }]
    },
    'Java': {
        types: ['int','char','float','double','void','long','short','byte','boolean','String','final','static','abstract','enum'],
        keywords: ['if','else','for','while','do','switch','case','break','continue','default','return','class','public','private','protected','new','this','super','extends','implements','interface','try','catch','finally','throw','throws','import','package','instanceof','null','true','false'],
        extra: [{ pattern: /@\w+/g, cls: 'hl-prep' }]
    },
    'C++': {
        types: ['int','char','float','double','void','long','short','unsigned','signed','const','static','struct','typedef','enum','union','bool','auto','class','namespace','template','typename','virtual','override','nullptr_t','size_t','string','wchar_t'],
        keywords: ['if','else','for','while','do','switch','case','break','continue','default','return','new','delete','class','public','private','protected','using','namespace','try','catch','throw','this','nullptr','true','false','const_cast','static_cast','dynamic_cast','reinterpret_cast','explicit','friend','inline','mutable','noexcept','operator','sizeof','typeid','virtual'],
        extra: [{ pattern: /^(#\s*\w+.*)$/gm, cls: 'hl-prep' }]
    },
    'C#': {
        types: ['int','char','float','double','void','long','short','byte','bool','string','object','decimal','dynamic','var','uint','ulong','ushort','sbyte','nint','nuint'],
        keywords: ['if','else','for','while','do','switch','case','break','continue','default','return','class','public','private','protected','internal','new','this','base','static','const','readonly','abstract','sealed','partial','virtual','override','interface','enum','struct','namespace','using','try','catch','finally','throw','async','await','yield','in','out','ref','is','as','typeof','sizeof','delegate','event','get','set','null','true','false','foreach','lock','checked','unchecked'],
        extra: [{ pattern: /\[\w+(?:\([^)]*\))?\]/g, cls: 'hl-prep' }]
    },
    'JavaScript': {
        types: ['var','let','const','function','class','undefined'],
        keywords: ['if','else','for','while','do','switch','case','break','continue','default','return','new','this','typeof','instanceof','in','of','try','catch','finally','throw','import','export','from','async','await','yield','null','true','false','delete','void','with','debugger','extends','super','static','get','set'],
        extra: []
    }
};

function highlightCode(code) {
    const lang = LANG_HIGHLIGHT[manifest.language];
    const tokens = [];
    function tok(m, cls) {
        const i = tokens.length;
        tokens.push('<span class="' + cls + '">' + m + '</span>');
        return '\x00T' + i + 'T\x00';
    }

    // --- Universal C-family patterns ---
    // Single-line comments
    code = code.replace(/\/\/.*$/gm, function(m) { return tok(m, 'hl-comm'); });

    // Language-specific extra patterns (preprocessor, annotations, attributes)
    if (lang) {
        lang.extra.forEach(function(rule) {
            // Reset lastIndex for global regexes
            rule.pattern.lastIndex = 0;
            code = code.replace(rule.pattern, function(m) { return tok(m, rule.cls); });
        });
    }

    // String literals
    code = code.replace(/"(?:[^"\\]|\\.)*"/g, function(m) { return tok(m, 'hl-str'); });
    // Char literals
    code = code.replace(/'(?:[^'\\]|\\.)*'/g, function(m) { return tok(m, 'hl-str'); });
    // Numbers
    code = code.replace(/\b(\d+\.?\d*)\b/g, function(m) { return tok(m, 'hl-num'); });

    // Language-specific types and keywords (from built-in config)
    if (lang) {
        if (lang.types.length > 0) {
            const typeRe = new RegExp('\\b(' + lang.types.join('|') + ')\\b', 'g');
            code = code.replace(typeRe, function(m) { return tok(m, 'hl-type'); });
        }
        if (lang.keywords.length > 0) {
            const kwRe = new RegExp('\\b(' + lang.keywords.join('|') + ')\\b', 'g');
            code = code.replace(kwRe, function(m) { return tok(m, 'hl-kw'); });
        }
    }

    // Function/method calls
    code = code.replace(/\b([a-zA-Z_]\w*)\s*\(/g, function(m, name) { return tok(name, 'hl-fn') + '('; });
    // Restore tokens
    code = code.replace(/\x00T(\d+)T\x00/g, function(_, i) { return tokens[i]; });
    return code;
}

function parseExercise(raw) {
    // Extract the metadata comment block
    const metaMatch = raw.match(/^\/\*\s*\n([\s\S]*?)\*\//);
    let expectedOutput = '';
    const variables = []; // [{name, expectedValue}]

    if (metaMatch) {
        const metaBlock = metaMatch[1];
        // Parse @output
        const outputMatch = metaBlock.match(/@output\s*\n([\s\S]*?)(?=@variables|$)/);
        if (outputMatch) {
            expectedOutput = outputMatch[1].replace(/\n$/, ''); // trim only the structural trailing newline
        }
        // Parse @variables
        const varMatch = metaBlock.match(/@variables\s*\n([\s\S]*?)$/);
        if (varMatch) {
            const varLines = varMatch[1].trim().split('\n');
            varLines.forEach(line => {
                const eqIdx = line.indexOf('=');
                if (eqIdx !== -1) {
                    const name = line.substring(0, eqIdx).trim();
                    const rawValue = line.substring(eqIdx + 1).trim();
                    const arrayMatch = rawValue.match(/^\{(.*)\}$/);
                    if (arrayMatch) {
                        const elements = arrayMatch[1].split(',').map(e => e.trim());
                        variables.push({ name, expectedValue: rawValue, isArray: true, elements });
                    } else {
                        variables.push({ name, expectedValue: rawValue, isArray: false });
                    }
                }
            });
        }
    }

    // Strip the metadata comment from displayed code
    const sourceCode = raw.replace(/^\/\*\s*\n[\s\S]*?\*\/\s*\n?/, '');

    // HTML-encode the source for display with line numbers
    const encoded = sourceCode
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const highlighted = highlightCode(encoded);
    const lines = highlighted.split('\n');
    const numberedHtml = lines.map((line, idx) => {
        const lineNum = String(idx + 1).padStart(2, ' ');
        return `<span class="line-number">${lineNum}</span>${line}`;
    }).join('\n');

    const expectedLines = expectedOutput.split('\n');
    let varPoints = 0;
    variables.forEach(v => { varPoints += v.isArray ? v.elements.length : 1; });
    const totalPoints = expectedLines.length + varPoints;

    return {
        html: numberedHtml,
        expectedOutput,
        expectedLines,
        variables,
        userOutput: '',
        userVariables: variables.map(v => v.isArray ? v.elements.map(() => '') : ''),
        score: 0,
        totalPoints,
        locked: false,
        outputLineResults: expectedLines.map(() => false),
        variableResults: variables.map(v => v.isArray ? v.elements.map(() => false) : false)
    };
}

function updateSidebarScore(file) {
    const safeId = file.replace(/\./g, '-');
    const scoreSpan = document.getElementById(`score-${safeId}`);
    const ex = exerciseData[file];
    if (!scoreSpan || !ex) return;
    scoreSpan.textContent = `${ex.score}/${ex.totalPoints}`;

    scoreSpan.classList.remove('completed-score', 'partial-score');

    if (ex.score === ex.totalPoints) {
        scoreSpan.classList.add('completed-score');
    } else if (ex.score > 0) {
        scoreSpan.classList.add('partial-score');
    }
}

function updateSummaryPanel() {
    let totalGot = 0;
    let totalPossible = 0;
    for (const file in exerciseData) {
        const ex = exerciseData[file];
        totalGot += Number(ex.score || 0);
        totalPossible += ex.totalPoints;
    }
    document.getElementById('summaryValue').textContent = `${totalGot} / ${totalPossible}`;
}

function switchExercise(name, el) {
    // Save current exercise state before switching
    saveCurrentState();

    currentFile = name;
    document.querySelectorAll('.sidebar li').forEach(l => l.classList.remove('active'));
    el.classList.add('active');

    document.getElementById('currentFileName').textContent = name;
    const display = document.getElementById('codeDisplay');
    display.innerHTML = exerciseData[name].html;

    const ex = exerciseData[name];

    // Restore console output
    const consoleInput = document.getElementById('consoleInput');
    consoleInput.value = ex.userOutput;

    // Render variable inputs
    renderVariableInputs(ex);

    // Handle locked state
    if (ex.locked) {
        consoleInput.style.display = 'none';

        // Show per-line results
        const rawLocked = ex.userOutput.replace(/\r\n/g, '\n');
        let userLines;
        if (rawLocked.replace(/\s+$/, '') === '') {
            userLines = [];
        } else {
            userLines = rawLocked.split('\n');
            userLines = userLines.map(l => l.replace(/\s+$/, ''));
            if (userLines.length > ex.expectedLines.length && userLines[userLines.length - 1] === '') {
                userLines.pop();
            }
        }
        showConsoleResults(ex, userLines);

        // Variable inputs locked styling handled in renderVariableInputs
        document.querySelectorAll('.var-input').forEach(input => {
            const idx = parseInt(input.dataset.idx);
            const elIdx = input.dataset.el;
            input.disabled = true;
            input.classList.add('locked');
            let isCorrect;
            if (elIdx !== undefined) {
                isCorrect = ex.variableResults[idx][parseInt(elIdx)];
            } else {
                isCorrect = ex.variableResults[idx];
            }
            if (isCorrect) {
                input.classList.add('correct');
                input.classList.remove('incorrect');
            } else {
                input.classList.add('incorrect');
                input.classList.remove('correct');
            }
        });

        if (appSettings.mode === 'practice') {
            document.getElementById('actionButton').textContent = 'Reset';
            document.getElementById('actionButton').disabled = false;
        } else {
            document.getElementById('actionButton').textContent = 'Locked';
            document.getElementById('actionButton').disabled = true;
        }
    } else {
        consoleInput.style.display = '';
        consoleInput.disabled = false;
        document.getElementById('consoleResults').style.display = 'none';
        document.querySelectorAll('.var-input').forEach(input => {
            input.disabled = false;
            input.classList.remove('locked', 'correct', 'incorrect');
        });
        document.getElementById('actionButton').textContent = 'Verify Answer';
        document.getElementById('actionButton').disabled = false;
    }

    updateSidebarScore(name);
    updateSummaryPanel();
    document.getElementById('feedback').textContent = "";
}

function renderVariableInputs(ex) {
    const container = document.getElementById('variableInputs');
    container.innerHTML = '';

    if (ex.variables.length === 0) {
        container.innerHTML = '<p class="no-vars">No variables to track.</p>';
        return;
    }

    ex.variables.forEach((v, idx) => {
        if (v.isArray) {
            const block = document.createElement('div');
            block.className = 'array-block';
            const nameEl = document.createElement('div');
            nameEl.className = 'array-name';
            nameEl.textContent = v.name;
            block.appendChild(nameEl);
            const cellsRow = document.createElement('div');
            cellsRow.className = 'array-cells';
            const savedArr = Array.isArray(ex.userVariables[idx]) ? ex.userVariables[idx] : v.elements.map(() => '');
            v.elements.forEach((_, elIdx) => {
                const cell = document.createElement('div');
                cell.className = 'array-cell';
                cell.innerHTML = `
                    <input type="text" class="var-input array-el-input" data-idx="${idx}" data-el="${elIdx}" value="${savedArr[elIdx] || ''}" placeholder="?" spellcheck="false">
                    <span class="array-index">[${elIdx}]</span>
                `;
                cellsRow.appendChild(cell);
            });
            block.appendChild(cellsRow);
            container.appendChild(block);
        } else {
            const row = document.createElement('div');
            row.className = 'var-row';
            row.innerHTML = `
                <label class="var-label">${v.name}</label>
                <span class="var-equals">=</span>
                <input type="text" class="var-input" data-idx="${idx}" value="${ex.userVariables[idx] || ''}" placeholder="?" spellcheck="false">
            `;
            container.appendChild(row);
        }
    });
}

function saveCurrentState() {
    if (!currentFile || !exerciseData[currentFile]) return;
    const ex = exerciseData[currentFile];
    ex.userOutput = document.getElementById('consoleInput').value;
    document.querySelectorAll('.var-input').forEach(input => {
        const idx = parseInt(input.dataset.idx);
        const elIdx = input.dataset.el;
        if (elIdx !== undefined) {
            if (!Array.isArray(ex.userVariables[idx])) {
                ex.userVariables[idx] = ex.variables[idx].elements.map(() => '');
            }
            ex.userVariables[idx][parseInt(elIdx)] = input.value;
        } else {
            ex.userVariables[idx] = input.value;
        }
    });
}

function showConsoleResults(ex, userLines) {
    const container = document.getElementById('consoleResults');
    container.innerHTML = '';
    container.style.display = 'block';

    const maxLines = Math.max(ex.expectedLines.length, userLines.length);
    for (let i = 0; i < maxLines; i++) {
        const userLine = (userLines[i] || '');
        const expectedLine = ex.expectedLines[i];
        const isCorrect = ex.outputLineResults[i] === true;
        const isExtra = i >= ex.expectedLines.length;

        const row = document.createElement('div');
        row.className = `result-line ${isCorrect ? 'correct' : 'incorrect'}`;

        const marker = document.createElement('span');
        marker.className = 'result-marker';
        marker.textContent = isCorrect ? '✓' : '✗';

        const text = document.createElement('span');
        text.className = 'result-text';
        text.textContent = userLine || '(empty)';

        row.appendChild(marker);
        row.appendChild(text);

        container.appendChild(row);
    }
}

function checkAnswers() {
    if (!currentFile) return;
    saveCurrentState();

    const ex = exerciseData[currentFile];
    let score = 0;

    // Check console output line-by-line
    const consoleInput = document.getElementById('consoleInput');
    const rawOutput = ex.userOutput.replace(/\r\n/g, '\n');
    const expectedLines = ex.expectedLines;
    let userLines;
    if (rawOutput.replace(/\s+$/, '') === '') {
        userLines = [];
    } else {
        userLines = rawOutput.split('\n');
        // Trim trailing whitespace from each line individually
        userLines = userLines.map(l => l.replace(/\s+$/, ''));
        // Forgive one accidental trailing Enter — only if it creates extra lines
        if (userLines.length > expectedLines.length && userLines[userLines.length - 1] === '') {
            userLines.pop();
        }
    }

    let outputLinesCorrect = 0;
    const extraLines = Math.max(0, userLines.length - expectedLines.length);

    expectedLines.forEach((expected, idx) => {
        const expLine = expected.replace(/\s+$/, '');
        if (idx < userLines.length) {
            const userLine = userLines[idx].replace(/\s+$/, '');
            if (userLine === expLine) {
                ex.outputLineResults[idx] = true;
                outputLinesCorrect++;
            } else {
                ex.outputLineResults[idx] = false;
            }
        } else {
            ex.outputLineResults[idx] = false;
        }
    });
    score += Math.max(0, outputLinesCorrect - extraLines);

    // Show per-line results
    showConsoleResults(ex, userLines);

    // Check variable values
    document.querySelectorAll('.var-input').forEach(input => {
        const idx = parseInt(input.dataset.idx);
        const elIdx = input.dataset.el;
        const userVal = input.value.trim();
        const v = ex.variables[idx];

        if (v.isArray && elIdx !== undefined) {
            const ei = parseInt(elIdx);
            const expectedEl = v.elements[ei];
            if (userVal === expectedEl) {
                ex.variableResults[idx][ei] = true;
                score++;
                input.classList.add('correct');
                input.classList.remove('incorrect');
            } else {
                ex.variableResults[idx][ei] = false;
                input.classList.add('incorrect');
                input.classList.remove('correct');
            }
        } else if (!v.isArray) {
            if (userVal === v.expectedValue) {
                ex.variableResults[idx] = true;
                score++;
                input.classList.add('correct');
                input.classList.remove('incorrect');
            } else {
                ex.variableResults[idx] = false;
                input.classList.add('incorrect');
                input.classList.remove('correct');
            }
        }
        input.disabled = true;
        input.classList.add('locked');
    });

    consoleInput.style.display = 'none';

    ex.score = score;
    ex.locked = true;

    updateSidebarScore(currentFile);
    updateSummaryPanel();

    const msg = document.getElementById('feedback');
    if (score === ex.totalPoints) {
        msg.textContent = "✨ Perfect! All correct! ✨";
        msg.style.color = "var(--secondary)";
        triggerBigConfetti();
    } else {
        msg.textContent = `Score: ${score}/${ex.totalPoints} correct.`;
        msg.style.color = "var(--text-main)";
    }

    const actionBtn = document.getElementById('actionButton');
    if (appSettings.mode === 'exam') {
        actionBtn.textContent = 'Locked';
        actionBtn.disabled = true;

        if (checkIfAllAnswered()) {
            stopTimer();
            setTimeout(() => {
                showScoreSummaryModal('Congratulations! All exercises completed before time ran out!', 'success');
            }, 500);
        }
    } else {
        actionBtn.textContent = 'Reset';
    }
}

function resetCurrentExercise() {
    if (!currentFile) return;

    if (appSettings.mode === 'exam') {
        showAlertModal('Reset Not Allowed', 'Reset is not allowed in Exam Mode.');
        return;
    }

    const ex = exerciseData[currentFile];
    ex.userOutput = '';
    ex.userVariables = ex.variables.map(v => v.isArray ? v.elements.map(() => '') : '');
    ex.score = 0;
    ex.locked = false;
    ex.outputLineResults = ex.expectedLines.map(() => false);
    ex.variableResults = ex.variables.map(v => v.isArray ? v.elements.map(() => false) : false);

    const consoleInput = document.getElementById('consoleInput');
    consoleInput.value = '';
    consoleInput.style.display = '';
    consoleInput.disabled = false;
    const consoleResults = document.getElementById('consoleResults');
    consoleResults.style.display = 'none';
    consoleResults.innerHTML = '';

    renderVariableInputs(ex);

    updateSidebarScore(currentFile);
    updateSummaryPanel();

    document.getElementById('feedback').textContent = '';
    document.getElementById('actionButton').textContent = 'Verify Answer';
}

function triggerConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6200ee', '#03dac6', '#ffca28']
    });
}

function triggerBigConfetti() {
    const colors = ['#6200ee', '#03dac6', '#ffca28', '#ff4081', '#00bcd4'];
    const bursts = [
        { particleCount: 300, spread: 120, startVelocity: 40 },
        { particleCount: 200, spread: 140, startVelocity: 30 },
        { particleCount: 150, spread: 160, startVelocity: 20 }
    ];

    let delay = 0;
    bursts.forEach(b => {
        setTimeout(() => {
            confetti(Object.assign({}, b, { origin: { y: 0.6 }, colors }));
        }, delay);
        delay += 500;
    });
}

function exportProgress() {
    let csv = "Student,Exercise,Output,Variables,Score\n";
    for (const file in exerciseData) {
        const ex = exerciseData[file];
        let outputCorrect = 0;
        ex.outputLineResults.forEach(r => { if (r) outputCorrect++; });
        const outputStatus = `${outputCorrect}/${ex.expectedLines.length}`;
        let varCorrect = 0;
        let varTotal = 0;
        ex.variableResults.forEach((r, idx) => {
            if (Array.isArray(r)) {
                r.forEach(el => { if (el) varCorrect++; });
                varTotal += r.length;
            } else {
                if (r) varCorrect++;
                varTotal++;
            }
        });
        const varStatus = `${varCorrect}/${varTotal}`;
        csv += `${currentUser},${file},${outputStatus},${varStatus},${ex.score}/${ex.totalPoints}\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentUser}_results.csv`;
    a.click();
}

// --- SETTINGS AND MODE MANAGEMENT ---
function openSettingsModal() {
    document.getElementById('settingsModal').style.display = 'block';
    document.getElementById('settingsOverlay').style.display = 'block';
    
    // Set current settings in the modal
    document.querySelector(`input[name="mode"][value="${appSettings.mode}"]`).checked = true;
    document.getElementById('timerInput').value = appSettings.timerMinutes;
    
    // Show/hide timer section based on mode
    const timerSection = document.getElementById('timerSection');
    if (appSettings.mode === 'exam') {
        timerSection.style.display = 'block';
    } else {
        timerSection.style.display = 'none';
    }
}

function closeSettingsModal() {
    document.getElementById('settingsModal').style.display = 'none';
    document.getElementById('settingsOverlay').style.display = 'none';
}

function handleModeChange() {
    const selectedMode = document.querySelector('input[name="mode"]:checked').value;
    const timerSection = document.getElementById('timerSection');
    
    if (selectedMode === 'exam') {
        timerSection.style.display = 'block';
    } else {
        timerSection.style.display = 'none';
    }
}

function validateTimerInput(input) {
    let value = parseInt(input.value, 10);
    
    if (isNaN(value)) {
        input.classList.add('invalid');
        return false;
    }
    
    if (value < 1) {
        input.value = '1';
        input.classList.remove('invalid');
    } else if (value > 999) {
        input.value = '999';
        input.classList.remove('invalid');
    } else {
        input.classList.remove('invalid');
    }
    
    return true;
}

function saveSettings() {
    const selectedMode = document.querySelector('input[name="mode"]:checked').value;
    const timerInput = document.getElementById('timerInput');
    const timerValue = parseInt(timerInput.value, 10);
    
    // Validate timer input
    if (selectedMode === 'exam') {
        if (isNaN(timerValue) || timerValue < 1 || timerValue > 999) {
            alert('Please enter a valid timer value between 1 and 999 minutes.');
            return;
        }
        appSettings.timerMinutes = timerValue;
    }
    
    appSettings.mode = selectedMode;
    closeSettingsModal();
    
    // Show toast notification
    showNotification(`Settings saved! Mode: ${selectedMode === 'exam' ? 'Exam (' + timerValue + ' min)' : 'Practice'}`);
}

function showNotification(message) {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--primary);
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 2001;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Timer Management
function startTimer() {
    if (appSettings.mode !== 'exam') {
        return;
    }
    
    timeRemaining = appSettings.timerMinutes * 60; // Convert to seconds
    const timerContainer = document.getElementById('timerContainer');
    timerContainer.style.display = 'flex';
    
    updateTimerDisplay();
    
    timerIntervalId = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            clearInterval(timerIntervalId);
            handleTimerExpired();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timerDisplay').textContent = display;
    
    const timerDisplay = document.getElementById('timerDisplay');
    timerDisplay.classList.remove('warning', 'critical');
    
    if (timeRemaining <= 60) {
        timerDisplay.classList.add('critical');
    } else if (timeRemaining <= 300) {
        timerDisplay.classList.add('warning');
    }
}

function stopTimer() {
    if (timerIntervalId) {
        clearInterval(timerIntervalId);
        timerIntervalId = null;
    }
    const timerContainer = document.getElementById('timerContainer');
    timerContainer.style.display = 'none';
}

function handleTimerExpired() {
    stopTimer();
    
    // Lock all exercises
    for (const file in exerciseData) {
        if (!exerciseData[file].locked) {
            exerciseData[file].locked = true;
        }
    }
    // Lock current exercise inputs
    const consoleInput = document.getElementById('consoleInput');
    if (consoleInput) {
        consoleInput.disabled = true;
        consoleInput.classList.add('locked');
    }
    document.querySelectorAll('.var-input').forEach(input => {
        input.disabled = true;
        input.classList.add('locked');
    });
    document.getElementById('actionButton').disabled = true;
    
    // Show score summary modal
    showScoreSummaryModal('Time is up! Your exam session has ended.', 'warning');
}

// --- ALERT AND SCORE SUMMARY MODALS ---
function showAlertModal(title, message) {
    document.getElementById('alertTitle').textContent = title;
    document.getElementById('alertMessage').textContent = message;
    document.getElementById('alertModal').style.display = 'block';
    document.getElementById('alertOverlay').style.display = 'block';
}

function closeAlertModal() {
    document.getElementById('alertModal').style.display = 'none';
    document.getElementById('alertOverlay').style.display = 'none';
}

function calculateTotalScore() {
    let totalGot = 0;
    let totalPossible = 0;
    for (const file in exerciseData) {
        const ex = exerciseData[file];
        totalGot += Number(ex.score || 0);
        totalPossible += ex.totalPoints;
    }
    return { got: totalGot, possible: totalPossible };
}

function showScoreSummaryModal(completionMessage, messageType = 'success') {
    const { got, possible } = calculateTotalScore();
    
    document.getElementById('finalScore').textContent = got;
    document.getElementById('maxScore').textContent = possible;
    document.getElementById('summaryEmail').textContent = currentUser;
    
    const messageElement = document.getElementById('completionMessage');
    messageElement.textContent = completionMessage;
    messageElement.className = `completion-message ${messageType}`;
    
    document.getElementById('scoreSummaryModal').style.display = 'block';
    document.getElementById('scoreSummaryOverlay').style.display = 'block';
}

function closeSummaryModal() {
    document.getElementById('scoreSummaryModal').style.display = 'none';
    document.getElementById('scoreSummaryOverlay').style.display = 'none';
}

// Check if all exercises have been answered
function checkIfAllAnswered() {
    for (const file in exerciseData) {
        const ex = exerciseData[file];
        if (!ex.locked || ex.score === 0) {
            return false;
        }
    }
    return true;
}