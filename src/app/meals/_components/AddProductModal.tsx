import { useEffect, useState } from "react";
import { useDiaryStore, Product } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Layers, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function AddProductModal({ product, onClose, weight, onWeightChange, onAdd, category, isSetCreation }: any) {
    const { products, sets, updateSet, selectionMode } = useDiaryStore();
    
    // Calculate values based on weight
    const ratio = (Number(weight) || 0) / 100;
    const cals = Math.round(product.calories * ratio);
    const p = Math.round(product.protein * ratio);
    const f = Math.round(product.fat * ratio);
    const c = Math.round(product.carbs * ratio);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
            onClick={onClose}
        >
            <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-[#1C1C1E] w-full max-w-md rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl border-t border-white/10"
                onClick={e => e.stopPropagation()}
            >
                {/* Header with Product Info */}
                <div className="p-6 bg-gradient-to-b from-white/5 to-transparent">
                    <div className="flex justify-between items-start mb-4">
                         <div className="flex flex-col">
                             <h2 className="text-2xl font-black leading-tight pr-8">{product.name}</h2>
                             {product.brand && <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{product.brand}</span>}
                         </div>
                         <button onClick={onClose} className="p-2 bg-white/10 rounded-full active:scale-90 transition-transform">
                             <X size={20} />
                         </button>
                    </div>

                    <div className="flex gap-4">
                        <MacroBadge val={p} label="Białko" color="text-protein" bg="bg-protein/10" />
                        <MacroBadge val={f} label="Tłuszcze" color="text-fat" bg="bg-fat/10" />
                        <MacroBadge val={c} label="Węgle" color="text-carbs" bg="bg-carbs/10" />
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-6 pt-2 flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 bg-black/30 rounded-2xl p-4 flex flex-col gap-1 border border-white/5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Waga (g)</label>
                            <input 
                                type="number" 
                                value={weight}
                                onChange={(e) => onWeightChange(e.target.value)}
                                className="bg-transparent text-3xl font-black outline-none w-full"
                                autoFocus
                                onFocus={(e) => e.target.select()}
                                inputMode="decimal"
                            />
                        </div>
                        <div className="flex flex-col items-end justify-center min-w-[100px]">
                            <span className="text-4xl font-black text-primary tracking-tighter">{cals}</span>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">kcal</span>
                        </div>
                    </div>

                    <button 
                        onClick={onAdd}
                        className="h-14 bg-primary rounded-2xl flex items-center justify-center gap-2 font-black text-white text-lg shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                    >
                        {isSetCreation ? <Layers size={20} /> : <Plus size={24} />}
                        {isSetCreation ? "Dodaj do zestawu" : "Dodaj do dziennika"}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

function MacroBadge({ val, label, color, bg }: any) {
    return (
        <div className={cn("flex flex-col px-3 py-2 rounded-xl flex-1", bg)}>
            <span className={cn("text-lg font-black leading-none", color)}>{val}g</span>
            <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider mt-1">{label}</span>
        </div>
    );
}
