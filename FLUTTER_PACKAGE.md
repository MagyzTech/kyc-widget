# Flutter KYC Widget Package

## Overview

Flutter package for KYC verification with **native camera support** for optimal iOS/Android performance.

## Architecture Decision: Native Module (Recommended)

### Why Native Module > WebView

| Feature | Native Module | WebView |
|---------|--------------|---------|
| Camera Performance | ✅ Excellent | ⚠️ Limited on iOS |
| Face Detection | ✅ Native ML Kit | ❌ Requires JS bridge |
| File Size | ✅ Smaller | ❌ Larger (includes web assets) |
| Offline Support | ✅ Full | ❌ Limited |
| User Experience | ✅ Native feel | ⚠️ Web feel |
| Maintenance | ⚠️ Platform-specific | ✅ Single codebase |

**Recommendation**: Use **Native Module** for production apps.

## Package Structure

```
kyc_widget_falconite/
├── lib/
│   ├── kyc_widget_falconite.dart          # Main export
│   ├── src/
│   │   ├── models/
│   │   │   ├── kyc_tier.dart              # Tier 1/2 enums
│   │   │   ├── kyc_config.dart            # Configuration
│   │   │   └── kyc_result.dart            # Result models
│   │   ├── services/
│   │   │   ├── api_service.dart           # Backend API
│   │   │   └── camera_service.dart        # Camera handling
│   │   ├── screens/
│   │   │   ├── tier1/
│   │   │   │   ├── bvn_screen.dart
│   │   │   │   ├── selfie_screen.dart
│   │   │   │   └── document_screen.dart
│   │   │   ├── tier2/
│   │   │   │   ├── address_screen.dart
│   │   │   │   ├── background_screen.dart
│   │   │   │   └── bank_statement_screen.dart
│   │   │   └── success_screen.dart
│   │   └── widgets/
│   │       ├── camera_widget.dart         # Native camera
│   │       ├── face_detector.dart         # ML Kit face detection
│   │       └── progress_indicator.dart
│   └── kyc_widget.dart                    # Main widget
├── android/
│   └── src/main/kotlin/                   # Android native code
├── ios/
│   └── Classes/                           # iOS native code
├── example/
│   └── lib/main.dart                      # Example app
├── pubspec.yaml
└── README.md
```

## Installation

Add to `pubspec.yaml`:

```yaml
dependencies:
  kyc_widget_falconite: ^1.0.0
  
  # Required dependencies
  camera: ^0.10.5
  google_ml_kit: ^0.16.0
  image_picker: ^1.0.4
  http: ^1.1.0
  path_provider: ^2.1.1
```

## Platform Setup

### iOS (Info.plist)

```xml
<key>NSCameraUsageDescription</key>
<string>Camera access is required for identity verification</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Photo library access is required to select documents</string>
<key>NSMicrophoneUsageDescription</key>
<string>Microphone access may be required</string>
```

### Android (AndroidManifest.xml)

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
```

## Usage

### Basic Implementation

```dart
import 'package:kyc_widget_falconite/kyc_widget_falconite.dart';

class KYCScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return KYCWidget(
      tier: KYCTier.tier1,
      config: KYCConfig(
        apiBaseUrl: 'https://api.yourapp.com',
        accessToken: 'user-auth-token',
      ),
      onSuccess: (result) {
        print('KYC Success: ${result.toJson()}');
        Navigator.pop(context);
      },
      onError: (error) {
        print('KYC Error: $error');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('KYC failed: $error')),
        );
      },
      onProgress: (step, progress) {
        print('Progress: $step - $progress%');
      },
    );
  }
}
```

### Tier 1 (BVN + Document)

```dart
KYCWidget(
  tier: KYCTier.tier1,
  config: KYCConfig(
    apiBaseUrl: 'https://api.yourapp.com',
    accessToken: token,
    theme: KYCTheme.light,
  ),
  onSuccess: (result) {
    // Handle success
    print('NUBAN: ${result.nubanAccount}');
  },
)
```

### Tier 2 (Enhanced KYC)

```dart
KYCWidget(
  tier: KYCTier.tier2,
  config: KYCConfig(
    apiBaseUrl: 'https://api.yourapp.com',
    accessToken: token,
    onUpload: (file) async {
      // Custom file upload
      final url = await uploadToStorage(file);
      return url;
    },
  ),
  onSuccess: (result) {
    // Handle success
    print('Graph Person: ${result.graphPerson}');
  },
)
```

## Core Components

### 1. Main Widget (`lib/kyc_widget.dart`)

```dart
import 'package:flutter/material.dart';
import 'src/models/kyc_config.dart';
import 'src/models/kyc_tier.dart';
import 'src/models/kyc_result.dart';
import 'src/screens/tier1/bvn_screen.dart';
import 'src/screens/tier2/address_screen.dart';

