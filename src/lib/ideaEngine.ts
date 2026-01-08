import { v4 as uuidv4 } from 'uuid';

export interface Step {
    id: string;
    title: string;
    description: string;
    completed: boolean;
}

export interface ProductSpec {
    appName: string;
    problem: string;
    targetUsers: string;
    features: string[];
    monetization: string;
}

export interface Idea {
    id: string;
    title: string;
    type: "App" | "Website" | "Game";
    description: string;
    tags: string[];
    difficulty: "Easy" | "Medium" | "Hard" | "Expert";
    techStack: string[];
    // steps: Step[]; // REMOVED per user request
    productSpec?: ProductSpec;
    createdAt: number;
    liked: boolean; // For filtering
    checked: boolean; // "Use this"
}

export const NICHES = {
    "SaaS": ["B2B", "Enterprise", "Automation", "Analytics", "CRM", "Cloud", "Management", "Platform"],
    "AI Tools": ["Generative", "Machine Learning", "Neural", "Smart", "Automated", "Vision", "Chatbot", "Predictive"],
    "Crypto": ["Decentralized", "Web3", "Blockchain", "Tokenized", "DAO", "Wallet", "Exchange", "NFT"],
    "Gaming": ["Multiplayer", "3D", "Immersive", "Voxel", "Arcade", "RPG", "Simulation", "Strategy"],
    "Content": ["Viral", "Social", "Creator", "Streaming", "Platform", "Community", "Blog", "Visual"],
    "Education": ["Learning", "Interactive", "Course", "Tutor", "Gamified", "Academy", "Study", "Quiz"],
};

// Curated Pools for high quality results (40% chance)
const CURATED_IDEAS: Record<string, Partial<Idea>[]> = {
    "SaaS": [
        { title: "Niche CRM for Plumbers", description: "A specialized CRM built for plumbing businesses to manage jobs, invoices, and customer follow-ups via SMS.", tags: ["B2B", "Vertical SaaS", "Mobile"] },
        { title: "Feedback Collector API", description: "A simple API that developers can integrate to collect and analyze user feedback with sentiment analysis.", tags: ["DevTool", "API", "Analytics"] },
        { title: "Remote Team Standup Bot", description: "A Slack/Discord bot that automates daily standups for remote teams across different timezones.", tags: ["Productivity", "Automation", "Remote Work"] },
        { title: "Freelance Tax Calculator", description: "An automated tool that scans bank statements to estimate quarterly taxes for freelancers in real-time.", tags: ["Fintech", "Automation", "Tax"] },
        { title: "Inventory Prediction AI", description: "For e-commerce brands to predict when they will run out of stock based on seasonal trends.", tags: ["E-commerce", "AI", "Logistics"] }
    ],
    "AI Tools": [
        { title: "Resize & Upscale AI", description: "A tool that intelligently upscales low-res images and extends backgrounds for social media posts.", tags: ["Image Proc", "AI", "Creative"] },
        { title: "Legal Doc Summarizer", description: "Upload complex legal PDF contracts and get a simple English summary of risks and obligations.", tags: ["Legal", "NLP", "Productivity"] },
        { title: "Voice-to-Code Assistant", description: "Dictate logic choices and having an AI convert spoken intent into boilerplate code structures.", tags: ["DevTool", "Audio", "Coding"] },
        { title: "Personal Stylist AI", description: "Upload your wardrobe and get daily outfit suggestions based on local weather and occasion.", tags: ["Lifestyle", "Vision", "Fashion"] }
    ],
    "Crypto": [
        { title: "No-Code DAO Launcher", description: "A platform allowing communities to spin up a DAO with governance tokens + voting voting in clicks.", tags: ["Web3", "DAO", "No-Code"] },
        { title: "Subscription NFT Platform", description: "Creators sell access passes as NFTs that automatically expire if a monthly fee isn't paid.", tags: ["NFT", "Creator Economy", "Payments"] },
        { title: "Cross-Chain Asset Tracker", description: "A unified dashboard to view all your DeFi assets across Ethereum, Solana, and Polygon.", tags: ["DeFi", "Wallet", "Analytics"] }
    ],
    "Gaming": [
        { title: "Voxel City Builder", description: "A relaxing browser-based city builder using voxel art, saveable to the cloud.", tags: ["Sim", "Voxel", "Casual"] },
        { title: "Typing RPG Adventure", description: "Defeat enemies by typing words correctly and quickly. Great for learning touch typing.", tags: ["Edu-Game", "RPG", "Typing"] },
        { title: "Async Chess with Powers", description: "Classic chess but with ability cards (freeze piece, swap position) played asynchronously.", tags: ["Strategy", "Multiplayer", "Turn-Based"] }
    ],
    "Content": [
        { title: "Micro-Podcast Maker", description: "Record 1-minute audio thoughts that are automatically transcribed and visualized as waves for TikTok.", tags: ["Social", "Audio", "Creator"] },
        { title: "Newsletter Cross-Promoter", description: "A network for newsletter writers to automatically swap shoutouts with similar audiences.", tags: ["Marketing", "Growth", "Email"] }
    ],
    "Education": [
        { title: "Flashcard Battler", description: "Study for exams by battling monsters. Correct answers deal damage.", tags: ["Gamification", "Study", "Mobile"] },
        { title: "Code Syntax Racer", description: "Race against others to fix syntax errors in code snippets the fastest.", tags: ["Dev", "Education", "Competitive"] }
    ]
};

