import { GoogleGenerativeAI } from "@google/generative-ai";
import { Idea, ProductSpec } from "./ideaEngine";

// Use Groq for free code generation (Llama 3 70B is excellent at coding)
// Fallback to Gemini if needed
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export interface GeneratedApp {
  html: string;
  css: string;
  js: string;
  explanation: string;
}

// Helper to get Groq Key from env or storage
const getGroqKey = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_GROQ_API_KEY || localStorage.getItem("groq_api_key");
  }
  return process.env.NEXT_PUBLIC_GROQ_API_KEY;
};

// New function using Groq (Free, Fast)
export async function generateAppCode(idea: Idea, geminiApiKey?: string): Promise<GeneratedApp> {
  const groqKey = getGroqKey();

  // Prefer Groq because it's free and fast
  if (groqKey) {
    console.log("Using Groq for prototype generation...");
    try {
      return await generateAppCodeGroq(idea, groqKey);
    } catch (e) {
      console.warn("Groq failed, falling back to Gemini if available", e);
    }
  }

  // Fallback to Gemini if Groq fails or no key
  if (geminiApiKey) {
    return await generateAppCodeGemini(idea, geminiApiKey);
  }

  throw new Error("No API Key available for Code Generation (Groq or Gemini)");
}

async function generateAppCodeGroq(idea: Idea, apiKey: string): Promise<GeneratedApp> {
  const prompt = `
    You are an expert full-stack web developer used to prototyping ideas instantly.
    
    Task: Create a single-file functional prototype for the following app idea:
    Title: ${idea.title}
    Description: ${idea.description}
    Type: ${idea.type}
    Niche: ${idea.tags.join(", ")}

    Requirements:
    1. Output MUST be three separate strings: 'html' (structure), 'css' (styling), 'js' (logic).
    2. HTML should NOT contain <style> or <script> tags. Putting them in separate fields.
    3. Use modern, semantic HTML5.
    4. CSS must be clean, modern, and responsive. You can use standard CSS variables.
    5. JS must be vanilla modern ES6+.
    6. Ensure the app is fully functional and interactive (no placeholders).
    7. Do EXACTLY what the idea describes.

    Response Format:
    Return a STRICT JSON object (no markdown, just raw JSON):
    {
      "html": "<div ...>...</div>",
      "css": "body { ... }",
      "js": "const app = ...",
      "explanation": "Brief summary of features"
    }
  `;

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      response_format: { type: "json_object" } // Force JSON
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq Error: ${err}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  return JSON.parse(content) as GeneratedApp;
}

// Original Gemini implementation (kept as fallback)
async function generateAppCodeGemini(idea: Idea, apiKey: string): Promise<GeneratedApp> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    Create a single-file functional HTML/JS/CSS prototype for:
    Title: ${idea.title}
    Description: ${idea.description}
    
    Return JSON:
    { "html": "...", "explanation": "..." }
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(text) as GeneratedApp;
}

// Provide valid export for AI idea generation (used as fallback in aiProviders logic)
export async function generateIdeasAI(niche: string, count: number = 6, apiKey: string): Promise<Idea[]> {
  /* ... Legacy function kept for compatibility, but aiProviders.ts handles the logic ... */
  // We'll just define it briefly to satisfy imports if needed
  if (!apiKey) throw new Error("API Key is missing for AI Generation");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    const result = await model.generateContent(`Generate ${count} ideas for ${niche}. Return JSON array.`);
    const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    const templates = JSON.parse(text);
    return templates.map((t: any) => ({
      id: crypto.randomUUID(),
      title: t.title,
      description: t.description,
      type: "App", tags: [], difficulty: "Medium", techStack: [],
      createdAt: Date.now(), liked: false, checked: false
    }));
  } catch (e) { throw e; }
}

export async function expandIdeaAI(idea: Idea, apiKey: string): Promise<ProductSpec> {
  // Logic remains same, or could switch to Groq too. 
  // For simplicity, keeping Gemini here but you could refactor similarly.
  if (!apiKey) throw new Error("API Key missing");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Expand this idea: ${idea.title}. Return JSON {appName, problem, targetUsers, features, monetization}`;
  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(text) as ProductSpec;
}
