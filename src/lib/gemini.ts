import { GoogleGenerativeAI } from "@google/generative-ai";
import { Idea, ProductSpec } from "./ideaEngine";

// Use Groq for free code generation (Llama 3 70B is excellent at coding)
// Fallback to Gemini if needed
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const OPENCODE_API_URL = "https://opencode.ai/zen/v1/responses";


export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface AppBlueprint {
  projectTitle: string;
  files: {
    path: string;
    purpose: string;
    language: string;
    requirements: string; // Specific instructions for this file
  }[];
  explanation: string;
}

export interface GeneratedApp {
  files: GeneratedFile[];
  entryPoint: string;
  explanation: string;
}

// Global state to track key usage indices for rotation
const keyUsageIndices: Record<string, number> = {
  groq: 0,
  openrouter: 0,
  gemini: 0,
  opencode: 0
};

// Helper to get Keys from env or storage (supports multiple keys one per line)
const getApiKeyPool = (provider: 'groq' | 'openrouter' | 'gemini' | 'opencode'): string[] => {
  let rawKeys = "";
  if (typeof window !== 'undefined') {
    rawKeys = localStorage.getItem(`${provider}_api_key`) || "";
  }

  if (!rawKeys) {
    const envKey = process.env[`NEXT_PUBLIC_${provider.toUpperCase()}_API_KEY`];
    if (envKey) rawKeys = envKey;
  }

  return rawKeys.split('\n').map(k => k.trim()).filter(k => k.length > 0);
};

const getRotatedKey = (provider: 'groq' | 'openrouter' | 'gemini' | 'opencode') => {
  const pool = getApiKeyPool(provider);
  if (pool.length === 0) return null;

  const index = keyUsageIndices[provider] % pool.length;
  keyUsageIndices[provider]++; // Increment for next time
  return pool[index];
};

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Main entry point for collaborative code generation
export async function generateAppCode(idea: Idea, geminiApiKey?: string): Promise<GeneratedApp> {
  const openRouterKeyPool = getApiKeyPool('openrouter');
  const groqKeyPool = getApiKeyPool('groq');
  const geminiKeyPool = getApiKeyPool('gemini');
  const openCodeKeyPool = getApiKeyPool('opencode');

  if (openRouterKeyPool.length === 0 && groqKeyPool.length === 0 && geminiKeyPool.length === 0 && openCodeKeyPool.length === 0 && !geminiApiKey) {
    throw new Error("No API Keys available. Please add them in Settings.");
  }

  // 1. Architect Phase: Design the project structure
  console.log("Collaborative Phase 1: Architecting project...");
  const architectKey = getRotatedKey('openrouter') || getRotatedKey('groq') || getRotatedKey('opencode') || getRotatedKey('gemini') || geminiApiKey;
  const blueprint = await generateArchitectBlueprint(idea, architectKey!);

  // 2. Worker Phase: Generate files in parallel
  console.log(`Collaborative Phase 2: Generating ${blueprint.files.length} files in parallel...`);

  const filePromises = blueprint.files.map((fileSpec) => {
    // Get fresh rotated keys for each file worker task to bypass rate limits
    const workerKey = getRotatedKey('opencode') || getRotatedKey('openrouter') || getRotatedKey('groq') || getRotatedKey('gemini') || geminiApiKey;
    const provider = getProviderForKey(workerKey!);
    return generateFileWithWorker(idea, blueprint, fileSpec, workerKey!, provider);
  });

  const generatedFiles = await Promise.all(filePromises);

  return {
    files: generatedFiles,
    entryPoint: "index.html",
    explanation: blueprint.explanation
  };
}

function getProviderForKey(key: string): 'openrouter' | 'groq' | 'gemini' | 'opencode' {
  if (key.includes('sk-or-')) return 'openrouter';
  if (key.includes('gsk_')) return 'groq';
  if (key.length > 30 && !key.startsWith('AIza')) return 'opencode'; // Heuristic for OpenCode keys which are often plain strings or different formats
  return 'gemini';
}

async function generateArchitectBlueprint(idea: Idea, apiKey: string): Promise<AppBlueprint> {
  const prompt = `
    You are an Expert Software Architect. 
    Task: Design a high-level project blueprint for the following app:
    Title: ${idea.title}
    Description: ${idea.description}

    Requirements:
    1. Define a MODULAR multi-file structure.
    2. Split logic into logic, UI, and utility files.
    3. You MUST include index.html.

    Return a STRICT JSON object:
    {
      "projectTitle": "${idea.title}",
      "files": [
        { "path": "index.html", "purpose": "Entry point and basic layout using Tailwind CDN", "language": "html", "requirements": "Full HTML5 with Tailwind CSS and script/link tags for other files." },
        { "path": "js/app.js", "purpose": "State management and core logic", "language": "javascript", "requirements": "Explain how it handles state." },
        { "path": "css/app.css", "purpose": "Global styles", "language": "css", "requirements": "Custom animations." }
      ],
      "explanation": "Brief overview of the architecture."
    }
  `;

  const provider = getProviderForKey(apiKey);
  const url = provider === 'groq' ? "https://api.groq.com/openai/v1/chat/completions" : OPENROUTER_API_URL;
  const modelName = provider === 'groq' ? "llama-3.3-70b-versatile" : "deepseek/deepseek-chat";

  // Use OpenRouter if available, otherwise fallback
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    // fallback to local prompt if fetch fails (simplified)
    const data = await response.json();
    throw new Error(`Architect Error: ${JSON.stringify(data)}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content) as AppBlueprint;
}

async function generateFileWithWorker(idea: Idea, blueprint: AppBlueprint, fileSpec: any, apiKey: string, provider: 'openrouter' | 'groq' | 'gemini' | 'opencode'): Promise<GeneratedFile> {
  const prompt = `
    Project Architecture: ${blueprint.explanation}
    App Idea: ${idea.title} - ${idea.description}
    Your Task: Write the code for the file: ${fileSpec.path}
    Purpose: ${fileSpec.purpose}
    Specific Requirements: ${fileSpec.requirements}

    Return a STRICT JSON object:
    { "path": "${fileSpec.path}", "content": "...YOUR CODE...", "language": "${fileSpec.language}" }
  `;

  let content = "";
  if (provider === 'gemini') {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    content = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
  } else {
    let url = OPENROUTER_API_URL;
    let modelName = "deepseek/deepseek-chat";

    if (provider === 'groq') {
      url = "https://api.groq.com/openai/v1/chat/completions";
      modelName = "llama-3.3-70b-versatile";
    } else if (provider === 'opencode') {
      url = OPENCODE_API_URL;
      modelName = "grok-code-fast-1"; // Using Grok for high-speed coding
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      }),
    });
    const data = await response.json();
    content = data.choices[0].message.content;
  }

  const result = JSON.parse(content);
  return {
    path: result.path || fileSpec.path,
    content: result.content,
    language: result.language || fileSpec.language
  };
}

async function generateAppCodeGroq(idea: Idea, apiKey: string): Promise<GeneratedApp> {
  const prompt = getSystemPrompt(idea);

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

  const prompt = getSystemPrompt(idea);

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
