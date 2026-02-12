import { format, endOfWeek } from "date-fns";
import { pl } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
        <div className="flex items-center justify-between glass p-2 rounded-2xl">
            <button onClick={onPrev} className="p-2 glass rounded-xl active:scale-95 transition-transform"><ChevronLeft size={20}/></button>
            <button 
                onClick={onCalendarOpen}
                className="flex flex-col items-center px-4 py-1 rounded-xl active:bg-white/5 transition-colors"
            >
                <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    {format(currentWeekStart, 'd MMM', { locale: pl })} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'd MMM', { locale: pl })}
                </span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Otwórz Kalendarz</span>
            </button>
            <button 
                onClick={onNext} 
                disabled={isCurrentWeek}
                className={cn("p-2 glass rounded-xl active:scale-95 transition-transform", isCurrentWeek && "opacity-30 cursor-not-allowed")}
            >
                <ChevronRight size={20}/>
            </button>
       </div>
    );
}
