import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import React from "react";

interface WelcomeScreenProps {
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    selfieUrl?: string;
  } | null;
  tier: 'tier_1' | 'tier_2';
  onContinue: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  user,
  tier,
  onContinue,
}) => {
  const isTier2 = tier === 'tier_2';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-rows-2 text-center gap-y-5 h-full"
    >
      {/* Logo - Only show for Tier 1 */}
      <div className="px-6 py-8 flex flex-col items-center justify-between">
        {!isTier2 && (
          <div>
            <img src="/logo.png" alt="Falconlite" className="w-auto h-[24px]" />
          </div>
        )}

        {/* Greeting */}
        <div className={isTier2 ? "mt-8" : ""}>
          <h2 className="text-2xl font-semibold text-gray-900">
            {isTier2 ? 'Unlock USD/EUR Accounts' : "Let's Get Started!"}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {isTier2 ? 'Complete Tier 2 verification for multi-currency access' : 'Verify your identity in a few seconds'}
          </p>
        </div>
      </div>

      {/* What We'll Collect */}
      <div className="w-full flex flex-col bg-gray-50 rounded-2xl p-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 text-left">
          {isTier2 ? "We'll need:" : "We'll collect:"}
        </h3>
        <div className="space-y-2 text-left">
          {isTier2 ? (
            <>
              <div className="flex items-start gap-2 text-xs text-gray-700">
                <span className="text-primary mt-0.5">•</span>
                <span>Government-issued ID (Passport, Driver's License, or Voter's Card)</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-700">
                <span className="text-primary mt-0.5">•</span>
                <span>Your residential address details</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-700">
                <span className="text-primary mt-0.5">•</span>
                <span>Employment and background information</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-700">
                <span className="text-primary mt-0.5">•</span>
                <span>Bank statement for proof of address</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2 text-xs text-gray-700">
                <span className="text-primary mt-0.5">•</span>
                <span>Your Bank Verification Number (BVN)</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-700">
                <span className="text-primary mt-0.5">•</span>
                <span>A selfie for identity verification</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-700">
                <span className="text-primary mt-0.5">•</span>
                <span>Liveness check to confirm it's really you</span>
              </div>
            </>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-end">
          {/* Policy */}
          <p className="text-xs text-gray-600 mb-6 leading-relaxed">
            By clicking 'Continue' you agree to our{" "}
            <a
              href="#"
              className="text-[#6366F1] font-medium no-underline hover:underline"
            >
              End-user Policy
            </a>
            .
          </p>

          {/* Continue Button */}
          <button
            onClick={onContinue}
            className="w-full h-10 px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-[#09bced] transition-colors flex items-center justify-center gap-2"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
