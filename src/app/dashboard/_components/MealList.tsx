import { motion } from "framer-motion";
import { Plus, ChevronRight, ScanBarcode, Coffee, Utensils, Moon } from "lucide-react";
import { MealEntry, MealCategory } from "@/lib/store";
import { MacroIcon } from "@/components/MacroIcon";

const CATEGORIES: { id: MealCategory, label: string, icon: React.ElementType }[] = [
    { id: 'breakfast', label: 'Śniadanie', icon: Coffee },
    { id: 'lunch', label: 'Obiad', icon: Utensils },
    { id: 'dinner', label: 'Kolacja', icon: Moon },
];

interface MealListProps {
    entries: MealEntry[];
    onAdd: (category: MealCategory) => void;
    onEdit: (entry: MealEntry) => void;
}

export function MealList({ entries, onAdd, onEdit }: MealListProps) {
    return (
        <div className="flex flex-col gap-6 mt-2">
            {CATEGORIES.map((cat) => {
                const catEntries = entries.filter(e => e.category === cat.id);
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
                                onClick={() => onAdd(cat.id)}
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
                                    onClick={() => onEdit(meal)}
                                    className="glass p-4 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer group"
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className="flex flex-col">
                                            <span className="font-semibold flex items-center gap-2">
                                                {meal.name}
                                                {meal.is_scanned && <ScanBarcode size={14} className="text-muted-foreground/50" />}
                                            </span>
                                            {meal.brand && <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{meal.brand}</span>}
                                        </div>
                                        <div className="flex gap-3 text-[10px] uppercase font-bold text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1 text-protein"><MacroIcon type="protein" size={10} colored />{Math.round(meal.protein)}g</span>
                                            <span className="flex items-center gap-1 text-fat"><MacroIcon type="fat" size={10} colored />{Math.round(meal.fat)}g</span>
                                            <span className="flex items-center gap-1 text-carbs"><MacroIcon type="carbs" size={10} colored />{Math.round(meal.carbs)}g</span>
                                            <span className="text-white/60 ml-1">{meal.weight}g</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-end">
                                            <span className="text-lg font-bold text-primary">{Math.round(meal.calories)}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">kcal</span>
                                        </div>
                                        <ChevronRight size={18} className="text-white/10 group-hover:text-white/30 transition-colors" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
