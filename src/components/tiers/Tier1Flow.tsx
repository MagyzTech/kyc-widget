"use client";

import type { KYCApiClient } from "../../services/api";
import { useKYCStore } from "../../store";
import { BottomSheet } from "../shared/BottomSheet";
import { ActionList } from "../steps/ActionList";
import { BVNInput } from "../steps/BVNInput";
import { CameraPermission } from "../steps/CameraPermission";
import { DocumentUpload } from "../steps/DocumentUpload";
import { SelfieCapture } from "../steps/SelfieCapture";
import { SelfieInfo } from "../steps/SelfieInfo";
import { SuccessScreen } from "../steps/SuccessScreen";
import { VerificationStep } from "../steps/VerificationStep";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";

interface Tier1FlowProps {
  apiClient: KYCApiClient;
  onComplete: (result: any) => void;
  onUserRevalidated?: (userData: any) => void;
}

export const Tier1Flow: React.FC<Tier1FlowProps> = ({
  apiClient,
  onComplete,
  onUserRevalidated,
}) => {
  const {
    currentStep,
    setStep,
    bvn,
    selfieUrl,
    documentFrontUrl,
    documentBackUrl,
    setError,
  } = useKYCStore();
  const [verifying, setVerifying] = useState(false);
  const [cameraGranted, setCameraGranted] = useState(false);
  const [showSelfieInfo, setShowSelfieInfo] = useState(false);
  const [showBVNSheet, setShowBVNSheet] = useState(false);
  const [showDocumentSheet, setShowDocumentSheet] = useState(false);
  const [bvnCompleted, setBvnCompleted] = useState(false);
  const [documentCompleted, setDocumentCompleted] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleBVNSubmit = (bvnValue: string) => {
    setBvnCompleted(true);
    setShowBVNSheet(false);
  };

  const handleDocumentUpload = (imageUrl: string, documentType: string) => {
    setDocumentCompleted(true);
    setShowDocumentSheet(false);
  };

  const handleContinueToSelfie = () => {
    setStep(1);
    setShowSelfieInfo(true);
  };

  const handleCameraGranted = () => {
    setCameraGranted(true);
    setShowSelfieInfo(false);
  };

  const handleStartSelfieCapture = () => {
    setShowSelfieInfo(false);
    // Camera permission will be checked automatically
  };

  const handleSelfieCapture = (imageUrl: string) => {
    setStep(2);
  };

  const handleVerify = async () => {
    try {
      setVerifying(true);
      setError(null);

      // Combined BVN + Document verification (atomic transaction)
      try {
        // Strip data URL prefix
        const cleanSelfie = selfieUrl.split(",")[1] || selfieUrl;
        const cleanFrontImage = documentFrontUrl ? (documentFrontUrl.split(",")[1] || documentFrontUrl) : undefined;
        const cleanBackImage = documentBackUrl ? (documentBackUrl.split(",")[1] || documentBackUrl) : undefined;
        
        const { documentType, documentNumber } = useKYCStore.getState();
        const mappedDocType = documentType === 'national_id' ? 'nin' : documentType;
        
        const result = await apiClient.verifyCombined({
          bvn,
          selfie_image: cleanSelfie,
          document_front: cleanFrontImage,
          document_back: cleanBackImage,
          document_type: documentFrontUrl ? mappedDocType : undefined,
          document_number: documentFrontUrl ? documentNumber : undefined,
          issue_date: '2020-01-01',
          expiry_date: '2030-01-01',
        });
        
        setVerificationResult(result);
        setStep(3);
        
      } catch (error: any) {
        console.error('[API] Combined verification failed:', error);
        
        let errorMessage = 'Verification failed. Please try again.';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.status === 404) {
          errorMessage = 'Verification service temporarily unavailable. Please try again later.';
        } else if (error.response?.status === 400) {
          errorMessage = 'Invalid information or verification failed. Please check your details.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
      }

    } catch (error: any) {
      console.error('[API] Unexpected verification error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <motion.div
            key="actions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            <ActionList
              bvnCompleted={bvnCompleted}
              documentCompleted={documentCompleted}
              onBVNClick={() => setShowBVNSheet(true)}
              onDocumentClick={() => setShowDocumentSheet(true)}
              onContinue={handleContinueToSelfie}
            />
          </motion.div>
        )}

        {currentStep === 1 && showSelfieInfo && (
          <motion.div
            key="selfie-info"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            <SelfieInfo onStart={handleStartSelfieCapture} />
          </motion.div>
        )}

        {currentStep === 1 && !showSelfieInfo && !cameraGranted && (
          <motion.div
            key="camera-permission"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            <CameraPermission onGrant={handleCameraGranted} />
          </motion.div>
        )}

        {currentStep === 1 && !showSelfieInfo && cameraGranted && (
          <motion.div
            key="selfie"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            <SelfieCapture onCapture={handleSelfieCapture} />
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="verify"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            <VerificationStep
              bvn={bvn}
              selfieUrl={selfieUrl}
              documentFrontUrl={documentFrontUrl}
              documentBackUrl={documentBackUrl}
              onVerify={handleVerify}
              onEdit={() => setStep(0)}
              verifying={verifying}
            />
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-full"
          >
            <SuccessScreen
              selfieUrl={selfieUrl}
              onClose={() => onComplete(verificationResult)}
              apiClient={apiClient}
              onUserRevalidated={onUserRevalidated}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Sheets */}
      <BottomSheet
        isOpen={showBVNSheet}
        onClose={() => setShowBVNSheet(false)}
        title="Bank Verification Number"
      >
        <BVNInput onSubmit={handleBVNSubmit} />
      </BottomSheet>

      <BottomSheet
        isOpen={showDocumentSheet}
        onClose={() => setShowDocumentSheet(false)}
        title="ID Document"
      >
        <DocumentUpload onUpload={handleDocumentUpload} />
      </BottomSheet>
    </>
  );
};
