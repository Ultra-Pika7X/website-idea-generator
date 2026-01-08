import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, FileText, Target, Users, Zap, DollarSign, Loader2 } from 'lucide-react';
import { Idea, ProductSpec } from '@/lib/ideaEngine';
import { cn } from '@/lib/utils';

interface StepsModalProps {
    idea: Idea | null;
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (idea: Idea) => void;
    onExpand: (idea: Idea) => void;
    isExpanding: boolean;
}

export const StepsModal: React.FC<StepsModalProps> = ({ idea, isOpen, onClose, onGenerate, onExpand, isExpanding }) => {
    if (!idea) return null;

    const spec = idea.productSpec;

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
                        className="fixed inset-y-0 right-0 w-full max-w-xl bg-white/90 backdrop-blur-2xl border-l border-white/50 shadow-2xl z-50 p-0 overflow-y-auto flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 pb-4 border-b border-slate-200">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-xs font-bold tracking-wider text-blue-500 uppercase">{idea.type} Idea</span>
                                    <h2 className="text-3xl font-bold text-slate-900 mt-1">{idea.title}</h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>
                            <p className="text-slate-700">{idea.description}</p>
                            <div className="flex gap-2 mt-4">
                                {idea.tags.map(t => (
                                    <span key={t} className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium">#{t}</span>
                                ))}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-8">

                            {/* Actions */}
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={() => onGenerate(idea)}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    Generate Prototype
                                </button>
                            </div>

                            <hr className="border-slate-200" />

                            {/* Product Blueprint Section */}
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <FileText className="w-6 h-6 text-slate-400" />
                                    Product Blueprint
                                </h3>

                                {!spec ? (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                            <Target className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h4 className="font-bold text-slate-700 mb-2">Refine this Idea</h4>
                                        <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
                                            Use AI to expand this simple idea into a detailed product specification including features, target users, and monetization.
                                        </p>
                                        <button
                                            onClick={() => onExpand(idea)}
                                            disabled={isExpanding}
                                            className="px-6 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-colors flex items-center gap-2 mx-auto"
                                        >
                                            {isExpanding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-orange-500" />}
                                            {isExpanding ? "Expanding..." : "Create Blueprint"}
                                        </button>
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                            <div className="flex items-center gap-2 mb-2 text-blue-800 font-bold">
                                                <Target className="w-4 h-4" /> The Problem
                                            </div>
                                            <p className="text-blue-900 leading-relaxed text-sm">{spec.problem}</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                                                <div className="flex items-center gap-2 mb-2 text-emerald-800 font-bold">
                                                    <Users className="w-4 h-4" /> Target Users
                                                </div>
                                                <p className="text-emerald-900 text-sm">{spec.targetUsers}</p>
                                            </div>
                                            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                                                <div className="flex items-center gap-2 mb-2 text-amber-800 font-bold">
                                                    <DollarSign className="w-4 h-4" /> Monetization
                                                </div>
                                                <p className="text-amber-900 text-sm">{spec.monetization || "Free / Open Source"}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-orange-500" /> Core Features
                                            </h4>
                                            <ul className="space-y-2">
                                                {spec.features.map((f, i) => (
                                                    <li key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                                                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 mt-0.5">{i + 1}</div>
                                                        <span className="text-slate-700 text-sm">{f}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
