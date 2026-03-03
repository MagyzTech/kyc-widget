# iOS Camera Fix - Complete Solution

## Problem

iOS devices have strict camera permissions and WebView limitations that cause:
- Camera not starting in WebView
- Black screen on camera access
- Permission prompts not showing
- `getUserMedia` failures

## Solution: Multi-Platform Camera Component

Replace `react-webcam` with a platform-aware camera component that handles iOS, Android, and Web differently.

### 1. Install Dependencies

```bash
npm install @capacitor/camera @capacitor/filesystem
# or for pure web fallback
npm install html5-qrcode
```

### 2. Create Platform-Aware Camera Component

Create `src/components/steps/PlatformCamera.tsx`:

```typescript
"use client";

import React, { useRef, useState, useEffect } from "react";

interface PlatformCameraProps {
  onCapture: (imageDataUrl: string) => void;
  facingMode?: "user" | "environment";
}

// Detect platform
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};

const isInWebView = () => {
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.includes('wv') || // Android WebView
    ua.includes('webview') ||
    (window as any).ReactNativeWebView !== undefined ||
    (window as any).flutter_inappwebview !== undefined
  );
};

export const PlatformCamera: React.FC<PlatformCameraProps> = ({
  onCapture,
  facingMode = "user",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      // iOS WebView: Use file input fallback
      if (isIOS() && isInWebView()) {
        console.log("[Camera] iOS WebView detected - using file input");
        return; // Will use file input instead
      }

      // Request camera permission with iOS-specific constraints
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          // iOS-specific: Disable advanced features that may fail
          ...(isIOS() && {
            aspectRatio: { ideal: 16 / 9 },
            frameRate: { ideal: 30, max: 30 },
          }),
        },
        audio: false,
      };

      console.log("[Camera] Requesting camera access with constraints:", constraints);

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log("[Camera] Camera access granted");
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
          console.log("[Camera] Video stream ready");
        };
      }
    } catch (err: any) {
      console.error("[Camera] Error accessing camera:", err);
      
      // Provide user-friendly error messages
      if (err.name === "NotAllowedError") {
        setError("Camera permission denied. Please enable camera access in Settings.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else if (err.name === "NotReadableError") {
        setError("Camera is already in use by another app.");
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

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
    onCapture(imageDataUrl);
  };

  // iOS WebView fallback: Use file input
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

  // iOS WebView: Show file input
  if (isIOS() && isInWebView()) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black text-white p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold mb-2">Take a Selfie</h3>
          <p className="text-sm text-gray-300">
            Tap the button below to open your camera
          </p>
        </div>
        <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg">
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

  // Show error if camera failed
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black text-white p-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2 text-red-500">Camera Error</h3>
          <p className="text-sm text-gray-300 mb-4">{error}</p>
          <button
            onClick={startCamera}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {cameraReady && (
        <button
          onClick={captureImage}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-purple-600 hover:bg-purple-100 transition-colors"
        />
      )}
    </div>
  );
};
```

### 3. Update SelfieCapture Component

Replace `react-webcam` usage in `SelfieCapture.tsx`:

```typescript
import { PlatformCamera } from "./PlatformCamera";

// Replace Webcam component with:
<PlatformCamera
  onCapture={(imageDataUrl) => {
    setSelfieUrl(imageDataUrl);
    onCapture(imageDataUrl);
  }}
  facingMode="user"
/>
```

### 4. iOS WebView Configuration

For React Native iOS, update `Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access for identity verification</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to select images</string>
```

For WebView configuration:

```typescript
<WebView
  source={{ uri: 'https://your-app.com/kyc' }}
  mediaPlaybackRequiresUserAction={false}
  allowsInlineMediaPlayback={true}
  mediaCapturePermissionGrantType="grant" // iOS 15+
  cameraPermissions="camera"
/>
```

### 5. Alternative: Native Camera Bridge

For better iOS support, use native camera module:

```typescript
// src/utils/nativeCamera.ts
export const captureWithNativeCamera = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Check if running in React Native
    if ((window as any).ReactNativeWebView) {
      // Request native camera
      (window as any).ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'OPEN_CAMERA',
          facingMode: 'user',
        })
      );

      // Listen for response
      const handler = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'CAMERA_RESULT') {
            window.removeEventListener('message', handler);
            resolve(data.imageDataUrl);
          }
        } catch (err) {
          // Ignore
        }
      };

      window.addEventListener('message', handler);
    } else {
      reject(new Error('Not in React Native WebView'));
    }
  });
};
```

## Testing on iOS

### Safari (Web)
1. Open in Safari
2. Grant camera permission when prompted
3. Should work normally

### iOS WebView (React Native)
1. File input fallback activates automatically
2. User taps "Open Camera"
3. Native camera opens
4. User takes photo
5. Photo returned to widget

### iOS Simulator
- Camera not available in simulator
- Use file input to test with sample images

## Troubleshooting

### Camera permission denied
- Check `Info.plist` has camera usage description
- Check WebView has `mediaCapture` permissions
- User must grant permission in Settings

### Black screen
- Ensure `playsInline` attribute on video
- Check `autoPlay` is set
- Verify constraints are iOS-compatible

### getUserMedia not defined
- Check HTTPS (required for camera access)
- Check browser compatibility
- Fall back to file input

## Browser Compatibility

| Platform | Method | Support |
|----------|--------|---------|
| iOS Safari | getUserMedia | ✅ iOS 11+ |
| iOS WebView | File Input | ✅ All versions |
| Android Chrome | getUserMedia | ✅ All versions |
| Android WebView | getUserMedia | ✅ Android 5+ |
| Desktop | getUserMedia | ✅ All modern browsers |

## Recommended Approach

1. **Web (Safari/Chrome)**: Use `getUserMedia` with face detection
2. **iOS WebView**: Use file input with `capture="user"` attribute
3. **Android WebView**: Use `getUserMedia` normally
4. **Flutter**: Use native camera plugin (see FLUTTER_PACKAGE.md)
