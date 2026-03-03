"use client";

import { useKYCStore } from "../../store";
import { FloatingLabelSelect } from "../shared/FloatingLabelSelect";
import { FloatingLabelInput } from "../shared/FloatingLabelInput";
import { motion } from "framer-motion";
import { Check, Upload } from "lucide-react";
import React, { useRef, useState } from "react";

interface DocumentUploadProps {
  onUpload: (imageUrl: string, documentType: string) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [backPreview, setBackPreview] = useState<string>("");
  const [documentType, setLocalDocumentType] = useState<string>("");
  const [documentNumber, setLocalDocumentNumber] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingSide, setUploadingSide] = useState<"front" | "back" | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);
  const { setDocumentUrls, setDocumentType, setDocumentNumber } = useKYCStore();

  const requiresBackImage = documentType !== "passport";

  const documentOptions = [
    { value: "passport", label: "International Passport" },
    { value: "national_id", label: "National ID Card (NIN)" },
    { value: "drivers_licence", label: "Driver's License" },
    { value: "voters_card", label: "Voter's Card" },
  ];

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "front" | "back",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploading(true);
      setUploadProgress(0);
      setUploadingSide(side);

      const reader = new FileReader();
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);
        }
      };
      reader.onloadend = () => {
        const result = reader.result as string;
        if (side === "front") {
          setPreview(result);
        } else {
          setBackPreview(result);
        }
        setUploading(false);
        setUploadProgress(100);
        setUploadingSide(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = () => {
    if (preview && (!requiresBackImage || backPreview) && documentNumber.trim()) {
      setDocumentUrls(preview, backPreview);
      setDocumentType(documentType);
      setDocumentNumber(documentNumber);
      onUpload(preview, documentType);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="space-y-4">
        {/* Document Type Selection */}
        <FloatingLabelSelect
          label="Document Type"
          value={documentType}
          onChange={setLocalDocumentType}
          options={documentOptions}
        />

        {/* Document Number Input */}
        {documentType && (
          <FloatingLabelInput
            label="Document Number"
            value={documentNumber}
            onChange={setLocalDocumentNumber}
            type="text"
            placeholder="Enter document number"
          />
        )}

        {/* Upload Area - Only show when document type is selected */}
        {documentType && (
          <div className="space-y-4">
            {/* Front Side */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, "front")}
                className="hidden"
              />

              {!preview ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading && uploadingSide === "front"}
                  className="w-full h-14 px-4 bg-white border-dashed border-2 border-gray-300 rounded-2xl hover:bg-background transition-colors disabled:opacity-50 flex items-center justify-between"
                >
                  <span className="text-sm text-gray-700">
                    {uploading && uploadingSide === "front"
                      ? "Uploading..."
                      : requiresBackImage
                      ? "Upload Front Side"
                      : "Upload Document"}
                  </span>
                  <Upload className="w-5 h-5 text-gray-500" />
                </button>
              ) : (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Document front"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setPreview("")}
                    className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 text-sm"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Uploaded
                  </div>
                </div>
              )}
            </div>

            {/* Back Side - Only for non-passport documents */}
            {requiresBackImage && (
              <div>
                <input
                  ref={backFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, "back")}
                  className="hidden"
                />

                {!backPreview ? (
                  <button
                    onClick={() => backFileInputRef.current?.click()}
                    disabled={uploading && uploadingSide === "back"}
                    className="w-full h-14 px-4 bg-white border-dashed border-2 border-gray-300 rounded-2xl hover:bg-background transition-colors disabled:opacity-50 flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-700">
                      {uploading && uploadingSide === "back"
                        ? "Uploading..."
                        : "Upload Back Side"}
                    </span>
                    <Upload className="w-5 h-5 text-gray-500" />
                  </button>
                ) : (
                  <div className="relative">
                    <img
                      src={backPreview}
                      alt="Document back"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setBackPreview("")}
                      className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 text-sm"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Uploaded
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={
            !documentType || !documentNumber.trim() || !preview || (requiresBackImage && !backPreview)
          }
          className="w-full h-10 px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-[#09bced] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>

        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-900">
            Your document is securely stored and never shared without your
            permission.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
