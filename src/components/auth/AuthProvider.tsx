"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (loading) return;

        if (!user && pathname !== "/login") {
            router.push("/login"); // Redirect to login if user is not signed in
        } else if (user && pathname === "/login") {
            router.push("/"); // Redirect to home if user is already signed in
        }
    }, [user, loading, pathname, router]);

    if (loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        );
    }

    // Don't render children until we have checked auth (unless it's the login page, which handles its own display, but the redirect logic above handles page switching)
    // Actually, to prevent flashing deeply nested protected content, we might want to return null, 
    // but the useEffect will trigger redirect fast. 
    // For "strict" protection, returning null if !user && pathname !== '/login' is safer.
    if (!user && pathname !== "/login") {
        return null;
    }

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