// Strict Context Rules
const STRICT_TEMPLATES: Record<string, { nouns: string[], adjs: string[] }> = {
    "SaaS": {
        nouns: ["CRM", "Dashboard", "API", "Platform", "Monitor", "Scheduler", "Gateway", "Aggregator"],
        adjs: ["Vertical", "Automated", "Headless", "Collaborative", "Real-time", "Integrated", "Cloud-Native"]
    },
    "AI Tools": {
        nouns: ["Generator", "Summarizer", "Detector", "Assistant", "Optimizer", "Translator", "Agent"],
        adjs: ["Generative", "Smart", "Predictive", "Neural", "Vision-based", "Voice-activated"]
    },
    "Crypto": {
        nouns: ["Wallet", "Exchange", "Marketplace", "Bridge", "Protocol", "DAO", "Tracker"],
        adjs: ["Decentralized", "Tokenized", "Trustless", "On-chain", "Cross-chain", "Private"]
    },
    "Gaming": {
        nouns: ["RPG", "Platformer", "Simulator", "Arena", "Puzzler", "Visual Novel", "Roguelike"],
        adjs: ["Co-op", "Open-World", "Voxel", "Low-poly", "Physics-based", "Competitive"]
    },
    "Content": {
        nouns: ["Editor", "Aggregator", "Network", "Feed", "Studio", "Canvas", "Publisher"],
        adjs: ["Viral", "Curated", "Social", "Interactive", "Live", "Short-form"]
    },
    "Education": {
        nouns: ["Tutor", "Quiz", "Flashcards", "Course", "Lab", "Simulator", "Library"],
        adjs: ["Interactive", "Adaptive", "Gamified", "Visual", "Bite-sized", "Peer-to-Peer"]
    }
};

const GENERIC_NOUNS = ["App", "Platform", "Tool", "System", "Interface"];
const GENERIC_ADJS = ["Modern", "Simple", "Fast", "Secure", "Global"];

// Steps Templates
const WEB_STEPS = [
    { title: "Project Setup", description: "Initialize Next.js project with Tailwind CSS and core dependencies." },
    { title: "Design System", description: "Setup global theme, colors (Radix/Tailwind), and typography." },
    { title: "Core Features", description: "Implement the primary business logic and data structures." },
    { title: "UI Implementation", description: "Build responsive views and interactive components." },
    { title: "Auth & Database", description: "Connect to database (Postgres/Firebase) and handle user sessions." },
    { title: "Launch", description: "Deploy to Vercel, setup domain, and configure SEO metadata." }
];

