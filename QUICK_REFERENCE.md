# KYC Widget Testing - Quick Reference

## 🚀 Quick Start (Recommended)

```bash
cd kyc-widget-falconite
./setup-dev.sh
```

## 📝 Manual Setup

```bash
# Widget
cd kyc-widget-falconite
npm run build && npm link

# app-v2
cd ../app-v2
npm link kyc-widget-falconite
```

## 🎬 Start Development

```bash
# Terminal 1 - Backend
cd backend && source venv/bin/activate
uvicorn main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2 - Widget
cd kyc-widget-falconite
npm run dev

# Terminal 3 - app-v2
cd app-v2
npm run dev
```

Open: http://localhost:3000

## 📍 Testing Locations

| Tier | File | Trigger |
|------|------|---------|
| Tier 1 | `components/AuthWrapper.tsx` | Auto-shows for users without KYC |
| Tier 2 | `app/(protected)/accounts/page.tsx` | Click "Complete Tier 2 KYC" |

## ✅ Test Checklist

### Tier 1
- [ ] BVN validation
- [ ] Selfie capture
- [ ] Document upload
- [ ] API integration
- [ ] NUBAN creation

### Tier 2
- [ ] Address form
- [ ] Background info
- [ ] Bank statement upload
- [ ] Graph person creation

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Widget not updating | `npm run build` in widget dir |
| Type errors | `npm run type-check` in app-v2 |
| CSS not loading | Import `kyc-widget-falconite/styles.css` |
| API errors | Check backend running on port 8000 |

## 🔗 Unlink

```bash
cd app-v2
npm unlink kyc-widget-falconite
npm install kyc-widget-falconite@latest
```

## 📦 Pre-Publish

```bash
cd kyc-widget-falconite
npm run build
npm pack
cd ../app-v2
npm install ../kyc-widget-falconite/kyc-widget-falconite-1.1.0.tgz
```

## 🚢 Publish

```bash
cd kyc-widget-falconite
npm version patch  # or minor/major
npm publish
```

## 📚 Documentation

- `TESTING_SUMMARY.md` - Complete guide
- `TESTING_GUIDE.md` - Detailed instructions
- `STANDALONE_TEST_APP.md` - Standalone app setup
- `TESTING_ARCHITECTURE.md` - Visual diagrams
- `setup-dev.sh` - Automated setup

## 🎯 Recommended Flow

1. Run `./setup-dev.sh`
2. Start 3 terminals (backend, widget, app-v2)
3. Test Tier 1 in AuthWrapper
4. Test Tier 2 in accounts page
5. Make changes → auto-rebuild → test
6. Pre-publish test with `npm pack`
7. Publish to npm
8. Update app-v2 to published version

## 💡 Pro Tips

- Use **npm link** for fastest development
- Test in **app-v2** for real-world integration
- Use **npm pack** before publishing
- Keep backend running during tests
- Check browser console for errors
- Check Network tab for API calls

## 🆘 Need Help?

1. Check `TESTING_SUMMARY.md` for overview
2. Check `TESTING_GUIDE.md` for details
3. Check `TESTING_ARCHITECTURE.md` for diagrams
4. Check browser console for errors
5. Check backend logs for API issues
