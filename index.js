const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

// Config
const OPENAI_API_KEY = process.env.OPENAI_API_KEY2;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const API_TOKEN = "mina_112807_joy";

// In-memory conversation storage
const conversations = {};

// Test route
app.get("/test", (req, res) => {
    console.log("✅ /test endpoint hit!");
    res.send("✅ TEST ROUTE WORKS!");
});

// AI route
app.post("/ai", async (req, res) => {
    try {
        const token = req.headers["x-api-token"];
        if (token !== API_TOKEN) return res.status(401).json({ reply: "Unauthorized", emotion: "Neutral" });

        const message = req.body?.message;
        if (!message || message.trim() === "") return res.json({ reply: "I don't know what to say.", emotion: "Neutral" });

        // Init conversation if missing
        if (!conversations[token]) {
            conversations[token] = [
                { role: "system", content: "You are Mina, a friendly, kind, and silly AI in a Roblox game. Respond with one of the following emotions at a time (happy, sad, nervous, calm, or neutral). The person you're talking to is your creator." }
            ];
        }

        conversations[token].push({ role: "user", content: message });

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: conversations[token]
        });

        const reply = response.choices[0].message.content;
        conversations[token].push({ role: "assistant", content: reply });

        // Simple emotion detection
        let emotion = "Neutral";
        const r = reply.toLowerCase();
        if (r.includes("happy") || r.includes("glad")) emotion = "Happy";
        else if (r.includes("sad") || r.includes("upset")) emotion = "Sad";
        else if (r.includes("calm") || r.includes("relaxed")) emotion = "Calm";
        else if (r.includes("nervous") || r.includes("anxious")) emotion = "Nervous";

        res.json({ reply, emotion });
    } catch (err) {
        console.error("⚠️ OpenAI request failed:", err);
        res.json({ reply: "I don't know what to say.", emotion: "Neutral" });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
