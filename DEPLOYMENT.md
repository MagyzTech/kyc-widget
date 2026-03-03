# Deployment Guide

## Prerequisites

1. **npm Account**: Ensure you're logged in to npm
   ```bash
   npm login
   ```

2. **GitHub Access**: Ensure you have push access to the repository

3. **Clean Build**: Ensure the widget builds successfully
   ```bash
   npm run build
   ```

## Deployment Steps

### 1. Publish to npm

```bash
# From the kyc-widget-falconite directory
cd /Users/omegauwedia/development/falconiteHQ/Untitled/kyc-widget-falconite

# Ensure you're on the main branch
git checkout main
git pull origin main

# Build the package
npm run build

# Publish to npm (public package)
npm publish --access public
```

### 2. Create GitHub Release

```bash
# Tag the release
git tag -a v1.2.0 -m "Release v1.2.0 - Cross-platform liveness detection and legacy user support"

# Push the tag
git push origin v1.2.0

# Push all changes
git add .
git commit -m "Release v1.2.0"
git push origin main
```

Then create a release on GitHub:
1. Go to https://github.com/falconiteHQ/kyc-widget-falconite/releases/new
2. Select tag: `v1.2.0`
3. Release title: `v1.2.0 - Cross-platform Liveness Detection`
4. Description: Copy from CHANGELOG.md
5. Attach build artifacts (optional)
6. Click "Publish release"

### 3. Update Documentation

Update the following files on GitHub:
- README.md - Ensure it reflects latest features
- CHANGELOG.md - Already updated
- IMPLEMENTATION_SUMMARY.md - Update if needed

### 4. Verify Deployment

```bash
# Check npm package
npm view kyc-widget-falconite

# Test installation in a new project
mkdir test-install && cd test-install
npm init -y
npm install kyc-widget-falconite
```

## Post-Deployment

### Update app-v2 to use published package

```bash
cd /Users/omegauwedia/development/falconiteHQ/Untitled/app-v2

# Remove local tarball installation
npm uninstall kyc-widget-falconite

# Install from npm
npm install kyc-widget-falconite@1.2.0 --legacy-peer-deps
```

### Verify in Production

1. Test on staging environment
2. Test all KYC flows
3. Test legacy user skip functionality
4. Test liveness detection on different devices
5. Deploy to production

## Flutter Package (Future)

See FLUTTER_PACKAGE.md for architecture and implementation plan.

## Rollback Plan

If issues are found:

```bash
# Unpublish from npm (within 72 hours)
npm unpublish kyc-widget-falconite@1.2.0

# Or deprecate the version
npm deprecate kyc-widget-falconite@1.2.0 "This version has issues, use 1.1.0"

# Delete GitHub release and tag
git tag -d v1.2.0
git push origin :refs/tags/v1.2.0
```

## Support

For issues or questions:
- GitHub Issues: https://github.com/falconiteHQ/kyc-widget-falconite/issues
- Email: support@falconite.com
