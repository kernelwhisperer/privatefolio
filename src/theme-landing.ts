import { CssVarsThemeOptions } from "@mui/material"

export const themeLanding: CssVarsThemeOptions = {
  colorSchemes: {
    dark: {
      palette: {
        background: {
          default: "rgb(0, 0, 0)",
        },
        text: {
          secondary: "rgba(255, 255, 255, 0.7)",
        },
      },
    },
    light: {
      palette: {
        background: {
          default: "#fff",
        },
        primary: {
          main: "rgb(0, 0, 0)",
        },
        text: {
          secondary: "rgba(0, 0, 0, 0.8)",
        },
      },
    },
  },
}
