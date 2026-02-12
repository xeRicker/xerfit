import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Product } from "@/lib/store";
import { MacroIcon } from "@/components/MacroIcon";
import { Pencil, Trash2, Plus, ScanBarcode } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface ProductListItemProps {
    product: Product;
    isSelectionMode: boolean;
    onSelect: (product: Product) => void;
    onEdit: (e: React.MouseEvent, product: Product) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
}

export function ProductListItem({ product, isSelectionMode, onSelect, onEdit, onDelete }: ProductListItemProps) {
    const Icon = (LucideIcons as any)[product.icon || 'ChefHat'] || LucideIcons.ChefHat;
    const isCustomColor = product.color && !product.color.startsWith('bg-');

    return (
        <motion.div 
            layoutId={`product-${product.id}`}
            onClick={(e) => {
                 if (isSelectionMode) {
                     onSelect(product);
                 } else {
                     onEdit(e, product);
                 }
            }}
            className={cn(
                "glass p-4 rounded-2xl flex items-center gap-4 transition-all relative group overflow-visible",
                isSelectionMode ? "active:scale-[0.98] cursor-pointer ring-1 ring-primary/20" : "cursor-pointer active:scale-[0.98]"
            )}
        >
            <div 
                className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg relative",
                    !isCustomColor && (product.color || "bg-primary")
                )}
                style={isCustomColor ? { backgroundColor: product.color } : {}}
            >
                 <Icon size={20} />
                 {product.is_scanned && (
                    <div className="absolute -bottom-1 -right-1 bg-white text-black rounded-full p-0.5 border-2 border-[#1C1C1E] z-10 shadow-sm">
                        <ScanBarcode size={10} strokeWidth={2.5} />
                    </div>
                 )}
            </div>
            
            <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <span className="font-semibold text-base truncate pr-2">
                        {product.name}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 mt-1">
                        100g
                    </span>
                </div>
                
                <div className="flex justify-between items-end mt-1">
                    <div className="flex flex-col">
                         {product.brand && (
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate mb-1">
                                {product.brand}
                            </span>
                         )}
                        <div className="flex gap-3 text-xs text-muted-foreground font-medium items-center">
                            <span className="flex items-center gap-1 text-protein font-bold"><MacroIcon type="protein" size={12} colored /> {product.protein}g</span>
                            <span className="flex items-center gap-1 text-fat font-bold"><MacroIcon type="fat" size={12} colored /> {product.fat}g</span>
                            <span className="flex items-center gap-1 text-carbs font-bold"><MacroIcon type="carbs" size={12} colored /> {product.carbs}g</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 pl-1">
                         <span className="text-xl font-black text-primary leading-none tracking-tight">{product.calories}</span>
                         <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">kcal</span>
                    </div>
                </div>
            </div>
            
             {!isSelectionMode && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 z-20">
                     <button 
                        onClick={(e) => onDelete(e, product.id)}
                        className="p-1.5 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 transition-colors hover:text-white backdrop-blur-md"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )}

            {isSelectionMode && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Plus size={20} />
                </div>
            )}
        </motion.div>
    );
}
