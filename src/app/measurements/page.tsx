"use client";

import { useDiaryStore, Measurement } from "@/lib/store";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Ruler, Trash2, Plus, Scale, BicepsFlexed, Shirt, Activity, ArrowDown, ArrowUp } from "lucide-react";
import { pl } from "date-fns/locale";

import { TrendChart } from "./_components/TrendChart";
import { CompactStat } from "./_components/CompactStat";
import { ListStat } from "./_components/ListStat";
import { MeasurementForm } from "./_components/MeasurementForm";

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
        <main className="flex flex-col h-screen overflow-hidden relative">
            <div className="pt-12 px-5 pb-4">
                <h1 className="text-3xl font-black tracking-tight text-primary">Pomiary Ciała</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-[160px] flex flex-col gap-6 scrollbar-hide">
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
                    <div className="flex justify-center items-center gap-4 mt-4 pb-4">
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
            </div>

            {/* Fixed Bottom Action Button */}
            <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+90px)] left-0 right-0 p-4 px-5 z-40 bg-gradient-to-t from-background to-transparent pt-10 pointer-events-none flex justify-end">
                <button 
                    onClick={() => { setEditingId(null); setIsAdding(true); }}
                    className="pointer-events-auto h-14 px-6 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/25 active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    <Plus size={24} /> Dodaj pomiar
                </button>
            </div>

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
