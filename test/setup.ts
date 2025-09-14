import { vi } from 'vitest'

// Mock localStorage globally before any imports
const localStorageMock = {
  getItem: vi.fn().mockReturnValue(null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// Mock window.matchMedia for theme detection
const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}))

global.localStorage = localStorageMock as any
if (typeof global.window === 'undefined') {
  global.window = {} as any
}
global.window.matchMedia = matchMediaMock

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
})
