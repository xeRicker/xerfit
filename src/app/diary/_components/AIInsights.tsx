import { motion } from "framer-motion";
import { TrendingUp, Flame, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { MacroIcon } from "@/components/MacroIcon";

export function AIInsights({ insights }: { insights: any[] }) {
    if (insights.length === 0) return null;

    return (
        <div className="glass p-6 rounded-[32px] flex flex-col gap-4">
            <div className="flex items-center gap-2 text-muted-foreground text-[11px] font-bold uppercase tracking-wider">
                <Info size={14} className="text-primary" />
                ANALIZA AI
            </div>
            
            <div className="flex flex-col gap-3">
                {insights.map((insight, idx) => {
                    const styles = insight.type === 'warning' ? { border: 'border-warning/20', bg: 'bg-warning/10', icon: 'text-warning' } :
                                  insight.type === 'success' ? { border: 'border-success/20', bg: 'bg-success/10', icon: 'text-success' } :
                                  { border: 'border-info/20', bg: 'bg-info/10', icon: 'text-info' };
                    
                    return (
                        <div key={idx} className={cn("p-4 rounded-2xl border flex flex-col gap-1", styles.border, styles.bg)}>
                            <span className={cn("font-bold text-sm flex items-center gap-2 text-white")}>
                                <div className={cn("w-2 h-2 rounded-full", styles.icon.replace('text-', 'bg-'))} />
                                {insight.t}
                            </span>
                            <span className="text-xs font-medium text-muted-foreground leading-relaxed pl-4">
                                {insight.d}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
