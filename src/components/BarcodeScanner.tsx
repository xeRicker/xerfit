"use client";

import { useEffect, useState, useRef, useId } from "react";
import { motion } from "framer-motion";
import { X, RefreshCw, AlertCircle, Flashlight, Keyboard, ArrowRight, ScanBarcode } from "lucide-react";
import { cn } from "@/lib/utils";

interface BarcodeScannerProps {
    onClose: () => void;
    onScan: (barcode: string) => void;
    onError?: (error: string) => void;
}

export function BarcodeScanner({ onClose, onScan, onError }: BarcodeScannerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isTorchOn, setIsTorchOn] = useState(false);
    const [showManualInput, setShowManualInput] = useState(false);
    const [manualCode, setManualCode] = useState("");
    const [hasTorch, setHasTorch] = useState(false);
    
    const scannerId = useId().replace(/:/g, ""); 
    const elementId = `reader-${scannerId}`;
    const scannerRef = useRef<any>(null);
    const isMountedRef = useRef(true);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        isMountedRef.current = true;
        return () => {
            document.body.style.overflow = '';
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (showManualInput) return;

        let html5QrCode: any = null;

        const initScanner = async () => {
            try {
                // Dynamic import to avoid SSR issues and heavy bundle load
                const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");
                
                if (!isMountedRef.current) return;
                
                // Cleanup previous instance if any
                if (scannerRef.current) {
                    try {
                        await scannerRef.current.stop();
                        scannerRef.current.clear();
                    } catch (e) {
                        // ignore stop error
                    }
                }

                const formatsToSupport = [ Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8 ];
                html5QrCode = new Html5Qrcode(elementId, { formatsToSupport, verbose: false });
                scannerRef.current = html5QrCode;

                const devices = await Html5Qrcode.getCameras();
                if (devices && devices.length) {
                    const backCamera = devices.find(d => {
                        const label = d.label.toLowerCase();
                        return label.includes('back') || label.includes('tył') || label.includes('environment');
                    }) || devices[0];
                    
                    const cameraId = backCamera.id;

                    await html5QrCode.start(
                        cameraId, 
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 },
                            aspectRatio: 1.0
                        },
                        (decodedText: string) => {
                            if (isMountedRef.current) {
                                // Stop scanning immediately after success
                                html5QrCode.stop().then(() => {
                                    onScan(decodedText);
                                }).catch(() => onScan(decodedText));
                            }
                        },
                        () => {}
                    );

                    // Check torch capability
                    try {
                        const track = html5QrCode.getRunningTrackCameraCapabilities();
                        // @ts-ignore
                        if (track && track.torchFeature && track.torchFeature.isSupported()) {
                            setHasTorch(true);
                        }
                    } catch (e) {
                         // Torch check failed, ignore
                    }
                    
                    if (isMountedRef.current) setIsLoading(false);
                } else {
                    throw new Error("Nie wykryto kamery.");
                }

            } catch (err: any) {
                console.error("Scanner init error:", err);
                if (isMountedRef.current) {
                    const errorMsg = "Nie udało się uruchomić kamery. Sprawdź uprawnienia.";
                    setError(errorMsg);
                    if (onError) onError(errorMsg);
                    setIsLoading(false);
                }
            }
        };

        // Small delay to ensure DOM is ready and prevent race conditions
        const timer = setTimeout(() => {
            initScanner();
        }, 300);

        return () => {
            clearTimeout(timer);
            if (html5QrCode) {
                html5QrCode.stop().then(() => {
                    html5QrCode.clear();
                }).catch(() => {
                    html5QrCode.clear();
                });
            }
        };
    }, [elementId, onScan, onError, showManualInput]);

    const toggleTorch = async () => {
        if (!scannerRef.current) return;
        try {
            await scannerRef.current.applyVideoConstraints({
                advanced: [{ torch: !isTorchOn }]
            });
            setIsTorchOn(!isTorchOn);
        } catch (e) {
            console.error("Torch toggle failed", e);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualCode) {
            onScan(manualCode);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
        >
            <div className="p-6 flex justify-between items-center z-10 pt-[env(safe-area-inset-top)] bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex flex-col mt-2">
                    <h2 className="text-xl font-black text-white tracking-tight">Skaner</h2>
                    <p className="text-xs text-white/50 font-bold uppercase tracking-widest flex items-center gap-1">
                        {showManualInput ? "Wpisz kod ręcznie" : "Skieruj kamerę na kod"}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {hasTorch && !showManualInput && (
                        <button 
                            onClick={toggleTorch}
                            className={cn(
                                "p-3 rounded-full transition-colors backdrop-blur-md",
                                isTorchOn ? "bg-white text-black" : "bg-white/10 text-white"
                            )}
                        >
                            <Flashlight size={20} className={isTorchOn ? "fill-current" : ""} />
                        </button>
                    )}
                    <button 
                        onClick={() => setShowManualInput(!showManualInput)}
                        className={cn(
                            "p-3 rounded-full transition-colors backdrop-blur-md",
                            showManualInput ? "bg-primary text-white" : "bg-white/10 text-white"
                        )}
                    >
                        <Keyboard size={20} />
                    </button>
                    <button 
                        onClick={onClose}
                        className="p-3 bg-white/10 rounded-full text-white active:scale-90 transition-transform backdrop-blur-md"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 relative flex flex-col items-center justify-center p-0 overflow-hidden">
                {!showManualInput ? (
                    <div className="w-full h-full relative bg-black flex flex-col items-center justify-center">
                         {/* The scanner element must be in DOM */}
                        <div id={elementId} className="w-full h-full object-cover absolute inset-0 [&>video]:object-cover [&>video]:w-full [&>video]:h-full" />

                        {error && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/90 backdrop-blur-md z-20 p-8 text-center">
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
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20 bg-black">
                                <RefreshCw className="text-primary animate-spin" size={32} />
                                <span className="text-xs font-bold text-white uppercase tracking-widest">Uruchamianie kamery...</span>
                            </div>
                        )}
                        
                        {/* Overlay */}
                        {!isLoading && !error && (
                            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
                                <div className="w-64 h-64 border-2 border-white/50 rounded-3xl relative overflow-hidden shadow-[0_0_0_100vmax_rgba(0,0,0,0.6)]">
                                     <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl z-20"></div>
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl z-20"></div>
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl z-20"></div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl z-20"></div>
                                    
                                    <motion.div 
                                        initial={{ top: 0, opacity: 0 }}
                                        animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
                                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_rgba(255,0,0,0.8)] z-10"
                                    />
                                </div>
                                <p className="mt-8 text-xs font-bold text-white/70 bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">
                                    Umieść kod w ramce
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <motion.form 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onSubmit={handleManualSubmit}
                        className="w-full max-w-sm bg-[#1C1C1E] p-6 rounded-[32px] flex flex-col gap-4 border border-white/10 mx-6"
                    >
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Numer Barcode</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={manualCode}
                                    onChange={(e) => setManualCode(e.target.value)}
                                    placeholder="np. 5900..."
                                    className="w-full bg-black/30 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xl font-bold outline-none focus:border-primary transition-colors placeholder:text-white/20"
                                    autoFocus
                                    inputMode="numeric"
                                />
                                <ScanBarcode className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                            </div>
                        </div>
                        <button 
                            type="submit"
                            disabled={!manualCode}
                            className="h-14 bg-primary rounded-2xl flex items-center justify-center gap-2 font-bold text-white shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale"
                        >
                            Szukaj <ArrowRight size={20} />
                        </button>
                    </motion.form>
                )}
            </div>
        </motion.div>
    );
}
