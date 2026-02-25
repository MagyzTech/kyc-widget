export const MESSAGES = {
  success: {
    bvn: 'BVN verified successfully',
    selfie: 'Selfie captured successfully',
    liveness: 'Liveness check passed',
    document: 'Document verified successfully',
    address: 'Address updated successfully',
    tier1Complete: 'Tier 1 verification complete! NUBAN account enabled',
    tier2Complete: 'Tier 2 verification complete! USD/EUR accounts enabled',
  },
  error: {
    bvn: 'Invalid BVN. Please check and try again',
    bvnExists: 'BVN already registered to another user',
    camera: 'Camera access denied. Please enable camera permissions',
    face: 'No face detected. Please position your face in the frame',
    liveness: 'Liveness check failed. Please try again in good lighting',
    upload: 'Upload failed. Please check your connection',
    network: 'Connection error. Please try again',
    document: 'Document verification failed. Please upload a clear image',
    required: 'This field is required',
  },
  info: {
    bvn: 'Enter your 11-digit Bank Verification Number',
    selfie: 'Position your face in the oval and hold still',
    document: 'Upload a clear photo of your ID card, passport, or driver\'s license',
    address: 'Provide your current residential address',
    utility: 'Upload a recent utility bill (not older than 3 months)',
  },
  loading: {
    bvn: 'Verifying BVN...',
    selfie: 'Processing selfie...',
    liveness: 'Checking liveness...',
    document: 'Analyzing document...',
    address: 'Updating address...',
  },
};

export const COLORS = {
  primary: {
    start: '#6366F1',
    end: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
  },
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export const BVN_REGEX = /^\d{11}$/;
