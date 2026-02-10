"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Flame, AlertCircle, ChevronLeft, ChevronRight, Edit2, Trash2, RotateCcw, Scale, X, Plus, Coffee, Utensils, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDiaryStore, MealEntry, MealCategory } from "@/lib/store";
import { format, addDays, subDays, parseISO, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, startOfWeek, endOfWeek } from "date-fns";
import { pl } from "date-fns/locale";
import { MacroIcon } from "@/components/MacroIcon";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CalendarModal } from "@/components/CalendarModal";

const CATEGORIES: { id: MealCategory, label: string, icon: React.ElementType }[] = [
    { id: 'breakfast', label: 'Śniadanie', icon: Coffee },
    { id: 'lunch', label: 'Obiad', icon: Utensils },
    { id: 'dinner', label: 'Kolacja', icon: Moon },
];

export default function DashboardPage() {
  const { entries, profiles, activeProfileId, currentDate, setDate, updateEntry, removeEntry, setSelectionMode } = useDiaryStore();
  const router = useRouter();

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const [editingEntry, setEditingEntry] = useState<MealEntry | null>(null);
  const [newWeight, setNewWeight] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const dayEntries = entries.filter(e => e.date === currentDate && e.profileId === activeProfileId);
  
  const totals = dayEntries.reduce((acc, curr) => ({
    cal: acc.cal + curr.calories,
    p: acc.p + curr.protein,
    f: acc.f + curr.fat,
    c: acc.c + curr.carbs
  }), { cal: 0, p: 0, f: 0, c: 0 });

  if (!activeProfile || !activeProfile.targets) {
    return null;
  }

  const progress = (totals.cal / activeProfile.targets.calories) * 100;
  const left = activeProfile.targets.calories - totals.cal;

  const navigateDate = (dir: 'prev' | 'next') => {
    const curr = parseISO(currentDate);
    const newDate = dir === 'prev' ? subDays(curr, 1) : addDays(curr, 1);
    setDate(format(newDate, 'yyyy-MM-dd'));
  };

  const handleAddClick = (category: MealCategory) => {
    setSelectionMode(true, category);
    router.push('/meals');
  };

  const handleEditClick = (entry: MealEntry) => {
    setEditingEntry(entry);
    setNewWeight(entry.weight.toString());
  };

  const handleSaveEdit = () => {
    if (!editingEntry) return;
    updateEntry(editingEntry.id, Number(newWeight));
    setEditingEntry(null);
  };

  const handleDelete = () => {
    if (!editingEntry) return;
    removeEntry(editingEntry.id);
    setEditingEntry(null);
  };

  return (
    <main className="p-5 flex flex-col gap-6 max-w-md mx-auto min-h-screen pb-32">
      {/* Header with Navigation aligned to Diary style */}
      <header className="pt-8 flex flex-col gap-4">
        <div className="flex flex-col">
            <h1 className="text-3xl font-black tracking-tight">Cześć, {activeProfile.name}!</h1>
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mt-1">Podsumowanie dnia</p>
        </div>

        <div className="flex items-center justify-between glass p-2 rounded-2xl">
            <button onClick={() => navigateDate('prev')} className="p-2 glass rounded-xl active:scale-95 transition-transform"><ChevronLeft size={20}/></button>
            <button 
                onClick={() => setIsCalendarOpen(true)}
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
                onClick={() => navigateDate('next')} 
                className="p-2 glass rounded-xl active:scale-95 transition-transform"
            >
                <ChevronRight size={20}/>
            </button>
        </div>
      </header>

      {/* Main Calorie Card */}
      <motion.div
        key={currentDate}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass p-6 rounded-[32px] relative overflow-hidden group shadow-lg shadow-primary/5"
      >
        <div className="flex justify-between items-center relative z-10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground text-[11px] font-bold uppercase tracking-wider">
              <Flame size={14} className="text-primary" />
              Podsumowanie kalorii
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-primary tracking-tighter">
                {Math.round(totals.cal)}
              </span>
              <span className="text-muted-foreground font-bold text-lg">
                / {activeProfile.targets.calories}
              </span>
            </div>
            <div className={cn(
              "flex items-center gap-1.5 text-sm font-semibold mt-1",
              left < 0 ? "text-error" : "text-muted-foreground/80"
            )}>
              {left < 0 && <AlertCircle size={14} />}
              {left >= 0 ? `Pozostało ${Math.round(left)} kcal` : `Przekroczenie o ${Math.abs(Math.round(left))} kcal`}
            </div>
          </div>

          {/* Progress Ring */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/10 dark:text-white/5"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="url(#orange-gradient)"
                strokeWidth="8"
                strokeDasharray="251.2"
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 - (251.2 * Math.min(progress, 100)) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
              />
              {progress > 100 && (
                <motion.circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="#FF453A"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * Math.min(progress - 100, 100)) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                    strokeLinecap="round"
                />
              )}
              <defs>
                <linearGradient id="orange-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF4D00" />
                  <stop offset="100%" stopColor="#FF9500" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute text-lg font-black">{Math.round(progress)}%</span>
          </div>
        </div>
      </motion.div>

      {/* Macros Grid */}
      <div className="grid grid-cols-3 gap-3">
        <MacroCard
          label="Białko"
          value={totals.p}
          target={activeProfile.targets.protein}
          color="protein"
          icon={<MacroIcon type="protein" size={14} colored />}
          index={1}
        />
        <MacroCard
          label="Tłuszcze"
          value={totals.f}
          target={activeProfile.targets.fat}
          color="fat"
          icon={<MacroIcon type="fat" size={14} colored />}
          index={2}
        />
        <MacroCard
          label="Węgle"
          value={totals.c}
          target={activeProfile.targets.carbs}
          color="carbs"
          icon={<MacroIcon type="carbs" size={14} colored />}
          index={3}
        />
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-6 mt-2">
        {CATEGORIES.map((cat) => {
            const catEntries = dayEntries.filter(e => e.category === cat.id);
            const catCals = catEntries.reduce((a, b) => a + b.calories, 0);
            const Icon = cat.icon;

            return (
                <div key={cat.id} className="flex flex-col gap-3">
                    <div className="flex justify-between items-end px-1">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground">
                                <Icon size={18} />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-lg font-bold tracking-tight">{cat.label}</h3>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{catCals > 0 ? `${Math.round(catCals)} kcal` : 'Brak wpisów'}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleAddClick(cat.id)}
                            className="p-2 bg-primary/10 text-primary rounded-xl active:scale-90 transition-transform"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-2">
                        {catEntries.map((meal) => (
                            <motion.div
                                key={meal.id}
                                layoutId={meal.id}
                                onClick={() => handleEditClick(meal)}
                                className="glass p-4 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer"
                            >
                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold">{meal.name}</span>
                                    <div className="flex gap-3 text-[10px] uppercase font-bold text-muted-foreground">
                                        <span className="flex items-center gap-1 text-protein"><MacroIcon type="protein" size={10} colored />{Math.round(meal.protein)}g</span>
                                        <span className="flex items-center gap-1 text-fat"><MacroIcon type="fat" size={10} colored />{Math.round(meal.fat)}g</span>
                                        <span className="flex items-center gap-1 text-carbs"><MacroIcon type="carbs" size={10} colored />{Math.round(meal.carbs)}g</span>
                                        <span className="text-white/60 ml-1">{meal.weight}g</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-lg font-bold text-primary">{Math.round(meal.calories)}</span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">kcal</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            );
        })}
      </div>

      {/* Edit Entry Modal */}
      <AnimatePresence>
        {editingEntry && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    onClick={() => setEditingEntry(null)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                />
                <motion.div 
                    initial={{ y: "100%" }} 
                    animate={{ y: 0 }} 
                    exit={{ y: "100%" }}
                    className="fixed bottom-0 left-0 right-0 z-[70] bg-[#1C1C1E] rounded-t-[32px] p-6 pb-[calc(env(safe-area-inset-bottom,20px)+24px)] shadow-2xl border-t border-white/10"
                >
                    <div className="max-w-md mx-auto flex flex-col gap-6">
                        <div className="flex justify-between items-start">
                            <h2 className="text-2xl font-bold">Edytuj Posiłek</h2>
                            <button onClick={() => setEditingEntry(null)} className="p-2 bg-white/5 rounded-full text-muted-foreground"><X size={20}/></button>
                        </div>

                         <div className="glass p-4 rounded-2xl flex items-center gap-4">
                            <Scale size={24} className="text-primary" />
                            <div className="flex flex-col flex-1">
                                <label className="text-xs font-bold text-muted-foreground uppercase">Nowa waga (g)</label>
                                <input 
                                    type="number" 
                                    value={newWeight}
                                    onChange={(e) => setNewWeight(e.target.value)}
                                    className="bg-transparent text-3xl font-black outline-none w-full"
                                    autoFocus
                                    onFocus={(e) => e.target.select()}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={handleDelete}
                                className="h-14 rounded-full bg-red-500/20 text-red-500 font-bold text-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                <Trash2 size={20} /> Usuń
                            </button>
                            <button 
                                onClick={handleSaveEdit}
                                className="h-14 rounded-full bg-primary text-white font-bold text-lg shadow-lg shadow-primary/25 active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                <Edit2 size={20} /> Zapisz
                            </button>
                        </div>
                    </div>
                </motion.div>
            </>
        )}

        {isCalendarOpen && (
            <CalendarModal 
                onClose={() => setIsCalendarOpen(false)} 
                currentDate={currentDate} 
                onSelect={(d) => { setDate(d); setIsCalendarOpen(false); }}
                entries={entries}
                targets={activeProfile.targets}
                profileId={activeProfileId}
            />
        )}
      </AnimatePresence>

    </main>
  );
}

interface MacroCardProps {
    label: string;
    value: number;
    target: number;
    color: string;
    icon: React.ReactNode;
    index: number;
}

function MacroCard({ label, value, target, color, icon, index }: MacroCardProps) {
  const isExceeded = value > target;
  const pct = Math.min((value / target) * 100, 100);
  
  const colorClass = isExceeded ? "bg-error" : {
    protein: "bg-protein",
    fat: "bg-fat",
    carbs: "bg-carbs",
  }[color as "protein" | "fat" | "carbs"];

  const textClass = isExceeded ? "text-error" : {
    protein: "text-protein",
    fat: "text-fat",
    carbs: "text-carbs",
  }[color as "protein" | "fat" | "carbs"];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      className={cn(
        "glass p-3.5 rounded-2xl flex flex-col gap-2 relative overflow-hidden",
        isExceeded && "border-error/30 bg-error/5"
      )}
    >
      <div className={cn("flex items-center justify-between gap-1.5 text-[10px] font-bold uppercase tracking-wider", textClass)}>
        <div className="flex items-center gap-1.5">
            {icon}
            {label}
        </div>
        {isExceeded && <AlertCircle size={10} />}
      </div>
      <div className="flex flex-col">
        <span className={cn("text-lg font-black leading-none", isExceeded && "text-error")}>
          {Math.round(value)}
          <span className="text-[10px] font-bold text-muted-foreground ml-0.5">/ {target}g</span>
        </span>
      </div>
      <div className="h-1.5 bg-muted/10 dark:bg-white/5 rounded-full overflow-hidden mt-1">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
          className={cn("h-full rounded-full", colorClass)}
        />
      </div>
    </motion.div>
  );
}
