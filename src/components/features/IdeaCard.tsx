import React from 'react';
import { motion } from 'framer-motion';
import { Heart, CheckCircle, ArrowRight, Trash2 } from 'lucide-react';
import { Idea } from '@/lib/ideaEngine';
import { cn } from '@/lib/utils';

interface IdeaCardProps {
    idea: Idea;
    onLike: (id: string) => void;
    onCheck: (id: string) => void;
    onDelete: (id: string) => void;
    onClick: (idea: Idea) => void;
    compact?: boolean;
    selected?: boolean; // New prop for selection phase
    hideActions?: boolean;
    hideDescription?: boolean;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({
    idea, onLike, onCheck, onDelete, onClick,
    compact = false, selected = false,
    hideActions = false, hideDescription = false
}) => {
    return (
        <motion.div
            layoutId={idea.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "relative bg-white/40 backdrop-blur-md rounded-2xl border transition-all duration-300 cursor-pointer group hover:shadow-lg flex flex-col h-full",
                compact ? "p-3" : "p-6",
                selected ? "border-blue-500 shadow-blue-200/50 bg-blue-50/80 ring-2 ring-blue-500/20" : "border-white/30 shadow-lg hover:bg-white/50"
            )}
            onClick={() => onClick(idea)}
        >
            <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className={cn("font-bold text-slate-800 leading-tight", compact ? "text-xs line-clamp-2" : "text-xl line-clamp-2")}>{idea.title}</h3>
                <div className="flex gap-1 shrink-0">
                    <span className={cn(
                        "px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                        idea.difficulty === 'Easy' ? "bg-green-100 text-green-700" :
                            idea.difficulty === 'Medium' ? "bg-yellow-100 text-yellow-700" :
                                "bg-red-100 text-red-700"
                    )}>
                        {idea.difficulty}
                    </span>
                </div>
            </div>

            {!hideDescription && (
                <p className={cn("text-slate-600 mb-3 leading-relaxed", compact ? "text-[10px] line-clamp-3" : "text-sm mb-4")}>
                    {idea.description}
                </p>
            )}

            {/* Tags - Hidden in super-compact dashboard grid on small screens if needed, but let's keep them small */}
            {!selected && (
                <div className="flex gap-1 mb-3 flex-wrap mt-auto">
                    {idea.tags.slice(0, compact ? 2 : 5).map(tag => (
                        <span key={tag} className={cn("text-slate-500 bg-white/40 px-1.5 py-0.5 rounded", compact ? "text-[9px]" : "text-xs")}>#{tag}</span>
                    ))}
                </div>
            )}

            {/* Actions */}
            {!selected && !hideActions && (
                <div className="flex justify-between items-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1">
                        <button
                            onClick={() => onLike(idea.id)}
                            className={cn("p-1.5 rounded-full hover:bg-white/40 transition-colors", idea.liked ? "text-pink-500" : "text-slate-400")}
                            title="Like"
                        >
                            <Heart className={cn(compact ? "w-4 h-4" : "w-5 h-5", idea.liked && "fill-current")} />
                        </button>
                        <button
                            onClick={() => onCheck(idea.id)}
                            className={cn("p-1.5 rounded-full hover:bg-white/40 transition-colors", idea.checked ? "text-green-600" : "text-slate-400")}
                            title="Save to History"
                        >
                            <CheckCircle className={cn(compact ? "w-4 h-4" : "w-5 h-5")} />
                        </button>
                        <button
                            onClick={() => onDelete(idea.id)}
                            className="p-1.5 rounded-full hover:bg-white/40 transition-colors text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                            title="Dismiss"
                        >
                            <Trash2 className={cn(compact ? "w-4 h-4" : "w-5 h-5")} />
                        </button>
                    </div>

                    {!compact && (
                        <button onClick={() => onClick(idea)} className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                            View Blueprint <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}
        </motion.div>
    );
};
