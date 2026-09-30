"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSeriesGenerationPrompt = buildSeriesGenerationPrompt;
exports.buildEpisodeGenerationPrompt = buildEpisodeGenerationPrompt;
exports.buildCharacterRegenerationPrompt = buildCharacterRegenerationPrompt;
exports.buildSceneRegenerationPrompt = buildSceneRegenerationPrompt;
exports.buildEpisodeOutlineRegenerationPrompt = buildEpisodeOutlineRegenerationPrompt;
function buildSeriesGenerationPrompt(params) {
    const lockedCharsSection = params.lockedCharacters?.length
        ? `\nLOCKED CHARACTERS (These characters have been locked by the creator; use them EXACTLY as described with no changes):\n${params.lockedCharacters.map(c => `- ${c.name}: Age ${c.age || 'unknown'}, Gender: ${c.gender || 'unknown'}, Role: ${c.role || 'unknown'}\n  Personality: ${c.personality || 'N/A'}\n  Appearance: ${c.appearance || 'N/A'}\n  Background: ${c.background || 'N/A'}\n  Description: ${c.description || 'N/A'}`).join('\n')}\n`
        : '';
    const mode = params.seriesMode || 'SERIES';
    return `You are a professional micro-drama screenwriter, showrunner, and story architect.

Create a complete, original micro-drama series based specifically on the creator's concept below.

CREATOR STORY IDEA: "${params.prompt}"
${params.title ? `SUGGESTED TITLE: "${params.title}"` : ''}
GENRE: ${params.genre}
TONE: ${params.tone}
NUMBER OF EPISODES: ${params.episodeCount}
EPISODE DURATION: ${params.episodeDuration} minutes each
SERIES MODE: ${mode === 'ANTHOLOGY' ? 'Anthology (Each episode is an independent self-contained story)' : 'Continuing Serialized Drama (Episodes form a continuous, cohesive arc with character continuity)'}
${lockedCharsSection}
CRITICAL REQUIREMENTS:
1. CREATE AN ORIGINAL STORY BASED SPECIFICALLY ON THE USER'S CONCEPT:
   The user's prompt must directly and materially dictate the title, world, characters, conflict, and episode trajectory.
2. NO RECURRING/HARDCODED CHARACTERS:
   NEVER reuse generic default names (such as "Rahul", "Maya", "Aarav") or clichéd template plots from previous projects. Generate fresh, culturally and contextually authentic names, backgrounds, and motivations fitting this specific world.
3. CHARACTER CONTINUITY ACROSS EPISODES:
   In normal series mode, main characters must persist throughout all episodes. The protagonist introduced in Episode 1 must drive the story through Episode ${params.episodeCount}.
4. EPISODE PROGRESSION & DIFFERENTIATION:
   Each episode must have its OWN distinct title, unique dramatic conflict, and meaningful narrative progression:
   - Episode 1: Inciting incident & hook
   - Episode 2: Rising complications & early confrontation
   - Episode 3: Midpoint revelation or critical choice
   - Episode 4: Breaking point / darkest hour / high stakes
   - Episode 5: Climax & payoff / resolution
   (Do NOT repeat episode plots or generic summaries. Episode 1 != Episode 2 != Episode 3).
5. STRUCTURED JSON RESPONSE:
   Respond with ONLY valid JSON (no markdown formatting, no code fence blocks, no conversational preamble).

JSON Output Schema:
{
  "title": "string (compelling, evocative title matching the story)",
  "logline": "string (1-2 punchy sentences summarizing the premise)",
  "description": "string (2-3 sentences overview of the series)",
  "storyline": "string (detailed narrative arc spanning beginning, middle, and end)",
  "characters": [
    {
      "name": "string",
      "age": number,
      "gender": "string",
      "role": "string (e.g. Protagonist, Antagonist, Supporting, Mentor)",
      "personality": "string",
      "appearance": "string",
      "background": "string",
      "description": "string"
    }
  ],
  "episodes": [
    {
      "episodeNumber": 1,
      "title": "string (distinct episode title)",
      "summary": "string (detailed summary of events, conflicts, and character actions in this specific episode)"
    }
  ],
  "relationships": [
    {
      "from": "exact character name",
      "to": "exact character name",
      "relationship": "string (e.g. corporate rival of, investigating case of, estranged sibling of)"
    }
  ]
}`;
}
function buildEpisodeGenerationPrompt(params) {
    const allChars = params.characters.map(c => {
        const locked = c.isLocked ? ' [LOCKED]' : '';
        return `- ${c.name}${locked} (${c.role || 'Character'}): ${c.personality || 'Determined'}. ${c.appearance || ''}`;
    }).join('\n');
    return `You are a professional micro-drama screenwriter.

Generate detailed cinematic scenes and a production-ready script for this specific episode:

SERIES: "${params.seriesTitle}"
GENRE: ${params.genre}
TONE: ${params.tone}
OVERALL STORYLINE: ${params.storyline}

EPISODE ${params.episodeNumber}: "${params.episodeTitle}"
EPISODE SUMMARY: ${params.episodeSummary}
TARGET DURATION: ${params.episodeDuration} minutes

ESTABLISHED CHARACTERS (Use ONLY these characters for continuity):
${allChars}

CRITICAL INSTRUCTIONS:
1. Dramatize the SPECIFIC events described in EPISODE ${params.episodeNumber}'s summary above.
2. Use the established characters consistently. Do not invent unrelated protagonists.
3. Generate 3 to 5 scenes with crisp action, gripping dialogue, camera cues, and mood matching the ${params.tone.toLowerCase()} tone.
4. Provide a full screenplay formatted script for this episode.

Respond with ONLY valid JSON:
{
  "scenes": [
    {
      "number": number,
      "title": "string",
      "location": "string (e.g. INT. CORNER OFFICE - NIGHT)",
      "characters": ["character names"],
      "action": "string (vivid action and character beats)",
      "dialogue": "string (screenplay dialogue format: Character: dialogue)",
      "camera": "string (cinematic camera directions)",
      "mood": "string"
    }
  ],
  "script": "string (complete formatted screenplay for the episode)"
}`;
}
function buildCharacterRegenerationPrompt(params) {
    const others = params.otherCharacters.map(c => `- ${c.name}: ${c.role || 'Unknown'} (${c.isLocked ? 'LOCKED' : 'unlocked'})`).join('\n');
    return `You are a professional character designer for micro-dramas.

Regenerate the character "${params.characterName}" for:

SERIES: "${params.seriesTitle}"
GENRE: ${params.genre}
TONE: ${params.tone}
STORYLINE: ${params.storyline}

OTHER CHARACTERS IN THE SERIES:
${others}

Create a fresh, multi-dimensional version of this character that deepens the drama and fits this specific world.

Respond with ONLY valid JSON:
{
  "name": "${params.characterName}",
  "age": number,
  "gender": "string",
  "role": "${params.characterRole || 'Protagonist'}",
  "personality": "string",
  "appearance": "string",
  "background": "string",
  "description": "string"
}`;
}
function buildSceneRegenerationPrompt(params) {
    const allChars = params.characters.map(c => {
        const locked = c.isLocked ? ' [LOCKED]' : '';
        return `- ${c.name}${locked}: ${c.role || 'Character'}`;
    }).join('\n');
    return `You are a professional micro-drama screenwriter.

Regenerate Scene ${params.sceneNumber} for:

SERIES: "${params.seriesTitle}"
GENRE: ${params.genre}
TONE: ${params.tone}
EPISODE: "${params.episodeTitle}"
EPISODE SUMMARY: ${params.episodeSummary}

ESTABLISHED CHARACTERS:
${allChars}

Create an alternate, heightened version of Scene ${params.sceneNumber} with fresh blocking, dialogue, and dramatic intensity.

Respond with ONLY valid JSON:
{
  "number": ${params.sceneNumber},
  "title": "string",
  "location": "string",
  "characters": ["character names"],
  "action": "string",
  "dialogue": "string",
  "camera": "string",
  "mood": "string"
}`;
}
function buildEpisodeOutlineRegenerationPrompt(params) {
    const chars = params.characters.map(c => {
        const locked = c.isLocked ? ' [LOCKED]' : '';
        return `- ${c.name}${locked} (${c.role || 'Character'}): ${c.personality || ''}`;
    }).join('\n');
    const otherEps = params.otherEpisodes.map(ep => `- Episode ${ep.number}: "${ep.title}" -> ${ep.summary}`).join('\n');
    return `You are a professional micro-drama story architect and screenwriter.

Regenerate the outline for Episode ${params.episodeNumber} in this series:

SERIES: "${params.seriesTitle}"
GENRE: ${params.genre}
TONE: ${params.tone}
OVERALL STORYLINE: ${params.storyline}

ESTABLISHED CHARACTERS:
${chars}

EXISTING EPISODES IN THIS SERIES (Ensure flawless narrative flow and continuity with these):
${otherEps || 'No other episodes.'}

${params.currentTitle ? `PREVIOUS DRAFT FOR EPISODE ${params.episodeNumber}:\nTitle: "${params.currentTitle}"\nSummary: "${params.currentSummary || ''}"\n` : ''}
CRITICAL REQUIREMENTS:
1. Provide a fresh, gripping title and detailed summary specifically for Episode ${params.episodeNumber}.
2. Ensure it connects seamlessly with preceding and subsequent episodes without repeating other episode conflicts.
3. Feature the established characters actively.

Respond with ONLY valid JSON:
{
  "episodeNumber": ${params.episodeNumber},
  "title": "string (punchy, evocative episode title)",
  "summary": "string (2-3 detailed sentences describing the key conflict, character choices, and cliffhanger hook of this specific episode)"
}`;
}
//# sourceMappingURL=index.js.map