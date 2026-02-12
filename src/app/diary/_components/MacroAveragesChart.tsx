import { motion } from "framer-motion";
import { TrendingUp, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { MacroIcon } from "@/components/MacroIcon";

interface MacroAveragesChartProps {
    avgs: {
        cals: number;
        p: number;
        f: number;
        c: number;
    };
    targets: {
        calories: number;
        protein: number;
        fat: number;
        carbs: number;
    };
}

export function MacroAveragesChart({ avgs, targets }: MacroAveragesChartProps) {
    return (
        <div className="glass p-6 rounded-[32px] flex flex-col gap-5">
            <div className="flex items-center gap-2 text-muted-foreground text-[11px] font-bold uppercase tracking-wider">
                <TrendingUp size={14} className="text-primary" />
                Średnie Makroskładniki
            </div>
            
            <div className="flex flex-col gap-4">
                <MacroRow label="Kalorie" val={avgs.cals} tgt={targets.calories} color="calories" unit="kcal" />
                <MacroRow label="Białko" val={avgs.p} tgt={targets.protein} color="protein" unit="g" />
                <MacroRow label="Tłuszcze" val={avgs.f} tgt={targets.fat} color="fat" unit="g" />
                <MacroRow label="Węglowodany" val={avgs.c} tgt={targets.carbs} color="carbs" unit="g" />
            </div>
        </div>
    );
}

interface MacroRowProps {
    label: string;
    val: number;
    tgt: number;
    color: string;
    unit: string;
}

function MacroRow({ label, val, tgt, color, unit }: MacroRowProps) {
    const isExceeded = val > tgt;
    // Cap percentage at 100 to prevent overflow
    const pct = val > 0 ? Math.max(Math.min((val / tgt) * 100, 100), 2) : 0;

    const colors = isExceeded ? "bg-error text-error" : {
        protein: "bg-protein text-protein",
        fat: "bg-fat text-fat",
        carbs: "bg-carbs text-carbs",
        calories: "bg-primary text-primary" // Use primary for calories
    }[color as 'protein' | 'fat' | 'carbs' | 'calories'];

    const bgColor = colors?.split(' ')[0];
    const textColor = colors?.split(' ')[1];
    
    // MacroIcon mapping
    const macroType = color === 'calories' ? 'calories' : 
                      color === 'protein' ? 'protein' : 
                      color === 'fat' ? 'fat' : 'carbs';

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
                <span className={cn("text-xs font-bold flex items-center gap-1.5", textColor)}>
                     <MacroIcon type={macroType as any} size={12} colored={false} className="opacity-80" />
                     {label}
                </span>
                <span className="text-xs font-bold text-muted-foreground">
                    <span className={cn("text-sm font-black", textColor)}>{val}</span> / {tgt}{unit}
                </span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden w-full relative">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn("h-full rounded-full absolute top-0 left-0 bottom-0", bgColor)}
                />
            </div>
        </div>
    );
}
