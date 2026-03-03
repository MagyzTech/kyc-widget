# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-03-03

### Added
- Cross-platform liveness detection with `LivenessCamera` component
  - Live camera + real-time face detection (desktop/Android/iOS Safari)
  - Post-capture analysis with file input (iOS WebView)
  - Multi-step verification: Position → Smile → Hold Still → Auto-capture
- Legacy user support with skip functionality
  - Skip button for users with BVN/NUBAN but no selfie
  - Compliance banner reminder
  - 7-day skip persistence in localStorage
- Broken document detection in Tier 2
  - Automatically disables documents with failed image URLs
  - Visual feedback for unavailable documents
- Responsive bottom sheet modal
  - Centered and constrained to widget width
  - Smooth animations with proper transform handling

### Changed
- Simplified `SelfieCapture` component to use `LivenessCamera`
- Updated KYC completion logic to require both BVN and selfie verification
- Improved widget layout for mobile and desktop
  - Centered card design with max-width constraint
  - Fixed scroll behavior within widget container
  - Skip button positioned at bottom with app's secondary button style

### Fixed
- Bottom sheet modal now respects widget container width
- Exchange rate now shows when there's 1 or more cards (was only showing for 2+)
- Removed debug console.log statements for production

## [1.1.0] - 2026-02-XX

### Added
- Initial release with Tier 1 and Tier 2 KYC flows
- BVN verification
- Document upload and verification
- Selfie capture
- React Native WebView support

### Changed
- Improved API client with better error handling

### Fixed
- Various bug fixes and improvements

## [1.0.0] - 2026-01-XX

### Added
- Initial beta release
- Basic KYC widget functionality
