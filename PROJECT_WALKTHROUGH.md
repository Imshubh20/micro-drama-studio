# PROJECT WALKTHROUGH — Micro Drama Studio

> Complete technical walkthrough based on the actual codebase.  
> Every file, function, route, and flow described here is verified from source code.

---

## 1. PROJECT OVERVIEW

### What It Does
Micro Drama Studio is a full-stack web application for creating, managing, and publishing short-form episodic drama series (2–3 minute episodes). It uses a real LLM (Google Gemini) to generate story content including titles, descriptions, character profiles, episode outlines, detailed scene breakdowns, and formatted screenplays.

### Main Problem It Solves
Creating micro-dramas requires rapid iteration across storylines, character development, and scriptwriting. Fully automated AI pipelines strip creators of control and produce inconsistent character portrayals. This project solves that by:
- Letting AI draft content but keeping the creator in control at every step.
- Supporting partial regeneration (single character, single episode outline, single scene) instead of wiping everything.
- Providing a "Character Lock" feature that injects locked character profiles verbatim into future AI prompts to prevent character drift.
- Showing transparent cost estimates before any AI generation.

### Main User Workflow
1. Creator enters a story premise, selects genre, tone, episode count, and duration.
2. System estimates cost and asks for confirmation.
3. Gemini generates the full series: title, description, storyline, characters, relationships, and episode outlines.
4. Creator reviews and edits/regenerates individual characters or episode outlines.
5. Creator approves the story.
6. For each episode, creator generates scenes and script via Gemini.
7. Creator edits individual scenes, generates mock media (images, videos, voice-overs).
8. Creator edits the screenplay script manually.
9. Creator publishes episodes to selected platforms.

### Major Features Implemented
- Dashboard with series listing, stats, and status badges
- Create wizard with multi-step form
- Live AI story generation using Google Gemini API
- Story review page with character cards, episode cards, and approval
- Character Bible with lock/unlock and per-character regeneration
- Episode workspace with 5 tabs: Story, Scenes, Media, Script, Publish
- Manual editing modals for stories, characters, episodes, and scenes
- Single episode outline regeneration
- Single scene regeneration
- Single character regeneration
- Mock image/video/audio generation with simulated progress
- Cost estimation and confirmation gates
- Multi-platform publishing (simulated)
- Demo/mock AI mode when no API key is set

---

## 2. COMPLETE TECH STACK

### Next.js 16 (App Router)
- **Why:** Provides React server components, file-system routing, built-in optimizations (Turbopack), and a modern developer experience.
- **Where:** `frontend/` — all pages live in `frontend/src/app/` using the App Router convention (folder-based routing with `page.tsx` files).
- **Communication:** Renders the client-side UI. Calls the Express backend via `fetch()` in `frontend/src/services/api.ts`.

### React 19
- **Why:** Component-based UI library. Version 19 provides the latest hooks and concurrent features.
- **Where:** Every `page.tsx` and `component/*.tsx` file is a React component using `useState`, `useEffect`, `useCallback`, `useRef`, and the `use()` hook for async params.
- **Communication:** React components call API functions exported from `frontend/src/services/api.ts`.

### TypeScript
- **Why:** Provides static type safety across both frontend and backend, catching errors at compile time and making the codebase self-documenting.
- **Where:** Every `.ts` and `.tsx` file in both `frontend/` and `backend/`. Shared type definitions live in `frontend/src/types/index.ts`.
- **Communication:** Types mirror the Prisma schema models, ensuring frontend and backend agree on data shapes.

### Tailwind CSS v4
- **Why:** Utility-first CSS framework for rapid, consistent styling. Used with CSS custom properties for theming.
- **Where:** `frontend/src/app/globals.css` defines CSS custom properties (colors, gradients). Tailwind classes are used in every component's JSX.
- **Communication:** Styling layer only. No communication with backend.

### Node.js
- **Why:** JavaScript runtime for the backend server. Event-driven, non-blocking I/O suitable for API servers.
- **Where:** `backend/` — runs the Express server. Uses `tsx watch` for development hot-reload.
- **Communication:** Hosts the Express REST API on port 5000.

### Express.js v5
- **Why:** Minimal, flexible web framework for building REST APIs with middleware support.
- **Where:** `backend/src/index.ts` (server setup), `backend/src/routes/index.ts` (route definitions), `backend/src/controllers/` (request handlers).
- **Communication:** Receives HTTP requests from the Next.js frontend, delegates to controllers, which call services.

### PostgreSQL
- **Why:** Robust relational database with ACID transactions, ideal for structured data with complex relationships (series → episodes → scenes, series → characters → relationships).
- **Where:** Runs locally on port 5432. Connection string in `backend/.env` as `DATABASE_URL`.
- **Communication:** Accessed exclusively through Prisma ORM. Never queried directly with raw SQL.

### Prisma ORM
- **Why:** Type-safe database client with auto-generated TypeScript types from the schema, declarative migrations, and a clean query API.
- **Where:** Schema in `backend/prisma/schema.prisma`. Client instantiated in `backend/src/config/database.ts`. Used in every service file.
- **Communication:** Translates TypeScript method calls into SQL queries against PostgreSQL. Generates types used across the backend.

### Google Gemini API (`@google/genai` v2.24.0)
- **Why:** The LLM provider for all text generation (stories, characters, episodes, scenes, scripts). Supports structured JSON output via `responseMimeType: 'application/json'`.
- **Where:** Client initialized in `backend/src/services/ai.service.ts`. Called via `callGemini()`.
- **Communication:** Receives structured prompts from the service layer, returns JSON responses that are parsed and stored in PostgreSQL.

### Cloudinary (v2.11.0)
- **Why:** Cloud-based media asset management (image/video hosting).
- **Where:** Configured in `backend/src/config/cloudinary.ts`. Used in `backend/src/services/media.service.ts` for file uploads.
- **Communication:** Receives file buffers via `upload_stream`, returns `secure_url` and `public_id`.

### Other Libraries from package.json

**Backend:**
| Library | Purpose |
|---------|---------|
| `cors` (v2.8.6) | Cross-Origin Resource Sharing middleware — allows frontend (port 3000) to call backend (port 5000) |
| `dotenv` (v18.0.4) | Loads environment variables from `.env` file |
| `multer` (v2.4.0) | Multipart form-data parsing for file uploads |
| `uuid` (v14.0.2) | UUID generation (available but Prisma uses its own `@default(uuid())`) |
| `openai` (v6.49.0) | Legacy dependency — **not actively used** in the generation flow. All calls go through `@google/genai` |

**Frontend:**
| Library | Purpose |
|---------|---------|
| `lucide-react` (v1.48.0) | Icon library — provides all UI icons (Sparkles, Film, Lock, Edit3, etc.) |
| `@react-three/fiber` + `@react-three/drei` + `three` | Three.js integration — used in `AmbientCanvas.tsx` for the background visual effect |

---

## 3. PROJECT FOLDER STRUCTURE

```
Micro Drama Studio/
├── README.md                          # Project documentation
├── workflow.md                        # Architecture documentation
│
├── backend/
│   ├── package.json                   # Backend dependencies and scripts
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── .env                           # Environment variables (not committed)
│   ├── .env.example                   # Template for environment variables
│   │
│   ├── prisma/
│   │   ├── schema.prisma              # Database schema definition (10 models, 6 enums)
│   │   └── seed.ts                    # Demo data seeder ("The Last Metro" series)
│   │
│   └── src/
│       ├── index.ts                   # Express server entry point
│       │
│       ├── config/
│       │   ├── index.ts               # Central config (reads .env, exports config object)
│       │   ├── database.ts            # Prisma client singleton
│       │   └── cloudinary.ts          # Cloudinary SDK configuration
│       │
│       ├── routes/
│       │   └── index.ts               # ALL API route definitions (single file)
│       │
│       ├── controllers/
│       │   ├── series.controller.ts   # Series CRUD + generate + cost estimate
│       │   ├── episode.controller.ts  # Episode CRUD + generate + publish + regen outline
│       │   ├── character.controller.ts# Character CRUD + lock + regenerate
│       │   ├── scene.controller.ts    # Scene CRUD + regenerate + script update
│       │   ├── media.controller.ts    # Media upload + mock generate + get + delete
│       │   └── generation.controller.ts # Generation job polling + usage stats
│       │
│       ├── services/
│       │   ├── ai.service.ts          # Gemini client, callGemini(), callMockAI(), estimateCost() — 1380 lines
│       │   ├── series.service.ts      # Series CRUD + generateSeriesContent() — core generation flow
│       │   ├── episode.service.ts     # Episode generation + publish + outline regeneration
│       │   ├── character.service.ts   # Character CRUD + lock guard + regeneration
│       │   ├── scene.service.ts       # Scene CRUD + regeneration + script update
│       │   └── media.service.ts       # Cloudinary upload + mock media generation + progress simulation
│       │
│       └── prompts/
│           └── index.ts               # All prompt template functions (5 templates)
│
└── frontend/
    ├── package.json                   # Frontend dependencies
    ├── tsconfig.json                  # TypeScript configuration
    ├── next.config.ts                 # Next.js configuration
    │
    └── src/
        ├── app/
        │   ├── layout.tsx             # Root layout (Sidebar + Topbar + AmbientCanvas)
        │   ├── globals.css            # Design system (CSS custom properties + Tailwind)
        │   ├── page.tsx               # Dashboard page — lists all series
        │   │
        │   ├── create/
        │   │   └── page.tsx           # Create wizard — 4-step form + cost gate
        │   │
        │   └── series/
        │       └── [id]/
        │           ├── page.tsx       # Series overview — story review + approval (871 lines)
        │           │
        │           ├── characters/
        │           │   └── page.tsx   # Character Bible — profiles + lock + regen
        │           │
        │           └── episodes/
        │               └── [episodeId]/
        │                   └── page.tsx # Episode workspace — 5 tabs (906 lines)
        │
        ├── components/
        │   ├── Sidebar.tsx            # Desktop sidebar + mobile bottom nav + theme switcher
        │   ├── Topbar.tsx             # Top header bar + AI mode indicator
        │   ├── AmbientCanvas.tsx      # Three.js background animation
        │   ├── ConfirmCostModal.tsx    # Cost estimation confirmation dialog
        │   ├── EditStoryModal.tsx      # Manual series metadata editing
        │   ├── EditEpisodeModal.tsx    # Manual episode editing
        │   ├── EditCharacterModal.tsx  # Manual character editing
        │   └── EditSceneModal.tsx      # Manual scene editing
        │
        ├── services/
        │   └── api.ts                 # API client — all fetch wrappers (73 lines)
        │
        └── types/
            └── index.ts              # TypeScript type definitions (130 lines)
```

