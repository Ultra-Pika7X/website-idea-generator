// Multi-provider AI fallback system
// Tries providers in order until one succeeds

import { Idea } from "./ideaEngine";
import { v4 as uuidv4 } from 'uuid';

// Provider interface
interface AIProvider {
    name: string;
    generate: (niche: string, count: number, apiKey?: string) => Promise<Idea[]>;
}

// Shared prompt template
const getPrompt = (niche: string, count: number) => `
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

// Parse AI response to Idea objects
function parseIdeasFromJSON(text: string): Idea[] {
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const templates = JSON.parse(cleanText);

    return templates.map((t: any) => ({
        id: uuidv4(),
        title: t.title || "Untitled Idea",
        description: t.description || "",
        type: t.type || "App",
        tags: t.tags || [],
        difficulty: t.difficulty || "Medium",
        techStack: t.techStack || [],
        steps: [],
        createdAt: Date.now(),
        liked: false,
        checked: false
    }));
}

// Provider 1: Pollinations (FREE, no key required)
const pollinationsProvider: AIProvider = {
    name: "Pollinations",
    generate: async (niche: string, count: number) => {
        console.log("[AI] Trying Pollinations...");
        const prompt = encodeURIComponent(getPrompt(niche, count));
        const response = await fetch(`https://text.pollinations.ai/${prompt}`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Pollinations error: ${response.status}`);
        }

        const text = await response.text();
        return parseIdeasFromJSON(text);
    }
};

// Provider 2: Gemini (requires API key)
const geminiProvider: AIProvider = {
    name: "Gemini",
    generate: async (niche: string, count: number, apiKey?: string) => {
        if (!apiKey) throw new Error("No Gemini API key");

        console.log("[AI] Trying Gemini...");
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent(getPrompt(niche, count));
        const text = result.response.text();
        return parseIdeasFromJSON(text);
    }
};

// Provider 3: OpenRouter free models (uses DeepSeek free)
const openRouterProvider: AIProvider = {
    name: "OpenRouter",
    generate: async (niche: string, count: number, apiKey?: string) => {
        // OpenRouter requires a key, but offers free models
        // User can set OPENROUTER_KEY in localStorage
        const key = apiKey || (typeof localStorage !== 'undefined' ? localStorage.getItem("openrouter_key") : null);
        if (!key) throw new Error("No OpenRouter API key");

        console.log("[AI] Trying OpenRouter...");
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${key}`,
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-chat:free",
                messages: [{ role: "user", content: getPrompt(niche, count) }],
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenRouter error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.choices[0].message.content;
        return parseIdeasFromJSON(text);
    }
};

// Provider order (Pollinations first since it's free and keyless)
const providers: AIProvider[] = [
    pollinationsProvider,
    geminiProvider,
    openRouterProvider,
];

// Main function: try providers in order until one succeeds
export async function generateIdeasWithFallback(
    niche: string,
    count: number = 20,
    geminiApiKey?: string
): Promise<Idea[]> {
    const errors: string[] = [];

    for (const provider of providers) {
        try {
            // Skip Gemini if no key
            if (provider.name === "Gemini" && !geminiApiKey) {
                console.log(`[AI] Skipping ${provider.name} (no key)`);
                continue;
            }

            const ideas = await provider.generate(niche, count, geminiApiKey);

            if (ideas && ideas.length > 0) {
                console.log(`[AI] Success with ${provider.name}!`);
                return ideas;
            }
        } catch (error: any) {
            console.error(`[AI] ${provider.name} failed:`, error.message);
            errors.push(`${provider.name}: ${error.message}`);
        }
    }

    // All providers failed
    console.error("[AI] All providers failed:", errors);
    throw new Error(`All AI providers failed: ${errors.join("; ")}`);
}

// Re-export for backward compatibility
export { parseIdeasFromJSON };
