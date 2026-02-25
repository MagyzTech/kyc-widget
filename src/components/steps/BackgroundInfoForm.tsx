import React, { useState } from 'react';

interface BackgroundInfoFormProps {
  onComplete: (data: any) => void;
  onBack: () => void;
}

export const BackgroundInfoForm: React.FC<BackgroundInfoFormProps> = ({ onComplete, onBack }) => {
  const [data, setData] = useState({
    employmentStatus: 'employed',
    occupation: '',
    primaryPurpose: 'personal',
    sourceOfFunds: 'salary',
    expectedMonthlyInflow: 1000,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.occupation.trim()) newErrors.occupation = 'Occupation is required';
    if (data.expectedMonthlyInflow < 100) newErrors.expectedMonthlyInflow = 'Minimum $100';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onComplete(data);
    }
  };

  return (
    <div className="kyc-step">
      <h2 className="text-xl font-semibold mb-2">Background Information</h2>
      <p className="text-sm text-gray-600 mb-6">Tell us about your financial background</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Employment Status *</label>
          <select
            value={data.employmentStatus}
            onChange={(e) => setData({...data, employmentStatus: e.target.value})}
            className="w-full p-2 border rounded-lg"
          >
            <option value="employed">Employed</option>
            <option value="self_employed">Self Employed</option>
            <option value="unemployed">Unemployed</option>
            <option value="student">Student</option>
          </select>
        </div>

        <div>
          <input
            type="text"
            placeholder="Occupation *"
            value={data.occupation}
            onChange={(e) => setData({...data, occupation: e.target.value})}
            className={`w-full p-2 border rounded-lg ${errors.occupation ? 'border-red-500' : ''}`}
          />
          {errors.occupation && <p className="text-sm text-red-600 mt-1">{errors.occupation}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Primary Purpose *</label>
          <select
            value={data.primaryPurpose}
            onChange={(e) => setData({...data, primaryPurpose: e.target.value})}
            className="w-full p-2 border rounded-lg"
          >
            <option value="personal">Personal</option>
            <option value="business">Business</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Source of Funds *</label>
          <input
            type="text"
            placeholder="e.g., Salary, Business, Investment"
            value={data.sourceOfFunds}
            onChange={(e) => setData({...data, sourceOfFunds: e.target.value})}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Expected Monthly Inflow (USD) *</label>
          <input
            type="number"
            placeholder="1000"
            value={data.expectedMonthlyInflow}
            onChange={(e) => setData({...data, expectedMonthlyInflow: parseInt(e.target.value) || 0})}
            className={`w-full p-2 border rounded-lg ${errors.expectedMonthlyInflow ? 'border-red-500' : ''}`}
          />
          {errors.expectedMonthlyInflow && <p className="text-sm text-red-600 mt-1">{errors.expectedMonthlyInflow}</p>}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-2 px-4 bg-primary text-white rounded-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
