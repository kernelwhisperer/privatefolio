import { CssVarsThemeOptions, Fade } from "@mui/material"
import { blue, grey } from "@mui/material/colors"

export const MainFont = "'Roboto Flex', sans-serif"
export const SerifFont = "'Roboto Serif', serif"
export const MonoFont = "'IBM Plex Mono', monospace"

export const bgColor = "rgb(242, 242, 245)"

// const cutCorners =
//   "polygon(12px 0%, calc(100% - 12px) 0%, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0% calc(100% - 12px), 0% 12px)"

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    accent: true
  }
}

declare module "@mui/material/Badge" {
  interface BadgePropsColorOverrides {
    accent: true
  }
}

declare module "@mui/material" {
  interface Palette {
    accent: Palette["primary"]
  }

  interface PaletteOptions {
    accent?: PaletteOptions["primary"]
  }
}

export const theme: CssVarsThemeOptions = {
  colorSchemes: {
    dark: {
      palette: {
        Avatar: {
          defaultBg: grey[800],
        },
        Skeleton: {
          bg: "rgb(65, 65, 65)",
        },
        TableCell: {
          border: "rgba(255,255,255, 0.05)",
        },
        accent: {
          main: "rgb(136, 101, 160)",
        },
        // Tooltip: {
        //   bg: "rgb(240, 240, 240)",
        // },
        background: {
          default: "rgb(40, 40, 40)",
          paper: "rgb(45, 45, 45)",
        },
        info: {
          main: blue.A100,
        },
        primary: {
          main: "rgb(200,200,200)",
        },
        secondary: {
          main: "rgb(160, 160, 160)",
        },
        text: {
          secondary: "rgba(255, 255, 255, 0.5)",
        },
      },
    },
    light: {
      palette: {
        Skeleton: {
          bg: "rgb(220, 220, 225)",
        },
        TableCell: {
          border: "rgba(0,0,0, 0.05)",
        },
        accent: {
          main: "rgb(136, 101, 160)",
        },
        background: {
          default: bgColor,
          paper: "rgb(255, 255, 255)",
        },
        info: {
          main: blue.A400,
        },
        primary: {
          main: "rgb(80, 80, 80)",
        },
        secondary: {
          main: "rgb(120, 120, 120)",
        },
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
    MuiCheckbox: {
      styleOverrides: {
        root: {
          "& svg": {
            height: 16,
            width: 16,
          },
          padding: "6px",
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
    MuiDrawer: {
      defaultProps: {
        disableScrollLock: true,
      },
    },
    MuiList: {
      defaultProps: {
        disablePadding: true,
      },
    },
    MuiMenu: {
      defaultProps: {
        PaperProps: {
          elevation: 1,
        },
      },
      styleOverrides: {
        root: {
          "& ::-webkit-scrollbar,& ::-webkit-scrollbar-thumb": {
            borderRadius: "16px",
            width: "8px",
          },
          maxHeight: "50vh",
        },
      },
    },
    // MuiBackdrop: {
    //   styleOverrides: {
    //     root: {
    //       "@supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none))": {
    //         backdropFilter: "blur(8px)",
    //         backgroundColor: "var(--mui-palette-background-backdrop)",
    //       },
    //     },
    //   },
    // },
    MuiMenuItem: {
      defaultProps: {
        color: "secondary",
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          "@supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none))": {
            backdropFilter: "blur(20px)",
          },
          border: "1px solid var(--mui-palette-divider)",
          boxShadow: "unset",
          // clipPath: cutCorners,
        },
      },
    },
    MuiPopover: {
      defaultProps: {
        TransitionComponent: Fade,
      },
    },
    MuiSelect: {
      defaultProps: {
        MenuProps: {
          PaperProps: {
            elevation: 1,
          },
        },
      },
    },
    MuiSkeleton: {
      defaultProps: {
        // animation: false,
      },
    },
    // MuiTable: {
    //   styleOverrides: {
    //     root: {}
    //   },
    // },
    MuiTableCell: {
      styleOverrides: {
        root: {
          "tbody tr:last-of-type &": {
            borderBottom: "none",
          },
        },
        stickyHeader: {
          background: "var(--mui-palette-background-paper)",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          height: "10px !important",
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        toolbar: {
          minHeight: "48px !important",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "tbody &:hover": {
            background: "rgba(var(--mui-palette-primary-mainChannel) / 0.075) !important",
            outline: "1px dashed rgba(var(--mui-palette-primary-mainChannel) / 0.5)",
            outlineOffset: -1,
          },
          // "&:nth-of-type(odd)": {
          //   backgroundColor: "rgba(45, 45, 45, 0.5)",
          // },
        },
      },
    },
    MuiTooltip: {
      defaultProps: {
        PopperProps: {
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, 16],
              },
            },
          ],
        },
        TransitionComponent: Fade,
        arrow: true,
        disableInteractive: true,
        enterDelay: 0,
        followCursor: true,
      },
      styleOverrides: {
        arrow: {
          color: "rgba(0,0,0,1)",
        },
        tooltip: {
          background: grey[900],
          border: "1px solid rgba(0,0,0,1)",
          borderRadius: 0,
          fontSize: "0.8rem",
          fontWeight: 300,
          maxWidth: 320,
          paddingBottom: 8,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 8,
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
}
