import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { ICON_NAMES } from "./constants";

interface IconPickerModalProps {
    onClose: () => void;
    onSelect: (icon: string) => void;
    currentIcon: string;
}

export function IconPickerModal({ onClose, onSelect, currentIcon }: IconPickerModalProps) {
    const [search, setSearch] = useState("");
    
    const filteredIcons = useMemo(() => {
        if (!search) return ICON_NAMES;
        return ICON_NAMES.filter(name => name.toLowerCase().includes(search.toLowerCase()));
    }, [search]);

    return (
        <>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80]"
            />
            <motion.div 
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                className="fixed inset-x-0 bottom-0 top-20 z-[90] bg-[#1C1C1E] rounded-t-[32px] flex flex-col border-t border-white/10"
            >
                <div className="p-6 flex flex-col gap-4 border-b border-white/5">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Wybierz ikonę</h2>
                        <button onClick={onClose} className="p-2 bg-white/5 rounded-full"><X size={20}/></button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input 
                            type="text" 
                            placeholder="Szukaj ikony..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/20 rounded-xl pl-10 pr-4 py-3 font-medium outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                        {filteredIcons.map(name => {
                            const Icon = (LucideIcons as any)[name];
                            if (!Icon) return null;
                            const isSelected = currentIcon === name;
                            return (
                                <button
                                    key={name}
                                    onClick={() => onSelect(name)}
                                    className={cn(
                                        "aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all",
                                        isSelected ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105" : "bg-white/5 text-muted-foreground hover:bg-white/10 active:scale-95"
                                    )}
                                >
                                    <Icon size={24} />
                                    <span className="text-[9px] font-bold uppercase truncate w-full px-1">{name}</span>
                                </button>
                            );
                        })}
                    </div>
                    {filteredIcons.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            Brak wyników
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    );
}
