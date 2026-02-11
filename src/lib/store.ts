import { create } from 'zustand';
import { format } from 'date-fns';
import { fetchAllData, syncProfiles, syncProducts, syncEntries, syncSettings, syncMeasurements } from './actions';

export interface Product {
  id: string;
  name: string;
  brand?: string;
  is_scanned?: boolean;
  calories: number; // per 100g
  protein: number;
  fat: number;
  carbs: number;
  category?: string;
  icon?: string;
  color?: string;
}

export type MealCategory = 'breakfast' | 'lunch' | 'dinner';

export interface MealEntry {
  id: string;
  profileId: string;
  date: string; // YYYY-MM-DD
  productId: string;
  name: string;
  brand?: string;
  is_scanned?: boolean;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  weight: number; // g
  timestamp: number;
  category: MealCategory;
}

export interface UserStats {
  age: number;
  weight: number;
  height: number;
  gender: 'male' | 'female';
  activityLevel: number; // 1.2 to 2.4
  goal: 'cut' | 'maintain' | 'bulk';
  bodyFat?: number; // Optional extra data for better accuracy
}

export interface UserProfile {
  id: string;
  name: string;
  icon: string;
  color: string;
  stats: UserStats;
  targets: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

export interface Measurement {
  id: string;
  profileId: string;
  date: string;
  timestamp: number;
  weight: number;
  chest?: number;
  biceps?: number;
  waist?: number;
  thigh?: number;
  calf?: number;
}

interface DiaryState {
  currentDate: string;
  products: Product[];
  profiles: UserProfile[];
  activeProfileId: string;
  entries: MealEntry[];
  measurements: Measurement[];
  
  // UI States
  editingProduct: Product | null;
  selectionMode: {
    active: boolean;
    category: MealCategory | null;
  };
  isLoading: boolean;
  dbError: boolean;
  unsavedChanges: boolean;
  loadingStatus: string;
  loadingProgress: number;

  // Actions
  setDate: (date: string) => void;
  initialize: () => Promise<void>;
  sync: () => Promise<void>;
  
  // Profile Actions
  addProfile: (profile: Omit<UserProfile, 'id'>) => string;
  updateProfile: (id: string, data: Partial<UserProfile>) => void;
  deleteProfile: (id: string) => void;
  setActiveProfile: (id: string) => void;
  calculateTargets: (profileId: string) => void;

  // Product Actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  setEditingProduct: (product: Product | null) => void;
  
  // Entry Actions
  setSelectionMode: (active: boolean, category: MealCategory | null) => void;
  addEntry: (entry: Omit<MealEntry, 'id' | 'timestamp' | 'profileId'>) => void;
  removeEntry: (id: string) => void;
  updateEntry: (id: string, weight: number) => void;

