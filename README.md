# @falconlite/kyc-widget

Universal KYC verification widget for Next.js, React, and React Native applications.

## Features

- **Tier 1 KYC**: BVN + Selfie + Document verification
- **Tier 2 KYC**: Address + Background + Bank Statement verification
- **Cross-platform Liveness Detection**: Works on desktop, iOS Safari, iOS WebView, and Android
- **Legacy User Support**: Skip functionality with compliance reminders
- **React Native Support**: Works in WebView with full camera access
- **Scoped Styles**: No CSS conflicts with parent application
- **TypeScript**: Full type safety
- **Responsive**: Works on mobile and desktop

## Installation

```bash
npm install kyc-widget-falconlite
# or
yarn add kyc-widget-falconlite
# or
pnpm add kyc-widget-falconlite
```

## Peer Dependencies

Make sure you have these installed:

```bash
npm install react react-dom framer-motion lucide-react zod
```

## Development & Testing

See testing documentation:
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick start guide
- **[TESTING_SUMMARY.md](./TESTING_SUMMARY.md)** - Complete testing overview
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Detailed instructions
- **[STANDALONE_TEST_APP.md](./STANDALONE_TEST_APP.md)** - Standalone test app
- **[TESTING_ARCHITECTURE.md](./TESTING_ARCHITECTURE.md)** - Visual diagrams

### Quick Development Setup

```bash
# One command setup
./setup-dev.sh

# Or manual
npm run build && npm link
cd ../app-v2 && npm link kyc-widget-falconlite
```

## Usage

### Tier 1 KYC (BVN + Document)

```tsx
import { KYCWidget } from 'kyc-widget-falconlite';
import 'kyc-widget-falconlite/styles.css';

function App() {
  return (
    <KYCWidget
      tier="tier_1"
      accessToken="user-auth-token"
      apiBaseUrl="https://api.yourapp.com"
      onSuccess={(data) => console.log('KYC completed:', data)}
      onError={(error) => console.error('KYC failed:', error)}
    />
  );
}
```

### Tier 2 KYC (Enhanced Verification)

```tsx
import { KYCWidget } from 'kyc-widget-falconlite';
import 'kyc-widget-falconlite/styles.css';

function App() {
  const handleUpload = async (file: File): Promise<string> => {
    // Upload file to your storage
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data.url;
  };

  return (
    <KYCWidget
      tier="tier_2"
      accessToken="user-auth-token"
      apiBaseUrl="https://api.yourapp.com"
      onUpload={handleUpload}
      onSuccess={(data) => console.log('Tier 2 completed:', data)}
      onError={(error) => console.error('Tier 2 failed:', error)}
    />
  );
}
```

## Props

### KYCWidget

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `tier` | `'tier_1' \| 'tier_2'` | Yes | KYC tier level |
| `accessToken` | `string` | Yes | User authentication token |
| `apiBaseUrl` | `string` | No | Base URL for API endpoints (defaults to localhost:8000) |
| `user` | `object` | No | User information object |
| `onSuccess` | `(data: any) => void` | No | Callback when verification succeeds |
| `onError` | `(error: Error) => void` | No | Callback when verification fails |
| `onProgress` | `(step: string, progress: number) => void` | No | Callback for progress updates |
| `onUpload` | `(file: File) => Promise<string>` | **Yes for Tier 2** | File upload handler (required for Tier 2) |
| `theme` | `'light' \| 'dark'` | No | Widget theme (defaults to 'light') |

## API Endpoints

The widget expects these endpoints:

### Tier 1
- `POST /kyc/v2/verify` - Combined BVN + Document verification

### Tier 2
- `POST /kyc/v2/level-2/verify-kyc` - Enhanced KYC verification

## Styling

The widget uses scoped Tailwind CSS classes to prevent conflicts. All styles are prefixed with `.kyc-widget`.

To customize colors, override CSS variables:

```css
.kyc-widget {
  --primary-color: #your-color;
}
```

## React Native

For React Native WebView integration, see [REACT_NATIVE.md](./REACT_NATIVE.md).

## License

MIT
