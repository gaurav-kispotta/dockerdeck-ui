import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState {
  themeMode: ThemeMode
  isDark: boolean
}

// Function to detect system theme
const getSystemTheme = (): boolean => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// Function to determine if dark mode should be active
const calculateIsDark = (themeMode: ThemeMode): boolean => {
  if (themeMode === 'dark') {
    return true
  } else if (themeMode === 'light') {
    return false
  } else {
    // system mode
    return getSystemTheme()
  }
}

// Get initial theme from localStorage or default to 'system'
const getInitialThemeMode = (): ThemeMode => {
  const saved = localStorage.getItem('theme-mode')
  return (saved as ThemeMode) || 'system'
}

const initialThemeMode = getInitialThemeMode()

const initialState: ThemeState = {
  themeMode: initialThemeMode,
  isDark: calculateIsDark(initialThemeMode)
}

// Update document classes and localStorage
const updateThemeEffects = (isDark: boolean, themeMode: ThemeMode) => {
  // Update CSS classes for body
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }

  // Save to localStorage
  localStorage.setItem('theme-mode', themeMode)
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload
      state.isDark = calculateIsDark(action.payload)
      
      // Side effects
      updateThemeEffects(state.isDark, state.themeMode)
    },
    updateSystemTheme: (state) => {
      // Only update if in system mode
      if (state.themeMode === 'system') {
        const systemIsDark = getSystemTheme()
        state.isDark = systemIsDark
        updateThemeEffects(systemIsDark, state.themeMode)
      }
    },
    initializeTheme: (state) => {
      // Initialize theme effects on app start
      updateThemeEffects(state.isDark, state.themeMode)
    }
  }
})

export const { setThemeMode, updateSystemTheme, initializeTheme } = themeSlice.actions
export default themeSlice.reducer
