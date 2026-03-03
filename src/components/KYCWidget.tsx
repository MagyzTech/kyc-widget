"use client";

import { KYCApiClient } from "../services/api";
import { useKYCStore } from "../store";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import "../styles/widget.css";
import type { KYCWidgetProps } from "../types";
import { SuccessScreen } from "./shared/SuccessScreen";
import { WelcomeScreen } from "./shared/WelcomeScreen";
import { Tier1Flow } from "./tiers/Tier1Flow";
import { Tier2Flow } from "./tiers/Tier2Flow";

const STEP_TITLES: Record<number, string> = {
  0: "Verification Steps",
  1: "Take Selfie",
  2: "Review",
};

export const KYCWidget: React.FC<KYCWidgetProps> = ({
  tier,
  accessToken,
  apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  user,
  onSuccess,
  onError,
  onProgress,
  onUpload, // EdgeStore upload function (optional, only needed for Tier 2)
  theme = "light",
}) => {
  const [apiClient] = useState(() => new KYCApiClient(apiBaseUrl, accessToken));
  const [isComplete, setIsComplete] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const {
    currentStep,
    setTier,
    setStatus,
    setLoading,
    setError,
    setStep,
    status,
  } = useKYCStore();

  useEffect(() => {
    setTier(tier);
    loadKYCStatus();
  }, [tier]);

  useEffect(() => {
    if (onProgress && !showWelcome) {
      onProgress(
        STEP_TITLES[currentStep] || `Step ${currentStep + 1}`,
        ((currentStep + 1) / 3) * 100,
      );
    }
  }, [currentStep, onProgress, showWelcome]);

  const loadKYCStatus = async () => {
    try {
      setLoading(true);
      const kycStatus = await apiClient.getKYCStatus();
      setStatus(kycStatus);

      if (tier === "tier_1") {
        // Check if BOTH BVN and selfie are verified
        const level1 = kycStatus.levels?.level_1;
        const bvnVerified = level1?.requirements?.bvn_verified === true;
        const selfieVerified = level1?.requirements?.selfie_verified === true;
        
        // Only mark complete if both are done
        if (bvnVerified && selfieVerified && kycStatus.current_level !== "LEVEL_0") {
          setIsComplete(true);
        }
      } else if (tier === "tier_2" && kycStatus.current_level === "LEVEL_3") {
        setIsComplete(true);
      }
    } catch (error: any) {
      setError(error.message);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = (result: any) => {
    onSuccess?.(result);
  };

  const handleUserRevalidated = (userData: any) => {
    // Optionally trigger a callback to parent component
    if (onSuccess) {
      onSuccess({ ...userData, revalidated: true });
    }
  };

  const handleContinue = () => {
    setShowWelcome(false);
  };

  const handleBack = () => {
    if (currentStep === 0) {
      setShowWelcome(true);
    } else {
      setStep(currentStep - 1);
    }
  };

  return (
    <div className="kyc-widget w-full h-full" data-theme={theme}>
      <div className="bg-white h-full flex flex-col">
        <AnimatePresence mode="wait">
          {showWelcome && !isComplete ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 overflow-y-auto"
            >
              <WelcomeScreen user={user || null} tier={tier} onContinue={handleContinue} />
            </motion.div>
          ) : !isComplete ? (
            <motion.div
              key="kyc-flow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              {/* Header with Back Button and Step Title - Only for Tier 1 */}
              {tier === "tier_1" && (
                <div className="relative p-4 border-b border-gray-200 flex items-center">
                  <button
                    onClick={handleBack}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <h2 className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-gray-900">
                    {STEP_TITLES[currentStep]}
                  </h2>
                </div>
              )}

              {/* Flow */}
              <div className="flex-1 overflow-y-auto p-4">
                {tier === "tier_1" ? (
                  <Tier1Flow
                    apiClient={apiClient}
                    onComplete={handleComplete}
                    onUserRevalidated={handleUserRevalidated}
                  />
                ) : (
                  <Tier2Flow
                    apiClient={apiClient}
                    user={user}
                    onComplete={handleComplete}
                    onUpload={onUpload}
                  />
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 overflow-y-auto p-6"
            >
              <SuccessScreen tier={tier} status={status} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
