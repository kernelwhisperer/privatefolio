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
import React, { FormEvent, ReactNode, useCallback } from "react"

interface ConfirmDialogProps {
  content: string | ReactNode
  onClose: (confirmed: boolean, event?: FormEvent<HTMLFormElement>) => void
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

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      onClose(true, event)
    },
    [onClose]
  )

  return (
    <Dialog
      open={open}
      // onClose={handleCancel}  TODO based on props
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" gap={0.5}>
            <span>{title}</span>
            {/* {variant === "danger" && <ErrorRounded color="error" />} */}
            {variant === "warning" && <WarningRounded color="warning" />}
          </Stack>
        </DialogTitle>
        <DialogContent>
          <DialogContentText component="div">{content}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary" sx={{ paddingX: 2 }}>
            Cancel
          </Button>
          <Button type="submit" color="primary" sx={{ paddingX: 2 }}>
            Confirm
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ConfirmDialog
