"use client";

import { useKYCStore } from "../../store";
import * as faceapi from "face-api.js";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

interface SelfieCaptureProps {
  onCapture: (imageUrl: string) => void;
}

type FeedbackType = "success" | "waiting" | "warning" | "error" | "info" | "ready";
type LivenessStep = "position" | "smile" | "stay_still" | "complete";

const feedbackStyles = {
  success: "bg-white text-black",
  waiting: "bg-white text-black",
  warning: "bg-white text-black",
  error: "bg-white text-black",
  info: "bg-white text-black",
  ready: "bg-emerald-200 text-emerald-800",
};

const livenessInstructions = {
  position: "Position yourself in the circle",
  smile: "Smile",
  stay_still: "Stay still",
  complete: "Hold still",
};

const livenessSteps: LivenessStep[] = ["position", "smile"];

export const SelfieCapture: React.FC<SelfieCaptureProps> = ({ onCapture }) => {
  const webcamRef = useRef<Webcam>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: FeedbackType;
    message: string;
  }>({
    type: "info",
    message: "Loading camera...",
  });
  const [livenessStep, setLivenessStep] = useState<LivenessStep>("position");
  const [completedSteps, setCompletedSteps] = useState<Set<LivenessStep>>(
    new Set(),
  );
  const [countdown, setCountdown] = useState<number | null>(null);
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now());
  const { setSelfieUrl } = useKYCStore();

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");
      setModelsLoaded(true);
      setFeedback({ type: "waiting", message: "POSITION YOUR FACE" });
    } catch (err) {
      setFeedback({ type: "error", message: "CAMERA ERROR" });
    }
  };

  const calculateFaceAngles = (landmarks: any) => {
    if (!landmarks || !landmarks.positions)
      return { yaw: 0, roll: 0, pitch: 0 };

    const positions = landmarks.positions;

    // Get key facial landmarks
    const leftEye = positions[36]; // Left eye outer corner
    const rightEye = positions[45]; // Right eye outer corner
    const noseTip = positions[30]; // Nose tip
    const chin = positions[8]; // Chin center

    if (!leftEye || !rightEye || !noseTip || !chin) {
      return { yaw: 0, roll: 0, pitch: 0 };
    }

    // Calculate roll (head tilt) using eye positions
    const eyeDeltaY = rightEye.y - leftEye.y;
    const eyeDeltaX = rightEye.x - leftEye.x;
    const roll = Math.atan2(eyeDeltaY, eyeDeltaX) * (180 / Math.PI);

    // Calculate yaw (left/right turn) using nose position relative to eye center
    const eyeCenterX = (leftEye.x + rightEye.x) / 2;
    const noseOffsetX = noseTip.x - eyeCenterX;
    const eyeDistance = Math.abs(rightEye.x - leftEye.x);
    const yaw = (noseOffsetX / eyeDistance) * 45; // Approximate yaw

    // Calculate pitch (up/down tilt) using nose and chin positions
    const faceHeight = Math.abs(chin.y - noseTip.y);
    const expectedHeight = eyeDistance * 1.2; // Approximate ratio
    const pitch = ((faceHeight - expectedHeight) / expectedHeight) * 30; // Approximate pitch

    return { yaw, roll, pitch };
  };

  const validateLivenessStep = async (detection: any, expressions: any) => {
    const now = Date.now();
    const timeInStep = now - stepStartTime;

    console.log(
      `[Liveness] Step: ${livenessStep}, Time in step: ${timeInStep}ms`,
    );

    // Require minimum time in each step
    if (timeInStep < 1500) {
      console.log(`[Liveness] Waiting for minimum time (${timeInStep}/1500ms)`);
      return false;
    }

    // Calculate face angles from landmarks
    const angles = calculateFaceAngles(detection.landmarks);

    switch (livenessStep) {
      case "position":
        // Check if face is centered and looking straight
        const isPositioned = Math.abs(angles.yaw) < 15 && Math.abs(angles.roll) < 10;
        console.log(`[Liveness] Position check - Yaw: ${angles.yaw.toFixed(1)}°, Roll: ${angles.roll.toFixed(1)}°, Valid: ${isPositioned}`);
        return detection && isPositioned;

      case "smile":
        // Check for smile expression
        const happiness = expressions?.happy || 0;
        const isSmiling = happiness > 0.6;
        console.log(`[Liveness] Smile check - Happiness: ${happiness.toFixed(2)}, Valid: ${isSmiling}`);
        
        // If smiling, move to stay_still state
        if (isSmiling) {
          setLivenessStep("stay_still");
          setFeedback({ type: 'ready', message: livenessInstructions.stay_still });
          // Start countdown after brief delay
          setTimeout(() => {
            setCountdown(3);
          }, 1000);
          return true;
        }
        return false;

      default:
        console.log(`[Liveness] Unknown step: ${livenessStep}`);
        return false;
    }
  };

  const detectFace = useCallback(async () => {
    if (!webcamRef.current || !modelsLoaded || countdown !== null) return;

    const video = webcamRef.current.video;
    if (!video) return;

    try {
      console.log(
        `[Detection] Starting face detection for step: ${livenessStep}`,
      );

      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 }))
        .withFaceLandmarks()
        .withFaceExpressions();

      const detected = !!detection;
      setFaceDetected(detected);

      console.log(`[Detection] Face detected: ${detected}`);
      if (detection) {
        const angles = calculateFaceAngles(detection.landmarks);
        console.log(
          `[Detection] Face angles - Yaw: ${angles.yaw.toFixed(
            1,
          )}°, Roll: ${angles.roll.toFixed(1)}°, Pitch: ${angles.pitch.toFixed(
            1,
          )}°`,
        );
        if (detection.expressions) {
          console.log(
            `[Detection] Expressions - Happy: ${
              detection.expressions.happy?.toFixed(2) || 0
            }`,
          );
        }

        // Check face size for distance guidance
        const faceBox = detection.detection.box;
        const faceWidth = faceBox.width;
        const videoWidth = video.videoWidth;
        const faceRatio = faceWidth / videoWidth;
        
        console.log(`[Detection] Face size ratio: ${faceRatio.toFixed(3)}`);
        
        // Check image quality
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0);
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData?.data || [];
        
        // Check brightness
        let brightness = 0;
        for (let i = 0; i < data.length; i += 4) {
          brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        brightness = brightness / (data.length / 4);
        
        // Check for blur (simple variance check)
        let variance = 0;
        const mean = brightness;
        for (let i = 0; i < data.length; i += 4) {
          const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
          variance += Math.pow(gray - mean, 2);
        }
        variance = variance / (data.length / 4);
        
        // Provide feedback based on image quality
        if (brightness < 80) {
          setFeedback({ type: 'warning', message: 'Too dark, improve lighting' });
          return;
        } else if (brightness > 200) {
          setFeedback({ type: 'warning', message: 'Too bright, reduce lighting' });
          return;
        } else if (variance < 500) {
          setFeedback({ type: 'warning', message: 'Image too blurry' });
          return;
        } else if (faceRatio < 0.15) {
          setFeedback({ type: 'warning', message: 'Move closer' });
          return;
        } else if (faceRatio > 0.4) {
          setFeedback({ type: 'warning', message: 'Move back' });
          return;
        }
      }

      if (!detected) {
        setFeedback({ type: 'warning', message: 'Face not detected' });
        return;
      }

      if (livenessStep === "complete") return;

      // Show current instruction
      setFeedback({
        type: "waiting",
        message: livenessInstructions[livenessStep],
      });

      // Validate current step
      const stepValid = await validateLivenessStep(
        detection,
        detection.expressions,
      );

      if (stepValid && !completedSteps.has(livenessStep)) {
        console.log(`[Detection] Step ${livenessStep} completed successfully`);

        // Mark step as completed
        const newCompleted = new Set(completedSteps);
        newCompleted.add(livenessStep);
        setCompletedSteps(newCompleted);

        setFeedback({
          type: "success",
          message: `✓ ${livenessInstructions[livenessStep]}`,
        });

        // Move to next step after delay
        setTimeout(() => {
          const currentIndex = livenessSteps.indexOf(livenessStep);
          if (currentIndex < livenessSteps.length - 1) {
            const nextStep = livenessSteps[currentIndex + 1];
            console.log(`[Detection] Moving to next step: ${nextStep}`);
            setLivenessStep(nextStep);
            setStepStartTime(Date.now());
          } else {
            // All steps completed
            console.log(
              `[Detection] All liveness steps completed, starting countdown`,
            );
            setLivenessStep("complete");
            setCountdown(3);
          }
        }, 1000);
      }
    } catch (err) {
      console.error("[Detection] Face detection error:", err);
    }
  }, [modelsLoaded, livenessStep, completedSteps, countdown, stepStartTime]);

  useEffect(() => {
    if (!modelsLoaded) return;

    const interval = setInterval(detectFace, 300);
    return () => clearInterval(interval);
  }, [modelsLoaded, detectFace]);

  useEffect(() => {
    if (countdown === null || countdown === 0) return;

    const timer = setTimeout(() => {
      if (countdown === 1) {
        autoCapture();
      } else {
        setCountdown(countdown - 1);
        setFeedback({
          type: "success",
          message: `CAPTURING IN ${countdown - 1}`,
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

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

  return (
    <div className="fixed inset-0 bg-black">
      {/* Camera */}
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

      {/* Blur Overlay with Circle Cutout */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <mask id="circle-mask">
              <rect width="100%" height="100%" fill="white" />
              <circle cx="50%" cy="50%" r="140" fill="black" />
            </mask>
            <filter id="blur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
            </filter>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.3)"
            mask="url(#circle-mask)"
            filter="url(#blur)"
          />
        </svg>

        {/* Face Circle Guide */}
        <div className="relative">

          {/* Face Circle Guide */}
          <div
            className={`w-[280px] h-[280px] border-[3px] rounded-full transition-all ${
              livenessStep === 'stay_still' 
                ? "border-emerald-700 shadow-[0_0_30px_rgba(5,150,105,0.6)]" 
                : faceDetected 
                ? "border-green-500 shadow-[0_0_30px_rgba(16,185,129,0.6)]" 
                : "border-white/50"
            }`}
          >
            {/* Scanning line */}
            {!faceDetected && (
              <motion.div
                className="absolute top-0 left-0 right-0 h-0.5 shadow-[0_0_10px_hsl(193,100%,50%)]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, hsl(193, 100%, 50%), transparent)",
                }}
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

      {/* Feedback Chip - Above Circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[200px] z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={feedback.message}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${
              feedbackStyles[feedback.type]
            } shadow-lg`}
          >
            {feedback.type === "waiting" && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {feedback.type === "success" && <Check className="w-4 h-4" />}
            <span className="whitespace-nowrap">{feedback.message}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Countdown overlay */}
      {countdown && countdown > 0 && (
        <motion.div
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-primary/95 rounded-full flex items-center justify-center text-6xl font-bold text-white shadow-2xl z-20"
        >
          {countdown}
        </motion.div>
      )}
    </div>
  );
};
