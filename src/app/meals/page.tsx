"use client";

import { useDiaryStore, Product } from "@/lib/store";
import { Plus, Search, ArrowUpDown, Barcode, X } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic';

import { SelectionHeader } from "./_components/SelectionHeader";
import { SortDropdown, SortOption } from "./_components/SortDropdown";
import { ProductListItem } from "./_components/ProductListItem";
import { AddProductModal } from "./_components/AddProductModal";
import { LoadingOverlay } from "./_components/LoadingOverlay";

const BarcodeScanner = dynamic(() => import('@/components/BarcodeScanner').then(mod => mod.BarcodeScanner), {
  ssr: false,
  loading: () => null
});

export default function MealsPage() {
  const { products, addEntry, currentDate, setEditingProduct, selectionMode, setSelectionMode, deleteProduct } = useDiaryStore();
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [weight, setWeight] = useState("100");
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortOpen, setSortOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const router = useRouter();

  const filtered = products
    .filter(p => p.name && p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
        if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
        if (sortBy === 'scanned') return (b.is_scanned ? 1 : 0) - (a.is_scanned ? 1 : 0);
        return (b[sortBy] as number || 0) - (a[sortBy] as number || 0);
    });

  const handleScan = async (barcode: string) => {
    setIsScanning(false);
    setIsFetching(true);
    setScanError(null);
    
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
            setScanError("Nie znaleziono produktu w bazie Open Food Facts.");
        }
    } catch (err) {
        console.error("OFF Fetch Error:", err);
        setScanError("Błąd połączenia z bazą Open Food Facts.");
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
        brand: selectedProduct.brand,
        is_scanned: selectedProduct.is_scanned,
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
        "flex flex-col h-screen overflow-hidden relative",
        selectionMode.active ? "bg-primary/5" : ""
    )}>
      
      <AnimatePresence>
          {selectionMode.active && (
              <SelectionHeader 
                category={selectionMode.category} 
                onClose={() => setSelectionMode(false, null)} 
              />
          )}
      </AnimatePresence>

      <div className="pt-12 px-5 pb-4">
        <h1 className="text-3xl font-black tracking-tight text-primary">Baza Produktów</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-[180px] flex flex-col gap-3 scrollbar-hide">
        {filtered.length === 0 ? (
            <div className="text-center py-12 glass rounded-[32px] flex flex-col items-center gap-4 mt-10">
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
            </div>
        ) : (
            filtered.map((p) => (
                <ProductListItem 
                    key={p.id}
                    product={p}
                    isSelectionMode={selectionMode.active}
                    onSelect={() => setSelectedProduct(p)}
                    onEdit={handleEdit}
                    onDelete={handleDeleteProduct}
                />
            ))
        )}
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+80px)] left-0 right-0 p-4 px-5 z-40 bg-gradient-to-t from-background to-transparent pt-10 pointer-events-none">
          <div className="pointer-events-auto flex items-end gap-3 w-full max-w-md mx-auto">
             <div className="relative flex-1">
                <input 
                    type="text" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Szukaj produktu..."
                    className="w-full glass-heavy rounded-2xl pl-12 pr-4 py-4 text-lg outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50 shadow-xl"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={20} />
             </div>
             
             <div className="flex gap-2">
                 <div className="relative">
                    <button 
                        onClick={() => setSortOpen(!sortOpen)}
                        className="p-4 glass-heavy rounded-2xl text-muted-foreground active:scale-95 transition-transform shadow-xl"
                    >
                        <ArrowUpDown size={24} />
                    </button>
                    <SortDropdown 
                        isOpen={sortOpen}
                        onClose={() => setSortOpen(false)}
                        sortBy={sortBy}
                        onSelect={setSortBy}
                    />
                 </div>

                 <button 
                    onClick={() => setIsScanning(true)}
                    className="p-4 glass-heavy text-primary rounded-2xl active:scale-95 transition-transform shadow-xl"
                >
                    <Barcode size={24} />
                </button>
                
                <button 
                    onClick={() => router.push('/add')}
                    className="p-4 bg-primary text-white rounded-2xl active:scale-95 transition-transform shadow-lg shadow-primary/30"
                >
                    <Plus size={24} />
                </button>
             </div>
          </div>
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
        {isFetching && <LoadingOverlay />}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {scanError && (
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-32 left-5 right-5 z-[120] bg-red-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3"
            >
                <div className="bg-white/20 p-2 rounded-full"><X size={16} /></div>
                <span className="font-bold text-sm">{scanError}</span>
                <button onClick={() => setScanError(null)} className="ml-auto p-2 hover:bg-white/10 rounded-lg">OK</button>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProduct && (
            <AddProductModal 
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
                weight={weight}
                onWeightChange={setWeight}
                onAdd={handleAdd}
                category={selectionMode.category}
            />
        )}
      </AnimatePresence>
    </main>
  );
}
