import { grey } from "@mui/material/colors"
import { experimental_extendTheme as extendTheme } from "@mui/material/styles"

export const RobotoFlexFF = "'Roboto Flex', sans-serif"
export const RobotoSerifFF = "'Roboto Serif', serif"
export const RobotoMonoFF = "'Roboto Mono', monospace"

const theme = extendTheme({
  colorSchemes: {
    dark: {
      palette: {
        AppBar: {
          darkBg: "rgba(30,30,30, 0.65)",
        },
        Avatar: {
          defaultBg: grey[800],
        },
        Tooltip: {
          bg: "rgb(240, 240, 240)",
        },
        background: {
          default: "rgb(40, 40, 40)",
          paper: "rgb(45, 45, 45)",
        },
        primary: {
          main: "rgb(233 141 50)",
        },
        text: {
          // primary: RETRO_BEIGE_2,
          secondary: "rgba(255, 255, 255, 0.5)",
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
    MuiTypography: {
      styleOverrides: {
        body1: {
          // "html[data-mui-color-scheme='dark'] &": {
          //   fontWeight: 100,
          // },
          lineHeight: 1.25,
        },
      },
    },
  },
  shape: {
    borderRadius: 0,
  },
  typography: {
    body1: {
      fontWeight: 200,
    },
    body2: {
      fontWeight: 200,
    },
    caption: {
      fontWeight: 200,
      letterSpacing: "0.05rem",
    },
    fontFamily: RobotoFlexFF,
  },
})
// console.log("📜 LOG > theme:", theme)

export default theme
