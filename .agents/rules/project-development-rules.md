---
trigger: model_decision
description: This rules should be applied everytime the user asks for some update on the React Native / Expo context in the project.
---

# React Native & Expo Development Guidelines

You are an expert React Native and Expo agent. Follow these strict technical architectural rules, UI conventions, and performance optimization guidelines when writing, modifying, or refactoring code.

## 1. Project Architecture & Routing
* **Expo Router**: Use Expo Router with file-based routing inside the `src/app/` directory.
* **Layouts**: Wrap shared navigation layouts using `_layout.tsx` (utilizing Stack or Tabs navigation).
* **Deep Linking**: Always define linking schemes properly within the `app.json` configuration file.
* **TypeScript Strictness**: Type all component props, hooks, and API responses explicitly. Avoid using `any`.

## 2. UI, Styling & Layout
* **StyleSheet + theme tokens**: This project does not use NativeWind/Tailwind. Style with `StyleSheet.create` in a component/screen's own `styles.ts`, sourcing colors, spacing, typography, borders and shadows from `src/theme` — never hardcode raw values. See `docs/DESIGN_SYSTEM.md` and `src/theme/README.md`.
* **Safe Area Management**: Wrap screens with the shared `ScreenContainer` component (or `SafeAreaView` from `react-native-safe-area-context` directly when `ScreenContainer` doesn't fit) to account for camera notches and device insets.
* **Lists**: Use the standard React Native `<FlatList>`. `@shopify/flash-list` is not a project dependency — don't add it without checking with the user first.

## 3. Performance & Storage
* **Image Optimization**: Use `expo-image` instead of the default React Native `<Image />` for native caching, preloading, and blurhash support — it's already a dependency.
* **Animations**: `react-native-reanimated` is not currently a project dependency. Prefer the standard `Animated` API or `LayoutAnimation` for now; don't add Reanimated without checking with the user first.
* **Local Storage**: Use `@react-native-async-storage/async-storage` (already the storage adapter behind the Zustand `persist` middleware — see `src/services/storage`). `react-native-mmkv` is not a project dependency.
* **Runtime**: Keep the Hermes engine enabled in `app.json` for rapid app startup times.

## 4. State & Network Management
* **Server State**: Use TanStack Query (React Query) to manage async server state, caching, data fetching, and mutations.
* **Offline Fallbacks**: Gracefully handle network status using Expo's network utilities to prevent application crashes during dropouts.

## 5. Implementation Workflow
* **Plan Before Code**: Always activate Plan Mode to outline files to change, target architecture, and dependencies before modifying any code.
* **Validation**: Run the Expo CLI verification loop to test code integrity and check your own work before finalizing file updates.
