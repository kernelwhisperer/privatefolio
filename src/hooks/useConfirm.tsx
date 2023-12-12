import React, { createContext, ReactNode, useContext, useState } from "react"

import ConfirmDialog from "../components/ConfirmDialog/ConfirmDialog"

interface ConfirmDialogContextType {
  requestConfirmation: (
    title: string,
    content: string,
    variant?: "danger" | "warning" | "info" | "success"
  ) => Promise<boolean>
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined)

export const ConfirmDialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [confirmState, setConfirmState] = useState<{
    content: string
    resolve: (value: boolean) => void
    title: string
    variant?: "danger" | "warning" | "info" | "success"
  } | null>(null)

  const requestConfirmation = (
    title: string,
    content: string,
    variant?: "danger" | "warning" | "info" | "success"
  ) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ content, resolve, title, variant })
    })
  }

  const handleClose = (value: boolean) => {
    if (confirmState) {
      confirmState.resolve(value)
      setConfirmState(null)
    }
  }

  return (
    <ConfirmDialogContext.Provider value={{ requestConfirmation }}>
      {children}
      {confirmState && (
        <ConfirmDialog
          open={!!confirmState}
          onClose={handleClose}
          title={confirmState.title}
          content={confirmState.content}
          variant={confirmState.variant}
        />
      )}
    </ConfirmDialogContext.Provider>
  )
}

export const useConfirm = () => {
  const context = useContext(ConfirmDialogContext)
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmDialogProvider")
  }
  return context.requestConfirmation
}
