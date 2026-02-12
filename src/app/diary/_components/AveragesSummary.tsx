interface AveragesSummaryProps {
    avgs: {
        cals: number;
        p: number;
        f: number;
        c: number;
    };
}

export function AveragesSummary({ avgs }: AveragesSummaryProps) {
    return (
        <div className="grid grid-cols-4 gap-2">
            <div className="glass p-3 rounded-2xl flex flex-col items-center justify-center gap-1">
                <span className="text-[9px] font-black text-muted-foreground uppercase">Śr. kcal</span>
                <span className="text-sm font-black text-primary">{avgs.cals}</span>
            </div>
            <div className="glass p-3 rounded-2xl flex flex-col items-center justify-center gap-1">
                <span className="text-[9px] font-black text-muted-foreground uppercase">Śr. B</span>
                <span className="text-sm font-black text-protein">{avgs.p}g</span>
            </div>
            <div className="glass p-3 rounded-2xl flex flex-col items-center justify-center gap-1">
                <span className="text-[9px] font-black text-muted-foreground uppercase">Śr. T</span>
                <span className="text-sm font-black text-fat">{avgs.f}g</span>
            </div>
            <div className="glass p-3 rounded-2xl flex flex-col items-center justify-center gap-1">
                <span className="text-[9px] font-black text-muted-foreground uppercase">Śr. W</span>
                <span className="text-sm font-black text-carbs">{avgs.c}g</span>
            </div>
        </div>
    );
}
