import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckSquare, Square, ChevronRight } from 'lucide-react';
import { Idea, Step } from '@/lib/ideaEngine';
import { cn } from '@/lib/utils';

interface StepsModalProps {
    idea: Idea | null;
    isOpen: boolean;
    onClose: () => void;
    onToggleStep: (ideaId: string, stepId: string) => void;
}

export const StepsModal: React.FC<StepsModalProps> = ({ idea, isOpen, onClose, onToggleStep }) => {
    if (!idea) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-md bg-white/80 backdrop-blur-2xl border-l border-white/50 shadow-2xl z-50 p-6 overflow-y-auto"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-slate-100/50 rounded-full hover:bg-slate-200/50 transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>

                        <div className="mt-8">
                            <span className="text-xs font-bold tracking-wider text-blue-500 uppercase">{idea.type} Idea</span>
                            <h2 className="text-3xl font-bold text-slate-900 mt-1 mb-2">{idea.title}</h2>
                            <div className="flex gap-2 mb-6">
                                {idea.tags.map(t => (
                                    <span key={t} className="text-xs bg-white/60 px-2 py-1 rounded text-slate-500 font-medium">#{t}</span>
                                ))}
                            </div>

                            <div className="bg-white/40 p-4 rounded-xl mb-8 border border-white/30">
                                <p className="text-slate-700 leading-relaxed">{idea.description}</p>
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <div className="w-1 h-6 bg-blue-500 rounded-full" />
                                Implementation Steps
                            </h3>

                            <div className="space-y-4">
                                {idea.steps.map((step, index) => (
                                    <div
                                        key={step.id}
                                        onClick={() => onToggleStep(idea.id, step.id)}
                                        className={cn(
                                            "group p-4 bg-white/40 rounded-xl border border-white/20 hover:bg-white/60 transition-all cursor-pointer",
                                            step.completed ? "opacity-60" : "opacity-100"
                                        )}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={cn(
                                                "mt-1 w-6 h-6 rounded-md flex items-center justify-center transition-colors",
                                                step.completed ? "bg-blue-500 text-white" : "bg-white text-slate-300 group-hover:border-blue-300"
                                            )}>
                                                {step.completed ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <h4 className={cn("font-bold text-slate-800", step.completed && "line-through text-slate-500")}>
                                                    {index + 1}. {step.title}
                                                </h4>
                                                <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
