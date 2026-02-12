import { useState } from "react";
import { UserProfile } from "@/lib/store";
import { Save, Trash2, X, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { COLORS, AVATARS, AVATAR_MAP } from "./constants";

interface ProfileEditorProps {
    profile: UserProfile;
    onClose: () => void;
    onSave: (data: Partial<UserProfile>) => void;
    onDelete?: () => void;
    isNew?: boolean;
}

export function ProfileEditor({ profile, onClose, onSave, onDelete, isNew }: ProfileEditorProps) {
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
