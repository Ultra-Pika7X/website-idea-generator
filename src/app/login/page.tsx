"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, Sparkles, Mail, Loader2 } from "lucide-react";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { WeatherBackground } from "@/components/layout/WeatherBackground";

type AuthMode = 'login' | 'signup';

export default function LoginPage() {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleGoogleLogin = async () => {
        if (!auth) {
            setError("Auth not initialized. Check console.");
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            router.push("/");
        } catch (err: any) {
            console.error("Login failed", err);
            setError(err.message || "Google login failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth) {
            setError("Auth not initialized. Check console.");
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            if (mode === 'login') {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            router.push("/");
        } catch (err: any) {
            console.error("Auth failed", err);
            // Friendly error messages
            if (err.code === 'auth/user-not-found') {
                setError('No account found with this email');
            } else if (err.code === 'auth/wrong-password') {
                setError('Incorrect password');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Email already registered. Try logging in.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password must be at least 6 characters');
            } else if (err.code === 'auth/invalid-email') {
                setError('Invalid email address');
            } else if (err.code === 'auth/invalid-credential') {
                setError('Invalid email or password');
            } else {
                setError(err.message || 'Authentication failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === 'login' ? 'signup' : 'login');
        setError('');
    };

    return (
        <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden font-sans text-slate-900">
            <WeatherBackground mode="clouds" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-md p-6"
            >
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl p-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3 hover:rotate-6 transition-transform">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-slate-600 mb-6">
                        {mode === 'login'
                            ? 'Sign in to access your Idea Generator'
                            : 'Sign up to save your ideas'}
                    </p>

                    {/* Email/Password Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4 mb-4 text-left">
                        <div>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                required
                                minLength={6}
                            />
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm text-center">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 shadow-lg"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Mail className="w-5 h-5" />
                                    {mode === 'login' ? 'Sign In' : 'Sign Up'}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-xs text-slate-400">or</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Google Login */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50"
                    >
                        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                        <span>Continue with Google</span>
                    </button>

                    {/* Toggle Mode */}
                    <p className="mt-6 text-sm text-slate-600">
                        {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={toggleMode}
                            className="text-blue-600 hover:underline font-medium"
                        >
                            {mode === 'login' ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>

                    <p className="mt-4 text-xs text-slate-400">
                        Secure authentication powered by Firebase
                    </p>
                </div>
            </motion.div>
        </main>
    );
}
