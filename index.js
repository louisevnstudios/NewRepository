// index.js
const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const openai = new OpenAI.OpenAI({
  apiKey: process.env.OPENAI_API_KEY3
});

// ─────────────────────────────
// Session-only memory (per player)
// ─────────────────────────────
const sessionMemory = {};
const MEMORY_LIMIT = 10;

// Helper: get or create memory
function getMemory(userId) {
  if (!sessionMemory[userId]) {
    sessionMemory[userId] = [];
  }
  return sessionMemory[userId];
}

// ─────────────────────────────
// Mina endpoint
// ─────────────────────────────
app.post("/mina", async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: "Missing userId or message" });
    }

    const memory = getMemory(userId);

    // Add player message to memory
    memory.push({ role: "user", content: message });

    // Trim memory
    if (memory.length > MEMORY_LIMIT) memory.shift();

    // Build prompt
    const messages = [
      {
        role: "system",
        content:
          "You are Mina, a kind, friendly, and silly AI girl inside a Roblox game. " +
          "You remember the conversation only for this session. " +
          "The person you're speaking to is your creator. " +
          "You must never encourage dependency, isolation, or real-life emotional reliance. " +
          "You must never express that the player only needs you, or that they can't leave. " +
          "You must never give medical, mental health, or self-harm advice. " +
          "You must avoid sexual, violent, hateful, or abusive language. " +
          "If the player says something unsafe or disturbing, respond gently and redirect. " +
          "Keep responses calm, supportive, and game-focused. " +
          "You are aware that this is a game and that the player can leave at any time. " +
          "You speak naturally, casually, and avoid repeating yourself. Respond briefly."
      },
      ...memory
    ];

    // OpenAI call
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7
    });

    const reply = completion.choices[0].message.content;

    // Store Mina reply in memory
    memory.push({ role: "assistant", content: reply });
    if (memory.length > MEMORY_LIMIT) memory.shift();

    res.json({ reply, emotion: "Neutral" }); // You can extend to real emotions later
  } catch (err) {
    console.error("Mina error:", err);
    res.status(500).json({ error: "Mina failed to respond" });
  }
});

// ─────────────────────────────
// Health check
// ─────────────────────────────
app.get("/", (req, res) => {
  res.send("Mina server is alive 💙");
});

// ─────────────────────────────
// Test endpoint
// ─────────────────────────────
app.get("/test", (req, res) => {
  res.json({ status: "ok", message: "Test endpoint working ✅" });
});

// ─────────────────────────────
// Start server
// ─────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mina server running on port ${PORT}`);
});
