import { LucideIcon } from "lucide-react";

export function CompactStat({ val, icon: Icon, label }: { val?: number, icon: LucideIcon, label: string }) {
    if (!val) return (
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-black/10 opacity-30">
            <Icon size={12} />
            <span className="text-[8px] uppercase font-bold mt-1">-</span>
        </div>
    );
    return (
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-black/20">
            <Icon size={12} className="text-muted-foreground mb-1" />
            <span className="text-xs font-black text-white">{val}</span>
            <span className="text-[8px] uppercase font-bold text-muted-foreground">{label}</span>
        </div>
    );
}
