import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendChartProps {
    data: { date: string, value: number }[];
    color: string;
}

export function TrendChart({ data, color }: TrendChartProps) {
    if (data.length < 2) return (
        <div className="glass p-6 rounded-[32px] h-48 flex flex-col items-center justify-center gap-2">
            <TrendingUp size={24} className="text-muted-foreground/50" />
            <span className="text-xs font-bold text-muted-foreground/50">Za mało danych do pokazania trendu</span>
        </div>
    );

    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const points = values.map((v, i) => {
        const x = (i / (values.length - 1)) * 100;
        const y = 100 - ((v - min) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    const trend = values[values.length - 1] - values[0];
    const isUp = trend > 0;

    return (
        <div className="glass p-6 rounded-[32px] flex flex-col gap-4 relative overflow-hidden h-48 justify-between">
            <div className="flex items-center justify-between z-10">
                 <div className="flex items-center gap-2 text-muted-foreground text-[11px] font-bold uppercase tracking-wider">
                    <TrendingUp size={14} className="text-primary" />
                    Trend Wagi (ostatnie {data.length} pomiarów)
                </div>
                <div className={cn("flex items-center gap-1 text-sm font-bold", isUp ? "text-error" : "text-success")}>
                    {trend > 0 ? '+' : ''}{trend.toFixed(1)}kg
                    <span className="text-[10px] text-muted-foreground font-medium uppercase ml-1">Łącznie</span>
                </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 top-12 px-2 pb-2">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                            <stop offset="100%" stopColor={color} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <motion.path 
                        d={`M0,100 L${points.split(' ')[0]} ${points} L100,${points.split(' ').pop()?.split(',')[1]} L100,100 Z`}
                        fill="url(#chartGradient)" 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    />
                    <motion.polyline 
                        points={points}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                </svg>
            </div>
            
            <div className="flex justify-between z-10 text-[9px] font-bold text-muted-foreground uppercase">
                <span>Start: {values[0]}kg</span>
                <span>Teraz: {values[values.length - 1]}kg</span>
            </div>
        </div>
    );
}
