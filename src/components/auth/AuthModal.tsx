import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm pointer-events-auto relative overflow-hidden"
                        >
                            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>

                            <div className="text-center mb-8">
                                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                                    <LogIn className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800">Save Your Ideas</h3>
                                <p className="text-slate-500 mt-2">
                                    Sign in to save your 5 selected ideas and access them from anywhere.
                                </p>
                            </div>

                            <button
                                onClick={onLogin}
                                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-xl transition-colors shadow-sm"
                            >
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                                Continue with Google
                            </button>

                            <p className="mt-6 text-xs text-center text-slate-400">
                                No spam, just ideas.
                            </p>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
