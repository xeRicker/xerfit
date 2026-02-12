"use client";

import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { useDiaryStore } from "@/lib/store";
import ConnectionError from "@/components/ConnectionError";
import { AutoSaveListener } from "@/components/AutoSaveListener";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const initialize = useDiaryStore(state => state.initialize);
  const dbError = useDiaryStore(state => state.dbError);
  const isLoading = useDiaryStore(state => state.isLoading);
  const loadingStatus = useDiaryStore(state => state.loadingStatus);
  const loadingProgress = useDiaryStore(state => state.loadingProgress);

  useEffect(() => {
    setMounted(true);
    initialize();
  }, [initialize]);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
      <AutoSaveListener />
      {dbError && <ConnectionError />}
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-300">
          <div className="w-12 h-12 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin mb-6" />
          
          <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-[#FF6A00] transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          
          <span className="text-xs font-mono text-[#FF6A00] animate-pulse">
            {loadingStatus}
          </span>
        </div>
      )}
    </ThemeProvider>
  );
}