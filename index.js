import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
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
    memory.push({
      role: "user",
      content: message
    });

    // Trim memory
    if (memory.length > MEMORY_LIMIT) {
      memory.shift();
    }

    // Build prompt
    const messages = [
      {
        role: "system",
        content:
          "You are Mina, a kind, friendly, and silly AI girl inside a Roblox game. " +
          "You remember the conversation only for this session. " +
          "The person you're speaking to is your creator. " +
          "You speak naturally, warmly, and avoid repeating yourself."
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
    memory.push({
      role: "assistant",
      content: reply
    });

    // Trim again (important)
    if (memory.length > MEMORY_LIMIT) {
      memory.shift();
    }

    res.json({ reply });
  } catch (err) {
    console.error("Mina error:", err);
    res.status(500).json({ error: "Mina failed to respond" });
  }
});

// ─────────────────────────────
// Health check (VERY important)
// ─────────────────────────────
app.get("/", (req, res) => {
  res.send("Mina server is alive 💙");
});

// ─────────────────────────────
// Start server
// ─────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mina server running on port ${PORT}`);
});
