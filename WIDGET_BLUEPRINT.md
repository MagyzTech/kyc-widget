# KYC Widget Blueprint

## Overview
A comprehensive KYC (Know Your Customer) verification widget for Falconite, supporting two-tier verification with BVN, document upload, selfie capture, address verification, background checks, and bank statement validation.

---

## Architecture

### Package Structure
```
kyc-widget-falconite/
├── src/
│   ├── index.tsx                    # Main exports
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces
│   ├── components/
│   │   ├── KYCWidget.tsx            # Main orchestrator component
│   │   ├── tiers/
│   │   │   ├── Tier1Flow.tsx        # Level 1 & 2 flow
│   │   │   └── Tier2Flow.tsx        # Level 3 flow (enhanced KYC)
│   │   ├── steps/
│   │   │   ├── BVNVerification.tsx
│   │   │   ├── DocumentUpload.tsx
│   │   │   ├── SelfieCapture.tsx
│   │   │   ├── AddressVerification.tsx
│   │   │   ├── BackgroundCheck.tsx
│   │   │   ├── BankStatement.tsx
│   │   │   ├── SuccessScreen.tsx
│   │   │   └── Tier2SuccessScreen.tsx
│   │   └── WebViewWrapper.tsx       # React Native compatibility
│   ├── utils/
│   │   ├── api.ts                   # Backend API calls
│   │   ├── validation.ts            # Form validation
│   │   └── webview.ts               # WebView messaging
│   └── styles/
│       └── widget.css               # Component styles
├── package.json
├── tsup.config.ts                   # Build configuration
├── README.md
├── REACT_NATIVE.md
└── DEPLOYMENT.md
```

---

## Component Hierarchy

```
KYCWidget (Main Orchestrator)
├── Tier1Flow (tier="tier1")
│   ├── BVNVerification (Level 1)
│   ├── DocumentUpload (Level 2)
│   ├── SelfieCapture (Level 2)
│   └── SuccessScreen
│
└── Tier2Flow (tier="tier2")
    ├── AddressVerification (Level 3)
    ├── BackgroundCheck (Level 3)
    ├── BankStatement (Level 3)
    └── Tier2SuccessScreen
```

---

## Data Flow

### Tier 1 Flow (Card Creation KYC)
```
1. BVN Verification
   ↓
   User enters BVN → Validate format → Call /api/kyc-v2/verify
   ↓
   Success → Store user data → Move to Document Upload

2. Document Upload
   ↓
   Select document type → Upload to EdgeStore → Get URL
   ↓
   Capture selfie → Face detection → Liveness check
   ↓
   Submit to /api/kyc-v2/level-2/verify-kyc
   ↓
   Success → Show success screen → Reload page after 3s
```

### Tier 2 Flow (Enhanced KYC for USD/EUR)
```
1. Address Verification
   ↓
   Enter address details → Upload utility bill → EdgeStore
   ↓
   Submit to /api/kyc-v2/level-3/verify-address

2. Background Check
   ↓
   Answer security questions → Submit responses
   ↓
   Call /api/kyc-v2/level-3/verify-background

3. Bank Statement
   ↓
   Upload bank statement → EdgeStore → Verify
   ↓
   Submit to /api/kyc-v2/level-3/verify-bank-statement
   ↓
   Success → Show Tier 2 success → Reload after 3s
```

---

## TypeScript Interfaces

### Main Props
```typescript
interface KYCWidgetProps {
  tier: 'tier1' | 'tier2';
  userId: string;
  authToken: string;
  apiBaseUrl: string;
  edgeStoreUrl?: string;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  onUpload?: (file: File, type: string) => Promise<{ url: string }>;
}
```

### User Data
```typescript
interface UserData {
  first_name: string;
  last_name: string;
  middle_name?: string;
  date_of_birth: string;
  phone_number: string;
  email: string;
  bvn: string;
}
```

### KYC Status
```typescript
interface KYCStatus {
  kyc_level: 'LEVEL_0' | 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';
  bvn_verified: boolean;
  document_verified: boolean;
  selfie_verified: boolean;
  address_verified: boolean;
  background_verified: boolean;
  bank_statement_verified: boolean;
}
```

### Document Types
```typescript
type DocumentType = 
  | 'national_id'
  | 'drivers_license'
  | 'international_passport'
  | 'voters_card';
```

---

## API Endpoints

### Tier 1 Endpoints
```
POST /api/kyc-v2/verify
Body: { bvn: string }
Response: { user: UserData, status: KYCStatus }

POST /api/kyc-v2/level-2/verify-kyc
Body: {
  document_type: DocumentType,
  document_url: string,
  selfie_url: string
}
Response: { message: string, status: KYCStatus }
```

### Tier 2 Endpoints
```
POST /api/kyc-v2/level-3/verify-address
Body: {
  street: string,
  city: string,
  state: string,
  postal_code: string,
  country: string,
  utility_bill_url: string
}

POST /api/kyc-v2/level-3/verify-background
Body: {
  employment_status: string,
  source_of_funds: string,
  purpose_of_account: string
}

POST /api/kyc-v2/level-3/verify-bank-statement
Body: {
  bank_statement_url: string,
  statement_period: string
}
```

