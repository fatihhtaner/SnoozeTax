#!/bin/bash

echo "🔧 Xcode Build Sorunlarını Düzeltiyoruz..."
echo ""

# 1. iOS klasörüne git
cd "$(dirname "$0")/ios"

echo "📦 1. Pod'ları temizliyoruz..."
rm -rf Pods
rm -rf Podfile.lock
rm -rf build

echo "📦 2. Pod'ları yeniden yüklüyoruz..."
pod install --repo-update

echo "🧹 3. Xcode DerivedData'yı temizliyoruz..."
rm -rf ~/Library/Developer/Xcode/DerivedData/SnoozeTax-*

echo "✅ Tamamlandı!"
echo ""
echo "📝 Şimdi yapmanız gerekenler:"
echo "1. Xcode'u açın: open SnoozeTax.xcworkspace"
echo "2. Sol panelden 'SnoozeTax' projesini seçin"
echo "3. 'Signing & Capabilities' sekmesine gidin"
echo "4. 'Automatically manage signing' işaretleyin"
echo "5. Team'inizi seçin"
echo "6. Product → Clean Build Folder (Cmd+Shift+K)"
echo "7. Product → Archive"
