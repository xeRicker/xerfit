"use client";

import { useDiaryStore } from "@/lib/store";
import { format, subDays, eachDayOfInterval, addDays, startOfWeek, endOfWeek, isSameWeek, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BarChart3, TrendingUp, Lightbulb, Target, Brain, Dumbbell, Droplets, Apple, Utensils, Heart, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState, useMemo } from "react";
import { CalendarModal } from "@/components/CalendarModal";

const TRIVIA = [
    { 
        t: "Białko to fundament", 
        d: "Spożywanie 1.6g-2.2g białka na kg masy ciała jest kluczowe dla budowy mięśni. Rozkładaj białko równomiernie w ciągu dnia.", 
        i: Brain,
        c: "text-protein"
    },
    { 
        t: "Węglowodany to paliwo", 
        d: "Nie bój się węgli przed treningiem — to one dają Ci energię do bicia rekordów. Wybieraj złożone węglowodany, jak kasze, bataty, pełnoziarniste produkty.", 
        i: Dumbbell,
        c: "text-carbs"
    },
    { 
        t: "Tłuszcze a hormony", 
        d: "Zdrowe tłuszcze są niezbędne do prawidłowej produkcji hormonów i regeneracji. Należą do nich awokado, orzechy, nasiona, tłuste ryby.", 
        i: Target,
        c: "text-fat"
    },
    { 
        t: "Sen to regeneracja", 
        d: "Mięśnie nie rosną na siłowni, tylko podczas snu. Dbaj o 7-9 godzin wysokiej jakości odpoczynku każdej nocy.", 
        i: Lightbulb,
        c: "text-primary"
    },
    {
        t: "Pij wodę!",
        d: "Odpowiednie nawodnienie to podstawa metabolizmu, transportu składników odżywczych i efektywności treningu. Pij co najmniej 2-3 litry wody dziennie.",
        i: Droplets,
        c: "text-blue-500"
    },
    {
        t: "Nie zapominaj o warzywach",
        d: "Warzywa i owoce to źródło witamin, minerałów i błonnika, wspierające trawienie i ogólne zdrowie. Staraj się jeść co najmniej 5 porcji dziennie.",
        i: Apple,
        c: "text-green-500"
    },
    {
        t: "Regularność posiłków",
        d: "Utrzymuj stały rytm posiłków, aby stabilizować poziom cukru we krwi i unikać napadów głodu. Planowanie jest kluczem!",
        i: Utensils,
        c: "text-orange-500"
    },
    {
        t: "Słuchaj swojego ciała",
        d: "Twoje ciało wysyła sygnały. Naucz się je rozpoznawać, czy to głód, sytość, czy zmęczenie. Indywidualne podejście jest najlepsze.",
        i: Heart,
        c: "text-red-500"
    }
];

