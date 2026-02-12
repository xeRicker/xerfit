import { useState, useEffect } from "react";
import { UserProfile } from "@/lib/store";
import { Target, Check, Calculator, Ruler, Weight, User, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { MacroIcon } from "@/components/MacroIcon";
import { motion, AnimatePresence } from "framer-motion";

interface StatsEditorProps {
    profile: UserProfile;
    onSave: (stats: UserProfile['stats']) => void;
}

export function StatsEditor({ profile, onSave }: StatsEditorProps) {
    const [stats, setStats] = useState(profile.stats);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        const hasChanged = JSON.stringify(stats) !== JSON.stringify(profile.stats);
        setIsDirty(hasChanged);
    }, [stats, profile.stats]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setStats((prev) => ({
            ...prev,
            [name]: name === 'gender' || name === 'goal' ? value : Number(value)
        }));
    };

    return (
        <>
            <div className="flex flex-col gap-6 pb-24">
                {/* Current Targets Card (Compact) */}
                <div className="glass p-4 rounded-3xl flex items-center justify-between border-primary/20 bg-primary/5 relative overflow-hidden">
                    <div className="flex flex-col gap-1 z-10">
                        <span className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-1">
                            <Target size={10} /> Twój Cel
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-white tracking-tighter">{profile.targets.calories}</span>
                            <span className="text-xs font-bold text-muted-foreground uppercase">kcal</span>
                        </div>
                    </div>

                    <div className="flex gap-4 z-10 bg-black/20 p-2 rounded-2xl backdrop-blur-sm border border-white/5">
                        <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[10px] font-bold text-protein uppercase flex items-center gap-1">
                                <MacroIcon type="protein" size={10} colored /> B
                            </span>
                            <span className="text-sm font-black text-protein">{profile.targets.protein}</span>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[10px] font-bold text-fat uppercase flex items-center gap-1">
                                <MacroIcon type="fat" size={10} colored /> T
                            </span>
                            <span className="text-sm font-black text-fat">{profile.targets.fat}</span>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[10px] font-bold text-carbs uppercase flex items-center gap-1">
                                <MacroIcon type="carbs" size={10} colored /> W
                            </span>
                            <span className="text-sm font-black text-carbs">{profile.targets.carbs}</span>
                        </div>
                    </div>
                </div>

                <div className="glass p-6 rounded-3xl flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3 p-1 bg-black/20 rounded-xl">
                        {['male', 'female'].map(g => (
                            <button
                                key={g}
                                onClick={() => setStats((s) => ({ ...s, gender: g as 'male' | 'female' }))}
                                className={cn("py-2 rounded-lg text-xs font-black uppercase transition-all", stats.gender === g ? "bg-primary text-white" : "text-muted-foreground")}
                            >
                                {g === 'male' ? 'Mężczyzna' : 'Kobieta'}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <StatInput label="Wiek" name="age" value={stats.age} onChange={handleChange} icon={User} />
                        <StatInput label="Waga" name="weight" value={stats.weight} onChange={handleChange} icon={Weight} suffix="kg" />
                        <StatInput label="Wzrost" name="height" value={stats.height} onChange={handleChange} icon={Ruler} suffix="cm" />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-black text-muted-foreground ml-1 flex items-center gap-1">
                            <Activity size={10} /> Tkanka tłuszczowa %
                        </label>
                        <input 
                            type="number" 
                            name="bodyFat" 
                            value={stats.bodyFat || ""} 
                            onChange={handleChange} 
                            placeholder="np. 15"
                            className="bg-black/20 rounded-xl p-3 text-center font-bold text-lg outline-none focus:ring-2 focus:ring-primary/50" 
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Aktywność</label>
                        <div className="flex flex-col gap-2">
                            {[
                                { v: 1.2, l: 'Brak', d: 'Siedzący tryb życia' },
                                { v: 1.375, l: 'Niska', d: '1-3 treningi / tydz' },
                                { v: 1.55, l: 'Średnia', d: '3-5 treningów / tydz' },
                                { v: 1.725, l: 'Wysoka', d: '6-7 treningów / tydz' }
                            ].map(opt => (
                                <button
                                    key={opt.v}
                                    onClick={() => setStats((s) => ({ ...s, activityLevel: opt.v }))}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-2xl border transition-all",
                                        stats.activityLevel === opt.v 
                                            ? "bg-primary/10 border-primary shadow-lg shadow-primary/10" 
                                            : "bg-black/20 border-transparent text-muted-foreground"
                                    )}
                                >
                                    <div className="flex flex-col items-start">
                                        <span className={cn("font-bold text-sm", stats.activityLevel === opt.v ? "text-primary" : "text-white")}>{opt.l}</span>
                                        <span className="text-[10px] font-medium opacity-60">{opt.d}</span>
                                    </div>
                                    {stats.activityLevel === opt.v && <Check size={18} className="text-primary" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Cel</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[{v:'cut',l:'Redukcja'},{v:'maintain',l:'Utrzymanie'},{v:'bulk',l:'Masa'}].map(o => (
                                <button 
                                    key={o.v}
                                    onClick={() => setStats((s) => ({ ...s, goal: o.v as 'cut' | 'maintain' | 'bulk' }))}
                                    className={cn("py-3 rounded-xl text-[10px] font-black uppercase border border-transparent transition-all", stats.goal === o.v ? "bg-primary/20 border-primary text-primary" : "bg-black/20 text-muted-foreground")}
                                >
                                    {o.l}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isDirty && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-[calc(env(safe-area-inset-bottom)+90px)] left-5 right-5 z-40"
                    >
                        <button 
                            onClick={() => onSave(stats)} 
                            className="w-full h-14 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all duration-300 bg-gradient-to-r from-[#FF4D00] to-[#FF9500] text-white shadow-lg shadow-[#FF6A00]/30 active:scale-95"
                        >
                            <Calculator size={24} /> Przelicz i Zapisz
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

interface StatInputProps {
    label: string;
    name: string;
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    icon: any;
    suffix?: string;
}

function StatInput({ label, name, value, onChange, icon: Icon, suffix }: StatInputProps) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-black text-muted-foreground text-center flex items-center justify-center gap-1">
                <Icon size={10} /> {label}
            </label>
            <div className="relative">
                <input 
                    type="number" 
                    name={name} 
                    value={value} 
                    onChange={onChange} 
                    className="w-full bg-black/20 rounded-xl p-3 text-center font-bold text-lg outline-none" 
                />
                {suffix && (
                    <span className="absolute right-2 bottom-3 text-[10px] font-bold text-muted-foreground">{suffix}</span>
                )}
            </div>
        </div>
    );
}
