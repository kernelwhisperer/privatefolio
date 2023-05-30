"use client";

import {
  Box,
  Container,
  createTheme,
  PaletteMode,
  Theme as MaterialUITheme,
  ThemeOptions,
} from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";

import ThemeRegistry from "../Theme/ThemeRegistry";
import { Header } from "./Header";

// Re-declare the emotion theme to have the properties of the MaterialUiTheme
declare module "@emotion/react" {
  export interface Theme extends MaterialUITheme {
    // cast shape to number
    shape: {
      borderRadius: number;
    };
  }
}

const darkTheme: ThemeOptions = {
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          background: "rgb(255,255,255, 0.15)",
          textTransform: "none",
        },
      },
    },
  },
  palette: {
    mode: "dark",
    primary: {
      main: "rgb(255,255,255)",
    },
    secondary: {
      main: "rgb(212,212,212)",
    },
  },
};

const lightTheme: ThemeOptions = {
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          background: "rgb(0,0,0, 0.05)",
          textTransform: "none",
        },
      },
    },
  },
  palette: {
    primary: {
      main: "rgb(0,0,0)",
    },
    secondary: {
      main: "rgb(0,0,0)",
    },
  },
};

export function App({ children }: { children: React.ReactNode }) {
  const [mode, setMuiMode] = useState<PaletteMode>("dark");
  const theme = useMemo(
    () =>
      createTheme({
        ...(mode === "dark" ? darkTheme : lightTheme),
        mixins: {
          toolbar: {
            minHeight: 40,
          },
        },
      }),
    [mode]
  );
  const setMode = useCallback(
    (mode: PaletteMode) => {
      // todo: persist
      setMuiMode(mode);
    },
    [setMuiMode]
  );

  return (
    <ThemeRegistry theme={theme}>
      <Container maxWidth="lg">
        <Box
          sx={{
            alignItems: "flex-start",
            display: "flex",
            flexDirection: "column",
            my: 4,
          }}
        >
          <Header mode={mode} setMode={setMode} />
          {children}
        </Box>
      </Container>
    </ThemeRegistry>
  );
}
