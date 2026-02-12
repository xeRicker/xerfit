"use client";

import { useEffect, useRef } from "react";
import { useDiaryStore } from "@/lib/store";

export function AutoSaveListener() {
  const { sync, pendingChanges } = useDiaryStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const hasPendingChanges = Object.values(pendingChanges).some(Boolean);

    if (hasPendingChanges) {
      if (timerRef.current) clearTimeout(timerRef.current);
      
      timerRef.current = setTimeout(() => {
        sync();
      }, 2000); // 2 seconds debounce
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pendingChanges, sync]);

  return null;
}
