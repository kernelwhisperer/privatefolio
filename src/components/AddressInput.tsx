import CheckIcon from "@mui/icons-material/Check"
import InputAdornment from "@mui/material/InputAdornment"
import TextField, { TextFieldProps } from "@mui/material/TextField"
import { isAddress } from "ethers"
import React, { useState } from "react"

import { MonoFont } from "../theme"

type AddressInputProps = Omit<TextFieldProps, "onChange" | "value"> & {
  onChange: (value: string) => void
  value: string
}

export function AddressInput({ value, onChange, ...rest }: AddressInputProps) {
  const [error, setError] = useState<string | null>(null)

  const isValidAddress = value && isAddress(value)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    if (newValue && !isAddress(newValue)) {
      setError("Invalid address")
    } else {
      setError(null)
    }
    onChange(newValue)
  }

  return (
    <TextField
      placeholder="0x000..."
      variant="outlined"
      value={value}
      onChange={handleChange}
      error={!!error}
      helperText={error}
      multiline
      InputProps={{
        endAdornment: isValidAddress ? (
          <InputAdornment position="end">
            <CheckIcon style={{ color: "green" }} />
          </InputAdornment>
        ) : null,
        sx: {
          fontFamily: MonoFont,
        },
      }}
      {...rest}
    />
  )
}

export type AddressInputUncontrolledProps = Omit<TextFieldProps, "onChange" | "value"> & {
  initialValue?: string
}

export function AddressInputUncontrolled({
  initialValue = "",
  ...rest
}: AddressInputUncontrolledProps) {
  const [value, onChange] = useState(initialValue)

  return <AddressInput value={value} onChange={onChange} {...rest} />
}
