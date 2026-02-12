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
    { id: "dashboard", href: "/dashboard", icon: Home, label: "Posiłki" },
    { id: "meals", href: "/meals", icon: Utensils, label: "Baza" },
    { id: "measurements", href: "/measurements", icon: Ruler, label: "Pomiary" },
    { id: "diary", href: "/diary", icon: Calendar, label: "Dziennik" },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-40" />
      
      <div className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom,20px)] pt-0 px-4">
        <div className="glass-dark backdrop-blur-xl bg-black/40 border-white/10 rounded-[32px] mx-auto max-w-sm mb-4 shadow-2xl shadow-black/50 flex items-center justify-between px-2 py-1 relative">
            
            {tabs.map((tab) => (
                <TabItem key={tab.id} tab={tab} isActive={pathname === tab.href} />
            ))}

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
