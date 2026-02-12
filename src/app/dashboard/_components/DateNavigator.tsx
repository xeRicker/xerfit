import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";

interface DateNavigatorProps {
    currentDate: string;
    onPrevDate: () => void;
    onNextDate: () => void;
    onCalendarOpen: () => void;
}

export function DateNavigator({ currentDate, onPrevDate, onNextDate, onCalendarOpen }: DateNavigatorProps) {
    return (
        <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+90px)] left-5 right-5 z-40">
            <div className="glass-heavy p-2 rounded-2xl flex items-center justify-between shadow-xl shadow-black/20 backdrop-blur-3xl border-t border-white/10">
                <button onClick={onPrevDate} className="p-3 hover:bg-white/5 rounded-xl active:scale-95 transition-transform"><ChevronLeft size={20}/></button>
                <button 
                    onClick={onCalendarOpen}
                    className="flex flex-col items-center px-6 py-1 rounded-xl active:bg-white/5 transition-colors gap-0.5"
                >
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                        <CalendarDays size={10} />
                        {format(parseISO(currentDate), 'eeee', { locale: pl })}
                    </span>
                    <span className="text-sm font-bold text-foreground">
                        {format(parseISO(currentDate), 'd MMMM yyyy', { locale: pl })}
                    </span>
                </button>
                <button 
                    onClick={onNextDate} 
                    className="p-3 hover:bg-white/5 rounded-xl active:scale-95 transition-transform"
                >
                    <ChevronRight size={20}/>
                </button>
            </div>
        </div>
    );
}
