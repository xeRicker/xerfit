import { format, endOfWeek } from "date-fns";
import { pl } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeekNavigationProps {
    currentWeekStart: Date;
    onPrev: () => void;
    onNext: () => void;
    onCalendarOpen: () => void;
    isCurrentWeek: boolean;
}

export function WeekNavigation({ currentWeekStart, onPrev, onNext, onCalendarOpen, isCurrentWeek }: WeekNavigationProps) {
    return (
        <div className="glass-heavy p-2 rounded-2xl flex items-center justify-between shadow-xl shadow-black/20 backdrop-blur-3xl border-t border-white/10">
            <button onClick={onPrev} className="p-3 hover:bg-white/5 rounded-xl active:scale-95 transition-transform"><ChevronLeft size={20}/></button>
            <button 
                onClick={onCalendarOpen}
                className="flex flex-col items-center px-4 py-1 rounded-xl active:bg-white/5 transition-colors gap-0.5"
            >
                <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                    <CalendarDays size={10} />
                    Tydzień
                </span>
                <span className="text-sm font-bold text-foreground">
                    {format(currentWeekStart, 'd MMM', { locale: pl })} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'd MMM', { locale: pl })}
                </span>
            </button>
            <button 
                onClick={onNext} 
                disabled={isCurrentWeek}
                className={cn("p-3 hover:bg-white/5 rounded-xl active:scale-95 transition-transform", isCurrentWeek && "opacity-30 cursor-not-allowed")}
            >
                <ChevronRight size={20}/>
            </button>
       </div>
    );
}
