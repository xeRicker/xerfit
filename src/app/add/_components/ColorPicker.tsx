import { useRef } from "react";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRESET_COLORS } from "./constants";

interface ColorPickerProps {
    color: string;
    onChange: (color: string) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
    const colorInputRef = useRef<HTMLInputElement>(null);
    const isCustomColor = !color.startsWith('bg-');

    return (
        <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Kolor Ikony</label>
            <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide px-1">
                {/* Custom Color Picker First */}
                <div className="relative shrink-0">
                    <input 
                        ref={colorInputRef}
                        type="color"
                        value={isCustomColor ? color : "#FF6A00"}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                    />
                    <button 
                        type="button"
                        onClick={() => colorInputRef.current?.click()}
                        className={cn(
                            "w-10 h-10 rounded-full transition-all border-2 flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
                            isCustomColor ? "border-white scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                        )}
                    >
                        <Palette size={18} className="text-white" />
                    </button>
                </div>

                <div className="w-px h-6 bg-white/10 mx-1 shrink-0" />

                {PRESET_COLORS.map(c => (
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
        </div>
    );
}