  // Measurement Actions
  addMeasurement: (measurement: Omit<Measurement, 'id' | 'profileId' | 'timestamp'>) => void;
  updateMeasurement: (id: string, measurement: Partial<Measurement>) => void;
  deleteMeasurement: (id: string) => void;
}

export const useDiaryStore = create<DiaryState>((set) => ({
  currentDate: format(new Date(), 'yyyy-MM-dd'),
  products: [],
  profiles: [{
    id: 'default',
    name: 'Sportowiec',
    icon: 'User',
    color: 'bg-orange-500',
    stats: { age: 25, weight: 75, height: 180, gender: 'male', activityLevel: 1.375, goal: 'maintain' },
    targets: { calories: 2500, protein: 160, fat: 80, carbs: 280 }
  }],
  activeProfileId: 'default',
  entries: [],
  measurements: [],
  editingProduct: null,
  selectionMode: { active: false, category: null },
  isLoading: true,
  dbError: false,
  unsavedChanges: false,
  loadingStatus: 'Inicjalizacja...',
  loadingProgress: 0,

  setDate: (date) => set({ currentDate: date }),

  initialize: async () => {
    set({ isLoading: true, dbError: false, loadingStatus: 'Łączenie z bazą danych...', loadingProgress: 10 });
    try {
      const data = await fetchAllData();
      set({ loadingStatus: 'Przetwarzanie danych...', loadingProgress: 70 });
      
      if (data && data.profiles && data.profiles.length > 0) {
        set({
          products: data.products || [],
          profiles: data.profiles,
          activeProfileId: data.activeProfileId || 'default',
          entries: data.entries || [],
          measurements: data.measurements || [],
          unsavedChanges: false,
          loadingProgress: 90
        });
      }
      set({ loadingStatus: 'Gotowe', loadingProgress: 100 });
    } catch (error) {
      console.error('Initialization error:', error);
      set({ dbError: true, loadingStatus: 'Błąd połączenia', loadingProgress: 0 });
    } finally {
      setTimeout(() => set({ isLoading: false }), 500); // Small delay to show 100%
    }
  },

  sync: async () => {
    const state = useDiaryStore.getState();
    set({ isLoading: true, loadingStatus: 'Przygotowanie do zapisu...', loadingProgress: 0 });
    try {
      set({ loadingStatus: 'Zapisywanie profili...', loadingProgress: 20 });
      await syncProfiles(state.profiles);
      
      set({ loadingStatus: 'Zapisywanie produktów...', loadingProgress: 40 });
      await syncProducts(state.products);
      
      set({ loadingStatus: 'Zapisywanie dziennika...', loadingProgress: 60 });
      await syncEntries(state.entries);

      set({ loadingStatus: 'Zapisywanie pomiarów...', loadingProgress: 80 });
      await syncMeasurements(state.measurements);
      
      set({ loadingStatus: 'Zapisywanie ustawień...', loadingProgress: 90 });
      await syncSettings(state.activeProfileId);
      
      set({ unsavedChanges: false, loadingStatus: 'Zapisano pomyślnie!', loadingProgress: 100 });
    } catch (error) {
      console.error('Sync error:', error);
      set({ dbError: true, loadingStatus: 'Błąd zapisu', loadingProgress: 0 });
    } finally {
      setTimeout(() => set({ isLoading: false }), 800);
    }
  },

  // Profile Implementation
  addProfile: (profile) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      profiles: [...state.profiles, { ...profile, id }],
      unsavedChanges: true
    }));
    return id;
  },

  updateProfile: (id, data) => set((state) => ({
    profiles: state.profiles.map(p => p.id === id ? { ...p, ...data } : p),
    unsavedChanges: true
  })),

  deleteProfile: (id) => set((state) => ({
    profiles: state.profiles.filter(p => p.id !== id),
    entries: state.entries.filter(e => e.profileId !== id),
    measurements: state.measurements.filter(m => m.profileId !== id),
    activeProfileId: state.activeProfileId === id ? state.profiles[0]?.id || '' : state.activeProfileId,
    unsavedChanges: true
  })),

  setActiveProfile: (id) => set({ activeProfileId: id, unsavedChanges: true }),

  calculateTargets: (profileId) => {
    set((state) => {
      const profileIndex = state.profiles.findIndex(p => p.id === profileId);
      if (profileIndex === -1) return state;

      const p = state.profiles[profileIndex];
      const { age, weight, height, gender, activityLevel, goal, bodyFat } = p.stats;
      
      let bmr;
      if (bodyFat && bodyFat > 0) {
          // Katch-McArdle Formula (more accurate if body fat is known)
          const lbm = weight * (1 - bodyFat / 100);
          bmr = 370 + (21.6 * lbm);
      } else {
          // Mifflin-St Jeor Equation
          bmr = 10 * weight + 6.25 * height - 5 * age;
          bmr += gender === 'male' ? 5 : -161;
      }

      let tdee = bmr * activityLevel;

      if (goal === 'cut') tdee -= 500;
      if (goal === 'bulk') tdee += 300;

      const targetCalories = Math.round(tdee);
      const targetProtein = Math.round(weight * 2);
      const targetFat = Math.round(weight * 0.8);
      const remainingCal = targetCalories - (targetProtein * 4 + targetFat * 9);
      const targetCarbs = Math.round(remainingCal / 4);

      const updatedProfile = {
        ...p,
        targets: { calories: targetCalories, protein: targetProtein, fat: targetFat, carbs: targetCarbs }
      };

      const newProfiles = [...state.profiles];
      newProfiles[profileIndex] = updatedProfile;
      return { profiles: newProfiles, unsavedChanges: true };
    });
  },

  // Product Implementation
  addProduct: (product) => set((state) => ({
    products: [...state.products, { ...product, id: Math.random().toString(36).substring(7) }],
    unsavedChanges: true
  })),

  updateProduct: (id, updatedProduct) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, ...updatedProduct } : p),
    unsavedChanges: true
  })),

  deleteProduct: (id) => set((state) => ({
    products: state.products.filter(p => p.id !== id),
    unsavedChanges: true
  })),

  setEditingProduct: (product) => set({ editingProduct: product }),

  // Entry Implementation
  setSelectionMode: (active, category) => set({ selectionMode: { active, category } }),

  addEntry: (entry) => set((state) => ({
    entries: [...state.entries, { 
      ...entry, 
      profileId: state.activeProfileId,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now()
    }],
    unsavedChanges: true
  })),

  removeEntry: (id) => set((state) => ({
    entries: state.entries.filter(e => e.id !== id),
    unsavedChanges: true
  })),

  updateEntry: (id, weight) => set((state) => {
    const entry = state.entries.find(e => e.id === id);
    if (!entry) return state;
    const ratio = weight / entry.weight;
    return {
      entries: state.entries.map(e => e.id === id ? {
        ...e,
        weight,
        calories: e.calories * ratio,
        protein: e.protein * ratio,
        fat: e.fat * ratio,
        carbs: e.carbs * ratio
      } : e),
      unsavedChanges: true
    };
  }),

  // Measurement Implementation
  addMeasurement: (measurement) => set((state) => ({
    measurements: [...state.measurements, {
      ...measurement,
      id: Math.random().toString(36).substring(7),
      profileId: state.activeProfileId,
      timestamp: Date.now()
    }],
    unsavedChanges: true
  })),

  updateMeasurement: (id, updatedData) => set((state) => ({
    measurements: state.measurements.map(m => m.id === id ? { ...m, ...updatedData } : m),
    unsavedChanges: true
  })),

  deleteMeasurement: (id) => set((state) => ({
    measurements: state.measurements.filter(m => m.id !== id),
    unsavedChanges: true
  })),
}));