"use client";

import { useEffect, useState, useRef, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, AlertCircle, Info, Flashlight, Keyboard, ArrowRight, ScanBarcode } from "lucide-react";
import { cn } from "@/lib/utils";

interface BarcodeScannerProps {
    onClose: () => void;
    onScan: (barcode: string) => void;
}

export function BarcodeScanner({ onClose, onScan }: BarcodeScannerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Scanner State
    const [isTorchOn, setIsTorchOn] = useState(false);
    const [showManualInput, setShowManualInput] = useState(false);
    const [manualCode, setManualCode] = useState("");
    const [hasTorch, setHasTorch] = useState(false);
    const [statusMessage, setStatusMessage] = useState("Szukam kodu...");

    const scannerId = useId().replace(/:/g, ""); 
    const hiddenElementId = `hidden-reader-${scannerId}`;
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scannerInstanceRef = useRef<any>(null);
    const isScanningRef = useRef(false);
    const isMountedRef = useRef(true);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        isMountedRef.current = true;
        let scanInterval: NodeJS.Timeout;

        const initScanner = async () => {
            try {
                const { Html5Qrcode } = await import("html5-qrcode");
                
                if (!isMountedRef.current) return;
                
                scannerInstanceRef.current = new Html5Qrcode(hiddenElementId);

                // Manual getUserMedia
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "environment",
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    },
                    audio: false
                });
                
                streamRef.current = stream;

                const track = stream.getVideoTracks()[0];
                if (track) {
                    const capabilities = track.getCapabilities();
                    
                    // Torch Support
                    // @ts-ignore
                    if (capabilities.torch) {
                        setHasTorch(true);
                    }

                    // Zoom Support (Auto-zoom to 2x or max)
                    // @ts-ignore
                    if (capabilities.zoom) {
                        // @ts-ignore
                        const maxZoom = capabilities.zoom.max;
                        // @ts-ignore
                        const minZoom = capabilities.zoom.min;
                        const targetZoom = Math.min(Math.max(2.0, minZoom), maxZoom); 
                        // @ts-ignore
                        track.applyConstraints({ advanced: [{ zoom: targetZoom }] }).catch(() => {});
                    }
                }

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                         if (videoRef.current) {
                             videoRef.current.play().catch(e => console.error(e));
                             setIsLoading(false);
                             startScanningLoop();
                         }
                    };
                }

            } catch (err: any) {
                console.error("Scanner init error:", err);
                if (isMountedRef.current) {
                    setError(err?.message || "Nie udało się uruchomić kamery.");
                    setIsLoading(false);
                }
            }
        };

        const startScanningLoop = () => {
            if (!isMountedRef.current) return;
            isScanningRef.current = true;
            
            // Scan every 500ms
            scanInterval = setInterval(async () => {
                if (!isScanningRef.current || !videoRef.current || !canvasRef.current || !scannerInstanceRef.current || showManualInput) return;
                
                if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                    try {
                        const canvas = canvasRef.current;
                        const video = videoRef.current;
                        const ctx = canvas.getContext('2d', { willReadFrequently: true });
                        if (!ctx) return;

                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                        canvas.toBlob(async (blob) => {
                            if (!blob || !isScanningRef.current) return;
                            setStatusMessage("Analizuję...");
                            
                            const file = new File([blob], "frame.png", { type: "image/png" });
                            
                            try {
                                const result = await scannerInstanceRef.current.scanFile(file, false);
                                if (result) {
                                    isScanningRef.current = false;
                                    clearInterval(scanInterval);
                                    if (streamRef.current) {
                                        streamRef.current.getTracks().forEach(track => track.stop());
                                    }
                                    onScan(result);
                                }
                            } catch (scanErr) {
                                setStatusMessage("Szukam kodu...");
                            }
                        }, 'image/png');

                    } catch (err) {
                        // Frame capture error
                    }
                }
            }, 500);
        };

        initScanner();

        return () => {
            isMountedRef.current = false;
            isScanningRef.current = false;
            clearInterval(scanInterval);
            
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => {
                    // Turn off torch before stopping
                    track.applyConstraints({ advanced: [{ torch: false } as any] }).catch(() => {});
                    track.stop();
                });
            }
            
            if (scannerInstanceRef.current) {
                try { scannerInstanceRef.current.clear(); } catch (e) {}
            }
        };
    }, [hiddenElementId, onScan, showManualInput]);

    const toggleTorch = async () => {
        if (!streamRef.current) return;
        const track = streamRef.current.getVideoTracks()[0];
        if (!track) return;

        try {
            await track.applyConstraints({
                advanced: [{ torch: !isTorchOn } as any]
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
            <div className="p-6 flex justify-between items-center z-10 pt-[env(safe-area-inset-top)]">
                <div className="flex flex-col mt-4">
                    <h2 className="text-xl font-black text-white tracking-tight">Skaner</h2>
                    <p className="text-xs text-white/50 font-bold uppercase tracking-widest flex items-center gap-1">
                        {showManualInput ? "Wpisz kod ręcznie" : statusMessage}
                    </p>
                </div>
                <div className="flex items-center gap-3 mt-4">
                    {hasTorch && !showManualInput && (
                        <button 
                            onClick={toggleTorch}
                            className={cn(
                                "p-3 rounded-full transition-colors",
                                isTorchOn ? "bg-white text-black" : "bg-white/10 text-white"
                            )}
                        >
                            <Flashlight size={20} className={isTorchOn ? "fill-current" : ""} />
                        </button>
                    )}
                    <button 
                        onClick={() => setShowManualInput(!showManualInput)}
                        className={cn(
                            "p-3 rounded-full transition-colors",
                            showManualInput ? "bg-primary text-white" : "bg-white/10 text-white"
                        )}
                    >
                        <Keyboard size={20} />
                    </button>
                    <button 
                        onClick={onClose}
                        className="p-3 bg-white/10 rounded-full text-white active:scale-90 transition-transform"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 relative flex flex-col items-center justify-center p-6">
                {!showManualInput ? (
                    <div className="w-full max-w-sm aspect-square overflow-hidden rounded-[32px] border-2 border-white/20 relative bg-zinc-900 shadow-2xl shadow-black">
                        {!error && (
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover"
                                playsInline
                                muted
                                autoPlay
                            />
                        )}

                        <div id={hiddenElementId} className="hidden"></div>
                        <canvas ref={canvasRef} className="hidden"></canvas>

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
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-black/50 backdrop-blur-sm">
                                <RefreshCw className="text-primary animate-spin" size={32} />
                                <span className="text-xs font-bold text-white uppercase tracking-widest">Uruchamianie kamery...</span>
                            </div>
                        )}
                        
                        {/* Scanner overlay guide & Animation */}
                        {!isLoading && !error && (
                            <div className="absolute inset-0 border-2 border-white/30 m-12 rounded-2xl pointer-events-none overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary -mt-1 -ml-1 rounded-tl-lg z-20"></div>
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary -mt-1 -mr-1 rounded-tr-lg z-20"></div>
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary -mb-1 -ml-1 rounded-bl-lg z-20"></div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary -mb-1 -mr-1 rounded-br-lg z-20"></div>
                                
                                <motion.div 
                                    initial={{ top: 0, opacity: 0 }}
                                    animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_rgba(255,0,0,0.8)] z-10"
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <motion.form 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onSubmit={handleManualSubmit}
                        className="w-full max-w-sm bg-[#1C1C1E] p-6 rounded-[32px] flex flex-col gap-4 border border-white/10"
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

            <div className="px-6 pb-[calc(env(safe-area-inset-bottom)+32px)]">
                {!showManualInput && (
                    <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-center gap-3 text-center">
                        <Info size={16} className="text-white/50 shrink-0" />
                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                            Umieść kod kreskowy wewnątrz ramki. <br/>
                            {hasTorch && "Włącz latarkę jeśli jest ciemno."}
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
