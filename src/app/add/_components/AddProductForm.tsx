import { useState, useEffect } from "react";
import { useDiaryStore } from "@/lib/store";
import { Plus, Save, X, Trash2, Check, AlertCircle } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { MacroIcon } from "@/components/MacroIcon";
import { AnimatePresence } from "framer-motion";

export function AddProductForm() {
  const { addProduct, updateProduct, deleteProduct, editingProduct, setEditingProduct, selectionMode, sets } = useDiaryStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initial state logic
  const [form, setForm] = useState(() => {
      if (editingProduct) {
          return {
            name: editingProduct.name,
            brand: editingProduct.brand || "",
            calories: editingProduct.calories.toString(),
            protein: editingProduct.protein.toString(),
            fat: editingProduct.fat.toString(),
            carbs: editingProduct.carbs.toString(),
          };
      }
      return {
        name: "",
        brand: "",
        calories: "",
        protein: "",
        fat: "",
        carbs: "",
      };
  });

  const [success, setSuccess] = useState(false);
  const [affectedSets, setAffectedSets] = useState<string[]>([]);
  const [showWarning, setShowWarning] = useState(false);

  // Sync with search params ONLY if not editing an existing product and form is empty (first load)
  useEffect(() => {
    if (editingProduct) return; // Don't override if we are editing

    const name = searchParams.get('name');
    const calories = searchParams.get('calories');
    
    if (name || calories) {
        setForm(prev => {
            // Only update if current form is empty to avoid overwriting user input
            if (prev.name) return prev; 
            return {
                name: name || "",
                brand: searchParams.get('brand') || "",
                calories: calories || "",
                protein: searchParams.get('protein') || "",
                fat: searchParams.get('fat') || "",
                carbs: searchParams.get('carbs') || "",
            };
        });
    }
  }, [searchParams, editingProduct]);

  const handlePreSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.name || !form.calories) return;

      if (editingProduct) {
          // Check if product is in any sets
          const inSets = sets.filter(s => s.items.some(i => i.productId === editingProduct.id));
          if (inSets.length > 0) {
              setAffectedSets(inSets.map(s => s.name));
              setShowWarning(true);
              return;
          }
      }
      handleSubmit();
  };

  const handleSubmit = () => {
    const productData = {
      name: form.name,
      brand: form.brand,
      calories: Number(form.calories),
      protein: Number(form.protein) || 0,
      fat: Number(form.fat) || 0,
      carbs: Number(form.carbs) || 0,
    };

    if (editingProduct) {
        updateProduct(editingProduct.id, productData);
    } else {
        addProduct(productData);
    }

    setSuccess(true);
    setTimeout(() => {
        setSuccess(false);
        setEditingProduct(null); // Clear state here
        router.push('/meals');
    }, 1000);
  };

  const handleDelete = () => {
      if (editingProduct && confirm("Czy na pewno chcesz usunąć ten produkt?")) {
          deleteProduct(editingProduct.id);
          setEditingProduct(null);
          router.push('/meals');
      }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

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
        <div className="flex items-center gap-2">
            {editingProduct && (
                <button 
                    type="button"
                    onClick={handleDelete}
                    className="p-2 glass rounded-full text-red-500 hover:bg-red-500/10 active:scale-90"
                >
                    <Trash2 size={20} />
                </button>
            )}
            <button 
                type="button"
                onClick={() => { setEditingProduct(null); router.back(); }}
                className="p-2 glass rounded-full text-muted-foreground active:scale-90"
            >
                <X size={20} />
            </button>
        </div>
      </div>
      
      <form onSubmit={handlePreSubmit} className="flex flex-col gap-4">
        
        {/* Main Info Card */}
        <div className="glass p-6 rounded-[32px] flex flex-col gap-6">
             <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1 mb-1">Nazwa Produktu</label>
                    <input 
                        type="text" 
                        name="name"
                        value={form.name}
                        onChange={handleInput}
                        placeholder="np. Jajko"
                        className="w-full bg-black/10 text-xl font-bold rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/30"
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
                         className="w-full bg-black/10 text-lg font-bold rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/30"
                    />
                </div>
            </div>
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
                <><Save size={24} /> Zapisz</>
            ) : selectionMode.active ? (
                <><Plus size={24} /> Dodaj</>
            ) : (
                <><Plus size={24} /> Dodaj</>
            )}
        </button>
      </form>
      
      {/* Set Warning Modal */}
      {showWarning && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
              <div className="bg-[#1C1C1E] rounded-[32px] p-6 w-full max-w-sm border border-white/10 flex flex-col gap-4">
                  <div className="flex items-center gap-3 text-yellow-500">
                      <AlertCircle size={32} />
                      <h3 className="text-xl font-black leading-none">Uwaga</h3>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                      Ten produkt znajduje się w <strong>{affectedSets.length}</strong> zestawach (np. {affectedSets[0]}).
                      <br/><br/>
                      Zapisanie zmian spowoduje automatyczną aktualizację makroskładników w tych zestawach.
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                      <button onClick={() => setShowWarning(false)} className="py-3 rounded-xl bg-white/10 font-bold text-sm">Anuluj</button>
                      <button onClick={handleSubmit} className="py-3 rounded-xl bg-yellow-500 text-black font-bold text-sm">Zrozumiałem, zapisz</button>
                  </div>
              </div>
          </div>
      )}
    </main>
  );
}
