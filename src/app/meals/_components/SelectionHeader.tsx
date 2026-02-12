import { ArrowLeft, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDiaryStore } from "@/lib/store";

interface SelectionHeaderProps {
    category: 'breakfast' | 'lunch' | 'dinner' | null;
    onClose: () => void;
    isSetCreation?: boolean;
}

export function SelectionHeader({ category, onClose, isSetCreation }: SelectionHeaderProps) {
    const router = useRouter();
    const { sets } = useDiaryStore(); // Optional: to show set name if editing existing set

    if (isSetCreation) {
        return (
            <div className="fixed top-0 left-0 right-0 z-[60] pt-[env(safe-area-inset-top)] bg-background/95 backdrop-blur-xl border-b border-white/10 shadow-2xl pb-4">
                <div className="flex items-center justify-between px-5 pt-4">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => { onClose(); router.back(); }} 
                            className="p-3 bg-white/10 rounded-full hover:bg-white/20 active:scale-90 transition-transform"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Kreator Zestawu</span>
                            <span className="font-black text-xl leading-none tracking-tight">Wybierz produkt</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const labels = {
        breakfast: "Śniadanie",
        lunch: "Obiad",
        dinner: "Kolacja"
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-[60] pt-[env(safe-area-inset-top)] bg-primary text-white shadow-2xl shadow-primary/20 pb-6 rounded-b-[32px]">
            <div className="flex items-center justify-between px-5 pt-4">
                <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-white/70 uppercase tracking-widest flex items-center gap-2">
                        <Check size={12} strokeWidth={3} /> Tryb dodawania
                    </span>
                    <span className="font-black text-3xl leading-none tracking-tight">
                        {category ? labels[category] : '...'}
                    </span>
                </div>
                <button 
                    onClick={onClose}
                    className="p-3 bg-white/20 rounded-full hover:bg-white/30 active:scale-90 transition-transform backdrop-blur-md"
                >
                    <X size={24} />
                </button>
            </div>
        </div>
    );
}
