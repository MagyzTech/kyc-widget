"use client";

import React, { useEffect } from "react";
import { CheckCircle, DollarSign, Euro } from "lucide-react";
import { postMessageToRN } from "../WebViewWrapper";

interface Tier2SuccessScreenProps {
  title?: string;
  message?: string;
}

export const Tier2SuccessScreen: React.FC<Tier2SuccessScreenProps> = ({
  title = "Verification Complete!",
  message = "Your documents have been verified. You can now create USD and EUR accounts.",
}) => {
  useEffect(() => {
    // Notify React Native WebView
    postMessageToRN({ type: 'KYC_SUCCESS', tier: 2 });

    // Reload page after 3 seconds
    const timer = setTimeout(() => {
      window.location.reload();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900">
          {title}
        </h1>

        {/* Message */}
        <p className="text-base text-gray-600">
          {message}
        </p>

        {/* Currency Icons */}
        <div className="flex justify-center gap-4 pt-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-900">USD Accounts</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
            <Euro className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-900">EUR Accounts</span>
          </div>
        </div>

        {/* Loading indicator */}
        <p className="text-sm text-gray-500">
          Refreshing your account...
        </p>
      </div>
    </div>
  );
};
