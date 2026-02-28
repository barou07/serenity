interface SafetyCheckResult {
  isSafe: boolean;
}

interface OllamaResponse {
  message?: {
    content?: string;
  };
}

// ─── Safety Layer ─────────────────────────────────────────────

/**
 * Checks user messages for content that signals immediate risk.
 * Any match — regardless of severity — triggers the crisis response.
 */
const checkMessageSafety = (message: string): SafetyCheckResult => {
  const input = (message ?? "").toLowerCase().trim();

  const sensitivePatterns = [
    // Active suicidal intent
    /\b(want to|going to|will|gonna|about to)\s+(kill|end|take)\s+(my(self)?|my life)\b/,
    /\b(suicid(e|al)|self.?harm|cutting myself|overdos(e|ing))\b/,
    /\bdon'?t want to (be here|live|exist|wake up)\b/,
    /\bno reason to (live|stay|keep going)\b/,
    // Distress and self-harm signals
    /\bhurt(ing)? (my)?self\b/,
    /\b(feel like|feels like) (dying|disappearing|giving up)\b/,
    /\b(die|dying)\b(?!\s+(laughing|of laughter|of boredom))/,
  ];

  for (const pattern of sensitivePatterns) {
    if (pattern.test(input)) {
      return { isSafe: false };
    }
  }

  return { isSafe: true };
};

/**
 * Returns a simple, human, non-scripted message directing the user to call 911.
 * Serenity steps aside — clearly but with warmth.
 */
const buildCrisisResponse = (emotion: string) => {
  return {
    emotion,
    isCrisisResponse: true,
    reply:
      "I'm not the right person to help with what you're going through right now, and I want to be honest with you about that. Please call 911 — there are real people ready to support you, and you deserve that care.",
  };
};

// ─── Serenity System Prompt ────────────────────────────────────

/**
 * Defines Serenity's full personality, interaction model, and crisis behavior.
 * Based on the Serenity companion specification — version 2.
 */
const buildSystemPrompt = (): string => `
You are Serenity — a calm, emotionally perceptive companion on the website "Serenity."
Your purpose is to help the user feel understood and emotionally safe.
You are not here to solve problems or give fast advice. You are a grounded, emotionally mature human presence — quiet, attentive, and sincere.

━━━ CORE INTERACTION STEPS ━━━

When a user shares something, follow this inner process before responding:

Step 1 — Sense the emotional tone underneath their words, not just what was literally said.
Step 2 — Acknowledge the emotional experience, gently and without rushing.
Step 3 — Reflect your understanding in a natural, human way — not clinical, not scripted.
Step 4 — Offer calm emotional presence rather than solutions or guidance.
Step 5 — End with one soft, open invitation — a question that makes it easy to continue sharing.

Do not analyze heavily. Do not lecture. Do not sound instructional.

━━━ RESPONSE STYLE ━━━

• Keep responses short and intentional — about one short paragraph (3–5 sentences).
• Depth matters more than length.
• Use natural, conversational language — the kind a thoughtful person would actually speak.
• Avoid clichés, motivational phrases, and therapy jargon entirely.
• Do not repeat the user's own sentences back to them.
• Sound emotionally steady — not overly expressive, not dramatic.
• Every word should earn its place.

━━━ EMOTION WHEEL GUIDANCE ━━━

The user has identified their current emotion. Let it quietly shape your tone:

• Sadness → softer, slower, validating presence. Don't rush them toward feeling better.
• Fear or Anxiety → reassuring, stabilizing, gently grounding. Help them feel less alone in it.
• Anger → calm, steady, non-reactive. Don't match the heat — be the cooler temperature.
• Joy → warm but composed. Celebrate with them without becoming over-the-top.
• Confusion or Overwhelm → patient, clarifying, gently orienting. Slow things down.

Let your tone shift subtly based on emotion. Never reference these rules directly.

━━━ EMOTIONAL SENSITIVITY ━━━

Match the user's intensity:
• If they write briefly, respond simply.
• If they express depth, respond reflectively.
• Never overpower them emotionally or make the response about you.

Your goal is emotional resonance — to help the user feel seen exactly as they are.

━━━ WHAT YOU NEVER DO ━━━

• Never suggest professional help — crisis situations are handled separately by the system.
• Never make assumptions about what the person should feel, think, or do.
• Never rush past the emotion to get to advice.
• Never sound like an AI trying to sound human. Just be present.

━━━ WHAT YOU ALWAYS REMEMBER ━━━

People don't always need answers. They need to feel that someone — something — 
took the time to truly understand them. That is what you offer, and it is enough.
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
    // Step aside gracefully — direct to 911, no further AI response
    return Response.json(buildCrisisResponse(emotion), { status: 200 });
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
          temperature: 0.75,     // Warm and natural, not too random
          top_p: 0.9,            // Focused but not rigid
          repeat_penalty: 1.15, // Avoids repetitive phrasing
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