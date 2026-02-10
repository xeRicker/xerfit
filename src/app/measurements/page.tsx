"use client";

import { useDiaryStore, Measurement } from "@/lib/store";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Ruler, Weight, Save, Trash2, TrendingUp, Plus, X, ChevronRight, Scale, BicepsFlexed, Shirt, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { pl } from "date-fns/locale";

export default function MeasurementsPage() {
    const { measurements, addMeasurement, deleteMeasurement, activeProfileId } = useDiaryStore();
    const [isAdding, setIsAdding] = useState(false);

    // Filter measurements for active profile and sort by date descending
    const profileMeasurements = useMemo(() => 
        measurements
            .filter(m => m.profileId === activeProfileId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [measurements, activeProfileId]);

    const latest = profileMeasurements[0];
    const previous = profileMeasurements[1];

    // Prepare chart data (reverse to chronological order)
    const chartData = useMemo(() => 
        [...profileMeasurements].reverse().map(m => ({
            date: m.date,
            value: m.weight
        })), 
    [profileMeasurements]);

    return (
        <main className="p-5 flex flex-col gap-6 max-w-md mx-auto pt-12 min-h-screen pb-32">
            <div className="flex flex-col">
                <h1 className="text-3xl font-black tracking-tight text-primary">Pomiary Ciała</h1>
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mt-1">Śledź swój progres</p>
            </div>

            {/* Weight Trend Chart */}
            <TrendChart data={chartData} color="#FF6A00" label="Waga (kg)" />

            {/* Compact Latest Summary */}
            {latest && (
                <div className="glass p-5 rounded-3xl flex flex-col gap-4 relative overflow-hidden">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Ostatni pomiar: {format(new Date(latest.date), 'd MMM', { locale: pl })}</span>
                        <div className="flex items-center gap-1 text-primary">
                            <Scale size={14} />
                            <span className="text-lg font-black">{latest.weight}kg</span>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-5 gap-2">
                        <CompactStat val={latest.waist} icon={Shirt} label="Pas" />
                        <CompactStat val={latest.chest} icon={Activity} label="Klata" />
                        <CompactStat val={latest.biceps} icon={BicepsFlexed} label="Bic" />
                        <CompactStat val={latest.thigh} icon={Ruler} label="Udo" />
                        <CompactStat val={latest.calf} icon={Ruler} label="Łydka" />
                     </div>
                </div>
            )}

            {/* Add Button */}
            <button 
                onClick={() => setIsAdding(true)}
                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 font-bold text-primary active:scale-95 transition-transform hover:bg-white/10"
            >
                <Plus size={20} /> Dodaj nowy pomiar
            </button>

            {/* Compact History List */}
            <div className="flex flex-col gap-3">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-2">Historia</h3>
                {profileMeasurements.map((m) => (
                    <motion.div 
                        key={m.id}
                        layoutId={m.id}
                        className="glass p-3 rounded-2xl flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center justify-center w-10 h-10 bg-black/20 rounded-xl">
                                <span className="font-bold text-xs text-white">{format(new Date(m.date), 'dd')}</span>
                                <span className="text-[9px] font-medium text-muted-foreground uppercase">{format(new Date(m.date), 'MMM', { locale: pl })}</span>
                            </div>
                            <span className="font-black text-white text-lg">{m.weight}<span className="text-xs text-muted-foreground ml-0.5">kg</span></span>
                        </div>
                        
                        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide mask-gradient-r">
                            <DataBadge val={m.waist} label="Pas" />
                            <DataBadge val={m.chest} label="Klata" />
                            <DataBadge val={m.biceps} label="Bic" />
                            <DataBadge val={m.thigh} label="Udo" />
                        </div>

                        <button 
                            onClick={() => deleteMeasurement(m.id)}
                            className="p-2 text-muted-foreground/50 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </motion.div>
                ))}
                {profileMeasurements.length === 0 && (
                     <div className="text-center py-8 text-muted-foreground text-sm opacity-50">
                        Brak historii pomiarów
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {isAdding && (
                    <MeasurementForm onClose={() => setIsAdding(false)} onSave={addMeasurement} />
                )}
            </AnimatePresence>
        </main>
    );
}

function CompactStat({ val, icon: Icon, label }: { val?: number, icon: any, label: string }) {
    if (!val) return (
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-black/10 opacity-30">
            <Icon size={12} />
            <span className="text-[8px] uppercase font-bold mt-1">-</span>
        </div>
    );
    return (
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-black/20">
            <Icon size={12} className="text-muted-foreground mb-1" />
            <span className="text-xs font-black text-white">{val}</span>
            <span className="text-[8px] uppercase font-bold text-muted-foreground">{label}</span>
        </div>
    );
}

function DataBadge({ val, label }: { val?: number, label: string }) {
    if (!val) return null;
    return (
        <div className="flex flex-col items-center px-2 border-r border-white/5 last:border-0 min-w-[40px]">
            <span className="text-xs font-bold text-white">{val}</span>
            <span className="text-[8px] text-muted-foreground uppercase">{label}</span>
        </div>
    );
}

function TrendChart({ data, color, label }: { data: { date: string, value: number }[], color: string, label: string }) {
    if (data.length < 2) return null;

    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1; // Avoid division by zero

    // Normalize points to 0-100 range for SVG
    const points = values.map((v, i) => {
        const x = (i / (values.length - 1)) * 100;
        const y = 100 - ((v - min) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    const trend = values[values.length - 1] - values[0];
    const isUp = trend > 0;

    return (
        <div className="glass p-6 rounded-[32px] flex flex-col gap-4 relative overflow-hidden h-48 justify-between">
            <div className="flex items-center justify-between z-10">
                 <div className="flex items-center gap-2 text-muted-foreground text-[11px] font-bold uppercase tracking-wider">
                    <TrendingUp size={14} className="text-primary" />
                    Trend Wagi
                </div>
                <div className={cn("flex items-center gap-1 text-sm font-bold", isUp ? "text-error" : "text-success")}>
                    {trend > 0 ? '+' : ''}{trend.toFixed(1)}kg
                    <span className="text-[10px] text-muted-foreground font-medium uppercase ml-1">Lącznie</span>
                </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 top-12 px-2 pb-2">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                     {/* Gradient Fill */}
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                            <stop offset="100%" stopColor={color} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path 
                        d={`M0,100 L0,${100 - ((values[0] - min) / range) * 100} ${points.replace(/,/g, ' ')} L100,100 Z`} 
                        fill="url(#chartGradient)" 
                    />
                    {/* Line */}
                    <motion.polyline 
                        points={points}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                    {/* Points */}
                    {data.map((d, i) => {
                         const x = (i / (values.length - 1)) * 100;
                         const y = 100 - ((d.value - min) / range) * 100;
                         return (
                            <motion.circle 
                                key={i}
                                cx={x} cy={y} r="1.5"
                                fill="white"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 + i * 0.05 }}
                            />
                         );
                    })}
                </svg>
            </div>
            
            <div className="flex justify-between z-10 text-[9px] font-bold text-muted-foreground uppercase">
                <span>Start: {values[0]}kg</span>
                <span>Teraz: {values[values.length - 1]}kg</span>
            </div>
        </div>
    );
}

function MeasurementForm({ onClose, onSave }: { onClose: () => void, onSave: (m: Omit<Measurement, 'id' | 'profileId'>) => void }) {
    const [form, setForm] = useState({
        date: format(new Date(), 'yyyy-MM-dd'),
        weight: '',
        chest: '',
        biceps: '',
        waist: '',
        thigh: '',
        calf: ''
    });

    const handleSubmit = () => {
        if (!form.weight) return;
        
        onSave({
            date: form.date,
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
                        <h2 className="text-2xl font-bold">Nowy Pomiar</h2>
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

function Input({ label, value, onChange, icon: Icon, autoFocus, required }: any) {
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
            />
        </div>
    );
}