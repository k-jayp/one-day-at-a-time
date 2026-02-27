# CLAUDE.md — We Do Recover (One Day at a Time)

## Project Overview
**We Do Recover** is a recovery support web app for people in addiction recovery. Single-page application (SPA) built with vanilla JavaScript (no frameworks), Firebase for auth/data, and a Cloudflare Worker proxying to Anthropic's Claude API.

**Live site:** wedorecover.org
**Repo:** github.com/k-jayp/one-day-at-a-time

## Tech Stack
- **Frontend:** Vanilla HTML/CSS/JS — single `index.html` SPA with page sections toggled via JS
- **Auth & Database:** Firebase Auth (email + Google SSO) + Cloud Firestore (project: `one-day-at-a-time-1aa24`)
- **AI Backend:** Cloudflare Worker (`recovery-chat-worker.js`) proxying to Anthropic Claude Sonnet 4 (`claude-sonnet-4-20250514`)
- **Styling:** Custom CSS with glassmorphism design system, CSS custom properties, dark mode support
- **No build step** — static files served directly

## Architecture

### File Structure
```
index.html          — Single page with all HTML sections
js/
  firebase.js       — Firebase init, auth, all Firestore CRUD
  app.js            — Main app logic, routing, coping toolbox, gamification system
  games.js          — Challenges Hub: 6 therapeutic games, hub rendering, overlay management
  chat.js           — Mona AI chat UI and worker communication
  meditation.js     — Guided meditation/breathing exercises
  pdf-export.js     — Worksheet PDF export
css/
  base.css          — Design system, variables, nav, dark mode, accessibility
  pages.css         — All page/feature styles
  games.css         — Challenges Hub grid, game overlays, all 6 game UIs, dark mode
  responsive.css    — Mobile breakpoints (max-width: 600px)
  chat.css          — Chat panel styles
  meditation.css    — Meditation overlay styles
recovery-chat-worker.js — Cloudflare Worker (deploy separately)
```

All JS files loaded as `<script type="module">` in order: firebase.js → app.js → games.js → chat.js → meditation.js → pdf-export.js.

### Key Patterns
- **SPA navigation:** `showPage('page-id')` toggles `<section>` visibility with fade transitions
- **Cross-module exports:** Functions shared between files use `window.functionName = functionName` pattern (module-scoped by default)
- **Firebase data:** All user data under `users/{uid}/` with subcollections
- **Firestore timestamps:** Always use `serverTimestamp()` for `createdAt`/`lastUpdated`
- **Full-screen overlays:** Features like Reframe Studio use z-index 5000+ overlays with dynamically rendered content
- **Resilient async flows:** Multi-step async operations (save → award XP → show UI) must use independent try-catch blocks so UI always renders even if a backend call fails
- **Dark mode:** CSS variables swap in `body.dark-mode` — variables are inverted (e.g., `--warm-brown` becomes light, `--sand` becomes dark)

### Firestore Collections
- `users/{uid}` — user profile, cleanDate, reframeXP, reframeLevel, reframeLevelName
- `users/{uid}/checkins/{YYYY-MM-DD}` — daily mood check-ins
- `users/{uid}/gratitude/{id}` — gratitude entries
- `users/{uid}/journal/{id}` — journal entries
- `users/{uid}/thoughtLog/{id}` — Reframe Studio entries (version 1/2/3, legacy)
- `users/{uid}/safetyPlan/{id}` — safety plan data
- `users/{uid}/urges/{id}` — urge tracking entries
- `users/{uid}/workbook/{worksheetId}` — Growth Lab worksheet data (legacy)
- `users/{uid}/gameSessions/{id}` — Challenges Hub game session results (gameId, score, xpEarned, details)
- `users/{uid}/copingToolbox/main` — coping skills and favorites
- `shared/{id}` — publicly shared gratitude
- `communityWall/{id}` — anonymous community messages
- `conversations/{sortedUids}/messages/{id}` — partner direct messages (real-time via onSnapshot)
- `partnerRequests/{id}` — accountability partner requests
- `notifications/{id}` — user notifications (polled every 60s)

