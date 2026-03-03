# Testing Architecture Diagram

## Development Setup with npm link

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEVELOPMENT ENVIRONMENT                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│   kyc-widget-        │         │      app-v2          │
│   falconite/         │         │                      │
│                      │         │                      │
│  ┌────────────────┐  │         │  ┌────────────────┐  │
│  │ src/           │  │         │  │ components/    │  │
│  │ ├─ components │  │         │  │ └─ AuthWrapper │  │
│  │ ├─ services   │  │         │  │                │  │
│  │ └─ styles     │  │         │  │ app/           │  │
│  └────────────────┘  │         │  │ └─ accounts/  │  │
│         │            │         │  │    page.tsx   │  │
│         ↓            │         │  └────────────────┘  │
│  npm run dev         │         │         ↑            │
│  (watch & rebuild)   │         │         │            │
│         │            │         │    npm link          │
│         ↓            │         │    kyc-widget-       │
│  ┌────────────────┐  │         │    falconite         │
│  │ dist/          │  │         │         │            │
│  │ ├─ index.js   │◄─┼─────────┼─────────┘            │
│  │ ├─ index.mjs  │  │  npm    │                      │
│  │ └─ index.css  │  │  link   │  npm run dev         │
│  └────────────────┘  │         │  (Next.js)           │
│                      │         │         │            │
│  npm link            │         │         ↓            │
│  (creates symlink)   │         │  http://localhost:   │
│                      │         │  3000                │
└──────────────────────┘         └──────────────────────┘
         │                                  │
         │                                  │
         └──────────────┬───────────────────┘
                        ↓
              ┌──────────────────┐
              │   Backend API    │
              │   (FastAPI)      │
              │                  │
              │  Port 8000       │
              │                  │
              │  /kyc/v2/verify  │
              │  /kyc/v2/level-2 │
              │  /kyc/v2/status  │
              └──────────────────┘
```

## Data Flow - Tier 1 Testing

```
┌─────────────────────────────────────────────────────────────────┐
│                        TIER 1 FLOW                               │
└─────────────────────────────────────────────────────────────────┘

User                app-v2              KYC Widget           Backend
 │                    │                      │                  │
 │  1. Login          │                      │                  │
 ├───────────────────►│                      │                  │
 │                    │  POST /auth/login    │                  │
 │                    ├─────────────────────────────────────────►│
 │                    │◄─────────────────────────────────────────┤
 │                    │  {access_token}      │                  │
 │                    │                      │                  │
 │  2. Show Widget    │                      │                  │
 │◄───────────────────┤                      │                  │
 │                    │  <KYCWidget          │                  │
 │                    │   tier="tier_1"      │                  │
 │                    │   accessToken={...}  │                  │
 │                    │  />                  │                  │
 │                    │                      │                  │
 │  3. Enter BVN      │                      │                  │
 ├────────────────────┼─────────────────────►│                  │
 │                    │                      │                  │
 │  4. Capture Selfie │                      │                  │
 ├────────────────────┼─────────────────────►│                  │
 │                    │                      │                  │
 │  5. Upload Doc     │                      │                  │
 ├────────────────────┼─────────────────────►│                  │
 │                    │                      │                  │
 │                    │                      │  POST /kyc/v2/   │
 │                    │                      │  verify          │
 │                    │                      ├─────────────────►│
 │                    │                      │                  │
 │                    │                      │  ┌─────────────┐ │
 │                    │                      │  │ Verify BVN  │ │
 │                    │                      │  │ via Dojah   │ │
 │                    │                      │  └─────────────┘ │
 │                    │                      │                  │
 │                    │                      │  ┌─────────────┐ │
 │                    │                      │  │ Verify Doc  │ │
 │                    │                      │  │ via Dojah   │ │
 │                    │                      │  └─────────────┘ │
 │                    │                      │                  │
 │                    │                      │  ┌─────────────┐ │
 │                    │                      │  │ Create      │ │
 │                    │                      │  │ NUBAN       │ │
 │                    │                      │  └─────────────┘ │
 │                    │                      │                  │
 │                    │                      │◄─────────────────┤
 │                    │                      │  {user, nuban}   │
 │                    │  onSuccess(data)     │                  │
 │                    │◄─────────────────────┤                  │
 │                    │                      │                  │
 │                    │  refetchUser()       │                  │
 │                    │  router.refresh()    │                  │
 │                    │                      │                  │
 │  6. Show Dashboard │                      │                  │
 │◄───────────────────┤                      │                  │
 │                    │                      │                  │
```

## Data Flow - Tier 2 Testing

```
┌─────────────────────────────────────────────────────────────────┐
│                        TIER 2 FLOW                               │
└─────────────────────────────────────────────────────────────────┘

