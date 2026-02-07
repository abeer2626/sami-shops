"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const hydrate = useAuthStore((state) => state.hydrateFromLocalStorage);

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    return <>{children}</>;
}