### CSS Variables (Light → Dark)
| Variable | Light Mode | Dark Mode |
|----------|-----------|-----------|
| `--warm-brown` | `#3D3229` (dark text) | `#E8DDD0` (light text) |
| `--sand` | `#E6DDD2` (light bg) | `#2E261F` (dark bg) |
| `--cream` | `#F5EDE5` | `#1C1714` |
| `--sage` | `#4A7C59` | `#5A9B6E` |
| `--terracotta` | `#BF6A3A` | `#D4884F` |

## Features

### Core Features
1. **Sobriety Tracker** — Set date, see days/months/years, milestone celebrations
2. **Daily Check-in** — Mood emoji + feelings wheel (60 emotions), HALT check, early warning detection
3. **Gratitude Lists** — Daily entries, community wall sharing
4. **Private Journal** — Journal with titled entries
5. **Mona AI Chat** — Recovery support chatbot (Cavalier King Charles Spaniel persona)
6. **Safety Plan** — Step-by-step crisis safety plan builder
7. **Urge Tracking** — Log urges with triggers, intensity, coping strategies

### Therapeutic Features (Feb 2026)
8. **HALT Check** — Hungry/Angry/Lonely/Tired self-assessment with daily mood
9. **Feelings Wheel** — 60 specific emotions organized by core emotions
10. **ACT Exercises** — Leaves on a Stream, Thought Defusion
11. **Challenges Hub** — 6 interactive CBT games with shared XP/level gamification (see below)
12. **Coping Toolbox** — 5-category coping skills builder with favorites (in My Journey)
13. **Wellness Toolkit** — 4-7-8 Breathing, 5-4-3-2-1 Grounding, Body Scan, Urge Surfing, Muscle Relaxation, Loving-Kindness, Safe Place Visualization

### Navigation Structure
- **My Journey** — Sobriety Tracker, Check-In, Gratitude, Journal, Safety Plan, Urge Tracking, Coping Toolbox
- **Challenges** (auth-gated) — Challenges Hub (single page with 6 games)
- **Daily Readings, Mona, Wellness, Find Help, Connect** — Top-level nav items

### Challenges Hub (`js/games.js`)
6 therapeutic CBT games rendered as a card grid. Each game opens in a full-screen overlay (`#gameOverlay`). Games award XP via the shared gamification system and save sessions to `gameSessions` subcollection.

**Games (display order):**
1. **The Reframe Room** (`ai-reframe-studio`) — AI-powered 5-step flow (Input → Analyzing → Reveal → Reframe → Complete). Uses Cloudflare Worker `analyze-thought` route. 30 base + 10/distortion + 5/intensity-drop XP. Badge: `ai_reframe_master`. Featured card with "Powered by Mona" badge.
2. **Spot the Thought** (`identify-distortions`) — Multiple choice quiz: identify cognitive distortions in 5 random scenarios (7 distortion types, 10 scenarios). 20 XP per correct, max 100 XP.
3. **Distorted Sorted** (`thought-categorizer`) — Drag-and-drop: sort 6 thoughts into 3 categories (All-or-Nothing, Catastrophizing, Mind Reading). HTML5 drag + touch fallback. 15 XP per correct, max 90 XP. Badge: `master_dichotomous`.
4. **Balance Beam** (`reframe-builder`) — Fill-in-the-blank: complete balanced reframes using inline `<select>` dropdowns. 2 scenarios, 2 blanks each. 20 XP per correct, max 80 XP.
5. **Skills that Soothe** (`coping-skills-game`) — Drag-and-drop: sort 10 coping skills into 5 categories (Physical, Emotional, Mental, Sensory, Social). 10 XP per correct, max 100 XP. Badge: `coping_master`.
6. **Tolerance Tilt** (`frustration-tolerance`) — Click-to-reveal: challenge 8 rigid beliefs to see balanced reframes (red→green card flip). 15 XP per belief, max 120 XP.

**Shared drag-drop pattern:** Both Distorted Sorted and Skills that Soothe use HTML5 drag events for desktop + touch events (`touchstart`/`touchmove`/`touchend`) with manual hit-testing for mobile.

