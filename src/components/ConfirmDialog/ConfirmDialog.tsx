import { WarningRounded } from "@mui/icons-material"
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Stack,
} from "@mui/material"
import React, { ReactNode, useEffect, useState } from "react"

interface ConfirmDialogProps {
  content: string | ReactNode
  /**
   * Extra questions to ask the user
   */
  extraQuestions?: string[]
  onClose: (confirmed: boolean, extraAnswers: boolean[]) => void
  open: boolean
  title: string
  variant?: "danger" | "warning" | "info" | "success"
}

const DEFAULT_VAL = []

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  title,
  content,
  variant,
  extraQuestions = DEFAULT_VAL,
}) => {
  const [answers, setAnswers] = useState<boolean[]>([])
  const handleCancel = () => onClose(false, answers)
  const handleConfirm = () => onClose(true, answers)

  useEffect(() => {
    setAnswers(extraQuestions.map(() => false))
  }, [extraQuestions])

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>
        <Stack direction="row" alignItems="center" gap={0.5}>
          <span>{title}</span>
          {/* {variant === "danger" && <ErrorRounded color="error" />} */}
          {variant === "warning" && <WarningRounded color="warning" />}
        </Stack>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
        <Stack paddingX={0.5}>
          {extraQuestions.map((question, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  onChange={(event) => {
                    const newAnswers = [...answers]
                    newAnswers[index] = event.target.checked
                    setAnswers(newAnswers)
                  }}
                />
              }
              label={question}
              sx={{
                "& .MuiTypography-root": {
                  color: "text.secondary",
                },
                "&:hover .MuiTypography-root": {
                  color: "text.primary",
                },
                paddingTop: index === 0 ? 2 : 0,
              }}
            />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="primary" sx={{ paddingX: 2 }}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="primary" sx={{ paddingX: 2 }}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDialog
