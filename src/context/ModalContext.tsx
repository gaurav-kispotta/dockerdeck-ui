import { createContext, useContext, useState, ReactNode } from 'react'

interface ModalContextValue {
  bodyNode: ReactNode | null
  setBodyNode: (node: ReactNode | null) => void
}

const ModalContext = createContext<ModalContextValue>({
  bodyNode: null,
  setBodyNode: () => {},
})

export const useModalContext = () => useContext(ModalContext)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [bodyNode, setBodyNode] = useState<ReactNode | null>(null)

  return (
    <ModalContext.Provider value={{ bodyNode, setBodyNode }}>
      {children}
    </ModalContext.Provider>
  )
}