**Key functions (on window):** `renderChallengesHub()`, `openGame(id)`, `closeGame()`, plus per-game `init*()`, `render*()`, `handle*()` functions.

### Shared Gamification System
All 6 Challenges Hub games share a unified XP/level system:
- **7 levels:** Seedling (0) → Sprout (50) → Sapling (150) → Growing Tree (350) → Mighty Oak (700) → Ancient Redwood (1200) → Recovery Master (2500)
- **JS constants:** `GAME_LEVELS`, `GAME_BADGES` in app.js; `CHALLENGE_BADGES` in games.js
- **Functions:** `awardXP()`, `getLevelForXP()`, `getGameData()`, `saveGameData()` (app.js → window); `completeGame()`, `checkAndAwardBadges()`, `renderGameCelebration()` (games.js)
- **Firestore fields:** `reframeXP`, `reframeLevel`, `reframeLevelName`, `gameBadges` on user document root
- **Badges:** `first_session`, `xp_100`, `master_dichotomous`, `ai_reframe_master`, `coping_master`

**Worker routes:**
- `{ type: "analyze-thought", thought: "...", distressLevel: N }` → CBT analysis (JSON)
- `{ type: "worksheet-guide", worksheetType: "...", responses: {...} }` → Personalized worksheet insight (JSON, legacy)
- `{ messages: [...] }` → Mona chat (default)

## Branding & Language
- Logo: "We Do Recover" (bold) / "One Day at a Time" (subtitle)
- Fonts: Lato (headings, `var(--font-heading)`) + Open Sans (body, `var(--font-body)`) + Playfair Display (serif quotes, `var(--font-serif)`)
- Language: **"time in recovery" / "sobriety date"** (NOT "clean time" / "clean date")

## Development

### Dev Server
```bash
python3 -m http.server 8080
```
Config in `.claude/launch.json`.

### Deploying the Worker
`recovery-chat-worker.js` deployed separately to Cloudflare Workers:
1. Copy to Cloudflare Dashboard → Workers → Edit Code
2. Set `ANTHROPIC_API_KEY` as encrypted env var
3. Worker URL: `https://recovery-chat.kidell-powellj.workers.dev`

### Git Workflow
- Main branch: `main`
- Always commit and push after plan approval — do not ask for confirmation
- Commit style: imperative mood, descriptive body

## Common Pitfalls
1. **Dark mode CSS variables are inverted** — Don't assume `--sand` is always light
2. **Firebase requires auth** — All Firestore operations check `if (!currentUser) return`
3. **No build step** — Changes to JS/CSS are live immediately on the static server
4. **Worker deployment is separate** — Editing `recovery-chat-worker.js` locally does NOT deploy it
5. **Cross-file function access** — Must use `window.fnName = fnName`; ES module scope isolates each file
6. **Async error isolation** — Never put save + UI render in the same try block; a Firestore error must not block the user-facing celebration/completion UI
7. **aiAnalysis sanitization** — Always `JSON.parse(JSON.stringify())` the AI analysis before saving to Firestore to strip non-serializable values
8. **Schema versioning** — `thoughtLog` entries have `version` field (1, 2, or 3); always check version when reading (legacy data)
9. **AI response markdown fences** — Claude may wrap JSON responses in `` ```json `` code blocks; always strip markdown fences before `JSON.parse`
10. **Firestore rules must list every subcollection** — New subcollections under `users/{uid}` need explicit rules in the Firebase Console; a wildcard (`{document=**}`) is NOT used. `gameSessions` subcollection rule must be added manually.
11. **Games.js module-scoped state** — Each game uses module-scoped `let` variables (e.g., `_idQuestions`, `_tcPlaced`). These reset on each `init*()` call. Don't assume state persists between game opens.
12. **Touch drag-drop** — Mobile drag uses `touchstart`/`touchmove`/`touchend` with manual `getBoundingClientRect()` hit-testing. The ghost element follows the finger and zones highlight on hover. Both Thought Categorizer and Coping Skills Menu share this pattern.
13. **Auth-gated nav dropdowns** — Both `myJourneyDropdown` and `challengesDropdown` are hidden/shown in `firebase.js` `updateUIForAuthState()`. New auth-gated nav items need the same treatment.
