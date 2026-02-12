import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { MacroIcon } from "@/components/MacroIcon";

interface MacrosGridProps {
    totals: { p: number, f: number, c: number };
    targets: { protein: number, fat: number, carbs: number };
}

export function MacrosGrid({ totals, targets }: MacrosGridProps) {
    return (
        <div className="grid grid-cols-3 gap-3">
            <MacroCard
                label="Białko"
                value={totals.p}
                target={targets.protein}
                color="protein"
                icon={<MacroIcon type="protein" size={14} colored />}
                index={1}
            />
            <MacroCard
                label="Tłuszcze"
                value={totals.f}
                target={targets.fat}
                color="fat"
                icon={<MacroIcon type="fat" size={14} colored />}
                index={2}
            />
            <MacroCard
                label="Węgle"
                value={totals.c}
                target={targets.carbs}
                color="carbs"
                icon={<MacroIcon type="carbs" size={14} colored />}
                index={3}
            />
        </div>
    );
}

interface MacroCardProps {
    label: string;
    value: number;
    target: number;
    color: string;
    icon: React.ReactNode;
    index: number;
}

function MacroCard({ label, value, target, color, icon, index }: MacroCardProps) {
    const isExceeded = value > target;
    const pct = Math.min((value / target) * 100, 100);

    const colorClass = isExceeded ? "bg-error" : {
        protein: "bg-protein",
        fat: "bg-fat",
        carbs: "bg-carbs",
    }[color as "protein" | "fat" | "carbs"];

    const textClass = isExceeded ? "text-error" : {
        protein: "text-protein",
        fat: "text-fat",
        carbs: "text-carbs",
    }[color as "protein" | "fat" | "carbs"];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className={cn(
                "glass p-3.5 rounded-2xl flex flex-col gap-2 relative overflow-hidden",
                isExceeded && "border-error/30 bg-error/5"
            )}
        >
            <div className={cn("flex items-center justify-between gap-1.5 text-[10px] font-bold uppercase tracking-wider", textClass)}>
                <div className="flex items-center gap-1.5">
                    {icon}
                    {label}
                </div>
                {isExceeded && <AlertCircle size={10} />}
            </div>
            <div className="flex flex-col">
                <span className={cn("text-lg font-black leading-none", isExceeded && "text-error")}>
                    {Math.round(value)}
                    <span className="text-[10px] font-bold text-muted-foreground ml-0.5">/ {target}g</span>
                </span>
            </div>
            <div className="h-1.5 bg-muted/10 dark:bg-white/5 rounded-full overflow-hidden mt-1">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    className={cn("h-full rounded-full", colorClass)}
                />
            </div>
        </motion.div>
    );
}
