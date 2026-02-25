import { useKYCStore } from "../../store";
import { motion } from "framer-motion";
import { Edit2, Loader2 } from "lucide-react";
import React from "react";

interface VerificationStepProps {
  bvn: string;
  selfieUrl: string;
  documentFrontUrl: string;
  documentBackUrl: string;
  onVerify: () => void;
  onEdit?: () => void;
  verifying: boolean;
}

export const VerificationStep: React.FC<VerificationStepProps> = ({
  bvn,
  selfieUrl,
  documentFrontUrl,
  documentBackUrl,
  onVerify,
  onEdit,
  verifying,
}) => {
  const { error, documentType, documentNumber } = useKYCStore();

  const documentTypeLabels = {
    passport: "International Passport",
    national_id: "National ID Card (NIN)",
    drivers_licence: "Driver's License",
    voters_card: "Voter's Card",
  };

  const requiresBackImage = documentType !== "passport";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      {/* Selfie */}
      <div className="p-4 ">
        <div className="flex justify-center">
          <div className="w-32 h-32 rounded-full bg-white p-2 border border-border overflow-hidden">
            <img
              src={selfieUrl}
              alt="Selfie"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {/* BVN */}
        <div className="p-4 bg-[#ebebf0] rounded-md">
          <span className="text-xs font-semibold text-gray-600 uppercase block mb-1">
            Bank Verification Number
          </span>
          <span className="text-base text-gray-900">{bvn}</span>
        </div>

        {/* Document Type */}
        {documentType && (
          <div className="p-4 bg-[#ebebf0] rounded-md">
            <span className="text-xs font-semibold text-gray-600 uppercase block mb-1">
              Document Type
            </span>
            <span className="text-base text-gray-900">
              {documentTypeLabels[
                documentType as keyof typeof documentTypeLabels
              ] || documentType}
            </span>
          </div>
        )}

        {/* Document Number */}
        {documentNumber && (
          <div className="p-4 bg-[#ebebf0] rounded-md">
            <span className="text-xs font-semibold text-gray-600 uppercase block mb-1">Document Number</span>
            <span className="text-base text-gray-900">{documentNumber}</span>
          </div>
        )}

        {/* Document Images */}
        {documentFrontUrl && (
          <div className="p-4 bg-[#ebebf0] rounded-md">
            <span className="text-xs font-semibold text-gray-600 uppercase block mb-2">
              {requiresBackImage ? "Document Front" : "Document"}
            </span>
            <img
              src={documentFrontUrl}
              alt="Document front"
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
        )}

        {documentBackUrl && requiresBackImage && (
          <div className="p-4 bg-[#ebebf0] rounded-md">
            <span className="text-xs font-semibold text-gray-600 uppercase block mb-2">
              Document Back
            </span>
            <img
              src={documentBackUrl}
              alt="Document back"
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mb-4"
        >
          {error}
        </motion.div>
      )}

      <div className="space-y-3">
        {onEdit && (
          <button
            onClick={onEdit}
            disabled={verifying}
            className="w-full h-10 px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Edit2 className="w-4 h-4" />
            Edit Information
          </button>
        )}

        <button
          onClick={onVerify}
          disabled={verifying}
          className="w-full h-10 px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-[#09bced] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {verifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Proceed"
          )}
        </button>
      </div>
    </motion.div>
  );
};
