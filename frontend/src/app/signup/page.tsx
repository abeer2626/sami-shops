"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, UserPlus, AlertCircle, ShieldCheck } from "lucide-react";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:8000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    name,
                    password,
                    role: "customer"
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Registration failed");
            }

            // Successfully registered, redirect to login
            router.push("/login?registered=true");
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
                            Join SamiShops
                        </h1>
                        <p className="text-blue-100 text-[10px] mt-2 uppercase tracking-widest font-bold">
                            Create your premium account today
                        </p>
                    </div>

                    <div className="p-8">
                        {error && (
                            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 flex gap-3 items-center">
                                <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                                <p className="text-xs text-red-700 font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                        <User size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-sm text-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all bg-gray-50 focus:bg-white"
                                        placeholder="Enter your name"
                                    />
                                </div>
                            </div>

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
                                <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Password</label>
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
                                        placeholder="Min. 8 characters"
                                        minLength={8}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-accent text-white font-bold py-4 rounded-sm shadow-lg hover:opacity-90 disabled:opacity-50 transition-all uppercase text-sm flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? "Creating account..." : (
                                    <>
                                        <UserPlus size={18} />
                                        Create Account
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <p className="text-xs text-gray-500">
                                Already have an account?{" "}
                                <Link href="/login" className="text-primary font-bold hover:underline">
                                    LOG IN
                                </Link>
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 flex items-center justify-center gap-2 border-t border-gray-100">
                        <ShieldCheck size={16} className="text-green-600" />
                        <span className="text-[10px] text-gray-500 uppercase font-medium tracking-tighter">Your privacy is our priority</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
