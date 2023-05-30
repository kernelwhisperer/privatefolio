"use client";

import { red } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";

import DefaultFont from "./fonts";

// Create a theme instance.
// When needed::: first argument is needed if you have common enterprise theme, and second argument is to override your enterprise theme.
// apply fonts to all other typography options like headings, subtitles, etc...
const theme = createTheme({
  palette: {
    error: {
      main: red.A400,
    },
    primary: {
      main: "#556cd6",
    },
    secondary: {
      main: "#19857b",
    },
  },
  typography: {
    body1: { fontFamily: DefaultFont.style.fontFamily },
    body2: { fontFamily: DefaultFont.style.fontFamily },
    fontFamily: DefaultFont.style.fontFamily,
  },
});

export default theme;
