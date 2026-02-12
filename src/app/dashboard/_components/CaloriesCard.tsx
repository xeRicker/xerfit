import { motion } from "framer-motion";
import { Flame, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CaloriesCardProps {
    current: number;
    target: number;
    currentDateKey: string; // Used to reset animation on date change
}

export function CaloriesCard({ current, target, currentDateKey }: CaloriesCardProps) {
    const left = target - current;
    const progress = (current / target) * 100;

    return (
        <motion.div
            key={currentDateKey}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-6 rounded-[32px] relative overflow-hidden group shadow-lg shadow-primary/5"
        >
            <div className="flex justify-between items-center relative z-10">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-[11px] font-bold uppercase tracking-wider">
                        <Flame size={14} className="text-primary" />
                        Podsumowanie kalorii
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-primary tracking-tighter">
                            {Math.round(current)}
                        </span>
                        <span className="text-muted-foreground font-bold text-lg">
                            / {target}
                        </span>
                    </div>
                    <div className={cn(
                        "flex items-center gap-1.5 text-sm font-semibold mt-1",
                        left < 0 ? "text-error" : "text-muted-foreground/80"
                    )}>
                        {left < 0 && <AlertCircle size={14} />}
                        {left >= 0 ? `Pozostało ${Math.round(left)} kcal` : `Przekroczenie o ${Math.abs(Math.round(left))} kcal`}
                    </div>
                </div>

                {/* Progress Ring */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                        <circle
                            cx="48"
                            cy="48"
                            r="40"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-muted/10 dark:text-white/5"
                        />
                        <motion.circle
                            cx="48"
                            cy="48"
                            r="40"
                            fill="none"
                            stroke="url(#orange-gradient)"
                            strokeWidth="8"
                            strokeDasharray="251.2"
                            initial={{ strokeDashoffset: 251.2 }}
                            animate={{ strokeDashoffset: 251.2 - (251.2 * Math.min(progress, 100)) / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            strokeLinecap="round"
                        />
                        {progress > 100 && (
                            <motion.circle
                                cx="48"
                                cy="48"
                                r="40"
                                fill="none"
                                stroke="#FF453A"
                                strokeWidth="8"
                                strokeDasharray="251.2"
                                initial={{ strokeDashoffset: 251.2 }}
                                animate={{ strokeDashoffset: 251.2 - (251.2 * Math.min(progress - 100, 100)) / 100 }}
                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                                strokeLinecap="round"
                            />
                        )}
                        <defs>
                            <linearGradient id="orange-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#FF4D00" />
                                <stop offset="100%" stopColor="#FF9500" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span className="absolute text-lg font-black">{Math.round(progress)}%</span>
                </div>
            </div>
        </motion.div>
    );
}
