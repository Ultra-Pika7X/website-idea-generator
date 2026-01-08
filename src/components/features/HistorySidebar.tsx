import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Idea } from '@/lib/ideaEngine';
import { IdeaCard } from './IdeaCard';
import { Clock, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HistorySidebarProps {
    ideas: Idea[];
    isOpen: boolean;
    onClose: () => void;
    onSelectIdea: (idea: Idea) => void;
    onLike: (id: string) => void;
    onCheck: (id: string) => void;
    onDelete: (id: string) => void;
    onViewHistory: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
    ideas, isOpen, onClose, onSelectIdea, onLike, onCheck, onDelete, onViewHistory
}) => {
    const [filter, setFilter] = React.useState<'all' | 'liked' | 'todo'>('all');

    const filteredIdeas = ideas.filter(idea => {
        if (filter === 'liked') return idea.liked;
        if (filter === 'todo') return idea.checked;
        return true;
    }).sort((a, b) => b.createdAt - a.createdAt);

    return (
        <>
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/10 backdrop-blur-sm z-30 lg:hidden"
                    />
                )}
            </AnimatePresence>

            <motion.div
                className={cn(
                    "fixed top-0 left-0 h-full w-80 bg-white/60 backdrop-blur-xl border-r border-white/40 shadow-xl z-40 transform transition-transform duration-300 ease-in-out p-4 flex flex-col",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 pl-1 cursor-pointer hover:text-blue-600 transition-colors" onClick={onViewHistory}>
                        <Clock className="w-5 h-5 text-blue-600" /> History
                    </h2>
                    <div className="flex gap-2">
                        {/* Filter Toggles */}
                        <div className="flex bg-slate-100/50 rounded-lg p-1">
                            <button
                                onClick={() => setFilter('all')}
                                className={cn("px-2 py-1 rounded text-xs font-medium transition-colors", filter === 'all' ? "bg-white shadow text-blue-600" : "text-slate-500 hover:text-slate-700")}
                            >All</button>
                            <button
                                onClick={() => setFilter('liked')}
                                className={cn("px-2 py-1 rounded text-xs font-medium transition-colors", filter === 'liked' ? "bg-white shadow text-pink-500" : "text-slate-500 hover:text-slate-700")}
                            >Liked</button>
                            <button
                                onClick={() => setFilter('todo')}
                                className={cn("px-2 py-1 rounded text-xs font-medium transition-colors", filter === 'todo' ? "bg-white shadow text-green-600" : "text-slate-500 hover:text-slate-700")}
                            >Saved</button>
                        </div>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                    {filteredIdeas.length === 0 ? (
                        <div className="text-center text-slate-500 mt-10">
                            <p className="text-sm">No ideas found.</p>
                            <p className="text-xs">Start generating!</p>
                        </div>
                    ) : (
                        filteredIdeas.map(idea => (
                            <IdeaCard
                                key={idea.id}
                                idea={idea}
                                compact
                                onLike={onLike}
                                onCheck={onCheck}
                                onDelete={onDelete}
                                onClick={onSelectIdea}
                            />
                        ))
                    )}
                </div>
            </motion.div>
        </>
    );
};
