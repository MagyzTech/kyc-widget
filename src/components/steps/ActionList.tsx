"use client";

import { motion } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";
import React from "react";

interface ActionListProps {
  bvnCompleted: boolean;
  documentCompleted: boolean;
  onBVNClick: () => void;
  onDocumentClick: () => void;
  onContinue: () => void;
}

export const ActionList: React.FC<ActionListProps> = ({
  bvnCompleted,
  documentCompleted,
  onBVNClick,
  onDocumentClick,
  onContinue,
}) => {
  const allCompleted = bvnCompleted && documentCompleted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid h-full grid-rows-[auto_1fr_auto] gap-y-4"
    >
      <div className="mb-6">
        <p className="text-sm text-center text-gray-600">
          Provide your BVN and ID document
        </p>
      </div>

      <div className="flex flex-col gap-y-4">
        {/* BVN Action */}
        <ActionItem
          onClick={onBVNClick}
          completed={bvnCompleted}
          title="Bank Verification Number"
          subtitle={bvnCompleted ? "BVN verified" : "Enter your 11-digit BVN"}
        />

        {/* Document Action */}
        <ActionItem
          onClick={onDocumentClick}
          completed={documentCompleted}
          title="ID Document"
          subtitle={
            documentCompleted
              ? "ID document uploaded"
              : "Upload your ID document"
          }
        />
      </div>

      <div className="flex flex-1 flex-col justify-end">
        {allCompleted && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onContinue}
            className="w-full h-10 bg-primary text-white rounded-md px-4 py-2 font-medium hover:bg-[#09bced] transition-colors mt-6"
          >
            Continue to Selfie Verification
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

{
  /* Document Action */
}
const ActionItem = ({
  onClick,
  completed,
  title,
  subtitle,
}: {
  onClick: () => void;
  completed: boolean;
  title?: string;
  subtitle?: string;
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 bg-background border border-transparent  rounded-2xl hover:border-primary transition-colors text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-[14px] mb-1">{title}</h3>
          <p className="text-xs text-gray-600">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {completed && (
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <ChevronRight className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </button>
  );
};
