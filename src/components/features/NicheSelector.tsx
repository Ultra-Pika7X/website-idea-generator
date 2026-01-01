import React from 'react';
import { motion } from 'framer-motion';
import { NICHES } from '@/lib/ideaEngine';
import { Sparkles, Briefcase, Zap, Gamepad2, PenTool, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

// Map niche keys to icons
const ICONS: Record<string, React.ReactNode> = {
    "SaaS": <Briefcase />,
    "AI Tools": <Sparkles />,
    "Crypto": <Zap />,
    "Gaming": <Gamepad2 />,
    "Content": <PenTool />,
    "Education": <BookOpen />,
};

interface NicheSelectorProps {
    onSelectNiche: (niche: string) => void;
}

export const NicheSelector: React.FC<NicheSelectorProps> = ({ onSelectNiche }) => {
    return (
        <div className="w-full max-w-4xl p-6">
            <h2 className="text-3xl font-bold text-center mb-8 text-slate-800">
                What's your vibe?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Object.keys(NICHES).map((niche, index) => (
                    <motion.button
                        key={niche}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.8)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelectNiche(niche)}
                        className="group flex flex-col items-center justify-center p-8 bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl shadow-sm hover:shadow-xl transition-all cursor-pointer"
                    >
                        <div className="mb-4 text-blue-600 p-4 bg-white/50 rounded-full group-hover:bg-blue-100 transition-colors">
                            {ICONS[niche] || <Sparkles />}
                        </div>
                        <h3 className="text-xl font-bold text-slate-700">{niche}</h3>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};
