"use client";

import { useDiaryStore, Product } from "@/lib/store";
import { Plus, Search, Scale, Pencil, ArrowUpDown, Trash2, X, Barcode, Loader2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { MacroIcon } from "@/components/MacroIcon";
import dynamic from 'next/dynamic';

const BarcodeScanner = dynamic(() => import('@/components/BarcodeScanner').then(mod => mod.BarcodeScanner), {
  ssr: false,
  loading: () => null
});

type SortOption = 'name' | 'calories' | 'protein' | 'fat' | 'carbs';

export default function MealsPage() {
  const { products, addEntry, currentDate, setEditingProduct, selectionMode, setSelectionMode, deleteProduct } = useDiaryStore();
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [weight, setWeight] = useState("100");
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortOpen, setSortOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const router = useRouter();

  const filtered = products
    .filter(p => p.name && p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
        if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
        return (b[sortBy] as number || 0) - (a[sortBy] as number || 0);
    });

  const handleScan = async (barcode: string) => {
    setIsScanning(false);
    setIsFetching(true);
    
    try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
        const data = await response.json();

        if (data.status === 1) {
            const p = data.product;
            const params = new URLSearchParams({
                name: p.product_name || "",
                calories: (p.nutriments?.["energy-kcal_100g"] || p.nutriments?.["energy-kcal"] || 0).toString(),
                protein: (p.nutriments?.proteins_100g || 0).toString(),
                fat: (p.nutriments?.fat_100g || 0).toString(),
                carbs: (p.nutriments?.carbohydrates_100g || 0).toString(),
                brand: p.brands || ""
            });
            router.push(`/add?${params.toString()}`);
        } else {
            alert("Nie znaleziono produktu w bazie Open Food Facts.");
        }
    } catch (err) {
        console.error("OFF Fetch Error:", err);
        alert("Błąd podczas pobierania danych z bazy Open Food Facts.");
    } finally {
        setIsFetching(false);
    }
  };

  const handleAdd = () => {
    if (!selectedProduct || !selectionMode.category) return;
    const w = Number(weight) || 0;
    const ratio = w / 100;
    
    addEntry({
        date: currentDate,
        productId: selectedProduct.id,
        name: selectedProduct.name,
        weight: w,
        calories: selectedProduct.calories * ratio,
        protein: selectedProduct.protein * ratio,
        fat: selectedProduct.fat * ratio,
        carbs: selectedProduct.carbs * ratio,
        category: selectionMode.category
    });

    setSelectionMode(false, null);
    setSelectedProduct(null);
    router.push('/dashboard');
  };

  const handleEdit = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setEditingProduct(product);
    router.push('/add');
  };

  const handleDeleteProduct = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Czy na pewno chcesz usunąć ten produkt z bazy?')) {
        deleteProduct(id);
    }
  };

  return (
    <main className={cn(
        "p-5 flex flex-col gap-6 max-w-md mx-auto min-h-screen pb-32 transition-colors duration-500",
        selectionMode.active ? "bg-primary/5 pt-20" : "pt-12"
    )}>
      
      {/* Selection Mode Header */}
      <AnimatePresence>
          {selectionMode.active && (
              <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="fixed top-0 left-0 right-0 z-50 glass bg-primary/20 backdrop-blur-xl border-b border-primary/20 p-4 flex items-center justify-between"
              >
                  <button onClick={() => setSelectionMode(false, null)} className="p-2 bg-white/10 rounded-full"><X size={20}/></button>
                  <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black uppercase text-primary tracking-widest leading-none">Dodawanie do</span>
                      <span className="text-lg font-black capitalize">{selectionMode.category === 'breakfast' ? 'Śniadania' : selectionMode.category === 'lunch' ? 'Obiadu' : 'Kolacji'}</span>
                  </div>
                  <div className="w-10" />
              </motion.div>
          )}
      </AnimatePresence>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black tracking-tight text-primary">Baza Produktów</h1>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setIsScanning(true)}
                className="p-3 glass text-primary rounded-xl active:scale-95 transition-transform"
            >
                <Barcode size={20} />
            </button>
            <button 
                onClick={() => router.push('/add')}
                className="p-3 bg-primary text-white rounded-xl active:scale-95 transition-transform shadow-lg shadow-primary/20"
            >
                <Plus size={20} />
            </button>
            <div className="relative">
                <button 
                    onClick={() => setSortOpen(!sortOpen)}
                    className="p-3 glass rounded-xl text-muted-foreground active:scale-95 transition-transform"
                >
                    <ArrowUpDown size={20} />
                </button>
                <AnimatePresence>
                    {sortOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-12 w-40 glass bg-[#1C1C1E] rounded-xl p-1 z-50 flex flex-col shadow-xl"
                        >
                            {[
                                { id: 'name', label: 'Nazwa' },
                                { id: 'calories', label: 'Kalorie' },
                                { id: 'protein', label: 'Białko' },
                                { id: 'fat', label: 'Tłuszcz' },
                                { id: 'carbs', label: 'Węgle' }
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => { setSortBy(opt.id as SortOption); setSortOpen(false); }}
                                    className={cn(
                                        "px-3 py-2 text-sm font-bold text-left rounded-lg transition-colors",
                                        sortBy === opt.id ? "bg-primary text-white" : "text-muted-foreground hover:bg-white/5"
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </div>
      
      {/* Search */}
      <div className="relative">
        <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj produktu..."
            className="w-full glass rounded-2xl pl-12 pr-4 py-4 text-lg outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
            <div className="text-center py-12 glass rounded-[32px] flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground/30">
                    <Search size={32} />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-lg font-bold text-muted-foreground">
                        {products.length === 0 ? "Baza jest pusta" : "Nie znaleziono produktu"}
                    </span>
                    <p className="text-xs text-muted-foreground/60 px-8">
                        {products.length === 0 
                            ? "Dodaj swój pierwszy produkt do bazy, aby móc go używać w posiłkach." 
                            : `Nie znaleźliśmy "${search}" w Twojej bazie.`}
                    </p>
                </div>
                {selectionMode.active && (
                    <button 
                        onClick={() => router.push('/add')}
                        className="mt-2 px-6 py-3 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95 transition-transform"
                    >
                        <Plus size={20} /> Dodaj nowy produkt
                    </button>
                )}
            </div>
        ) : (
            filtered.map((p) => (
                <motion.div 
                    key={p.id}
                    layoutId={`product-${p.id}`}
                    onClick={() => selectionMode.active ? setSelectedProduct(p) : null}
                    className={cn(
                        "glass p-4 rounded-2xl flex items-center gap-4 transition-all",
                        selectionMode.active ? "active:scale-[0.98] cursor-pointer ring-1 ring-primary/20" : "cursor-default"
                    )}
                >
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg", p.color || "bg-primary")}>
                         <span className="font-bold text-lg">{p.name[0]}</span>
                    </div>
                    
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <span className="font-semibold text-lg truncate">{p.name}</span>
                        <div className="flex gap-3 text-xs text-muted-foreground font-medium items-center">
                            <span className="flex items-center gap-1 text-primary"><MacroIcon type="calories" size={10} colored /> {p.calories}</span>
                            <span className="flex items-center gap-1 text-protein"><MacroIcon type="protein" size={10} colored /> {p.protein}</span>
                            <span className="flex items-center gap-1 text-fat"><MacroIcon type="fat" size={10} colored /> {p.fat}</span>
                            <span className="flex items-center gap-1 text-carbs"><MacroIcon type="carbs" size={10} colored /> {p.carbs}</span>
                        </div>
                    </div>
                    
                    {!selectionMode.active && (
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={(e) => handleEdit(e, p)}
                                className="p-2 rounded-full bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
                            >
                                <Pencil size={18} />
                            </button>
                            <button 
                                onClick={(e) => handleDeleteProduct(e, p.id)}
                                className="p-2 rounded-full bg-red-500/10 text-red-500/50 hover:bg-red-500/20 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    )}

                    {selectionMode.active && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Plus size={20} />
                        </div>
                    )}
                </motion.div>
            ))
        )}
      </div>

      <AnimatePresence>
        {isScanning && (
            <BarcodeScanner 
                onClose={() => setIsScanning(false)} 
                onScan={handleScan} 
            />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFetching && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-4"
            >
                <div className="w-16 h-16 rounded-3xl bg-primary/20 flex items-center justify-center">
                    <Loader2 className="text-primary animate-spin" size={32} />
                </div>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-black text-white uppercase tracking-widest">Pobieranie danych</span>
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-tighter">Open Food Facts API</span>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {selectedProduct && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedProduct(null)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                />
                <motion.div 
                    initial={{ y: "100%" }} 
                    animate={{ y: 0 }} 
                    exit={{ y: "100%" }}
                    className="fixed bottom-0 left-0 right-0 z-[70] bg-[#1C1C1E] rounded-t-[32px] p-6 pb-[env(safe-area-inset-bottom,20px)] shadow-2xl border-t border-white/10"
                >
                    <div className="max-w-md mx-auto flex flex-col gap-6">
                        <div className="flex justify-between items-start">
                            <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                            <button onClick={() => setSelectedProduct(null)} className="p-2 bg-white/5 rounded-full text-muted-foreground"><X size={20}/></button>
                        </div>
                        
                        <div className="glass p-4 rounded-2xl flex items-center gap-4">
                            <Scale size={24} className="text-primary" />
                            <div className="flex flex-col flex-1">
                                <label className="text-xs font-bold text-muted-foreground uppercase">Ile gramów?</label>
                                <input 
                                    type="number" 
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    className="bg-transparent text-3xl font-black outline-none w-full"
                                    autoFocus
                                    onFocus={(e) => e.target.select()}
                                />
                            </div>
                            <span className="text-xl font-bold text-muted-foreground">g</span>
                        </div>

                        <div className="flex justify-between text-center px-2">
                             <div className="flex flex-col items-center gap-1">
                                <span className="text-2xl font-black text-primary flex items-center gap-1">
                                    <MacroIcon type="calories" size={16} colored />
                                    {Math.round(selectedProduct.calories * (Number(weight)/100))}
                                </span>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground">kcal</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-xl font-bold text-protein flex items-center gap-1">
                                    <MacroIcon type="protein" size={14} colored />
                                    {Math.round(selectedProduct.protein * (Number(weight)/100))}
                                </span>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground">Białko</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-xl font-bold text-fat flex items-center gap-1">
                                    <MacroIcon type="fat" size={14} colored />
                                    {Math.round(selectedProduct.fat * (Number(weight)/100))}
                                </span>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground">Tłuszcz</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-xl font-bold text-carbs flex items-center gap-1">
                                    <MacroIcon type="carbs" size={14} colored />
                                    {Math.round(selectedProduct.carbs * (Number(weight)/100))}
                                </span>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground">Węgle</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleAdd}
                            className="h-14 rounded-full bg-primary text-white font-bold text-lg shadow-lg shadow-primary/25 active:scale-95 transition-transform capitalize"
                        >
                            Dodaj do {selectionMode.category === 'breakfast' ? 'Śniadania' : selectionMode.category === 'lunch' ? 'Obiadu' : 'Kolacji'}
                        </button>
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>
    </main>
  );
}
