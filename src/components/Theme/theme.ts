import { alpha, darken } from "@mui/material"
import { experimental_extendTheme as extendTheme } from "@mui/material/styles"

const RETRO_GREY = "rgb(57, 65, 73)"
const RETRO_BEIGE = "rgb(200, 187, 155)"

export const theme = extendTheme({
  colorSchemes: {
    dark: {
      palette: {
        Avatar: {
          defaultBg: RETRO_BEIGE,
        },
        TableCell: {
          border: alpha(RETRO_BEIGE, 0.33),
        },
        background: {
          default: RETRO_GREY,
        },
        mode: "dark",
        primary: {
          main: RETRO_BEIGE,
        },
        text: {
          primary: RETRO_BEIGE,
          secondary: darken(RETRO_BEIGE, 0.25),
        },
      },
    },
    light: {
      // https://colorhunt.co/palette/ff6d60f7d060f3e99f98d8aa
      palette: {
        Avatar: {
          defaultBg: RETRO_GREY,
        },
        TableCell: {
          border: alpha(RETRO_GREY, 0.33),
        },
        background: {
          default: RETRO_BEIGE,
        },
        primary: {
          main: RETRO_GREY,
        },
        text: {
          primary: RETRO_GREY,
        },
      },
    },
  },
  typography: {
    // "Roboto Mono",
    fontFamily: [
      "monospace",
      "system-ui",
      // "Roboto",
    ].join(","),
  },
})

// components: {
//   MuiButton: {
//     styleOverrides: {
//       root: {
//         background: "rgb(255,255,255, 0.15)",
//         textTransform: "none",
//       },
//     },
//   },
// },
// components: {
//   MuiButton: {
//     styleOverrides: {
//       root: {
//         background: "rgb(0,0,0, 0.05)",
//         textTransform: "none",
//       },
//     },
//   },
// },