### Key File Details

**`backend/src/services/ai.service.ts`** (1380 lines)
- **Responsibility:** Gemini client initialization, API calls with retry/fallback, mock AI data generation (13 story domains), cost estimation.
- **Important functions:** `callGemini()`, `callMockAI()`, `isDemoMode()`, `estimateCost()`, `generateMockSeriesContent()`, `generateMockEpisodeContent()`, `generateMockCharacter()`, `generateMockScene()`, `generateMockEpisodeOutline()`.
- **Called by:** `series.service.ts`, `episode.service.ts`, `character.service.ts`, `scene.service.ts` — all via the `callOpenAI` alias (which points to `callGemini`).
- **Calls:** `@google/genai` SDK → `client.models.generateContent()`.

**`backend/src/services/series.service.ts`** (399 lines)
- **Responsibility:** Series CRUD, the core `generateSeriesContent()` function that orchestrates the entire AI generation pipeline.
- **Important functions:** `createSeries()`, `getAllSeries()`, `getSeriesById()`, `generateSeriesContent()`, `getSeriesCostEstimate()`, `updateJobProgress()`.
- **Called by:** `series.controller.ts`.
- **Calls:** `ai.service.ts` (`callOpenAI`, `estimateCost`), `prompts/index.ts` (`buildSeriesGenerationPrompt`), Prisma.

**`backend/src/prompts/index.ts`** (288 lines)
- **Responsibility:** All prompt template functions. Each function constructs a structured string prompt with context injection.
- **Important functions:** `buildSeriesGenerationPrompt()`, `buildEpisodeGenerationPrompt()`, `buildCharacterRegenerationPrompt()`, `buildSceneRegenerationPrompt()`, `buildEpisodeOutlineRegenerationPrompt()`.
- **Called by:** All service files (`series.service.ts`, `episode.service.ts`, `character.service.ts`, `scene.service.ts`).
- **Calls:** Nothing — pure string construction.

**`frontend/src/services/api.ts`** (73 lines)
- **Responsibility:** Single API client. Wraps `fetch()` calls to the backend at `http://localhost:5000/api`.
- **Important functions:** `fetchAPI()` (core wrapper), plus named exports for every endpoint: `getSeries()`, `getSeriesById()`, `createSeries()`, `generateSeries()`, `getSeriesCostEstimate()`, `regenerateCharacter()`, `toggleCharacterLock()`, `generateMedia()`, `getMediaByScene()`, etc.
- **Called by:** Every frontend page component.
- **Calls:** Browser `fetch()` API.

**`frontend/src/app/series/[id]/page.tsx`** (871 lines)
- **Responsibility:** Series overview / Story Review page. Shows generated story, character cards, episode list. Supports approval, manual editing, and partial regeneration.
- **Called by:** Next.js router when navigating to `/series/:id`.
- **Calls:** `api.ts` functions: `getSeriesById`, `generateSeries`, `updateSeries`, `updateEpisode`, `updateCharacter`, `toggleCharacterLock`, `regenerateCharacter`, `regenerateEpisodeOutline`, `getCharacterCostEstimate`, `getEpisodeOutlineCostEstimate`, `getGenerationJob`.

**`frontend/src/app/series/[id]/episodes/[episodeId]/page.tsx`** (906 lines)
- **Responsibility:** Episode workspace with 5 tabs (STORY, SCENES, MEDIA, SCRIPT, PUBLISH). Scene editing, scene regeneration, media generation, script editing, publishing.
- **Called by:** Next.js router when navigating to `/series/:id/episodes/:episodeId`.
- **Calls:** `api.ts` functions: `getEpisodeById`, `generateEpisode`, `regenerateScene`, `updateScene`, `updateEpisode`, `publishEpisode`, `generateMedia`, `getMediaByScene`, `deleteMedia`, `getGenerationJob`, `getEpisodeCostEstimate`, `getSceneCostEstimate`.

---

## 4. COMPLETE APPLICATION ARCHITECTURE

### Frontend → Backend Request Flow

```
User action in browser
    ↓
React Component (e.g., series/[id]/page.tsx)
    ↓ calls
api.ts → fetchAPI('/series/123/generate', { method: 'POST' })
    ↓ HTTP request
Express Server (backend/src/index.ts)
    ↓ matches route
routes/index.ts → router.post('/series/:id/generate', seriesCtrl.generateSeries)
    ↓ delegates
controllers/series.controller.ts → generateSeries(req, res)
    ↓ calls
services/series.service.ts → generateSeriesContent(seriesId)
    ↓ calls
services/ai.service.ts → callGemini(prompt)   AND   Prisma → PostgreSQL
    ↓
Google Gemini API returns structured JSON
    ↓
Service parses JSON, creates/updates records via Prisma
    ↓
Prisma executes SQL INSERT/UPDATE against PostgreSQL
    ↓
Service returns the created data
    ↓
Controller wraps in { success: true, data: ... } and sends HTTP response
    ↓
api.ts receives response, extracts data.data
    ↓
React component updates state → UI re-renders
```

### Backend → Gemini API Flow

```
Service layer constructs prompt
    ↓ using
prompts/index.ts → buildSeriesGenerationPrompt({ prompt, genre, tone, lockedCharacters, ... })
    ↓ returns string
ai.service.ts → callGemini(prompt)
    ↓
getGeminiClient() → returns GoogleGenAI instance (or null if no API key)
    ↓ if null
callMockAI(prompt) → returns demo data
    ↓ if client exists
client.models.generateContent({
  model: 'gemini-3.8-flash',
  contents: prompt,
  config: {
    systemInstruction: '...',
    responseMimeType: 'application/json',
    temperature: 0.85
  }
})
    ↓
Gemini returns JSON text
    ↓
Service strips markdown fences, JSON.parse()
    ↓ if parse fails
Regex extracts first {...} object
    ↓ if that fails too
throws Error('Invalid AI response structure')
    ↓ on success
Service stores parsed data in PostgreSQL via Prisma
    ↓
Returns data to controller → frontend
```

---

## 5. DATABASE

### Models

**User**
- **Purpose:** Represents a creator on the platform.
- **Important fields:** `id` (UUID PK), `name`, `email` (unique), `avatar` (optional).
- **Relationships:** One-to-many with `Series`. A user owns multiple series.
- **Why it exists:** Even without authentication, a user record is needed as a foreign key for series ownership. A hardcoded "Demo Creator" user is upserted automatically.

**Series**
- **Purpose:** Top-level project container representing an entire micro-drama series.
- **Important fields:** `id`, `title`, `description`, `prompt` (original user input), `genre`, `tone` (enum), `episodeCount`, `episodeDuration`, `storyline`, `status` (enum: DRAFT→GENERATING→IN_REVIEW→READY→PUBLISHING→PUBLISHED→FAILED).
- **Relationships:** Belongs to `User`. Has many `Episode`, `Character`, `GenerationJob`, `GenerationUsage`.
- **Why it exists:** Central entity that groups all content — episodes, characters, and generation history.

**Episode**
- **Purpose:** A single episode within a series.
- **Important fields:** `id`, `seriesId`, `number` (sequential), `title`, `summary`, `status` (enum), `publishedAt`, `platforms` (string array: Web, iOS, Android, Roku).
- **Relationships:** Belongs to `Series`. Has many `Scene`, `Script` (one-to-one), `MediaAsset`.
- **Why it exists:** Episodes are the core production unit. Each episode gets its own scenes, script, and media assets.

**Character**
- **Purpose:** A character in the series with full profile details.
- **Important fields:** `id`, `seriesId`, `name`, `age`, `gender`, `role`, `personality`, `appearance`, `background`, `description`, `isLocked` (boolean).
- **Relationships:** Belongs to `Series`. Has many `CharacterRelationship` (both from and to).
- **Why `isLocked` exists:** When true, the character cannot be regenerated (server returns 403), and the character's full profile is injected verbatim into Gemini prompts for future generations.

**CharacterRelationship**
- **Purpose:** Directed edge between two characters describing their relationship.
- **Important fields:** `fromCharacterId`, `toCharacterId`, `relationship` (string, e.g., "corporate rival of", "estranged sibling of").
- **Relationships:** Belongs to two `Character` records (from and to). Unique constraint on `[fromCharacterId, toCharacterId]`.
- **Why it exists:** Adds narrative depth. Generated by Gemini during series creation. Displayed in the Character Bible UI.

**Scene**
- **Purpose:** A single scene within an episode.
- **Important fields:** `id`, `episodeId`, `number`, `title`, `location` (e.g., "INT. OFFICE - NIGHT"), `action`, `dialogue`, `camera`, `mood`, `characters` (string array of character names).
- **Relationships:** Belongs to `Episode`. Has many `MediaAsset`.
- **Why it exists:** Scenes are the atomic unit of content creation. Each scene has specific location, action, dialogue, camera directions, and mood.

**Script**
- **Purpose:** The formatted screenplay for an episode.
- **Important fields:** `id`, `episodeId` (unique — one script per episode), `content` (full text), `version` (integer, auto-incremented on updates).
- **Relationships:** One-to-one with `Episode`.
- **Why it exists:** Separates the editable script text from the structured scene data. Version tracking allows detecting edits.

**MediaAsset**
- **Purpose:** An image, video, audio, or thumbnail asset linked to a scene or episode.
- **Important fields:** `id`, `episodeId`, `sceneId`, `type` (enum: IMAGE, VIDEO, AUDIO, THUMBNAIL), `url`, `publicId`, `provider` ("cloudinary", "demo", or "mock-ai"), `status` (UPLOADING, READY, FAILED), `filename`.
- **Relationships:** Optionally belongs to `Episode` and/or `Scene`.
- **Why it exists:** Tracks generated or uploaded media assets per scene for the media studio tab.

