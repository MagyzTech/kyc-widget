"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import React from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-md z-40"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%", x: "-50%" }}
            animate={{ y: 0, x: "-50%" }}
            exit={{ y: "100%", x: "-50%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            style={{ left: "50%" }}
            className="fixed bottom-0 w-full max-w-md bg-white rounded-t-2xl z-50 lg:max-h-[560px] max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-end pt-4 px-4">
              {/* <h3 className="text-lg font-semibold">{title}</h3> */}
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto h-full">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
