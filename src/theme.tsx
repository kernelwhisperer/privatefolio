import { experimental_extendTheme as extendTheme } from "@mui/material/styles"

// A custom theme for this app
const theme = extendTheme({
  colorSchemes: {
    dark: {
      palette: {
        AppBar: {
          darkBg: "rgba(30,30,30, 0.65)",
        },
        Tooltip: {
          bg: "rgb(240, 240, 240)",
        },
        background: {
          default: "rgb(40, 40, 40)",
          paper: "rgba(255, 255, 255, 0.05)",
        },
        primary: {
          main: "rgb(233 141 50)",
        },
        text: {
          // primary: RETRO_BEIGE_2,
          secondary: "rgb(40, 40, 40)",
        },
        // secondary: {
        //   main: "rgb(0, 211, 149)",
        // },
      },
    },
    light: {
      palette: {
        AppBar: {
          darkBg: "rgba(230,230,230, 0.65)",
        },
        // primary: {
        //   main: "rgb(233 141 50)",
        // },
      },
    },
  },
  // transitions: {
  //   easing: {
  //     // sharp: "cubic-bezier(1.000, 0.000, 0.000, 1.000)",
  //   },
  // },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          "@supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none))": {
            backdropFilter: "blur(20px)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "32px",
          textTransform: "none",
        },
      },
    },
  },
  shape: {
    borderRadius: 0,
  },
})
// console.log("📜 LOG > theme:", theme)

export const RobotoSerifFF = "'Roboto Serif', serif"
export const RobotoMonoFF = "'Roboto Mono', monospace"

export default theme
