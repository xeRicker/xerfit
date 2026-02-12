import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { MacroIcon } from "@/components/MacroIcon";

interface WeeklyChartProps {
    weeklyStats: {
        date: string;
        dayName: string;
        cals: number;
        p: number;
        f: number;
        c: number;
        hasData: boolean;
    }[];
}

export function WeeklyChart({ weeklyStats }: WeeklyChartProps) {
    return (
        <div className="glass p-6 rounded-[32px] flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground text-[11px] font-bold uppercase tracking-wider">
                    <BarChart3 size={14} className="text-primary" />
                    Dystrybucja Makroskładników
                </div>
            </div>

            <div className="flex justify-between items-end h-40 gap-3">
                {weeklyStats.map((stat, i) => {
                    const totalMacros = stat.p + stat.f + stat.c || 1;
                    const pPct = (stat.p / totalMacros) * 100;
                    const fPct = (stat.f / totalMacros) * 100;
                    const cPct = (stat.c / totalMacros) * 100;
                    const isEmpty = !stat.hasData;
                    const isToday = stat.date === format(new Date(), 'yyyy-MM-dd');

                    return (
                        <div key={stat.date} className="flex flex-col items-center gap-2 flex-1 h-full">
                            <div className="w-full relative flex flex-col items-center justify-end h-full rounded-2xl bg-white/5 overflow-hidden">
                                {!isEmpty ? (
                                    <>
                                        <motion.div initial={{ height: 0 }} animate={{ height: `${pPct}%` }} transition={{ delay: i * 0.03 }} className="w-full bg-protein" />
                                        <motion.div initial={{ height: 0 }} animate={{ height: `${fPct}%` }} transition={{ delay: i * 0.03 + 0.1 }} className="w-full bg-fat" />
                                        <motion.div initial={{ height: 0 }} animate={{ height: `${cPct}%` }} transition={{ delay: i * 0.03 + 0.2 }} className="w-full bg-carbs" />
                                    </>
                                ) : (
                                    <div className="w-1 h-1 bg-white/10 rounded-full mb-2" />
                                )}
                            </div>
                            <span className={cn(
                                "text-[9px] font-bold uppercase",
                                isToday ? "text-primary" : "text-muted-foreground"
                            )}>
                                {stat.dayName}
                            </span>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-around pt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5"><MacroIcon type="protein" size={12} colored /> <span className="text-[10px] font-bold text-protein uppercase">Białko</span></div>
                <div className="flex items-center gap-1.5"><MacroIcon type="fat" size={12} colored /> <span className="text-[10px] font-bold text-fat uppercase">Tłuszcze</span></div>
                <div className="flex items-center gap-1.5"><MacroIcon type="carbs" size={12} colored /> <span className="text-[10px] font-bold text-carbs uppercase">Węgle</span></div>
            </div>
        </div>
    );
}
