import { grey } from "@mui/material/colors"
import { experimental_extendTheme as extendTheme } from "@mui/material/styles"

export const MainFont = "'Roboto Flex', sans-serif"
export const SerifFont = "'Roboto Serif', serif"
export const MonoFont = "'IBM Plex Mono', monospace"

export const whiteBG = "rgb(247, 247, 250)"

const cutCorners =
  "polygon(12px 0%, calc(100% - 12px) 0%, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0% calc(100% - 12px), 0% 12px)"

const theme = extendTheme({
  colorSchemes: {
    dark: {
      palette: {
        AppBar: {
          // darkBg: "rgba(30,30,30, 0.65)",
        },
        Avatar: {
          defaultBg: grey[800],
        },
        TableCell: {
          // border: "none",
          border: "rgba(255,255,255, 0.05)",
        },
        Tooltip: {
          bg: "rgb(240, 240, 240)",
        },
        background: {
          default: "rgb(27, 27, 40)",
          paper: "rgb(27, 27, 40, 0.25)",
          // paper: "rgb(25, 25, 25, 0.5)",
        },
        primary: {
          main: "rgb(123,104,238)",
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
          // darkBg: "#fff",
          // darkColor: "red",
          defaultBg: "#fff",
        },

        TableCell: {
          border: "transparent",
        },
        background: {
          default: whiteBG,
          paper: "rgba(255,255,255, 0.5)",
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
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 2,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          "@supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none))": {
            backdropFilter: "blur(20px)",
          },
          boxShadow: "unset",
          // clipPath: cutCorners,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:nth-of-type(odd)": {
            // backgroundColor: "rgba(45, 45, 45, 0.5)",
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        body1: {
          lineHeight: 1.25,
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    body1: {
      fontWeight: 300,
    },
    body2: {
      fontWeight: 300,
    },
    caption: {
      fontWeight: 300,
      letterSpacing: "0.05rem",
    },
    fontFamily: MainFont,
  },
})
// console.log("📜 LOG > theme:", theme)

export default theme
