import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clean existing data (keep users so demo creator persists)
  await prisma.characterRelationship.deleteMany();
  await prisma.generationUsage.deleteMany();
  await prisma.generationJob.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.script.deleteMany();
  await prisma.scene.deleteMany();
  await prisma.episode.deleteMany();
  await prisma.character.deleteMany();
  await prisma.series.deleteMany();

  // Ensure a persistent demo user exists (idempotent)
  const user = await prisma.user.upsert({
    where: { email: 'demo@microdrama.local' },
    update: { name: 'Demo Creator' },
    create: { name: 'Demo Creator', email: 'demo@microdrama.local' },
  });
  console.log('✓ Created user:', user.name);

  // ── Create "The Last Metro" Series ────────────────────────
  const series = await prisma.series.create({
    data: {
      title: 'The Last Metro',
      description: 'A gripping micro-drama that blurs the line between reality and the supernatural. When a lonely college student encounters a mysterious girl on the last metro, he\'s drawn into a world where time, memory, and love intertwine in ways he never imagined.',
      prompt: 'A college student repeatedly meets a mysterious girl on the last metro but she disappears every night.',
      genre: 'Romance / Mystery',
      tone: 'SUSPENSEFUL',
      episodeCount: 5,
      episodeDuration: 3,
      storyline: 'Aarav, a literature student haunted by loneliness, discovers Maya on the last metro — a girl who seems to exist only between 11:47 PM and the final stop. Each night he remembers more of their conversations, yet she insists they\'ve met before. As Aarav digs deeper with the help of his friend Rahul and cryptic Professor Sharma, he uncovers a decades-old tragedy at the metro station and must decide: let Maya go, or risk everything to anchor her to reality.',
      status: 'IN_REVIEW',
      userId: user.id,
    },
  });
  console.log('✓ Created series:', series.title);

  // ── Characters ────────────────────────────────────────────
  const aarav = await prisma.character.create({
    data: {
      seriesId: series.id,
      name: 'Aarav',
      age: 24,
      gender: 'Male',
      role: 'Protagonist',
      personality: 'Curious, introverted, deeply empathetic. Has a habit of overthinking but acts decisively when it matters. Finds comfort in books and late-night train rides.',
      appearance: 'Tall with dark tousled hair, wears a worn leather jacket. Has thoughtful brown eyes that seem to notice everything others miss.',
      background: 'A college student studying literature, lives alone in a small apartment near the metro station. Lost his mother at 14, which left him with a deep fear of losing people he cares about.',
      description: 'The central character whose curiosity and empathy drive the narrative. His journey from lonely observer to active participant mirrors his emotional growth.',
      isLocked: true, // Locked to demonstrate the feature
    },
  });

  const maya = await prisma.character.create({
    data: {
      seriesId: series.id,
      name: 'Maya',
      age: 23,
      gender: 'Female',
      role: 'Deuteragonist',
      personality: 'Enigmatic, warm yet guarded. Carries an air of melancholy that makes her magnetic. Speaks in riddles that later prove prophetic.',
      appearance: 'Petite with flowing black hair that seems to catch light that isn\'t there. Always wears a vintage silver locket. Her smile is both comforting and impossibly sad.',
      background: 'A mystery wrapped in contradictions. She appears on the last metro every night but no one knows where she comes from or where she goes. She seems to remember things that haven\'t happened yet.',
      description: 'The mysterious girl who exists between midnight and dawn. Her true nature is the central mystery — is she a ghost, a time traveler, or something else entirely?',
      isLocked: true, // Locked to demonstrate consistency
    },
  });

  const rahul = await prisma.character.create({
    data: {
      seriesId: series.id,
      name: 'Rahul',
      age: 25,
      gender: 'Male',
      role: 'Supporting',
      personality: 'Outgoing, loyal, protective. Uses humor to mask his own insecurities. Fiercely rational — the skeptic to Aarav\'s believer.',
      appearance: 'Athletic build, bright infectious smile, always wears colorful sneakers. Has a small scar above his left eyebrow from a childhood accident.',
      background: 'Aarav\'s college roommate and best friend. Works part-time at a bookstore near campus. Secretly worries Aarav is losing touch with reality.',
      description: 'The grounding force in Aarav\'s increasingly surreal world. Provides comic relief but also serves as the audience\'s skeptical voice.',
      isLocked: false,
    },
  });

  const profSharma = await prisma.character.create({
    data: {
      seriesId: series.id,
      name: 'Professor Sharma',
      age: 55,
      gender: 'Male',
      role: 'Mentor',
      personality: 'Wise, cryptic, occasionally stern. Knows more than he reveals. Has a dry wit that emerges at unexpected moments.',
      appearance: 'Distinguished grey hair, round spectacles, always carries a leather-bound notebook filled with newspaper clippings and hand-drawn maps.',
      background: 'A literature professor who specializes in folklore and urban legends. Had a personal encounter with the supernatural 30 years ago that he has never publicly acknowledged.',
      description: 'A mentor figure who holds key knowledge about the metro station\'s dark history. His reluctance to share everything he knows creates tension and mystery.',
      isLocked: false,
    },
  });
  console.log('✓ Created 4 characters (Aarav & Maya locked)');

  // ── Character Relationships ───────────────────────────────
  await prisma.characterRelationship.createMany({
    data: [
      { fromCharacterId: aarav.id, toCharacterId: maya.id, relationship: 'drawn to / fascinated by' },
      { fromCharacterId: maya.id, toCharacterId: aarav.id, relationship: 'hides secret from' },
      { fromCharacterId: rahul.id, toCharacterId: aarav.id, relationship: 'best friend of' },
      { fromCharacterId: aarav.id, toCharacterId: profSharma.id, relationship: 'seeks guidance from' },
      { fromCharacterId: profSharma.id, toCharacterId: maya.id, relationship: 'knows the truth about' },
    ],
  });
  console.log('✓ Created character relationships');

  // ── Episodes ──────────────────────────────────────────────
  const ep1 = await prisma.episode.create({
    data: {
      seriesId: series.id,
      number: 1,
      title: 'The Encounter',
      summary: 'Aarav takes the last metro home after a late study session and encounters Maya for the first time — or so he thinks. Their conversation feels strangely familiar, and when he reaches his stop, she vanishes without a trace.',
      status: 'IN_REVIEW',
    },
  });

  const ep2 = await prisma.episode.create({
    data: {
      seriesId: series.id,
      number: 2,
      title: 'Echoes of Yesterday',
      summary: 'Aarav returns to the metro the next night, unsure if Maya was real. She appears again, continuing their conversation as if no time has passed. Rahul begins to worry about Aarav\'s obsession with the "metro girl."',
      status: 'DRAFT',
    },
  });

  const ep3 = await prisma.episode.create({
    data: {
      seriesId: series.id,
      number: 3,
      title: 'The Locket\'s Secret',
      summary: 'Aarav finds Maya\'s silver locket on his seat after she disappears. Inside is a photograph from 1994. He takes it to Professor Sharma, who reacts with visible shock and refuses to explain why.',
      status: 'DRAFT',
    },
  });

  const ep4 = await prisma.episode.create({
    data: {
      seriesId: series.id,
      number: 4,
      title: 'Between the Stops',
      summary: 'Aarav discovers newspaper clippings about an accident at the metro station 30 years ago. Professor Sharma finally reveals the truth about what happened — and his connection to it. Maya appears to Aarav outside the metro for the first time.',
      status: 'DRAFT',
    },
  });

  const ep5 = await prisma.episode.create({
    data: {
      seriesId: series.id,
      number: 5,
      title: 'The Last Stop',
      summary: 'Armed with the truth, Aarav makes one final ride on the last metro. He must choose between letting Maya move on or attempting to anchor her to reality — a decision that will change both their fates forever.',
      status: 'DRAFT',
    },
  });
  console.log('✓ Created 5 episodes');

  // ── Scenes for Episode 1 ──────────────────────────────────
  const scene1 = await prisma.scene.create({
    data: {
      episodeId: ep1.id,
      number: 1,
      title: 'The Empty Platform',
      location: 'Metro Station - Platform 3',
      characters: ['Aarav'],
      action: 'Aarav descends the dimly lit stairs to the metro platform. The fluorescent lights flicker overhead, casting dancing shadows. He checks his phone — 11:47 PM. The platform is deserted. He paces nervously, his footsteps echoing in the cavernous space.',
      dialogue: 'Aarav: (muttering to himself) "Why is this station always empty at this hour?"\n\n(A distant melody plays, like a music box winding down)\n\nAarav: (freezing) "That sound again..."',
      camera: 'Wide establishing shot of the empty platform, slowly tracking Aarav as he descends. Low angle as he reaches the platform, emphasizing the vast empty space. Close-up on his face as he hears the melody — eyes widening with recognition.',
      mood: 'Mysterious, isolating',
    },
  });

  const scene2 = await prisma.scene.create({
    data: {
      episodeId: ep1.id,
      number: 2,
      title: 'The Arrival',
      location: 'Metro Station - Last Metro Car',
      characters: ['Aarav', 'Maya'],
      action: 'The last metro arrives with a rush of wind that ruffles Aarav\'s hair. The doors open with a pneumatic hiss. Aarav steps inside the nearly empty car and freezes — Maya sits alone by the window, reading a worn paperback. She looks up, and their eyes meet across the length of the car.',
      dialogue: 'Maya: (smiling softly, as if greeting an old friend) "You\'re here again."\n\nAarav: (confused, approaching cautiously) "I... do I know you?"\n\nMaya: (tilting her head) "You ask me that every night."\n\nAarav: (sitting across from her) "Every night? This is the first time I\'ve—"\n\nMaya: (closing her book gently) "Is it?"',
      camera: 'POV shot through the metro doors as they open — Maya framed perfectly in the center. Over-the-shoulder shot alternating between the characters as they talk. Close-up on Maya\'s enigmatic smile, her silver locket catching the light.',
      mood: 'Intriguing, dreamlike',
    },
  });

  const scene3 = await prisma.scene.create({
    data: {
      episodeId: ep1.id,
      number: 3,
      title: 'The Conversation',
      location: 'Inside the Moving Metro',
      characters: ['Aarav', 'Maya'],
      action: 'The metro glides through dark tunnels. Through the windows, the darkness is absolute — an abyss that seems to swallow time itself. Aarav sits across from Maya, captivated. She speaks with a warmth that feels impossibly familiar, as though they\'ve had this conversation a thousand times.',
      dialogue: 'Aarav: "What are you reading?"\n\nMaya: (holding up the book) "Stories about people who meet on trains." (smiling) "Funny, right?"\n\nAarav: "Do they ever find out why they keep meeting?"\n\nMaya: (her smile fading slightly) "Some stories don\'t need a why. They just need a who."\n\nAarav: "And who are you?"\n\nMaya: (after a long pause, touching her locket) "Someone who remembers."',
      camera: 'Two-shot with their reflections visible in the dark window behind them. Slow push-in as emotional tension builds. Cut to the window reflection — it shows Maya\'s reflection slightly differently from her actual appearance, a subtle and unsettling detail.',
      mood: 'Intimate, haunting',
    },
  });

  const scene4 = await prisma.scene.create({
    data: {
      episodeId: ep1.id,
      number: 4,
      title: 'The Disappearance',
      location: 'Metro Station - Final Stop',
      characters: ['Aarav'],
      action: 'The metro brakes with a shudder at the final stop. Aarav turns to tell Maya something — but her seat is empty. Only the worn paperback remains, still warm to the touch. He grabs it and bolts through the doors, searching the deserted platform frantically. She is nowhere. The last metro\'s doors close behind him with finality.',
      dialogue: 'Aarav: (turning to empty seat) "Maya—"\n\n(Beat. The seat is empty.)\n\nAarav: "Maya?! MAYA!"\n\n(He rushes out. The platform is silent except for the hum of the departing train.)\n\nAarav: (looking down at the book in his hands, whispering) "Where do you go?"',
      camera: 'Quick cut to the empty seat — a jolt to both Aarav and the audience. Handheld camera follows Aarav as he searches desperately, creating urgency. Final shot: high angle crane shot looking down at Aarav, small and alone on the vast platform, holding the book to his chest.',
      mood: 'Eerie, melancholic, yearning',
    },
  });
  console.log('✓ Created 4 scenes for Episode 1');

  // ── Script for Episode 1 ──────────────────────────────────
  await prisma.script.create({
    data: {
      episodeId: ep1.id,
      content: `THE LAST METRO
Episode 1: "The Encounter"
Written by AI Studio | Draft 1

═══════════════════════════════════════════════
FADE IN:

INT. METRO STATION - PLATFORM 3 - NIGHT

The platform is deserted. Fluorescent lights FLICKER overhead, casting uneven shadows across the yellowed tiles. The air is thick with the smell of old concrete and ozone.

AARAV (24, leather jacket, thoughtful eyes) descends the stairs, his FOOTSTEPS echoing in the empty space. He glances at his phone.

INSERT: Phone screen reads 11:47 PM

AARAV
(muttering)
Why is this station always empty at this hour?

A distant MELODY plays — ethereal, like a music box winding down. Aarav freezes mid-step, head tilting.

AARAV (CONT'D)
That sound again...

The melody fades. The RUMBLE of an approaching train fills the void.

INT. LAST METRO CAR - CONTINUOUS

The doors HISS open. Aarav steps inside. The car is nearly empty — harsh white light, scratched windows reflecting infinity.

Then he sees her.

MAYA (23, flowing black hair, silver locket) sits alone by the far window, absorbed in a worn PAPERBACK. She looks up. Their eyes meet.

A beat of recognition — or is it déjà vu?

MAYA
(warm, familiar)
You're here again.

AARAV
(thrown)
I... do I know you?

MAYA
You ask me that every night.

AARAV
(sitting across from her)
Every night? This is the first time—

MAYA
(closing her book with gentle finality)
Is it?

The doors CLOSE. The metro LURCHES forward.

INT. METRO - MOVING - CONTINUOUS

Through the windows: darkness. Absolute. The tunnel swallows everything.

Aarav studies Maya. She returns his gaze without discomfort.

AARAV
What are you reading?

Maya holds up the book: "PASSENGERS" — the cover art shows two figures on a train.

MAYA
Stories about people who meet on trains.
(beat, small smile)
Funny, right?

AARAV
Do they ever find out why they keep meeting?

MAYA
(her smile shifting, something vulnerable beneath)
Some stories don't need a why.
They just need a who.

AARAV
And who are you?

Silence. Maya's hand drifts to her SILVER LOCKET. She turns it over in her fingers.

MAYA
Someone who remembers.

In the WINDOW REFLECTION behind Maya, something is wrong — her reflection is slightly translucent, slightly out of sync. Aarav doesn't notice.

AARAV
Remembers what?

MAYA
(looking at him with devastating tenderness)
You.

The lights FLICKER. For a half-second, the car is dark.

When the lights return, Maya looks away, the vulnerability gone, replaced by that enigmatic composure.

MAYA (CONT'D)
Your stop is next.

EXT. METRO STATION - FINAL STOP - MOMENTS LATER

AARAV
(turning back to Maya)
Wait, I didn't tell you—

HER SEAT IS EMPTY.

The worn paperback lies where she sat, still warm.

AARAV (CONT'D)
(grabbing the book)
Maya?!

He BOLTS through the closing doors, onto the platform.

Nothing. No one.

The last metro pulls away, its red taillights disappearing into the tunnel like dying embers.

AARAV (CONT'D)
(whispering, clutching the book)
Where do you go?

HIGH ANGLE: Aarav stands alone on the platform, a small figure in a vast, empty space. The book pressed against his chest.

The MUSIC BOX MELODY plays one last time, barely audible.

SMASH CUT TO BLACK.

END OF EPISODE 1
═══════════════════════════════════════════════`,
    },
  });
  console.log('✓ Created script for Episode 1');

  // ── Media Assets ──────────────────────────────────────────
  await prisma.mediaAsset.createMany({
    data: [
      {
        episodeId: ep1.id,
        sceneId: scene1.id,
        type: 'IMAGE',
        url: 'https://placehold.co/1920x1080/0f0f23/e94560?text=Metro+Platform+Night',
        publicId: 'demo_platform',
        provider: 'demo',
        status: 'READY',
        filename: 'metro_platform.jpg',
      },
      {
        episodeId: ep1.id,
        sceneId: scene2.id,
        type: 'IMAGE',
        url: 'https://placehold.co/1920x1080/1a1a2e/16c79a?text=Maya+in+Metro+Car',
        publicId: 'demo_maya_metro',
        provider: 'demo',
        status: 'READY',
        filename: 'maya_metro_car.jpg',
      },
      {
        episodeId: ep1.id,
        sceneId: scene4.id,
        type: 'THUMBNAIL',
        url: 'https://placehold.co/1280x720/1a1a2e/e94560?text=Episode+1+Thumbnail',
        publicId: 'demo_ep1_thumb',
        provider: 'demo',
        status: 'READY',
        filename: 'ep1_thumbnail.jpg',
      },
    ],
  });
  console.log('✓ Created media assets');

  // ── Generation Usage Records ──────────────────────────────
  await prisma.generationUsage.createMany({
    data: [
      {
        seriesId: series.id,
        type: 'SERIES',
        promptTokens: 820,
        completionTokens: 2400,
        totalTokens: 3220,
        estimatedCost: 0.0016,
        model: 'gpt-4o-mini',
      },
      {
        seriesId: series.id,
        type: 'EPISODE',
        targetId: ep1.id,
        promptTokens: 1150,
        completionTokens: 3100,
        totalTokens: 4250,
        estimatedCost: 0.0021,
        model: 'gpt-4o-mini',
      },
    ],
  });
  console.log('✓ Created generation usage records');

  // ── Generation Job (completed) ────────────────────────────
  await prisma.generationJob.create({
    data: {
      seriesId: series.id,
      type: 'SERIES',
      status: 'COMPLETED',
      progress: 100,
      completedAt: new Date(),
      steps: JSON.stringify([
        { label: 'Understanding story idea', status: 'completed' },
        { label: 'Generating title & description', status: 'completed' },
        { label: 'Creating characters', status: 'completed' },
        { label: 'Generating episode structure', status: 'completed' },
        { label: 'Building relationships', status: 'completed' },
        { label: 'Finalizing content', status: 'completed' },
      ]),
    },
  });
  console.log('✓ Created generation job record');

  // ── Create a second series (Draft) for dashboard variety ──
  await prisma.series.create({
    data: {
      title: 'Neon Shadows',
      description: 'In a rain-soaked cyberpunk city, a rogue AI detective teams up with a human hacker to uncover a conspiracy that threatens to merge human consciousness with the digital world.',
      prompt: 'A detective AI in a cyberpunk city investigates crimes alongside a human hacker partner. They discover a plot to merge human minds with the internet.',
      genre: 'Sci-Fi / Thriller',
      tone: 'DARK',
      episodeCount: 6,
      episodeDuration: 4,
      status: 'DRAFT',
      userId: user.id,
    },
  });
  console.log('✓ Created second series: Neon Shadows');

  console.log('\n✅ Seed completed successfully!');
  console.log('────────────────────────────────────');
  console.log('Demo user: demo@microdrama.local');
  console.log('Series: "The Last Metro" (IN_REVIEW with full content)');
  console.log('Series: "Neon Shadows" (DRAFT)');
  console.log('────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
