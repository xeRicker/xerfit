import { motion } from "framer-motion";
import { X, Scale, Trash2, Edit2 } from "lucide-react";

interface EditEntryModalProps {
    onClose: () => void;
    weight: string;
    onWeightChange: (val: string) => void;
    onSave: () => void;
    onDelete: () => void;
}

export function EditEntryModal({ onClose, weight, onWeightChange, onSave, onDelete }: EditEntryModalProps) {
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
                className="fixed bottom-0 left-0 right-0 z-[70] bg-[#1C1C1E] rounded-t-[32px] p-6 pb-[calc(env(safe-area-inset-bottom,20px)+24px)] shadow-2xl border-t border-white/10"
            >
                <div className="max-w-md mx-auto flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-bold">Edytuj Posiłek</h2>
                        <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-muted-foreground"><X size={20}/></button>
                    </div>

                     <div className="glass p-4 rounded-2xl flex items-center gap-4">
                        <Scale size={24} className="text-primary" />
                        <div className="flex flex-col flex-1">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Nowa waga (g)</label>
                            <input 
                                type="number" 
                                value={weight}
                                onChange={(e) => onWeightChange(e.target.value)}
                                className="bg-transparent text-3xl font-black outline-none w-full"
                                autoFocus
                                onFocus={(e) => e.target.select()}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={onDelete}
                            className="h-14 rounded-full bg-red-500/20 text-red-500 font-bold text-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                        >
                            <Trash2 size={20} /> Usuń
                        </button>
                        <button 
                            onClick={onSave}
                            className="h-14 rounded-full bg-primary text-white font-bold text-lg shadow-lg shadow-primary/25 active:scale-95 transition-transform flex items-center justify-center gap-2"
                        >
                            <Edit2 size={20} /> Zapisz
                        </button>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
