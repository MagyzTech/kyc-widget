import React, { useState } from 'react';
import type { KYCApiClient } from '../../services/api';
import { DocumentSelector } from '../steps/DocumentSelector';
import { AddressForm } from '../steps/AddressForm';
import { BackgroundInfoForm } from '../steps/BackgroundInfoForm';
import { BankStatementUpload } from '../steps/BankStatementUpload';
import { Tier2ReviewStep } from '../steps/Tier2ReviewStep';
import { Tier2SuccessScreen } from '../steps/Tier2SuccessScreen';

interface Tier2FlowProps {
  apiClient: KYCApiClient;
  user: any;
  onComplete: (result: any) => void;
  onUpload?: (file: File) => Promise<string>; // EdgeStore upload function
}

export const Tier2Flow: React.FC<Tier2FlowProps> = ({ 
  apiClient, 
  user, 
  onComplete,
  onUpload 
}) => {
  const [step, setStep] = useState(0);
  const [documentData, setDocumentData] = useState<any>(null);
  const [addressData, setAddressData] = useState<any>(null);
  const [backgroundData, setBackgroundData] = useState<any>(null);
  const [bankStatementUrl, setBankStatementUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        document_type: documentData.type,
        document_number: documentData.number,
        document_front_url: documentData.frontUrl,
        document_back_url: documentData.backUrl,
        issue_date: documentData.issueDate || '2020-01-01',
        expiry_date: documentData.expiryDate || '2030-01-01',
        address_line: addressData.addressLine,
        address_city: addressData.city,
        address_state: addressData.state,
        postal_code: addressData.postalCode,
        address_country: 'NG',
        employment_status: backgroundData.employmentStatus,
        occupation: backgroundData.occupation,
        primary_purpose: backgroundData.primaryPurpose,
        source_of_funds: backgroundData.sourceOfFunds,
        expected_monthly_inflow: backgroundData.expectedMonthlyInflow,
        bank_statement_url: bankStatementUrl,
      };

      const result = await apiClient.verifyTier2KYC(payload);
      setStep(5);
      onComplete(result);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Tier 2 KYC failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="tier2-flow">
      {step === 0 && (
        <DocumentSelector
          existingDocs={user?.kyc?.[0]?.means_of_id || []}
          onComplete={(data) => {
            setDocumentData(data);
            setStep(1);
          }}
          onUpload={onUpload}
        />
      )}
      
      {step === 1 && (
        <AddressForm
          initialData={user?.kyc?.[0] ? {
            addressLine: user.kyc[0].address_line,
            city: user.kyc[0].address_city,
            state: user.kyc[0].address_state,
            postalCode: user.kyc[0].postal_code,
          } : undefined}
          onComplete={(data) => {
            setAddressData(data);
            setStep(2);
          }}
          onBack={() => setStep(0)}
        />
      )}
      
      {step === 2 && (
        <BackgroundInfoForm
          onComplete={(data) => {
            setBackgroundData(data);
            setStep(3);
          }}
          onBack={() => setStep(1)}
        />
      )}
      
      {step === 3 && (
        <BankStatementUpload
          address={addressData ? {
            line: addressData.addressLine,
            city: addressData.city,
            state: addressData.state,
            postalCode: addressData.postalCode,
          } : undefined}
          onComplete={(url) => {
            setBankStatementUrl(url);
            setStep(4);
          }}
          onBack={() => setStep(2)}
          onUpload={onUpload}
        />
      )}
      
      {step === 4 && (
        <Tier2ReviewStep
          documentData={documentData}
          addressData={addressData}
          backgroundData={backgroundData}
          bankStatementUrl={bankStatementUrl}
          onSubmit={handleSubmit}
          onBack={() => setStep(3)}
          isSubmitting={isSubmitting}
          error={error}
        />
      )}
      
      {step === 5 && (
        <Tier2SuccessScreen
          title="Tier 2 KYC Complete!"
          message="USD/EUR accounts enabled. You can now create virtual accounts."
        />
      )}
    </div>
  );
};