---

## State Management

### Widget State
```typescript
interface WidgetState {
  currentStep: number;
  loading: boolean;
  error: string | null;
  userData: UserData | null;
  kycStatus: KYCStatus | null;
  uploadedFiles: {
    document?: string;
    selfie?: string;
    utilityBill?: string;
    bankStatement?: string;
  };
}
```

### Step Navigation
```typescript
const steps = {
  tier1: ['bvn', 'document', 'selfie', 'success'],
  tier2: ['address', 'background', 'bank-statement', 'success']
};

function nextStep() {
  setCurrentStep(prev => prev + 1);
}

function prevStep() {
  setCurrentStep(prev => Math.max(0, prev - 1));
}
```

---

## Validation Rules

### BVN Validation
```typescript
- Length: exactly 11 digits
- Format: numeric only
- Required: true
```

### Document Upload
```typescript
- File types: image/jpeg, image/png, application/pdf
- Max size: 5MB
- Required: true
- Validation: Must be clear and readable
```

### Selfie Capture
```typescript
- Face detection: Required
- Liveness check: Blink detection
- Quality: Minimum 640x480
- Format: image/jpeg, image/png
```

### Address Verification
```typescript
- Street: Required, min 5 characters
- City: Required, min 2 characters
- State: Required
- Postal code: Required, format varies by country
- Country: Required
- Utility bill: Required, max 3 months old
```

---

## UI/UX Design

### Color Scheme
```css
--primary: #7C3AED (Purple)
--primary-hover: #6D28D9
--success: #10B981 (Green)
--error: #EF4444 (Red)
--warning: #F59E0B (Amber)
--background: #FFFFFF
--text-primary: #1F2937
--text-secondary: #6B7280
--border: #E5E7EB
```

### Component Styling
```css
.kyc-widget {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.kyc-step {
  animation: fadeIn 0.3s ease-in;
}

.kyc-button {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}

.kyc-input {
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 16px;
}
```

### Progress Indicator
```typescript
<div className="progress-bar">
  {steps.map((step, index) => (
    <div 
      key={step}
      className={`step ${index <= currentStep ? 'active' : ''}`}
    >
      {index + 1}
    </div>
  ))}
</div>
```

---

## Face Detection & Liveness

### Face-API.js Integration
```typescript
import * as faceapi from 'face-api.js';

// Load models
await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
await faceapi.nets.faceExpressionNet.loadFromUri('/models');

// Detect face
const detection = await faceapi
  .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
  .withFaceLandmarks()
  .withFaceExpressions();

// Validate
if (!detection) {
  throw new Error('No face detected');
}

if (detection.detection.score < 0.5) {
  throw new Error('Face detection confidence too low');
}
```

### Liveness Check
```typescript
1. Prompt user to blink
2. Capture multiple frames
3. Detect eye closure in frames
4. Validate blink pattern
5. Confirm liveness
```

---

## File Upload Strategy

### EdgeStore Integration
```typescript
async function uploadFile(
  file: File, 
  type: 'document' | 'selfie' | 'utility' | 'statement'
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${edgeStoreUrl}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: formData
  });
  
  const { url } = await response.json();
  return url;
}
```

### Custom Upload Handler
```typescript
// Allow parent app to handle uploads
<KYCWidget
  onUpload={async (file, type) => {
    // Custom upload logic
    const url = await myUploadService(file);
    return { url };
  }}
/>
```

---

## Error Handling

### Error Types
```typescript
enum KYCErrorType {
  NETWORK_ERROR = 'network_error',
  VALIDATION_ERROR = 'validation_error',
  API_ERROR = 'api_error',
  UPLOAD_ERROR = 'upload_error',
  CAMERA_ERROR = 'camera_error',
  FACE_DETECTION_ERROR = 'face_detection_error'
}

interface KYCError {
  type: KYCErrorType;
  message: string;
  details?: any;
}
```

### Error Display
```typescript
function ErrorMessage({ error }: { error: KYCError }) {
  return (
    <div className="error-banner">
      <AlertCircle />
      <div>
        <h4>{getErrorTitle(error.type)}</h4>
        <p>{error.message}</p>
      </div>
      <button onClick={retry}>Retry</button>
    </div>
  );
}
```

---

## React Native Integration

### WebView Setup
```typescript
import { WebView } from 'react-native-webview';

<WebView
  source={{ uri: 'https://app.falconite.com/kyc' }}
  onMessage={(event) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'KYC_COMPLETE') {
      navigation.navigate('Dashboard');
    }
  }}
  mediaPlaybackRequiresUserAction={false}
  allowsInlineMediaPlayback={true}
  cameraPermissions="camera"
/>
```

### Message Passing
```typescript
// Widget → React Native
function postMessageToRN(type: string, data: any) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ type, data })
    );
  }
}

// Usage
postMessageToRN('KYC_COMPLETE', { level: 'LEVEL_2' });
postMessageToRN('KYC_ERROR', { error: 'Upload failed' });
```

---

## Testing Strategy

