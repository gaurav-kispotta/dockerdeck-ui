import { useEffect, ReactNode } from 'react'
import { ConfigProvider, theme } from 'antd'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { updateSystemTheme, initializeTheme } from '../../store/slices/themeSlice'

interface ReduxThemeProviderProps {
  children: ReactNode
}

export const ReduxThemeProvider = ({ children }: ReduxThemeProviderProps) => {
  const dispatch = useAppDispatch()
  const { themeMode, isDark } = useAppSelector((state) => state.theme)

  // Initialize theme on mount
  useEffect(() => {
    dispatch(initializeTheme())
  }, [dispatch])

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = () => {
        dispatch(updateSystemTheme())
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [themeMode, dispatch])

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}
