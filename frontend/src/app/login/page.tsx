"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { setAuth } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // First, get the token
            const formData = new FormData();
            formData.append("username", email);
            formData.append("password", password);

            const loginResponse = await fetch("http://localhost:8000/login", {
                method: "POST",
                body: formData,
            });

            if (!loginResponse.ok) {
                const errorData = await loginResponse.json();
                throw new Error(errorData.detail || "Login failed");
            }

            const { access_token } = await loginResponse.json();

            // Then, get user info
            const meResponse = await fetch("http://localhost:8000/me", {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });

            if (!meResponse.ok) {
                throw new Error("Failed to fetch user profile");
            }

            const userData = await meResponse.json();

            setAuth(userData, access_token);
            router.push("/");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-grow flex items-center justify-center p-4 bg-gray-50 py-12">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-primary p-6 text-center">
                        <h1 className="text-2xl font-black text-white tracking-tight uppercase">
                            Welcome Back
                        </h1>
                        <p className="text-blue-100 text-xs mt-2 uppercase tracking-widest font-bold">
                            Login to your account
                        </p>
                    </div>

                    <div className="p-8">
                        {error && (
                            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 flex gap-3 items-center animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                                <p className="text-xs text-red-700 font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-sm text-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all bg-gray-50 focus:bg-white"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Password</label>
                                    <Link href="#" className="text-[10px] font-bold text-primary hover:underline uppercase">Forgot?</Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-sm text-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all bg-gray-50 focus:bg-white"
                                        placeholder="Enter your password"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-accent text-white font-bold py-4 rounded-sm shadow-lg hover:opacity-90 disabled:opacity-50 transition-all uppercase text-sm flex items-center justify-center gap-2 group"
                            >
                                {loading ? "Logging in..." : (
                                    <>
                                        Sign In
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <p className="text-xs text-gray-500">
                                Don&apos;t have an account?{" "}
                                <Link href="/signup" className="text-primary font-bold hover:underline">
                                    CREATE ACCOUNT
                                </Link>
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 flex items-center justify-center gap-2 border-t border-gray-100">
                        <ShieldCheck size={16} className="text-green-600" />
                        <span className="text-[10px] text-gray-500 uppercase font-medium tracking-tighter">Your data is secured with industry-grade encryption</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
