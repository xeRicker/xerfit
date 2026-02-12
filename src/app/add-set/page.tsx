"use client";

import { useState, useEffect } from "react";
import { useDiaryStore, ProductSet, Product } from "@/lib/store";
import { Plus, Save, X, Trash2, Layers, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MacroIcon } from "@/components/MacroIcon";

export default function AddSetPage() {
    const { addSet, updateSet, deleteSet, editingSet, setEditingSet, products, setSelectionMode } = useDiaryStore();
    const router = useRouter();

    const [name, setName] = useState("");
    const [items, setItems] = useState<{ productId: string, weight: number }[]>([]);

    useEffect(() => {
        if (editingSet) {
            setName(editingSet.name);
            setItems(editingSet.items);
        } else {
            if (!editingSet) {
                 const newId = addSet({ name: "Nowy Zestaw", items: [] });
                 const newSet = useDiaryStore.getState().sets.find(s => s.id === newId);
                 setEditingSet(newSet || null);
            }
        }
    }, []); 

    useEffect(() => {
        if (editingSet) {
            setName(editingSet.name);
            setItems(editingSet.items);
        }
    }, [editingSet]);

    const handleNameChange = (val: string) => {
        setName(val);
        if (editingSet) {
            updateSet(editingSet.id, { name: val });
        }
    };

    const handleRemoveItem = (index: number) => {
        if (!editingSet) return;
        const newItems = [...items];
        newItems.splice(index, 1);
        updateSet(editingSet.id, { items: newItems });
    };

    const handleAddProduct = () => {
        if (!editingSet) return;
        setSelectionMode(true, null, true, editingSet.id);
        router.push('/meals');
    };

    const handleSave = () => {
        if (totals.calories === 0 && items.length === 0) {
            // If empty, just delete it effectively cancelling creation
            if (editingSet) deleteSet(editingSet.id);
            setEditingSet(null);
            router.push('/meals');
            return;
        }
        if (totals.calories === 0) {
             alert("Zestaw nie może mieć zerowych kalorii.");
             return;
        }
        setEditingSet(null);
        router.push('/meals');
    };

    const handleCancel = () => {
        // If it's a new set (no items yet) or we want to discard changes?
        // The issue is `addSet` creates it immediately.
        // If we cancel, we should check if it was a "new" set. 
        // A heuristic: if it has no items, treat as cancelled/delete.
        if (editingSet && items.length === 0) {
            deleteSet(editingSet.id);
        }
        setEditingSet(null);
        router.push('/meals');
    };

    const handleDelete = () => {
        if (editingSet && confirm("Czy na pewno chcesz usunąć ten zestaw?")) {
            deleteSet(editingSet.id);
            setEditingSet(null);
            router.push('/meals');
        }
    };

    // Calculate totals
    const totals = items.reduce((acc, item) => {
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

    return (
        <main className="p-5 flex flex-col gap-6 max-w-md mx-auto pt-12 pb-32 min-h-screen">
             <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black tracking-tight text-primary">
                    Edytor Zestawu
                </h1>
                <div className="flex items-center gap-2">
                    {editingSet && items.length > 0 && (
                        <button 
                            onClick={handleDelete}
                            className="p-2 glass rounded-full text-red-500 hover:bg-red-500/10 active:scale-90"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                    <button 
                        type="button"
                        onClick={handleCancel}
                        className="p-2 glass rounded-full text-muted-foreground active:scale-90"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Compact Header with Name and Totals */}
            <div className="glass p-4 rounded-[32px] flex flex-col gap-4">
                 <input 
                    type="text" 
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Nazwa Zestawu"
                    className="w-full bg-transparent text-xl font-bold p-2 outline-none border-b border-white/10 focus:border-primary text-center placeholder:text-muted-foreground/30"
                    autoFocus
                />
                
                <div className="flex items-center justify-between px-2">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Kalorie</span>
                        <span className="text-xl font-black text-primary">{Math.round(totals.calories)}</span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <MacroStat val={Math.round(totals.protein)} type="protein" />
                    <MacroStat val={Math.round(totals.fat)} type="fat" />
                    <MacroStat val={Math.round(totals.carbs)} type="carbs" />
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center px-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Produkty ({items.length})</span>
                    <button 
                        onClick={handleAddProduct}
                        className="text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg active:scale-95"
                    >
                        <Plus size={12} /> Dodaj produkt
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="glass p-8 rounded-[32px] flex flex-col items-center justify-center gap-2 text-center border-dashed border-2 border-white/10">
                        <Layers size={32} className="text-muted-foreground/30" />
                        <span className="text-sm font-bold text-muted-foreground/50">Zestaw jest pusty</span>
                        <button onClick={handleAddProduct} className="mt-2 text-primary font-bold text-sm">Dodaj pierwszy produkt</button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {items.map((item, idx) => {
                             const product = products.find(p => p.id === item.productId);
                             if (!product) return null;
                             return (
                                 <div key={idx} className="glass p-3 rounded-2xl flex items-center justify-between">
                                     <div className="flex flex-col">
                                         <span className="font-bold text-sm">{product.name}</span>
                                         <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.weight}g • {Math.round(product.calories * (item.weight/100))} kcal</span>
                                     </div>
                                     <button onClick={() => handleRemoveItem(idx)} className="p-2 text-red-500/50 hover:text-red-500">
                                         <Trash2 size={16} />
                                     </button>
                                 </div>
                             );
                        })}
                    </div>
                )}
            </div>

            <button 
                onClick={handleSave}
                className="h-14 rounded-full font-bold text-white bg-primary shadow-lg shadow-primary/25 active:scale-95 flex items-center justify-center gap-2 mt-auto"
            >
                <Save size={20} /> Zapisz
            </button>
        </main>
    );
}

function MacroStat({ val, type }: { val: number, type: 'protein' | 'fat' | 'carbs' }) {
    const colors = {
        protein: "text-protein",
        fat: "text-fat",
        carbs: "text-carbs"
    };
    
    return (
        <div className="flex flex-col items-center gap-0.5">
            <MacroIcon type={type} size={14} colored />
            <span className={cn("text-sm font-black", colors[type])}>{val}g</span>
        </div>
    );
}
