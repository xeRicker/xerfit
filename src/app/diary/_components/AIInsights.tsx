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
                AI Insights
            </div>
            
            <div className="flex flex-col gap-3">
                {insights.map((insight, idx) => {
                    const color = insight.type === 'warning' ? 'text-warning border-warning/20 bg-warning/5' :
                                  insight.type === 'success' ? 'text-success border-success/20 bg-success/5' :
                                  'text-info border-info/20 bg-info/5';
                    
                    return (
                        <div key={idx} className={cn("p-4 rounded-2xl border flex flex-col gap-1", color)}>
                            <span className="font-bold text-sm flex items-center gap-2">
                                {insight.t}
                            </span>
                            <span className="text-xs font-medium opacity-80 leading-relaxed">
                                {insight.d}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
