"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";

interface PlatformCameraProps {
  onCapture: (imageDataUrl: string) => void;
  facingMode?: "user" | "environment";
  className?: string;
}

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
const isAndroid = () => /Android/.test(navigator.userAgent);
const isInWebView = () => {
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.includes('wv') ||
    ua.includes('webview') ||
    (window as any).ReactNativeWebView !== undefined ||
    (window as any).flutter_inappwebview !== undefined
  );
};

export const PlatformCamera: React.FC<PlatformCameraProps> = ({
  onCapture,
  facingMode = "user",
  className = "",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [cameraReady, setCameraReady] = useState(false);
  const [useFileInput, setUseFileInput] = useState(false);

  useEffect(() => {
    // iOS WebView: Use file input immediately
    if (isIOS() && isInWebView()) {
      setUseFileInput(true);
      return;
    }

    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          ...(isIOS() && {
            aspectRatio: { ideal: 16 / 9 },
            frameRate: { ideal: 30, max: 30 },
          }),
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
    } catch (err: any) {
      console.error("[Camera] Error:", err);
      
      if (err.name === "NotAllowedError") {
        setError("Camera permission denied. Please enable camera in Settings.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found.");
      } else if (err.name === "NotReadableError") {
        setError("Camera in use by another app.");
      } else {
        setError(`Camera error: ${err.message}`);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
    onCapture(imageDataUrl);
  }, [onCapture]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageDataUrl = event.target?.result as string;
      onCapture(imageDataUrl);
    };
    reader.readAsDataURL(file);
  };

  // iOS WebView: File input fallback
  if (useFileInput) {
    return (
      <div className={`flex flex-col items-center justify-center h-full bg-black text-white p-6 ${className}`}>
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold mb-2">Take a Selfie</h3>
          <p className="text-sm text-gray-300">
            Tap the button below to open your camera
          </p>
        </div>
        <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
          <input
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleFileInput}
            className="hidden"
          />
          Open Camera
        </label>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center h-full bg-black text-white p-6 ${className}`}>
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2 text-red-500">Camera Error</h3>
          <p className="text-sm text-gray-300 mb-4">{error}</p>
          <button
            onClick={startCamera}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Normal camera view
  return (
    <div className={`relative w-full h-full bg-black ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

// Export capture function for external use
export const useCameraCapture = (videoRef: React.RefObject<HTMLVideoElement>) => {
  return useCallback(() => {
    if (!videoRef.current) return null;

    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext("2d");
    if (!context) return null;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.9);
  }, [videoRef]);
};
