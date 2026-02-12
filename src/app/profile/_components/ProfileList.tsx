import { UserProfile } from "@/lib/store";
import { ChevronLeft, Edit2, Plus, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AVATAR_MAP } from "./constants";
import { FloatingButton } from "@/components/FloatingButton";

interface ProfileListProps {
    profiles: UserProfile[];
    activeProfileId: string;
    onSelect: (id: string) => void;
    onEdit: (profile: UserProfile) => void;
    onCreate: () => void;
    onClose: () => void;
}

export function ProfileList({ profiles, activeProfileId, onSelect, onEdit, onCreate, onClose }: ProfileListProps) {
    return (
        <main className="p-5 flex flex-col gap-8 max-w-md mx-auto pt-20 min-h-screen pb-32">
            <div className="flex justify-between items-center">
                <button onClick={onClose} className="p-2 glass rounded-full"><ChevronLeft size={20}/></button>
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
                          onClick={() => onSelect(p.id)}
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
                          onClick={() => onEdit(p)}
                          className="absolute -top-2 -right-2 p-2 glass rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                            <Edit2 size={14} />
                        </button>
                    </motion.div>
                ))}
                </AnimatePresence>
            </div>

            <FloatingButton onClick={onCreate} icon={Plus} />
        </main>
    );
}
