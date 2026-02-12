"use client";

import { useDiaryStore, Product, ProductSet, SetItem } from "@/lib/store";
import { Plus, Search, ArrowUpDown, Barcode, X, AlertTriangle, Layers, Box, Package } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic';

import { SelectionHeader } from "./_components/SelectionHeader";
import { SortDropdown, SortOption } from "./_components/SortDropdown";
import { ProductListItem } from "./_components/ProductListItem";
import { SetListItem } from "./_components/SetListItem";
import { AddProductModal } from "./_components/AddProductModal";
import { LoadingOverlay } from "./_components/LoadingOverlay";

const BarcodeScanner = dynamic(() => import('@/components/BarcodeScanner').then(mod => mod.BarcodeScanner), {
  ssr: false,
  loading: () => null
});

type Tab = 'all' | 'products' | 'sets';

export default function MealsPage() {
  const { products, sets, addEntry, currentDate, setEditingProduct, setEditingSet, selectionMode, setSelectionMode, deleteProduct, deleteSet, updateSet } = useDiaryStore();
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [weight, setWeight] = useState("100");
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortOpen, setSortOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const router = useRouter();

  // Force active tab to products if in Set Creation Mode
  useEffect(() => {
      if (selectionMode.isSetCreation) {
          setActiveTab('products');
      }
  }, [selectionMode.isSetCreation]);

  // Unified list of items to display
  const items = useMemo(() => {
    let list: Array<{ type: 'product' | 'set', data: Product | ProductSet }> = [];

    // If making a set, ONLY show products
    if (selectionMode.isSetCreation) {
        list = products.map(p => ({ type: 'product', data: p }));
    } else {
        if (activeTab === 'all' || activeTab === 'products') {
            list = list.concat(products.map(p => ({ type: 'product', data: p })));
        }
        if (activeTab === 'all' || activeTab === 'sets') {
            list = list.concat(sets.map(s => ({ type: 'set', data: s })));
        }
    }

    // Filter
    if (search) {
        const lower = search.toLowerCase();
        list = list.filter(item => item.data.name.toLowerCase().includes(lower));
    }

    // Sort
    list.sort((a, b) => {
        if (sortBy === 'name') {
            const timeA = Math.max(a.data.updatedAt || 0, a.data.lastUsedAt || 0);
            const timeB = Math.max(b.data.updatedAt || 0, b.data.lastUsedAt || 0);
            
            // If times are significantly different (e.g. > 1 sec), sort by time
            if (timeB !== timeA) return timeB - timeA;
            
            // Fallback to A-Z
            return a.data.name.localeCompare(b.data.name);
        }
        // Products prioritize scanned status if requested
        if (sortBy === 'scanned') {
            const isScannedA = a.type === 'product' ? (a.data as Product).is_scanned : false;
            const isScannedB = b.type === 'product' ? (b.data as Product).is_scanned : false;
            return (isScannedB ? 1 : 0) - (isScannedA ? 1 : 0);
        }
        // Fallback or other sorts
        return 0;
    });

    return list;
  }, [products, sets, activeTab, search, sortBy, selectionMode.isSetCreation]);

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

  const handleScanError = (error: string) => {
      setIsScanning(false);
      setScanError(error);
  };

  const handleAddProduct = () => {
    if (!selectedProduct) return;
    
    // If we are in "Set Creation Mode"
    if (selectionMode.isSetCreation && selectionMode.currentSetId) {
        const w = Number(weight) || 0;
        // Add to set logic
        const currentSet = sets.find(s => s.id === selectionMode.currentSetId);
        if (currentSet) {
            const newItems = [...currentSet.items, { productId: selectedProduct.id, weight: w }];
            // Update the set in store
            updateSet(currentSet.id, { items: newItems });
            // IMPORTANT: Also update the editingSet state so the Set Editor reflects changes immediately
            setEditingSet({ ...currentSet, items: newItems });
            
            router.push('/add-set'); // Return to set editor
        }
        setSelectionMode(false, null, false, undefined);
        setSelectedProduct(null);
        return;
    }

    // Normal Meal Addition
    if (!selectionMode.category) return;
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

  const handleAddSet = (set: ProductSet) => {
      if (!selectionMode.category) return;

      // Update set usage time
      updateSet(set.id, { lastUsedAt: Date.now() });

      // Add all items from the set
      set.items.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
              const ratio = item.weight / 100;
              addEntry({
                date: currentDate,
                productId: product.id,
                name: product.name,
                brand: product.brand,
                is_scanned: product.is_scanned,
                weight: item.weight,
                calories: product.calories * ratio,
                protein: product.protein * ratio,
                fat: product.fat * ratio,
                carbs: product.carbs * ratio,
                category: selectionMode.category!
              });
          }
      });
      
      setSelectionMode(false, null);
      router.push('/dashboard');
  };

  const handleEditProduct = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setEditingProduct(product);
    router.push('/add');
  };

  const handleEditSet = (e: React.MouseEvent, set: ProductSet) => {
      e.stopPropagation();
      setEditingSet(set);
      router.push('/add-set');
  };

  const handleDeleteProduct = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Czy na pewno chcesz usunąć ten produkt z bazy?')) {
        deleteProduct(id);
    }
  };

  const handleDeleteSet = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Czy na pewno chcesz usunąć ten zestaw?')) {
        deleteSet(id);
    }
  };
  
  const handleAddClick = () => {
      if (activeTab === 'products') {
          router.push('/add');
      } else if (activeTab === 'sets') {
          router.push('/add-set');
      } else {
          setIsAddMenuOpen(!isAddMenuOpen);
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
                onClose={() => setSelectionMode(false, null, false, undefined)} 
                isSetCreation={selectionMode.isSetCreation}
              />
          )}
      </AnimatePresence>

      <div className="pt-12 px-5 pb-2 flex flex-col gap-4">
        <h1 className="text-3xl font-black tracking-tight text-primary">Baza</h1>
        
        {/* Tabs - Hidden in Set Creation Mode */}
        {!selectionMode.isSetCreation && (
            <div className="flex p-1 bg-black/10 rounded-xl">
                {(['all', 'products', 'sets'] as Tab[]).map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setIsAddMenuOpen(false); }}
                        className={cn(
                            "flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all",
                            activeTab === tab ? "bg-white text-black shadow-sm" : "text-muted-foreground hover:text-white"
                        )}
                    >
                        {tab === 'all' ? 'Wszystko' : tab === 'products' ? 'Produkty' : 'Zestawy'}
                    </button>
                ))}
            </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-[180px] flex flex-col gap-3 scrollbar-hide pt-2">
        {items.length === 0 ? (
            <div className="text-center py-12 glass rounded-[32px] flex flex-col items-center gap-4 mt-10">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground/30">
                    <Search size={32} />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-lg font-bold text-muted-foreground">
                        Brak wyników
                    </span>
                    <p className="text-xs text-muted-foreground/60 px-8">
                        {selectionMode.isSetCreation ? "Brak produktów." : "Spróbuj zmienić filtry lub dodaj nowy element."}
                    </p>
                </div>
            </div>
        ) : (
            items.map((item) => (
                item.type === 'product' ? (
                    <ProductListItem 
                        key={`p-${item.data.id}`}
                        product={item.data as Product}
                        isSelectionMode={selectionMode.active}
                        onSelect={() => setSelectedProduct(item.data as Product)}
                        onEdit={handleEditProduct}
                        onDelete={handleDeleteProduct}
                    />
                ) : (
                    <SetListItem 
                        key={`s-${item.data.id}`}
                        set={item.data as ProductSet}
                        isSelectionMode={selectionMode.active && !selectionMode.isSetCreation}
                        onSelect={() => handleAddSet(item.data as ProductSet)}
                        onEdit={handleEditSet}
                        onDelete={handleDeleteSet}
                    />
                )
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
                    placeholder="Szukaj"
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

                 {/* Don't show scanner or add button in Set Creation Mode if we only want simple selection */}
                 {!selectionMode.isSetCreation && (
                     <>
                        <button 
                            onClick={() => setIsScanning(true)}
                            className="p-4 bg-primary text-white rounded-2xl active:scale-95 transition-transform shadow-xl flex items-center justify-center"
                        >
                            <Barcode size={24} />
                        </button>
                        
                        <div className="relative">
                            {isAddMenuOpen && (
                                <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setIsAddMenuOpen(false)} />
                            )}
                            <button 
                                onClick={handleAddClick}
                                className={cn(
                                    "p-4 text-white rounded-2xl active:scale-95 transition-transform shadow-lg backdrop-blur-md relative z-50",
                                    isAddMenuOpen ? "bg-white text-black" : "bg-primary"
                                )}
                            >
                                {isAddMenuOpen ? <X size={24} /> : <Plus size={24} />}
                            </button>
                            
                            <AnimatePresence>
                                {isAddMenuOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                        className="absolute bottom-full right-0 mb-3 flex flex-col gap-2 min-w-[160px] z-50"
                                    >
                                        <button 
                                            onClick={() => router.push('/add')}
                                            className="p-4 bg-[#1C1C1E] rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3 active:scale-95 text-left"
                                        >
                                            <div className="bg-primary/20 text-primary p-2 rounded-lg">
                                                <Package size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-white">Produkt</span>
                                                <span className="text-[10px] text-muted-foreground font-medium">Pojedynczy składnik</span>
                                            </div>
                                        </button>
                                        <button 
                                            onClick={() => router.push('/add-set')}
                                            className="p-4 bg-[#1C1C1E] rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3 active:scale-95 text-left"
                                        >
                                            <div className="bg-blue-500/20 text-blue-500 p-2 rounded-lg">
                                                <Layers size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-white">Zestaw</span>
                                                <span className="text-[10px] text-muted-foreground font-medium">Grupa produktów</span>
                                            </div>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                     </>
                 )}
             </div>
          </div>
      </div>

      <AnimatePresence>
        {isScanning && (
            <BarcodeScanner 
                onClose={() => setIsScanning(false)} 
                onScan={handleScan}
                onError={handleScanError} 
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
                <div className="bg-white/20 p-2 rounded-full"><AlertTriangle size={16} /></div>
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
                onAdd={handleAddProduct}
                category={selectionMode.category}
                isSetCreation={selectionMode.isSetCreation}
            />
        )}
      </AnimatePresence>
    </main>
  );
}
