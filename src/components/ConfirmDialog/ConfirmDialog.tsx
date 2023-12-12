import { WarningRounded } from "@mui/icons-material"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from "@mui/material"
import React from "react"

interface ConfirmDialogProps {
  content: string
  onClose: (value: boolean) => void
  open: boolean
  title: string
  variant?: "danger" | "warning" | "info" | "success"
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  title,
  content,
  variant,
}) => {
  const handleCancel = () => onClose(false)
  const handleConfirm = () => onClose(true)

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
