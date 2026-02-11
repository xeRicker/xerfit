"use client";

import { useEffect, useState, useRef } from "react";
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
    const scannerRef = useRef<any>(null);
    const mountedRef = useRef(false);

    const addLog = (msg: string) => {
        setLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${msg}`]);
    };

    const stopScanner = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                addLog("Stopping...");
                await scannerRef.current.stop();
                addLog("Stopped.");
            } catch (err) {
                addLog(`Stop err: ${err}`);
            }
        }
    };

    const startScanner = async () => {
        try {
            setError(null);
            setIsLoading(true);
            addLog("Dynamic import starting...");
            
            // DYNAMIC IMPORT OF THE LIBRARY
            const { Html5Qrcode } = await import("html5-qrcode");
            addLog("Library loaded.");

            if (!mountedRef.current) return;

            const element = document.getElementById("reader");
            if (!element) {
                addLog("DOM error: #reader not found");
                return;
            }

            const html5QrCode = new Html5Qrcode("reader");
            scannerRef.current = html5QrCode;
            addLog("Instance ready.");

            const config = { 
                fps: 10, 
                qrbox: { width: 250, height: 150 },
                aspectRatio: 1.0
            };

            addLog("Requesting camera...");
            await html5QrCode.start(
                { facingMode: "environment" }, 
                config, 
                (decodedText) => {
                    addLog("MATCH!");
                    html5QrCode.stop().then(() => onScan(decodedText)).catch(() => onScan(decodedText));
                },
                () => {}
            );

            addLog("Camera active.");
            setIsLoading(false);
        } catch (err: any) {
            addLog(`ERR: ${err?.message || "Check permissions/HTTPS"}`);
            setError(`Błąd: ${err?.message || "Problem z dostępem do aparatu"}`);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        mountedRef.current = true;
        addLog("Init...");
        
        const timer = setTimeout(() => {
            if (mountedRef.current) startScanner();
        }, 800);

        return () => {
            mountedRef.current = false;
            clearTimeout(timer);
            stopScanner();
        };
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
        >
            <div className="p-6 flex justify-between items-center z-10">
                <div className="flex flex-col">
                    <h2 className="text-xl font-black text-white tracking-tight">Skaner</h2>
                    <p className="text-xs text-white/50 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Info size={10} /> Safe Mode
                    </p>
                </div>
                <button 
                    onClick={onClose}
                    className="p-3 bg-white/10 rounded-full text-white active:scale-90"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 relative flex items-center justify-center p-6">
                <div 
                    id="reader" 
                    className="w-full max-w-sm aspect-square overflow-hidden rounded-[32px] border-2 border-white/20 relative bg-zinc-900"
                >
                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 backdrop-blur-md z-10 p-8 text-center">
                            <AlertCircle className="text-error" size={40} />
                            <p className="text-sm font-bold text-white leading-relaxed">{error}</p>
                            <button 
                                onClick={startScanner}
                                className="mt-4 px-6 py-3 bg-primary rounded-full text-white text-xs font-bold uppercase tracking-widest"
                            >
                                Spróbuj ponownie
                            </button>
                        </div>
                    )}
                    
                    {isLoading && !error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
                            <RefreshCw className="text-primary animate-spin" size={32} />
                            <span className="text-xs font-bold text-white uppercase tracking-widest">Ładowanie...</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="px-6 pb-4">
                <div className="bg-white/5 rounded-2xl p-4 font-mono text-[9px] text-white/40 flex flex-col gap-1">
                    <p className="font-bold text-white/60 mb-1 border-b border-white/5 pb-1 uppercase tracking-tighter">Debug Log:</p>
                    {logs.map((log, i) => (
                        <div key={i} className="truncate">{log}</div>
                    ))}
                    {logs.length === 0 && <p>Wating...</p>}
                </div>
            </div>

            <div className="p-6 pt-0 flex flex-col items-center gap-4 z-10">
                <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest">
                    <Camera size={14} />
                    OFF API
                </div>
            </div>
        </motion.div>
    );
}
