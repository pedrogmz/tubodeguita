import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  Barcode,
  X,
  Search,
  Check,
  AlertCircle,
  RefreshCw,
  Upload,
  Zap,
  ZapOff,
  SwitchCamera,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import {
  BrowserMultiFormatReader,
  DecodeHintType,
  BarcodeFormat,
} from '@zxing/library';
import { Product } from '../types';
import { sound } from '../utils/audio';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBarcodeScanned: (barcode: string) => void;
  products: Product[];
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onBarcodeScanned,
  products,
}) => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);

  // Camera devices & capabilities
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const nativeDetectorRef = useRef<any>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const isProcessingFrameRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isScanningSuccessRef = useRef(false);

  // Initialize ZXing reader instance with configured barcode hints
  useEffect(() => {
    try {
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.ITF,
        BarcodeFormat.QR_CODE,
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true);
      codeReaderRef.current = new BrowserMultiFormatReader(hints);
    } catch {
      codeReaderRef.current = new BrowserMultiFormatReader();
    }

    // Try creating native BarcodeDetector if available in browser
    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        nativeDetectorRef.current = new (window as any).BarcodeDetector();
      } catch {
        try {
          nativeDetectorRef.current = new (window as any).BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
          });
        } catch {
          nativeDetectorRef.current = null;
        }
      }
    }

    return () => {
      if (scanIntervalRef.current !== null) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      if (codeReaderRef.current) {
        try {
          codeReaderRef.current.reset();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Hardware barcode scanner gun listener (rapid key sequence ending with Enter)
  useEffect(() => {
    if (!isOpen) return;

    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input field
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 120) {
        buffer = ''; // timeout: human typing
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          e.preventDefault();
          handleScanSuccess(buffer.trim());
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleScanSuccess = useCallback(
    (code: string) => {
      if (isScanningSuccessRef.current) return;
      isScanningSuccessRef.current = true;

      // Stop loop immediately
      if (scanIntervalRef.current !== null) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }

      sound.scan();
      setScannedFeedback(code);

      // Stop camera feed
      stopCamera();

      setTimeout(() => {
        onBarcodeScanned(code);
        onClose();
        isScanningSuccessRef.current = false;
      }, 450);
    },
    [onBarcodeScanned, onClose]
  );

  // Safe camera stream acquisition with robust fallback cascade
  const obtainCameraStream = async (deviceId?: string): Promise<MediaStream> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(t.scanner.cameraApiNotSupportedError);
    }

    // Attempt 1: If specific device ID chosen
    if (deviceId) {
      try {
        return await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: deviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (err) {
        console.warn('Specific deviceId stream fallback:', err);
      }
    }

    // Attempt 2: Environment (rear) camera with ideal resolution
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    } catch {
      // Fall through to basic environment
    }

    // Attempt 3: Basic environment facingMode
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
    } catch {
      // Fall through to generic
    }

    // Attempt 4: Generic video (works on PC webcams, laptops, and virtual cameras)
    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
  };

  // Enumerate camera devices for multi-camera switching
  const enumerateCameras = async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setVideoDevices(videoInputs);
    } catch (err) {
      console.warn('Could not enumerate video devices:', err);
    }
  };

  // Dedicated, error-free frame scanning loop
  const startScanLoop = () => {
    if (scanIntervalRef.current !== null) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = window.setInterval(async () => {
      if (isScanningSuccessRef.current || isProcessingFrameRef.current) return;

      const video = videoRef.current;
      if (!video) return;

      // Crucial: check that video is actually loaded with valid positive dimensions
      // This prevents IndexSizeError/DOMException on drawImage
      if (
        video.paused ||
        video.ended ||
        video.readyState < 2 ||
        !video.videoWidth ||
        video.videoWidth <= 0 ||
        !video.videoHeight ||
        video.videoHeight <= 0
      ) {
        return;
      }

      isProcessingFrameRef.current = true;

      try {
        // Fast-path: Native BarcodeDetector (hardware-accelerated in Chrome/Android)
        if (nativeDetectorRef.current) {
          try {
            const detected = await nativeDetectorRef.current.detect(video);
            if (detected && detected.length > 0) {
              const code = detected[0]?.rawValue;
              if (code && typeof code === 'string' && code.trim().length > 0) {
                handleScanSuccess(code.trim());
                isProcessingFrameRef.current = false;
                return;
              }
            }
          } catch {
            // Frame detection noise: silently fall back to ZXing
          }
        }

        // Standard-path: ZXing reader
        if (codeReaderRef.current) {
          try {
            const result = codeReaderRef.current.decode(video);
            if (result && result.getText()) {
              const code = result.getText().trim();
              if (code.length > 0) {
                handleScanSuccess(code);
                isProcessingFrameRef.current = false;
                return;
              }
            }
          } catch {
            // Expected per-frame behavior: NotFoundException when no barcode is in front of camera
            // Silently ignore to keep console completely clean
          }
        }
      } catch {
        // Catch-all guard for frame scanner
      } finally {
        isProcessingFrameRef.current = false;
      }
    }, 120);
  };

  // Stop camera tracks and reader loop
  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current !== null) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch {
            // ignore
          }
        });
      } catch {
        // ignore
      }
      streamRef.current = null;
    }

    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      } catch {
        // ignore
      }
    }

    setCameraActive(false);
    setIsStartingCamera(false);
    setTorchOn(false);
    setHasTorch(false);
  }, []);

  // Handle camera start with full diagnostics
  const startCamera = async (deviceId?: string) => {
    setCameraError(null);
    setIsStartingCamera(true);

    // Stop any existing stream and scanning interval
    stopCamera();

    try {
      const stream = await obtainCameraStream(deviceId || selectedDeviceId);
      streamRef.current = stream;

      // Extract torch capability safely
      try {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack && typeof videoTrack.getCapabilities === 'function') {
          const caps = videoTrack.getCapabilities() as any;
          setHasTorch(Boolean(caps?.torch));
        } else {
          setHasTorch(false);
        }
      } catch {
        setHasTorch(false);
      }

      // Populate available camera devices
      await enumerateCameras();

      // Ensure video element plays the stream
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        video.muted = true;

        try {
          await video.play();
        } catch (playErr: any) {
          if (playErr.name !== 'AbortError') {
            console.warn('Video playback warning:', playErr);
          }
        }
      }

      setCameraActive(true);
      setIsStartingCamera(false);

      // Start custom controlled scanning loop
      startScanLoop();
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Camera startup notice:', err);
      }
      setIsStartingCamera(false);
      setCameraActive(false);

      let userMsg = err.message || '';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        userMsg = t.scanner.permissionDeniedError;
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        userMsg = t.scanner.noCameraDetectedError;
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        userMsg = t.scanner.cameraInUseError;
      }

      setCameraError(userMsg);
    }
  };

  // Toggle flashlight / torch
  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track && hasTorch) {
      try {
        const nextState = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchOn(nextState);
      } catch (err) {
        console.warn('Torch toggle error:', err);
      }
    }
  };

  // Switch camera device
  const handleDeviceChange = (newDeviceId: string) => {
    setSelectedDeviceId(newDeviceId);
    startCamera(newDeviceId);
  };

  // Handle image file upload barcode scan
  const handleImageFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = imageUrl;

      img.onload = async () => {
        try {
          if (!codeReaderRef.current) {
            codeReaderRef.current = new BrowserMultiFormatReader();
          }
          const result = await codeReaderRef.current.decodeFromImageElement(img);
          if (result && result.getText()) {
            handleScanSuccess(result.getText());
          } else {
            setCameraError(t.scanner.noBarcodeInImageError);
          }
        } catch {
          setCameraError(t.scanner.couldNotDecodeImageError);
        } finally {
          URL.revokeObjectURL(imageUrl);
        }
      };
    } catch (err) {
      console.warn('Image scan error:', err);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Open in new tab helper if iframe permission blocked
  const handleOpenInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  // Lifecycle when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      isScanningSuccessRef.current = false;
      setCameraError(null);
      setScannedFeedback(null);
      setManualCode('');
      // Auto-start camera when modal opens
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScanSuccess(manualCode.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="barcode-scanner-modal-backdrop"
      className="fixed inset-0 z-[60] overflow-y-auto bg-black/80 backdrop-blur-xs p-3 sm:p-4"
    >
      <div className="min-h-full flex items-center justify-center py-4">
        <div
          id="barcode-scanner-modal"
          className={`rounded-2xl max-w-xl w-full my-auto flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] overflow-hidden shadow-2xl border transition-colors duration-150 animate-in fade-in zoom-in-95 ${
            isLight
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-[#121212] border-neutral-800 text-neutral-300'
          }`}
        >
          {/* Modal Header */}
          <div
            className={`shrink-0 flex items-center justify-between px-5 py-3.5 border-b ${
              isLight ? 'border-slate-200 bg-slate-50' : 'border-neutral-800 bg-[#0D0D0D]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                  isLight
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-emerald-950/50 border-emerald-900/50 text-emerald-400'
                }`}
              >
                <Barcode className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {t.scanner.modalTitle}
                </h3>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  {t.scanner.modalSubtitle}
                </p>
              </div>
            </div>
            <button
              id="close-scanner-modal-btn"
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight
                  ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Main Camera Viewfinder Section */}
          <div
            className={`border rounded-xl overflow-hidden relative flex flex-col items-center justify-center min-h-[260px] ${
              isLight ? 'border-slate-200 bg-slate-950' : 'border-neutral-800 bg-[#0A0A0A]'
            }`}
          >
            {/* Live Video element is mounted whenever camera is active or starting */}
            <div
              className={`relative w-full h-64 sm:h-72 overflow-hidden bg-black ${
                cameraActive || isStartingCamera ? 'block' : 'hidden'
              }`}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Starting Camera Spinner Overlay */}
              {isStartingCamera && (
                <div className="absolute inset-0 z-10 bg-black/85 flex flex-col items-center justify-center space-y-2.5">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  <p className="text-xs font-semibold text-white">
                    {t.scanner.cameraStarting}
                  </p>
                </div>
              )}

              {/* Scanning Target Frame & Laser Line */}
              {cameraActive && (
                <>
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {/* Target Bounding Box */}
                    <div className="relative w-64 h-36 sm:w-72 sm:h-40 border-2 border-emerald-400/80 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      {/* Glowing Laser line */}
                      <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 shadow-[0_0_10px_#ef4444,0_0_20px_#ef4444] animate-pulse" />

                      {/* Corner accents */}
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                    </div>
                  </div>

                  {/* Viewfinder Controls Bar (Device Switcher, Torch, Stop) */}
                  <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-xs text-white">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="font-mono text-[11px] font-semibold text-emerald-400">
                        {t.scanner.liveBadge}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {hasTorch && (
                        <button
                          type="button"
                          onClick={toggleTorch}
                          title={t.scanner.torchTitle}
                          className={`p-1.5 rounded-lg border cursor-pointer backdrop-blur-md transition-colors ${
                            torchOn
                              ? 'bg-amber-400 text-black border-amber-300'
                              : 'bg-black/60 text-white border-white/20 hover:bg-black/80'
                          }`}
                        >
                          {torchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                        </button>
                      )}

                      {videoDevices.length > 1 && (
                        <div className="relative">
                          <select
                            aria-label="Select camera device"
                            value={selectedDeviceId}
                            onChange={(e) => handleDeviceChange(e.target.value)}
                            className="text-[11px] font-sans bg-black/70 text-white border border-white/20 rounded-lg px-2 py-1 pr-6 cursor-pointer focus:outline-hidden appearance-none backdrop-blur-md"
                          >
                            {videoDevices.map((dev, idx) => (
                              <option key={dev.deviceId || idx} value={dev.deviceId}>
                                {dev.label || `${t.scanner.cameraDeviceLabel} ${idx + 1}`}
                              </option>
                            ))}
                          </select>
                          <SwitchCamera className="w-3.5 h-3.5 text-white/70 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={stopCamera}
                        className="text-[11px] bg-red-600/90 hover:bg-red-500 text-white px-2.5 py-1 rounded-lg font-semibold shadow-xs cursor-pointer transition-colors backdrop-blur-md"
                      >
                        {t.scanner.closeCameraBtn}
                      </button>
                    </div>
                  </div>

                  {/* Bottom Guidance Tag */}
                  <div className="absolute bottom-2.5 inset-x-0 text-center pointer-events-none">
                    <span className="text-[11px] bg-black/85 px-3 py-1 rounded-full text-emerald-300 font-mono border border-emerald-900/60 shadow-md">
                      {t.scanner.pointCameraGuide}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Placeholder when camera is stopped / inactive */}
            {!cameraActive && !isStartingCamera && (
              <div className="text-center py-8 px-4 text-neutral-300 w-full">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-center text-neutral-400 mb-3">
                    <Camera className="w-7 h-7 stroke-[1.5]" />
                  </div>
                  <h4 className="font-semibold text-sm mb-1 text-white">
                    {t.scanner.opticalScannerTitle}
                  </h4>
                  <p className="text-xs text-neutral-400 max-w-sm mb-4">
                    {t.scanner.opticalScannerDesc}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    <button
                      id="start-camera-scanner-btn"
                      type="button"
                      onClick={() => startCamera()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition-colors cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{t.scanner.openCameraBtn}</span>
                    </button>

                    {/* Upload Image Option */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>
                        {t.scanner.uploadBarcodePhoto}
                      </span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageFileSelected}
                    />
                  </div>
                </div>

                {/* Error diagnostics banner */}
                {cameraError && (
                  <div className="mt-4 text-left p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-red-200 text-xs space-y-2 max-w-md mx-auto">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-semibold block mb-0.5">
                          {t.scanner.cameraNotice}
                        </span>
                        <p className="text-[11px] text-red-300 leading-relaxed">{cameraError}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-red-900/30">
                      <button
                        type="button"
                        onClick={() => startCamera()}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-red-200 hover:text-white underline cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        {t.scanner.retryCamera}
                      </button>
                      <span className="text-red-600">|</span>
                      <button
                        type="button"
                        onClick={handleOpenInNewTab}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {t.scanner.openNewTab}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Scan Success Overlay Animation */}
            {scannedFeedback && (
              <div className="absolute inset-0 bg-emerald-600/95 flex flex-col items-center justify-center text-white backdrop-blur-xs transition-all z-20">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-2 animate-bounce">
                  <Check className="w-8 h-8 text-white stroke-[2.5]" />
                </div>
                <span className="font-bold text-base tracking-wide">
                  {t.scanner.scannedSuccess}
                </span>
                <span className="font-mono text-xs bg-black/30 px-3 py-1 rounded-full mt-1.5">
                  {scannedFeedback}
                </span>
              </div>
            )}
          </div>

          {/* Manual Input Search & Hardware Scanner Info */}
          <div>
            <label
              htmlFor="barcode-manual-input"
              className={`block text-xs font-semibold mb-1.5 ${
                isLight ? 'text-slate-600' : 'text-neutral-400'
              }`}
            >
              {t.scanner.manualInputLabel}
            </label>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                    isLight ? 'text-slate-400' : 'text-neutral-500'
                  }`}
                />
                <input
                  id="barcode-manual-input"
                  type="text"
                  placeholder={t.scanner.manualInputPlaceholder}
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border focus:outline-hidden transition-colors ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:bg-white'
                      : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-500 focus:border-emerald-600'
                  }`}
                  autoFocus
                />
              </div>
              <button
                id="submit-manual-barcode-btn"
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer transition-colors"
              >
                {t.scanner.scanCodeBtn}
              </button>
            </form>
          </div>
        </div>

        {/* Standard Modal Footer */}
        <div
          className={`shrink-0 px-6 py-4 border-t flex items-center justify-between gap-3 ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-neutral-800 bg-[#0D0D0D]'
          }`}
        >
          <button
            id="close-scanner-modal-footer-btn"
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
              isLight
                ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            {t.common.close}
          </button>
          <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
            {t.scanner.hardwareScannerNotice}
          </span>
        </div>
      </div>
    </div>
  </div>
);
};
