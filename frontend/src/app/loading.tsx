"use client";

export default function Loading() {
    return (
        <div className="min-h-[60vh] w-full flex flex-col items-center justify-center p-20 animate-in fade-in duration-500">
            {/* Tactical Loader */}
            <div className="relative w-20 h-20 mb-8">
                <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-primary/5 rounded-full animate-pulse"></div>
                </div>
            </div>

            <h1 className="text-sm font-black text-gray-800 uppercase italic tracking-[0.2em] mb-2 animate-pulse">
                SamiShops <span className="text-primary italic">Syncing...</span>
            </h1>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em]">Downloading Operational Intel</p>

            {/* Animated Progress Bar */}
            <div className="w-48 h-1 bg-gray-100 rounded-full mt-8 overflow-hidden">
                <div className="h-full bg-primary w-1/3 animate-[loading_2s_infinite]"></div>
            </div>

            <style jsx>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(150%); }
                }
            `}</style>
        </div>
    );
}
