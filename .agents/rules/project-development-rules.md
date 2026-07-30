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
* **NativeWind**: Use NativeWind (Tailwind CSS for React Native) for all styling. Never use inline `StyleSheet.create` unless explicitly requested.
* **Safe Area Management**: Always wrap screen components in a `SafeAreaView` from `react-native-safe-area-context` to account for camera notches and device insets.
* **Lists**: Replace the native `<FlatList>` with Shopify’s `<FlashList>` for long or dynamic feeds to ensure 5x rendering performance.

## 3. Performance & Storage
* **Image Optimization**: Never use the default React Native `<Image />`. Use `expo-image` instead for native caching, preloading, and blurhash support.
* **Animations**: Execute all animations at 60fps on the UI thread using `react-native-reanimated`. Avoid using the standard JS-bridge Animated API.
* **Local Storage**: Use `react-native-mmkv` for fast, synchronous key-value storage instead of the slower, asynchronous AsyncStorage.
* **Runtime**: Keep the Hermes engine enabled in `app.json` for rapid app startup times.

## 4. State & Network Management
* **Server State**: Use TanStack Query (React Query) to manage async server state, caching, data fetching, and mutations.
* **Offline Fallbacks**: Gracefully handle network status using Expo's network utilities to prevent application crashes during dropouts.

## 5. Implementation Workflow
* **Plan Before Code**: Always activate Plan Mode to outline files to change, target architecture, and dependencies before modifying any code.
* **Validation**: Run the Expo CLI verification loop to test code integrity and check your own work before finalizing file updates.