const GAME_STEPS = [
    { title: "Engine Setup", description: "Initialize project in Unity/Godot or WebGL framework (Three.js/Phaser)." },
    { title: "Core Loop", description: "Prototype the main mechanic (movement, interaction, win state)." },
    { title: "Assets & Art", description: "Create or import placeholder models/sprites and sounds." },
    { title: "Game Logic", description: "Implement scoring, levels, and enemy behaviors." },
    { title: "UI & Menus", description: "Add start screen, HUD, and pause menus." },
    { title: "Polish", description: "Add particle effects, screen shake, and optimize performance." }
];

export function generateIdea(niche?: keyof typeof NICHES, forceProcedural: boolean = false): Idea {
    // 1. Chance to pick a CURATED high-quality idea
    // Only if not forced to be procedural
    if (!forceProcedural && niche && CURATED_IDEAS[niche] && Math.random() < 0.40) {
        const pool = CURATED_IDEAS[niche];
        const template = pool[Math.floor(Math.random() * pool.length)];

        // Add random slight variation to title to prevent duplicate keys if picked multiple times
        // In a real app we'd track used IDs, but for "infinite" gen this is okay-ish.
        return createIdeaObject(template.title!, template.description!, template.tags!, niche);
    }

    // 2. Strict Generation
    let adj = "";
    let noun = "";
    let tags: string[] = [];

    if (niche && STRICT_TEMPLATES[niche]) {
        const t = STRICT_TEMPLATES[niche];
        adj = t.adjs[Math.floor(Math.random() * t.adjs.length)];
        noun = t.nouns[Math.floor(Math.random() * t.nouns.length)];
        tags = [niche, adj, "Productivity"];
    } else {
        // Fallback for "Select Niche" or generic
        adj = GENERIC_ADJS[Math.floor(Math.random() * GENERIC_ADJS.length)];
        noun = GENERIC_NOUNS[Math.floor(Math.random() * GENERIC_NOUNS.length)];
        tags = ["General", "Web", "Startup"];
    }

    const title = `${adj} ${noun}`;
    const description = `A ${adj.toLowerCase()} ${noun.toLowerCase()} designed to solve specific problems in the ${niche || 'market'} space.`; // A bit generic, but better than before.

    return createIdeaObject(title, description, tags, niche);
}

function createIdeaObject(title: string, description: string, tags: string[], niche?: string): Idea {
    const isGame = niche === "Gaming" || tags.includes("Gaming") || tags.includes("RPG");
    const baseSteps = isGame ? GAME_STEPS : WEB_STEPS;

    // Tech stack guess
    const techStack = isGame ? ["Unity/Godot", "C#", "Blender"] : ["React", "Next.js", "Tailwind"];

    return {
        id: uuidv4(),
        title,
        type: isGame ? "Game" : "App",
        description,
        tags,
        difficulty: Math.random() > 0.7 ? "Hard" : "Medium",
        techStack,
        steps: baseSteps.map(s => ({
            id: uuidv4(),
            title: s.title,
            description: s.description,
            completed: false
        })),
        createdAt: Date.now(),
        liked: false,
        checked: false
    };
}

export function generateIdeaBatch(count: number = 25, niche?: keyof typeof NICHES): Idea[] {
    const batch: Idea[] = [];
    const usedTitles = new Set<string>();

    for (let i = 0; i < count; i++) {
        let idea = generateIdea(niche);

        // Simple retry for duplicates in same batch
        let attempts = 0;
        // If duplicate, try again. After 2 attempts, FORCE procedural to avoid curated collisions.
        while (usedTitles.has(idea.title) && attempts < 10) {
            idea = generateIdea(niche, attempts > 1); // Force procedural after 2 failed attempts
            attempts++;
        }

        // Even if duplicate after 10 tries (very rare with procedural), we add it. 
        // But the forceProcedural should solve 99% of this.
        usedTitles.add(idea.title);
        batch.push(idea);
    }
    return batch;
}
