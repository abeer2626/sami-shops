"use client";

import { useAdminGuard } from "@/lib/guards";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Tags, LogOut, Loader2, Settings, Percent, Package, ShoppingCart, Wallet } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isLoading, user } = useAdminGuard({ redirectTo: "/login" });
    const pathname = usePathname();
    const logout = useAuthStore((state) => state.logout);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    const navItems = [
        { href: "/admin", label: "Overview", icon: LayoutDashboard },
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/categories", label: "Categories", icon: Tags },
        { href: "/admin/products", label: "Products", icon: Package },
        { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
        { href: "/admin/payouts", label: "Payouts", icon: Wallet },
        { href: "/admin/commissions", label: "Commissions", icon: Percent },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white fixed h-full z-10 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-xl font-black uppercase tracking-tight">
                        Admin<span className="text-accent">Panel</span>
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">Administrator: {user?.username}</p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${isActive
                                    ? "bg-accent text-white shadow-lg shadow-accent/30"
                                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                    }`}
                            >
                                <Icon size={18} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mx-4 mb-4 p-4 bg-gray-800/50 rounded-2xl border border-gray-700">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Platform Integrity</p>
                    <p className="text-[10px] text-gray-400 leading-relaxed italic">
                        The Sami’s admin system is designed to maintain platform integrity, manage vendors, and ensure consistent quality.
                    </p>
                </div>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm font-bold"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
