"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MealEntry } from "@/lib/store";
import { format, addDays, subDays, parseISO, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns";
import { pl } from "date-fns/locale";
import { useState, useMemo } from "react";

interface CalendarModalProps {
    onClose: () => void;
    currentDate: string;
    onSelect: (d: string) => void;
    entries: MealEntry[];
    targets: {
        calories: number;
        protein: number;
        fat: number;
        carbs: number;
    };
    profileId: string;
}

export function CalendarModal({ onClose, currentDate, onSelect, entries, targets, profileId }: CalendarModalProps) {
    const [viewDate, setViewDate] = useState(() => parseISO(currentDate));
    
    const days = useMemo(() => {
        const start = startOfWeek(startOfMonth(viewDate), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(viewDate), { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    }, [viewDate]);

    const weekDays = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

    return (
        <>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
            />
            <motion.div 
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                className="fixed bottom-0 left-0 right-0 z-[90] bg-[#1C1C1E] rounded-t-[32px] p-6 pb-[calc(env(safe-area-inset-bottom,20px)+24px)] shadow-2xl border-t border-white/10"
            >
                <div className="max-w-md mx-auto flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setViewDate(subDays(startOfMonth(viewDate), 1))} className="p-2 glass rounded-xl"><ChevronLeft size={18}/></button>
                            <h2 className="text-xl font-bold uppercase tracking-widest min-w-[140px] text-center">{format(viewDate, 'LLLL yyyy', { locale: pl })}</h2>
                            <button onClick={() => setViewDate(addDays(endOfMonth(viewDate), 1))} className="p-2 glass rounded-xl"><ChevronRight size={18}/></button>
                        </div>
                        <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-muted-foreground"><X size={20}/></button>
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {weekDays.map(d => (
                            <div key={d} className="text-[10px] font-black text-muted-foreground text-center py-2 uppercase">{d}</div>
                        ))}
                        {days.map(day => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            const isSelected = dateStr === currentDate;
                            const isSelectedMonth = isSameMonth(day, viewDate);
                            const dayEntries = entries.filter(e => e.date === dateStr && e.profileId === profileId);
                            const totalCals = dayEntries.reduce((a, b) => a + b.calories, 0);
                            const progress = Math.min((totalCals / targets.calories) * 100, 100);
                            const hasEntries = dayEntries.length > 0;

                            return (
                                <button 
                                    key={dateStr}
                                    onClick={() => onSelect(dateStr)}
                                    className={cn(
                                        "aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all active:scale-90",
                                        isSelected ? "bg-primary text-white shadow-lg shadow-primary/30" : "hover:bg-white/5",
                                        !isSelectedMonth && "opacity-20"
                                    )}
                                >
                                    <span className={cn("text-sm font-bold", isSelected ? "text-white" : "text-white/80")}>
                                        {format(day, 'd')}
                                    </span>
                                    
                                    {/* Rainbow Ring / Progress Ring */}
                                    {hasEntries && !isSelected && (
                                        <svg className="absolute inset-0 w-full h-full -rotate-90 p-1">
                                            <circle
                                                cx="50%" cy="50%" r="42%"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className="text-white/5"
                                            />
                                            <circle
                                                cx="50%" cy="50%" r="42%"
                                                fill="none"
                                                stroke={totalCals > targets.calories + 50 ? "#FF453A" : "#FF6A00"}
                                                strokeWidth="2"
                                                strokeDasharray="100"
                                                strokeDashoffset={100 - progress}
                                                pathLength="100"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    )}

                                    {/* Dot under day */}
                                    {hasEntries && (
                                        <div className={cn(
                                            "w-1 h-1 rounded-full absolute bottom-1.5",
                                            isSelected ? "bg-white" : "bg-primary"
                                        )} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </>
    );
}
