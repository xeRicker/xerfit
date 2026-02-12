import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ProductSet, useDiaryStore } from "@/lib/store";
import { MacroIcon } from "@/components/MacroIcon";
import { Trash2, Plus, Layers } from "lucide-react";

interface SetListItemProps {
    set: ProductSet;
    isSelectionMode: boolean;
    onSelect: () => void;
    onEdit: (e: React.MouseEvent, set: ProductSet) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
}

export function SetListItem({ set, isSelectionMode, onSelect, onEdit, onDelete }: SetListItemProps) {
    const { products } = useDiaryStore();

    // Calculate totals on the fly
    const totals = set.items.reduce((acc, item) => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return acc;
        const ratio = item.weight / 100;
        return {
            calories: acc.calories + (product.calories * ratio),
            protein: acc.protein + (product.protein * ratio),
            fat: acc.fat + (product.fat * ratio),
            carbs: acc.carbs + (product.carbs * ratio)
        };
    }, { calories: 0, protein: 0, fat: 0, carbs: 0 });

    const itemCount = set.items.length;

    return (
        <motion.div 
            layoutId={`set-${set.id}`}
            onClick={(e) => {
                 if (isSelectionMode) {
                     onSelect();
                 } else {
                     onEdit(e, set);
                 }
            }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "glass p-4 rounded-2xl flex items-center justify-between gap-4 transition-all relative group overflow-visible min-h-[72px]",
                isSelectionMode 
                    ? "cursor-pointer ring-2 ring-primary bg-primary/5 shadow-lg shadow-primary/10" 
                    : "cursor-pointer hover:bg-white/5"
            )}
        >
            <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-base truncate leading-tight pr-2">
                        {set.name}
                    </span>
                </div>
                
                <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-wider">
                    <div className="bg-primary/10 text-primary rounded-full p-0.5 border border-primary/20 shrink-0">
                        <Layers size={8} />
                    </div>
                    <span>{itemCount} produkty</span>
                </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
                <div className="flex items-baseline gap-0.5">
                    <span className="text-xl font-black text-primary leading-none tracking-tight">{Math.round(totals.calories)}</span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">kcal</span>
                </div>

                <div className="flex gap-2 text-[10px] font-bold text-muted-foreground">
                    <span className="flex items-center gap-0.5 text-protein"><MacroIcon type="protein" size={10} colored />{Math.round(totals.protein)}</span>
                    <span className="flex items-center gap-0.5 text-fat"><MacroIcon type="fat" size={10} colored />{Math.round(totals.fat)}</span>
                    <span className="flex items-center gap-0.5 text-carbs"><MacroIcon type="carbs" size={10} colored />{Math.round(totals.carbs)}</span>
                </div>
            </div>
            
             {!isSelectionMode && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 -right-2 z-20 pointer-events-none group-hover:pointer-events-auto">
                     <button 
                        onClick={(e) => onDelete(e, set.id)}
                        className="p-2 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors active:scale-90"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )}
        </motion.div>
    );
}
