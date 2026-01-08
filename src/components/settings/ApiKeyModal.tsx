import React, { useState, useEffect } from "react";
import { X, Key, Save, ExternalLink, Sparkles, Brain, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (key: string) => void;
}

export function ApiKeyModal({ isOpen, onClose, onSave }: ApiKeyModalProps) {
    const [keys, setKeys] = useState({
        gemini: "",
        groq: "",
        openrouter: "",
        opencode: ""
    });

    useEffect(() => {
        if (isOpen) {
            setKeys({
                gemini: localStorage.getItem("gemini_api_key") || "",
                groq: localStorage.getItem("groq_api_key") || "",
                openrouter: localStorage.getItem("openrouter_api_key") || "",
                opencode: localStorage.getItem("opencode_api_key") || ""
            });
        }
    }, [isOpen]);

    const handleSave = () => {
        localStorage.setItem("gemini_api_key", keys.gemini.trim());
        localStorage.setItem("groq_api_key", keys.groq.trim());
        localStorage.setItem("openrouter_api_key", keys.openrouter.trim());
        localStorage.setItem("opencode_api_key", keys.opencode.trim());

        // Notify with primary key (Gemini for ideas)
        onSave(keys.gemini.trim());
        onClose();
    };

    const updateKey = (provider: keyof typeof keys, value: string) => {
        setKeys(prev => ({ ...prev, [provider]: value }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                                        <Key className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900">AI Intelligence</h3>
                                        <p className="text-sm text-slate-500 font-medium">Configure your generation engine</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4">
                                    <Sparkles className="w-5 h-5 text-blue-500 shrink-0 mt-1" />
                                    <p className="text-slate-600 text-xs leading-relaxed">
                                        Provide API keys to unlock <strong>Ultra-Powerful Code Generation</strong>.
                                        OpenRouter/OpenCode are recommended for logic.
                                        One key per line for infinite rotation.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {/* OpenRouter */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[11px] font-bold text-slate-600 flex items-center gap-2">
                                                <Brain className="w-3.5 h-3.5 text-purple-600" />
                                                OpenRouter (DeepSeek)
                                            </label>
                                            <a href="https://openrouter.ai/keys" target="_blank" className="text-[9px] text-blue-600 font-bold hover:underline flex items-center gap-1">
                                                GET KEY <ExternalLink className="w-2.5 h-2.5" />
                                            </a>
                                        </div>
                                        <textarea
                                            value={keys.openrouter}
                                            onChange={(e) => updateKey('openrouter', e.target.value)}
                                            placeholder="sk-or-..."
                                            rows={1}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-xs resize-none"
                                        />
                                    </div>

                                    {/* OpenCode */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[11px] font-bold text-slate-600 flex items-center gap-2">
                                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                                OpenCode (Grok/Fast)
                                            </label>
                                            <a href="https://opencode.ai/" target="_blank" className="text-[9px] text-blue-600 font-bold hover:underline flex items-center gap-1">
                                                GET KEY <ExternalLink className="w-2.5 h-2.5" />
                                            </a>
                                        </div>
                                        <textarea
                                            value={keys.opencode}
                                            onChange={(e) => updateKey('opencode', e.target.value)}
                                            placeholder="Bearer key..."
                                            rows={1}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-xs resize-none"
                                        />
                                    </div>

                                    {/* Groq */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[11px] font-bold text-slate-600 flex items-center gap-2">
                                                <Cpu className="w-3.5 h-3.5 text-orange-600" />
                                                Groq (Llama 3.3)
                                            </label>
                                            <a href="https://console.groq.com/keys" target="_blank" className="text-[9px] text-blue-600 font-bold hover:underline flex items-center gap-1">
                                                GET KEY <ExternalLink className="w-2.5 h-2.5" />
                                            </a>
                                        </div>
                                        <textarea
                                            value={keys.groq}
                                            onChange={(e) => updateKey('groq', e.target.value)}
                                            placeholder="gsk_..."
                                            rows={1}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-xs resize-none"
                                        />
                                    </div>

                                    {/* Gemini */}
                                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[11px] font-bold text-slate-600 flex items-center gap-2">
                                                <div className="w-3.5 h-3.5 bg-blue-100 rounded flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                                                </div>
                                                Gemini (Brainstorming)
                                            </label>
                                            <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-[9px] text-blue-600 font-bold hover:underline flex items-center gap-1">
                                                GET KEY <ExternalLink className="w-2.5 h-2.5" />
                                            </a>
                                        </div>
                                        <textarea
                                            value={keys.gemini}
                                            onChange={(e) => updateKey('gemini', e.target.value)}
                                            placeholder="AIzaSy..."
                                            rows={1}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-xs resize-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-100 mt-4 active:scale-[0.98]"
                                >
                                    <Save className="w-5 h-5" />
                                    Save Configurations
                                </button>
                            </div>
                        </div>

                        <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
