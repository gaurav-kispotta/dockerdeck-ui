# Theme System Documentation

## Overview
The application now supports automatic dark/light mode switching based on system preferences, with manual override options.

## Features

### 🌓 **Theme Modes**
- **Light Mode**: Traditional light theme with white backgrounds
- **Dark Mode**: Dark theme with gray/black backgrounds  
- **System Mode**: Automatically follows the user's system preference (default)

### 🎨 **Theme Toggle**
Located in the top-right corner of the navbar, the theme toggle provides:
- Quick access to switch between Light, Dark, and System modes
- Visual indicators showing the current theme mode:
  - 🌞 Sun icon for Light mode
  - 🌙 Moon icon for Dark mode
  - 🖥️ Desktop icon for System mode

### 💾 **Persistence**
- Theme preference is saved to localStorage
- Settings persist across browser sessions
- Automatic detection and response to system theme changes

## Technical Implementation

### Components
- **ThemeContext.tsx**: Provides theme state management
- **ThemeToggle.tsx**: UI component for theme switching
- **App.tsx**: Wrapped with ThemeProvider for global theme support

### Key Features
- **System Detection**: Uses `window.matchMedia('(prefers-color-scheme: dark)')` to detect system preference
- **Dynamic CSS**: Leverages Tailwind CSS dark mode classes (`dark:`)
- **Ant Design Integration**: Uses Ant Design's theme algorithms for consistent component styling
- **Smooth Transitions**: CSS transitions for smooth theme switching

### CSS Classes
- All components use `dark:` prefixed classes for dark mode styles
- Custom `theme-transition` class for smooth color transitions
- Tailwind's `class` strategy for dark mode implementation

## Usage

Users can change themes by:
1. Clicking the theme toggle button in the top-right corner
2. Selecting their preferred mode from the dropdown:
   - **Light**: Force light mode regardless of system setting
   - **Dark**: Force dark mode regardless of system setting  
   - **System**: Follow system preference automatically

The theme will update immediately with smooth transitions, and the choice will be remembered for future visits.