class KYCWidget extends StatefulWidget {
  final KYCTier tier;
  final KYCConfig config;
  final Function(KYCResult) onSuccess;
  final Function(String) onError;
  final Function(String, double)? onProgress;

  const KYCWidget({
    Key? key,
    required this.tier,
    required this.config,
    required this.onSuccess,
    required this.onError,
    this.onProgress,
  }) : super(key: key);

  @override
  State<KYCWidget> createState() => _KYCWidgetState();
}

class _KYCWidgetState extends State<KYCWidget> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.tier == KYCTier.tier1
          ? BVNScreen(
              config: widget.config,
              onSuccess: widget.onSuccess,
              onError: widget.onError,
              onProgress: widget.onProgress,
            )
          : AddressScreen(
              config: widget.config,
              onSuccess: widget.onSuccess,
              onError: widget.onError,
              onProgress: widget.onProgress,
            ),
    );
  }
}
```

### 2. Native Camera Widget (`lib/src/widgets/camera_widget.dart`)

```dart
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:google_ml_kit/google_ml_kit.dart';

class NativeCameraWidget extends StatefulWidget {
  final Function(String) onCapture;
  final CameraLensDirection direction;

  const NativeCameraWidget({
    Key? key,
    required this.onCapture,
    this.direction = CameraLensDirection.front,
  }) : super(key: key);

  @override
  State<NativeCameraWidget> createState() => _NativeCameraWidgetState();
}

class _NativeCameraWidgetState extends State<NativeCameraWidget> {
  CameraController? _controller;
  List<CameraDescription>? _cameras;
  bool _isFaceDetected = false;
  final FaceDetector _faceDetector = GoogleMlKit.vision.faceDetector(
    FaceDetectorOptions(
      enableLandmarks: true,
      enableClassification: true,
    ),
  );

  @override
  void initState() {
    super.initState();
    _initializeCamera();
  }

  Future<void> _initializeCamera() async {
    _cameras = await availableCameras();
    final camera = _cameras!.firstWhere(
      (cam) => cam.lensDirection == widget.direction,
      orElse: () => _cameras!.first,
    );

    _controller = CameraController(
      camera,
      ResolutionPreset.high,
      enableAudio: false,
    );

    await _controller!.initialize();
    setState(() {});

    // Start face detection
    _controller!.startImageStream((image) => _detectFace(image));
  }

  Future<void> _detectFace(CameraImage image) async {
    // Convert CameraImage to InputImage
    final inputImage = _convertToInputImage(image);
    if (inputImage == null) return;

    final faces = await _faceDetector.processImage(inputImage);
    setState(() {
      _isFaceDetected = faces.isNotEmpty;
    });
  }

  InputImage? _convertToInputImage(CameraImage image) {
    // Implementation for converting CameraImage to InputImage
    // See: https://pub.dev/packages/google_ml_kit
    return null; // Placeholder
  }

  Future<void> _captureImage() async {
    if (_controller == null || !_controller!.value.isInitialized) return;

    final image = await _controller!.takePicture();
    widget.onCapture(image.path);
  }

