# Quick Implementation Guide: Fix iOS Camera

## 🎯 Goal
Replace `react-webcam` with `PlatformCamera` to fix iOS WebView camera issues.

## ⏱️ Time Required
30 minutes

## 📝 Steps

### Step 1: Verify PlatformCamera exists

```bash
ls src/components/steps/PlatformCamera.tsx
# Should exist - we just created it
```

### Step 2: Update SelfieCapture.tsx

Open `src/components/steps/SelfieCapture.tsx` and make these changes:

#### Change 1: Update imports (Line ~10)

**Remove**:
```typescript
import Webcam from "react-webcam";
```

**Add**:
```typescript
import { PlatformCamera } from "./PlatformCamera";
```

#### Change 2: Remove webcam ref (Line ~30)

**Remove**:
```typescript
const webcamRef = useRef<Webcam>(null);
```

#### Change 3: Update detectFace function (Line ~100)

**Find**:
```typescript
const detectFace = useCallback(async () => {
  if (!webcamRef.current || !modelsLoaded || countdown !== null) return;

  const video = webcamRef.current.video;
  if (!video) return;
```

**Replace with**:
```typescript
const videoRef = useRef<HTMLVideoElement | null>(null);

const detectFace = useCallback(async () => {
  if (!videoRef.current || !modelsLoaded || countdown !== null) return;

  const video = videoRef.current;
  if (!video) return;
```

#### Change 4: Update autoCapture function (Line ~280)

**Find**:
```typescript
const autoCapture = useCallback(() => {
  if (!webcamRef.current) return;

  const imageSrc = webcamRef.current.getScreenshot();
  if (!imageSrc) {
    setFeedback({ type: "error", message: "CAMERA ERROR" });
    return;
  }

  setSelfieUrl(imageSrc);
  onCapture(imageSrc);
}, [setSelfieUrl, onCapture]);
```

**Replace with**:
```typescript
const autoCapture = useCallback(() => {
  if (!videoRef.current) return;

  const canvas = document.createElement("canvas");
  const video = videoRef.current;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  const context = canvas.getContext("2d");
  if (!context) {
    setFeedback({ type: "error", message: "CAMERA ERROR" });
    return;
  }

  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageSrc = canvas.toDataURL("image/jpeg", 0.9);

  setSelfieUrl(imageSrc);
  onCapture(imageSrc);
}, [setSelfieUrl, onCapture]);
```

#### Change 5: Replace Webcam component (Line ~300)

**Find**:
```typescript
<Webcam
  ref={webcamRef}
  audio={false}
  screenshotFormat="image/jpeg"
  videoConstraints={{
    width: 1280,
    height: 720,
    facingMode: "user",
  }}
  mirrored={false}
  className="absolute inset-0 w-full h-full object-cover"
/>
```

**Replace with**:
```typescript
<video
  ref={videoRef}
  autoPlay
  playsInline
  muted
  className="absolute inset-0 w-full h-full object-cover"
/>
```

#### Change 6: Add camera initialization

**Add after state declarations (Line ~40)**:
```typescript
useEffect(() => {
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setFeedback({ type: "error", message: "CAMERA ERROR" });
    }
  };

  startCamera();

  return () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };
}, []);
```

### Step 3: Test the changes

```bash
# Build widget
npm run build

# Link to app-v2 (if not already linked)
npm link
cd ../app-v2
npm link kyc-widget-falconite

# Start dev server
npm run dev
```

### Step 4: Test on platforms

1. **Desktop Chrome**: Should work with face detection
2. **iOS Safari**: Should work with face detection
3. **iOS WebView**: Should show file input button
4. **Android**: Should work with face detection

## 🔄 Alternative: Simpler Approach

If face detection is causing issues, use PlatformCamera directly:

### Simplified SelfieCapture.tsx

```typescript
"use client";

import { useKYCStore } from "../../store";
import { PlatformCamera } from "./PlatformCamera";
import React from "react";

interface SelfieCaptureProps {
  onCapture: (imageUrl: string) => void;
}

export const SelfieCapture: React.FC<SelfieCaptureProps> = ({ onCapture }) => {
  const { setSelfieUrl } = useKYCStore();

  const handleCapture = (imageDataUrl: string) => {
    setSelfieUrl(imageDataUrl);
    onCapture(imageDataUrl);
  };

  return (
    <div className="fixed inset-0 bg-black">
      <PlatformCamera
        onCapture={handleCapture}
        facingMode="user"
      />
    </div>
  );
};
```

This removes face detection but ensures camera works on all platforms.

## ✅ Verification Checklist

After implementation:

- [ ] Widget builds without errors
- [ ] Camera works on desktop
- [ ] Camera works on iOS Safari
- [ ] File input shows on iOS WebView
- [ ] Camera works on Android
- [ ] Selfie captures successfully
- [ ] Image uploads to backend
- [ ] No console errors

## 🐛 Troubleshooting

### Camera not starting
- Check browser console for errors
- Verify HTTPS (required for camera)
- Check camera permissions

### Black screen
- Ensure `playsInline` attribute
- Check `autoPlay` is set
- Verify video ref is connected

### iOS WebView not showing file input
- Check platform detection logic
- Verify `capture="user"` attribute
- Test on real device (not simulator)

## 📦 Publish

Once tested:

```bash
cd kyc-widget-falconite
npm version patch
npm publish
```

Update app-v2:
```bash
cd app-v2
npm unlink kyc-widget-falconite
npm install kyc-widget-falconite@latest
```

## 🎉 Done!

Your widget now works on all platforms including iOS WebView!
