"use client";

import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface FloatingButtonProps {
    href?: string;
    onClick?: () => void;
    icon?: React.ElementType;
    className?: string;
}

export function FloatingButton({ href, onClick, icon: Icon = Plus, className }: FloatingButtonProps) {
    const content = (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
                "fixed bottom-[calc(env(safe-area-inset-bottom,20px)+90px)] right-5 z-[60]",
                "w-14 h-14 rounded-full bg-[#FF6A00] text-white",
                "flex items-center justify-center shadow-[0_0_20px_rgba(255,106,0,0.5)] border-4 border-black/50",
                className
            )}
        >
            <Icon size={24} strokeWidth={2.5} />
        </motion.div>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }

    return <button onClick={onClick}>{content}</button>;
}