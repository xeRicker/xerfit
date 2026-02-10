"use client";

import { Home, Calendar, Utensils, User, Ruler, CloudUpload } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useDiaryStore } from "@/lib/store";

export function TabBar() {
  const pathname = usePathname();
  const { unsavedChanges, sync, isLoading } = useDiaryStore();

  const tabs = [
    { id: "dashboard", href: "/dashboard", icon: Home, label: "Dziś" },
    { id: "meals", href: "/meals", icon: Utensils, label: "Baza" },
    { id: "measurements", href: "/measurements", icon: Ruler, label: "Pomiary" }, // Added Measurements
    { id: "diary", href: "/diary", icon: Calendar, label: "Dziennik" },
    { id: "profile", href: "/profile", icon: User, label: "Profil" },
  ];

  return (
    <>
      {/* Gradient fade at bottom to blend content behind tab bar */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-40" />
      
      <div className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom,20px)] pt-0 px-4">
        <div className="glass-dark backdrop-blur-xl bg-black/40 border-white/10 rounded-[32px] mx-auto max-w-sm mb-4 shadow-2xl shadow-black/50 flex items-center justify-between px-2 py-1 relative">
            
            {tabs.map((tab) => (
                <TabItem key={tab.id} tab={tab} isActive={pathname === tab.href} />
            ))}

            {/* Sync Button Overlay - Appears when there are unsaved changes */}
            <AnimatePresence>
                {unsavedChanges && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => sync()}
                        disabled={isLoading}
                        className="absolute -top-16 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-[#FF6A00] text-white flex items-center justify-center shadow-[0_0_20px_rgba(255,106,0,0.5)] z-50 border-4 border-black/50"
                    >
                         {isLoading ? (
                             <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                         ) : (
                             <>
                                <CloudUpload size={24} strokeWidth={2.5} />
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                                </span>
                             </>
                         )}
                    </motion.button>
                )}
            </AnimatePresence>

        </div>
      </div>
    </>
  );
}

interface Tab {
    id: string;
    href: string;
    icon: React.ElementType;
    label: string;
}

function TabItem({ tab, isActive }: { tab: Tab, isActive: boolean }) {
    const Icon = tab.icon;
    return (
        <Link
            href={tab.href}
            className="flex-1 flex flex-col items-center gap-1 py-3 active:scale-90 transition-transform relative z-10"
        >
            <div className="relative">
            <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.5}
                className={cn(
                "transition-all duration-300",
                isActive ? "text-[#FF6A00] drop-shadow-[0_0_8px_rgba(255,106,0,0.5)]" : "text-zinc-500"
                )}
            />
            {isActive && (
                <motion.div
                layoutId="tab-glow"
                className="absolute inset-0 bg-[#FF6A00]/20 blur-lg rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
            </div>
            <span
            className={cn(
                "text-[9px] font-medium transition-colors duration-300 uppercase tracking-wide mt-0.5",
                isActive ? "text-[#FF6A00]" : "text-zinc-600"
            )}
            >
            {tab.label}
            </span>
        </Link>
    );
}
