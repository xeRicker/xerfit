"use client";

import { useState, useEffect } from "react";
import { useDiaryStore } from "@/lib/store";
import { Plus, Save, ChefHat, Check, Utensils, Coffee, Apple, Carrot, Beef, Fish, Croissant, Pizza, Sandwich, IceCream, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { MacroIcon } from "@/components/MacroIcon";

const ICONS = {
    ChefHat, Utensils, Coffee, Apple, Carrot, Beef, Fish, Croissant, Pizza, Sandwich, IceCream
};

const COLORS = [
    "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-yellow-500", 
    "bg-lime-500", "bg-green-500", "bg-emerald-500", "bg-teal-500",
    "bg-cyan-500", "bg-sky-500", "bg-blue-500", "bg-indigo-500",
    "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", "bg-pink-500",
    "bg-rose-500"
];

export default function AddPage() {
  const { addProduct, updateProduct, editingProduct, setEditingProduct, selectionMode } = useDiaryStore();
  const router = useRouter();
  
  const [form, setForm] = useState({
    name: "",
    calories: "",
    protein: "",
    fat: "",
    carbs: "",
    icon: "ChefHat",
    color: "bg-orange-500"
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (editingProduct) {
        setForm({
            name: editingProduct.name,
            calories: editingProduct.calories.toString(),
            protein: editingProduct.protein.toString(),
            fat: editingProduct.fat.toString(),
            carbs: editingProduct.carbs.toString(),
            icon: editingProduct.icon || "ChefHat",
            color: editingProduct.color || "bg-orange-500"
        });
    } else {
        setForm({
            name: "", calories: "", protein: "", fat: "", carbs: "",
            icon: "ChefHat", color: "bg-orange-500"
        });
    }

    return () => setEditingProduct(null); // Cleanup on unmount
  }, [editingProduct, setEditingProduct]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.calories) return;

    const productData = {
      name: form.name,
      calories: Number(form.calories),
      protein: Number(form.protein) || 0,
      fat: Number(form.fat) || 0,
      carbs: Number(form.carbs) || 0,
      icon: form.icon,
      color: form.color
    };

    if (editingProduct) {
        updateProduct(editingProduct.id, productData);
    } else {
        addProduct(productData);
    }

    setSuccess(true);
    setTimeout(() => {
        setSuccess(false);
        setEditingProduct(null);
        router.push('/meals'); // Go to database after adding
    }, 1000);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const SelectedIcon = ICONS[form.icon as keyof typeof ICONS] || ChefHat;

  return (
    <main className="p-5 flex flex-col gap-6 max-w-md mx-auto pt-12 pb-32">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
            {selectionMode.active && (
                <span className="text-[10px] font-black uppercase text-primary tracking-widest leading-none mb-1">
                    Dodaj produkt do: {selectionMode.category === 'breakfast' ? 'Śniadania' : selectionMode.category === 'lunch' ? 'Obiadu' : 'Kolacji'}
                </span>
            )}
            <h1 className="text-3xl font-black tracking-tight text-primary">
                {editingProduct ? "Edytuj Produkt" : "Nowy Produkt"}
            </h1>
        </div>
        <button 
            type="button"
            onClick={() => router.back()}
            className="p-2 glass rounded-full text-muted-foreground active:scale-90"
        >
            <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* Name & Icon Preview */}
        <div className="glass p-6 rounded-3xl flex flex-col gap-4">
            <div className="flex gap-4 items-center">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-colors", form.color)}>
                    <SelectedIcon size={32} className="text-white" />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Nazwa</label>
                    <input 
                        type="text" 
                        name="name"
                        value={form.name}
                        onChange={handleInput}
                        placeholder="np. Jajko"
                        className="w-full bg-transparent text-2xl font-black outline-none placeholder:text-muted-foreground/30 border-b border-white/10 focus:border-primary transition-colors pb-1"
                        autoFocus={!editingProduct}
                    />
                </div>
            </div>

            {/* Customization */}
            <div className="flex flex-col gap-3 pt-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Ikona</label>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(ICONS).map(([name, Icon]) => (
                        <button 
                            type="button"
                            key={name}
                            onClick={() => setForm(f => ({ ...f, icon: name }))}
                            className={cn(
                                "p-2 rounded-xl transition-all shrink-0",
                                form.icon === name ? "bg-white/10 text-primary ring-1 ring-primary" : "bg-black/20 text-muted-foreground"
                            )}
                        >
                            <Icon size={16} />
                        </button>
                    ))}
                </div>
                
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1 mt-2">Kolor</label>
                <div className="flex flex-wrap gap-2">
                    {COLORS.map(color => (
                        <button 
                            type="button"
                            key={color}
                            onClick={() => setForm(f => ({ ...f, color }))}
                            className={cn(
                                "w-6 h-6 rounded-full shrink-0 transition-all",
                                color,
                                form.color === color ? "ring-2 ring-white scale-110" : "opacity-40 hover:opacity-100"
                            )}
                        />
                    ))}
                </div>
            </div>
        </div>

        {/* Macros */}
        <div className="glass p-6 rounded-3xl flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1 flex items-center gap-2">
                    <MacroIcon type="calories" size={12} /> Kalorie (100g)
                </label>
                <input 
                    type="number" 
                    name="calories"
                    value={form.calories}
                    onChange={handleInput}
                    placeholder="0"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-2xl font-bold outline-none focus:border-primary/50 transition-colors text-primary"
                    inputMode="decimal"
                />
            </div>

            <div className="grid grid-cols-3 gap-3">
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-protein uppercase tracking-wider ml-1 flex items-center gap-1">
                        <MacroIcon type="protein" size={10} /> B
                    </label>
                    <input 
                        type="number" 
                        name="protein"
                        value={form.protein}
                        onChange={handleInput}
                        placeholder="0"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-base font-medium outline-none focus:border-protein/50 transition-colors"
                        inputMode="decimal"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-fat uppercase tracking-wider ml-1 flex items-center gap-1">
                        <MacroIcon type="fat" size={10} /> T
                    </label>
                    <input 
                        type="number" 
                        name="fat"
                        value={form.fat}
                        onChange={handleInput}
                        placeholder="0"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-base font-medium outline-none focus:border-fat/50 transition-colors"
                        inputMode="decimal"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-carbs uppercase tracking-wider ml-1 flex items-center gap-1">
                        <MacroIcon type="carbs" size={10} /> W
                    </label>
                    <input 
                        type="number" 
                        name="carbs"
                        value={form.carbs}
                        onChange={handleInput}
                        placeholder="0"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-base font-medium outline-none focus:border-carbs/50 transition-colors"
                        inputMode="decimal"
                    />
                </div>
            </div>
        </div>

        <button 
            disabled={!form.name || !form.calories}
            className={cn(
                "h-14 rounded-full font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 mt-2",
                success ? "bg-success" : "bg-gradient-to-r from-[#FF4D00] to-[#FF9500] shadow-[#FF6A00]/25 active:scale-95",
                (!form.name || !form.calories) && "opacity-50 pointer-events-none grayscale"
            )}
        >
            {success ? (
                <Check size={24} />
            ) : editingProduct ? (
                <><Save size={24} /> Zapisz zmiany</>
            ) : selectionMode.active ? (
                <><Plus size={24} /> Dodaj</>
            ) : (
                <><Plus size={24} /> Dodaj do bazy</>
            )}
        </button>
      </form>
    </main>
  );
}
