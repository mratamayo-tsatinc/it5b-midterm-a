# Context for AI Maintainers — Simulate Output

**Last Updated:** March 27, 2026  
**Version:** 1.0

> **This is the ONLY documentation file for this project.** All context an AI agent or developer needs is here. When making code changes, update the relevant sections of this file.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Repository Structure](#2-repository-structure)
3. [Exercise File Format](#3-exercise-file-format)
4. [Architecture & Data Flow](#4-architecture--data-flow)
5. [Global State Variables](#5-global-state-variables)
6. [Complete Function Reference](#6-complete-function-reference)
7. [HTML Structure](#7-html-structure-indexhtml)
8. [CSS Architecture](#8-css-architecture-stylecss)
9. [Practice Mode vs Exam Mode](#9-practice-mode-vs-exam-mode)
10. [students.csv Format](#10-studentscsv-format)
11. [How to Add / Swap Exercises](#11-how-to-add--swap-exercises)
12. [Known Limitations & Security](#12-known-limitations--security)
13. [Troubleshooting](#13-troubleshooting)
14. [Recommended Improvements](#14-recommended-improvements)
15. [Running Locally](#15-running-locally)
16. [Conventions for AI Agents](#16-conventions-for-ai-agents)

---

## 1. Project Overview

| Field | Value |
|-------|-------|
| **App Name** | Simulate Output (title set by `manifest.json`) |
| **Purpose** | Browser-based, **language-agnostic** learning tool. Students view source code, predict the console output, and predict the final values of variables. |
| **Institution** | Tarlac School of Arts and Trade, Inc. (TSAT) |
| **Audience** | Students and instructors for in-class exams or self-study |
| **Type** | Single-page application (SPA) — no backend required |
| **Language** | HTML + vanilla JavaScript + CSS (no frameworks) |
| **Supported Languages** | C, Java, C++, C#, JavaScript (syntax highlighting built-in) |

**Key Trait — Language-Agnostic:**  
The app does NOT hardcode any programming language or topic. The `exercises/` folder and `manifest.json` are the only things that change per deployment. The same core app (`script.js`, `index.html`, `style.css`) works for any supported language — just swap the exercise files and update `manifest.json`.

**What Students Do:**
1. View read-only source code (with line numbers and syntax highlighting)
2. Type the expected console output into a textarea
3. Fill in the final values of tracked variables
4. Click "Verify Answer" to see per-line and per-variable results (✓/✗)

---

## 2. Repository Structure

```
├── index.html          # SPA shell & UI (~175 lines)
├── script.js           # Application logic (language-agnostic engine)
├── style.css           # Visual styles & layout (~908 lines)
├── manifest.json       # Language config + exercise file list (THE ONLY FILE TO EDIT PER DEPLOYMENT)
├── students.csv        # Student credentials (email, student_number)
├── Context.md          # THIS FILE — sole documentation
├── exercises/          # Exercise source files (any supported language)
│   └── *.*             # Any number of source files with @output/@variables metadata
```

**The `exercises/` folder and `manifest.json` are the only things that change per deployment.** The app itself is language-agnostic — it only cares about the `@output` / `@variables` metadata format inside each exercise file.

---

## 3. Exercise File Format

Every exercise file in `exercises/` must begin with a metadata comment block that `parseExercise()` uses to know the correct answers. The format is language-agnostic (uses `/* ... */` block comments, supported by all C-family languages):

```
/*
@output
<expected console output, line by line>
@variables
<varName> = <expectedFinalValue>
*/
<actual source code>
```

### Rules

- The metadata block **must be the very first thing** in the file — a `/* ... */` comment
- `@output` must come before `@variables`
- `@output` section: everything between `@output\n` and `@variables` (or end of block). Trailing newline is trimmed.
- `@variables` section: each line has format `name = value`, split on `=`
- The metadata block is **stripped from the displayed source code** — students never see it
- **Scoring:** 1 point per correct output line + 1 point per correct variable value. Extra user output lines beyond the expected count subtract from the output score.
- **File extension** can be anything (`.c`, `.java`, `.cpp`, `.cs`, `.js`) — the app uses the extension from the filename listed in `manifest.json`

### manifest.json Format

The `manifest.json` file in the project root controls the deployment. It has exactly three fields:

```json
{
    "language": "Java",
    "title": "Java - Simulate Output",
    "exercises": [
        "TaskAlpha.java",
        "TaskBravo.java"
    ]
}
```

To switch to a different language, update all three fields accordingly. For example, a C deployment:

```json
{
    "language": "C",
    "title": "C - Simulate Output",
    "exercises": [
        "1.c",
        "2.c"
    ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `language` | String | One of: `"C"`, `"Java"`, `"C++"`, `"C#"`, `"JavaScript"`. Selects syntax highlighting rules. If unrecognized, code displays without highlighting. |
| `title` | String | Sets the page `<title>` and login screen header (e.g., `"Java - Simulate Output"`). |
| `exercises` | Array of strings | Filenames of exercise files in the `exercises/` folder, in display order. |

### Examples

The metadata format is identical across all supported languages, since all C-family languages share `/* ... */` block comments.

**Java — single output line, one variable:**
```java
/*
@output
Hello
@variables
i = 4
*/
public class TaskAlpha {
    public static void main(String[] args) {
        int i = 0;
        do {
            System.out.println("Hello");
            i++;
        } while (i < 1);
        i = 4;
    }
}
```

**C — multi-line output with multiple variables:**
```c
/*
@output
1
2
3
4
5
@variables
i = 6
*/
#include <stdio.h>

int main() {
    int i = 1;
    do {
        printf("%d\n", i);
        i++;
    } while (i <= 5);
    return 0;
}
```

**JavaScript — inline output (space-separated on one line):**
```javascript
/*
@output
0 1 2 3 4 
@variables
i = 5
*/
let i = 0;
do {
    process.stdout.write(i + " ");
    i++;
} while (i < 5);
```

---

## 4. Architecture & Data Flow

### Initialization
1. `window.onload` fetches `manifest.json` first — validates required fields (`language`, `title`, `exercises`), sets page title and login header dynamically. If manifest fails, shows error on login screen and halts.
2. Then fetches `students.csv` via `fetch()`, parses it into `studentDatabase[]`
3. Login screen (`#loginOverlay`) is shown with optional settings gear icon (⚙️)

### Login
1. `handleLogin()` (line 49) matches email + student_number against `studentDatabase` (exact, case-sensitive, trimmed)
2. On success: hides `#loginOverlay`, shows `#appContainer`, calls `loadAllExercises()`
3. If Exam mode is active: `startTimer()` begins countdown

### Exercise Loading
1. `loadAllExercises()` iterates `manifest.exercises`, fetches each file from `exercises/`
2. Each file is parsed by `parseExercise(raw)` which extracts:
   - `expectedOutput` (full string), `expectedLines` (array of lines)
   - `variables` (array of `{name, expectedValue}`)
   - `html` (source code with line numbers, metadata comment stripped, HTML-encoded, and syntax-highlighted via `highlightCode()`)
   - Initializes: `userOutput`, `userVariables`, `score`, `totalPoints`, `locked`, `outputLineResults`, `variableResults`
3. Sidebar (`#fileList`) is populated with exercise names (file extension stripped generically) and score badges showing `0/N`
4. First exercise is auto-selected via click

### Exercise Interaction
1. `switchExercise(name, el)` (line 222) renders source code in `#codeDisplay`, restores user state
2. Student types predicted output into `#consoleInput` textarea
3. Student fills variable final values in `.var-input` fields
1. `saveCurrentState()` (line 309) preserves textarea + variable input values before switching exercises

### Verification
1. "Verify Answer" button click triggers `checkAnswers()` (line 348)
2. **Output comparison:** line-by-line match of user output vs `expectedLines`. Trailing whitespace stripped per line. Extra user lines beyond expected count penalize the score.
3. **Variable comparison:** exact string match (trimmed) of each `.var-input` value vs `expectedValue`
4. **Results display:** console panel hides textarea, shows `#consoleResults` with per-line ✓/✗ markers. Variable inputs get green (`.correct`) or red (`.incorrect`) borders.
5. Exercise locks (`locked = true`), all inputs disabled
6. **Practice mode:** button text becomes "Reset"
7. **Exam mode:** button text becomes "Locked" (disabled). If all exercises are now answered → timer stops, score summary modal shown with success message.

### Score Summary Modal (Exam Mode Only)
Two completion scenarios:
- **All completed early:** Timer stops, modal shows success message (teal), confetti plays
- **Timer expires:** All remaining exercises lock, modal shows warning message (orange)

Both show: large score circle (`X/Y`), student email, contextual message.

### Results Export
- `exportProgress()` (line 465) generates CSV with columns: `Student, Exercise, Output, Variables, Score`
- Output column: `correctLines/totalExpectedLines`
- Variables column: `correctVars/totalVars`
- Score column: `score/totalPoints`
- Triggers browser download as `{email}_results.csv`

---

## 5. Global State Variables

Defined at the top of `script.js`:

```javascript
let manifest = {};              // Loaded from manifest.json — {language, title, exercises}
let studentDatabase = [];       // Parsed from students.csv
let exerciseData = {};          // Per-file exercise state (keyed by filename)
let currentFile = "";           // Currently selected exercise filename
let currentUser = "";           // Logged-in student email

let appSettings = {
    mode: 'practice',           // 'practice' or 'exam'
    timerMinutes: 15            // default timer duration
};

let timerIntervalId = null;     // setInterval ID for timer
let timeRemaining = 0;          // seconds remaining
```

### LANG_HIGHLIGHT (Built-in Constant)

Syntax highlighting configurations for supported languages, defined as a constant object in `script.js`:

```javascript
const LANG_HIGHLIGHT = {
    'C':          { types: [...], keywords: [...], extra: [{ pattern, cls }] },
    'Java':       { types: [...], keywords: [...], extra: [{ pattern, cls }] },
    'C++':        { types: [...], keywords: [...], extra: [{ pattern, cls }] },
    'C#':         { types: [...], keywords: [...], extra: [{ pattern, cls }] },
    'JavaScript': { types: [...], keywords: [...], extra: [] }
};
```

This is **internal to the engine** and not user-configurable. The `manifest.language` field selects which config to use.

### Exercise Data Object Shape

Each `exerciseData[fileName]` has this structure (created by `parseExercise()`):

```javascript
{
    html: "...",                 // HTML string — source code with line numbers
    expectedOutput: "1\n2\n3",   // Full expected output string
    expectedLines: ["1","2","3"],// Expected output split by \n
    variables: [                 // Array of variable definitions
        { name: "i", expectedValue: "6" }
    ],
    userOutput: "",              // Student's typed output (textarea value)
    userVariables: [""],         // Student's variable answers (array of strings)
    score: 0,                   // Current score for this exercise
    totalPoints: 4,             // expectedLines.length + variables.length
    locked: false,              // Whether exercise has been verified (locked)
    outputLineResults: [false],  // Per-line boolean results
    variableResults: [false]     // Per-variable boolean results
}
```

---

## 6. Complete Function Reference

> Line numbers are from `script.js` as of March 2026. They may shift with edits — use function names for searching.

### Initialization & Authentication

| Function | Line | Purpose |
|----------|------|---------|
| `window.onload` | 16 | Fetch `manifest.json` (set title/header), then fetch `students.csv`, parse into `studentDatabase[]` |
| `handleLogin()` | 49 | Validate email + student_number, show app, start timer if exam mode |

### Exercise Management

| Function | Line | Purpose |
|----------|------|---------|
| `loadAllExercises()` | 67 | Fetch all exercise files listed in `manifest.exercises`, parse each, build sidebar list |
| `highlightCode(code)` | 137 | Apply syntax highlighting to HTML-encoded source code. Reads `manifest.language` to select from built-in `LANG_HIGHLIGHT` configs. Uses token-replacement to colorize keywords, types, functions, strings, numbers, language-specific extras (preprocessor/annotations/attributes), and comments. |
| `parseExercise(raw)` | 134 | Extract `@output`/`@variables` metadata, highlight source, generate line-numbered HTML, return exercise data object |
| `switchExercise(name, el)` | 222 | Render selected exercise, restore user state, handle locked/unlocked UI |
| `renderVariableInputs(ex)` | 288 | Create variable name + input rows in the variable panel |
| `saveCurrentState()` | 309 | Save current textarea + variable inputs into `exerciseData` before switching |
| `showConsoleResults(ex, userLines)` | 318 | Render per-line ✓/✗ result rows in the console results display |

### Scoring & Verification

| Function | Line | Purpose |
|----------|------|---------|
| `checkAnswers()` | 348 | Compare user output + variables vs expected, assign score, lock exercise, show results |
| `resetCurrentExercise()` | 430 | Clear all exercise state and re-enable inputs (Practice mode only) |
| `updateSidebarScore(file)` | 195 | Update sidebar score badge: gray (0), orange (partial), teal (perfect) |
| `updateSummaryPanel()` | 211 | Update "Total Points" display in sidebar bottom |
| `checkIfAllAnswered()` | 727 | Return `true` if every exercise is locked — used for exam early completion |
| `calculateTotalScore()` | 695 | Sum `score` and `totalPoints` across all exercises, return `{got, possible}` |

### Settings & Mode

| Function | Line | Purpose |
|----------|------|---------|
| `openSettingsModal()` | 510 | Show settings modal, populate with current `appSettings` values |
| `closeSettingsModal()` | 527 | Hide settings modal and overlay |
| `handleModeChange()` | 532 | Show/hide timer input section based on selected mode radio |
| `validateTimerInput(input)` | 543 | Validate timer input is 1–999 minutes, add/remove `.invalid` class |
| `saveSettings()` | 564 | Save mode + timer to `appSettings`, show toast notification |

### Timer

| Function | Line | Purpose |
|----------|------|---------|
| `startTimer()` | 610 | Convert minutes to seconds, show timer container, start `setInterval` countdown |
| `updateTimerDisplay()` | 632 | Update `MM:SS` text, apply `.warning` (≤5 min) or `.critical` (≤1 min) class |
| `stopTimer()` | 648 | Clear interval, hide timer container |
| `handleTimerExpired()` | 657 | Lock all unlocked exercises, disable current inputs, show score summary with warning |

### Modals & Notifications

| Function | Line | Purpose |
|----------|------|---------|
| `showAlertModal(title, message)` | 683 | Show alert modal (e.g., "Reset is not allowed in Exam Mode") |
| `closeAlertModal()` | 690 | Hide alert modal and overlay |
| `showScoreSummaryModal(msg, type)` | 706 | Show exam completion modal with score circle, email, contextual message |
| `closeSummaryModal()` | 721 | Hide score summary modal and overlay |
| `showNotification(message)` | 585 | Show temporary toast notification (bottom-right, auto-dismiss 3s) |

### Utilities

| Function | Line | Purpose |
|----------|------|---------|
| `triggerConfetti()` | 463 | Small confetti burst (100 particles) |
| `triggerBigConfetti()` | 472 | Multi-burst celebration: 3 waves of confetti (perfect score) |
| `exportProgress()` | 489 | Generate results CSV and trigger browser download |

---

## 7. HTML Structure (index.html)

### ASCII Wireframes

**Screen 1 — Login Overlay** (full-screen, centered card)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                                                                  │
│              ┌────────────────────────────────┐                  │
│              │ Simulate Output              ⚙️ │                  │
│              ├────────────────────────────────┤                  │
│              │ Enter your credentials to      │                  │
│              │ access the exercises.          │                  │
│              │                                │                  │
│              │ ┌────────────────────────────┐ │                  │
│              │ │ School Email               │ │                  │
│              │ └────────────────────────────┘ │                  │
│              │ ┌────────────────────────────┐ │                  │
│              │ │ Student Number             │ │                  │
│              │ └────────────────────────────┘ │                  │
│              │                                │                  │
│              │ ┌────────────────────────────┐ │                  │
│              │ │          Login             │ │                  │
│              │ └────────────────────────────┘ │                  │
│              │                                │                  │
│              └────────────────────────────────┘                  │
│                                                                  │
│                       #loginOverlay                              │
└──────────────────────────────────────────────────────────────────┘
```

**Screen 2 — Settings Modal** (opened via ⚙️ gear icon on login card)

```
              ┌──────────────────────────────┐
              │ Settings                   × │
              ├──────────────────────────────┤
              │                              │
              │  Mode                        │
              │  ○ Practice Mode             │
              │  ● Exam Mode                 │
              │                              │
              │  Timer (minutes)             │
              │  ┌──────────┐                │
              │  │ 15       │                │
              │  └──────────┘                │
              │  Enter 1–999 minutes         │
              │                              │
              ├──────────────────────────────┤
              │          Cancel     Save     │
              └──────────────────────────────┘
```

**Screen 3 — Main App Layout** (after login, sidebar + content)

```
┌───────────────────────────────────────────────────────────────────────────┐
│ ┌───────────────┐ ┌───────────────────────────────────────────────────┐  │
│ │ Logged in as: │ │                        ┌───────────────────────┐  │  │
│ │ student@...   │ │                        │ Time: 14:30           │  │  │
│ ├───────────────┤ │                        └───────────────────────┘  │  │
│ │ Exercises     │ │  #timerContainer (Exam mode only, fixed top-right)│  │
│ │               │ │                                                   │  │
│ │ ► 1      [0/5]│ │  TaskAlpha                                        │  │
│ │   2      [0/3]│ │  Study the source code, then predict its output   │  │
│ │   3      [3/4]│ │  and final variable values.                       │  │
│ │   4      [0/6]│ │                                                   │  │
│ │   5      [0/4]│ │  ┌───────────────────────────────────────────┐    │  │
│ │   ...        │ │  │ Source Code                                │    │  │
│ │               │ │  ├───────────────────────────────────────────┤    │  │
│ │               │ │  │  1 │ public class TaskAlpha {              │    │  │
│ │               │ │  │  2 │   public static void main(String[])  │    │  │
│ │               │ │  │  3 │     int i = 0;                      │    │  │
│ │               │ │  │  4 │     do {                            │    │  │
│ │               │ │  │  5 │       System.out.println(i);        │    │  │
│ │               │ │  │  6 │       i++;                          │    │  │
│ │               │ │  │  7 │     } while (i < 3);                │    │  │
│ │               │ │  │  8 │   }                                │    │  │
│ │               │ │  │  9 │ }                                  │    │  │
│ │               │ │  └───────────────────────────────────────────┘    │  │
│ │               │ │  #codeDisplay                                     │  │
│ │               │ │                                                   │  │
│ │               │ │  ┌───────────────────┐  ┌───────────────────┐    │  │
│ │               │ │  │ Simulated Console │  │ Variable Final    │    │  │
│ │               │ │  │ Output            │  │ Values            │    │  │
│ │               │ │  ├───────────────────┤  ├───────────────────┤    │  │
│ │               │ │  │                   │  │ i  ┌───────────┐ │    │  │
│ │               │ │  │ > █               │  │    │           │ │    │  │
│ │               │ │  │                   │  │    └───────────┘ │    │  │
│ │               │ │  │                   │  │                   │    │  │
│ │               │ │  └───────────────────┘  └───────────────────┘    │  │
│ │               │ │  #consoleInput            #variableInputs        │  │
│ │───────────────│ │                                                   │  │
│ │ Total Points  │ │  ┌─────────────────────┐                         │  │
│ │   0 / 30      │ │  │   Verify Answer     │                         │  │
│ │               │ │  └─────────────────────┘                         │  │
│ │[Download Res.]│ │  #actionButton                                    │  │
│ └───────────────┘ └───────────────────────────────────────────────────┘  │
│   .sidebar (260px)             .content (flex: 1)                        │
└───────────────────────────────────────────────────────────────────────────┘
```

**Screen 3b — After Verification** (console results replace textarea, inputs lock)

```
              ┌───────────────────┐  ┌───────────────────┐
              │ Simulated Console │  │ Variable Final    │
              │ Output            │  │ Values            │
              ├───────────────────┤  ├───────────────────┤
              │ ✓ Hello           │  │ i  ┌───────────┐ │
              │ ✓ Hello           │  │    │ 3     ✓   │ │
              │ ✓ Hello           │  │    └───────────┘ │
              │                   │  │                   │
              └───────────────────┘  └───────────────────┘
              #consoleResults         green = correct (.correct)
              (replaces textarea)     red = incorrect (.incorrect)
```

**Screen 4 — Score Summary Modal** (Exam mode, on completion or timer expiry)

```
              ┌────────────────────────────────┐
              │        Session Complete         │
              ├────────────────────────────────┤
              │                                │
              │           ╭──────╮             │
              │           │28/30 │             │
              │           │Score │             │
              │           ╰──────╯             │
              │         .score-circle          │
              │                                │
              │  Student Email:                │
              │  student@tsatinc.edu.ph        │
              │                                │
              │  Congratulations! All          │
              │  exercises completed!          │
              │  #completionMessage            │
              │                                │
              ├────────────────────────────────┤
              │          [ Close ]             │
              └────────────────────────────────┘
```

**Screen 5 — Alert Modal** (e.g., reset blocked in Exam mode)

```
              ┌────────────────────────────────┐
              │  Notice                        │
              ├────────────────────────────────┤
              │                                │
              │  Reset is not allowed in       │
              │  Exam Mode.                    │
              │                                │
              ├────────────────────────────────┤
              │            [ OK ]              │
              └────────────────────────────────┘
```

---

~175 lines. Key elements by ID:

```
#loginOverlay                     — Full-screen login (email + student# inputs)
  .login-header                   — Title (set dynamically from manifest.title) + gear icon button
  #settingsBtn                    — Opens settings modal

#settingsModal + #settingsOverlay — Mode selection (Practice/Exam) + timer input
  input[name="mode"]              — Radio buttons for mode
  #timerSection                   — Timer minutes input (visible only in Exam mode)
  #timerInput                     — Number input (1–999)

#scoreSummaryModal + #scoreSummaryOverlay — Exam completion display
  .score-circle                   — Large circular score badge (gradient background)
  #finalScore / #maxScore         — Score numerals
  #summaryEmail                   — Student email display
  #completionMessage              — Contextual message (success/warning)

#alertModal + #alertOverlay       — Alert notifications (e.g., reset prevention)
  #alertTitle / #alertMessage     — Dynamic title and body text

#appContainer                     — Main app (display:flex — sidebar + content)
  .sidebar                        — Left panel
    #userDisplay                  — Logged-in user email
    #fileList                     — Exercise list (<ul> with <li> per exercise)
    #summaryPanel / #summaryValue — Total points display
    #downloadBtn                  — "Download Results" button

  .content                        — Right panel (main area)
    #timerContainer               — Floating timer badge (Exam mode)
    #timerDisplay                 — MM:SS countdown text
    #loader                       — Loading spinner
    #exerciseArea                 — Exercise content
      #currentFileName            — Exercise name heading
      #codeDisplay                — <pre> with line-numbered source code
      .answer-panels              — Grid: console panel + variable panel
        #consoleInput             — Textarea for output prediction
        #consoleResults           — Per-line ✓/✗ results (replaces textarea after verify)
        #variableInputs           — Variable name/value input rows
      #actionButton               — "Verify Answer" / "Reset" / "Locked"
      #feedback                   — Score feedback text
```

**External Dependencies (CDN):**
- Google Fonts: Roboto + Roboto Mono
- canvas-confetti v1.6.0 (confetti animation library)

---

## 8. CSS Architecture (style.css)

~899 lines. Uses CSS custom properties for theming:

```css
:root {
    --primary: #6200ee;       /* Google Material Deep Purple */
    --primary-dark: #3700b3;
    --secondary: #03dac6;     /* Teal — success/completion color */
    --error: #b00020;         /* Material Red — errors/incorrect */
    --bg: #f5f5f5;            /* Light gray page background */
    --surface: #ffffff;       /* White card surfaces */
    --editor-bg: #263238;     /* Dark code viewer background */
    --text-main: #333333;     /* Default text color */
}
```

### Section Breakdown

| Section | Description |
|---------|-------------|
| 1. Variables & Reset | `:root` variables, body/html reset |
| 2. Login Overlay | `.login-overlay`, `.login-card`, `.login-header`, `.settings-icon` |
| 3. Main Layout | `.main-layout` (flex), `.sidebar` (260px), `.content` (flex:1) |
| 4. Code Viewer | `.code-viewer` (dark bg), `.code-viewer-header`, `pre` styling, `.line-number`, syntax highlighting classes (`.hl-kw`, `.hl-type`, `.hl-fn`, `.hl-prep`, `.hl-str`, `.hl-num`, `.hl-comm`) |
| 4b. Answer Panels | `.answer-panels` (2-col grid), `.console-panel` (dark terminal look), `.variable-panel` (white), `.var-input` states (`.correct`, `.incorrect`, `.locked`) |
| 5. Buttons & Feedback | `.primary-btn`, `.secondary-btn`, disabled states, `#feedback` |
| 6. Modal Styles | `.modal`, `.modal-overlay`, `.modal-header/body/footer`, settings-specific styles, radio options, timer input |
| 7. Score Summary Modal | `.score-summary-modal`, `.score-circle` (gradient), `.score-number`, `.completion-message` (`.success` / `.warning`) |
| 8. Alert Modal | `.alert-modal`, `.alert-header` (red accent), `.alert-body` |
| Timer | `.timer-container` (fixed top-right), `.timer-badge` (gradient), `.timer-display`, `.warning` (gold), `.critical` (red + pulse animation) |
| Sidebar Extras | `.nav-score` badge states, `.summary-panel`, `.sidebar-bottom` |
| Animations | `@keyframes spin` (loader), `@keyframes pulse` (critical timer) |

### Score Badge States

| State | CSS Class | Color | Meaning |
|-------|-----------|-------|---------|
| Unanswered | (default) | Gray `#e0e0e0` | Not yet attempted |
| Partial | `.partial-score` | Orange `#ff9800` | Some answers correct |
| Perfect | `.completed-score` | Teal `var(--secondary)` | All answers correct |

---

## 9. Practice Mode vs Exam Mode

### Practice Mode (Default)

| Aspect | Behavior |
|--------|----------|
| Timer | None |
| Attempts | Unlimited — "Verify Answer" → "Reset" → "Verify Answer" cycle |
| Reset | Allowed — clears score, re-enables all inputs |
| Score Summary | Not shown (no modal) |
| Use Case | Learning, self-study, practice sessions |

### Exam Mode

| Aspect | Behavior |
|--------|----------|
| Timer | Configurable 1–999 minutes (default 15), starts on login |
| Attempts | One per exercise — after verification, exercise is permanently locked |
| Reset | Blocked — shows alert modal: "Reset is not allowed in Exam Mode" |
| Score Summary | Shown on completion (all done or timer expired) |
| Use Case | Timed assessments, exams, quizzes |

### Settings Access
- Gear icon (⚙️) in upper-right of login card
- Opens modal with mode radio buttons + timer input (visible only for Exam mode)
- Settings stored in `appSettings` object (session-only, lost on refresh)

### Timer Visual States

| Time Remaining | Color | Effect |
|----------------|-------|--------|
| > 5 minutes | Teal (default) | Normal display |
| ≤ 5 minutes | Gold `#ffd700` | `.warning` class, glow effect |
| ≤ 1 minute | Red `#ff6b6b` | `.critical` class, pulsing animation |

### Exam Completion Scenarios

**Scenario A — All exercises completed before time expires:**
1. Student verifies the last exercise
2. `checkIfAllAnswered()` returns `true`
3. Timer stops (`stopTimer()`)
4. Score summary modal appears after 500ms delay
5. Message: "Congratulations! All exercises completed before time ran out!" (teal/success)

**Scenario B — Timer expires:**
1. `timeRemaining` reaches 0
2. `handleTimerExpired()` locks all unlocked exercises
3. Current exercise inputs disabled
4. Score summary modal appears immediately
5. Message: "Time is up! Your exam session has ended." (orange/warning)

---

## 10. students.csv Format

```csv
email,student_number
student@school.edu,20250001
another@school.edu,20250002
```

- **First row is header** — skipped via `.slice(1)` in parsing
- Fields split on `,` (no quoted-field support)
- Some rows may have empty `student_number`
- Login requires **exact match** of both email and student_number (case-sensitive, trimmed)
- No passwords — plaintext client-side lookup only
- Domain: `@tsatinc.edu.ph` (TSAT institutional emails)

---

## 11. How to Add / Swap Exercises

### Switching languages / topics (new deployment)

1. Create new exercise files with `@output` and `@variables` metadata blocks (see [Section 3](#3-exercise-file-format))
2. Replace or add files in the `exercises/` folder
3. Update `manifest.json`:
   - Set `"language"` to one of: `"C"`, `"Java"`, `"C++"`, `"C#"`, `"JavaScript"`
   - Set `"title"` to the desired app title (e.g., `"Java - Simulate Output"`)
   - List all exercise filenames in the `"exercises"` array
4. Test: login → verify all exercises appear in sidebar → verify scoring works for each

### Adding a single exercise to existing set

1. Create the exercise file with proper metadata
2. Place it in `exercises/`
3. Add its filename to the `"exercises"` array in `manifest.json`

### Exercise file rules (checklist)

- [ ] Metadata block is a `/* ... */` comment at the **very start** of the file
- [ ] `@output` appears before `@variables`
- [ ] Output content matches what the program would actually print (including spaces, newlines)
- [ ] Each variable line uses `name = value` format (space around `=`)
- [ ] Filename is listed in the `"exercises"` array in `manifest.json`
- [ ] `manifest.json` `"language"` field matches the source language of the exercise files

### Scoring logic details

- Output: each line of user's output is compared to the corresponding expected line (trailing whitespace stripped from both). A line matches → 1 point. Extra user lines beyond `expectedLines.length` subtract from the output score (penalty = extra line count). Minimum output score is 0.
- Variables: each variable input trimmed and compared exactly to `expectedValue`. Match → 1 point.
- `totalPoints = expectedLines.length + variables.length`

---

## 12. Known Limitations & Security

### Security (NOT production-ready)

| Issue | Detail |
|-------|--------|
| No real authentication | Credentials in plaintext CSV, client-side lookup only |
| Answers exposed | `@output`/`@variables` metadata visible via View Source or DevTools Network tab |
| No server validation | Scores can be manipulated via browser console |
| No data protection | Student emails in plaintext CSV fetched by browser |
| No audit trail | No logging of student actions or submission times |

**For production use:** implement server-side auth (OAuth/SSO), move validation to backend, use HTTPS, encrypt sensitive data, obfuscate exercise answers.

### Functional Limitations

| Issue | Detail |
|-------|--------|
| No persistence | All progress lost on page refresh (no localStorage, no backend) |
| Exact-match scoring | Case-sensitive, whitespace-sensitive. No fuzzy/regex matching. |
| Brittle CSV parsing | No quoted-field support, no escape sequences, splits on `,` and `\n` |
| Sequential loading | Exercises fetched one-by-one (not parallelized) |
| No mobile optimization | Layout not responsive for small screens |
| No accessibility | Missing ARIA labels, keyboard nav limited, color-only indicators |

### Browser Requirements

- Modern browser with ES6 support (Chrome, Edge, Firefox, Safari)
- Fetch API required
- `file://` protocol may block `fetch()` — use an HTTP server for reliable operation

---

## 13. Troubleshooting

### Students can't login
- Check `students.csv`: email and student_number must match exactly (case-sensitive)
- Check for trailing commas, extra whitespace, or encoding issues in CSV
- Verify CSV loaded: open DevTools Console → `console.log(studentDatabase)`
- Ensure HTTP server is running (not `file://`)

### Exercises don't load / sidebar empty
- Verify exercise files exist in `exercises/` folder
- Verify filenames in `manifest.json` `"exercises"` array match file names exactly (case-sensitive)
- Verify `manifest.json` is valid JSON (use a JSON validator)
- Check DevTools Network tab for 404 errors
- Check Console for parse errors
- Ensure using HTTP server

### Answers marked wrong but look correct
- Output comparison strips only trailing whitespace — leading spaces matter
- Check for invisible characters (tabs vs spaces, `\r\n` vs `\n`)
- Variable values are exact string match — `6` ≠ `6.0` ≠ ` 6`
- Debug: `console.log(exerciseData[currentFile].expectedLines)` to see expected values
- Debug: `console.log(exerciseData[currentFile].variables)` to see expected variable values

### Timer not showing (Exam mode)
- Confirm `appSettings.mode === 'exam'` in console
- Confirm `appSettings.timerMinutes > 0`
- Timer only starts after login — gear settings must be saved before login

### Score summary modal not appearing
- Check if `checkIfAllAnswered()` returns `true` (all exercises must be locked)
- Check Console for errors during `showScoreSummaryModal()`
- Verify modal HTML elements exist in DOM

### CSV export not downloading
- Verify `currentUser` is set: `console.log(currentUser)`
- Check browser isn't blocking downloads/popups
- Try: `exportProgress()` directly in console

---

## 14. Recommended Improvements

### Short-Term (Low Effort)

1. **localStorage persistence** — Save `exerciseData` on verify/switch; restore on reload. Survives page refresh.
2. **Case-insensitive variable matching** — `toLowerCase()` both sides before comparing.
3. **Parallel exercise loading** — Replace sequential `for` loop with `Promise.all` for faster startup.
4. **Show correct answers after verify** — Optional toggle to reveal expected output/variables after scoring.

### Medium-Term

1. **Backend server** (Node/Express or Flask) — Serve files, validate answers server-side, store results in DB, basic teacher dashboard.
2. **Unit tests** — Test `parseExercise()` and `checkAnswers()` with Jest or Vitest.
3. **Mobile responsive layout** — CSS media queries for tablets/phones.
4. **Accessibility** — ARIA labels, keyboard navigation, screen reader support, WCAG color contrast.

### Long-Term

1. **Proper authentication** — OAuth/SSO with school identity provider.
2. **Teacher dashboard** — Class-wide analytics, per-student progress, aggregated results.
3. **Anti-cheat** — Obfuscate answers in exercise files, server-side validation, timestamped submissions.

---

## 15. Running Locally

1. **Start a local HTTP server** (required — `file://` blocks `fetch()`):
   ```bash
   # Python 3
   python -m http.server 8000

   # OR Node.js
   npx http-server -p 8000
   ```

2. **Open** `http://localhost:8000/` in Chrome, Edge, or Firefox

3. **Login** with an email + student_number from `students.csv`

4. **For development:** use browser DevTools for debugging
   - Console: inspect `exerciseData`, `studentDatabase`, `appSettings`
   - Network tab: verify exercise files load correctly
   - Elements tab: inspect DOM state

---

## 16. Conventions for AI Agents

- **This is the ONLY documentation file.** All project context is here. When making code changes, update the relevant sections of this `Context.md`.
- **The app is language-agnostic.** Never hardcode language assumptions in `script.js`, `index.html`, or `style.css`. All language-specific configuration flows through `manifest.json` and the built-in `LANG_HIGHLIGHT` constant.
- **`manifest.json`** is the single deployment configuration file. It controls: language (for highlighting), title (for UI), and exercise file list.
- **Exercise files are swappable.** Never hardcode topic assumptions. The topic depends on what exercise files are in `exercises/` and what `manifest.json` says.
- **All scoring logic** lives in `checkAnswers()` — any scoring changes go there.
- **All exercise parsing** lives in `parseExercise()` — any format changes go there.
- **Syntax highlighting** lives in `highlightCode()` and the `LANG_HIGHLIGHT` constant. Uses token-replacement to avoid nested span issues. Universal patterns (comments, strings, chars, numbers, function calls) are shared across all languages. Language-specific rules (types, keywords, extra patterns) come from `LANG_HIGHLIGHT[manifest.language]`. CSS classes are `.hl-kw` (purple, keywords), `.hl-type` (gold, types), `.hl-fn` (blue, functions), `.hl-prep` (cyan, preprocessor/annotations/attributes), `.hl-str` (green, strings), `.hl-num` (orange, numbers), `.hl-comm` (gray italic, comments).
- **Modal pattern** is consistent everywhere: a `show*()` function sets `display: block` on modal + overlay; a `close*()` function sets `display: none`. Follow this pattern when adding new modals.
- **CSS variables** in `:root` control theming globally — edit them for color changes.
- **No build step.** This is plain HTML/JS/CSS. No bundler, no transpiler, no npm. Just serve the files.
- **When updating function references** in this file, search `script.js` for current line numbers using the function name — they may drift after edits.

---

**Version:** 1.0  
**Last Updated:** March 27, 2026  
**Status:** Active — sole documentation file
