import React, { useState, useEffect } from "react";
import { X, Key, Save, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (key: string) => void;
}

export function ApiKeyModal({ isOpen, onClose, onSave }: ApiKeyModalProps) {
    const [key, setKey] = useState("");

    useEffect(() => {
        const stored = localStorage.getItem("gemini_api_key");
        if (stored) setKey(stored);
    }, [isOpen]);

    const handleSave = () => {
        if (key.trim().length > 0) {
            localStorage.setItem("gemini_api_key", key.trim());
            onSave(key.trim());
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                        <Key className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">Configure AI</h3>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    To generate working apps from your ideas, you need a Google Gemini API Key. It's free to use for personal projects.
                                </p>

                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
                                    <div className="p-1 bg-blue-100 rounded-full shrink-0">
                                        <ExternalLink className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-blue-800 text-sm">Get your key</h4>
                                        <a
                                            href="https://aistudio.google.com/app/apikey"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline text-sm hover:text-blue-800"
                                        >
                                            aistudio.google.com/app/apikey
                                        </a>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">
                                        Enter API Key
                                    </label>
                                    <input
                                        type="password"
                                        value={key}
                                        onChange={(e) => setKey(e.target.value)}
                                        placeholder="AIzaSy..."
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm"
                                    />
                                </div>

                                <button
                                    onClick={handleSave}
                                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Key
                                </button>
                            </div>
                        </div>

                        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
