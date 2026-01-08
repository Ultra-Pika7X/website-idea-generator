// Multi-provider AI fallback system - EXPANDED VERSION
// Tries many providers in order until one succeeds

import { Idea } from "./ideaEngine";
import { v4 as uuidv4 } from 'uuid';

// Default API keys (from environment variables)
const DEFAULT_KEYS = {
    groq: process.env.NEXT_PUBLIC_GROQ_API_KEY || "",
    huggingface: process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || "",
};

// Provider interface
interface AIProvider {
    name: string;
    requiresKey: boolean;
    keyName?: string;
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
    // Clean up various markdown formats
    let cleanText = text
        .replace(/```json\n?/gi, "")
        .replace(/```\n?/g, "")
        .replace(/^\s*\[/, "[")
        .trim();

    // Try to extract JSON array if wrapped in other text
    const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
        cleanText = jsonMatch[0];
    }

    const templates = JSON.parse(cleanText);

    if (!Array.isArray(templates) || templates.length === 0) {
        throw new Error("Invalid response: not an array or empty");
    }

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

// === PROVIDERS ===

// Provider 1: Groq (FREE, 14,400 requests/day, super fast)
const groqProvider: AIProvider = {
    name: "Groq",
    requiresKey: false, // Has default key
    keyName: "groq_api_key",
    generate: async (niche: string, count: number) => {
        // Use default key or user's custom key
        const key = (typeof localStorage !== 'undefined' ? localStorage.getItem("groq_api_key") : null) || DEFAULT_KEYS.groq;
        if (!key) throw new Error("No Groq API key");

        console.log("[AI] Trying Groq...");
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${key}`,
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: getPrompt(niche, count) }],
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Groq error ${response.status}: ${err}`);
        }

        const data = await response.json();
        const text = data.choices[0].message.content;
        return parseIdeasFromJSON(text);
    }
};

// Provider 2: Pollinations (FREE, no key required)
const pollinationsProvider: AIProvider = {
    name: "Pollinations",
    requiresKey: false,
    generate: async (niche: string, count: number) => {
        console.log("[AI] Trying Pollinations...");

        // Use POST endpoint for better control
        const response = await fetch("https://text.pollinations.ai/", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: "user", content: getPrompt(niche, count) }],
                model: "openai",
                jsonMode: true,
            }),
        });

        if (!response.ok) {
            throw new Error(`Pollinations error: ${response.status}`);
        }

        const text = await response.text();
        return parseIdeasFromJSON(text);
    }
};

// Provider 3: Gemini (requires API key)
const geminiProvider: AIProvider = {
    name: "Gemini",
    requiresKey: true,
    keyName: "gemini_api_key",
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

// Provider 4: OpenRouter (free DeepSeek model)
const openRouterProvider: AIProvider = {
    name: "OpenRouter",
    requiresKey: true,
    keyName: "openrouter_key",
    generate: async (niche: string, count: number) => {
        const key = typeof localStorage !== 'undefined' ? localStorage.getItem("openrouter_key") : null;
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

// Provider 5: Cohere (5000 generations/month free)
const cohereProvider: AIProvider = {
    name: "Cohere",
    requiresKey: true,
    keyName: "cohere_api_key",
    generate: async (niche: string, count: number) => {
        const key = typeof localStorage !== 'undefined' ? localStorage.getItem("cohere_api_key") : null;
        if (!key) throw new Error("No Cohere API key");

        console.log("[AI] Trying Cohere...");
        const response = await fetch("https://api.cohere.ai/v1/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${key}`,
            },
            body: JSON.stringify({
                model: "command-r-plus",
                message: getPrompt(niche, count),
            }),
        });

        if (!response.ok) {
            throw new Error(`Cohere error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.text;
        return parseIdeasFromJSON(text);
    }
};

// Provider 6: HuggingFace Inference (free tier)
const huggingFaceProvider: AIProvider = {
    name: "HuggingFace",
    requiresKey: false, // Has default key
    keyName: "huggingface_key",
    generate: async (niche: string, count: number) => {
        // Use default key or user's custom key
        const key = (typeof localStorage !== 'undefined' ? localStorage.getItem("huggingface_key") : null) || DEFAULT_KEYS.huggingface;
        if (!key) throw new Error("No HuggingFace API key");

        console.log("[AI] Trying HuggingFace...");
        const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${key}`,
            },
            body: JSON.stringify({
                inputs: getPrompt(niche, count),
                parameters: { max_new_tokens: 2000 },
            }),
        });

        if (!response.ok) {
            throw new Error(`HuggingFace error: ${response.status}`);
        }

        const data = await response.json();
        const text = data[0]?.generated_text || "";
        return parseIdeasFromJSON(text);
    }
};

