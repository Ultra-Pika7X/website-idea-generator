"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, CloudRain, Cloud, Waves, Sun, Image as ImageIcon, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { WeatherBackground, WeatherMode } from "@/components/layout/WeatherBackground";
import { IdeaGenerator } from "@/components/features/IdeaGenerator";
import { IdeaCard } from "@/components/features/IdeaCard";
import { HistorySidebar } from "@/components/features/HistorySidebar";
import { StepsModal } from "@/components/features/StepsModal";
import { NicheSelector } from "@/components/features/NicheSelector";
import { AuthModal } from "@/components/auth/AuthModal";
import { generateIdea, generateIdeaBatch, Idea } from "@/lib/ideaEngine";
import * as db from "@/lib/storage";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";

type ViewState = "START" | "SELECTION" | "DASHBOARD";

export default function Home() {
  const [view, setView] = useState<ViewState>("START");
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);

  // Data State
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [batchIdeas, setBatchIdeas] = useState<Idea[]>([]);
  const [selectedBatchIds, setSelectedBatchIds] = useState<Set<string>>(new Set());

  const [generatedCandidates, setGeneratedCandidates] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [weatherMode, setWeatherMode] = useState<WeatherMode>("clouds");
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load ideas on mount
  useEffect(() => {
    // If user has saved ideas, go straight to dashboard
    db.getAllIdeas().then(saved => {
      setIdeas(saved);
      if (saved.length > 0) {
        setView("DASHBOARD");
      } else {
        setView("START");
        setIsSidebarOpen(false);
      }
    });

    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  }, []);

  // --- Handlers ---

  const handleSelectNiche = (niche: string) => {
    setSelectedNiche(niche);
    setIsGenerating(true);

    // Simulate "Researching" delay for effect
    setTimeout(() => {
      const newBatch = generateIdeaBatch(25, niche as any);
      setBatchIdeas(newBatch);
      setView("SELECTION");
      setIsGenerating(false);
    }, 800);
  };

  const handleBatchCardClick = (idea: Idea) => {
    const newSet = new Set(selectedBatchIds);
    if (newSet.has(idea.id)) {
      newSet.delete(idea.id);
    } else {
      newSet.add(idea.id);
    }
    setSelectedBatchIds(newSet);
  };

  const handleLoadMore = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const currentCount = batchIdeas.length;
      const newBatch = generateIdeaBatch(10, selectedNiche as any);
      setBatchIdeas(prev => [...prev, ...newBatch]);
      setIsGenerating(false);
      // Scroll to bottom
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 500);
  };

  const handleContinueSelection = async () => {
    if (selectedBatchIds.size < 5) return;

    // Check Auth - if Firebase not configured, skip auth
    if (auth && !auth.currentUser) {
      setIsAuthModalOpen(true);
      return;
    } else if (!auth) {
      // Fallback for no-firebase capability
      console.warn("Firebase not verified, proceeding entirely locally.");
      await finalizeSelection();
      return;
    }

    // Determine selected ideas
    await finalizeSelection();
  };

  const finalizeSelection = async () => {
    const selected = batchIdeas.filter(i => selectedBatchIds.has(i.id));

    // Save all
    for (const idea of selected) {
      await db.saveIdea(idea);
    }

    const allIdeas = await db.getAllIdeas();
    setIdeas(allIdeas);
    setView("DASHBOARD");
    setIsSidebarOpen(true);
    setSelectedBatchIds(new Set());
    setBatchIdeas([]);
  };

  const handleLoginSuccess = async () => {
    setIsAuthModalOpen(false);

    // Fetch ideas from cloud (now that we are logged in)
    const cloudIdeas = await db.getAllIdeas();

    if (cloudIdeas.length > 0) {
      // User has history, go to dashboard
      setIdeas(cloudIdeas);
      setView("DASHBOARD");
      setIsSidebarOpen(true);
      // If we had a batch pending (selected via flow), maybe save them too?
      // For strict "returning user" flow, usually we just show their dashboard. 
      // But if they just picked 5, we should probably save them.
      if (selectedBatchIds.size > 0) {
        await finalizeSelection();
      }
    } else {
      // New user (or no data), proceed with selection if we have one
      if (selectedBatchIds.size > 0) {
        await finalizeSelection();
      } else {
        // Logged in from Start Screen with no history? stay on start (or maybe dashboard is empty)
        // Let's stay on start to force selection
        setView("START");
      }
    }
  };

  // --- Dashboard Handlers ---

  const handleGenerateValues = async () => {
    setIsGenerating(true);
    const idea = generateIdea(selectedNiche as any); // Use niche if available

    // Add new idea to top of candidates
    setGeneratedCandidates(prev => [idea, ...prev]);
    setIsGenerating(false);
  };

  const handleSaveGenerated = async (idea: Idea) => {
    await db.saveIdea(idea);
    setIdeas(prev => [idea, ...prev]);
    // Remove from candidates
    setGeneratedCandidates(prev => prev.filter(i => i.id !== idea.id));
  };

  const handleDismissGenerated = (id: string) => {
    setGeneratedCandidates(prev => prev.filter(i => i.id !== id));
  }

  const handleLike = async (id: string) => {
    const idea = ideas.find(i => i.id === id);
    if (idea) {
      const updated = { ...idea, liked: !idea.liked };
      await db.updateIdea(updated);
      setIdeas(prev => prev.map(i => i.id === id ? updated : i));
    }
  };

  const handleCheck = async (id: string) => {
    const idea = ideas.find(i => i.id === id);
    if (idea) {
      const updated = { ...idea, checked: !idea.checked };
      await db.updateIdea(updated);
      setIdeas(prev => prev.map(i => i.id === id ? updated : i));
    }
  };

  const handleDelete = async (id: string) => {
    await db.deleteIdea(id);
    setIdeas(prev => prev.filter(i => i.id !== id));
  };

  const handleToggleStep = async (ideaId: string, stepId: string) => {
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;
    const updatedSteps = idea.steps.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s);
    const updatedIdea = { ...idea, steps: updatedSteps };
    await db.updateIdea(updatedIdea);
    setIdeas(prev => prev.map(i => i.id === ideaId ? updatedIdea : i));
    if (selectedIdea?.id === ideaId) setSelectedIdea(updatedIdea);
  };

  // --- Render Helpers ---

  const handleCustomBackground = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target?.result as string);
        setWeatherMode("custom");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden flex flex-col text-slate-900 transition-colors">
      <WeatherBackground mode={weatherMode} customImage={customImage} />

      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

      {/* Top Bar (Weather Controls) */}
      <div className="absolute top-0 right-0 p-4 z-50 flex gap-2">
        <div className="bg-white/40 backdrop-blur-md rounded-full p-1 flex gap-1 border border-white/30 shadow-sm">
          <button onClick={() => setWeatherMode("clouds")} className={cn("p-2 rounded-full transition-all", weatherMode === "clouds" ? "bg-white shadow text-blue-500" : "hover:bg-white/30 text-slate-600")}><Cloud className="w-5 h-5" /></button>
          <button onClick={() => setWeatherMode("rain")} className={cn("p-2 rounded-full transition-all", weatherMode === "rain" ? "bg-white shadow text-slate-700" : "hover:bg-white/30 text-slate-600")}><CloudRain className="w-5 h-5" /></button>
          <button onClick={() => setWeatherMode("water")} className={cn("p-2 rounded-full transition-all", weatherMode === "water" ? "bg-white shadow text-blue-700" : "hover:bg-white/30 text-slate-600")}><Waves className="w-5 h-5" /></button>
          <button onClick={() => setWeatherMode("beach")} className={cn("p-2 rounded-full transition-all", weatherMode === "beach" ? "bg-white shadow text-orange-500" : "hover:bg-white/30 text-slate-600")}><Sun className="w-5 h-5" /></button>
          <button onClick={handleCustomBackground} className={cn("p-2 rounded-full transition-all", weatherMode === "custom" ? "bg-white shadow text-purple-500" : "hover:bg-white/30 text-slate-600")}><ImageIcon className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Sidebar Toggle (Only in Dashboard) */}
      {view === "DASHBOARD" && (
        <div className={cn("absolute top-4 left-4 z-50 transition-all duration-300", isSidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100")}>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-white/40 backdrop-blur-md rounded-xl border border-white/30 shadow-sm hover:bg-white/60 transition-colors">
            <Menu className="w-6 h-6 text-slate-800" />
          </button>
        </div>
      )}

      {/* Sidebar (Only in Dashboard) */}
      {view === "DASHBOARD" && (
        <HistorySidebar
          ideas={ideas}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSelectIdea={(idea) => { setSelectedIdea(idea); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
          onLike={handleLike}
          onCheck={handleCheck}
          onDelete={handleDelete}
        />
      )}

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col items-center p-4 transition-all duration-300 overflow-y-auto no-scrollbar relative",
        view === "DASHBOARD" && isSidebarOpen ? "lg:ml-80" : ""
      )}>

        {/* Header */}
        <div className="text-center space-y-2 mt-10 mb-8 shrink-0">
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 drop-shadow-sm p-4">
            {view === "START" ? "Dream It." : view === "SELECTION" ? "Pick Your Top 5" : "Your Vision Board"}
          </h1>
          <p className="text-lg text-slate-600 font-medium max-w-lg mx-auto leading-relaxed">
            {view === "START" ? "Select a niche to generate tailored ideas."
              : view === "SELECTION" ? `Select at least 5 ideas to build your dashboard. (${selectedBatchIds.size}/5)`
                : "Manage your projects and generate new ones."}
          </p>
        </div>

        {/* VIEW: START */}
        <AnimatePresence mode="wait">
          {view === "START" && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center justify-center gap-8"
            >
              {isGenerating ? (
                <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
              ) : (
                <>
                  <NicheSelector onSelectNiche={handleSelectNiche} />
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="text-slate-500 hover:text-blue-600 font-medium text-sm transition-colors"
                  >
                    Already have an account? Log In
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* VIEW: SELECTION */}
        <AnimatePresence mode="wait">
          {view === "SELECTION" && (
            <motion.div
              key="selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center pb-32"
            >
              <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 max-w-7xl">
                {batchIdeas.map((idea, index) => (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <IdeaCard
                      idea={idea}
                      onLike={() => { }}
                      onCheck={() => { }}
                      onDelete={() => { }}
                      onClick={() => handleBatchCardClick(idea)}
                      compact={true}
                      selected={selectedBatchIds.has(idea.id)}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Floating Bottom Bar */}
              <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 flex gap-4 bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/50">
                <button
                  onClick={handleLoadMore}
                  disabled={isGenerating}
                  className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-white/50 transition-colors flex items-center gap-2"
                >
                  {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : "Load 10 More"}
                </button>
                <button
                  onClick={handleContinueSelection}
                  disabled={selectedBatchIds.size < 5}
                  className={cn(
                    "px-8 py-3 rounded-xl font-bold text-white transition-all flex items-center gap-2",
                    selectedBatchIds.size >= 5 ? "bg-blue-600 hover:bg-blue-700 shadow-lg" : "bg-slate-300 cursor-not-allowed"
                  )}
                >
                  Continue ({selectedBatchIds.size}/5) <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* VIEW: DASHBOARD */}
        <AnimatePresence mode="wait">
          {view === "DASHBOARD" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-4xl flex flex-col items-center gap-8 pb-32"
            >
              <IdeaGenerator onGenerate={handleGenerateValues} isGenerating={isGenerating} />

              <div className="w-full flex flex-col gap-6">
                <AnimatePresence>
                  {generatedCandidates.map((idea) => (
                    <motion.div
                      key={idea.id}
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, height: 0 }}
                      className="w-full"
                    >
                      <IdeaCard
                        idea={idea}
                        onLike={() => { }}
                        onCheck={() => { }}
                        onDelete={() => handleDismissGenerated(idea.id)}
                        onClick={() => handleSaveGenerated(idea)}
                      />
                      <p className="text-center text-slate-500 mt-2 text-sm">Click card to save to history</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <StepsModal
        idea={selectedIdea}
        isOpen={!!selectedIdea}
        onClose={() => setSelectedIdea(null)}
        onToggleStep={handleToggleStep}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={() => db.loginWithGoogle().then(handleLoginSuccess)}
      />

    </main >
  );
}
