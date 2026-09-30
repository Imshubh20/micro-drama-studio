# 🎬 Micro Drama Studio

> **An enterprise-grade, creator-centric AI studio for generating, editing, and publishing episodic micro-drama series.**  
> Engineered with Next.js, Express, PostgreSQL, Prisma ORM, and Google Gemini LLM orchestration.

## 📌 Executive Summary

The micro-drama industry (vertical short-form series popularized by platforms like ReelShort and DramaBox) is experiencing explosive growth. However, creators struggle with narrative pacing, continuity across ultra-short episodes (2–3 minutes each), high scriptwriting overhead, and fragmented asset pipelines.

**Micro Drama Studio** bridges this gap by providing an end-to-end generative AI workflow. Unlike simplistic "one-shot" AI tools that hallucinate and strip creators of control, Micro Drama Studio is designed around **human-in-the-loop control**:
- **Character Continuity Engine:** Character profiles can be "locked", injecting established lore verbatim into future prompts to eliminate LLM character drift.
- **Granular Partial Regeneration:** Regenerate single scenes, individual episode outlines, or specific characters without wiping or re-billing the rest of the project.
- **Pre-Flight Cost Confirmation:** Transparent token and monetary estimations prior to running expensive AI generation tasks.
- **Full Production Workspace:** 5-tab episode workbench covering Story Outlining, Scene Breakdown, Media Generation (image/video/voice), Screenplay Scriptwriting, and Multi-Platform Publishing.

---

## 🌟 Key Capabilities & Technical Features

### 1. 🤖 Live LLM Text Generation (Google Gemini)
- Powered by official `@google/genai` client integration.
- Generates titles, loglines, deep character bibles (personality, appearance, background, relationships), episodic outlines, scene breakdowns (location, action, dialogue, mood, camera framing), and formatted screenplays.
- Enforces strict `application/json` output schemas with system-level instruction guarding against generic placeholder names and hallucinatory drift.
- Includes a resilient cascade mechanism (`gemini-3.8-flash`, `gemini-3.5-flash-lite`, etc.) with automatic retry and error reporting.

### 2. 🔒 Character Consistency & Locking Engine
- LLMs frequently alter character names, backstories, or appearances midway through a series.
- Our **Character Locking** feature flags verified characters in PostgreSQL (`isLocked: true`).
- During episodic scene generation or outline updates, locked character profiles are isolated and injected verbatim into the Gemini prompt with explicit constraints forbidding alteration.
- Server-side validation actively blocks unauthorized regeneration requests on locked characters (`403 Forbidden`).

### 3. 🎯 Granular Partial Regeneration (Non-Destructive)
- **Single Character Regeneration:** Re-architect one character's profile while injecting existing ensemble context to maintain group chemistry.
- **Single Episode Outline Regeneration:** Re-roll an episode's beat sheet without impacting preceding or succeeding story arcs.
- **Single Scene Regeneration:** Revise specific scene dialogue and action while preserving all other scenes in the episode.
- **Manual Editing Modals:** Direct creator override for series metadata, episode synopses, character traits, and scene parameters.

### 4. 💰 Pre-Flight Cost Estimation & Confirmation Gates
- Prevents unexpected API expenses with pre-flight token usage calculation.
- Displays an interactive **ConfirmCostModal** showing prompt tokens, completion tokens, and dollar cost estimates before executing any generative pipeline.
- Logs all generation metrics into PostgreSQL (`GenerationUsage` table) for operational auditing.

### 5. 🎨 Simulated Media Generation Pipeline
- Supports **Mock Image, Video, and Voice-over (Audio)** asset generation per scene or episode.
- Simulates realistic multi-step AI generation progress:
  - **Image:** 0% → 20% → 50% → 80% → 100% (Prompt analysis, layout composition, diffusion render, color grading).
  - **Video:** 0% → 25% → 50% → 75% → 100% (Motion cues, keyframe generation, frame interpolation, encoding).
  - **Audio / Voice:** 0% → 30% → 60% → 100% (Dialogue tone analysis, TTS synthesis, audio normalization).
