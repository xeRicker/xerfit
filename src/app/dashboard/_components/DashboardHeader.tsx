import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";

interface DashboardHeaderProps {
    userName: string;
    currentDate: string;
    onPrevDate: () => void;
    onNextDate: () => void;
    onCalendarOpen: () => void;
}

export function DashboardHeader({ userName, currentDate, onPrevDate, onNextDate, onCalendarOpen }: DashboardHeaderProps) {
    return (
        <header className="pt-8 flex flex-col gap-4">
            <div className="flex flex-col">
                <h1 className="text-3xl font-black tracking-tight">Cześć, {userName}!</h1>
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mt-1">Podsumowanie dnia</p>
            </div>

            <div className="flex items-center justify-between glass p-2 rounded-2xl">
                <button onClick={onPrevDate} className="p-2 glass rounded-xl active:scale-95 transition-transform"><ChevronLeft size={20}/></button>
                <button 
                    onClick={onCalendarOpen}
                    className="flex flex-col items-center px-4 py-1 rounded-xl active:bg-white/5 transition-colors"
                >
                    <span className="text-sm font-bold uppercase tracking-widest text-primary">
                        {format(parseISO(currentDate), 'eeee', { locale: pl })}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {format(parseISO(currentDate), 'd MMMM yyyy', { locale: pl })}
                    </span>
                </button>
                <button 
                    onClick={onNextDate} 
                    className="p-2 glass rounded-xl active:scale-95 transition-transform"
                >
                    <ChevronRight size={20}/>
                </button>
            </div>
        </header>
    );
}
