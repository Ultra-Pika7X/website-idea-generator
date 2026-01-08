import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Code, Play, Download, Copy, Loader2, Sparkles, FileCode, FileJson, FileType, Check } from "lucide-react";
import { GeneratedApp } from "@/lib/gemini";
import { cn } from "@/lib/utils";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface AppPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    app: GeneratedApp | null;
    isLoading: boolean;
}

type Tab = "preview" | "html" | "css" | "js";

export function AppPreviewModal({ isOpen, onClose, app, isLoading }: AppPreviewModalProps) {
    const [activeTab, setActiveTab] = useState<Tab>("preview");

    // Construct the full HTML document for preview
    const fullHtml = app ? `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated App</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
${app.css || '/* No CSS */'}
    </style>
</head>
<body class="bg-gray-50 min-h-screen text-slate-900">
${app.html || '<!-- No HTML -->'}

    <script>
${app.js || '// No JS'}
    </script>
</body>
</html>` : "";

    const handleDownloadZip = async () => {
        if (!app) return;
        const zip = new JSZip();
        zip.file("index.html", app.html || "<!-- No HTML -->");
        zip.file("style.css", app.css || "/* No CSS */");
        zip.file("script.js", app.js || "// No JS");

        // Also add a "readme" or "combined" file for convenience
        zip.file("demo_full.html", fullHtml);

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "prototype_code.zip");
    };

    const handleCopy = () => {
        let content = "";
        if (activeTab === "preview" || activeTab === "html") content = app?.html || "";
        if (activeTab === "css") content = app?.css || "";
        if (activeTab === "js") content = app?.js || "";

        if (content) {
            navigator.clipboard.writeText(content);
            alert("Copied to clipboard!");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal Window */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-7xl h-[90vh] bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-700"
                    >
                        {/* Header Toolbar */}
                        <div className="flex items-center justify-between p-3 bg-slate-900 border-b border-slate-700 shrink-0">
                            {/* Tabs */}
                            <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700">
                                <button
                                    onClick={() => setActiveTab("preview")}
                                    className={cn(
                                        "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                                        activeTab === "preview" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-slate-700"
                                    )}
                                >
                                    <Play className="w-4 h-4" /> Preview
                                </button>
                                <div className="w-px h-6 bg-slate-700 mx-1 self-center" />
                                <button
                                    onClick={() => setActiveTab("html")}
                                    className={cn(
                                        "px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                                        activeTab === "html" ? "bg-slate-700 text-orange-400" : "text-slate-400 hover:text-white hover:bg-slate-700"
                                    )}
                                >
                                    <FileCode className="w-4 h-4" /> HTML
                                </button>
                                <button
                                    onClick={() => setActiveTab("css")}
                                    className={cn(
                                        "px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                                        activeTab === "css" ? "bg-slate-700 text-blue-400" : "text-slate-400 hover:text-white hover:bg-slate-700"
                                    )}
                                >
                                    <FileType className="w-4 h-4" /> CSS
                                </button>
                                <button
                                    onClick={() => setActiveTab("js")}
                                    className={cn(
                                        "px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                                        activeTab === "js" ? "bg-slate-700 text-yellow-400" : "text-slate-400 hover:text-white hover:bg-slate-700"
                                    )}
                                >
                                    <FileJson className="w-4 h-4" /> JS
                                </button>
                            </div>

                            {/* Loading Indicator */}
                            {isLoading && (
                                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-blue-900/20 text-blue-400 rounded-full border border-blue-900/50 animate-pulse">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="text-sm font-semibold">AI is coding your prototype...</span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                {!isLoading && app && (
                                    <>
                                        <button
                                            onClick={handleCopy}
                                            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-700"
                                            title="Copy current file"
                                        >
                                            <Copy className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={handleDownloadZip}
                                            className="hidden sm:flex px-4 py-2 bg-slate-100 hover:bg-white text-slate-900 rounded-lg text-sm font-bold transition-all items-center gap-2 shadow-sm hover:shadow-md"
                                        >
                                            <Download className="w-4 h-4" /> Download ZIP
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-slate-500 ml-2"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden relative bg-[#1e1e1e]">
                            {isLoading ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 z-10 bg-slate-900">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse rounded-full" />
                                        <Loader2 className="w-16 h-16 animate-spin text-blue-500 relative z-10" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mt-8 mb-2">Building Prototype</h3>
                                    <p className="text-slate-400 max-w-sm text-center">Writing HTML structure, applying Tailwind styles, and implementing JavaScript logic...</p>
                                </div>
                            ) : app ? (
                                <div className="w-full h-full">
                                    {activeTab === "preview" && (
                                        <iframe
                                            srcDoc={fullHtml}
                                            className="w-full h-full border-none bg-white"
                                            title="App Preview"
                                            sandbox="allow-scripts allow-modals" // Secure sandbox
                                        />
                                    )}

                                    {/* Code Editors (Read-only) with proper whitespace handling */}
                                    {activeTab === "html" && (
                                        <div className="w-full h-full overflow-auto p-6 font-mono text-sm leading-relaxed text-orange-100">
                                            <pre className="whitespace-pre-wrap">{app.html}</pre>
                                        </div>
                                    )}
                                    {activeTab === "css" && (
                                        <div className="w-full h-full overflow-auto p-6 font-mono text-sm leading-relaxed text-blue-100">
                                            <pre className="whitespace-pre-wrap">{app.css || "/* No custom CSS (using Tailwind) */"}</pre>
                                        </div>
                                    )}
                                    {activeTab === "js" && (
                                        <div className="w-full h-full overflow-auto p-6 font-mono text-sm leading-relaxed text-yellow-100">
                                            <pre className="whitespace-pre-wrap">{app.js || "// No JavaScript logic"}</pre>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-slate-600">
                                    <p>Select "Generate Prototype" to see code.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
