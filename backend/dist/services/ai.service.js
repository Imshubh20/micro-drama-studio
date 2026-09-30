"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callAI = exports.callOpenAI = void 0;
exports.isDemoMode = isDemoMode;
exports.callGemini = callGemini;
exports.callMockAI = callMockAI;
exports.estimateCost = estimateCost;
const genai_1 = require("@google/genai");
const config_1 = require("../config");
// ─── Gemini Client Management ──────────────────────────────
let geminiClientInstance = null;
let cachedApiKey = null;
function getGeminiClient() {
    const currentKey = config_1.config.gemini.apiKey;
    if (!currentKey) {
        geminiClientInstance = null;
        cachedApiKey = null;
        return null;
    }
    if (!geminiClientInstance || cachedApiKey !== currentKey) {
        cachedApiKey = currentKey;
        geminiClientInstance = new genai_1.GoogleGenAI({ apiKey: currentKey });
    }
    return geminiClientInstance;
}
function isDemoMode() {
    return config_1.config.isDemoMode;
}
async function callGemini(prompt) {
    const client = getGeminiClient();
    if (!client) {
        return callMockAI(prompt);
    }
    const requestedModel = process.env.GEMINI_MODEL || config_1.config.gemini.model || 'gemini-3.5-flash-lite';
    const modelsToTry = [requestedModel];
    if (requestedModel !== 'gemini-3.5-flash-lite')
        modelsToTry.push('gemini-3.5-flash-lite');
    if (requestedModel !== 'gemini-3.8-flash')
        modelsToTry.push('gemini-3.8-flash');
    let lastError = null;
    for (const model of modelsToTry) {
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const response = await client.models.generateContent({
                    model,
                    contents: prompt,
                    config: {
                        systemInstruction: 'You are a professional micro-drama showrunner and screenwriter. Always return ONLY valid, clean JSON with no markdown formatting or code blocks. Never use placeholder or hardcoded names like Rahul, Maya, or Aarav unless explicitly commanded. Ensure each episode introduces new plot progression while preserving character continuity.',
                        responseMimeType: 'application/json',
                        temperature: 0.85,
                    },
                });
                const content = response.text || '{}';
                const promptTokens = response.usageMetadata?.promptTokenCount || Math.ceil(prompt.length / 4);
                const completionTokens = response.usageMetadata?.candidatesTokenCount || Math.ceil(content.length / 4);
                const totalTokens = response.usageMetadata?.totalTokenCount || (promptTokens + completionTokens);
                return {
                    content,
                    usage: {
                        promptTokens,
                        completionTokens,
                        totalTokens,
                    },
                };
            }
            catch (error) {
                lastError = error;
                console.warn(`Gemini API call (${model}) attempt ${attempt} failed:`, error.message);
                await new Promise(r => setTimeout(r, 800));
            }
        }
    }
    console.error('Gemini API call failed after retries in Live mode:', lastError?.message);
    throw new Error(`Gemini API Error: ${lastError?.message || 'API request failed'}`);
}
// Aliases for compatibility
exports.callOpenAI = callGemini;
exports.callAI = callGemini;
// ─── Mock AI Router ────────────────────────────────────────
async function callMockAI(prompt) {
    // Simulate natural AI computation latency
    await new Promise(resolve => setTimeout(resolve, 1000));
    let content;
    if (prompt.includes('Regenerate Scene')) {
        content = JSON.stringify(generateMockScene(prompt));
    }
    else if (prompt.includes('Regenerate the outline for Episode')) {
        content = JSON.stringify(generateMockEpisodeOutline(prompt));
    }
    else if (prompt.includes('Regenerate the character')) {
        content = JSON.stringify(generateMockCharacter(prompt));
    }
    else if (prompt.includes('Generate detailed cinematic scenes') ||
        prompt.includes('TARGET DURATION') ||
        prompt.includes('ESTABLISHED CHARACTERS')) {
        content = JSON.stringify(generateMockEpisodeContent(prompt));
    }
    else {
        content = JSON.stringify(generateMockSeriesContent(prompt));
    }
    const estimatedPromptTokens = Math.ceil(prompt.length / 4);
    const estimatedCompletionTokens = Math.ceil(content.length / 4);
    return {
        content,
        usage: {
            promptTokens: estimatedPromptTokens,
            completionTokens: estimatedCompletionTokens,
            totalTokens: estimatedPromptTokens + estimatedCompletionTokens,
        },
    };
}
// ─── Utilities for Mock Generator ──────────────────────────
function hashString(str) {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return Math.abs(hash);
}
function pseudoRandom(seed) {
    let s = seed;
    return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    };
}
function pickRandom(items, rnd) {
    return items[Math.floor(rnd() * items.length)];
}
const DOMAINS = [
    // 1. Corporate / Office Politics
    {
        name: 'corporate',
        matches: (t) => /corporate|office|fresher|politics|cubicle|boss|promotion|colleague|company|firm|intern|job|boardroom|salary|manager/i.test(t),
        titles: [
            'The Corner Cubicle',
            'The 90-Day Probation',
            'Power Play',
            'The Glass Ceiling',
            'Unwritten Rules',
            'The Boardroom Knife',
        ],
        protagonists: [
            {
                name: 'Naveen Saxena',
                age: 23,
                gender: 'Male',
                role: 'Protagonist',
                personality: 'Earnest, analytical, and eager to prove his worth. Struggles with speaking up until pushed into a corner.',
                appearance: 'Slender build, crisp ironed formal shirts, rimless spectacles, and quick, observant eyes.',
                background: 'Top of his engineering batch from a tier-two college. Joined the multinational firm on probation, bearing his family\'s high hopes.',
                description: 'A fresher navigating the murky politics of a cutthroat corporate ladder where credit is stolen and loyalty is cheap.',
            },
            {
                name: 'Radhika Merchant',
                age: 24,
                gender: 'Female',
                role: 'Protagonist',
                personality: 'Sharp, ambitious, principled, but weary of double standards in corporate evaluations.',
                appearance: 'Sharp blazers, poised posture, determined stride, and an ever-present smart notebook.',
                background: 'Former campus star hired into management consulting. Believes hard work speaks for itself until reality hits.',
                description: 'A determined associate fighting to preserve her original pitch from predatory senior leadership.',
            },
            {
                name: 'Devika Sen',
                age: 23,
                gender: 'Female',
                role: 'Protagonist',
                personality: 'Quietly brilliant, detail-obsessed, with a wicked sense of irony when provoked.',
                appearance: 'Tailored casual formals, dark curls tied back, expressive dark eyes that miss no detail.',
                background: 'Junior financial analyst who discovers an off-the-books discrepancy on her second week.',
                description: 'A young analyst whose accidental discovery turns her into the target of a high-level corporate cover-up.',
            },
        ],
        antagonists: [
            {
                name: 'Malini Oberoi',
                age: 36,
                gender: 'Female',
                role: 'Antagonist',
                personality: 'Charming, ruthless, deeply insecure beneath a veneer of executive poise. Masters the art of polite sabotage.',
                appearance: 'Designer silk blazers, manicured nails, warm smile that never quite reaches her calculating eyes.',
                background: 'Senior Director who rose through alliances and taking credit for junior colleagues\' innovations.',
                description: 'The senior executive who claims the protagonist\'s breakthrough strategy as her own.',
            },
            {
                name: 'Vikramaditya Singhania',
                age: 42,
                gender: 'Male',
                role: 'Antagonist',
                personality: 'Imperious, transactional, treats subordinates as expendable chess pawns in his bid for partner.',
                appearance: 'Bespoke charcoal suits, silver cufflinks, commanding presence that silences meetings.',
                background: 'Managing Partner fighting a board revolt; needs an uncredited win to seal his equity share.',
                description: 'The powerful department head orchestrating high-stakes corporate power plays behind closed doors.',
            },
        ],
        allies: [
            {
                name: 'Tanmay Ghosh',
                age: 24,
                gender: 'Male',
                role: 'Supporting',
                personality: 'Sarcastic survivor, IT wizard, office gossip historian with a covert moral compass.',
                appearance: 'Lanyard tangled with flash drives, messy hair, ever-present coffee tumbler.',
                background: 'Joined the company a year earlier; knows which server folders hold the real company secrets.',
                description: 'The reliable desk neighbour who helps uncover digital footprints of manipulated documents.',
            },
            {
                name: 'Divya Nair',
                age: 25,
                gender: 'Female',
                role: 'Supporting',
                personality: 'Diplomatic, empathetic, trapped between corporate HR compliance and doing what is right.',
                appearance: 'Smart pastel kurtis, warm demeanor, attentive listener with a cautious smile.',
                background: 'HR Associate who quietly alerts the protagonist when an off-the-record disciplinary file is created.',
                description: 'An ally in human resources who risks her own job to ensure evidence does not get buried.',
            },
        ],
        mentors: [
            {
                name: 'Dinesh Murthy',
                age: 52,
                gender: 'Male',
                role: 'Mentor',
                personality: 'Cynical, wise, battle-scarred veteran who refused to compromise his ethics years ago.',
                appearance: 'Faded tweed jacket, silver beard, reading glasses perched on his forehead.',
                background: 'Former star VP exiled to the compliance floor for whistleblowing on an earlier merger.',
                description: 'The veteran mentor who teaches the protagonist how to fight corporate backstabbing without losing their soul.',
            },
        ],
        relationships: (p, a, ally, m) => [
            { from: p, to: a, relationship: 'targeted by / fighting credit theft of' },
            { from: a, to: p, relationship: 'undermines / threatens probation of' },
            { from: ally, to: p, relationship: 'confidant & digital sleuth for' },
            { from: p, to: m, relationship: 'mentored by / seeks strategy from' },
            { from: m, to: a, relationship: 'past rival of / knows true record of' },
        ],
        episodeThemes: [
            {
                title: 'Day One on the Floor',
                summaryTemplate: (p, a, ally, m) => `${p} steps onto the high-pressure trading floor of the firm, determined to shine. But when ${a} openly reassigns the department's flagship initiative, ${p} realizes that corporate survival requires far more than technical excellence.`,
            },
            {
                title: 'The Redlined Pitch',
                summaryTemplate: (p, a, ally, m) => `Late at night, ${p} discovers their confidential project model has been rebranded under ${a}'s name. With help from ${ally}, ${p} searches server access logs to uncover how deeply the sabotage goes.`,
            },
            {
                title: 'The Closed-Door Hearing',
                summaryTemplate: (p, a, ally, m) => `When ${p} attempts to escalate the theft, HR springs a surprise internal review orchestrated by ${a}. Guided by ${m}, ${p} turns the defense into a calculated demonstration of the missing proprietary calculations.`,
            },
            {
                title: 'The Whistleblower\'s Trap',
                summaryTemplate: (p, a, ally, m) => `${a} offers ${p} a lucrative promotion and overseas transfer on condition of signing a non-disclosure agreement. ${p} faces an agonizing crossroads between career safety and exposing systematic corporate fraud.`,
            },
            {
                title: 'Boardroom Showdown',
                summaryTemplate: (p, a, ally, m) => `During the annual global investor presentation, ${p} exposes the fabricated performance metrics in front of the board. An electrifying clash leaves ${a} cornered and permanently reshapes the company's future.`,
            },
        ],
        sceneLocations: [
            'Apex Tower - Open Workstation 4B',
            'Executive Corner Suite - 24th Floor',
            'Basement Server Room & Archives',
            'The Midnight Breakroom',
            'Glass-Walled Boardroom A',
        ],
    },
    // 2. Detective / Crime / Old Delhi / Urban Mystery
    {
        name: 'detective',
        matches: (t) => /detective|investigat|disappear|police|inspector|cop|delhi|mumbai|murder|crime|killer|victim|clue|station|suspect|evidence/i.test(t),
        titles: [
            'Shadows of Chandni Chowk',
            'The 4th Vanishing',
            'Cold Fog at Kashmere Gate',
            'The Labyrinth of Ballimaran',
            'Old City Ledger',
            'Night Watch on Ring Road',
        ],
        protagonists: [
            {
                name: 'Inspector Kabir Qureshi',
                age: 38,
                gender: 'Male',
                role: 'Protagonist',
                personality: 'Relentless, brooding, intuitive. Possesses an eidetic memory for faces and crime scenes.',
                appearance: 'Leather jacket over rumpled cotton shirt, stubble, intense gaze that immediately unnerves suspects.',
                background: 'Crime Branch investigator stationed in North Delhi, haunted by a cold case that cost his partner\'s badge.',
                description: 'A street-hardened detective who refuses to drop the scent of an escalating pattern of disappearances.',
            },
            {
                name: 'ACP Arjun Rathore',
                age: 36,
                gender: 'Male',
                role: 'Protagonist',
                personality: 'Methodical, uncompromising, fiercely protective of the vulnerable.',
                appearance: 'Tall, disciplined posture, sharp uniform with service ribbons, calculating jawline.',
                background: 'Special Staff operative transferred to Old Delhi to neutralize an elusive underground kidnapping syndicate.',
                description: 'An elite officer diving into the city\'s deepest underworld network to bring missing victims home.',
            },
            {
                name: 'Inspector Devika Roy',
                age: 34,
                gender: 'Female',
                role: 'Protagonist',
                personality: 'Razor-sharp forensic criminologist who trusts data, blood spatter, and unspoken hesitation.',
                appearance: 'Field trench coat, hair pulled back, observant grey-tinted spectacles, calm under direct threat.',
                background: 'Former state forensics lead who took a field command when standard police inquiries were compromised.',
                description: 'A formidable investigator unravelling the biological and psychological trails left by a phantom abductor.',
            },
        ],
        antagonists: [
            {
                name: 'Tejender "The Weaver" Sethi',
                age: 54,
                gender: 'Male',
                role: 'Antagonist',
                personality: 'Soft-spoken, theatrical, utterly remorseless. Views human lives as threads in a master tapestry.',
                appearance: 'Pashmina shawl, silver-topped walking cane, gentle smile masking cold psychopathy.',
                background: 'Antique dealer and underworld power broker operating out of a century-old mansion near Fatehpuri.',
                description: 'The elusive criminal mastermind pulling the strings behind the string of neighborhood vanishings.',
            },
            {
                name: 'Jagdish Mittal',
                age: 49,
                gender: 'Male',
                role: 'Antagonist',
                personality: 'Corrupt, politically shielded, quick to threaten violence when his illicit operations are threatened.',
                appearance: 'White safari suit, heavy gold ring on his pinky finger, booming commanding voice.',
                background: 'Real estate baron demolishing historic neighborhoods to uncover buried colonial-era relics.',
                description: 'The influential financier silencing anyone who looks too closely into the evicted heritage quarters.',
            },
        ],
        allies: [
            {
                name: 'Sub-Inspector Meera Joshi',
                age: 27,
                gender: 'Female',
                role: 'Supporting',
                personality: 'Fearless, tech-savvy, street-smart with unmatched knowledge of Old Delhi\'s tangled alleys.',
                appearance: 'Utility vest, high-top boots, quick with a sidearm and faster with digital surveillance intercepts.',
                background: 'Born and raised in Ballimaran; treats the local street vendors and night watchmen as her intelligence grid.',
                description: 'The loyal young sub-inspector who serves as Kabir\'s right hand and field navigator.',
            },
            {
                name: 'Bilal Zaidi',
                age: 32,
                gender: 'Male',
                role: 'Supporting',
                personality: 'Bookish, eccentric antiquities appraiser who notices what the forensics team overlooks.',
                appearance: 'Dusty corduroy jacket, magnifying loupe hanging from neck, ink-stained fingers.',
                background: 'Runs an archival bookshop near Jama Masjid; expert in historic city maps and lost catacombs.',
                description: 'The historian ally who decodes coded marks left at each disappearance site.',
            },
        ],
        mentors: [
            {
                name: 'Retired ACP Rakesh Bakshi',
                age: 63,
                gender: 'Male',
                role: 'Mentor',
                personality: 'Gruff, perceptive, carrying the weight of past compromises he now seeks to redeem.',
                appearance: 'Wheelchair-bound but commanding, gravelly voice, sharp memory for 1990s unsolved dockets.',
                background: 'Former station chief who investigated the first wave of disappearances thirty years ago before being silenced.',
                description: 'The veteran mentor who gives the team the missing link between the historic and modern crimes.',
            },
        ],
        relationships: (p, a, ally, m) => [
            { from: p, to: a, relationship: 'hunting down / matching wits against' },
            { from: a, to: p, relationship: 'taunts / sets elaborate traps for' },
            { from: ally, to: p, relationship: 'trusted field partner & tactical backup to' },
            { from: p, to: m, relationship: 'confides in / seeks cold case secrets from' },
            { from: m, to: a, relationship: 'recognized decades-old signature of' },
        ],
        episodeThemes: [
            {
                title: 'The Vanishing on Chawri Bazar',
                summaryTemplate: (p, a, ally, m) => `When a fourth victim disappears into thin air inside a crowded night market, ${p} and ${ally} discover a carved antique token left behind. The trail points toward an old colonial waterway forgotten beneath the city.`,
            },
            {
                title: 'Whispers Beneath the Haveli',
                summaryTemplate: (p, a, ally, m) => `${p} interrogates informants across the spice bazaars, uncovering that ${a} has been buying silence across the district. A midnight ambush in the narrow gullies tests ${ally}'s quick reflexes.`,
            },
            {
                title: 'The Silent Ledger',
                summaryTemplate: (p, a, ally, m) => `With guidance from ${m}, ${p} decodes an archive ledger that links the modern abductions to a historic vault hidden beneath the city walls. A ransom message arrives with an impossible 12-hour deadline.`,
            },
            {
                title: 'Hour of the Catacombs',
                summaryTemplate: (p, a, ally, m) => `${p} is trapped in a subterranean chamber flooded by monsoon runoff as ${a} makes preparations to transport the victims. ${ally} races across the rooftops to bypass corrupted police radio channels.`,
            },
            {
                title: 'Daybreak at Kashmere Gate',
                summaryTemplate: (p, a, ally, m) => `A breathless confrontation atop the historic ramparts pits ${p} against ${a} in a duel of wits and wills. The truth is dragged into the daylight, rescuing the captives and freeing the city from fear.`,
            },
        ],
        sceneLocations: [
            'Crime Branch Incident Room - Civil Lines',
            'Narrow Alleys of Gali Qasim Jan',
            'Subterranean Aqueduct Underneath Chawri Bazar',
            'The Antiquities Courtyard of Sethi Haveli',
            'Mist-Veiled Rooftops of Kashmere Gate',
        ],
    },
    // 3. Train / Transit / Strangers Suspense / Romantic Thriller
    {
        name: 'train_thriller',
        matches: (t) => /train|stranger|strangers|journey|passengers|flight|railway|berth|compartment|travel|express/i.test(t),
        titles: [
            'Midnight Express to Nowhere',
            'Coupe 14',
            'Passengers in Transit',
            'The 03:00 Express',
            'Between Two Stations',
            'Tracks in the Mist',
        ],
        protagonists: [
            {
                name: 'Ishaan Sen',
                age: 27,
                gender: 'Male',
                role: 'Protagonist',
                personality: 'Guarded, observant, quick-thinking under pressure, running from a dangerous whistleblowing scoop.',
                appearance: 'Rugged canvas duffle, dark jacket, watchful brown eyes, athletic build.',
                background: 'Investigative photojournalist boarding the overnight superfast express with encrypted evidence of a syndicate.',
                description: 'A fugitive journalist whose routine train ride turns into a lethal game of survival when a stranger enters his coupe.',
            },
            {
                name: 'Reyansh Malhotra',
                age: 29,
                gender: 'Male',
                role: 'Protagonist',
                personality: 'Quietly intense, resourceful, protective of innocent bystanders.',
                appearance: 'Leather boots, casual dark sweater, calm exterior hiding lightning-quick martial reflexes.',
                background: 'Former courier escorting a high-value memory drive on a sleeper train through central India.',
                description: 'A traveler whose peaceful journey is upended by an unexpected companion carrying a lethal secret.',
            },
        ],
        antagonists: [
            {
                name: 'Balraj Grover',
                age: 44,
                gender: 'Male',
                role: 'Antagonist',
                personality: 'Cold, surgical, relentlessly polite while applying lethal leverage.',
                appearance: 'Impeccable wool overcoat, ear-piece communicator, icy composure.',
                background: 'Professional corporate fixer boarding at an unscheduled junction stop to intercept the cargo.',
                description: 'The ruthless pursuer systematically locking down rail coaches one by one.',
            },
            {
                name: 'The Man in Berth 12',
                age: 39,
                gender: 'Male',
                role: 'Antagonist',
                personality: 'Deceptive, chameleonic, hides behind an affable traveling salesman persona.',
                appearance: 'Brown trench coat, silver signet ring, pleasant smile that disappears when doors close.',
                background: 'Undercover operative sent to eliminate witnesses before the train crosses the state border.',
                description: 'The smiling assassin sharing the first-class corridor.',
            },
        ],
        allies: [
            {
                name: 'Ananya Roy',
                age: 25,
                gender: 'Female',
                role: 'Deuteragonist',
                personality: 'Enigmatic, courageous, deeply loyal, carrying a violin case that holds something far heavier than music.',
                appearance: 'Silk scarf over dark curls, silver chain necklace, expressive eyes with a fierce spark of defiance.',
                background: 'Classical musician on the run from an arranged syndicate syndicate; forced to share coupe with Ishaan.',
                description: 'The mysterious co-passenger whose fate becomes irrevocably bound to the protagonist.',
            },
            {
                name: 'TTE Harish Bhatt',
                age: 53,
                gender: 'Male',
                role: 'Supporting',
                personality: 'Observant, world-weary railway veteran who knows every squeak and hidden panel of the carriages.',
                appearance: 'Crisp railway uniform with brass buttons, ticket chart clipped under arm, reading spectacles.',
                background: '30 years on the northern railway lines; has seen every kind of passenger and recognizes danger instantly.',
                description: 'The train ticket examiner whose unexpected integrity becomes the passengers\' lifeline.',
            },
        ],
        mentors: [
            {
                name: 'Dr. Natasha Bose',
                age: 48,
                gender: 'Female',
                role: 'Mentor',
                personality: 'Cultured, perceptive, traveling with a doctor\'s emergency kit and an uncanny ability to read people.',
                appearance: 'Elegant handloom sari under woolen shawl, calm silver hair, steady surgeon\'s hands.',
                background: 'Retired forensic toxicologist traveling in coupe 16 who helps treat injuries and identify poisons.',
                description: 'The veteran traveler whose medical acumen and psychological clarity turn the tide in the crisis.',
            },
        ],
        relationships: (p, a, ally, m) => [
            { from: p, to: ally, relationship: 'stranger turned ally & protector of' },
            { from: ally, to: p, relationship: 'shares secret & growing bond with' },
            { from: a, to: p, relationship: 'stalks through carriages / targets' },
            { from: ally, to: a, relationship: 'holds critical leverage over' },
            { from: m, to: p, relationship: 'medical advisor & strategic confidante to' },
        ],
        episodeThemes: [
            {
                title: 'Berth 14',
                summaryTemplate: (p, a, ally, m) => `A ticket reservation error places ${p} and ${ally} inside the same two-berth coupe on the overnight express. When ${p} notices armed strangers boarding at a deserted rural station, the uneasy silence between them shatters into an unspoken alliance.`,
            },
            {
                title: 'Signal Down at Km 340',
                summaryTemplate: (p, a, ally, m) => `The train grinds to a halt in dense fog as the emergency chain is pulled. ${a} begins searching the sleeper carriages cabin by cabin, forcing ${p} and ${ally} to scramble through luggage compartments with help from ${m}.`,
            },
            {
                title: 'The Vestibule Stand-off',
                summaryTemplate: (p, a, ally, m) => `Between rocking train carriages, ${p} confronts ${a}'s operative while ${ally} attempts to warn the train guard. A breathless struggle against the howling wind forces ${ally} to reveal what is truly hidden inside her violin case.`,
            },
            {
                title: 'The Blackout Corridor',
                summaryTemplate: (p, a, ally, m) => `${a} cuts the power generators to Coach B, plunging the passengers into darkness. In the shadows, ${p} and ${ally} must outwit the operatives while keeping civilian travelers safe from crossfire.`,
            },
            {
                title: 'The Terminal Approach',
                summaryTemplate: (p, a, ally, m) => `As dawn breaks over the terminal station, ${p} and ${ally} execute a daring maneuver to transmit the evidence before ${a} can block the platform exits. A triumphant escape cements an unbreakable bond forged in danger.`,
            },
        ],
        sceneLocations: [
            'First Class Sleeper - Coupe 14',
            'The Roaring Vestibule Between Coaches',
            'Pantry Car - Fluorescent Glow at 02:00 AM',
            'Roof of Moving Carriage in Dense Fog',
            'Terminal Platform 1 - Sunrise Arrival',
        ],
    },
    // 4. Culinary / Restaurant / Family Legacy Drama
    {
        name: 'culinary',
        matches: (t) => /chef|restaurant|cook|kitchen|recipe|food|eatery|cafe|bakery|spice|dining|dish|menu/i.test(t),
        titles: [
            'The Heritage Flame',
            'The Last Masala',
            'Recipe for Survival',
            'Tasting Notes of Dadar',
            'Kitchen Confidential',
            'The Secret Garnish',
        ],
        protagonists: [
            {
                name: 'Tara Deshmukh',
                age: 28,
                gender: 'Female',
                role: 'Protagonist',
                personality: 'Fiercely passionate, inventive, combines Michelin-level technique with deep respect for ancestral roots.',
                appearance: 'Chefs whites rolled up, hair tied in high bandana, burn scars on wrists worn like badges of honor.',
                background: 'Trained in Paris; returned to Mumbai after her father\'s passing to find the 50-year-old family eatery near foreclosure.',
                description: 'A visionary chef fighting predatory developers to save her family\'s heritage restaurant.',
            },
            {
                name: 'Chef Neil Contractor',
                age: 29,
                gender: 'Male',
                role: 'Protagonist',
                personality: 'Bold, outspoken culinary rebel who believes food is memory, history, and community.',
                appearance: 'Tattooed forearms, aprons dusted with turmeric, warm infectious smile under fire.',
                background: 'Quit a prestigious five-star kitchen to salvage his grandmother\'s iconic coastal diner from predatory buyout.',
                description: 'A passionate chef battling ruthless hospitality conglomerates to keep authentic heritage dining alive.',
            },
        ],
        antagonists: [
            {
                name: 'Julian Fernandez',
                age: 39,
                gender: 'Male',
                role: 'Antagonist',
                personality: 'Slick, calculating corporate food aggregator who values square-footage margins over cultural soul.',
                appearance: 'Tailored linen shirts, designer sunglasses, drives an electric luxury sedan through humble street markets.',
                background: 'CEO of a venture-backed restaurant conglomerate intent on converting historic street eateries into cookie-cutter cloud kitchens.',
                description: 'The predatory corporate executive orchestrating supplier boycotts to force an eviction.',
            },
            {
                name: 'Shashi Goenka',
                age: 48,
                gender: 'Male',
                role: 'Antagonist',
                personality: 'Smug, corrupt municipal food safety inspector who weaponizes red tape for bribes.',
                appearance: 'Chubby fingers holding an official clipboard, greasy comb-over, false bureaucratic concern.',
                background: 'On Julian\'s payroll to fabricate hygiene violations whenever the heritage diner gains momentum.',
                description: 'The compromised inspector threatening immediate seal orders on the kitchen.',
            },
        ],
        allies: [
            {
                name: 'Kaka (Vithal Rao)',
                age: 64,
                gender: 'Male',
                role: 'Supporting',
                personality: 'Gruff, fiercely loyal, custodian of the secret thirty-spice generational blend.',
                appearance: 'Faded white dhoti, brass ladle always in hand, eyes teary from woodsmoke and chili heat.',
                background: 'Worked alongside the founder for 45 years; skeptical of modern plating but protective of Tara like a daughter.',
                description: 'The veteran head cook whose traditional mastery forms the backbone of the restaurant.',
            },
            {
                name: 'Rohan Deshmukh',
                age: 22,
                gender: 'Male',
                role: 'Supporting',
                personality: 'Energetic, fast-talking, social media native who turns kitchen crises into viral food movements.',
                appearance: 'Hoodie, sneakers, smartphone stabilizer always rolling, infectious enthusiasm.',
                background: 'Tara\'s younger brother who handles suppliers, online bookings, and mounting bank overdraft notices.',
                description: 'The digital strategist mobilizing loyal neighborhood patrons to stand against the developers.',
            },
        ],
        mentors: [
            {
                name: 'Chef D\'Silva',
                age: 68,
                gender: 'Male',
                role: 'Mentor',
                personality: 'Gentle culinary philosopher, legendary retired chef who judges food by how long the flavor lingers in memory.',
                appearance: 'Linen kurta, walking stick, gentle smile, holds court at the corner spice market.',
                background: 'Taught Tara\'s father fifty years ago; holds the original land lease covenant that Julian wants destroyed.',
                description: 'The legendary culinary elder holding the legal and emotional masterkey to the eatery\'s survival.',
            },
        ],
        relationships: (p, a, ally, m) => [
            { from: p, to: a, relationship: 'resists buyout & aggressive sabotage by' },
            { from: a, to: p, relationship: 'pressures eviction & blocks suppliers of' },
            { from: ally, to: p, relationship: 'traditional co-chef & loyal protector of' },
            { from: p, to: m, relationship: 'seeks culinary wisdom & ancestral secrets from' },
            { from: m, to: a, relationship: 'holds legal deed blocking acquisition by' },
        ],
        episodeThemes: [
            {
                title: 'Final Eviction Notice',
                summaryTemplate: (p, a, ally, m) => `${p} returns home to find eviction notices pasted to the brass doors of the family eatery. With ${ally} threatening to walk out over modern menu changes, ${p} has 72 hours to pay overdue lease arrears before ${a}'s firm forecloses.`,
            },
            {
                title: 'The Missing Masala',
                summaryTemplate: (p, a, ally, m) => `A mysterious power outage spoils the pantry coolers on a busy festival night. Suspecting ${a}'s sabotage, ${p} and ${ally} improvise a legendary wood-fired tasting menu that draws crowds down the alley.`,
            },
            {
                title: 'The Critic at Table 9',
                summaryTemplate: (p, a, ally, m) => `The country's most feared food critic arrives unannounced while municipal inspector Goenka tries to slap a shutdown order. ${p} orchestrates a high-stakes culinary showcase that leaves the critic spellbound.`,
            },
            {
                title: 'Supplier Blackout',
                summaryTemplate: (p, a, ally, m) => `${a} buys out all regional spice distributors, leaving the kitchen completely dry before the annual heritage banquet. Guided by ${m}, ${p} taps forgotten rural farmer cooperatives to source indigenous heritage grains.`,
            },
            {
                title: 'The Grand Heritage Feast',
                summaryTemplate: (p, a, ally, m) => `A massive open-air street feast draws hundreds of loyal patrons, live broadcast by ${ally}. ${m} publicly produces the original heritage deed, permanently revoking ${a}'s claim and securing the kitchen for another century.`,
            },
        ],
        sceneLocations: [
            'The Aromatic Prep Kitchen & Spice Rack',
            'The Bustling 50-Seat Brass Table Dining Room',
            'The Crowded Wholesale Spice Bazaar at Dawn',
            'Julian\'s Glass-Encased Waterfront Office',
            'The Packed Street Food Festival Outside the Restaurant',
        ],
    },
];
// ─── General Fallback Generator (For any arbitrary prompt) ──
function getGeneralDomain(storyIdea, genre, tone, seed) {
    const rnd = pseudoRandom(seed);
    const maleNames = ['Karan', 'Siddharth', 'Varun', 'Kunal', 'Dev', 'Arjun', 'Sameer', 'Nikhil', 'Zayan', 'Farhan', 'Rishi', 'Pranav'];
    const femaleNames = ['Tara', 'Ananya', 'Zoya', 'Meera', 'Radhika', 'Kavya', 'Alisha', 'Sana', 'Sneha', 'Rhea', 'Tanya', 'Bhavna'];
    const surnames = ['Kapoor', 'Verma', 'Nair', 'Banerjee', 'Chopra', 'Iyer', 'Menon', 'Joshi', 'Bansal', 'Dutta', 'Bhatt', 'Reddy', 'Saxena', 'Rao', 'Gupta', 'Mehta'];
    const pGender = rnd() > 0.5 ? 'Female' : 'Male';
    const pFirst = pGender === 'Female' ? pickRandom(femaleNames, rnd) : pickRandom(maleNames, rnd);
    const pLast = pickRandom(surnames, rnd);
    const pName = `${pFirst} ${pLast}`;
    const aGender = rnd() > 0.5 ? 'Male' : 'Female';
    const aFirst = aGender === 'Female' ? pickRandom(femaleNames.filter(n => n !== pFirst), rnd) : pickRandom(maleNames.filter(n => n !== pFirst), rnd);
    const aLast = pickRandom(surnames.filter(s => s !== pLast), rnd);
    const aName = `${aFirst} ${aLast}`;
    const allyFirst = pGender === 'Female' ? pickRandom(maleNames, rnd) : pickRandom(femaleNames, rnd);
    const allyName = `${allyFirst} ${pickRandom(surnames.filter(s => s !== pLast && s !== aLast), rnd)}`;
    const mentorName = `Professor ${pickRandom(['Chatterjee', 'Kulkarni', 'Deshpande', 'Swaminathan', 'Venkatesh'], rnd)}`;
    // Extract core keywords from prompt
    const cleanPrompt = storyIdea.replace(/[^\w\s]/g, '').trim();
    const words = cleanPrompt.split(/\s+/).filter(w => w.length > 3);
    const keyword1 = words[0] ? words[0].charAt(0).toUpperCase() + words[0].slice(1) : 'Destiny';
    const keyword2 = words[1] ? words[1].charAt(0).toUpperCase() + words[1].slice(1) : 'Truth';
    const titleOptions = [
        `The ${keyword1} Dilemma`,
        `Shadow of ${keyword2}`,
        `${keyword1} and ${keyword2}`,
        `The ${keyword1} Protocol`,
        `Echoes of ${keyword2}`,
    ];
    return {
        name: 'general',
        matches: () => true,
        titles: titleOptions,
        protagonists: [
            {
                name: pName,
                age: Math.floor(rnd() * 10) + 24,
                gender: pGender,
                role: 'Protagonist',
                personality: `Intelligent, resilient, driven by a deep sense of justice. Willing to risk everything to uncover the truth about "${storyIdea.slice(0, 50)}...".`,
                appearance: 'Determined presence, watchful eyes that assess every exit, understated practical clothing.',
                background: `A dedicated specialist whose life was thrown into chaos when confronted with the premise of: ${storyIdea.slice(0, 80)}.`,
                description: `The central hero who must overcome compounding obstacles to resolve the crisis.`,
            },
        ],
        antagonists: [
            {
                name: aName,
                age: Math.floor(rnd() * 15) + 35,
                gender: aGender,
                role: 'Antagonist',
                personality: 'Cunning, powerful, completely convinced of the righteousness of their own agenda.',
                appearance: 'Sharp formal attire, commanding posture, gaze that calculates leverage at every glance.',
                background: 'A well-connected figure who controls resources and stops at nothing to prevent discovery.',
                description: 'The primary opposing force orchestrating systematic resistance against the protagonist.',
            },
        ],
        allies: [
            {
                name: allyName,
                age: Math.floor(rnd() * 8) + 24,
                gender: pGender === 'Female' ? 'Male' : 'Female',
                role: 'Supporting',
                personality: 'Loyal, resourceful, quick with tech and logistics, grounds the protagonist during crises.',
                appearance: 'Casual functional style, observant, always carrying vital equipment.',
                background: 'Longtime friend and collaborator who stands by the protagonist through escalating danger.',
                description: 'The trusted partner without whom the mission would fail.',
            },
        ],
        mentors: [
            {
                name: mentorName,
                age: 58,
                gender: 'Male',
                role: 'Mentor',
                personality: 'Wise, measured, possessing key historical context and tactical insight.',
                appearance: 'Grey hair, scholarly demeanor, calm presence amidst high-stakes panic.',
                background: 'An experienced elder who survived a similar conflict years earlier and provides strategic guidance.',
                description: 'The guide who equips the hero with the decisive insight needed to break the stalemate.',
            },
        ],
        relationships: (p, a, ally, m) => [
            { from: p, to: a, relationship: 'targeted by / locked in conflict with' },
            { from: a, to: p, relationship: 'seeks to silence / manipulate' },
            { from: ally, to: p, relationship: 'trusted ally & partner of' },
            { from: p, to: m, relationship: 'mentored by / seeks counsel from' },
            { from: m, to: a, relationship: 'understands true vulnerabilities of' },
        ],
        episodeThemes: [
            {
                title: 'The Catalyst',
                summaryTemplate: (p, a, ally, m, title) => `The status quo is shattered when ${p} stumbles upon a shocking discovery connected to ${storyIdea.slice(0, 60)}. When ${a}'s operatives intervene, ${p} and ${ally} are forced to make a daring escape into the unknown.`,
            },
            {
                title: 'The Gathering Storm',
                summaryTemplate: (p, a, ally, m, title) => `${p} and ${ally} trace the roots of the crisis, uncovering that ${a}'s influence reaches much higher than expected. An unexpected betrayal tests their trust to the breaking point.`,
            },
            {
                title: 'The Hidden Vault',
                summaryTemplate: (p, a, ally, m, title) => `With strategic insight from ${m}, ${p} orchestrates a high-stakes infiltration to recover critical evidence. In the heart of the enemy stronghold, a dramatic confrontation reveals a stunning personal connection.`,
            },
            {
                title: 'Point of No Return',
                summaryTemplate: (p, a, ally, m, title) => `${a} strikes back with overwhelming force, cutting off all retreat routes. Cornered and outgunned, ${p} makes a fateful choice that changes the rules of engagement.`,
            },
            {
                title: 'The Final Reckoning',
                summaryTemplate: (p, a, ally, m, title) => `In an electrifying climax, ${p} turns ${a}'s own weapon against them in full view of the public. Truth prevails, restoring balance and opening a fresh horizon.`,
            },
        ],
        sceneLocations: [
            'The Incident Site - Midnight',
            'Underground Safehouse & Operations Hub',
            'The Antagonist\'s Inner Sanctum',
            'Crowded City Transit Hub in the Rain',
            'High-Rise Overlook at Twilight',
        ],
    };
}
// ─── Extract User-Provided Character Names from Prompt ─────
function extractUserCharacterNames(prompt) {
    const extracted = [];
    const usedNames = new Set();
    const stopWords = new Set([
        'the', 'and', 'but', 'for', 'his', 'her', 'she', 'him', 'who', 'what',
        'when', 'how', 'all', 'not', 'with', 'from', 'they', 'has', 'had',
        'will', 'can', 'just', 'are', 'was', 'been', 'being', 'have', 'does',
        'while', 'into', 'about', 'over', 'after', 'between', 'through',
        'during', 'before', 'once', 'then', 'than', 'each', 'every', 'some',
        'story', 'series', 'episode', 'episodes', 'drama', 'micro', 'creator',
        'idea', 'characters', 'character', 'locked', 'title', 'genre', 'tone',
    ]);
    function addName(rawName, role, context) {
        const clean = rawName.replace(/^[-*•\d.)\s]+/, '').replace(/[:(\[].*$/, '').trim();
        if (!clean)
            return;
        const words = clean.split(/\s+/);
        if (words.length >= 1 && words.length <= 4) {
            if (words.every(w => /^[A-Z]/.test(w) && !stopWords.has(w.toLowerCase()))) {
                const key = clean.toLowerCase();
                if (!usedNames.has(key)) {
                    usedNames.add(key);
                    extracted.push({ name: clean, role, context });
                }
            }
        }
    }
    // 1. Check for locked characters section: "- Name: Age ... Role: ..."
    const lockedMatches = [...prompt.matchAll(/-\s*([A-Za-z\s]+?):\s*Age\s*[^,]+,\s*Gender:\s*[^,]+,\s*Role:\s*([^\n]+)/gi)];
    for (const m of lockedMatches) {
        addName(m[1], m[2]?.trim(), 'Locked character');
    }
    // 2. Check for bulleted character lists: "- Rohan Malhotra" or "* Rohan Malhotra" or "1. Rohan Malhotra"
    const lines = prompt.split(/\r?\n/);
    let inCharSection = false;
    for (const line of lines) {
        const trimmed = line.trim();
        if (/^(?:characters|cast|main characters|roles|character list)[:\s]*$/i.test(trimmed)) {
            inCharSection = true;
            continue;
        }
        if (inCharSection && /^(?:episodes|story|genre|tone|plot|summary|number of)/i.test(trimmed)) {
            inCharSection = false;
        }
        // Line starting with bullet or number
        const bulletMatch = trimmed.match(/^[-*•\d.)]\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})(?:\s*[-:(]\s*(.*))?$/);
        if (bulletMatch) {
            const namePart = bulletMatch[1].trim();
            const descPart = bulletMatch[2]?.trim() || '';
            let role;
            if (/protagonist|lead|hero/i.test(descPart))
                role = 'Protagonist';
            else if (/antagonist|villain|rival|enemy/i.test(descPart))
                role = 'Antagonist';
            else if (/mentor|boss|senior|guide/i.test(descPart))
                role = 'Mentor';
            else if (/ally|friend|partner|colleague/i.test(descPart))
                role = 'Supporting';
            addName(namePart, role, descPart);
        }
        else if (inCharSection && trimmed) {
            const lineMatch = trimmed.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})(?:\s*[-:(]\s*(.*))?$/);
            if (lineMatch) {
                addName(lineMatch[1].trim(), undefined, lineMatch[2]?.trim());
            }
        }
    }
    // 3. Check for comma-separated character lists: "Characters: Rohan Malhotra, Anika Sharma, Vivek Rao"
    const charBlockMatch = prompt.match(/(?:characters|cast)[:\s]+([^\n]+)/i);
    if (charBlockMatch) {
        const items = charBlockMatch[1].split(/[,;]/);
        for (const item of items) {
            addName(item.trim());
        }
    }
    // 4. Natural capitalized name extraction from story prompt
    const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b/g;
    let match;
    while ((match = namePattern.exec(prompt)) !== null) {
        const candidate = match[1].trim();
        const words = candidate.split(/\s+/);
        if (words.length >= 2 && words.every(w => !stopWords.has(w.toLowerCase()))) {
            addName(candidate);
        }
    }
    return extracted;
}
// ─── Core Mock Series Generator ────────────────────────────
function generateMockSeriesContent(prompt) {
    // Extract parameters from prompt
    const storyMatch = prompt.match(/CREATOR STORY IDEA:\s*"([\s\S]*?)"/i) ||
        prompt.match(/STORY IDEA:\s*([\s\S]*?)(?=\n(?:SUGGESTED TITLE|GENRE|TONE|NUMBER OF EPISODES|$))/i);
    const storyIdea = storyMatch ? storyMatch[1].trim() : prompt.slice(0, 300);
    const genreMatch = prompt.match(/GENRE:\s*([^\n]+)/i);
    const genre = genreMatch ? genreMatch[1].trim() : 'Drama';
    const toneMatch = prompt.match(/TONE:\s*([^\n]+)/i);
    const tone = toneMatch ? toneMatch[1].trim() : 'DRAMATIC';
    const episodeCountMatch = prompt.match(/NUMBER OF EPISODES:\s*(\d+)/i);
    const episodeCount = episodeCountMatch ? Math.max(1, parseInt(episodeCountMatch[1])) : 5;
    const titleMatch = prompt.match(/SUGGESTED TITLE:\s*"*([^"\n]+)"*/i);
    const suggestedTitle = titleMatch ? titleMatch[1].trim() : null;
    // Extract user-provided character names from the prompt
    const userChars = extractUserCharacterNames(prompt);
    const seed = hashString(storyIdea + genre + tone);
    const rnd = pseudoRandom(seed);
    // Dynamic Character Creation
    const characters = [];
    const defaultRoles = ['Protagonist', 'Antagonist', 'Supporting', 'Mentor'];
    const assignedNames = new Set();
    // Use user-provided characters first
    for (let i = 0; i < userChars.length; i++) {
        const uc = userChars[i];
        const role = uc.role || defaultRoles[i % defaultRoles.length] || 'Supporting';
        assignedNames.add(uc.name.toLowerCase());
        const isFemale = /a$|i$|ka$|ti$|ya$|na$|anika|shruti|tara|meera|rhea|zoya/i.test(uc.name);
        const gender = isFemale ? 'Female' : 'Male';
        const age = role === 'Mentor' ? 52 : role === 'Protagonist' ? 28 : Math.floor(rnd() * 15) + 26;
        characters.push({
            name: uc.name,
            age,
            gender,
            role,
            personality: role === 'Protagonist'
                ? `Determined, sharp, and fiercely analytical. Refuses to compromise when the stakes are highest.`
                : role === 'Antagonist'
                    ? `Calculated, authoritative, and deeply calculating. Operates with hidden leverage behind closed doors.`
                    : role === 'Mentor'
                        ? `Experienced, observant, and possessing crucial insider knowledge of the unfolding conflict.`
                        : `Loyal, resourceful, and quick to act during high-pressure moments.`,
            appearance: `Distinctive, modern styling fitting the ${genre.toLowerCase()} world. Possesses a focused and vigilant gaze.`,
            background: uc.context || `A central figure in ${storyIdea.slice(0, 70)}... whose decisions drive the core conflict.`,
            description: `Plays the pivotal role of ${role} in navigating the high-stakes narrative.`,
        });
    }
    // If fewer than 4 characters were provided, generate remaining characters tailored to the world
    if (characters.length < 4) {
        const fallbackFirstNames = ['Karan', 'Tara', 'Sameer', 'Devika', 'Vikram', 'Ananya', 'Rishi', 'Pooja', 'Nikhil', 'Zoya'];
        const fallbackLastNames = ['Mehta', 'Sethi', 'Kapoor', 'Deshmukh', 'Verma', 'Nair', 'Chopra', 'Saxena'];
        const rolesNeeded = defaultRoles.filter(r => !characters.some(c => c.role === r));
        for (const role of rolesNeeded) {
            let candidate = '';
            for (let attempt = 0; attempt < 20; attempt++) {
                const fn = pickRandom(fallbackFirstNames, rnd);
                const ln = pickRandom(fallbackLastNames, rnd);
                const full = `${fn} ${ln}`;
                if (!assignedNames.has(full.toLowerCase())) {
                    candidate = full;
                    assignedNames.add(full.toLowerCase());
                    break;
                }
            }
            if (!candidate)
                candidate = `Character ${characters.length + 1}`;
            const isFem = /tara|devika|ananya|pooja|zoya/i.test(candidate);
            characters.push({
                name: candidate,
                age: role === 'Mentor' ? 54 : 32,
                gender: isFem ? 'Female' : 'Male',
                role,
                personality: `Perceptive, steadfast, and committed to their position in the unfolding drama.`,
                appearance: `Poised and purposeful, fitting seamlessly into the ${genre.toLowerCase()} narrative atmosphere.`,
                background: `Connected to the central crisis, bringing vital perspective to the unfolding events.`,
                description: `Key ${role.toLowerCase()} driving critical twists in the story arc.`,
            });
        }
    }
    // Title derivation
    const cleanPrompt = storyIdea.replace(/[^\w\s]/g, '').trim();
    const words = cleanPrompt.split(/\s+/).filter(w => w.length > 3);
    const kw1 = words[0] ? words[0].charAt(0).toUpperCase() + words[0].slice(1) : 'The Message';
    const kw2 = words[1] ? words[1].charAt(0).toUpperCase() + words[1].slice(1) : 'Protocol';
    const finalTitle = suggestedTitle || `${kw1} ${kw2}`;
    const pChar = characters.find(c => c.role === 'Protagonist') || characters[0];
    const aChar = characters.find(c => c.role === 'Antagonist') || characters[1] || characters[0];
    const sChar = characters.find(c => c.role === 'Supporting') || characters[2] || characters[0];
    const mChar = characters.find(c => c.role === 'Mentor') || characters[3] || characters[0];
    // Dynamic Storyline & Description
    const description = `${storyIdea.trim().replace(/\.$/, '')}. A high-stakes ${genre.toLowerCase()} micro-drama told with visceral ${tone.toLowerCase()} pacing.`;
    const storyline = `${pChar.name} finds their world upended when ${storyIdea.toLowerCase().replace(/^a\s+/, '')}. Confronted by ${aChar.name}'s hidden influence, ${pChar.name} joins forces with ${sChar.name} and turns to ${mChar.name} for strategic guidance. Across escalating confrontations, secrets unravel until the decisive final showdown.`;
    // Dynamic Episode Progression tailored directly to this story
    const episodes = [];
    const arcTemplates = [
        {
            titleSuffix: 'The Initial Transmission',
            action: `${pChar.name} discovers the first undeniable sign of the crisis. When ${aChar.name}'s maneuvers begin to surface, ${pChar.name} realizes the danger is already closer than anyone imagined.`,
        },
        {
            titleSuffix: 'The Internal Trail',
            action: `${pChar.name} and ${sChar.name} trace the encrypted logs and uncover an alarming breach. A covert meeting with ${aChar.name} raises the stakes to a boiling point.`,
        },
        {
            titleSuffix: 'The Midpoint Revelation',
            action: `A hidden link is exposed between the current crisis and past events. Guided by ${mChar.name}, ${pChar.name} secures key evidence just as an ambush cuts off their primary exit.`,
        },
        {
            titleSuffix: 'The Darkest Hour',
            action: `${aChar.name} initiates an aggressive lockdown, turning the tables on ${pChar.name}. With time running out and allies under pressure, a desperate counter-strategy is formed.`,
        },
        {
            titleSuffix: 'The Final Decryption',
            action: `In a breathless climax, ${pChar.name} confronts ${aChar.name} with undeniable proof. The truth is brought into the open, resolving the crisis and cementing hard-won justice.`,
        },
    ];
    for (let i = 1; i <= episodeCount; i++) {
        const templateIndex = (i - 1) % arcTemplates.length;
        const template = arcTemplates[templateIndex];
        const epTitle = `Episode ${i}: ${template.titleSuffix}`;
        episodes.push({
            number: i,
            episodeNumber: i,
            title: epTitle,
            summary: template.action,
        });
    }
    // Dynamic Relationships
    const relationships = [
        { from: pChar.name, to: aChar.name, relationship: 'investigating / locked in conflict with' },
        { from: aChar.name, to: pChar.name, relationship: 'countering / seeking leverage over' },
        { from: sChar.name, to: pChar.name, relationship: 'confidant & tactical partner to' },
        { from: pChar.name, to: mChar.name, relationship: 'seeks counsel & strategic insight from' },
        { from: mChar.name, to: aChar.name, relationship: 'familiar with the past record of' },
    ];
    return {
        title: finalTitle,
        logline: description,
        description,
        storyline,
        characters,
        episodes,
        relationships,
    };
}
// ─── Core Mock Episode Content Generator ───────────────────
function generateMockEpisodeContent(prompt) {
    // Parse episode context from prompt
    const seriesTitleMatch = prompt.match(/SERIES:\s*"*([^"\n]+)"*/i);
    const seriesTitle = seriesTitleMatch ? seriesTitleMatch[1].trim() : 'The Series';
    const epMatch = prompt.match(/EPISODE\s*(\d+)[\s:]+["']?([^"'\n]+)["']?/i);
    const episodeNumber = epMatch ? parseInt(epMatch[1]) : 1;
    const episodeTitle = epMatch ? epMatch[2].trim() : `Episode ${episodeNumber}`;
    const summaryMatch = prompt.match(/EPISODE SUMMARY:\s*([^\n]+)/i);
    const episodeSummary = summaryMatch ? summaryMatch[1].trim() : 'Dramatic developments unfold as tension escalates.';
    const toneMatch = prompt.match(/TONE:\s*([^\n]+)/i);
    const tone = toneMatch ? toneMatch[1].trim() : 'DRAMATIC';
    // Extract character names from prompt
    const charMatches = [...prompt.matchAll(/- ([A-Za-z0-9'\s]+?)(?: \[[^\]]+\])? \(([^)]+)\):/g)];
    let characterNames = charMatches.map(m => m[1].trim());
    if (characterNames.length === 0) {
        // Fallback: look for established characters section
        const established = prompt.match(/ESTABLISHED CHARACTERS[^:]*:\s*([\s\S]*?)(?=CRITICAL|\n\n|$)/i);
        if (established) {
            const lines = established[1].split('\n').filter(l => l.trim().startsWith('-'));
            characterNames = lines.map(l => l.replace(/^-\s*/, '').split(/[:(]/)[0].trim());
        }
    }
    if (characterNames.length === 0) {
        characterNames = ['The Protagonist', 'The Antagonist'];
    }
    const p1 = characterNames[0] || 'Protagonist';
    const p2 = characterNames[1] || 'Partner';
    const p3 = characterNames[2] || 'Ally';
    const seed = hashString(seriesTitle + episodeTitle + episodeNumber);
    const rnd = pseudoRandom(seed);
    // Generate 3 cinematic scenes tailored to this specific episode
    const scenes = [
        {
            number: 1,
            title: `${episodeTitle} - Opening Hook`,
            location: `INT. ${seriesTitle.toUpperCase()} HEADQUARTERS - DUSK`,
            characters: [p1, p2],
            action: `${p1} reviews the latest developments from "${episodeTitle}". The atmosphere is charged with nervous energy. ${p2} enters abruptly, carrying critical new intelligence that confirms the stakes of this chapter.`,
            dialogue: `${p1}: "Did you find what they were hiding?"\n${p2}: "Worse. I found proof they know we're onto them."\n${p1}: (standing, resolve hardening) "Then we don't wait. We move now."`,
            camera: 'Cinematic tracking shot pushing in on the documents. Quick cut to over-the-shoulder confrontation.',
            mood: `Tense, urgent, matching ${tone.toLowerCase()} atmosphere`,
        },
        {
            number: 2,
            title: `${episodeTitle} - Escalation`,
            location: `EXT. RAIN-SWEPT PLAZA - NIGHT`,
            characters: characterNames.slice(0, 3),
            action: `${episodeSummary} An unexpected confrontation occurs in plain sight, forcing ${p1} and ${p2} to choose between retreat and an all-out gamble.`,
            dialogue: `${p2}: "This is a trap, you know that!"\n${p1}: "Every door they close gives away where they keep the keys."\n${p3 ? `${p3}: (stepping forward) "I have your back. Let's finish this."` : `${p2}: "Then don't look back."`}`,
            camera: 'Low-angle medium two-shot with ambient reflections. Handheld micro-movements emphasizing pulse-pounding stakes.',
            mood: 'Suspenseful and decisive',
        },
        {
            number: 3,
            title: `${episodeTitle} - The Turning Beat`,
            location: `INT. SECURE ARCHIVE ROOM - MIDNIGHT`,
            characters: [p1, p2],
            action: `The climax of Episode ${episodeNumber}. ${p1} discovers the critical linchpin mentioned in the briefing. A sudden alarm echoes down the corridor, setting up a razor-sharp cliffhanger.`,
            dialogue: `${p1}: (whispering, holding the discovery) "Everything they told us was backwards..."\n${p2}: "Someone's coming! Lock the door!"\n(Heavy footsteps approach outside as the screen cuts to black)`,
            camera: 'Extreme close-up on the discovery, snapping rapidly to the locked entryway. Dynamic lighting cut.',
            mood: 'High-octane cliffhanger',
        },
    ];
    const script = `EPISODE ${episodeNumber}: ${episodeTitle.toUpperCase()}
SERIES: ${seriesTitle.toUpperCase()}
FORMAT: Vertical Micro-Drama Screenplay (9:16)
TONE: ${tone.toUpperCase()}

SCENE 1 - INT. HEADQUARTERS - DUSK
${scenes[0].action}

${scenes[0].dialogue}

SCENE 2 - EXT. PLAZA - NIGHT
${scenes[1].action}

${scenes[1].dialogue}

SCENE 3 - INT. ARCHIVE ROOM - MIDNIGHT
${scenes[2].action}

${scenes[2].dialogue}

FADE OUT.
[END OF EPISODE ${episodeNumber}]`;
    return {
        scenes,
        script,
    };
}
// ─── Character Regeneration Generator ──────────────────────
function generateMockCharacter(prompt) {
    const nameMatch = prompt.match(/Regenerate the character "([^"]+)"/i);
    const name = nameMatch ? nameMatch[1].trim() : 'Character';
    const roleMatch = prompt.match(/role:\s*"([^"]+)"/i) || prompt.match(/ROLE:\s*([^\n]+)/i);
    const role = roleMatch ? roleMatch[1].trim() : 'Protagonist';
    const seriesMatch = prompt.match(/SERIES:\s*"*([^"\n]+)"*/i);
    const seriesTitle = seriesMatch ? seriesMatch[1].trim() : 'the story';
    const seed = hashString(name + seriesTitle);
    const rnd = pseudoRandom(seed);
    const traits = [
        'Fiercely protective, razor-sharp analytical mind, burdened by past secrets.',
        'Charming exterior disguising an iron will and deep emotional vulnerability.',
        'Street-smart strategist who acts on instinct and never backs down from a threat.',
        'Meticulous, quiet, observing every weakness before delivering a decisive counter-move.',
    ];
    return {
        name,
        age: Math.floor(rnd() * 20) + 24,
        gender: rnd() > 0.5 ? 'Female' : 'Male',
        role,
        personality: pickRandom(traits, rnd),
        appearance: 'Striking, expressive features with an intense gaze. Dressed with functional elegance that reflects their background.',
        background: `Deeply intertwined with the events of ${seriesTitle}. Past betrayals have shaped them into a survivor who values unwavering loyalty above all else.`,
        description: `A revitalized version of ${name}, bringing fresh psychological depth and compelling stakes to the narrative.`,
    };
}
// ─── Scene Regeneration Generator ──────────────────────────
function generateMockScene(prompt) {
    const numMatch = prompt.match(/Regenerate Scene (\d+)/i);
    const sceneNumber = numMatch ? parseInt(numMatch[1]) : 1;
    const epTitleMatch = prompt.match(/EPISODE:\s*"*([^"\n]+)"*/i);
    const epTitle = epTitleMatch ? epTitleMatch[1].trim() : 'The Episode';
    const seriesMatch = prompt.match(/SERIES:\s*"*([^"\n]+)"*/i);
    const seriesTitle = seriesMatch ? seriesMatch[1].trim() : 'The Series';
    // Extract characters
    const charMatches = [...prompt.matchAll(/- ([A-Za-z0-9'\s]+?)(?: \[[^\]]+\])? \(/g)];
    const characters = charMatches.length > 0 ? charMatches.map(m => m[1].trim()).slice(0, 2) : ['Protagonist', 'Antagonist'];
    const p1 = characters[0] || 'Protagonist';
    const p2 = characters[1] || 'Antagonist';
    return {
        number: sceneNumber,
        title: `${epTitle} - Scene ${sceneNumber} (Heightened Cut)`,
        location: `INT. ${seriesTitle.toUpperCase()} - SECURE SANCTUM - NIGHT`,
        characters: [p1, p2],
        action: `A newly reimagined, high-tension confrontation for Scene ${sceneNumber}. ${p1} and ${p2} face each other with nowhere left to run. Shadows flicker across cold glass as words carry the weight of life-altering stakes.`,
        dialogue: `${p1}: "You thought nobody would ever trace the line back to you."\n${p2}: (calmly pouring a glass of water) "Tracing the line is easy. Surviving where it leads is the hard part."\n${p1}: "I'm not asking for your permission anymore."`,
        camera: 'Intense push-in two-shot with shallow depth of field. Dutch angle emphasizing psychological vertigo.',
        mood: 'Gripping, high tension, cinematic',
    };
}
function generateMockEpisodeOutline(prompt) {
    const epMatch = prompt.match(/Regenerate the outline for Episode (\d+)/i);
    const epNum = epMatch ? parseInt(epMatch[1]) : 1;
    const seriesMatch = prompt.match(/SERIES:\s*"*([^"\n]+)"*/i);
    const seriesTitle = seriesMatch ? seriesMatch[1].trim() : 'The Series';
    const charMatches = [...prompt.matchAll(/- ([A-Za-z0-9'\s]+?)(?: \[[^\]]+\])? \(/g)];
    const char1 = charMatches[0]?.[1]?.trim() || 'The protagonist';
    const char2 = charMatches[1]?.[1]?.trim() || 'The rival';
    const outlineTitles = [
        `The Catalyst Protocol`,
        `Shadows in the Corridor`,
        `The Breaking Point`,
        `Zero Hour Convergence`,
        `Echoes and Repercussions`,
    ];
    const chosenTitle = outlineTitles[(epNum - 1) % outlineTitles.length] || `Episode ${epNum}: Reckoning`;
    return {
        episodeNumber: epNum,
        title: chosenTitle,
        summary: `In Episode ${epNum}, ${char1} stumbles upon a concealed discrepancy that threatens the foundation of ${seriesTitle}. When confronted by ${char2}, an unexpected high-stakes ultimatum forces a split-second decision with irreversible consequences.`,
    };
}
// ─── Cost Estimation ───────────────────────────────────────
function estimateCost(type, episodeCount) {
    const rates = {
        promptPer1k: 0.00015,
        completionPer1k: 0.0006,
    };
    let promptTokens;
    let completionTokens;
    let breakdown = [];
    switch (type) {
        case 'series':
            promptTokens = 900;
            completionTokens = 2200 + (episodeCount || 5) * 220;
            breakdown = [
                { item: 'Story Arc & Title Architecture', tokens: 700, cost: (700 * rates.completionPer1k) / 1000 },
                { item: 'Cast & Relationship Bible', tokens: 900, cost: (900 * rates.completionPer1k) / 1000 },
                {
                    item: `Serialized Episode Progression (${episodeCount || 5} eps)`,
                    tokens: (episodeCount || 5) * 220,
                    cost: ((episodeCount || 5) * 220 * rates.completionPer1k) / 1000,
                },
            ];
            break;
        case 'episode':
            promptTokens = 1300;
            completionTokens = 3200;
            breakdown = [
                { item: 'Scene Architecture (3-5 scenes)', tokens: 1600, cost: (1600 * rates.completionPer1k) / 1000 },
                { item: 'Full Screenplay Script', tokens: 1600, cost: (1600 * rates.completionPer1k) / 1000 },
            ];
            break;
        case 'episode_outline':
            promptTokens = 500;
            completionTokens = 350;
            breakdown = [{ item: 'Episode Narrative Outline & Hook', tokens: 350, cost: (350 * rates.completionPer1k) / 1000 }];
            break;
        case 'character':
            promptTokens = 550;
            completionTokens = 450;
            breakdown = [{ item: 'Character Profile & Traits', tokens: 450, cost: (450 * rates.completionPer1k) / 1000 }];
            break;
        case 'scene':
            promptTokens = 650;
            completionTokens = 550;
            breakdown = [{ item: 'Scene Re-generation & Dialogue', tokens: 550, cost: (550 * rates.completionPer1k) / 1000 }];
            break;
    }
    const totalTokens = promptTokens + completionTokens;
    const estimatedCost = (promptTokens * rates.promptPer1k) / 1000 + (completionTokens * rates.completionPer1k) / 1000;
    return {
        estimatedPromptTokens: promptTokens,
        estimatedCompletionTokens: completionTokens,
        estimatedTotalTokens: totalTokens,
        estimatedCost: Math.round(estimatedCost * 10000) / 10000,
        breakdown,
    };
}
//# sourceMappingURL=ai.service.js.map