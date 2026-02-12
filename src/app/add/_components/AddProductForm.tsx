import { useState, useEffect } from "react";
import { useDiaryStore } from "@/lib/store";
import { Plus, Save, X, Pencil, Check } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { MacroIcon } from "@/components/MacroIcon";
import { AnimatePresence } from "framer-motion";
import { ICON_NAMES, PRESET_COLORS } from "./constants";
import { IconPickerModal } from "./IconPickerModal";
import { ColorPicker } from "./ColorPicker";

export function AddProductForm() {
  const { addProduct, updateProduct, editingProduct, setEditingProduct, selectionMode } = useDiaryStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  
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
    } else {
        // Randomize initial state
        setForm({
            name: "", brand: "", calories: "", protein: "", fat: "", carbs: "",
            icon: ICON_NAMES[Math.floor(Math.random() * ICON_NAMES.length)],
            color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]
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
            <ColorPicker 
                color={form.color}
                onChange={(c) => setForm(f => ({ ...f, color: c }))}
            />
        </div>

        {/* Macros */}
        <div className="glass p-5 rounded-[32px] flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1 flex items-center gap-1">
                    <MacroIcon type="calories" size={10} /> Kalorie (100g)
                </label>
                <input 
                    type="number" 
                    name="calories"
                    value={form.calories}
                    onChange={handleInput}
                    placeholder="0"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-xl font-black outline-none focus:border-primary/50 transition-colors text-primary"
                    inputMode="decimal"
                />
            </div>

            <div className="grid grid-cols-3 gap-3">
                 <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-protein uppercase tracking-wider ml-1 flex items-center gap-1">
                        <MacroIcon type="protein" size={8} /> B
                    </label>
                    <input 
                        type="number" 
                        name="protein"
                        value={form.protein}
                        onChange={handleInput}
                        placeholder="0"
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-protein/50 transition-colors"
                        inputMode="decimal"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-fat uppercase tracking-wider ml-1 flex items-center gap-1">
                        <MacroIcon type="fat" size={8} /> T
                    </label>
                    <input 
                        type="number" 
                        name="fat"
                        value={form.fat}
                        onChange={handleInput}
                        placeholder="0"
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-fat/50 transition-colors"
                        inputMode="decimal"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-carbs uppercase tracking-wider ml-1 flex items-center gap-1">
                        <MacroIcon type="carbs" size={8} /> W
                    </label>
                    <input 
                        type="number" 
                        name="carbs"
                        value={form.carbs}
                        onChange={handleInput}
                        placeholder="0"
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-carbs/50 transition-colors"
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
