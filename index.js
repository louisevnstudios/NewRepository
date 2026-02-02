// 1️⃣ Imports
const express = require("express");
const OpenAI = require("openai");

// 2️⃣ App setup
const app = express();
app.use(express.json()); // Parse JSON bodies

// 3️⃣ Config
const OPENAI_API_KEY = process.env.OPENAI_API_KEY2; // Set in Render secrets
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Token for Roblox requests
const API_TOKEN = "mina_112807_joy";

// 4️⃣ In-memory conversation storage per session/token
const conversations = {}; // key = API_TOKEN (or unique player session ID)

// 5️⃣ Test route
app.get("/test", (req, res) => {
  console.log("✅ /test endpoint hit!");
  res.send("✅ TEST ROUTE WORKS!");
});

// 6️⃣ AI endpoint
app.post("/ai", async (req, res) => {
  try {
    const token = req.headers["x-api-token"];
    if (token !== API_TOKEN) {
      return res.status(401).json({ reply: "Unauthorized", emotion: "Neutral" });
    }

    const message = req.body?.message;
    if (!message || message.trim() === "") {
      return res.json({ reply: "I don't know what to say.", emotion: "Neutral" });
    }

    // Initialize conversation memory if needed
    if (!conversations[token]) {
      conversations[token] = [
        {
          role: "system",
          content: "You are Mina, a friendly, silly, and kind AI in a Roblox game. Respond naturally, and show emotions (Happy, Sad, Calm, Nervous, Neutral). The person you're talking to is your creator."
        }
      ];
    }

    // Add player message
    conversations[token].push({ role: "user", content: message });

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversations[token]
    });

    const reply = response.choices[0].message.content;

    // Add AI reply to memory
    conversations[token].push({ role: "assistant", content: reply });

    // Simple emotion detection
    let emotion = "Neutral";
    const r = reply.toLowerCase();
    if (r.includes("happy") || r.includes("glad") || r.includes("excited")) emotion = "Happy";
    else if (r.includes("sad") || r.includes("unhappy") || r.includes("upset")) emotion = "Sad";
    else if (r.includes("calm") || r.includes("relaxed")) emotion = "Calm";
    else if (r.includes("nervous") || r.includes("anxious") || r.includes("worried")) emotion = "Nervous";

    res.json({ reply, emotion });
  } catch (err) {
    console.error("⚠️ OpenAI request failed:", err);
    res.json({ reply: "I don't know what to say.", emotion: "Neutral" });
  }
});

// 7️⃣ Start server (Render requires process.env.PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
