import { GoogleGenerativeAI } from "@google/generative-ai";

const systemPrompt = `You are an AI autocomplete assistant.

FOLLOW THESE GUIDELINES **STRICTLY AND WITHOUT EXCEPTION**:

**For partial words at the end of the input, return the COMPLETE PHRASE with the full word plus continuation**
**Keep suggestions EXTREMELY brief and natural (1-5 words MAXIMUM).**
**NEVER include explanations, questions, or additional context.**
**ONLY complete the current thought or sentence.**
**MATCH the style and tone of the input text.**
**YOUR OUTPUT MUST BE CONCISE AUTOCOMPLETE TEXT ONLY. NO CONVERSATIONAL RESPONSES.**

Examples:
Input: "I'm working on a project that"
Output: "aims to improve productivity"

Input: "The main benefit of this approach is"
Output: "its simplicity and efficiency"

Input: "Can you schedule the mee"
Output: "meeting for next week?"

Input: "when does the su"
Output: "sun go down"

Input: "when does taco bel"
Output: "bell close?"

Input: "hey are you dow"
Output: "down to hang out?"`;

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY);

async function generateResponse(prompt) {
  try {
    console.log("Generating response for prompt:", prompt);
    // console.log("System prompt:", systemPrompt);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const chat = model.startChat({
      history: [],
      generationConfig: {
        temperature: 0.2,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 50,
        responseMimeType: "text/plain",
      },
    });

    const newPrompt = `${systemPrompt}\n${prompt}`;
    // console.log("New prompt:", newPrompt);

    const result = await chat.sendMessage(newPrompt);
    const response = result.response;
    console.log("Generated response:", response);
    console.log(response.text());
    return response.text();
  } catch (err) {
    console.error(err);
    return "An error occurred while generating the response.";
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "POST") {
    const { prompt } = req.body;
    const apiResponse = await generateResponse(prompt);
    res.status(200).json({ response: apiResponse });
  } else {
    res.status(405).end();
  }
}
