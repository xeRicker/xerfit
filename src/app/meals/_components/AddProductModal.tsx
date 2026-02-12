import { motion } from "framer-motion";
import { X, Scale } from "lucide-react";
import { Product } from "@/lib/store";
import { MacroIcon } from "@/components/MacroIcon";

interface AddProductModalProps {
    product: Product;
    onClose: () => void;
    weight: string;
    onWeightChange: (val: string) => void;
    onAdd: () => void;
    category: string | null;
}

export function AddProductModal({ product, onClose, weight, onWeightChange, onAdd, category }: AddProductModalProps) {
    const w = Number(weight) || 0;
    const ratio = w / 100;
    
    const labelMap: Record<string, string> = {
        breakfast: 'Śniadania',
        lunch: 'Obiadu',
        dinner: 'Kolacji',
        snack: 'Przekąski'
    };

    return (
        <>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
                initial={{ y: "100%" }} 
                animate={{ y: 0 }} 
                exit={{ y: "100%" }}
                className="fixed bottom-0 left-0 right-0 z-[70] bg-[#1C1C1E] rounded-t-[32px] p-6 pb-[env(safe-area-inset-bottom,20px)] shadow-2xl border-t border-white/10"
            >
                <div className="max-w-md mx-auto flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-bold">{product.name}</h2>
                        <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-muted-foreground"><X size={20}/></button>
                    </div>
                    
                    <div className="glass p-4 rounded-2xl flex items-center gap-4">
                        <Scale size={24} className="text-primary" />
                        <div className="flex flex-col flex-1">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Ile gramów?</label>
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
                        <span className="text-xl font-bold text-muted-foreground">g</span>
                    </div>

                    <div className="flex justify-between text-center px-2">
                         <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl font-black text-primary flex items-center gap-1">
                                <MacroIcon type="calories" size={16} colored />
                                {Math.round(product.calories * ratio)}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">kcal</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-xl font-bold text-protein flex items-center gap-1">
                                <MacroIcon type="protein" size={14} colored />
                                {Math.round(product.protein * ratio)}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Białko</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-xl font-bold text-fat flex items-center gap-1">
                                <MacroIcon type="fat" size={14} colored />
                                {Math.round(product.fat * ratio)}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Tłuszcz</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-xl font-bold text-carbs flex items-center gap-1">
                                <MacroIcon type="carbs" size={14} colored />
                                {Math.round(product.carbs * ratio)}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Węgle</span>
                        </div>
                    </div>

                    <button 
                        onClick={onAdd}
                        className="h-14 rounded-full bg-primary text-white font-bold text-lg shadow-lg shadow-primary/25 active:scale-95 transition-transform capitalize"
                    >
                        Dodaj do {category ? (labelMap[category] || category) : 'posiłku'}
                    </button>
                </div>
            </motion.div>
        </>
    );
}