**GenerationJob**
- **Purpose:** Tracks the progress of an asynchronous AI generation task.
- **Important fields:** `id`, `seriesId`, `type` (enum: SERIES, EPISODE, CHARACTER, SCENE, SCRIPT), `targetId` (the specific entity being generated), `status` (QUEUED, GENERATING, COMPLETED, FAILED), `progress` (0–100), `steps` (JSON array of progress steps), `error`, `completedAt`.
- **Relationships:** Belongs to `Series`.
- **Why it exists:** Frontend polls this record to show real-time progress bars during generation. Also used for mock media generation progress.

**GenerationUsage**
- **Purpose:** Records token usage and cost for every AI generation call.
- **Important fields:** `id`, `seriesId`, `type`, `targetId`, `promptTokens`, `completionTokens`, `totalTokens`, `estimatedCost` (float), `model`.
- **Relationships:** Belongs to `Series`.
- **Why it exists:** Cost auditing and usage tracking.

### Enums
- **SeriesStatus:** DRAFT, GENERATING, IN_REVIEW, READY, PUBLISHING, PUBLISHED, FAILED
- **EpisodeStatus:** DRAFT, GENERATING, IN_REVIEW, READY, PUBLISHING, PUBLISHED, FAILED
- **Tone:** DARK, LIGHT, COMEDIC, DRAMATIC, SUSPENSEFUL
- **MediaType:** IMAGE, VIDEO, AUDIO, THUMBNAIL
- **MediaStatus:** UPLOADING, READY, FAILED
- **GenerationStatus:** QUEUED, GENERATING, COMPLETED, FAILED
- **GenerationType:** SERIES, EPISODE, CHARACTER, SCENE, SCRIPT

---

## 6. SERIES CREATION FLOW

### Exact Step-by-Step

**Step 1: Frontend Form Submission**
- File: `frontend/src/app/create/page.tsx`
- User fills out: prompt, genre, tone, episodeCount, episodeDuration, optional title.
- On submit, `createSeries(formData)` is called → `fetchAPI('/series', { method: 'POST', body: JSON.stringify(formData) })`.

**Step 2: Series Record Created**
- Route: `POST /api/series` → `series.controller.ts → createSeries()`
- Controller upserts a demo user (email: `demo@microdrama.local`), then calls `series.service.ts → createSeries()`.
- Prisma creates a `Series` record with `status: 'DRAFT'`.

**Step 3: Cost Estimation**
- Frontend calls `getSeriesCostEstimate(seriesId)` → `GET /api/series/:id/cost-estimate`.
- Backend calls `estimateCost('series', episodeCount)` in `ai.service.ts`.
- Returns token estimates and dollar cost.
- Frontend shows `ConfirmCostModal.tsx`.

**Step 4: User Confirms, Generation Starts**
- Frontend calls `generateSeries(seriesId)` → `POST /api/series/:id/generate`.
- Controller calls `series.service.ts → generateSeriesContent(seriesId)`.
- Service:
  1. Loads series from DB (including locked characters).
  2. Checks for existing active generation job (concurrency guard).
  3. Creates `GenerationJob` record with `status: 'GENERATING'`.
  4. Updates `Series.status` to `'GENERATING'`.
  5. Calls `buildSeriesGenerationPrompt()` in `prompts/index.ts`.
  6. Calls `callOpenAI(prompt)` → which is aliased to `callGemini(prompt)` in `ai.service.ts`.

**Step 5: Gemini Generates**
- `callGemini()` instantiates the Gemini client using `GEMINI_API_KEY`.
- Sends prompt with `responseMimeType: 'application/json'` and `temperature: 0.85`.
- Receives JSON response containing: `title`, `description`, `storyline`, `characters[]`, `episodes[]`, `relationships[]`.

**Step 6: Response Parsed and Stored**
- Service strips markdown fences, parses JSON.
- Validates that `characters` and `episodes` arrays exist and are non-empty.
- Updates `Series` record with title, description, storyline, sets status to `'IN_REVIEW'`.
- Deletes existing unlocked characters, creates new characters from AI response (skipping locked character names).
- Deletes existing episodes, creates new episodes.
- Creates `CharacterRelationship` records from the relationships array.
- Records `GenerationUsage` with token counts.
- Updates `GenerationJob` to `status: 'COMPLETED'`, `progress: 100`.

**Step 7: Frontend Navigates to Review**
- Frontend has already navigated to `/series/${seriesId}` (using `router.push()`).
- `series/[id]/page.tsx` loads and polls `getGenerationJob(jobId)` to show progress.
- When job is COMPLETED, it reloads series data and displays the Story Review page.

---

## 7. GEMINI INTEGRATION

### Client Initialization
- **File:** `backend/src/services/ai.service.ts` lines 4–20.
- `getGeminiClient()` reads `config.gemini.apiKey` (which comes from `process.env.GEMINI_API_KEY`).
- If key exists, creates `new GoogleGenAI({ apiKey })`. Caches the instance and key for reuse.
- If key is empty/missing, returns `null` → triggers demo mode.

### API Key Reading
- **File:** `backend/src/config/index.ts` lines 5, 11.
- `const rawGeminiKey = (process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '')` — trims whitespace and strips surrounding quotes.
- Stored in `config.gemini.apiKey`.
- `config.isDemoMode = !rawGeminiKey` — if empty, entire app runs in mock mode.

### Model Reading
- **File:** `backend/src/services/ai.service.ts` line 36.
- `const requestedModel = process.env.GEMINI_MODEL || config.gemini.model || 'gemini-3.5-flash-lite'`.
- Falls back through: env var → config → hardcoded default.

### Which Service Calls Gemini
- All four service files call `callOpenAI()` (which is aliased to `callGemini()`):
  - `series.service.ts` → `callOpenAI(prompt)` for series generation
  - `episode.service.ts` → `callOpenAI(prompt)` for episode scene/script generation and outline regeneration
  - `character.service.ts` → `callOpenAI(prompt)` for character regeneration
  - `scene.service.ts` → `callOpenAI(prompt)` for scene regeneration

### How Prompts Are Constructed
- **File:** `backend/src/prompts/index.ts`.
- 5 template functions, each returns a plain string with embedded context:
  - `buildSeriesGenerationPrompt()` — includes user's prompt, genre, tone, episode count, duration, and locked character profiles.
  - `buildEpisodeGenerationPrompt()` — includes series title/storyline, episode summary, all characters (with [LOCKED] labels).
  - `buildCharacterRegenerationPrompt()` — includes series context and other characters in the ensemble.
  - `buildSceneRegenerationPrompt()` — includes series/episode context and established characters.
  - `buildEpisodeOutlineRegenerationPrompt()` — includes series context, other episode summaries, and characters.
- Every prompt ends with an explicit JSON schema the AI must follow.
- Every prompt includes "Respond with ONLY valid JSON".

### How Gemini Response Is Parsed
- **Pattern used in every service file:**
  1. Try to strip markdown code fences: `content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()`
  2. Try `JSON.parse(cleaned)`.
  3. If that fails, regex extract first `{...}` block: `content.match(/\{[\s\S]*\}/m)`.
  4. If that also fails, throw `Error('Invalid AI response structure')`.

### How Structured Output Is Handled
- `responseMimeType: 'application/json'` is passed to Gemini's `config` parameter, which tells Gemini to return JSON.
- A `systemInstruction` reinforces: "Always return ONLY valid, clean JSON with no markdown formatting or code blocks."

### How Errors Are Handled
- In `callGemini()`: each model is tried with 2 attempts. Between attempts, 800ms delay.
- If all models and retries fail, throws `Error('Gemini API Error: ...')` with the actual error message.
- The calling service catches this error, updates `GenerationJob.status = 'FAILED'` with the error message, and updates the entity's status to `'FAILED'`.
- Frontend displays the actual error to the user.
- **Mock data is NEVER silently substituted** in production mode. Mock data only runs when `isDemoMode()` returns true (no API key).

### How Retry Works
- **File:** `ai.service.ts` lines 37–76.
- Model cascade: `[requestedModel, 'gemini-3.5-flash-lite', 'gemini-3.8-flash']` (deduplicated).
- For each model: 2 attempts, 800ms between attempts.
- Total maximum: 3 models × 2 attempts = 6 tries before failure.

### How Story Context Is Passed
- Each prompt function receives the full relevant context:
  - Series: prompt, genre, tone, storyline, episode count, duration, locked characters.
  - Episode: + episode number, title, summary, all characters.
  - Scene regeneration: + episode title/summary, scene number, characters.
  - Character regeneration: + other characters in the ensemble.

### Why Gemini Is Used Only for Text Generation
- The assignment requirement specifies: "Image, video and voice generation can be mocked (placeholders with simulated progress). Text generation should use a real LLM API."
- Therefore, Gemini handles all text generation. Image/video/audio use simulated mock generation.

---

## 8. CHARACTER BIBLE

### How Characters Are Created
- During series generation in `series.service.ts → generateSeriesContent()`:
  - Gemini returns a `characters[]` array in its JSON response.
  - Existing unlocked characters are deleted.
  - Each character from the AI response is created via `prisma.character.create()` with: name, age, gender, role, personality, appearance, background, description, `isLocked: false`.
  - Characters whose names match locked characters are skipped.

### How They Are Stored
- In the `Character` table in PostgreSQL via Prisma.
- Each character belongs to a `Series` via `seriesId`.

### How Character Bible Retrieves Them
- **Frontend file:** `frontend/src/app/series/[id]/characters/page.tsx`.
- Calls `getSeriesById(id)` which returns the series with all characters included.
- Characters are also available from the series overview page (`series/[id]/page.tsx`).

### Edit Flow
- User clicks the edit button on a character card → opens `EditCharacterModal.tsx`.
- User edits fields (name, age, gender, role, personality, appearance, background, description).
- On save, calls `updateCharacter(id, data)` → `PUT /api/characters/:id`.
- Backend: `character.service.ts → updateCharacter()` → `prisma.character.update()`.

### Regenerate Flow
- User clicks "Regenerate" on a character → fetches cost estimate via `getCharacterCostEstimate(id)` → shows `ConfirmCostModal`.
- On confirm, calls `regenerateCharacter(id)` → `POST /api/characters/:id/regenerate`.
- Backend: `character.service.ts → regenerateCharacter()`:
  1. Checks `isLocked`. If true, throws error with "LOCKED" message.
  2. Loads series and other characters.
  3. Calls `buildCharacterRegenerationPrompt()` with series context and other characters.
  4. Calls `callOpenAI(prompt)`.
  5. Parses response, updates the character's fields (personality, appearance, background, etc.) — **does NOT create a new character record**.
  6. Records usage, completes generation job.

