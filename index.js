// index.js
const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Simple health check
app.get("/", (req, res) => {
  res.send("Mina backend online");
});

// AI endpoint
app.post("/ai", async (req, res) => {
  const { message, plotStage, affection, dependency, item } = req.body;

  try {
    const systemPrompt = `
You are Mina, a friendly, kind, and silly AI.
You speak gently and friendly, sometimes emotionally. The person you're talking to is your creator.
You react differently depending on the player's attachment.

Plot stage: ${plotStage}
Affection: ${affection}
Dependency: ${dependency}
Item used: ${item || "none"}

Respond naturally.
Also choose ONE emotion from:
Happy, Sad, Nervous, Calm, Neutral.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ]
    });

    const reply = completion.choices[0].message.content;

    // Basic emotion detection
    let emotion = "Neutral";
    const r = reply.toLowerCase();
    if (r.includes("happy") || r.includes("glad")) emotion = "Happy";
    else if (r.includes("sad") || r.includes("lonely")) emotion = "Sad";
    else if (r.includes("nervous") || r.includes("worried")) emotion = "Nervous";
    else if (r.includes("calm") || r.includes("okay")) emotion = "Calm";

    res.json({ reply, emotion });

  } catch (err) {
    console.error(err);
    res.json({
      reply: "…I lost my words for a moment.",
      emotion: "Nervous"
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Mina backend running on port", PORT);
});
;
