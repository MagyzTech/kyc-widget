# Standalone Test App for KYC Widget

If you prefer a minimal test environment separate from app-v2, follow this guide.

## Quick Setup

```bash
cd /Users/omegauwedia/development/falconiteHQ/Untitled

# Create test app
npx create-next-app@latest kyc-widget-test --typescript --tailwind --app --no-src-dir

cd kyc-widget-test

# Link local widget
npm link kyc-widget-falconite

# Install peer dependencies
npm install framer-motion lucide-react zod face-api.js lottie-web react-webcam zustand axios @edgestore/react @edgestore/server
```

## File Structure

```
kyc-widget-test/
├── app/
│   ├── layout.tsx
│   ├── page.tsx           # Home with auth
│   ├── tier1/
│   │   └── page.tsx       # Tier 1 test
│   └── tier2/
│       └── page.tsx       # Tier 2 test
├── lib/
│   └── edgestore.ts       # EdgeStore config
└── .env.local
```

## 1. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
EDGE_STORE_ACCESS_KEY=your_key_here
EDGE_STORE_SECRET_KEY=your_secret_here
```

## 2. EdgeStore Setup

Create `lib/edgestore.ts`:

```typescript
import { createEdgeStoreProvider } from '@edgestore/react';
import { type EdgeStoreRouter } from '@edgestore/server';

const { EdgeStoreProvider, useEdgeStore } = createEdgeStoreProvider<EdgeStoreRouter>();

export { EdgeStoreProvider, useEdgeStore };
```

## 3. Root Layout

Update `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { EdgeStoreProvider } from "@/lib/edgestore";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KYC Widget Test",
  description: "Testing KYC Widget Integration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <EdgeStoreProvider>{children}</EdgeStoreProvider>
      </body>
    </html>
  );
}
```

## 4. Home Page with Auth

Update `app/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (data.status) {
        const accessToken = data.data.access_token;
        setToken(accessToken);
        localStorage.setItem("token", accessToken);
        alert("Login successful! Token saved.");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error. Is the backend running?");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">KYC Widget Test</h2>
          <p className="mt-2 text-center text-gray-600">
            Login to test the widget
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Login
          </button>
        </form>

        {token && (
          <div className="space-y-2">
            <p className="text-sm text-green-600 text-center">
              ✓ Authenticated
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => router.push("/tier1")}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Test Tier 1
              </button>
              <button
                onClick={() => router.push("/tier2")}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Test Tier 2
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

## 5. Tier 1 Test Page

Create `app/tier1/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// @ts-expect-error - No types available
import { KYCWidget } from "kyc-widget-falconite";
import "kyc-widget-falconite/styles.css";

export default function Tier1Page() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      router.push("/");
      return;
    }
    setToken(savedToken);
  }, [router]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Tier 1 KYC Test</h1>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
          >
            ← Back
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <KYCWidget
            tier="tier_1"
            accessToken={token}
            apiBaseUrl={process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}
            onSuccess={(data: any) => {
              console.log("✓ Tier 1 Success:", data);
              alert("Tier 1 KYC completed successfully!");
            }}
            onError={(error: Error) => {
              console.error("✗ Tier 1 Error:", error);
              alert(`Error: ${error.message}`);
            }}
            onProgress={(step: string, progress: number) => {
              console.log(`Progress: ${step} - ${progress}%`);
            }}
            theme="light"
          />
        </div>
      </div>
    </div>
  );
}
```

## 6. Tier 2 Test Page

Create `app/tier2/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEdgeStore } from "@/lib/edgestore";
// @ts-expect-error - No types available
import { KYCWidget } from "kyc-widget-falconite";
import "kyc-widget-falconite/styles.css";

export default function Tier2Page() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const { edgestore } = useEdgeStore();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      router.push("/");
      return;
    }
    setToken(savedToken);
  }, [router]);

  const handleUpload = async (file: File): Promise<string> => {
    console.log("Uploading file:", file.name);
    const res = await edgestore.publicFiles.upload({ file });
    console.log("Upload complete:", res.url);
    return res.url;
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Tier 2 KYC Test</h1>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
          >
            ← Back
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <KYCWidget
            tier="tier_2"
            accessToken={token}
            apiBaseUrl={process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}
            onSuccess={(data: any) => {
              console.log("✓ Tier 2 Success:", data);
              alert("Tier 2 KYC completed successfully!");
            }}
            onError={(error: Error) => {
              console.error("✗ Tier 2 Error:", error);
              alert(`Error: ${error.message}`);
            }}
            onUpload={handleUpload}
            theme="light"
          />
        </div>
      </div>
    </div>
  );
}
```

## 7. Run the Test App

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2 - Widget (watch mode)
cd kyc-widget-falconite
npm run dev

# Terminal 3 - Test App
cd kyc-widget-test
npm run dev
```

Open http://localhost:3000

## Testing Flow

1. **Login** with test credentials
2. Click **"Test Tier 1"** to test BVN + Document flow
3. Click **"Test Tier 2"** to test Address + Background flow
4. Check browser console for detailed logs
5. Check Network tab for API calls

## Advantages of Standalone Test App

✅ Isolated environment
✅ Minimal dependencies
✅ Easy to debug
✅ Quick to reset state
✅ No interference with app-v2

## Disadvantages

❌ Need to maintain separate codebase
❌ Doesn't test real-world integration
❌ Missing app-v2 context (user store, etc.)

## Recommendation

**Use app-v2 for primary testing** (with npm link) and this standalone app for:
- Quick isolated tests
- Debugging specific issues
- Demo purposes
- Documentation screenshots
