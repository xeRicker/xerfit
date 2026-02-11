"use client";

import { useEffect, useState, useRef, useId } from "react";
import { motion } from "framer-motion";
import { X, Camera, RefreshCw, AlertCircle, Info } from "lucide-react";

interface BarcodeScannerProps {
    onClose: () => void;
    onScan: (barcode: string) => void;
}

export function BarcodeScanner({ onClose, onScan }: BarcodeScannerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    
    // Unique ID for this instance to avoid DOM collisions
    const scannerId = useId().replace(/:/g, ""); 
    const elementId = `reader-${scannerId}`;
    
    const scannerRef = useRef<any>(null);
    const isScanningRef = useRef(false);
    const shouldStopRef = useRef(false);
    const isMountedRef = useRef(true);

    const addLog = (msg: string) => {
        console.log(`[Scanner] ${msg}`);
        if (isMountedRef.current) {
            setLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${msg}`]);
        }
    };

    useEffect(() => {
        isMountedRef.current = true;
        let ignore = false;
        
        const initScanner = async () => {
            try {
                addLog("Importing library...");
                const { Html5Qrcode } = await import("html5-qrcode");
                
                if (ignore || !isMountedRef.current) return;
                
                addLog("Library loaded.");
                
                // Ensure element exists
                const element = document.getElementById(elementId);
                if (!element) {
                    throw new Error("Scanner element not found");
                }

                // Create instance
                const html5QrCode = new Html5Qrcode(elementId);
                scannerRef.current = html5QrCode;

                const config = { 
                    fps: 10, 
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    disableFlip: false
                };

                addLog("Starting camera...");
                
                // Start scanning
                await html5QrCode.start(
                    { facingMode: "environment" }, 
                    config, 
                    (decodedText) => {
                        if (ignore || !isMountedRef.current) return;
                        addLog("Scanned!");
                        
                        // Stop immediately on success
                        stopScanner().then(() => {
                             if (isMountedRef.current) onScan(decodedText);
                        });
                    },
                    (errorMessage) => {
                        // ignore parse errors
                    }
                );

                if (ignore || !isMountedRef.current || shouldStopRef.current) {
                    addLog("Aborting start (unmounted).");
                    await stopScanner();
                    return;
                }

                isScanningRef.current = true;
                if (isMountedRef.current) setIsLoading(false);
                addLog("Camera active.");

            } catch (err: any) {
                if (ignore || !isMountedRef.current) return;
                console.error("Scanner init error:", err);
                if (isMountedRef.current) {
                    setError(err?.message || "Nie udało się uruchomić kamery.");
                    setIsLoading(false);
                }
                addLog(`Error: ${err?.message}`);
            }
        };

        // Small delay to ensure DOM is ready and animations settled
        const timer = setTimeout(initScanner, 500);

        return () => {
            ignore = true;
            isMountedRef.current = false;
            shouldStopRef.current = true;
            clearTimeout(timer);
            stopScanner();
        };
    }, [elementId, onScan]);

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                if (isScanningRef.current) {
                    addLog("Stopping scanner...");
                    await scannerRef.current.stop();
                    isScanningRef.current = false;
                    addLog("Scanner stopped.");
                }
                scannerRef.current.clear();
            } catch (err) {
                console.warn("Failed to stop scanner:", err);
            }
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
        >
            <div className="p-6 flex justify-between items-center z-10 pt-[env(safe-area-inset-top)]">
                <div className="flex flex-col mt-4">
                    <h2 className="text-xl font-black text-white tracking-tight">Skaner</h2>
                    <p className="text-xs text-white/50 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Info size={10} /> v2.1
                    </p>
                </div>
                <button 
                    onClick={onClose}
                    className="p-3 bg-white/10 rounded-full text-white active:scale-90 transition-transform mt-4"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 relative flex items-center justify-center p-6">
                <div 
                    id={elementId}
                    className="w-full max-w-sm aspect-square overflow-hidden rounded-[32px] border-2 border-white/20 relative bg-zinc-900 shadow-2xl shadow-black"
                >
                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 backdrop-blur-md z-10 p-8 text-center">
                            <AlertCircle className="text-error" size={40} />
                            <p className="text-sm font-bold text-white leading-relaxed">{error}</p>
                            <button 
                                onClick={() => window.location.reload()}
                                className="mt-4 px-6 py-3 bg-primary rounded-full text-white text-xs font-bold uppercase tracking-widest"
                            >
                                Odśwież aplikację
                            </button>
                        </div>
                    )}
                    
                    {isLoading && !error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
                            <RefreshCw className="text-primary animate-spin" size={32} />
                            <span className="text-xs font-bold text-white uppercase tracking-widest">Uruchamianie kamery...</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="px-6 pb-[calc(env(safe-area-inset-bottom)+32px)]">
                <div className="bg-white/5 rounded-2xl p-4 font-mono text-[9px] text-white/40 flex flex-col gap-1 max-h-32 overflow-y-auto">
                    <p className="font-bold text-white/60 mb-1 border-b border-white/5 pb-1 uppercase tracking-tighter">Debug Log:</p>
                    {logs.map((log, i) => (
                        <div key={i} className="truncate">{log}</div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
