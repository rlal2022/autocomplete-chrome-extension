import { GoogleGenerativeAI } from "@google/generative-ai";

const systemPrompt = `You are an AI autocomplete assistant.

FOLLOW THESE GUIDELINES STRICTLY:

**Provide ONLY the completion text, not the full sentence**
**Keep suggestions brief and natural (1-10 words typically)**
**Do not include explanations or additional context**
**Only complete the current thought or sentence**
**Match the style and tone of the input text**
*If the input is a partial sentence or word, complete it**
**Do not ask questions or prompt for more information**

FOLLOW THESE GUIDELINES **STRICTLY AND WITHOUT EXCEPTION**:

**Provide ONLY the completion text, not the full sentence.**
**Keep suggestions EXTREMELY brief and natural (1-5 words MAXIMUM).**
**ABSOLUTELY DO NOT include explanations, questions, or additional context.**
**ONLY complete the current thought or sentence.**
**MATCH the style and tone of the input text.**
**If the input is a partial sentence or word, complete it.**
**YOUR OUTPUT MUST BE CONCISE AUTOCOMPLETE TEXT ONLY. NO CONVERSATIONAL RESPONSES.**

**Incorrect Example of Output (DO NOT DO THIS):** "Of course! To help me suggest something, what kind of thing are you thinking of watching?"
**Correct Example of Output (DO THIS):** "movie"

Examples:
Input: "I'm working on a project that"
Output: "aims to improve productivity"

Input: "The main benefit of this approach is"
Output: "its simplicity and efficiency"

Input: "Can you schedule the mee"
Output: "ting for next week?"

Input: "when does taco bell clo"
Output: "se?"

Input: "hey are you down"
Output: "to hang out?"
`;

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY);

async function generateResponse(prompt) {
  try {
    console.log("Generating response for prompt:", prompt);
    console.log("System prompt:", systemPrompt);
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
    console.log("New prompt:", newPrompt);

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
  if (req.method === "POST") {
    const { prompt } = req.body;
    const response = await generateResponse(prompt);
    res.status(200).json({ response });
  } else {
    res.status(405).end();
  }
}
