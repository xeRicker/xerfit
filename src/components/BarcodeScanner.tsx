"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Zap, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BarcodeScannerProps {
    onClose: () => void;
    onScan: (barcode: string) => void;
}

export function BarcodeScanner({ onClose, onScan }: BarcodeScannerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        const startScanner = async () => {
            try {
                const html5QrCode = new Html5Qrcode("reader");
                scannerRef.current = html5QrCode;

                const config = { 
                    fps: 10, 
                    qrbox: { width: 250, height: 150 },
                    aspectRatio: 1.0
                };

                await html5QrCode.start(
                    { facingMode: "environment" }, 
                    config, 
                    (decodedText) => {
                        html5QrCode.stop().then(() => {
                            onScan(decodedText);
                        });
                    },
                    undefined
                );
                setIsLoading(false);
            } catch (err: any) {
                console.error("Scanner Error:", err);
                setError("Błąd dostępu do aparatu. Upewnij się, że udzieliłeś uprawnień.");
                setIsLoading(false);
            }
        };

        startScanner();

        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, [onScan]);

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col"
        >
            <div className="p-6 flex justify-between items-center z-10">
                <div className="flex flex-col">
                    <h2 className="text-xl font-black text-white tracking-tight">Skaner Barcode</h2>
                    <p className="text-xs text-white/50 font-bold uppercase tracking-widest">Zeskanuj kod kreskowy produktu</p>
                </div>
                <button 
                    onClick={onClose}
                    className="p-3 bg-white/10 rounded-full text-white active:scale-90"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 relative flex flex-center items-center justify-center p-6">
                <div 
                    id="reader" 
                    className="w-full max-w-sm aspect-square overflow-hidden rounded-[32px] border-2 border-white/20 relative"
                >
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/40 backdrop-blur-md z-10">
                            <RefreshCw className="text-primary animate-spin" size={32} />
                            <span className="text-xs font-bold text-white uppercase tracking-widest">Inicjalizacja aparatu...</span>
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-md z-10 p-8 text-center">
                            <AlertCircle className="text-error" size={40} />
                            <p className="text-sm font-bold text-white leading-relaxed">{error}</p>
                            <button 
                                onClick={() => window.location.reload()}
                                className="mt-4 px-6 py-3 bg-white/10 rounded-full text-white text-xs font-bold uppercase tracking-widest"
                            >
                                Spróbuj ponownie
                            </button>
                        </div>
                    )}
                </div>

                {/* Overlays */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                     <div className="w-full max-w-sm aspect-square relative">
                        {/* Corners */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl" />
                        
                        {/* Scanning Line Animation */}
                        <motion.div 
                            animate={{ top: ["0%", "100%"] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="absolute left-4 right-4 h-0.5 bg-primary/50 shadow-[0_0_15px_rgba(255,106,0,0.8)]"
                        />
                     </div>
                </div>
            </div>

            <div className="p-10 flex flex-col items-center gap-4 z-10">
                <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest">
                    <Camera size={14} />
                    Powered by Open Food Facts
                </div>
                <p className="text-center text-xs text-white/60 leading-relaxed px-10">
                    Skieruj aparat na kod kreskowy. Dane zostaną automatycznie pobrane z bazy Open Food Facts.
                </p>
            </div>
        </motion.div>
    );
}
