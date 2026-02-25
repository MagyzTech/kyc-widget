import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, CreditCard, Wallet } from 'lucide-react';
import type { KYCTier, KYCStatus } from '../../types';

interface SuccessScreenProps {
  tier: KYCTier;
  status: KYCStatus | null;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({ tier, status }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="kyc-success"
    >
      <motion.div
        initial={{ scale: 0, x: 0 }}
        animate={{ scale: 1, x: 0 }}
        transition={{ delay: 0.2, type: 'spring' }}
        style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}
      >
        <CheckCircle className="w-16 h-16 text-green-500" />
      </motion.div>

      <h2 className="kyc-success-title">Verification Complete!</h2>
      
      <p className="kyc-success-message">
        {tier === 'tier_1'
          ? 'Your identity has been verified. You can now create NUBAN accounts and dollar cards.'
          : 'Your documents have been verified. You can now create USD and EUR accounts.'}
      </p>

      <div className="kyc-success-features">
        {tier === 'tier_1' ? (
          <>
            <div className="kyc-feature">
              <Wallet className="w-5 h-5" />
              <span>NUBAN Account</span>
            </div>
            <div className="kyc-feature">
              <CreditCard className="w-5 h-5" />
              <span>Dollar Cards</span>
            </div>
          </>
        ) : (
          <>
            <div className="kyc-feature">
              <Wallet className="w-5 h-5" />
              <span>USD Accounts</span>
            </div>
            <div className="kyc-feature">
              <Wallet className="w-5 h-5" />
              <span>EUR Accounts</span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};
