import React, { useState } from 'react';
import { FileText, Loader2, Upload } from 'lucide-react';

interface BankStatementUploadProps {
  address?: {
    line: string;
    city: string;
    state: string;
    postalCode: string;
  };
  onComplete: (url: string) => void;
  onUpload?: (file: File) => Promise<string>;
}

export const BankStatementUpload: React.FC<BankStatementUploadProps> = ({ 
  address,
  onComplete, 
  onUpload 
}) => {
  const [fileUrl, setFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = async (file: File) => {
    setFileName(file.name);
    
    if (!onUpload) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setFileUrl(url);
      };
      reader.readAsDataURL(file);
      return;
    }

    setUploading(true);
    try {
      const url = await onUpload(file);
      setFileUrl(url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = () => {
    if (fileUrl) {
      onComplete(fileUrl);
    }
  };

  return (
    <div className="space-y-6">
      {/* Address Display */}
      {address && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Your Submitted Address</h4>
          <p className="text-sm text-gray-700">
            {address.line}, {address.city}, {address.state}
          </p>
          <p className="text-xs text-gray-600 mt-2">
            The address on your bank statement must match this address exactly
          </p>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Upload Bank Statement</h3>

        <div className="bg-gray-50 rounded-lg p-6">
          {fileUrl ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{fileName}</p>
                  <p className="text-xs text-gray-500">Bank statement uploaded</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFileUrl('');
                  setFileName('');
                }}
                className="text-xs text-red-600 hover:underline"
              >
                Remove and upload different file
              </button>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center gap-3 py-8">
              {uploading ? (
                <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
              ) : (
                <Upload className="w-12 h-12 text-gray-400" />
              )}
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">
                  {uploading ? 'Uploading...' : 'Click to upload bank statement'}
                </p>
                <p className="text-xs text-gray-500 mt-1">PDF or image files accepted</p>
              </div>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
            </label>
          )}
        </div>

        <p className="text-xs text-gray-600 mt-3">
          Bank statement must be dated within the last 3 months and clearly show your address
        </p>
      </div>

      <button
        onClick={handleContinue}
        disabled={!fileUrl || uploading}
        className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-[#09bced] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Continue
      </button>
    </div>
  );
};