### Locking
- **Toggle:** `PATCH /api/characters/:id/lock` with `{ isLocked: true/false }`.
- Backend: `character.service.ts → toggleCharacterLock()` → `prisma.character.update({ isLocked })`.
- **Guard:** In `regenerateCharacter()`, if `character.isLocked === true`, throws `Error('LOCKED: ...')`.
- Controller catches this and returns `403` with `code: 'CHARACTER_LOCKED'`.

### How Character Consistency Is Maintained in Later AI Prompts
- In `buildSeriesGenerationPrompt()`: locked characters are formatted into a `LOCKED CHARACTERS` section with full profiles and the instruction "use them EXACTLY as described with no changes."
- In `buildEpisodeGenerationPrompt()`: all characters are listed with `[LOCKED]` labels, and instructions say "Use ONLY these characters for continuity."
- In `buildSceneRegenerationPrompt()`: characters are listed with `[LOCKED]` labels.
- In `buildEpisodeOutlineRegenerationPrompt()`: characters include `[LOCKED]` labels.

---

## 9. EPISODE WORKSPACE

### Episode Retrieval
- **File:** `frontend/src/app/series/[id]/episodes/[episodeId]/page.tsx`.
- On mount, calls `getEpisodeById(episodeId)` → `GET /api/episodes/:id`.
- Backend: `episode.service.ts → getEpisodeById()` returns the episode with nested `series` (including characters), `scenes` (with mediaAssets), `script`, and `mediaAssets`.

### Scenes
- Displayed in the **SCENES** tab.
- Each scene shows: number, title, location, characters (tags), action, dialogue, camera, mood.
- Scenes are ordered by `number` (ascending).

### Scene Editor
- Click the edit icon on a scene → opens `EditSceneModal.tsx`.
- Modal allows editing: title, location, characters, action, dialogue, camera, mood.
- Saves via `updateScene(id, data)` → `PUT /api/scenes/:id`.
- Backend: `scene.service.ts → updateScene()` → `prisma.scene.update()`.

### Script
- Displayed in the **SCRIPT** tab.
- Shows the full screenplay text in an editable textarea.
- On save, calls `updateScript(episodeId, content)` → `PUT /api/episodes/:episodeId/script`.
- Backend: `scene.service.ts → updateScript()` — if script exists, updates and increments `version`; if not, creates new.

### Media Generation
- Displayed in the **MEDIA** tab.
- For each scene, user can click "Generate Image", "Generate Video", or "Generate Voice".
- Frontend calls `generateMedia({ seriesId, episodeId, sceneId, type, sceneTitle })` → `POST /api/media/generate`.
- Backend creates a `GenerationJob` and runs `simulateMediaGeneration()` in the background.
- Frontend polls `getGenerationJob(jobId)` every ~1200ms to update progress bars.
- When complete, frontend fetches `getMediaByScene(sceneId)` to display the media asset.
- Assets can be deleted via `deleteMedia(id)` → `DELETE /api/media/:id`.

### Episode Regeneration
- Scene + script generation: `POST /api/episodes/:id/generate` → `episode.service.ts → generateEpisodeContent()`.
- Deletes existing scenes and script, generates new ones via Gemini, stores them.

### How episodeId and sceneId Are Used
- `episodeId` comes from the URL parameter `[episodeId]` in the Next.js route.
- Used to fetch the episode, generate content, publish, and update.
- `sceneId` comes from the scene objects returned by `getEpisodeById()`.
- Used for scene updates, regeneration, media generation, and media fetching.

---

## 10. PARTIAL REGENERATION

### Character Regeneration
- **Frontend action:** Click "Regenerate" on character card in Character Bible or Story Review.
- **API endpoint:** `POST /api/characters/:id/regenerate`
- **Backend function:** `character.service.ts → regenerateCharacter(characterId)`
- **Gemini prompt/context:** `buildCharacterRegenerationPrompt()` — includes series title, genre, tone, storyline, character name/role, and other characters in the ensemble.
- **Database update:** `prisma.character.update()` — updates the existing character record's age, gender, role, personality, appearance, background, description. **Does NOT create a new record.**
- **What remains unchanged:** The character's `id`, `seriesId`, `name`, and `isLocked` status remain. All other characters, episodes, and scenes are untouched.

### Episode Outline Regeneration
- **Frontend action:** Click "Regenerate Outline" on an episode card in Story Review.
- **API endpoint:** `POST /api/episodes/:id/regenerate-outline`
- **Backend function:** `episode.service.ts → regenerateEpisodeOutline(episodeId)`
- **Gemini prompt/context:** `buildEpisodeOutlineRegenerationPrompt()` — includes series title, genre, tone, storyline, all other episodes' summaries (for continuity), characters, and the current episode's existing title/summary.
- **Database update:** `prisma.episode.update()` — updates the existing episode's `title` and `summary` only. **Does NOT create a new record.**
- **What remains unchanged:** Episode's `id`, `seriesId`, `number`, `status`, `scenes`, and `script` are all preserved. Other episodes are untouched.

### Scene Regeneration
- **Frontend action:** Click "Regenerate Scene" in the Scenes tab of Episode Workspace.
- **API endpoint:** `POST /api/scenes/:id/regenerate`
- **Backend function:** `scene.service.ts → regenerateScene(sceneId)`
- **Gemini prompt/context:** `buildSceneRegenerationPrompt()` — includes series title, genre, tone, episode title/summary, scene number, and all characters with [LOCKED] labels.
- **Database update:** `prisma.scene.update()` — updates the existing scene's title, location, characters, action, dialogue, camera, mood. **Does NOT create a new record.**
- **What remains unchanged:** Scene's `id`, `episodeId`, `number` remain. All other scenes in the episode are untouched.

### How the Application Prevents Creating New Records
- Every regeneration uses `prisma.*.update({ where: { id } })`, never `prisma.*.create()`.
- The same database record is modified in-place.
- The `id` is read from the request parameter (e.g., `req.params.id`).

---

## 11. MOCK MEDIA GENERATION

### Implementation Overview
- **File:** `backend/src/services/media.service.ts`
- All media generation is mocked. No real AI image/video/audio model is called.
- Generates placeholder images from `placehold.co` with descriptive text.

### Image Generation
- User clicks "Generate Image" for a scene.
- **API endpoint:** `POST /api/media/generate` with `{ seriesId, episodeId, sceneId, type: "IMAGE", sceneTitle }`.
- Progress steps (lines 27–33):
  1. 10% — "Analyzing scene description…"
  2. 30% — "Composing visual layout…"
  3. 55% — "Rendering image with AI diffusion…"
  4. 80% — "Applying color grading…"
  5. 100% — "Image generation complete"

### Video Generation
- Progress steps (lines 34–41):
  1. 10% — "Extracting scene motion cues…"
  2. 25% — "Generating keyframes…"
  3. 50% — "Interpolating video frames…"
  4. 75% — "Adding transitions and effects…"
  5. 90% — "Encoding video output…"
  6. 100% — "Video generation complete"

### Voice/Audio Generation
- Progress steps (lines 42–49):
  1. 15% — "Analyzing dialogue and tone…"
  2. 40% — "Synthesizing voice with AI TTS…"
  3. 70% — "Mixing ambient audio layers…"
  4. 90% — "Normalizing audio levels…"
  5. 100% — "Audio generation complete"

### GenerationJob
- `generateMockMedia()` creates a `GenerationJob` with `status: 'QUEUED'`, `type: 'SCENE'`, `targetId: sceneId`.
- Returns `{ jobId }` to the frontend immediately (non-blocking).

### Progress Simulation
- `simulateMediaGeneration()` runs as a detached async function.
- Iterates through `PROGRESS_STEPS[type]`, applying 800–2000ms random delay per step.
- Updates `GenerationJob.progress` and `GenerationJob.steps` (JSON array) at each step.

### MediaAsset Creation
- On completion, creates a `MediaAsset` record:
  - `url`: Placeholder URL from `placehold.co` with scene title embedded.
  - `provider`: `'mock-ai'`.
  - `status`: `'READY'`.
  - `filename`: Descriptive filename like "Scene Image — Kitchen Scene.png".

### Placeholder Asset
- Uses `MOCK_PLACEHOLDERS` dictionary (lines 6–23):
  - IMAGE: `https://placehold.co/1920x1080/1a1a2e/e94560?text=AI+Generated+Image`
  - VIDEO: `https://placehold.co/1920x1080/0d1b2a/00d4ff?text=AI+Generated+Video`
  - AUDIO: `https://placehold.co/800x200/1b2838/22d3ee?text=AI+Generated+Audio`

### Completion
- `GenerationJob` updated to `status: 'COMPLETED'`, `progress: 100`, `completedAt: new Date()`.

### Failure
- If any error occurs during simulation, `GenerationJob` is updated to `status: 'FAILED'` with `error: err.message`.

### Retry
- Frontend can simply call `POST /api/media/generate` again for the same scene. A new job and asset are created.

### Persistence
- Both the `GenerationJob` and `MediaAsset` are persisted in PostgreSQL via Prisma.

### Distinction from Real Gemini Text Generation
- Mock media uses `setTimeout` delays and placeholder URLs. **No AI model is called.**
- Real text generation calls the Gemini API with structured prompts and parses JSON responses.
- They are completely separate code paths:
  - Text: `ai.service.ts → callGemini()` → real API call.
  - Media: `media.service.ts → generateMockMedia() → simulateMediaGeneration()` → timer-based simulation.

---

## 12. STORY REVIEW / APPROVAL

### Status Lifecycle

```
DRAFT → GENERATING → IN_REVIEW → READY → PUBLISHING → PUBLISHED
                ↘                                         
               FAILED (can happen from GENERATING or PUBLISHING)
```

### Where Statuses Are Stored
- `Series.status` — `SeriesStatus` enum in `schema.prisma` line 23.
- `Episode.status` — `EpisodeStatus` enum in `schema.prisma` line 64.

### How They Change