- Real-time job polling via `GenerationJob` table (`QUEUED` → `GENERATING` → `COMPLETED` / `FAILED`).
- Persists assets in PostgreSQL (`MediaAsset` table) linked to `sceneId` and `episodeId`.
- Features local preview players, error states with retry mechanisms, and asset deletion.

### 6. 🎬 Episode Workspace (5 Production Tabs)
1. **Story:** High-level episode overview, episode number, title, logline, synopsis, and outline controls.
2. **Scenes:** Granular scene breakdown with location tags, participating characters, action lines, dialogue blocks, camera angles, and emotional moods.
3. **Media:** Scene-level generative asset studio (generate images, videos, voice-overs with live progress tracking and preview players).
4. **Script:** Standard industry screenplay editor with real-time editing and save capabilities.
5. **Publish:** Multi-platform deployment workflow targeting Web, iOS, Android, and Roku with status progression.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Frontend ["Frontend (Next.js 16 + React 19 + TypeScript)"]
        UI_Dash[Dashboard & Series List]
        UI_Wiz[Create Wizard + Cost Gate]
        UI_Review[Story Review & Approval]
        UI_Bible[Character Bible & Lock Toggle]
        UI_Work[Episode Workspace: 5 Tabs]
    end

    subgraph Backend ["Backend (Express.js + TypeScript + Node.js)"]
        API[Express Router /api]
        Controller[Controllers: Series, Episode, Character, Scene, Media]
        Service[Service Layer: Business Logic & Orchestration]
        PromptEngine[Prompt Templates & Context Injector]
    end

    subgraph AI_Layer ["AI & Media Services"]
        Gemini[Google Gemini API @google/genai]
        MediaSim[Simulated Media Pipeline & Progress Engine]
        Cloudinary[Cloudinary CDN / Local Mock Storage]
    end

    subgraph Database ["Data Layer (PostgreSQL)"]
        Prisma[(Prisma ORM)]
        DB[(PostgreSQL Database)]
    end

    Frontend -->|REST API Requests| API
    API --> Controller
    Controller --> Service
    Service --> PromptEngine
    PromptEngine -->|Structured Prompts| Gemini
    Service --> MediaSim
    Service --> Cloudinary
    Service --> Prisma
    Prisma --> DB
