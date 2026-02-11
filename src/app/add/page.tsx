"use client";

import { Suspense, useState, useEffect, useMemo, useRef } from "react";
import { useDiaryStore } from "@/lib/store";
import { Plus, Save, X, Search, ChevronRight, Palette, Grid, Check, Pencil } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { MacroIcon } from "@/components/MacroIcon";
import { motion, AnimatePresence } from "framer-motion";

const ICON_NAMES = [
    "ChefHat", "Utensils", "Coffee", "Apple", "Carrot", "Beef", "Fish", "Croissant", "Pizza", "Sandwich", "IceCream",
    "Banana", "Beer", "Cake", "Candy", "Cigarette", "Citrus", "Cookie", "CupSoda", "Donut", "Drumstick", "Egg", "EggFried",
    "GlassWater", "Grape", "Ham", "Hop", "Leaf", "LeafyGreen", "Lemon", "Lollipop", "Martini", "Milk", "Nut", "Palmtree",
    "Popcorn", "Potato", "Salad", "Scale", "Soup", "Wheat", "Wine", "Dumbbell", "Activity", "Heart", "Flame", "Zap", "Droplet"
];

const PRESET_COLORS = [
    "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-blue-500"
];

function AddProductForm() {
  const { addProduct, updateProduct, editingProduct, setEditingProduct, selectionMode } = useDiaryStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const colorInputRef = useRef<HTMLInputElement>(null);
  
  const [form, setForm] = useState({
    name: "",
    brand: "",
    calories: "",
    protein: "",
    fat: "",
    carbs: "",
    icon: "ChefHat",
    color: "bg-orange-500"
  });
  const [success, setSuccess] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  useEffect(() => {
    const name = searchParams.get('name');
    const calories = searchParams.get('calories');
    const protein = searchParams.get('protein');
    const fat = searchParams.get('fat');
    const carbs = searchParams.get('carbs');
    const brand = searchParams.get('brand');

    if (editingProduct) {
        setForm({
            name: editingProduct.name,
            brand: editingProduct.brand || "",
            calories: editingProduct.calories.toString(),
            protein: editingProduct.protein.toString(),
            fat: editingProduct.fat.toString(),
            carbs: editingProduct.carbs.toString(),
            icon: editingProduct.icon || "ChefHat",
            color: editingProduct.color || "bg-orange-500"
        });
    } else if (name || calories) {
        setForm({
            name: name || "",
            brand: brand || "",
            calories: calories || "",
            protein: protein || "",
            fat: fat || "",
            carbs: carbs || "",
            icon: "ChefHat",
            color: "bg-orange-500"
        });
    }

    return () => setEditingProduct(null);
  }, [editingProduct, setEditingProduct, searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.calories) return;

    const productData = {
      name: form.name,
      brand: form.brand,
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
        router.push('/meals');
    }, 1000);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const SelectedIcon = (LucideIcons as any)[form.icon] || LucideIcons.ChefHat;
  const isCustomColor = !form.color.startsWith('bg-');

  return (
    <main className="p-5 flex flex-col gap-6 max-w-md mx-auto pt-12 pb-32">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
            {selectionMode.active && (
                <span className="text-[10px] font-black uppercase text-primary tracking-widest leading-none mb-1">
                    Dodaj do: {selectionMode.category === 'breakfast' ? 'Śniadania' : selectionMode.category === 'lunch' ? 'Obiadu' : 'Kolacji'}
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
        
        {/* Main Info Card */}
        <div className="glass p-6 rounded-[32px] flex flex-col gap-6">
            <div className="flex gap-5 items-start">
                <button
                    type="button"
                    onClick={() => setIsIconPickerOpen(true)}
                    className={cn(
                        "w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg transition-all active:scale-95 shrink-0 relative overflow-hidden group",
                        !isCustomColor && form.color
                    )}
                    style={isCustomColor ? { backgroundColor: form.color } : {}}
                >
                    <SelectedIcon size={40} className="text-white drop-shadow-md z-10" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                         <Pencil size={20} className="text-white" />
                    </div>
                </button>
                
                <div className="flex flex-col gap-3 flex-1 min-w-0">
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1 mb-1">Nazwa Produktu</label>
                        <input 
                            type="text" 
                            name="name"
                            value={form.name}
                            onChange={handleInput}
                            placeholder="np. Jajko"
                            className="w-full bg-transparent text-lg font-bold outline-none placeholder:text-muted-foreground/30 border-b border-white/10 focus:border-primary transition-colors pb-1"
                            autoFocus={!editingProduct}
                        />
                    </div>
                    
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1 mb-1">Marka / Firma (Opcjonalne)</label>
                        <input 
                            type="text" 
                            name="brand"
                            value={form.brand}
                            onChange={handleInput}
                            placeholder="np. Biedronka"
                            className="w-full bg-transparent text-lg font-bold outline-none placeholder:text-muted-foreground/30 border-b border-white/10 focus:border-primary transition-colors pb-1 text-white/80"
                        />
                    </div>
                </div>
            </div>

            {/* Color Selection */}
            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Kolor Ikony</label>
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {PRESET_COLORS.map(color => (
                        <button 
                            type="button"
                            key={color}
                            onClick={() => setForm(f => ({ ...f, color }))}
                            className={cn(
                                "w-10 h-10 rounded-full shrink-0 transition-all border-2",
                                color,
                                form.color === color ? "border-white scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                            )}
                        />
                    ))}
                    <div className="w-px h-6 bg-white/10 mx-1" />
                    
                    {/* Custom Color Picker */}
                    <div className="relative">
                        <input 
                            ref={colorInputRef}
                            type="color"
                            value={isCustomColor ? form.color : "#FF6A00"}
                            onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))}
                            className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                        />
                        <button 
                            type="button"
                            onClick={() => colorInputRef.current?.click()}
                            className={cn(
                                "w-10 h-10 rounded-full shrink-0 transition-all border-2 flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
                                isCustomColor ? "border-white scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                            )}
                        >
                            <Palette size={18} className="text-white" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Macros */}
        <div className="glass p-6 rounded-[32px] flex flex-col gap-6">
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
                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-4 text-3xl font-black outline-none focus:border-primary/50 transition-colors text-primary"
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
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-3 text-lg font-bold outline-none focus:border-protein/50 transition-colors"
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
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-3 text-lg font-bold outline-none focus:border-fat/50 transition-colors"
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
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-3 text-lg font-bold outline-none focus:border-carbs/50 transition-colors"
                        inputMode="decimal"
                    />
                </div>
            </div>
        </div>

        <button 
            disabled={!form.name || !form.calories}
            className={cn(
                "h-14 rounded-full font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 mt-4",
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
      
      {/* Icon Picker Modal */}
      <AnimatePresence>
        {isIconPickerOpen && (
            <IconPickerModal 
                onClose={() => setIsIconPickerOpen(false)} 
                onSelect={(icon) => { setForm(f => ({ ...f, icon })); setIsIconPickerOpen(false); }} 
                currentIcon={form.icon}
            />
        )}
      </AnimatePresence>
    </main>
  );
}

function IconPickerModal({ onClose, onSelect, currentIcon }: { onClose: () => void, onSelect: (icon: string) => void, currentIcon: string }) {
    const [search, setSearch] = useState("");
    
    const filteredIcons = useMemo(() => {
        if (!search) return ICON_NAMES;
        return ICON_NAMES.filter(name => name.toLowerCase().includes(search.toLowerCase()));
    }, [search]);

    return (
        <>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80]"
            />
            <motion.div 
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                className="fixed inset-x-0 bottom-0 top-20 z-[90] bg-[#1C1C1E] rounded-t-[32px] flex flex-col border-t border-white/10"
            >
                <div className="p-6 flex flex-col gap-4 border-b border-white/5">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Wybierz ikonę</h2>
                        <button onClick={onClose} className="p-2 bg-white/5 rounded-full"><X size={20}/></button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input 
                            type="text" 
                            placeholder="Szukaj ikony..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/20 rounded-xl pl-10 pr-4 py-3 font-medium outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                        {filteredIcons.map(name => {
                            const Icon = (LucideIcons as any)[name];
                            if (!Icon) return null;
                            const isSelected = currentIcon === name;
                            return (
                                <button
                                    key={name}
                                    onClick={() => onSelect(name)}
                                    className={cn(
                                        "aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all",
                                        isSelected ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105" : "bg-white/5 text-muted-foreground hover:bg-white/10 active:scale-95"
                                    )}
                                >
                                    <Icon size={24} />
                                    <span className="text-[9px] font-bold uppercase truncate w-full px-1">{name}</span>
                                </button>
                            );
                        })}
                    </div>
                    {filteredIcons.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            Brak wyników
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    );
}

export default function AddPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>}>
            <AddProductForm />
        </Suspense>
    );
}
