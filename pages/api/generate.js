import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const chat = model.startChat({
  history: [],
});

async function generateResponse(prompt) {
  try {
    let result = await chat.sendMessageStream(prompt);

    let geminiResponse = "";

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      geminiResponse += chunkText;
    }

    return geminiResponse;
  } catch (err) {
    console.error(err);
  }
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { prompt } = req.body;
    const response = await generateResponse(prompt);
    res.status(200).json({ response });
  } else {
    res.status(405).end();
  }
}
