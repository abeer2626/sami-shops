"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui";

interface NewsletterSectionProps {
    title?: string;
    description?: string;
    buttonText?: string;
}

export function NewsletterSection({
    title = "Stay Updated",
    description = "Subscribe to our newsletter for exclusive deals and new arrivals",
    buttonText = "Subscribe",
}: NewsletterSectionProps) {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setStatus("error");
            setMessage("Please enter your email address");
            return;
        }

        setStatus("loading");

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await fetch(`${apiUrl}/api/v1/newsletter/subscribe`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) throw new Error("Failed to subscribe");

            setStatus("success");
            setMessage("Thank you for subscribing!");
            setEmail("");
        } catch (error) {
            setStatus("error");
            setMessage("Something went wrong. Please try again.");
        }
    };

    return (
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/20 rounded-2xl mb-6">
                        <Mail className="text-accent" size={32} />
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight italic mb-2">
                        {title}
                    </h2>
                    <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
                        {description}
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                    >
                        <div className="flex-1 relative">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={status === "loading" || status === "success"}
                                required
                                className={`
                                    w-full px-6 py-4 rounded-xl
                                    bg-white/10 border border-white/20
                                    text-white placeholder-gray-500
                                    focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20
                                    transition-all
                                    ${status === "success" ? "border-green-500" : status === "error" ? "border-error" : ""}
                                `}
                                aria-label="Email address"
                            />
                            {status === "success" && (
                                <CheckCircle
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500"
                                    size={20}
                                />
                            )}
                        </div>

                        <Button
                            type="submit"
                            variant="accent"
                            size="lg"
                            disabled={status === "loading" || status === "success"}
                            loading={status === "loading"}
                            className="!rounded-xl whitespace-nowrap"
                        >
                            {status === "success" ? (
                                <>Subscribed!</>
                            ) : (
                                <>
                                    <Send size={16} />
                                    {buttonText}
                                </>
                            )}
                        </Button>
                    </form>

                    {message && (
                        <p
                            className={`
                                mt-4 text-sm font-medium
                                ${status === "success" ? "text-green-400" : "text-error"}
                            `}
                        >
                            {message}
                        </p>
                    )}

                    <p className="text-gray-500 text-xs mt-4">
                        By subscribing, you agree to our Privacy Policy and consent to receive updates.
                    </p>
                </div>
            </div>
        </section>
    );
}
