# Build Android APK Script
# Prepares and builds debug APK for Magnate banking app

Write-Host "🚀 Magnate Banking App - APK Build Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running in correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Step 1: Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 Step 2: Pre-building with Expo..." -ForegroundColor Yellow
npx expo prebuild --platform android --clean
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prebuild failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prebuild complete" -ForegroundColor Green
Write-Host ""

Write-Host "🏗️  Step 3: Building debug APK..." -ForegroundColor Yellow
Set-Location android
.\gradlew assembleDebug
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ APK build failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host "✅ APK built successfully" -ForegroundColor Green
Write-Host ""

Write-Host "📱 Step 4: Locating APK..." -ForegroundColor Yellow
$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apkPath) {
    $apkSize = (Get-Item $apkPath).Length / 1MB
    Write-Host "✅ APK found: $apkPath" -ForegroundColor Green
    Write-Host "📊 APK Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
    Write-Host ""
    
    # Ensure builds folder exists
    $buildFolder = "magnatebuilds"
    if (-not (Test-Path $buildFolder)) {
        New-Item -ItemType Directory -Path $buildFolder | Out-Null
        Write-Host "📂 Created folder: $buildFolder" -ForegroundColor Cyan
    }

    # Create timestamped filename
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $destFile = Join-Path $buildFolder "magnate-debug-$timestamp.apk"

    # Copy to builds folder and to root for quick install
    Copy-Item $apkPath $destFile -Force
    Copy-Item $apkPath "magnate-debug.apk" -Force
    Write-Host "✅ APK copied to: $destFile" -ForegroundColor Green
    Write-Host "✅ APK copied to: magnate-debug.apk" -ForegroundColor Green
} else {
    Write-Host "❌ APK not found at expected location" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Build Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📱 Install APK with: adb install magnate-debug.apk" -ForegroundColor Yellow
Write-Host "🔌 Or connect device and run: npx expo run:android" -ForegroundColor Yellow
