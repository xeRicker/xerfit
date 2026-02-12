import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type SortOption = 'name' | 'calories' | 'protein' | 'fat' | 'carbs' | 'scanned';

interface SortDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    sortBy: SortOption;
    onSelect: (option: SortOption) => void;
}

export function SortDropdown({ isOpen, onClose, sortBy, onSelect }: SortDropdownProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-12 w-40 glass bg-[#1C1C1E] rounded-xl p-1 z-50 flex flex-col shadow-xl"
                >
                    {[
                        { id: 'name', label: 'Nazwa' },
                        { id: 'calories', label: 'Kalorie' },
                        { id: 'protein', label: 'Białko' },
                        { id: 'fat', label: 'Tłuszcz' },
                        { id: 'carbs', label: 'Węgle' },
                        { id: 'scanned', label: 'Zeskanowane' }
                    ].map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => { onSelect(opt.id as SortOption); onClose(); }}
                            className={cn(
                                "px-3 py-2 text-sm font-bold text-left rounded-lg transition-colors",
                                sortBy === opt.id ? "bg-primary text-white" : "text-muted-foreground hover:bg-white/5"
                            )}
                        >
                            {opt.label}
                        </button>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
