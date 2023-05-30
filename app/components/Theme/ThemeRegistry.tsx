"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { Theme, ThemeProvider } from "@mui/material/styles";
import * as React from "react";

export default function ThemeRegistry({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: Theme;
}) {
  return (
    <ThemeProvider theme={theme}>
      {/* https://github.com/mui/material-ui/pull/37315#discussion_r1210849432 */}
      {/* <NextAppDirEmotionCacheProvider options={{ key: "mui" }}> */}
      <CssBaseline enableColorScheme={true} />
      {children}
      {/* </NextAppDirEmotionCacheProvider> */}
    </ThemeProvider>
  );
}