  @override
  Widget build(BuildContext context) {
    if (_controller == null || !_controller!.value.isInitialized) {
      return const Center(child: CircularProgressIndicator());
    }

    return Stack(
      children: [
        CameraPreview(_controller!),
        
        // Face detection overlay
        if (_isFaceDetected)
          Positioned(
            top: 100,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.symmetric(horizontal: 20),
              decoration: BoxDecoration(
                color: Colors.green,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'Face detected',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white),
              ),
            ),
          ),

        // Capture button
        Positioned(
          bottom: 40,
          left: 0,
          right: 0,
          child: Center(
            child: FloatingActionButton(
              onPressed: _captureImage,
              backgroundColor: Colors.white,
              child: const Icon(Icons.camera, color: Colors.purple),
            ),
          ),
        ),
      ],
    );
  }

  @override
  void dispose() {
    _controller?.dispose();
    _faceDetector.close();
    super.dispose();
  }
}
```

### 3. API Service (`lib/src/services/api_service.dart`)

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/kyc_config.dart';
import '../models/kyc_result.dart';

class APIService {
  final KYCConfig config;

  APIService(this.config);

  Future<KYCResult> verifyTier1({
    required String bvn,
    required String selfieImage,
    String? documentFront,
    String? documentBack,
    String? documentType,
    String? documentNumber,
  }) async {
    final response = await http.post(
      Uri.parse('${config.apiBaseUrl}/kyc/v2/verify'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${config.accessToken}',
      },
      body: jsonEncode({
        'bvn': bvn,
        'selfie_image': selfieImage,
        if (documentFront != null) 'document_front': documentFront,
        if (documentBack != null) 'document_back': documentBack,
        if (documentType != null) 'document_type': documentType,
        if (documentNumber != null) 'document_number': documentNumber,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return KYCResult.fromJson(data['data']);
    } else {
      throw Exception('KYC verification failed: ${response.body}');
    }
  }

  Future<KYCResult> verifyTier2({
    required String documentType,
    required String documentNumber,
    required String documentFrontUrl,
    String? documentBackUrl,
    required String addressLine,
    required String addressCity,
    required String addressState,
    required String postalCode,
    required String addressCountry,
    required String employmentStatus,
    required String occupation,
    required String primaryPurpose,
    required String sourceOfFunds,
    required int expectedMonthlyInflow,
    required String bankStatementUrl,
  }) async {
    final response = await http.post(
      Uri.parse('${config.apiBaseUrl}/kyc/v2/level-2/verify-kyc'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${config.accessToken}',
      },
      body: jsonEncode({
        'document_type': documentType,
        'document_number': documentNumber,
        'document_front_url': documentFrontUrl,
        'document_back_url': documentBackUrl,
        'address_line': addressLine,
        'address_city': addressCity,
        'address_state': addressState,
        'postal_code': postalCode,
        'address_country': addressCountry,
        'employment_status': employmentStatus,
        'occupation': occupation,
        'primary_purpose': primaryPurpose,
        'source_of_funds': sourceOfFunds,
        'expected_monthly_inflow': expectedMonthlyInflow,
        'bank_statement_url': bankStatementUrl,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return KYCResult.fromJson(data['data']);
    } else {
      throw Exception('Tier 2 KYC failed: ${response.body}');
    }
  }
}
```

## Alternative: WebView Approach

If you prefer WebView (simpler but limited iOS camera):

```dart
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

class KYCWebViewWidget extends StatefulWidget {
  final String url;
  final String accessToken;

  const KYCWebViewWidget({
    Key? key,
    required this.url,
    required this.accessToken,
  }) : super(key: key);

  @override
  State<KYCWebViewWidget> createState() => _KYCWebViewWidgetState();
}

class _KYCWebViewWidgetState extends State<KYCWebViewWidget> {
  InAppWebViewController? _controller;

  @override
  Widget build(BuildContext context) {
    return InAppWebView(
      initialUrlRequest: URLRequest(
        url: Uri.parse('${widget.url}?token=${widget.accessToken}'),
      ),
      initialOptions: InAppWebViewGroupOptions(
        crossPlatform: InAppWebViewOptions(
          mediaPlaybackRequiresUserGesture: false,
          javaScriptEnabled: true,
        ),
        android: AndroidInAppWebViewOptions(
          useHybridComposition: true,
        ),
        ios: IOSInAppWebViewOptions(
          allowsInlineMediaPlayback: true,
        ),
      ),
      onWebViewCreated: (controller) {
        _controller = controller;
        
        // Add JavaScript handler
        controller.addJavaScriptHandler(
          handlerName: 'kycComplete',
          callback: (args) {
            // Handle KYC completion
            Navigator.pop(context, args[0]);
          },
        );
      },
    );
  }
}
```

## Publishing

```bash
# Test locally
cd kyc_widget_falconite
flutter pub get
flutter test

# Publish to pub.dev
flutter pub publish --dry-run
flutter pub publish
```

## Comparison: Native vs WebView

### Use Native Module When:
- ✅ Need best camera performance
- ✅ Want native UI/UX
- ✅ Require offline support
- ✅ Building production app

### Use WebView When:
- ✅ Need rapid development
- ✅ Want single codebase
- ✅ iOS camera limitations acceptable
- ✅ Building MVP/prototype

## Next Steps

1. Create Flutter package structure
2. Implement native camera with ML Kit
3. Add API service layer
4. Create example app
5. Test on iOS/Android
6. Publish to pub.dev

See `FLUTTER_PACKAGE_IMPLEMENTATION.md` for detailed code.
