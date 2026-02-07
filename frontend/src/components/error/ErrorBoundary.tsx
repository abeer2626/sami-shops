"use client";

import React, { Component, ReactNode } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui";
import Link from "next/link";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Error caught by boundary:", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full text-center">
                        {/* Error Icon */}
                        <div className="mb-6">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                <AlertCircle size={40} className="text-red-500" />
                            </div>
                        </div>

                        {/* Error Message */}
                        <h1 className="text-2xl font-black text-gray-900 mb-2">
                            Something went wrong
                        </h1>
                        <p className="text-gray-600 mb-6">
                            {this.state.error?.message || "An unexpected error occurred"}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Button
                                onClick={this.handleReset}
                                className="bg-primary text-white"
                            >
                                <RefreshCw size={18} className="mr-2" />
                                Try Again
                            </Button>
                            <Link href="/">
                                <Button variant="outline">
                                    <Home size={18} className="mr-2" />
                                    Go to Homepage
                                </Button>
                            </Link>
                        </div>

                        {/* Error Details (Dev Only) */}
                        {process.env.NODE_ENV === "development" && this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                                    Error Details
                                </summary>
                                <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-auto max-h-40">
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