| Status | Set When | Set Where |
|--------|----------|-----------|
| `DRAFT` | Series/episode first created | `series.service.ts → createSeries()`, episode creation in `generateSeriesContent()` |
| `GENERATING` | Generation starts | `series.service.ts → generateSeriesContent()` line 155, `episode.service.ts → generateEpisodeContent()` line 89 |
| `IN_REVIEW` | Generation completes | `series.service.ts` line 233, `episode.service.ts` line 169 |
| `READY` | User clicks "Approve Story" | `frontend/src/app/series/[id]/page.tsx` → `updateSeries(id, { status: 'READY' })` |
| `PUBLISHING` | User clicks "Publish" | `episode.service.ts → publishEpisode()` line 247 |
| `PUBLISHED` | Publishing completes (simulated) | `episode.service.ts → publishEpisode()` line 258 |
| `FAILED` | Generation or publishing fails | Error handlers in `generateSeriesContent()` line 359, `generateEpisodeContent()` line 213 |

### Approval Flow
- On the Story Review page (`series/[id]/page.tsx`), after reviewing characters and episodes, the user clicks "Approve Story."
- Frontend calls `updateSeries(id, { status: 'READY' })` → `PUT /api/series/:id`.
- Backend: `series.service.ts → updateSeries()` → `prisma.series.update({ status: 'READY' })`.

---

## 13. CHARACTER GRAPH

### How CharacterRelationship Works
- **Model:** `CharacterRelationship` in `schema.prisma` lines 114–125.
- Represents a directed edge: `fromCharacterId` → `toCharacterId` with a `relationship` string.
- Unique constraint: `@@unique([fromCharacterId, toCharacterId])`.

### How the Graph Is Generated
- During `series.service.ts → generateSeriesContent()` lines 287–308:
  - If the Gemini response includes a `relationships` array, old relationships are deleted.
  - For each relationship, the service finds matching `Character` records by name and creates a `CharacterRelationship`.

### How the Graph Is Displayed
- **File:** `frontend/src/app/series/[id]/characters/page.tsx` and `frontend/src/app/series/[id]/page.tsx`.
- Characters are fetched via `getSeriesById()` which includes `relationshipsFrom` and `relationshipsTo` with joined character names.
- The Character Bible page shows relationships as text under each character card (e.g., "→ Maya: estranged sibling of").
- **No visual graph library (like React Flow) is used.** Relationships are displayed as text labels.

---

## 14. COST ESTIMATION

### GenerationUsage Model
- **Fields:**
  - `promptTokens`: Number of tokens in the prompt.
  - `completionTokens`: Number of tokens in the AI response.
  - `totalTokens`: Sum of prompt + completion.
  - `estimatedCost`: Calculated dollar cost (float).
  - `model`: Default `'gpt-4o-mini'` (legacy default string in schema).

### How Cost Is Calculated
- **File:** `backend/src/services/ai.service.ts → estimateCost()` lines 1309–1378.
- Uses hardcoded rates: `promptPer1k: 0.00015`, `completionPer1k: 0.0006`.
- Pre-defined token estimates per operation type:
  - `series`: 900 prompt + 2200 + (episodeCount × 220) completion.
  - `episode`: 1300 prompt + 3200 completion.
  - `episode_outline`: 500 prompt + 350 completion.
  - `character`: 550 prompt + 450 completion.
  - `scene`: 650 prompt + 550 completion.
- Returns a `breakdown[]` array showing per-item costs for the modal UI.

### How Cost Is Displayed
- Frontend fetches cost estimate before generation (e.g., `getSeriesCostEstimate(id)`).
- Opens `ConfirmCostModal.tsx` which shows:
  - Each breakdown item with token count and cost.
  - Total estimated prompt tokens, completion tokens, total tokens.
  - Total estimated cost in dollars.
  - Confirm / Cancel buttons.

### Actual Usage Recording
- After every successful Gemini call, each service records actual usage:
  ```typescript
  prisma.generationUsage.create({
    data: {
      seriesId, type, targetId,
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      totalTokens: usage.totalTokens,
      estimatedCost: (usage.promptTokens * 0.00015 / 1000) + (usage.completionTokens * 0.0006 / 1000),
    }
  })
  ```
- Usage summary available via `GET /api/series/:seriesId/usage`.

---

## 15. PUBLISHING

### Episode Selection
- In the Episode Workspace, user navigates to the **PUBLISH** tab.

### Platform Selection
- Frontend renders checkboxes for: Web, iOS, Android, Roku.
- User selects one or more platforms.

### Publishing State Flow
1. User clicks "Publish Episode".
2. Frontend calls `publishEpisode(episodeId, platforms)` → `POST /api/episodes/:id/publish` with `{ platforms: ["Web", "iOS"] }`.

### Backend Processing (`episode.service.ts → publishEpisode()`)
1. Validates the request: requires at least one platform.
2. Runs validation checks: `hasTitle`, `hasSummary`, `hasScenes` (> 0), `hasScript`, `hasPlatforms`.
3. If any check fails, returns `{ success: false, checks, message: 'Not all requirements are met for publishing' }`.
4. On success:
   - Updates episode: `status: 'PUBLISHING'`, saves `platforms` array.
   - Waits 1 second (simulated publishing delay).
   - Updates episode: `status: 'PUBLISHED'`, sets `publishedAt: new Date()`.
5. Returns `{ success: true, checks, message: 'Episode published successfully' }`.

### Success / Failure / Retry
- **Success:** Episode status becomes `PUBLISHED` with `publishedAt` timestamp.
- **Failure:** If validation fails, the frontend shows which checks failed. User can fix and retry.
- **Retry:** User can click publish again after fixing missing content.

---

## 16. API DOCUMENTATION

| Method | Endpoint | Purpose | Request Body | Response | Database Impact |
|--------|----------|---------|--------------|----------|-----------------|
| `GET` | `/api/series` | List all series | — | `{ success, data: Series[] }` | Read |
| `POST` | `/api/series` | Create a new series | `{ title?, prompt, genre, tone?, episodeCount?, episodeDuration? }` | `{ success, data: Series }` | Creates Series + upserts User |
| `GET` | `/api/series/:id` | Get full series with episodes, characters, relationships, jobs, usage | — | `{ success, data: Series }` | Read |
| `PUT` | `/api/series/:id` | Update series metadata | `{ title?, description?, storyline?, status?, genre?, tone? }` | `{ success, data: Series }` | Updates Series |
| `DELETE` | `/api/series/:id` | Delete series (cascades) | — | `{ success, message }` | Deletes Series + all children |
| `POST` | `/api/series/:id/generate` | Trigger AI series generation | — | `{ success, data: Series }` | Creates GenerationJob, GenerationUsage; creates/replaces Characters, Episodes, CharacterRelationships; updates Series status |
| `GET` | `/api/series/:id/cost-estimate` | Get cost estimate for series generation | — | `{ success, data: CostEstimate }` | Read |
| `GET` | `/api/series/:id/episodes` | List episodes for a series | — | `{ success, data: Episode[] }` | Read |
| `GET` | `/api/episodes/:id` | Get episode with series, scenes, script, media | — | `{ success, data: Episode }` | Read |
| `PUT` | `/api/episodes/:id` | Update episode | `{ title?, summary?, status? }` | `{ success, data: Episode }` | Updates Episode |
| `POST` | `/api/episodes/:id/generate` | Generate scenes + script via AI | — | `{ success, data: Episode }` | Creates GenerationJob, GenerationUsage; deletes/creates Scenes, Script; updates Episode status |
| `POST` | `/api/episodes/:id/regenerate-outline` | Regenerate single episode outline | — | `{ success, data: Episode }` | Creates GenerationJob, GenerationUsage; updates Episode title/summary |
| `GET` | `/api/episodes/:id/outline-cost-estimate` | Cost estimate for outline regeneration | — | `{ success, data: CostEstimate }` | Read |
| `POST` | `/api/episodes/:id/publish` | Publish episode to platforms | `{ platforms: string[] }` | `{ success, checks, message }` | Updates Episode status, platforms, publishedAt |
| `GET` | `/api/episodes/:id/cost-estimate` | Cost estimate for episode generation | — | `{ success, data: CostEstimate }` | Read |
| `GET` | `/api/series/:seriesId/characters` | List characters for a series | — | `{ success, data: Character[] }` | Read |
| `GET` | `/api/characters/:id` | Get character with relationships | — | `{ success, data: Character }` | Read |
| `PUT` | `/api/characters/:id` | Update character | `{ name?, age?, gender?, role?, personality?, appearance?, background?, description? }` | `{ success, data: Character }` | Updates Character |
| `PATCH` | `/api/characters/:id/lock` | Toggle character lock | `{ isLocked: boolean }` | `{ success, data: Character }` | Updates Character.isLocked |
| `POST` | `/api/characters/:id/regenerate` | Regenerate character via AI | — | `{ success, data: Character }` | Creates GenerationJob, GenerationUsage; updates Character fields |
| `GET` | `/api/characters/:id/cost-estimate` | Cost estimate for character regeneration | — | `{ success, data: CostEstimate }` | Read |
| `GET` | `/api/scenes/:id` | Get scene with media | — | `{ success, data: Scene }` | Read |
| `PUT` | `/api/scenes/:id` | Update scene | `{ title?, location?, action?, dialogue?, camera?, mood?, characters? }` | `{ success, data: Scene }` | Updates Scene |
| `POST` | `/api/scenes/:id/regenerate` | Regenerate single scene via AI | — | `{ success, data: Scene }` | Creates GenerationJob, GenerationUsage; updates Scene fields |
| `GET` | `/api/scenes/:id/cost-estimate` | Cost estimate for scene regeneration | — | `{ success, data: CostEstimate }` | Read |
| `PUT` | `/api/episodes/:episodeId/script` | Update screenplay script | `{ content: string }` | `{ success, data: Script }` | Creates/updates Script, increments version |
| `POST` | `/api/media/upload` | Upload file (Cloudinary or demo) | `FormData with file + episodeId? + sceneId? + type?` | `{ success, data: MediaAsset }` | Creates MediaAsset |
| `POST` | `/api/media/generate` | Trigger mock media generation | `{ seriesId, episodeId, sceneId, type, sceneTitle? }` | `{ success, data: { jobId } }` | Creates GenerationJob; async creates MediaAsset |
| `GET` | `/api/episodes/:episodeId/media` | Get media assets for episode | — | `{ success, data: MediaAsset[] }` | Read |
| `GET` | `/api/scenes/:sceneId/media` | Get media assets for scene | — | `{ success, data: MediaAsset[] }` | Read |
| `DELETE` | `/api/media/:id` | Delete media asset | — | `{ success, message }` | Deletes MediaAsset (+ Cloudinary file if applicable) |
| `GET` | `/api/generations/:id` | Poll generation job status | — | `{ success, data: GenerationJob }` | Read |
| `GET` | `/api/series/:seriesId/usage` | Get generation usage stats | — | `{ success, data: { usages, summary } }` | Read |
| `GET` | `/api/health` | Health check | — | `{ status, timestamp, demoMode }` | Read |

