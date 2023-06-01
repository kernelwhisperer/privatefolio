import { alpha } from "@mui/material";
import { experimental_extendTheme as extendTheme } from "@mui/material/styles";

const LIGHT_THEME_TEXT = "rgb(57, 65, 73)";

export const theme = extendTheme({
  colorSchemes: {
    dark: {
      palette: {
        mode: "dark",
        primary: {
          main: "rgb(255,255,255)",
        },
        secondary: {
          main: "rgb(212,212,212)",
        },
      },
    },
    light: {
      // https://colorhunt.co/palette/ff6d60f7d060f3e99f98d8aa
      palette: {
        TableCell: {
          border: alpha(LIGHT_THEME_TEXT, 0.33),
        },
        background: {
          default: "#c8bb9b",
        },
        primary: {
          main: "rgb(57, 65, 73)",
        },
        secondary: {
          main: "rgb(57, 65, 73)",
        },
        text: {
          primary: LIGHT_THEME_TEXT,
        },
      },
    },
  },
  // "Roboto Mono",
  // RobotoFlex.style.fontFamily,
  typography: {
    fontFamily: [
      "monospace",
      "system-ui",
      // "Roboto",
      // "-apple-system",
      // "BlinkMacSystemFont",
      // '"Segoe UI"',
      // '"Helvetica Neue"',
      // "Arial",
      // "sans-serif",
      // '"Apple Color Emoji"',
      // '"Segoe UI Emoji"',
      // '"Segoe UI Symbol"',
    ].join(","),
  },
});

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
