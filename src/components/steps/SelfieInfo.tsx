"use client";

import { motion } from "framer-motion";
import React, { useEffect, useRef } from "react";

interface SelfieInfoProps {
  onStart: () => void;
}

export const SelfieInfo: React.FC<SelfieInfoProps> = ({ onStart }) => {
  const lottieRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any>(null);

  useEffect(() => {
    // Load Lottie animation
    const loadLottie = async () => {
      try {
        const lottie = await import("lottie-web");
        if (lottieRef.current && !animationRef.current) {
          animationRef.current = lottie.default.loadAnimation({
            container: lottieRef.current,
            renderer: "svg",
            loop: true,
            autoplay: true,
            path: "/FaceScan.json",
          });
        }
      } catch (error) {
        console.error("Failed to load Lottie animation:", error);
      }
    };

    loadLottie();

    // Cleanup function
    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className=" h-full grid grid-rows-[auto_1fr_auto] gap-5"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Selfie Verification</h2>
        <p className="text-sm text-gray-600">
          Click "Start Verification", smile and ensure good lighting and
          background. It takes under 10 seconds.
        </p>
      </div>

      {/* Lottie Animation */}
      <div className="flex items-center justify-center">
        <div ref={lottieRef} className="w-[240px] h-[240px]" />
      </div>

      {/* Start Button */}
      <button
        onClick={onStart}
        className="w-full h-10 px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-[#09bced] transition-colors"
      >
        Start Verification
      </button>
    </motion.div>
  );
};
