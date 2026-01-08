import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface IdeaGeneratorProps {
    onGenerate: () => void;
    isGenerating: boolean;
}

export const IdeaGenerator: React.FC<IdeaGeneratorProps> = ({ onGenerate, isGenerating }) => {
    return (
        <motion.div
            className="flex flex-col items-center justify-center p-8 text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
        >
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGenerate}
                disabled={isGenerating}
                className="group relative px-8 py-4 bg-white/50 backdrop-blur-xl rounded-full shadow-xl border border-white/40 text-blue-600 font-bold text-lg overflow-hidden transition-all hover:bg-white/70"
            >
                <span className="relative z-10 flex items-center gap-2">
                    <Sparkles className={isGenerating ? "animate-spin" : "group-hover:animate-pulse"} />
                    {isGenerating ? "Brewing Magic..." : "Generate Ideas (Batch)"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-300/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>

            <p className="mt-4 text-slate-600/80 text-sm font-medium">
                Click to conjure a unique project concept with AI
            </p>
        </motion.div >
    );
};
