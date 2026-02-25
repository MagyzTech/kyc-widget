"use client";

import { useKYCStore } from "../../store";
import { BVN_REGEX, MESSAGES } from "../../utils/constants";
import { FloatingLabelInput } from "../shared/FloatingLabelInput";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import React, { useState } from "react";

interface BVNInputProps {
  onSubmit: (bvn: string) => void;
}

export const BVNInput: React.FC<BVNInputProps> = ({ onSubmit }) => {
  const { bvn, setBVN } = useKYCStore();
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!bvn) {
      setError(MESSAGES.error.required);
      return;
    }

    if (!BVN_REGEX.test(bvn)) {
      setError(MESSAGES.error.bvn);
      return;
    }

    setError("");
    onSubmit(bvn);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FloatingLabelInput
          label="Bank Verification Number"
          value={bvn}
          onChange={(value) => {
            setBVN(value.replace(/\D/g, ""));
            setError("");
          }}
          type="text"
          maxLength={11}
        />
        {error && (
          <span className="text-sm text-red-500 block text-left">
            {error}
          </span>
        )}

        <button
          type="submit"
          className="w-full h-10 px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-[#09bced] transition-colors flex items-center justify-center gap-2"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-900">
          Your BVN is used to verify your identity and is kept secure.
        </p>
      </div>
    </motion.div>
  );
};