export default function DiaryPage() {
  const { entries, profiles, activeProfileId, setDate } = useDiaryStore();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const target = activeProfile.targets;

  const { weeklyStats, avgs } = useMemo(() => {
      const days = eachDayOfInterval({ 
        start: currentWeekStart, 
        end: endOfWeek(currentWeekStart, { weekStartsOn: 1 }) 
      });

      const stats = days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayEntries = entries.filter(e => e.date === dayStr && e.profileId === activeProfileId);
        
        return {
            date: dayStr,
            dayName: format(day, 'EEE', { locale: pl }),
            cals: dayEntries.reduce((acc, curr) => acc + (curr.calories || 0), 0),
            p: dayEntries.reduce((acc, curr) => acc + (curr.protein || 0), 0),
            f: dayEntries.reduce((acc, curr) => acc + (curr.fat || 0), 0),
            c: dayEntries.reduce((acc, curr) => acc + (curr.carbs || 0), 0),
            hasData: dayEntries.length > 0
        };
      });

      const totals = stats.reduce((acc, curr) => ({
        cals: acc.cals + curr.cals,
        p: acc.p + curr.p,
        f: acc.f + curr.f,
        c: acc.c + curr.c,
        daysWithData: acc.daysWithData + (curr.hasData ? 1 : 0)
      }), { cals: 0, p: 0, f: 0, c: 0, daysWithData: 0 });

      const divisor = Math.max(1, totals.daysWithData);

      return {
          weeklyStats: stats,
          avgs: {
            cals: Math.round(totals.cals / divisor),
            p: Math.round(totals.p / divisor),
            f: Math.round(totals.f / divisor),
            c: Math.round(totals.c / divisor)
          }
      };
  }, [currentWeekStart, entries, activeProfileId]);

  const today = new Date();
  const dailyTrivia = TRIVIA[Math.floor((today.getDate() + today.getMonth() * 31) % TRIVIA.length)];

  const insights = [];
  if (avgs.p > 0 && avgs.p < target.protein * 0.9) insights.push("Spożywasz za mało białka. Dodaj więcej chudego mięsa, roślin strączkowych lub odżywki białkowej.");
  if (avgs.c > target.carbs * 1.1) insights.push("Przekraczasz limit węglowodanów. Spróbuj ograniczyć cukry proste i zwiększ spożycie błonnika.");
  if (avgs.cals > 0 && avgs.cals < target.calories * 0.8) insights.push("Jesteś w dużym deficycie kalorycznym. Pamiętaj, aby dostarczać wystarczająco energii!");
  if (avgs.cals > target.calories * 1.2) insights.push("Znacznie przekraczasz swoje zapotrzebowanie kaloryczne. Zwróć uwagę na wielkość porcji.");
  if (avgs.f > 0 && avgs.f < target.fat * 0.8) insights.push("Twoja podaż tłuszczów jest zbyt niska. Zadbaj o zdrowe tłuszcze dla zdrowia hormonalnego.");

  const navigateWeek = (dir: 'prev' | 'next') => {
    setCurrentWeekStart(prev => dir === 'prev' ? subDays(prev, 7) : addDays(prev, 7));
  };

  const isCurrentWeek = isSameWeek(currentWeekStart, new Date(), { weekStartsOn: 1 });

  return (
    <main className="p-5 flex flex-col gap-6 max-w-md mx-auto pt-12 min-h-screen pb-32">
      <div className="flex flex-col">
        <h1 className="text-3xl font-black tracking-tight text-primary">Twój Dziennik</h1>
      </div>

       {/* Week Navigation */}
       <div className="flex items-center justify-between glass p-2 rounded-2xl">
            <button onClick={() => navigateWeek('prev')} className="p-2 glass rounded-xl active:scale-95 transition-transform"><ChevronLeft size={20}/></button>
            <button 
                onClick={() => setIsCalendarOpen(true)}
                className="flex flex-col items-center px-4 py-1 rounded-xl active:bg-white/5 transition-colors"
            >
                <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    {format(currentWeekStart, 'd MMM', { locale: pl })} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'd MMM', { locale: pl })}
                </span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Otwórz Kalendarz</span>
            </button>
            <button 
                onClick={() => navigateWeek('next')} 
                disabled={isCurrentWeek}
                className={cn("p-2 glass rounded-xl active:scale-95 transition-transform", isCurrentWeek && "opacity-30 cursor-not-allowed")}
            >
                <ChevronRight size={20}/>
            </button>
       </div>

      {/* Weekly Macros Chart (Replaced Calorie Chart) */}
      <div className="glass p-6 rounded-[32px] flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground text-[11px] font-bold uppercase tracking-wider">
                <BarChart3 size={14} className="text-primary" />
                Dystrybucja Makroskładników
            </div>
        </div>

        <div className="flex justify-between items-end h-40 gap-3">
            {weeklyStats.map((stat, i) => {
                const totalMacros = stat.p + stat.f + stat.c || 1;
                const pPct = (stat.p / totalMacros) * 100;
                const fPct = (stat.f / totalMacros) * 100;
                const cPct = (stat.c / totalMacros) * 100;
                const isEmpty = !stat.hasData;
                const isToday = stat.date === format(new Date(), 'yyyy-MM-dd');

                return (
                    <div key={stat.date} className="flex flex-col items-center gap-2 flex-1 h-full">
                        <div className="w-full relative flex flex-col items-center justify-end h-full rounded-2xl bg-white/5 overflow-hidden">
                            {!isEmpty ? (
                                <>
                                    <motion.div initial={{ height: 0 }} animate={{ height: `${pPct}%` }} transition={{ delay: i * 0.03 }} className="w-full bg-protein" />
                                    <motion.div initial={{ height: 0 }} animate={{ height: `${fPct}%` }} transition={{ delay: i * 0.03 + 0.1 }} className="w-full bg-fat" />
                                    <motion.div initial={{ height: 0 }} animate={{ height: `${cPct}%` }} transition={{ delay: i * 0.03 + 0.2 }} className="w-full bg-carbs" />
                                </>
                            ) : (
                                <div className="w-1 h-1 bg-white/10 rounded-full mb-2" />
                            )}
                        </div>
                        <span className={cn(
                            "text-[9px] font-bold uppercase",
                            isToday ? "text-primary" : "text-muted-foreground"
                        )}>
                            {stat.dayName}
                        </span>
                    </div>
                );
            })}
        </div>
        <div className="flex justify-around pt-2 border-t border-white/5">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-protein"/> <span className="text-[10px] font-bold text-muted-foreground uppercase">Białko</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-fat"/> <span className="text-[10px] font-bold text-muted-foreground uppercase">Tłuszcze</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-carbs"/> <span className="text-[10px] font-bold text-muted-foreground uppercase">Węgle</span></div>
        </div>
      </div>

      {/* Weekly Averages Summary */}
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

      {/* Macro Averages Chart */}
      <div className="glass p-6 rounded-[32px] flex flex-col gap-5">
        <div className="flex items-center gap-2 text-muted-foreground text-[11px] font-bold uppercase tracking-wider">
            <TrendingUp size={14} className="text-primary" />
            Średnie Makroskładniki
        </div>
        
        <div className="flex flex-col gap-4">
            <MacroRow label="Białko" val={avgs.p} tgt={target.protein} color="protein" unit="g" />
            <MacroRow label="Tłuszcze" val={avgs.f} tgt={target.fat} color="fat" unit="g" />
            <MacroRow label="Węglowodany" val={avgs.c} tgt={target.carbs} color="carbs" unit="g" />
        </div>
      </div>

      {/* Personalized Insights */}
      {insights.length > 0 && (
          <div className="glass p-6 rounded-[32px] border-primary/20 bg-primary/5 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-primary text-[11px] font-bold uppercase tracking-wider">
                  <Brain size={16} />
                  Analiza Trenera AI
              </div>
              <ul className="flex flex-col gap-3">
                {insights.map((ins, i) => (
                    <li key={i} className="text-sm font-medium text-white/90 flex gap-3">
                        <span className="text-primary mt-1">•</span>
                        {ins}
                    </li>
                ))}
              </ul>
          </div>
      )}

      {/* Dynamic Trivia */}
      <div className="grid grid-cols-1 gap-3">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass p-5 rounded-3xl flex gap-4 items-start"
            >
                <div className={cn("p-3 rounded-2xl bg-white/5", dailyTrivia.c)}>
                    <dailyTrivia.i size={20} />
                </div>
                <div className="flex flex-col gap-1">
                    <h4 className="font-bold text-white">{dailyTrivia.t}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{dailyTrivia.d}</p>
                </div>
            </motion.div>
      </div>

      <AnimatePresence>
        {isCalendarOpen && (
            <CalendarModal 
                onClose={() => setIsCalendarOpen(false)} 
                currentDate={format(currentWeekStart, 'yyyy-MM-dd')} 
                onSelect={(d) => { 
                    setCurrentWeekStart(startOfWeek(parseISO(d), { weekStartsOn: 1 })); 
                    setIsCalendarOpen(false); 
                }}
                entries={entries}
                targets={activeProfile.targets}
                profileId={activeProfileId}
            />
        )}
      </AnimatePresence>

    </main>
  );
}

interface MacroRowProps {
    label: string;
    val: number;
    tgt: number;
    color: string;
    unit: string;
}

function MacroRow({ label, val, tgt, color, unit }: MacroRowProps) {

    const isExceeded = val > tgt;
    // Calculate percentage but ensure it's at least a tiny bit visible if val > 0
    const pct = val > 0 ? Math.max(Math.min((val / tgt) * 100, 100), 2) : 0;

    const colors = isExceeded ? "bg-error text-error" : {
        protein: "bg-protein text-protein",
        fat: "bg-fat text-fat",
        carbs: "bg-carbs text-carbs",
        primary: "bg-primary text-primary"
    }[color as 'protein' | 'fat' | 'carbs' | 'primary'];

    const bgColor = colors?.split(' ')[0];
    const textColor = colors?.split(' ')[1];

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-white">{label}</span>
                <span className="text-xs font-bold text-muted-foreground">
                    <span className={cn("text-sm font-black", textColor)}>{val}</span> / {tgt}{unit}
                </span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn("h-full rounded-full", bgColor)}
                />
            </div>
        </div>
    );
}
