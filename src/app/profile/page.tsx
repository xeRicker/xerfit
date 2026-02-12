"use client";

import { useDiaryStore, UserProfile } from "@/lib/store";
import { 
    User, Edit2, Users
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ProfileList } from "./_components/ProfileList";
import { ProfileEditor } from "./_components/ProfileEditor";
import { StatsEditor } from "./_components/StatsEditor";
import { AVATAR_MAP } from "./_components/constants";

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
          <ProfileList 
            profiles={profiles}
            activeProfileId={activeProfileId}
            onSelect={handleSelect}
            onEdit={(p) => { setEditingProfile(p); setView('edit'); }}
            onCreate={handleCreateNew}
            onClose={() => setView('stats')}
          />
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
