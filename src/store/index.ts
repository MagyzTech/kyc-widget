import { create } from 'zustand';
import type { KYCTier, KYCStatus } from '../types';

interface KYCState {
  tier: KYCTier;
  currentStep: number;
  totalSteps: number;
  status: KYCStatus | null;
  loading: boolean;
  error: string | null;
  bvn: string;
  selfieUrl: string;
  documentFrontUrl: string;
  documentBackUrl: string;
  documentType: string;
  documentNumber: string;
  
  setTier: (tier: KYCTier) => void;
  setStep: (step: number) => void;
  setStatus: (status: KYCStatus) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setBVN: (bvn: string) => void;
  setSelfieUrl: (url: string) => void;
  setDocumentUrls: (front: string, back?: string) => void;
  setDocumentNumber: (number: string) => void;
  reset: () => void;
}

export const useKYCStore = create<KYCState>((set) => ({
  tier: 'tier_1',
  currentStep: 0,
  totalSteps: 2,
  status: null,
  loading: false,
  error: null,
  bvn: '',
  selfieUrl: '',
  documentFrontUrl: '',
  documentBackUrl: '',
  documentType: 'passport',
  documentNumber: '',
  
  setTier: (tier) => set({ tier, totalSteps: tier === 'tier_1' ? 2 : 4 }),
  setStep: (step) => set({ currentStep: step }),
  setStatus: (status) => set({ status }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setBVN: (bvn) => set({ bvn }),
  setSelfieUrl: (url) => set({ selfieUrl: url }),
  setDocumentUrls: (front, back) => set({ documentFrontUrl: front, documentBackUrl: back || '' }),
  setDocumentNumber: (number) => set({ documentNumber: number }),
  reset: () => set({
    currentStep: 0,
    status: null,
    loading: false,
    error: null,
    bvn: '',
    selfieUrl: '',
    documentFrontUrl: '',
    documentBackUrl: '',
  }),
}));
