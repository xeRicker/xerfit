"use client";

import { useDiaryStore, Measurement } from "@/lib/store";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Ruler, Save, Trash2, TrendingUp, Plus, X, Scale, BicepsFlexed, Shirt, Activity, ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { pl } from "date-fns/locale";
import { LucideIcon } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function MeasurementsPage() {
    const { measurements, addMeasurement, updateMeasurement, deleteMeasurement, activeProfileId } = useDiaryStore();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);

    // Memoize filtered and sorted measurements
    const sortedMeasurements = useMemo(() => {
        return measurements
            .filter(m => m.profileId === activeProfileId)
            .sort((a, b) => {
                const getDate = (d: string) => {
                    // Try standard date parsing first
                    let time = new Date(d).getTime();
                    if (!isNaN(time)) return time;
                    
                    // Try parsing DD.MM.YYYY format common in Poland
                    const parts = d.split('.');
                    if (parts.length === 3) {
                        // parts[0] = day, parts[1] = month, parts[2] = year
                        // New Date(year, monthIndex, day)
                        time = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
                        if (!isNaN(time)) return time;
                    }
                    return 0; // Fallback for invalid dates
                };

                const dateA = getDate(a.date);
                const dateB = getDate(b.date);
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            });
    }, [measurements, activeProfileId, sortOrder]);

    // Memoize paginated measurements
    const paginatedMeasurements = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return sortedMeasurements.slice(start, end);
    }, [sortedMeasurements, currentPage]);

    const totalPages = Math.ceil(sortedMeasurements.length / ITEMS_PER_PAGE);

    // Latest measurement should always be the most recent by date, regardless of list sorting
    const latest = useMemo(() => {
        const chronological = [...measurements]
            .filter(m => m.profileId === activeProfileId)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return chronological[chronological.length - 1];
    }, [measurements, activeProfileId]);

    // Chart data should always be chronological (oldest to newest) regardless of list sorting
    const chartData = useMemo(() => {
        // ... existing chart logic
        const chronological = [...measurements]
            .filter(m => m.profileId === activeProfileId)
            .sort((a, b) => {
                const getDate = (d: string) => {
                    let time = new Date(d).getTime();
                    if (!isNaN(time)) return time;
                    const parts = d.split('.');
                    if (parts.length === 3) {
                        time = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
                        if (!isNaN(time)) return time;
                    }
                    return 0;
                };
                return getDate(a.date) - getDate(b.date);
            });

        return chronological.map(m => ({
            date: m.date,
            value: m.weight
        })).slice(-30); // show last 30 entries
    }, [measurements, activeProfileId]);

    const handleEdit = (m: Measurement) => {
        setEditingId(m.id);
        setIsAdding(true);
    };

    const handleSortToggle = () => {
        setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
        setCurrentPage(1); // Reset to first page on sort change
    };

    return (
        <main className="p-5 flex flex-col gap-6 max-w-md mx-auto pt-12 min-h-screen pb-32">
            <div className="flex flex-col">
                <h1 className="text-3xl font-black tracking-tight text-primary">Pomiary Ciała</h1>
            </div>

            <TrendChart data={chartData} color="#FF6A00" />

            {latest && (
                <div className="glass p-5 rounded-3xl flex flex-col gap-4 relative overflow-hidden active:scale-[0.98] transition-transform cursor-pointer" onClick={() => handleEdit(latest)}>
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Ostatni pomiar: {format(new Date(latest.date), 'd MMM yyyy', { locale: pl })}</span>
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

            <button 
                onClick={() => { setEditingId(null); setIsAdding(true); }}
                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 font-bold text-primary active:scale-95 transition-transform hover:bg-white/10"
            >
                <Plus size={20} /> Dodaj nowy pomiar
            </button>

            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center ml-2">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Historia</h3>
                    <button onClick={handleSortToggle} className="flex items-center gap-1 text-xs font-bold text-primary glass p-2 rounded-lg active:scale-95">
                        {sortOrder === 'desc' ? <ArrowDown size={14}/> : <ArrowUp size={14} />}
                        {sortOrder === 'desc' ? 'Najnowsze' : 'Najstarsze'}
                    </button>
                </div>

                {paginatedMeasurements.length > 0 ? paginatedMeasurements.map((m) => (
                    <motion.div 
                        key={m.id}
                        layoutId={m.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass p-3 rounded-2xl flex items-center justify-between active:scale-[0.99] transition-transform cursor-pointer"
                        onClick={() => handleEdit(m)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center justify-center w-10 h-10 bg-black/20 rounded-xl">
                                <span className="font-bold text-xs text-white">{format(new Date(m.date), 'dd')}</span>
                                <span className="text-[9px] font-medium text-muted-foreground uppercase">{format(new Date(m.date), 'MMM', { locale: pl })}</span>
                            </div>
                            <span className="font-black text-white text-lg">{m.weight}<span className="text-xs text-muted-foreground ml-0.5">kg</span></span>
                        </div>
                        
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide mask-gradient-r max-w-[180px]">
                            <ListStat val={m.waist} icon={Shirt} />
                            <ListStat val={m.chest} icon={Activity} />
                            <ListStat val={m.biceps} icon={BicepsFlexed} />
                            <ListStat val={m.thigh} icon={Ruler} />
                        </div>

                        <button 
                            onClick={(e) => { e.stopPropagation(); if(confirm('Na pewno usunąć ten pomiar?')) deleteMeasurement(m.id); }}
                            className="p-2 text-muted-foreground/50 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </motion.div>
                )) : (
                     <div className="text-center py-8 text-muted-foreground text-sm opacity-50">
                        Brak historii pomiarów dla tego profilu.
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-4">
                    <button
                        onClick={() => setCurrentPage(p => p - 1)}
                        disabled={currentPage === 1}
                        className="glass px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-30 disabled:pointer-events-none active:scale-95"
                    >
                        Poprzednia
                    </button>
                    <span className="text-sm font-bold text-muted-foreground">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => p + 1)}
                        disabled={currentPage === totalPages}
                        className="glass px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-30 disabled:pointer-events-none active:scale-95"
                    >
                        Następna
                    </button>
                </div>
            )}

            <AnimatePresence>
                {isAdding && (
                    <MeasurementForm 
                        onClose={() => { setIsAdding(false); setEditingId(null); }} 
                        onSave={(data) => {
                            if (editingId) {
                                updateMeasurement(editingId, data);
                            } else {
                                const { timestamp, ...rest } = data;
                                addMeasurement(rest);
                            }
                        }}
                        initialData={editingId ? measurements.find(m => m.id === editingId) : undefined}
                    />
                )}
            </AnimatePresence>

        </main>
    );
}

function CompactStat({ val, icon: Icon, label }: { val?: number, icon: LucideIcon, label: string }) {
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

function ListStat({ val, icon: Icon }: { val?: number, icon: LucideIcon }) {
    if (!val) return null;
    return (
        <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-black/20 min-w-[32px]">
            <Icon size={10} className="text-muted-foreground mb-0.5" />
            <span className="text-[10px] font-black text-white leading-none">{val}</span>
        </div>
    );
}

function TrendChart({ data, color }: { data: { date: string, value: number }[], color: string }) {
    if (data.length < 2) return (
        <div className="glass p-6 rounded-[32px] h-48 flex flex-col items-center justify-center gap-2">
            <TrendingUp size={24} className="text-muted-foreground/50" />
            <span className="text-xs font-bold text-muted-foreground/50">Za mało danych do pokazania trendu</span>
        </div>
    );

    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

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
                    Trend Wagi (ostatnie {data.length} pomiarów)
                </div>
                <div className={cn("flex items-center gap-1 text-sm font-bold", isUp ? "text-error" : "text-success")}>
                    {trend > 0 ? '+' : ''}{trend.toFixed(1)}kg
                    <span className="text-[10px] text-muted-foreground font-medium uppercase ml-1">Łącznie</span>
                </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 top-12 px-2 pb-2">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                            <stop offset="100%" stopColor={color} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <motion.path 
                        d={`M0,100 L${points.split(' ')[0]} ${points} L100,${points.split(' ').pop()?.split(',')[1]} L100,100 Z`}
                        fill="url(#chartGradient)" 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    />
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
                </svg>
            </div>
            
            <div className="flex justify-between z-10 text-[9px] font-bold text-muted-foreground uppercase">
                <span>Start: {values[0]}kg</span>
                <span>Teraz: {values[values.length - 1]}kg</span>
            </div>
        </div>
    );
}

function MeasurementForm({ onClose, onSave, initialData }: { onClose: () => void, onSave: (m: Omit<Measurement, 'id' | 'profileId'>) => void, initialData?: Measurement }) {
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
