import { CssVarsThemeOptions, Fade, PaperProps } from "@mui/material"
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

declare module "@mui/material/IconButton" {
  interface IconButtonPropsColorOverrides {
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

declare module "@mui/material/Paper" {
  interface AdditionalProps {
    transparent: boolean
  }
}
declare module "@mui/material/LinearProgress" {
  interface LinearProgressPropsColorOverrides {
    accent: true
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
          bg: "rgb(50, 50, 50)",
        },
        TableCell: {
          border: "rgba(255,255,255, 0.05)",
        },
        accent: {
          // main: "rgb(136, 101, 160)",
          dark: blue[800],
          light: blue[400],
          main: blue[600],
        },
        background: {
          default: "rgb(40, 40, 40)",
          paper: "rgb(45, 45, 45)",
        },
        info: {
          main: blue[400],
        },
        primary: {
          main: "rgb(240,240,240)",
        },
        secondary: {
          main: "rgb(160, 160, 160)",
        },
        text: {
          secondary: "rgba(255, 255, 255, 0.66)",
        },
      },
    },
    light: {
      palette: {
        Skeleton: {
          bg: "rgb(225, 225, 230)",
        },
        TableCell: {
          border: "rgba(0,0,0, 0.05)",
        },
        accent: {
          // main: "rgb(136, 101, 160)",
          dark: blue[800],
          light: blue[400],
          main: blue[600],
        },
        background: {
          default: bgColor,
          paper: "rgb(255, 255, 255)",
        },
        info: {
          main: blue[600],
        },
        primary: {
          main: "rgb(80, 80, 80)",
        },
        secondary: {
          main: "rgb(120, 120, 120)",
        },
        text: {
          secondary: "rgba(0, 0, 0, 0.66)",
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
    MuiBackdrop: {
      styleOverrides: {
        root: {
          "@supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none))": {
            "&:not(.MuiBackdrop-invisible)": {
              backdropFilter: "blur(1px)",
              // backgroundColor: "transparent",
              // backgroundColor: "var(--mui-palette-background-default)",
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        // textSecondary: {
        //   "&:hover": {
        //     color: "var(--mui-palette-primary-main)",
        //   },
        // },
        contained: {
          "&:hover": {
            boxShadow: "unset",
          },
          boxShadow: "unset",
        },
        root: {
          "&.MuiButton-textSecondary:hover, &.MuiButton-outlinedSecondary:hover": {
            color: "var(--mui-palette-primary-main)",
          },
          borderRadius: "32px",
          textTransform: "none",
        },
        sizeSmall: {
          lineHeight: 1.2,
          minWidth: "unset",
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true, // No more ripple, on the whole application 💣!
      },
      styleOverrides: {
        root: {
          "&:active:not(.MuiMenuItem-root):not(.MuiListItemButton-root)": {
            transform: "translateY(1px)",
          },
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
    MuiContainer: {
      defaultProps: {
        disableGutters: true,
      },
      styleOverrides: {
        root: {
          paddingLeft: "16px !important",
          paddingRight: "16px !important",
        },
      },
    },
    MuiDialog: {
      defaultProps: {
        PaperProps: {
          elevation: 4,
          transparent: "true",
        },
      },
      styleOverrides: {
        container: {
          transition: "none !important",
        },
        root: {
          marginBottom: 48,
          // marginBottom: "56px !important",
        },
      },
    },
    MuiDrawer: {
      defaultProps: {
        PaperProps: {
          elevation: 2,
          transparent: "true",
        },
        anchor: "right",
        disableScrollLock: true,
        slotProps: { backdrop: { invisible: true } },
      },
      styleOverrides: {
        paperAnchorLeft: {
          // borderBottomRightRadius: 16,
          // borderLeft: "none",
          // borderTopRightRadius: 16,
          border: 0,
          borderRadius: 16,
          left: 8,
        },
        paperAnchorRight: {
          borderBottom: "none",
          borderBottomLeftRadius: 16,
          borderRight: "none",
          borderTop: "none",
          borderTopLeftRadius: 16,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          "&.MuiIconButton-colorSecondary:hover": {
            color: "var(--mui-palette-primary-main)",
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        bar: {
          borderRadius: 2,
        },
        root: {
          borderRadius: 2,
        },
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
          maxHeight: "50vh",
        },
      },
    },
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
            "html[data-mui-color-scheme='dark'] &": {
              backdropFilter: "blur(12px)",
            },
          },
          border: "1px solid var(--mui-palette-divider)",
          boxShadow: "unset",
        },
      },
      variants: [
        {
          props: { transparent: "true" } as PaperProps,
          style: {
            backgroundColor: "rgb(255,255,255) !important",
            "html[data-mui-color-scheme='dark'] &": {
              backgroundColor: "rgba(255,255,255, 0.025) !important",
            },
          },
        },
      ],
    },
    MuiPopover: {
      defaultProps: {
        TransitionComponent: Fade,
        disableScrollLock: true,
        slotProps: {
          paper: {
            elevation: 1,
            transparent: "true",
          } as PaperProps,
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        MenuProps: {
          PaperProps: {
            elevation: 1,
            transparent: "true",
          },
        },
      },
    },
    MuiSkeleton: {
      defaultProps: {
        animation: "wave",
      },
    },
    MuiSwitch: {
      defaultProps: {
        focusVisibleClassName: ".Mui-focusVisible",
      },
      styleOverrides: {
        // TODO this needs work
        root: ({ theme }) => ({
          "& .MuiSwitch-switchBase": {
            "&.Mui-checked": {
              "& + .MuiSwitch-track": {
                // backgroundColor: theme.palette.mode === "dark" ? "#2ECA45" : "#65C466",
                border: 0,
                opacity: 1,
              },
              "&.Mui-disabled + .MuiSwitch-track": {
                opacity: 0.5,
              },
              color: "#fff",
              transform: "translateX(16px)",
            },
            "&.Mui-disabled + .MuiSwitch-track": {
              opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
            },
            "&.Mui-disabled .MuiSwitch-thumb": {
              color:
                theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[600],
            },
            "&.Mui-focusVisible .MuiSwitch-thumb": {
              border: "6px solid #fff",
              color: theme.palette.accent.main,
            },
            margin: 2,
            padding: 0,
            transitionDuration: "300ms",
          },
          "& .MuiSwitch-thumb": {
            boxSizing: "border-box",
            height: 22,
            width: 22,
          },
          "& .MuiSwitch-track": {
            background: "var(--mui-palette-background-default)",
            borderRadius: 26 / 2,
            opacity: 1,
            transition: theme.transitions.create(["background-color"]),
          },
          height: 26,
          padding: 0,
          width: 42,
        }),
      },
    },
    // MuiTable: {
    //   styleOverrides: {
    //     root: {}
    //   },
    // },
    MuiTableCell: {
      styleOverrides: {
        head: {
          padding: "4px 16px 6px 16px",
        },
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
        displayedRows: {
          margin: 0,
        },
        root: {
          overflow: "unset",
        },
        toolbar: {
          minHeight: "38px !important",
          paddingTop: "4px",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&.MuiTableRow-hover:hover": {
            background: "rgba(var(--mui-palette-secondary-mainChannel) / 0.075) !important",
            outline: "1px dashed rgba(var(--mui-palette-secondary-mainChannel) / 0.5)",
            outlineOffset: -1,
          },
          // "&:nth-of-type(odd)": {
          //   backgroundColor: "rgba(45, 45, 45, 0.5)",
          // },
          // "&.TableRow-open-bottom": {
          //   background: "var(--mui-palette-background-paper)",
          //   backgroundImage: "var(--mui-overlays-1)",
          //   // background: "var(--mui-palette-background-default) !important",
          // },
          // "&.TableRow-open-top": {
          //   "--mui-palette-TableCell-border": "rgba(0,0,0,0)",
          //   background: "var(--mui-palette-background-paper)",
          //   backgroundImage: "var(--mui-overlays-1)",
          //   // borderRadius: 2,
          //   overflow: "hidden",
          //   // background: "var(--mui-palette-background-default) !important",
          //   // outline: "1px dashed red !important",
          //   // border: "1px dashed red !important",
          // },
          // cursor: "pointer",
          "html[data-mui-color-scheme='dark'] &.MuiTableRow-hover:hover": {
            background: "rgba(var(--mui-palette-primary-mainChannel) / 0.05) !important",
            outline: "1px dashed rgba(var(--mui-palette-primary-mainChannel) / 0.33)",
          },
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
        TransitionProps: { timeout: 0 },
        arrow: true,
        disableInteractive: true,
        enterDelay: 0,
        followCursor: true,
      },
      styleOverrides: {
        arrow: {
          color: "var(--mui-palette-grey-900)",
          "html[data-mui-color-scheme='dark'] &": {
            color: "var(--mui-palette-grey-200)",
          },
        },
        tooltip: {
          "& .secondary": {
            color: "var(--mui-palette-grey-400)",
          },
          background: "var(--mui-palette-grey-900)",
          border: "1px solid var(--mui-palette-background-default)",
          borderRadius: 0,
          fontSize: "0.8rem",
          fontWeight: 300,
          "html[data-mui-color-scheme='dark'] &": {
            background: "var(--mui-palette-grey-200)",
            color: "var(--mui-palette-common-black)",
          },
          "html[data-mui-color-scheme='dark'] & .secondary": {
            color: "var(--mui-palette-grey-600)",
          },
          maxWidth: 340,
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
