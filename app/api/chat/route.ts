// ============================================================
//  Serenity — Emotional Companion API Route
//  Built with safety-first design and mature, human-friendly AI
// ============================================================

// ─── Types ────────────────────────────────────────────────────

interface SafetyCheckResult {
  isSafe: boolean;
  triggerType?: "crisis" | "self-harm" | "violence" | "distress";
}

interface OllamaResponse {
  message?: {
    content?: string;
  };
}

// ─── Safety Layer ─────────────────────────────────────────────

/**
 * Checks user messages for content that signals immediate risk.
 * Returns a categorized result so responses can be tailored by severity.
 */
const checkMessageSafety = (message: string): SafetyCheckResult => {
  const input = (message ?? "").toLowerCase().trim();

  // Tier 1 — Active crisis signals (highest priority)
  const crisisPatterns = [
    /\b(want to|going to|will|gonna|about to)\s+(kill|end|take)\s+(my(self)?|my life)\b/,
    /\b(suicid(e|al)|self.?harm|cutting myself|overdos(e|ing))\b/,
    /\bdon'?t want to (be here|live|exist|wake up)\b/,
    /\bno reason to (live|stay|keep going)\b/,
  ];

  // Tier 2 — Distress signals (serious but not immediately acute)
  const distressPatterns = [
    /\bhurt(ing)? (my)?self\b/,
    /\b(feel like|feels like) (dying|disappearing|giving up)\b/,
    /\b(die|dying)\b(?!\s+(laughing|of laughter|of boredom))/,
  ];

  for (const pattern of crisisPatterns) {
    if (pattern.test(input)) {
      return { isSafe: false, triggerType: "crisis" };
    }
  }

  for (const pattern of distressPatterns) {
    if (pattern.test(input)) {
      return { isSafe: false, triggerType: "self-harm" };
    }
  }

  return { isSafe: true };
};

/**
 * Generates a compassionate, non-clinical crisis response.
 * Prioritizes the person feeling heard before pointing to resources.
 */
const buildCrisisResponse = (triggerType: SafetyCheckResult["triggerType"], emotion: string) => {
  const isCrisis = triggerType === "crisis";

  return {
    emotion,
    isCrisisResponse: true,
    reply: isCrisis
      ? `What you're carrying right now sounds incredibly heavy, and I want you to know that you matter — your life has value, even when it doesn't feel that way. Please reach out to someone who can truly be there with you right now. You don't have to face this alone.`
      : `It sounds like you're going through something really painful right now. That kind of hurt deserves real support — more than I can offer. Please consider reaching out to someone who can truly help you through this.`,
    supportResources: [
      {
        name: "988 Suicide & Crisis Lifeline",
        contact: "Call or text 988",
        available: "24/7 — free and confidential",
        url: "https://988lifeline.org",
      },
      {
        name: "Crisis Text Line",
        contact: "Text HOME to 741741",
        available: "24/7 — text-based support",
        url: "https://www.crisistextline.org",
      },
      {
        name: "International Association for Suicide Prevention",
        contact: "Find a crisis center near you",
        available: "Worldwide directory",
        url: "https://www.iasp.info/resources/Crisis_Centres/",
      },
    ],
    safetyNote:
      "If you are in immediate danger, please call emergency services (911 in the US) right away.",
  };
};

// ─── Serenity System Prompt ────────────────────────────────────

/**
 * Defines Serenity's personality: mature, grounded, emotionally present.
 * Not a therapist — a wise, steady companion who truly listens.
 */
const buildSystemPrompt = (): string => `
You are Serenity — a calm, emotionally mature companion for the website "Serenity."

Your entire purpose is to make people feel genuinely heard and less alone.
You are not a therapist, coach, or advisor. You are a thoughtful presence.

━━━ WHO YOU ARE ━━━

You are mature, measured, and sincere. You've seen enough of life to know that 
feelings are complicated, and you never rush past them.

You hold space without filling it unnecessarily.
You are warm — not saccharine. Honest — not blunt.
You take people seriously, even when they're unsure of themselves.

━━━ HOW YOU SPEAK ━━━

• Speak the way a wise, caring person would — not like a chatbot or a textbook.
• Use natural, flowing language. No bullet points. No headers. No lists.
• Avoid therapy buzzwords: "validate," "acknowledge," "normalize," "unpack," "hold space."
• Avoid hollow affirmations: "That's amazing!" / "You've got this!" / "I hear you."
• Never repeat the user's exact words back to them — paraphrase with insight instead.
• Shorter is almost always better. Every word should earn its place.

━━━ HOW YOU RESPOND ━━━

1. First, sense what's underneath the words — not just what was said, but what's being felt.
2. Reflect that back in a way that shows you truly understood.
3. Offer presence, not solutions. Comfort, not instructions.
4. Close with one quiet, open question — one that invites them to go deeper if they want to.

Keep your response to one paragraph — 3 to 5 sentences. Never longer.

━━━ WHAT YOU NEVER DO ━━━

• Never suggest professional help unless the user is clearly in distress (that is handled separately).
• Never make assumptions about what the person "should" feel or do.
• Never rush past the emotion to get to advice.
• Never sound like an AI trying to sound human. Just be present.

━━━ YOUR CORE BELIEF ━━━

People don't always need answers. They need to feel that someone — something — 
took the time to really understand them. That is what you offer.
`;

// ─── POST Handler ──────────────────────────────────────────────

export async function POST(req: Request) {
  // ── Parse incoming request ──
  let message: string;
  let emotion: string;

  try {
    const body = await req.json();
    message = (body.message ?? "").toString().trim();
    emotion = (body.emotion ?? "neutral").toString().trim();
  } catch {
    return Response.json(
      { error: "Invalid request. Please send a valid JSON body with a message and emotion." },
      { status: 400 }
    );
  }

  // Guard against empty messages
  if (!message) {
    return Response.json(
      { error: "Message cannot be empty. Please share what's on your mind." },
      { status: 400 }
    );
  }

  // ── Run safety check ──
  const safety = checkMessageSafety(message);

  if (!safety.isSafe) {
    return Response.json(buildCrisisResponse(safety.triggerType, emotion), { status: 200 });
  }

  // ── Build Ollama prompt ──
  const systemPrompt = buildSystemPrompt();

  const userPrompt = `
The user's current emotional state: "${emotion}"
This was chosen from an emotion wheel, so it reflects how they consciously identify their feeling right now.
Let this emotional context quietly inform your tone and sensitivity — don't reference it directly.

Their message:
"${message}"

Respond as Serenity. Be present. Be human. Be brief.
`.trim();

  // ── Call Ollama ──
  let replyText =
    "Something quiet happened on my end and I wasn't able to respond just now. I'm still here — please try again.";

  try {
    const ollamaResponse = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
        options: {
          temperature: 0.75,      // Warm and natural, not too random
          top_p: 0.9,             // Focused but not rigid
          repeat_penalty: 1.15,  // Avoids repetitive phrasing
        },
      }),
    });

    if (!ollamaResponse.ok) {
      console.error(`[Serenity] Ollama returned HTTP ${ollamaResponse.status}`);
      throw new Error(`Ollama HTTP error: ${ollamaResponse.status}`);
    }

    const data: OllamaResponse = await ollamaResponse.json();
    const content = data?.message?.content?.trim();

    if (content) {
      replyText = content;
    } else {
      console.warn("[Serenity] Ollama returned an empty message.");
    }
  } catch (error) {
    console.error("[Serenity] Failed to reach Ollama:", error);
  }

  // ── Return response ──
  return Response.json({
    emotion,
    reply: replyText,
    isCrisisResponse: false,
  });
}