import { GoogleGenerativeAI } from "@google/generative-ai";
import { Idea, ProductSpec } from "./ideaEngine";

const MODEL_NAME = "gemini-1.5-flash";

export interface GeneratedApp {
  html: string;
  css: string;
  js: string;
  explanation: string;
}

export async function generateAppCode(idea: Idea, apiKey: string): Promise<GeneratedApp> {
  console.log("generateAppCode called with key length:", apiKey ? apiKey.length : 0);
  if (!apiKey) throw new Error("API Key is missing");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = `
    You are an expert full-stack web developer used to prototyping ideas instantly.
    
    Task: Create a single-file functional prototype for the following app idea:
    Title: ${idea.title}
    Description: ${idea.description}
    Type: ${idea.type}
    Niche: ${idea.tags.join(", ")}

    Requirements:
    1. Output MUST be valid HTML containing embedded CSS (<style>) and JS (<script>).
    2. It should look modern, clean, and use a nice sans-serif font system.
    3. It MUST be interactive and functional (e.g., if it's a calculator, it calculates; if it's a todo list, it adds items).
    4. Use TailwindCSS via CDN script if needed for easy styling, or just clean vanilla CSS.
    5. Do not use external API calls that require other keys. Mock data if necessary.

    Response Format:
    Return a JSON object with the following structure (do not use markdown code blocks, just raw JSON):
    {
      "html": "The complete HTML structure including <style> and <script> tags",
      "explanation": "A gentle 2-sentence summary of what you built"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Cleanup markup if the model accidentally includes it
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(cleanText) as GeneratedApp;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate app. Please check your API key or try again.");
  }
}

export async function generateIdeasAI(niche: string, count: number = 6, apiKey: string): Promise<Idea[]> {
  console.log("generateIdeasAI called with key length:", apiKey ? apiKey.length : 0);
  if (!apiKey) throw new Error("API Key is missing for AI Generation");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = `
    Generate ${count} unique, high-quality app or website ideas for the "${niche}" niche.
    
    Response Format:
    Return a JSON array of objects with this structure (no markdown):
    [
      {
        "title": "Short creative name",
        "description": "2 sentence pitch",
        "type": "App" | "Website" | "Game",
        "tags": ["Tag1", "Tag2"],
        "difficulty": "Easy" | "Medium" | "Hard",
        "techStack": ["React", "Firebase"]
      }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    const templates = JSON.parse(text);

    return templates.map((t: any) => ({
      id: crypto.randomUUID(),
      title: t.title,
      description: t.description,
      type: t.type,
      tags: t.tags,
      difficulty: t.difficulty,
      techStack: t.techStack,
      createdAt: Date.now(),
      liked: false,
      checked: false
    }));
  } catch (e) {
    console.error("AI Idea Gen Failed", e);
    return [];
  }
}

export async function expandIdeaAI(idea: Idea, apiKey: string): Promise<ProductSpec> {
  if (!apiKey) throw new Error("API Key missing");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = `
    You are a senior product manager.
    
    Given this idea:
    "${idea.title}: ${idea.description}"
    
    Expand it into:
    1. App name
    2. Problem statement
    3. Target users
    4. Core features
    5. Monetization (optional)
    
    Return JSON only:
    {
      "appName": "Name",
      "problem": "...",
      "targetUsers": "...",
      "features": ["Feature 1", "Feature 2"],
      "monetization": "..."
    }
    `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(text) as ProductSpec;
  } catch (e) {
    console.error("AI Expansion Failed", e);
    throw e;
  }
}
