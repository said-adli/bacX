# Brainy Mobile App

Professional Expo (iOS/Android) companion app for the Brainy educational platform.

## Features

- 🔐 **Firebase Authentication** - Email/password with persistent sessions
- 📚 **Content Hierarchy** - Subjects → Units → Lessons
- 🔴 **Live Streaming** - Real-time live pulse indicator with YouTube playback
- 🔔 **Push Notifications** - Expo notifications with token registration
- 🎨 **Glassmorphism UI** - Matching web design identity
- 🌐 **RTL Arabic Support** - Full Arabic language support

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

## Setup

### 1. Firebase Configuration

Place your Firebase configuration files in the project root:
- `google-services.json` (Android)
- `GoogleService-Info.plist` (iOS)

### 2. EAS Build Setup

```bash
# Login to Expo
eas login

# Configure builds
eas build:configure

# Build for development
eas build --platform ios --profile development
eas build --platform android --profile development
```

## Project Structure

```
mobile-app/
├── app/                    # Expo Router screens
│   ├── (auth)/             # Authentication screens
│   ├── (app)/              # Main app screens
│   └── _layout.tsx         # Root layout
├── components/             # Reusable components
├── hooks/                  # Custom hooks
├── lib/                    # Firebase & utilities
├── providers/              # Context providers
└── theme/                  # Colors & styles
```

## Design System

- **Primary Color:** #2563EB (Electric Blue)
- **Background:** Gradient [#FFFFFF → #F8FAFC → #EFF6FF]
- **Glass Cards:** bg-white/80, #DBEAFE border, 10px blur
- **Text:** #0F172A (Dark Slate)

## Environment

The app uses the same Firebase project as the web version. Configuration is loaded from native config files.
