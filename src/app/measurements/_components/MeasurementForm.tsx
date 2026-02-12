import { useState } from "react";
import { motion } from "framer-motion";
import { X, Save, Shirt, Activity, BicepsFlexed, LucideIcon } from "lucide-react";
import { format } from "date-fns";
import { Measurement } from "@/lib/store";
import { cn } from "@/lib/utils";

interface MeasurementFormProps {
    onClose: () => void;
    onSave: (m: Omit<Measurement, 'id' | 'profileId'>) => void;
    initialData?: Measurement;
}

export function MeasurementForm({ onClose, onSave, initialData }: MeasurementFormProps) {
    const [form, setForm] = useState({
        date: initialData?.date || format(new Date(), 'yyyy-MM-dd'),
        weight: initialData?.weight.toString() || '',
        chest: initialData?.chest?.toString() || '',
        biceps: initialData?.biceps?.toString() || '',
        waist: initialData?.waist?.toString() || '',
        thigh: initialData?.thigh?.toString() || '',
        calf: initialData?.calf?.toString() || ''
    });

    const handleSubmit = () => {
        if (!form.weight) return;
        
        onSave({
            date: form.date,
            timestamp: new Date(form.date).getTime(),
            weight: Number(form.weight),
            chest: form.chest ? Number(form.chest) : undefined,
            biceps: form.biceps ? Number(form.biceps) : undefined,
            waist: form.waist ? Number(form.waist) : undefined,
            thigh: form.thigh ? Number(form.thigh) : undefined,
            calf: form.calf ? Number(form.calf) : undefined,
        });
        onClose();
    };

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
                className="fixed bottom-0 left-0 right-0 z-[70] bg-[#1C1C1E] rounded-t-[32px] p-6 pb-[calc(env(safe-area-inset-bottom,20px)+24px)] shadow-2xl border-t border-white/10 max-h-[90vh] overflow-y-auto"
            >
                <div className="max-w-md mx-auto flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-bold">{initialData ? 'Edytuj Pomiar' : 'Nowy Pomiar'}</h2>
                        <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-muted-foreground"><X size={20}/></button>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Data</label>
                            <input 
                                type="date" 
                                value={form.date}
                                onChange={e => setForm(f => ({...f, date: e.target.value}))}
                                className="bg-black/20 rounded-xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <Input label="Waga (kg)" value={form.weight} onChange={v => setForm(f => ({...f, weight: v}))} autoFocus required />
                             <Input label="Pas (cm)" value={form.waist} onChange={v => setForm(f => ({...f, waist: v}))} icon={Shirt} />
                             <Input label="Klatka (cm)" value={form.chest} onChange={v => setForm(f => ({...f, chest: v}))} icon={Activity} />
                             <Input label="Biceps (cm)" value={form.biceps} onChange={v => setForm(f => ({...f, biceps: v}))} icon={BicepsFlexed} />
                             <Input label="Udo (cm)" value={form.thigh} onChange={v => setForm(f => ({...f, thigh: v}))} />
                             <Input label="Łydka (cm)" value={form.calf} onChange={v => setForm(f => ({...f, calf: v}))} />
                        </div>
                    </div>
                    <button 
                        onClick={handleSubmit}
                        className="h-14 rounded-full bg-primary text-white font-bold text-lg shadow-lg shadow-primary/25 active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        <Save size={20} /> Zapisz pomiar
                    </button>
                </div>
            </motion.div>
        </>
    );
}

interface InputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    icon?: LucideIcon;
    autoFocus?: boolean;
    required?: boolean;
}

function Input({ label, value, onChange, icon: Icon, autoFocus, required }: InputProps) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1 flex items-center gap-1">
                {Icon && <Icon size={10} />}
                {label}
            </label>
            <input 
                type="number" 
                value={value}
                onChange={e => onChange(e.target.value)}
                className={cn(
                    "bg-black/20 rounded-xl p-4 font-bold text-lg outline-none focus:ring-2 focus:ring-primary/50",
                    required && !value && "ring-1 ring-red-500/50"
                )}
                autoFocus={autoFocus}
                placeholder="0"
                inputMode="decimal"
            />
        </div>
    );
}
