"use client";

import { useEffect, useState, useRef, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, AlertCircle, Flashlight, Keyboard, ArrowRight, ScanBarcode, SwitchCamera, FlashlightOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface BarcodeScannerProps {
    onClose: () => void;
    onScan: (barcode: string) => void;
    onError?: (error: string) => void;
}

export function BarcodeScanner({ onClose, onScan, onError }: BarcodeScannerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Camera State
    const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
    const [currentCameraId, setCurrentCameraId] = useState<string | null>(null);
    
    // Features State
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

    // Initial Camera Setup
    useEffect(() => {
        if (showManualInput) return;

        const initScanner = async () => {
            try {
                // Dynamic import
                const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");
                
                if (!isMountedRef.current) return;
                
                // Fetch cameras first
                const devices = await Html5Qrcode.getCameras();
                if (!devices || devices.length === 0) {
                    throw new Error("Nie wykryto kamery.");
                }
                
                setCameras(devices);

                // Select initial camera (Back camera preference)
                const backCamera = devices.find(d => {
                    const label = d.label.toLowerCase();
                    return label.includes('back') || label.includes('tył') || label.includes('environment');
                }) || devices[0];
                
                setCurrentCameraId(backCamera.id);

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

        initScanner();
    }, [onError, showManualInput]);

    // Camera Stream Management (Start/Stop when camera ID changes)
    useEffect(() => {
        if (!currentCameraId || showManualInput) return;

        let html5QrCode: any = null;

        const startStream = async () => {
            setIsLoading(true);
            setHasTorch(false);
            setIsTorchOn(false);

            try {
                const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");
                
                // Cleanup previous
                if (scannerRef.current) {
                    try {
                        await scannerRef.current.stop();
                        scannerRef.current.clear();
                    } catch (e) {
                         // ignore
                    }
                }

                const formatsToSupport = [ Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8 ];
                html5QrCode = new Html5Qrcode(elementId, { formatsToSupport, verbose: false });
                scannerRef.current = html5QrCode;

                await html5QrCode.start(
                    currentCameraId, 
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0
                    },
                    (decodedText: string) => {
                        if (isMountedRef.current) {
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
                    // Torch check failed
                }
                
                if (isMountedRef.current) setIsLoading(false);

            } catch (err) {
                console.error("Camera start error:", err);
                setIsLoading(false);
            }
        };

        // Small delay to prevent rapid switching issues
        const timer = setTimeout(() => {
            startStream();
        }, 300);

        return () => {
            clearTimeout(timer);
            if (html5QrCode) {
                html5QrCode.stop().then(() => html5QrCode.clear()).catch(() => html5QrCode.clear());
            }
        };
    }, [currentCameraId, elementId, onScan, showManualInput]);

    const toggleCamera = () => {
        if (cameras.length < 2) return;
        
        const currentIndex = cameras.findIndex(c => c.id === currentCameraId);
        const nextIndex = (currentIndex + 1) % cameras.length;
        setCurrentCameraId(cameras[nextIndex].id);
    };

    const toggleTorch = async () => {
        // If we have hardware torch, toggle it
        if (hasTorch && scannerRef.current) {
            try {
                await scannerRef.current.applyVideoConstraints({
                    advanced: [{ torch: !isTorchOn }]
                });
                setIsTorchOn(!isTorchOn);
            } catch (e) {
                console.error("Torch toggle failed", e);
            }
        } else {
            // "Selfie Flash" - simple white screen mode
            setIsTorchOn(!isTorchOn);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualCode) {
            onScan(manualCode);
        }
    };

    // Check if current camera is front-facing (heuristic)
    const isFrontCamera = currentCameraId && cameras.find(c => c.id === currentCameraId)?.label.toLowerCase().includes('front');
    // If no hardware torch, we use screen flash
    const useScreenFlash = isTorchOn && (!hasTorch || isFrontCamera);

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
        >
            {/* Screen Flash Overlay */}
            <AnimatePresence>
                {useScreenFlash && (
                     <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.9 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[200] bg-white pointer-events-none"
                     />
                )}
            </AnimatePresence>

            <div className="p-6 flex justify-between items-center z-[210] pt-[env(safe-area-inset-top)] bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex flex-col mt-2">
                    <h2 className={cn("text-xl font-black tracking-tight transition-colors", useScreenFlash ? "text-black" : "text-white")}>Skaner</h2>
                    <p className={cn("text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-colors", useScreenFlash ? "text-black/50" : "text-white/50")}>
                        {showManualInput ? "Wpisz kod ręcznie" : "Skieruj kamerę na kod"}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Torch / Flash Button */}
                    {!showManualInput && (
                        <button 
                            onClick={toggleTorch}
                            className={cn(
                                "p-3 rounded-full transition-colors backdrop-blur-md relative",
                                isTorchOn ? "bg-white text-black" : "bg-white/10 text-white",
                                useScreenFlash && isTorchOn ? "bg-black/10 text-black border border-black/10" : ""
                            )}
                        >
                            {isTorchOn ? <FlashlightOff size={20} /> : <Flashlight size={20} />}
                        </button>
                    )}

                    {/* Camera Flip Button */}
                    {!showManualInput && cameras.length > 1 && (
                        <button 
                            onClick={toggleCamera}
                            className={cn(
                                "p-3 rounded-full transition-colors backdrop-blur-md",
                                useScreenFlash ? "bg-black/10 text-black" : "bg-white/10 text-white"
                            )}
                        >
                            <SwitchCamera size={20} />
                        </button>
                    )}

                    <button 
                        onClick={() => setShowManualInput(!showManualInput)}
                        className={cn(
                            "p-3 rounded-full transition-colors backdrop-blur-md",
                            showManualInput ? "bg-primary text-white" : (useScreenFlash ? "bg-black/10 text-black" : "bg-white/10 text-white")
                        )}
                    >
                        <Keyboard size={20} />
                    </button>
                    <button 
                        onClick={onClose}
                        className={cn(
                            "p-3 rounded-full active:scale-90 transition-transform backdrop-blur-md",
                             useScreenFlash ? "bg-black/10 text-black" : "bg-white/10 text-white"
                        )}
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 relative flex flex-col items-center justify-center p-0 overflow-hidden">
                {!showManualInput ? (
                    <div className="w-full h-full relative bg-black flex flex-col items-center justify-center">
                         {/* The scanner element must be in DOM */}
                         {/* CSS FIX: [&>video]:!w-full [&>video]:!h-full [&>video]:!object-cover ensures video fills container without extra borders */}
                        <div id={elementId} className="w-full h-full absolute inset-0 [&>video]:!w-full [&>video]:!h-full [&>video]:!object-cover overflow-hidden" />

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
                        className="w-full max-w-sm bg-[#1C1C1E] p-6 rounded-[32px] flex flex-col gap-4 border border-white/10 mx-6 z-[210]"
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
