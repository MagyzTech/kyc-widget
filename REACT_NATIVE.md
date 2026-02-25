# React Native WebView Integration

## Installation

```bash
npm install @falconite/kyc-widget react-native-webview
```

## Setup

### 1. Create HTML Wrapper

Create `kyc-widget.html` in your assets:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script type="module">
    import { Tier1Widget, Tier2Widget } from 'https://unpkg.com/@falconite/kyc-widget@1.0.0/dist/index.mjs';
    import { createRoot } from 'https://unpkg.com/react-dom@18/client';
    import React from 'https://unpkg.com/react@18';
    
    // Get config from React Native
    window.addEventListener('message', (event) => {
      const config = JSON.parse(event.data);
      
      const Widget = config.tier === 1 ? Tier1Widget : Tier2Widget;
      
      const root = createRoot(document.getElementById('root'));
      root.render(
        React.createElement(Widget, {
          apiBaseUrl: config.apiBaseUrl,
          token: config.token,
          onUpload: config.tier === 2 ? async (file) => {
            // Send file to React Native for upload
            const reader = new FileReader();
            reader.onload = () => {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'UPLOAD_FILE',
                data: reader.result,
                filename: file.name
              }));
            };
            reader.readAsDataURL(file);
            
            // Wait for upload response
            return new Promise((resolve) => {
              const handler = (e) => {
                const msg = JSON.parse(e.data);
                if (msg.type === 'UPLOAD_RESPONSE') {
                  window.removeEventListener('message', handler);
                  resolve(msg.url);
                }
              };
              window.addEventListener('message', handler);
            });
          } : undefined,
          onSuccess: (data) => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'KYC_SUCCESS',
              data
            }));
          },
          onError: (error) => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'KYC_ERROR',
              error
            }));
          }
        })
      );
    });
  </script>
</body>
</html>
```

### 2. React Native Component

```tsx
import React, { useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import * as FileSystem from 'expo-file-system';

interface KYCWebViewProps {
  tier: 1 | 2;
  apiBaseUrl: string;
  token: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export const KYCWebView: React.FC<KYCWebViewProps> = ({
  tier,
  apiBaseUrl,
  token,
  onSuccess,
  onError,
}) => {
  const webViewRef = useRef<WebView>(null);

  const handleMessage = async (event: any) => {
    const message = JSON.parse(event.nativeEvent.data);

    switch (message.type) {
      case 'UPLOAD_FILE':
        // Handle file upload
        const uploadUrl = await uploadFile(message.data, message.filename);
        webViewRef.current?.postMessage(JSON.stringify({
          type: 'UPLOAD_RESPONSE',
          url: uploadUrl,
        }));
        break;

      case 'KYC_SUCCESS':
        onSuccess?.(message.data);
        break;

      case 'KYC_ERROR':
        onError?.(message.error);
        break;
    }
  };

  const uploadFile = async (base64Data: string, filename: string) => {
    // Implement your file upload logic here
    // Example using your API
    const response = await fetch(`${apiBaseUrl}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file: base64Data, filename }),
    });
    const data = await response.json();
    return data.url;
  };

  React.useEffect(() => {
    // Send config to WebView
    webViewRef.current?.postMessage(JSON.stringify({
      tier,
      apiBaseUrl,
      token,
    }));
  }, [tier, apiBaseUrl, token]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={require('./assets/kyc-widget.html')}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
```

### 3. Usage in Your App

```tsx
import { KYCWebView } from './components/KYCWebView';

function KYCScreen() {
  return (
    <KYCWebView
      tier={1}
      apiBaseUrl="https://api.yourapp.com"
      token={userToken}
      onSuccess={(data) => {
        console.log('KYC completed:', data);
        // Navigate to next screen
      }}
      onError={(error) => {
        console.error('KYC failed:', error);
      }}
    />
  );
}
```

## Features

- ✅ Full camera access for selfie capture
- ✅ File upload support
- ✅ Two-way communication between WebView and React Native
- ✅ Success/Error callbacks
- ✅ Responsive design
- ✅ Works on iOS and Android

## Permissions

Add to `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera for identity verification."
        }
      ]
    ]
  }
}
```
