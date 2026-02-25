import React, { useState, useEffect } from 'react';

interface AddressFormProps {
  initialData?: {
    addressLine?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  onComplete: (data: any) => void;
  onBack: () => void;
}

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa',
  'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger',
  'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT'
];

export const AddressForm: React.FC<AddressFormProps> = ({ initialData, onComplete, onBack }) => {
  const [data, setData] = useState({
    addressLine: initialData?.addressLine || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    postalCode: initialData?.postalCode || '100001',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setData({
        addressLine: initialData.addressLine || '',
        city: initialData.city || '',
        state: initialData.state || '',
        postalCode: initialData.postalCode || '100001',
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.addressLine.trim()) newErrors.addressLine = 'Street address is required';
    if (!data.city.trim()) newErrors.city = 'City is required';
    if (!data.state) newErrors.state = 'State is required';
    if (!data.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
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
      <h2 className="text-xl font-semibold mb-2">Address Information</h2>
      <p className="text-sm text-gray-600 mb-6">Please provide your residential address</p>

      <div className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Street Address *"
            value={data.addressLine}
            onChange={(e) => setData({...data, addressLine: e.target.value})}
            className={`w-full p-2 border rounded-lg ${errors.addressLine ? 'border-red-500' : ''}`}
          />
          {errors.addressLine && <p className="text-sm text-red-600 mt-1">{errors.addressLine}</p>}
        </div>

        <div>
          <input
            type="text"
            placeholder="City *"
            value={data.city}
            onChange={(e) => setData({...data, city: e.target.value})}
            className={`w-full p-2 border rounded-lg ${errors.city ? 'border-red-500' : ''}`}
          />
          {errors.city && <p className="text-sm text-red-600 mt-1">{errors.city}</p>}
        </div>

        <div>
          <select
            value={data.state}
            onChange={(e) => setData({...data, state: e.target.value})}
            className={`w-full p-2 border rounded-lg ${errors.state ? 'border-red-500' : ''}`}
          >
            <option value="">Select State *</option>
            {NIGERIAN_STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          {errors.state && <p className="text-sm text-red-600 mt-1">{errors.state}</p>}
        </div>

        <div>
          <input
            type="text"
            placeholder="Postal Code *"
            value={data.postalCode}
            onChange={(e) => setData({...data, postalCode: e.target.value})}
            className={`w-full p-2 border rounded-lg ${errors.postalCode ? 'border-red-500' : ''}`}
          />
          {errors.postalCode && <p className="text-sm text-red-600 mt-1">{errors.postalCode}</p>}
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
