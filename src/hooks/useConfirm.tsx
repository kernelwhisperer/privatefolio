import React, {
  createContext,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react"

import ConfirmDialog from "../components/ConfirmDialog/ConfirmDialog"

type ConfirmationRequest = {
  content: string | ReactNode
  /**
   * Extra questions to ask the user
   */
  extraQuestions?: string[]
  title: string
  variant?: "danger" | "warning" | "info" | "success"
}

type ConfirmationResult = {
  confirmed: boolean
  extraAnswers: boolean[]
}

interface ConfirmDialogContextType {
  confirm: (request: ConfirmationRequest) => Promise<ConfirmationResult>
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined)

export function ConfirmDialogProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<{
    request: ConfirmationRequest
    resolve: (result: ConfirmationResult) => void
  } | null>(null)

  const confirm = useCallback((request: ConfirmationRequest) => {
    return new Promise<ConfirmationResult>((resolve) => {
      setState({ request, resolve })
    })
  }, [])

  const handleClose = useCallback(
    (confirmed: boolean, extraAnswers: boolean[]) => {
      if (state) {
        state.resolve({ confirmed, extraAnswers })
        setState(null)
      }
    },
    [state]
  )

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <ConfirmDialog
          open={!!state}
          onClose={handleClose}
          title={state.request.title}
          content={state.request.content}
          variant={state.request.variant}
          extraQuestions={state.request.extraQuestions}
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
  return context.confirm
}
