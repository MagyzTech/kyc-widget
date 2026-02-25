'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Shield } from 'lucide-react';

interface CameraPermissionProps {
  onGrant: () => void;
}

export const CameraPermission: React.FC<CameraPermissionProps> = ({ onGrant }) => {
  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop the stream immediately, we just needed permission
      stream.getTracks().forEach(track => track.stop());
      onGrant();
    } catch (error) {
      console.error('Camera permission denied:', error);
    }
  };

  // Check if permission is already granted
  React.useEffect(() => {
    const checkPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (result.state === 'granted') {
          onGrant();
        }
      } catch (error) {
        // Permission API not supported, continue with manual request
      }
    };
    checkPermission();
  }, [onGrant]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center flex flex-col items-center justify-center h-full px-6"
    >
      <div className="w-16 h-16 mb-6 bg-primary/10 rounded-full flex items-center justify-center">
        <Camera className="w-8 h-8 text-primary" />
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mb-3">Camera Access Required</h2>
      <p className="text-sm text-gray-600 mb-8 max-w-sm">
        We need access to your camera to capture your selfie for identity verification.
      </p>

      <div className="w-full max-w-sm space-y-4 mb-8">
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg text-left">
          <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Secure & Private</h3>
            <p className="text-xs text-gray-600">
              Your photos are encrypted and only used for verification purposes.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={requestPermission}
        className="w-full max-w-sm h-10 px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-[#09bced] transition-colors"
      >
        Grant Permission
      </button>
    </motion.div>
  );
};
