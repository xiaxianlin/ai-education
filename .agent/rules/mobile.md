---
description: "Flutter mobile app development standards for apps/student-app"
globs: "apps/student-app/**"
alwaysApply: false
---

# Mobile Development Standards (Flutter)

## Tech Stack

- **Base**: Flutter 3.8+ + Dart 3.8+.
- **State Management**: Riverpod 3.0 (hooks_riverpod).
- **Navigation**: GoRouter 17.0+.
- **API**: Dio 5.4.0+.
- **Serialization**: json_serializable + freezed.

## Core Standards

- **State Management**: Use `ConsumerWidget` or `HookConsumerWidget`. Logic SHOULD be placed in `Notifier` or `AsyncNotifier` classes.
- **UI/Logic Separation**: Keep build methods clean. Delegate logic to Providers/Notifiers.
- **Code Generation**: MUST use `build_runner` for model and provider generation.

## Network & Data

- Use `json_serializable` and `freezed` for ALL data models.
- Centralize API calls in a repository or specialized service layer.
- ALWAYS handle connectivity issues and display appropriate error widgets.

## Operational Instructions

1. After modifying any `@freezed` or `@JsonSerializable` classes, MUST run `./build.sh` (wraps `dart run build_runner build`).
2. MUST use `snake_case.dart` for file names and `PascalCase` for Widget/Class names.
3. Verify UI layouts on multiple screen sizes (Simulator/Emulator) before final submission.
