import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { ConfigProvider } from 'antd'
import { antThemeConfig } from '../styles/tokens'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextType {
  themeMode: ThemeMode
  isDark: boolean
  setThemeMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    // Get saved theme from localStorage or default to 'system'
    const saved = localStorage.getItem('theme-mode')
    return (saved as ThemeMode) || 'system'
  })

  const [isDark, setIsDark] = useState(false)

  // Function to detect system theme
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  // Update isDark based on themeMode
  useEffect(() => {
    let darkMode = false

    if (themeMode === 'dark') {
      darkMode = true
    } else if (themeMode === 'light') {
      darkMode = false
    } else {
      // system mode
      darkMode = getSystemTheme()
    }

    setIsDark(darkMode)

    // Update CSS classes for body
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Save to localStorage
    localStorage.setItem('theme-mode', themeMode)
  }, [themeMode])

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = () => {
        const systemIsDark = mediaQuery.matches
        setIsDark(systemIsDark)
        
        if (systemIsDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [themeMode])

  const handleSetThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode)
  }

  return (
    <ThemeContext.Provider 
      value={{ 
        themeMode, 
        isDark, 
        setThemeMode: handleSetThemeMode 
      }}
    >
      <ConfigProvider theme={antThemeConfig(isDark)}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}
