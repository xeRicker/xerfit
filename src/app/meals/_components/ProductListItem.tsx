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
            onClick={() => isSelectionMode ? onSelect(product) : null}
            className={cn(
                "glass p-4 rounded-2xl flex items-center gap-4 transition-all relative group overflow-hidden",
                isSelectionMode ? "active:scale-[0.98] cursor-pointer ring-1 ring-primary/20" : "cursor-default"
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
                    <div className="absolute -top-1 -right-1 bg-white text-black rounded-full p-0.5 border-2 border-[#1C1C1E]">
                        <ScanBarcode size={8} />
                    </div>
                 )}
            </div>
            
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <div className="flex flex-col">
                    <span className="font-semibold text-base truncate flex items-center gap-2">
                        {product.name}
                    </span>
                    {product.brand && <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider truncate">{product.brand}</span>}
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground font-medium items-center mt-1">
                    <span className="flex items-center gap-1 text-primary"><MacroIcon type="calories" size={10} colored /> {product.calories}</span>
                    <span className="flex items-center gap-1 text-protein"><MacroIcon type="protein" size={10} colored /> {product.protein}</span>
                    <span className="flex items-center gap-1 text-fat"><MacroIcon type="fat" size={10} colored /> {product.fat}</span>
                    <span className="flex items-center gap-1 text-carbs"><MacroIcon type="carbs" size={10} colored /> {product.carbs}</span>
                </div>
            </div>
            
            {!isSelectionMode && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 bg-black/40 backdrop-blur-md rounded-full p-1">
                    <button 
                        onClick={(e) => onEdit(e, product)}
                        className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
                    >
                        <Pencil size={16} />
                    </button>
                    <button 
                        onClick={(e) => onDelete(e, product.id)}
                        className="p-2 rounded-full text-red-500 hover:bg-red-500/20 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )}

            {isSelectionMode && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Plus size={20} />
                </div>
            )}
        </motion.div>
    );
}
