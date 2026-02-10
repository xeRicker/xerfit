'use client'

import { motion } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function ConnectionError() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-xl"
    >
      <div className="max-w-xs w-full p-8 rounded-3xl bg-white/10 border border-white/20 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
          <WifiOff className="w-10 h-10 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">Brak połączenia</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Nie udało się nawiązać połączenia z bazą danych. Sprawdź swoje ustawienia lub spróbuj ponownie później.
          </p>
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="w-full py-4 rounded-2xl bg-[#FF6A00] text-white font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <RefreshCw className="w-5 h-5" />
          Odśwież
        </button>
      </div>
    </motion.div>
  );
}
