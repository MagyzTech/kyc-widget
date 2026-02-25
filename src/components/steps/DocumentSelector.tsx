import React, { useState } from 'react';
import { Check, Loader2, Upload } from 'lucide-react';

interface DocumentSelectorProps {
  existingDocs: any[];
  onComplete: (data: any) => void;
  onUpload?: (file: File) => Promise<string>;
}

const ALLOWED_TYPES = [
  { value: 'passport', label: 'Passport', needsBack: false },
  { value: 'drivers_license', label: "Driver's License", needsBack: true },
  { value: 'voters_card', label: "Voter's Card", needsBack: true },
];

export const DocumentSelector: React.FC<DocumentSelectorProps> = ({ 
  existingDocs, 
  onComplete,
  onUpload 
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [frontUrl, setFrontUrl] = useState('');
  const [backUrl, setBackUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleExistingDocSelect = (docId: string) => {
    const doc = existingDocs.find(d => d.id === docId);
    if (doc) {
      setSelectedDocId(docId);
      // Auto-fill document type and number
      let mappedType = doc.type.toLowerCase().replace(/\s+/g, '_');
      if (mappedType === 'drivers_licence' || mappedType === 'driver_license') {
        mappedType = 'drivers_license';
      }
      setDocumentType(mappedType);
      setDocumentNumber(doc.number);
      setFrontUrl(doc.url);
    }
  };

  const handleFileUpload = async (file: File, side: 'front' | 'back') => {
    if (!onUpload) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        if (side === 'front') setFrontUrl(url);
        else setBackUrl(url);
      };
      reader.readAsDataURL(file);
      return;
    }

    setUploading(true);
    try {
      const url = await onUpload(file);
      if (side === 'front') setFrontUrl(url);
      else setBackUrl(url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = () => {
    if (selectedDocId || (documentType && documentNumber && frontUrl)) {
      onComplete({
        type: documentType,
        number: documentNumber,
        frontUrl,
        backUrl: backUrl || frontUrl,
        issueDate: '2020-01-01',
        expiryDate: '2030-01-01',
      });
    }
  };

  const selectedType = ALLOWED_TYPES.find(t => t.value === documentType);
  const needsBack = selectedType?.needsBack && !selectedDocId;
  const isValid = selectedDocId || (documentType && documentNumber && frontUrl && (!needsBack || backUrl));

  return (
    <div className="space-y-6">
      {existingDocs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Select existing document</h3>
          <div className="grid grid-cols-2 gap-3">
            {existingDocs.map(doc => (
              <div
                key={doc.id}
                onClick={() => handleExistingDocSelect(doc.id)}
                className={`relative p-3 rounded-lg cursor-pointer transition-all ${
                  selectedDocId === doc.id ? 'bg-blue-50 ring-2 ring-blue-500' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {selectedDocId === doc.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="w-full h-20 bg-white rounded mb-2 overflow-hidden">
                  <img src={doc.url} alt={doc.type} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs font-medium capitalize">{doc.type.replace('_', ' ')}</p>
                <p className="text-xs text-gray-500">{doc.number}</p>
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-gray-500">or upload new</div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Document Type</label>
          <select
            value={documentType}
            onChange={e => setDocumentType(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select type</option>
            {ALLOWED_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Document Number</label>
          <input
            type="text"
            value={documentNumber}
            onChange={e => setDocumentNumber(e.target.value)}
            placeholder="Enter document number"
            className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Front Side</label>
          <div className="bg-gray-50 rounded-lg p-4">
            {frontUrl ? (
              <div className="space-y-2">
                <div className="w-full h-32 bg-white rounded overflow-hidden">
                  <img src={frontUrl} alt="Front" className="w-full h-full object-cover" />
                </div>
                <button onClick={() => setFrontUrl('')} className="text-xs text-red-600 hover:underline">
                  Remove
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-2 py-4">
                {uploading ? <Loader2 className="w-8 h-8 text-gray-400 animate-spin" /> : <Upload className="w-8 h-8 text-gray-400" />}
                <span className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Upload front side'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'front');
                  }}
                />
              </label>
            )}
          </div>
        </div>

        {needsBack && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Back Side</label>
            <div className="bg-gray-50 rounded-lg p-4">
              {backUrl ? (
                <div className="space-y-2">
                  <div className="w-full h-32 bg-white rounded overflow-hidden">
                    <img src={backUrl} alt="Back" className="w-full h-full object-cover" />
                  </div>
                  <button onClick={() => setBackUrl('')} className="text-xs text-red-600 hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2 py-4">
                  {uploading ? <Loader2 className="w-8 h-8 text-gray-400 animate-spin" /> : <Upload className="w-8 h-8 text-gray-400" />}
                  <span className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Upload back side'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'back');
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleContinue}
        disabled={!isValid || uploading}
        className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-[#09bced] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Continue
      </button>
    </div>
  );
};