// Provider 7: Together AI (some free models)
const togetherProvider: AIProvider = {
    name: "Together",
    requiresKey: true,
    keyName: "together_api_key",
    generate: async (niche: string, count: number) => {
        const key = typeof localStorage !== 'undefined' ? localStorage.getItem("together_api_key") : null;
        if (!key) throw new Error("No Together API key");

        console.log("[AI] Trying Together AI...");
        const response = await fetch("https://api.together.xyz/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${key}`,
            },
            body: JSON.stringify({
                model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
                messages: [{ role: "user", content: getPrompt(niche, count) }],
            }),
        });

        if (!response.ok) {
            throw new Error(`Together error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.choices[0].message.content;
        return parseIdeasFromJSON(text);
    }
};

// Provider 8: Cerebras (free tier)
const cerebrasProvider: AIProvider = {
    name: "Cerebras",
    requiresKey: true,
    keyName: "cerebras_api_key",
    generate: async (niche: string, count: number) => {
        const key = typeof localStorage !== 'undefined' ? localStorage.getItem("cerebras_api_key") : null;
        if (!key) throw new Error("No Cerebras API key");

        console.log("[AI] Trying Cerebras...");
        const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${key}`,
            },
            body: JSON.stringify({
                model: "llama3.1-8b",
                messages: [{ role: "user", content: getPrompt(niche, count) }],
            }),
        });

        if (!response.ok) {
            throw new Error(`Cerebras error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.choices[0].message.content;
        return parseIdeasFromJSON(text);
    }
};

// Provider order (keyless first, then most generous free tiers)
const providers: AIProvider[] = [
    pollinationsProvider,   // No key needed, unlimited
    groqProvider,           // 14,400 req/day free
    geminiProvider,         // User's key
    openRouterProvider,     // Free models available
    togetherProvider,       // Free Llama models
    cohereProvider,         // 5000 gen/month
    huggingFaceProvider,    // Free inference
    cerebrasProvider,       // Fast inference
];

// Main function: try providers in order until one succeeds
// Main function: Race fast providers, then fallback to others
export async function generateIdeasWithFallback(
    niche: string,
    count: number = 20,
    geminiApiKey?: string
): Promise<Idea[]> {
    const errors: string[] = [];

    // Group 1: Fast & Free/Cheap (Race these)
    const fastProviders = [groqProvider, pollinationsProvider, cerebrasProvider];

    // Helper to try a provider and throw if it fails or returns empty
    const tryProvider = async (provider: AIProvider): Promise<Idea[]> => {
        try {
            if (provider.requiresKey) {
                const hasKey = provider.keyName === "gemini_api_key"
                    ? !!geminiApiKey
                    : typeof localStorage !== 'undefined' && !!localStorage.getItem(provider.keyName!);

                // Special case for default keys
                const hasDefaultKey = provider.name === "Groq" || provider.name === "HuggingFace";

                if (!hasKey && !hasDefaultKey) {
                    throw new Error("No API key");
                }
            }

            console.log(`[AI] Requesting ${provider.name}...`);
            const ideas = await provider.generate(niche, count, geminiApiKey);
            if (!ideas || ideas.length === 0) throw new Error("Empty result");
            console.log(`[AI] ✅ WINNER: ${provider.name}`);
            return ideas;
        } catch (e: any) {
            console.warn(`[AI] ${provider.name} failed/skipped: ${e.message}`);
            errors.push(`${provider.name}: ${e.message}`);
            throw e;
        }
    };

    // 1. Race the fast providers (Groq, Pollinations, Cerebras)
    try {
        const raceWin = await Promise.any([
            tryProvider(groqProvider),
            tryProvider(pollinationsProvider),
            tryProvider(cerebrasProvider)
        ]);
        return raceWin;
    } catch (aggregateError) {
        console.log("[AI] Fast tier failed, enforcing sequential backup...");
    }

    // 2. Backup: Try standard providers sequentially (Gemini, OpenRouter, etc)
    const backupProviders = [
        geminiProvider,
        openRouterProvider,
        togetherProvider,
        huggingFaceProvider,
        cohereProvider
    ];

    for (const provider of backupProviders) {
        try {
            return await tryProvider(provider);
        } catch {
            continue; // Already logged in tryProvider
        }
    }

    // All providers failed
    console.error("[AI] All providers failed:", errors);
    throw new Error(`All AI providers failed. Errors: ${errors.join("; ")}`);
}

// Export provider list for settings UI
export const availableProviders = providers.map(p => ({
    name: p.name,
    requiresKey: p.requiresKey,
    keyName: p.keyName,
}));

// Re-export for backward compatibility
export { parseIdeasFromJSON };
