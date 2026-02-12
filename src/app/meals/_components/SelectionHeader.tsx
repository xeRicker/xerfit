import { motion } from "framer-motion";
import { X } from "lucide-react";

interface SelectionHeaderProps {
    category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null;
    onClose: () => void;
}

export function SelectionHeader({ category, onClose }: SelectionHeaderProps) {
    if (!category) return null;

    const labelMap: Record<string, string> = {
        breakfast: 'Śniadania',
        lunch: 'Obiadu',
        dinner: 'Kolacji',
        snack: 'Przekąski'
    };

    return (
        <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 glass bg-primary/20 backdrop-blur-xl border-b border-primary/20 p-4 flex items-center justify-between"
        >
            <button onClick={onClose} className="p-2 bg-white/10 rounded-full"><X size={20}/></button>
            <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase text-primary tracking-widest leading-none">Dodawanie do</span>
                <span className="text-lg font-black capitalize">{labelMap[category] || category}</span>
            </div>
            <div className="w-10" />
        </motion.div>
    );
}
