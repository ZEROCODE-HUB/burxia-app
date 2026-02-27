# Magnate Banking App - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Android Studio (for Android development)
- Expo CLI
- Git

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd "c:\proyectos\Magnate web\magnate-financial-freedom"
   npm install
   ```

2. **Start development server:**
   ```bash
   npx expo start
   ```

3. **Run on Android:**
   ```bash
   npx expo run:android
   ```

---

## 📦 Build APK

### Quick Build
```powershell
.\build-apk.ps1
```

### Manual Build
```bash
npm install
npx expo prebuild --platform android --clean
cd android
.\gradlew assembleDebug
```

APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🏗️ Architecture Overview

```
src/
├── domain/              # Business logic
│   ├── entities/        # User, Account, Transaction
│   ├── repositories/    # Interfaces
│   ├── usecases/        # Login, Register, Transfer
│   └── value-objects/   # Email, PIN, Money
│
├── data/                # Data access
│   ├── repositories/    # Implementations
│   ├── mappers/         # DTO ↔ Entity
│   └── datasources/     # Supabase adapter
│
├── presentation/        # UI
│   ├── components/ui/   # Button, Input, Card
│   ├── screens/         # App screens
│   └── store/           # Zustand state
│
└── infrastructure/      # Services
    ├── di/              # Dependency injection
    ├── security/        # Encryption, Biometric
    └── storage/         # Secure storage
```

---

## 🔑 Key Features

### Security
- ✅ PIN-based authentication with SHA-256 hashing
- ✅ Biometric authentication ready (fingerprint/Face ID)
- ✅ Secure storage with expo-secure-store
- ✅ Type-safe validation with value objects

### State Management
- ✅ Zustand for global state
- ✅ React Query for server state
- ✅ Optimistic updates ready

### UI/UX
- ✅ Dark mode only (enforced)
- ✅ Professional component library
- ✅ Consistent design system
- ✅ Loading and error states

---

## 📚 Important Files

### Configuration
- `app.json` - Expo configuration (dark mode enforced)
- `tsconfig.json` - TypeScript config (decorators enabled)
- `src/infrastructure/di/container.ts` - DI container

### Core Services
- `src/infrastructure/security/EncryptionService.ts` - PIN hashing
- `src/infrastructure/security/BiometricService.ts` - Biometric auth
- `src/infrastructure/storage/SecureStorageService.ts` - Secure storage

### Repositories
- `src/data/repositories/AuthRepository.ts` - Authentication
- `src/data/repositories/AccountRepository.ts` - Account management
- `src/data/repositories/TransactionRepository.ts` - Transactions

---

## 🐛 Known Issues

### Registration Bug (Identified)
**Issue:** Loading indicator appears on PIN screen instead of confirmation screen.

**Status:** Architecture ready for fix. Need to update StepConfirmation to trigger API call.

**Fix Location:** `components/register/StepConfirmation.tsx`

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### E2E Tests (when implemented)
```bash
npm run test:e2e
```

---

## 📱 Deployment

### Debug APK
```powershell
.\build-apk.ps1
adb install magnate-debug.apk
```

### Production Build
```bash
npx expo build:android
```

---

## 🔧 Troubleshooting

### Build Errors
1. Clean build: `cd android && .\gradlew clean`
2. Clear cache: `npx expo start -c`
3. Reinstall: `rm -rf node_modules && npm install`

### Decorator Errors
- Ensure `tsconfig.json` has `experimentalDecorators: true`
- Ensure `reflect-metadata` is imported in entry file

---

## 📖 Documentation

- [Implementation Plan](file:///C:/Users/USUARIO/.gemini/antigravity/brain/91f59021-7d5a-4e4a-b1c6-985db09e2cde/implementation_plan.md)
- [Enterprise Architecture Guide](file:///C:/Users/USUARIO/.gemini/antigravity/brain/91f59021-7d5a-4e4a-b1c6-985db09e2cde/enterprise_architecture_guide.md)
- [Walkthrough](file:///C:/Users/USUARIO/.gemini/antigravity/brain/91f59021-7d5a-4e4a-b1c6-985db09e2cde/walkthrough.md)

---

## 🎯 Next Steps

1. ✅ Test registration flow
2. ⏳ Migrate remaining screens
3. ⏳ Add comprehensive tests
4. ⏳ Implement remaining use cases
5. ⏳ Production deployment
