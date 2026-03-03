"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import * as faceapi from "face-api.js";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

interface LivenessCameraProps {
  onCapture: (imageDataUrl: string) => void;
  onComplete?: () => void;
}

type LivenessStep = "position" | "smile" | "stay_still" | "complete";
type FeedbackType = "success" | "waiting" | "warning" | "error" | "ready";

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent);
const isInWebView = () => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('wv') || ua.includes('webview') || 
         (window as any).ReactNativeWebView !== undefined;
};

const feedbackStyles = {
  success: "bg-emerald-500 text-white",
  waiting: "bg-white text-black",
  warning: "bg-amber-500 text-white",
  error: "bg-red-500 text-white",
  ready: "bg-emerald-500 text-white",
};

const livenessInstructions = {
  position: "Position your face in the circle",
  smile: "Smile",
  stay_still: "Hold still",
  complete: "Processing...",
};

export const LivenessCamera: React.FC<LivenessCameraProps> = ({
  onCapture,
  onComplete,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [livenessStep, setLivenessStep] = useState<LivenessStep>("position");
  const [completedSteps, setCompletedSteps] = useState<Set<LivenessStep>>(new Set());
  const [countdown, setCountdown] = useState<number | null>(null);
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now());
  const [useFileInput, setUseFileInput] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: FeedbackType; message: string }>({
    type: "waiting",
    message: "Loading...",
  });

  // Load face detection models
  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      ]);
      setModelsLoaded(true);
      
      // iOS WebView: Use file input with post-capture analysis
      if (isIOS() && isInWebView()) {
        setUseFileInput(true);
        setFeedback({ type: "waiting", message: "Tap to take selfie" });
      } else {
        startCamera();
      }
    } catch (err) {
      console.error("[Liveness] Model loading error:", err);
      setFeedback({ type: "error", message: "Failed to load detection models" });
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setFeedback({ type: "waiting", message: livenessInstructions.position });
        };
      }
    } catch (err) {
      console.error("[Liveness] Camera error:", err);
      setFeedback({ type: "error", message: "Camera access denied" });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Face detection loop
  const detectFace = useCallback(async () => {
    if (!videoRef.current || !modelsLoaded || countdown !== null || livenessStep === "complete") return;

    const video = videoRef.current;
    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 }))
        .withFaceLandmarks()
        .withFaceExpressions();

      const detected = !!detection;
      setFaceDetected(detected);

      if (!detected) {
        setFeedback({ type: "warning", message: "No face detected" });
        return;
      }

      // Calculate face angles
      const angles = calculateFaceAngles(detection.landmarks);
      
      // Check face size
      const faceBox = detection.detection.box;
      const faceRatio = faceBox.width / video.videoWidth;
      
      if (faceRatio < 0.15) {
        setFeedback({ type: "warning", message: "Move closer" });
        return;
      } else if (faceRatio > 0.4) {
        setFeedback({ type: "warning", message: "Move back" });
        return;
      }

      // Validate current liveness step
      const timeInStep = Date.now() - stepStartTime;
      if (timeInStep < 1500) return; // Minimum time per step

      const stepValid = await validateLivenessStep(detection, angles, detection.expressions);
      
      if (stepValid && !completedSteps.has(livenessStep)) {
        const newCompleted = new Set(completedSteps);
        newCompleted.add(livenessStep);
        setCompletedSteps(newCompleted);

        setFeedback({ type: "success", message: `✓ ${livenessInstructions[livenessStep]}` });

        setTimeout(() => {
          if (livenessStep === "position") {
            setLivenessStep("smile");
            setStepStartTime(Date.now());
            setFeedback({ type: "waiting", message: livenessInstructions.smile });
          } else if (livenessStep === "smile") {
            setLivenessStep("stay_still");
            setStepStartTime(Date.now());
            setFeedback({ type: "ready", message: livenessInstructions.stay_still });
            setTimeout(() => setCountdown(3), 1000);
          }
        }, 1000);
      } else {
        setFeedback({ type: "waiting", message: livenessInstructions[livenessStep] });
      }
    } catch (err) {
      console.error("[Liveness] Detection error:", err);
    }
  }, [modelsLoaded, livenessStep, completedSteps, countdown, stepStartTime]);

  useEffect(() => {
    if (!modelsLoaded || useFileInput) return;
    detectionIntervalRef.current = setInterval(detectFace, 300);
    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    };
  }, [modelsLoaded, detectFace, useFileInput]);

  const calculateFaceAngles = (landmarks: any) => {
    if (!landmarks?.positions) return { yaw: 0, roll: 0 };

    const positions = landmarks.positions;
    const leftEye = positions[36];
    const rightEye = positions[45];
    const noseTip = positions[30];

    if (!leftEye || !rightEye || !noseTip) return { yaw: 0, roll: 0 };

    const eyeDeltaY = rightEye.y - leftEye.y;
    const eyeDeltaX = rightEye.x - leftEye.x;
    const roll = Math.atan2(eyeDeltaY, eyeDeltaX) * (180 / Math.PI);

    const eyeCenterX = (leftEye.x + rightEye.x) / 2;
    const noseOffsetX = noseTip.x - eyeCenterX;
    const eyeDistance = Math.abs(rightEye.x - leftEye.x);
    const yaw = (noseOffsetX / eyeDistance) * 45;

    return { yaw, roll };
  };

  const validateLivenessStep = async (detection: any, angles: any, expressions: any) => {
    switch (livenessStep) {
      case "position":
        return Math.abs(angles.yaw) < 15 && Math.abs(angles.roll) < 10;
      case "smile":
        const happiness = expressions?.happy || 0;
        return happiness > 0.6;
      default:
        return false;
    }
  };

  // Countdown effect
  useEffect(() => {
    if (countdown === null || countdown === 0) return;

    const timer = setTimeout(() => {
      if (countdown === 1) {
        captureImage();
      } else {
        setCountdown(countdown - 1);
        setFeedback({ type: "success", message: `Capturing in ${countdown - 1}` });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setLivenessStep("complete");
    onCapture(imageDataUrl);
    onComplete?.();
  };

  // File input handler for iOS WebView
  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFeedback({ type: "waiting", message: "Analyzing image..." });

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageDataUrl = event.target?.result as string;
      setCapturedImage(imageDataUrl);

      // Analyze captured image for liveness
      const img = new Image();
      img.onload = async () => {
        try {
          const detection = await faceapi
            .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

          if (!detection) {
            setFeedback({ type: "error", message: "No face detected. Try again." });
            setCapturedImage(null);
            return;
          }

          const happiness = detection.expressions?.happy || 0;
          if (happiness < 0.3) {
            setFeedback({ type: "warning", message: "Please smile and try again" });
            setCapturedImage(null);
            return;
          }

          setFeedback({ type: "success", message: "✓ Liveness verified" });
          setTimeout(() => {
            onCapture(imageDataUrl);
            onComplete?.();
          }, 1000);
        } catch (err) {
          console.error("[Liveness] Analysis error:", err);
          setFeedback({ type: "error", message: "Analysis failed. Try again." });
          setCapturedImage(null);
        }
      };
      img.src = imageDataUrl;
    };
    reader.readAsDataURL(file);
  };

  // iOS WebView: File input with post-capture analysis
  if (useFileInput) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
        {!capturedImage ? (
          <>
            <div className="text-center mb-8 px-6">
              <h3 className="text-2xl font-semibold text-white mb-3">Take a Selfie</h3>
              <p className="text-gray-300 mb-2">Please smile for the camera</p>
              <p className="text-sm text-gray-400">We'll verify your liveness</p>
            </div>
            
            <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors shadow-lg">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileInput}
                className="hidden"
              />
              Open Camera
            </label>
          </>
        ) : (
          <div className="relative">
            <img src={capturedImage} alt="Captured" className="max-w-md rounded-lg" />
            <div className="absolute top-4 left-1/2 -translate-x-1/2">
              <div className={`px-4 py-2 rounded-lg ${feedbackStyles[feedback.type]} shadow-lg`}>
                {feedback.message}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Standard camera with live detection
  return (
    <div className="fixed inset-0 bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Blur overlay with circle cutout */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <mask id="circle-mask">
              <rect width="100%" height="100%" fill="white" />
              <circle cx="50%" cy="50%" r="140" fill="black" />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.3)"
            mask="url(#circle-mask)"
          />
        </svg>

        {/* Face circle guide */}
        <div className="relative">
          <div
            className={`w-[280px] h-[280px] border-[3px] rounded-full transition-all ${
              livenessStep === "stay_still"
                ? "border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.6)]"
                : faceDetected
                ? "border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.6)]"
                : "border-white/50"
            }`}
          >
            {/* Scanning line */}
            {!faceDetected && (
              <motion.div
                className="absolute top-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                animate={{ y: [0, 280, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            )}

            {/* Corner markers */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl" />
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl" />
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl" />
          </div>
        </div>
      </div>

      {/* Feedback chip */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[200px] z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={feedback.message}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${feedbackStyles[feedback.type]} shadow-lg`}
          >
            {feedback.type === "waiting" && <Loader2 className="w-4 h-4 animate-spin" />}
            {feedback.type === "success" && <Check className="w-4 h-4" />}
            <span className="whitespace-nowrap">{feedback.message}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Countdown overlay */}
      {countdown && countdown > 0 && (
        <motion.div
          key={countdown}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center text-6xl font-bold text-white shadow-2xl z-20"
        >
          {countdown}
        </motion.div>
      )}
    </div>
  );
};
