import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function LoadingOverlay() {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-4"
        >
            <div className="w-16 h-16 rounded-3xl bg-primary/20 flex items-center justify-center">
                <Loader2 className="text-primary animate-spin" size={32} />
            </div>
            <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-black text-white uppercase tracking-widest">Pobieranie danych</span>
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-tighter">Open Food Facts API</span>
            </div>
        </motion.div>
    );
}
