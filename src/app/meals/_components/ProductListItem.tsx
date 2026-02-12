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
                "glass p-4 rounded-2xl flex items-center gap-4 transition-all",
                isSelectionMode ? "active:scale-[0.98] cursor-pointer ring-1 ring-primary/20" : "cursor-default"
            )}
        >
            <div 
                className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg",
                    !isCustomColor && (product.color || "bg-primary")
                )}
                style={isCustomColor ? { backgroundColor: product.color } : {}}
            >
                 <Icon size={18} />
            </div>
            
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <div className="flex flex-col">
                    <span className="font-semibold text-base truncate flex items-center gap-2">
                        {product.name}
                        {product.is_scanned && <ScanBarcode size={14} className="text-blue-400 shrink-0" />}
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
                <div className="flex items-center gap-2">
                    <button 
                        onClick={(e) => onEdit(e, product)}
                        className="p-2 rounded-full bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <Pencil size={18} />
                    </button>
                    <button 
                        onClick={(e) => onDelete(e, product.id)}
                        className="p-2 rounded-full bg-red-500/10 text-red-500/50 hover:bg-red-500/20 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={18} />
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
