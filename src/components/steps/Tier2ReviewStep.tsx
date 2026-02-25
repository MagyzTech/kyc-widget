import React from 'react';

interface Tier2ReviewStepProps {
  documentData: any;
  addressData: any;
  backgroundData: any;
  bankStatementUrl: string;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  error: string | null;
}

export const Tier2ReviewStep: React.FC<Tier2ReviewStepProps> = ({
  documentData,
  addressData,
  backgroundData,
  bankStatementUrl,
  onSubmit,
  onBack,
  isSubmitting,
  error,
}) => {
  return (
    <div className="kyc-step">
      <h2 className="text-xl font-semibold mb-2">Review Your Information</h2>
      <p className="text-sm text-gray-600 mb-6">Please review all details before submitting</p>

      <div className="space-y-4">
        {/* Document Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium mb-2">Document</h3>
          <div className="text-sm space-y-1">
            <p><span className="text-gray-600">Type:</span> {documentData.type.replace(/_/g, ' ')}</p>
            <p><span className="text-gray-600">Number:</span> {documentData.number}</p>
          </div>
        </div>

        {/* Address Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium mb-2">Address</h3>
          <div className="text-sm space-y-1">
            <p>{addressData.addressLine}</p>
            <p>{addressData.city}, {addressData.state}</p>
            <p>{addressData.postalCode}</p>
          </div>
        </div>

        {/* Background Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium mb-2">Background</h3>
          <div className="text-sm space-y-1">
            <p><span className="text-gray-600">Employment:</span> {backgroundData.employmentStatus.replace(/_/g, ' ')}</p>
            <p><span className="text-gray-600">Occupation:</span> {backgroundData.occupation}</p>
            <p><span className="text-gray-600">Purpose:</span> {backgroundData.primaryPurpose}</p>
            <p><span className="text-gray-600">Source of Funds:</span> {backgroundData.sourceOfFunds}</p>
            <p><span className="text-gray-600">Monthly Inflow:</span> ${backgroundData.expectedMonthlyInflow}</p>
          </div>
        </div>

        {/* Bank Statement */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium mb-2">Bank Statement</h3>
          <p className="text-sm text-green-600">✓ Uploaded</p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 py-2 px-4 bg-primary text-white rounded-lg disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};