User                app-v2              KYC Widget           Backend
 │                    │                      │                  │
 │  1. Navigate to    │                      │                  │
 │     /accounts      │                      │                  │
 ├───────────────────►│                      │                  │
 │                    │                      │                  │
 │  2. Click "Tier 2" │                      │                  │
 ├───────────────────►│                      │                  │
 │                    │  <KYCWidget          │                  │
 │                    │   tier="tier_2"      │                  │
 │                    │   onUpload={...}     │                  │
 │                    │  />                  │                  │
 │                    │                      │                  │
 │  3. Enter Address  │                      │                  │
 ├────────────────────┼─────────────────────►│                  │
 │                    │                      │                  │
 │  4. Background     │                      │                  │
 ├────────────────────┼─────────────────────►│                  │
 │                    │                      │                  │
 │  5. Upload Bank    │                      │                  │
 │     Statement      │                      │                  │
 ├────────────────────┼─────────────────────►│                  │
 │                    │                      │                  │
 │                    │                      │  onUpload(file)  │
 │                    │                      ├─────────────────►│
 │                    │                      │  EdgeStore       │
 │                    │                      │◄─────────────────┤
 │                    │                      │  {url}           │
 │                    │                      │                  │
 │                    │                      │  POST /kyc/v2/   │
 │                    │                      │  level-2/verify  │
 │                    │                      ├─────────────────►│
 │                    │                      │                  │
 │                    │                      │  ┌─────────────┐ │
 │                    │                      │  │ Create      │ │
 │                    │                      │  │ Graph       │ │
 │                    │                      │  │ Person      │ │
 │                    │                      │  └─────────────┘ │
 │                    │                      │                  │
 │                    │                      │  ┌─────────────┐ │
 │                    │                      │  │ Update      │ │
 │                    │                      │  │ Address     │ │
 │                    │                      │  └─────────────┘ │
 │                    │                      │                  │
 │                    │                      │◄─────────────────┤
 │                    │                      │  {user, graph}   │
 │                    │  onSuccess(data)     │                  │
 │                    │◄─────────────────────┤                  │
 │                    │                      │                  │
 │                    │  router.refresh()    │                  │
 │                    │                      │                  │
 │  6. Show Accounts  │                      │                  │
 │◄───────────────────┤                      │                  │
 │                    │                      │                  │
```

## File Structure

```
Untitled/
├── kyc-widget-falconite/          # Widget package
│   ├── src/
│   │   ├── components/
│   │   │   ├── KYCWidget.tsx      # Main component
│   │   │   ├── tiers/
│   │   │   │   ├── Tier1Flow.tsx
│   │   │   │   └── Tier2Flow.tsx
│   │   │   └── steps/             # Individual steps
│   │   ├── services/
│   │   │   └── api.ts             # API client
│   │   └── styles/
│   │       └── widget.css
│   ├── dist/                      # Built files (npm link target)
│   ├── package.json
│   ├── TESTING_GUIDE.md           # ← You are here
│   ├── TESTING_SUMMARY.md
│   ├── STANDALONE_TEST_APP.md
│   └── setup-dev.sh               # Setup script
│
├── app-v2/                        # Test application
│   ├── components/
│   │   └── AuthWrapper.tsx        # Tier 1 integration
│   ├── app/
│   │   └── (protected)/
│   │       └── accounts/
│   │           └── page.tsx       # Tier 2 integration
│   ├── node_modules/
│   │   └── kyc-widget-falconite/  # Symlink to ../kyc-widget-falconite/dist
│   └── package.json
│
└── backend/                       # API backend
    ├── app/
    │   └── routers/
    │       └── kyc_v2.py          # KYC endpoints
    └── main.py
```

## npm link Mechanism

```
┌─────────────────────────────────────────────────────────────────┐
│                    HOW NPM LINK WORKS                            │
└─────────────────────────────────────────────────────────────────┘

Step 1: npm link (in widget directory)
┌──────────────────────────────────────┐
│ kyc-widget-falconite/                │
│                                      │
│  npm link                            │
│     │                                │
│     ↓                                │
│  Creates symlink in global:          │
│  /usr/local/lib/node_modules/        │
│  kyc-widget-falconite                │
│     │                                │
│     └──► Points to: dist/            │
└──────────────────────────────────────┘

Step 2: npm link kyc-widget-falconite (in app-v2)
┌──────────────────────────────────────┐
│ app-v2/                              │
│                                      │
│  npm link kyc-widget-falconite       │
│     │                                │
│     ↓                                │
│  Creates symlink:                    │
│  node_modules/kyc-widget-falconite   │
│     │                                │
│     └──► Points to global symlink    │
│            │                         │
│            └──► Points to widget/dist│
└──────────────────────────────────────┘

Result: Changes in widget → Auto-rebuild → Reflect in app-v2
```

## Testing Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT WORKFLOW                          │
└─────────────────────────────────────────────────────────────────┘

1. Setup (one time)
   ./setup-dev.sh
   
2. Start services (3 terminals)
   Terminal 1: Backend
   Terminal 2: Widget (watch mode)
   Terminal 3: app-v2
   
3. Make changes
   Edit widget code
   ↓
   Widget auto-rebuilds
   ↓
   Refresh browser
   ↓
   Test changes
   
4. Iterate
   Repeat step 3 until satisfied
   
5. Pre-publish test
   npm pack
   ↓
   Install tarball in app-v2
   ↓
   Test thoroughly
   
6. Publish
   npm version patch
   ↓
   npm publish
   ↓
   Update app-v2 to use published version
```
