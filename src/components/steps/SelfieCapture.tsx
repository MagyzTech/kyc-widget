"use client";

import { useKYCStore } from "../../store";
import { LivenessCamera } from "./LivenessCamera";
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
    <LivenessCamera
      onCapture={handleCapture}
    />
  );
};
