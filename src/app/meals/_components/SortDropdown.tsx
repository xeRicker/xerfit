import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowUpDown, Flame, ScanBarcode, ArrowDownAZ } from "lucide-react";

export type SortOption = 'name' | 'calories' | 'scanned';

interface SortDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    sortBy: SortOption;
    onSelect: (option: SortOption) => void;
}

export function SortDropdown({ isOpen, onClose, sortBy, onSelect }: SortDropdownProps) {
    if (!isOpen) return null;

    const options = [
        { id: 'name', label: 'Nazwa (A-Z)', icon: ArrowDownAZ, color: 'text-primary' },
        { id: 'scanned', label: 'Zeskanowane', icon: ScanBarcode, color: 'text-white' },
        { id: 'calories', label: 'Kaloryczność', icon: Flame, color: 'text-orange-500' },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-0 mb-3 flex flex-col gap-2 min-w-[200px] z-50 origin-bottom-left"
        >
            <div className="bg-[#1C1C1E] p-2 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-1 backdrop-blur-xl">
                 {options.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => { onSelect(opt.id as SortOption); onClose(); }}
                        className={cn(
                            "p-3 rounded-xl flex items-center gap-3 transition-colors active:scale-95 text-left w-full",
                            sortBy === opt.id ? "bg-white/10" : "hover:bg-white/5"
                        )}
                    >
                        <div className={cn("p-2 rounded-lg bg-white/5", opt.color)}>
                            <opt.icon size={18} />
                        </div>
                        <span className={cn("font-bold text-sm", sortBy === opt.id ? "text-white" : "text-muted-foreground")}>
                            {opt.label}
                        </span>
                    </button>
                 ))}
            </div>
        </motion.div>
    );
}
