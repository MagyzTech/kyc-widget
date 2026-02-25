import React from 'react';

export interface WebViewWrapperProps {
  children: React.ReactNode;
  onMessage?: (data: any) => void;
}

/**
 * Wrapper component for React Native WebView compatibility
 * Handles postMessage communication between WebView and React Native
 */
export const WebViewWrapper: React.FC<WebViewWrapperProps> = ({ children, onMessage }) => {
  React.useEffect(() => {
    // Check if running in React Native WebView
    const isReactNativeWebView = typeof window !== 'undefined' && 
      (window as any).ReactNativeWebView;

    if (isReactNativeWebView && onMessage) {
      // Listen for messages from React Native
      const handleMessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (e) {
          console.error('Failed to parse message:', e);
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [onMessage]);

  return <>{children}</>;
};

/**
 * Send message to React Native WebView
 */
export const postMessageToRN = (data: any) => {
  if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
    (window as any).ReactNativeWebView.postMessage(JSON.stringify(data));
  }
};

/**
 * Hook to detect if running in React Native WebView
 */
export const useIsWebView = () => {
  const [isWebView, setIsWebView] = React.useState(false);

  React.useEffect(() => {
    setIsWebView(
      typeof window !== 'undefined' && 
      !!(window as any).ReactNativeWebView
    );
  }, []);

  return isWebView;
};
