# KYC Widget Testing Guide

## Testing Strategy: Use app-v2 with npm link

The best way to test the KYC widget during development is to use **npm link** to connect your local widget to the existing app-v2 application.

## Setup Instructions

### 1. Link the Widget Package

In the widget directory:

```bash
cd /Users/omegauwedia/development/falconiteHQ/Untitled/kyc-widget-falconite

# Build the widget
npm run build

# Create global link
npm link
```

### 2. Link in app-v2

In the app-v2 directory:

```bash
cd /Users/omegauwedia/development/falconiteHQ/Untitled/app-v2

# Link to local widget
npm link kyc-widget-falconite

# Start dev server
npm run dev
```

### 3. Development Workflow

**Terminal 1 - Widget (watch mode):**
```bash
cd kyc-widget-falconite
npm run dev  # Watches for changes and rebuilds
```

**Terminal 2 - app-v2:**
```bash
cd app-v2
npm run dev  # Next.js dev server
```

Now any changes to the widget will automatically rebuild and reflect in app-v2!

## Testing Locations in app-v2

### Tier 1 Testing
**Location**: `components/AuthWrapper.tsx`
**Trigger**: Automatically shows when user hasn't completed Tier 1 KYC
**Flow**: BVN + Selfie + Document verification

**Test Steps**:
1. Create a new user account or use a test account without KYC
2. Login - you'll see the Tier 1 widget immediately
3. Test BVN verification flow
4. Test document upload
5. Test selfie capture

### Tier 2 Testing
**Location**: `app/(protected)/accounts/page.tsx`
**Trigger**: Click "Complete Tier 2 KYC" button on accounts page
**Flow**: Address + Background + Bank Statement

**Test Steps**:
1. Complete Tier 1 first
2. Navigate to `/accounts` page
3. Click "Complete Tier 2 KYC" button
4. Test address form
5. Test background info form
6. Test bank statement upload

## Backend Setup

Make sure the backend is running:

```bash
cd /Users/omegauwedia/development/falconiteHQ/Untitled/backend

# Activate virtual environment
source venv/bin/activate

# Run backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## Environment Variables

Ensure app-v2 has correct `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NODE_ENV=development
```

## Testing Checklist

### Tier 1 Widget
- [ ] BVN input validation
- [ ] Selfie capture works
- [ ] Document upload (front/back)
- [ ] API integration with `/kyc/v2/verify`
- [ ] Success callback triggers
- [ ] Error handling displays correctly
- [ ] Loading states work
- [ ] NUBAN account auto-creation

### Tier 2 Widget
- [ ] Address form validation
- [ ] Background info form
- [ ] Bank statement upload via EdgeStore
- [ ] API integration with `/kyc/v2/level-2/verify-kyc`
- [ ] Success callback triggers
- [ ] Error handling
- [ ] Graph person creation

### UI/UX
- [ ] Responsive design (mobile/desktop)
- [ ] Animations smooth
- [ ] Progress indicators work
- [ ] Back button navigation
- [ ] CSS scoping (no conflicts with app-v2)

## Unlinking After Testing

When you're done testing and ready to use the published npm package:

```bash
cd app-v2

# Unlink local package
npm unlink kyc-widget-falconite

# Reinstall from npm
npm install kyc-widget-falconite@latest
```

## Alternative: Create Standalone Test App

If you prefer a minimal test environment, create a simple Next.js app:

```bash
cd /Users/omegauwedia/development/falconiteHQ/Untitled

# Create test app
npx create-next-app@latest kyc-widget-test --typescript --tailwind --app

cd kyc-widget-test

# Link widget
npm link kyc-widget-falconite

# Install peer dependencies
npm install framer-motion lucide-react zod face-api.js lottie-web react-webcam zustand axios
```

Then create a simple test page (see STANDALONE_TEST_APP.md for full example).

## Debugging Tips

### Widget not updating?
```bash
# In widget directory
npm run build  # Force rebuild
```

### Type errors?
```bash
# In app-v2
npm run type-check  # Check TypeScript errors
```

### CSS not loading?
Make sure you import the styles:
```tsx
import "kyc-widget-falconite/styles.css";
```

### API errors?
- Check backend is running on port 8000
- Check CORS settings in backend
- Check authentication token is valid
- Check network tab in browser DevTools

## Production Testing

Before publishing to npm:

1. **Build the widget**:
   ```bash
   cd kyc-widget-falconite
   npm run build
   ```

2. **Test the build**:
   ```bash
   npm pack  # Creates a .tgz file
   ```

3. **Install in app-v2**:
   ```bash
   cd app-v2
   npm install ../kyc-widget-falconite/kyc-widget-falconite-1.1.0.tgz
   ```

4. **Test thoroughly** before publishing

5. **Publish to npm**:
   ```bash
   cd kyc-widget-falconite
   npm version patch  # or minor/major
   npm publish
   ```

## Recommended Testing Flow

1. ✅ Use **npm link** for rapid development
2. ✅ Test in **app-v2** (real-world integration)
3. ✅ Test both Tier 1 and Tier 2 flows
4. ✅ Test with real backend API
5. ✅ Use **npm pack** for pre-publish testing
6. ✅ Publish to npm when ready
7. ✅ Update app-v2 to use published version

This approach gives you the fastest feedback loop while ensuring the widget works in a real application context.
