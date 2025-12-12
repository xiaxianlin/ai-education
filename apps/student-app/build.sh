#!/bin/bash

# 生成 JSON 序列化代码的脚本

echo "Installing dependencies..."
flutter pub get

echo "Generating JSON serialization code..."
dart run build_runner build --delete-conflicting-outputs

echo "Done! Generated files are in lib/core/models/*.g.dart"

