# KYC Widget Testing - Complete Guide

## 📋 Summary

You have **two testing options**:

1. **✅ RECOMMENDED: Use existing app-v2** (fastest, real-world testing)
2. **Alternative: Create standalone test app** (isolated, minimal)

## 🎯 Recommended Approach: app-v2 + npm link

### Why This is Best

- ✅ **Already integrated** - app-v2 uses the widget in production
- ✅ **Real authentication** - Tests with actual backend auth
- ✅ **Both tiers** - Tier 1 (onboarding) + Tier 2 (accounts page)
- ✅ **Fast feedback** - Changes reflect immediately
- ✅ **Real context** - Tests with actual user store, routing, etc.

### Quick Setup (One Command)

```bash
cd /Users/omegauwedia/development/falconiteHQ/Untitled/kyc-widget-falconite
./setup-dev.sh
```

This script:
1. Builds the widget
2. Creates global npm link
3. Links widget in app-v2
4. Shows next steps

### Manual Setup

If you prefer manual setup:

```bash
# 1. In widget directory
cd kyc-widget-falconite
npm run build
npm link

# 2. In app-v2 directory
cd ../app-v2
npm link kyc-widget-falconite
```

### Development Workflow

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 - Widget (watch mode):**
```bash
cd kyc-widget-falconite
npm run dev  # Auto-rebuilds on changes
```

**Terminal 3 - app-v2:**
```bash
cd app-v2
npm run dev  # Next.js dev server
```

Open http://localhost:3000

### Testing Locations

#### Tier 1 (BVN + Document)
- **File**: `components/AuthWrapper.tsx`
- **Trigger**: Automatically shows for users without Tier 1 KYC
- **Test**: Create new account or use test account without KYC

#### Tier 2 (Address + Background)
- **File**: `app/(protected)/accounts/page.tsx`
- **Trigger**: Click "Complete Tier 2 KYC" button
- **Test**: Complete Tier 1 first, then navigate to `/accounts`

### Unlinking (When Done Testing)

```bash
cd app-v2
npm unlink kyc-widget-falconite
npm install kyc-widget-falconite@latest
```

## 🔧 Alternative: Standalone Test App

If you need an isolated test environment:

### Create Test App

```bash
cd /Users/omegauwedia/development/falconiteHQ/Untitled

npx create-next-app@latest kyc-widget-test --typescript --tailwind --app --no-src-dir

cd kyc-widget-test

# Link widget
npm link kyc-widget-falconite

# Install dependencies
npm install framer-motion lucide-react zod face-api.js lottie-web react-webcam zustand axios @edgestore/react @edgestore/server
```

See `STANDALONE_TEST_APP.md` for complete implementation.

### When to Use Standalone

- Quick isolated tests
- Debugging specific issues
- Demo purposes
- Documentation screenshots

## 📊 Testing Checklist

### Tier 1 Widget
- [ ] BVN input validation (11 digits)
- [ ] Selfie capture works
- [ ] Face detection works
- [ ] Document upload (front/back)
- [ ] API call to `/kyc/v2/verify`
- [ ] Success callback triggers
- [ ] Error messages display
- [ ] Loading states work
- [ ] NUBAN auto-creation

### Tier 2 Widget
- [ ] Address form validation
- [ ] Background info form
- [ ] Bank statement upload
- [ ] EdgeStore integration
- [ ] API call to `/kyc/v2/level-2/verify-kyc`
- [ ] Graph person creation
- [ ] Success callback
- [ ] Error handling

### UI/UX
- [ ] Responsive (mobile/desktop)
- [ ] Animations smooth
- [ ] Progress indicators
- [ ] Back button works
- [ ] CSS scoped (no conflicts)
- [ ] Theme support (light/dark)

### Integration
- [ ] Authentication works
- [ ] User data passed correctly
- [ ] File uploads work
- [ ] API errors handled
- [ ] Success redirects work

## 🐛 Debugging Tips

### Widget not updating?
```bash
cd kyc-widget-falconite
npm run build  # Force rebuild
```

### Type errors?
```bash
cd app-v2
npm run type-check
```

### CSS not loading?
Ensure import in component:
```tsx
import "kyc-widget-falconite/styles.css";
```

### API errors?
- Check backend running on port 8000
- Check CORS settings
- Check auth token valid
- Check Network tab in DevTools

### npm link not working?
```bash
# Unlink and relink
cd app-v2
npm unlink kyc-widget-falconite

cd ../kyc-widget-falconite
npm unlink
npm link

cd ../app-v2
npm link kyc-widget-falconite
```

## 📦 Pre-Publish Testing

Before publishing to npm:

### 1. Build and Pack
```bash
cd kyc-widget-falconite
npm run build
npm pack  # Creates kyc-widget-falconite-1.1.0.tgz
```

### 2. Test Packed Version
```bash
cd ../app-v2
npm install ../kyc-widget-falconite/kyc-widget-falconite-1.1.0.tgz
npm run dev
```

### 3. Test Thoroughly
- Test both tiers
- Test all features
- Check bundle size
- Check for console errors

### 4. Publish
```bash
cd ../kyc-widget-falconite

# Update version
npm version patch  # or minor/major

# Publish
npm publish

# Update app-v2
cd ../app-v2
npm install kyc-widget-falconite@latest
```

## 🎬 Complete Testing Flow

1. **Setup** (one time):
   ```bash
   ./setup-dev.sh
   ```

2. **Start services** (3 terminals):
   - Backend: `uvicorn main:app --reload`
   - Widget: `npm run dev`
   - app-v2: `npm run dev`

3. **Test Tier 1**:
   - Create new user or use test account
   - Login → Widget shows automatically
   - Complete BVN + Document flow
   - Verify NUBAN created

4. **Test Tier 2**:
   - Navigate to `/accounts`
   - Click "Complete Tier 2 KYC"
   - Complete Address + Background flow
   - Verify Graph person created

5. **Make changes**:
   - Edit widget code
   - Widget auto-rebuilds
   - Refresh browser
   - Test changes

6. **Pre-publish**:
   - `npm run build`
   - `npm pack`
   - Test packed version
   - Publish to npm

## 📚 Documentation Files

- `TESTING_GUIDE.md` - Detailed testing instructions
- `STANDALONE_TEST_APP.md` - Standalone app setup
- `setup-dev.sh` - Automated setup script
- `README.md` - Widget usage documentation
- `WIDGET_BLUEPRINT.md` - Architecture details

## 🚀 Quick Commands Reference

```bash
# Setup
./setup-dev.sh

# Development
npm run dev          # Watch mode
npm run build        # Production build
npm run type-check   # TypeScript check

# Testing
npm pack             # Create tarball
npm link             # Create global link
npm unlink           # Remove link

# Publishing
npm version patch    # Bump version
npm publish          # Publish to npm
```

## ✅ Recommendation

**Use app-v2 with npm link** for the best development experience:

1. Real-world integration testing
2. Fastest feedback loop
3. Tests actual authentication
4. Tests both tiers in context
5. No need to maintain separate test app

Only create standalone test app if you need isolated debugging or demos.
