"use client";

import { useDiaryStore, UserProfile } from "@/lib/store";
import { 
    User, Target, Save, Calculator, Plus, Edit2, Trash2, Check, X, 
    Smile, Trophy, Dumbbell, Heart, Star, Flashlight, Zap, Flame, Apple, Beef, Fish, ChefHat, Utensils, 
    ChevronLeft, Users
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MacroIcon } from "@/components/MacroIcon";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingButton } from "@/components/FloatingButton";

const COLORS = [
    "bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-red-500", 
    "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-500", "bg-cyan-500"
];

const AVATARS = [
    "User", "Zap", "Flame", "Apple", "Beef", "Fish", "ChefHat", "Utensils", 
    "Smile", "Trophy", "Dumbbell", "Heart", "Star", "Target", "Flashlight"
];
const AVATAR_MAP: Record<string, React.ElementType> = {
    User, Zap, Flame, Apple, Beef, Fish, ChefHat, Utensils, 
    Smile, Trophy, Dumbbell, Heart, Star, Target, Flashlight
};

type ViewMode = 'list' | 'edit' | 'stats' | 'create';

export default function ProfilePage() {
  const { profiles, activeProfileId, setActiveProfile, addProfile, updateProfile, deleteProfile, calculateTargets } = useDiaryStore();
  
  const [view, setView] = useState<ViewMode>('stats');
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  if (!activeProfile) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSelect = (id: string) => {
    setActiveProfile(id);
    setView('stats');
  };

  const handleCreateNew = () => {
    setEditingProfile({
        id: 'new-profile',
        name: "Nowy Profil",
        icon: "User",
        color: "bg-blue-500",
        stats: { age: 25, weight: 70, height: 175, gender: 'male', activityLevel: 1.375, goal: 'maintain', bodyFat: undefined },
        targets: { calories: 0, protein: 0, fat: 0, carbs: 0 }
    });
    setView('create');
  };

  if (view === 'list') {
      return (
          <main className="p-5 flex flex-col gap-8 max-w-md mx-auto pt-20 min-h-screen pb-32">
              <div className="flex justify-between items-center">
                  <button onClick={() => setView('stats')} className="p-2 glass rounded-full"><ChevronLeft size={20}/></button>
                  <h1 className="text-2xl font-black tracking-tight">Wybierz Profil</h1>
                  <div className="w-10" />
              </div>

              <div className="grid grid-cols-2 gap-6 px-4">
                <AnimatePresence>
                  {profiles.map((p) => (
                      <motion.div 
                        key={p.id}
                        layoutId={p.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-3 group relative"
                      >
                          <button 
                            onClick={() => handleSelect(p.id)}
                            className={cn(
                                "w-32 h-32 rounded-3xl flex items-center justify-center text-white shadow-2xl transition-all duration-300",
                                p.color,
                                activeProfileId === p.id ? "ring-4 ring-white ring-offset-4 ring-offset-black scale-105" : "opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0 hover:scale-105"
                            )}
                          >
                              {(() => {
                                  const Icon = AVATAR_MAP[p.icon] || User;
                                  return <Icon size={64} strokeWidth={2.5} />;
                              })()}
                          </button>
                          <div className="flex flex-col items-center">
                              <span className="font-bold text-lg">{p.name}</span>
                              {activeProfileId === p.id && <span className="text-[10px] font-black uppercase text-primary tracking-widest mt-0.5">Aktywny</span>}
                          </div>

                          <button 
                            onClick={() => { setEditingProfile(p); setView('edit'); }}
                            className="absolute -top-2 -right-2 p-2 glass rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                              <Edit2 size={14} />
                          </button>
                      </motion.div>
                  ))}
                  </AnimatePresence>
              </div>

              <FloatingButton onClick={handleCreateNew} icon={Plus} />
          </main>
      );
  }

  if (view === 'edit' && editingProfile) {
      return (
          <ProfileEditor 
            profile={editingProfile} 
            onClose={() => setView('list')} 
            onSave={(data: Partial<UserProfile>) => { updateProfile(editingProfile.id, data); setView('list'); }}
            onDelete={() => { deleteProfile(editingProfile.id); setView('list'); }}
          />
      );
  }

  if (view === 'create' && editingProfile) {
    return (
        <ProfileEditor 
          profile={editingProfile} 
          onClose={() => setView('list')} 
          onSave={(data: Partial<UserProfile>) => { 
              const newId = addProfile(data as Omit<UserProfile, 'id'>); 
              setActiveProfile(newId);
              setView('stats'); 
          }}
          isNew={true}
        />
    );
  }

  if (view === 'stats') {
      return (
        <main className="p-5 flex flex-col gap-6 max-w-md mx-auto pt-12 min-h-screen pb-32">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", activeProfile.color)}>
                        {(() => {
                            const Icon = AVATAR_MAP[activeProfile.icon] || User;
                            return <Icon size={24} />;
                        })()}
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-black tracking-tight leading-none">{activeProfile.name}</h1>
                        <button 
                            onClick={() => { setEditingProfile(activeProfile); setView('edit'); }}
                            className="text-[10px] font-bold text-primary uppercase mt-1 flex items-center gap-1"
                        >
                            <Edit2 size={10} /> Edytuj profil
                        </button>
                    </div>
                </div>
                <button 
                    onClick={() => setView('list')} 
                    className="p-3 glass rounded-2xl text-primary active:scale-95 transition-transform"
                >
                    <Users size={20} />
                </button>
            </div>
            
            <StatsEditor 
                profile={activeProfile} 
                onSave={(stats: UserProfile['stats']) => { 
                    updateProfile(activeProfile.id, { stats }); 
                    calculateTargets(activeProfile.id);
                }} 
            />
        </main>
      );
  }

  return null;
}

interface ProfileEditorProps {
    profile: UserProfile;
    onClose: () => void;
    onSave: (data: Partial<UserProfile>) => void;
    onDelete?: () => void;
    isNew?: boolean;
}

function ProfileEditor({ profile, onClose, onSave, onDelete, isNew }: ProfileEditorProps) {
    const [name, setName] = useState(profile.name);
    const [color, setColor] = useState(profile.color);
    const [icon, setIcon] = useState(profile.icon || "User");

    const SelectedIcon = AVATAR_MAP[icon] || User;

    return (
        <main className="p-5 flex flex-col gap-8 max-w-md mx-auto pt-20 min-h-screen pb-32">
            <div className="flex justify-between items-center">
                <button onClick={onClose} className="p-2 glass rounded-full"><X size={20}/></button>
                <h2 className="text-2xl font-black">{isNew ? 'Dodaj Nowy Profil' : 'Edytuj Profil'}</h2>
                <div className="w-10" />
            </div>

            <div className="flex flex-col items-center gap-6">
                <div className={cn("w-32 h-32 rounded-[32px] flex items-center justify-center text-white shadow-2xl transition-colors", color)}>
                    <SelectedIcon size={64} strokeWidth={2.5} />
                </div>

                <div className="w-full flex flex-col gap-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase ml-2 tracking-widest">Nazwa</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-black/20 border border-white/10 rounded-2xl p-4 text-xl font-bold outline-none focus:border-primary"
                    />
                </div>

                <div className="w-full flex flex-col gap-3">
                    <label className="text-xs font-bold text-muted-foreground uppercase ml-2 tracking-widest">Ikona</label>
                    <div className="grid grid-cols-5 gap-3 p-4 bg-black/20 rounded-2xl max-h-48 overflow-y-auto">
                        {AVATARS.map(a => {
                            const Icon = AVATAR_MAP[a];
                            return (
                                <button 
                                    key={a}
                                    onClick={() => setIcon(a)}
                                    className={cn("aspect-square flex items-center justify-center rounded-xl transition-all", icon === a ? "bg-primary text-white scale-110 shadow-lg" : "bg-white/5 text-muted-foreground hover:bg-white/10")}
                                >
                                    <Icon size={24} />
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="w-full flex flex-col gap-3">
                    <label className="text-xs font-bold text-muted-foreground uppercase ml-2 tracking-widest">Kolor</label>
                    <div className="flex flex-wrap gap-3 p-4 bg-black/20 rounded-2xl">
                        {COLORS.map(c => (
                            <button 
                                key={c}
                                onClick={() => setColor(c)}
                                className={cn("w-8 h-8 rounded-full transition-all", c, color === c ? "ring-4 ring-white scale-110 shadow-lg" : "opacity-40 hover:opacity-100")}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-auto flex flex-col gap-3">
                <button onClick={() => onSave({ name, color, icon, stats: profile.stats, targets: profile.targets })} className="h-14 rounded-full bg-primary text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                    <Save size={20} /> {isNew ? 'Utwórz Profil' : 'Zapisz Zmiany'}
                </button>
                {!isNew && onDelete && (
                    <button onClick={onDelete} className="h-14 rounded-full bg-red-500/10 text-red-500 font-bold text-lg flex items-center justify-center gap-2">
                        <Trash2 size={20} /> Usuń profil
                    </button>
                )}
            </div>
        </main>
    );
}

interface StatsEditorProps {
    profile: UserProfile;
    onSave: (stats: UserProfile['stats']) => void;
}

function StatsEditor({ profile, onSave }: StatsEditorProps) {
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
        <div className="flex flex-col gap-6">
             {/* Current Targets Card */}
            <div className="glass p-6 rounded-[32px] flex flex-col gap-4 border-primary/20 bg-primary/5">
                <div className="flex items-center gap-2 text-muted-foreground text-[11px] font-bold uppercase tracking-wider">
                    <Target size={14} className="text-primary" />
                    Obliczone Cele
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-4xl font-black text-white">{profile.targets.calories}</span>
                        <span className="text-sm font-bold text-muted-foreground ml-1">kcal</span>
                    </div>
                    <div className="flex flex-col gap-1 text-xs font-bold text-muted-foreground">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1"><MacroIcon type="protein" size={12} colored /> B:</span>
                            <span className="text-protein font-bold text-sm">{profile.targets.protein}g</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1"><MacroIcon type="fat" size={12} colored /> T:</span>
                            <span className="text-fat font-bold text-sm">{profile.targets.fat}g</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1"><MacroIcon type="carbs" size={12} colored /> W:</span>
                            <span className="text-carbs font-bold text-sm">{profile.targets.carbs}g</span>
                        </div>
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
                    <StatInput label="Wiek" name="age" value={stats.age} onChange={handleChange} />
                    <StatInput label="Waga (kg)" name="weight" value={stats.weight} onChange={handleChange} />
                    <StatInput label="Wzrost" name="height" value={stats.height} onChange={handleChange} />
                </div>
                
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Poziom tkanki tłuszczowej (opcjonalnie %)</label>
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

            <button 
                onClick={() => onSave(stats)} 
                className={cn(
                    "h-14 rounded-full font-black text-lg flex items-center justify-center gap-2 transition-all duration-300",
                    isDirty 
                        ? "bg-gradient-to-r from-[#FF4D00] to-[#FF9500] text-white shadow-lg shadow-[#FF6A00]/30 active:scale-95" 
                        : "bg-white/10 text-muted-foreground grayscale cursor-default"
                )}
            >
                <Calculator size={20} /> Przelicz i Zapisz
            </button>
        </div>
    );
}

interface StatInputProps {
    label: string;
    name: string;
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function StatInput({ label, name, value, onChange }: StatInputProps) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-black text-muted-foreground text-center">{label}</label>
            <input type="number" name={name} value={value} onChange={onChange} className="bg-black/20 rounded-xl p-3 text-center font-bold text-lg outline-none" />
        </div>
    );
}