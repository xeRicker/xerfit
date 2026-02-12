"use client";

import { useDiaryStore } from "@/lib/store";
import { format, subDays, eachDayOfInterval, addDays, startOfWeek, endOfWeek, isSameWeek, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { CalendarModal } from "@/components/CalendarModal";

import { WeekNavigation } from "./_components/WeekNavigation";
import { WeeklyChart } from "./_components/WeeklyChart";
// import { AveragesSummary } from "./_components/AveragesSummary"; // Removed
import { MacroAveragesChart } from "./_components/MacroAveragesChart";
import { AIInsights } from "./_components/AIInsights";

export default function DiaryPage() {
  const { entries, profiles, activeProfileId } = useDiaryStore();
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

  // Enhanced AI Insights Logic
  const insights = useMemo(() => {
      const tips = [];
      
      // Protein Analysis
      if (avgs.p > 0) {
          if (avgs.p < target.protein * 0.8) {
              tips.push({ t: "Niski poziom białka", d: "Twoja średnia podaż białka jest poniżej celu. To może utrudnić regenerację mięśni.", type: 'warning' });
          } else if (avgs.p > target.protein * 0.9 && avgs.p < target.protein * 1.1) {
              tips.push({ t: "Idealne białko", d: "Świetnie trzymasz poziom białka! Twoje mięśnie mają z czego rosnąć.", type: 'success' });
          }
      }

      // Calories Analysis
      if (avgs.cals > 0) {
          const diff = avgs.cals - target.calories;
          if (diff < -500) {
              tips.push({ t: "Duży deficyt", d: "Jesz znacznie mniej niż zakłada cel. Uważaj na spadek energii i utratę mięśni.", type: 'warning' });
          } else if (diff > 500) {
              tips.push({ t: "Nadwyżka kaloryczna", d: "Jesz więcej niż planowano. Jeśli nie robisz masy, może to prowadzić do odkładania tłuszczu.", type: 'warning' });
          } else if (Math.abs(diff) < 200) {
              tips.push({ t: "W punkt z kaloriami", d: "Trzymasz kalorie perfekcyjnie blisko celu. Tak trzymaj!", type: 'success' });
          }
      }

      // Combinations
      if (avgs.c > target.carbs * 1.2 && avgs.f > target.fat * 1.2) {
           tips.push({ t: "Wysokie Węgle i Tłuszcze", d: "Łączenie dużej ilości tłuszczu z węglowodanami sprzyja odkładaniu zapasów. Spróbuj ograniczyć jedno z nich.", type: 'info' });
      }

      if (avgs.p > target.protein && avgs.cals < target.calories) {
          tips.push({ t: "Świetna redukcja", d: "Wysokie białko przy deficycie to najlepszy sposób na spalanie tłuszczu przy zachowaniu mięśni.", type: 'success' });
      }

      return tips;
  }, [avgs, target]);

  const navigateWeek = (dir: 'prev' | 'next') => {
    setCurrentWeekStart(prev => dir === 'prev' ? subDays(prev, 7) : addDays(prev, 7));
  };

  const isCurrentWeek = isSameWeek(currentWeekStart, new Date(), { weekStartsOn: 1 });

  return (
    <main className="flex flex-col h-screen overflow-hidden relative">
      <div className="pt-12 px-5 pb-4">
        <h1 className="text-3xl font-black tracking-tight text-primary">Dziennik</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-[160px] flex flex-col gap-6 scrollbar-hide">
          <WeeklyChart weeklyStats={weeklyStats} />

          {/* Combined Chart with Averages included */}
          <MacroAveragesChart avgs={avgs} targets={target} />

          <AIInsights insights={insights} />
      </div>

       <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+90px)] left-5 right-5 z-40">
           <WeekNavigation 
             currentWeekStart={currentWeekStart}
             onPrev={() => navigateWeek('prev')}
             onNext={() => navigateWeek('next')}
             onCalendarOpen={() => setIsCalendarOpen(true)}
             isCurrentWeek={isCurrentWeek}
           />
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
