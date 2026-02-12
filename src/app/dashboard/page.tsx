"use client";

import { AnimatePresence } from "framer-motion";
import { useDiaryStore, MealEntry, MealCategory } from "@/lib/store";
import { format, addDays, subDays, parseISO } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarModal } from "@/components/CalendarModal";
import { User } from "lucide-react";

import { DateNavigator } from "./_components/DateNavigator";
import { CaloriesCard } from "./_components/CaloriesCard";
import { MacrosGrid } from "./_components/MacrosGrid";
import { MealList } from "./_components/MealList";
import { EditEntryModal } from "./_components/EditEntryModal";
import { cn } from "@/lib/utils";

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
    <main className="p-5 flex flex-col gap-6 max-w-md mx-auto min-h-screen pb-[160px]">
      
      {/* Simple Top Header */}
      <header className="pt-8 flex justify-between items-start">
        <div className="flex flex-col">
            <h1 className="text-3xl font-black tracking-tight">Cześć, {activeProfile.name}!</h1>
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mt-1">Podsumowanie dnia</p>
        </div>
        <button 
            onClick={() => router.push('/profile')}
            className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform",
                activeProfile.color
            )}
        >
            <User size={20} />
        </button>
      </header>

      <CaloriesCard 
        current={totals.cal}
        target={activeProfile.targets.calories}
        currentDateKey={currentDate}
      />

      <MacrosGrid 
        totals={totals}
        targets={activeProfile.targets}
      />

      <MealList 
        entries={dayEntries}
        onAdd={handleAddClick}
        onEdit={handleEditClick}
      />

      <DateNavigator 
        currentDate={currentDate}
        onPrevDate={() => navigateDate('prev')}
        onNextDate={() => navigateDate('next')}
        onCalendarOpen={() => setIsCalendarOpen(true)}
      />

      <AnimatePresence>
        {editingEntry && (
            <EditEntryModal 
                onClose={() => setEditingEntry(null)}
                weight={newWeight}
                onWeightChange={setNewWeight}
                onSave={handleSaveEdit}
                onDelete={handleDelete}
            />
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