---

## 17. FRONTEND DATA FLOW

### How Frontend Calls Backend
- **File:** `frontend/src/services/api.ts`.
- Central `fetchAPI(endpoint, options)` function wraps `fetch()`.
- Base URL: `http://localhost:5000/api` (hardcoded).
- Automatically sets `Content-Type: application/json` (except for FormData).
- After response, checks `data.success`. If false, throws an error with the message.
- Returns `data.data` (the payload).

### No axios — Pure fetch
- The project uses the native browser `fetch()` API. No axios or other HTTP client.

### Loading States
- Every page uses `const [loading, setLoading] = useState(true)` and displays a spinner or skeleton until data loads.
- During AI generation: `const [generating, setGenerating] = useState(false)` controls button disabled states and loading indicators.

### Error States
- `const [error, setError] = useState("")` — error messages are displayed as banners in the UI.
- Try/catch blocks around every API call. On catch, sets error state.
- Error messages are shown as styled alert boxes (e.g., `<div>` with error styling).

### Refresh / Revalidation
- After mutations (edit, regenerate, approve), the component calls the load function again to re-fetch data.
- For generation progress: uses `setInterval` or `setTimeout`-based polling on `getGenerationJob(jobId)`.

### How IDs Are Passed Between Pages
- URL parameters: `[id]` and `[episodeId]` are extracted via `useParams()` and the `use()` hook for async params.
- When navigating: `router.push(\`/series/${seriesId}\`)` or `<Link href={...}>`.
- IDs flow from Dashboard → Series Overview → Episode Workspace via URL segments.

---

## 18. ERROR HANDLING

### When Gemini Fails
- **File:** `backend/src/services/ai.service.ts` lines 70–79.
- Each call retries up to 2 times per model, tries up to 3 models.
- After all retries, throws `Error('Gemini API Error: [actual message]')`.
- Calling service catches it, sets `GenerationJob.status = 'FAILED'` with the error message.
- Sets entity status to `'FAILED'`.
- Frontend displays the error via the error state variable.

### When Database Fails
- All Prisma calls are inside try/catch blocks.
- On error, controllers return `res.status(500).json({ success: false, error: error.message })`.
- Global error handler in `backend/src/index.ts` catches unhandled errors.

### When Generation Fails
- `GenerationJob.status` set to `'FAILED'` with `error` field containing the message.
- Entity (Series/Episode) status set to `'FAILED'`.
- Frontend polling detects the FAILED status and displays the error.
- No automatic retry — user must manually trigger regeneration again.

### When Publishing Fails
- Validation checks prevent publishing incomplete content.
- Controller returns `400` with `{ success: false, checks, message }` showing which checks failed.
- Frontend displays the failed checks to the user.

### When Invalid Input Is Submitted
- Controllers validate required fields (e.g., `prompt and genre are required`, `isLocked must be a boolean`, `At least one platform is required`).
- Returns `400` status code with descriptive error message.
- Frontend `fetchAPI()` throws an error if `data.success` is false.

---

## 19. SECURITY

### Environment Variables
- **File:** `backend/src/config/index.ts`.
- Uses `dotenv.config()` to load from `backend/.env`.
- API key sanitized: trimmed, surrounding quotes stripped.
- Startup diagnostic masks the key: shows first 5 and last 4 characters only.

### API Key Handling
- `GEMINI_API_KEY` is never logged in full.
- If key is missing, `isDemoMode` is true and mock data is used instead of real API calls.
- Cloudinary keys handled similarly — missing keys trigger demo placeholder mode.

### Validation
- Controllers validate required fields before processing:
  - `createSeries`: requires `prompt` and `genre`.
  - `toggleCharacterLock`: requires `isLocked` to be a boolean.
  - `publishEpisode`: requires non-empty `platforms` array.
  - `generateMedia`: requires `seriesId`, `episodeId`, `sceneId`, `type`; validates type is IMAGE/VIDEO/AUDIO.
  - `updateScript`: requires `content`.
  - `uploadMedia`: requires `req.file`.

### Authentication
- **Not implemented.** There is no login, signup, JWT, session, or auth middleware.
- A hardcoded demo user (`demo@microdrama.local`) is auto-upserted when creating series.
- All API endpoints are publicly accessible without authentication.

### CORS
- **File:** `backend/src/index.ts` lines 9–13.
- In production: restricts origin to `config.frontendUrl` (from `FRONTEND_URL` env var).
- In development: `origin: true` (allows all origins).
- `credentials: true` is set.

### Rate Limiting
- **Not implemented.** No rate limiting middleware.

### Other Security
- `express.json({ limit: '10mb' })` — limits JSON body size.
- `multer` limits file uploads to 10MB: `limits: { fileSize: 10 * 1024 * 1024 }`.
- No SQL injection risk: Prisma uses parameterized queries.
- No XSS risk on server: responses are JSON only.

---

## 20. END-TO-END EXAMPLE

**Scenario: User creates a cybersecurity thriller series, edits a character, generates an episode, and publishes it.**

### Step 1: User Enters Story Prompt
- **Page:** `frontend/src/app/create/page.tsx`
- User fills: prompt = "A lone cybersecurity analyst discovers an AI entity hiding inside the nation's power grid", genre = "Thriller", tone = "SUSPENSEFUL", episodeCount = 5, episodeDuration = 3.
- User clicks "Generate Series."
- Code: `createSeries(formData)` → `fetchAPI('/series', POST)`.
- Backend: `series.controller.ts → createSeries()` → `series.service.ts → createSeries()` → Prisma creates Series with `status: DRAFT`.

### Step 2: Cost Gate
- Code: `getSeriesCostEstimate(seriesId)` → `series.service.ts → getSeriesCostEstimate()` → `ai.service.ts → estimateCost('series', 5)`.
- Returns: ~3600 total tokens, ~$0.0009.
- `ConfirmCostModal.tsx` opens. User clicks "Confirm & Generate."

### Step 3: Gemini Generates Story
- Code: `generateSeries(seriesId)` → `series.controller.ts → generateSeries()` → `series.service.ts → generateSeriesContent()`.
- Creates GenerationJob. Updates Series status to GENERATING.
- Calls `buildSeriesGenerationPrompt()` in `prompts/index.ts`.
- Calls `callGemini(prompt)` in `ai.service.ts`. Gemini returns JSON with title, characters, episodes, relationships.
- Service parses JSON. Creates Character records, Episode records, CharacterRelationship records. Updates Series status to IN_REVIEW.

### Step 4: User Opens Character Bible
- **Page:** `frontend/src/app/series/[id]/characters/page.tsx`
- Calls `getSeriesById(id)`. Displays character cards with profiles and relationships.

### Step 5: User Edits/Regenerates a Character
- User clicks edit icon → `EditCharacterModal.tsx` opens → user changes personality → saves.
- Code: `updateCharacter(id, data)` → `PUT /api/characters/:id` → `character.service.ts → updateCharacter()`.
- Or user clicks "Regenerate" → cost modal → confirm → `regenerateCharacter(id)` → `POST /api/characters/:id/regenerate`.
- Backend: `character.service.ts → regenerateCharacter()` → checks lock → builds prompt → calls Gemini → updates character record.

### Step 6: User Opens Episode Workspace
- **Page:** `frontend/src/app/series/[id]/episodes/[episodeId]/page.tsx`
- Calls `getEpisodeById(episodeId)`. Displays 5 tabs.
- User clicks "Generate Scenes & Script" (STORY tab).
- Code: `generateEpisode(episodeId)` → `episode.service.ts → generateEpisodeContent()`.
- Gemini generates 3–5 scenes and a screenplay script. Stored in DB.

### Step 7: User Edits a Scene
- SCENES tab → user clicks edit on Scene 2 → `EditSceneModal.tsx` → changes dialogue → saves.
- Code: `updateScene(sceneId, data)` → `PUT /api/scenes/:id` → `scene.service.ts → updateScene()`.

### Step 8: User Generates Mock Image/Video/Voice
- MEDIA tab → user clicks "Generate Image" on Scene 1.
- Code: `generateMedia({ seriesId, episodeId, sceneId, type: 'IMAGE' })` → `POST /api/media/generate`.
- Backend: `media.service.ts → generateMockMedia()` → creates GenerationJob → runs `simulateMediaGeneration()` in background.
- Frontend polls `getGenerationJob(jobId)` every 1200ms → shows progress bar (10% → 30% → 55% → 80% → 100%).
- On complete: `getMediaByScene(sceneId)` → displays the placeholder image.

### Step 9: User Reviews Story
- **Page:** `frontend/src/app/series/[id]/page.tsx`
- Reviews character cards, episode list, generated content.

### Step 10: User Approves
- Clicks "Approve Story" → `updateSeries(id, { status: 'READY' })` → `PUT /api/series/:id`.

### Step 11: User Publishes Episode
- Episode Workspace → PUBLISH tab → selects Web + iOS → clicks "Publish Episode."
- Code: `publishEpisode(episodeId, ['Web', 'iOS'])` → `POST /api/episodes/:id/publish`.
- Backend: validates → sets PUBLISHING → 1s delay → sets PUBLISHED + publishedAt.

---

## 21. INTERVIEW EXPLANATION

### "How I Built This Project"

