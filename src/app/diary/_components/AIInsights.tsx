import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIInsight {
    t: string;
    d: string;
    type: string;
}

interface AIInsightsProps {
    insights: AIInsight[];
}

export function AIInsights({ insights }: AIInsightsProps) {
    if (insights.length === 0) return null;

    return (
        <div className="glass p-6 rounded-[32px] border-primary/20 bg-primary/5 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-primary text-[11px] font-bold uppercase tracking-wider">
                <Brain size={16} />
                Analiza Trenera AI
            </div>
            <ul className="flex flex-col gap-3">
                {insights.map((ins, i) => (
                    <li key={i} className="flex gap-3">
                        <div className={cn(
                            "mt-0.5 w-1.5 h-1.5 rounded-full shrink-0",
                            ins.type === 'warning' ? "bg-red-500" : ins.type === 'success' ? "bg-green-500" : "bg-blue-500"
                        )} />
                        <div className="flex flex-col gap-1">
                            <span className={cn(
                                "text-xs font-bold",
                                ins.type === 'warning' ? "text-red-500" : ins.type === 'success' ? "text-green-500" : "text-blue-500"
                            )}>{ins.t}</span>
                            <span className="text-xs font-medium text-white/80 leading-relaxed">{ins.d}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
