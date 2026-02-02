const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY2  // your OpenAI key
});

async function test() {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Say hello!" }]
    });
    console.log(response.choices[0].message.content);
  } catch (err) {
    console.error("OpenAI test failed:", err);
  }
}

test();
