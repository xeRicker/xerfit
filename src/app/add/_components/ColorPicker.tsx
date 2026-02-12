import { useRef, useState } from "react";
import { Palette, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

// Expanded palette for "Liquid" feel
const EXTENDED_COLORS = [
    "#FF3B30", "#FF9500", "#FFCC00", "#34C759", "#00C7BE", 
    "#30B0C7", "#32ADE6", "#007AFF", "#5856D6", "#AF52DE", 
    "#FF2D55", "#A2845E", "#8E8E93", "#E5E5EA", "#1C1C1E"
];

// Presets for quick access
const PRESETS = [
    "bg-red-500", "bg-orange-500", "bg-green-500", "bg-blue-500"
];

interface ColorPickerProps {
    color: string;
    onChange: (color: string) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
    const [isCustomOpen, setIsCustomOpen] = useState(false);
    const isCustomColor = !color.startsWith('bg-');

    return (
        <div className="flex flex-col gap-2 relative">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Kolor Ikony</label>
            <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide px-1">
                {/* Custom Color Button */}
                <button 
                    type="button"
                    onClick={() => setIsCustomOpen(true)}
                    className={cn(
                        "w-10 h-10 rounded-full transition-all border-2 flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shrink-0",
                        isCustomColor ? "border-white scale-110 shadow-lg shadow-purple-500/20" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                >
                    <Palette size={18} className="text-white" />
                </button>

                <div className="w-px h-6 bg-white/10 mx-1 shrink-0" />

                {PRESETS.map(c => (
                    <button 
                        type="button"
                        key={c}
                        onClick={() => onChange(c)}
                        className={cn(
                            "w-10 h-10 rounded-full shrink-0 transition-all border-2",
                            c,
                            color === c ? "border-white scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                        )}
                    />
                ))}
            </div>

            {/* Custom Color Modal */}
            <AnimatePresence>
                {isCustomOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
                            onClick={() => setIsCustomOpen(false)}
                        />
                        <motion.div 
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            className="fixed inset-x-0 bottom-0 top-auto z-[90] bg-[#1C1C1E] rounded-t-[32px] border-t border-white/10 p-6 pb-[calc(env(safe-area-inset-bottom)+20px)]"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Wybierz kolor</h3>
                                <button onClick={() => setIsCustomOpen(false)} className="p-2 bg-white/5 rounded-full"><X size={20}/></button>
                            </div>
                            
                            <div className="grid grid-cols-5 gap-4">
                                {EXTENDED_COLORS.map((hex) => (
                                    <button
                                        key={hex}
                                        onClick={() => { onChange(hex); setIsCustomOpen(false); }}
                                        className={cn(
                                            "aspect-square rounded-full transition-all border-4",
                                            color === hex ? "border-white scale-110 shadow-lg" : "border-transparent opacity-80"
                                        )}
                                        style={{ backgroundColor: hex }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
