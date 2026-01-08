import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Download, Copy, Loader2, Sparkles, FileCode, FileJson, FileType, Folder, File, ChevronRight, Monitor } from "lucide-react";
import { GeneratedApp, GeneratedFile } from "@/lib/gemini";
import { cn } from "@/lib/utils";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface AppPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    app: GeneratedApp | null;
    isLoading: boolean;
}

export function AppPreviewModal({ isOpen, onClose, app, isLoading }: AppPreviewModalProps) {
    const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"code" | "preview">("preview");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Initialize selected file and preview when app changes
    useEffect(() => {
        if (app && app.files.length > 0) {
            setSelectedFilePath(app.entryPoint || app.files[0].path);
            generatePreview(app);
        }
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [app]);

    const selectedFile = useMemo(() =>
        app?.files.find(f => f.path === selectedFilePath) || null
        , [app, selectedFilePath]);

    const generatePreview = async (generatedApp: GeneratedApp) => {
        if (!generatedApp.files.length) return;

        // Cleanup old preview
        if (previewUrl) URL.revokeObjectURL(previewUrl);

        // 1. Create a map of Path -> Blob URL
        const blobMap: Record<string, string> = {};

        // We do two passes. First to create blobs for CSS/JS/Assets
        generatedApp.files.forEach(file => {
            if (file.path !== generatedApp.entryPoint) {
                const blob = new Blob([file.content], { type: getMimeType(file.path) });
                blobMap[file.path] = URL.createObjectURL(blob);
            }
        });

        // 2. Find entry point (usually index.html)
        const entryFile = generatedApp.files.find(f => f.path === generatedApp.entryPoint);
        if (!entryFile) return;

        // 3. Simple replacement logic for common links/scripts
        // This makes the files "talk" to each other in the browser sandbox
        let processedHtml = entryFile.content;

        // Add Tailwind if not present (optional, but good for prototypes)
        if (!processedHtml.includes("tailwindcss.com")) {
            processedHtml = processedHtml.replace("</head>", `<script src="https://cdn.tailwindcss.com"></script>\n</head>`);
        }

        Object.entries(blobMap).forEach(([originalPath, blobUrl]) => {
            // Replace local references like src="js/main.js" with src="blob:..."
            // Using a simple regex that handles quotes
            const escapedPath = originalPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(src|href)=["']\\.?/?${escapedPath}["']`, 'g');
            processedHtml = processedHtml.replace(regex, `$1="${blobUrl}"`);
        });

        // 4. Create final entry blob
        const finalBlob = new Blob([processedHtml], { type: "text/html" });
        const finalUrl = URL.createObjectURL(finalBlob);
        setPreviewUrl(finalUrl);
    };

    const getMimeType = (path: string) => {
        if (path.endsWith(".css")) return "text/css";
        if (path.endsWith(".js")) return "application/javascript";
        if (path.endsWith(".json")) return "application/json";
        return "text/plain";
    };

    const handleDownloadZip = async () => {
        if (!app) return;
        const zip = new JSZip();
        app.files.forEach(file => {
            zip.file(file.path, file.content);
        });
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "web_prototype_project.zip");
    };

    const handleCopy = () => {
        if (selectedFile) {
            navigator.clipboard.writeText(selectedFile.content);
            alert("File content copied!");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-[95vw] h-[92vh] bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-800"
                    >
                        {/* IDE Header */}
                        <div className="h-14 flex items-center justify-between px-4 bg-slate-900 border-b border-slate-800 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                                </div>
                                <div className="h-4 w-px bg-slate-800" />
                                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                                    <Sparkles className="w-4 h-4 text-blue-400" />
                                    <span>AI Code Generator v2.0 (DeepSeek Logic)</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                                    <button
                                        onClick={() => setViewMode("preview")}
                                        className={cn("px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-2",
                                            viewMode === "preview" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white")}
                                    >
                                        <Monitor className="w-4 h-4" /> Preview
                                    </button>
                                    <button
                                        onClick={() => setViewMode("code")}
                                        className={cn("px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-2",
                                            viewMode === "code" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white")}
                                    >
                                        <FileCode className="w-4 h-4" /> Code
                                    </button>
                                </div>
                                <div className="h-8 w-px bg-slate-800 mx-2" />
                                <button onClick={handleDownloadZip} className="flex px-4 py-1.5 bg-slate-100 hover:bg-white text-slate-950 rounded-lg text-sm font-bold transition-all items-center gap-2">
                                    <Download className="w-4 h-4" /> Export ZIP
                                </button>
                                <button onClick={onClose} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-slate-500">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* IDE Content */}
                        <div className="flex-1 flex overflow-hidden">
                            {isLoading ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-slate-950">
                                    <div className="relative mb-12">
                                        <div className="absolute inset-0 bg-blue-500/10 blur-3xl animate-pulse rounded-full" />
                                        <div className="relative flex items-center justify-center">
                                            <Loader2 className="w-20 h-20 animate-spin text-blue-500/40" />
                                            <div className="absolute flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 w-full max-w-sm px-6">
                                        <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-800 animate-in fade-in slide-in-from-bottom-4">
                                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                                <Brain className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-white">Architect Active</h4>
                                                <p className="text-[10px] text-slate-500">DeepSeek is designing the project blueprint...</p>
                                            </div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                        </div>

                                        <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-800 opacity-50">
                                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                                <Cpu className="w-5 h-5 text-orange-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-slate-400">Workers Standing By</h4>
                                                <p className="text-[10px] text-slate-600">Llama & Gemini ready to generate components</p>
                                            </div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                        </div>
                                    </div>

                                    <div className="mt-12 flex flex-col items-center gap-2">
                                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-600/10 rounded-full border border-blue-500/20">
                                            <Sparkles className="w-3 h-3 text-blue-400" />
                                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Team Generation Active</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-medium italic">Multi-Model Collaboration in progress</p>
                                    </div>
                                </div>
                            ) : app ? (
                                <>
                                    {/* Sidebar: File Explorer */}
                                    <div className="w-64 bg-slate-950 border-r border-slate-800 overflow-y-auto shrink-0 flex flex-col">
                                        <div className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900">Project Files</div>
                                        <div className="flex-1 p-2 space-y-1">
                                            {app.files.map(file => (
                                                <button
                                                    key={file.path}
                                                    onClick={() => { setSelectedFilePath(file.path); setViewMode("code"); }}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-xs group",
                                                        selectedFilePath === file.path
                                                            ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                                                            : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                                                    )}
                                                >
                                                    {file.path.endsWith(".html") ? <FileCode className="w-4 h-4 text-orange-400" /> :
                                                        file.path.endsWith(".css") ? <FileType className="w-4 h-4 text-blue-400" /> :
                                                            <FileJson className="w-4 h-4 text-yellow-500" />}
                                                    <span className="truncate flex-1 text-left whitespace-nowrap overflow-hidden">{file.path}</span>
                                                    {selectedFilePath === file.path && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="p-4 bg-blue-600/5 mt-auto border-t border-slate-800">
                                            <p className="text-[10px] text-blue-400 mb-2 font-bold uppercase">Analysis</p>
                                            <p className="text-[10px] text-slate-500 leading-relaxed max-h-32 overflow-y-auto no-scrollbar">{app.explanation}</p>
                                        </div>
                                    </div>

                                    {/* Main Area */}
                                    <div className="flex-1 flex flex-col relative bg-[#1e1e1e]">
                                        <AnimatePresence mode="wait">
                                            {viewMode === "preview" ? (
                                                <motion.div
                                                    key="preview"
                                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                    className="w-full h-full bg-white relative"
                                                >
                                                    {previewUrl ? (
                                                        <iframe
                                                            src={previewUrl}
                                                            className="w-full h-full border-none"
                                                            title="Production Preview"
                                                            sandbox="allow-scripts allow-modals allow-forms"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-slate-400">Loading Preview...</div>
                                                    )}
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="code"
                                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                    className="w-full h-full flex flex-col"
                                                >
                                                    <div className="h-10 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-4 shrink-0">
                                                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                                                            <ChevronRight className="w-3 h-3" />
                                                            {selectedFilePath}
                                                        </div>
                                                        <button onClick={handleCopy} className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300">
                                                            <Copy className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                    <div className="flex-1 overflow-auto p-6 font-mono text-xs leading-relaxed custom-scrollbar">
                                                        <pre className="text-slate-300 whitespace-pre-wrap">
                                                            <code>{selectedFile?.content}</code>
                                                        </pre>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-slate-600">
                                    <div className="text-center">
                                        <Play className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p>Architect an idea to generate its source code.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
