"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, Sparkles } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { WeatherBackground } from "@/components/layout/WeatherBackground";

export default function LoginPage() {
    const [isSigningIn, setIsSigningIn] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        if (!auth) {
            alert("Auth not initialized. Check console.");
            return;
        }

        setIsSigningIn(true);
        try {
            await signInWithPopup(auth, provider);
            router.push("/"); // AuthProvider will also handle this, but explicit push is good UX
        } catch (error) {
            console.error("Login failed", error);
            setIsSigningIn(false);
        }
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

                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
                    <p className="text-slate-600 mb-8">Sign in to access your Idea Generator and saved blueprints.</p>

                    <button
                        onClick={handleLogin}
                        disabled={isSigningIn}
                        className="w-full py-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md active:scale-95"
                    >
                        {isSigningIn ? (
                            <span className="animate-pulse">Signing in...</span>
                        ) : (
                            <>
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                                <span>Continue with Google</span>
                            </>
                        )}
                    </button>

                    <p className="mt-8 text-xs text-slate-400">
                        Secure authentication powered by Firebase
                    </p>
                </div>
            </motion.div>
        </main>
    );
}
