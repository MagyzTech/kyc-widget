"use client";

import React, { useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { postMessageToRN } from "../WebViewWrapper";

interface SuccessScreenProps {
  selfieUrl: string;
  onClose: () => void;
  apiClient?: any;
  onUserRevalidated?: (userData: any) => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  selfieUrl,
  onClose,
  apiClient,
  onUserRevalidated,
}) => {
  useEffect(() => {
    // Notify React Native WebView
    postMessageToRN({ type: 'KYC_SUCCESS', tier: 1 });

    // For Tier 1, just reload the page after a short delay
    const timer = setTimeout(() => {
      window.location.reload();
    }, 3000); // 3 seconds to show success message

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full grid grid-rows-[1fr_auto_1fr]">
      {/* Spacer */}
      <div />

      {/* Success Content - Centered */}
      <div className="flex flex-col items-center gap-6 px-6">
        {/* Selfie with Badge */}
        <div className="relative">
          <img
            src={selfieUrl}
            alt="Selfie"
            className="w-32 h-32 rounded-full object-cover"
          />
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
            <CheckCircle className="w-8 h-8 text-green-500 fill-green-500" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-[32px] font-bold text-black text-center leading-tight">
          Verification submitted and verified successfully
        </h1>

        <p className="text-base text-gray-600 text-center">
          Refreshing your account...
        </p>
      </div>

      {/* Spacer */}
      <div />
    </div>
  );
};
