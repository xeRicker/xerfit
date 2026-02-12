import { LucideIcon } from "lucide-react";

export function ListStat({ val, icon: Icon }: { val?: number, icon: LucideIcon }) {
    if (!val) return null;
    return (
        <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-black/20 min-w-[32px]">
            <Icon size={10} className="text-muted-foreground mb-0.5" />
            <span className="text-[10px] font-black text-white leading-none">{val}</span>
        </div>
    );
}