```

---

## 🗄️ Database Schema & Relational Models

The relational schema is defined cleanly using Prisma and PostgreSQL:

```mermaid
erDiagram
    USER ||--o{ SERIES : creates
    SERIES ||--o{ EPISODE : contains
    SERIES ||--o{ CHARACTER : features
    SERIES ||--o{ GENERATION_JOB : tracks
    SERIES ||--o{ GENERATION_USAGE : logs
    CHARACTER ||--o{ CHARACTER_RELATIONSHIP : relates
    EPISODE ||--o{ SCENE : contains
    EPISODE ||--o| SCRIPT : has
    EPISODE ||--o{ MEDIA_ASSET : owns
    SCENE ||--o{ MEDIA_ASSET : attaches

    SERIES {
        string id PK
        string title
        string prompt
        string genre
        enum tone
        int episodeCount
        int episodeDuration
        enum status
    }
    EPISODE {
        string id PK
        int number
        string title
        string summary
        enum status
        string[] platforms
    }
    CHARACTER {
        string id PK
        string name
        string role
        string personality
        string appearance
        string background
        boolean isLocked
    }
    SCENE {
        string id PK
        int number
        string location
        string action
        string dialogue
        string camera
        string mood
        string[] characters
    }
    SCRIPT {
        string id PK
        string content
        int version
    }
    MEDIA_ASSET {
        string id PK
        enum type
        string url
        string provider
        enum status
    }
    GENERATION_JOB {
        string id PK
        enum type
        enum status
        int progress
        json steps
        string error
    }
```

---

## 🔌 Complete REST API Reference

### Series Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/series` | Fetch all series with episode counts & completion status |
| `POST` | `/api/series` | Create a new series draft |
| `GET` | `/api/series/:id` | Fetch full series details (episodes, characters, relationships) |
| `PUT` | `/api/series/:id` | Update series metadata (title, genre, tone, synopsis, status) |
| `DELETE` | `/api/series/:id` | Cascade-delete series and all dependent entities |
| `POST` | `/api/series/:id/generate` | Trigger full AI series generation via Gemini |
| `GET` | `/api/series/:id/cost-estimate` | Pre-flight cost estimation for series generation |

### Episodes Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/series/:id/episodes` | List all episodes for a series |
| `GET` | `/api/episodes/:id` | Get full episode detail with scenes, script, and media |
| `PUT` | `/api/episodes/:id` | Update episode outline (title, summary, status) |
| `POST` | `/api/episodes/:id/generate` | Generate scenes and formatted screenplay script via Gemini |
| `POST` | `/api/episodes/:id/regenerate-outline` | Partial regeneration of a single episode outline |
| `GET` | `/api/episodes/:id/outline-cost-estimate` | Cost estimate for episode outline regeneration |
| `POST` | `/api/episodes/:id/publish` | Publish episode to selected streaming platforms |
| `GET` | `/api/episodes/:id/cost-estimate` | Pre-flight cost estimation for episode script generation |

### Characters Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/series/:seriesId/characters` | Fetch all characters in the series |
| `GET` | `/api/characters/:id` | Get character profile and relationships |
| `PUT` | `/api/characters/:id` | Manual update of character details |
| `PATCH` | `/api/characters/:id/lock` | **Toggle character lock** (`isLocked: true/false`) |
| `POST` | `/api/characters/:id/regenerate` | Partial regeneration of character profile |
| `GET` | `/api/characters/:id/cost-estimate` | Cost estimate for character regeneration |

### Scenes & Scripts Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/scenes/:id` | Fetch specific scene data |
| `PUT` | `/api/scenes/:id` | Update scene parameters (action, dialogue, camera, mood) |
| `POST` | `/api/scenes/:id/regenerate` | Partial AI regeneration of a single scene |
| `GET` | `/api/scenes/:id/cost-estimate` | Cost estimate for single scene regeneration |
| `PUT` | `/api/episodes/:episodeId/script` | Save updated screenplay script text and bump version |

### Media Studio Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/media/generate` | Trigger mock image/video/audio generation with simulated progress |
| `GET` | `/api/episodes/:episodeId/media` | Fetch all media assets associated with an episode |
| `GET` | `/api/scenes/:sceneId/media` | Fetch all media assets associated with a specific scene |
| `POST` | `/api/media/upload` | Upload real asset buffer (Cloudinary or local storage) |
| `DELETE` | `/api/media/:id` | Remove media asset record and cloud storage file |

### Generation Jobs & Diagnostics
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/generations/:id` | Poll background generation job status & progress steps |
| `GET` | `/api/series/:seriesId/usage` | Audit token counts and cumulative AI costs |
| `GET` | `/api/health` | Service health status and live AI provider mode |

---

## 🛠️ Tech Stack & Library Choices

| Domain | Technology | Justification |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16 (App Router)** | High-performance React server components, modern routing, and Turbopack fast refresh. |
| **Frontend UI/State** | **React 19, TypeScript** | Strict type safety across API boundaries; modular component architecture. |
| **Styling & UX** | **Tailwind CSS + Glassmorphism** | Modern, responsive dark aesthetic tailored for creative studio environments. |
| **Backend Runtime** | **Node.js + Express.js** | Lightweight, event-driven REST architecture with custom middleware and streaming support. |
| **Database & ORM** | **PostgreSQL + Prisma ORM** | ACID transactions, strict schema validation, type-safe queries, and zero-downtime migrations. |
| **LLM Provider** | **Google Gemini API (`@google/genai`)** | High-throughput, cost-efficient text generation with strict JSON formatting. |
| **Job Management** | **Asynchronous Job Table** | Decoupled polling architecture allowing resilient background execution and UI progress bars. |
| **Media Pipeline** | **Multi-tier (Mock + Cloudinary)** | Fulfills assignment requirement for mock media generation while preserving real production paths. |

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: Running locally on port `5432` (or via Docker)
- **Google Gemini API Key**: Get a free key at [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/micro-drama-studio.git
cd "Micro Drama Studio"
```

### 2. Backend Setup
```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
```

Ensure your `backend/.env` has:
```env
PORT=5000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/micro_drama_studio
GEMINI_API_KEY=your_actual_gemini_api_key
GEMINI_MODEL=gemini-3.8-flash
```

Initialize database & seed demo series:
```bash
# Push schema to PostgreSQL
npm run db:push

# Seed comprehensive demo data ("The Last Metro")
npm run db:seed

# Start backend dev server
npm run dev
```
*Backend runs on `http://localhost:5000`.*

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install

# Start Next.js development server
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## 🧪 5-Minute Recruiter Walkthrough

Follow these steps to evaluate the end-to-end functionality:

1. **Dashboard (`/`)**: View seeded micro-drama series cards with progress indicators, episode counters, and status badges.
2. **Create Wizard (`/create`)**:
   - Enter a premise (e.g., *"A cyber forensics officer finds a digital ghost in an autonomous taxi"*).
   - Select Genre (*Thriller/Sci-Fi*), Tone (*Suspenseful*), and Episode Count (*5*).
   - Click **Generate Series**.
3. **Cost Estimation Modal**: Inspect the pre-flight token breakdown and cost calculation. Click **Confirm & Generate**.
4. **Live Generation**: Watch real-time progress as Gemini generates the title, logline, characters, and episode outlines.
5. **Story Review & Approval (`/series/[id]`)**:
   - Review generated episodes and character cards.
   - Click **Edit Story** to manually revise logline/synopsis.
   - Click **Regenerate Outline** on a single episode to observe non-destructive partial generation.
   - Click **Approve Story** to transition status to `READY`.
6. **Character Bible (`/series/[id]/characters`)**:
   - Inspect character profiles and relationships.
   - Click the **Lock Character** toggle to lock the protagonist.
   - Attempt to regenerate the locked character: notice the defensive server rejection.
7. **Episode Workspace (`/series/[id]/episodes/[episodeId]`)**:
   - **Story Tab:** View episode synopsis; click *Generate Scenes & Script*.
   - **Scenes Tab:** Inspect individual scenes with camera angles, moods, and dialogue. Edit or partially regenerate a single scene.
   - **Media Tab:** Click **Generate Image**, **Generate Video**, or **Generate Voice**. Watch the simulated step-by-step progress bars and preview the resulting media player.
   - **Script Tab:** Inspect the industry-standard screenplay. Edit lines manually and save.
   - **Publish Tab:** Select distribution channels (Web, iOS, Android, Roku) and execute publishing.



   ## Future Improvements & Concept Gaps

### 1. Real Media Generation
Currently, image, video and voice generation are mocked with placeholders and simulated progress, as allowed by the assignment.

In a production version, these could be replaced with real media generation providers and asynchronous processing.

### 2. Real Publishing Integrations
The current publishing flow simulates publishing to platforms such as Web, iOS, Android and Roku.

A production implementation would integrate the respective platform APIs and handle authentication, upload failures, retries and platform-specific requirements.

### 3. Authentication & User Management
The current prototype uses a demo creator/user.

The next version could include authentication, user accounts and role-based access for creators, editors and administrators.

### 4. Interactive Character Graph
The current character relationship information can be represented as relationship data.

A future version could provide an interactive visual graph showing how characters are connected.


### Concept Gaps Identified

While working on the assignment, I identified a few areas that would require additional product decisions in a production version:

- AI generation can become expensive when users repeatedly regenerate content, so usage limits or project-level budgets may be useful.
- Different publishing platforms may have different content, metadata and technical requirements.
- Long-running image/video/voice generation would require reliable asynchronous processing and failure recovery.
- Maintaining visual consistency of characters across AI-generated media is a separate challenge from maintaining text/story consistency.