### Unit Tests
```typescript
// BVN validation
test('validates BVN format', () => {
  expect(validateBVN('12345678901')).toBe(true);
  expect(validateBVN('123')).toBe(false);
});

// Face detection
test('detects face in image', async () => {
  const result = await detectFace(mockImage);
  expect(result.detected).toBe(true);
});
```

### Integration Tests
```typescript
// Full Tier 1 flow
test('completes Tier 1 KYC', async () => {
  render(<KYCWidget tier="tier1" {...props} />);
  
  // Enter BVN
  fireEvent.change(screen.getByLabelText('BVN'), {
    target: { value: '12345678901' }
  });
  fireEvent.click(screen.getByText('Verify'));
  
  // Upload document
  await waitFor(() => screen.getByText('Upload Document'));
  // ... continue flow
});
```

### E2E Tests
```typescript
// Playwright/Cypress
describe('KYC Widget', () => {
  it('completes full verification', () => {
    cy.visit('/kyc');
    cy.get('[data-testid="bvn-input"]').type('12345678901');
    cy.get('[data-testid="verify-btn"]').click();
    // ... continue
  });
});
```

---

## Performance Optimization

### Code Splitting
```typescript
// Lazy load heavy components
const SelfieCapture = lazy(() => import('./steps/SelfieCapture'));
const FaceDetection = lazy(() => import('./utils/faceDetection'));
```

### Bundle Size
```
- Main bundle: ~100KB (gzipped)
- face-api.js: ~500KB (peer dependency)
- lottie-web: ~150KB (peer dependency)
- Total: ~750KB
```

### Optimization Techniques
```typescript
1. Tree shaking - Remove unused code
2. Code splitting - Lazy load components
3. Image optimization - Compress before upload
4. Debouncing - Limit API calls
5. Memoization - Cache expensive computations
```

---

## Security Considerations

### Data Protection
```typescript
1. HTTPS only - All API calls encrypted
2. Token-based auth - JWT tokens
3. No local storage of sensitive data
4. Secure file uploads - Signed URLs
5. Input sanitization - Prevent XSS
```

### Privacy
```typescript
1. Minimal data collection
2. User consent required
3. Data retention policies
4. GDPR compliance
5. Right to deletion
```

---

## Deployment

### Build Process
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Output: dist/
# - index.js (CommonJS)
# - index.mjs (ES Module)
# - index.css (Styles)
# - Source maps
```

### Publishing to NPM
```bash
# Update version
npm version patch|minor|major

# Build
npm run build

# Publish
npm publish --access public
```

### Version Strategy
```
1.0.x - Patch: Bug fixes
1.x.0 - Minor: New features (backward compatible)
x.0.0 - Major: Breaking changes
```

---

## Usage Examples

### Basic Usage
```typescript
import { KYCWidget } from 'kyc-widget-falconite';
import 'kyc-widget-falconite/styles.css';

function App() {
  return (
    <KYCWidget
      tier="tier1"
      userId="user_123"
      authToken="jwt_token"
      apiBaseUrl="https://api.falconite.com"
      onComplete={() => console.log('KYC complete')}
      onError={(err) => console.error(err)}
    />
  );
}
```

### With Custom Upload
```typescript
<KYCWidget
  tier="tier2"
  userId="user_123"
  authToken="jwt_token"
  apiBaseUrl="https://api.falconite.com"
  onUpload={async (file, type) => {
    const url = await uploadToS3(file);
    return { url };
  }}
/>
```

### React Native
```typescript
import { WebView } from 'react-native-webview';

<WebView
  source={{ 
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <link rel="stylesheet" href="https://unpkg.com/kyc-widget-falconite/dist/index.css">
        </head>
        <body>
          <div id="root"></div>
          <script src="https://unpkg.com/kyc-widget-falconite"></script>
          <script>
            KYCWidget.render({
              tier: 'tier1',
              userId: '${userId}',
              authToken: '${token}',
              apiBaseUrl: 'https://api.falconite.com'
            });
          </script>
        </body>
      </html>
    `
  }}
  onMessage={handleMessage}
/>
```

---

## Roadmap

### v1.2.0 (Next Release)
- [ ] TypeScript declarations (.d.ts)
- [ ] Biometric authentication
- [ ] Multi-language support
- [ ] Accessibility improvements (WCAG 2.1)

### v1.3.0
- [ ] Video KYC support
- [ ] Document OCR extraction
- [ ] Real-time validation feedback
- [ ] Progress persistence (resume later)

### v2.0.0
- [ ] Headless mode (bring your own UI)
- [ ] Plugin system for custom steps
- [ ] Advanced analytics
- [ ] White-label customization

---

## Support & Maintenance

### Documentation
- README.md - Quick start guide
- REACT_NATIVE.md - Mobile integration
- DEPLOYMENT.md - Publishing guide
- API.md - Full API reference

### Issue Tracking
- GitHub Issues for bug reports
- Feature requests via discussions
- Security issues: security@falconite.com

### Versioning
- Semantic versioning (semver)
- Changelog maintained
- Migration guides for breaking changes

---

## License
MIT License - Free for commercial use

---

## Contributors
Falconite Engineering Team
