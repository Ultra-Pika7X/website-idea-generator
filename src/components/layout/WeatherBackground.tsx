"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type WeatherMode = "clouds" | "rain" | "water" | "beach" | "custom";

interface WeatherBackgroundProps {
    mode: WeatherMode;
    customImage?: string | null;
}

export const WeatherBackground: React.FC<WeatherBackgroundProps> = ({
    mode,
    customImage,
}) => {
    return (
        <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden transition-all duration-1000">
            <AnimatePresence mode="wait">
                {mode === "clouds" && <CloudyBackground key="clouds" />}
                {mode === "rain" && <RainBackground key="rain" />}
                {mode === "water" && <WaterBackground key="water" />}
                {mode === "beach" && <BeachBackground key="beach" />}
                {mode === "custom" && customImage && (
                    <motion.div
                        key="custom"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${customImage})` }}
                    />
                )}
            </AnimatePresence>

            {/* Overlay Gradient for consistency */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
        </div>
    );
};

// --- Sub-Components for Effects ---

const CloudyBackground = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-blue-100 via-blue-200 to-cyan-100"
        >
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-white/40 blur-3xl"
                    initial={{
                        x: Math.random() * 100 - 50 + "%",
                        y: Math.random() * 100 - 50 + "%",
                        scale: 0.5 + Math.random(),
                    }}
                    animate={{
                        x: [
                            `${Math.random() * 100}%`,
                            `${Math.random() * 100}%`,
                            `${Math.random() * 100}%`,
                        ],
                        y: [
                            `${Math.random() * 100}%`,
                            `${Math.random() * 100}%`,
                            `${Math.random() * 100}%`,
                        ],
                    }}
                    transition={{
                        duration: 20 + Math.random() * 20,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut",
                    }}
                    style={{
                        width: `${300 + Math.random() * 300}px`,
                        height: `${300 + Math.random() * 300}px`,
                    }}
                />
            ))}
        </motion.div>
    );
};

const RainBackground = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900"
        >
            {[...Array(50)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-blue-400/30 w-[1px] h-10"
                    initial={{
                        x: `${Math.random() * 100}vw`,
                        y: -20,
                    }}
                    animate={{
                        y: "110vh",
                    }}
                    transition={{
                        duration: 0.5 + Math.random(),
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 2,
                    }}
                />
            ))}
        </motion.div>
    );
};

const WaterBackground = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600"
        >
            {/* Simple wave simulation */}
            <motion.div
                className="absolute bottom-0 w-[200%] h-1/2 bg-white/10 blur-xl rounded-[50%]"
                animate={{ x: ["-50%", "0%"] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
            />
            <motion.div
                className="absolute -bottom-20 w-[200%] h-1/2 bg-white/20 blur-2xl rounded-[50%]"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
            />
        </motion.div>
    )
}

const BeachBackground = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-100 to-orange-200"
        >
            <div className="absolute bottom-0 w-full h-1/3 bg-[#f5e1a4]" /> {/* Sand */}
            <motion.div
                className="absolute bottom-1/3 w-full h-20 bg-blue-400/50 blur-xl"
                animate={{ scaleY: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
            />
            <div className="absolute top-10 right-10 w-24 h-24 bg-yellow-300 rounded-full blur-xl opacity-80" /> {/* Sun */}
        </motion.div>
    )
}
