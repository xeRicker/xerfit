"use client";

import { useEffect, useState, useRef, useId } from "react";
import { motion } from "framer-motion";
import { X, RefreshCw, AlertCircle, Info } from "lucide-react";

interface BarcodeScannerProps {
    onClose: () => void;
    onScan: (barcode: string) => void;
}

export function BarcodeScanner({ onClose, onScan }: BarcodeScannerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    
    const scannerId = useId().replace(/:/g, ""); 
    const hiddenElementId = `hidden-reader-${scannerId}`;
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scannerInstanceRef = useRef<any>(null);
    const isScanningRef = useRef(false);
    const isMountedRef = useRef(true);
    const streamRef = useRef<MediaStream | null>(null);

    const addLog = (msg: string) => {
        console.log(`[Scanner] ${msg}`);
        if (isMountedRef.current) {
            setLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${msg}`]);
        }
    };

    useEffect(() => {
        isMountedRef.current = true;
        let scanInterval: NodeJS.Timeout;

        const initScanner = async () => {
            try {
                addLog("Initializing custom scanner...");
                const { Html5Qrcode } = await import("html5-qrcode");
                
                if (!isMountedRef.current) return;
                
                // Initialize Html5Qrcode with a hidden element (required by library)
                // We won't use it for the live feed, just for decoding
                scannerInstanceRef.current = new Html5Qrcode(hiddenElementId);

                addLog("Requesting camera...");
                
                // Manual getUserMedia for better control and stability
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "environment",
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    },
                    audio: false
                });
                
                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    // Wait for video to be ready
                    videoRef.current.onloadedmetadata = () => {
                         if (videoRef.current) {
                             videoRef.current.play().catch(e => addLog(`Play error: ${e}`));
                             setIsLoading(false);
                             addLog("Camera active.");
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
                addLog(`Error: ${err?.message}`);
            }
        };

        const startScanningLoop = () => {
            if (!isMountedRef.current) return;
            
            isScanningRef.current = true;
            
            // Scan every 500ms
            scanInterval = setInterval(async () => {
                if (!isScanningRef.current || !videoRef.current || !canvasRef.current || !scannerInstanceRef.current) return;
                
                if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                    try {
                        const canvas = canvasRef.current;
                        const video = videoRef.current;
                        const ctx = canvas.getContext('2d', { willReadFrequently: true });
                        
                        if (!ctx) return;

                        // Set canvas dimensions to match video
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;

                        // Draw current frame
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                        // Create a file/blob from the canvas
                        canvas.toBlob(async (blob) => {
                            if (!blob || !isScanningRef.current) return;
                            
                            const file = new File([blob], "frame.png", { type: "image/png" });
                            
                            try {
                                // Use scanFile which is stable for static images
                                const result = await scannerInstanceRef.current.scanFile(file, false);
                                
                                if (result) {
                                    addLog(`Scanned: ${result}`);
                                    isScanningRef.current = false;
                                    clearInterval(scanInterval);
                                    if (streamRef.current) {
                                        streamRef.current.getTracks().forEach(track => track.stop());
                                    }
                                    onScan(result);
                                }
                            } catch (scanErr) {
                                // No code found in this frame, ignore
                            }
                        }, 'image/png');

                    } catch (err) {
                        // Frame capture error, ignore
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
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            
            if (scannerInstanceRef.current) {
                try {
                    scannerInstanceRef.current.clear();
                } catch (e) {
                    // ignore
                }
            }
        };
    }, [hiddenElementId, onScan]);

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
                        Szukam kodu...
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
                <div className="w-full max-w-sm aspect-square overflow-hidden rounded-[32px] border-2 border-white/20 relative bg-zinc-900 shadow-2xl shadow-black">
                    {/* Native Video Element */}
                    {!error && (
                        <video
                            ref={videoRef}
                            className="w-full h-full object-cover"
                            playsInline
                            muted
                            autoPlay
                        />
                    )}

                    {/* Hidden elements for processing */}
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
                            
                            {/* Laser Animation */}
                            <motion.div 
                                initial={{ top: 0 }}
                                animate={{ top: "100%" }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="absolute left-0 right-0 h-0.5 bg-red-500/80 shadow-[0_0_15px_rgba(255,0,0,0.8)] z-10"
                            />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
