import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Product } from "@/lib/store";
import { MacroIcon } from "@/components/MacroIcon";
import { Trash2, ScanBarcode } from "lucide-react";

interface ProductListItemProps {
    product: Product;
    isSelectionMode: boolean;
    onSelect: (product: Product) => void;
    onEdit: (e: React.MouseEvent, product: Product) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
}

export function ProductListItem({ product, isSelectionMode, onSelect, onEdit, onDelete }: ProductListItemProps) {
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
            whileTap={{ scale: 0.98 }}
            className={cn(
                "glass p-4 rounded-2xl flex items-center justify-between gap-4 transition-all relative group overflow-visible min-h-[72px]",
                isSelectionMode 
                    ? "cursor-pointer ring-2 ring-primary bg-primary/5 shadow-lg shadow-primary/10" // Selection styling
                    : "cursor-pointer hover:bg-white/5"
            )}
        >
            <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-base truncate leading-tight pr-2">
                        {product.name}
                    </span>
                    {product.is_scanned && (
                         <div className="bg-white/10 text-muted-foreground rounded-full p-0.5 border border-white/5 shrink-0">
                            <ScanBarcode size={8} />
                        </div>
                    )}
                </div>
                
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {product.brand && (
                        <>
                            <span className="truncate max-w-[100px]">{product.brand}</span>
                            <span className="text-white/20">•</span>
                        </>
                    )}
                    <span>100g</span>
                </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
                <div className="flex items-baseline gap-0.5">
                    <span className="text-xl font-black text-primary leading-none tracking-tight">{product.calories}</span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">kcal</span>
                </div>

                <div className="flex gap-2 text-[10px] font-bold text-muted-foreground">
                    <span className="flex items-center gap-0.5 text-protein"><MacroIcon type="protein" size={10} colored />{product.protein}</span>
                    <span className="flex items-center gap-0.5 text-fat"><MacroIcon type="fat" size={10} colored />{product.fat}</span>
                    <span className="flex items-center gap-0.5 text-carbs"><MacroIcon type="carbs" size={10} colored />{product.carbs}</span>
                </div>
            </div>
            
             {!isSelectionMode && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 -right-2 z-20 pointer-events-none group-hover:pointer-events-auto">
                     <button 
                        onClick={(e) => onDelete(e, product.id)}
                        className="p-2 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors active:scale-90"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )}
            
            {/* Removed the large Plus icon overlay completely for selection mode to avoid obstruction */}
        </motion.div>
    );
}
