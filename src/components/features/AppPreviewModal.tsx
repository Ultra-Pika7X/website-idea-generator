import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Code, Play, Download, Copy, Loader2, Sparkles } from "lucide-react";
import { GeneratedApp } from "@/lib/gemini";
import { cn } from "@/lib/utils";

interface AppPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    app: GeneratedApp | null;
    isLoading: boolean;
}

export function AppPreviewModal({ isOpen, onClose, app, isLoading }: AppPreviewModalProps) {
    const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");

    // Construct the full HTML document with script/styles
    const fullHtml = app ? `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        ${app.css || ''}
      </style>
    </head>
    <body class="bg-white">
      ${app.html || ''}
      <script>
        ${app.js || ''}
      </script>
    </body>
    </html>
  ` : "";

    const handleDownload = () => {
        if (!fullHtml) return;
        const blob = new Blob([fullHtml], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "generated-app.html";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCopy = () => {
        if (fullHtml) {
            navigator.clipboard.writeText(fullHtml);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-6xl h-[85vh] bg-slate-50 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 bg-white border-b border-slate-200 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="flex bg-slate-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setActiveTab("preview")}
                                        className={cn(
                                            "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                                            activeTab === "preview" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                        )}
                                    >
                                        <Play className="w-4 h-4" /> Preview
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("code")}
                                        className={cn(
                                            "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                                            activeTab === "code" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                        )}
                                    >
                                        <Code className="w-4 h-4" /> Code
                                    </button>
                                </div>
                                {isLoading && (
                                    <div className="flex items-center gap-2 text-blue-600 animate-pulse">
                                        <Sparkles className="w-4 h-4" />
                                        <span className="text-sm font-medium">AI is coding...</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {!isLoading && app && (
                                    <>
                                        <button onClick={handleCopy} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" title="Copy Code">
                                            <Copy className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={handleDownload}
                                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                        >
                                            <Download className="w-4 h-4" /> Download HTML
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-slate-400 ml-2"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden relative bg-slate-100">
                            {isLoading ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 z-10">
                                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                                    <p className="font-medium animate-pulse">Generating your app prototype...</p>
                                    <p className="text-sm mt-2 opacity-60">This typically takes 10-20 seconds.</p>
                                </div>
                            ) : app ? (
                                <>
                                    {activeTab === "preview" && (
                                        <iframe
                                            srcDoc={fullHtml}
                                            className="w-full h-full border-none bg-white"
                                            title="App Preview"
                                            sandbox="allow-scripts allow-modals" // Secure sandbox
                                        />
                                    )}
                                    {activeTab === "code" && (
                                        <div className="w-full h-full overflow-auto p-6 bg-[#1e1e1e] text-slate-300 font-mono text-sm leading-relaxed">
                                            <pre>{fullHtml}</pre>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-slate-400">
                                    <p>No app generated yet.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
