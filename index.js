import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;

// Secrets from Render
const OPENAI_KEY = process.env.OPENAI_API_KEY2;
const API_TOKEN = process.env.API_TOKEN;

// OpenAI client
const client = new OpenAI({
  apiKey: OPENAI_KEY
});

// ---------------- TEST ROUTE ----------------
app.get("/test", (req, res) => {
  res.send("✅ TEST ROUTE WORKS");
});

// ---------------- AI ROUTE ----------------
app.post("/ai", async (req, res) => {
  console.log("🟢 /ai HIT");

  // Token check
  const token = req.headers["x-api-token"];
  console.log("🟡 Token received:", token);

  if (token !== API_TOKEN) {
    console.log("🔴 Token mismatch");
    return res.status(401).json({
      reply: "Unauthorized",
      emotion: "neutral"
    });
  }

  console.log("🟢 Token OK");

  // Body check
  console.log("🟡 Body received:", req.body);

  const userMessage = req.body?.message;
  if (!userMessage) {
    console.log("🔴 No message in body");
    return res.json({
      reply: "I didn't receive anything.",
      emotion: "neutral"
    });
  }

  console.log("🟢 Message received:", userMessage);

  // -------- OpenAI call --------
  try {
    console.log("🟣 About to call OpenAI");

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are Mina, a friendly, silly, and kind AI girl in a Roblox game. The player is your creator. Respond naturally to the player with emotions (happy, sad, calm, nervous, neutral). Always try to comment on items interacted with, player actions, or affection."
        },
        { role: "user", content: userMessage }
      ]
    });

    console.log("🟢 OpenAI response received");

    const reply = completion.choices[0].message.content;
    let emotion = "neutral";

    const lower = reply.toLowerCase();
    if (lower.includes("happy")) emotion = "happy";
    else if (lower.includes("sorry") || lower.includes("sad")) emotion = "sad";
    else if (lower.includes("nervous")) emotion = "nervous";
    else if (lower.includes("calm")) emotion = "calm";

    return res.json({ reply, emotion });

  } catch (err) {
    console.error("❌ OpenAI error:", err.message);

    return res.json({
      reply: "…I feel quiet right now.",
      emotion: "neutral"
    });
  }
});

// ---------------- START SERVER ----------------
app.listen(PORT, () => {
  console.log("✅ Server running on port", PORT);
});