> "I built Micro Drama Studio, which is a full-stack web app for creating AI-powered micro-drama series. The frontend is Next.js 16 with the App Router, React 19, TypeScript, and Tailwind CSS. The backend is an Express.js REST API running on Node.js with TypeScript.
>
> The database is PostgreSQL, and I use Prisma ORM for type-safe database access with 10 models including Series, Episodes, Characters, Scenes, Scripts, and MediaAssets, plus GenerationJob for tracking async AI tasks.
>
> For AI text generation, I integrated the Google Gemini API using the `@google/genai` SDK. The backend has a centralized prompt engineering module with 5 template functions that construct structured prompts with context injection. I enforce JSON output using Gemini's `responseMimeType: 'application/json'` and system instructions.
>
> A key engineering challenge was character consistency across episodes. LLMs often drift — changing character names, backgrounds, or personality traits across different generation calls. I solved this with a Character Locking system: creators can 'lock' a character, which does two things — it prevents server-side regeneration (returns 403) and it injects the locked character's full profile verbatim into every future prompt with explicit instructions not to alter them.
>
> I also implemented granular partial regeneration. Instead of regenerating an entire series when something needs to change, users can regenerate a single character, a single episode outline, or a single scene. Each regeneration updates the existing database record in-place using Prisma's `update()` method, preserving all other content.
>
> Every AI generation shows a transparent cost estimate before execution using a confirmation modal. The system tracks actual token usage in a GenerationUsage table for auditing.
>
> For media, image, video, and audio generation is mocked per the assignment requirements. The mock system uses a GenerationJob table with simulated progress steps and realistic delays, creating placeholder MediaAsset records on completion. The frontend polls the job status to show progress bars.
>
> The episode workspace has 5 production tabs: Story overview, Scene breakdown with editing, Media generation studio, Screenplay script editor, and multi-platform publishing to Web, iOS, Android, and Roku.
>
> The architecture follows clean separation of concerns: React components → API client → Express routes → Controllers → Services → Prisma → PostgreSQL. Error handling propagates actual error messages through the stack — the system never silently substitutes mock data for failed real generation."

---

## 22. IMPORTANT FUNCTIONS

| # | File | Function | What It Does | Why It Matters |
|---|------|----------|-------------|----------------|
| 1 | `ai.service.ts` | `callGemini()` | Calls Gemini API with retry + model fallback cascade | Core AI function — every text generation goes through this |
| 2 | `ai.service.ts` | `callMockAI()` | Routes to appropriate mock data generator based on prompt content | Enables demo mode without API key |
| 3 | `ai.service.ts` | `isDemoMode()` | Returns whether the app is running without an API key | Controls mock vs. real AI throughout the app |
| 4 | `ai.service.ts` | `estimateCost()` | Calculates estimated token count and dollar cost per operation type | Powers the cost confirmation modal |
| 5 | `ai.service.ts` | `getGeminiClient()` | Lazily initializes and caches the Gemini SDK client | Handles API key changes at runtime |
| 6 | `series.service.ts` | `generateSeriesContent()` | Orchestrates the entire series generation pipeline: prompt → Gemini → parse → store characters + episodes + relationships | The most complex function in the codebase (100+ lines) |
| 7 | `series.service.ts` | `createSeries()` | Creates initial Series record in DRAFT state | Entry point for new projects |
| 8 | `series.service.ts` | `getSeriesById()` | Deep-loads series with all nested data (episodes, characters, relationships, jobs, usage) | Primary data fetcher for the frontend |
| 9 | `series.service.ts` | `updateJobProgress()` | Updates GenerationJob progress percentage and step labels | Drives real-time progress UI |
| 10 | `episode.service.ts` | `generateEpisodeContent()` | Generates scenes + script for an episode via Gemini | Core episode content creation |
| 11 | `episode.service.ts` | `regenerateEpisodeOutline()` | Regenerates a single episode's title and summary | Non-destructive partial regeneration |
| 12 | `episode.service.ts` | `publishEpisode()` | Validates and publishes episode to platforms | End of production workflow |
| 13 | `character.service.ts` | `regenerateCharacter()` | Regenerates a single character with ensemble context, respecting lock | Partial character regeneration with consistency guard |
| 14 | `character.service.ts` | `toggleCharacterLock()` | Sets isLocked flag on a character | Enables/disables character consistency protection |
| 15 | `scene.service.ts` | `regenerateScene()` | Regenerates a single scene with episode/character context | Finest-grain partial regeneration |
| 16 | `scene.service.ts` | `updateScript()` | Creates or updates episode screenplay, bumps version | Script editing with version tracking |
| 17 | `media.service.ts` | `generateMockMedia()` | Starts a mock media generation job | Entry point for simulated media pipeline |
| 18 | `media.service.ts` | `simulateMediaGeneration()` | Runs background timer-based progress simulation, creates MediaAsset | Simulates realistic AI media generation |
| 19 | `media.service.ts` | `deleteMedia()` | Removes MediaAsset from DB (and Cloudinary if real) | Asset management |
| 20 | `prompts/index.ts` | `buildSeriesGenerationPrompt()` | Constructs the full series generation prompt with locked character injection | Most important prompt template |
| 21 | `prompts/index.ts` | `buildEpisodeGenerationPrompt()` | Constructs episode scene/script generation prompt | Episode-level prompt with character continuity |
| 22 | `prompts/index.ts` | `buildCharacterRegenerationPrompt()` | Constructs single-character regeneration prompt with ensemble context | Ensures new character fits existing cast |
| 23 | `prompts/index.ts` | `buildSceneRegenerationPrompt()` | Constructs single-scene regeneration prompt | Targeted scene rewriting |
| 24 | `prompts/index.ts` | `buildEpisodeOutlineRegenerationPrompt()` | Constructs episode outline regen prompt with surrounding episodes | Narrative continuity across episodes |
| 25 | `api.ts` (frontend) | `fetchAPI()` | Central API client with error handling | Single point of communication with backend |
| 26 | `series.controller.ts` | `createSeries()` | Validates input, upserts demo user, delegates to service | Entry point for series creation API |
| 27 | `character.controller.ts` | `regenerateCharacter()` | Handles lock error (403) separately from server errors (500) | Meaningful error differentiation |
| 28 | `config/index.ts` | `config` object | Reads and sanitizes all environment variables | Central configuration |

---

## 23. COMMON INTERVIEW QUESTIONS

### Q1: Why did you choose Next.js for the frontend?
**A:** Next.js 16 with the App Router provides file-system-based routing which maps cleanly to our URL structure (`/series/[id]/episodes/[episodeId]`). It supports React Server Components for better performance, has built-in TypeScript support, and Turbopack for fast development hot-reload. The App Router convention also made it natural to organize pages by feature.

### Q2: Why Express.js instead of Next.js API routes?
**A:** Separating the backend into its own Express server gives us clean separation of concerns, independent deployment, and a traditional MVC-like architecture (controllers → services → database). It also avoids Next.js serverless function cold starts for AI operations that can take several seconds.

### Q3: Why PostgreSQL over MongoDB or SQLite?
**A:** The data model has complex relational structures — series have episodes, episodes have scenes, characters have bi-directional relationships, generation jobs track per-entity progress. PostgreSQL handles these relationships natively with foreign keys, cascade deletes, unique constraints, and complex JOINs via Prisma. A document database would require manual denormalization and consistency management.

### Q4: Why Prisma ORM?
**A:** Prisma generates TypeScript types directly from the schema, giving compile-time safety for all database queries. It has a clean, intuitive API (`findMany`, `create`, `update`, `delete`), handles relations elegantly with `include`, and provides schema migrations. The generated types mirror what the frontend expects, reducing runtime errors.

### Q5: Why Google Gemini over OpenAI?
**A:** Gemini was chosen as it supports native JSON output via `responseMimeType: 'application/json'`, which eliminates unreliable regex parsing of LLM responses. It also supports system instructions for persona-based prompting, has competitive pricing, and the `@google/genai` SDK provides a clean API.

### Q6: How does partial regeneration work?
**A:** Instead of regenerating the entire series, the system targets specific entities. Each regeneration function (character, episode outline, scene) builds a context-aware prompt that includes the surrounding entities, calls Gemini, and uses `prisma.*.update({ where: { id } })` to modify the existing record in-place. No new records are created, so all other content remains unchanged.

### Q7: How is character consistency maintained across episodes?
**A:** Through the Character Locking system. When a character is locked (`isLocked: true`), their full profile (name, personality, appearance, background) is injected verbatim into every Gemini prompt with the instruction "use them EXACTLY as described with no changes." Server-side, regeneration requests for locked characters are rejected with a 403 status. This prevents both AI drift and accidental human overwriting.

### Q8: How does mock media generation work?
**A:** Mock media generation uses a GenerationJob record in PostgreSQL. When triggered, a background async function runs timer-based progress steps (e.g., 10% → 30% → 55% → 80% → 100%) with realistic delays (800–2000ms each). The frontend polls the job status every ~1200ms to show progress bars. On completion, a MediaAsset record is created with a placeholder URL from placehold.co.

### Q9: How is API failure handled?
**A:** The Gemini call retries up to 2 times per model and tries up to 3 different models. If all fail, the actual error message is stored in `GenerationJob.error`, the entity status is set to FAILED, and the error propagates to the frontend. Mock data is never silently substituted in production mode.

### Q10: How does the database relationship work?
**A:** The schema uses a hierarchical relationship: User → Series → (Episodes, Characters, GenerationJobs, GenerationUsage). Episodes → (Scenes, Script, MediaAssets). Scenes → MediaAssets. Characters → CharacterRelationships. All child relationships use `onDelete: Cascade`, so deleting a series removes everything beneath it.

### Q11: How does the frontend communicate with the backend?
**A:** Through a centralized `fetchAPI()` function in `frontend/src/services/api.ts` that wraps the native `fetch()` API. It adds `Content-Type: application/json`, checks `response.data.success`, throws on failure, and returns `data.data`. Named exports provide typed wrappers for every endpoint.

### Q12: What is the ConfirmCostModal and why does it exist?
**A:** It's a blocking modal that shows estimated token usage and dollar cost before any AI generation runs. This prevents unexpected API expenses and gives the creator a conscious decision point.

### Q13: How are URLs/routing structured?
**A:** `/` (Dashboard), `/create` (Create Wizard), `/series/[id]` (Series Overview / Story Review), `/series/[id]/characters` (Character Bible), `/series/[id]/episodes/[episodeId]` (Episode Workspace). IDs flow through URL parameters.

### Q14: What is the GenerationJob table used for?
**A:** It tracks async AI operations. When generation starts, a job is created with `status: QUEUED` or `GENERATING`. The frontend polls `GET /api/generations/:id` to show real-time progress. When done, status becomes COMPLETED with progress 100%. On failure, status becomes FAILED with the error message.

### Q15: How does the theme system work?
**A:** The sidebar has a 3-way theme switcher (Dark/Light/System). It saves the choice to `localStorage` under `mds-theme` and sets `document.documentElement.dataset.theme`. CSS custom properties in `globals.css` change values based on `[data-theme="light"]` selectors.

### Q16: What happens if the user creates a series without a Gemini API key?
**A:** The app runs in Demo Mode. `isDemoMode()` returns true. `callGemini()` falls through to `callMockAI()` which returns pre-built story data from 13 semantic domains (corporate, cybersecurity, romance, horror, etc.). The Topbar shows "Demo AI Mode" with an amber badge.

### Q17: How does the seed script work?
**A:** `backend/prisma/seed.ts` creates a demo series called "The Last Metro" with 4 characters, 5 episodes, 16 scenes, a screenplay script, and character relationships. It upserts a demo user and provides pre-populated data for immediate testing.

### Q18: How are scenes structured?
**A:** Each scene has: number (sequence), title, location (INT/EXT slugline format), characters (string array), action (stage directions), dialogue (screenplay format), camera (shot descriptions), and mood (emotional tone). This mirrors professional screenplay format.

### Q19: Why use a separate Script model instead of storing script in Episode?
**A:** Separating Script into its own model with a version field allows independent editing and version tracking. The creator can edit the script text without affecting the structured scene data, and vice versa. The one-to-one relationship with Episode (`@unique episodeId`) ensures data integrity.

### Q20: How does the concurrency guard work in generateSeriesContent?
**A:** Before starting generation, the service checks for an existing `GenerationJob` with `status: 'GENERATING'` and `createdAt` within the last 2 minutes. If found, it returns the current series data without creating a duplicate job. This prevents rapid double-clicks from triggering multiple AI calls.

### Q21: What library is used for icons?
**A:** Lucide React — a modern, clean icon library. Icons like `Sparkles`, `Lock`, `Film`, `Edit3`, `Wand2`, `Loader2` are used throughout the UI for visual consistency.

### Q22: What is AmbientCanvas?
**A:** A Three.js-powered background animation component (`frontend/src/components/AmbientCanvas.tsx`) that renders subtle visual effects behind the UI using `@react-three/fiber` and `@react-three/drei`. It adds visual depth to the studio aesthetic.

### Q23: How is the Create Wizard structured?
**A:** 4-step flow: (1) Story Idea — prompt/genre, (2) Series Details — tone/count/duration, (3) AI Generation — cost gate + progress, (4) Review — redirects to series page. Uses a single React component with step state management.

### Q24: Why does `callOpenAI` still exist in the code?
**A:** It's an alias: `export const callOpenAI = callGemini`. This was left for backward compatibility when migrating from OpenAI to Gemini. All service files import `callOpenAI` but it actually calls `callGemini()`.

### Q25: How does the publishing validation work?
**A:** Before publishing, `publishEpisode()` runs 5 checks: hasTitle, hasSummary, hasScenes (>0), hasScript, hasPlatforms. If any check fails, it returns the check results so the frontend can show exactly what's missing.

---

## 24. PROJECT LIMITATIONS

### Mocked Components
1. **Image/Video/Audio Generation:** Completely mocked. Uses placeholder images from placehold.co with simulated timer-based progress. No actual AI diffusion, video generation, or TTS model is called.
2. **Publishing:** Simulated with a 1-second `setTimeout` delay. No actual platform API integration (no App Store, Google Play, or Roku SDK calls).
3. **File Uploads:** Cloudinary integration exists but falls back to placeholder URLs if Cloudinary credentials are missing.

### Authentication
- **No authentication system.** No login, signup, JWT tokens, OAuth, or session management.
- All users share a single hardcoded demo user account (`demo@microdrama.local`).
- All API endpoints are publicly accessible.

### Not Production-Ready
1. **No rate limiting** — any client can call AI endpoints without throttling.
2. **No input sanitization beyond basic validation** — no XSS protection on stored content.
3. **Hardcoded API base URL** (`http://localhost:5000/api`) in the frontend — not configurable via environment variables.
4. **No WebSocket support** — progress tracking uses HTTP polling.
5. **No pagination** — `getAllSeries()` returns all records without limits.
6. **No HTTPS** — development server only.
7. **Single-server architecture** — no load balancing, horizontal scaling, or microservices.

### Cost Estimation
- Token estimates are hardcoded heuristics, not based on actual prompt tokenization.
- Dollar rates are hardcoded (`$0.00015/1k prompt, $0.0006/1k completion`), not dynamically fetched from the API provider.
- The `GenerationUsage.model` field defaults to `'gpt-4o-mini'` (a legacy value from before the Gemini migration) in the schema.

### Other Limitations
- `openai` package (v6.49.0) is still in `package.json` dependencies even though it's not actively used — can be removed.
- Character relationship graph is displayed as text, not as an interactive visual graph.
- No undo/redo for manual edits.
- No collaborative editing or multi-user support.
- Script formatting is plain text in a textarea, not a proper screenplay editor with enforced formatting.

---

## 25. FINAL ARCHITECTURE DIAGRAM

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                   │
│   Next.js 16 (App Router) + React 19 + TypeScript + Tailwind     │
│                                                                   │
│   Pages:                        Components:                       │
│   ├── / (Dashboard)            ├── Sidebar.tsx                    │
│   ├── /create (Wizard)         ├── Topbar.tsx                     │
│   ├── /series/[id] (Review)    ├── ConfirmCostModal.tsx           │
│   ├── /series/[id]/characters  ├── EditStoryModal.tsx             │
│   └── /series/[id]/episodes/   ├── EditEpisodeModal.tsx           │
│       [episodeId] (Workspace)  ├── EditCharacterModal.tsx         │
│                                ├── EditSceneModal.tsx             │
│   API Client:                  └── AmbientCanvas.tsx              │
│   └── services/api.ts (fetch wrappers)                           │
└────────────────────────┬─────────────────────────────────────────┘
                         │ HTTP REST (JSON)
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                        BACKEND API                                │
│   Express.js v5 + TypeScript + Node.js (port 5000)               │
│                                                                   │
│   Routes ──► Controllers ──► Services ──► Prisma ──► PostgreSQL  │
│                                                                   │
│   routes/index.ts                                                 │
│     ├── Series:    GET/POST/PUT/DELETE + /generate + /cost-estimate│
│     ├── Episodes:  GET/PUT + /generate + /regenerate-outline      │
│     │              + /publish + /cost-estimate                    │
│     ├── Characters:GET/PUT + /lock + /regenerate + /cost-estimate │
│     ├── Scenes:    GET/PUT + /regenerate + /cost-estimate         │
│     ├── Scripts:   PUT                                            │
│     ├── Media:     POST /upload, POST /generate, GET, DELETE      │
│     ├── Generation:GET /generations/:id, GET /series/:id/usage    │
│     └── Health:    GET /health                                    │
│                                                                   │
│   Services:                                                       │
│     ├── ai.service.ts ──────────► Google Gemini API               │
│     │   └── callGemini()          (@google/genai SDK)             │
│     │   └── callMockAI()          (demo mode fallback)            │
│     │   └── estimateCost()                                        │
│     ├── series.service.ts                                         │
│     ├── episode.service.ts                                        │
│     ├── character.service.ts                                      │
│     ├── scene.service.ts                                          │
│     └── media.service.ts ───────► Cloudinary (optional)           │
│         └── generateMockMedia()   (placeholder images)            │
│         └── simulateMediaGeneration() (timer-based progress)      │
│                                                                   │
│   Prompts:                                                        │
│     └── prompts/index.ts (5 template functions)                   │
└────────────────────────┬─────────────────────────────────────────┘
                         │ Prisma Client (SQL)
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                     POSTGRESQL DATABASE                           │
│                                                                   │
│   User ──┬── Series ──┬── Episode ──┬── Scene ──── MediaAsset    │
│          │           │            ├── Script                      │
│          │           │            └── MediaAsset                  │
│          │           ├── Character ── CharacterRelationship       │
│          │           ├── GenerationJob                            │
│          │           └── GenerationUsage                          │
└──────────────────────────────────────────────────────────────────┘
```

**Media Generation Flow (Mock):**
```
Frontend: "Generate Image" button click
    ↓
POST /api/media/generate { type: "IMAGE", sceneId, episodeId, seriesId }
    ↓
media.controller.ts → generateMedia()
    ↓
media.service.ts → generateMockMedia()
    ↓
Creates GenerationJob (QUEUED → GENERATING)
    ↓
simulateMediaGeneration() runs async:
    10% → 30% → 55% → 80% → 100% (with 800-2000ms delays)
    Updates GenerationJob.progress at each step
    ↓
Creates MediaAsset (url: placehold.co/..., provider: 'mock-ai', status: 'READY')
    ↓
GenerationJob → COMPLETED (progress: 100%)
    ↓
Frontend polls GET /api/generations/:jobId → shows progress bar
    ↓
Frontend fetches GET /api/scenes/:sceneId/media → displays placeholder image
```

---

## FILES TO READ FIRST

Study these 15 files in this order to understand the project quickly:

| # | File | Why Read This First |
|---|------|-------------------|
| 1 | `backend/prisma/schema.prisma` | Understand all data models, relationships, and enums — the foundation of everything |
| 2 | `backend/src/config/index.ts` | See how env vars are loaded, API key handling, and demo mode detection |
| 3 | `backend/src/services/ai.service.ts` (lines 1–85) | Gemini client, callGemini(), retry logic, demo mode fallback |
| 4 | `backend/src/prompts/index.ts` | All 5 prompt templates — understand how context is injected into AI calls |
| 5 | `backend/src/services/series.service.ts` | Core series generation pipeline — the most important service |
| 6 | `backend/src/routes/index.ts` | All API routes in one file — the complete API surface |
| 7 | `frontend/src/services/api.ts` | Frontend API client — how frontend talks to backend |
| 8 | `frontend/src/types/index.ts` | All TypeScript types — matches Prisma models |
| 9 | `frontend/src/app/series/[id]/page.tsx` | Story Review page — largest frontend component, shows approval/editing/regen |
| 10 | `backend/src/services/character.service.ts` | Character regeneration + lock guard — key architectural pattern |
| 11 | `backend/src/services/episode.service.ts` | Episode generation + publish + outline regen |
| 12 | `backend/src/services/media.service.ts` | Mock media generation pipeline |
| 13 | `frontend/src/app/series/[id]/episodes/[episodeId]/page.tsx` | Episode workspace — 5 tabs, media, script |
| 14 | `frontend/src/app/create/page.tsx` | Create wizard — entry flow |
| 15 | `backend/src/index.ts` | Express server setup — CORS, middleware, error handling |
